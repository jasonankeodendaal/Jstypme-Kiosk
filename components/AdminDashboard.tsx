
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

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

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

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
                <div className="h-40"></div>
            </div>
        </div>
    );
};

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

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[], immediate: boolean) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);

    const handleUpdate = (newList: Catalogue[], immediate = false) => {
        setLocalList(newList);
        onSave(newList, immediate); 
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
        }], true);
    };

    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => {
        handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c), immediate);
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
                                <FileUpload label="Thumbnail" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url }, true)} />
                                <FileUpload label="Document (PDF)" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url }, true)} />
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete Catalogue</button>
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
  const [title, setTitle] = useState(pricelist.title || ''); 
  const [isImporting, setIsImporting] = useState(false);
  
  const addItem = () => {
    setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  };

  const updateItem = (id: string, field: keyof PricelistItem, val: string) => {
    const finalVal = field === 'description' ? val.toUpperCase() : val;
    setItems(items.map(item => item.id === id ? { ...item, [field]: finalVal } : item));
  };

  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value) return;
    const numericPart = value.replace(/[^0-9.]/g, '');
    if (!numericPart) {
        if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`);
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
        if (jsonData.length === 0) { alert("File is empty."); return; }
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        if (validRows.length === 0) { alert("No data rows found."); return; }
        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const findIdx = (keywords: string[]) => firstRow.findIndex(h => keywords.some(k => h.includes(k)));
        const skuIdx = findIdx(['sku', 'code', 'part', 'model']);
        const descIdx = findIdx(['desc', 'name', 'product', 'item', 'title']);
        const normalIdx = findIdx(['normal', 'retail', 'price', 'standard', 'cost']);
        const promoIdx = findIdx(['promo', 'special', 'sale', 'discount', 'deal']);
        const dataRows = (skuIdx !== -1 || descIdx !== -1 || normalIdx !== -1) ? validRows.slice(1) : validRows;
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
                description: String(row[dIdx] || '').trim().toUpperCase(),
                normalPrice: formatImported(row[nIdx]),
                promoPrice: row[pIdx] ? formatImported(row[pIdx]) : '',
                imageUrl: ''
            };
        });
        if (newImportedItems.length > 0) {
            const choice = confirm(`Parsed ${newImportedItems.length} items.\n\nOK -> Merge into current.\nCancel -> Replace current.`);
            if (choice) {
                const merged = [...items];
                newImportedItems.forEach(newItem => {
                    const existingIdx = merged.findIndex(curr => curr.sku && newItem.sku && curr.sku.trim().toUpperCase() === newItem.sku.trim().toUpperCase());
                    if (existingIdx > -1) {
                        merged[existingIdx] = { ...merged[existingIdx], ...newItem };
                    } else { merged.push(newItem); }
                });
                setItems(merged);
            } else { setItems(newImportedItems); }
        }
    } catch (err) { alert("Error parsing file."); } finally { setIsImporting(false); e.target.value = ''; }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <Table className="text-blue-600" size={24} />
                <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="font-black text-slate-900 uppercase text-lg bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none w-full transition-colors placeholder:text-slate-300"
                    placeholder="ENTER LIST TITLE..."
                />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase ml-8">{pricelist.month} {pricelist.year}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel
              <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} />
            </label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-16">Visual</th>
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
                  <td className="p-2">
                    <div className="w-12 h-12 relative group/item-img">
                      {item.imageUrl ? (
                        <><img src={item.imageUrl} className="w-full h-full object-contain rounded bg-white border border-slate-100" /><button onClick={(e) => { e.stopPropagation(); if(confirm("Remove?")) updateItem(item.id, 'imageUrl', ''); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/item-img:opacity-100 transition-opacity z-10"><X size={10} /></button></>
                      ) : (
                        <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300"><ImageIcon size={14} /></div>
                      )}
                      {!item.imageUrl && (
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/item-img:opacity-100 flex items-center justify-center cursor-pointer rounded transition-opacity"><Upload size={12} className="text-white" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { try { const url = await uploadFileToStorage(e.target.files[0]); updateItem(item.id, 'imageUrl', url); } catch (err) { alert("Upload failed"); } } }} /></label>
                      )}
                    </div>
                  </td>
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm uppercase" placeholder="DESC..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={() => { onSave({ ...pricelist, title, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save Table</button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ 
    pricelists, 
    pricelistBrands, 
    onSavePricelists,
    onSaveBrands,
    onDeletePricelist
}: { 
    pricelists: Pricelist[], 
    pricelistBrands: PricelistBrand[], 
    onSavePricelists: (p: Pricelist[], immediate?: boolean) => void,
    onSaveBrands: (b: PricelistBrand[], immediate?: boolean) => void,
    onDeletePricelist: (id: string) => void
}) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);

    useEffect(() => {
        if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) {
            setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null);
        }
    }, [sortedBrands]);

    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const sortedLists = [...filteredLists].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <div><h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Brands</h2></div>
                     <button onClick={() => { const n = prompt("Brand Name:"); if(n) onSaveBrands([...pricelistBrands, {id: generateId('plb'), name: n, logoUrl:''}], true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div><div className="text-[9px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input value={brand.name} onChange={(e) => onSaveBrands(pricelistBrands.map(b=>b.id===brand.id?{...b, name:e.target.value}:b), true)} className="w-full text-[10px] font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Name" />
                                     <FileUpload label="Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => onSaveBrands(pricelistBrands.map(b=>b.id===brand.id?{...b, logoUrl:url}:b), true)} />
                                     <button onClick={() => confirm("Delete?") && onSaveBrands(pricelistBrands.filter(b=>b.id!==brand.id), true)} className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs truncate">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3>
                     <button onClick={() => { if(!selectedBrand) return; const pl: Pricelist = { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: new Date().getFullYear().toString(), dateAdded: new Date().toISOString() }; onSavePricelists([...pricelists, pl], true); }} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 shrink-0"><Plus size={12} /> Add List</button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start pb-10">
                     {sortedLists.map((item) => (
                         <div key={item.id} className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-3 h-fit border-slate-200">
                             <input value={item.title} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, title:e.target.value, dateAdded: new Date().toISOString()}:p), true)} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs" />
                             <div className="grid grid-cols-2 gap-2">
                                 <select value={item.month} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, month:e.target.value, dateAdded: new Date().toISOString()}:p), true)} className="w-full text-[10px] p-1 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                 <input type="number" value={item.year} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, year:e.target.value, dateAdded: new Date().toISOString()}:p), true)} className="w-full text-[10px] p-1 rounded border border-slate-200" />
                             </div>
                             <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-md">
                                <button onClick={() => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, type:'pdf', dateAdded: new Date().toISOString()}:p), true)} className={`py-1 text-[9px] font-black uppercase rounded ${item.type !== 'manual' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>PDF</button>
                                <button onClick={() => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, type:'manual', dateAdded: new Date().toISOString()}:p), true)} className={`py-1 text-[9px] font-black uppercase rounded ${item.type === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Table</button>
                             </div>
                             {item.type === 'manual' ? (
                                <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">Open Builder</button>
                             ) : (
                                <FileUpload label="PDF" accept="application/pdf" currentUrl={item.url} onUpload={(url: any) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, url:url, dateAdded: new Date().toISOString()}:p), true)} />
                             )}
                             <button onClick={() => onDeletePricelist(item.id)} className="mt-2 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase"><Trash2 size={12} className="inline mr-1"/> Delete</button>
                         </div>
                     ))}
                 </div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => onSavePricelists(pricelists.map(p=>p.id===pl.id?pl:p), true)} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []), videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() });
    const [newFeature, setNewFeature] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase">Edit: {draft.name || 'New'}</h3><button onClick={onCancel}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                    </div>
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        <FileUpload label="Add Gallery Images" allowMultiple currentUrl="" onUpload={(urls: any) => setDraft(p => ({ ...p, galleryUrls: [...(p.galleryUrls || []), ...(Array.isArray(urls)?urls:[urls])] }))} />
                    </div>
                </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-4"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Save</button></div>
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
  const [historyTab, setHistoryTab] = useState<'all' | 'delete' | 'restore' | 'update' | 'create'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const logout = useCallback(() => { setCurrentUser(null); }, []);

  useEffect(() => {
    if (!currentUser) return;
    const reset = () => logout();
    const evts = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    evts.forEach(e => window.addEventListener(e, reset));
    return () => evts.forEach(e => window.removeEventListener(e, reset));
  }, [currentUser, logout]);

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);

  // Surgical state synchronization:
  // If editing, only flow fleet telemetry props into our local state.
  // If not editing, check if configuration significantly changed before resetting.
  useEffect(() => {
    if (storeData) {
        setLocalData(prev => {
            if (!prev) return storeData;
            
            // If the user has unsaved changes, we MUST NOT overwrite the config data.
            // We strictly only refresh the fleet telemetry (online status, etc).
            if (hasUnsavedChanges) {
                return { ...prev, fleet: storeData.fleet };
            }

            // If no unsaved changes, check if inventory or other config properties have changed prop-side.
            // (e.g. from another admin or a manual refresh in App.tsx)
            const prevConfigKey = JSON.stringify({ ...prev, fleet: [] });
            const nextConfigKey = JSON.stringify({ ...storeData, fleet: [] });
            
            if (prevConfigKey !== nextConfigKey) {
                return storeData;
            }
            
            // Otherwise, just update non-disruptive fleet telemetry
            return { ...prev, fleet: storeData.fleet };
        });
    }
  }, [storeData, hasUnsavedChanges]);

  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'tv', label: 'TV', icon: Tv }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'Guide', icon: BookOpen } ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  const handleLocalUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) {
          onUpdateData(newData);
          setHasUnsavedChanges(false);
      } else {
          setHasUnsavedChanges(true);
      }
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const tvBrands = Array.isArray(localData.tv?.brands) ? [...localData.tv!.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20"><div className="flex items-center justify-between px-4 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div><div className="flex items-center gap-4"><button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button></div><div className="flex items-center gap-3"><div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'}`}>{isCloudConnected ? <Cloud size={14} /> : <HardDrive size={14} />}<span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud' : 'Local'}</span></div><button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg"><RefreshCw size={16} /></button><button onClick={logout} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg"><LogOut size={16} /></button></div></div><div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div></header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"><button onClick={() => { const n = prompt("Brand Name:"); if(n) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name: n, categories: [] }] }, true); }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[120px] text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"><Plus size={24} /><span className="font-bold uppercase text-[10px] mt-2">Add Brand</span></button>{brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full"><div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div><div className="p-4"><h3 className="font-black text-slate-900 text-xs uppercase mb-2 truncate">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase">Manage</button></div></div>))}</div>
                ) : !selectedCategory ? (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-xl font-black uppercase flex-1">{selectedBrand.name}</h2></div><div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2"><button onClick={() => { const n = prompt("Category:"); if(n) handleLocalUpdate({...localData, brands: brands.map(b=>b.id===selectedBrand.id?{...b, categories: [...b.categories, {id:generateId('c'), name:n, icon:'Box', products:[]}]}:b)}, true); }} className="bg-slate-100 border-2 border-dashed rounded-xl flex flex-col items-center justify-center aspect-square text-slate-400"><Plus size={24} /><span className="text-[10px] uppercase mt-1">New Category</span></button>{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-4 rounded-xl border border-slate-200 aspect-square flex flex-col items-center justify-center text-center"><Box size={24} className="mb-2 text-slate-400"/><h3 className="font-black text-slate-900 uppercase text-[10px] truncate w-full">{cat.name}</h3><p className="text-[9px] text-slate-500 font-bold">{cat.products.length} Items</p></button>))}</div></div>
                ) : (
                   <div className="animate-fade-in h-full flex flex-col"><div className="flex items-center gap-4 mb-6 shrink-0"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-lg font-black uppercase flex-1">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2"><Plus size={14} /> Add</button></div><div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 overflow-y-auto pb-20">{selectedCategory.products.map(product => (<div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-2">{product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-300" />}<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"><button onClick={() => setEditingProduct(product)} className="px-4 py-1.5 bg-white text-blue-600 rounded-lg font-bold text-[10px] uppercase">Edit</button><button onClick={() => confirm("Delete?") && handleLocalUpdate({...localData, brands: brands.map(b=>b.id===selectedBrand.id?{...b, categories: b.categories.map(c=>c.id===selectedCategory.id?{...c, products: c.products.filter(p=>p.id!==product.id)}:c)}:b)}, true)} className="px-4 py-1.5 bg-white text-red-600 rounded-lg font-bold text-[10px] uppercase">Delete</button></div></div><div className="p-3"><h4 className="font-bold text-slate-900 text-[10px] truncate uppercase">{product.name}</h4></div></div>))}</div></div>
                )
            )}
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p, imm) => handleLocalUpdate({...localData, pricelists: p}, imm)} onSaveBrands={(b, imm) => handleLocalUpdate({...localData, pricelistBrands: b}, imm)} onDeletePricelist={(id) => handleLocalUpdate({...localData, pricelists: localData.pricelists?.filter(p=>p.id!==id)}, true)} />}
            {activeTab === 'fleet' && (
                <div className="animate-fade-in max-w-7xl mx-auto"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{localData.fleet?.map(kiosk => (<div key={kiosk.id} className="bg-slate-950 border-2 rounded-[2rem] overflow-hidden p-5 flex flex-col border-slate-800"><h4 className="font-black text-white uppercase text-base mb-1">{kiosk.name}</h4><div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">{kiosk.assignedZone || 'UNASSIGNED'}</div><div className="mt-auto flex gap-2"><button onClick={() => setEditingKiosk(kiosk)} className="flex-1 bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white p-2.5 rounded-2xl transition-all border border-slate-800 text-[10px] font-black uppercase">Edit</button><button onClick={async () => { if(confirm("Restart?")) await supabase.from('kiosks').update({restart_requested: true}).eq('id', kiosk.id); }} className="flex-1 bg-slate-900 hover:bg-orange-600 text-orange-500 hover:text-white p-2.5 rounded-2xl transition-all border border-slate-800 text-[10px] font-black uppercase">Reset</button></div></div>))}</div></div>
            )}
            {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto space-y-8"><div className="bg-white p-6 rounded-2xl border border-slate-200"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Branding</h3><FileUpload label="Main Company Logo" currentUrl={localData.companyLogoUrl} onUpload={(url: string) => handleLocalUpdate({...localData, companyLogoUrl: url}, true)} /></div><div className="bg-white p-6 rounded-2xl border border-slate-200"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Database size={20} className="text-blue-500"/> Operations</h3><button onClick={async () => { if(confirm("RESET ALL?")) { const d = await resetStoreData(); setLocalData(d); window.location.reload(); } }} className="p-4 bg-red-900/30 text-red-300 rounded-xl border border-red-900/50 w-full flex items-center gap-3"><AlertCircle size={24} /><div className="text-left font-bold">Factory Reset System</div></button></div></div>
            )}
        </main>
        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"><ProductEditor product={editingProduct} onSave={(p) => { if(!selectedBrand || !selectedCategory) return; const isNew = !selectedCategory.products.find(x => x.id === p.id); const newProducts = isNew ? [...selectedCategory.products, p] : selectedCategory.products.map(x => x.id === p.id ? p : x); handleLocalUpdate({ ...localData, brands: brands.map(b => b.id === selectedBrand.id ? { ...b, categories: b.categories.map(c => c.id === selectedCategory.id ? { ...c, products: newProducts } : c) } : b) }, true); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
        {editingKiosk && <KioskEditorModal kiosk={editingKiosk} onSave={(k) => { if(supabase) supabase.from('kiosks').upsert({id:k.id, name:k.name, device_type:k.deviceType, assigned_zone:k.assignedZone}); setEditingKiosk(null); onRefresh(); }} onClose={() => setEditingKiosk(null)} />}
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

const KioskEditorModal = ({ kiosk, onSave, onClose }: { kiosk: KioskRegistry, onSave: (k: KioskRegistry) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"><div className="p-6 border-b flex justify-between items-center"><h3 className="font-black uppercase">Edit Device</h3><button onClick={onClose}><X size={20} /></button></div><div className="p-6 space-y-4"><InputField label="Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} /><InputField label="Zone" val={draft.assignedZone || ''} onChange={(e:any) => setDraft({...draft, assignedZone: e.target.value})} /></div><div className="p-4 border-t flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save</button></div></div></div>
    );
};

export default AdminDashboard;
