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

// Custom R Icon for Pricelists
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
            `}</style>
            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3"><div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span></div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
                </div>
                <div className="space-y-2 flex-1">
                    {sections.map(section => (
                        <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <div className={`p-2 rounded-xl transition-all duration-500 ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>{React.cloneElement(section.icon as React.ReactElement<any>, { size: 18 })}</div>
                            <div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div><div className={`text-[9px] font-bold uppercase truncate opacity-60 ${activeSection === section.id ? 'text-blue-100' : 'text-slate-500'}`}>{section.desc}</div></div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && <div className="space-y-20 animate-fade-in max-w-5xl"><div className="space-y-4"><div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div><h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2><p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first.</p></div></div>}
                {activeSection === 'pricelists' && <div className="space-y-20 animate-fade-in max-w-5xl"><div className="space-y-4"><div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-green-500/20">Module 03: Fin-Tech Engine</div><h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Pricelist Synthesis</h2><p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Systematic versioning with v01, v02 incremental identifiers.</p></div></div>}
            </div>
        </div>
    );
};

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} /></div>
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button>
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
      const files = Array.from(e.target.files);
      try {
          if (allowMultiple) {
              const urls = [];
              for(const f of files) urls.push(await uploadFileToStorage(f));
              onUpload(urls);
          } else {
              const url = await uploadFileToStorage(files[0]);
              onUpload(url);
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
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={() => handleUpdate([...localList, { id: generateId('cat'), title: 'New', brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear() }])} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col p-4">
                        <input value={cat.title} onChange={(e) => handleUpdate(localList.map(c => c.id === cat.id ? { ...c, title: e.target.value } : c))} className="w-full font-black text-slate-900 outline-none text-sm" />
                        <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 mt-4 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [isImporting, setIsImporting] = useState(false);
  const addItem = () => { setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]); };
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => { setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item)); };
  const removeItem = (id: string) => { setItems(items.filter(item => item.id !== id)); };

  const handleSave = () => {
      // 1. Prepare versioning
      const currentVersion = pricelist.version || 'v00';
      const versionNum = parseInt(currentVersion.replace('v', '')) || 0;
      const nextVersion = `v${(versionNum + 1).toString().padStart(2, '0')}`;
      
      // 2. Clone current for history (snapshot of current data before update)
      const { history: oldHistory, ...snapshot } = pricelist;
      const newHistory = [
          { ...snapshot, items: [...(pricelist.items || [])] },
          ...(pricelist.history || [])
      ].slice(0, 10); // Keep last 10 versions

      // 3. Update core data
      const updatedPricelist: Pricelist = {
          ...pricelist,
          items: items,
          version: nextVersion,
          dateAdded: new Date().toISOString(),
          history: newHistory
      };
      
      onSave(updatedPricelist);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div><h3 className="font-black text-slate-900 uppercase text-lg">Pricelist Builder <span className="text-blue-500">{pricelist.version || 'v01'}</span></h3></div>
          <div className="flex gap-2">
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th></tr>
            </thead>
            <tbody>{items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50"><td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td><td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td><td className="p-2"><input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm" /></td><td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400"><Trash2 size={16}/></button></td></tr>
              ))}</tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg flex items-center gap-2"><Save size={16} /> Update Version</button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => { onSavePricelists(pricelists.map((p: any) => p.id === id ? { ...p, ...updates } : p)); };
    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
             <div className="w-full md:w-72 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto">{sortedBrands.map((b: any) => (<button key={b.id} onClick={() => setSelectedBrand(b)} className={`w-full text-left p-3 rounded-xl mb-2 flex items-center gap-3 transition-all ${selectedBrand?.id === b.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}><div className="font-bold text-xs uppercase truncate">{b.name}</div></button>))}</div>
             <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto"><div className="flex justify-between items-center mb-6"><h3 className="font-black uppercase text-slate-900">{selectedBrand?.name}</h3><button onClick={() => { if(selectedBrand) onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New', type: 'manual', month: 'May', year: '2024', version: 'v01', history: [] }]); }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase"><Plus size={14}/> New</button></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredLists.map((item: any) => (<div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group"><div className="flex justify-between items-start mb-2"><div className="font-black text-sm uppercase text-slate-900 truncate pr-8">{item.title}</div><div className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">{item.version || 'v01'}</div></div><div className="text-[10px] font-bold text-slate-400 uppercase mb-4">{item.month} {item.year}</div>{item.type === 'manual' && <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-white border border-slate-200 text-blue-600 rounded-lg text-[10px] font-black uppercase mb-2">Edit Table</button>}<button onClick={() => onDeletePricelist(item.id)} className="absolute top-2 right-2 p-1 bg-white text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button></div>))}</div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, pl)} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  if (!localData) return null;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;
  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl z-20"><div className="flex items-center gap-2"><Settings className="text-blue-500" /><h1 className="font-black uppercase tracking-widest text-sm">Admin Hub</h1></div><div className="flex items-center gap-4"><button onClick={() => { onUpdateData(localData!); setHasUnsavedChanges(false); }} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button><button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16}/></button></div></header>
        <div className="bg-slate-900 text-slate-400 flex border-t border-slate-800 shrink-0 overflow-x-auto no-scrollbar">{['inventory', 'marketing', 'pricelists', 'screensaver', 'fleet', 'history', 'settings', 'guide'].filter(t => t === 'guide' || (currentUser.permissions as any)[t]).map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent hover:text-white'}`}>{tab}</button>))}</div>
        <main className="flex-1 overflow-y-auto p-8 pb-32">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{localData.brands.map(b => (<button key={b.id} onClick={() => {}} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md text-center group"><div className="font-black text-slate-900 uppercase text-xs">{b.name}</div></button>))}</div>}
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p: any) => handleLocalUpdate({ ...localData, pricelists: p })} onDeletePricelist={(id: string) => handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) })} />}
        </main>
    </div>
  );
};

export default AdminDashboard;