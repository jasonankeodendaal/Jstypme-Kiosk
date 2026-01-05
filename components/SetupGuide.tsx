
import React, { useState, useEffect } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, FileText, ArrowRight, Sparkles, ServerCrash, Share, Download, FastForward, Search, Columns, FileType, FileOutput, Maximize, GitBranch, Box, Eye, MessageSquare, ListCheck, Cloud, Layout, MousePointer2, Wifi } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'infra' | 'surgical' | 'local' | 'pricelists'>('infra');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => (
    <div className="my-6 relative group">
      {label && <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 px-1"><Terminal size={12}/> {label}</div>}
      <div className="bg-slate-950 rounded-2xl p-6 overflow-x-auto relative shadow-2xl border border-slate-800/50">
        <code className="font-mono text-xs md:text-sm text-blue-300 whitespace-pre-wrap break-all block leading-relaxed">{code}</code>
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-4 right-4 p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-white transition-all border border-white/5 group-active:scale-95 shadow-lg"
          title="Copy Script"
        >
          {copiedStep === id ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="opacity-40 group-hover:opacity-100" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-16 animate-fade-in max-w-5xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">System Engineering</h2>
        <div className="flex gap-2">
            {['infra', 'surgical', 'local'].map(t=>(<button key={t} onClick={()=>setActiveTab(t as any)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${activeTab===t?'bg-blue-600 text-white':'text-slate-400'}`}>{t}</button>))}
        </div>
      </div>

      {activeTab === 'infra' && (
          <div className="animate-fade-in">
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">Phase 1: Cloud Infrastructure</h3>
              <p className="text-slate-500 mb-8 font-medium">Run this script in the Supabase SQL Editor to provision the database tables and storage buckets.</p>
              <CodeBlock id="sql-base" label="Base Schema" code={`CREATE TABLE IF NOT EXISTS public.store_config (
    id bigint primary key default 1,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default now()
);
CREATE TABLE IF NOT EXISTS public.kiosks (
    id text primary key,
    name text not null,
    last_seen timestamp with time zone default now()
);
-- Enable RLS
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All" ON public.store_config FOR ALL USING (true) WITH CHECK (true);`} />
          </div>
      )}

      {activeTab === 'surgical' && (
          <div className="animate-fade-in">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 rounded-r-2xl">
                  <div className="flex items-center gap-2 text-yellow-800 font-black uppercase text-xs mb-2"><Zap size={16}/> High Performance Saving</div>
                  <p className="text-sm text-yellow-900/80 font-medium">To enable **Incremental Saves** (saving only what changed), you must install this surgical patcher in your Postgres database.</p>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">RPC Surgical Patcher</h3>
              <p className="text-slate-500 mb-6 font-medium">This function allows the frontend to target specific indices in the JSON array without resending the entire multi-megabyte config blob.</p>
              <CodeBlock id="sql-rpc" label="Database RPC Protocol" code={`CREATE OR REPLACE FUNCTION patch_config(path_arr text[], new_val jsonb)
RETURNS void AS $$
BEGIN
  UPDATE public.store_config
  SET data = jsonb_set(data, path_arr, new_val, true),
      updated_at = now()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to access the function via API
GRANT EXECUTE ON FUNCTION patch_config TO anon, authenticated;`} />
          </div>
      )}

      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Technical Note</h4>
          <p className="text-slate-400 text-sm leading-relaxed">The "path_arr" argument uses Postgres dot-notation logic. Example: `['brands', '0', 'products', '5']` targets the 6th product of the 1st brand.</p>
      </div>
    </div>
  );
};

export default SetupGuide;
