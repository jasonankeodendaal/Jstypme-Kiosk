
import React, { useState } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, List, Table, FileSpreadsheet, Sparkles, Filter, Mouse, ArrowDownRight, MoveRight, Coins, FileText, Printer, Eye, MousePointer2 } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'build' | 'vercel' | 'supabase' | 'pricelists'>('supabase');
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
        @keyframes slide-right {
          0% { transform: translateX(-20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(20px); opacity: 0; }
        }
        .animate-data-flow {
          animation: slide-right 2s infinite linear;
        }
        @keyframes rotate-gear {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-gear {
          animation: rotate-gear 8s infinite linear;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-ui {
          animation: pulse-soft 3s infinite ease-in-out;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.5s ease-out forwards;
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white p-6 shadow-2xl shrink-0 flex items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-5">
           <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)]"><ShieldCheck size={32} className="text-white" /></div>
           <div>
             <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">System Engineering Manual</h1>
             <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">v2.8.4 Enterprise Infrastructure Protocol</p>
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
                    { id: 'pricelists', label: '5. Pricelist Engine', sub: 'Spreadsheet Logic', icon: Table, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-700' }
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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Viewing' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow Public Viewing" ON storage.objects FOR SELECT USING ( bucket_id = 'kiosk-media' );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Auth Uploads' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow Auth Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'kiosk-media' );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.store_config ( 
    id serial PRIMARY KEY,
    updated_at timestamp with time zone DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_config' AND column_name='data') THEN
        ALTER TABLE public.store_config ADD COLUMN data jsonb NOT NULL DEFAULT '{}'::jsonb;
    END IF;
END $$;

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

ALTER TABLE public.store_config REPLICA IDENTITY FULL;
ALTER TABLE public.kiosks REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.store_config;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Table store_config already exists';
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosks;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Table kiosks already exists';
    END;
END $$;`}
                            />
                        </Step>
                    </div>
                </div>
              )}

              {/* PHASE 5: PRICELISTS (ENHANCED) */}
              {activeTab === 'pricelists' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Table} subtitle="Architectural deep-dive into the Spreadsheet-to-JSON pipeline and native PDF document rendering.">Pricelist Data Engine</SectionHeading>
                      
                      <WhyBox title="Dual-Engine Rendering Strategy">
                          Kiosk Pro employs two distinct rendering engines for pricing documentation:
                          <ul className="mt-4 space-y-4">
                              <li className="flex gap-3">
                                  <List className="text-blue-600 shrink-0" size={20}/> 
                                  <div>
                                      <strong>The Manual Engine (SQL-Backed):</strong> 
                                      Converts raw Excel/CSV data into a persistent JSONB array. Ideal for dynamic pricing that requires instant fleet-wide updates and searchable SKUs.
                                  </div>
                              </li>
                              <li className="flex gap-3">
                                  <FileText className="text-red-600 shrink-0" size={20}/> 
                                  <div>
                                      <strong>The PDF Engine (CORS-Proxy):</strong> 
                                      Uses <code>pdfjs-dist</code> to render pixel-perfect manufacturer brochures. Best for high-fidelity marketing documents that must match print standards exactly.
                                  </div>
                              </li>
                          </ul>
                      </WhyBox>

                      {/* DATA PIPELINE ILLUSTRATION */}
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-12 relative overflow-hidden border border-white/5 shadow-2xl">
                          <div className="absolute top-0 right-0 p-8 opacity-5 text-white"><FileSpreadsheet size={160} /></div>
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 text-center">Data Ingestion Pipeline</h4>
                          
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                              <div className="flex flex-col items-center gap-3 w-32">
                                  <div className="w-20 h-20 bg-green-500/20 rounded-2xl border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                      <FileSpreadsheet className="text-green-400" size={32} />
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-wider">Excel / CSV</div>
                              </div>

                              <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 via-blue-500 to-purple-500/50 relative hidden md:block">
                                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-data-flow"></div>
                                  <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-data-flow" style={{animationDelay: '1.2s'}}></div>
                              </div>

                              <div className="flex flex-col items-center gap-3 w-40">
                                  <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center relative shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                      <Settings className="text-white animate-gear" size={40} />
                                      <Binary className="text-white/40 absolute bottom-2 right-2" size={16} />
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-wider">JSON Parser</div>
                              </div>

                              <div className="flex-1 h-px bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500/50 relative hidden md:block">
                                  <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-data-flow" style={{animationDelay: '0.8s'}}></div>
                              </div>

                              <div className="flex flex-col items-center gap-3 w-32">
                                  <div className="w-20 h-20 bg-purple-500/20 rounded-2xl border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                      <Database className="text-purple-400" size={32} />
                                  </div>
                                  <div className="text-[10px] font-black text-white uppercase tracking-wider">Storage</div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-12">
                          <Step number="1" title="The Manual Table Engine">
                              <div className="text-slate-600 space-y-4">
                                  <p className="font-medium">Uses a <strong>Buffered FileReader API</strong> to stream large CSV data directly into the application state without memory-locking the browser.</p>
                                  
                                  {/* UI SCHEMATIC */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 p-8 rounded-3xl border border-slate-200">
                                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 aspect-[4/3] flex flex-col relative">
                                          <div className="bg-slate-700 h-8 flex items-center px-3 gap-2 border-b border-slate-800">
                                              <div className="w-8 h-2 bg-white/20 rounded-full"></div>
                                              <div className="flex-1 h-2 bg-white/20 rounded-full"></div>
                                              <div className="w-10 h-2 bg-white/20 rounded-full"></div>
                                          </div>
                                          <div className="flex-1 p-3 space-y-3">
                                              {[1, 2, 3, 4, 5].map(i => (
                                                  <div key={i} className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                                      <div className="w-8 h-3 bg-slate-100 rounded"></div>
                                                      <div className="flex-1 h-3 bg-slate-50 rounded"></div>
                                                      <div className="w-12 h-3 bg-slate-100 rounded"></div>
                                                  </div>
                                              ))}
                                              <div className="flex items-center gap-3 border-b border-red-50 pb-2 bg-red-50/30 -mx-3 px-3 relative">
                                                  <div className="w-8 h-3 bg-slate-200 rounded"></div>
                                                  <div className="flex-1 h-3 bg-slate-200 rounded"></div>
                                                  <div className="w-12 h-4 bg-red-500 rounded animate-pulse-ui"></div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="space-y-4">
                                          <div className="flex gap-3">
                                              <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles className="text-amber-500" size={16}/></div>
                                              <div>
                                                  <div className="text-xs font-black uppercase text-slate-800">Offer Highlighting</div>
                                                  <p className="text-[10px] text-slate-500 leading-relaxed">Automatically triggers red-themed UI if <code>promoPrice</code> is detected.</p>
                                              </div>
                                          </div>
                                          <div className="flex gap-3">
                                              <div className="p-2 bg-white rounded-xl shadow-sm"><Filter className="text-blue-500" size={16}/></div>
                                              <div>
                                                  <div className="text-xs font-black uppercase text-slate-800">Elastic Filtering</div>
                                                  <p className="text-[10px] text-slate-500 leading-relaxed">Search logic matches fragments across SKU, Name, and Desc.</p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </Step>

                          <Step number="2" title="The High-Fidelity PDF Engine">
                              <div className="text-slate-600 space-y-6">
                                  <p className="font-medium">For PDF documents, the system employs <strong>Canvas-based Layer Rendering</strong>. This offloads the heavy lifting from the main thread to the browser's GPU.</p>
                                  
                                  {/* PDF VIEWER VISUALIZATION */}
                                  <div className="bg-slate-900 rounded-3xl p-8 relative border border-white/10 shadow-2xl group">
                                      <div className="flex justify-between items-center mb-6">
                                          <div className="flex items-center gap-3">
                                              <div className="p-2 bg-red-600 rounded-lg text-white"><FileText size={20}/></div>
                                              <div className="h-4 w-48 bg-white/10 rounded-full"></div>
                                          </div>
                                          <div className="flex gap-2">
                                              <div className="w-10 h-8 bg-white/10 rounded-lg"></div>
                                              <div className="w-10 h-8 bg-blue-600 rounded-lg"></div>
                                          </div>
                                      </div>
                                      
                                      <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
                                          <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="p-12 space-y-4 w-full">
                                                  <div className="h-8 w-3/4 bg-slate-100 rounded-lg"></div>
                                                  <div className="h-1.5 w-1/2 bg-blue-500 rounded-full"></div>
                                                  <div className="grid grid-cols-2 gap-4 mt-8">
                                                      <div className="h-32 bg-slate-50 rounded-xl border border-slate-100"></div>
                                                      <div className="h-32 bg-slate-50 rounded-xl border border-slate-100"></div>
                                                  </div>
                                                  <div className="h-4 w-full bg-slate-100 rounded-full"></div>
                                                  <div className="h-4 w-5/6 bg-slate-100 rounded-full"></div>
                                              </div>
                                          </div>
                                          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                               <div className="bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-100 translate-y-8 group-hover:translate-y-0 transition-transform">
                                                   <MousePointer2 className="text-blue-600" size={24} />
                                                   <div className="text-left">
                                                        <div className="text-[10px] font-black text-slate-900 uppercase">GPU Acceleration</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Canvas 2D Context</div>
                                                   </div>
                                               </div>
                                          </div>
                                      </div>
                                      
                                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                              <h5 className="text-[10px] font-black text-blue-400 uppercase mb-2">Multi-Threaded Decryption</h5>
                                              <p className="text-[10px] text-slate-400 leading-relaxed">The PDF Web Worker handles data parsing in isolation, ensuring that even a 50MB brochure won't stutter the kiosk UI during interaction.</p>
                                          </div>
                                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                              <h5 className="text-[10px] font-black text-blue-400 uppercase mb-2">Resolution Switching</h5>
                                              <p className="text-[10px] text-slate-400 leading-relaxed">Engine detects Device Pixel Ratio (DPR). On Retina tablets, it renders at 2x scale for crystal-clear text readability.</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </Step>

                          <Step number="3" title="Professional Output: Paper Transformation">
                              <div className="text-slate-600 space-y-6">
                                  <p className="font-medium">Kiosk Pro uses <strong>CSS Media Queries</strong> (<code>@media print</code>) to transform the screen-optimized UI into a professional print document without requiring the user to download files.</p>
                                  
                                  {/* PRINT SCHEMATIC */}
                                  <div className="flex flex-col md:flex-row items-center justify-center gap-12 bg-slate-50 p-10 rounded-[3rem] border border-slate-200">
                                      {/* Screen Version */}
                                      <div className="w-48 aspect-[3/4] bg-slate-900 rounded-2xl p-3 shadow-xl relative">
                                          <div className="text-[8px] font-black text-white mb-2">TABLET VIEW</div>
                                          <div className="bg-blue-600 h-2 w-full rounded-full mb-1"></div>
                                          <div className="bg-white/10 h-1 w-3/4 rounded-full mb-4"></div>
                                          <div className="space-y-2">
                                              {[1,2,3,4].map(i => <div key={i} className="h-6 bg-white/5 rounded"></div>)}
                                          </div>
                                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-blue-500 p-2 rounded-full text-white shadow-lg"><MoveRight size={20}/></div>
                                      </div>

                                      {/* Print Version */}
                                      <div className="w-48 aspect-[3/4] bg-white rounded shadow-2xl p-4 border border-slate-200 relative">
                                          <div className="flex justify-between items-start mb-4">
                                              <div className="bg-slate-900 h-6 w-16"></div>
                                              <div className="bg-slate-100 h-6 w-12"></div>
                                          </div>
                                          <div className="h-0.5 bg-slate-900 w-full mb-4"></div>
                                          <div className="space-y-2">
                                              {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 border border-slate-100 rounded-sm"></div>)}
                                          </div>
                                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded font-black text-[7px] uppercase tracking-widest px-2">Ready for A4</div>
                                      </div>
                                  </div>

                                  <EngineerNote>
                                      Print Logic: The <code>window.print()</code> trigger automatically isolates the <code>.viewer-container</code>, hides the navigation sidebar, and forces <code>overflow: visible</code> to ensure multi-page brochures print across successive sheets correctly.
                                  </EngineerNote>
                              </div>
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
                              <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                  <div className="bg-white p-2 rounded-xl shadow-sm"><Terminal size={18} className="text-slate-600"/></div>
                                  <div className="text-xs font-mono font-bold text-slate-500">Check version: <span className="text-blue-600">node -v</span></div>
                              </div>
                          </Step>
                          
                          <Step number="2" title="Cloning & Dependencies">
                              <p className="font-medium text-slate-700">Our system uses <strong>NPM (Node Package Manager)</strong> to fetch all required libraries (React, Tailwind, Supabase SDK, Lucide Icons).</p>
                              <CodeBlock id="npm-install" label="Run in Terminal" code={`npm install`} />
                              <EngineerNote>
                                  Security Alert: Never 'git push' your node_modules folder. It contains thousands of files that are specific to your PC's operating system.
                              </EngineerNote>
                          </Step>

                          <Step number="3" title="Environment Variables (.env)">
                              <p className="font-medium text-slate-700">This is how your local code talks to your specific Supabase Cloud project. Create a file named <code>.env</code> in the root folder.</p>
                              <WhyBox title="Why the 'VITE_' prefix?">
                                  By default, Vite does not expose environment variables to your browser code for security reasons. Only variables starting with <strong>VITE_</strong> are injected into the client-side bundle. This prevents accidental leakage of sensitive database passwords.
                              </WhyBox>
                              <CodeBlock 
                                id="env-example" 
                                label=".env Configuration (Paste Keys from Supabase Settings)" 
                                code={`VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-long-anon-public-key-here`} 
                              />
                          </Step>
                      </div>
                  </div>
              )}

              {activeTab === 'build' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Hammer} subtitle="Advanced Tree-Shaking, AST Traversal, and Minification Algorithms.">Asset Pipeline & Optimization</SectionHeading>
                      
                      <WhyBox title="Deep Analysis: Tree-Shaking Architecture">
                          Tree-shaking isn't just "deleting unused code." It is a sophisticated <strong>Static Analysis</strong> process performed by the Rollup engine.
                          <ul className="mt-4 space-y-4">
                              <li className="flex gap-3">
                                  <Binary className="text-purple-600 shrink-0" size={20}/> 
                                  <div>
                                      <strong>Abstract Syntax Tree (AST) Traversal:</strong> 
                                      The compiler builds a map of every function call. If a module is imported but no path in the AST leads to its execution, the entire branch is pruned before the final binary is generated.
                                  </div>
                              </li>
                              <li className="flex gap-3">
                                  <Layers className="text-purple-600 shrink-0" size={20}/> 
                                  <div>
                                      <strong>Lexical Scope Hoisting:</strong> 
                                      Vite moves all constant declarations to the highest possible scope. This allows the minifier to see if a variable is "effectively constant," enabling <strong>Constant Folding</strong>—where a calculation like <code>2 + 2</code> is replaced by <code>4</code> in the final code to save CPU cycles on the tablet.
                                  </div>
                              </li>
                              <li className="flex gap-3">
                                  <ZapOff className="text-purple-600 shrink-0" size={20}/> 
                                  <div>
                                      <strong>Dead Code Elimination (DCE):</strong> 
                                      This prunes entire blocks wrapped in <code>if (false)</code>. Because our build process defines <code>process.env.NODE_ENV</code> as <code>'production'</code>, all development-only logs and debuggers are physically removed from the kiosk's memory.
                                  </div>
                              </li>
                          </ul>
                      </WhyBox>

                      <div className="space-y-8">
                          <Step number="1" title="Minification & Obfuscation">
                              <p className="font-medium text-slate-700">The <strong>Esbuild</strong> minifier performs identifier mangling. A function named <code>calculateInventoryDiscount()</code> is renamed to <code>a()</code>. This reduces the transfer size by up to 80% while simultaneously providing a layer of source code protection.</p>
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Optimization Payload</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                          <div className="text-xs font-bold text-slate-800">Brotli Compression</div>
                                          <div className="text-[10px] text-slate-500 font-medium">Advanced dictionary-based algorithm for text assets.</div>
                                      </div>
                                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                          <div className="text-xs font-bold text-slate-800">Chunk Splitting</div>
                                          <div className="text-[10px] text-slate-500 font-medium">Isolates PDF.js so it only loads when a manual is opened.</div>
                                      </div>
                                  </div>
                              </div>
                              <CodeBlock id="npm-build" label="Execute Production Build" code={`npm run build`} />
                          </Step>

                          <Step number="2" title="Source Map Security">
                              <p className="font-medium text-slate-700">By default, Kiosk Pro <strong>disables</strong> source maps in production. This ensures that a curious user cannot use the browser's developer tools to reconstruct your original TypeScript logic from the minified bundles.</p>
                          </Step>
                      </div>
                  </div>
              )}

              {activeTab === 'vercel' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Globe} subtitle="Anycast Networking, BGP Routing, and Layer 7 Global Content Delivery.">Edge Network Infrastructure</SectionHeading>
                      
                      <WhyBox title="Global CDN Mechanics">
                          Deploying to Vercel isn't just "hosting." It places your app on a <strong>Global Anycast Network</strong>.
                          <ul className="mt-4 space-y-4">
                              <li className="flex gap-3">
                                  <Globe2 className="text-slate-900 shrink-0" size={20}/> 
                                  <div>
                                      <strong>Anycast IP Routing:</strong> 
                                      Every Kiosk tablet connects to the same IP address, but the internet's <strong>BGP (Border Gateway Protocol)</strong> routes that request to the PoP (Point of Presence) physically closest to the store. If a shop in New York accesses the kiosk, they hit the 'iad1' data center; a shop in London hits 'lhr1'.
                                  </div>
                              </li>
                              <li className="flex gap-3">
                                  <Wind className="text-slate-900 shrink-0" size={20}/> 
                                  <div>
                                      <strong>Edge Caching (HTTP 304):</strong> 
                                      We use <code>Cache-Control: stale-while-revalidate</code>. The edge network serves the cached version to the kiosk <strong>instantly</strong>, then silently fetches the update in the background. This results in "Zero Second" perceived load times.
                                  </div>
                              </li>
                              <li className="flex gap-3">
                                  <ShieldAlert className="text-slate-900 shrink-0" size={20}/> 
                                  <div>
                                      <strong>Layer 7 WAF Protection:</strong> 
                                      The Edge network analyzes incoming traffic for SQL injection and DDoS patterns. Malicious requests are terminated at the Edge, never even reaching your application code.
                                  </div>
                              </li>
                          </ul>
                      </WhyBox>

                      <div className="space-y-8">
                          <Step number="1" title="Atomic Immutability">
                              <p className="font-medium text-slate-700 leading-relaxed">Every deployment generates a unique ID. If you push a broken update, the system maintains <strong>Instant Rollback</strong> capability. You can revert the entire fleet to a known-stable version in under 2 seconds without a single byte of code being re-downloaded by the tablets.</p>
                              <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative border border-white/5">
                                  <div className="absolute top-0 right-0 p-4 opacity-10"><Workflow size={60} /></div>
                                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Network Health Check</div>
                                  <div className="flex items-center gap-2 text-xs font-mono">
                                      <span className="text-green-400 font-black">[PASS]</span> SSL Termination @ Edge
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-mono mt-1">
                                      <span className="text-green-400 font-black">[PASS]</span> HTTP/3 QUIC Protocol Enabled
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-mono mt-1">
                                      <span className="text-green-400 font-black">[PASS]</span> Gzip/Brotli Auto-Negotiation
                                  </div>
                              </div>
                          </Step>

                          <Step number="2" title="Cold vs. Hot Starts">
                              <p className="font-medium text-slate-700">Since the kiosk is a SPA (Single Page Application), it benefit from 100% "Static" performance. There are no server-side databases to "wake up" when a customer touches the screen; the entire UI logic resides in the tablet's browser cache, managed by our <strong>Service Worker (sw.js)</strong>.</p>
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
