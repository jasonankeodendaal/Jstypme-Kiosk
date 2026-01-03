
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Silent Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">System state is handled atomatically in the background. No reloads, no downtime.</p>
                        </div>
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110"><Monitor className="text-blue-400" size={40} /><div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">YOU</div></div>
                                </div>
                                <div className="flex-1 w-full h-24 relative flex items-center justify-center"><div className="w-full h-1 bg-white/5 rounded-full relative"><div className="absolute inset-0 bg-blue-500/20 blur-md"></div>{[0, 1, 2].map(i => (<div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>))}</div></div>
                                <div className="flex flex-col items-center gap-4 group"><div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1"><Tablet className="text-green-400" size={32} /><div className="absolute inset-0 bg-green-500/10 animate-pulse rounded-2xl"></div></div></div>
                            </div>
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
    if (!name.trim() || !pin.trim()) return setError('Please enter both Name and PIN.');
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) { localStorage.setItem('kiosk_admin_session', JSON.stringify(admin)); onLogin(admin); } else { setError('Invalid credentials.'); }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in"><div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300"><h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1><p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p><form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} /></div>{error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}<button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button></form></div></div>
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
          } else { const res = await uploadSingle(files[0]); setUploadProgress(100); onUpload(res.url, fileType); }
      } catch (err) { alert("Upload error"); } finally { setTimeout(() => { setIsProcessing(false); setUploadProgress(0); }, 500); }
    }
  };
  return (
    <div className="mb-4"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label><div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">{isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}<div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">{isProcessing ? (<Loader2 className="animate-spin text-blue-500" /> ) : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? (<div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div>) : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}</div><label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50' : ''}`}><Upload size={10} className="inline mr-1" /> {isProcessing ? '...' : 'Select'}<input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/></label></div></div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>{isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}</div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);
    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }]);
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c));
    return (
        <div className="space-y-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3><button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{localList.map((cat) => (<div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"><div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">{cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (<img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> ) : (<BookOpen size={32} className="text-slate-300" />)}{cat.pdfUrl && (<div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>)}</div><div className="p-4 space-y-3 flex-1 flex flex-col"><input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />{cat.type === 'catalogue' || brandId ? (<div><label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label><input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" /></div>) : (<div className="grid grid-cols-2 gap-2"><div><label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label><input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div><div><label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label><input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div></div>)}<div className="grid grid-cols-2 gap-2 mt-auto pt-2"><FileUpload label="Thumbnail" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} /><FileUpload label="PDF" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} /></div><div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2"><button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete</button></div></div></div>))}</div></div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [isImporting, setIsImporting] = useState(false);
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: field === 'description' ? val.toUpperCase() : val } : item));
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsImporting(true);
    try {
        const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) return;
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && String(cell).trim() !== ''));
        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const findIdx = (keywords: string[]) => firstRow.findIndex(h => keywords.some(k => h.includes(k)));
        const sIdx = findIdx(['sku', 'code', 'part']) || 0; const dIdx = findIdx(['desc', 'name', 'product']) || 1;
        const nIdx = findIdx(['normal', 'retail', 'price']) || 2; const pIdx = findIdx(['promo', 'special', 'sale']) || 3;
        const newImportedItems: PricelistItem[] = validRows.slice(1).map(row => {
            const formatVal = (v: any) => { if (!v) return ''; const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? String(v) : `R ${Math.ceil(n).toLocaleString()}`; };
            return { id: generateId('imp'), sku: String(row[sIdx] || '').toUpperCase(), description: String(row[dIdx] || '').toUpperCase(), normalPrice: formatVal(row[nIdx]), promoPrice: row[pIdx] ? formatVal(row[pIdx]) : '', imageUrl: '' };
        });
        setItems(newImportedItems);
    } catch (err) { alert("Import error"); } finally { setIsImporting(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"><div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0"><div><h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2"><Table className="text-blue-600" size={24} /> Pricelist Builder</h3></div><div className="flex gap-2"><label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 cursor-pointer">{isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import XLSX<input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSpreadsheetImport} /></label><button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Plus size={16} /> Add Row</button><button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button></div></div><div className="flex-1 overflow-auto p-6"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 sticky top-0 z-10"><tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-16">Visual</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => (<tr key={item.id} className="hover:bg-slate-50/50 transition-colors"><td className="p-2"><div className="w-12 h-12 relative group/item-img">{item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain" /> : <ImageIcon size={14} className="text-slate-200 mx-auto"/>}<label className="absolute inset-0 bg-black/40 opacity-0 group-hover/item-img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"><Upload size={12} className="text-white" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const url = await uploadFileToStorage(e.target.files[0]); updateItem(item.id, 'imageUrl', url); } }} /></label></div></td><td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" placeholder="SKU" /></td><td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" placeholder="DESC" /></td><td className="p-2"><input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm" placeholder="R 0" /></td><td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div><div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3"><button onClick={() => { onSave({ ...pricelist, items, type: 'manual' }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg">Save Table</button></div></div></div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    const updatePricelist = (id: string, updates: any) => onSavePricelists(pricelists.map((p: any) => p.id === id ? { ...p, ...updates, dateAdded: new Date().toISOString() } : p));
    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in"><div className="w-full md:w-1/3 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center"><h2 className="font-black text-slate-900 uppercase text-xs">Brands</h2><button onClick={() => { const name = prompt("Name:"); if(name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name, logoUrl: '' }]); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase">+ Brand</button></div><div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(brand => (<div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div><div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-xs uppercase truncate">{brand.name}</div></div></div></div>))}</div></div><div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 uppercase text-xs">{selectedBrand?.name || 'Lists'}</h3><button onClick={() => { if(selectedBrand) onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New List', url: '', type: 'pdf', month: 'January', year: '2024', dateAdded: new Date().toISOString() }]); }} disabled={!selectedBrand} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">+ List</button></div><div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">{filteredLists.map((item: any) => (<div key={item.id} className="rounded-xl border shadow-sm p-4 bg-white space-y-3 flex flex-col"><input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" /><div className="grid grid-cols-2 gap-2"><select value={item.type} onChange={(e) => updatePricelist(item.id, { type: e.target.value })} className="text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200"><option value="pdf">PDF</option><option value="manual">TABLE</option></select><button onClick={() => { if(confirm("Delete?")) onDeletePricelist(item.id); }} className="text-red-400 text-[10px] font-bold uppercase">Delete</button></div>{item.type === 'manual' ? (<button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">Edit Table</button>) : (<FileUpload label="Upload PDF" accept="application/pdf" currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url })} />)}<FileUpload label="Thumbnail" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url })} /></div>))}</div></div>{editingManualList && (<ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl })} onClose={() => setEditingManualList(null)} />)}</div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : [], videoUrls: product.videoUrls || [], manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl"><div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase">Edit: {draft.name || 'New'}</h3><button onClick={onCancel}><X size={24} /></button></div><div className="flex-1 overflow-y-auto p-8 space-y-6"><InputField label="Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} /><InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} /><InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} /><FileUpload label="Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} /><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h4 className="font-black text-[10px] uppercase mb-2">Videos</h4><FileUpload label="Add Videos" accept="video/*" allowMultiple onUpload={(urls: any) => setDraft({ ...draft, videoUrls: [...(draft.videoUrls || []), ...(Array.isArray(urls)?urls:[urls])] })} /></div></div><div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4"><button onClick={onCancel} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Product</button></div></div>
    );
};

// ... Main Admin Hub Logic ...
export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  useEffect(() => {
      if (storeData) setLocalData(storeData);
  }, [storeData]);

  useEffect(() => {
      checkCloudConnection().then(setIsCloudConnected);
  }, []);

  const handleSilentSave = (newData: StoreData) => {
      setLocalData(newData);
      onUpdateData(newData);
  };

  const addToArchive = (type: ArchivedItem['type'], name: string, data: any, action: ArchivedItem['action'] = 'delete') => {
      if (!localData || !currentUser) return localData?.archive;
      const newItem: ArchivedItem = { id: generateId('arch'), type, action, name, userName: currentUser.name, method: 'admin_panel', data, deletedAt: new Date().toISOString() };
      return { ...(localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} }), deletedItems: [newItem, ...(localData.archive?.deletedItems || [])].slice(0, 100) };
  };

  if (!localData) return null;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20"><div className="flex items-center justify-between px-4 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div><div className="flex items-center gap-4"><div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-900/50 text-blue-300 border border-blue-800"><Cloud size={14} /><span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Sync ON' : 'Syncing...'}</span></div><button onClick={() => { localStorage.removeItem('kiosk_admin_session'); setCurrentUser(null); }} className="text-red-400 text-xs font-bold uppercase">Logout</button></div></div><div className="flex overflow-x-auto no-scrollbar">{['inventory', 'marketing', 'pricelists', 'screensaver', 'fleet', 'history', 'settings', 'guide'].map(tab => (currentUser.permissions[tab as keyof AdminPermissions] || tab === 'guide') && (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab}</button>))}</div></header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'inventory' && (!selectedBrand ? (<div className="grid grid-cols-3 md:grid-cols-6 gap-4 animate-fade-in"><button onClick={() => { const name = prompt("Name:"); if(name) handleSilentSave({ ...localData, brands: [...localData.brands, { id: generateId('b'), name, categories: [] }] }); }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 aspect-square transition-all"><Plus size={24} /><span className="font-bold uppercase text-[10px] mt-2">Add Brand</span></button>{localData.brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg group relative flex flex-col"><div className="flex-1 bg-slate-50 flex items-center justify-center p-4 relative aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div><div className="p-4"><h3 className="font-black text-slate-900 text-sm uppercase truncate mb-3">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button></div></div>))}</div>) : !selectedCategory ? (<div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2></div><div className="grid grid-cols-3 md:grid-cols-6 gap-4"><button onClick={() => { const name = prompt("Category:"); if(name) { const updated = { ...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name, icon: 'Box', products: [] }] }; handleSilentSave({ ...localData, brands: localData.brands.map(b => b.id === updated.id ? updated : b) }); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center aspect-square"><Plus size={24} /><span className="font-bold text-[10px] uppercase mt-2">New Cat</span></button>{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm aspect-square flex flex-col items-center justify-center"><Box size={24} className="text-slate-400 mb-2"/><h3 className="font-black text-slate-900 uppercase text-[10px] text-center">{cat.name}</h3><p className="text-[9px] text-slate-500 font-bold">{cat.products.length} Products</p></button>))}</div></div>) : (<div className="animate-fade-in"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs">+ Add Product</button></div><div className="grid grid-cols-2 md:grid-cols-5 gap-4">{selectedCategory.products.map(product => (<div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">{product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-300" />}<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={() => setEditingProduct(product)} className="px-3 py-1 bg-white text-blue-600 rounded font-bold text-xs uppercase">Edit</button><button onClick={() => { if(confirm("Delete?")) { const updatedCat = { ...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id) }; const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }; handleSilentSave({ ...localData, brands: localData.brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }); } }} className="px-3 py-1 bg-white text-red-600 rounded font-bold text-xs uppercase">Delete</button></div></div><div className="p-3"><h4 className="font-bold text-slate-900 text-xs truncate uppercase">{product.name}</h4><p className="text-[9px] text-slate-400 font-mono">{product.sku || 'No SKU'}</p></div></div>))}</div></div>))}
            {activeTab === 'marketing' && (<div><div className="bg-white border-b border-slate-200 flex overflow-x-auto mb-6 rounded-xl shadow-sm"><button onClick={() => setActiveSubTab('hero')} className={`px-6 py-3 text-xs font-black uppercase ${activeSubTab === 'hero' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>Hero</button><button onClick={() => setActiveSubTab('ads')} className={`px-6 py-3 text-xs font-black uppercase ${activeSubTab === 'ads' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>Ads</button></div>{activeSubTab === 'hero' && (<div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><InputField label="Hero Title" val={localData.hero.title} onChange={(e:any) => handleSilentSave({...localData, hero: {...localData.hero, title: e.target.value}})} /><InputField label="Hero Subtitle" val={localData.hero.subtitle} onChange={(e:any) => handleSilentSave({...localData, hero: {...localData.hero, subtitle: e.target.value}})} /></div><div className="space-y-4"><FileUpload label="Hero BG" currentUrl={localData.hero.backgroundImageUrl} onUpload={(url:string) => handleSilentSave({...localData, hero: {...localData.hero, backgroundImageUrl: url}})} /></div></div>)}</div>)}
            {activeTab === 'pricelists' && (<PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p: any) => handleSilentSave({ ...localData, pricelists: p })} onSaveBrands={(b: any) => handleSilentSave({ ...localData, pricelistBrands: b })} onDeletePricelist={(id: string) => handleSilentSave({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) })} />)}
            {activeTab === 'screensaver' && (<div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6">Slideshow Settings</h3><div className="grid grid-cols-2 gap-6"><InputField label="Idle Delay (Seconds)" val={localData.screensaverSettings?.idleTimeout} onChange={(e:any) => handleSilentSave({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} /><InputField label="Slide Time (Seconds)" val={localData.screensaverSettings?.imageDuration} onChange={(e:any) => handleSilentSave({...localData, screensaverSettings: {...localData.screensaverSettings!, imageDuration: parseInt(e.target.value)}})} /></div></div>)}
            {activeTab === 'guide' && <SystemDocumentation />}
        </main>
        {editingProduct && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-8 flex items-center justify-center animate-fade-in"><ProductEditor product={editingProduct} onSave={(p) => { if (!selectedBrand || !selectedCategory) return; const isNew = !selectedCategory.products.find(x => x.id === p.id); const newProducts = isNew ? [...selectedCategory.products, p] : selectedCategory.products.map(x => x.id === p.id ? p : x); const updatedCat = { ...selectedCategory, products: newProducts }; const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }; handleSilentSave({ ...localData, brands: localData.brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>)}
    </div>
  );
};

export default AdminDashboard;
