
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

// ... (UI Components SignalStrengthBars, RIcon remain unchanged) ...
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

// ... (SystemDocumentation, Auth, FileUpload, InputField, CatalogueManager, ManualPricelistEditor remain unchanged) ...
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
            </div>
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It uses incremental saves to sync only changed data.</p>
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
    setError('');
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <InputField label="Admin Name" val={name} onChange={(e:any)=>setName(e.target.value)} />
          <InputField label="PIN Code" type="password" val={pin} onChange={(e:any)=>setPin(e.target.value)} />
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase shadow-lg">Login</button>
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
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';
      const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(file); });
      const uploadSingle = async (file: File) => { const localBase64 = await readFileAsBase64(file); try { const url = await uploadFileToStorage(file); return { url, base64: localBase64 }; } catch (e) { return { url: localBase64, base64: localBase64 }; } };
      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) { const res = await uploadSingle(files[i]); results.push(res.url); setUploadProgress(((i+1)/files.length)*100); }
              onUpload(results, fileType);
          } else { const res = await uploadSingle(files[0]); setUploadProgress(100); onUpload(res.url, fileType, res.base64); }
      } catch (err) { alert("Upload error"); } finally { setTimeout(() => { setIsProcessing(false); setUploadProgress(0); }, 500); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video size={16}/> : accept.includes('pdf') ? <FileText size={16}/> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
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
    const handleUpdate = (newList: Catalogue[], immediate = false) => { setLocalList(newList); onSave(newList, immediate); };
    const addCatalogue = () => handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }], true);
    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c), immediate);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col p-4">
                        <InputField label="Title" val={cat.title} onChange={(e:any)=>updateCatalogue(cat.id, {title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <FileUpload label="Thumbnail" currentUrl={cat.thumbnailUrl} onUpload={(url:any)=>updateCatalogue(cat.id, {thumbnailUrl: url}, true)} />
                            <FileUpload label="PDF File" accept="application/pdf" icon={<FileText/>} onUpload={(url:any)=>updateCatalogue(cat.id, {pdfUrl: url}, true)} />
                        </div>
                        <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} className="text-red-400 mt-2 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [title, setTitle] = useState(pricelist.title || ''); 
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 bg-slate-50 flex justify-between">
            <h2 className="font-black text-slate-900 uppercase">Edit Table Items</h2>
            <button onClick={onClose}><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-auto p-6">
            <table className="w-full text-left">
                <thead><tr className="text-[10px] uppercase font-black text-slate-400"><th>SKU</th><th>Description</th><th>Price</th></tr></thead>
                <tbody>{items.map(item=>(<tr key={item.id}><td><input value={item.sku} onChange={e=>updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 border-b" /></td><td><input value={item.description} onChange={e=>updateItem(item.id, 'description', e.target.value)} className="w-full p-2 border-b" /></td><td><input value={item.normalPrice} onChange={e=>updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 border-b" /></td></tr>))}</tbody>
            </table>
            <button onClick={addItem} className="mt-4 bg-slate-100 p-2 rounded text-xs font-bold uppercase w-full">Add Row</button>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-2"><button onClick={onClose}>Cancel</button><button onClick={()=>onSave({...pricelist, items})} className="bg-blue-600 text-white px-4 py-2 rounded font-black">Save Table</button></div>
      </div>
    </div>
  );
};

// ... (PricelistManager, ProductEditor, KioskEditorModal remain unchanged logic-wise) ...
const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = [...pricelistBrands].sort((a,b)=>a.name.localeCompare(b.name));
    const [selectedBrand, setSelectedBrand] = useState(sortedBrands[0] || null);
    const updatePricelist = (id: string, updates: any) => onSavePricelists(pricelists.map((p:any)=>p.id===id?{...p, ...updates}:p), true);
    return (
        <div className="flex gap-6 h-full">
            <div className="w-64 bg-white rounded-2xl p-4 shadow-sm space-y-2">
                {sortedBrands.map(b=>(<button key={b.id} onClick={()=>setSelectedBrand(b)} className={`w-full text-left p-3 rounded-xl font-bold uppercase text-xs ${selectedBrand?.id===b.id?'bg-blue-600 text-white':'hover:bg-slate-50'}`}>{b.name}</button>))}
            </div>
            <div className="flex-1 space-y-4">
                {pricelists.filter((p:any)=>p.brandId===selectedBrand?.id).map((pl:any)=>(
                    <div key={pl.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                        <span className="font-black uppercase text-sm">{pl.title}</span>
                        <div className="flex gap-2">
                            <FileUpload label="PDF" accept="application/pdf" onUpload={(url:any)=>updatePricelist(pl.id, {url})} />
                            <button onClick={()=>onDeletePricelist(pl.id)} className="text-red-500"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3><button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8">
                <InputField label="Name" val={draft.name} onChange={(e:any)=>setDraft({...draft, name: e.target.value})} />
                <InputField label="SKU" val={draft.sku} onChange={(e:any)=>setDraft({...draft, sku: e.target.value})} />
                <InputField label="Description" isArea val={draft.description} onChange={(e:any)=>setDraft({...draft, description: e.target.value})} />
                <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url:any)=>setDraft({...draft, imageUrl: url})} />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2"><button onClick={onCancel}>Cancel</button><button onClick={()=>onSave(draft)} className="bg-blue-600 text-white px-4 py-2 rounded font-black">Confirm</button></div>
        </div>
    );
};

// ... (Existing zip imports, download zip logic remains same) ...
const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip();
    let loadedZip;
    try { loadedZip = await zip.loadAsync(file); } catch (e) { throw new Error("Invalid ZIP file"); }
    const newBrands: Record<string, Brand> = {};
    const validFiles = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir && !path.includes('__MACOSX'));
    const processAsset = async (zipObj: any, filename: string): Promise<string> => { const blob = await zipObj.async("blob"); try { const fileToUpload = new File([blob], filename, { type: "image/jpeg" }); return await uploadFileToStorage(fileToUpload); } catch (e) { return ""; } };
    for (const rawPath of Object.keys(loadedZip.files)) { 
        const parts = rawPath.split('/').filter(p=>p); if(parts.length < 3) continue;
        const [brandName, catName, prodName] = parts;
        if(!newBrands[brandName]) newBrands[brandName] = { id: generateId('b'), name: brandName, categories: [] };
        let cat = newBrands[brandName].categories.find(c=>c.name===catName);
        if(!cat) { cat = { id: generateId('c'), name: catName, icon: 'Box', products: [] }; newBrands[brandName].categories.push(cat); }
        let prod = cat.products.find(p=>p.name===prodName);
        if(!prod) { prod = { id: generateId('p'), name: prodName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '' }; cat.products.push(prod); }
    }
    return Object.values(newBrands);
};

export const AdminDashboard = ({ storeData, onUpdateData, onPatchData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onPatchData: (path: string[], value: any, full: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => { if (!hasUnsavedChanges && storeData) { setLocalData(storeData); } }, [storeData, hasUnsavedChanges]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);

  const handleSurgicalUpdate = (path: string[], value: any, updatedFullState: StoreData) => {
      setLocalData(updatedFullState);
      onPatchData(path, value, updatedFullState);
      setHasUnsavedChanges(false);
  };

  const handleMonolithicUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) { onUpdateData(newData); setHasUnsavedChanges(false); } else { setHasUnsavedChanges(true); }
  };

  if (!localData) return <div>Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'Setup Guide', icon: BookOpen } ].filter(tab => currentUser.permissions[tab.id as keyof AdminPermissions] || tab.id === 'guide');

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2"><Settings className="text-blue-500" /> <h1 className="font-black uppercase tracking-widest text-sm">Control Center</h1></div>
            <div className="flex gap-4">
                {hasUnsavedChanges && <button onClick={()=>onUpdateData(localData)} className="bg-blue-600 px-4 py-1.5 rounded font-black text-[10px] uppercase animate-pulse">Save All</button>}
                <button onClick={()=>setCurrentUser(null)} className="text-red-400 text-[10px] font-black uppercase">Logout</button>
            </div>
        </header>
        <div className="flex bg-white border-b border-slate-200 overflow-x-auto shrink-0">
            {availableTabs.map(t=>(<button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab===t.id?'border-blue-600 text-blue-600 bg-blue-50/30':'border-transparent text-slate-400'}`}>{t.label}</button>))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'guide' && <SetupGuide onClose={() => setActiveTab('inventory')} />}
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                        <button onClick={()=>{const n=prompt("Brand:"); if(n) handleMonolithicUpdate({...localData, brands: [...localData.brands, {id: generateId('b'), name: n, categories: []}]}, true)}} className="border-2 border-dashed aspect-square flex flex-col items-center justify-center text-slate-300"><Plus/> Add Brand</button>
                        {localData.brands.map(b=>(<button key={b.id} onClick={()=>setSelectedBrand(b)} className="bg-white p-4 rounded-xl border flex flex-col items-center justify-center aspect-square shadow-sm">
                            {b.logoUrl ? <img src={b.logoUrl} className="w-12 h-12 object-contain mb-2" /> : <div className="text-2xl font-black text-slate-200 mb-2">{b.name[0]}</div>}
                            <span className="font-black text-[10px] uppercase text-slate-900 truncate w-full text-center">{b.name}</span>
                        </button>))}
                    </div>
                ) : !selectedCategory ? (
                    <div className="space-y-4">
                        <button onClick={()=>setSelectedBrand(null)} className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
                        <div className="grid grid-cols-4 gap-4">
                            <button onClick={()=>{const n=prompt("Category:"); if(n){ const updated={...selectedBrand, categories:[...selectedBrand.categories, {id:generateId('c'), name:n, icon:'Box', products:[]}]}; handleMonolithicUpdate({...localData, brands: localData.brands.map(x=>x.id===selectedBrand.id?updated:x)}, true) }}} className="border-2 border-dashed p-4 flex flex-col items-center justify-center text-slate-300">Add Cat</button>
                            {selectedBrand.categories.map(c=>(<button key={c.id} onClick={()=>setSelectedCategory(c)} className="bg-white p-4 border rounded-xl font-black uppercase text-xs text-center">{c.name}</button>))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <button onClick={()=>setSelectedCategory(null)} className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><ChevronLeft size={14}/> Back to Categories</button>
                            <button onClick={()=>setEditingProduct({id:generateId('p'), name:'', description:'', imageUrl:'', specs:{}, features:[], dimensions:[]} as any)} className="bg-blue-600 text-white px-4 py-2 rounded text-[10px] font-black uppercase">Add Product</button>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {selectedCategory.products.map(p=>(<div key={p.id} className="bg-white rounded-xl border overflow-hidden flex flex-col"><div className="aspect-square bg-slate-50 flex items-center justify-center p-4"><img src={p.imageUrl} className="max-w-full max-h-full object-contain" /></div><div className="p-4 flex justify-between"><span className="font-bold uppercase text-[10px] truncate w-[70%]">{p.name}</span><button onClick={()=>setEditingProduct(p)} className="text-blue-500"><Edit2 size={14}/></button></div></div>))}
                        </div>
                    </div>
                )
            )}
            
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists} pricelistBrands={localData.pricelistBrands} onSavePricelists={(p:any)=>handleMonolithicUpdate({...localData, pricelists: p}, true)} onSaveBrands={(b:any)=>handleMonolithicUpdate({...localData, pricelistBrands:b}, true)} />}
        </main>

        {editingProduct && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm p-8 flex items-center justify-center">
                <ProductEditor product={editingProduct} onCancel={()=>setEditingProduct(null)} onSave={(p)=>{
                    if(!selectedBrand || !selectedCategory) return;
                    
                    // 1. Calculate Path for Surgical Update
                    const bIdx = localData.brands.findIndex(b=>b.id === selectedBrand.id);
                    const cIdx = selectedBrand.categories.findIndex(c=>c.id === selectedCategory.id);
                    const pIdx = selectedCategory.products.findIndex(x=>x.id === p.id);
                    
                    const isNew = pIdx === -1;
                    const path = ['brands', bIdx.toString(), 'categories', cIdx.toString(), 'products'];
                    
                    let newProducts;
                    if(isNew) {
                        newProducts = [...selectedCategory.products, p];
                        handleSurgicalUpdate(path, newProducts, {
                            ...localData,
                            brands: localData.brands.map((b, ix)=>ix === bIdx ? {
                                ...b, categories: b.categories.map((c, jx)=>jx === cIdx ? {...c, products: newProducts} : c)
                            } : b)
                        });
                    } else {
                        newProducts = selectedCategory.products.map(x=>x.id===p.id?p:x);
                        handleSurgicalUpdate([...path, pIdx.toString()], p, {
                            ...localData,
                            brands: localData.brands.map((b, ix)=>ix === bIdx ? {
                                ...b, categories: b.categories.map((c, jx)=>jx === cIdx ? {...c, products: newProducts} : c)
                            } : b)
                        });
                    }
                    setEditingProduct(null);
                }} />
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
