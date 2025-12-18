import React, { useState } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers } from 'lucide-react';

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

  const SectionHeading = ({ children, icon: Icon, subtitle }: any) => (
    <div className="mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3 mb-2">
            {Icon && <Icon className="text-blue-600" size={28} />}
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{children}</h2>
        </div>
        <p className="text-slate-500 font-medium">{subtitle}</p>
    </div>
  );

  const WhyBox = ({ children }: any) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-xl">
        <div className="flex items-center gap-2 text-blue-800 font-black uppercase text-[10px] tracking-widest mb-1">
            <Info size={14} /> The Technical "Why"
        </div>
        <p className="text-sm text-blue-900/80 leading-relaxed italic">{children}</p>
    </div>
  );

  const Step = ({ number, title, children }: any) => (
    <div className="flex gap-6 mb-10 last:mb-0">
        <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-lg">
                {number}
            </div>
            <div className="flex-1 w-0.5 bg-slate-100 my-2"></div>
        </div>
        <div className="flex-1">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide mb-3">{title}</h3>
            <div className="text-slate-600 space-y-4">
                {children}
            </div>
        </div>
    </div>
  );

  const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => (
    <div className="my-4 relative group">
      {label && <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Terminal size={12}/> {label}</div>}
      <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto relative shadow-2xl border border-slate-800">
        <code className="font-mono text-xs md:text-sm text-blue-300 whitespace-pre-wrap break-all block leading-relaxed">{code}</code>
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all border border-white/5 group-active:scale-95"
          title="Copy Code"
        >
          {copiedStep === id ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="opacity-50 group-hover:opacity-100" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in overflow-hidden">
      <div className="bg-slate-900 text-white p-6 shadow-xl shrink-0 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/40"><ShieldCheck size={28} className="text-white" /></div>
           <div>
             <h1 className="text-2xl font-black tracking-tight uppercase">System Engineering Manual</h1>
             <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Deploying v2.8 Reliable Realtime Sync</p>
           </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Installation Phases</h3>
            <nav className="space-y-3">
                {[
                    { id: 'supabase', label: '1. Supabase Cloud', sub: 'Backend & Data', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-600' },
                    { id: 'local', label: '2. PC Hub', sub: 'Local Workspace', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' },
                    { id: 'build', label: '3. Code Build', sub: 'Assets & Optimization', icon: Hammer, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600' },
                    { id: 'vercel', label: '4. Vercel Deploy', sub: 'Global Infrastructure', icon: Globe, color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-900' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all group flex items-center gap-4 ${activeTab === tab.id ? `${tab.bg} ${tab.border} shadow-lg shadow-black/5` : 'border-transparent hover:bg-slate-50'}`}
                    >
                        <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                            <tab.icon size={20} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />
                        </div>
                        <div>
                            <span className={`font-black text-sm block leading-none mb-1 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{tab.sub}</span>
                        </div>
                    </button>
                ))}
            </nav>
            <div className="mt-auto p-4 bg-slate-900 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-2"><Info size={14} className="text-blue-400" /><span className="text-[10px] font-black uppercase tracking-wider">Support</span></div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Technical issues? Contact the JSTYP Systems team via the Admin Hub dashboard.</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-12 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-full pb-20">
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-12 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning the Global Content Delivery Network & Database.">Supabase Cloud Setup</SectionHeading>
                    <WhyBox>Supabase serves as the "Brain" of your kiosk network. By using a cloud database instead of just local storage, you enable <strong>Fleet Telemetry</strong> and <strong>Realtime Content Pushing</strong>.</WhyBox>
                    <div className="space-y-4">
                        <Step number="1" title="Account & Project Creation">
                            <p>Visit <a href="https://supabase.com" target="_blank" className="text-blue-600 font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink size={12}/></a> and create a free account.</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>Click <strong>New Project</strong>.</li>
                                <li>Choose a name (e.g., "Kiosk-Pro-Retail").</li>
                                <li>Set a strong Database Password and select a Region close to your store.</li>
                            </ul>
                        </Step>
                        <Step number="2" title="Database Schema Injection">
                            <p>Once your project is ready, navigate to the <strong>SQL Editor</strong> in the left sidebar. Click <strong>New Query</strong>, paste the following block, and click <strong>Run</strong>.</p>
                            <CodeBlock 
                                id="sql-full"
                                label="Master System SQL (Run in SQL Editor)"
                                code={`-- PHASE A: STORAGE (For Images & PDFs)
insert into storage.buckets (id, name, public) 
values ('kiosk-media', 'kiosk-media', true) 
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'kiosk-media' );
create policy "Public Insert" on storage.objects for insert with check ( bucket_id = 'kiosk-media' );

-- PHASE B: TABLES (Configuration & Fleet)
create table if not exists public.store_config ( 
    id serial primary key, 
    data jsonb not null default '{}'::jsonb, 
    updated_at timestamp with time zone default now() 
);

create table if not exists public.kiosks ( 
    id text primary key, 
    name text, 
    device_type text, 
    status text, 
    last_seen timestamp with time zone, 
    wifi_strength int, 
    ip_address text, 
    version text, 
    assigned_zone text, 
    restart_requested boolean default false 
);

-- PHASE C: REALTIME (Crucial for Instant Sync)
alter table public.store_config replica identity full;
alter table public.kiosks replica identity full;
alter publication supabase_realtime add table public.store_config, public.kiosks;`}
                            />
                            <p className="text-xs font-bold text-orange-600 flex items-center gap-2 mt-2"><AlertTriangle size={14}/> Important: Ensure you see "Success" in the Supabase console after running.</p>
                        </Step>
                    </div>
                </div>
              )}
              {activeTab === 'local' && (
                  <div className="p-8 md:p-12 animate-fade-in">
                      <SectionHeading icon={Server} subtitle="Setting up the development cockpit on your administrator PC.">PC Station Hub</SectionHeading>
                      <WhyBox>Developing locally allows you to test content and UI changes instantly. Your PC becomes the "Master Kiosk" for inventory management.</WhyBox>
                      <div className="space-y-6">
                          <Step number="1" title="Environment Runtimes">
                              <p>The app requires <strong>Node.js</strong> to run the local build server (Vite).</p>
                              <ul className="list-disc pl-5 space-y-2 text-sm">
                                  <li>Download from <a href="https://nodejs.org" className="text-blue-600 underline">nodejs.org</a> (LTS version).</li>
                              </ul>
                          </Step>
                          <Step number="2" title="Project Initialization">
                              <CodeBlock id="npm-install" label="1. Install Dependencies" code={`npm install`} />
                          </Step>
                          <Step number="3" title="Linking the Cloud (ENV)">
                              <CodeBlock id="env-example" label=".env Configuration" code={`VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key-here`} />
                          </Step>
                      </div>
                  </div>
              )}
              {activeTab === 'build' && (
                  <div className="p-8 md:p-12 animate-fade-in">
                      <SectionHeading icon={Hammer} subtitle="Compiling modern code into high-performance web assets.">Production Building</SectionHeading>
                      <WhyBox>Modern code is translated into minified HTML/JS/CSS during the "Build" phase, making the kiosk load 10x faster on tablet hardware.</WhyBox>
                      <div className="space-y-8">
                          <Step number="1" title="The Build Command">
                              <CodeBlock id="npm-build" label="Finalize Build" code={`npm run build`} />
                              <p className="text-sm">A new <code>dist/</code> folder will appear containing the actual website files.</p>
                          </Step>
                      </div>
                  </div>
              )}
              {activeTab === 'vercel' && (
                  <div className="p-8 md:p-12 animate-fade-in">
                      <SectionHeading icon={Globe} subtitle="Launching your Kiosk to a global URL for tablet deployment.">Vercel Deployment</SectionHeading>
                      <WhyBox>Vercel provides a permanent HTTPS URL. It also handles automatic updates whenever you push content or code changes.</WhyBox>
                      <div className="space-y-6">
                          <Step number="1" title="Critical: Cloud Variables">
                              <p>During setup, Vercel will ask for <strong>Environment Variables</strong>. Paste your Supabase keys from Step 1 here.</p>
                              <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800 my-4">
                                  <div className="space-y-4">
                                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 group"><code className="text-white text-sm font-mono">VITE_SUPABASE_URL</code><span className="text-[10px] text-slate-500 font-bold uppercase">API URL</span></div>
                                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 group"><code className="text-white text-sm font-mono">VITE_SUPABASE_ANON_KEY</code><span className="text-[10px] text-slate-500 font-bold uppercase">Public Anon</span></div>
                                  </div>
                              </div>
                          </Step>
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