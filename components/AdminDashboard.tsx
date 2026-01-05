
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

const SignalStrengthBars = ({ strength }: { strength: number }) => (
    <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3, 4].map((bar) => (
            <div key={bar} className={`w-1 rounded-full transition-all duration-500 ${(strength / 25) >= bar ? 'bg-blue-500' : 'bg-slate-800'}`} style={{ height: `${bar * 25}%` }} />
        ))}
    </div>
);

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" /><path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" /><path d="M11.5 14L17 19" />
  </svg>
);

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
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4"><Lock size={32} /></div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Admin Portal</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Authorized Access Only</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" type="text" placeholder="Admin User" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <input className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-center tracking-[1em]" type="password" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} />
          {error && <div className="text-red-500 text-xs font-black uppercase text-center bg-red-100 p-3 rounded-xl">{error}</div>}
          <button type="submit" className="w-full p-5 font-black rounded-2xl bg-slate-900 text-white uppercase hover:bg-blue-600 transition-all shadow-xl active:scale-95">Login to Cloud</button>
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
      // Fix: Added explicit type casting to File[] to ensure compatibility with uploadFileToStorage
      const files = Array.from(e.target.files) as File[];
      try {
          if (allowMultiple) {
              const results = [];
              for(const f of files) { results.push(await uploadFileToStorage(f)); }
              onUpload(results);
          } else {
              onUpload(await uploadFileToStorage(files[0]));
          }
      } catch (err) { alert("Upload failed"); } finally { setIsProcessing(false); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" size={20} /> : currentUrl && !allowMultiple ? (accept.includes('pdf') ? <FileText className="text-red-500" /> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 20, className: 'text-slate-300' })}
        </div>
        <label className="flex-1 text-center cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95">
              {isProcessing ? 'Processing...' : 'Upload File'}
              <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/>
        </label>
      </div>
    </div>
  );
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, type = 'text' }: any) => (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-4 bg-slate-50 text-black border-2 border-slate-100 rounded-2xl h-24 focus:border-blue-500 focus:bg-white outline-none resize-none font-bold text-sm transition-all" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-4 bg-slate-50 text-black border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-black text-sm transition-all" placeholder={placeholder} />}
    </div>
);

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<any>(sortedBrands[0] || null);

    const updatePl = (id: string, updates: any) => {
        const newList = pricelists.map((p: any) => p.id === id ? { ...p, ...updates, dateAdded: new Date().toISOString() } : p);
        onSavePricelists(newList);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
            <div className="w-full md:w-72 bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shrink-0 shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">Brands</h3>
                    <button onClick={() => { const n = prompt("Brand Name:"); if(n) onSaveBrands([...pricelistBrands, {id: generateId('plb'), name: n, logoUrl: ''}]); }} className="p-1.5 bg-blue-600 text-white rounded-lg"><Plus size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sortedBrands.map(b => (
                        <button key={b.id} onClick={() => setSelectedBrand(b)} className={`w-full text-left p-3 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center gap-3 ${selectedBrand?.id === b.id ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'text-slate-50 hover:bg-slate-50'}`}>
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">{b.logoUrl ? <img src={b.logoUrl} className="w-full h-full object-contain p-1" /> : b.name[0]}</div>
                            <span className="truncate">{b.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Pricelist Repository</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{selectedBrand?.name || 'All Brands'}</p>
                    </div>
                    <button onClick={() => { if(!selectedBrand) return; updatePl(generateId('pl'), { brandId: selectedBrand.id, title: 'New Pricelist', month: 'January', year: '2024', type: 'pdf', url: '' }); }} disabled={!selectedBrand} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-xl transition-all disabled:opacity-50">Create New List</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {pricelists.filter((p:any) => p.brandId === selectedBrand?.id).map((pl: any) => (
                        <div key={pl.id} className="bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl transition-all hover:border-blue-500/30">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Title (Display Name)</label>
                                    <input value={pl.title} onChange={(e) => updatePl(pl.id, { title: e.target.value })} className="w-full bg-white p-3 rounded-xl border border-slate-200 font-black uppercase text-sm outline-none focus:border-blue-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={pl.month} onChange={(e) => updatePl(pl.id, { month: e.target.value })} className="bg-white p-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase">{['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}</select>
                                    <input type="number" value={pl.year} onChange={(e) => updatePl(pl.id, { year: e.target.value })} className="bg-white p-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-center" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-200">
                                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-2">Mode</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => updatePl(pl.id, { type: 'pdf' })} className={`p-2 rounded-xl text-[9px] font-black uppercase ${pl.type !== 'manual' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-50'}`}>PDF File</button>
                                        <button onClick={() => updatePl(pl.id, { type: 'manual' })} className={`p-2 rounded-xl text-[9px] font-black uppercase ${pl.type === 'manual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-50'}`}>Data Table</button>
                                    </div>
                                </div>
                                {pl.type === 'pdf' ? <FileUpload label="PDF Document" accept="application/pdf" currentUrl={pl.url} icon={<FileText />} onUpload={(url: any) => updatePl(pl.id, { url })} /> : <button className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-blue-100 font-black text-[10px] uppercase">Open Table Builder</button>}
                                <button onClick={() => onSavePricelists(pricelists.filter((p:any) => p.id !== pl.id))} className="w-full text-[9px] font-black text-red-400 uppercase pt-2 hover:text-red-600 transition-colors">Delete List</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: any) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [localData, setLocalData] = useState<StoreData>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  useEffect(() => { if (storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) {
          onUpdateData(newData);
          setHasUnsavedChanges(false);
      } else {
          setHasUnsavedChanges(true);
      }
  };

  if (!currentUser) return <Auth admins={localData.admins} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <header className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 shadow-2xl z-50">
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-xl"><Settings size={24} /></div>
                <h1 className="font-black uppercase tracking-tighter text-xl">Cloud Hub</h1>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => { onUpdateData(localData); setHasUnsavedChanges(false); }} 
                  disabled={!hasUnsavedChanges} 
                  className={`px-8 py-3 rounded-2xl font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                >
                    Save To Cloud
                </button>
                <button onClick={() => setCurrentUser(null)} className="p-3 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><LogOut size={20}/></button>
            </div>
        </header>

        <nav className="bg-white border-b border-slate-200 flex shrink-0 overflow-x-auto no-scrollbar">
            {['inventory', 'marketing', 'pricelists', 'fleet', 'settings'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest border-b-4 transition-all ${activeTab === tab ? 'border-blue-600 text-slate-900 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab}</button>
            ))}
        </nav>

        <main className="flex-1 overflow-hidden p-6 relative">
            {activeTab === 'pricelists' && (
                <PricelistManager 
                    pricelists={localData.pricelists} 
                    pricelistBrands={localData.pricelistBrands} 
                    onSavePricelists={(p:any) => handleLocalUpdate({...localData, pricelists: p})} 
                    onSaveBrands={(b:any) => handleLocalUpdate({...localData, pricelistBrands: b})} 
                />
            )}
            
            {activeTab === 'inventory' && (
                <div className="h-full overflow-y-auto">
                    {!selectedBrand ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <button onClick={() => { const n = prompt("Brand Name:"); if(n) handleLocalUpdate({...localData, brands: [...localData.brands, {id: generateId('b'), name: n, categories: []}]}, true); }} className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-blue-500 hover:text-blue-500 transition-all"><Plus size={40}/><span className="font-black uppercase text-[10px] mt-4">New Brand</span></button>
                            {localData.brands.map(b => (
                                <div key={b.id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500 transition-all p-4 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 overflow-hidden">{b.logoUrl ? <img src={b.logoUrl} className="w-full h-full object-contain p-2" /> : <span className="text-3xl font-black text-slate-200">{b.name[0]}</span>}</div>
                                    <h4 className="font-black text-slate-900 uppercase text-xs mb-4">{b.name}</h4>
                                    <div className="flex gap-2 w-full"><button onClick={() => setSelectedBrand(b)} className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px]">Edit</button><button onClick={() => handleLocalUpdate({...localData, brands: localData.brands.filter(x => x.id !== b.id)}, true)} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14}/></button></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="animate-fade-in"><button onClick={() => setSelectedBrand(null)} className="mb-6 flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-blue-600 transition-colors"><ArrowLeft size={16}/> Back to Inventory</button><h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8">{selectedBrand.name} <span className="text-slate-300">Management</span></h2><FileUpload label="Brand Logo" currentUrl={selectedBrand.logoUrl} onUpload={(url:any) => handleLocalUpdate({...localData, brands: localData.brands.map(x => x.id === selectedBrand.id ? {...x, logoUrl: url} : x)}, true)} /></div>
                    )}
                </div>
            )}
            
            {activeTab === 'settings' && <div className="p-8 bg-white rounded-3xl border border-slate-200"><h3 className="text-xl font-black uppercase mb-6">Device Setup Security</h3><InputField label="Global Setup PIN" val={localData.systemSettings?.setupPin} onChange={(e:any) => handleLocalUpdate({...localData, systemSettings: {...localData.systemSettings, setupPin: e.target.value}})} placeholder="0000" /><div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between"><div className="flex items-center gap-4 text-slate-400"><Database size={24} /><span className="text-xs font-bold uppercase">Cloud Storage Health: 100%</span></div><button onClick={() => onRefresh()} className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl font-black uppercase text-xs text-slate-600 hover:bg-slate-200 transition-all"><RefreshCw size={16}/> Force Cloud Resync</button></div></div>}
        </main>
    </div>
  );
};

export default AdminDashboard;
