
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, HistoryItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

/**
 * RIcon Component: Custom SVG icon for Price List branding (Line 295 fix)
 */
const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 21V3h7a5 5 0 0 1 0 10H7" />
    <path d="M13 13l5 8" />
    <path d="M10 8h4" />
  </svg>
);

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const SESSION_KEY = 'kiosk_admin_session';

const HistoryTimeline = ({ history }: { history: HistoryItem[] }) => {
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const filtered = useMemo(() => {
        let items = [...(history || [])].reverse();
        if (search) {
            items = items.filter(h => 
                h.adminName.toLowerCase().includes(search.toLowerCase()) || 
                h.details.toLowerCase().includes(search.toLowerCase()) ||
                h.module.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterAction !== 'all') {
            items = items.filter(h => h.action === filterAction);
        }
        return items;
    }, [history, search, filterAction]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create': return 'bg-green-100 text-green-700 border-green-200';
            case 'delete': return 'bg-red-100 text-red-700 border-red-200';
            case 'update': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'sync': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'login': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2"><History className="text-blue-600" /> Audit Logs</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Full traceability of admin actions</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search Logs..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none"
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                    >
                        <option value="all">All Actions</option>
                        <option value="create">Created</option>
                        <option value="update">Updated</option>
                        <option value="delete">Deleted</option>
                        <option value="sync">Cloud Sync</option>
                        <option value="login">Login</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filtered.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <History size={48} className="mb-2 opacity-20" />
                        <p className="font-bold uppercase text-xs">No activity records found</p>
                    </div>
                ) : (
                    filtered.map((item) => (
                        <div key={item.id} className="group relative flex gap-6 pb-4 border-l-2 border-slate-100 ml-4 pl-8 last:border-0 last:pb-0">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-blue-500 transition-colors"></div>
                            <div className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black text-slate-900 uppercase">{item.adminName}</span>
                                            <span className="mx-2 text-slate-300">•</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border ${getActionColor(item.action)}`}>
                                                {item.action}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-mono font-bold text-slate-400">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                                        {item.module}
                                    </span>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">
                                        {item.details}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
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

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const logActivity = (action: HistoryItem['action'], module: string, details: string) => {
    if (!currentUser || !localData) return;
    const newLog: HistoryItem = {
        id: generateId('log'),
        adminId: currentUser.id,
        adminName: currentUser.name,
        action,
        module,
        details,
        timestamp: new Date().toISOString()
    };
    const updatedHistory = [...(localData.history || []), newLog].slice(-500);
    setLocalData({ ...localData, history: updatedHistory });
    setHasUnsavedChanges(true);
  };

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // Login logs aren't saved to DB unless user saves changes, but we track for the session
    const newLog: HistoryItem = {
        id: generateId('log'),
        adminId: user.id,
        adminName: user.name,
        action: 'login',
        module: 'System',
        details: `Admin ${user.name} authenticated.`,
        timestamp: new Date().toISOString()
    };
    if (localData) {
        setLocalData({ ...localData, history: [...(localData.history || []), newLog] });
        setHasUnsavedChanges(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

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

  const handleLocalUpdate = (newData: StoreData, action: HistoryItem['action'], module: string, details: string) => {
      setLocalData(newData);
      setHasUnsavedChanges(true);
      logActivity(action, module, details);
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
            {activeTab === 'history' && <HistoryTimeline history={localData.history || []} />}
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                       <button onClick={() => { const n = prompt("Brand Name:"); if(n) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name:n, categories: [] }] }, 'create', 'Inventory', `Added new brand: ${n}`) }} className="bg-white border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 aspect-square"><Plus size={24} /><span className="font-bold uppercase text-[10px] mt-2">Add Brand</span></button>
                       {brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all group relative aspect-square flex flex-col"><div className="flex-1 bg-slate-50 flex items-center justify-center p-2">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div><div className="p-4"><h3 className="font-black text-sm uppercase truncate mb-1">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button></div></div>))}
                   </div>
                ) : !selectedCategory ? (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase">{selectedBrand.name}</h2></div><div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"><button onClick={() => { const n = prompt("Category Name:"); if(n) { const updated = {...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name:n, icon: 'Box', products: [] }]}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b)}, 'create', 'Inventory', `Added category ${n} to ${selectedBrand.name}`); } }} className="bg-slate-100 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 aspect-square"><Plus size={24} /><span className="font-bold text-[10px] uppercase mt-2">New Category</span></button>{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-xl border shadow-sm aspect-square flex flex-col items-center justify-center"><Box size={20} className="mb-4 text-slate-400" /><h3 className="font-black text-xs uppercase">{cat.name}</h3></button>))}</div></div>
                ) : (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase flex-1">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs">Add Product</button></div><div className="grid grid-cols-3 md:grid-cols-5 gap-2">{selectedCategory.products.map(p => (<div key={p.id} onClick={() => setEditingProduct(p)} className="bg-white rounded-xl border p-2 aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">{p.imageUrl ? <img src={p.imageUrl} className="max-h-[70%] object-contain" /> : <Box size={24} className="text-slate-200" />}<div className="mt-2 font-bold text-[10px] uppercase truncate w-full text-center">{p.name}</div></div>))}</div></div>
                )
            )}
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'settings' && <div className="max-w-xl mx-auto space-y-8"><div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-black uppercase text-sm mb-6">Backup & Export</h3><button onClick={() => downloadZip(localData)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs">Download Full Backup (.zip)</button></div></div>}
        </main>

        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 p-8 flex items-center justify-center"><ProductEditor product={editingProduct} onSave={p => { const isNew = !selectedCategory?.products.find(x=>x.id===p.id); const newP = isNew ? [...selectedCategory!.products, p] : selectedCategory!.products.map(x=>x.id===p.id?p:x); const updCat = {...selectedCategory!, products:newP}; const updB = {...selectedBrand!, categories:selectedBrand!.categories.map(c=>c.id===updCat.id?updCat:c)}; handleLocalUpdate({...localData, brands:brands.map(b=>b.id===updB.id?updB:b)}, isNew ? 'create' : 'update', 'Inventory', `${isNew ? 'Added' : 'Updated'} product: ${p.name}`); setEditingProduct(null); }} onCancel={()=>setEditingProduct(null)} /></div>}
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
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-10 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                        </div>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work offline first. It syncs with your latest changes when connected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
