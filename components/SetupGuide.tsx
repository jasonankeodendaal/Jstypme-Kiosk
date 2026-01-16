
import React, { useState, useEffect } from 'react';
import { 
  X, Database, Settings, Smartphone, Tablet, Tv, Terminal, 
  Cpu, HardDrive, Layers, Zap, Shield, Activity, Network, 
  Lock, Binary, Table, RefreshCw, FileText, ArrowRight, 
  Sparkles, Download, Search, Maximize, Box, Bot, 
  SmartphoneNfc, Container, Split, DatabaseZap, Code2, 
  Wifi, Clock, CloudLightning, FileJson, CheckCircle2, 
  AlertTriangle, Play, Pause, ChevronRight, Calculator,
  Braces, ShieldCheck
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
                      { id: 'ai', label: 'AI Synthesis', icon: Bot, color: 'text-purple-400' },
                      { id: 'build', label: 'Asset Compiler', icon: Container, color: 'text-yellow-400' },
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
                                      The app uses a <strong>Cloud-Direct Write Strategy</strong>. Run the script below in the <strong>Supabase SQL Editor</strong> to initialize all required tables, policies, and storage buckets. This script is idempotent (safe to run multiple times).
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

-- 4. ENABLE RLS
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelist_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelists ENABLE ROW LEVEL SECURITY;

-- 5. IDEMPOTENT POLICIES (Permissive Public Access)
DO $$
DECLARE
    tbl text;
BEGIN
    -- Loop through all tables to create policies if they don't exist
    FOREACH tbl IN ARRAY ARRAY['store_config', 'kiosks', 'brands', 'categories', 'products', 'pricelist_brands', 'pricelists']
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = tbl AND policyname = 'Public Access ' || tbl
        ) THEN
            EXECUTE format('CREATE POLICY "Public Access %s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- 6. STORAGE BUCKET INITIALIZATION
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kiosk-media', 'kiosk-media', true) 
ON CONFLICT (id) DO NOTHING;

-- 7. STORAGE POLICIES (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Media Select') THEN
        CREATE POLICY "Public Media Select" ON storage.objects FOR SELECT USING (bucket_id = 'kiosk-media');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Media Insert') THEN
        CREATE POLICY "Public Media Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kiosk-media');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Media Update') THEN
        CREATE POLICY "Public Media Update" ON storage.objects FOR UPDATE USING (bucket_id = 'kiosk-media');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Media Delete') THEN
        CREATE POLICY "Public Media Delete" ON storage.objects FOR DELETE USING (bucket_id = 'kiosk-media');
    END IF;
END $$;

-- 8. DEFAULT DATA SEEDING
INSERT INTO public.store_config (id, data)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;`}
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
                          </div>
                      </div>
                  )}

                  {activeTab === 'apk' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={SmartphoneNfc} title="Native Compilation" subtitle="Android Capacitor Build" />
                          <div className="space-y-6">
                              <ArchitectNote title="Legacy Engine">
                                  The build pipeline targets <span className="text-white">Android 5.0 (Lollipop)</span> and Chrome 37 WebViews. We use Babel and Polyfills to ensure modern React 18+ runs on 2014-era hardware.
                              </ArchitectNote>
                              <CodeSnippet 
                                label="Terminal Command"
                                id="cmd-apk"
                                code="npm run build && npx cap sync android && npx cap open android"
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'ai' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Bot} title="AI Synthesis" subtitle="Gemini Data Generation" />
                          <div className="space-y-6">
                              <ArchitectNote title="Spec Generation">
                                  You can ask the AI to "Generate a JSON product list for Samsung TVs". The system will format the response to match the internal Kiosk Schema automatically.
                              </ArchitectNote>
                          </div>
                      </div>
                  )}

                  {activeTab === 'build' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Container} title="Asset Compiler" subtitle="Vite + Rollup Optimization" />
                          <div className="space-y-6">
                              <ArchitectNote title="Chunk Splitting">
                                  Large libraries like <code>jspdf</code> and <code>xlsx</code> are split into separate chunks. They are only loaded when the user opens the "Export" or "Pricelist" modules, keeping the initial boot instant.
                              </ArchitectNote>
                          </div>
                      </div>
                  )}

                  {activeTab === 'pricelists' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Table} title="Price Engine" subtitle="PDF Logic" />
                          <div className="space-y-6">
                              <ArchitectNote title="Client-Side PDF">
                                  PDFs are generated entirely on the tablet using <code>jspdf</code>. No server is required. The system auto-calculates column widths based on the data present (e.g. hiding "Promo Price" column if no items have promos).
                              </ArchitectNote>
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
