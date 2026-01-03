import React, { useState, useEffect, useRef, useMemo } from 'react';
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

            {/* Enhanced Sidebar */}
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
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p>
                        </div>
                    </div>
                )}
                {/* ... other sections ... */}
            </div>
        </div>
    );
};

// Updated Auth Component with persistence
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
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) { localStorage.setItem('kiosk_admin_session', JSON.stringify(admin)); onLogin(admin); }
    else { setError('Invalid credentials.'); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
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
      setIsProcessing(true);
      setUploadProgress(10); 
      const files = Array.from(e.target.files) as File[];
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';
      const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(file); });
      const uploadSingle = async (file: File) => {
           const localBase64 = await readFileAsBase64(file);
           try { const url = await uploadFileToStorage(file); return { url, base64: localBase64 }; } 
           catch (e) { return { url: localBase64, base64: localBase64 }; }
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
           {isProcessing ? ( <Loader2 className="animate-spin text-blue-500" /> ) : currentUrl && !allowMultiple ? (
               accept.includes('video') ? <Video className="text-blue-500" size={16} /> : 
               accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : 
               accept.includes('audio') ? ( <div className="flex items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div> ) : 
               <img src={currentUrl} className="w-full h-full object-contain" />
           ) : React.cloneElement(icon, { size: 16 })}
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
    const addCatalogue = () => { handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }]); };
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => { handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c)); };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? ( <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> ) : ( <BookOpen size={32} className="text-slate-300" /> )}
                            {cat.pdfUrl && ( <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div> )}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <FileUpload label="Thumbnail (Image)" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} />
                                <FileUpload label="Document (PDF)" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} />
                            </div>
                            <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [isImporting, setIsImporting] = useState(false);
  const addItem = () => { setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]); };
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => { const finalVal = field === 'description' ? val.toUpperCase() : val; setItems(items.map(item => item.id === id ? { ...item, [field]: finalVal } : item)); };
  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value) return;
    const numericPart = value.replace(/[^0-9.]/g, '');
    if (!numericPart) { if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`); return; }
    let num = parseFloat(numericPart);
    if (num % 1 !== 0) num = Math.ceil(num);
    if (Math.floor(num) % 10 === 9) num += 1;
    updateItem(id, field, `R ${num.toLocaleString()}`);
  };
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setIsImporting(true);
    try {
        const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) { alert("Empty file."); return; }
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const findIdx = (keywords: string[]) => firstRow.findIndex(h => keywords.some(k => h.includes(k)));
        const sIdx = Math.max(0, findIdx(['sku', 'code', 'part'])); const dIdx = Math.max(1, findIdx(['desc', 'name', 'product']));
        const nIdx = Math.max(2, findIdx(['normal', 'retail', 'price'])); const pIdx = Math.max(3, findIdx(['promo', 'special', 'sale']));
        const newImportedItems: PricelistItem[] = validRows.slice(1).map(row => {
            const formatImported = (val: string) => { if (!val) return ''; const n = parseFloat(String(val).replace(/[^0-9.]/g, '')); if (isNaN(n)) return String(val); let final = n; if (final % 1 !== 0) final = Math.ceil(final); if (Math.floor(final) % 10 === 9) final += 1; return `R ${final.toLocaleString()}`; };
            return { id: generateId('imp'), sku: String(row[sIdx] || '').trim().toUpperCase(), description: String(row[dIdx] || '').trim().toUpperCase(), normalPrice: formatImported(row[nIdx]), promoPrice: row[pIdx] ? formatImported(row[pIdx]) : '', imageUrl: '' };
        });
        setItems([...items, ...newImportedItems]);
    } catch (err) { alert("Error parsing file."); } finally { setIsImporting(false); e.target.value = ''; }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2"><Table className="text-blue-600" size={24} /> Pricelist Builder</h3>
          <div className="flex flex-wrap gap-2">
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">{isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel<input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSpreadsheetImport} /></label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">SKU</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">Description</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">Normal Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200">Promo Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase border-b border-slate-200 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" placeholder="SKU" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm uppercase" placeholder="PRODUCT" /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm" placeholder="R 0" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm text-red-600" placeholder="R 0" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg">Save Pricelist</button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const addBrand = () => { const name = prompt("Brand Name:"); if (name) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name, logoUrl: '' }]); };
    const addPricelist = () => { if (!selectedBrand) return; onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: new Date().getFullYear().toString(), dateAdded: new Date().toISOString() }]); };
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => onSavePricelists(pricelists.map((p: any) => p.id === id ? { ...p, ...updates } : p));
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-140px)]">
             <div className="w-full md:w-72 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto shrink-0 space-y-2 shadow-sm">
                 <div className="flex justify-between items-center mb-4"><h2 className="font-black text-slate-900 uppercase text-xs">Pricelist Brands</h2><button onClick={addBrand} className="text-blue-600"><Plus size={18}/></button></div>
                 {sortedBrands.map(brand => (
                    <button key={brand.id} onClick={() => setSelectedBrand(brand)} className={`w-full text-left p-3 rounded-xl border text-xs font-bold uppercase ${selectedBrand?.id === brand.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white'}`}>{brand.name}</button>
                 ))}
             </div>
             <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col shadow-inner overflow-y-auto">
                 <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-900 uppercase text-sm tracking-wider">{selectedBrand?.name || 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-lg disabled:opacity-50"><Plus size={16}/> Add List</button></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredLists.map((item: any) => (
                         <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group transition-all hover:shadow-md">
                             <input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-transparent focus:border-blue-500 outline-none pb-1 text-sm bg-transparent" placeholder="Pricelist Title" />
                             <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => updatePricelist(item.id, { type: 'pdf' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${item.type !== 'manual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>PDF</button>
                                <button onClick={() => updatePricelist(item.id, { type: 'manual' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded ${item.type === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>TABLE</button>
                             </div>
                             {item.type === 'manual' ? (
                                <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase">Open Builder ({item.items?.length || 0})</button>
                             ) : (
                                <FileUpload label="PDF Document" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url })} />
                             )}
                             <button onClick={() => onDeletePricelist(item.id)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
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
    const [newFeature, setNewFeature] = useState('');
    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New'}</h3>
                <button onClick={onCancel}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                    </div>
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Features</label>
                             <div className="flex gap-2 mb-2"><input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add..." /><button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button></div>
                             <ul className="space-y-1">{draft.features.map((f, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold">{f}<button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0">
                <button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button>
                <button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Save Changes</button>
            </div>
        </div>
    );
};

// ... other modals ...
const KioskEditorModal = ({ kiosk, onSave, onClose }: any) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-black text-slate-900 uppercase">Edit Device</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-6 space-y-4">
                    <InputField label="Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} />
                    <InputField label="Zone" val={draft.assignedZone || ''} onChange={(e:any) => setDraft({...draft, assignedZone: e.target.value})} />
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save</button></div>
            </div>
        </div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: { model: TVModel, onSave: (m: TVModel) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><h3 className="font-black text-slate-900 uppercase">Edit TV Model: {draft.name}</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Model Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <FileUpload label="Cover Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <FileUpload label="Upload Videos" accept="video/*" allowMultiple icon={<Video />} currentUrl="" onUpload={(urls: any) => { const newUrls = Array.isArray(urls) ? urls : [urls]; setDraft(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ...newUrls] })); }} />
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {draft.videoUrls.map((url, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 group">
                                    <div className="w-16 h-10 bg-slate-900 rounded flex items-center justify-center shrink-0 text-white opacity-50"><Video size={16} /></div>
                                    <div className="flex-1 overflow-hidden font-mono text-[10px] truncate">{url.split('/').pop()}</div>
                                    <button onClick={() => setDraft({ ...draft, videoUrls: draft.videoUrls.filter((_, i) => i !== idx) })} className="p-1.5 text-red-500"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Model</button></div>
            </div>
        </div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true });
    const resetForm = () => { setEditingId(null); setNewName(''); setNewPin(''); };
    const handleAddOrUpdate = () => { if (!newName || !newPin) return alert("Required"); let updatedList = [...admins]; if (editingId) updatedList = updatedList.map(a => a.id === editingId ? { ...a, name: newName, pin: newPin, permissions: newPermissions } : a); else updatedList.push({ id: generateId('adm'), name: newName, pin: newPin, isSuperAdmin: false, permissions: newPermissions }); onUpdate(updatedList); resetForm(); };
    const startEdit = (admin: AdminUser) => { setEditingId(admin.id); setNewName(admin.name); setNewPin(admin.pin); setNewPermissions(admin.permissions); };
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <InputField label="Name" val={newName} onChange={(e:any)=>setNewName(e.target.value)} />
                <InputField label="4-Digit PIN" val={newPin} onChange={(e:any)=>setNewPin(e.target.value)} />
                <button onClick={handleAddOrUpdate} className="md:col-span-2 bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">{editingId ? 'Update Admin' : 'Add Admin'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {admins.map(admin => (
                    <div key={admin.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${admin.isSuperAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}><User size={16}/></div><div><div className="font-bold text-slate-900 text-sm">{admin.name}</div><div className="text-[10px] text-slate-400 font-mono">PIN: {admin.pin}</div></div></div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEdit(admin)} className="p-1.5 text-blue-500"><Edit2 size={14}/></button><button onClick={() => onUpdate(admins.filter(a => a.id !== admin.id))} className="p-1.5 text-red-500"><Trash2 size={14}/></button></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip(); const loadedZip = await zip.loadAsync(file); const newBrands: Record<string, Brand> = {};
    const validFiles = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir && !path.includes('__MACOSX') && !path.includes('.DS_Store'));
    const processAsset = async (zipObj: any) => { const blob = await zipObj.async("blob"); if (supabase) { try { const url = await uploadFileToStorage(new File([blob], `import_${Date.now()}_img`, { type: 'image/jpeg' })); return url; } catch (e) {} } return new Promise(resolve => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(blob); }); };
    let processedCount = 0;
    for (const rawPath of Object.keys(loadedZip.files)) {
        const fileObj = loadedZip.files[rawPath]; if (fileObj.dir || rawPath.includes('__MACOSX')) continue;
        const parts = rawPath.split('/').filter(p => p.trim() !== ''); if (parts.length < 2) continue;
        processedCount++; if (onProgress && processedCount % 5 === 0) onProgress(`Sifting: ${processedCount}/${validFiles.length}...`);
        const bName = parts[0]; if (!newBrands[bName]) newBrands[bName] = { id: generateId('brand'), name: bName, categories: [] };
        if (parts.length === 2 && parts[1].toLowerCase().includes('logo')) { newBrands[bName].logoUrl = await processAsset(fileObj) as string; continue; }
        if (parts.length < 4) continue;
        const cName = parts[1]; const pName = parts[2]; const fName = parts[3].toLowerCase();
        let cat = newBrands[bName].categories.find(c => c.name === cName);
        if (!cat) { cat = { id: generateId('c'), name: cName, icon: 'Box', products: [] }; newBrands[bName].categories.push(cat); }
        let prod = cat.products.find(p => p.name === pName);
        if (!prod) { prod = { id: generateId('p'), name: pName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '', galleryUrls: [], videoUrls: [], manuals: [], dateAdded: new Date().toISOString() }; cat.products.push(prod); }
        if (fName.endsWith('.json')) { try { const meta = JSON.parse(await fileObj.async("text")); Object.assign(prod, meta); } catch(e) {} }
        else if (['jpg', 'jpeg', 'png', 'webp'].some(ext => fName.endsWith(ext))) { const url = await processAsset(fileObj) as string; if (fName.includes('cover') || !prod.imageUrl) prod.imageUrl = url; else prod.galleryUrls?.push(url); }
        else if (['mp4', 'webm'].some(ext => fName.endsWith(ext))) { prod.videoUrls?.push(await processAsset(fileObj) as string); }
    }
    return Object.values(newBrands);
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return; const zip = new JSZip(); zip.file("store_config.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(content);
    const link = document.createElement("a"); link.href = url; link.download = `kiosk_backup_${Date.now()}.zip`; link.click();
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('brands'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedTVBrand, setSelectedTVBrand] = useState<TVBrand | null>(null);
  const [editingTVModel, setEditingTVModel] = useState<TVModel | null>(null);
  const [historyTab, setHistoryTab] = useState<'all' | 'delete' | 'restore'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [exportProcessing, setExportProcessing] = useState(false);

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

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); if (selectedBrand) { const b = newData.brands.find(x=>x.id===selectedBrand.id); if(b) setSelectedBrand(b); if(selectedCategory) { const c = b?.categories.find(x=>x.id===selectedCategory.id); if(c) setSelectedCategory(c); } } if(selectedTVBrand && newData.tv) { const tvb = newData.tv.brands.find(x=>x.id===selectedTVBrand.id); if(tvb) setSelectedTVBrand(tvb); } };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };
  const addToArchive = (type: ArchivedItem['type'], name: string, data: any, action: ArchivedItem['action'] = 'delete') => { if (!localData || !currentUser) return; const newItem: ArchivedItem = { id: generateId('arch'), type, action, name, userName: currentUser.name, method: 'admin_panel', data, deletedAt: new Date().toISOString() }; return { ...localData.archive!, deletedItems: [newItem, ...(localData.archive?.deletedItems || [])].slice(0, 500) }; };
  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;
  const logout = () => { localStorage.removeItem('kiosk_admin_session'); setCurrentUser(null); };

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
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                       <button onClick={() => { const name = prompt("Brand:"); if(name) handleLocalUpdate({...localData, brands: [...localData.brands, {id: generateId('b'), name, categories: []}], archive: addToArchive('brand', name, null, 'create')}); }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all aspect-square"><Plus size={32} /><span className="font-bold uppercase text-xs mt-2">Add Brand</span></button>
                       {localData.brands.sort((a,b)=>a.name.localeCompare(b.name)).map(brand => (
                           <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg group relative flex flex-col">
                               <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 aspect-square relative">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}<button onClick={(e) => { e.stopPropagation(); if(confirm("Archive?")) handleLocalUpdate({...localData, brands: localData.brands.filter(b=>b.id!==brand.id), archive: addToArchive('brand', brand.name, brand, 'delete')}); }} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button></div>
                               <div className="p-4 border-t border-slate-100"><h3 className="font-black text-slate-900 text-sm uppercase truncate mb-3">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button></div>
                           </div>
                       ))}
                   </div>
                ) : !selectedCategory ? (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-8"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2><FileUpload label="Brand Logo" currentUrl={selectedBrand.logoUrl} onUpload={(url:any)=>handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, logoUrl: url}:b)})} /></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><button onClick={()=>{const n=prompt("Category:");if(n) handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, categories: [...b.categories, {id:generateId('c'), name:n, icon:'Box', products:[]}]}:b)});}} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-10 aspect-square text-slate-400 hover:text-blue-500"><Plus size={32}/><span className="font-bold uppercase text-xs mt-2">New Category</span></button>{selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md text-left flex flex-col justify-center aspect-square relative group"><Box size={24} className="mb-4 text-slate-400" /><h3 className="font-black text-slate-900 uppercase text-sm truncate w-full">{cat.name}</h3><p className="text-xs text-slate-500 font-bold">{cat.products.length} Products</p><div onClick={(e)=>{e.stopPropagation(); if(confirm("Delete?")) handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, categories: b.categories.filter(c=>c.id!==cat.id)}:b)});}} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={14}/></div></button>))}</div></div>
                ) : (
                   <div className="animate-fade-in"><div className="flex items-center gap-4 mb-8"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1 truncate">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs">Add Product</button></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{selectedCategory.products.map(p => (<div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-200" />}<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"><button onClick={() => setEditingProduct(p)} className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase">Edit</button><button onClick={() => { if(confirm("Delete?")) handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, categories: b.categories.map(c=>c.id===selectedCategory.id?{...c, products: c.products.filter(x=>x.id!==p.id)}:c)}:b)}); }} className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase">Delete</button></div></div><div className="p-4 border-t border-slate-100"><h4 className="font-bold text-slate-900 text-xs truncate uppercase">{p.name}</h4><p className="text-[9px] font-mono text-slate-400 mt-1">{p.sku || 'NO SKU'}</p></div></div>))}</div></div>
                )
            )}

            {activeTab === 'pricelists' && ( <PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p:any) => handleLocalUpdate({ ...localData, pricelists: p })} onSaveBrands={(b:any) => handleLocalUpdate({ ...localData, pricelistBrands: b })} onDeletePricelist={(id:string) => handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) })} /> )}

            {activeTab === 'tv' && (
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-32">
                    {/* Header with Visual Status */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                         <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Film className="text-white" size={24}/></div>
                                 <div>
                                     <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Cinematic Channels</h2>
                                     <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">High-Definition Video Distribution</p>
                                 </div>
                             </div>
                             <div className="flex flex-wrap gap-4">
                                 <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                     <div className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Network Load</div>
                                     <div className="text-sm font-black text-green-400">OPTIMIZED</div>
                                 </div>
                                 <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                     <div className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Active Streams</div>
                                     <div className="text-sm font-black text-blue-400">{localData.tv?.brands.reduce((acc, b) => acc + b.models.length, 0)} MODELS</div>
                                 </div>
                             </div>
                         </div>
                         <div className="relative z-10 shrink-0">
                            {/* Mock Player Preview */}
                            <div className="w-64 aspect-video bg-black rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={48} className="text-white/20 group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {!selectedTVBrand ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <Layers size={18} className="text-slate-400" /> Manufacturer Channels
                                </h3>
                                <button onClick={() => { const name = prompt("Brand:"); if(name) handleLocalUpdate({...localData, tv: { ...localData.tv, brands: [...(localData.tv?.brands || []), {id:generateId('tvb'), name, models: []}] } as TVConfig}); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:bg-blue-500 transition-all"><Plus size={16}/> Add Brand Channel</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {localData.tv?.brands.sort((a,b)=>a.name.localeCompare(b.name)).map(brand => (
                                    <div key={brand.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer relative" onClick={() => setSelectedTVBrand(brand)}>
                                        <div className="aspect-square bg-slate-50 flex items-center justify-center p-8 relative">
                                            {brand.logoUrl ? <img src={brand.logoUrl} className="max-w-full max-h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500" /> : <Tv size={48} className="text-slate-200" />}
                                            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors"></div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between border-t border-slate-100">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm uppercase truncate group-hover:text-blue-600 transition-colors">{brand.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{brand.models?.length || 0} Model Folders</p>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Channel Active</span>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); if(confirm("Delete Channel?")) handleLocalUpdate({...localData, tv: { ...localData.tv, brands: localData.tv!.brands.filter(b=>b.id!==brand.id) } as TVConfig}); }} className="absolute top-4 right-4 p-2 bg-white text-red-400 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all border border-slate-100"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {localData.tv?.brands.length === 0 && (
                                    <div className="col-span-full py-20 text-center flex flex-col items-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400">
                                        <Tv size={48} className="mb-4 opacity-20" />
                                        <p className="font-black uppercase text-xs tracking-widest">No Brand Channels configured</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                             <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-slate-200">
                                <button onClick={() => setSelectedTVBrand(null)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"><ArrowLeft size={24}/></button>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedTVBrand.name} <span className="text-blue-500">Channel</span></h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Managing specific hardware video models</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <button onClick={() => setEditingTVModel({ id: generateId('tvm'), name: '', videoUrls: [] })} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"><Plus size={18}/> New Model Group</button>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                 <div className="lg:col-span-4 space-y-6">
                                     <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                                         <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2"><ImageIcon size={16} className="text-blue-500" /> Channel Assets</h4>
                                         <InputField label="Display Name" val={selectedTVBrand.name} onChange={(e:any)=>handleLocalUpdate({...localData, tv: {...localData.tv, brands: localData.tv!.brands.map(b=>b.id===selectedTVBrand.id?{...b, name:e.target.value}:b)} as TVConfig})} />
                                         <FileUpload label="Channel Icon" currentUrl={selectedTVBrand.logoUrl} onUpload={(url:any)=>handleLocalUpdate({...localData, tv: {...localData.tv, brands: localData.tv!.brands.map(b=>b.id===selectedTVBrand.id?{...b, logoUrl:url}:b)} as TVConfig})} />
                                     </div>
                                 </div>
                                 <div className="lg:col-span-8 space-y-6">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                         {(selectedTVBrand.models || []).map(model => (
                                             <div key={model.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col group transition-all hover:shadow-xl">
                                                 <div className="p-6 flex items-center gap-4">
                                                     <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 relative overflow-hidden group/thumb">
                                                         {model.imageUrl ? <img src={model.imageUrl} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform" /> : <PlaySquare size={24} className="text-slate-700" />}
                                                         <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity"></div>
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                         <h4 className="font-black text-slate-900 text-base uppercase leading-tight truncate">{model.name}</h4>
                                                         <div className="flex items-center gap-2 mt-1">
                                                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{model.videoUrls?.length || 0} Loops</span>
                                                             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                             <span className="text-[9px] font-bold text-slate-400 uppercase">H.264 Ready</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <div className="mt-auto flex border-t border-slate-100 divide-x divide-slate-100">
                                                     <button onClick={() => setEditingTVModel(model)} className="flex-1 py-4 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                                                         <Video size={14} /> Open Editor
                                                     </button>
                                                     <button onClick={() => { if(confirm("Delete model?")) handleLocalUpdate({...localData, tv: {...localData.tv, brands: localData.tv!.brands.map(b=>b.id===selectedTVBrand.id?{...b, models: b.models.filter(m=>m.id!==model.id)}:b)} as TVConfig}); }} className="px-5 py-4 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                                         <Trash2 size={16} />
                                                     </button>
                                                 </div>
                                             </div>
                                         ))}
                                         {(selectedTVBrand.models || []).length === 0 && (
                                             <div className="col-span-full py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
                                                 <Layout size={32} className="mb-3 opacity-30" />
                                                 <p className="text-[10px] font-black uppercase tracking-widest">Create model folders to start uploading loops</p>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'screensaver' && (
                <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500"><Clock size={100}/></div>
                             <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-8 border-b border-slate-100 pb-4">Timing Engine</h3>
                             <div className="grid grid-cols-2 gap-6"><InputField label="Idle Trigger (sec)" val={localData.screensaverSettings?.idleTimeout} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings:{...localData.screensaverSettings!, idleTimeout:parseInt(e.target.value)}})} /><InputField label="Slide Duration (sec)" val={localData.screensaverSettings?.imageDuration} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings:{...localData.screensaverSettings!, imageDuration:parseInt(e.target.value)}})} /></div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                             <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-8 border-b border-slate-100 pb-4">Display Rules</h3>
                             <div className="space-y-4">
                                {[{k:'showProductImages', l:'Products'}, {k:'showProductVideos', l:'Videos'}, {k:'showPamphlets', l:'Pamphlets'}, {k:'showCustomAds', l:'Global Ads'}, {k:'muteVideos', l:'Mute Audio'}].map(opt=>(
                                    <div key={opt.k} className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-slate-500">{opt.l}</label><button onClick={()=>handleLocalUpdate({...localData, screensaverSettings:{...localData.screensaverSettings!, [opt.k]:!(localData.screensaverSettings as any)[opt.k]}})} className={`w-12 h-6 rounded-full relative transition-colors ${ (localData.screensaverSettings as any)[opt.k] ? 'bg-blue-600':'bg-slate-300' }`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${ (localData.screensaverSettings as any)[opt.k] ? 'left-7':'left-1' }`}></div></button></div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'marketing' && (
                <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in">
                    {activeSubTab === 'catalogues' && ( <CatalogueManager catalogues={(localData.catalogues || []).filter(c => !c.brandId)} onSave={(c) => { const brandCatalogues = (localData.catalogues || []).filter(c => c.brandId); handleLocalUpdate({ ...localData, catalogues: [...brandCatalogues, ...c] }); }} /> )}
                    {activeSubTab === 'hero' && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6"><InputField label="Hero Title" val={localData.hero.title} onChange={(e:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, title: e.target.value}})} /><InputField label="Subtitle" val={localData.hero.subtitle} onChange={(e:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, subtitle: e.target.value}})} /><InputField label="Website Link" val={localData.hero.websiteUrl} onChange={(e:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, websiteUrl: e.target.value}})} /></div>
                            <div className="space-y-6"><FileUpload label="Hero Background" currentUrl={localData.hero.backgroundImageUrl} onUpload={(url:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, backgroundImageUrl:url}})} /><FileUpload label="Main Logo" currentUrl={localData.hero.logoUrl} onUpload={(url:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, logoUrl:url}})} /></div>
                        </div>
                    )}
                    {activeSubTab === 'ads' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['homeBottomLeft', 'homeBottomRight', 'screensaver'].map(zone => (
                                <div key={zone} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                    <h4 className="font-black uppercase text-xs mb-4">{zone.replace('home', '')} Media</h4>
                                    <FileUpload label="Add Assets" accept="image/*,video/*" allowMultiple onUpload={(urls:any, type:any)=>{ const na = (Array.isArray(urls)?urls:[urls]).map(u=>({id:generateId('ad'), type, url:u, dateAdded: new Date().toISOString()})); handleLocalUpdate({...localData, ads: {...localData.ads, [zone]: [...((localData.ads as any)[zone] || []), ...na]} as any }); }} />
                                    <div className="grid grid-cols-3 gap-3 mt-6">
                                        {((localData.ads as any)[zone] || []).map((ad:any, i:number)=>(<div key={ad.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100">{ad.type === 'video' ? <video src={ad.url} className="w-full h-full object-cover opacity-50" />:<img src={ad.url} className="w-full h-full object-cover" />}<button onClick={()=>{ const cur=(localData.ads as any)[zone]; handleLocalUpdate({...localData, ads: {...localData.ads, [zone]: cur.filter((_:any,idx:number)=>idx!==i)} as any}); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={8}/></button></div>))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                    <div className="mt-auto flex p-3 gap-2 bg-black/40"><button onClick={()=>setEditingKiosk(kiosk)} className="flex-1 bg-slate-900 text-slate-400 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border border-slate-800 flex items-center justify-center gap-2"><Edit2 size={12}/> Config</button><button onClick={async ()=>{if(confirm("Remote Reset?")) await supabase.from('kiosks').update({restart_requested:true}).eq('id', kiosk.id);}} className="flex-1 bg-slate-900 text-orange-500 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-orange-600 transition-all border border-slate-800 flex items-center justify-center gap-2"><Power size={12}/> Reset</button></div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="max-w-7xl mx-auto space-y-6 pb-32 animate-fade-in">
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm min-h-[600px] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                             <div><h3 className="font-black text-slate-900 uppercase text-lg">System Audit Log</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">History of administrative events</p></div>
                             <button onClick={()=>{if(confirm("Permanently wipe?")) handleLocalUpdate({...localData, archive: { brands:[], products:[], catalogues:[], deletedItems:[], deletedAt:{} }});}} className="text-red-500 font-black uppercase text-[10px] bg-red-50 px-4 py-2 rounded-xl">Clear All Logs</button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0"><tr className="border-b border-slate-100"><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th></tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(localData.archive?.deletedItems || []).map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${item.action === 'delete' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{item.action}</span></td>
                                            <td className="px-8 py-5 font-black text-slate-900 text-xs uppercase">{item.name} <span className="text-[9px] text-slate-400 ml-2">({item.type})</span></td>
                                            <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase">{item.userName}</td>
                                            <td className="px-8 py-5 text-[10px] font-mono text-slate-400">{new Date(item.deletedAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-3xl mx-auto space-y-8 pb-32 animate-fade-in">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                        <div className="border-b border-slate-100 pb-4"><h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Identity & Security</h3></div>
                        <FileUpload label="Company Logo" currentUrl={localData.companyLogoUrl} onUpload={(url:string)=>handleLocalUpdate({...localData, companyLogoUrl:url})} />
                        <InputField label="Global Device Setup PIN" val={localData.systemSettings?.setupPin || '0000'} onChange={(e:any)=>handleLocalUpdate({...localData, systemSettings:{...localData.systemSettings, setupPin:e.target.value}})} />
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Database size={100} className="text-blue-500"/></div>
                        <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6">Data Redundancy</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => downloadZip(localData)} className="bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-2"><Download size={16}/> Export Full Backup</button>
                            <label className="bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-[10px] cursor-pointer flex items-center justify-center gap-2 border border-white/5"><Upload size={16}/> Bulk Import ZIP<input type="file" accept=".zip" className="hidden" onChange={async (e)=>{if(e.target.files?.[0]){ const nb = await importZip(e.target.files[0]); handleLocalUpdate({...localData, brands: [...localData.brands, ...nb]}); }}}/></label>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm"><AdminManager admins={localData.admins || []} onUpdate={(a:any)=>handleLocalUpdate({...localData, admins: a})} currentUser={currentUser} /></div>
                    <button onClick={async ()=>{if(confirm("WIPE EVERYTHING?")) {const d=await resetStoreData(); setLocalData(d); window.location.reload();}}} className="w-full py-4 bg-red-50 text-red-500 font-black uppercase text-xs rounded-2xl border-2 border-red-100 hover:bg-red-500 hover:text-white transition-all">Factory Data Reset</button>
                </div>
            )}
        </main>

        {editingProduct && ( <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in"><ProductEditor product={editingProduct} onSave={(p) => { if (!selectedBrand || !selectedCategory) return; const cur=selectedCategory.products.find(x=>x.id===p.id); const nl = cur ? selectedCategory.products.map(x=>x.id===p.id?p:x) : [...selectedCategory.products, p]; handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, categories: b.categories.map(c=>c.id===selectedCategory.id?{...c, products: nl}:c)}:b)}); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div> )}
        {editingKiosk && ( <KioskEditorModal kiosk={editingKiosk} onSave={async (k:any)=>{ if(supabase) { await supabase.from('kiosks').upsert({id:k.id, name:k.name, device_type:k.deviceType, assigned_zone:k.assignedZone}); onRefresh(); } setEditingKiosk(null); }} onClose={()=>setEditingKiosk(null)} /> )}
        {editingTVModel && ( <TVModelEditor model={editingTVModel} onSave={(m)=>{ if(!selectedTVBrand) return; const cur=selectedTVBrand.models.find(x=>x.id===m.id); const nl = cur ? selectedTVBrand.models.map(x=>x.id===m.id?m:x) : [...selectedTVBrand.models, m]; handleLocalUpdate({...localData, tv:{...localData.tv, brands: localData.tv!.brands.map(b=>b.id===selectedTVBrand.id?{...b, models: nl}:b)} as TVConfig}); setEditingTVModel(null); }} onClose={()=>setEditingTVModel(null)} /> )}
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;