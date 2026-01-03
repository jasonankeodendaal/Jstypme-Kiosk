
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
                        <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <div className={`p-2 rounded-xl transition-all duration-500 ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>{React.cloneElement(section.icon as React.ReactElement<any>, { size: 18 })}</div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div>
                                <div className={`text-[9px] font-bold uppercase truncate opacity-60 ${activeSection === section.id ? 'text-blue-100' : 'text-slate-500'}`}>{section.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It only needs internet to "sync up" with your latest changes.</p>
                        </div>
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110">
                                        <Monitor className="text-blue-400" size={40} />
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">YOU</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full h-24 relative flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/5 rounded-full relative">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500">
                                        <Tablet className="text-green-400" size={32} />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* ... other sections remain similar ... */}
            </div>
        </div>
    );
};

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const savedAdmin = localStorage.getItem('kiosk_admin_session');
    if (savedAdmin) {
        try {
            const adminData = JSON.parse(savedAdmin);
            const verified = admins.find(a => a.id === adminData.id && a.pin === adminData.pin);
            if (verified) onLogin(verified);
        } catch(e) {}
    }
  }, [admins]);
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) { localStorage.setItem('kiosk_admin_session', JSON.stringify(admin)); onLogin(admin); }
    else { setError('Invalid credentials.'); }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <InputField label="Admin Name" val={name} onChange={(e: any) => setName(e.target.value)} />
          <InputField label="PIN Code" type="password" val={pin} onChange={(e: any) => setPin(e.target.value)} />
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 shadow-lg">Login</button>
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
      setIsProcessing(true); setUploadProgress(10);
      const files = Array.from(e.target.files) as File[];
      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const url = await uploadFileToStorage(files[i]);
                  results.push(url);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results);
          } else {
              const url = await uploadFileToStorage(files[0]);
              setUploadProgress(100);
              onUpload(url);
          }
      } catch (err) { alert("Upload error"); } 
      finally { setIsProcessing(false); setUploadProgress(0); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase ${isProcessing ? 'opacity-50' : ''}`}>
              <Upload size={10} className="inline mr-1" /> Select
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, type = 'text' }: any) => (
    <div className={`mb-4 w-full`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm" /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" />}
    </div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => {
        const newList = localList.map(c => c.id === id ? { ...c, ...updates } : c);
        setLocalList(newList); onSave(newList);
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">Pamphlets</h3>
                 <button onClick={() => setLocalList([...localList, { id: generateId('cat'), title: 'New', brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear() }])} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-4">
                        <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" />
                        <FileUpload label="Thumbnail" currentUrl={cat.thumbnailUrl} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between shrink-0">
          <h3 className="font-black text-slate-900 uppercase">Pricelist Builder</h3>
          <button onClick={onClose}><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-auto p-6">
            {/* Minimal table for items */}
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={() => { onSave({ ...pricelist, items }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg">Save</button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands[0] || null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    return (
        <div className="flex gap-6 h-full">
             <div className="w-72 bg-white border border-slate-200 rounded-2xl overflow-y-auto p-4 shrink-0">
                 {sortedBrands.map(brand => (
                     <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-3 rounded-xl mb-2 cursor-pointer transition-all ${selectedBrand?.id === brand.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`}>
                         <div className="font-bold text-xs uppercase">{brand.name}</div>
                     </div>
                 ))}
             </div>
             <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredLists.map((item: any) => (
                         <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                             <input value={item.title} onChange={(e) => onSavePricelists(pricelists.map((p: any) => p.id === item.id ? { ...p, title: e.target.value } : p))} className="font-bold text-sm w-full outline-none" />
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  // localData holds our "draft" state that the admin is editing.
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const logout = useCallback(() => { 
    localStorage.removeItem('kiosk_admin_session'); 
    setCurrentUser(null); 
  }, []);

  // --- ADMIN SESSION TIMEOUT LOGIC ---
  const timeoutRef = useRef<number | null>(null);
  const ADMIN_IDLE_TIMEOUT = 5 * 60 * 1000; // 5 Minutes

  const resetAdminTimeout = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (currentUser) {
        timeoutRef.current = window.setTimeout(() => {
            console.log("Admin session timed out. Logging out for security.");
            logout();
        }, ADMIN_IDLE_TIMEOUT);
    }
  }, [currentUser, logout]);

  useEffect(() => {
    if (currentUser) {
        window.addEventListener('mousemove', resetAdminTimeout);
        window.addEventListener('mousedown', resetAdminTimeout);
        window.addEventListener('keydown', resetAdminTimeout);
        window.addEventListener('touchstart', resetAdminTimeout);
        resetAdminTimeout();
    }
    return () => {
        window.removeEventListener('mousemove', resetAdminTimeout);
        window.removeEventListener('mousedown', resetAdminTimeout);
        window.removeEventListener('keydown', resetAdminTimeout);
        window.removeEventListener('touchstart', resetAdminTimeout);
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [currentUser, resetAdminTimeout]);

  // CRITICAL: Prevent reloads/resets when global storeData is updated silently in background.
  useEffect(() => {
    if (storeData && localData) {
        setLocalData(prev => {
            if (!prev) return storeData;
            return {
                ...prev,
                fleet: storeData.fleet // Update telemetry only
            };
        });
    } else if (storeData && !localData) {
        setLocalData(storeData);
    }
  }, [storeData]);

  useEffect(() => {
    checkCloudConnection().then(setIsCloudConnected);
    const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLocalUpdate = (newData: StoreData) => {
      setLocalData(newData);
      setHasUnsavedChanges(true);
  };

  const handleGlobalSave = () => {
      if (localData) {
          onUpdateData(localData);
          setHasUnsavedChanges(false);
      }
  };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2">
                     <Settings className="text-blue-500" size={24} />
                     <h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1>
                 </div>
                 <div className="flex items-center gap-4">
                     <button 
                         onClick={handleGlobalSave}
                         disabled={!hasUnsavedChanges}
                         className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white shadow-xl animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                     >
                         {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                     </button>
                     <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'}`}>
                         {isCloudConnected ? 'Cloud Online' : 'Local Mode'}
                     </div>
                     <button onClick={logout} className="p-2 bg-red-900/50 text-red-400 rounded-lg" title="Manual Logout"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {['inventory', 'marketing', 'pricelists', 'tv', 'screensaver', 'fleet', 'settings', 'guide'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'guide' && <SystemDocumentation />}
            
            {activeTab === 'fleet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                    {localData.fleet?.map(kiosk => {
                        const isOnline = (new Date().getTime() - new Date(kiosk.last_seen).getTime()) < 300000;
                        return (
                            <div key={kiosk.id} className={`p-6 rounded-[2rem] bg-slate-900 border-2 transition-all ${isOnline ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-slate-800 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <div className={`w-2 h-2 rounded-full mb-2 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                                        <h3 className="font-black text-white uppercase text-base">{kiosk.name}</h3>
                                        <span className="text-[10px] text-slate-500 font-mono">{kiosk.assignedZone || 'UNASSIGNED'}</span>
                                    </div>
                                    <SignalStrengthBars strength={kiosk.wifiStrength || 0} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                                    <div className="text-[8px] text-slate-500 font-black uppercase">Last Pulse</div>
                                    <div className="text-[10px] text-slate-300 text-right font-bold">{new Date(kiosk.last_seen).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200">
                    <h2 className="text-2xl font-black text-slate-900 uppercase mb-8">System Settings</h2>
                    <InputField label="Device Setup PIN" val={localData.systemSettings?.setupPin} onChange={(e:any) => handleLocalUpdate({...localData, systemSettings: {...localData.systemSettings, setupPin: e.target.value}})} />
                    <FileUpload label="Company Logo" currentUrl={localData.companyLogoUrl} onUpload={(url:string) => handleLocalUpdate({...localData, companyLogoUrl: url})} />
                </div>
            )}

            {activeTab === 'inventory' && !selectedBrand && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <button onClick={() => handleLocalUpdate({...localData, brands: [...localData.brands, { id: generateId('b'), name: 'New Brand', categories: [] }]})} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all"><Plus size={32}/><span className="text-xs font-black uppercase mt-2">Add Brand</span></button>
                    {localData.brands.map(brand => (
                        <div key={brand.id} onClick={() => setSelectedBrand(brand)} className="aspect-square bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl transition-all group">
                            {brand.logoUrl ? <img src={brand.logoUrl} className="max-h-[60%] object-contain mb-4" /> : <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-2xl font-black text-slate-300">{brand.name.charAt(0)}</div>}
                            <h3 className="font-black text-slate-900 uppercase text-xs truncate w-full">{brand.name}</h3>
                        </div>
                    ))}
                </div>
            )}
        </main>
    </div>
  );
};

export default AdminDashboard;
