
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const SESSION_KEY = 'kiosk_admin_session';

// Visual Component for Signal Bars
const SignalStrengthBars = ({ strength }: { strength: number }) => {
    return (
        <div className="flex items-end gap-0.5 h-3">
            {[1, 2, 3, 4].map((bar) => {
                const isActive = (strength / 25) >= bar;
                return (
                    <div 
                        key={bar} 
                        className={`w-1 rounded-full transition-all duration-500 ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`} 
                        style={{ height: `${bar * 25}%` }}
                    />
                );
            })}
        </div>
    );
};

// Custom R Icon for Pricelists
const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

// --- SYSTEM DOCUMENTATION COMPONENT ---
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    
    const sections = [
        { id: 'architecture', label: '1. How it Works', icon: <Network size={16} />, desc: 'The "Brain" of the Kiosk' },
        { id: 'inventory', label: '2. Product Sorting', icon: <Box size={16}/>, desc: 'How items are organized' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Converting Excel to PDF' },
        { id: 'screensaver', label: '4. Visual Loop', icon: <Zap size={16}/>, desc: 'Automatic slideshow rules' },
        { id: 'fleet', label: '5. Fleet Watch', icon: <Activity size={16}/>, desc: 'Remote tracking & control' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Large scale video loops' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <style>{`
                @keyframes flow-horizontal { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(400%); opacity: 0; } }
                .data-flow { animation: flow-horizontal 3s linear infinite; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.4); opacity: 0; } }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
                @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .float-slow { animation: float-slow 4s ease-in-out infinite; }
                @keyframes conveyor { 0% { transform: translateX(0); } 100% { transform: translateX(-40px); } }
                .conveyor-belt { animation: conveyor 1s linear infinite; }
                @keyframes expand-search { 0%, 100% { width: 40px; } 50% { width: 120px; } }
                .search-pulse { animation: expand-search 3s ease-in-out infinite; }
                @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
                .bounce-x { animation: bounce-x 2s ease-in-out infinite; }
            `}</style>

            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Step-by-step logic overview for new administrators.</p>
                </div>

                <div className="space-y-2 flex-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-xl translate-x-2' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-500 ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                {React.cloneElement(section.icon as React.ReactElement<any>, { size: 18 })}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div>
                                <div className={`text-[9px] font-bold uppercase truncate opacity-60 ${activeSection === section.id ? 'text-blue-100' : 'text-slate-500'}`}>{section.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 font-black text-[9px] uppercase tracking-widest mb-2">
                        <HelpCircle size={12} /> Need Help?
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">This manual explains technical logic in plain English. Click a topic to see it in action.</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] pointer-events-none rounded-full"></div>

                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p>
                        </div>
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110">
                                        <Monitor className="text-blue-400" size={40} />
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">YOU</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div>
                                        <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Updates Sent</div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full h-24 relative flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/5 rounded-full relative">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-8 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest">Encrypted Cloud Tunnel</div>
                                </div>
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1">
                                        <Tablet className="text-green-400" size={32} />
                                        <div className="absolute inset-0 bg-green-500/10 animate-pulse rounded-2xl"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div>
                                        <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Local Storage Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <HardDrive className="text-blue-500" /> Layer 1: Local Memory
                                </h3>
                                <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">Think of the tablet like a <strong>Notebook</strong>. When it boots up, it reads from its own internal pages instantly. This is why the app feels so fast—it never waits for a website to "load" before showing the home screen.</p>
                                    <div className="mt-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-200">
                                        <Zap className="text-yellow-500" size={16} fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase text-blue-900">Result: 0.1s Loading Time</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Cloud className="text-purple-500" /> Layer 2: Cloud Sync
                                </h3>
                                <div className="p-8 bg-purple-50 rounded-[2rem] border border-purple-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">Every 60 seconds, the Kiosk "calls" the Cloud. It asks: <em>"Has the Admin changed anything?"</em>. If yes, it updates its notebook. If the internet is down, it simply keeps using its current notes until connection returns.</p>
                                    <div className="mt-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-purple-200">
                                        <ShieldCheck className="text-green-500" size={16} />
                                        <span className="text-[10px] font-black uppercase text-purple-900">Status: Always Reliable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 02: Organization</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Inventory Sifter</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">How we turn a massive list of products into a lightning-fast searchable menu for customers.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                            <div className="absolute top-0 right-0 p-12 text-slate-200/50"><Layers size={200} /></div>
                            <div className="w-full md:w-64 space-y-4 z-10">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Mixed Raw Data</div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <Package size={20} className="text-blue-500" />
                                    <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 translate-x-4 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                                    <Tag size={20} className="text-orange-500" />
                                    <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 -translate-x-2 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.2s' }}>
                                    <ImageIcon size={20} className="text-purple-500" />
                                    <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center relative">
                                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl z-20 animate-pulse">
                                    <RefreshCw size={40} className="animate-spin" style={{ animationDuration: '8s' }} />
                                </div>
                                <div className="mt-4 text-[10px] font-black text-orange-600 uppercase tracking-widest">Logic: Flatten()</div>
                                <div className="absolute top-0 left-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
                            </div>
                            <div className="flex-1 w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 scanline"></div>
                                <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/5 search-pulse">
                                    <Search size={16} className="text-blue-400" />
                                    <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/5 bounce-x" style={{ animationDelay: `${i * 0.2}s` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <div className="h-1 w-20 bg-white/20 rounded-full"></div>
                                            </div>
                                            <div className="h-1 w-8 bg-blue-500/50 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="h-40"></div>
            </div>
        </div>
    );
};

// Updated Auth Component
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
              <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label>
              <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} />
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
      const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
      });
      const uploadSingle = async (file: File) => {
           const localBase64 = await readFileAsBase64(file);
           try {
              const url = await uploadFileToStorage(file);
              return { url, base64: localBase64 };
           } catch (e) { return { url: localBase64, base64: localBase64 }; }
      };
      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const res = await uploadSingle(files[i]);
                  results.push(res.url);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results, fileType);
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
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? <div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}
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
    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => { handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }]); };
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => { handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c)); };
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
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> : <BookOpen size={32} className="text-slate-300" />}
                            {cat.pdfUrl && <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <FileUpload label="Thumbnail (Image)" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} />
                                <FileUpload label="Document (PDF)" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} />
                            </div>
                            <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete</button>
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
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: field === 'description' ? val.toUpperCase() : val } : item));
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));

  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsImporting(true);
    try {
        const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as any[][];
        if (jsonData.length === 0) return;
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && String(cell).trim() !== ''));
        const newItems = validRows.slice(1).map(row => ({ id: generateId('imp'), sku: String(row[0]||'').toUpperCase(), description: String(row[1]||'').toUpperCase(), normalPrice: String(row[2]||''), promoPrice: String(row[3]||''), imageUrl: '' }));
        setItems([...items, ...newItems]);
    } catch (err) { alert("Import failed"); } finally { setIsImporting(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 className="font-black text-slate-900 uppercase">Pricelist Builder</h3>
          <div className="flex gap-2">
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 cursor-pointer"><FileInput size={16} /> Import Excel <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSpreadsheetImport} /></label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left">
            <thead><tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b w-16">Image</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b">Normal</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b">Promo</th><th className="p-3 text-center border-b"></th></tr></thead>
            <tbody>{items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2"><div className="w-12 h-12 bg-slate-50 border rounded flex items-center justify-center relative overflow-hidden">{item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain" /> : <ImageIcon size={14} className="text-slate-200" />}<input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async e => { if(e.target.files?.[0]) updateItem(item.id, 'imageUrl', await uploadFileToStorage(e.target.files[0])); }} /></div></td>
                  <td className="p-2"><input value={item.sku} onChange={e => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td>
                  <td className="p-2"><input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td>
                  <td className="p-2"><input value={item.normalPrice} onChange={e => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td>
                  <td className="p-2"><input value={item.promoPrice} onChange={e => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm text-red-600" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></td>
                </tr>
              ))}</tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => { onSave({ ...pricelist, items, type: 'manual' }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl">Save Changes</button></div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(pricelistBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter((p:any) => p.brandId === selectedBrand.id) : [];
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => onSavePricelists(pricelists.map((p:any) => p.id === id ? { ...p, ...updates } : p));
    return (
        <div className="max-w-7xl mx-auto flex gap-6 h-[calc(100vh-140px)]">
             <div className="w-1/3 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shrink-0">
                 <div className="p-4 bg-slate-50 border-b flex justify-between items-center"><h2 className="font-black text-sm uppercase">Pricelist Brands</h2><button onClick={() => { const n = prompt("Brand Name:"); if(n) onSaveBrands([...pricelistBrands, {id:generateId('plb'), name:n}]); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase"><Plus size={12}/> Add</button></div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">{pricelistBrands.map((b:any) => (<div key={b.id} onClick={() => setSelectedBrand(b)} className={`p-3 rounded-xl border cursor-pointer ${selectedBrand?.id === b.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100'}`}><div className="font-bold text-xs uppercase">{b.name}</div><div className="text-[10px] text-slate-400 uppercase">{pricelists.filter((p:any)=>p.brandId===b.id).length} Lists</div></div>))}</div>
             </div>
             <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner">
                 <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xs uppercase">{selectedBrand?.name || 'Select Brand'}</h3><button onClick={() => { if(selectedBrand) onSavePricelists([...pricelists, {id:generateId('pl'), brandId:selectedBrand.id, title:'New List', type:'pdf', month:'January', year:'2024', url:''}]); }} disabled={!selectedBrand} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Add List</button></div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 content-start">{filteredLists.map((item:any) => (
                         <div key={item.id} className="bg-white rounded-xl border p-4 flex flex-col gap-3 h-fit">
                             <input value={item.title} onChange={e => updatePricelist(item.id, {title:e.target.value})} className="font-bold text-sm border-b pb-1 outline-none" />
                             <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg">
                                <button onClick={() => updatePricelist(item.id, {type:'pdf'})} className={`py-1 text-[9px] font-black uppercase rounded ${item.type !== 'manual' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>PDF</button>
                                <button onClick={() => updatePricelist(item.id, {type:'manual'})} className={`py-1 text-[9px] font-black uppercase rounded ${item.type === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Table</button>
                             </div>
                             {item.type === 'manual' ? <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">Edit Table</button> : <FileUpload label="Upload PDF" accept="application/pdf" currentUrl={item.url} onUpload={(url:any) => updatePricelist(item.id, {url})} />}
                             <button onClick={() => onDeletePricelist(item.id)} className="text-red-500 text-[10px] font-bold uppercase mt-2">Delete List</button>
                         </div>
                     ))}</div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={pl => updatePricelist(pl.id, {...pl})} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : [], videoUrls: product.videoUrls || [], manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase">Edit: {draft.name || 'New'}</h3><button onClick={onCancel}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4"><InputField label="Name" val={draft.name} onChange={(e:any)=>setDraft({...draft, name:e.target.value})} /><InputField label="SKU" val={draft.sku||''} onChange={(e:any)=>setDraft({...draft, sku:e.target.value})} /><InputField label="Description" isArea val={draft.description} onChange={(e:any)=>setDraft({...draft, description:e.target.value})} /></div>
                    <div className="space-y-4"><FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url:any)=>setDraft({...draft, imageUrl:url})} /><FileUpload label="Add Gallery Images" allowMultiple onUpload={(urls:any)=>setDraft(prev=>({...prev, galleryUrls:[...(prev.galleryUrls||[]), ...(Array.isArray(urls)?urls:[urls])]}))} /><FileUpload label="Add Videos" accept="video/*" allowMultiple onUpload={(urls:any)=>setDraft(prev=>({...prev, videoUrls:[...(prev.videoUrls||[]), ...(Array.isArray(urls)?urls:[urls])]}))} /></div>
                </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-4"><button onClick={onCancel} className="font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Confirm</button></div>
        </div>
    );
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return;
    const zip = new JSZip();
    zip.file("store_config.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a"); link.href = url; link.download = "kiosk_backup.zip"; link.click(); URL.revokeObjectURL(url);
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  // --- AUTH PERSISTENCE LOGIC ---
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('brands'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const availableTabs = [
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'pricelists', label: 'Pricelists', icon: RIcon },
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'screensaver', label: 'Screensaver', icon: Monitor },
      { id: 'fleet', label: 'Fleet', icon: Tablet },
      { id: 'history', label: 'History', icon: History },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'guide', label: 'Guide', icon: BookOpen }
  ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => {
      setLocalData(newData);
      setHasUnsavedChanges(true);
      if (selectedBrand) setSelectedBrand(newData.brands.find(b => b.id === selectedBrand.id) || null);
      if (selectedCategory && selectedBrand) {
          const b = newData.brands.find(x => x.id === selectedBrand.id);
          setSelectedCategory(b?.categories.find(c => c.id === selectedCategory.id) || null);
      }
  };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={handleLogin} />;

  const brands = [...(localData.brands || [])].sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase">Admin Hub</h1></div>
                 <div className="flex items-center gap-4">
                     <button onClick={() => { onUpdateData(localData); setHasUnsavedChanges(false); }} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}><SaveAll size={16} /> {hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button>
                     <button onClick={handleLogout} className="p-2 bg-red-900/50 text-red-400 rounded-lg flex items-center gap-2"><LogOut size={16} /><span className="text-[10px] font-bold uppercase">Logout</span></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-4 text-center text-xs font-black uppercase border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500'}`}>{tab.label}</button>))}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                       <button onClick={() => { const n = prompt("Brand Name:"); if(n) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name:n, categories: [] }] }) }} className="bg-white border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 aspect-square"><Plus size={24} /><span className="font-bold uppercase text-[10px] mt-2">Add Brand</span></button>
                       {brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all group relative aspect-square flex flex-col"><div className="flex-1 bg-slate-50 flex items-center justify-center p-2">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div><div className="p-4"><h3 className="font-black text-sm uppercase truncate mb-1">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button></div></div>))}
                   </div>
                ) : !selectedCategory ? (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase">{selectedBrand.name}</h2></div><div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"><button onClick={() => { const n = prompt("Category Name:"); if(n) { const updated = {...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name:n, icon: 'Box', products: [] }]}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b)}); } }} className="bg-slate-100 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 aspect-square"><Plus size={24} /><span className="font-bold text-[10px] uppercase mt-2">New Category</span></button>{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-xl border shadow-sm aspect-square flex flex-col items-center justify-center"><Box size={20} className="mb-4 text-slate-400" /><h3 className="font-black text-xs uppercase">{cat.name}</h3></button>))}</div></div>
                ) : (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase flex-1">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs">Add Product</button></div><div className="grid grid-cols-3 md:grid-cols-5 gap-2">{selectedCategory.products.map(p => (<div key={p.id} onClick={() => setEditingProduct(p)} className="bg-white rounded-xl border p-2 aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">{p.imageUrl ? <img src={p.imageUrl} className="max-h-[70%] object-contain" /> : <Box size={24} className="text-slate-200" />}<div className="mt-2 font-bold text-[10px] uppercase truncate w-full text-center">{p.name}</div></div>))}</div></div>
                )
            )}
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists||[]} pricelistBrands={localData.pricelistBrands||[]} onSavePricelists={(p:any)=>handleLocalUpdate({...localData, pricelists:p})} onSaveBrands={(b:any)=>handleLocalUpdate({...localData, pricelistBrands:b})} onDeletePricelist={(id:any)=>handleLocalUpdate({...localData, pricelists:localData.pricelists?.filter(p=>p.id!==id)})} />}
            {activeTab === 'settings' && <div className="max-w-xl mx-auto space-y-8"><div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-black uppercase text-sm mb-6">Backup & Export</h3><button onClick={() => downloadZip(localData)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs">Download Full Backup (.zip)</button></div></div>}
        </main>

        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 p-8 flex items-center justify-center"><ProductEditor product={editingProduct} onSave={p => { const isNew = !selectedCategory?.products.find(x=>x.id===p.id); const newP = isNew ? [...selectedCategory!.products, p] : selectedCategory!.products.map(x=>x.id===p.id?p:x); const updCat = {...selectedCategory!, products:newP}; const updB = {...selectedBrand!, categories:selectedBrand!.categories.map(c=>c.id===updCat.id?updCat:c)}; handleLocalUpdate({...localData, brands:brands.map(b=>b.id===updB.id?updB:b)}); setEditingProduct(null); }} onCancel={()=>setEditingProduct(null)} /></div>}
    </div>
  );
};

export default AdminDashboard;
