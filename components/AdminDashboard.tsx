import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, Sliders
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

            {/* Enhanced Sidebar */}
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
            
            {/* Dynamic Content Area */}
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] pointer-events-none rounded-full"></div>

                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It only needs internet to sync up with your latest changes.</p>
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
                                    </div>
                                </div>

                                <div className="flex-1 w-full h-24 relative flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/5 rounded-full relative">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-8 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest">Cloud Tunnel</div>
                                </div>

                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1">
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
                {/* ... rest of sections ... */}
            </div>
        </div>
    );
};

// ... Auth and other helper components ...

const AdSchedulerModal = ({ ad, onSave, onClose }: { ad: AdItem, onSave: (updated: AdItem) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<AdItem>({ 
        ...ad, 
        activeDays: ad.activeDays || [0,1,2,3,4,5,6] 
    });

    const toggleDay = (day: number) => {
        const current = draft.activeDays || [];
        const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
        setDraft({ ...draft, activeDays: next });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-slate-900 uppercase">Asset Scheduling</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Start Date</label>
                            <input type="date" value={draft.startDate || ''} onChange={e => setDraft({...draft, startDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">End Date</label>
                            <input type="date" value={draft.endDate || ''} onChange={e => setDraft({...draft, endDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Active Weekdays</label>
                        <div className="flex flex-wrap gap-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => {
                                const isActive = draft.activeDays?.includes(i);
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => toggleDay(i)}
                                        className={`w-8 h-8 rounded-full font-black text-xs transition-all border ${isActive ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={() => onSave(draft)} className="px-6 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-xl shadow-lg">Save Schedule</button>
                </div>
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
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin);
    else setError('Invalid credentials.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <InputField label="Admin Name" val={name} onChange={(e:any) => setName(e.target.value)} autoFocus />
          <InputField label="PIN Code" val={pin} onChange={(e:any) => setPin(e.target.value)} type="password" />
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
      const files = Array.from(e.target.files) as File[];
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';
      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const url = await uploadFileToStorage(files[i]);
                  results.push(url);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results, fileType);
          } else {
              const url = await uploadFileToStorage(files[0]);
              onUpload(url, fileType);
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
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video size={16} /> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
              <Upload size={10} className="inline mr-1" /> {isProcessing ? '...' : 'Select'}
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text', autoFocus = false }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input autoFocus={autoFocus} type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

// ... rest of managers ...

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('brands'); 
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [schedulingAd, setSchedulingAd] = useState<{ ad: AdItem, zone: string } | null>(null);

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

  const availableTabs = [
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'pricelists', label: 'Pricelists', icon: RIcon },
      { id: 'screensaver', label: 'Screensaver', icon: Monitor },
      { id: 'fleet', label: 'Fleet', icon: Tablet },
      { id: 'history', label: 'History', icon: History },
      { id: 'settings', label: 'Settings', icon: Settings },
  ].filter(tab => currentUser?.permissions[tab.id as keyof AdminPermissions]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2">
                     <Settings className="text-blue-500" size={24} />
                     <h1 className="text-lg font-black uppercase tracking-widest">Admin Hub</h1>
                 </div>
                 <button 
                     onClick={handleGlobalSave}
                     disabled={!hasUnsavedChanges}
                     className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs ${hasUnsavedChanges ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                 >
                     {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                 </button>
                 <div className="flex gap-2">
                    <button onClick={onRefresh} className="p-2 bg-slate-800 rounded-lg text-white"><RefreshCw size={16} /></button>
                    <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 rounded-lg text-red-400"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
            {activeTab === 'screensaver' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500"><Sliders size={120} /></div>
                        <h3 className="font-black text-slate-900 uppercase text-sm mb-8 flex items-center gap-3"><Sliders className="text-blue-600" /> Weighted Shuffle Controls</h3>
                        
                        <div className="space-y-10">
                            {[
                                { key: 'adWeight', label: 'Advertising Asset Weight', icon: <Megaphone className="text-purple-500"/>, desc: 'Controls how often custom marketing ads appear.' },
                                { key: 'productWeight', label: 'Product Showcase Weight', icon: <Box className="text-blue-500"/>, desc: 'Controls how often catalog products appear.' },
                                { key: 'pamphletWeight', label: 'Pamphlet Showcase Weight', icon: <BookOpen className="text-green-500"/>, desc: 'Controls how often pamphlet covers appear.' }
                            ].map(w => (
                                <div key={w.key} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">{w.icon}</div>
                                            <div>
                                                <div className="text-xs font-black uppercase text-slate-800 tracking-tight">{w.label}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{w.desc}</div>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-blue-600">{(localData.screensaverSettings as any)[w.key] || 1}x</div>
                                    </div>
                                    <input 
                                        type="range" min="0" max="5" step="1" 
                                        value={(localData.screensaverSettings as any)[w.key] || 1} 
                                        onChange={(e) => handleLocalUpdate({
                                            ...localData,
                                            screensaverSettings: { ...localData.screensaverSettings!, [w.key]: parseInt(e.target.value) }
                                        })}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest"><span>Disabled</span><span>Standard</span><span>Frequent</span><span>Maximum Priority</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-900 uppercase text-xs mb-6 flex items-center gap-2"><Wind size={16} className="text-purple-500" /> Transition Lock</h3>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Active Animation</label>
                                <select 
                                    value={localData.screensaverSettings?.lockedEffect || 'random'}
                                    onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, lockedEffect: e.target.value as any}})}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="random">Dynamic Random Shuffle</option>
                                    <option value="effect-smooth-zoom">Static: Smooth Cinematic Zoom</option>
                                    <option value="effect-subtle-drift">Static: Subtle Vertical Drift</option>
                                    <option value="effect-soft-scale">Static: Soft Scale Reveal</option>
                                    <option value="effect-gentle-pan">Static: Gentle Horizontal Pan</option>
                                </select>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">By default, the system chooses a random cinematic effect for every image to prevent screen burn-in.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-900 uppercase text-xs mb-6 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Wake Behavior</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                    <button 
                                        onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, wakeBehavior: 'reset'}})}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${localData.screensaverSettings?.wakeBehavior !== 'resume' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                                    >
                                        Return Home
                                    </button>
                                    <button 
                                        onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, wakeBehavior: 'resume'}})}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${localData.screensaverSettings?.wakeBehavior === 'resume' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                                    >
                                        Resume View
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                    <strong>Home:</strong> Resets view to brand grid on touch. <br/>
                                    <strong>Resume:</strong> Customer stays on the specific product shown in the loop.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'marketing' && activeSubTab === 'ads' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {['homeBottomLeft', 'homeBottomRight', 'screensaver'].map(zone => (
                        <div key={zone} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h4 className="font-black uppercase text-sm mb-4">{zone}</h4>
                            <FileUpload label="Add Media" accept="image/*,video/*" allowMultiple onUpload={(urls:any, type:any) => {
                                const newAds = (Array.isArray(urls)?urls:[urls]).map(u=>({id:generateId('ad'), type, url:u, dateAdded: new Date().toISOString()}));
                                handleLocalUpdate({...localData, ads: {...localData.ads, [zone]: [...((localData.ads as any)[zone] || []), ...newAds]} as any});
                            }} />
                            <div className="grid grid-cols-1 gap-3 mt-6">
                                {((localData.ads as any)[zone] || []).map((ad: any, idx: number) => (
                                    <div key={ad.id} className="relative bg-slate-50 rounded-2xl border border-slate-100 p-3 flex items-center gap-4 group">
                                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100">
                                            {ad.type === 'video' ? <video src={ad.url} className="w-full h-full object-cover" /> : <img src={ad.url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black text-slate-900 uppercase truncate">Asset {idx + 1}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => setSchedulingAd({ ad, zone })} className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                                                    <Calendar size={10}/> {ad.startDate ? 'Scheduled' : 'Configure'}
                                                </button>
                                                {ad.activeDays && ad.activeDays.length < 7 && <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded">Filtered</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => {
                                            const updatedZone = (localData.ads as any)[zone].filter((_: any, i: number) => i !== idx);
                                            handleLocalUpdate({...localData, ads: {...localData.ads, [zone]: updatedZone} as any});
                                        }} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* ... other tabs ... */}
        </main>

        {schedulingAd && (
            <AdSchedulerModal 
                ad={schedulingAd.ad} 
                onClose={() => setSchedulingAd(null)}
                onSave={(updated) => {
                    const zone = schedulingAd.zone;
                    const adsInZone = (localData.ads as any)[zone] || [];
                    const updatedAds = adsInZone.map((a: any) => a.id === updated.id ? updated : a);
                    handleLocalUpdate({...localData, ads: {...localData.ads, [zone]: updatedAds} as any});
                    setSchedulingAd(null);
                }} 
            />
        )}
    </div>
  );
};

export default AdminDashboard;