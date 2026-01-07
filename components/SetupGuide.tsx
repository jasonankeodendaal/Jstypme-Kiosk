
import React, { useState, useEffect } from 'react';
import { 
  X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, 
  Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, 
  CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, 
  Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, 
  Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, 
  FileText, ArrowRight, Sparkles, ServerCrash, Share, Download, FastForward, 
  Search, Columns, FileType, FileOutput, Maximize, GitBranch, Box, Eye, 
  MessageSquare, ListCheck, Cloud, Layout, MousePointer2, Wifi, Bot, SmartphoneNfc, 
  Container, Braces, Wand2, MonitorSmartphone
} from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'supabase' | 'apk' | 'ai' | 'pricelists'>('architecture');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [roundDemoValue, setRoundDemoValue] = useState(799);

  useEffect(() => {
    const interval = setInterval(() => {
        setRoundDemoValue(prev => {
            if (prev === 799) return 4449.99;
            if (prev === 4449.99) return 122;
            if (prev === 122) return 89.95;
            return 799;
        });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const SectionHeading = ({ children, icon: Icon, subtitle }: any) => (
    <div className="mb-10 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-50 rounded-2xl">
                {Icon && <Icon className="text-blue-600" size={32} />}
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{children}</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-60">System Sub-Module v2.8</p>
            </div>
        </div>
        <p className="text-lg text-slate-500 font-medium max-w-2xl">{subtitle}</p>
    </div>
  );

  const WhyBox = ({ title = "Architectural Logic", children, variant = "blue" }: any) => {
    const colors = variant === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-900/80' : 
                   variant === 'purple' ? 'bg-purple-50 border-purple-500 text-purple-900/80' : 
                   variant === 'green' ? 'bg-green-50 border-green-500 text-green-900/80' :
                   'bg-blue-50 border-blue-500 text-blue-900/80';
    const iconColor = variant === 'orange' ? 'text-orange-800' : variant === 'purple' ? 'text-purple-800' : variant === 'green' ? 'text-green-800' : 'text-blue-800';
    return (
        <div className={`${colors} border-l-4 p-8 mb-10 rounded-r-[2rem] shadow-sm relative overflow-hidden`}>
            <div className={`flex items-center gap-2 ${iconColor} font-black uppercase text-[11px] tracking-widest mb-3`}>
                <Zap size={16} className="fill-current" /> {title}
            </div>
            <div className="text-base leading-relaxed font-medium">
                {children}
            </div>
        </div>
    );
  };

  const EngineerNote = ({ children }: any) => (
    <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl border border-slate-800 my-8 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500"><Terminal size={40} /></div>
        <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] tracking-[0.2em] mb-3">
            <CpuIcon size={14} /> Low-Level Diagnostics
        </div>
        <div className="text-[13px] leading-relaxed font-mono opacity-80">
            {children}
        </div>
    </div>
  );

  const Step = ({ number, title, children }: any) => (
    <div className="flex gap-8 mb-16 last:mb-0 group">
        <div className="flex flex-col items-center shrink-0">
            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center font-black shadow-2xl border border-white/10 text-xl group-hover:scale-110 transition-transform duration-500">
                {number}
            </div>
            <div className="flex-1 w-1 bg-gradient-to-b from-slate-200 via-slate-100 to-transparent my-4 rounded-full"></div>
        </div>
        <div className="flex-1 pt-1">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-5 flex items-center gap-3">
                {title}
            </h3>
            <div className="text-slate-600 space-y-6">
                {children}
            </div>
        </div>
    </div>
  );

  const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => (
    <div className="my-8 relative group">
      {label && <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 px-2"><Terminal size={12}/> {label}</div>}
      <div className="bg-slate-950 rounded-3xl p-8 overflow-x-auto relative shadow-2xl border border-white/5">
        <code className="font-mono text-sm text-blue-300 whitespace-pre-wrap break-all block leading-relaxed">{code}</code>
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-blue-600 rounded-2xl text-white transition-all border border-white/5 group-active:scale-95 shadow-lg backdrop-blur-md"
          title="Copy to Clipboard"
        >
          {copiedStep === id ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="opacity-40 group-hover:opacity-100" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in overflow-hidden font-sans">
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .scanline-effect::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(59, 130, 246, 0.05) 50.5%, transparent 51%); background-size: 100% 4px; pointer-events: none; animation: scanline 10s linear infinite; }
        .glass-sidebar { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); }
      `}</style>

      {/* Main Header */}
      <div className="bg-slate-900 text-white p-8 shadow-2xl shrink-0 flex items-center justify-between border-b border-slate-800 z-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 scanline-effect pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
           <div className="bg-blue-600 p-4 rounded-3xl shadow-[0_0_40px_rgba(37,99,235,0.5)] border border-blue-400/20 rotate-3"><ShieldCheck size={40} className="text-white" /></div>
           <div>
             <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Kiosk Firmware Protocol</h1>
             <div className="flex items-center gap-3">
                <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em] bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">Engineering Manual v3.0</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
                    <span className="text-green-500 text-[9px] font-black uppercase tracking-widest">Core Active</span>
                </div>
             </div>
           </div>
        </div>
        <button onClick={onClose} className="p-4 hover:bg-red-600/20 hover:text-red-500 rounded-3xl transition-all border border-white/5 bg-white/5 group shadow-xl">
            <X size={32} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-96 glass-sidebar border-r border-slate-200 p-8 flex flex-col shrink-0 overflow-y-auto z-40">
            <nav className="space-y-4">
                {[
                    { id: 'architecture', label: '1. System Logic', sub: 'Data Flow Topology', icon: Workflow, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' },
                    { id: 'supabase', label: '2. Cloud Infrastructure', sub: 'PostgreSQL & Realtime', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-600' },
                    { id: 'apk', label: '3. Android APK Native', sub: 'Hardware Packaging', icon: SmartphoneNfc, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-600' },
                    { id: 'ai', label: '4. Gemini AI Engine', sub: 'LLM Content Synthesis', icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600' },
                    { id: 'pricelists', label: '5. Technical Matrix', sub: 'PDF & Pricing Logic', icon: Table, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-600' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`w-full p-5 rounded-[2rem] border-2 text-left transition-all duration-500 group flex items-center gap-5 ${activeTab === tab.id ? `${tab.bg} ${tab.border} shadow-2xl shadow-black/5 translate-x-2` : 'border-transparent hover:bg-white/50'}`}
                    >
                        <div className={`p-4 rounded-2xl transition-all duration-700 ${activeTab === tab.id ? 'bg-white shadow-xl scale-110' : 'bg-slate-100/50'}`}>
                            <tab.icon size={26} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />
                        </div>
                        <div className="min-w-0">
                            <span className={`font-black text-sm block leading-none mb-1.5 truncate ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate block opacity-70">{tab.sub}</span>
                        </div>
                    </button>
                ))}
            </nav>
            <div className="mt-auto pt-10 border-t border-slate-200/60">
                <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-white/5 transition-all hover:bg-slate-800" onClick={() => window.open('https://jstyp.me', '_blank')}>
                    <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700"><Activity size={64} /></div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Systems Architect</div>
                        <div className="font-black text-2xl tracking-tighter">JSTYP.me</div>
                        <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">Digital Experience Lab</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-16 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-200/60 overflow-hidden min-h-full pb-40">
              
              {/* SECTION: ARCHITECTURE */}
              {activeTab === 'architecture' && (
                  <div className="p-10 md:p-20 animate-fade-in">
                      <SectionHeading icon={Network} subtitle="A visual breakdown of the Local-First data synchronization topology.">System Architecture</SectionHeading>
                      
                      <div className="relative bg-slate-50 p-8 rounded-[3rem] border border-slate-200 overflow-hidden mb-12">
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                          
                          <div className="relative z-10 flex flex-col gap-8 items-center">
                              {/* Cloud Layer */}
                              <div className="bg-white p-6 rounded-3xl border-2 border-green-200 shadow-xl w-full max-w-md text-center relative">
                                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Supabase Cloud</div>
                                  <div className="flex justify-center gap-8 text-slate-400">
                                      <div className="flex flex-col items-center"><Database size={24} className="text-green-600 mb-1"/><span className="text-[9px] font-bold uppercase">Store Config</span></div>
                                      <div className="flex flex-col items-center"><HardDrive size={24} className="text-green-600 mb-1"/><span className="text-[9px] font-bold uppercase">Media Storage</span></div>
                                      <div className="flex flex-col items-center"><Activity size={24} className="text-green-600 mb-1"/><span className="text-[9px] font-bold uppercase">Fleet Logs</span></div>
                                  </div>
                              </div>

                              {/* Sync Pipes */}
                              <div className="flex gap-20 w-full max-w-lg justify-center relative h-16">
                                  <div className="w-0.5 h-full bg-slate-300 relative">
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded border border-slate-200 text-[8px] font-black uppercase text-slate-400 whitespace-nowrap">Read/Write</div>
                                  </div>
                                  <div className="w-0.5 h-full bg-slate-300 relative">
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded border border-slate-200 text-[8px] font-black uppercase text-slate-400 whitespace-nowrap">Sync Down</div>
                                  </div>
                              </div>

                              {/* Device Layer */}
                              <div className="flex gap-8 w-full justify-center">
                                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl w-48 text-center flex flex-col items-center border border-slate-800">
                                      <Settings size={32} className="text-blue-400 mb-3" />
                                      <div className="font-black uppercase text-sm">Admin Hub</div>
                                      <p className="text-[9px] text-slate-400 mt-2 leading-tight">Controls inventory, logic, and pushes updates.</p>
                                  </div>
                                  
                                  <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl w-48 text-center flex flex-col items-center">
                                      <Tablet size={32} className="text-slate-400 mb-3" />
                                      <div className="font-black uppercase text-sm text-slate-900">Kiosk Unit</div>
                                      <p className="text-[9px] text-slate-500 mt-2 leading-tight">Downloads snapshot. Runs 100% offline if needed.</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <WhyBox title="Snapshot Strategy">
                          Unlike traditional web apps that query a database on every page load, this system loads the <strong>entire store configuration</strong> (products, images, settings) into the device's memory on startup. This ensures <strong>zero-latency navigation</strong> and resilience against unstable in-store WiFi.
                      </WhyBox>
                  </div>
              )}

              {/* SECTION: SUPABASE */}
              {activeTab === 'supabase' && (
                <div className="p-10 md:p-20 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Architecting the global state orchestration layer for multi-device retail fleets.">Cloud Core Infrastructure</SectionHeading>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-slate-50 p-8 rounded-[3rem] border border-slate-200">
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-green-500 p-4 rounded-2xl shadow-xl shadow-green-500/20 text-white"><Database size={32}/></div>
                            <span className="text-[10px] font-black uppercase text-slate-500 mt-2">PostgreSQL</span>
                        </div>
                        <div className="flex-1 h-1 w-full md:w-auto bg-slate-200 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-500 animate-[scanline_2s_infinite_linear]"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm text-slate-400"><Tablet size={32}/></div>
                            <span className="text-[10px] font-black uppercase text-slate-500 mt-2">Kiosk Client</span>
                        </div>
                    </div>

                    <Step number="1" title="Production SQL Provisioning">
                        <p className="font-medium text-slate-700 leading-relaxed">Execute this bootstrap protocol in your Supabase SQL Editor. This script creates the tables, storage buckets, and permissive RLS policies required for retail kiosks.</p>
                        <CodeBlock 
                          id="sql-complete"
                          label="Production Bootstrap Script"
                          code={`-- 1. SETUP CORE TABLES
CREATE TABLE IF NOT EXISTS public.store_config (
    id bigint primary key default 1,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.kiosks (
    id text primary key,
    name text not null,
    device_type text default 'kiosk',
    status text default 'online',
    last_seen timestamp with time zone default now(),
    wifi_strength int default 100,
    ip_address text,
    version text,
    assigned_zone text default 'Unassigned',
    restart_requested boolean default false
);

-- 2. PROVISION STORAGE
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kiosk-media', 'kiosk-media', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. ENABLE SECURITY LAYERS
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write" ON public.store_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write" ON public.kiosks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Media Storage" ON storage.objects FOR ALL USING (bucket_id = 'kiosk-media');

-- 4. INITIALIZE DATA
INSERT INTO public.store_config (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;`}
                        />
                    </Step>

                    <EngineerNote>
                        Security Warning: For enterprise deployments, replace the `USING (true)` policies with `auth.uid()` checks. This demo uses open policies for rapid store-front deployment.
                    </EngineerNote>
                </div>
              )}

              {/* SECTION: APK */}
              {activeTab === 'apk' && (
                <div className="p-10 md:p-20 animate-fade-in">
                    <SectionHeading icon={SmartphoneNfc} subtitle="Converting web-based assets into native high-performance Android binaries.">Native APK Generation</SectionHeading>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700"><Smartphone size={80} /></div>
                            <h3 className="text-blue-400 font-black uppercase text-[11px] tracking-widest mb-4">Hardware Acceleration</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Native WebViews in the APK allow the hardware to optimize 60FPS video playback and buttery smooth scrolling.</p>
                        </div>
                        <div className="bg-orange-600 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20"><Hammer size={80} /></div>
                            <h3 className="text-white font-black uppercase text-[11px] tracking-widest mb-4">Kiosk Lockdown</h3>
                            <p className="text-orange-100 text-sm leading-relaxed">The APK package can be "pinned" in Android settings, preventing shoppers from exiting the app.</p>
                        </div>
                    </div>

                    <Step number="1" title="The Build-to-Native Bridge">
                        <p className="font-medium text-slate-700 leading-relaxed">We recommend using **Capacitor** for the most robust bridge. First, generate your production web bundle, then sync it to the Android studio project.</p>
                        <CodeBlock 
                            id="apk-build"
                            label="Android Assembly Script"
                            code={`# 1. Generate Web Bundle
npm run build

# 2. Initialize Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Kiosk Pro" "com.jstyp.kiosk" --web-dir dist

# 3. Build Android Project
npx cap add android
npx cap sync android
npx cap open android`}
                        />
                    </Step>

                    <Step number="2" title="Android Studio Manifest Fixes">
                        <p className="font-medium text-slate-700">Ensure the <code>AndroidManifest.xml</code> allows cleartext traffic if you are testing local cloud instances and enables fullscreen immersion.</p>
                        <CodeBlock 
                            id="xml-manifest"
                            label="AndroidManifest.xml Settings"
                            code={`<application
    android:usesCleartextTraffic="true"
    android:theme="@style/AppTheme.NoActionBar.FullScreen">
    
    <!-- Lock to Landscape -->
    <activity android:screenOrientation="sensorLandscape" />
</application>`}
                        />
                    </Step>
                </div>
              )}

              {/* SECTION: AI */}
              {activeTab === 'ai' && (
                <div className="p-10 md:p-20 animate-fade-in">
                    <SectionHeading icon={Bot} subtitle="Utilizing Gemini-1.5-Pro to autonomously synthesize technical catalogs from raw data.">AI Content Synthesis</SectionHeading>
                    
                    <div className="bg-purple-900 rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="bg-white/10 p-5 rounded-full mb-6 backdrop-blur-xl group-hover:scale-110 transition-transform duration-700">
                                <Bot size={64} className="text-purple-300" />
                            </div>
                            <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-2">Gemini Intelligence Hub</h3>
                            <p className="text-purple-200 font-medium max-w-lg leading-relaxed">Our system uses Gemini to "Clean" messy manufacturer spreadsheets into human-readable, premium retail copy.</p>
                        </div>
                    </div>

                    <Step number="1" title="The Synthesis Protocol">
                        <p className="font-medium text-slate-700 leading-relaxed">When a new brand is imported via ZIP, the system (optional) sends the raw specs to Gemini to generate the "Key Features" list you see on the product detail page.</p>
                        <CodeBlock 
                            id="ai-prompt"
                            label="Internal AI System Instruction"
                            code={`You are a high-end retail copywriter. 
Analyze these raw technical specs and produce:
1. A punchy, luxury-oriented description (max 200 chars).
2. exactly 4 technical "Key Features" as short bullet points.
Output must be structured JSON.`}
                        />
                    </Step>

                    <WhyBox title="Cognitive Data Cleaning" variant="purple">
                        Retail data is often "noisy" (e.g., `Model: IPH15-PRO-BLK-256`). The AI layer strips the SKU noise and translates it into `iPhone 15 Pro, Black, 256GB`, ensuring the Kiosk UX remains premium and easy for customers to understand at a glance.
                    </WhyBox>
                </div>
              )}

              {/* SECTION: PRICELISTS */}
              {activeTab === 'pricelists' && (
                <div className="p-10 md:p-20 animate-fade-in">
                    <SectionHeading icon={Table} subtitle="Autonomous ingestion and high-fidelity distribution for retail pricing.">Pricelist Intelligence Engine</SectionHeading>
                    
                    <Step number="1" title="Universal Import Capability">
                        <p className="font-medium text-slate-700">The system now supports direct parsing of <strong>PDF Documents</strong> alongside traditional Excel/CSV formats. The internal logic scans PDF text layers to identify tabular structures and pricing columns automatically.</p>
                        <div className="flex gap-4 mt-6">
                            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                                <div className="p-2 bg-green-100 rounded-lg text-green-700 mb-2"><FileSpreadsheet size={20}/></div>
                                <div className="font-black uppercase text-xs">Excel / CSV</div>
                                <div className="text-[10px] text-slate-400 mt-1">Structured Grid Data</div>
                            </div>
                            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                                <div className="p-2 bg-red-100 rounded-lg text-red-700 mb-2"><FileText size={20}/></div>
                                <div className="font-black uppercase text-xs">PDF Document</div>
                                <div className="text-[10px] text-slate-400 mt-1">Text Layer Scraping</div>
                            </div>
                        </div>
                    </Step>

                    <Step number="2" title="Price Normalization Logic">
                        <p className="font-medium text-slate-700">Our engine performs psychological pricing adjustments to maintain a "Rounded Premium" look across all tables.</p>
                        
                        <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 right-0 p-10 opacity-5 text-green-400 rotate-12"><CpuIcon size={120} /></div>
                             <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Input Fragment</div>
                                        <div className="text-3xl font-mono text-red-400/80 line-through opacity-50 transition-all duration-1000">R {roundDemoValue.toLocaleString()}</div>
                                    </div>
                                    <div className="shrink-0 animate-pulse text-slate-700">
                                        <ArrowRight size={32} />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Engine Output</div>
                                        <div className="text-5xl font-mono text-green-400 font-black tracking-tighter transition-all duration-300">
                                            R {(() => {
                                                let n = roundDemoValue;
                                                if (n % 1 !== 0) n = Math.ceil(n);
                                                if (Math.floor(n) % 10 === 9) n += 1;
                                                return n.toLocaleString();
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-3">
                                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        <Binary size={14} /> Execution Sequence:
                                    </div>
                                    <ol className="text-xs font-mono text-slate-300 list-decimal pl-5 space-y-2 opacity-80">
                                        <li>Purge non-numeric tokens: <code>/[^0-9.]/g</code></li>
                                        <li>Ceiling Logic: <code>if (val % 1 !== 0) val = Math.ceil(val)</code></li>
                                        <li>Psychological Adjustment: <code>if (val % 10 === 9) val += 1</code></li>
                                        <li>Locale String formatting (ZAR Standard)</li>
                                    </ol>
                                </div>
                             </div>
                        </div>
                    </Step>

                    <WhyBox title="Visual Hierarchy in PDFs" variant="orange">
                        When generating the 300DPI PDF for distribution, the engine uses **Sub-Pixel Positioning**. This ensures that even with hundreds of rows, the text remains crisp on printed A4 paper for in-store price tags.
                    </WhyBox>
                </div>
              )}

              <div className="h-60"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
