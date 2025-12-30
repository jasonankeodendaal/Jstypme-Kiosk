
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
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
                    <p className="text-slate-500 text-xs mt-2 font-medium">Step-by-step logic overview for new administrators.</p>
                </div>
                <div className="space-y-2 flex-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 group relative overflow-hidden ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-500 ${activeSection === section.id ? 'bg-white/20' : 'bg-slate-800'}`}>{React.cloneElement(section.icon as React.ReactElement<any>, { size: 18 })}</div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{section.label}</div>
                                <div className={`text-[9px] font-bold uppercase truncate opacity-60 ${activeSection === section.id ? 'text-blue-100' : 'text-slate-500'}`}>{section.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full"></div>
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p>
                        </div>
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110"><Monitor className="text-blue-400" size={40} /><div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">YOU</div></div>
                                    <div className="text-center"><div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div></div>
                                </div>
                                <div className="flex-1 w-full h-24 relative flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/5 rounded-full relative"><div className="absolute inset-0 bg-blue-500/20 blur-md"></div>{[0, 1, 2].map(i => (<div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>))}</div>
                                </div>
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1"><Tablet className="text-green-400" size={32} /></div>
                                    <div className="text-center"><div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Other sections follow same structure... abbreviated for brevity */}
                <div className="h-40"></div>
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

// --- SHARED COMPONENTS ---
const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false, compact = false }: any) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      setUploadProgress(10); 
      const files = Array.from(e.target.files) as File[];
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';

      const uploadSingle = async (file: File) => {
           try { const url = await uploadFileToStorage(file); return url; }
           catch (e) { return URL.createObjectURL(file); }
      };

      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const res = await uploadSingle(files[i]);
                  results.push(res);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results, fileType);
          } else {
              const res = await uploadSingle(files[0]);
              onUpload(res, fileType);
          }
      } catch (err) { alert("Upload error"); } 
      finally { setIsProcessing(false); setUploadProgress(0); }
    }
  };

  if (compact) {
    return (
        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg border border-slate-300 relative transition-all group overflow-hidden">
            {isProcessing ? <Loader2 className="animate-spin text-blue-500" size={14} /> : currentUrl ? <img src={currentUrl} className="w-8 h-8 object-contain" /> : <ImageIcon size={14} className="text-slate-400 group-hover:text-blue-500" />}
            <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} />
        </label>
    );
  }

  return (
    <div className="mb-4">
      {label && <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? <img src={currentUrl} className="w-full h-full object-contain" /> : React.cloneElement(icon, { size: 16 })}
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

// --- TABS LOGIC ---

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 className="font-black text-slate-900 uppercase">Pricelist Builder</h3>
          <div className="flex gap-2">
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
            <table className="w-full text-left border-collapse">
                <thead><tr><th className="p-3 border-b">SKU</th><th className="p-3 border-b">Description</th><th className="p-3 border-b">Price</th><th className="p-3 border-b">Promo</th><th className="p-3 border-b">Actions</th></tr></thead>
                <tbody>{items.map(item => (
                    <tr key={item.id}>
                        <td className="p-2"><input value={item.sku} onChange={e=>updateItem(item.id, 'sku', e.target.value)} className="border p-2 rounded w-full" /></td>
                        <td className="p-2"><input value={item.description} onChange={e=>updateItem(item.id, 'description', e.target.value)} className="border p-2 rounded w-full" /></td>
                        <td className="p-2"><input value={item.normalPrice} onChange={e=>updateItem(item.id, 'normalPrice', e.target.value)} className="border p-2 rounded w-full" /></td>
                        <td className="p-2"><input value={item.promoPrice} onChange={e=>updateItem(item.id, 'promoPrice', e.target.value)} className="border p-2 rounded w-full" /></td>
                        <td className="p-2"><button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="text-red-500"><Trash2 size={16}/></button></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
        <div className="p-4 border-t flex justify-end gap-3"><button onClick={onClose} className="px-6 py-2">Cancel</button><button onClick={()=> {onSave({...pricelist, items}); onClose();}} className="px-8 py-3 bg-blue-600 text-white font-black uppercase rounded-xl">Save Changes</button></div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(pricelistBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                <h4 className="font-black uppercase text-xs text-slate-400 mb-4">Brands</h4>
                {pricelistBrands.map((b: any) => (
                    <button key={b.id} onClick={() => setSelectedBrand(b)} className={`w-full text-left p-3 rounded-xl font-bold uppercase text-xs transition-all ${selectedBrand?.id === b.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{b.name}</button>
                ))}
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-900 uppercase">{selectedBrand?.name} Pricelists</h3>
                    <button onClick={() => onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand?.id, title: 'New List', month: 'May', year: '2024', type: 'pdf', url: '' }])} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2"><Plus size={14}/> Add List</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLists.map((p: any) => (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <input value={p.title} onChange={e => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? {...x, title: e.target.value} : x))} className="w-full font-black uppercase text-xs outline-none" />
                            <div className="flex gap-2">
                                <button onClick={() => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? {...x, type: 'pdf'} : x))} className={`flex-1 py-1 rounded text-[10px] font-black uppercase ${p.type === 'pdf' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>PDF</button>
                                <button onClick={() => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? {...x, type: 'manual'} : x))} className={`flex-1 py-1 rounded text-[10px] font-black uppercase ${p.type === 'manual' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Table</button>
                            </div>
                            {p.type === 'manual' ? (
                                <button onClick={() => setEditingManualList(p)} className="w-full py-2 bg-blue-50 text-blue-600 font-black uppercase text-[10px] rounded-lg">Edit Items ({p.items?.length || 0})</button>
                            ) : (
                                <FileUpload currentUrl={p.url} onUpload={(url: any) => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? {...x, url} : x))} accept="application/pdf" label="PDF Document" />
                            )}
                            <button onClick={() => onDeletePricelist(p.id)} className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                        </div>
                    ))}
                </div>
            </div>
            {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onClose={() => setEditingManualList(null)} onSave={(pl) => onSavePricelists(pricelists.map((x: any) => x.id === pl.id ? pl : x))} />}
        </div>
    );
};

const CatalogueManager = ({ catalogues, onSave, brandId }: any) => {
    const list = catalogues || [];
    const update = (newList: any) => onSave(newList);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={() => update([...list, { id: generateId('cat'), title: 'New Entry', type: 'pamphlet', pages: [], year: 2024, startDate: '', endDate: '', brandId }])} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((cat: any) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                        <input value={cat.title} onChange={e => update(list.map((x: any) => x.id === cat.id ? {...x, title: e.target.value} : x))} className="w-full font-black uppercase text-sm border-b" />
                        <div className="grid grid-cols-2 gap-2">
                             <FileUpload label="Thumbnail" currentUrl={cat.thumbnailUrl} onUpload={(url: any) => update(list.map((x: any) => x.id === cat.id ? {...x, thumbnailUrl: url} : x))} />
                             <FileUpload label="PDF" accept="application/pdf" currentUrl={cat.pdfUrl} onUpload={(url: any) => update(list.map((x: any) => x.id === cat.id ? {...x, pdfUrl: url} : x))} />
                        </div>
                        <button onClick={() => update(list.filter((x: any) => x.id !== cat.id))} className="text-red-500 text-[10px] font-black uppercase"><Trash2 size={12}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product });
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center"><h3 className="font-bold uppercase">Edit Product</h3><button onClick={onCancel}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <InputField label="Name" val={draft.name} onChange={(e: any) => setDraft({...draft, name: e.target.value})} />
                    <InputField label="SKU" val={draft.sku} onChange={(e: any) => setDraft({...draft, sku: e.target.value})} />
                    <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({...draft, description: e.target.value})} />
                </div>
                <div className="space-y-4">
                    <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({...draft, imageUrl: url})} />
                    <div className="bg-slate-50 p-4 rounded-xl border">
                        <label className="text-[10px] font-black uppercase mb-2 block">Specifications</label>
                        {Object.entries(draft.specs).map(([k, v]) => (
                            <div key={k} className="flex gap-2 mb-2"><span className="text-xs font-bold w-20">{k}:</span><span className="text-xs">{v}</span></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={onCancel} className="px-6 py-2 font-bold uppercase text-xs text-slate-500">Cancel</button><button onClick={()=>onSave(draft)} className="px-8 py-3 bg-blue-600 text-white font-black uppercase rounded-xl shadow-lg">Save Product</button></div>
        </div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const add = () => { if(newName && newPin) { onUpdate([...admins, { id: generateId('adm'), name: newName, pin: newPin, isSuperAdmin: false, permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true } }]); setNewName(''); setNewPin(''); } };
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-2xl border">
                <InputField label="Admin Name" val={newName} onChange={(e: any) => setNewName(e.target.value)} />
                <InputField label="4-Digit PIN" val={newPin} onChange={(e: any) => setNewPin(e.target.value)} />
                <div className="flex items-end pb-4"><button onClick={add} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-xs">Add New Admin</button></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {admins.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                        <div><div className="font-black uppercase text-sm text-slate-900">{a.name}</div><div className="font-mono text-xs text-slate-400">PIN: {a.pin}</div></div>
                        {a.id !== 'super-admin' && <button onClick={()=>onUpdate(admins.filter(x=>x.id!==a.id))} className="text-red-400"><Trash2 size={16}/></button>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [historyTab, setHistoryTab] = useState<'brands' | 'catalogues' | 'deletedItems'>('deletedItems');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
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
      { id: 'guide', label: 'System Guide', icon: BookOpen }
  ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  const archivedGenericItems = (localData.archive?.deletedItems || []).filter(i => i.name.toLowerCase().includes(historySearch.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div>
                 <div className="flex items-center gap-4">
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button>
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'}`}>{isCloudConnected ? <Cloud size={14} /> : <HardDrive size={14} />}<span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span></div>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2"><LogOut size={16} /><span className="text-[10px] font-bold uppercase hidden md:inline">Logout</span></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                       <button onClick={() => { const n = prompt("Name:"); if(n) handleLocalUpdate({...localData, brands: [...localData.brands, { id: generateId('b'), name: n, categories: [] }]}); }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"><Plus size={32} /><span className="font-black uppercase text-xs mt-2">Add Brand</span></button>
                       {localData.brands.map(b => (
                           <div key={b.id} className="bg-white rounded-2xl shadow-sm border p-4 group relative">
                               <div className="aspect-square flex items-center justify-center bg-slate-50 rounded-xl mb-4">{b.logoUrl ? <img src={b.logoUrl} className="max-h-full" /> : <span className="text-4xl text-slate-200 font-black">{b.name[0]}</span>}</div>
                               <div className="font-black uppercase text-sm mb-1">{b.name}</div>
                               <button onClick={() => setSelectedBrand(b)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-black uppercase">Manage</button>
                               <button onClick={() => { if(confirm("Archive?")) handleLocalUpdate({...localData, brands: localData.brands.filter(x=>x.id!==b.id), archive: {...localData.archive!, brands: [...(localData.archive?.brands||[]), b]}}); }} className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                           </div>
                       ))}
                   </div>
                ) : !selectedCategory ? (
                    <div>
                        <div className="flex items-center gap-4 mb-8"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase">{selectedBrand.name}</h2></div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <button onClick={() => { const n = prompt("Cat:"); if(n) handleLocalUpdate({...localData, brands: localData.brands.map(b => b.id === selectedBrand.id ? {...b, categories: [...b.categories, { id: generateId('c'), name: n, icon: 'Box', products: [] }]} : b)}); }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400"><Plus size={32}/><span className="font-black uppercase text-[10px] mt-2">New Category</span></button>
                            {selectedBrand.categories.map(c => (<button key={c.id} onClick={()=>setSelectedCategory(c)} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md text-left group">
                                <Box size={24} className="mb-4 text-slate-400" /><div className="font-black uppercase text-sm">{c.name}</div><div className="text-xs text-slate-500 font-bold">{c.products.length} Models</div>
                            </button>))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-4"><button onClick={()=>setSelectedCategory(null)} className="p-2 bg-white border rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase">{selectedCategory.name}</h2></div>
                             <button onClick={()=>setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-black uppercase text-xs">Add Product</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {selectedCategory.products.map(p => (
                                <div key={p.id} className="bg-white rounded-xl border overflow-hidden group">
                                    <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 relative">
                                        {p.imageUrl ? <img src={p.imageUrl} className="max-h-full" /> : <Box size={40} className="text-slate-100" />}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button onClick={()=>setEditingProduct(p)} className="bg-white px-4 py-2 rounded-lg font-black uppercase text-[10px] text-blue-600">Edit</button>
                                            <button onClick={()=>{ if(confirm("Delete?")) { const updated = {...selectedCategory, products: selectedCategory.products.filter(x=>x.id!==p.id)}; handleLocalUpdate({...localData, brands: localData.brands.map(b=>b.id===selectedBrand.id?{...b, categories: b.categories.map(cat=>cat.id===updated.id?updated:cat)}:b)}); }}} className="bg-white px-4 py-2 rounded-lg font-black uppercase text-[10px] text-red-600">Delete</button>
                                        </div>
                                    </div>
                                    <div className="p-4"><div className="font-black uppercase text-xs truncate">{p.name}</div><div className="text-[10px] font-mono text-slate-400">{p.sku}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}

            {activeTab === 'marketing' && (
                <div className="max-w-5xl mx-auto space-y-12">
                     <div className="flex gap-4 border-b pb-4">
                         {['hero', 'ads', 'catalogues'].map(s => (<button key={s} onClick={()=>setActiveSubTab(s)} className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${activeSubTab === s ? 'bg-purple-600 text-white' : 'bg-white border'}`}>{s}</button>))}
                     </div>
                     {activeSubTab === 'hero' && (
                         <div className="bg-white p-8 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
                             <div className="space-y-4">
                                 <InputField label="Main Title" val={localData.hero.title} onChange={(e:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, title: e.target.value}})} />
                                 <InputField label="Subtitle" val={localData.hero.subtitle} onChange={(e:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, subtitle: e.target.value}})} />
                                 <InputField label="Website URL" val={localData.hero.websiteUrl || ''} onChange={(e:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, websiteUrl: e.target.value}})} />
                             </div>
                             <div className="space-y-4">
                                 <FileUpload label="Background Image" currentUrl={localData.hero.backgroundImageUrl} onUpload={(u:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, backgroundImageUrl: u}})} />
                                 <FileUpload label="Hero Logo" currentUrl={localData.hero.logoUrl} onUpload={(u:any)=>handleLocalUpdate({...localData, hero: {...localData.hero, logoUrl: u}})} />
                             </div>
                         </div>
                     )}
                     {activeSubTab === 'catalogues' && <CatalogueManager catalogues={localData.catalogues?.filter(c=>!c.brandId)} onSave={(c:any)=>handleLocalUpdate({...localData, catalogues: [...(localData.catalogues?.filter(x=>x.brandId)||[]), ...c]})} />}
                </div>
            )}

            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists||[]} pricelistBrands={localData.pricelistBrands||[]} onSavePricelists={(p:any)=>handleLocalUpdate({...localData, pricelists: p})} onSaveBrands={(b:any)=>handleLocalUpdate({...localData, pricelistBrands: b})} />}
            
            {activeTab === 'history' && (
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-slate-900 rounded-3xl text-blue-500 shadow-xl shadow-blue-500/10 border border-slate-800"><History size={32}/></div>
                            <div><h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Activity Archive</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Registry of all deleted entities and historical records</p></div>
                        </div>
                        <div className="relative group w-full md:w-80"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/><input type="text" placeholder="Search archive logs..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:border-blue-500 shadow-sm" value={historySearch} onChange={(e)=>setHistorySearch(e.target.value)} /></div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                             {[ {id: 'deletedItems', label: 'System Logs', icon: <Terminal size={14}/>}, {id: 'brands', label: 'Archived Brands', icon: <Grid size={14}/>}, {id: 'catalogues', label: 'Archived Pamphlets', icon: <BookOpen size={14}/>} ].map(t => (
                                 <button key={t.id} onClick={()=>setHistoryTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${historyTab === t.id ? 'bg-white shadow-lg text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>{t.icon} {t.label}</button>
                             ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-10">
                             {historyTab === 'deletedItems' && (
                                 <div className="space-y-4">
                                     {archivedGenericItems.map(item => (
                                         <div key={item.id} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between hover:border-blue-200 transition-all group">
                                             <div className="flex items-center gap-5">
                                                 <div className={`p-4 rounded-2xl ${item.type === 'product' ? 'bg-blue-50 text-blue-500' : item.type === 'device' ? 'bg-purple-50 text-purple-500' : 'bg-slate-50 text-slate-400'}`}>
                                                     {item.type === 'product' ? <Package size={24}/> : item.type === 'device' ? <Tablet size={24}/> : <FileIcon size={24}/>}
                                                 </div>
                                                 <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.type} • DELETED</div><h4 className="font-black text-slate-900 uppercase text-lg leading-none">{item.name}</h4><div className="text-[10px] text-slate-400 font-mono mt-2 flex items-center gap-2"><Clock size={12}/> {new Date(item.deletedAt).toLocaleString()}</div></div>
                                             </div>
                                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button onClick={()=>{ if(confirm("Restore this item?")) { const newLogs = localData.archive?.deletedItems?.filter(x=>x.id!==item.id); handleLocalUpdate({...localData, archive: {...localData.archive!, deletedItems: newLogs}}); } }} className="px-6 py-2.5 bg-slate-900 text-white font-black uppercase text-[10px] rounded-xl hover:bg-blue-600 transition-all">Restore</button>
                                                 <button onClick={()=>{ if(confirm("Permanently wipe?")) { const newLogs = localData.archive?.deletedItems?.filter(x=>x.id!==item.id); handleLocalUpdate({...localData, archive: {...localData.archive!, deletedItems: newLogs}}); } }} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                                             </div>
                                         </div>
                                     ))}
                                     {archivedGenericItems.length === 0 && (
                                         <div className="py-20 flex flex-col items-center text-slate-300"><Archive size={80} className="mb-6 opacity-10"/><p className="font-black uppercase tracking-[0.2em] text-sm">Log Registry Empty</p></div>
                                     )}
                                 </div>
                             )}
                             {historyTab === 'brands' && (
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                     {(localData.archive?.brands || []).map(b => (
                                         <div key={b.id} className="bg-slate-50 border border-slate-200 p-6 rounded-[2.5rem] flex flex-col items-center text-center group relative overflow-hidden">
                                             <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center z-10"><div className="bg-slate-900 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Archived</div></div>
                                             <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-4 mb-4 shadow-sm">{b.logoUrl ? <img src={b.logoUrl} className="max-h-full grayscale opacity-40" /> : <Grid size={48} className="text-slate-200" />}</div>
                                             <h4 className="font-black text-slate-400 uppercase text-xs mb-6">{b.name}</h4>
                                             <button onClick={()=> { if(confirm("Restore brand?")) { const filtered = localData.archive?.brands.filter(x=>x.id!==b.id) || []; handleLocalUpdate({...localData, brands: [...localData.brands, b], archive: {...localData.archive!, brands: filtered}}); } }} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">Restore Brand</button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-slate-900 rounded-3xl text-purple-500 shadow-xl border border-slate-800"><Settings size={32}/></div>
                        <div><h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">System Settings</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Global Identity, Security, and Cloud Orchestration</p></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                            <h3 className="text-lg font-black text-slate-900 uppercase mb-8 flex items-center gap-3"><MonitorSmartphone className="text-blue-500" /> App Identity</h3>
                            <div className="space-y-6">
                                <FileUpload label="Kiosk Launcher Icon (512x512)" currentUrl={localData.appConfig?.kioskIconUrl} onUpload={(url: any) => handleLocalUpdate({...localData, appConfig: {...localData.appConfig, kioskIconUrl: url}})} />
                                <FileUpload label="Admin Dashboard Icon (512x512)" currentUrl={localData.appConfig?.adminIconUrl} onUpload={(url: any) => handleLocalUpdate({...localData, appConfig: {...localData.appConfig, adminIconUrl: url}})} />
                            </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Shield size={120} /></div>
                            <h3 className="text-lg font-black uppercase mb-8 flex items-center gap-3 relative z-10"><Lock className="text-blue-400" /> System Security</h3>
                            <div className="space-y-6 relative z-10">
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fleet Enrollment PIN</label><input type="text" maxLength={8} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl text-2xl font-mono tracking-[0.5em] focus:border-blue-500 outline-none transition-all" value={localData.systemSettings?.setupPin || ''} onChange={(e)=>handleLocalUpdate({...localData, systemSettings: {...localData.systemSettings, setupPin: e.target.value.replace(/\D/g, '')}})} placeholder="0000" /><p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wide">REQUIRED FOR NEW TABLET REGISTRATION</p></div>
                                <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20"><div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Authorization Note</div><p className="text-[11px] text-slate-400 leading-relaxed font-medium">Changing this PIN will not affect currently registered kiosks, but will be required for any new hardware setups.</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                        <div className="flex justify-between items-center mb-8"><h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-3"><UserCog className="text-purple-600" /> Administrative Access</h3><div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase">{localData.admins?.length || 0} Total Profiles</div></div>
                        <AdminManager admins={localData.admins || []} currentUser={currentUser} onUpdate={(adm: any) => handleLocalUpdate({...localData, admins: adm})} />
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 border-dashed">
                        <h3 className="text-lg font-black text-slate-900 uppercase mb-8 flex items-center gap-3"><Cpu className="text-slate-400" /> Advanced Operations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => downloadZip(localData)} className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-3 group"><div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Download size={24}/></div><div><div className="font-black uppercase text-xs text-slate-900 mb-1">System Backup</div><div className="text-[9px] text-slate-400 font-bold uppercase">Export full JSON payload</div></div></button>
                            <label className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-purple-500 hover:shadow-xl transition-all flex flex-col items-center text-center gap-3 group cursor-pointer"><div className="p-3 bg-purple-50 text-purple-500 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors"><Upload size={24}/></div><div><div className="font-black uppercase text-xs text-slate-900 mb-1">Restore Cloud</div><div className="text-[9px] text-slate-400 font-bold uppercase">Import configuration JSON</div></div><input type="file" className="hidden" accept=".json" onChange={async (e)=> { const f = e.target.files?.[0]; if(f) { const t = await f.text(); try { const d = JSON.parse(t); if(confirm("Overwrite entire cloud config with this file?")) { handleLocalUpdate(d); } } catch(e){alert("Invalid JSON");} } }} /></label>
                            <button onClick={async () => { if(confirm("CRITICAL WARNING: This will delete ALL brands, products, and media from the cloud. Continue?")) { const fresh = await resetStoreData(); handleLocalUpdate(fresh); onRefresh(); } }} className="p-6 bg-red-50 border border-red-100 rounded-3xl hover:bg-red-600 hover:text-white transition-all flex flex-col items-center text-center gap-3 group"><div className="p-3 bg-white text-red-500 rounded-2xl group-hover:bg-white/20 group-hover:text-white"><RotateCcw size={24}/></div><div><div className="font-black uppercase text-xs group-hover:text-white text-red-900 mb-1">Factory Reset</div><div className="text-[9px] group-hover:text-red-100 text-red-400 font-bold uppercase">Wipe all data records</div></div></button>
                        </div>
                    </div>
                </div>
            )}
        </main>

        {editingKiosk && <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-md"><h3 className="font-black uppercase mb-4">Edit Kiosk</h3><InputField label="Name" val={editingKiosk.name} onChange={(e:any)=>setEditingKiosk({...editingKiosk, name: e.target.value})} /><div className="flex justify-end gap-2 mt-4"><button onClick={()=>setEditingKiosk(null)}>Cancel</button><button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>{ handleLocalUpdate({...localData, fleet: localData.fleet?.map(f => f.id === editingKiosk.id ? editingKiosk : f)}); setEditingKiosk(null); }}>Save</button></div></div></div>}
        {editingProduct && <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"><div className="w-full max-w-6xl h-[90vh]"><ProductEditor product={editingProduct} onCancel={() => setEditingProduct(null)} onSave={(p) => {
            const updatedCat = { ...selectedCategory!, products: selectedCategory!.products.find(x=>x.id===p.id) ? selectedCategory!.products.map(x=>x.id===p.id?p:x) : [...selectedCategory!.products, p] };
            handleLocalUpdate({ ...localData, brands: localData.brands.map(b => b.id === selectedBrand!.id ? { ...b, categories: b.categories.map(c => c.id === updatedCat.id ? updatedCat : c) } : b) });
            setEditingProduct(null);
        }} /></div></div>}
    </div>
  );
};

const downloadZip = async (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `kiosk_backup_${Date.now()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
};
