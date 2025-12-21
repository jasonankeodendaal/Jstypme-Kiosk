
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, Printer
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash { to { stroke-dashoffset: -20; } }
                .animate-dash { animation: dash 1s linear infinite; }
                @keyframes flow { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(100px); opacity: 0; } }
                .packet { animation: flow 2s infinite ease-in-out; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
                .radar-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
                @keyframes scroll-film { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .film-strip { animation: scroll-film 10s linear infinite; }
            `}</style>
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
                <div className="mb-6 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Manual</h3>
                    <p className="text-[10px] text-slate-500 font-medium">v2.5 Technical Reference</p>
                </div>
                <div className="space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'
                            }`}
                        >
                            <span className={activeSection === section.id ? 'opacity-100' : 'opacity-70'}>{section.icon}</span>
                            <span className="text-xs uppercase tracking-wide">{section.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0">
                 {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-none px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                        >
                            {section.icon}
                            <span className="text-xs uppercase tracking-wide whitespace-nowrap">{section.label}</span>
                        </button>
                    ))}
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Network className="text-blue-600" size={32} /> Hybrid Cloud Architecture
                            </h2>
                            <p className="text-slate-500 font-medium">Local-First performance with Cloud synchronization.</p>
                        </div>
                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8">
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <HardDrive size={40} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div>
                                        <div className="text-blue-400 text-[10px] font-mono">IndexedDB / Cache</div>
                                    </div>
                                </div>
                                <div className="flex-1 h-24 relative mx-4 flex items-center">
                                    <svg className="w-full h-12 overflow-visible">
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
                                        <circle r="4" fill="#60a5fa" className="packet" style={{ animationDelay: '0s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M0,6 L300,6" />
                                        </circle>
                                        <circle r="4" fill="#4ade80" className="packet" style={{ animationDelay: '1s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M300,6 L0,6" />
                                        </circle>
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-slate-400">Sync (60s)</div>
                                </div>
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                                        <Database size={40} className="text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Supabase Cloud</div>
                                        <div className="text-green-400 text-[10px] font-mono">PostgreSQL DB</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><HardDrive size={18} className="text-blue-600"/> The "Local-First" Strategy</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">To ensure instant performance in retail environments with unstable WiFi, the kiosk <strong>never</strong> loads data directly from the cloud during customer interaction.</p>
                                <ul className="space-y-2">
                                    <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div><span><strong>Instant Boot:</strong> Uses `localStorage` to load the full inventory in milliseconds.</span></li>
                                    <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div><span><strong>Zero Latency:</strong> Product images and videos are cached by the Service Worker.</span></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><RefreshCw size={18} className="text-green-600"/> Synchronization Logic</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">The system maintains a background connection to Supabase to keep data fresh without interrupting the user.</p>
                                <div className="border-l-2 border-green-200 pl-4 py-1 space-y-2">
                                    <div className="text-xs font-mono text-slate-500">1. Startup</div>
                                    <div className="text-sm font-bold text-slate-800">Fetch latest JSON config & Telemetry</div>
                                    <div className="text-xs font-mono text-slate-500 mt-2">2. Runtime (Loop)</div>
                                    <div className="text-sm font-bold text-slate-800">Every 60s: Push Heartbeat & Pull Config Changes</div>
                                    <div className="text-xs font-mono text-slate-500 mt-2">3. Admin Event</div>
                                    <div className="text-sm font-bold text-slate-800">Realtime WebSocket triggers immediate refresh</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeSection === 'inventory' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Box className="text-orange-600" size={32} /> Data Hierarchy
                            </h2>
                            <p className="text-slate-500 font-medium">Strict 3-Level Parent-Child Relationship Model.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8 animate-fade-in">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div>
                                <div className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">Contains: Logo, Theme Color</div>
                            </div>
                            <div className="absolute top-24 bottom-20 w-0.5 bg-slate-300"></div>
                            <div className="relative z-10 flex gap-4 mb-8">
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category A</div>
                                </div>
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.2s'}}>
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category B</div>
                                </div>
                            </div>
                            <div className="relative z-10 flex gap-2">
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/><div className="text-[10px] font-bold">Product 1</div>
                                </div>
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/><div className="text-[10px] font-bold">Product 2</div>
                                </div>
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.5s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/><div className="text-[10px] font-bold">Product 3</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeSection === 'screensaver' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Zap className="text-yellow-500" size={32} /> Screensaver Automation
                            </h2>
                            <p className="text-slate-500 font-medium">Autonomous marketing engine with probabilistic scheduling.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const fetchAssetAndAddToZip = async (zipFolder: JSZip | null, url: string, filenameBase: string) => {
    if (!zipFolder || !url) return;
    try {
        let blob: Blob;
        if (url.startsWith('data:')) {
            const res = await fetch(url);
            blob = await res.blob();
        } else {
            const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            blob = await response.blob();
        }
        const ext = url.split('.').pop()?.split('?')[0] || 'dat';
        const safeFilename = filenameBase.replace(/[^a-z0-9_\-]/gi, '_');
        zipFolder.file(`${safeFilename}.${ext}`, blob);
    } catch (e) {
        zipFolder.file(`${filenameBase}_FAILED.txt`, `Could not download: ${url}`);
    }
};

const downloadZip = async (storeData: StoreData) => {
    const zip = new JSZip();
    zip.file("store_config_full.json", JSON.stringify(storeData, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiosk-full-system-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase">Enter Name & PIN</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold outline-none" type="text" placeholder="Admin Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold outline-none" type="password" placeholder="PIN Code" value={pin} onChange={(e) => setPin(e.target.value)} />
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
      setIsProcessing(true);
      // Fix: Explicitly cast Array.from result to File[] to avoid unknown type errors
      const files = Array.from(e.target.files) as File[];
      try {
          if (allowMultiple) {
              const urls = [];
              for(let f of files) { urls.push(await uploadFileToStorage(f)); }
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
      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
        <div className="w-10 h-10 bg-slate-50 border border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase">
              {isProcessing ? '...' : 'Select'}
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white border border-slate-300 rounded-xl h-24 text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [isImporting, setIsImporting] = useState(false);
  
  const addItem = () => {
    setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '' }]);
  };

  const updateItem = (id: string, field: keyof PricelistItem, val: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between gap-4 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2"><Table className="text-blue-600" size={24} /> Pricelist Builder</h3>
            <p className="text-xs text-slate-500 font-bold uppercase">{pricelist.title}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Normal Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Promo Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm uppercase" placeholder="SKU-123" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Product details..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save Pricelist Table</button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ 
    pricelists, 
    pricelistBrands, 
    onSavePricelists,
    onSaveBrands,
    onDeletePricelist,
    onBridgeToInventory
}: { 
    pricelists: Pricelist[], 
    pricelistBrands: PricelistBrand[], 
    onSavePricelists: (p: Pricelist[]) => void,
    onSaveBrands: (b: PricelistBrand[]) => void,
    onDeletePricelist: (id: string) => void,
    onBridgeToInventory: (items: PricelistItem[], brandName: string) => void
}) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    useEffect(() => { if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null); }, [sortedBrands]);
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const addPricelist = () => { if (!selectedBrand) return; const newItem: Pricelist = { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'manual', month: 'January', year: new Date().getFullYear().toString(), items: [], dateAdded: new Date().toISOString() }; onSavePricelists([...pricelists, newItem]); };
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => { 
        if (updates.items && selectedBrand) onBridgeToInventory(updates.items, selectedBrand.name);
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p)); 
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <div><h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2><p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Independent List</p></div>
                     <button onClick={() => { const name = prompt("Brand Name:"); if(name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name, logoUrl: '' }]); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div><div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0"><h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate mr-2 max-w-[60%]">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 shrink-0"><Plus size={12} /> Add <span className="hidden md:inline">Pricelist</span></button></div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 content-start pb-10">
                     {filteredLists.map((item) => (
                         <div key={item.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col p-3 md:p-4 gap-2 md:gap-3 h-fit relative group transition-all bg-white border-slate-200`}>
                             <div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs md:text-sm bg-transparent" /></div>
                             <div className="grid grid-cols-2 gap-2">
                                 <div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label><select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-white/50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                                 <div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label><input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-white/50 rounded border border-slate-200" /></div>
                             </div>
                             <button onClick={() => setEditingManualList(item)} className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"><Edit2 size={12}/> {item.items?.length || 0} Items - Open Builder</button>
                             <button onClick={() => onDeletePricelist(item.id)} className="mt-auto pt-2 md:pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                         </div>
                     ))}
                 </div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl })} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : [], videoUrls: product.videoUrls || [], manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() });
    const [newFeature, setNewFeature] = useState('');
    const [newBoxItem, setNewBoxItem] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3><button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                    </div>
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Key Features</label>
                             <div className="flex gap-2 mb-2"><input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Add feature..." onKeyDown={(e) => e.key === 'Enter' && addFeature()} /><button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button></div>
                             <ul className="space-y-1">{draft.features.map((f, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold text-slate-700">{f}<button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Confirm Changes</button></div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMissingContentReport, setShowMissingContentReport] = useState(false);

  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  
  const handleBridgePricelistToInventory = (items: PricelistItem[], brandName: string) => {
      if (!localData) return;
      let brands = [...localData.brands];
      let inventoryBrand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
      
      if (!inventoryBrand) {
          inventoryBrand = { id: generateId('brand'), name: brandName, categories: [] };
          brands.push(inventoryBrand);
      }

      let category = inventoryBrand.categories.find(c => c.name === "Pricelist Imports");
      if (!category) {
          category = { id: generateId('cat'), name: "Pricelist Imports", icon: "Package", products: [] };
          inventoryBrand.categories.push(category);
      }

      const existingSkus = new Set<string>();
      inventoryBrand.categories.forEach(c => c.products.forEach(p => { if(p.sku) existingSkus.add(p.sku.toLowerCase()); }));

      let added = false;
      items.forEach(item => {
          if (item.sku && !existingSkus.has(item.sku.toLowerCase())) {
              category!.products.push({
                  id: generateId('prod'),
                  sku: item.sku,
                  name: item.description,
                  description: item.description,
                  imageUrl: '',
                  features: [],
                  specs: { 'Normal Price': item.normalPrice, 'Promo Price': item.promoPrice || '' },
                  dimensions: [],
                  dateAdded: new Date().toISOString()
              });
              existingSkus.add(item.sku.toLowerCase());
              added = true;
          }
      });

      if (added) handleLocalUpdate({ ...localData, brands });
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div>
                 <div className="flex items-center gap-4">
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {['inventory', 'marketing', 'pricelists', 'tv', 'screensaver', 'fleet', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative">
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="flex flex-col gap-6 animate-fade-in">
                       <div className="flex justify-between items-center">
                           <h2 className="text-2xl font-black uppercase text-slate-900">Brands Inventory</h2>
                           <button onClick={() => setShowMissingContentReport(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800"><Printer size={16}/> Print Needs Checklist</button>
                       </div>
                       <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                           <button onClick={() => { const name = prompt("Brand Name:"); if(name) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }] }) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[160px] text-slate-400 hover:border-blue-500 hover:text-blue-500">
                               <Plus size={24} className="mb-2" /><span className="font-bold uppercase text-xs">Add Brand</span>
                           </button>
                           {brands.map(brand => (
                               <div key={brand.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group relative flex flex-col h-full">
                                   <div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div>
                                   <div className="p-4"><h3 className="font-black text-slate-900 text-sm uppercase truncate mb-1">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs uppercase">Manage</button></div>
                               </div>
                           ))}
                       </div>
                   </div>
               ) : !selectedCategory ? (
                   <div className="animate-fade-in">
                       <div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2></div>
                       <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                           <button onClick={() => { const name = prompt("Category Name:"); if(name) { const updated = {...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name, icon: 'Box', products: [] }]}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b)}); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 hover:border-blue-500 aspect-square"><Plus size={24} /><span className="font-bold text-[10px] uppercase mt-2">New Category</span></button>
                           {selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left group relative aspect-square flex flex-col justify-center"><Box size={20} className="mb-4 text-slate-400" /><h3 className="font-black text-slate-900 uppercase text-sm">{cat.name}</h3><p className="text-xs text-slate-500 font-bold">{cat.products.length} Products</p></button>))}
                       </div>
                   </div>
               ) : (
                   <div className="animate-fade-in h-full flex flex-col">
                       <div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1 truncate">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2"><Plus size={14} /> Add Product</button></div>
                       <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto pb-20">
                           {selectedCategory.products.map(product => (
                               <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
                                   <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">
                                       {product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-300" />}
                                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                           <button onClick={() => setEditingProduct(product)} className="p-2 bg-white text-blue-600 rounded-lg font-bold text-xs uppercase shadow-lg">Edit</button>
                                           <button onClick={() => { if(confirm("Delete?")) { const updatedCat = {...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id)}; const updatedBrand = {...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c)}; handleLocalUpdate({...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b)}); } }} className="p-2 bg-white text-red-600 rounded-lg font-bold text-xs uppercase shadow-lg">Delete</button>
                                       </div>
                                   </div>
                                   <div className="p-4"><h4 className="font-bold text-slate-900 text-sm truncate uppercase">{product.name}</h4><p className="text-xs text-slate-500 font-mono truncate">{product.sku || 'No SKU'}</p></div>
                               </div>
                            ))}
                       </div>
                   </div>
               )
            )}
            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p) => handleLocalUpdate({ ...localData, pricelists: p })} onSaveBrands={(b) => handleLocalUpdate({ ...localData, pricelistBrands: b })} onDeletePricelist={(id) => handleLocalUpdate({...localData, pricelists: localData.pricelists?.filter(p => p.id !== id)})} onBridgeToInventory={handleBridgePricelistToInventory} />}
            {/* OTHER TABS ... */}
        </main>

        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 p-4 md:p-8 flex items-center justify-center"><ProductEditor product={editingProduct} onSave={(p) => { if (!selectedBrand || !selectedCategory) return; const isNew = !selectedCategory.products.find(x => x.id === p.id); const newProducts = isNew ? [...selectedCategory.products, p] : selectedCategory.products.map(x => x.id === p.id ? p : x); const updatedCat = { ...selectedCategory, products: newProducts }; const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }; handleLocalUpdate({ ...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
        
        {showMissingContentReport && (
            <div className="fixed inset-0 z-[100] bg-white animate-fade-in flex flex-col p-8 overflow-y-auto">
                <style>{`@media print { .no-print { display: none; } body { padding: 0; background: white; } }`}</style>
                <div className="no-print flex justify-between mb-8 border-b border-slate-200 pb-4">
                    <h2 className="text-3xl font-black uppercase text-slate-900">Missing Content Report</h2>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase text-sm shadow-lg flex items-center gap-2"><Printer size={18}/> Print Checklist</button>
                        <button onClick={() => setShowMissingContentReport(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={32}/></button>
                    </div>
                </div>
                
                <div className="print-header text-center mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className="text-2xl font-black uppercase tracking-widest">Inventory Content Status Report</h1>
                    <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-tighter">ADMIN AUTHORIZED • {new Date().toLocaleDateString()}</p>
                </div>

                {localData.brands.map(brand => {
                    const productsMissing = brand.categories.flatMap(c => c.products.filter(p => !p.imageUrl || !p.description || Object.keys(p.specs).length < 2));
                    if (productsMissing.length === 0) return null;
                    return (
                        <div key={brand.id} className="mb-12 break-inside-avoid">
                            <h3 className="bg-slate-900 text-white px-4 py-2 font-black uppercase text-lg mb-4">{brand.name}</h3>
                            <table className="w-full text-left border-collapse border border-slate-200">
                                <thead>
                                    <tr className="bg-slate-100 text-[10px] font-black uppercase border border-slate-200">
                                        <th className="p-2 border border-slate-200">SKU / ID</th>
                                        <th className="p-2 border border-slate-200">Product Name</th>
                                        <th className="p-2 border border-slate-200 text-center">Img</th>
                                        <th className="p-2 border border-slate-200 text-center">Desc</th>
                                        <th className="p-2 border border-slate-200 text-center">Specs</th>
                                        <th className="p-2 border border-slate-200">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brand.categories.map(cat => cat.products.filter(p => !p.imageUrl || !p.description || Object.keys(p.specs).length < 2).map(p => (
                                        <tr key={p.id} className="text-xs border border-slate-200">
                                            <td className="p-2 font-mono font-bold border border-slate-200">{p.sku || p.id.split('-').pop()}</td>
                                            <td className="p-2 font-bold uppercase border border-slate-200">{p.name}</td>
                                            <td className="p-2 text-center border border-slate-200">{p.imageUrl ? '✓' : '□'}</td>
                                            <td className="p-2 text-center border border-slate-200">{p.description ? '✓' : '□'}</td>
                                            <td className="p-2 text-center border border-slate-200">{Object.keys(p.specs).length >= 2 ? '✓' : '□'}</td>
                                            <td className="p-2 font-bold text-[10px] uppercase text-slate-400 border border-slate-200">{cat.name}</td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
