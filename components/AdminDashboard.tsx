
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, HardDriveDownload, MonitorPlay
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

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
        { id: 'architecture', label: '1. How it Works', icon: <Network size={16} />, desc: 'The Brain of the Kiosk' },
        { id: 'inventory', label: '2. Product Sorting', icon: <Box size={16}/>, desc: 'How items are organized' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Converting Excel to PDF' },
        { id: 'screensaver', label: '4. Visual Loop', icon: <Zap size={16}/>, desc: 'Slideshow rules' },
        { id: 'fleet', label: '5. Fleet Watch', icon: <Activity size={16}/>, desc: 'Remote tracking' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Video loops' },
    ];
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Center</span></div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System Guides</h2>
                </div>
                <div className="space-y-2 flex-1">{sections.map(section => (<button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}><div className={`p-2 rounded-xl ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>{React.cloneElement(section.icon as any, { size: 18 })}</div><div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div><div className="text-[9px] font-bold uppercase truncate opacity-60">{section.desc}</div></div></button>))}</div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white relative p-8 md:p-12 lg:p-20">
                {activeSection === 'architecture' && <div className="space-y-12 animate-fade-in"><h2 className="text-5xl font-black text-slate-900 tracking-tighter">Atomic Synchronization</h2><p className="text-xl text-slate-500 font-medium">The Kiosk is designed to work offline first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p></div>}
                {activeSection === 'inventory' && <div className="space-y-12 animate-fade-in"><h2 className="text-5xl font-black text-slate-900 tracking-tighter">Inventory Sifting</h2><p className="text-xl text-slate-500 font-medium">The system flattens complex structures into a searchable database for customers.</p></div>}
                {/* Simplified guide for space */}
                <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-200">
                    <p className="text-slate-600 italic">Select a section on the left to see technical details.</p>
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
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tight">Admin Hub</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full p-4 border border-slate-300 rounded-xl font-bold" type="text" placeholder="Admin Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full p-4 border border-slate-300 rounded-xl font-bold" type="password" placeholder="PIN Code" value={pin} onChange={(e) => setPin(e.target.value)} />
          {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
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
              for(const f of files) results.push(await uploadFileToStorage(f));
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
        <div className="w-10 h-10 bg-slate-50 border rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
              {isProcessing ? '...' : 'Upload'}
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, type = 'text' }: any) => (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<any>(sortedBrands[0] || null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b flex justify-between items-center"><h2 className="font-black uppercase text-xs">Brands</h2><button onClick={() => { const name = prompt("Name:"); if(name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name, logoUrl: '' }]); }} className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-bold">Add</button></div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(b => (<div key={b.id} onClick={() => setSelectedBrand(b)} className={`p-3 rounded-xl border cursor-pointer ${selectedBrand?.id === b.id ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>{b.name}</div>))}</div>
             </div>
             <div className="flex-1 bg-slate-50 border rounded-2xl p-4 overflow-y-auto">
                 <div className="flex justify-between items-center mb-6"><h3 className="font-bold uppercase text-xs">{selectedBrand?.name || 'Select Brand'}</h3><button disabled={!selectedBrand} onClick={() => onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New List', month: 'May', year: '2024', type: 'manual' }])} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold">Add Pricelist</button></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredLists.map((p: any) => (<div key={p.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                    <InputField label="Title" val={p.title} onChange={(e:any) => onSavePricelists(pricelists.map((x:any) => x.id === p.id ? { ...x, title: e.target.value } : x))} />
                    <div className="flex justify-between items-center pt-4 border-t"><button onClick={() => onDeletePricelist(p.id)} className="text-red-500 text-[10px] font-bold uppercase">Delete</button></div>
                 </div>))}</div>
             </div>
        </div>
    );
};

// Main Product Editor Component
const ProductEditor = ({ product, onSave, onCancel }: any) => {
    const [draft, setDraft] = useState({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : [{ label: 'Device', width: '', height: '', depth: '', weight: '' }] });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase">Edit Product</h3><button onClick={onCancel}><X /></button></div>
            <div className="flex-1 overflow-y-auto p-8"><InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} /><InputField label="SKU" val={draft.sku} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} /><InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} /><FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} /></div>
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-4"><button onClick={onCancel} className="font-bold text-slate-500">Cancel</button><button onClick={() => onSave(draft)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Confirm</button></div>
        </div>
    );
};

// Kiosk Editor Component for Fleet Management
const KioskEditor = ({ kiosk, onSave, onCancel }: { kiosk: KioskRegistry, onSave: (k: KioskRegistry) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="flex flex-col h-full max-h-[600px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-lg w-full border border-slate-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl"><Tablet size={20}/></div>
                    <h3 className="font-black uppercase text-sm tracking-tight">Kiosk Profile Editor</h3>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <InputField label="Device Name / Location" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                
                <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Hardware Type</label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        {(['kiosk', 'mobile', 'tv'] as const).map(t => (
                            <button 
                                key={t} 
                                onClick={() => setDraft({ ...draft, deviceType: t })}
                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${draft.deviceType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <InputField label="Assigned Zone" val={draft.assignedZone || ''} onChange={(e: any) => setDraft({ ...draft, assignedZone: e.target.value })} placeholder="e.g. Sales Floor, Entrance" />
                <InputField label="Physical Description" val={draft.locationDescription || ''} onChange={(e: any) => setDraft({ ...draft, locationDescription: e.target.value })} placeholder="e.g. Near the escalators" />
                <InputField label="System Notes" isArea val={draft.notes || ''} onChange={(e: any) => setDraft({ ...draft, notes: e.target.value })} placeholder="Internal maintenance notes..." />
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                <button onClick={onCancel} className="px-6 py-3 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={() => onSave(draft)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-600 transition-all">Save Profile</button>
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
  // Fixed: Added missing state for editingKiosk
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [fleetFilter, setFleetFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => { if (storeData) setLocalData(storeData); }, [storeData]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div>Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = localData.brands || [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest">Admin Hub</h1></div>
                 <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs ${hasUnsavedChanges ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>Save Changes</button>
                 <div className="flex gap-4"><button onClick={() => setCurrentUser(null)} className="text-red-400 font-bold uppercase text-[10px]">Logout</button></div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {['inventory', 'marketing', 'pricelists', 'tv', 'screensaver', 'fleet', 'history', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500'}`}>{tab}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                       <button onClick={() => { const name = prompt("Brand Name:"); if(name) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }] }) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 aspect-square"><Plus size={24} /><span className="font-bold text-xs uppercase mt-2">Add Brand</span></button>
                       {brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col items-center justify-center relative"><h3 className="font-black text-slate-900 uppercase text-sm mb-4">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs uppercase">Manage</button><button onClick={() => handleLocalUpdate({ ...localData, brands: brands.filter(b=>b.id !== brand.id) })} className="absolute top-2 right-2 text-red-400 p-1"><Trash2 size={12}/></button></div>))}
                   </div>
               ) : !selectedCategory ? (
                   <div><button onClick={() => setSelectedBrand(null)} className="mb-4 text-blue-600 font-bold uppercase text-xs flex items-center gap-1"><ArrowLeft size={14}/> All Brands</button><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"><button onClick={() => { const name = prompt("Cat Name:"); if(name) { const updatedBrand = { ...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name, icon: 'Box', products: [] }] }; handleLocalUpdate({ ...localData, brands: brands.map(b=>b.id === selectedBrand.id ? updatedBrand : b) }); } }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 aspect-square"><Plus size={24} /><span className="font-bold text-xs uppercase mt-2">Add Category</span></button>{selectedBrand.categories.map(cat => (<div key={cat.id} className="bg-white rounded-2xl border p-4 flex flex-col items-center justify-center"><h3 className="font-black uppercase text-sm mb-4">{cat.name}</h3><button onClick={() => setSelectedCategory(cat)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs">View Items</button></div>))}</div></div>
               ) : (
                   <div><button onClick={() => setSelectedCategory(null)} className="mb-4 text-blue-600 font-bold uppercase text-xs flex items-center gap-1"><ArrowLeft size={14}/> Back</button><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [] } as any)} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 aspect-square"><Plus size={24} /><span className="font-bold text-xs uppercase mt-2">New Product</span></button>{selectedCategory.products.map(p => (<div key={p.id} className="bg-white rounded-2xl border p-4 flex flex-col items-center justify-center"><h3 className="font-black uppercase text-[10px] mb-4 text-center">{p.name}</h3><button onClick={() => setEditingProduct(p)} className="w-full bg-slate-100 text-slate-900 py-2 rounded-lg font-bold text-[10px] uppercase">Edit</button></div>))}</div></div>
               )
            )}

            {activeTab === 'screensaver' && (
                <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-32">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100"><div className="p-3 bg-blue-600 text-white rounded-2xl"><Clock size={28} /></div><div><h3 className="font-black text-slate-900 uppercase tracking-tight text-xl">Core Intervals</h3><p className="text-[10px] text-slate-400 font-bold uppercase">Automation & Scheduling</p></div></div>
                             <div className="grid grid-cols-2 gap-8 mb-8"><InputField label="Idle Wait (Seconds)" val={localData.screensaverSettings?.idleTimeout||60} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} /><InputField label="Slide Time (Seconds)" val={localData.screensaverSettings?.imageDuration||8} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, imageDuration: parseInt(e.target.value)}})} /></div>
                             <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                                <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><Moon className="text-blue-400" size={20} /><label className="text-[11px] font-black text-blue-100 uppercase tracking-widest">Sleep Protocol</label></div><button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, enableSleepMode: !localData.screensaverSettings?.enableSleepMode}})} className={`w-12 h-6 rounded-full relative transition-all ${localData.screensaverSettings?.enableSleepMode ? 'bg-blue-500' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.enableSleepMode ? 'left-7' : 'left-1'}`}></div></button></div>
                                <div className={`grid grid-cols-2 gap-6 transition-all ${localData.screensaverSettings?.enableSleepMode ? 'opacity-100' : 'opacity-30'}`}><div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Power On</label><input type="time" value={localData.screensaverSettings?.activeHoursStart || '08:00'} onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursStart: e.target.value}})} className="w-full p-4 bg-slate-800 rounded-xl text-blue-400 font-black font-mono outline-none"/></div><div><label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Sleep Mode</label><input type="time" value={localData.screensaverSettings?.activeHoursEnd || '20:00'} onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursEnd: e.target.value}})} className="w-full p-4 bg-slate-800 rounded-xl text-red-400 font-black font-mono outline-none"/></div></div>
                             </div>
                         </div>
                         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100"><div className="p-3 bg-purple-600 text-white rounded-2xl shadow-xl"><MonitorPlay size={28} /></div><div><h3 className="font-black text-slate-900 uppercase tracking-tight text-xl">Cinematic Engine</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visual Styles & Presentation</p></div></div>
                             <div className="space-y-6">
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Transition Style</label><div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">{(['mix', 'cinematic', 'fade'] as const).map(s => (<button key={s} onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, transitionStyle: s}})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localData.screensaverSettings?.transitionStyle === s ? 'bg-white text-purple-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{s}</button>))}</div></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center"><div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-600 mb-3"><Maximize size={20}/></div><div className="text-[10px] font-black uppercase text-slate-900 mb-2">Clock Overlay</div><button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, showClock: !localData.screensaverSettings?.showClock}})} className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${localData.screensaverSettings?.showClock ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>{localData.screensaverSettings?.showClock ? 'ENABLED' : 'DISABLED'}</button></div>
                                    <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center"><div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500 mb-3"><Layout size={20}/></div><div className="text-[10px] font-black uppercase text-slate-900 mb-2">Ambience Blur</div><button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, enableAmbience: !localData.screensaverSettings?.enableAmbience}})} className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${localData.screensaverSettings?.enableAmbience ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>{localData.screensaverSettings?.enableAmbience ? 'ENABLED' : 'DISABLED'}</button></div>
                                </div>
                             </div>
                         </div>
                     </div>
                     <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-12 items-center">
                            <div className="xl:col-span-5"><div className="flex items-center gap-4 mb-6"><div className="p-3 bg-orange-600 text-white rounded-2xl"><Activity size={24} /></div><h3 className="text-3xl font-black uppercase tracking-tight">Marketing Priority</h3></div><p className="text-slate-400 text-sm leading-relaxed mb-8">Adjust the algorithmic frequency of Promotional Ads vs Standard Products.</p>
                                <div className="grid grid-cols-4 gap-3 bg-white/5 p-2 rounded-3xl border border-white/10">{([1, 2, 3, 5] as const).map(w => (<button key={w} onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, marketingWeight: w}})} className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${localData.screensaverSettings?.marketingWeight === w ? 'bg-orange-600 text-white shadow-2xl scale-110' : 'text-slate-500'}`}><span className="text-xl font-black">{w}x</span><span className="text-[8px] font-black uppercase tracking-widest opacity-60">Weight</span></button>))}</div>
                            </div>
                            <div className="xl:col-span-7 bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-4">Visibility Toggles</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">{[{ key: 'showProductImages', label: 'Product Photos' }, { key: 'showProductVideos', label: 'Commercials' }, { key: 'showPamphlets', label: 'Live Catalog Covers' }, { key: 'showCustomAds', label: 'Custom Promotions' }, { key: 'muteVideos', label: 'Mute Video Audio' }, { key: 'showInfoOverlay', label: 'Metadata Overlays' }].map(opt => (<div key={opt.key} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"><label className="text-[11px] font-black text-slate-300 uppercase tracking-wider">{opt.label}</label><button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, [opt.key]: !(localData.screensaverSettings as any)[opt.key]}})} className={`w-10 h-5 rounded-full transition-all relative ${(localData.screensaverSettings as any)[opt.key] ? 'bg-orange-500' : 'bg-slate-700'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${(localData.screensaverSettings as any)[opt.key] ? 'left-6' : 'left-1'}`}></div></button></div>))}</div>
                            </div>
                        </div>
                     </div>
                </div>
            )}
            
            {activeTab === 'fleet' && (
                <div className="max-w-7xl mx-auto pb-24 animate-fade-in">
                   <div className="bg-slate-900 rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Activity size={200} /></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>Fleet Command Center</div>
                                <h2 className="text-4xl font-black uppercase tracking-tight">Active Infrastructure</h2>
                                <div className="flex gap-4 mt-4">
                                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl"><div className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Units</div><div className="text-xl font-mono font-black">{localData.fleet?.length || 0}</div></div>
                                    <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl"><div className="text-[8px] font-black text-green-500/60 uppercase mb-1">Online</div><div className="text-xl font-mono font-black text-green-400">{localData.fleet?.filter(k => (new Date().getTime() - new Date(k.last_seen).getTime()) < 350000).length}</div></div>
                                </div>
                            </div>
                            <button onClick={onRefresh} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"><RefreshCw size={14} /> Refresh Telemetry</button>
                        </div>
                   </div>
                   {['kiosk', 'mobile', 'tv'].map((type) => {
                       const devices = localData.fleet?.filter(k => k.deviceType === type || (type === 'kiosk' && !k.deviceType)) || [];
                       if (devices.length === 0) return null;
                       const config = { kiosk: { label: 'Interactive Kiosks', icon: <Tablet size={20} />, color: 'blue' }, mobile: { label: 'Mobile Units', icon: <Smartphone size={20} />, color: 'purple' }, tv: { label: 'TV Signage', icon: <Tv size={20} />, color: 'indigo' } }[type as 'kiosk' | 'mobile' | 'tv'];
                       return (
                           <div key={type} className="mb-12">
                               <div className="flex items-center gap-4 mb-6"><div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-200 text-${config.color}-600`}>{config.icon}</div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{config.label}</h3><div className="flex-1 h-[1px] bg-slate-200 ml-4"></div></div>
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{devices.map(kiosk => {
                                       const isOnline = (new Date().getTime() - new Date(kiosk.last_seen).getTime()) < 350000;
                                       return (
                                           <div key={kiosk.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                                               <div className={`p-5 flex justify-between items-start border-b ${isOnline ? 'bg-green-50/30 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                                                   <div className="flex-1 min-w-0 pr-2">
                                                       <div className="flex items-center gap-2 mb-1"><div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isOnline ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>{isOnline ? 'Active' : 'Offline'}</div><span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{kiosk.id}</span></div>
                                                       <h4 className="font-black text-slate-900 uppercase text-lg leading-tight truncate">{kiosk.name}</h4>
                                                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mt-1"><MapPin size={10} /> {kiosk.assignedZone || 'UNASSIGNED'}</div>
                                                   </div>
                                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${isOnline ? 'bg-white border-green-500 text-green-600 shadow-lg' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>{React.cloneElement(config.icon as any, { size: 24 })}</div>
                                               </div>
                                               <div className="p-5 flex-1 space-y-4">
                                                   <div className="grid grid-cols-2 gap-3"><div className="bg-slate-50 p-3 rounded-2xl border"><div className="text-[8px] font-black text-slate-400 uppercase">IP Address</div><div className="text-xs font-mono font-black text-slate-700 truncate">{kiosk.ipAddress || '---'}</div></div><div className="bg-slate-50 p-3 rounded-2xl border"><div className="text-[8px] font-black text-slate-400 uppercase">Version</div><div className="text-xs font-black text-slate-700">{kiosk.version || '1.0.0'}</div></div></div>
                                                   <div className="space-y-1"><div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter"><span className="flex items-center gap-1"><Wifi size={10} /> Signal Strength</span><span>{kiosk.wifiStrength}%</span></div><div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${isOnline ? (kiosk.wifiStrength > 70 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-slate-200'}`} style={{ width: isOnline ? `${kiosk.wifiStrength}%` : '0%' }}></div></div></div>
                                                   <div className="text-[9px] font-bold text-slate-400 italic">Last heartbeat: {new Date(kiosk.last_seen).toLocaleTimeString()}</div>
                                               </div>
                                               <div className="p-3 bg-slate-50 border-t grid grid-cols-2 gap-2"><button onClick={() => setEditingKiosk(kiosk)} className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm"><Pencil size={12}/> Edit Profile</button><button onClick={async () => { if(confirm("Restart Device?")) await supabase.from('kiosks').update({restart_requested: true}).eq('id', kiosk.id); }} className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-orange-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm"><Power size={12}/> Restart</button><button onClick={() => { if(confirm("Remove?")) supabase.from('kiosks').delete().eq('id', kiosk.id).then(onRefresh); }} className="col-span-2 py-2 text-red-400 hover:text-red-600 text-[9px] font-black uppercase tracking-widest transition-colors">De-Authorize Device</button></div>
                                           </div>
                                       );
                                   })}</div>
                           </div>
                       );
                   })}
                </div>
            )}
            
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p:any) => handleLocalUpdate({ ...localData, pricelists: p })} onSaveBrands={(b:any) => handleLocalUpdate({ ...localData, pricelistBrands: b })} onDeletePricelist={(id:any) => handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) })} />}
            {activeTab === 'settings' && (<div className="max-w-4xl mx-auto space-y-8 pb-20"><div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Branding</h3><FileUpload label="Main Company Logo" currentUrl={localData.companyLogoUrl} onUpload={(url: string) => handleLocalUpdate({...localData, companyLogoUrl: url})} /></div><div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Lock size={20} className="text-red-500" /> Setup PIN</h3><input type="text" value={localData.systemSettings?.setupPin || '0000'} onChange={(e) => handleLocalUpdate({...localData, systemSettings: { ...localData.systemSettings, setupPin: e.target.value }})} className="p-3 border rounded-xl font-mono font-bold text-lg text-center w-full md:w-64" placeholder="0000" maxLength={8}/></div><div className="bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-5"><Database size={120} /></div><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Database size={20} className="text-blue-500"/> System Data</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"><div><p className="text-xs text-slate-500 mb-4 font-bold uppercase">Export JSON Backup</p><button onClick={() => downloadZip(localData)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2"><Download size={16} /> Download Full System Backup (.zip)</button></div><div><p className="text-xs text-slate-500 mb-4 font-bold uppercase">Import Data (Merge)</p><label className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-pointer"><Upload size={16} /> Import from ZIP<input type="file" accept=".zip" className="hidden" onChange={async (e) => { if(e.target.files && e.target.files[0]) { try { const brands = await importZip(e.target.files[0]); handleLocalUpdate({ ...localData, brands: [...localData.brands, ...brands] }); alert("Import successful"); } catch (err) { alert("Import failed"); } } }} /></label></div></div></div></div>)}
            {activeTab === 'marketing' && <div className="bg-white p-8 rounded-2xl border shadow-sm max-w-4xl mx-auto"><h3 className="font-bold uppercase text-sm mb-6">Hero Configuration</h3><InputField label="Title" val={localData.hero.title} onChange={(e:any) => handleLocalUpdate({...localData, hero: {...localData.hero, title: e.target.value}})} /><InputField label="Subtitle" val={localData.hero.subtitle} onChange={(e:any) => handleLocalUpdate({...localData, hero: {...localData.hero, subtitle: e.target.value}})} /><FileUpload label="Background Image" currentUrl={localData.hero.backgroundImageUrl} onUpload={(url:any) => handleLocalUpdate({...localData, hero: {...localData.hero, backgroundImageUrl: url}})} /></div>}
            {activeTab === 'history' && <div className="bg-white p-8 rounded-2xl border shadow-sm max-w-6xl mx-auto"><h3 className="font-bold uppercase text-sm mb-4">Archive Logs</h3><p className="text-slate-500 text-xs font-bold">This section displays deleted items. RESTORE ability coming in future patch.</p></div>}
            {activeTab === 'tv' && <div className="bg-white p-8 rounded-2xl border shadow-sm max-w-6xl mx-auto"><h3 className="font-bold uppercase text-sm mb-4">TV Video Channels</h3><p className="text-slate-500 text-xs font-bold">Manage video loops for large signage displays.</p></div>}
        </main>

        {editingProduct && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in">
                <ProductEditor product={editingProduct} onSave={(p:any) => { 
                    const updatedBrand = { ...selectedBrand!, categories: selectedBrand!.categories.map(c => c.id === selectedCategory!.id ? { ...c, products: c.products.map(x => x.id === p.id ? p : x).concat(!c.products.find(x=>x.id===p.id) ? [p] : []) } : c) };
                    handleLocalUpdate({ ...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) });
                    setEditingProduct(null);
                }} onCancel={() => setEditingProduct(null)} />
            </div>
        )}

        {/* Fixed: Added modal rendering for editingKiosk */}
        {editingKiosk && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in">
                <KioskEditor kiosk={editingKiosk} onSave={async (k: any) => { 
                    if (localData.fleet) {
                        handleLocalUpdate({ ...localData, fleet: localData.fleet.map(f => f.id === k.id ? k : f) });
                    }
                    if (supabase) {
                        await supabase.from('kiosks').upsert({
                            id: k.id,
                            name: k.name,
                            device_type: k.deviceType,
                            assigned_zone: k.assignedZone,
                            notes: k.notes,
                            location_description: k.locationDescription
                        });
                    }
                    setEditingKiosk(null);
                    onRefresh();
                }} onCancel={() => setEditingKiosk(null)} />
            </div>
        )}
    </div>
  );
};

// ZIP Logic Helper functions from original codebase (Preserved)
const importZip = async (file: File): Promise<Brand[]> => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const newBrands: Record<string, Brand> = {};
    const filePaths = Object.keys(loadedZip.files);
    for (const rawPath of filePaths) {
        const fileObj = loadedZip.files[rawPath];
        if (fileObj.dir) continue;
        const parts = rawPath.split('/').filter(p => p.trim() !== '');
        if (parts.length < 2) continue;
        const brandName = parts[0];
        if (!newBrands[brandName]) newBrands[brandName] = { id: generateId('brand'), name: brandName, categories: [] };
        if (parts.length === 2) {
             if (parts[1].toLowerCase().includes('logo')) {
                  const blob = await fileObj.async("blob");
                  newBrands[brandName].logoUrl = URL.createObjectURL(blob);
             }
             continue;
        }
        if (parts.length < 4) continue;
        const catName = parts[1];
        const prodName = parts[2];
        const fileName = parts.slice(3).join('/');
        let category = newBrands[brandName].categories.find(c => c.name === catName);
        if (!category) { category = { id: generateId('cat'), name: catName, icon: 'Box', products: [] }; newBrands[brandName].categories.push(category); }
        let product = category.products.find(p => p.name === prodName);
        if (!product) { product = { id: generateId('prod'), name: prodName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '', galleryUrls: [], videoUrls: [], manuals: [], dateAdded: new Date().toISOString() }; category.products.push(product); }
        if (fileName.endsWith('.jpg') || fileName.endsWith('.png')) {
             const blob = await fileObj.async("blob");
             const url = URL.createObjectURL(blob);
             if (!product.imageUrl) product.imageUrl = url;
             else product.galleryUrls = [...(product.galleryUrls || []), url];
        }
    }
    return Object.values(newBrands);
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return;
    const zip = new JSZip();
    zip.file("store_config.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kiosk_backup_${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
};

export default AdminDashboard;
