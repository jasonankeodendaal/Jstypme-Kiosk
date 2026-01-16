
import React, { useState, useEffect } from 'react';
import { 
  X, Database, Settings, Smartphone, Tablet, Tv, Terminal, 
  Cpu, HardDrive, Layers, Zap, Shield, Activity, Network, 
  Lock, Binary, Table, RefreshCw, FileText, ArrowRight, 
  Sparkles, Download, Search, Maximize, Box, Bot, 
  SmartphoneNfc, Container, Split, DatabaseZap, Code2, 
  Wifi, Clock, CloudLightning, FileJson, CheckCircle2, 
  AlertTriangle, Play, Pause, ChevronRight, Calculator,
  Braces, ShieldCheck, FileDigit
} from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'apk' | 'ai' | 'pricelists' | 'build' | 'migration'>('migration');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  // --- VISUAL DIAGRAM COMPONENTS ---

  const DiagramCloudSync = () => (
    <div className="relative h-48 bg-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden mb-8 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_8s_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg flex items-center justify-between px-8 z-10">
            {/* Database Node */}
            <div className="flex flex-col items-center gap-3 relative group">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:shadow-blue-500/50 transition-all">
                    <Database className="text-blue-400" size={32} />
                </div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20">PostgreSQL</div>
                {/* RLS Shield */}
                <div className="absolute -top-3 -right-3 bg-slate-900 p-1.5 rounded-full border border-green-500/30 animate-bounce">
                    <Shield className="text-green-400 w-4 h-4" />
                </div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 h-0.5 bg-slate-700 relative mx-4">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] animate-[travel_2s_infinite_linear]"></div>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)] animate-[travel_2s_infinite_linear_0.5s]"></div>
            </div>

            {/* Edge Node */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center">
                    <Network className="text-slate-400" size={24} />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Edge API</div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 h-0.5 bg-slate-700 relative mx-4">
                 <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] animate-[travel_2s_infinite_linear_1s]"></div>
            </div>

            {/* Local Node */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-green-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Tablet className="text-green-400" size={32} />
                </div>
                <div className="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-900/20 px-2 py-1 rounded border border-green-500/20">Local DB</div>
            </div>
        </div>
        <style>{`
            @keyframes travel { 0% { left: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
    </div>
  );

  const DiagramNormalization = () => (
    <div className="relative h-64 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden mb-8 flex items-center justify-center p-8">
        <div className="flex items-center gap-8 md:gap-16 w-full max-w-2xl relative">
            {/* Monolith */}
            <div className="flex-1 aspect-video bg-red-900/20 border-2 border-red-500/30 rounded-2xl flex flex-col items-center justify-center relative animate-pulse">
                <FileJson className="text-red-400 mb-2" size={40} />
                <span className="text-red-400 text-xs font-black uppercase tracking-widest">Monolith Blob</span>
                <span className="text-[9px] text-red-500/70 font-mono mt-1">50MB Payload</span>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                    <ArrowRight className="text-slate-600" size={24} />
                </div>
            </div>

            {/* Process */}
            <div className="shrink-0 flex flex-col items-center text-slate-500">
                <Split size={32} className="animate-spin-slow duration-[10s]" />
            </div>

            {/* Normalized */}
            <div className="flex-1 grid grid-cols-1 gap-3">
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3 transform hover:translate-x-2 transition-transform cursor-crosshair">
                    <Database size={16} className="text-blue-400" />
                    <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-blue-500"></div></div>
                    <span className="text-[9px] font-black text-blue-400 uppercase">Brands</span>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl flex items-center gap-3 transform hover:translate-x-2 transition-transform cursor-crosshair ml-4">
                    <Layers size={16} className="text-purple-400" />
                    <div className="h-1 w-full bg-purple-500/20 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-purple-500"></div></div>
                    <span className="text-[9px] font-black text-purple-400 uppercase">Products</span>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-xl flex items-center gap-3 transform hover:translate-x-2 transition-transform cursor-crosshair ml-8">
                    <Box size={16} className="text-green-400" />
                    <div className="h-1 w-full bg-green-500/20 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-green-500"></div></div>
                    <span className="text-[9px] font-black text-green-400 uppercase">Stock</span>
                </div>
            </div>
        </div>
    </div>
  );

  const DiagramBuildPipeline = () => (
      <div className="relative h-48 bg-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden mb-8 flex items-center justify-center p-8 gap-6">
          <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#F7DF1E]/10 border border-[#F7DF1E] rounded-xl flex items-center justify-center mb-2"><Code2 className="text-[#F7DF1E]" size={28}/></div>
              <span className="text-[10px] font-black text-[#F7DF1E] uppercase">ES6+ Source</span>
          </div>
          <ArrowRight className="text-slate-600" />
          <div className="flex flex-col items-center relative">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] z-10"><Zap className="text-white" size={32}/></div>
              <div className="absolute -bottom-6 text-[10px] font-black text-blue-400 uppercase">Vite Legacy</div>
          </div>
          <ArrowRight className="text-slate-600" />
          <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500 rounded-xl flex items-center justify-center mb-2"><Smartphone className="text-green-500" size={28}/></div>
              <span className="text-[10px] font-black text-green-500 uppercase">Android 5.0+</span>
          </div>
      </div>
  );

  // --- CONTENT HELPERS ---

  const ArchitectNote = ({ title, children }: { title: string, children?: React.ReactNode }) => (
      <div className="my-6 p-6 bg-yellow-950/30 border-l-4 border-yellow-600 rounded-r-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-yellow-500"><CloudLightning size={40} /></div>
          <div className="flex items-center gap-2 text-yellow-500 font-black uppercase text-[10px] tracking-widest mb-2">
              <Cpu size={14} /> Architect's Note: {title}
          </div>
          <div className="text-yellow-100/80 text-sm font-medium leading-relaxed font-sans">{children}</div>
      </div>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
      <div className="mb-12">
          <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-blue-400">
                  <Icon size={32} />
              </div>
              <div>
                  <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">{title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="h-0.5 w-8 bg-blue-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</span>
                  </div>
              </div>
          </div>
      </div>
  );

  const CodeSnippet = ({ code, label, id }: any) => (
      <div className="my-6 group relative">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-t-xl px-4 py-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Terminal size={12}/> {label}</span>
              <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              </div>
          </div>
          <div className="bg-slate-900 border-x border-b border-slate-800 rounded-b-xl p-6 overflow-x-auto relative">
              <code className="font-mono text-xs text-blue-300 whitespace-pre leading-relaxed">{code}</code>
              <button 
                onClick={() => copyToClipboard(code, id)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                  {copiedStep === id ? <CheckCircle2 size={16} className="text-green-400"/> : <FilesIcon size={16} />}
              </button>
          </div>
      </div>
  );

  // --- ICONS FOR CODE SNIPPET BUTTON ---
  const FilesIcon = ({ size }: { size: number }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-200 font-sans flex flex-col animate-fade-in overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-50 shadow-2xl relative">
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
              <div className="bg-blue-600 p-2 rounded-lg rotate-3 shadow-lg shadow-blue-500/20"><ShieldCheck size={20} className="text-white" /></div>
              <div>
                  <div className="text-base font-black uppercase tracking-tight text-white leading-none">System <span className="text-blue-500">Blueprint</span></div>
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Firmware v3.0 // Engineering Manual</div>
              </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"><X size={24} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col p-4 overflow-y-auto shrink-0">
              <div className="space-y-1">
                  {[
                      { id: 'migration', label: 'Migration Scripts', icon: DatabaseZap, color: 'text-orange-400' },
                      { id: 'supabase', label: 'Cloud Infrastructure', icon: Database, color: 'text-blue-400' },
                      { id: 'apk', label: 'Native Build', icon: SmartphoneNfc, color: 'text-green-400' },
                      { id: 'ai', label: 'Algorithmic Logic', icon: Bot, color: 'text-purple-400' },
                      { id: 'build', label: 'Legacy Compiler', icon: Container, color: 'text-yellow-400' },
                      { id: 'pricelists', label: 'Price Engine', icon: Table, color: 'text-red-400' },
                  ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-300 border border-transparent ${activeTab === tab.id ? 'bg-slate-800 border-slate-700 shadow-xl' : 'hover:bg-slate-800/50'}`}
                      >
                          <div className={`p-2 rounded-lg bg-slate-950 ${activeTab === tab.id ? 'shadow-inner' : ''}`}>
                              <tab.icon size={18} className={tab.color} />
                          </div>
                          <div className="text-left">
                              <div className={`text-xs font-black uppercase tracking-wide ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}>{tab.label}</div>
                              <div className="text-[9px] font-mono text-slate-600 uppercase">Module 0{['migration','supabase','apk','ai','build','pricelists'].indexOf(tab.id) + 1}</div>
                          </div>
                      </button>
                  ))}
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-800">
                  <div className="bg-gradient-to-br from-slate-900 to-black p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-3 mb-2">
                          <Activity size={16} className="text-green-500 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Core</span><span className="text-green-400">Online</span></div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Sync</span><span className="text-blue-400">Direct</span></div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Ver</span><span className="text-slate-300">3.1.0</span></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
              <div className="max-w-4xl mx-auto pb-20">
                  
                  {activeTab === 'migration' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={DatabaseZap} title="Database Migration" subtitle="SQL Initialization Protocol" />
                          <DiagramNormalization />
                          
                          <div className="mt-12 space-y-8">
                              <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
                                  <h4 className="text-red-400 font-black uppercase text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Critical Action Required</h4>
                                  <p className="text-slate-300 font-medium text-xs leading-relaxed">
                                      The app uses a <strong>Cloud-Direct Write Strategy</strong>. If you encounter 404 errors when saving, it means your Supabase project is missing the required relational tables. Run the script below in the <strong>Supabase SQL Editor</strong>.
                                  </p>
                              </div>

                              <CodeSnippet 
                                label="Full Schema Migration SQL"
                                id="mig-sql-full"
                                code={`-- 1. BASE TABLES (Config & Fleet)
CREATE TABLE IF NOT EXISTS public.store_config (
  id bigint primary key default 1,
  data jsonb not null default '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.kiosks (
  id text primary key,
  name text not null,
  device_type text,
  assigned_zone text,
  status text default 'online',
  last_seen timestamptz default now(),
  wifi_strength int,
  ip_address text,
  version text,
  location_description text,
  notes text,
  restart_requested boolean default false,
  show_pricelists boolean default true
);

-- 2. RELATIONAL INVENTORY
CREATE TABLE IF NOT EXISTS public.brands (
  id text primary key,
  name text,
  logo_url text,
  theme_color text,
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id text primary key,
  brand_id text references public.brands(id),
  name text,
  icon text,
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text primary key,
  category_id text references public.categories(id),
  name text,
  sku text,
  description text,
  image_url text,
  gallery_urls jsonb default '[]'::jsonb,
  video_urls jsonb default '[]'::jsonb,
  specs jsonb default '{}'::jsonb,
  features jsonb default '[]'::jsonb,
  box_contents jsonb default '[]'::jsonb,
  manuals jsonb default '[]'::jsonb,
  terms text,
  dimensions jsonb default '[]'::jsonb,
  date_added timestamptz,
  updated_at timestamptz default now()
);

-- 3. PRICELISTS
CREATE TABLE IF NOT EXISTS public.pricelist_brands (
  id text primary key,
  name text,
  logo_url text,
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.pricelists (
  id text primary key,
  brand_id text, 
  title text,
  month text,
  year text,
  url text,
  thumbnail_url text,
  type text,
  kind text,
  start_date text,
  end_date text,
  promo_text text,
  items jsonb default '[]'::jsonb,
  headers jsonb default '{}'::jsonb,
  date_added timestamptz,
  updated_at timestamptz default now()
);

-- 4. SECURITY & STORAGE POLICIES
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelist_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelists ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (Standard for Single-Project Kiosk)
DROP POLICY IF EXISTS "Public Config" ON public.store_config;
CREATE POLICY "Public Config" ON public.store_config FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Kiosks" ON public.kiosks;
CREATE POLICY "Public Kiosks" ON public.kiosks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Brands" ON public.brands;
CREATE POLICY "Public Brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Categories" ON public.categories;
CREATE POLICY "Public Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Products" ON public.products;
CREATE POLICY "Public Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public PL Brands" ON public.pricelist_brands;
CREATE POLICY "Public PL Brands" ON public.pricelist_brands FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Pricelists" ON public.pricelists;
CREATE POLICY "Public Pricelists" ON public.pricelists FOR ALL USING (true) WITH CHECK (true);

-- Storage Bucket Initialization
INSERT INTO storage.buckets (id, name, public) VALUES ('kiosk-media', 'kiosk-media', true) ON CONFLICT DO NOTHING;
DROP POLICY IF EXISTS "Public Media Access" ON storage.objects;
CREATE POLICY "Public Media Access" ON storage.objects FOR ALL USING ( bucket_id = 'kiosk-media' );
DROP POLICY IF EXISTS "Public Media Upload" ON storage.objects;
CREATE POLICY "Public Media Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'kiosk-media' );`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'supabase' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Database} title="Cloud Core" subtitle="PostgreSQL Orchestration Layer" />
                          <DiagramCloudSync />
                          <div className="space-y-6">
                              <ArchitectNote title="Snapshot Strategy">
                                  We use a "Snapshot-First" architecture. Devices pull a massive JSON blob into local IndexedDB. This ensures <span className="text-white">Zero Latency</span> UI interactions, as the tablet never waits for a network request to render a product page.
                              </ArchitectNote>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                      <h4 className="text-blue-400 font-bold uppercase text-xs mb-2">Relational Sync</h4>
                                      <p className="text-sm text-slate-400 leading-relaxed">Changes in the admin panel are written to 5 separate normalized tables (`brands`, `categories`, etc.) simultaneously. The Kiosk reassembles this into a single cohesive state object on load.</p>
                                  </div>
                                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                      <h4 className="text-green-400 font-bold uppercase text-xs mb-2">Realtime Channel</h4>
                                      <p className="text-sm text-slate-400 leading-relaxed">Devices subscribe to the `public:store_config` channel. When any row changes, the cloud pushes a signal to all 50+ tablets to re-fetch the latest snapshot instantly.</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'apk' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={SmartphoneNfc} title="Android Native Bridge" subtitle="Capacitor v6 Integration" />
                          <div className="space-y-8">
                              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden">
                                  <div className="relative z-10 flex items-start gap-4">
                                      <div className="p-3 bg-green-500/20 rounded-xl text-green-400 border border-green-500/30"><Container size={24} /></div>
                                      <div>
                                          <h4 className="text-white font-bold uppercase text-sm mb-2">WebView Container</h4>
                                          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                                              The app runs inside a native Android WebView. Capacitor acts as the bridge, injecting the `window.Capacitor` object to allow JavaScript to communicate with native hardware (Filesystem, Status Bar, etc.).
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <h4 className="text-slate-500 font-black uppercase text-xs tracking-widest mb-4">Compilation Sequence</h4>
                                      <ol className="space-y-4 relative border-l-2 border-slate-800 ml-3 pl-6">
                                          <li className="relative">
                                              <span className="absolute -left-[31px] top-0 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-900">1</span>
                                              <div className="font-bold text-white text-sm">Build Web Assets</div>
                                              <div className="text-xs text-slate-500 mt-1">Compiles React to `dist/` folder.</div>
                                          </li>
                                          <li className="relative">
                                              <span className="absolute -left-[31px] top-0 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-900">2</span>
                                              <div className="font-bold text-white text-sm">Sync Native Layer</div>
                                              <div className="text-xs text-slate-500 mt-1">Copies `dist/` into Android project `assets`.</div>
                                          </li>
                                          <li className="relative">
                                              <span className="absolute -left-[31px] top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-900 shadow-lg shadow-blue-500/50">3</span>
                                              <div className="font-bold text-blue-400 text-sm">Compile APK</div>
                                              <div className="text-xs text-slate-500 mt-1">Gradle builds the final binary.</div>
                                          </li>
                                      </ol>
                                  </div>
                                  <div>
                                      <CodeSnippet 
                                          label="Build Command Chain"
                                          id="apk-cmd"
                                          code={`# 1. Clean & Build Web
npm run build

# 2. Update Android Project
npx cap sync android

# 3. Open Android Studio
npx cap open android`}
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'ai' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Bot} title="Algorithmic Intelligence" subtitle="Smart Shuffle & Heuristics" />
                          <div className="grid grid-cols-1 gap-8">
                              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-6 opacity-5"><Cpu size={120}/></div>
                                  <h3 className="text-purple-400 font-black uppercase text-sm tracking-widest mb-4">Screensaver Logic</h3>
                                  <div className="flex flex-col gap-4">
                                      <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400"><Sparkles size={24}/></div>
                                          <div>
                                              <div className="text-white font-bold text-sm">Newness Bias</div>
                                              <div className="text-slate-500 text-xs">Products added in the last 30 days are given a <strong>3x weight</strong> in the shuffle algorithm, ensuring fresh stock is seen more often.</div>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><Activity size={24}/></div>
                                          <div>
                                              <div className="text-white font-bold text-sm">Sleep Heuristic</div>
                                              <div className="text-slate-500 text-xs">The system checks <code>activeHours</code> every minute. If outside business hours, it overrides the video loop with a generic black screen to prevent panel burn-in.</div>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                                  <h3 className="text-indigo-400 font-black uppercase text-sm tracking-widest mb-4">TV Mode Interleaving</h3>
                                  <p className="text-slate-400 text-sm mb-4">
                                      To keep the TV experience engaging, we use a <strong>Fixed-Ratio Injection</strong> algorithm for the playlist generation.
                                  </p>
                                  <div className="flex items-center gap-2 overflow-x-auto pb-4">
                                      <div className="shrink-0 w-24 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-white border-b-4 border-blue-500">Video A</div>
                                      <ArrowRight size={16} className="text-slate-600"/>
                                      <div className="shrink-0 w-24 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-white border-b-4 border-blue-500">Video B</div>
                                      <ArrowRight size={16} className="text-slate-600"/>
                                      <div className="shrink-0 w-24 h-16 bg-indigo-900/50 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-400 border-2 border-indigo-500 border-dashed">Ad / Promo</div>
                                      <ArrowRight size={16} className="text-slate-600"/>
                                      <div className="shrink-0 w-24 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-white border-b-4 border-blue-500">Video C</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'build' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Container} title="Legacy Compiler" subtitle="Vite + Terser Configuration" />
                          <DiagramBuildPipeline />
                          
                          <div className="space-y-6">
                              <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl">
                                  <h4 className="text-yellow-400 font-black uppercase text-xs mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Why Legacy Mode?</h4>
                                  <p className="text-slate-300 font-medium text-xs leading-relaxed">
                                      Many industrial Android tablets run <strong>Android 5.1 (Lollipop)</strong> which uses Chrome 37 WebView. This browser version predates ES6 classes, arrow functions, and the Fetch API. We must transpile heavily.
                                  </p>
                              </div>

                              <CodeSnippet 
                                  label="vite.config.ts"
                                  id="vite-config"
                                  code={`import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      // Target ancient browsers specifically
      targets: ['chrome >= 37', 'android >= 5'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      modernPolyfills: true
    })
  ],
  build: {
    target: 'es5', // Force ES5 output
    minify: 'terser', // Esbuild often misses obscure ES5 edge cases
    terserOptions: {
      ecma: 5,
      safari10: true
    }
  }
});`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'pricelists' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Table} title="Dynamic PDF Engine" subtitle="Client-Side Vector Generation" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                  <h4 className="text-red-400 font-black uppercase text-xs mb-3 flex items-center gap-2"><FileText size={14}/> Layout Engine</h4>
                                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                      We do not use HTML-to-Canvas (which is blurry). We use <strong>jsPDF</strong> to draw vector text and lines. The engine calculates X/Y coordinates dynamically based on active columns.
                                  </p>
                                  <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                          <div className="w-12 text-right">SKU</div>
                                          <div className="flex-1 h-2 bg-slate-800 rounded relative"><div className="absolute left-0 w-[20%] h-full bg-blue-500/50"></div></div>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                          <div className="w-12 text-right">DESC</div>
                                          <div className="flex-1 h-2 bg-slate-800 rounded relative"><div className="absolute left-[20%] w-[60%] h-full bg-green-500/50"></div></div>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                          <div className="w-12 text-right">PRICE</div>
                                          <div className="flex-1 h-2 bg-slate-800 rounded relative"><div className="absolute right-0 w-[20%] h-full bg-red-500/50"></div></div>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                  <h4 className="text-blue-400 font-black uppercase text-xs mb-3 flex items-center gap-2"><Calculator size={14}/> Auto-Rounding</h4>
                                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                      To maintain a premium aesthetic, raw inputs like "199.99" are automatically sanitized during data entry.
                                  </p>
                                  <ul className="space-y-2">
                                      <li className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono text-slate-300">
                                          <span>129.99</span> <ArrowRight size={12} className="text-slate-600"/> <span className="text-green-400 font-bold">130</span>
                                      </li>
                                      <li className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono text-slate-300">
                                          <span>112.00</span> <ArrowRight size={12} className="text-slate-600"/> <span className="text-blue-400 font-bold">112</span>
                                      </li>
                                      <li className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono text-slate-300">
                                          <span>799.00</span> <ArrowRight size={12} className="text-slate-600"/> <span className="text-green-400 font-bold">800</span>
                                      </li>
                                  </ul>
                              </div>
                          </div>

                          <CodeSnippet 
                              label="PDF Column Logic (Abstract)"
                              id="pdf-logic"
                              code={`// Dynamic Width Calculation
const availableWidth = pageWidth - margin * 2;
let skuWidth = 0;
let descWidth = 0;

if (hasDescription) {
    skuWidth = hasSku ? 25 : 0;
    descWidth = availableWidth - skuWidth - priceWidth;
} else {
    // If no description, SKU takes available space
    skuWidth = availableWidth - priceWidth;
}

// Draw Loop
doc.text(item.sku, margin, y);
doc.text(item.description, margin + skuWidth, y);`}
                          />
                      </div>
                  )}

              </div>
          </div>
      </div>
    </div>
  );
};

export default SetupGuide;
