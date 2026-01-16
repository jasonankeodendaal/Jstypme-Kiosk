
import React, { useState } from 'react';
import { 
  X, Database, Settings, Smartphone, Tablet, Tv, Terminal, 
  Cpu, HardDrive, Layers, Zap, Shield, Activity, Network, 
  Lock, Binary, Table, RefreshCw, FileText, ArrowRight, 
  Sparkles, Download, Search, Maximize, Box, Bot, 
  SmartphoneNfc, Container, Split, DatabaseZap, Code2, 
  Wifi, Clock, CloudLightning, FileJson, CheckCircle2, 
  AlertTriangle, Play, Pause, ChevronRight, Calculator,
  Braces, ShieldCheck, FileCode, Package, LayoutTemplate, Printer, Share2
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
                <div className="absolute -top-3 -right-3 bg-slate-900 p-1.5 rounded-full border border-green-500/30 animate-bounce">
                    <Shield className="text-green-400 w-4 h-4" />
                </div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 h-0.5 bg-slate-700 relative mx-4">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] animate-[travel_2s_infinite_linear]"></div>
            </div>

            {/* Edge Node */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center">
                    <Network className="text-slate-400" size={24} />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Snapshot</div>
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
                <div className="text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-900/20 px-2 py-1 rounded border border-green-500/20">IndexedDB</div>
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
            <div className="flex-1 aspect-video bg-red-900/20 border-2 border-red-500/30 rounded-2xl flex flex-col items-center justify-center relative animate-pulse">
                <FileJson className="text-red-400 mb-2" size={40} />
                <span className="text-red-400 text-xs font-black uppercase tracking-widest">Monolith Blob</span>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2"><ArrowRight className="text-slate-600" size={24} /></div>
            </div>
            <div className="shrink-0 flex flex-col items-center text-slate-500"><Split size={32} className="animate-spin-slow duration-[10s]" /></div>
            <div className="flex-1 grid grid-cols-1 gap-3">
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3"><Database size={16} className="text-blue-400" /><div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-blue-500"></div></div><span className="text-[9px] font-black text-blue-400 uppercase">Brands</span></div>
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl flex items-center gap-3 ml-4"><Layers size={16} className="text-purple-400" /><div className="h-1 w-full bg-purple-500/20 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-purple-500"></div></div><span className="text-[9px] font-black text-purple-400 uppercase">Products</span></div>
                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-xl flex items-center gap-3 ml-8"><Box size={16} className="text-green-400" /><div className="h-1 w-full bg-green-500/20 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-green-500"></div></div><span className="text-[9px] font-black text-green-400 uppercase">Config</span></div>
            </div>
        </div>
    </div>
  );

  const DiagramBuildFlow = () => (
      <div className="relative h-48 bg-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden mb-8 flex items-center justify-center">
          <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2 opacity-50"><FileCode size={32} className="text-blue-400" /><span className="text-[9px] font-mono text-slate-500">Src</span></div>
              <ArrowRight size={20} className="text-slate-600" />
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center relative"><Zap size={32} className="text-yellow-400" /><div className="absolute -bottom-6 text-[9px] font-black text-yellow-500 uppercase tracking-widest">Vite</div></div>
              <ArrowRight size={20} className="text-slate-600" />
              <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-[9px] font-mono text-green-400">vendor.js</span></div>
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-[9px] font-mono text-red-400">pdf.js</span></div>
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-[9px] font-mono text-blue-400">core.js</span></div>
              </div>
          </div>
      </div>
  );

  const DiagramLegacyBridge = () => (
      <div className="relative h-48 bg-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear_gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="flex items-center gap-12 relative z-10">
              <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20"><Container size={40} className="text-white" /></div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Web App</span>
              </div>
              <div className="w-32 h-1 bg-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-500/50 animate-[travel_2s_infinite_linear]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-700 rounded">Capacitor Bridge</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20 relative">
                      <SmartphoneNfc size={40} className="text-white" />
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">v5.0</div>
                  </div>
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Android Legacy</span>
              </div>
          </div>
      </div>
  );

  const DiagramGeminiFlow = () => (
      <div className="relative h-48 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1),transparent_70%)]"></div>
          <div className="flex items-center gap-8 relative z-10">
              <div className="p-4 bg-slate-900 rounded-2xl border border-purple-500/30 text-purple-400 text-xs font-mono">"List top 5 Samsung TVs"</div>
              <ArrowRight size={24} className="text-purple-500/50" />
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] animate-pulse"><Bot size={32} className="text-white" /></div>
              <ArrowRight size={24} className="text-purple-500/50" />
              <div className="p-4 bg-slate-900 rounded-2xl border border-green-500/30 text-green-400 text-[10px] font-mono"><pre>{`[\n  {\n    "sku": "QA65",\n    "price": 19999\n  }\n]`}</pre></div>
          </div>
      </div>
  );

  const DiagramPdfLayout = () => (
      <div className="relative h-48 bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden mb-8 flex items-center justify-center">
          <div className="bg-white shadow-2xl w-48 h-32 border border-slate-100 p-2 flex flex-col gap-2 relative">
              <div className="h-4 w-full bg-slate-800 rounded-sm"></div>
              <div className="flex-1 flex gap-1">
                  <div className="w-1/3 bg-slate-100 rounded-sm"></div>
                  <div className="w-1/3 bg-slate-100 rounded-sm"></div>
                  <div className="w-1/3 bg-slate-100 rounded-sm flex flex-col gap-1 p-1">
                      <div className="h-1 w-full bg-red-100 rounded-full"></div>
                      <div className="h-1 w-2/3 bg-red-100 rounded-full"></div>
                  </div>
              </div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[8px] font-bold text-blue-600"><Calculator size={10}/> <span>X/Y Calc</span></div>
                  <div className="flex items-center gap-1 text-[8px] font-bold text-green-600"><LayoutTemplate size={10}/> <span>Auto-Col</span></div>
              </div>
          </div>
      </div>
  );

  // --- HELPER COMPONENTS ---

  const ArchitectNote = ({ title, children, color = 'yellow' }: { title: string, children?: React.ReactNode, color?: 'yellow' | 'blue' | 'purple' | 'green' }) => {
      const colors = {
          yellow: { bg: 'bg-yellow-950/30', border: 'border-yellow-600', text: 'text-yellow-500', sub: 'text-yellow-100/80' },
          blue: { bg: 'bg-blue-950/30', border: 'border-blue-600', text: 'text-blue-500', sub: 'text-blue-100/80' },
          purple: { bg: 'bg-purple-950/30', border: 'border-purple-600', text: 'text-purple-500', sub: 'text-purple-100/80' },
          green: { bg: 'bg-green-950/30', border: 'border-green-600', text: 'text-green-500', sub: 'text-green-100/80' }
      }[color];

      return (
          <div className={`my-6 p-6 ${colors.bg} border-l-4 ${colors.border} rounded-r-xl relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 p-2 opacity-10 ${colors.text}`}><CloudLightning size={40} /></div>
              <div className={`flex items-center gap-2 ${colors.text} font-black uppercase text-[10px] tracking-widest mb-2`}>
                  <Cpu size={14} /> Architect's Note: {title}
              </div>
              <div className={`${colors.sub} text-sm font-medium leading-relaxed font-sans`}>{children}</div>
          </div>
      );
  };

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
      <div className="my-6 group relative shadow-2xl">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-t-xl px-4 py-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Terminal size={12}/> {label}</span>
              <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
              </div>
          </div>
          <div className="bg-slate-900 border-x border-b border-slate-800 rounded-b-xl p-6 overflow-x-auto relative">
              <code className="font-mono text-xs text-blue-300 whitespace-pre leading-relaxed">{code}</code>
              <button 
                onClick={() => copyToClipboard(code, id)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-slate-700"
              >
                  {copiedStep === id ? <CheckCircle2 size={16} className="text-green-400"/> : <FileCode size={16} />}
              </button>
          </div>
      </div>
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
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Firmware v3.1 // Engineering Manual</div>
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
                      { id: 'apk', label: 'Legacy Native Build', icon: SmartphoneNfc, color: 'text-green-400' },
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
                          <SectionHeader icon={Database} title="Cloud Core" subtitle="Data Orchestration Layer" />
                          <DiagramCloudSync />
                          <div className="space-y-6">
                              <ArchitectNote title="Snapshot Strategy" color="blue">
                                  Devices follow a <strong>"Pull-First"</strong> policy. On startup, the Kiosk downloads the entire active catalog JSON blob into local memory. This ensures <strong>Zero Latency</strong> page transitions and offline capability. The database acts as a "Source of Truth" snapshot rather than a transactional query engine for every UI click.
                              </ArchitectNote>
                              <CodeSnippet 
                                  label="Snapshot Hydration Logic"
                                  id="sync-logic"
                                  code={`// geminiService.ts - Cloud to Local Hydration
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  
  // 1. Fetch Relational Data in Parallel
  const [brandsRes, catsRes, prodsRes] = await Promise.all([
      supabase.from('brands').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('products').select('*')
  ]);

  // 2. Reconstruct Tree in Memory
  const relationalBrands = brandsRes.data.map(b => ({
      ...b,
      categories: catsRes.data
          .filter(c => c.brand_id === b.id)
          .map(c => ({
              ...c,
              products: prodsRes.data.filter(p => p.category_id === c.id)
          }))
  }));

  // 3. Cache to LocalStorage for Offline Fallback
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(finalData));
  return finalData;
};`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'apk' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={SmartphoneNfc} title="Native Build" subtitle="Android 5.0 Legacy Support" />
                          <DiagramLegacyBridge />
                          <div className="space-y-6">
                              <ArchitectNote title="Legacy Webview Protocol" color="green">
                                  The target hardware runs <strong>Android 5.0 (Lollipop)</strong> with Chrome 37. To support this, we disable SSL requirements (`androidScheme: 'https'` + `cleartext: true`) and inject polyfills for `Promise`, `fetch`, and `Map/Set`. The `capacitor.config.ts` forces a cleartext server to bypass HSTS errors on outdated system clocks.
                              </ArchitectNote>
                              <CodeSnippet 
                                label="capacitor.config.ts - Legacy Overrides"
                                id="cap-config"
                                code={`import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jstyp.kiosk',
  appName: 'Kiosk Pro Showcase',
  webDir: 'dist',
  server: {
    // Force HTTPS scheme to satisfy modern Android, 
    // but allow cleartext for local dev and legacy proxies.
    androidScheme: 'https',
    cleartext: true
  },
  // Disable plugins that require newer Android APIs
  plugins: {
    PushNotifications: { presentationOptions: [] }
  }
};

export default config;`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'ai' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Bot} title="AI Synthesis" subtitle="Generative Data Pipeline" />
                          <DiagramGeminiFlow />
                          <div className="space-y-6">
                              <ArchitectNote title="Structured Hallucination" color="purple">
                                  We use a strict <strong>JSON Schema Enforcement</strong> prompt. This forces the Gemini model to output data that matches our exact TypeScript interfaces (`Product`, `Spec`). This allows admins to "hallucinate" entire product catalogs valid for the database instantly.
                              </ArchitectNote>
                              <CodeSnippet 
                                label="Gemini Prompt Template"
                                id="ai-prompt"
                                code={`// System Instruction for Gemini 1.5 Pro
const SYSTEM_PROMPT = \`You are a JSON generator for a Retail Kiosk DB.
Output ONLY valid JSON. No markdown.

Target Schema:
interface Product {
  name: string;
  sku: string;
  description: string; // Marketing copy, max 30 words
  specs: Record<string, string>; // e.g. {"Screen": "65 inch"}
  features: string[]; // 3-5 key selling points
}

Request: Generate 5 top-tier Samsung TV models from 2024.\`;

// The AI output is then parsed directly:
const products = JSON.parse(aiResponse.text());`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'build' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Container} title="Asset Compiler" subtitle="Vite Bundle Optimization" />
                          <DiagramBuildFlow />
                          <div className="space-y-6">
                              <ArchitectNote title="Manual Chunk Splitting" color="yellow">
                                  To prevent the main thread from freezing on low-end tablets, we manually split heavy libraries like `pdfjs-dist` (1MB+) and `xlsx` (800KB+) into separate chunks. They are lazy-loaded only when the user opens the "Export" or "Pricelist" modules.
                              </ArchitectNote>
                              <CodeSnippet 
                                label="vite.config.ts - Rollup Options"
                                id="vite-config"
                                code={`build: {
  target: 'es2015', // Transpile down for older V8 engines
  rollupOptions: {
    output: {
      manualChunks: {
        // Isolate React core to keep initial boot fast
        'vendor-react': ['react', 'react-dom'],
        // Isolate utilities
        'vendor-utils': ['lucide-react', '@supabase/supabase-js'],
        // Heavy: PDF Engine (Only loads on PDF view)
        'heavy-pdf': ['pdfjs-dist', 'jspdf'],
        // Heavy: Excel Engine (Only loads on Import)
        'heavy-data': ['xlsx', 'jszip']
      }
    }
  }
}`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'pricelists' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Table} title="Price Engine" subtitle="Client-Side PDF Generation" />
                          <DiagramPdfLayout />
                          <div className="space-y-6">
                              <ArchitectNote title="Dynamic Layout Calculation" color="blue">
                                  The PDF engine runs entirely in the browser using `jspdf`. It calculates column widths dynamically: if a pricelist has no "Promo Prices", that column is removed, and the "Description" column expands to fill the space. This ensures professional-grade layouts without server-side rendering.
                              </ArchitectNote>
                              <CodeSnippet 
                                label="Auto-Layout Logic (PdfViewer.tsx)"
                                id="pdf-logic"
                                code={`// Determine available width
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 10;
const usableWidth = pageWidth - (margin * 2);

// Calculate dynamic widths based on content presence
let descWidth = usableWidth;
if (hasSku) descWidth -= 25; // Reserve space for SKU
if (hasPromo) descWidth -= 25; // Reserve space for Promo Price
if (hasImage) descWidth -= 15; // Reserve space for Thumbnail

// Draw text with auto-wrapping
doc.text(item.description, xPos, yPos, { maxWidth: descWidth });`}
                              />
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
