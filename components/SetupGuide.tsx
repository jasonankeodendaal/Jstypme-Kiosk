
import React, { useState, useEffect } from 'react';
import { X, Server, Copy, Check, ShieldCheck, Database, Key, Settings, Smartphone, Tablet, Tv, Globe, Terminal, Hammer, MousePointer, Code, Package, Info, CheckCircle2, AlertTriangle, ExternalLink, Cpu, HardDrive, Share2, Layers, Zap, Shield, Workflow, Activity, Cpu as CpuIcon, Network, Lock, ZapOff, Binary, Globe2, Wind, ShieldAlert, Github, Table, FileSpreadsheet, RefreshCw, FileText, ArrowRight, Sparkles, FileDown, Layers3, CheckCircle } from 'lucide-react';

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
            <Zap size={14} className="fill-blue-500" /> {title}
        </div>
        <div className="text-sm text-blue-900/80 leading-relaxed font-medium">
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
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">{title}</h3>
            <div className="text-slate-600 space-y-5">{children}</div>
        </div>
    </div>
  );

  const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => (
    <div className="my-6 relative group">
      {label && <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 px-1"><Terminal size={12}/> {label}</div>}
      <div className="bg-slate-950 rounded-2xl p-6 overflow-x-auto relative shadow-2xl border border-slate-800/50">
        <code className="font-mono text-xs md:text-sm text-blue-300 whitespace-pre-wrap break-all block leading-relaxed">{code}</code>
        <button onClick={() => copyToClipboard(code, id)} className="absolute top-4 right-4 p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-white shadow-lg"><Copy size={18}/></button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in overflow-hidden">
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
        .animate-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        @keyframes data-flow { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(120px); opacity: 0; } }
        .data-packet { animation: data-flow 2s infinite linear; }
        @keyframes subtle-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-float-small { animation: subtle-bounce 3s ease-in-out infinite; }
        @keyframes slide-right {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
        .data-scan {
            animation: slide-right 2.5s infinite linear;
        }
      `}</style>

      <div className="bg-slate-900 text-white p-6 shadow-2xl shrink-0 flex items-center justify-between border-b border-slate-800 z-50">
        <div className="flex items-center gap-5">
           <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)]"><ShieldCheck size={32} className="text-white" /></div>
           <div>
             <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">System Engineering Manual</h1>
             <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">v2.8.5 protocol</p>
           </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-red-600/20 hover:text-red-500 rounded-2xl"><X size={28} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="w-full md:w-80 bg-white border-r p-6 flex flex-col shrink-0 overflow-y-auto z-40">
            <nav className="space-y-4">
                {[
                    { id: 'supabase', label: '1. Supabase Cloud', sub: 'Backend API', icon: Database, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-600' },
                    { id: 'local', label: '2. PC Station Hub', sub: 'Dev Env', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600' },
                    { id: 'build', label: '3. Asset Pipeline', sub: 'Optimization', icon: Hammer, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-600' },
                    { id: 'vercel', label: '4. Edge Network', sub: 'Delivery', icon: Globe, color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-900' },
                    { id: 'pricelists', label: '5. Pricelist Engine', sub: 'XLSX & Distribution', icon: Table, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-600' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full p-4 rounded-3xl border-2 text-left transition-all flex items-center gap-4 ${activeTab === tab.id ? `${tab.bg} ${tab.border} shadow-md translate-x-2` : 'border-transparent hover:bg-slate-50'}`}>
                        <div className={`p-3 rounded-2xl ${activeTab === tab.id ? 'bg-white shadow-sm scale-110' : 'bg-slate-100'}`}><tab.icon size={22} className={activeTab === tab.id ? tab.color : 'text-slate-400'} /></div>
                        <div className="min-w-0"><span className={`font-black text-sm block leading-none mb-1 truncate ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span><span className="text-[10px] text-slate-400 font-bold uppercase truncate">{tab.sub}</span></div>
                    </button>
                ))}
            </nav>
            <div className="mt-auto pt-8">
                <div className="p-5 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={40} /></div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Authorized personnel only. Configuration changes affect fleet-wide operations.</p>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-12 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-full pb-32">
              
              {activeTab === 'supabase' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Database} subtitle="Provisioning high-availability cloud backbone for global fleet synchronization.">Supabase Infrastructure</SectionHeading>
                    <WhyBox title="Why Supabase?">Realtime Websockets, Relational Integrity (PostgreSQL), and Edge-cached Asset Buckets.</WhyBox>
                    <Step number="1" title="SQL Schema Injection">
                        <p className="font-medium text-slate-700">The Kiosk Pro system is schema-driven. Execute this DDL script to initialize tables and enable Realtime replication.</p>
                        <CodeBlock id="sql-full" label="Master SQL Script" code={`-- CREATE ASSET BUCKET\ninsert into storage.buckets (id, name, public) values ('kiosk-media', 'kiosk-media', true) on conflict do nothing;\n\n-- CREATE CORE TABLES\nCREATE TABLE IF NOT EXISTS public.store_config ( id serial PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamp with time zone DEFAULT now());\nCREATE TABLE IF NOT EXISTS public.kiosks ( id text PRIMARY KEY, name text, device_type text, last_seen timestamp with time zone, restart_requested boolean DEFAULT false);\n\n-- ENABLE REALTIME REPLICATION\nALTER TABLE public.store_config REPLICA IDENTITY FULL;\nALTER TABLE public.kiosks REPLICA IDENTITY FULL;`} />
                    </Step>
                </div>
              )}

              {activeTab === 'pricelists' && (
                  <div className="p-8 md:p-16 animate-fade-in">
                      <SectionHeading icon={Table} subtitle="Automated Ingestion, Normalization, and Multi-Channel Distribution.">Pricelist Intelligence Engine</SectionHeading>
                      
                      {/* Advanced Visualization */}
                      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                          
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 py-4">
                              {/* Step 1: Input */}
                              <div className="flex flex-col items-center gap-4 group">
                                  <div className="w-24 h-24 bg-white/5 rounded-3xl border-2 border-green-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                      <div className="absolute inset-0 bg-green-500/10 data-scan"></div>
                                      <FileSpreadsheet size={40} className="text-green-400" />
                                  </div>
                                  <span className="text-white font-black uppercase text-[10px] tracking-widest">XLSX Import</span>
                              </div>

                              {/* Flow 1 */}
                              <div className="hidden md:block flex-1 h-1 bg-white/5 relative mx-2 rounded-full overflow-hidden">
                                  <div className="absolute inset-0 bg-blue-500 data-packet"></div>
                              </div>

                              {/* Step 2: Logic */}
                              <div className="flex flex-col items-center gap-4">
                                  <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] relative animate-float-small">
                                      <div className="absolute inset-0 animate-ring border-2 border-blue-400 rounded-3xl"></div>
                                      <RefreshCw size={40} className="text-white animate-spin-slow" />
                                  </div>
                                  <span className="text-white font-black uppercase text-[10px] tracking-widest">Normalization</span>
                              </div>

                              {/* Flow 2 */}
                              <div className="hidden md:block flex-1 h-1 bg-white/5 relative mx-2 rounded-full overflow-hidden">
                                  <div className="absolute inset-0 bg-purple-500 data-packet" style={{animationDelay: '1s'}}></div>
                              </div>

                              {/* Step 3: Distribution */}
                              <div className="flex flex-col items-center gap-4">
                                  <div className="w-24 h-24 bg-white/5 rounded-3xl border-2 border-purple-500/30 flex items-center justify-center">
                                      <div className="grid grid-cols-2 gap-1 scale-75">
                                          <Smartphone size={20} className="text-purple-400" />
                                          <FileText size={20} className="text-red-400" />
                                          <Tv size={20} className="text-blue-400" />
                                          <FileDown size={20} className="text-green-400" />
                                      </div>
                                  </div>
                                  <span className="text-white font-black uppercase text-[10px] tracking-widest">Multi-Channel</span>
                              </div>
                          </div>
                      </div>

                      <WhyBox title="Smart Normalization Logic">
                          Messy raw input (e.g., <code>799</code> or <code>4449</code>) is automatically sanitized to ensure professional retail pricing standards.
                          <div className="mt-4 flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-white/5">
                              <div className="text-[10px] font-mono text-slate-500 uppercase">Raw Input: R {roundDemoValue}</div>
                              <ArrowRight size={12} className="text-slate-600" />
                              <div className="text-sm font-mono text-green-400 font-black animate-pulse">R {Math.ceil(roundDemoValue/10)*10}</div>
                              <div className="ml-auto flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                  <CheckCircle size={10} className="text-green-500"/> Auto-Sanitized
                              </div>
                          </div>
                      </WhyBox>

                      <Step number="1" title="XLSX Parser Pipeline">
                          <p className="font-medium text-slate-700">
                              The system utilizes <code>SheetJS (xlsx)</code> for high-performance client-side binary parsing. This allows staff to import complex spreadsheets directly into the admin hub without server-side middleware.
                          </p>
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                  <Layers3 size={16} className="text-blue-500" /> Processing Layers
                              </h4>
                              <ul className="space-y-3">
                                  <li className="flex gap-3 text-xs text-slate-600">
                                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0 font-bold">1</div>
                                      <span><strong>Structure Check:</strong> Identifies SKU, Description, and Price columns automatically.</span>
                                  </li>
                                  <li className="flex gap-3 text-xs text-slate-600">
                                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center shrink-0 font-bold">2</div>
                                      <span><strong>Price Sanity:</strong> Strips currency symbols and applies the <code>Math.ceil(p/10)*10</code> normalization.</span>
                                  </li>
                                  <li className="flex gap-3 text-xs text-slate-600">
                                      <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded flex items-center justify-center shrink-0 font-bold">3</div>
                                      <span><strong>Cloud Sync:</strong> Batched UPSERT to Supabase to update the global fleet in &lt;500ms.</span>
                                  </li>
                              </ul>
                          </div>
                      </Step>

                      <Step number="2" title="Vector PDF Generation">
                          <p className="font-medium text-slate-700">
                              For in-store printing and digital sharing, the engine generates 1:1 vector-perfect A4 PDF documents using <code>jsPDF</code>.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                  <h5 className="text-[10px] font-black uppercase text-slate-400 mb-2">Technical Specs</h5>
                                  <p className="text-[11px] text-slate-600 font-medium">Standard A4 Portrait (210mm x 297mm). Vector text and geometry for razor-sharp printing at 300+ DPI.</p>
                              </div>
                              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                  <h5 className="text-[10px] font-black uppercase text-slate-400 mb-2">Branding Logic</h5>
                                  <p className="text-[11px] text-slate-600 font-medium">Dynamic logo injection from Cloud Storage with automatic aspect-ratio preservation.</p>
                              </div>
                          </div>
                      </Step>
                  </div>
              )}

              {activeTab === 'local' && (
                <div className="p-8 md:p-16 animate-fade-in">
                    <SectionHeading icon={Server} subtitle="Preparing your local workstation for system administration and development.">PC Station Hub</SectionHeading>
                    <Step number="1" title="Environment Vars">
                        <p className="font-medium text-slate-700">Initialize your local instance with cloud credentials. Create a <code>.env</code> file in the project root.</p>
                        <CodeBlock id="env-sample" label=".env" code={`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`} />
                    </Step>
                </div>
              )}
              
              {/* Other sections would follow same enhanced pattern... */}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
