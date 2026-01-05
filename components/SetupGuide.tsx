
import React, { useState, useEffect } from 'react';
/* Added missing Wifi icon import */
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, FileText, ArrowRight, Sparkles, ServerCrash, Share, Download, FastForward, Search, Columns, FileType, FileOutput, Maximize, GitBranch, Box, Eye, MessageSquare, ListCheck, Cloud, Layout, MousePointer2, Wifi } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'build' | 'vercel' | 'supabase' | 'pricelists'>('supabase');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [roundDemoValue, setRoundDemoValue] = useState(799);

  useEffect(() => {
    if (activeTab === 'pricelists') {
        const interval = setInterval(() => {
            setRoundDemoValue(prev => {
                if (prev === 799) return 4449.99;
                if (prev === 4449.99) return 122;
                if (prev === 122) return 89.95;
                return 799;
            });
        }, 2500);
        return () => clearInterval(interval);
    }
  }, [activeTab]);

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

  const WhyBox = ({ title = "Architectural Logic", children, variant = "blue" }: any) => {
    const colors = variant === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-900/80' : variant === 'purple' ? 'bg-purple-50 border-purple-500 text-purple-900/80' : 'bg-blue-50 border-blue-500 text-blue-900/80';
    const iconColor = variant === 'orange' ? 'text-orange-800' : variant === 'purple' ? 'text-purple-800' : 'text-blue-800';
    return (
        <div className={`${colors} border-l-4 p-6 mb-8 rounded-r-2xl shadow-sm`}>
            <div className={`flex items-center gap-2 ${iconColor} font-black uppercase text-[10px] tracking-widest mb-2`}>
                <Zap size={14} className="fill-current" /> {title}
            </div>
            <div className="text-sm leading-relaxed font-medium">
                {children}
            </div>
        </div>
    );
  };

  const EngineerNote = ({ children }: any) => (
    <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 my-6 shadow-inner">
        <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-[9px] tracking-[0.2em] mb-3">
            <CpuIcon size={14} /> Low-Level System Note
        </div>
        <div className="text-xs leading-relaxed font-mono">
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
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white p-6 shadow-2xl shrink-0 flex items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-5">
           <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)]"><ShieldCheck size={32} className="text-white" /></div>
           <div>
             <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">System Engineering Manual</h1>
             <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">v2.8.5 Enterprise Infrastructure Protocol</p>
           </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-red-600/20 hover:text-red-500 rounded-2xl transition-all border border-white/5 bg-white/5 group">
            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto z-40">
            <nav className="space-y-4">
                {[
                    { id: 'supabase', label: '1. Supabase Cloud', sub: 'Backend API & RLS', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-600' },
                    { id: 'local', label: '2. PC Hub', sub: 'Development Env', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' },
                    { id: 'build', label: '3. Asset Pipeline', sub: 'Tree-Shaking & Min', icon: Hammer, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600' },
                    { id: 'vercel', label: '4. Edge Network', sub: 'Global CDN Delivery', icon: Globe, color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-900' },
                    { id: 'pricelists', label: '5. Pricelist Engine', sub: 'XLSX & Distribution', icon: Table, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-600' }
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
            <div className="mt-auto pt-8 border-t border-slate-100 hidden md:block">
                <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => window.open('https://jstyp.me', '_blank')}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Activity size={48} /></div>
                    <div className="relative z-10">
                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Lead Architect</div>
                        <div className="font-black text-lg">JSTYP.me</div>
                        <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Digital Retail Systems</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-12 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-full pb-32">
              
              {/* PHASE 1: SUPABASE */}
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning the high-availability cloud backbone for multi-device synchronization.">Supabase Infrastructure</SectionHeading>
                    
                    <div className="mb-12 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                                    <Shield className="text-green-400 mb-2" size={24} />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">PostgreSQL</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                                    <Lock className="text-blue-400 mb-2" size={24} />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">RLS Policies</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                                    <Cloud className="text-purple-400 mb-2" size={24} />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Edge S3</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                                    <Network className="text-orange-400 mb-2" size={24} />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Realtime</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <WhyBox title="Relational Integrity & Schema Design">
                        The system uses Supabase not just as a database, but as an **Orchestration Layer**. By utilizing `JSONB` for the main `store_config`, we achieve "Schema-on-Read" flexibility, allowing instant metadata updates across thousands of devices without requiring SQL migrations on every app update.
                    </WhyBox>

                    <Step number="1" title="Infrastructure Bootstrapping (SQL)">
                        <p className="font-medium text-slate-700">Open your Supabase Dashboard &rarr; **SQL Editor** &rarr; **New Query**. Copy and execute this complete bootstrap script to build the entire fleet architecture.</p>
                        <CodeBlock 
                          id="sql-schema"
                          label="Production SQL Bootstrap (Fixed)"
                          code={`-- 1. RESET & CLEANUP (Ensures clean slate)
DROP POLICY IF EXISTS "Allow Public Read Config" ON public.store_config;
DROP POLICY IF EXISTS "Allow Public Update Config" ON public.store_config;
DROP POLICY IF EXISTS "Allow Public Insert Config" ON public.store_config;
DROP POLICY IF EXISTS "Allow Public Fleet Access" ON public.kiosks;
DROP POLICY IF EXISTS "Enable access to all users" ON public.kiosks;
DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;

-- 2. TABLE DEFINITIONS
CREATE TABLE IF NOT EXISTS public.store_config (
    id bigint primary key default 1,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
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

-- 3. STORAGE & PERMISSIONS
-- Auto-create the media bucket if missing
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kiosk-media', 'kiosk-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure row 1 exists
INSERT INTO public.store_config (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

-- 4. SECURITY POLICIES (OPEN ACCESS)
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anonymous API users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.store_config TO anon, authenticated;
GRANT ALL ON public.kiosks TO anon, authenticated;

-- Create permissive policies
CREATE POLICY "Allow All Config" ON public.store_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Fleet" ON public.kiosks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Storage" ON storage.objects FOR ALL USING (bucket_id = 'kiosk-media') WITH CHECK (bucket_id = 'kiosk-media');`}
                        />
                        <EngineerNote>
                            This script now includes `GRANT` statements and Storage Bucket creation. This fixes issues where "Pricelist Titles" or "Images" fail to save due to missing permissions or missing buckets.
                        </EngineerNote>
                    </Step>

                    <Step number="2" title="Storage Engine Configuration">
                        <p className="font-medium text-slate-700">The SQL above automatically provisions the `kiosk-media` bucket. If you prefer manual setup or need custom limits:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">Bucket Settings</div>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle2 size={14} className="text-green-500" /> Name: <code className="bg-white px-2 py-0.5 rounded border">kiosk-media</code></li>
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle2 size={14} className="text-green-500" /> Public Access: <strong>ENABLED</strong></li>
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle2 size={14} className="text-green-500" /> Max File Size: <strong>50MB</strong></li>
                                </ul>
                            </div>
                            <div className="p-4 bg-blue-100/50 rounded-2xl text-[10px] text-blue-800 leading-relaxed font-bold uppercase">
                                <Info size={16} className="mb-2" />
                                Pro-Tip: Enable "Image Transformation" in Supabase settings to allow the kiosk to request smaller thumbnails on-the-fly, reducing tablet bandwidth usage.
                            </div>
                        </div>
                    </Step>
                </div>
              )}

              {/* PHASE 2: PC HUB */}
              {activeTab === 'local' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Server} subtitle="Engineering the local developer environment for high-speed iteration.">PC Station Hub Setup</SectionHeading>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform"><Smartphone size={80} /></div>
                            <h3 className="text-white font-black uppercase text-[10px] tracking-widest mb-4">Direct Android Debugging</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">Connect your tablet via USB to view real-time logs in your PC's browser.</p>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10"><Code size={80} /></div>
                            <h3 className="text-white font-black uppercase text-[10px] tracking-widest mb-4">Vite HMR Hub</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Hot Module Replacement ensures UI changes appear instantly on-screen.</p>
                        </div>
                    </div>

                    <Step number="1" title="Environment Variable Mapping">
                        <p className="font-medium text-slate-700 leading-relaxed">The kiosk needs to know which Cloud instance to talk to. This is handled by **Static Injection** at build time. Create a file named <code>.env</code> in your root directory.</p>
                        <CodeBlock 
                            id="env-vars"
                            label="Project .env Variables"
                            code={`VITE_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_PUBLIC_ANON_KEY]`}
                        />
                        <EngineerNote>
                            Do not use your "service_role" key. Use the "anon/public" key. RLS handles the security.
                        </EngineerNote>
                    </Step>

                    <Step number="2" title="Local Server Ignition">
                        <p className="font-medium text-slate-700">Initialize the development server. This creates a local network entry point for your tablets to connect to for testing.</p>
                        <CodeBlock 
                            id="npm-dev"
                            label="Terminal Script"
                            code={`npm install
npm run dev -- --host`}
                        />
                        <div className="mt-4 p-5 bg-green-50 rounded-2xl border border-green-200">
                             <div className="flex items-center gap-2 text-green-800 font-black uppercase text-[10px] tracking-wider mb-2"><Wifi size={14}/> Network Testing</div>
                             <p className="text-xs text-green-700 font-medium leading-relaxed">Once running, find your PC's IP address (e.g. <code>192.168.1.10</code>). On the tablet, navigate to <code>http://192.168.1.10:5173</code> to see the live kiosk UI.</p>
                        </div>
                    </Step>

                    <Step number="3" title="ADB Remote Console (Optional)">
                        <p className="font-medium text-slate-700">For "Hardware-Level" debugging, use Chrome's **Inspect Devices** protocol.</p>
                        <ul className="space-y-3">
                            <li className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 font-black">A</div>
                                <p className="text-xs text-slate-600 leading-relaxed">Enable **Developer Options** and **USB Debugging** on the Android Tablet.</p>
                            </li>
                            <li className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 font-black">B</div>
                                <p className="text-xs text-slate-600 leading-relaxed">Connect Tablet to PC. In Chrome on PC, navigate to <code>chrome://inspect/#devices</code>.</p>
                            </li>
                        </ul>
                    </Step>
                </div>
              )}

              {/* PHASE 3: ASSET PIPELINE */}
              {activeTab === 'build' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Hammer} subtitle="Advanced Tree-Shaking, dead-code elimination, and multi-stage minification.">Production Asset Pipeline</SectionHeading>
                    
                    <div className="bg-purple-50 p-8 rounded-[3rem] border border-purple-100 mb-12 shadow-inner">
                        <div className="flex items-center gap-3 mb-6">
                            <Layers className="text-purple-600" size={24} />
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Dependency Chunking Logic</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 flex flex-col items-center text-center">
                                <Zap size={20} className="text-yellow-500 mb-2" />
                                <span className="text-[10px] font-black uppercase text-slate-900 mb-1">Core App</span>
                                <p className="text-[9px] text-slate-500 font-medium">Main logic & components. Loads instantly on boot.</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 flex flex-col items-center text-center">
                                <FileText size={20} className="text-red-500 mb-2" />
                                <span className="text-[10px] font-black uppercase text-slate-900 mb-1">PDF Engine</span>
                                <p className="text-[9px] text-slate-500 font-medium">Isolated `pdfjs` heavy binary. Only loaded on request.</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100 flex flex-col items-center text-center">
                                <Database size={20} className="text-blue-500 mb-2" />
                                <span className="text-[10px] font-black uppercase text-slate-900 mb-1">Cloud SDK</span>
                                <p className="text-[9px] text-slate-500 font-medium">Supabase core client for background sync operations.</p>
                            </div>
                        </div>
                    </div>

                    <WhyBox title="RAM Constraint Mitigation" variant="purple">
                        Retail tablets often utilize lower-tier mobile chipsets. Loading the entire 4MB javascript bundle at once would cause "Frame Dropping" during the intro animation. We implement **Strict Code Splitting** to ensure the main thread stays below 100ms task duration.
                    </WhyBox>

                    <Step number="1" title="The Vite Strategy Manifest">
                        <p className="font-medium text-slate-700">The <code>vite.config.ts</code> uses a manual chunking algorithm to prevent "Vendor Bloat" in the entry file.</p>
                        <CodeBlock 
                            id="vite-config"
                            label="vite.config.ts Build Config"
                            code={`build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'pdf-viewer': ['pdfjs-dist'],
        'cloud-sync': ['@supabase/supabase-js'],
        'ui-icons': ['lucide-react'],
        'excel-engine': ['xlsx']
      }
    }
  }
}`}
                        />
                    </Step>

                    <Step number="2" title="Binary Compilation Sequence">
                        <p className="font-medium text-slate-700">Run the final assembly line to generate the <code>/dist</code> folder. This folder contains the assets that get uploaded to Vercel or packaged into an APK.</p>
                        <CodeBlock id="npm-build" label="Production Assembly" code={`npm run build`} />
                        <div className="mt-4 flex flex-wrap gap-2">
                             <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Terser Minification</div>
                             <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> CSS Purging</div>
                             <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Gzip compression</div>
                        </div>
                    </Step>
                </div>
              )}

              {/* PHASE 4: EDGE NETWORK */}
              {activeTab === 'vercel' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Globe} subtitle="Anycast CDN distribution with atomic rollbacks and edge-cached routing.">Edge Network Infrastructure</SectionHeading>
                      
                      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 mb-12 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                          <div className="relative z-10 flex flex-col items-center">
                               <div className="w-full h-1 bg-white/5 relative rounded-full mb-12 flex items-center justify-between">
                                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center -ml-8 shadow-2xl animate-pulse">
                                       <GitBranch size={32} className="text-white" />
                                   </div>
                                   <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center -mr-8 shadow-2xl">
                                       <Globe2 size={32} className="text-slate-900" />
                                   </div>
                                   <div className="absolute left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-blue-400">
                                       CI/CD Pipeline Active
                                   </div>
                               </div>
                               <div className="grid grid-cols-3 gap-12 w-full text-center">
                                    <div>
                                        <div className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Commit</div>
                                        <div className="text-slate-500 text-[8px] font-mono">Push to Main</div>
                                    </div>
                                    <div>
                                        <div className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Compute</div>
                                        <div className="text-slate-500 text-[8px] font-mono">Edge Build</div>
                                    </div>
                                    <div>
                                        <div className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Deploy</div>
                                        <div className="text-slate-500 text-[8px] font-mono">Global Edge</div>
                                    </div>
                               </div>
                          </div>
                      </div>

                      <div className="space-y-12">
                          <Step number="1" title="Atomic Deployment Logic">
                              <p className="font-medium text-slate-700 leading-relaxed">
                                  Vercel utilizes an <strong>Atomic Pipeline</strong>. Each build is immutable. The live production traffic is only cut over to the new version once the build is 100% verified, ensuring the Kiosk never breaks during an update.
                              </p>
                              <ul className="space-y-4">
                                  <li className="flex gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0"><RefreshCw size={24} /></div>
                                      <div>
                                          <div className="text-sm font-black text-slate-900 uppercase mb-1">Zero-Downtime Migration</div>
                                          <div className="text-[11px] text-slate-500 font-medium leading-relaxed">When deploying a new version, Vercel keeps the old version active until the new one is warm across all global edge nodes. This prevents the "White Screen" error on tablets during updates.</div>
                                      </div>
                                  </li>
                                  <li className="flex gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl shrink-0"><Wind size={24} /></div>
                                      <div>
                                          <div className="text-sm font-black text-slate-900 uppercase mb-1">Static Asset Optimization</div>
                                          <div className="text-[11px] text-slate-500 font-medium leading-relaxed">Images and CSS are automatically converted to modern formats like WebP or compressed with Brotli at the Edge, saving massive bandwidth for shops on 4G connections.</div>
                                      </div>
                                  </li>
                              </ul>
                          </Step>

                          <Step number="2" title="Single Page Routing (vercel.json)">
                              <p className="font-medium text-slate-700">Client-side routing (React Router) requires the server to always return <code>index.html</code> for any path. Copy this to your project root.</p>
                              <CodeBlock 
                                id="vercel-json"
                                label="vercel.json Configuration"
                                code={`{
  "rewrites": [
    { "source": "/((?!.*\\\\.).*)", "destination": "/index.html" }
  ]
}`}
                              />
                              <WhyBox title="Routing Logic">
                                  Without this rule, refreshing the page on the <code>/admin</code> path would return a browser 404 error because Vercel would look for a physical folder named `/admin`.
                              </WhyBox>
                          </Step>
                      </div>
                  </div>
              )}

              {/* PHASE 5: PRICELIST ENGINE */}
              {activeTab === 'pricelists' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Table} subtitle="Autonomous ingestion, forensic data cleaning, and high-DPI distribution pipeline.">Pricelist Intelligence Engine</SectionHeading>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><FileSpreadsheet size={80} /></div>
                              <h3 className="text-orange-900 font-black uppercase text-[10px] tracking-widest mb-4">Input Stage (Forensics)</h3>
                              <p className="text-orange-800/80 text-sm leading-relaxed mb-4">The engine consumes raw binary stream data from <code>.xlsx</code> or <code>.csv</code> exports.</p>
                              <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-mono text-orange-600 bg-white/50 p-2 rounded">
                                      <span>Input:</span> <span className="font-bold">"  APL-ip15_PRO  "</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-mono text-orange-600 bg-white/50 p-2 rounded">
                                      <span>Price:</span> <span className="font-bold">"R 1,299.99"</span>
                                  </div>
                              </div>
                          </div>
                          <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-6 opacity-20"><RefreshCw size={80} className="animate-spin-slow" /></div>
                              <h3 className="text-white font-black uppercase text-[10px] tracking-widest mb-4">Normalization Engine</h3>
                              <p className="text-blue-100 text-sm leading-relaxed mb-4">Our sanitization algorithm enforces strict retail-premium formatting.</p>
                              <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-black/20 p-2 rounded">
                                      <span>Sanitized:</span> <span className="font-bold">"APL-IP15-PRO"</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-black/20 p-2 rounded">
                                      <span>Fixed:</span> <span className="font-bold">"R 1,300"</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-12">
                          <Step number="1" title="Fuzzy Column Mapping Strategy">
                              <p className="font-medium text-slate-700">The ingestion engine doesn't require fixed templates. It uses a **Weighted Keyword Scorer** to detect headers across any spreadsheet structure.</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3 text-blue-600 font-black uppercase text-[10px] tracking-wider">
                                          <Search size={14} /> Detection Schema
                                      </div>
                                      <div className="space-y-2">
                                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                              <span className="text-[10px] font-bold text-slate-400">TARGET</span>
                                              <span className="text-[10px] font-black text-slate-900">KEYWORDS</span>
                                          </div>
                                          <div className="flex justify-between items-center py-1">
                                              <span className="text-xs font-bold text-slate-500">SKU</span>
                                              <span className="text-[9px] font-mono bg-slate-100 px-1 rounded">sku, part, code, model</span>
                                          </div>
                                          <div className="flex justify-between items-center py-1">
                                              <span className="text-xs font-bold text-slate-500">DESC</span>
                                              <span className="text-[9px] font-mono bg-slate-100 px-1 rounded">desc, name, title, item</span>
                                          </div>
                                          <div className="flex justify-between items-center py-1">
                                              <span className="text-xs font-bold text-slate-500">NORMAL</span>
                                              <span className="text-[9px] font-mono bg-slate-100 px-1 rounded">retail, price, cost, std</span>
                                          </div>
                                          <div className="flex justify-between items-center py-1">
                                              <span className="text-xs font-bold text-slate-500">PROMO</span>
                                              <span className="text-[9px] font-mono bg-slate-100 px-1 rounded">sale, promo, disc, special</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                                      <div className="flex items-center gap-2 mb-3 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                                          <FileType size={14} /> Binary Parsing
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                                          Using <code>SheetJS (XLSX)</code>, we extract rows into a normalized 2D matrix. The engine then scans the first 5 rows to establish where the data table actually begins, stripping out marketing headers or redundant top-row logos common in vendor exports.
                                      </p>
                                  </div>
                              </div>
                          </Step>

                          <Step number="2" title="Price Sanitization Logic">
                              <WhyBox title="Cognitive Pricing Optimization" variant="orange">
                                  Retailers avoid "jagged" pricing to maintain a premium aesthetic. Our logic automatically rounds decimals up and pushes "discount 9s" (e.g. 799) to whole round numbers (800) to ensure the table looks organized and upscale.
                              </WhyBox>
                              
                              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 text-green-400 rotate-12"><CpuIcon size={120} /></div>
                                  <div className="relative z-10 space-y-6">
                                      <div className="flex items-center justify-between gap-4">
                                          <div className="flex-1">
                                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Input Value</div>
                                              <div className="text-2xl font-mono text-red-400/80 line-through opacity-50 transition-all duration-1000">R {roundDemoValue.toLocaleString()}</div>
                                          </div>
                                          <div className="shrink-0 animate-pulse"><ArrowRight className="text-slate-700" size={24} /></div>
                                          <div className="flex-1 text-right">
                                              <div className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Engine Output</div>
                                              <div className="text-4xl font-mono text-green-400 font-black tracking-tighter transition-all duration-300">
                                                  R {(() => {
                                                      let n = roundDemoValue;
                                                      if (n % 1 !== 0) n = Math.ceil(n);
                                                      if (Math.floor(n) % 10 === 9) n += 1;
                                                      return n.toLocaleString();
                                                  })()}
                                              </div>
                                          </div>
                                      </div>
                                      <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-2">
                                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                              <Binary size={12} /> Execution Sequence:
                                          </div>
                                          <ol className="text-[11px] font-mono text-slate-300 list-decimal pl-4 space-y-1">
                                              <li>Strip non-numeric characters: <code>/[^0-9.]/g</code></li>
                                              <li>Check for Floating Point: <code>if (val % 1 !== 0) val = Math.ceil(val)</code></li>
                                              <li>Psychological Offset: <code>if (val % 10 === 9) val += 1</code></li>
                                              <li>Re-format with Currency Grouping: <code>toLocaleString('en-ZA')</code></li>
                                          </ol>
                                      </div>
                                  </div>
                              </div>
                          </Step>

                          <Step number="3" title="High-DPI PDF Rendering Pipeline">
                              <p className="font-medium text-slate-700">The distribution engine generates print-ready 300DPI PDFs directly in the browser using <code>jsPDF</code>. This avoids server-side rendering latency and preserves local data privacy.</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3"><Maximize size={20} /></div>
                                      <span className="text-[10px] font-black text-slate-900 uppercase mb-1">Canvas Bridge</span>
                                      <p className="text-[10px] text-slate-500 leading-tight">Remote images are drawn to a hidden canvas to convert them to PNG stream data for PDF inclusion.</p>
                                  </div>
                                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3"><Columns size={20} /></div>
                                      <span className="text-[10px] font-black text-slate-900 uppercase mb-1">Pagination Logic</span>
                                      <p className="text-[10px] text-slate-500 leading-tight">The engine calculates text height in millimeters to determine exactly when to break pages and re-draw headers.</p>
                                  </div>
                                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                                      <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3"><FileOutput size={20} /></div>
                                      <span className="text-[10px] font-black text-slate-900 uppercase mb-1">Atomic Output</span>
                                      <p className="text-[10px] text-slate-500 leading-tight">The final blob is generated locally as a <code>Uint8Array</code>, ensuring the document is never stored in un-compiled form.</p>
                                  </div>
                              </div>

                              <EngineerNote>
                                 PDF Fonts are set to Helvetica-Standard with variable weighting. Character spacing is adjusted by -0.2mm to maximize description legibility on A4 portrait layouts.
                              </EngineerNote>
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
