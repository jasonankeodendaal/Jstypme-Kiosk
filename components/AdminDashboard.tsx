
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, FileSpreadsheet, ArrowRight, Wind, ShieldAlert, Binary, Globe2, ZapOff
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { generateStoreData, saveStoreData } from '../services/geminiService';
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

    // Animation for the rounding demo
    useEffect(() => {
        const interval = setInterval(() => {
            setRoundDemoValue(prev => prev === 799 ? 4449 : prev === 4449 ? 122 : 799);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'pricelists', label: 'Pricelist Engine', icon: <RIcon size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash {
                  to { stroke-dashoffset: -20; }
                }
                .animate-dash {
                  animation: dash 1s linear infinite;
                }
                @keyframes flow {
                    0% { transform: translateX(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100px); opacity: 0; }
                }
                .packet {
                    animation: flow 2s infinite ease-in-out;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .radar-ring {
                    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
                @keyframes scroll-film {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .film-strip {
                    animation: scroll-film 10s linear infinite;
                }
                @keyframes data-flow-long {
                    0% { transform: translateX(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(120px); opacity: 0; }
                }
                .data-packet-long { animation: data-flow-long 2s infinite linear; }
                @keyframes subtle-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float-small { animation: subtle-bounce 3s ease-in-out infinite; }
            `}</style>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
                <div className="mb-6 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Manual</h3>
                    <p className="text-[10px] text-slate-500 font-medium">v2.8.5 Technical Reference</p>
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
            
            {/* Mobile Sidebar (Horizontal) */}
            <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0 no-scrollbar">
                 {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-none px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                        >
                            {section.icon}
                            <span className="text-xs uppercase tracking-wide whitespace-nowrap">{section.label}</span>
                        </button>
                    ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white scroll-smooth no-scrollbar">
                {activeSection === 'architecture' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Network className="text-blue-600" size={32} /> Hybrid Cloud Architecture
                            </h2>
                            <p className="text-slate-500 font-medium">Local-First performance with Cloud synchronization.</p>
                        </div>

                        {/* Animated Architecture Diagram */}
                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8">
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <HardDrive size={40} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div>
                                        <div className="text-blue-400 text-[10px] font-mono">IndexedDB / Cache</div>
                                    </div>
                                </div>
                                <div className="flex-1 h-24 relative mx-4 flex items-center">
                                    <svg className="w-full h-12 overflow-visible">
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
                                        <circle r="4" fill="#60a5fa" className="packet" style={{ animationDelay: '0s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M0,6 L300,6" />
                                        </circle>
                                        <circle r="4" fill="#4ade80" className="packet" style={{ animationDelay: '1s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M300,6 L0,6" />
                                        </circle>
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-slate-400">Sync (60s)</div>
                                </div>
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                                        <Database size={40} className="text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Supabase Cloud</div>
                                        <div className="text-green-400 text-[10px] font-mono">PostgreSQL DB</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Box className="text-orange-600" size={32} /> Data Hierarchy
                            </h2>
                            <p className="text-slate-500 font-medium">Strict 3-Level Parent-Child Relationship Model.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
                             <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div>
                             </div>
                             <div className="absolute top-24 bottom-20 w-0.5 bg-slate-300"></div>
                             <div className="relative z-10 flex gap-4 mb-8">
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3">
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category</div>
                                </div>
                             </div>
                             <div className="relative z-10 flex gap-2">
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center">
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/>
                                    <div className="text-[10px] font-bold">Product</div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Table className="text-orange-600" size={32} /> Pricelist Intelligence Engine
                            </h2>
                            <p className="text-slate-500 font-medium">Automated spreadsheet ingestion and price normalization logic.</p>
                        </div>

                        {/* Moving Illustration: Data Flow */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border-2 border-green-500/30 flex items-center justify-center animate-float-small">
                                        <FileSpreadsheet size={32} className="text-green-400" />
                                    </div>
                                    <div className="text-[8px] text-white font-black uppercase tracking-widest text-center">Excel Source</div>
                                </div>
                                <div className="hidden md:block flex-1 h-0.5 bg-white/5 relative mx-4 overflow-hidden rounded-full">
                                    <div className="absolute inset-0 bg-blue-500 data-packet-long"></div>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] relative">
                                        <div className="absolute inset-0 radar-ring border-2 border-blue-400 rounded-2xl"></div>
                                        <RefreshCw size={32} className="text-white animate-spin-slow" />
                                    </div>
                                    <div className="text-[8px] text-white font-black uppercase tracking-widest text-center">Normalizer</div>
                                </div>
                                <div className="hidden md:block flex-1 h-0.5 bg-white/5 relative mx-4 overflow-hidden rounded-full">
                                    <div className="absolute inset-0 bg-purple-500 data-packet-long" style={{animationDelay: '1s'}}></div>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border-2 border-purple-500/30 flex items-center justify-center">
                                        <Smartphone size={24} className="text-purple-400" />
                                    </div>
                                    <div className="text-[8px] text-white font-black uppercase tracking-widest text-center">Live Fleet</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                <h3 className="font-bold text-orange-900 text-sm mb-4 flex items-center gap-2"><Sparkles size={16} /> Auto-Rounding Algorithm</h3>
                                <p className="text-xs text-orange-800 leading-relaxed mb-4">Corrects unrounded values to professional retail points (multiples of 10).</p>
                                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl">
                                    <div className="text-sm font-mono text-red-400 line-through">R {roundDemoValue}</div>
                                    <ArrowRight className="text-slate-700" size={16} />
                                    <div className="text-sm font-mono text-green-400 font-black">R {Math.ceil(roundDemoValue/10)*10}</div>
                                </div>
                            </div>
                            <div className="space-y-4 text-sm text-slate-600">
                                <h3 className="text-slate-900 font-bold">Distribution Workflow</h3>
                                <p>Uses <strong>SheetJS</strong> for local parsing and <strong>Supabase Realtime</strong> for instant broadcast. Customer-facing PDFs are generated using <strong>jsPDF</strong> with vectorized layouts.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Zap className="text-yellow-500" size={32} /> Screensaver Automation
                            </h2>
                            <p className="text-slate-500 font-medium">Autonomous marketing engine with probabilistic scheduling.</p>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Activity className="text-green-600" size={32} /> Fleet Telemetry
                            </h2>
                            <p className="text-slate-500 font-medium">Real-time device monitoring and remote command execution.</p>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Tv className="text-indigo-600" size={32} /> TV Mode Logic
                            </h2>
                            <p className="text-slate-500 font-medium">Specialized routing for non-interactive displays.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- (Helper Components & Logic) ---
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <InputField label="Admin Name" val={name} onChange={(e: any) => setName(e.target.value)} placeholder="Name" />
          <InputField label="PIN Code" type="password" val={pin} onChange={(e: any) => setPin(e.target.value)} placeholder="****" />
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase shadow-lg">Login</button>
        </form>
      </div>
    </div>
  );
};

const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const files = Array.from(e.target.files) as File[];
      try {
          if (allowMultiple) {
              const results = [];
              for(const f of files) results.push(await uploadFileToStorage(f));
              onUpload(results);
          } else {
              onUpload(await uploadFileToStorage(files[0]));
          }
      } catch (err) { alert("Upload error"); } finally { setIsProcessing(false); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center shrink-0 text-slate-400">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
              {isProcessing ? '...' : 'Select'}
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

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const [selectedBrand, setSelectedBrand] = useState(pricelistBrands[0]);
    const filtered = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
             <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
                 <div className="p-4 bg-slate-50 border-b flex justify-between items-center"><span className="font-black uppercase text-xs">Brands</span><button onClick={() => { const name = prompt("Brand:"); if(name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name }]); }}><Plus size={16}/></button></div>
                 <div className="flex-1 overflow-y-auto">{pricelistBrands.map((b: any) => (<button key={b.id} onClick={() => setSelectedBrand(b)} className={`w-full text-left p-4 text-xs font-bold uppercase ${selectedBrand?.id === b.id ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''}`}>{b.name}</button>))}</div>
             </div>
             <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col overflow-hidden">
                 <div className="flex justify-between mb-6"><h3 className="font-black uppercase">{selectedBrand?.name} Lists</h3><button onClick={() => selectedBrand && onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New List', url: '', type: 'pdf', month: 'January', year: '2024', dateAdded: new Date().toISOString() }])} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs uppercase font-bold">Add List</button></div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((item: any) => (<div key={item.id} className="p-4 border border-slate-200 rounded-xl relative flex flex-col gap-3"><input value={item.title} onChange={(e) => onSavePricelists(pricelists.map((p: any) => p.id === item.id ? { ...p, title: e.target.value } : p))} className="font-bold border-b border-transparent focus:border-blue-500 outline-none text-sm" />{item.type === 'manual' ? <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded font-black text-[10px] uppercase">Edit Table</button> : <FileUpload label="PDF" accept="application/pdf" currentUrl={item.url} onUpload={(url: any) => onSavePricelists(pricelists.map((p: any) => p.id === item.id ? { ...p, url } : p))} />}<button onClick={() => onDeletePricelist(item.id)} className="mt-auto text-red-500 text-[10px] font-bold uppercase">Delete</button></div>))}</div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => onSavePricelists(pricelists.map((p: any) => p.id === pl.id ? pl : p))} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 bg-slate-50 border-b flex justify-between shrink-0">
          <h3 className="font-black uppercase text-lg">Pricelist Builder</h3>
          <div className="flex gap-2">
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs uppercase">Add Row</button>
            <button onClick={onClose} className="p-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6"><table className="w-full text-left"><thead><tr><th className="p-3 text-[10px] font-black uppercase text-slate-400">SKU</th><th className="p-3 text-[10px] font-black uppercase text-slate-400">Description</th><th className="p-3 text-[10px] font-black uppercase text-slate-400">Normal</th><th className="p-3 text-[10px] font-black uppercase text-slate-400">Offer</th><th className="p-3"></th></tr></thead><tbody>{items.map((item) => (<tr key={item.id}><td><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 outline-none font-bold text-sm" /></td><td><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 outline-none text-sm" /></td><td><input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 outline-none font-black text-sm" /></td><td><input value={item.promoPrice} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 outline-none font-black text-sm text-red-600" /></td><td><button onClick={() => setItems(items.filter(i => i.id !== item.id))}><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={onClose}>Cancel</button><button onClick={() => { onSave({ ...pricelist, items, type: 'manual' }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white rounded-xl uppercase font-black text-xs">Save Table</button></div>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div>Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const availableTabs = [
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'pricelists', label: 'Pricelists', icon: RIcon },
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'screensaver', label: 'Screensaver', icon: Monitor },
      { id: 'fleet', label: 'Fleet', icon: Tablet },
      { id: 'history', label: 'History', icon: History },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'setup-guide', label: 'Setup Guide', icon: ShieldCheck },
      { id: 'guide', label: 'Guide', icon: BookOpen }
  ].filter(tab => currentUser?.permissions[tab.id as keyof AdminPermissions] || tab.id === 'guide' || tab.id === 'setup-guide');

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3">
                 <div className="flex items-center gap-2">
                     <Settings className="text-blue-500" size={24} />
                     <h1 className="font-black uppercase tracking-tight">Admin Hub</h1>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={() => setShowGuide(true)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400" title="Open Setup Guide Modal">
                        <HelpCircle size={20} />
                     </button>
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs ${hasUnsavedChanges ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>Save Changes</button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 hover:bg-white/10 rounded-lg"><LogOut/></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'setup-guide' && <SetupGuide onClose={() => setActiveTab('inventory')} />}
            
            {activeTab === 'inventory' && !selectedBrand && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{localData.brands.map(b => <button key={b.id} onClick={() => setSelectedBrand(b)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all font-black uppercase text-sm">{b.name}</button>)}</div>
            )}
            
            {activeTab === 'pricelists' && (
                <PricelistManager 
                    pricelists={localData.pricelists || []} 
                    pricelistBrands={localData.pricelistBrands || []} 
                    onSavePricelists={(p:any) => handleLocalUpdate({ ...localData, pricelists: p })} 
                    onSaveBrands={(b:any) => handleLocalUpdate({ ...localData, pricelistBrands: b })} 
                    onDeletePricelist={(id:any) => handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) })} 
                />
            )}
            
            {/* ... other tab logic (History, Settings, Fleet, etc) ... */}
        </main>
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};
