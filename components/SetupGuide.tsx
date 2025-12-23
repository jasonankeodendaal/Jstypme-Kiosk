
import React, { useState, useEffect } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, FileText, ArrowRight, Sparkles, ServerCrash, Share, Download, FastForward, Wand2, Fingerprint, Search,
  // Added missing FileInput icon import
  FileInput
} from 'lucide-react';

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
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-12 scroll-smooth pb-32">
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-full pb-32">
              
              {/* PHASE 5: PRICELIST ENGINE (DETAILED) */}
              {activeTab === 'pricelists' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Table} subtitle="Full breakdown of the high-performance XLSX ingestion and PDF synthesis core.">Pricelist Intelligence Engine</SectionHeading>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><FileSpreadsheet size={80} /></div>
                            <h3 className="text-orange-900 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><FileInput size={14}/> Input Phase</h3>
                            <p className="text-orange-800/80 text-sm leading-relaxed mb-4">Accepts raw binary <code>.xlsx</code> data. Uses <code>SheetJS</code> to parse workbooks into 2D JSON arrays in-memory.</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-mono text-orange-600 bg-white/50 p-2 rounded">
                                    <span>Raw Cell:</span> <span className="font-bold">" SKU_100 (Black) "</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-orange-600 bg-white/50 p-2 rounded">
                                    <span>Price Cell:</span> <span className="font-bold">"$ 1,299.99"</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20"><RefreshCw size={80} className="animate-spin-slow" /></div>
                            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><Binary size={14}/> Normalization Phase</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">Cleanses and rounds data based on retail psychology rules for premium brand consistency.</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-black/20 p-2 rounded">
                                    <span>Sanitized:</span> <span className="font-bold">"SKU_100"</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-blue-200 bg-black/20 p-2 rounded">
                                    <span>Normalized:</span> <span className="font-bold">"R 1,300"</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-16">
                        <Step number="1" title="Keyword Discovery (Fuzzy Logic)">
                            <p className="font-medium text-slate-700 leading-relaxed">
                                The engine scans the first non-empty row of the spreadsheet to detect the "Header Matrix". It uses a weighted keyword system to map columns regardless of their order.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
                                {[
                                    { label: 'SKU Map', color: 'blue', keys: ['sku', 'code', 'model', 'part'] },
                                    { label: 'Desc Map', color: 'purple', keys: ['desc', 'item', 'name', 'title'] },
                                    { label: 'Retail Map', color: 'green', keys: ['price', 'retail', 'msrp', 'cost'] },
                                    { label: 'Promo Map', color: 'orange', keys: ['sale', 'promo', 'special', 'deal'] }
                                ].map(map => (
                                    <div key={map.label} className={`bg-${map.color}-50 border border-${map.color}-200 p-3 rounded-2xl`}>
                                        <div className={`text-${map.color}-700 font-black text-[9px] uppercase tracking-wider mb-2`}>{map.label}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {map.keys.map(k => <span key={k} className={`bg-white text-${map.color}-600 px-1.5 py-0.5 rounded text-[8px] font-bold border border-${map.color}-100`}>{k}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <WhyBox title="Architectural Flexibility">
                                This allows managers to export from any legacy POS or ERP system and import directly without manual column re-ordering.
                            </WhyBox>
                        </Step>

                        <Step number="2" title="The Cognitive Pricing Pipeline">
                            <p className="font-medium text-slate-700">The normalization function (<code>formatImported</code>) applies a strict logic tree to every price cell found.</p>
                            <CodeBlock 
                                id="logic-normalization"
                                label="Normalization Kernel (TypeScript)"
                                code={`const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
// 1. Force integer ceiling for clean decimals
if (n % 1 !== 0) n = Math.ceil(n);
// 2. Eliminate 'Discount Store' 9-endings
if (Math.floor(n) % 10 === 9) n += 1; 
// 3. Apply Locale Formatting
return \`R \${n.toLocaleString()}\`;`}
                            />
                            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400"><Wand2 size={20}/></div>
                                    <div className="text-white font-black uppercase text-xs tracking-widest">Logic Visualizer</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between group">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Malformed Input</div>
                                        <div className="text-sm font-mono text-red-400 group-hover:scale-105 transition-transform">"$ 4,449.99"</div>
                                    </div>
                                    <div className="h-[1px] bg-white/5"></div>
                                    <div className="flex items-center justify-between group">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Sanitized Float</div>
                                        <div className="text-sm font-mono text-blue-400">4449.99</div>
                                    </div>
                                    <div className="h-[1px] bg-white/5"></div>
                                    <div className="flex items-center justify-between group">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Ceiling Apply</div>
                                        <div className="text-sm font-mono text-blue-400">4450</div>
                                    </div>
                                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex justify-between items-center animate-pulse">
                                        <div className="text-[10px] font-black text-green-400 uppercase">Final Output</div>
                                        <div className="text-lg font-black text-green-400 font-mono tracking-tighter">R 4,450</div>
                                    </div>
                                </div>
                            </div>
                        </Step>

                        <Step number="3" title="PDF Synthesis Engine">
                            <p className="font-medium text-slate-700">The export engine uses <code>jsPDF</code> to build a print-ready vector document. It calculates pagination dynamically.</p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-red-200 transition-colors">
                                    <div className="bg-red-50 p-3 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><FileText size={20} /></div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 uppercase">Vector Primitives</div>
                                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">Unlike "screenshot" PDFs, our engine draws rectangles and places fonts as vectors. This results in ultra-sharp prints and very small file sizes (~50KB).</div>
                                    </div>
                                </li>
                                <li className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-colors">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all"><Shield size={20} /></div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 uppercase">Brand Injection</div>
                                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">The engine pulls the Brand Logo from the specific Pricelist Brand, ensuring the document is correctly targeted to the vendor or shop section.</div>
                                    </div>
                                </li>
                            </ul>
                        </Step>
                        
                        <EngineerNote>
                            The PDF engine runs entirely in the browser's Main Thread. To prevent UI freezing during 1000+ item exports, we utilize a sequential <code>forEach</code> that allows for frame-yielding if implemented with <code>requestIdleCallback</code> (v3 roadmap).
                        </EngineerNote>
                    </div>
                </div>
              )}

              {/* PHASE 1: SUPABASE INFRASTRUCTURE */}
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning the cloud backbone for global sync.">Supabase Infrastructure</SectionHeading>
                    <WhyBox title="Relational Integrity">
                        The system uses Supabase to bridge the gap between static APK deployments and dynamic retail environments.
                    </WhyBox>
                    <Step number="1" title="Database Schema Migration">
                        <p>Execute SQL to create tables and enable RLS.</p>
                        <CodeBlock 
                          id="sql-schema-v2"
                          label="Core SQL Schema"
                          code={`CREATE TABLE IF NOT EXISTS public.store_config (id bigint primary key default 1, data jsonb not null default '{}'::jsonb);
CREATE TABLE IF NOT EXISTS public.kiosks (id text primary key, name text not null, status text default 'online');
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON public.store_config FOR SELECT USING (true);`}
                        />
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
