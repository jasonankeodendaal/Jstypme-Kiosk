
import React, { useState } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Cloud } from 'lucide-react';

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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{children}</h2>
        </div>
        <p className="text-slate-500 font-medium">{subtitle}</p>
    </div>
  );

  const WhyBox = ({ title = "Architectural Logic", children }: any) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-2xl shadow-sm">
        <div className="flex items-center gap-2 text-blue-800 font-black uppercase text-[10px] tracking-widest mb-2">
            <Zap size={14} className="fill-blue-500" /> {title}
        </div>
        <div className="text-sm text-blue-900/80 leading-relaxed font-medium">
            {children}
        </div>
    </div>
  );

  const Step = ({ number, title, children }: any) => (
    <div className="flex gap-6 mb-12 last:mb-0">
        <div className="flex flex-col items-center shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xl border border-white/10 text-lg">
                {number}
            </div>
            <div className="flex-1 w-1 bg-gradient-to-b from-slate-200 to-transparent my-3 rounded-full"></div>
        </div>
        <div className="flex-1 pt-1">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                {title}
            </h3>
            <div className="text-slate-600 space-y-5">
                {children}
            </div>
        </div>
    </div>
  );

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
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in overflow-hidden">
      <div className="bg-slate-900 text-white p-6 shadow-2xl shrink-0 flex items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-5">
           <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)]"><ShieldCheck size={32} className="text-white" /></div>
           <div>
             <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">System Engineering Manual</h1>
             <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Enterprise Infrastructure Protocol</p>
           </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-red-600/20 hover:text-red-500 rounded-2xl transition-all border border-white/5 bg-white/5 group">
            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto z-40">
            <div className="mb-8 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Infrastructure phases</h3>
                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            </div>
            
            <nav className="space-y-4">
                {[
                    { id: 'supabase', label: '1. Supabase Backbone', sub: 'SQL & Storage', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-600' },
                    { id: 'local', label: '2. Source Control', sub: 'GitHub Repository', icon: Github, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-400' },
                    { id: 'build', label: '3. Asset Pipeline', sub: 'Vite & Build Config', icon: Hammer, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600' },
                    { id: 'vercel', label: '4. Vercel Cloud', sub: 'Deployment & Edge', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`w-full p-4 rounded-3xl border-2 text-left transition-all duration-300 group flex items-center gap-4 ${activeTab === tab.id ? `${tab.bg} ${tab.border} shadow-[0_10px_20px_rgba(0,0,0,0.05)] translate-x-2` : 'border-transparent hover:bg-slate-50'}`}
                    >
                        <div className={`p-3 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? 'bg-white shadow-md scale-110' : 'bg-slate-100'}`}>
                            <tab.icon size={22} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />
                        </div>
                        <div className="min-w-0">
                            <span className={`font-black text-sm block leading-none mb-1 truncate ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{tab.sub}</span>
                        </div>
                    </button>
                ))}
            </nav>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-12">
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-full pb-32">
              
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning the mission-critical cloud backbone.">Supabase Infrastructure</SectionHeading>
                    <WhyBox title="Architectural Choice">
                        Kiosk Pro uses a **Schema-Driven Architecture**. By using PostgreSQL, we gain relational integrity and high-speed Realtime replication for fleet updates.
                    </WhyBox>
                    <Step number="1" title="Initialize Storage Buckets">
                        <p className="font-medium text-slate-700">Run this SQL in your Supabase dashboard SQL Editor to create the media bucket for hosting Videos and Manuals.</p>
                        <CodeBlock id="sql-bucket" label="Bucket Initialization" code={`-- Create a public bucket for media assets
insert into storage.buckets (id, name, public) 
values ('kiosk-media', 'kiosk-media', true);

-- Add security policy to allow public reads
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'kiosk-media' );`} />
                    </Step>
                    <Step number="2" title="Core Table Definitions">
                        <p className="font-medium text-slate-700">Define the schema for Store Configuration and Fleet Management.</p>
                        <CodeBlock id="sql-schema" label="Database Master Script" code={`-- MASTER CONFIG TABLE (Stores all Brand/Product JSON)
CREATE TABLE IF NOT EXISTS public.store_config ( 
    id serial PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- FLEET MANAGEMENT TABLE (Real-time device telemetry)
CREATE TABLE IF NOT EXISTS public.kiosks ( 
    id text PRIMARY KEY, 
    name text, 
    device_type text, 
    status text, 
    last_seen timestamp with time zone, 
    wifi_strength int, 
    ip_address text, 
    version text, 
    assigned_zone text, 
    restart_requested boolean DEFAULT false 
);

-- ENABLE REALTIME
ALTER TABLE public.store_config REPLICA IDENTITY FULL;
ALTER TABLE public.kiosks REPLICA IDENTITY FULL;`} />
                    </Step>
                </div>
              )}

              {activeTab === 'local' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Github} subtitle="Source control and version management.">GitHub Repository</SectionHeading>
                    <WhyBox title="CI/CD Workflow">
                        Connecting your GitHub repo to Vercel enables automatic builds on every push. This ensures your fleet always runs the latest stable codebase.
                    </WhyBox>
                    <Step number="1" title="Initialize Repository">
                        <p className="font-medium text-slate-700">Push your local files to a private or public GitHub repository.</p>
                        <CodeBlock id="git-init" label="Git Commands" code={`git init\ngit add .\ngit commit -m "Initial Kiosk Build"\ngit remote add origin your-repo-url\ngit push -u origin main`} />
                    </Step>
                </div>
              )}

              {activeTab === 'build' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Hammer} subtitle="Asset pipeline and build configuration.">Vite & Build Config</SectionHeading>
                    <WhyBox title="Performance Optimization">
                        The `vite.config.ts` is configured with **Manual Chunking** to separate large libraries (Supabase, PDF.js) from the main app logic, improving load times on hardware tablets.
                    </WhyBox>
                    <Step number="1" title="Vite Configuration">
                        <p className="font-medium text-slate-700">Ensure your `vite.config.ts` includes the chunking logic provided in the root directory.</p>
                    </Step>
                </div>
              )}

              {activeTab === 'vercel' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Globe} subtitle="Global distribution via Anycast IP routing.">Vercel Deployment</SectionHeading>
                      <WhyBox title="Edge Delivery">
                          Vercel serves the kiosk app from global CDN nodes, ensuring low latency for heavy media assets even in remote store locations.
                      </WhyBox>
                      <Step number="1" title="Environment Secret Injection">
                          <p className="font-medium text-slate-700">Navigate to Project Settings &gt; Environment Variables and add these keys:</p>
                          <CodeBlock id="env-vars" label="Vercel Secrets" code={`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`} />
                      </Step>
                      <Step number="2" title="Routing Config">
                          <p className="font-medium text-slate-700">Your `vercel.json` must handle the SPA routing for the `/admin` path to function correctly after refresh.</p>
                      </Step>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
