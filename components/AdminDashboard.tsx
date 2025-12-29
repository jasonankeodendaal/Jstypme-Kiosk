
// AdminDashboard.tsx - Complete implementation for managing Kiosk data and fleet.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, FlatProduct } from '../types';
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
            {/* Sidebar */}
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
                            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`p-2 rounded-xl ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                {React.cloneElement(section.icon as React.ReactElement, { size: 18 })}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div>
                                <div className="text-[9px] font-bold uppercase truncate opacity-60">{section.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-12 lg:p-20 relative">
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-8">System Documentation</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Select a section from the left to learn more about the Kiosk Pro internal logic.</p>
                {/* Content based on activeSection... */}
            </div>
        </div>
    );
};

// --- AUTH COMPONENT ---
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
        <h1 className="text-3xl font-black mb-6 text-center text-slate-900 tracking-tight">Admin Hub</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" type="text" placeholder="Admin Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
          {error && <div className="text-red-500 text-xs font-bold text-center">{error}</div>}
          <button type="submit" className="w-full p-4 bg-slate-900 text-white font-black rounded-xl uppercase hover:bg-slate-800 transition-colors">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- FILE UPLOAD COMPONENT ---
const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const files = Array.from(e.target.files) as File[];
      try {
        if (allowMultiple) {
          const urls = await Promise.all(files.map(f => uploadFileToStorage(f)));
          onUpload(urls);
        } else {
          const url = await uploadFileToStorage(files[0]);
          onUpload(url);
        }
      } catch (err) { alert("Upload error"); } 
      finally { setIsProcessing(false); }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center shrink-0">
           {isProcessing ? <Loader2 className="animate-spin" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : icon}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
              Select {isProcessing ? '...' : ''}
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 border border-slate-300 rounded-xl h-24 outline-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear() }]);
    return (
        <div className="space-y-4">
            <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localList.map(cat => (
                    <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200">
                        <input value={cat.title} onChange={(e) => handleUpdate(localList.map(c => c.id === cat.id ? { ...c, title: e.target.value } : c))} className="font-bold w-full outline-none" />
                        <FileUpload label="Cover" onUpload={(url: string) => handleUpdate(localList.map(c => c.id === cat.id ? { ...c, thumbnailUrl: url } : c))} currentUrl={cat.thumbnailUrl} />
                        <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-500 text-[10px] font-bold uppercase mt-2">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-6">
        <h3 className="font-black mb-4">Pricelist Editor: {pricelist.title}</h3>
        <div className="flex-1 overflow-auto space-y-2">
            {items.map(item => (
                <div key={item.id} className="flex gap-2 items-center">
                    <input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="border p-2 rounded w-24" placeholder="SKU" />
                    <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="border p-2 rounded flex-1" placeholder="Description" />
                    <input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="border p-2 rounded w-24" placeholder="Price" />
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))}><X size={16} /></button>
                </div>
            ))}
        </div>
        <div className="flex justify-between mt-4">
            <button onClick={addItem} className="bg-slate-100 p-2 rounded font-bold text-xs">Add Row</button>
            <div className="flex gap-2">
                <button onClick={onClose} className="p-2 font-bold text-xs">Cancel</button>
                <button onClick={() => { onSave({ ...pricelist, items }); onClose(); }} className="bg-blue-600 text-white p-2 rounded font-bold text-xs">Save</button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export const AdminDashboard: React.FC<{ 
    storeData: StoreData, 
    onUpdateData: (data: StoreData) => void,
    onRefresh: () => void 
}> = ({ storeData, onUpdateData, onRefresh }) => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState('inventory');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (newData: StoreData) => {
        setIsSaving(true);
        try { await onUpdateData(newData); } finally { setIsSaving(false); }
    };

    if (!user) return <Auth admins={storeData.admins} onLogin={setUser} />;

    const tabs = [
        { id: 'inventory', label: 'Inventory', icon: <Box size={18}/> },
        { id: 'marketing', label: 'Marketing', icon: <Megaphone size={18}/> },
        { id: 'pricelists', label: 'Pricelists', icon: <Table size={18}/> },
        { id: 'tv', label: 'TV Mode', icon: <Tv size={18}/> },
        { id: 'screensaver', label: 'Screensaver', icon: <Play size={18}/> },
        { id: 'fleet', label: 'Fleet', icon: <Activity size={18}/> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18}/> },
        { id: 'docs', label: 'Manual', icon: <HelpCircle size={18}/> },
    ];

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 flex flex-col p-6 shrink-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><ShieldCheck size={24}/></div>
                    <span className="text-white font-black uppercase text-xs tracking-widest">Admin Hub</span>
                </div>
                <nav className="flex-1 space-y-1">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold text-xs uppercase tracking-wide ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </nav>
                <button onClick={() => setUser(null)} className="flex items-center gap-3 text-red-400 p-4 font-bold text-xs uppercase"><LogOut size={18}/> Logout</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{tabs.find(t => t.id === activeTab)?.label} Management</h2>
                    <div className="flex gap-4">
                        <button onClick={onRefresh} className="p-3 text-slate-400 hover:text-blue-600"><RefreshCw size={20} /></button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'inventory' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <h3 className="font-black text-xl mb-6">Store Brands</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {storeData.brands.map(b => (
                                    <div key={b.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col items-center">
                                        <img src={b.logoUrl} className="h-12 object-contain mb-4" />
                                        <span className="font-bold text-sm">{b.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'fleet' && (
                        <div className="space-y-6">
                            {storeData.fleet?.map(k => (
                                <div key={k.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className={`p-3 rounded-2xl ${k.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}><Tablet size={24}/></div>
                                        <div>
                                            <h4 className="font-black uppercase">{k.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold">{k.id} • {k.ipAddress}</p>
                                        </div>
                                    </div>
                                    <SignalStrengthBars strength={k.wifiStrength} />
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'docs' && <SystemDocumentation />}
                </main>
            </div>
            {isSaving && (
                <div className="fixed inset-0 z-[200] bg-black/10 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" />
                        <span className="font-black text-xs uppercase">Syncing Cloud...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
