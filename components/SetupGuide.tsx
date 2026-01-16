
import React, { useState, useEffect } from 'react';
import { 
  X, Database, Settings, Smartphone, Tablet, Tv, Terminal, 
  Cpu, HardDrive, Layers, Zap, Shield, Activity, Network, 
  Lock, Binary, Table, RefreshCw, FileText, ArrowRight, 
  Sparkles, Download, Search, Maximize, Box, Bot, 
  SmartphoneNfc, Container, Split, DatabaseZap, Code2, 
  Wifi, Clock, CloudLightning, FileJson, CheckCircle2, 
  AlertTriangle, Play, Pause, ChevronRight, Calculator,
  Braces, ShieldCheck, Wrench, Globe, FileDigit
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

  const DiagramNormalization = () => (
    <div className="relative h-64 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden mb-8 flex items-center justify-center p-8">
        <div className="flex items-center gap-8 md:gap-16 w-full max-w-2xl relative">
            <div className="flex-1 aspect-video bg-red-900/20 border-2 border-red-500/30 rounded-2xl flex flex-col items-center justify-center relative animate-pulse">
                <FileJson className="text-red-400 mb-2" size={40} />
                <span className="text-red-400 text-xs font-black uppercase tracking-widest">Monolith</span>
            </div>
            <div className="shrink-0 flex flex-col items-center text-slate-500">
                <Split size={32} className="animate-spin-slow duration-[10s]" />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-3">
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3">
                    <Database size={16} className="text-blue-400" />
                    <span className="text-[9px] font-black text-blue-400 uppercase">Brands</span>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-xl flex items-center gap-3 ml-4">
                    <Layers size={16} className="text-purple-400" />
                    <span className="text-[9px] font-black text-purple-400 uppercase">Products</span>
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
                  {copiedStep === id ? <CheckCircle2 size={16} className="text-green-400"/> : <Terminal size={16} />}
              </button>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-200 font-sans flex flex-col animate-fade-in overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-50 shadow-2xl relative">
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
                      { id: 'migration', label: 'Migration & Schema', icon: DatabaseZap, color: 'text-orange-400' },
                      { id: 'supabase', label: 'Cloud Infrastructure', icon: Database, color: 'text-blue-400' },
                      { id: 'apk', label: 'Native Build', icon: SmartphoneNfc, color: 'text-green-400' },
                      { id: 'ai', label: 'Core Logic & Sync', icon: Cpu, color: 'text-purple-400' },
                      { id: 'build', label: 'Legacy Engine', icon: Container, color: 'text-yellow-400' },
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
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
              <div className="max-w-4xl mx-auto pb-20">
                  
                  {activeTab === 'migration' && (
                      <div className="animate-fade-in">
                          <div className="flex items-center gap-4 mb-2">
                              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-orange-400"><DatabaseZap size={32} /></div>
                              <div>
                                  <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Schema & Migration</h2>
                                  <div className="flex items-center gap-2 mt-1">
                                      <div className="h-0.5 w-8 bg-orange-500"></div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Relational Data Structure</span>
                                  </div>
                              </div>
                          </div>
                          
                          <DiagramNormalization />
                          
                          <div className="mt-12 space-y-8">
                              <div className="bg-blue-900/30 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                  <h3 className="text-white font-bold uppercase text-sm flex items-center gap-2"><Wrench size={16}/> Schema Deployment</h3>
                                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                                      Copy this <strong>Complete Schema SQL</strong> and run it in your Supabase SQL Editor. This will create all necessary tables (Brands, Products, Ads, Fleet, Settings) with correct relationships and security policies.
                                  </p>
                              </div>

                              <CodeSnippet 
                                label="Full Database Schema (v2.0)"
                                id="mig-full"
                                code={`-- 1. CORE INVENTORY
CREATE TABLE IF NOT EXISTS public.brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    logo_url text,
    theme_color text DEFAULT '#0f172a',
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,
    brand_id text NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    icon text,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    category_id text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    sku text,
    name text NOT NULL,
    description text,
    specs jsonb DEFAULT '{}'::jsonb,
    features jsonb DEFAULT '[]'::jsonb,
    box_contents jsonb DEFAULT '[]'::jsonb,
    dimensions jsonb DEFAULT '[]'::jsonb,
    image_url text,
    gallery_urls jsonb DEFAULT '[]'::jsonb,
    video_urls jsonb DEFAULT '[]'::jsonb,
    manuals jsonb DEFAULT '[]'::jsonb,
    terms text,
    date_added timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. FLEET & KIOSKS
CREATE TABLE IF NOT EXISTS public.kiosks (
    id text PRIMARY KEY,
    name text NOT NULL,
    status text DEFAULT 'online',
    device_type text DEFAULT 'kiosk',
    assigned_zone text,
    wifi_strength int,
    ip_address text,
    last_seen timestamptz DEFAULT now(),
    version text,
    location_description text,
    show_pricelists boolean DEFAULT true,
    restart_requested boolean DEFAULT false,
    notes text
);

-- 3. MARKETING
CREATE TABLE IF NOT EXISTS public.marketing_hero (
    id text PRIMARY KEY DEFAULT 'hero',
    title text,
    subtitle text,
    background_image_url text,
    logo_url text,
    website_url text,
    CONSTRAINT hero_single CHECK (id = 'hero')
);

CREATE TABLE IF NOT EXISTS public.marketing_ads (
    id text PRIMARY KEY,
    zone_name text NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    date_added timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pamphlets (
    id text PRIMARY KEY,
    title text,
    type text DEFAULT 'pamphlet',
    thumbnail_url text,
    pdf_url text,
    pages jsonb DEFAULT '[]'::jsonb,
    start_date date,
    end_date date,
    year int,
    promo_text text,
    brand_id text REFERENCES public.brands(id) ON DELETE SET NULL
);

-- 4. PRICING ENGINE
CREATE TABLE IF NOT EXISTS public.pricelist_brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    logo_url text,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pricelists (
    id text PRIMARY KEY,
    brand_id text REFERENCES public.pricelist_brands(id) ON DELETE CASCADE,
    title text,
    month text,
    year text,
    type text DEFAULT 'pdf',
    url text,
    thumbnail_url text,
    kind text DEFAULT 'standard',
    start_date date,
    end_date date,
    promo_text text,
    items jsonb DEFAULT '[]'::jsonb,
    headers jsonb DEFAULT '{}'::jsonb,
    date_added timestamptz DEFAULT now()
);

-- 5. TV MODE
CREATE TABLE IF NOT EXISTS public.tv_brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    logo_url text
);

CREATE TABLE IF NOT EXISTS public.tv_models (
    id text PRIMARY KEY,
    tv_brand_id text REFERENCES public.tv_brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    image_url text,
    video_urls jsonb DEFAULT '[]'::jsonb
);

-- 6. SYSTEM SINGLETONS
CREATE TABLE IF NOT EXISTS public.system_settings (
    id text PRIMARY KEY DEFAULT 'config',
    setup_pin text DEFAULT '0000',
    company_logo_url text,
    app_icon_url_kiosk text,
    app_icon_url_admin text,
    CONSTRAINT config_single CHECK (id = 'config')
);

CREATE TABLE IF NOT EXISTS public.screensaver_settings (
    id text PRIMARY KEY DEFAULT 'saver',
    idle_timeout int DEFAULT 60,
    image_duration int DEFAULT 8,
    mute_videos boolean DEFAULT false,
    show_product_images boolean DEFAULT true,
    show_product_videos boolean DEFAULT true,
    show_pamphlets boolean DEFAULT true,
    show_custom_ads boolean DEFAULT true,
    show_info_overlay boolean DEFAULT true,
    enable_sleep_mode boolean DEFAULT false,
    active_hours_start text DEFAULT '08:00',
    active_hours_end text DEFAULT '20:00',
    CONSTRAINT saver_single CHECK (id = 'saver')
);

CREATE TABLE IF NOT EXISTS public.admins (
    id text PRIMARY KEY,
    name text NOT NULL,
    pin text NOT NULL,
    is_super_admin boolean DEFAULT false,
    permissions jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.about_page (
    id text PRIMARY KEY DEFAULT 'about',
    title text,
    text text,
    audio_url text,
    CONSTRAINT about_single CHECK (id = 'about')
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type text,
    entity_id text,
    action text,
    actor_name text,
    payload jsonb,
    timestamp timestamptz DEFAULT now()
);

-- 7. ENABLE PUBLIC ACCESS (RLS)
DO $$ 
DECLARE 
    tbl text; 
BEGIN 
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP 
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl); 
        EXECUTE format('DROP POLICY IF EXISTS "Public Access" ON public.%I', tbl); 
        EXECUTE format('CREATE POLICY "Public Access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl); 
    END LOOP; 
END $$;

-- 8. SEED DEFAULTS
INSERT INTO public.system_settings (id) VALUES ('config') ON CONFLICT DO NOTHING;
INSERT INTO public.marketing_hero (id) VALUES ('hero') ON CONFLICT DO NOTHING;
INSERT INTO public.screensaver_settings (id) VALUES ('saver') ON CONFLICT DO NOTHING;
INSERT INTO public.about_page (id) VALUES ('about') ON CONFLICT DO NOTHING;
INSERT INTO public.admins (id, name, pin, is_super_admin, permissions) 
VALUES ('super-admin', 'Admin', '1723', true, '{"inventory":true,"marketing":true,"tv":true,"screensaver":true,"fleet":true,"history":true,"settings":true,"pricelists":true}'::jsonb) 
ON CONFLICT DO NOTHING;`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'supabase' && (
                      <div className="animate-fade-in">
                          <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-blue-400"><Database size={32} /></div><div><h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Cloud Core</h2><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">PostgreSQL Orchestration</div></div></div>
                          
                          <div className="mt-8 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                      <h3 className="text-sm font-black uppercase text-blue-400 mb-4 flex items-center gap-2"><Lock size={14}/> Environment Variables</h3>
                                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                          Connect your Kiosk to Supabase by setting these variables in your local `.env` file or Vercel Environment Settings.
                                      </p>
                                      <CodeSnippet 
                                          label=".env Configuration"
                                          id="env-vars"
                                          code={`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`}
                                      />
                                  </div>
                                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                      <h3 className="text-sm font-black uppercase text-yellow-400 mb-4 flex items-center gap-2"><CloudLightning size={14}/> Storage Buckets</h3>
                                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                          The system uses a single bucket for all media assets (images, videos, PDFs).
                                      </p>
                                      <ul className="space-y-2">
                                          <li className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 text-[10px] font-black">1</div>
                                              <span className="text-xs font-bold text-slate-300">Create Bucket: <span className="text-blue-400 font-mono">kiosk-media</span></span>
                                          </li>
                                          <li className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 text-[10px] font-black">2</div>
                                              <span className="text-xs font-bold text-slate-300">Set Visibility: <span className="text-green-400 font-mono">Public</span></span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'apk' && (
                      <div className="animate-fade-in">
                          <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-green-400"><SmartphoneNfc size={32} /></div><div><h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Native Build</h2><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Capacitor Android Runtime</div></div></div>
                          
                          <div className="mt-8 space-y-6">
                              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                                  The Kiosk uses Capacitor to wrap the React web application into a native Android APK. This allows for full-screen mode, native file system access (future), and hardware-accelerated WebView.
                              </p>
                              
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                  <h3 className="text-white font-black uppercase text-xs tracking-wider mb-4 flex items-center gap-2"><Terminal size={14}/> Build Pipeline</h3>
                                  <CodeSnippet 
                                      label="Terminal Commands"
                                      id="cap-build"
                                      code={`# 1. Compile Web Assets (React -> Static)
npm run build

# 2. Sync Static Assets to Native Android Project
npx cap sync

# 3. Open Android Studio to Compile APK
npx cap open android`}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'ai' && (
                      <div className="animate-fade-in">
                          <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-purple-400"><Cpu size={32} /></div><div><h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Core Logic</h2><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Architecture & Synchronization</div></div></div>
                          
                          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                  <h3 className="text-lg font-black text-white uppercase flex items-center gap-2"><Wifi size={20} className="text-blue-500"/> Offline-First Strategy</h3>
                                  <p className="text-slate-400 text-xs leading-relaxed">
                                      The application is designed to function 100% without an internet connection after the initial sync.
                                  </p>
                                  <ul className="space-y-4">
                                      <li className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                          <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Boot Sequence</div>
                                          <div className="text-slate-300 text-xs">Loads data immediately from <code>localStorage</code> (indexedDB/Cache) to ensure 0ms latency.</div>
                                      </li>
                                      <li className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Hydration</div>
                                          <div className="text-slate-300 text-xs">Background process checks Supabase for newer `updated_at` timestamps and silently updates the local store.</div>
                                      </li>
                                  </ul>
                              </div>
                              
                              <div className="space-y-6">
                                  <h3 className="text-lg font-black text-white uppercase flex items-center gap-2"><Activity size={20} className="text-green-500"/> Heartbeat Protocol</h3>
                                  <p className="text-slate-400 text-xs leading-relaxed">
                                      Every device sends a telemetry packet to the cloud every 30 seconds to report its status to the Admin Dashboard.
                                  </p>
                                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500"><Activity size={64}/></div>
                                      <code className="text-[10px] font-mono text-green-400 block">
                                          {`{
  "id": "LOC-12345",
  "status": "online",
  "wifi_strength": 92,
  "last_seen": "2024-03-20T10:00:00Z",
  "version": "1.0.5"
}`}
                                      </code>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'build' && (
                      <div className="animate-fade-in">
                          <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-yellow-400"><Container size={32} /></div><div><h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Legacy Engine</h2><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Android 5.0 Compatibility</div></div></div>
                          
                          <div className="mt-8 space-y-6">
                              <div className="bg-yellow-900/20 border border-yellow-600/30 p-6 rounded-2xl">
                                  <h3 className="text-yellow-400 font-bold uppercase text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Hardware Constraint</h3>
                                  <p className="text-slate-300 text-xs leading-relaxed">
                                      Many retail tablets run <strong>Android 5.0 (Lollipop)</strong> with WebView versions as old as Chrome 37. Modern JavaScript (ES6+) crashes these devices.
                                  </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vite Legacy Plugin</h4>
                                      <ul className="space-y-2 text-xs text-slate-500 font-medium">
                                          <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Transpiles code to ES5 SystemJS.</li>
                                          <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Injects <code>core-js</code> polyfills.</li>
                                          <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Handles Promise/Fetch fallbacks.</li>
                                      </ul>
                                  </div>
                                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Terser Minification</h4>
                                      <ul className="space-y-2 text-xs text-slate-500 font-medium">
                                          <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Enforces Safari 10 loop safety.</li>
                                          <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Drops console logs for perf.</li>
                                          <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Aggressive class mangling.</li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'pricelists' && (
                      <div className="animate-fade-in">
                          <div className="flex items-center gap-4 mb-2"><div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-red-400"><Table size={32} /></div><div><h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Price Engine</h2><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Logic & Export</div></div></div>
                          
                          <div className="mt-8 space-y-8">
                              <div className="flex flex-col md:flex-row gap-8">
                                  <div className="flex-1 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                      <h3 className="text-sm font-black uppercase text-slate-300 mb-4 flex items-center gap-2"><Calculator size={16} className="text-blue-500"/> Psychological Rounding</h3>
                                      <div className="space-y-3">
                                          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg">
                                              <span className="text-xs font-mono text-slate-500">129.99</span>
                                              <ArrowRight size={14} className="text-slate-600" />
                                              <span className="text-sm font-bold text-green-400">130</span>
                                          </div>
                                          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg">
                                              <span className="text-xs font-mono text-slate-500">799.00</span>
                                              <ArrowRight size={14} className="text-slate-600" />
                                              <span className="text-sm font-bold text-green-400">800</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                              Prices ending in 9 are automatically bumped to the next whole number to present a cleaner, premium aesthetic.
                                          </p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex-1 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                      <h3 className="text-sm font-black uppercase text-slate-300 mb-4 flex items-center gap-2"><FileText size={16} className="text-red-500"/> Client-Side PDF</h3>
                                      <ul className="space-y-3 text-xs text-slate-400">
                                          <li className="flex items-start gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                              <span>Generates PDFs directly in the browser using <code>jspdf</code>. No server required.</span>
                                          </li>
                                          <li className="flex items-start gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                              <span>Auto-pagination based on content height.</span>
                                          </li>
                                          <li className="flex items-start gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                              <span>Embeds Company Logo and Brand Headers automatically.</span>
                                          </li>
                                      </ul>
                                  </div>
                              </div>
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
