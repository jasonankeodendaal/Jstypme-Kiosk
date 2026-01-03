
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, Film, PlaySquare, MonitorPlay, MonitorStop, SkipForward
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
            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span></div>
                    <h2 className="text-white font-black text-2xl tracking-tighter">System <span className="text-blue-500">Guides</span></h2>
                </div>
                <div className="space-y-2 flex-1">
                    {sections.map(section => (
                        <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <div className={`p-2 rounded-xl transition-all duration-500 ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>{section.icon}</div>
                            <div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div><div className={`text-[9px] font-bold uppercase truncate opacity-60`}>{section.desc}</div></div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p>
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
    setError('');
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
          <InputField label="Admin Name" val={name} onChange={(e: any) => setName(e.target.value)} autoFocus />
          <InputField label="PIN Code" type="password" val={pin} onChange={(e: any) => setPin(e.target.value)} />
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
      setIsProcessing(true); setUploadProgress(10);
      const files = Array.from(e.target.files) as File[];
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';
      const uploadSingle = async (file: File) => {
           try { const url = await uploadFileToStorage(file); return { url }; } 
           catch (e) { const reader = new FileReader(); return new Promise(r => { reader.onloadend = () => r({url: reader.result as string}); reader.readAsDataURL(file); }); }
      };
      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const res = await uploadSingle(files[i]);
                  results.push((res as any).url);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results, fileType);
          } else {
              const res: any = await uploadSingle(files[0]);
              setUploadProgress(100);
              onUpload(res.url, fileType);
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
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : icon}
        </div>
        <label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50' : ''}`}>
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
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} autoFocus={autoFocus} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);
    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => { handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear() }]); };
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => { handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c)); };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col p-4">
                        <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm mb-4" placeholder="Title" />
                        <FileUpload label="Cover Image" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} />
                        <FileUpload label="PDF (Optional)" accept="application/pdf" icon={<FileText />} currentUrl={cat.pdfUrl} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} />
                        <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase mt-2"><Trash2 size={12} /> Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const addItem = () => { setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '' }]); };
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => { setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item)); };
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 className="font-black text-slate-900 uppercase text-lg">Pricelist Builder</h3>
          <div className="flex gap-2"><button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase">Add Row</button><button onClick={onClose} className="p-2 text-slate-400"><X size={24}/></button></div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left">
            <thead><tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase">Normal</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase">Promo</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 border border-slate-200 rounded" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 border border-slate-200 rounded" /></td>
                  <td className="p-2"><input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 border border-slate-200 rounded" /></td>
                  <td className="p-2"><input value={item.promoPrice} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 border border-slate-200 rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl">Save</button></div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands }: any) => {
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(pricelistBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const addBrand = () => { const name = prompt("Brand Name:"); if (name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name }]); };
    const addPricelist = () => { if (!selectedBrand) return; onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', type: 'pdf', month: 'January', year: '2024' }]); };
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => onSavePricelists(pricelists.map((p: any) => p.id === id ? { ...p, ...updates } : p));
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
             <div className="w-72 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-2">
                 <div className="flex justify-between items-center mb-4"><h2 className="font-black text-slate-900 uppercase text-xs">Pricelist Brands</h2><button onClick={addBrand} className="text-blue-600"><Plus size={18}/></button></div>
                 {pricelistBrands.map((brand:any) => (
                    <button key={brand.id} onClick={() => setSelectedBrand(brand)} className={`w-full text-left p-3 rounded-xl border text-xs font-bold uppercase ${selectedBrand?.id === brand.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{brand.name}</button>
                 ))}
             </div>
             <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col shadow-inner overflow-y-auto">
                 <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-900 uppercase text-sm">{selectedBrand?.name || 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={16}/> Add List</button></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {filteredLists.map((item: any) => (
                         <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group">
                             <input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-transparent focus:border-blue-500 outline-none pb-1 text-sm bg-transparent" placeholder="Pricelist Title" />
                             <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => updatePricelist(item.id, { type: 'pdf' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${item.type !== 'manual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>PDF</button>
                                <button onClick={() => updatePricelist(item.id, { type: 'manual' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${item.type === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>TABLE</button>
                             </div>
                             {item.type === 'manual' ? <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-black text-[10px] uppercase">Edit Builder</button> : <FileUpload label="PDF Document" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url })} />}
                             <button onClick={() => onSavePricelists(pricelists.filter((p:any)=>p.id!==item.id))} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                         </div>
                     ))}
                 </div>
             </div>
             {editingManualList && ( <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl })} onClose={() => setEditingManualList(null)} /> )}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit: {draft.name || 'New'}</h3><button onClick={onCancel}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} /><InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} /><InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} /></div><div className="space-y-4"><FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} /></div></div></div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Save</button></div>
        </div>
    );
};

export const AdminDashboard = memo(({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('brands'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  // localData holds the unsaved changes of the admin.
  // We use a ref to prevent overwriting the admin's working draft during background pulses.
  const [localData, setLocalData] = useState<StoreData | null>(null);
  const isInitialized = useRef(false);

  // Initialize localData only once from the storeData.
  // Subsequent storeData updates (like silent background pulses) will only update the fleet property in localData.
  useEffect(() => {
    if (!storeData) return;
    if (!isInitialized.current) {
        setLocalData(storeData);
        isInitialized.current = true;
    } else {
        // Silently merge background updates like fleet telemetry into our active local state
        setLocalData(prev => {
            if (!prev) return storeData;
            return {
                ...prev,
                fleet: storeData.fleet // Update telemetry only
            };
        });
    }
  }, [storeData]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);

  const handleLocalUpdate = (newData: StoreData) => { 
    setLocalData(newData); 
    setHasUnsavedChanges(true); 
    if (selectedBrand) { 
        const b = newData.brands.find(x=>x.id===selectedBrand.id); 
        if(b) setSelectedBrand(b); 
        if(selectedCategory) { 
            const c = b?.categories.find(x=>x.id===selectedCategory.id); 
            if(c) setSelectedCategory(c); 
        } 
    } 
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const logout = () => { localStorage.removeItem('kiosk_admin_session'); setCurrentUser(null); };

  const availableTabs = [
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'pricelists', label: 'Pricelists', icon: RIcon },
      { id: 'tv', label: 'TV Channels', icon: Tv },
      { id: 'screensaver', label: 'Screensaver', icon: Monitor },
      { id: 'fleet', label: 'Fleet', icon: Tablet },
      { id: 'history', label: 'Archive', icon: History },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'guide', label: 'Guides', icon: BookOpen }
  ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div>
                 <div className="flex items-center gap-4"><button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white shadow-xl animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button></div>
                 <div className="flex items-center gap-3"><div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300'} border border-white/10`}><Cloud size={14}/><span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Online' : 'Local'}</span></div><button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button><button onClick={logout} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16} /></button></div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'guide' && <SystemDocumentation />}
            
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                       {localData.brands.sort((a,b)=>a.name.localeCompare(b.name)).map(brand => (
                           <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg group relative flex flex-col">
                               <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 aspect-square relative">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div>
                               <div className="p-4 border-t border-slate-100"><h3 className="font-black text-slate-900 text-sm uppercase truncate mb-3">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button></div>
                           </div>
                       ))}
                   </div>
                ) : !selectedCategory ? (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-8"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md text-left flex flex-col justify-center aspect-square relative group"><Box size={24} className="mb-4 text-slate-400" /><h3 className="font-black text-slate-900 uppercase text-sm truncate w-full">{cat.name}</h3><p className="text-xs text-slate-500 font-bold">{cat.products.length} Products</p></button>))}</div></div>
                ) : (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-8"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1 truncate">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs">Add Product</button></div><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">{selectedCategory.products.map(p => (<div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-200" />}<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"><button onClick={() => setEditingProduct(p)} className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase">Edit</button></div></div><div className="p-4 border-t border-slate-100"><h4 className="font-bold text-slate-900 text-xs truncate uppercase">{p.name}</h4></div></div>))}</div></div>
                )
            )}

            {activeTab === 'pricelists' && ( <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p:any) => handleLocalUpdate({ ...localData, pricelists: p })} onSaveBrands={(b:any) => handleLocalUpdate({ ...localData, pricelistBrands: b })} /> )}
            
            {activeTab === 'marketing' && (
                <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in">
                    <div className="flex gap-4 border-b border-slate-200 mb-6">
                        {['catalogues', 'hero', 'ads'].map(sub => (<button key={sub} onClick={() => setActiveSubTab(sub)} className={`pb-2 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeSubTab === sub ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{sub}</button>))}
                    </div>
                    {activeSubTab === 'catalogues' && ( <CatalogueManager catalogues={(localData.catalogues || []).filter(c => !c.brandId)} onSave={(c) => { const brandCatalogues = (localData.catalogues || []).filter(c => c.brandId); handleLocalUpdate({ ...localData, catalogues: [...brandCatalogues, ...c] }); }} /> )}
                </div>
            )}

            {activeTab === 'fleet' && (
                <div className="max-w-7xl mx-auto space-y-6 pb-32 animate-fade-in">
                    <div className="flex items-center gap-3 mb-8"><Radio className="text-blue-500 animate-pulse"/><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Live Telemetry Control</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {localData.fleet?.map(kiosk => {
                             const online = (new Date().getTime() - new Date(kiosk.last_seen).getTime()) < 350000;
                             return (
                                <div key={kiosk.id} className={`bg-slate-950 rounded-[2rem] border-2 overflow-hidden shadow-2xl transition-all ${online ? 'border-blue-500/50 shadow-blue-500/10' : 'border-slate-800 grayscale'}`}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4"><div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${online ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{online ? 'Active Pulse':'Offline'}</div><SignalStrengthBars strength={kiosk.wifiStrength || 0}/></div>
                                        <h3 className="text-white font-black uppercase text-lg truncate mb-1">{kiosk.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]"><MapPin size={10} /> {kiosk.assignedZone || 'UNASSIGNED'}</div>
                                    </div>
                                    <div className="mt-auto flex p-3 gap-2 bg-black/40"><button className="flex-1 bg-slate-900 text-slate-400 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border border-slate-800 flex items-center justify-center gap-2"><Edit2 size={12}/> Config</button></div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            )}
        </main>

        {editingProduct && ( <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in"><ProductEditor product={editingProduct} onSave={(p) => { if (!selectedBrand || !selectedCategory) return; const cur=selectedCategory.products.find(x=>x.id===p.id); const nl = cur ? selectedCategory.products.map(x=>x.id===p.id?p:x) : [...selectedCategory.products, p]; handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, categories: b.categories.map(c=>c.id===selectedCategory.id?{...c, products: nl}:c)}:b)}); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div> )}
    </div>
  );
});

export default AdminDashboard;
