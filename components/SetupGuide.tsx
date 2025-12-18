
import React, { useState } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Globe, Terminal, Hammer, MousePointer, Code, Package } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'build' | 'vercel' | 'supabase'>('supabase');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => (
    <div className="my-4 relative group">
      {label && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2"><Terminal size={12}/> {label}</div>}
      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto relative shadow-lg border border-slate-700">
        <code className="font-mono text-sm text-blue-300 whitespace-pre block leading-relaxed">{code}</code>
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
        >
          {copiedStep === id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in overflow-hidden">
      <div className="bg-slate-900 text-white p-6 shadow-xl shrink-0 flex items-center justify-between border-b border-slate-800">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck size={24} className="text-white" /></div>
             <h1 className="text-2xl font-black tracking-tight">System Setup Manual</h1>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-12">v2.8 Reliable Realtime Sync</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="w-72 bg-white border-r border-slate-200 p-4 flex-col shrink-0 overflow-y-auto hidden md:flex">
            <button onClick={() => setActiveTab('supabase')} className={`p-3 rounded-xl border text-left mb-3 transition-all ${activeTab === 'supabase' ? 'border-green-600 bg-green-50' : 'border-transparent'}`}><div className="flex items-center gap-3"><Database size={18} className="text-green-600" /><div><span className="font-bold text-sm block">1. Supabase Cloud</span><span className="text-[10px] text-slate-400 font-bold uppercase">Backend</span></div></div></button>
            <button onClick={() => setActiveTab('local')} className={`p-3 rounded-xl border text-left mb-3 transition-all ${activeTab === 'local' ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}><div className="flex items-center gap-3"><Server size={18} className="text-blue-600" /><div><span className="font-bold text-sm block">2. PC Hub</span><span className="text-[10px] text-slate-400 font-bold uppercase">Local Station</span></div></div></button>
            <button onClick={() => setActiveTab('build')} className={`p-3 rounded-xl border text-left mb-3 transition-all ${activeTab === 'build' ? 'border-purple-600 bg-purple-50' : 'border-transparent'}`}><div className="flex items-center gap-3"><Hammer size={18} className="text-purple-600" /><div><span className="font-bold text-sm block">3. Code Build</span><span className="text-[10px] text-slate-400 font-bold uppercase">Frontend</span></div></div></button>
            <button onClick={() => setActiveTab('vercel')} className={`p-3 rounded-xl border text-left mb-3 transition-all ${activeTab === 'vercel' ? 'border-black bg-slate-100' : 'border-transparent'}`}><div className="flex items-center gap-3"><Globe size={18} className="text-black" /><div><span className="font-bold text-sm block">4. Vercel Deploy</span><span className="text-[10px] text-slate-400 font-bold uppercase">Live Site</span></div></div></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-12">
           <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-full pb-12">
              {activeTab === 'supabase' && (
                <div className="p-8 animate-fade-in">
                    <div className="mb-8 border-b border-slate-100 pb-8">
                       <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest mb-4">Step 1</div>
                       <h2 className="text-4xl font-black text-slate-900 mb-2">Cloud Configuration</h2>
                       <p className="text-slate-600">The <strong>Backend</strong> handles real-time data push to all devices.</p>
                    </div>

                    <div className="space-y-12">
                        <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">1</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-4">Database Setup</h3>
                                <p className="text-sm text-slate-600 mb-4">Copy the SQL below, go to Supabase <strong>SQL Editor</strong>, and click <strong>Run</strong>. This enables immediate data pulsing.</p>
                                <CodeBlock 
                                    id="sql-script"
                                    label="SQL Script (v2.8 Reliable Realtime)"
                                    code={`-- 1. Create Storage Bucket
insert into storage.buckets (id, name, public) values ('kiosk-media', 'kiosk-media', true) on conflict (id) do nothing;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'kiosk-media' );
create policy "Public Insert" on storage.objects for insert with check ( bucket_id = 'kiosk-media' );

-- 2. Create Tables
create table if not exists public.store_config ( id serial primary key, data jsonb not null default '{}'::jsonb, updated_at timestamp with time zone default timezone('utc'::text, now()) );
create table if not exists public.kiosks ( id text primary key, name text, device_type text, status text, last_seen timestamp with time zone, wifi_strength int, ip_address text, version text, location_description text, assigned_zone text, restart_requested boolean default false, notes text );

-- 3. Required for Reliable Realtime triggering
alter table public.store_config replica identity full;
alter table public.kiosks replica identity full;

-- 4. Enable RLS and Policies
alter table public.store_config enable row level security;
alter table public.kiosks enable row level security;
create policy "Allow All Select" on public.store_config for select using (true);
create policy "Allow All Update" on public.store_config for update using (true);
create policy "Allow All Insert" on public.store_config for insert with check (true);
create policy "Allow Kiosk Select" on public.kiosks for select using (true);
create policy "Allow Kiosk All" on public.kiosks for all using (true);

-- 5. Enable Realtime Channel
alter publication supabase_realtime add table public.store_config, public.kiosks;`}
                                />
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">2</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2">Connect Keys</h3>
                                <p className="text-sm text-slate-600 mb-4">Go to <strong>Project Settings &gt; API</strong> and get your <code>Project URL</code> and <code>anon public</code> key.</p>
                                <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl text-xs font-bold text-yellow-800">
                                   Note: Without these keys, the app uses Local Storage which does not auto-sync between devices.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {activeTab === 'local' && (
                  <div className="p-8 animate-fade-in">
                      <h2 className="text-3xl font-black mb-6">Local PC Hub</h2>
                      <p className="mb-4 text-slate-600">Run the app on a PC for testing or offline management.</p>
                      <CodeBlock id="npm-start" label="Install & Run" code={`npm install\nnpm run dev`} />
                  </div>
              )}
              
              {activeTab === 'build' && (
                  <div className="p-8 animate-fade-in">
                      <h2 className="text-3xl font-black mb-6">Build Architecture</h2>
                      <p className="mb-4 text-slate-600">The frontend is built with React 19 and Vite.</p>
                      <CodeBlock id="npm-build" label="Build Production Files" code={`npm run build`} />
                  </div>
              )}

              {activeTab === 'vercel' && (
                  <div className="p-8 animate-fade-in">
                      <h2 className="text-3xl font-black mb-6">Vercel Deployment</h2>
                      <p className="mb-4 text-slate-600">Go live by pushing your code to GitHub and connecting to Vercel.</p>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <h4 className="font-bold text-sm mb-2">Required Env Variables:</h4>
                          <ul className="text-xs space-y-1 font-mono">
                              <li>VITE_SUPABASE_URL</li>
                              <li>VITE_SUPABASE_ANON_KEY</li>
                          </ul>
                      </div>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;