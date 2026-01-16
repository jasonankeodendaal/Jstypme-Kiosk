
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
  const [activeTab, setActiveTab] = useState<'supabase' | 'apk' | 'ai' | 'pricelists' | 'build' | 'migration'>('supabase');
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
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 mb-8 overflow-x-auto">
        <div className="flex items-center min-w-[600px] justify-between gap-4">
            {[
                { icon: Code2, label: 'React Source', color: 'text-blue-400', status: 'done' },
                { icon: Container, label: 'Vite Build', color: 'text-purple-400', status: 'done' },
                { icon: Braces, label: 'Capacitor', color: 'text-yellow-400', status: 'active' },
                { icon: SmartphoneNfc, label: 'Android APK', color: 'text-green-400', status: 'pending' }
            ].map((step, i, arr) => (
                <div key={i} className="flex-1 flex items-center gap-2 group">
                    <div className="flex flex-col items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${step.status === 'active' ? 'bg-slate-800 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-slate-950 border-slate-800 ' + step.color}`}>
                            <step.icon size={20} className={step.status === 'active' ? 'animate-pulse' : ''} />
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{step.label}</div>
                            <div className="text-[9px] font-mono text-slate-500 mt-1">{step.status === 'done' ? 'Compiled' : step.status === 'active' ? 'Processing...' : 'Waiting'}</div>
                        </div>
                    </div>
                    {i < arr.length - 1 && (
                        <div className="flex-1 h-0.5 bg-slate-800 mx-2 relative overflow-hidden">
                            {step.status === 'done' && <div className="absolute inset-0 bg-green-500"></div>}
                            {step.status === 'active' && <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-white to-slate-800 animate-[shimmer_1s_infinite]"></div>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );

  const DiagramAIEngine = () => (
    <div className="relative h-56 bg-slate-950 rounded-3xl border border-purple-500/20 overflow-hidden mb-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.1)_0%,_transparent_70%)]"></div>
        <div className="flex items-center gap-4 md:gap-8 z-10 w-full max-w-3xl px-8">
            {/* Input */}
            <div className="w-1/4 bg-slate-900 border border-slate-700 p-3 rounded-xl opacity-60 scale-90">
                <div className="h-2 w-3/4 bg-slate-700 rounded mb-2"></div>
                <div className="h-2 w-full bg-slate-700 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
                <div className="mt-2 text-[8px] font-mono text-slate-500 uppercase text-center">Raw Specs</div>
            </div>

            <ArrowRight className="text-purple-900" size={20} />

            {/* BRAIN */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl animate-pulse"></div>
                <div className="w-24 h-24 bg-slate-900 rounded-full border-2 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] relative z-10">
                    <Bot size={40} className="text-purple-400" />
                    <Sparkles size={20} className="text-white absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="absolute bottom-0 text-[9px] font-black text-purple-400 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-purple-500/50">Gemini 1.5</div>
            </div>

            <ArrowRight className="text-purple-900" size={20} />

            {/* Output */}
            <div className="w-1/4 bg-slate-800 border border-green-500/30 p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                <div className="flex gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
                <div className="space-y-1">
                    <div className="flex gap-2"><span className="text-purple-400 text-[8px]">{`{`}</span></div>
                    <div className="flex gap-2 pl-2"><span className="text-blue-400 text-[8px]">"features":</span><span className="text-green-400 text-[8px]">[...]</span></div>
                    <div className="flex gap-2"><span className="text-purple-400 text-[8px]">{`}`}</span></div>
                </div>
            </div>
        </div>
    </div>
  );

  const DiagramPricing = () => {
      const [price, setPrice] = useState(799.99);
      useEffect(() => {
          const i = setInterval(() => {
              setPrice(prev => prev === 799.99 ? 800.00 : 799.99);
          }, 2000);
          return () => clearInterval(i);
      }, []);

      return (
        <div className="bg-slate-900 rounded-3xl p-8 border border-indigo-500/20 mb-8 flex flex-col md:flex-row items-center justify-center gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 rotate-12 pointer-events-none"><Calculator size={120} /></div>
            
            <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Input</div>
                <div className="text-4xl font-mono text-slate-400 line-through decoration-red-500/50 decoration-4">R 799.99</div>
            </div>

            <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                    <RefreshCw className="text-white animate-spin-slow" size={24} />
                </div>
                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded">Math Engine</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Output</div>
                <div className="text-6xl font-black font-mono text-green-400 tracking-tighter drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                    R {price.toFixed(2)}
                </div>
            </div>
        </div>
      );
  };

  const DiagramTroubleshoot = () => (
      <div className="bg-slate-950 p-8 rounded-[2rem] border border-red-500/20 relative overflow-hidden my-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
          <h3 className="text-red-400 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><AlertTriangle size={16}/> Emergency Recovery Protocol</h3>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              {[
                  { title: "Sync Failed?", steps: ["Check WiFi", "Restart App", "Check Cloud"] },
                  { title: "Media Missing?", steps: ["Storage Quota", "File Type", "Re-upload"] },
                  { title: "App Frozen?", steps: ["Watchdog Reset", "Clear Cache", "Reboot Device"] }
              ].map((item, i) => (
                  <div key={i} className="flex-1 bg-slate-900/50 p-4 rounded-xl border border-slate-800 w-full">
                      <div className="text-slate-200 font-bold uppercase text-xs mb-3 border-b border-slate-800 pb-2">{item.title}</div>
                      <div className="space-y-2">
                          {item.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                                  {step}
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
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
                      { id: 'supabase', label: 'Cloud Infrastructure', icon: Database, color: 'text-blue-400' },
                      { id: 'migration', label: 'Relational Migration', icon: DatabaseZap, color: 'text-orange-400' },
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
                              <div className="text-[9px] font-mono text-slate-600 uppercase">Module 0{['supabase','migration','apk','ai','build','pricelists'].indexOf(tab.id) + 1}</div>
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
                          <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Sync</span><span className="text-blue-400">Active</span></div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Ver</span><span className="text-slate-300">3.0.1</span></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
              <div className="max-w-4xl mx-auto pb-20">
                  
                  {activeTab === 'supabase' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Database} title="Cloud Core" subtitle="PostgreSQL Orchestration Layer" />
                          <DiagramCloudSync />
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                              <div>
                                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Bootstrap Protocol</h3>
                                  <p className="text-sm text-slate-400 leading-relaxed mb-6">Initialize the backend state using this SQL. This establishes the legacy monolithic storage and security policies.</p>
                                  <CodeSnippet 
                                    label="SQL Editor"
                                    id="sql-boot"
                                    code={`-- CORE TABLES
CREATE TABLE IF NOT EXISTS public.store_config (
  id bigint primary key default 1,
  data jsonb not null default '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.kiosks (
  id text primary key,
  name text not null,
  status text default 'online',
  last_seen timestamptz default now()
);

-- STORAGE & SECURITY
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kiosk-media', 'kiosk-media', true) 
ON CONFLICT DO NOTHING;

ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

-- SAFE POLICY CREATION
DROP POLICY IF EXISTS "Public Access" ON public.store_config;
CREATE POLICY "Public Access" ON public.store_config 
FOR ALL USING (true) WITH CHECK (true);`}
                                  />
                                  
                                  <div className="mt-8 border-t border-slate-800 pt-8">
                                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2"><Sparkles size={16} className="text-yellow-400"/> Feature Migrations</h3>
                                      <p className="text-xs text-slate-400 mb-4">Run these additional snippets to enable newer features like the <strong className="text-white">Pricelist Toggle</strong>.</p>
                                      <CodeSnippet 
                                        label="Fleet Update: Pricelists"
                                        id="sql-mig-fleet"
                                        code={`-- REPAIR/UPDATE FLEET TABLE
ALTER TABLE public.kiosks 
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS assigned_zone text,
ADD COLUMN IF NOT EXISTS wifi_strength int,
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS version text,
ADD COLUMN IF NOT EXISTS location_description text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS restart_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_pricelists boolean DEFAULT true;`}
                                      />
                                  </div>
                              </div>
                              <div className="space-y-6">
                                  <ArchitectNote title="Snapshot Strategy">
                                      We use a "Snapshot-First" architecture. Devices pull a massive JSON blob into local IndexedDB. This ensures <span className="text-white">Zero Latency</span> UI interactions, as the tablet never waits for a network request to render a product page.
                                  </ArchitectNote>
                                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                                      <div className="text-blue-400 text-xs font-black uppercase mb-2 flex items-center gap-2"><Lock size={14}/> Row Level Security (RLS)</div>
                                      <p className="text-[11px] text-slate-400 leading-relaxed">RLS acts as a firewall at the database row level. Even if the API key is exposed, the policies defined in SQL restrict what actions can be taken.</p>
                                  </div>
                              </div>
                          </div>
                          <DiagramTroubleshoot />
                      </div>
                  )}

                  {activeTab === 'migration' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={DatabaseZap} title="Normalization" subtitle="Relational Data Migration" />
                          <DiagramNormalization />
                          
                          <div className="mt-12 space-y-8">
                              <p className="text-slate-300 font-medium leading-relaxed border-l-2 border-orange-500 pl-4">
                                  The <span className="text-white font-bold">Monolith Strategy</span> (single JSON blob) fails when catalogue sizes exceed 10MB. 
                                  We must shatter the blob into relational tables (`brands`, `products`, `categories`) to enable granular syncing.
                              </p>

                              <CodeSnippet 
                                label="Migration SQL"
                                id="mig-sql"
                                code={`-- 1. SPLIT TABLES
CREATE TABLE IF NOT EXISTS public.brands (
  id text primary key,
  name text,
  logo_url text
);

CREATE TABLE IF NOT EXISTS public.categories (
  id text primary key,
  brand_id text references public.brands(id),
  name text,
  icon text
);

CREATE TABLE IF NOT EXISTS public.products (
  id text primary key,
  category_id text references public.categories(id),
  name text,
  specs jsonb default '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.pricelist_brands (
  id text primary key,
  name text,
  logo_url text
);

CREATE TABLE IF NOT EXISTS public.pricelists (
  id text primary key,
  brand_id text,
  title text,
  data jsonb default '{}'::jsonb
);

-- 2. ENABLE BATCH SYNC
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sync Access" ON public.products;
CREATE POLICY "Sync Access" ON public.products 
FOR ALL USING (true);`}
                              />
                          </div>
                      </div>
                  )}

                  {activeTab === 'apk' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={SmartphoneNfc} title="Native Compilation" subtitle="Android Hardware Bridge" />
                          <DiagramBuildPipeline />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                              <div>
                                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-6">
                                      <h4 className="text-green-400 font-black uppercase text-xs mb-4 flex items-center gap-2"><Terminal size={14}/> Build Sequence</h4>
                                      <ol className="space-y-4 relative border-l border-slate-800 ml-2 pl-6">
                                          {[
                                              { title: "Compile Web Assets", cmd: "npm run build" },
                                              { title: "Sync Capacitor", cmd: "npx cap sync android" },
                                              { title: "Open Android Studio", cmd: "npx cap open android" }
                                          ].map((step, i) => (
                                              <li key={i} className="relative">
                                                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                                                  <div className="text-white font-bold text-sm mb-1">{step.title}</div>
                                                  <code className="text-[10px] bg-black/50 px-2 py-1 rounded text-slate-400 font-mono">{step.cmd}</code>
                                              </li>
                                          ))}
                                      </ol>
                                  </div>
                              </div>
                              <div>
                                  <ArchitectNote title="Hardware Acceleration">
                                      Running as a native APK allows access to the Android <span className="text-yellow-400">WebView Hardware Layer</span>. This unlocks 60FPS scrolling and GPU-accelerated CSS animations that would stutter in a mobile Chrome browser tab.
                                  </ArchitectNote>
                                  
                                  <CodeSnippet 
                                    label="AndroidManifest.xml"
                                    id="xml-manifest"
                                    code={`<application
  android:hardwareAccelerated="true"
  android:usesCleartextTraffic="true">
  
  <activity 
    android:screenOrientation="sensorLandscape" 
    android:theme="@style/FullScreen"
  />
</application>`}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'ai' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Bot} title="Cognitive Engine" subtitle="Gemini 1.5 Integration" />
                          <DiagramAIEngine />
                          
                          <div className="mt-12">
                              <h3 className="text-white font-black uppercase text-xl mb-6">System Prompt Engineering</h3>
                              <div className="flex flex-col md:flex-row gap-8">
                                  <div className="flex-1">
                                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                                          The AI layer acts as a <span className="text-purple-400 font-bold">Data Sanitizer</span>. Retail data is often messy. We prompt Gemini to act as a "Luxury Copywriter" to standardize descriptions.
                                      </p>
                                      <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl">
                                          <div className="text-purple-300 text-[10px] font-black uppercase mb-2">Input Noise</div>
                                          <code className="text-xs text-slate-500 block">"SAMSUNG TV 65IN QLED 4K MODEL Q80C 2024 VER"</code>
                                      </div>
                                      <div className="flex justify-center my-2"><ArrowRight className="text-purple-500/50" /></div>
                                      <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                                          <div className="text-green-300 text-[10px] font-black uppercase mb-2">Clean Output</div>
                                          <code className="text-xs text-white block">"Samsung Q80C 65-inch QLED 4K Smart TV"</code>
                                      </div>
                                  </div>
                                  <div className="flex-1">
                                      <CodeSnippet 
                                        label="Prompt Payload"
                                        id="ai-prompt"
                                        code={`const prompt = \`
Analyze technical specs: \${rawSpecs}

Output JSON format:
{
  "marketing_copy": "Punchy, premium description",
  "key_features": ["Feature 1", "Feature 2", "Feature 3"],
  "compatibility": ["Item A", "Item B"]
}
\`;`}
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'pricelists' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Table} title="Price Logic" subtitle="Algorithmic Rounding Engine" />
                          <DiagramPricing />
                          
                          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                  <h3 className="text-white font-black uppercase text-sm mb-4">Psychological Rounding</h3>
                                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                      To maintain a premium aesthetic, we avoid "messy" prices like <span className="text-red-400 line-through">R 199.99</span>. The engine automatically ceilings decimals and bumps `.9` endings to the next integer.
                                  </p>
                                  <ul className="space-y-3">
                                      {[
                                          { in: "129.99", out: "130.00" },
                                          { in: "499.00", out: "500.00" },
                                          { in: "122.50", out: "123.00" }
                                      ].map((ex, i) => (
                                          <li key={i} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                                              <span className="font-mono text-slate-500">{ex.in}</span>
                                              <ArrowRight size={14} className="text-slate-700" />
                                              <span className="font-mono text-green-400 font-bold">{ex.out}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                              <div>
                                  <CodeSnippet 
                                    label="Rounding Algorithm"
                                    id="price-algo"
                                    code={`function formatPrice(val) {
  let n = parseFloat(val);
  
  // Ceiling Logic
  if (n % 1 !== 0) n = Math.ceil(n);
  
  // Psycho-Pricing Bump
  if (Math.floor(n) % 10 === 9) n += 1;
  
  return n.toLocaleString();
}`}
                                  />
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'build' && (
                      <div className="animate-fade-in">
                          <SectionHeader icon={Container} title="Asset Compiler" subtitle="Vite + Rollup Pipeline" />
                          
                          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl mb-12">
                              <h3 className="text-yellow-400 font-black uppercase text-sm mb-6 flex items-center gap-2"><Split size={16}/> Chunk Splitting Strategy</h3>
                              <div className="flex flex-col md:flex-row gap-8">
                                  <div className="flex-1 space-y-4">
                                      <p className="text-slate-400 text-sm leading-relaxed">
                                          To support legacy Android WebViews (v5.0 / Chrome 37), we cannot ship a single massive JS bundle. The compiler splits heavy libraries (`pdf.js`, `xlsx`) into separate chunks that load on-demand.
                                      </p>
                                      <div className="flex gap-2">
                                          <span className="text-[10px] font-black uppercase bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-500/20">Chrome 37 Target</span>
                                          <span className="text-[10px] font-black uppercase bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-500/20">ES5 Transpile</span>
                                      </div>
                                  </div>
                                  <div className="flex-1">
                                      <CodeSnippet 
                                        label="vite.config.ts"
                                        id="vite-conf"
                                        code={`manualChunks: {
  'heavy-pdf': ['pdfjs-dist', 'jspdf'],
  'heavy-data': ['xlsx', 'jszip'],
  'vendor': ['react', 'react-dom']
}`}
                                      />
                                  </div>
                              </div>
                          </div>
                          
                          <ArchitectNote title="Legacy Polyfills">
                              Older tablets lack modern JS features like `Promise` or `Map`. We inject <span className="text-white">core-js</span> and <span className="text-white">regenerator-runtime</span> directly into the HTML head to patch the environment before React even attempts to boot.
                          </ArchitectNote>
                      </div>
                  )}

              </div>
          </div>
      </div>
    </div>
  );
};

export default SetupGuide;
