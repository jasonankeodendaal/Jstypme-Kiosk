
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, MonitorPlay
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// --- ZIP UTILS ---
const downloadZip = async (storeData: StoreData, onProgress?: (msg: string) => void) => {
    const zip = new JSZip();
    if (onProgress) onProgress("Packing system core...");
    zip.file("store_config_full.json", JSON.stringify(storeData, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiosk-full-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    if (onProgress) onProgress("");
};

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<{ fullData?: StoreData }> => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const fullConfigEntry = loadedZip.file("store_config_full.json");
    if (fullConfigEntry) {
        const content = await fullConfigEntry.async("text");
        return { fullData: JSON.parse(content) };
    }
    return {};
};

// --- AUTH ---
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const handleAuth = (e: any) => {
    e.preventDefault();
    const admin = admins.find(a => a.name.toLowerCase() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else alert("Access Denied: Invalid Credentials");
  };
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      <form onSubmit={handleAuth} className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-sm w-full relative z-10">
        <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-10 mx-auto shadow-2xl ring-8 ring-blue-600/10"><ShieldCheck size={40} /></div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center text-slate-900">Admin Hub</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-10">Secure Gateway Access</p>
        <input className="w-full p-5 mb-4 border-2 border-slate-100 rounded-2xl font-bold uppercase outline-none focus:border-blue-500 transition-all" placeholder="USER ID" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-5 mb-10 border-2 border-slate-100 rounded-2xl font-bold text-center tracking-[0.5em] outline-none focus:border-blue-500 transition-all" type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} />
        <button className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl">Initialize Access</button>
      </form>
    </div>
  );
};

// --- SUB-UI ELEMENTS ---
const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button onClick={onClick} className={`px-8 py-5 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all flex items-center gap-3 shrink-0 ${active ? 'border-blue-500 bg-slate-700 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
        <Icon size={16} /> {label}
    </button>
);

const SectionHeader = ({ title, icon: Icon, actions }: any) => (
    <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            {Icon && <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><Icon size={24}/></div>}
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
        </div>
        <div className="flex gap-3">{actions}</div>
    </div>
);

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<string>('inventory');
    const [localData, setLocalData] = useState<StoreData | null>(storeData);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressMsg, setProgressMsg] = useState('');
    const [showSetupGuide, setShowSetupGuide] = useState(false);

    // Edit Navigation State
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // TV Edit State
    const [editingTvBrand, setEditingTvBrand] = useState<TVBrand | null>(null);

    // Pricelist Edit State
    const [editingPricelist, setEditingPricelist] = useState<Pricelist | null>(null);

    useEffect(() => { if (storeData && !hasUnsavedChanges) setLocalData(storeData); }, [storeData]);

    const updateData = (newData: StoreData) => { 
        setLocalData({ ...newData }); 
        setHasUnsavedChanges(true); 
    };

    const handleBackupExport = () => downloadZip(localData!, setProgressMsg);
    const handleBackupImport = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessing(true);
        try {
            const result = await importZip(file, setProgressMsg);
            if (result.fullData && confirm("Overwrite entire system data?")) {
                updateData(result.fullData);
            }
        } finally { setIsProcessing(false); setProgressMsg(''); }
    };

    if (!currentUser) return <Auth admins={localData?.admins || []} onLogin={setCurrentUser} />;

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            {showSetupGuide && <SetupGuide onClose={() => setShowSetupGuide(false)} />}
            
            <header className="bg-slate-900 text-white shrink-0 p-5 flex justify-between items-center z-50 border-b border-white/5 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-xl"><Settings size={22} /></div>
                    <div>
                        <span className="font-black uppercase tracking-[0.2em] text-sm block leading-none mb-1">Kiosk Enterprise Hub</span>
                        <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">{currentUser.name} (Active)</span>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={() => setShowSetupGuide(true)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 border border-white/5">Engineering Manual</button>
                    <button onClick={() => { onUpdateData(localData!); setHasUnsavedChanges(false); }} disabled={!hasUnsavedChanges} className={`px-8 py-2.5 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-500 shadow-xl' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={18} /> Save Core</button>
                    <button onClick={() => setCurrentUser(null)} className="p-3 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-colors"><LogOut size={20}/></button>
                </div>
            </header>

            <div className="flex overflow-x-auto bg-slate-800 text-white scrollbar-hide shrink-0 border-b border-slate-700">
                <TabButton active={activeTab === 'inventory'} label="Inventory" icon={Package} onClick={() => { setActiveTab('inventory'); setEditingBrand(null); }} />
                <TabButton active={activeTab === 'marketing'} label="Marketing" icon={Megaphone} onClick={() => setActiveTab('marketing')} />
                <TabButton active={activeTab === 'pricelists'} label="Pricelists" icon={Table} onClick={() => setActiveTab('pricelists')} />
                <TabButton active={activeTab === 'tv'} label="TV Mode" icon={Tv} onClick={() => setActiveTab('tv')} />
                <TabButton active={activeTab === 'screensaver'} label="Screensaver" icon={MonitorPlay} onClick={() => setActiveTab('screensaver')} />
                <TabButton active={activeTab === 'fleet'} label="Fleet Registry" icon={Network} onClick={() => setActiveTab('fleet')} />
                <TabButton active={activeTab === 'settings'} label="Settings" icon={Cpu} onClick={() => setActiveTab('settings')} />
            </div>

            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-slate-50">
                {isProcessing && (
                    <div className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500 mb-8" size={80} />
                        <p className="font-black uppercase tracking-[0.4em] text-white text-xl">{progressMsg || "Updating Protocol..."}</p>
                    </div>
                )}

                <div className="max-w-6xl mx-auto space-y-12 pb-40">
                    
                    {/* INVENTORY MODULE */}
                    {activeTab === 'inventory' && (
                        <div className="animate-fade-in space-y-8">
                            {!editingBrand ? (
                                <>
                                    <SectionHeader title="Inventory Matrix" icon={Package} actions={
                                        <button onClick={() => {
                                            const newB: Brand = { id: generateId('br'), name: 'New Brand', categories: [] };
                                            updateData({ ...localData!, brands: [...localData!.brands, newB] });
                                            setEditingBrand(newB);
                                        }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg"><Plus size={16}/> New Brand</button>
                                    } />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {localData?.brands.map(b => (
                                            <button key={b.id} onClick={() => setEditingBrand(b)} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-400 hover:shadow-xl transition-all text-left">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl p-3 flex items-center justify-center border border-slate-100 shadow-inner">
                                                        {b.logoUrl ? <img src={b.logoUrl} className="max-w-full max-h-full object-contain" /> : <Box size={32} className="text-slate-200" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-xl text-slate-900 uppercase leading-none mb-2">{b.name}</h3>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.categories.length} Categories</p>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={24}/></div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : !editingCategory ? (
                                <div className="space-y-8">
                                    <button onClick={() => setEditingBrand(null)} className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-slate-900"><ArrowLeft size={16}/> Back to All Brands</button>
                                    <SectionHeader title={editingBrand.name} icon={Box} actions={
                                        <button onClick={() => {
                                            const newCat: Category = { id: generateId('cat'), name: 'New Category', icon: 'Box', products: [] };
                                            const updatedB = { ...editingBrand, categories: [...editingBrand.categories, newCat] };
                                            setEditingBrand(updatedB);
                                            updateData({ ...localData!, brands: localData!.brands.map(b => b.id === editingBrand.id ? updatedB : b) });
                                        }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg"><Plus size={16}/> New Category</button>
                                    } />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {editingBrand.categories.map(cat => (
                                            <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center justify-between group shadow-sm hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">{cat.name.charAt(0)}</div>
                                                    <span className="font-black text-slate-900 uppercase tracking-tight">{cat.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-4">{cat.products.length} Products</span>
                                                    <button onClick={() => setEditingCategory(cat)} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><ChevronRight size={20}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <button onClick={() => setEditingCategory(null)} className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-slate-900"><ArrowLeft size={16}/> Back to Categories</button>
                                    <SectionHeader title={editingCategory.name} icon={Grid} actions={
                                        <button onClick={() => {
                                            const newP: Product = { id: generateId('pd'), name: 'New Product', description: '', features: [], specs: {}, dimensions: [], imageUrl: '' };
                                            const updatedCat = { ...editingCategory, products: [...editingCategory.products, newP] };
                                            setEditingCategory(updatedCat);
                                            const updatedBrand = { ...editingBrand, categories: editingBrand.categories.map(c => c.id === editingCategory.id ? updatedCat : c) };
                                            setEditingBrand(updatedBrand);
                                            updateData({ ...localData!, brands: localData!.brands.map(b => b.id === editingBrand.id ? updatedBrand : b) });
                                        }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg"><Plus size={16}/> Add Product</button>
                                    } />
                                    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                                                <tr>
                                                    <th className="p-6">Product Item</th>
                                                    <th className="p-6">SKU / Code</th>
                                                    <th className="p-6">Media Status</th>
                                                    <th className="p-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {editingCategory.products.map(p => (
                                                    <tr key={p.id} className="hover:bg-slate-50 group transition-colors">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl p-1 shrink-0">
                                                                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-contain" /> : <ImageIcon size={20} className="text-slate-200 m-auto mt-2" />}
                                                                </div>
                                                                <span className="font-black text-slate-900 uppercase tracking-tight">{p.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 font-mono text-[10px] font-black text-slate-400">{p.sku || 'N/A'}</td>
                                                        <td className="p-6">
                                                            <div className="flex gap-1">
                                                                {p.imageUrl && <ImageIcon size={14} className="text-green-500" />}
                                                                {(p.videoUrl || p.videoUrls?.length) && <Video size={14} className="text-blue-500" />}
                                                                {(p.manualUrl || p.manuals?.length) && <FileText size={14} className="text-purple-500" />}
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={18}/></button>
                                                                <button className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MARKETING MODULE */}
                    {activeTab === 'marketing' && (
                        <div className="animate-fade-in space-y-12">
                            <SectionHeader title="Global Marketing Config" icon={Megaphone} />
                            
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5"><Layout size={180} /></div>
                                <h3 className="text-xl font-black text-slate-900 uppercase mb-8 flex items-center gap-3"><LayoutTemplate size={20} className="text-blue-600" /> Landing Hero Content</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hero Title</label>
                                            <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900" value={localData?.hero.title} onChange={e => updateData({...localData!, hero: {...localData!.hero, title: e.target.value}})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hero Subtitle</label>
                                            <textarea className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 h-24" value={localData?.hero.subtitle} onChange={e => updateData({...localData!, hero: {...localData!.hero, subtitle: e.target.value}})} />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Background Media URL</label>
                                            <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-xs" value={localData?.hero.backgroundVideoUrl || localData?.hero.backgroundImageUrl} onChange={e => updateData({...localData!, hero: {...localData!.hero, backgroundVideoUrl: e.target.value}})} />
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                            <ImageIcon size={40} className="text-slate-300 mb-4" />
                                            <p className="text-xs font-black text-slate-400 uppercase">Preview Window</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {['homeBottomLeft', 'homeBottomRight', 'homeSideVertical'].map(zone => (
                                    <div key={zone} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">{zone.replace(/([A-Z])/g, ' $1')}</h4>
                                            <button className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={14}/></button>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            {((localData?.ads as any)[zone] || []).map((ad: any) => (
                                                <div key={ad.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 bg-white rounded-lg p-1 border border-slate-200 shrink-0">
                                                            {ad.type === 'image' ? <img src={ad.url} className="w-full h-full object-cover" /> : <Video size={16} className="m-auto mt-2 text-blue-500" />}
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 truncate">{ad.url}</span>
                                                    </div>
                                                    <button className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PRICELISTS MODULE */}
                    {activeTab === 'pricelists' && (
                        <div className="animate-fade-in space-y-8">
                            <SectionHeader title="Pricelist Documents" icon={Table} actions={
                                <button onClick={() => {
                                    const newPL: Pricelist = { id: generateId('pl'), brandId: '', title: 'New Pricelist', type: 'manual', items: [], url: '', month: 'January', year: '2024' };
                                    updateData({ ...localData!, pricelists: [...(localData!.pricelists || []), newPL] });
                                    setEditingPricelist(newPL);
                                }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg"><Plus size={16}/> New List</button>
                            } />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(localData?.pricelists || []).map(pl => (
                                    <div key={pl.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col group hover:border-blue-400 transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                {pl.type === 'manual' ? <List size={24}/> : <FileIcon size={24}/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-slate-900 uppercase truncate">{pl.title}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pl.month} {pl.year}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                                            <button onClick={() => setEditingPricelist(pl)} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">Edit Content</button>
                                            <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TV MODULE */}
                    {activeTab === 'tv' && (
                        <div className="animate-fade-in space-y-8">
                            {!editingTvBrand ? (
                                <>
                                    <SectionHeader title="TV Mode Management" icon={Tv} actions={
                                        <button onClick={() => {
                                            const newB: TVBrand = { id: generateId('tvb'), name: 'New TV Brand', models: [] };
                                            updateData({ ...localData!, tv: { ...localData!.tv!, brands: [...(localData!.tv?.brands || []), newB] } });
                                            setEditingTvBrand(newB);
                                        }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg"><Plus size={16}/> New Channel</button>
                                    } />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {(localData?.tv?.brands || []).map(b => (
                                            <button key={b.id} onClick={() => setEditingTvBrand(b)} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-400 transition-all text-left">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                                        {b.logoUrl ? <img src={b.logoUrl} className="max-w-full max-h-full object-contain" /> : <Tv size={32}/>}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-xl text-slate-900 uppercase leading-none">{b.name}</h3>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{b.models.length} Models</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={24}/>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-8">
                                    <button onClick={() => setEditingTvBrand(null)} className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-slate-900"><ArrowLeft size={16}/> Back to TV Channels</button>
                                    <SectionHeader title={editingTvBrand.name} icon={Tv} actions={
                                        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2"><Plus size={16}/> Add Model</button>
                                    } />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {editingTvBrand.models.map(m => (
                                            <div key={m.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs">MOD</div>
                                                    <span className="font-black text-slate-900 uppercase tracking-tight">{m.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.videoUrls.length} Loops</span>
                                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-colors"><Edit2 size={18}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SCREENSAVER MODULE */}
                    {activeTab === 'screensaver' && (
                        <div className="animate-fade-in space-y-12">
                            <SectionHeader title="Idle Screensaver Logic" icon={MonitorPlay} />
                            
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm max-w-2xl mx-auto">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase text-sm">Idle Timeout</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Seconds until playback begins</p>
                                        </div>
                                        <input type="number" className="w-24 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-center" value={localData?.screensaverSettings?.idleTimeout} onChange={e => updateData({...localData!, screensaverSettings: {...localData!.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { id: 'showProductImages', label: 'Product Stills', icon: ImageIcon },
                                            { id: 'showProductVideos', label: 'Product Reels', icon: Video },
                                            { id: 'showPamphlets', label: 'Global Pamphlets', icon: BookOpen },
                                            { id: 'showCustomAds', label: 'Marketing Ads', icon: Megaphone }
                                        ].map(opt => (
                                            <button 
                                                key={opt.id}
                                                onClick={() => updateData({...localData!, screensaverSettings: {...localData!.screensaverSettings!, [opt.id]: !(localData?.screensaverSettings as any)[opt.id]}})}
                                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center ${(localData?.screensaverSettings as any)[opt.id] ? 'bg-blue-50 border-blue-600 shadow-lg' : 'bg-white border-slate-100 text-slate-300'}`}
                                            >
                                                <opt.icon size={32} className={(localData?.screensaverSettings as any)[opt.id] ? 'text-blue-600' : 'text-slate-200'} />
                                                <span className={`font-black uppercase text-[10px] tracking-widest ${(localData?.screensaverSettings as any)[opt.id] ? 'text-blue-900' : 'text-slate-400'}`}>{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FLEET MODULE */}
                    {activeTab === 'fleet' && (
                        <div className="animate-fade-in space-y-8">
                            <SectionHeader title="Fleet Control Matrix" icon={Network} actions={
                                <button onClick={onRefresh} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 transition-all"><RefreshCw size={24}/></button>
                            } />
                            
                            <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="p-8">Location & Identity</th>
                                            <th className="p-8">Operational Status</th>
                                            <th className="p-8">Telemetry (WIFI/IP)</th>
                                            <th className="p-8 text-right">Sys Command</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(localData?.fleet || []).map(device => (
                                            <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-8">
                                                    <div className="font-black uppercase text-slate-900 text-lg mb-1">{device.name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{device.id}</span>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Build v{device.version}</span>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-widest ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                        {device.status}
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3 text-slate-500">
                                                            <Wifi size={14} className={device.wifiStrength > 60 ? 'text-green-500' : 'text-orange-500'} />
                                                            <span className="font-bold text-xs">{device.wifiStrength}% Intensity</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-400">
                                                            <Globe size={14} />
                                                            <span className="font-mono text-[10px] uppercase">{device.ipAddress}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 shadow-xl transition-all active:scale-95 group" title="Remote Reboot Signal">
                                                        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS MODULE */}
                    {activeTab === 'settings' && (
                        <div className="animate-fade-in space-y-12">
                            <SectionHeader title="System Master Control" icon={Cpu} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Database size={150} /></div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase mb-8 flex items-center gap-4"><CloudLightning size={24} className="text-blue-600" /> Maintenance Vault</h3>
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center">
                                            <h4 className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-2">Manual Migration</h4>
                                            <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">Download a structured archive of every brand, product, and asset.</p>
                                            <button onClick={handleBackupExport} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3"><Download size={18}/> Export System ZIP</button>
                                        </div>
                                        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 text-center">
                                            <h4 className="font-black uppercase text-[10px] text-blue-400 tracking-widest mb-2">Emergency Sync</h4>
                                            <p className="text-xs text-blue-700/60 font-medium mb-8 leading-relaxed">Restore system state from a verified master archive.</p>
                                            <label className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20">
                                                <Upload size={18}/> Restore ZIP
                                                <input type="file" className="hidden" accept=".zip" onChange={handleBackupImport} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase mb-8 flex items-center gap-4"><Lock size={24} className="text-red-600" /> Access Protocol</h3>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Hardware Provisioning PIN</label>
                                            <div className="flex gap-4">
                                                <input type="password" maxLength={8} className="flex-1 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-mono text-3xl font-black tracking-[0.5em] outline-none focus:border-blue-500" value={localData?.systemSettings?.setupPin} onChange={e => updateData({...localData!, systemSettings: {...localData!.systemSettings, setupPin: e.target.value}})} />
                                            </div>
                                        </div>
                                        
                                        <div className="pt-8 border-t border-slate-100">
                                            <h4 className="font-black text-slate-900 uppercase text-xs mb-4">Authorized Admin Hubs</h4>
                                            <div className="space-y-3">
                                                {localData?.admins.map(admin => (
                                                    <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400"><UserCog size={20}/></div>
                                                            <span className="font-black uppercase text-xs text-slate-800">{admin.name}</span>
                                                        </div>
                                                        <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded uppercase tracking-tighter">Authorized</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
            
            <footer className="bg-white border-t border-slate-200 p-5 px-12 flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest shrink-0">
                <div>Kiosk Enterprise v2.8.4-R1 • System Encrypted</div>
                <div className="flex gap-8">
                    <span className="flex items-center gap-2 text-green-600"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Backbone Active</span>
                    <span className="flex items-center gap-2"><Network size={14} /> Global Distribution: Verified</span>
                </div>
            </footer>
        </div>
    );
};
