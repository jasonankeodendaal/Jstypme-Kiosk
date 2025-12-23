
import React, { useState, useEffect } from 'react';
/* Added Tablet and Tv imports from lucide-react */
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, FileText, ArrowRight, Sparkles, ServerCrash, Zap as ZapIcon, FastForward, Infinity, ShieldCheck as ShieldIcon, BarChart3, Calculator, Repeat, ClipboardCheck } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'build' | 'vercel' | 'supabase' | 'pricelists'>('supabase');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [roundDemoValue, setRoundDemoValue] = useState(799);

  // Animation for the rounding demo in the Pricelist tab
  useEffect(() => {
    if (activeTab === 'pricelists') {
        const interval = setInterval(() => {
            setRoundDemoValue(prev => prev === 799 ? 4449 : prev === 4449 ? 122 : 799);
        }, 3000);
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

  const WhyBox = ({ title = "Architectural Logic", children }: any) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-2xl shadow-sm">
        <div className="flex items-center gap-2 text-blue-800 font-black uppercase text-[10px] tracking-widest mb-2">
            <ZapIcon size={14} className="fill-blue-500" /> {title}
        </div>
        <div className="text-sm text-blue-900/80 leading-relaxed font-medium">
            {children}
        </div>
    </div>
  );

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
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        
        @keyframes data-flow {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(120px); opacity: 0; }
        }
        .data-packet { animation: data-flow 2s infinite linear; }
        
        @keyframes subtle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-small { animation: subtle-bounce 3s ease-in-out infinite; }
      `}</style>

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
            <div className="mb-8 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Deployment phases</h3>
                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            </div>
            
            <nav className="space-y-4">
                {[
                    { id: 'supabase', label: '1. Supabase Cloud', sub: 'Backend API & RLS', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-600' },
                    { id: 'local', label: '2. PC Station Hub', sub: 'Development Env', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' },
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
            
            <div className="mt-8">
                <a 
                    href="https://github.com/jasonankeodendaal/Jstypme-Kiosk.git" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full p-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-[2rem] transition-all flex items-center gap-4 border border-slate-200 group"
                >
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                        <Github size={22} className="text-slate-900" />
                    </div>
                    <div className="min-w-0">
                        <span className="font-black text-sm block leading-none mb-1">GitHub Repo</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Source Code Access</span>
                    </div>
                </a>
            </div>

            <div className="mt-auto pt-8">
                <div className="p-5 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-xl border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={40} /></div>
                    <div className="flex items-center gap-2 mb-3"><Info size={14} className="text-blue-400" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Systems Integrity</span></div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">This manual is intended for authorized system administrators. Unauthorized configuration changes may disrupt fleet-wide retail operations.</p>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-12 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-full pb-32">
              
              {/* PHASE 1: SUPABASE */}
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning the high-availability cloud backbone for global fleet synchronization.">Supabase Infrastructure Setup</SectionHeading>
                    
                    <WhyBox title="Why use Supabase Cloud?">
                        Standard retail kiosks rely on local databases which are islands of data. By integrating <strong>Supabase (PostgreSQL + PostgREST)</strong>, we gain three mission-critical capabilities:
                        <ul className="mt-4 space-y-3">
                            <li className="flex gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={16}/> <strong>Realtime Websockets:</strong> When you change a price in this Admin Hub, a push notification is sent instantly to every tablet in the field.</li>
                            <li className="flex gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={16}/> <strong>Relational Integrity:</strong> Using SQL ensures that if you delete a Brand, all associated Products are handled correctly via foreign key constraints, preventing "Zombie" items.</li>
                            <li className="flex gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={16}/> <strong>Storage CDNs:</strong> High-resolution product videos are hosted on edge-cached buckets, ensuring zero buffering for customers.</li>
                        </ul>
                    </WhyBox>

                    <div className="space-y-6">
                        <Step number="1" title="Project Provisioning">
                            <p className="font-medium text-slate-700 leading-relaxed">Visit <a href="https://supabase.com" target="_blank" className="text-blue-600 font-bold underline inline-flex items-center gap-1 hover:text-blue-700 transition-colors">supabase.com <ExternalLink size={14}/></a>. The platform uses Dockerized PostgreSQL instances under the hood, providing enterprise-grade performance even on the free tier.</p>
                            <EngineerNote>
                                PRO TIP: Select a region closest to your physical store locations (e.g., 'eu-west-1' for Europe or 'af-south-1' for Southern Africa). This reduces API round-trip latency by up to 150ms per heartbeat.
                            </EngineerNote>
                        </Step>

                        <Step number="2" title="SQL Schema Injection">
                            <p className="font-medium text-slate-700">The Kiosk Pro system is "schema-driven". You must execute this DDL (Data Definition Language) script to initialize the tables and enable Realtime replication.</p>
                            <CodeBlock 
                                id="sql-full"
                                label="System Master SQL (Run in SQL Editor)"
                                code={`-- PHASE 1: ASSET STORAGE BUCKET
insert into storage.buckets (id, name, public) 
values ('kiosk-media', 'kiosk-media', true) 
on conflict (id) do nothing;

-- PHASE 2: FLEET & CONFIGURATION TABLES
CREATE TABLE IF NOT EXISTS public.store_config ( 
    id serial PRIMARY KEY,
    updated_at timestamp with time zone DEFAULT now(),
    data jsonb NOT NULL DEFAULT '{}'::jsonb
);

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

-- PHASE 3: REALTIME REPLICATION CONFIG
ALTER TABLE public.store_config REPLICA IDENTITY FULL;
ALTER TABLE public.kiosks REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_config;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosks;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Tables already in publication';
END $$;`}
                            />
                        </Step>
                    </div>
                </div>
              )}

              {/* PHASE 2: LOCAL SETUP */}
              {activeTab === 'local' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Server} subtitle="Establishing the local engineering workspace for rapid testing and asset management.">PC Hub Configuration</SectionHeading>
                      
                      <WhyBox title="Why develop locally?">
                          The Kiosk app uses a technology called <strong>HMR (Hot Module Replacement)</strong>. When you change code on your PC, the app updates instantly without refreshing the page. This "Dev-Loop" is essential for fine-tuning UI animations and screensaver transitions before they go live on expensive in-store panels.
                      </WhyBox>

                      <div className="space-y-8">
                          <Step number="1" title="The Node.js Runtime">
                              <p className="font-medium text-slate-700">Node.js is the engine that runs our build tools. We recommend <strong>Node.js v18 or higher (LTS)</strong> for compatibility with Vite 5.0.</p>
                          </Step>
                          
                          <Step number="2" title="Cloning & Dependencies">
                              <p className="font-medium text-slate-700">Our system uses <strong>NPM (Node Package Manager)</strong> to fetch all required libraries.</p>
                              <CodeBlock id="npm-install" label="Run in Terminal" code={`npm install`} />
                          </Step>

                          <Step number="3" title="Environment Variables (.env)">
                              <CodeBlock 
                                id="env-example" 
                                label=".env Configuration" 
                                code={`VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-long-anon-public-key-here`} 
                              />
                          </Step>
                      </div>
                  </div>
              )}

              {/* PHASE 4: EDGE NETWORK */}
              {activeTab === 'vercel' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Globe} subtitle="Global asset distribution with zero-downtime atomic deployments.">Edge Network Infrastructure</SectionHeading>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Globe2 size={160} className="text-blue-500" /></div>
                            <h3 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ZapIcon size={18} className="text-yellow-400" /> Edge Caching</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">Assets are stored on Vercel's <strong>Anycast IP</strong> network, meaning a kiosk in London and a kiosk in Tokyo both fetch data from the server physically closest to them.</p>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded border border-blue-500/30">LOW LATENCY</span>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[9px] font-black rounded border border-green-500/30">99.9% UPTIME</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                            <h3 className="text-slate-900 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldIcon size={18} className="text-blue-600" /> Atomic Integrity</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Vercel uses <strong>Immutable Deployments</strong>. If a build fails, the old version stays live. If you need to roll back a price error, it takes exactly 1.5 seconds.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <Step number="1" title="Atomic Deployment Logic">
                            <p className="font-medium text-slate-700">Every single code push generates a unique "Preview URL". This allows you to test new inventory features on a private link before merging to the "Production" branch that the store tablets use.</p>
                            <WhyBox title="Why Atomic?">
                                In retail, "Half-broken" is worse than "Broken". Atomic deployments ensure that a kiosk never downloads part of a new update while running old code, which would cause a <strong>System Inconsistency Crash</strong>.
                            </WhyBox>
                        </Step>

                        <Step number="2" title="Cache Invalidation Strategy">
                            <p className="font-medium text-slate-700">The Kiosk app employs a <strong>Stale-While-Revalidate (SWR)</strong> pattern. The Edge Network serves the cached version immediately, while checking in the background if a newer version exists.</p>
                            <EngineerNote>
                                TECHNICAL EXAMPLE: When you upload a new PDF manual to Supabase, the Edge network handles the CORS preflight and provides a <code>Cache-Control: public, max-age=31536000, immutable</code> header for media files, while keeping the <code>index.html</code> at <code>max-age=0, s-maxage=31536000</code> to ensure rapid UI updates.
                            </EngineerNote>
                        </Step>

                        <Step number="3" title="SSL & Security Tunneling">
                            <p className="font-medium text-slate-700">All data transferred between Vercel and your Kiosks is encrypted via <strong>TLS 1.3</strong>. This prevents "Man-in-the-Middle" attacks where a malicious actor could intercept and change product pricing on your network.</p>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-6">
                                <div className="p-4 bg-white rounded-full shadow-md"><Lock size={32} className="text-blue-600" /></div>
                                <div className="space-y-1">
                                    <div className="text-sm font-black text-slate-900 uppercase">Automated Certificate Issuance</div>
                                    <div className="text-xs text-slate-500 font-medium">Global DNS propagation with automatic Let's Encrypt rotation every 90 days.</div>
                                </div>
                            </div>
                        </Step>
                    </div>
                </div>
              )}

              {/* PHASE 5: PRICELIST ENGINE */}
              {activeTab === 'pricelists' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Table} subtitle="Advanced heuristics for retail price normalization and XLSX data parsing.">Pricelist Intelligence Engine</SectionHeading>
                    
                    <div className="bg-orange-950 rounded-[2.5rem] p-10 mb-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute -bottom-10 -right-10 opacity-5"><FileSpreadsheet size={240} className="text-white" /></div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <div className="bg-orange-500/20 p-3 rounded-2xl w-max"><Calculator size={24} className="text-orange-400" /></div>
                                <h4 className="text-white font-black uppercase text-xs tracking-widest">Normalizer</h4>
                                <p className="text-orange-200/60 text-[10px] leading-relaxed font-medium">Strips currency symbols and non-numeric characters from dirty Excel exports.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-orange-500/20 p-3 rounded-2xl w-max"><BarChart3 size={24} className="text-orange-400" /></div>
                                <h4 className="text-white font-black uppercase text-xs tracking-widest">Delta Detector</h4>
                                <p className="text-orange-200/60 text-[10px] leading-relaxed font-medium">Calculates discount percentages and flags "Promo" items automatically.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-orange-500/20 p-3 rounded-2xl w-max"><Repeat size={24} className="text-orange-400" /></div>
                                <h4 className="text-white font-black uppercase text-xs tracking-widest">Sync Loop</h4>
                                <p className="text-orange-200/60 text-[10px] leading-relaxed font-medium">Maps SKU IDs to existing inventory to ensure brand consistency.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <Step number="1" title="XLSX Parsing Pipeline">
                            <p className="font-medium text-slate-700">The engine uses <strong>SheetJS</strong> to traverse workbooks. It ignores header rows and specifically looks for columns matching <code>/SKU|Code|ID/i</code> and <code>/Price|Value|Cost/i</code>.</p>
                            <WhyBox title="Architectural Example: Dirty Data Handling">
                                A typical ERP export might have a price like <code>"R 1,299.00*"</code>. Our engine applies a regex pipe: 
                                <code className="block mt-3 bg-blue-100 p-2 rounded text-blue-900 font-mono text-xs">str.replace(/[^\d.,]/g, '').replace(',', '.')</code>
                                This transforms the messy string into a clean float <code>1299.00</code>, which is then re-formatted to local retail standards (e.g. <code>R 1 299</code>).
                            </WhyBox>
                        </Step>

                        <Step number="2" title="Retail Rounding Heuristics">
                            <p className="font-medium text-slate-700">To maintain "Retail Psychology," the engine can be configured to apply <strong>Price Ending Logic</strong>. This ensures prices feel consistent across a brand's collection.</p>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Rounding Engine Visualization</h4>
                                <div className="flex items-center justify-between gap-4 max-w-sm mx-auto">
                                    <div className="flex flex-col items-center">
                                        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Input</div>
                                        <div className="text-2xl font-black text-slate-400 line-through">R {roundDemoValue}</div>
                                    </div>
                                    <ArrowRight size={32} className="text-orange-500 animate-pulse" />
                                    <div className="flex flex-col items-center">
                                        <div className="text-[10px] font-bold text-orange-500 mb-2 uppercase">Standardized</div>
                                        <div className="text-3xl font-black text-slate-900">R {Math.ceil(roundDemoValue/10)*10 - 1}</div>
                                        <div className="text-[9px] font-bold text-green-600 uppercase mt-1">.99 Rule Applied</div>
                                    </div>
                                </div>
                            </div>
                        </Step>

                        <Step number="3" title="PDF Generation & Distribution">
                            <p className="font-medium text-slate-700">When a user clicks "Export PDF" in the kiosk, the <strong>Manual Pricelist Engine</strong> kicks in. It doesn't just print the screen; it uses <strong>jsPDF</strong> to draw a pixel-perfect, vector-based document.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3 text-slate-900 font-black uppercase text-[10px] tracking-widest"><ClipboardCheck size={14} className="text-blue-600"/> Coordinate Mapping</div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Logos are drawn at exactly <code>(15, 15)</code> coordinates with aspect-ratio awareness to prevent stretching.</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3 text-slate-900 font-black uppercase text-[10px] tracking-widest"><Sparkles size={14} className="text-orange-600"/> Dynamic Grids</div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Alternating row colors are calculated on-the-fly to ensure high legibility on printed shop floor copies.</p>
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
