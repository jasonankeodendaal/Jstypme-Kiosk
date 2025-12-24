
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, QrCode
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

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
            </div>
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first.</p>
                        </div>
                    </div>
                )}
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
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none" type="text" placeholder="Admin Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none" type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
          {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 shadow-lg">Login</button>
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
              const res = await Promise.all(files.map(f => uploadFileToStorage(f)));
              onUpload(res);
          } else {
              const res = await uploadFileToStorage(files[0]);
              onUpload(res);
          }
      } catch (err) { alert("Upload error"); } finally { setIsProcessing(false); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase ${isProcessing ? 'opacity-50' : ''}`}>
              {isProcessing ? '...' : 'Select File'}
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
    const handleUpdate = (newList: Catalogue[]) => { onSave(newList); };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={() => handleUpdate([...catalogues, { id: generateId('cat'), title: 'New', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }])} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogues.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <input value={cat.title} onChange={(e) => handleUpdate(catalogues.map(c => c.id === cat.id ? { ...c, title: e.target.value } : c))} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm mb-4" placeholder="Title" />
                        <FileUpload label="Thumbnail" currentUrl={cat.thumbnailUrl} onUpload={(url: any) => handleUpdate(catalogues.map(c => c.id === cat.id ? { ...c, thumbnailUrl: url } : c))} />
                        <button onClick={() => handleUpdate(catalogues.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-black uppercase mb-4">Pricelist Hub</h2>
            <p className="text-slate-500">Manage digital price books here.</p>
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New'}</h3>
                <button onClick={onCancel}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                <InputField label="Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-4">
                <button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button>
                <button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Confirm</button>
            </div>
        </div>
    );
};

const importZip = async (file: File) => { return []; };
const downloadZip = async (data: StoreData | null) => {};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero'); 
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
      { id: 'guide', label: 'System Guide', icon: BookOpen }
  ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => {
      checkCloudConnection().then(setIsCloudConnected);
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

  if (!localData) return null;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-inter">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2">
                     <Settings className="text-blue-500" size={24} />
                     <h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>Save Changes</button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 relative pb-40">
            {activeTab === 'screensaver' && (
                <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Screensaver Logic</h2>
                            <p className="text-slate-500 font-medium">Configure visuals for idle device playback.</p>
                        </div>
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl border border-blue-100 flex items-center gap-3">
                            <Monitor size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Interactive<br/>Preview Active</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Section 1: Timing & Schedule */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={24} /></div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Timing & Schedule</h3>
                            </div>
                            <div className="space-y-6 flex-1">
                                <InputField label="Idle Timeout (Seconds)" type="number" val={localData.screensaverSettings?.idleTimeout || 60} onChange={(e: any) => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value) } })} />
                                <InputField label="Slide Duration (Seconds)" type="number" val={localData.screensaverSettings?.imageDuration || 8} onChange={(e: any) => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, imageDuration: parseInt(e.target.value) } })} />
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Night Sleep Mode</label>
                                        <button onClick={() => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, enableSleepMode: !localData.screensaverSettings?.enableSleepMode } })} className={`w-12 h-6 rounded-full transition-all relative ${localData.screensaverSettings?.enableSleepMode ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.enableSleepMode ? 'left-7' : 'left-1'}`}></div></button>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-3 transition-opacity ${localData.screensaverSettings?.enableSleepMode ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                        <div><label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Wake Up</label><input type="time" value={localData.screensaverSettings?.activeHoursStart || '08:00'} onChange={(e) => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, activeHoursStart: e.target.value } })} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold" /></div>
                                        <div><label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Go to Sleep</label><input type="time" value={localData.screensaverSettings?.activeHoursEnd || '20:00'} onChange={(e) => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, activeHoursEnd: e.target.value } })} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Content Selection */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Grid size={24} /></div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Content Library</h3>
                            </div>
                            <div className="space-y-3 flex-1">
                                {[
                                    { key: 'showProductImages', label: 'Product Photos' },
                                    { key: 'showProductVideos', label: 'Product Cinema' },
                                    { key: 'showPamphlets', label: 'Global Pamphlets' },
                                    { key: 'showCustomAds', label: 'Marketing Ads' },
                                    { key: 'muteVideos', label: 'Global Video Mute' },
                                    { key: 'showInfoOverlay', label: 'Dynamic Text Overlay' }
                                ].map(opt => (
                                    <div key={opt.key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                                        <label className="text-xs font-black uppercase text-slate-700">{opt.label}</label>
                                        <button onClick={() => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, [opt.key]: !(localData.screensaverSettings as any)[opt.key] } })} className={`w-10 h-5 rounded-full transition-all relative ${(localData.screensaverSettings as any)[opt.key] ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${(localData.screensaverSettings as any)[opt.key] ? 'left-6' : 'left-1'}`}></div></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Visual Effects (UPGRADED) */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Zap size={24} /></div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Visual Aesthetics</h3>
                            </div>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transition Style</label>
                                    <select 
                                        value={localData.screensaverSettings?.transitionStyle || 'random'}
                                        onChange={(e) => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, transitionStyle: e.target.value as any } })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs uppercase outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="random">Randomized Engine</option>
                                        <option value="ken-burns">Slow Pan (Ken Burns)</option>
                                        <option value="fade">Cross Fade</option>
                                        <option value="zoom">Elastic Zoom</option>
                                        <option value="slide">Dynamic Slide</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <Clock size={16} className="text-slate-400" />
                                             <span className="text-[10px] font-black uppercase text-slate-700">Show Live Clock</span>
                                         </div>
                                         <button onClick={() => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, showClock: !localData.screensaverSettings?.showClock } })} className={`w-10 h-5 rounded-full relative transition-all ${localData.screensaverSettings?.showClock ? 'bg-blue-500' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.showClock ? 'left-6' : 'left-1'}`}></div></button>
                                     </div>

                                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <QrCode size={16} className="text-slate-400" />
                                             <span className="text-[10px] font-black uppercase text-slate-700">Scan to Website</span>
                                         </div>
                                         <button onClick={() => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, showQrCode: !localData.screensaverSettings?.showQrCode } })} className={`w-10 h-5 rounded-full relative transition-all ${localData.screensaverSettings?.showQrCode ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.showQrCode ? 'left-6' : 'left-1'}`}></div></button>
                                     </div>

                                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <ImageIcon size={16} className="text-slate-400" />
                                             <span className="text-[10px] font-black uppercase text-slate-700">Subtle Watermark</span>
                                         </div>
                                         <button onClick={() => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, showWatermark: !localData.screensaverSettings?.showWatermark } })} className={`w-10 h-5 rounded-full relative transition-all ${localData.screensaverSettings?.showWatermark ? 'bg-slate-900' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.showWatermark ? 'left-6' : 'left-1'}`}></div></button>
                                     </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overlay Corner</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map(pos => (
                                            <button 
                                                key={pos}
                                                onClick={() => handleLocalUpdate({ ...localData, screensaverSettings: { ...localData.screensaverSettings!, overlayPosition: pos as any } })}
                                                className={`p-2 rounded-lg border text-[8px] font-black uppercase transition-all ${localData.screensaverSettings?.overlayPosition === pos ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                                            >
                                                {pos.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && !selectedBrand && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-fade-in">
                    <button onClick={() => { const name = prompt("Brand Name:"); if(name) handleLocalUpdate({ ...localData, brands: [...localData.brands, { id: generateId('b'), name, categories: [] }] }) }} className="bg-white border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-slate-300 hover:border-blue-500 hover:text-blue-500 transition-all min-h-[220px] group">
                        <Plus size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase text-xs tracking-[0.2em]">New Brand</span>
                    </button>
                    {localData.brands.map(brand => (
                        <div key={brand.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group relative flex flex-col">
                            <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 aspect-square relative overflow-hidden">
                                {brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-6xl font-black text-slate-100">{brand.name.charAt(0)}</span>}
                            </div>
                            <div className="p-6 bg-white border-t border-slate-50">
                                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter truncate">{brand.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">{brand.categories.length} Folders</p>
                                <button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors">Configure</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    </div>
  );
};

export default AdminDashboard;
