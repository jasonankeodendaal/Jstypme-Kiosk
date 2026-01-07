
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, CheckCircle2, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem, ScreensaverAnimationMode } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection, purgeStorageFiles } from '../services/kioskService';
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
            <style>{`
                @keyframes flow-horizontal { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(400%); opacity: 0; } }
                .data-flow { animation: flow-horizontal 3s linear infinite; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.4); opacity: 0; } }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
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
                        <div className="space-y-4"><div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div><h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2><p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk works <strong>offline</strong> first. It only needs internet to "sync up" with your changes.</p></div>
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center"><div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div><div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12"><div className="flex flex-col items-center gap-4 group"><div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110"><Monitor className="text-blue-400" size={40} /></div><div className="text-center"><div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div><div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Updates Sent</div></div></div><div className="flex-1 w-full h-24 relative flex items-center justify-center"><div className="w-full h-1 bg-white/5 rounded-full relative"><div className="absolute inset-0 bg-blue-500/20 blur-md"></div><div className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]"></div></div><div className="absolute -bottom-8 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest">Encrypted Cloud Tunnel</div></div><div className="flex flex-col items-center gap-4 group"><div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1"><Tablet className="text-green-400" size={32} /></div><div className="text-center"><div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div><div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Local Storage Active</div></div></div></div></div>
                    </div>
                )}
                {activeSection === 'inventory' && (
                    <div className="space-y-12 animate-fade-in max-w-5xl">
                        <div className="space-y-4"><div className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 02: Data Structure</div><h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">The Inventory Tree</h2><p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Products exist within a strict hierarchical lineage. This ensures navigation is always logical.</p></div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden p-10 relative"><div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><GitBranch size={200} /></div><div className="flex flex-col gap-8 relative z-10"><div className="flex items-center gap-6"><div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl z-20"><Box size={32}/></div><div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="text-xs font-black uppercase text-slate-400 mb-1">Root Level</div><div className="text-2xl font-black text-slate-900">Brand</div><div className="text-xs text-slate-500 mt-1">Samsung, Apple, Sony...</div></div></div><div className="ml-8 border-l-4 border-slate-100 pl-8 py-4 -my-4 flex flex-col gap-8"><div className="flex items-center gap-6"><div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg z-20"><LayoutGrid size={28}/></div><div className="flex-1 p-4 bg-blue-50 rounded-2xl border border-blue-100"><div className="text-xs font-black uppercase text-blue-400 mb-1">Branch Level</div><div className="text-xl font-black text-blue-900">Category</div><div className="text-xs text-blue-600 mt-1">Smartphones, TVs, Laptops...</div></div></div><div className="ml-8 border-l-4 border-blue-100 pl-8 py-4 -my-4 flex flex-col gap-8"><div className="flex items-center gap-6"><div className="w-12 h-12 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center shadow-sm z-20"><Smartphone size={24}/></div><div className="flex-1 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><div className="text-xs font-black uppercase text-slate-400 mb-1">Leaf Level</div><div className="text-lg font-black text-slate-900">Product</div><div className="text-xs text-slate-500 mt-1">Galaxy S24 Ultra, iPhone 15...</div></div></div></div></div></div></div></div>
                )}
                <div className="h-40"></div>
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
    if (admin) { onLogin(admin); } else { setError('Invalid credentials.'); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
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
      } catch (err) { alert("Upload error"); } 
      finally { setTimeout(() => { setIsProcessing(false); setUploadProgress(0); }, 500); }
    }
  };
  return (
    <div className="mb-4"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">{isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? <div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}</div>
        <label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50' : ''}`}><Upload size={10} className="inline mr-1" /> {isProcessing ? '...' : 'Select'}<input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/></label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>{isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}</div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[], immediate: boolean) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);
    const handleUpdate = (newList: Catalogue[], immediate = false) => { setLocalList(newList); onSave(newList, immediate); };
    const addCatalogue = () => handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }], true);
    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c), immediate);
    return (
        <div className="space-y-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3><button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"><div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">{cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> : <BookOpen size={32} className="text-slate-300" />}{cat.pdfUrl && <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>}</div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col"><input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            {cat.type === 'catalogue' || brandId ? (<div><label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label><input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" /></div>) : (<div className="grid grid-cols-2 gap-2"><div><label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label><input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div><div><label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label><input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div></div>)}
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2"><FileUpload label="Thumbnail (Image)" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url }, true)} /><FileUpload label="Document (PDF)" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url }, true)} /></div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2"><button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete Catalogue</button></div>
                        </div>
                    </div>
                ))}</div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [title, setTitle] = useState(pricelist.title || ''); 
  const [isImporting, setIsImporting] = useState(false);
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: field === 'description' ? val.toUpperCase() : val } : item));
  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => { if (!value) return; const numericPart = value.replace(/[^0-9.]/g, ''); if (!numericPart) { if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`); return; } let num = parseFloat(numericPart); if (num % 1 !== 0) num = Math.ceil(num); if (Math.floor(num) % 10 === 9) num += 1; updateItem(id, field, `R ${num.toLocaleString()}`); };
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setIsImporting(true);
    try {
        const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' }); const worksheet = workbook.Sheets[workbook.SheetNames[0]]; const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) return; const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const sIdx = firstRow.findIndex(h => ['sku', 'code'].some(k => h.includes(k))); const dIdx = firstRow.findIndex(h => ['desc', 'name'].some(k => h.includes(k))); const nIdx = firstRow.findIndex(h => ['normal', 'price'].some(k => h.includes(k))); const pIdx = firstRow.findIndex(h => ['promo', 'special'].some(k => h.includes(k)));
        const dataRows = validRows.slice(1);
        const newImportedItems: PricelistItem[] = dataRows.map(row => {
            const format = (v: any) => { if (!v) return ''; const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? String(v) : `R ${Math.ceil(n).toLocaleString()}`; };
            return { id: generateId('imp'), sku: String(row[sIdx===-1?0:sIdx] || '').trim().toUpperCase(), description: String(row[dIdx===-1?1:dIdx] || '').trim().toUpperCase(), normalPrice: format(row[nIdx===-1?2:nIdx]), promoPrice: row[pIdx===-1?3:pIdx] ? format(row[pIdx===-1?3:pIdx]) : '', imageUrl: '' };
        });
        if (newImportedItems.length > 0) { setItems(newImportedItems); }
    } catch (err) { alert("Error parsing file."); } finally { setIsImporting(false); e.target.value = ''; }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><Table className="text-blue-600" size={24} /><input value={title} onChange={(e) => setTitle(e.target.value)} className="font-black text-slate-900 uppercase text-lg bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full transition-colors placeholder:text-slate-300" placeholder="ENTER LIST TITLE..." /></div><p className="text-xs text-slate-500 font-bold uppercase ml-8">{pricelist.month} {pricelist.year}</p></div><div className="flex flex-wrap gap-2 items-center"><label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">{isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel/CSV<input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleSpreadsheetImport} disabled={isImporting} /></label><button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg"><Plus size={16} /> Add Row</button><button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button></div></div>
        <div className="flex-1 overflow-auto p-6"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 sticky top-0 z-10"><tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200 w-16">Visual</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">Normal Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">Promo Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200 w-10 text-center">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2"><div className="w-12 h-12 relative group/item-img">{item.imageUrl ? <><img src={item.imageUrl} className="w-full h-full object-contain rounded bg-white border border-slate-100" /><button onClick={(e) => { e.stopPropagation(); updateItem(item.id, 'imageUrl', ''); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/item-img:opacity-100 transition-opacity z-10 hover:bg-red-600"><X size={10} /></button></> : <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300"><ImageIcon size={14} /></div>}{!item.imageUrl && <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/item-img:opacity-100 flex items-center justify-center cursor-pointer rounded transition-opacity"><Upload size={12} className="text-white" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const url = await uploadFileToStorage(e.target.files[0]); updateItem(item.id, 'imageUrl', url); } }} /></label>}</div></td>
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm uppercase" placeholder="PRODUCT..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 0" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 0" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              ))}</tbody></table></div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0"><button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => { onSave({ ...pricelist, title, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save Table</button></div>
      </div></div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: { pricelists: Pricelist[], pricelistBrands: PricelistBrand[], onSavePricelists: (p: Pricelist[], immediate?: boolean) => void, onSaveBrands: (b: PricelistBrand[], immediate?: boolean) => void, onDeletePricelist: (id: string) => void }) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const addBrand = () => { const name = prompt("Brand Name:"); if (!name) return; const newBrand: PricelistBrand = { id: generateId('plb'), name, logoUrl: '' }; onSaveBrands([...pricelistBrands, newBrand], true); setSelectedBrand(newBrand); };
    const updateBrand = (id: string, updates: Partial<PricelistBrand>, immediate = false) => onSaveBrands(pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b), immediate);
    const addPricelist = () => { if (!selectedBrand) return; onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: new Date().getFullYear().toString(), dateAdded: new Date().toISOString() }], true); };
    const updatePricelist = (id: string, updates: Partial<Pricelist>, immediate = false) => onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p), immediate);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
             <div className="w-full md:w-72 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0"><div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0"><div><h2 className="font-black text-slate-900 uppercase text-xs">Brands</h2></div><button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button></div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(brand => (<div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div><div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-xs uppercase truncate">{brand.name}</div><div className="text-[10px] text-slate-400 uppercase">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div></div>
                             {selectedBrand?.id === brand.id && (<div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}><input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-xs font-bold p-1 border-b border-slate-200 outline-none bg-transparent" placeholder="Name" /><FileUpload label="Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url }, true)} /></div>)}
                         </div>))}</div></div>
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col shadow-inner"><div className="flex justify-between items-center mb-6 shrink-0"><h3 className="font-black text-slate-700 uppercase text-sm tracking-widest">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 disabled:opacity-50 shrink-0"><Plus size={14} /> Add Pricelist</button></div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start pb-10">{filteredLists.map((item) => (
                         <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 h-fit relative group">
                             <div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Title</label><input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs" /></div>
                             <div className="grid grid-cols-2 gap-2"><div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Month</label><select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Year</label><input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200" /></div></div>
                             <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Mode</label><div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-md border border-slate-200"><button onClick={() => updatePricelist(item.id, { type: 'pdf' }, true)} className={`py-1 text-[9px] font-black uppercase rounded ${item.type !== 'manual' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>PDF</button><button onClick={() => updatePricelist(item.id, { type: 'manual' }, true)} className={`py-1 text-[9px] font-black uppercase rounded ${item.type === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>Table</button></div></div>
                             {item.type === 'manual' ? (<div className="mt-1 space-y-2"><button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2">Edit Table ({item.items?.length || 0})</button><FileUpload label="Thumb" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url }, true)} /></div>) : (<div className="mt-1 grid grid-cols-2 gap-2"><FileUpload label="Thumb" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url }, true)} /><FileUpload label="PDF" currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url }, true)} accept="application/pdf" icon={<FileText />} /></div>)}
                             <button onClick={() => onDeletePricelist(item.id)} className="mt-auto pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                         </div>))}</div></div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl }, true)} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : [], features: Array.isArray(product.features) ? product.features : [], boxContents: Array.isArray(product.boxContents) ? product.boxContents : [], specs: product.specs || {}, videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() });
    const [newFeature, setNewFeature] = useState('');
    const [newBoxItem, setNewBoxItem] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };
    const updateManual = (id: string, updates: Partial<Manual>) => setDraft({ ...draft, manuals: (draft.manuals || []).map(m => m.id === id ? { ...m, ...updates } : m) });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3><button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Video URLs (Multiple)</label><FileUpload label="Add Product Videos" allowMultiple accept="video/*" icon={<Video />} onUpload={(urls: any) => setDraft({...draft, videoUrls: [...(draft.videoUrls || []), ...(Array.isArray(urls)?urls:[urls])]})} /><div className="grid grid-cols-4 gap-2 mt-4">{(draft.videoUrls || []).map((u, i) => (<div key={i} className="aspect-square bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center"><video src={u} className="w-full h-full object-cover opacity-50" muted/><button onClick={() => setDraft({...draft, videoUrls: (draft.videoUrls || []).filter((_, ix)=>ix!==i)})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><Trash2 size={10}/></button></div>))}</div></div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Manuals</label><button onClick={() => setDraft({...draft, manuals: [...(draft.manuals || []), {id: generateId('man'), title: 'New Manual', images: [], pdfUrl: '', thumbnailUrl: ''}]})} className="w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase mb-4">Add Manual Object</button>{(draft.manuals || []).map(man => (<div key={man.id} className="bg-white p-3 rounded-lg border border-slate-200 mb-2 relative group"><button onClick={() => setDraft({...draft, manuals: (draft.manuals || []).filter(m=>m.id!==man.id)})} className="absolute top-2 right-2 text-red-400"><Trash2 size={12}/></button><input value={man.title} onChange={(e) => updateManual(man.id, {title: e.target.value})} className="w-full font-bold text-xs mb-2 border-b border-slate-100 outline-none" /><div className="grid grid-cols-2 gap-2"><FileUpload label="Thumb" currentUrl={man.thumbnailUrl} onUpload={(url:any)=>updateManual(man.id, {thumbnailUrl: url})} /><FileUpload label="PDF" currentUrl={man.pdfUrl} accept="application/pdf" icon={<FileText/>} onUpload={(url:any)=>updateManual(man.id, {pdfUrl: url})} /></div></div>))}</div>
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
  const [activeSubTab, setActiveSubTab] = useState<string>('hero'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [purgingIds, setPurgingIds] = useState<Set<string>>(new Set());

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) { setLocalData(storeData); } }, [storeData, hasUnsavedChanges]);

  // Fix: Implemented missing downloadZip function for system backup
  const downloadZip = useCallback(async (data: StoreData) => {
    try {
      const zip = new JSZip();
      zip.file("kiosk_pro_backup.json", JSON.stringify(data, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kiosk_pro_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate backup zip", err);
    }
  }, []);

  const handleLocalUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) { onUpdateData(newData); setHasUnsavedChanges(false); } 
      else { setHasUnsavedChanges(true); }
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  const addToArchive = (type: ArchivedItem['type'], name: string, data: any, action: ArchivedItem['action'] = 'delete', method: ArchivedItem['method'] = 'admin_panel', isPurging = false) => {
      if (!localData || !currentUser) return;
      const newItem: ArchivedItem = { id: generateId('arch'), type, action, name, userName: currentUser.name, method, data, deletedAt: new Date().toISOString(), isPurging };
      const currentArchive = localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} };
      return { ...currentArchive, deletedItems: [newItem, ...(currentArchive.deletedItems || [])].slice(0, 1000) };
  };

  // ATOMIC PURGE LOGIC
  const purgeFilesAndSync = async (itemType: string, itemName: string, urls: string[], updateLogic: (archive: any) => StoreData) => {
      const purgeId = generateId('purge');
      setPurgingIds(prev => new Set(prev).add(purgeId));
      
      // 1. Initial State: Move to Archive with "Purging" flag
      const initialArchive = addToArchive(itemType as any, itemName, null, 'delete', 'admin_panel', true);
      const stagedData = updateLogic(initialArchive);
      handleLocalUpdate(stagedData, true);

      // 2. Async Purge Storage
      await purgeStorageFiles(urls);

      // 3. Final State: Clear Purging flag in archive
      if (stagedData.archive?.deletedItems) {
        stagedData.archive.deletedItems[0].isPurging = false;
        handleLocalUpdate(stagedData, true);
      }
      
      setPurgingIds(prev => { const next = new Set(prev); next.delete(purgeId); return next; });
  };

  const deleteProduct = (p: Product) => {
      if (!selectedBrand || !selectedCategory || !localData) return;
      if (!confirm(`Permanently purge product "${p.name}" and all associated cloud files?`)) return;
      
      const urls = [p.imageUrl, ...(p.galleryUrls || []), ...(p.videoUrls || []), ...(p.manuals?.map(m=>m.pdfUrl).filter(Boolean) as string[])].filter(Boolean) as string[];
      
      purgeFilesAndSync('product', p.name, urls, (arch) => ({
          ...localData,
          brands: localData.brands.map(b => b.id === selectedBrand.id ? { ...b, categories: b.categories.map(c => c.id === selectedCategory.id ? { ...c, products: c.products.filter(x => x.id !== p.id) } : c) } : b),
          archive: arch
      }));
  };

  const deletePricelist = (id: string) => {
    const pl = localData?.pricelists?.find(p => p.id === id);
    if (!pl || !localData) return;
    if (!confirm(`Delete pricelist "${pl.title}" and cloud storage document?`)) return;

    const urls = [pl.url, pl.thumbnailUrl, ...(pl.items?.map(i => i.imageUrl).filter(Boolean) as string[])].filter(Boolean) as string[];
    
    purgeFilesAndSync('pricelist', pl.title, urls, (arch) => ({
        ...localData,
        pricelists: localData.pricelists?.filter(p => p.id !== id),
        archive: arch
    }));
  };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings } ].filter(tab => currentUser?.permissions[tab.id as keyof AdminPermissions]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        {purgingIds.size > 0 && (
            <div className="fixed top-20 right-6 z-[100] animate-bounce">
                <div className="bg-red-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Purging Cloud Data...</span>
                </div>
            </div>
        )}
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20"><div className="flex items-center justify-between px-4 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div><div className="flex items-center gap-4"><button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button></div><button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg flex items-center gap-2"><LogOut size={16} /></button></div><div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div></header>
        <main className="flex-1 overflow-y-auto p-8 relative pb-40">
            {activeTab === 'inventory' && (!selectedBrand ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{localData.brands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 group flex flex-col items-center"><div className="aspect-square w-full bg-slate-50 flex items-center justify-center mb-4">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-[80%] max-w-[80%] object-contain" /> : <span className="text-4xl text-slate-200 font-black">{brand.name.charAt(0)}</span>}</div><h3 className="font-black uppercase text-sm mb-4">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase">Manage</button></div>))}<button onClick={() => { const n = prompt("Brand:"); if(n) handleLocalUpdate({...localData, brands: [...localData.brands, {id: generateId('b'), name: n, categories: []}]}, true); }} className="bg-slate-200 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"><Plus size={32}/></button></div>
            ) : !selectedCategory ? (
                <div className="animate-fade-in"><div className="flex items-center gap-4 mb-8"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200"><ArrowLeft size={20}/></button><h2 className="text-3xl font-black uppercase">{selectedBrand.name}</h2></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-2xl border border-slate-200 text-left hover:shadow-xl transition-all group relative"><Box size={24} className="mb-4 text-slate-300"/><h3 className="font-black uppercase text-sm">{cat.name}</h3><p className="text-xs text-slate-500 font-bold">{cat.products.length} Products</p></button>))}</div></div>
            ) : (
                <div className="animate-fade-in"><div className="flex items-center justify-between mb-8"><div className="flex items-center gap-4"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200"><ArrowLeft size={20}/></button><h2 className="text-3xl font-black uppercase">{selectedCategory.name}</h2></div><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2"><Plus size={16} /> Add Product</button></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{selectedCategory.products.map(p => (<div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"><button onClick={() => setEditingProduct(p)} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-black uppercase text-xs shadow-xl">Edit</button><button onClick={() => deleteProduct(p)} className="bg-red-500 text-white px-6 py-2 rounded-lg font-black uppercase text-xs shadow-xl">Purge</button></div></div><div className="p-4"><h4 className="font-black text-slate-900 text-xs truncate uppercase mb-1">{p.name}</h4><div className="text-[10px] font-mono text-slate-400 uppercase">{p.sku || 'No SKU'}</div></div></div>))}</div></div>
            ))}
            {activeTab === 'pricelists' && (<PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p, imm) => handleLocalUpdate({ ...localData, pricelists: p }, imm)} onSaveBrands={(b, imm) => handleLocalUpdate({ ...localData, pricelistBrands: b }, imm)} onDeletePricelist={deletePricelist} />)}
            {activeTab === 'screensaver' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"><h3 className="font-black uppercase text-sm mb-8 flex items-center gap-3 text-blue-600"><Monitor size={20}/> Hardware & Timing</h3><div className="grid grid-cols-2 gap-6 mb-8"><InputField label="Idle Trigger (sec)" val={localData.screensaverSettings?.idleTimeout||60} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} /><InputField label="Slide Duration (sec)" val={localData.screensaverSettings?.imageDuration||8} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, imageDuration: parseInt(e.target.value)}})} /></div><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><div className="flex justify-between items-center mb-6"><label className="text-[10px] font-black uppercase text-slate-500">Sleep Schedule</label><button onClick={()=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, enableSleepMode: !localData.screensaverSettings?.enableSleepMode}}, true)} className={`w-12 h-6 rounded-full transition-all relative ${localData.screensaverSettings?.enableSleepMode?'bg-green-500':'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.enableSleepMode?'left-7':'left-1'}`}></div></button></div><div className={`grid grid-cols-2 gap-4 ${localData.screensaverSettings?.enableSleepMode?'opacity-100':'opacity-30 pointer-events-none'}`}><div><label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Start Hour</label><input type="time" value={localData.screensaverSettings?.activeHoursStart||'08:00'} onChange={(e)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursStart: e.target.value}})} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold" /></div><div><label className="block text-[8px] font-black uppercase text-slate-400 mb-1">End Hour</label><input type="time" value={localData.screensaverSettings?.activeHoursEnd||'20:00'} onChange={(e)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursEnd: e.target.value}})} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold" /></div></div></div></div><div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"><h3 className="font-black uppercase text-sm mb-8 flex items-center gap-3 text-purple-600"><Sparkles size={20}/> Cinematic Engine</h3><div className="space-y-4 mb-8"><div><label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Primary Animation Mode</label><select value={localData.screensaverSettings?.animationMode||'random-mix'} onChange={(e)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, animationMode: e.target.value as ScreensaverAnimationMode}})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs uppercase"><option value="static-contain">Static (Contain)</option><option value="static-fill">Static (Fill)</option><option value="ken-burns">Ken Burns (Zoom)</option><option value="cinematic-pan">Cinematic Pan</option><option value="floating-drift">Floating Drift</option><option value="gentle-pulse">Gentle Pulse</option><option value="random-mix">Randomized Mix</option></select></div></div><div className="space-y-3">{[{k:'showProductImages',l:'Show Product Images'},{k:'showProductVideos',l:'Show Product Videos'},{k:'muteVideos',l:'Mute Playback'},{k:'showInfoOverlay',l:'Info Overlays'}].map(opt=>(<div key={opt.k} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100"><label className="text-xs font-black uppercase text-slate-700">{opt.l}</label><button onClick={()=>handleLocalUpdate({...localData, screensaverSettings:{...localData.screensaverSettings!,[opt.k]:!(localData.screensaverSettings as any)[opt.k]}}, true)} className={`w-10 h-5 rounded-full transition-all relative ${(localData.screensaverSettings as any)[opt.k]?'bg-blue-600':'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${(localData.screensaverSettings as any)[opt.k]?'left-6':'left-1'}`}></div></button></div>))}</div></div></div></div>
            )}
            {activeTab === 'history' && (
               <div className="max-w-7xl mx-auto space-y-6"><div><h2 className="text-3xl font-black uppercase">Audit Logs</h2><p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Full Kiosk Event History</p></div><div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl min-h-[600px] flex flex-col"><div className="flex-1 overflow-y-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-50">
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">Status</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">Action & Item</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">User</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">Timestamp</th>
               </tr></thead><tbody className="divide-y divide-slate-50">{(localData.archive?.deletedItems || []).map(item => (<tr key={item.id} className="hover:bg-slate-50 transition-colors"><td className="px-8 py-4">{item.isPurging ? <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase animate-pulse"><Database size={14}/> Purging...</div> : <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase"><CheckCircle2 size={14}/> Clean</div>}</td><td className="px-8 py-4"><div className="font-black uppercase text-xs">{item.action} {item.type}: {item.name}</div></td><td className="px-8 py-4"><div className="text-xs font-bold text-slate-600">{item.userName}</div></td><td className="px-8 py-4"><div className="text-xs text-slate-400 font-mono">{new Date(item.deletedAt).toLocaleString()}</div></td></tr>))}</tbody></table></div></div></div>
            )}
            {activeTab === 'settings' && (<div className="max-w-4xl mx-auto space-y-8 animate-fade-in"><div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500 pointer-events-none"><Database size={120} /></div><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Database size={20} className="text-blue-500"/> System Data & Backup</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"><div className="space-y-4"><div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs"><strong>Snapshot-First Architecture:</strong> Exporting will pack your entire database into a JSON bundle.<div className="mt-2 text-blue-600 font-bold">Recommended for periodic off-site backups.</div></div><button onClick={()=>downloadZip(localData)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg"><Download size={16} /> Download Full System Backup (.zip)</button></div></div></div></div>)}
        </main>
        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-8 flex items-center justify-center animate-fade-in"><ProductEditor product={editingProduct} onSave={(p) => { const isNew = !selectedCategory?.products.find(x => x.id === p.id); const newProducts = isNew ? [...selectedCategory!.products, p] : selectedCategory!.products.map(x => x.id === p.id ? p : x); handleLocalUpdate({ ...localData, brands: localData.brands.map(b => b.id === selectedBrand!.id ? { ...b, categories: b.categories.map(c => c.id === selectedCategory!.id ? { ...c, products: newProducts } : c) } : b), archive: addToArchive('product', p.name, p, isNew ? 'create' : 'update') }, true); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
    </div>
  );
};

export default AdminDashboard;
