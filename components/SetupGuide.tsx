
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

                    <WhyBox title="Incremental Relational Architecture">
                        To support thousands of products without crashing the server, we utilize an **Incremental Patching** strategy. Instead of one giant config file, each brand, category, and product is stored as a specific row in the database.
                    </WhyBox>

                    <Step number="1" title="Infrastructure Bootstrapping (SQL)">
                        <p className="font-medium text-slate-700">Open Supabase &rarr; **SQL Editor** &rarr; **New Query**. Execute this script to provision the relational tables required for high-speed synchronization.</p>
                        <CodeBlock 
                          id="sql-schema"
                          label="Production SQL Bootstrap (Full Relational Fix)"
                          code={`-- 1. CLEANUP & CORE SCHEMA
CREATE TABLE IF NOT EXISTS public.store_config (
    id int primary key,
    data jsonb not null,
    updated_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.brands (
    id text primary key,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id text primary key,
    brand_id text not null,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.products (
    id text primary key,
    category_id text not null,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.catalogues (
    id text primary key,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.pricelists (
    id text primary key,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.kiosks (
    id text primary key,
    name text,
    device_type text,
    assigned_zone text,
    last_seen timestamp with time zone default now(),
    status text,
    wifi_strength integer,
    ip_address text,
    version text,
    location_description text,
    restart_requested boolean default false,
    created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id text primary key,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RESET & RECREATE PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Allow All Config" ON public.store_config;
DROP POLICY IF EXISTS "Allow All Brands" ON public.brands;
DROP POLICY IF EXISTS "Allow All Cats" ON public.categories;
DROP POLICY IF EXISTS "Allow All Prods" ON public.products;
DROP POLICY IF EXISTS "Allow All Catalogues" ON public.catalogues;
DROP POLICY IF EXISTS "Allow All Price" ON public.pricelists;
DROP POLICY IF EXISTS "Allow All Kiosks" ON public.kiosks;
DROP POLICY IF EXISTS "Allow All Logs" ON public.audit_logs;

CREATE POLICY "Allow All Config" ON public.store_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Cats" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Prods" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Catalogues" ON public.catalogues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Price" ON public.pricelists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Kiosks" ON public.kiosks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 4. INITIAL SEEDING
-- Ensures the app finds row #1 on the first load
INSERT INTO public.store_config (id, data) 
VALUES (1, '{}') 
ON CONFLICT (id) DO NOTHING;

-- 5. FINAL ACCESS GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
`}
                        />
                        <EngineerNote>
                            This revised script ensures the 'kiosks' and 'store_config' tables exist and includes an initial SEED record for ID:1.
                        </EngineerNote>
                    </Step>

                    <Step number="2" title="Storage Engine Configuration">
                        <p className="font-medium text-slate-700">The SQL above automatically provisions permissions. Ensure the bucket exists:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">Bucket Settings</div>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle2 size={14} className="text-green-500" /> Name: <code className="bg-white px-2 py-0.5 rounded border">kiosk-media</code></li>
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle2 size={14} className="text-green-500" /> Public Access: <strong>ENABLED</strong></li>
                                </ul>
                            </div>
                        </div>
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
