
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
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
                </div>
                <div className="space-y-2 flex-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${
                                activeSection === section.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className={`p-2 rounded-xl ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                {React.cloneElement(section.icon as React.ReactElement<any>, { size: 18 })}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-widest">{section.label}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-12 lg:p-20 relative">
                <h2 className="text-3xl font-black uppercase mb-4">{sections.find(s => s.id === activeSection)?.label}</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">Detailed technical documentation and system behavior overview for the {activeSection} module.</p>
                <div className="mt-12 bg-slate-100 p-8 rounded-3xl border border-slate-200 min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <Info size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">Visual module walkthrough placeholder</p>
                    </div>
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200">
        <h1 className="text-3xl font-black text-center text-slate-900 mb-6 tracking-tight">ADMIN ACCESS</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full p-4 border border-slate-300 rounded-xl font-bold" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <input className="w-full p-4 border border-slate-300 rounded-xl font-bold" type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
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
      const files = Array.from(e.target.files);
      try {
        if (allowMultiple) {
          const results = [];
          for (const file of files) results.push(await uploadFileToStorage(file));
          onUpload(results);
        } else {
          onUpload(await uploadFileToStorage(files[0]));
        }
      } catch (err) { alert("Upload error"); }
      finally { setIsProcessing(false); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
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
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white border border-slate-300 rounded-xl h-24 text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }]);
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c));
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map(cat => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black mb-2 border-b border-transparent focus:border-blue-500 outline-none text-sm" />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                             <FileUpload label="Thumbnail" currentUrl={cat.thumbnailUrl} onUpload={(url:any)=>updateCatalogue(cat.id,{thumbnailUrl:url})} />
                             <FileUpload label="PDF File" accept="application/pdf" icon={<FileText/>} currentUrl={cat.pdfUrl} onUpload={(url:any)=>updateCatalogue(cat.id,{pdfUrl:url})} />
                        </div>
                        <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-500 text-[10px] font-bold uppercase"><Trash2 size={12} className="inline mr-1"/>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase">Pricelist Builder</h3>
            <div className="flex gap-2">
                <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2">Add Row</button>
                <button onClick={onClose}><X size={24}/></button>
            </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
            <table className="w-full text-left">
                <thead><tr className="border-b"><th>SKU</th><th>Description</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>{items.map(item=>(<tr key={item.id}><td><input value={item.sku} onChange={e=>updateItem(item.id,'sku',e.target.value)} className="p-1 border rounded w-full"/></td><td><input value={item.description} onChange={e=>updateItem(item.id,'description',e.target.value)} className="p-1 border rounded w-full"/></td><td><input value={item.normalPrice} onChange={e=>updateItem(item.id,'normalPrice',e.target.value)} className="p-1 border rounded w-full"/></td><td><button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody>
            </table>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3"><button onClick={onClose}>Cancel</button><button onClick={()=>onSave({...pricelist, items, type:'manual'})} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase text-xs">Save Table</button></div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(pricelistBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    const addPricelist = () => selectedBrand && onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'May', year: '2024' }]);
    return (
        <div className="flex gap-6 h-full animate-fade-in">
             <div className="w-64 bg-white border border-slate-200 rounded-2xl overflow-hidden shrink-0 flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center"><span className="font-black text-xs uppercase">Brands</span><button onClick={()=>{const n=prompt('Brand:');if(n)onSaveBrands([...pricelistBrands,{id:generateId('plb'),name:n}])}} className="bg-slate-900 text-white p-1 rounded"><Plus size={12}/></button></div>
                 <div className="flex-1 overflow-y-auto">{pricelistBrands.map((b:any)=>(<button key={b.id} onClick={()=>setSelectedBrand(b)} className={`w-full text-left p-4 text-xs font-bold uppercase ${selectedBrand?.id===b.id?'bg-blue-50 text-blue-600 border-l-4 border-blue-500':'text-slate-400'}`}>{b.name}</button>))}</div>
             </div>
             <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 overflow-y-auto">
                 <div className="flex justify-between mb-6"><h3>{selectedBrand?.name} Lists</h3><button onClick={addPricelist} className="bg-green-600 text-white px-4 py-2 rounded-lg font-black uppercase text-xs">Add List</button></div>
                 <div className="grid grid-cols-2 gap-4">{filteredLists.map((p:any)=>(<div key={p.id} className="p-4 border rounded-xl"><input value={p.title} onChange={e=>onSavePricelists(pricelists.map((x:any)=>x.id===p.id?{...x,title:e.target.value}:x))} className="font-black w-full mb-2 outline-none border-b"/><div className="grid grid-cols-2 gap-2 mb-4"><FileUpload label="Thumb" currentUrl={p.thumbnailUrl} onUpload={(url:any)=>onSavePricelists(pricelists.map((x:any)=>x.id===p.id?{...x,thumbnailUrl:url}:x))}/><FileUpload label="PDF" accept="application/pdf" icon={<FileText/>} currentUrl={p.url} onUpload={(url:any)=>onSavePricelists(pricelists.map((x:any)=>x.id===p.id?{...x,url:url}:x))}/></div><button onClick={()=>onDeletePricelist(p.id)} className="text-red-500 text-[10px] font-bold uppercase">Delete</button></div>))}</div>
             </div>
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product });
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center"><h3 className="font-bold uppercase">Edit Product</h3><button onClick={onCancel}><X size={24}/></button></div>
                <div className="flex-1 overflow-y-auto p-8"><InputField label="Name" val={draft.name} onChange={(e:any)=>setDraft({...draft,name:e.target.value})}/><InputField label="SKU" val={draft.sku} onChange={(e:any)=>setDraft({...draft,sku:e.target.value})}/><InputField label="Description" isArea val={draft.description} onChange={(e:any)=>setDraft({...draft,description:e.target.value})}/><FileUpload label="Image" currentUrl={draft.imageUrl} onUpload={(url:any)=>setDraft({...draft,imageUrl:url})}/></div>
                <div className="p-4 border-t flex justify-end gap-3"><button onClick={onCancel}>Cancel</button><button onClick={()=>onSave(draft)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold uppercase">Save</button></div>
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
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData, hasUnsavedChanges]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2"/>Loading...</div>;
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
      { id: 'guide', label: 'Guide', icon: BookOpen }
  ].filter(tab => currentUser.isSuperAdmin || currentUser.permissions[tab.id as keyof AdminPermissions]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                 <div className="flex items-center gap-3"><Settings className="text-blue-500" size={24} /><h1 className="text-xl font-black uppercase tracking-widest">System Control</h1></div>
                 <div className="flex items-center gap-4">
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                         {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                     </button>
                     <button onClick={() => setCurrentUser(null)} className="text-red-400 font-bold uppercase text-[10px]">Logout</button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar bg-slate-800">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-900/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-6">
                        {localData.brands.map(b=>(<div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all text-center"><h3 className="font-black uppercase mb-4 truncate">{b.name}</h3><button onClick={()=>setSelectedBrand(b)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-[10px] font-black uppercase">Manage</button></div>))}
                        <button onClick={()=>{const n=prompt('Name:');if(n)handleLocalUpdate({...localData,brands:[...localData.brands,{id:generateId('b'),name:n,categories:[]}]})}} className="border-2 border-dashed rounded-2xl flex items-center justify-center p-8 text-slate-400 hover:text-blue-500">ADD BRAND</button>
                    </div>
                ) : !selectedCategory ? (
                    <div>
                        <button onClick={()=>setSelectedBrand(null)} className="mb-4 text-slate-400 font-bold uppercase text-[10px]"><ArrowLeft size={12} className="inline mr-1"/>Back</button>
                        <h2 className="text-2xl font-black uppercase mb-6">{selectedBrand.name}</h2>
                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                            {selectedBrand.categories.map(c=>(<button key={c.id} onClick={()=>setSelectedCategory(c)} className="bg-white p-6 rounded-xl border text-center"><Box size={24} className="mx-auto mb-2 text-slate-300"/><span className="font-black text-xs uppercase">{c.name}</span></button>))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <button onClick={()=>setSelectedCategory(null)} className="mb-4 text-slate-400 font-bold uppercase text-[10px]"><ArrowLeft size={12} className="inline mr-1"/>Back</button>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black uppercase">{selectedCategory.name} Products</h2><button onClick={()=>setEditingProduct({id:generateId('p'),name:'',description:'',specs:{},features:[],dimensions:[],imageUrl:''} as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black uppercase text-xs">Add Product</button></div>
                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">
                            {selectedCategory.products.map(p=>(<div key={p.id} className="bg-white p-4 rounded-xl border group relative"><div className="aspect-square bg-slate-50 rounded mb-2 flex items-center justify-center overflow-hidden">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box className="text-slate-200"/>}</div><span className="font-black text-[10px] uppercase truncate block">{p.name}</span><button onClick={()=>setEditingProduct(p)} className="absolute top-2 right-2 p-1.5 bg-white shadow rounded opacity-0 group-hover:opacity-100"><Edit2 size={12}/></button></div>))}
                        </div>
                    </div>
                )
            )}

            {activeTab === 'marketing' && (
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><Megaphone className="text-purple-600"/> Hero Settings</h3>
                        <InputField label="Hero Title" val={localData.hero.title} onChange={(e:any)=>handleLocalUpdate({...localData,hero:{...localData.hero,title:e.target.value}})}/>
                        <InputField label="Hero Subtitle" val={localData.hero.subtitle} onChange={(e:any)=>handleLocalUpdate({...localData,hero:{...localData.hero,subtitle:e.target.value}})}/>
                        <InputField label="Brand Website URL" val={localData.hero.websiteUrl || ''} onChange={(e:any)=>handleLocalUpdate({...localData,hero:{...localData.hero,websiteUrl:e.target.value}})}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FileUpload label="Background Image" currentUrl={localData.hero.backgroundImageUrl} onUpload={(url:any)=>handleLocalUpdate({...localData,hero:{...localData.hero,backgroundImageUrl:url}})}/>
                            <FileUpload label="Store Logo" currentUrl={localData.hero.logoUrl} onUpload={(url:any)=>handleLocalUpdate({...localData,hero:{...localData.hero,logoUrl:url}})}/>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><ImageIcon className="text-blue-600"/> Global Catalogues</h3>
                        <CatalogueManager catalogues={localData.catalogues || []} onSave={(cats)=>handleLocalUpdate({...localData,catalogues:cats})} />
                    </div>
                </div>
            )}

            {activeTab === 'pricelists' && (
                <PricelistManager 
                    pricelists={localData.pricelists || []} 
                    pricelistBrands={localData.pricelistBrands || []} 
                    onSavePricelists={(p:any)=>handleLocalUpdate({...localData,pricelists:p})} 
                    onSaveBrands={(b:any)=>handleLocalUpdate({...localData,pricelistBrands:b})} 
                    onDeletePricelist={(id:string)=>handleLocalUpdate({...localData,pricelists:localData.pricelists?.filter(x=>x.id!==id)})}
                />
            )}

            {activeTab === 'screensaver' && (
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border shadow-sm">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><Monitor className="text-blue-500"/> Timing & Protocol</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputField label="Idle Timeout (Seconds)" type="number" val={localData.screensaverSettings?.idleTimeout} onChange={(e:any)=>handleLocalUpdate({...localData,screensaverSettings:{...localData.screensaverSettings!,idleTimeout:parseInt(e.target.value)}})}/>
                        <InputField label="Slide Duration (Seconds)" type="number" val={localData.screensaverSettings?.imageDuration} onChange={(e:any)=>handleLocalUpdate({...localData,screensaverSettings:{...localData.screensaverSettings!,imageDuration:parseInt(e.target.value)}})}/>
                    </div>
                    <div className="mt-8 space-y-4">
                        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer"><input type="checkbox" checked={localData.screensaverSettings?.muteVideos} onChange={e=>handleLocalUpdate({...localData,screensaverSettings:{...localData.screensaverSettings!,muteVideos:e.target.checked}})}/><span className="font-bold text-xs uppercase">Mute Videos Automatically</span></label>
                        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer"><input type="checkbox" checked={localData.screensaverSettings?.showProductImages} onChange={e=>handleLocalUpdate({...localData,screensaverSettings:{...localData.screensaverSettings!,showProductImages:e.target.checked}})}/><span className="font-bold text-xs uppercase">Show Products in Loop</span></label>
                    </div>
                </div>
            )}

            {activeTab === 'fleet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localData.fleet?.map(k=>(<div key={k.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4"><div className="flex justify-between"><div><h4 className="font-black uppercase">{k.name}</h4><code className="text-[10px] text-slate-400">{k.id}</code></div><div className={`w-2 h-2 rounded-full ${k.status==='online'?'bg-green-500':'bg-red-500'}`}></div></div><div className="flex-1 space-y-2"><div className="flex justify-between text-[10px] font-bold uppercase text-slate-400"><span>Type</span><span className="text-slate-900">{k.deviceType}</span></div><div className="flex justify-between text-[10px] font-bold uppercase text-slate-400"><span>Zone</span><span className="text-slate-900">{k.assignedZone}</span></div></div><button onClick={()=>{const n=prompt('New Name:',k.name);if(n)handleLocalUpdate({...localData,fleet:localData.fleet?.map(x=>x.id===k.id?{...x,name:n}:x)})}} className="text-blue-500 font-bold uppercase text-[10px]">Rename Device</button></div>))}
                    {(!localData.fleet || localData.fleet.length === 0) && <div className="col-span-full py-20 text-center text-slate-400 uppercase font-black tracking-widest opacity-20">No Devices Logged</div>}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                        <h3 className="font-black uppercase mb-6">Device App Configuration</h3>
                        <FileUpload label="Kiosk App Icon" currentUrl={localData.appConfig?.kioskIconUrl} onUpload={(url:any)=>handleLocalUpdate({...localData,appConfig:{...localData.appConfig!,kioskIconUrl:url}})}/>
                        <FileUpload label="Admin Panel Icon" currentUrl={localData.appConfig?.adminIconUrl} onUpload={(url:any)=>handleLocalUpdate({...localData,appConfig:{...localData.appConfig!,adminIconUrl:url}})}/>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-3xl text-white">
                        <h3 className="font-black uppercase mb-4 text-red-500">Danger Zone</h3>
                        <p className="text-xs text-slate-400 mb-6">Resetting will purge all inventory and configuration data permanently.</p>
                        <button onClick={async ()=>{if(confirm('WIPE EVERYTHING?')) { await resetStoreData(); window.location.reload(); }}} className="bg-red-600 px-6 py-3 rounded-xl font-black uppercase text-xs">Reset Factory Database</button>
                    </div>
                </div>
            )}

            {activeTab === 'guide' && <SystemDocumentation />}
        </main>

        {editingProduct && <ProductEditor product={editingProduct} onSave={(p)=>{ const updatedCat = {...selectedCategory!, products: selectedCategory!.products.map(x=>x.id===p.id?p:x).concat(selectedCategory!.products.find(x=>x.id===p.id)?[]:[p])}; handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand!.id?{...b,categories:b.categories.map(c=>c.id===updatedCat.id?updatedCat:c)}:b)}); setEditingProduct(null); }} onCancel={()=>setEditingProduct(null)}/>}
        {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl)=>handleLocalUpdate({...localData,pricelists:localData.pricelists?.map(x=>x.id===pl.id?pl:x)})} onClose={()=>setEditingManualList(null)}/>}
    </div>
  );
};
