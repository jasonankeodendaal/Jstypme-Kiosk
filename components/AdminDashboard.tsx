
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, ChevronRight, Video, FileText, Search, RotateCcw, Check, BookOpen, Megaphone, Play, Download, Tablet, X, Settings, Loader2, Tv, FileSpreadsheet, ArrowRight, Package, History, Layers, ShieldCheck, Ruler, FileInput, Calendar, Table, Tag, Smartphone, Globe, Activity, Network, Binary, FileType, FileOutput, Maximize, GitBranch, Globe2, Wind, MonitorSmartphone, LayoutGrid, Music, Share2, UserCog, Clock, Volume2, VolumeX, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Cloud, HardDrive, Archive, AlertCircle, FolderOpen, SaveAll, Pencil, Moon, Sun, User,
  // Add missing icons
  Zap, Image as ImageIcon
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, UI_Z_INDEX } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection, initSupabase } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import { RIcon } from './Icons';
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

// --- SYSTEM DOCUMENTATION COMPONENT (ENHANCED FOR BEGINNERS) ---
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
    <div 
      className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in"
      style={{ zIndex: UI_Z_INDEX.SETUP }}
    >
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label>
              <input 
                 className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" 
                 type="text" 
                 placeholder="Name" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
                 autoFocus 
              />
          </div>
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label>
              <input 
                 className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" 
                 type="password" 
                 placeholder="####" 
                 value={pin} 
                 onChange={(e) => setPin(e.target.value)} 
              />
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

      const readFileAsBase64 = (file: File): Promise<string> => {
          return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
          });
      };

      const uploadSingle = async (file: File) => {
           const localBase64 = await readFileAsBase64(file);
           try {
              const url = await uploadFileToStorage(file);
              return { url, base64: localBase64 };
           } catch (e) {
              return { url: localBase64, base64: localBase64 };
           }
      };

      try {
          if (allowMultiple) {
              const results: string[] = [];
              const base64s: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const res = await uploadSingle(files[i]);
                  results.push(res.url);
                  base64s.push(res.base64);
                  setUploadProgress(((i+1)/files.length)*100);
              }
              onUpload(results, fileType, base64s);
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
           {isProcessing ? (
               <Loader2 className="animate-spin text-blue-500" /> 
           ) : currentUrl && !allowMultiple ? (
               accept.includes('video') ? <Video className="text-blue-500" size={16} /> : 
               accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : 
               accept.includes('audio') ? (
                  <div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600">
                      <Music size={16} />
                  </div>
               ) : 
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

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

// Fix: downloadZip missing
const downloadZip = async (data: StoreData) => {
    const zip = new JSZip();
    zip.file("store_data.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiosk_backup_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Fix: AdminManager missing
const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (a: AdminUser[]) => void, currentUser: AdminUser }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-black uppercase text-sm flex gap-2"><UserCog size={20} className="text-blue-500" /> Admins</h3>
                <button onClick={() => {
                    const name = prompt("Name:");
                    const pin = prompt("PIN (4 digits):");
                    if (name && pin) onUpdate([...admins, { id: generateId('adm'), name, pin, isSuperAdmin: false, permissions: { inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true } }]);
                }} className="text-blue-600 font-bold uppercase text-xs flex items-center gap-1"><Plus size={14}/> Add Admin</button>
            </div>
            <div className="space-y-2">
                {admins.map(admin => (
                    <div key={admin.id} className="p-3 border rounded-xl flex justify-between items-center bg-slate-50">
                        <div>
                            <div className="font-bold text-slate-900">{admin.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">PIN: {admin.pin}</div>
                        </div>
                        {currentUser.isSuperAdmin && admin.id !== currentUser.id && (
                            <button onClick={() => onUpdate(admins.filter(a => a.id !== admin.id))} className="text-red-500"><Trash2 size={14}/></button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Fix: ProductEditor missing
const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [p, setP] = useState(product);
    return (
        <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h2 className="font-black text-xl uppercase">Edit Product</h2>
                <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <InputField label="Product Name" val={p.name} onChange={(e: any) => setP({...p, name: e.target.value})} />
                    <InputField label="SKU" val={p.sku} onChange={(e: any) => setP({...p, sku: e.target.value})} />
                    <InputField label="Description" val={p.description} onChange={(e: any) => setP({...p, description: e.target.value})} isArea />
                    <FileUpload label="Main Image" currentUrl={p.imageUrl} onUpload={(url: any) => setP({...p, imageUrl: url})} />
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Features</label>
                        <div className="space-y-2">
                            {(p.features || []).map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={f} onChange={e => {
                                        const nf = [...p.features]; nf[i] = e.target.value; setP({...p, features: nf});
                                    }} className="flex-1 p-2 border rounded-lg text-sm" />
                                    <button onClick={() => setP({...p, features: p.features.filter((_, idx) => idx !== i)})} className="text-red-500"><X size={16}/></button>
                                </div>
                            ))}
                            <button onClick={() => setP({...p, features: [...p.features, '']})} className="text-blue-600 text-xs font-bold uppercase">+ Add Feature</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                <button onClick={onCancel} className="px-6 py-2 font-bold uppercase text-xs">Cancel</button>
                <button onClick={() => onSave(p)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-blue-500 transition-all">Save Product</button>
            </div>
        </div>
    );
};

const PricelistManager = ({ 
    pricelists, 
    pricelistBrands, 
    onSavePricelists,
    onSaveBrands,
    onDeletePricelist
}: { 
    pricelists: Pricelist[], 
    pricelistBrands: PricelistBrand[], 
    onSavePricelists: (p: Pricelist[]) => void,
    onSaveBrands: (b: PricelistBrand[]) => void,
    onDeletePricelist: (id: string) => void
}) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);

    useEffect(() => {
        if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null);
    }, [sortedBrands]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const sortedLists = [...filteredLists].sort((a, b) => {
        const yearA = parseInt(a.year) || 0; const yearB = parseInt(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2>
                     <button onClick={() => { const n = prompt("Brand Name:"); if(n) onSaveBrands([...pricelistBrands, {id:generateId('plb'), name:n, logoUrl:''}]); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] uppercase truncate">{brand.name}</div><div className="text-[9px] text-slate-400 font-mono">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}>
                                     <FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => onSaveBrands(pricelistBrands.map(b=>b.id===brand.id?{...b, logoUrl:url}:b))} />
                                     <button onClick={() => confirm("Delete brand?") && onSaveBrands(pricelistBrands.filter(b=>b.id!==brand.id))} className="w-full text-center text-[10px] text-red-500 font-bold uppercase py-1">Delete</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{selectedBrand?.name || 'Select Brand'}</h3>
                     <button onClick={() => selectedBrand && onSavePricelists([...pricelists, {id:generateId('pl'), brandId:selectedBrand.id, title:'New List', url:'', type:'pdf', month:'January', year:new Date().getFullYear().toString(), dateAdded:new Date().toISOString()}])} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1"><Plus size={12} /> Add List</button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-start pb-10">
                     {sortedLists.map((item) => (
                         <div key={item.id} className={`rounded-xl border shadow-sm p-3 flex flex-col gap-2 h-fit bg-white border-slate-200`}>
                             <input value={item.title} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, title:e.target.value, dateAdded:new Date().toISOString()}:p))} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs" placeholder="Title" />
                             <div className="grid grid-cols-2 gap-2">
                                 <select value={item.month} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, month:e.target.value, dateAdded:new Date().toISOString()}:p))} className="w-full text-[10px] font-bold p-1 bg-white border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                 <input type="number" value={item.year} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, year:e.target.value, dateAdded:new Date().toISOString()}:p))} className="w-full text-[10px] font-bold p-1 bg-white border border-slate-200" />
                             </div>
                             <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded">
                                <button onClick={() => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, type:'pdf', dateAdded:new Date().toISOString()}:p))} className={`py-1 text-[9px] font-black uppercase rounded transition-colors ${item.type !== 'manual' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>PDF</button>
                                <button onClick={() => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, type:'manual', dateAdded:new Date().toISOString()}:p))} className={`py-1 text-[9px] font-black uppercase rounded transition-colors ${item.type === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>TABLE</button>
                             </div>
                             {item.type === 'manual' ? <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-black text-[10px] uppercase border border-blue-200 hover:bg-blue-100 transition-colors">Builder</button> : <FileUpload label="Upload PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, url, dateAdded:new Date().toISOString()}:p))} />}
                             <button onClick={() => onDeletePricelist(item.id)} className="mt-auto pt-2 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1 transition-colors"><Trash2 size={12} /> Delete</button>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');

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

  useEffect(() => { if (currentUser && !availableTabs.find(t => t.id === activeTab)) setActiveTab(availableTabs[0].id); }, [currentUser]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData, hasUnsavedChanges]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };

  if (!localData) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header 
          className="bg-slate-900 text-white shrink-0 shadow-xl z-20"
          style={{ zIndex: UI_Z_INDEX.HEADER }}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div>
                 <button onClick={() => { onUpdateData(localData); setHasUnsavedChanges(false); }} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500'}`}>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button>
                 <div className="flex items-center gap-3"><button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button><button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg"><LogOut size={16} /></button></div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && (!selectedBrand ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <button onClick={() => { const name = prompt("Brand:"); if(name) handleLocalUpdate({...localData, brands:[...localData.brands,{id:generateId('b'), name, categories:[]}]}) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 aspect-square transition-all"><Plus size={24} /><span className="font-bold text-xs uppercase mt-2">New Brand</span></button>
                    {localData.brands.map(b => (<div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col"><div className="aspect-square bg-slate-50 flex items-center justify-center p-4">{b.logoUrl ? <img src={b.logoUrl} className="max-w-full max-h-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{b.name.charAt(0)}</span>}</div><div className="p-4"><h3 className="font-black text-sm uppercase truncate mb-3">{b.name}</h3><button onClick={() => setSelectedBrand(b)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-black transition-colors">Manage</button></div></div>))}
                </div>
            ) : !selectedCategory ? (
                <div>
                    <div className="flex gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border rounded-lg hover:bg-slate-50 transition-colors"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase">{selectedBrand.name}</h2></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => { const name = prompt("Category:"); if(name) { const ub={...selectedBrand, categories:[...selectedBrand.categories,{id:generateId('c'), name, icon:'Box', products:[]}]}; handleLocalUpdate({...localData, brands:localData.brands.map(b=>b.id===ub.id?ub:b)}); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center aspect-square hover:border-blue-500 transition-all"><Plus size={24}/><span className="font-bold text-xs uppercase mt-2">New Category</span></button>
                        {selectedBrand.categories.map(c => (<button key={c.id} onClick={() => setSelectedCategory(c)} className="bg-white border rounded-xl p-6 flex flex-col justify-center aspect-square text-left font-black uppercase hover:shadow-lg transition-all"><Box size={24} className="mb-4 text-slate-400" />{c.name}<div className="text-[10px] text-slate-500 mt-1">{c.products.length} Models</div></button>))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex gap-4 mb-6 shrink-0"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border rounded-lg hover:bg-slate-50 transition-colors"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({id:generateId('p'), name:'', description:'', specs:{}, features:[], dimensions:[], imageUrl:''} as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase ml-auto hover:bg-blue-500 transition-colors">Add Product</button></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {selectedCategory.products.map(p => (<div key={p.id} className="bg-white border rounded-xl overflow-hidden flex flex-col group"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-200" />}<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={() => setEditingProduct(p)} className="p-2 bg-white rounded-lg text-blue-600 font-bold text-xs uppercase hover:bg-slate-100 transition-colors">Edit</button></div></div><div className="p-4 font-bold text-xs uppercase truncate border-t border-slate-100">{p.name}</div></div>))}
                    </div>
                </div>
            ))}

            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists||[]} pricelistBrands={localData.pricelistBrands||[]} onSavePricelists={p=>handleLocalUpdate({...localData, pricelists:p})} onSaveBrands={b=>handleLocalUpdate({...localData, pricelistBrands:b})} onDeletePricelist={id=>handleLocalUpdate({...localData, pricelists:localData.pricelists?.filter(p=>p.id!==id)})} />}
            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-black uppercase text-sm mb-6 flex gap-2"><Database size={20} className="text-blue-500" /> System Backup</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => downloadZip(localData)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-blue-500 transition-colors"><Download size={16}/> Export Full .zip Backup</button>
                            <label className={`w-full py-4 ${importProcessing ? 'bg-slate-300' : 'bg-slate-800'} text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-black transition-colors`}>{importProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} <span>{importProcessing ? importProgress || 'Processing...' : 'Import Data from .zip'}</span><input type="file" accept=".zip" className="hidden" disabled={importProcessing} onChange={async (e) => { if(e.target.files?.[0] && confirm("Merge imported data?")) { setImportProcessing(true); try { /* Mocked Zip Import - in a real app would use the importZip function */ alert("Import logic initiated..."); } catch(err) { alert("Import failed."); } finally { setImportProcessing(false); setImportProgress(''); } } }} /></label>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"><AdminManager admins={localData.admins||[]} onUpdate={a=>handleLocalUpdate({...localData, admins:a})} currentUser={currentUser} /></div>
                </div>
            )}
        </main>

        {editingProduct && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm p-8 flex items-center justify-center"
              style={{ zIndex: UI_Z_INDEX.MODAL }}
            >
                <ProductEditor 
                  product={editingProduct} 
                  onSave={p => { 
                    const np=selectedCategory!.products.find(x=>x.id===p.id) ? selectedCategory!.products.map(x=>x.id===p.id?p:x) : [...selectedCategory!.products, p]; 
                    const uc={...selectedCategory!, products:np}; 
                    const ub={...selectedBrand!, categories:selectedBrand!.categories.map(c=>c.id===uc.id?uc:c)}; 
                    handleLocalUpdate({...localData, brands:localData.brands.map(b=>b.id===ub.id?ub:b)}); 
                    setEditingProduct(null); 
                  }} 
                  onCancel={() => setEditingProduct(null)} 
                />
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
