
import React, { useState } from 'react';
import { X, Database, Terminal, Copy, Check, Info, ShieldCheck, Lock, Network, Zap, Shield, Cpu as CpuIcon, Wifi } from 'lucide-react';

const SetupGuide = ({ onClose }: any) => {
  const [activeTab, setActiveTab] = useState('supabase');
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SQL_BOOTSTRAP = `-- 1. SCHEMA DEFINITION
CREATE TABLE IF NOT EXISTS public.store_config (
    id bigint primary key default 1,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_id check (id = 1)
);

CREATE TABLE IF NOT EXISTS public.kiosks (
    id text primary key,
    name text not null,
    device_type text default 'kiosk',
    status text default 'online',
    last_seen timestamp with time zone default now(),
    wifi_strength int,
    ip_address text,
    version text,
    location_description text,
    assigned_zone text,
    notes text,
    restart_requested boolean default false
);

-- 2. SECURITY & PERMISSIONS (CRITICAL)
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access" ON public.store_config;
DROP POLICY IF EXISTS "Public Full Access" ON public.kiosks;

CREATE POLICY "Public Full Access" ON public.store_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON public.kiosks FOR ALL USING (true) WITH CHECK (true);

-- Explicitly grant permissions to the 'anon' role used by the app
GRANT ALL ON public.store_config TO anon, authenticated;
GRANT ALL ON public.kiosks TO anon, authenticated;

-- 3. INITIAL SEED
INSERT INTO public.store_config (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/98 flex flex-col animate-fade-in backdrop-blur-md">
      <div className="bg-slate-900 text-white p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><ShieldCheck size={28} /></div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Infrastructure Setup</h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={32}/></button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 bg-white/5 p-6 space-y-4 border-r border-white/5 overflow-y-auto">
            <button onClick={() => setActiveTab('supabase')} className={`w-full p-4 rounded-2xl text-left transition-all ${activeTab === 'supabase' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Database className="mb-2" /> Supabase SQL</button>
            <button onClick={() => setActiveTab('storage')} className={`w-full p-4 rounded-2xl text-left transition-all ${activeTab === 'storage' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><Shield className="mb-2" /> Storage Bucket</button>
        </div>

        <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50/5">
            {activeTab === 'supabase' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="bg-slate-900 rounded-[2rem] p-8 border border-white/5 shadow-2xl">
                        <h2 className="text-white text-2xl font-black uppercase mb-4 flex items-center gap-3"><Terminal size={24} className="text-blue-500" /> Database Bootstrap</h2>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">Run this in your Supabase **SQL Editor** to fix persistence issues. It explicitly grants permissions to the anonymous role to ensure titles and metadata are accepted by the server.</p>
                        <div className="relative group">
                            <pre className="bg-black/50 p-6 rounded-2xl overflow-x-auto text-[11px] font-mono text-blue-300 border border-white/5 leading-relaxed">{SQL_BOOTSTRAP}</pre>
                            <button onClick={() => copy(SQL_BOOTSTRAP)} className="absolute top-4 right-4 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500 transition-all">{copied ? <Check size={20}/> : <Copy size={20}/>}</button>
                        </div>
                    </div>
                    <div className="bg-blue-600/10 border-2 border-blue-600/20 p-8 rounded-[2rem] text-blue-100">
                        <div className="flex items-center gap-3 mb-4 font-black uppercase tracking-widest"><Zap size={20}/> Technical Resolution:</div>
                        <p className="text-sm font-medium leading-relaxed">The "fallback" happens when the Cloud rejects an update due to <strong>SQL Grant Permissions</strong>. This script grants <code>ALL</code> access to the <code>anon</code> key, allowing your edits to persist in the backbone immediately.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
