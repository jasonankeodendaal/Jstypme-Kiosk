
import React, { useState, useEffect } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, FileText, ArrowRight, Sparkles, ServerCrash, Share, Download, FastForward } from 'lucide-react';

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
            setRoundDemoValue(prev => prev === 799 ? 4449.99 : prev === 4449.99 ? 122 : 799);
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

  const WhyBox = ({ title = "Architectural Logic", children, variant = "blue" }: any) => {
    const colors = variant === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-900/80' : 'bg-blue-50 border-blue-500 text-blue-900/80';
    const iconColor = variant === 'orange' ? 'text-orange-800' : 'text-blue-800';
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-12 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-full pb-32">
              
              {/* PHASE 1: SUPABASE */}
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning the cloud backbone for global sync.">Supabase Infrastructure</SectionHeading>
                    <WhyBox title="Relational Integrity">
                        The system uses Supabase to bridge the gap between static APK deployments and dynamic retail environments. The `JSONB` format for `store_config` allows for schema flexibility without downtime.
                    </WhyBox>

                    <Step number="1" title="Database Schema Migration">
                        <p>Execute the following SQL in your Supabase Dashboard SQL Editor to create the core tables and enable Row Level Security.</p>
                        <CodeBlock 
                          id="sql-schema"
                          label="Core SQL Schema"
                          code={`-- 1. Create Config Table
CREATE TABLE IF NOT EXISTS public.store_config (
    id bigint primary key default 1,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Kiosks Table for Telemetry
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

-- 3. Enable RLS
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;

-- 4. Simple Public Policies (Adjust for enterprise production)
CREATE POLICY "Public Read Access" ON public.store_config FOR SELECT USING (true);
CREATE POLICY "Public Update Access" ON public.store_config FOR UPDATE USING (true);
CREATE POLICY "Public Kiosk Access" ON public.kiosks FOR ALL USING (true);`}
                        />
                    </Step>

                    <Step number="2" title="Storage Bucket Config">
                        <p>Create a public bucket named <code>kiosk-media</code> to host high-resolution product images and video loops.</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                            <li>Go to <strong>Storage</strong> &rarr; <strong>New Bucket</strong>.</li>
                            <li>Name: <code>kiosk-media</code></li>
                            <li>Public: <strong>ON</strong></li>
                        </ul>
                    </Step>
                </div>
              )}

              {/* PHASE 2: LOCAL DEV */}
              {activeTab === 'local' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Server} subtitle="Establishing the engineering workspace for local iteration.">PC Station Hub Configuration</SectionHeading>
                    
                    <Step number="1" title="Environment Variables">
                        <p>Create a <code>.env.local</code> file in the project root. This is required for Vite to communicate with your cloud backend.</p>
                        <CodeBlock 
                            id="env-vars"
                            label=".env.local Template"
                            code={`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key`}
                        />
                    </Step>

                    <Step number="2" title="Dependency Manifest">
                        <p>The kiosk utilizes several heavy libraries for PDF rendering and asset bundling. Run the following command to ensure a complete local environment.</p>
                        <CodeBlock 
                            id="npm-install"
                            label="Shell Command"
                            code={`npm install lucide-react @supabase/supabase-js jszip pdfjs-dist jspdf xlsx`}
                        />
                        <EngineerNote>
                            Ensure Node.js version is 18.x or higher to support the ESM modules used in the build process.
                        </EngineerNote>
                    </Step>
                </div>
              )}

              {/* PHASE 3: ASSET PIPELINE */}
              {activeTab === 'build' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Hammer} subtitle="Advanced Tree-Shaking and high-performance bundling logic.">Asset Pipeline</SectionHeading>
                    
                    <WhyBox title="Payload Optimization">
                        Because tablets often have limited RAM, we implement strict **Code Splitting**. This ensures the customer-facing UI doesn't load the heavy Admin logic until required.
                    </WhyBox>

                    <Step number="1" title="Vite Chunking Strategy">
                        <p>Our <code>vite.config.ts</code> uses Rollup manual chunks to isolate vendor code. This improves long-term caching behavior.</p>
                        <CodeBlock 
                            id="vite-config"
                            label="vite.config.ts Excerpt"
                            code={`output: {
  manualChunks(id) {
    if (id.includes('pdfjs-dist')) return 'pdf-core';
    if (id.includes('@supabase')) return 'cloud-client';
    if (id.includes('lucide-react')) return 'ui-icons';
  }
}`}
                        />
                    </Step>

                    <Step number="2" title="Build Command">
                        <p>Generate the production-ready static assets.</p>
                        <CodeBlock id="npm-build" label="Build Script" code={`npm run build`} />
                    </Step>
                </div>
              )}

              {/* PHASE 4: EDGE NETWORK */}
              {activeTab === 'vercel' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Globe} subtitle="Global asset distribution with zero-downtime atomic deployments.">Edge Network Infrastructure</SectionHeading>
                      
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                              <div className="flex flex-col items-center gap-4">
                                  <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                                      <Github size={40} className="text-white" />
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Source Control</div>
                              </div>
                              <div className="flex-1 h-1 bg-white/10 relative rounded-full hidden md:block">
                                  <div className="absolute inset-0 bg-blue-500 w-1/3 animate-[flow_2s_infinite_linear]"></div>
                              </div>
                              <div className="flex flex-col items-center gap-4">
                                  <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                                      <Cpu size={40} className="text-white" />
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Vite Build</div>
                              </div>
                              <div className="flex-1 h-1 bg-white/10 relative rounded-full hidden md:block">
                                  <div className="absolute inset-0 bg-purple-500 w-1/3 animate-[flow_2s_infinite_linear_1s]"></div>
                              </div>
                              <div className="flex flex-col items-center gap-4">
                                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                      <Globe2 size={40} className="text-slate-900" />
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Anycast CDN</div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-12">
                          <Step number="1" title="Atomic Deployment Logic">
                              <p className="font-medium text-slate-700 leading-relaxed">
                                  Vercel utilizes an <strong>Atomic Deployment</strong> strategy. Each time you push code, a new, immutable URL is generated. The live production traffic is only cut over to the new version once the build is 100% successful and health checks pass.
                              </p>
                              <ul className="space-y-4">
                                  <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <RefreshCw className="text-blue-500 shrink-0" size={20} />
                                      <div>
                                          <div className="text-sm font-black text-slate-900 uppercase">Instant Rollbacks</div>
                                          <div className="text-xs text-slate-500 font-medium">If a build introduces a bug on the tablets, you can revert to a previous deployment in the Vercel dashboard in <strong>&lt; 1 second</strong>.</div>
                                      </div>
                                  </li>
                                  <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <Zap className="text-yellow-500 shrink-0" size={20} />
                                      <div>
                                          <div className="text-sm font-black text-slate-900 uppercase">Anycast Routing</div>
                                          <div className="text-xs text-slate-500 font-medium">Assets (JS/CSS) are cached on Vercel's Edge Network in 100+ cities. A tablet in Cape Town pulls data from a local node, not a server in Europe.</div>
                                      </div>
                                  </li>
                              </ul>
                          </Step>

                          <Step number="2" title="Client-Side Routing Persistence">
                              <p className="font-medium text-slate-700">Because this is a **Single Page Application (SPA)**, standard server requests for paths like <code>/admin</code> would return 404 errors. We use a <code>vercel.json</code> rewrite to force all paths back to <code>index.html</code>.</p>
                              <CodeBlock 
                                id="vercel-json"
                                label="vercel.json Configuration"
                                code={`{
  "rewrites": [
    { "source": "/((?!.*\\\\.).*)", "destination": "/index.html" }
  ]
}`}
                              />
                          </Step>

                          <Step number="3" title="Advanced Service Worker Caching">
                              <WhyBox title="Local-First Architectural Guard" variant="blue">
                                  Our <code>sw.js</code> implements a **Stale-While-Revalidate** strategy for core logic and **Cache-First** for heavy media. This means the kiosk app is essentially "installed" on the browser's disk, requiring the internet only for new product data pulses.
                              </WhyBox>
                              <EngineerNote>
                                  Vercel automatically handles Brotli and Gzip compression. Our build process targets ES2022 to utilize modern browser features (Optional Chaining, Nullish Coalescing) which results in a smaller bundle size compared to transpiling down to ES5.
                              </EngineerNote>
                          </Step>
                      </div>
                  </div>
              )}

              {/* PHASE 5: PRICELIST ENGINE */}
              {activeTab === 'pricelists' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Table} subtitle="Automated normalization, fuzzy header mapping, and real-time distribution.">Pricelist Intelligence Engine</SectionHeading>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><FileSpreadsheet size={80} /></div>
                              <h3 className="text-orange-900 font-black uppercase text-xs tracking-widest mb-4">Input Stage</h3>
                              <p className="text-orange-800/80 text-sm leading-relaxed mb-4">The engine accepts raw <code>.xlsx</code> or <code>.csv</code> exports from any inventory system.</p>
                              <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-mono text-orange-600 bg-white/50 p-2 rounded">
                                      <span>Raw SKU:</span> <span className="font-bold">"  APL-ip15  "</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-mono text-orange-600 bg-white/50 p-2 rounded">
                                      <span>Raw Price:</span> <span className="font-bold">"$ 1,299.99"</span>
                                  </div>
                              </div>
                          </div>
                          <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-6 opacity-20"><RefreshCw size={80} className="animate-spin-slow" /></div>
                              <h3 className="text-white font-black uppercase text-xs tracking-widest mb-4">Normalization Stage</h3>
                              <p className="text-blue-100 text-sm leading-relaxed mb-4">Our sanitization algorithm strips symbols and applies whole-number ceiling rounding.</p>
                              <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-black/20 p-2 rounded">
                                      <span>Sanitized:</span> <span className="font-bold">"APL-IP15"</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-black/20 p-2 rounded">
                                      <span>Normalized:</span> <span className="font-bold">"R 1,300"</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-12">
                          <Step number="1" title="Spreadsheet Ingestion">
                              <p>The system uses the <code>xlsx</code> library to parse binary spreadsheet data directly in the browser. It maps columns based on common retail keywords like 'SKU', 'Retail', and 'Promo'.</p>
                          </Step>
                          <Step number="2" title="Price Normalization Logic">
                              <WhyBox title="Cognitive Pricing Optimization" variant="orange">
                                  To maintain a premium look, prices are rounded up to the nearest whole number. Additionally, if a price ends in '9', it is pushed to the next round number (e.g., 799 becomes 800) to prevent 'discount store' aesthetics.
                              </WhyBox>
                              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                  <div className="flex items-center gap-4 mb-4">
                                      <div className="text-[10px] font-mono text-slate-500 uppercase w-20">Current</div>
                                      <div className="text-lg font-mono text-red-400 line-through">R {roundDemoValue}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div className="text-[10px] font-mono text-slate-500 uppercase w-20">Logic</div>
                                      <div className="text-2xl font-mono text-green-400 font-black animate-pulse">
                                          R {(() => {
                                              let n = roundDemoValue;
                                              if (n % 1 !== 0) n = Math.ceil(n);
                                              if (Math.floor(n) % 10 === 9) n += 1;
                                              return n.toLocaleString();
                                          })()}
                                      </div>
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

// Fixed: Add default export to resolve "no default export" error in AdminDashboard.tsx
export default SetupGuide;
