
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, Thermometer, DatabaseZap, HardDriveDownload,
  // Add missing icons
  Grip, Shield, CheckCircle2, AlertTriangle, Terminal, ShieldAlert, Copy
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Custom R Icon for Pricelists
const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

// --- SYSTEM DOCUMENTATION COMPONENT ---
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    const [roundDemoValue, setRoundDemoValue] = useState(799);

    // Added missing helper components
    const EngineerNote = ({ children }: any) => (
      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 my-6 shadow-inner text-left">
          <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-[9px] tracking-[0.2em] mb-3">
              <Cpu size={14} /> Low-Level System Note
          </div>
          <div className="text-xs leading-relaxed font-mono">
              {children}
          </div>
      </div>
    );

    const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => {
      const [isCopied, setIsCopied] = useState(false);
      const copyToClipboard = (text: string) => {
          navigator.clipboard.writeText(text);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      };
  
      return (
          <div className="my-6 relative group text-left">
            {label && <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 px-1"><Terminal size={12}/> {label}</div>}
            <div className="bg-slate-950 rounded-2xl p-6 overflow-x-auto relative shadow-2xl border border-slate-800/50">
              <code className="font-mono text-xs md:text-sm text-blue-300 whitespace-pre-wrap break-all block leading-relaxed">{code}</code>
              <button 
                onClick={() => copyToClipboard(code)}
                className="absolute top-4 right-4 p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl text-white transition-all border border-white/5 group-active:scale-95 shadow-lg"
                title="Copy Script"
              >
                {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="opacity-40 group-hover:opacity-100" />}
              </button>
            </div>
          </div>
      );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setRoundDemoValue(prev => {
                if (prev === 799) return 4449.99;
                if (prev === 4449.99) return 122;
                if (prev === 122) return 89.95;
                return 799;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'pricelists', label: 'Pricelist Engine', icon: <Table size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash { to { stroke-dashoffset: -20; } }
                .animate-dash { animation: dash 1s linear infinite; }
                @keyframes flow { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(100px); opacity: 0; } }
                .packet { animation: flow 2s infinite ease-in-out; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
                .radar-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
                @keyframes scroll-film { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .film-strip { animation: scroll-film 10s linear infinite; }
                @keyframes data-flow { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(120px); opacity: 0; } }
                .data-packet { animation: data-flow 2s infinite linear; }
                @keyframes heartbeat { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
                .animate-hb { animation: heartbeat 2s ease-in-out infinite; }
                @keyframes rotate-gear { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-gear { animation: rotate-gear 10s linear infinite; }
                @keyframes scan-line { 0% { top: 0%; } 100% { top: 100%; } }
                .scan-bar { animation: scan-line 3s linear infinite; }
                @keyframes float-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-float-subtle { animation: float-subtle 4s ease-in-out infinite; }
            `}</style>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
                <div className="mb-6 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Manual</h3>
                    <p className="text-[10px] text-slate-500 font-medium">v2.5 Technical Reference</p>
                </div>
                <div className="space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'
                            }`}
                        >
                            <span className={activeSection === section.id ? 'opacity-100' : 'opacity-70'}>
                                {section.icon}
                            </span>
                            <span className="text-xs uppercase tracking-wide">{section.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white scroll-smooth relative">
                
                {activeSection === 'architecture' && (
                    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-8">
                            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">Core Protocol</div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                                <Network className="text-blue-600" size={40} /> Hybrid Cloud Engine
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">A high-performance "Local-First" architecture designed for mission-critical retail stability.</p>
                        </div>

                        {/* Visual Logic: Persistence Stack */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-7 space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <ShieldCheck size={24} className="text-green-500" /> Resilience Hierarchy
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><HardDrive size={24} className="text-blue-600" /></div>
                                            <div>
                                                <div className="font-black text-slate-900 uppercase text-xs mb-1">Layer 01: IndexedDB / LocalStorage</div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Bootstraps the entire app in &lt;100ms. All inventory, brands, and settings are cached on the device's silicon. The kiosk can run for weeks with zero internet connection.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Zap size={24} className="text-purple-600" /></div>
                                            <div>
                                                <div className="font-black text-slate-900 uppercase text-xs mb-1">Layer 02: Service Worker Proxy</div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Intercepts all network requests. Assets (Images/PDFs) are automatically cached upon first view. If the cloud is offline, the worker serves the cached binary stream instantly.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Cloud size={24} className="text-green-600" /></div>
                                            <div>
                                                <div className="font-black text-slate-900 uppercase text-xs mb-1">Layer 03: Supabase Sync Hub</div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Real-time bi-directional sync. Updates made in the Admin Hub are pushed to devices via WebSockets. Telemetry (battery, wifi, uptime) is sent back every 60s.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-5 bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl h-full flex flex-col justify-center border border-white/5">
                                <div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500 animate-gear"><Settings size={160} /></div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                                        <div className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Real-Time Sync Protocol</div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                                                <div className="text-[8px] text-blue-400 font-black uppercase mb-1">Tablet</div>
                                                <div className="text-white font-bold text-xs font-mono">CLIENT</div>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center">
                                                <div className="w-full h-0.5 bg-white/10 relative">
                                                    <div className="absolute top-1/2 left-0 h-2 w-2 bg-blue-400 rounded-full -translate-y-1/2 packet"></div>
                                                </div>
                                                <div className="text-[7px] text-slate-500 font-mono mt-2 uppercase tracking-widest">TLS 1.3 / JSONB</div>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                                                <div className="text-[8px] text-green-400 font-black uppercase mb-1">Supabase</div>
                                                <div className="text-white font-bold text-xs font-mono">HUB</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-900/30 rounded-xl border border-blue-500/20">
                                        <p className="text-[10px] text-blue-200 leading-relaxed font-bold italic uppercase">"Zero-Request UI: The app never waits for the cloud to render a screen. The local cache is the source of truth."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-8">
                            <div className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-orange-100">Data Integrity</div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                                <Box className="text-orange-600" size={40} /> Inventory Logic
                            </h2>
                            <p className="text-slate-500 font-medium text-lg">Strict hierarchical validation and SKU conflict management.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                        <Grip size={22} className="text-orange-500" /> Hierarchical Validation
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">The system enforces a **Non-Dangling Node** policy. Every product must resolve to a valid Category, and every category to a Brand.</p>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 overflow-hidden relative group">
                                        <div className="absolute inset-0 scan-bar bg-orange-500/5 h-1 pointer-events-none"></div>
                                        <div className="space-y-3 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black">B</div>
                                                <div className="text-xs font-black uppercase text-slate-900 tracking-wider">Brand Container</div>
                                            </div>
                                            <div className="ml-4 flex items-center gap-3 opacity-80">
                                                <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-black">C</div>
                                                <div className="text-xs font-black uppercase text-slate-900 tracking-wider">Category Child</div>
                                            </div>
                                            <div className="ml-8 flex items-center gap-3 opacity-60">
                                                <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center font-black">P</div>
                                                <div className="text-xs font-black uppercase text-slate-900 tracking-wider">Product Leaf</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                        <Shield size={22} className="text-red-500" /> SKU Collision Engine
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">To prevent inventory duplication, the dashboard implements a **Global Registry Check** during product creation.</p>
                                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Duplicate Scan</div>
                                            <div className="text-[9px] font-mono text-green-400">READY</div>
                                        </div>
                                        <div className="font-mono text-xs text-blue-300 space-y-1">
                                            <div>&gt; Input: "SKU-PRO-MAX"</div>
                                            <div>&gt; Scanning Global JSON...</div>
                                            <div className="text-red-400 font-black">&gt; MATCH FOUND: Brand[Sony] Cat[TV]</div>
                                            <div className="animate-pulse">&gt; ERROR: ConstraintViolation[UniqueSKU]</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 flex flex-col gap-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Media Transformation</h3>
                                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><ImageIcon size={20}/></div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-slate-900">Lazy Loading</div>
                                            <p className="text-[10px] text-slate-500 font-medium">Gallery images utilize the <code>intersection-observer</code> API. High-bitrate videos are only fetched when the user navigates into a specific product context.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0"><Cloud size={20}/></div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-slate-900">Asset Deduplication</div>
                                            <p className="text-[10px] text-slate-500 font-medium">The system hashes file names. If a product cover is identical to a gallery image, only one binary record is maintained in the CDN.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="bg-orange-600 text-white p-6 rounded-3xl shadow-xl shadow-orange-900/20">
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">System Constraint</div>
                                        <div className="text-sm font-bold leading-relaxed italic">"Maximum of 5 comparison items per session to prevent RAM overflow on budget tablet hardware."</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-8">
                            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-green-100">Intelligent Parser</div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                                <Table className="text-green-600" size={40} /> Pricelist Logic Engine
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">Automated normalization from raw vendor XLSX into consumer-ready high-DPI documents.</p>
                        </div>

                        {/* Animated Processing Flow */}
                        <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                 {/* Stage 1 */}
                                 <div className="flex flex-col items-center gap-4 text-center group">
                                     <div className="w-24 h-24 bg-white/5 rounded-[2rem] border-2 border-green-500/30 flex items-center justify-center group-hover:border-green-400 transition-all animate-float-subtle">
                                         <FileSpreadsheet size={44} className="text-green-400" />
                                     </div>
                                     <div className="space-y-1">
                                         <div className="text-white font-black uppercase text-[10px] tracking-widest">Stage 01</div>
                                         <div className="text-slate-500 font-mono text-[9px]">Raw Binary Stream</div>
                                     </div>
                                 </div>
                                 <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden rounded-full"><div className="absolute inset-0 bg-blue-500 data-packet"></div></div>
                                 {/* Stage 2 */}
                                 <div className="flex flex-col items-center gap-4 text-center group">
                                     <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] relative">
                                         <div className="absolute inset-0 radar-ring border-2 border-blue-400 rounded-[2rem]"></div>
                                         <RIcon size={44} className="text-white" />
                                     </div>
                                     <div className="space-y-1">
                                         <div className="text-white font-black uppercase text-[10px] tracking-widest">Stage 02</div>
                                         <div className="text-blue-400 font-mono text-[9px]">Normalizer Core</div>
                                     </div>
                                 </div>
                                 <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden rounded-full"><div className="absolute inset-0 bg-purple-500 data-packet" style={{animationDelay: '1s'}}></div></div>
                                 {/* Stage 3 */}
                                 <div className="flex flex-col items-center gap-4 text-center group">
                                     <div className="w-24 h-24 bg-white/5 rounded-[2rem] border-2 border-purple-500/30 flex items-center justify-center">
                                         <div className="grid grid-cols-2 gap-1 scale-90">
                                            <Tablet size={18} className="text-purple-400" /><Smartphone size={18} className="text-purple-400" />
                                            <Tv size={18} className="text-purple-400" /><FileText size={18} className="text-red-400" />
                                         </div>
                                     </div>
                                     <div className="space-y-1">
                                         <div className="text-white font-black uppercase text-[10px] tracking-widest">Stage 03</div>
                                         <div className="text-purple-400 font-mono text-[9px]">Distribution Layer</div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <Sparkles size={22} className="text-orange-500" /> Cognitive Normalization
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">To maintain a high-end luxury feel, the engine automatically rounds prices to "clean" numbers. Decimals are rounded UP, and values ending in 9 are pushed to the next base-10 integer.</p>
                                <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-500">RAW DATA</span>
                                        <span className="text-slate-500">ENGINE OUTPUT</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 font-mono text-red-400/60 line-through">R 4,249.99</div>
                                        <ArrowRight size={18} className="text-slate-700" />
                                        <div className="flex-1 bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/30 font-mono text-white font-black text-center animate-hb">R 4,250</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 font-mono text-red-400/60 line-through">R 199.00</div>
                                        <ArrowRight size={18} className="text-slate-700" />
                                        <div className="flex-1 bg-white/10 p-3 rounded-xl font-mono text-white font-black text-center">R 200</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <Search size={22} className="text-blue-500" /> Weighted Header Mapping
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">The engine uses a **Semantic Scorer** to find data columns regardless of their order in the XLSX file.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <div className="text-[10px] font-black text-blue-800 uppercase mb-2">Target: SKU</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['sku', 'part_no', 'item_code', 'model_id'].map(k => <span key={k} className="px-2 py-1 bg-white border border-blue-200 rounded text-[8px] font-mono text-blue-600">{k}</span>)}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                                        <div className="text-[10px] font-black text-purple-800 uppercase mb-2">Target: PRICE</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['price', 'retail', 'msrp', 'unit_cost'].map(k => <span key={k} className="px-2 py-1 bg-white border border-purple-200 rounded text-[8px] font-mono text-purple-600">{k}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <EngineerNote>
                                    Column detection skips the first 5 rows to account for vendor-branded headers or empty whitespace common in spreadsheet templates.
                                </EngineerNote>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-8">
                            <div className="inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-yellow-100">Marketing Intelligence</div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                                <Zap className="text-yellow-500" size={40} /> Screensaver Engine
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">A probabilistic content scheduler designed to maximize engagement through weighted shuffling.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 text-white animate-pulse"><Monitor size={120}/></div>
                                    <div className="relative z-10 space-y-6">
                                        <h3 className="text-white font-black uppercase tracking-widest text-sm">Playlist Generation Algorithm</h3>
                                        <div className="space-y-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">01</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-bold text-sm uppercase">Content Ingestion</div>
                                                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Brands + Catalogues + Custom Ads</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">02</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-bold text-sm uppercase">Probabilistic Weighting</div>
                                                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Apply 3.0x Multiplier to Sponsored content</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">03</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-bold text-sm uppercase">Fisher-Yates Shuffle</div>
                                                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Generate high-entropy sequence for display</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><History size={18}/></div>
                                            <div className="text-xs font-black uppercase tracking-wider text-slate-900">Aging Logic</div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Products older than 6 months undergo a **Probabilistic Filter**. They only have a 25% chance of appearing in the daily shuffle, ensuring the clipboard stays focused on fresh hardware.</p>
                                    </div>
                                    <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Moon size={18}/></div>
                                            <div className="text-xs font-black uppercase tracking-wider text-slate-900">Sleep Protocol</div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Outside of **Active Hours**, the screen enters a "Deep Black" state. All timers pause and media decoders are released to system memory to prolong hardware longevity.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col">
                                <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 flex-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Cycle Distribution</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Sponsored Ads</span><span className="text-blue-600">60%</span></div>
                                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex"><div className="w-[60%] h-full bg-blue-600"></div></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">New Products</span><span className="text-purple-600">30%</span></div>
                                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex"><div className="w-[30%] h-full bg-purple-600"></div></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Legacy Content</span><span className="text-slate-400">10%</span></div>
                                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex"><div className="w-[10%] h-full bg-slate-400"></div></div>
                                        </div>
                                    </div>
                                    <div className="mt-12 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 animate-hb"><Thermometer size={24}/></div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-slate-900 uppercase mb-1">Burn-In Prevention</div>
                                            <p className="text-[9px] text-slate-500 leading-relaxed">Images utilize a "Floating Ken Burns" effect. Elements never stay static for more than 500ms.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-8">
                            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">Telemetry Engine</div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                                <Activity className="text-blue-600" size={40} /> Fleet Telemetry Layer
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">Real-time health monitoring and remote orchestration of geographically distributed hardware.</p>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 radar-ring border-4 border-blue-500/10 rounded-full scale-[2.5] -top-1/2 -right-1/2"></div>
                             <div className="absolute inset-0 radar-ring border-4 border-blue-500/10 rounded-full scale-[1.5] -top-1/4 -right-1/4 animate-hb"></div>
                             
                             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                 <div className="space-y-6">
                                     <div className="flex items-center gap-4">
                                         <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.5)]"><Signal size={32}/></div>
                                         <div>
                                             <h3 className="text-white font-black uppercase text-lg tracking-tight">Active Pulse</h3>
                                             <div className="flex items-center gap-2 text-green-400 text-[10px] font-mono"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> HEARTBEAT: 60s INTERVAL</div>
                                         </div>
                                     </div>
                                     <div className="space-y-3">
                                         <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 font-mono text-[10px]">
                                             <span className="text-slate-400 uppercase">Uptime</span>
                                             <span className="text-white font-bold">14d 22h 11m</span>
                                         </div>
                                         <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 font-mono text-[10px]">
                                             <span className="text-slate-400 uppercase">Memory Load</span>
                                             <span className="text-blue-400 font-bold">182MB / 512MB</span>
                                         </div>
                                         <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 font-mono text-[10px]">
                                             <span className="text-slate-400 uppercase">Signal Strength</span>
                                             <span className="text-green-400 font-bold">-42 dBm (Excellent)</span>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-black/40 rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
                                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Remote Command Queue</div>
                                     <div className="space-y-4 font-mono text-[11px]">
                                         <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg text-blue-300">
                                            <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5"/>
                                            <span>CMD: RESTART_CLIENT - Status: ACKNOWLEDGED</span>
                                         </div>
                                         <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg text-purple-300">
                                            <Clock size={14} className="text-purple-400 shrink-0 mt-0.5"/>
                                            <span>CMD: PUSH_UPDATE_V2.1 - Status: PENDING_IDLE</span>
                                         </div>
                                         <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg text-orange-300">
                                            <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5"/>
                                            <span>CMD: CLEAR_CACHE - Status: RETRY_LIMIT_EXCEEDED</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <CloudLightning size={22} className="text-blue-500" /> Command Execution Flow
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">To bypass restrictive firewalls, we use a **Polling Command Fetch** strategy. The client "asks" for commands during its heartbeat, rather than the server trying to "push" to a device behind a NAT router.</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-blue-600">1</div>
                                        <div className="text-xs font-bold text-slate-700">Admin sets <code>restart_requested = true</code> in database.</div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-blue-600">2</div>
                                        <div className="text-xs font-bold text-slate-700">Kiosk sends 60s heartbeat with telemetry packet.</div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-blue-600">3</div>
                                        <div className="text-xs font-bold text-slate-700">Server response includes <code>restart: true</code> flag.</div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-blue-600">4</div>
                                        <div className="text-xs font-bold text-slate-700">JavaScript executes <code>window.location.reload()</code>.</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Terminal size={22} className="text-slate-400" />
                                    <h3 className="text-lg font-black text-slate-900 uppercase">Heartbeat Schema</h3>
                                </div>
                                <CodeBlock 
                                  id="heartbeat-code"
                                  label="Telemetry Interface"
                                  code={`interface Heartbeat {
  id: string; // Device ID
  status: 'online' | 'offline';
  last_seen: ISO8601;
  metrics: {
    wifi: number; // dBm
    ip: string;
    v: string; // Build version
    load: number; // Percent
  }
}`} />
                                <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-2 text-red-600 font-black text-[10px] uppercase">
                                        <ShieldAlert size={14}/> Forensic Cleanup
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">If a device fails to pulse for more than 1 hour, its status is automatically flagged as "CRITICAL" and triggered for Admin alert.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-8">
                            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">Broadcast Protocol</div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                                <Tv className="text-indigo-600" size={40} /> TV Mode Logic
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">Specialized routing for high-impact, non-interactive visual walls and digital signage.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-8 space-y-8">
                                <div className="bg-black rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-white/5 flex flex-col items-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent"></div>
                                    <div className="film-strip flex gap-6 absolute top-0 bottom-0 py-8 opacity-20 pointer-events-none">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="w-56 h-full bg-slate-800 rounded-3xl border-x-4 border-dashed border-slate-700 flex items-center justify-center">
                                                <Play size={40} className="text-white opacity-20" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative z-10 w-full max-w-lg aspect-video bg-slate-900 rounded-3xl shadow-2xl border-4 border-white/5 overflow-hidden flex flex-col">
                                        <div className="flex-1 flex items-center justify-center">
                                            <Play size={64} fill="currentColor" className="text-white drop-shadow-2xl animate-pulse" />
                                        </div>
                                        <div className="h-1 bg-blue-500 w-[65%]"></div>
                                        <div className="p-4 bg-black/80 flex justify-between items-center">
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-blue-400 font-black uppercase">Now Playing</div>
                                                <div className="text-xs text-white font-bold uppercase">SAMSUNG OLED 8K - HERO VIDEO 02</div>
                                            </div>
                                            <div className="bg-white/10 px-3 py-1 rounded text-[9px] font-black text-white uppercase">4K / 60FPS</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                            <Lock size={22} className="text-indigo-500" /> Non-Interactive Protocol
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">When a device type is set to **TV**, the app hides the standard interactive UI (Headers, Footers, Back Buttons) to prevent customers from tampering with the broadcast.</p>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-3 text-xs font-bold text-slate-700"><CheckCircle2 size={16} className="text-indigo-500" /> Navigation Layer: <code>display: none</code></li>
                                            <li className="flex items-center gap-3 text-xs font-bold text-slate-700"><CheckCircle2 size={16} className="text-indigo-500" /> Orientation Lock: <code>aspect-ratio: 16/9</code></li>
                                            <li className="flex items-center gap-3 text-xs font-bold text-slate-700"><CheckCircle2 size={16} className="text-indigo-500" /> Interaction Overlay: Fades after 4s</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                            <VolumeX size={22} className="text-red-500" /> Browser Autoplay Policy
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">Modern browsers prohibit sound on page load. TV Mode utilizes a **Muted-Init** strategy to ensure the video loops start immediately without waiting for a user gesture.</p>
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col gap-2">
                                            <div className="text-[10px] font-black uppercase text-indigo-800">Unlocking Audio</div>
                                            <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">Staff can "Unlock Sound" by tapping the screen once. This initializes the `AudioContext` which then persists for all subsequent loop iterations.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 space-y-8 flex flex-col">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2"><LayoutGrid size={20} className="text-indigo-500"/> Channel Logic</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="text-[10px] font-black uppercase text-indigo-600 mb-1">Global Channel</div>
                                            <p className="text-[9px] text-slate-500 font-medium">Shuffles every video from every model into one massive multi-brand loop.</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="text-[10px] font-black uppercase text-indigo-600 mb-1">Brand Channel</div>
                                            <p className="text-[9px] text-slate-500 font-medium">Targeted loop for specific hardware sections (e.g. only Samsung TVs).</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="text-[10px] font-black uppercase text-indigo-600 mb-1">Model Focus</div>
                                            <p className="text-[9px] text-slate-500 font-medium">Infinite loop for single-product hero displays.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto bg-slate-900 rounded-3xl p-6 text-white text-center">
                                    <div className="flex justify-center mb-4"><RotateCcw size={32} className="text-indigo-400 animate-spin" style={{animationDuration: '5s'}} /></div>
                                    <div className="text-[10px] font-black uppercase mb-1">Zero-Black-Frame Loop</div>
                                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed">The player pre-loads the "Next" video index while the current one is still playing to ensure gapless transitions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ... Rest of the file (Auth, FileUpload, InputField, CatalogueManager, ManualPricelistEditor, PricelistManager, ProductEditor, KioskEditorModal, MoveProductModal, TVModelEditor, AdminManager, AdminDashboard) remains the same as provided ...

// ... AUTH COMPONENT ...
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !pin.trim()) {
        setError('Please enter both Name and PIN.');
        return;
    }

    const admin = admins.find(a => 
        a.name.toLowerCase().trim() === name.toLowerCase().trim() && 
        a.pin === pin.trim()
    );

    if (admin) {
        onLogin(admin);
    } else {
        setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label>
              <input 
                 className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" 
                 type="text" 
                 placeholder="Name" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
                 autoFocus 
              />
          </div>
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label>
              <input 
                 className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" 
                 type="password" 
                 placeholder="####" 
                 value={pin} 
                 onChange={(e) => setPin(e.target.value)} 
              />
          </div>
          
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}

          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button>
        </form>
      </div>
    </div>
  );
};

const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false }: any) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      setUploadProgress(10); 
      const files = Array.from(e.target.files) as File[];
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';

      const readFileAsBase64 = (file: File): Promise<string> => {
          return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
          });
      };

      const uploadSingle = async (file: File) => {
           const localBase64 = await readFileAsBase64(file);
           try {
              const url = await uploadFileToStorage(file);
              return { url, base64: localBase64 };
           } catch (e) {
              return { url: localBase64, base64: localBase64 };
           }
      };

      try {
          if (allowMultiple) {
              const results: string[] = [];
              const base64s: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const res = await uploadSingle(files[i]);
                  results.push(res.url);
                  base64s.push(res.base64);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results, fileType, base64s);
          } else {
              const res = await uploadSingle(files[0]);
              setUploadProgress(100);
              onUpload(res.url, fileType, res.base64);
          }
      } catch (err) { alert("Upload error"); } 
      finally { setTimeout(() => { setIsProcessing(false); setUploadProgress(0); }, 500); }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
           {isProcessing ? (
               <Loader2 className="animate-spin text-blue-500" /> 
           ) : currentUrl && !allowMultiple ? (
               accept.includes('video') ? <Video className="text-blue-500" size={16} /> : 
               accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : 
               accept.includes('audio') ? (
                  <div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600">
                      <Music size={16} />
                  </div>
               ) : 
               <img src={currentUrl} className="w-full h-full object-contain" />
           ) : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50' : ''}`}>
              <Upload size={10} className="inline mr-1" /> {isProcessing ? '...' : 'Select'}
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);

    const handleUpdate = (newList: Catalogue[]) => {
        setLocalList(newList);
        onSave(newList); 
    };

    const addCatalogue = () => {
        handleUpdate([...localList, {
            id: generateId('cat'),
            title: brandId ? 'New Brand Catalogue' : 'New Pamphlet',
            brandId: brandId,
            type: brandId ? 'catalogue' : 'pamphlet', 
            pages: [],
            year: new Date().getFullYear(),
            startDate: '',
            endDate: ''
        }]);
    };

    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => {
        handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (
                                <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> 
                            ) : (
                                <BookOpen size={32} className="text-slate-300" />
                            )}
                            {cat.pdfUrl && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>
                            )}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            
                            {cat.type === 'catalogue' || brandId ? (
                                <div>
                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label>
                                    <input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label>
                                        <input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label>
                                        <input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" />
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <FileUpload 
                                    label="Thumbnail (Image)" 
                                    accept="image/*" 
                                    currentUrl={cat.thumbnailUrl || (cat.pages?.[0])}
                                    onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} 
                                />
                                <FileUpload 
                                    label="Document (PDF)" 
                                    accept="application/pdf" 
                                    currentUrl={cat.pdfUrl}
                                    icon={<FileText />}
                                    onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} 
                                />
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete Catalogue</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [isImporting, setIsImporting] = useState(false);
  
  const addItem = () => {
    setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '' }]);
  };

  const updateItem = (id: string, field: keyof PricelistItem, val: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value) return;
    const numericPart = value.replace(/[^0-9.]/g, '');
    if (!numericPart) {
        if (value && !value.startsWith('R ')) {
            updateItem(id, field, `R ${value}`);
        }
        return;
    }
    let num = parseFloat(numericPart);
    if (num % 1 !== 0) num = Math.ceil(num);
    if (Math.floor(num) % 10 === 9) num += 1;
    const formatted = `R ${num.toLocaleString()}`;
    updateItem(id, field, formatted);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) {
            alert("The selected file appears to be empty.");
            return;
        }
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        if (validRows.length === 0) {
            alert("No data rows found in the file.");
            return;
        }
        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const findIdx = (keywords: string[]) => firstRow.findIndex(h => keywords.some(k => h.includes(k)));
        const skuIdx = findIdx(['sku', 'code', 'part', 'model']);
        const descIdx = findIdx(['desc', 'name', 'product', 'item', 'title']);
        const normalIdx = findIdx(['normal', 'retail', 'price', 'standard', 'cost']);
        const promoIdx = findIdx(['promo', 'special', 'sale', 'discount', 'deal']);
        const hasHeader = skuIdx !== -1 || descIdx !== -1 || normalIdx !== -1;
        const dataRows = hasHeader ? validRows.slice(1) : validRows;
        const sIdx = skuIdx !== -1 ? skuIdx : 0;
        const dIdx = descIdx !== -1 ? descIdx : 1;
        const nIdx = normalIdx !== -1 ? normalIdx : 2;
        const pIdx = promoIdx !== -1 ? promoIdx : 3;
        const newImportedItems: PricelistItem[] = dataRows.map(row => {
            const formatImported = (val: string) => {
                if (!val) return '';
                const numeric = String(val).replace(/[^0-9.]/g, '');
                if (!numeric) return String(val);
                let n = parseFloat(numeric);
                if (n % 1 !== 0) n = Math.ceil(n);
                if (Math.floor(n) % 10 === 9) n += 1;
                return `R ${n.toLocaleString()}`;
            };
            return {
                id: generateId('imp'),
                sku: String(row[sIdx] || '').trim().toUpperCase(),
                description: String(row[dIdx] || '').trim(),
                normalPrice: formatImported(row[nIdx]),
                promoPrice: row[pIdx] ? formatImported(row[pIdx]) : ''
            };
        });
        if (newImportedItems.length > 0) {
            const userChoice = confirm(`Parsed ${newImportedItems.length} items.\n\nOK -> UPDATE existing SKUs and ADD new ones (Merge).\nCANCEL -> REPLACE entire current list.`);
            if (userChoice) {
                const merged = [...items];
                const onlyNew: PricelistItem[] = [];
                newImportedItems.forEach(newItem => {
                    const existingIdx = merged.findIndex(curr => curr.sku && newItem.sku && curr.sku.trim().toUpperCase() === newItem.sku.trim().toUpperCase());
                    if (existingIdx > -1) {
                        merged[existingIdx] = { ...merged[existingIdx], description: newItem.description || merged[existingIdx].description, normalPrice: newItem.normalPrice || merged[existingIdx].normalPrice, promoPrice: newItem.promoPrice || merged[existingIdx].promoPrice };
                    } else {
                        onlyNew.push(newItem);
                    }
                });
                setItems([...merged, ...onlyNew]);
            } else {
                setItems(newImportedItems);
            }
        }
    } catch (err) { alert("Error parsing file."); } finally { setIsImporting(false); e.target.value = ''; }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2"><Table className="text-blue-600" size={24} /> Pricelist Builder</h3>
            <p className="text-xs text-slate-500 font-bold uppercase">{pricelist.title} ({pricelist.month} {pricelist.year})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel/CSV
              <input type="file" className="hidden" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} />
            </label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg">
              <Plus size={16} /> Add Row
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Normal Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Promo Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU-123" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="Product details..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg flex items-center gap-2">
              <Save size={16} /> Save Pricelist Table
          </button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: { pricelists: Pricelist[], pricelistBrands: PricelistBrand[], onSavePricelists: (p: Pricelist[]) => void, onSaveBrands: (b: PricelistBrand[]) => void, onDeletePricelist: (id: string) => void }) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    useEffect(() => { if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null); }, [sortedBrands]);
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const sortedLists = [...filteredLists].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });
    const addBrand = () => { const name = prompt("Enter Brand Name:"); if (name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name, logoUrl: '' }]); };
    const updateBrand = (id: string, updates: Partial<PricelistBrand>) => onSaveBrands(pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b));
    const deleteBrand = (id: string) => { if (confirm("Delete this brand?")) onSaveBrands(pricelistBrands.filter(b => b.id !== id)); };
    const addPricelist = () => { if (selectedBrand) onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: new Date().getFullYear().toString(), dateAdded: new Date().toISOString() }]); };
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2>
                     <button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div><div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Brand Name" />
                                     <FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url })} />
                                     <button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }} className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete Brand</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3>
                     <button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 content-start">
                     {sortedLists.map((item) => (
                         <div key={item.id} className={`rounded-xl border shadow-sm p-3 flex flex-col gap-2 relative bg-white border-slate-200`}>
                             <input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs" placeholder="Title" />
                             <div className="grid grid-cols-2 gap-2">
                                 <select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-white border border-slate-200 rounded">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                 <input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-white border border-slate-200 rounded" />
                             </div>
                             <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                                 <button onClick={() => updatePricelist(item.id, { type: 'pdf' })} className={`py-1 text-[9px] font-black uppercase rounded flex items-center justify-center gap-1 ${item.type !== 'manual' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><FileText size={10}/> PDF</button>
                                 <button onClick={() => updatePricelist(item.id, { type: 'manual' })} className={`py-1 text-[9px] font-black uppercase rounded flex items-center justify-center gap-1 ${item.type === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><List size={10}/> TABLE</button>
                             </div>
                             {item.type === 'manual' ? <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2">Open Builder</button> : <div className="grid grid-cols-2 gap-2"><FileUpload label="Thumb" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url })} /><FileUpload label="PDF" accept="application/pdf" currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url })} /></div>}
                             <button onClick={() => onDeletePricelist(item.id)} className="mt-auto pt-2 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                         </div>
                     ))}
                 </div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl })} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []), videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() });
    const [newFeature, setNewFeature] = useState('');
    const [newBoxItem, setNewBoxItem] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };
    const updateManual = (id: string, updates: Partial<Manual>) => setDraft({ ...draft, manuals: (draft.manuals || []).map(m => m.id === id ? { ...m, ...updates } : m) });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3><button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        <InputField label="Warranty & Terms" isArea val={draft.terms || ''} onChange={(e: any) => setDraft({ ...draft, terms: e.target.value })} />
                    </div>
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Gallery</label>
                            <FileUpload label="Add Images" allowMultiple onUpload={(urls: any) => setDraft(prev => ({ ...prev, galleryUrls: [...(prev.galleryUrls || []), ...urls] }))} />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Features</label>
                             <div className="flex gap-2 mb-2"><input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add..." onKeyDown={(e) => e.key === 'Enter' && addFeature()} /><button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button></div>
                             <ul className="space-y-1">{draft.features.map((f, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold">{f}<button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Confirm Changes</button></div>
        </div>
    );
};

const KioskEditorModal = ({ kiosk, onSave, onClose }: { kiosk: KioskRegistry, onSave: (k: KioskRegistry) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-black text-slate-900 uppercase">Edit Device</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div>
                <div className="p-6 space-y-4"><InputField label="Device Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} /><InputField label="Zone" val={draft.assignedZone || ''} onChange={(e:any) => setDraft({...draft, assignedZone: e.target.value})} /></div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Changes</button></div>
            </div>
        </div>
    );
};

const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: { product: Product, allBrands: Brand[], currentBrandId: string, currentCategoryId: string, onClose: () => void, onMove: (p: Product, b: string, c: string) => void }) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);
    const targetBrand = allBrands.find(b => b.id === targetBrandId);
    useEffect(() => { if (targetBrand && !targetBrand.categories.find(c => c.id === targetCategoryId)) { if (targetBrand.categories.length > 0) setTargetCategoryId(targetBrand.categories[0].id); } }, [targetBrandId]);
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-black text-slate-900 uppercase">Move Product</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div>
                <div className="p-6 space-y-4"><select value={targetBrandId} onChange={(e) => setTargetBrandId(e.target.value)} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold">{allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select><select value={targetCategoryId} onChange={(e) => setTargetCategoryId(e.target.value)} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold">{targetBrand?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onMove(product, targetBrandId, targetCategoryId)} className="px-6 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl">Confirm Move</button></div>
            </div>
        </div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: { model: TVModel, onSave: (m: TVModel) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><h3 className="font-black text-slate-900 uppercase">Edit TV Model</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <InputField label="Model Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                    <FileUpload label="Cover Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} />
                    <FileUpload label="Add Videos" accept="video/*" allowMultiple onUpload={(urls: any) => setDraft(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ...urls] }))} />
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Model</button></div>
            </div>
        </div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true });
    const handleAddOrUpdate = () => { if (!newName || !newPin) return alert("Name/PIN required"); const updated = editingId ? admins.map(a => a.id === editingId ? { ...a, name: newName, pin: newPin, permissions: newPermissions } : a) : [...admins, { id: generateId('adm'), name: newName, pin: newPin, isSuperAdmin: false, permissions: newPermissions }]; onUpdate(updated); setEditingId(null); setNewName(''); setNewPin(''); };
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><InputField label="Admin Name" val={newName} onChange={(e:any) => setNewName(e.target.value)} /><InputField label="4-Digit PIN" val={newPin} onChange={(e:any) => setNewPin(e.target.value)} /></div>
                    <button onClick={handleAddOrUpdate} className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase">{editingId ? 'Update Admin' : 'Create Admin'}</button>
                </div>
                <div className="space-y-4">
                    {admins.map(admin => (
                        <div key={admin.id} className="p-4 rounded-xl border bg-white flex justify-between items-center"><div className="font-bold text-slate-900">{admin.name}</div><div className="flex gap-2"><button onClick={() => { setEditingId(admin.id); setNewName(admin.name); setNewPin(admin.pin); setNewPermissions(admin.permissions); }} className="text-blue-500"><Edit2 size={14}/></button></div></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('brands'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedTVBrand, setSelectedTVBrand] = useState<TVBrand | null>(null);
  const [editingTVModel, setEditingTVModel] = useState<TVModel | null>(null);
  const [historyTab, setHistoryTab] = useState<'brands' | 'catalogues' | 'deletedItems'>('deletedItems');
  const [historySearch, setHistorySearch] = useState('');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [exportProcessing, setExportProcessing] = useState(false);
  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'tv', label: 'TV', icon: Tv }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'System Guide', icon: BookOpen } ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);
  useEffect(() => { if (currentUser && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) setActiveTab(availableTabs[0].id); }, [currentUser]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);
  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };
  const addToArchive = (type: string, name: string, data: any) => { if (!localData) return; const now = new Date().toISOString(); const newItem = { id: generateId('arch'), type: type as any, name, data, deletedAt: now }; const currentArchive = localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} }; return { ...currentArchive, deletedItems: [newItem, ...(currentArchive.deletedItems || [])] }; };
  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;
  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const tvBrands = Array.isArray(localData.tv?.brands) ? [...localData.tv!.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div>
                 <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs ${hasUnsavedChanges ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Save All</button>
                 <div className="flex items-center gap-3"><button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16} /></button></div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div>
        </header>
        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && !selectedBrand ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">{brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl p-4 flex flex-col items-center"><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs uppercase">Manage {brand.name}</button></div>))}</div>
            ) : null}
            {activeTab === 'settings' && <div className="max-w-4xl mx-auto"><button onClick={() => setShowGuide(true)} className="p-4 bg-slate-700 text-white rounded-xl w-full">Open Documentation</button></div>}
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p) => handleLocalUpdate({ ...localData, pricelists: p })} onSaveBrands={(b) => handleLocalUpdate({ ...localData, pricelistBrands: b })} onDeletePricelist={() => {}} />}
            {activeTab === 'screensaver' && <div className="max-w-4xl mx-auto"><InputField label="Idle Timeout" val={localData.screensaverSettings?.idleTimeout} onChange={(e:any) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} /></div>}
        </main>
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;
