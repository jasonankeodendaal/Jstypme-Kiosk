
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, ListOrdered, DollarSign
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistManualItem } from '../types';
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

// FileUpload component added to fix 'Cannot find name FileUpload' errors
const FileUpload = ({ label, currentUrl, onUpload, accept = "image/*", icon }: any) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file);
      onUpload(url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : icon || <Upload size={12} />}
          {uploading ? "Uploading..." : "Browse"}
        </button>
        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
            <Eye size={14} />
          </a>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleUpload} accept={accept} className="hidden" />
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
    const sortedBrands = useMemo(() => {
        return [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name));
    }, [pricelistBrands]);

    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    
    useEffect(() => {
        if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) {
            setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null);
        }
    }, [sortedBrands]);

    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const sortedLists = [...filteredLists].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    const addBrand = () => {
        const name = prompt("Enter Brand Name for Pricelists:");
        if (!name) return;
        const newBrand: PricelistBrand = {
            id: generateId('plb'),
            name: name,
            logoUrl: ''
        };
        onSaveBrands([...pricelistBrands, newBrand]);
        setSelectedBrand(newBrand);
    };

    const updateBrand = (id: string, updates: Partial<PricelistBrand>) => {
        const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b);
        onSaveBrands(updatedBrands);
        if (selectedBrand?.id === id) {
            setSelectedBrand({ ...selectedBrand, ...updates });
        }
    };

    const deleteBrand = (id: string) => {
        if (confirm("Delete this brand? This will also hide associated pricelists.")) {
            onSaveBrands(pricelistBrands.filter(b => b.id !== id));
        }
    };

    const addPricelist = () => {
        if (!selectedBrand) return;
        const newItem: Pricelist = {
            id: generateId('pl'),
            brandId: selectedBrand.id,
            title: 'New Pricelist',
            type: 'pdf',
            url: '',
            manualItems: [],
            month: months[new Date().getMonth()],
            year: new Date().getFullYear().toString(),
            dateAdded: new Date().toISOString()
        };
        onSavePricelists([...pricelists, newItem]);
    };

    const updatePricelist = (id: string, updates: Partial<Pricelist>) => {
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const addManualItem = (plId: string) => {
        const pl = pricelists.find(p => p.id === plId);
        if (!pl) return;
        const newItem: PricelistManualItem = {
            id: generateId('item'),
            name: '',
            price: '',
            category: ''
        };
        updatePricelist(plId, { manualItems: [...(pl.manualItems || []), newItem] });
    };

    const updateManualItem = (plId: string, itemId: string, updates: Partial<PricelistManualItem>) => {
        const pl = pricelists.find(p => p.id === plId);
        if (!pl) return;
        const newItems = (pl.manualItems || []).map(i => i.id === itemId ? { ...i, ...updates } : i);
        updatePricelist(plId, { manualItems: newItems });
    };

    const removeManualItem = (plId: string, itemId: string) => {
        const pl = pricelists.find(p => p.id === plId);
        if (!pl) return;
        updatePricelist(plId, { manualItems: (pl.manualItems || []).filter(i => i.id !== itemId) });
    };

    const handleDeletePricelist = (id: string) => {
        if(confirm("Delete this pricelist? It will be moved to Archive.")) {
            onDeletePricelist(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             {/* Left Sidebar: Brands List */}
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <div>
                        <h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Independent List</p>
                     </div>
                     <button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1">
                        <Plus size={12} /> Add
                     </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div 
                            key={brand.id} 
                            onClick={() => setSelectedBrand(brand)}
                            className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                         >
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                     {brand.logoUrl ? (
                                         <img src={brand.logoUrl} className="w-full h-full object-contain" />
                                     ) : (
                                         <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>
                                     )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div>
                                     <div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div>
                                 </div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input 
                                         value={brand.name} 
                                         onChange={(e) => updateBrand(brand.id, { name: e.target.value })}
                                         className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent"
                                         placeholder="Brand Name"
                                     />
                                     <FileUpload 
                                         label="Brand Logo" 
                                         currentUrl={brand.logoUrl} 
                                         onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url })} 
                                     />
                                     <button 
                                         onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }}
                                         className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded"
                                     >
                                         Delete Brand
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             
             {/* Right Content: Pricelist Grid */}
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate mr-2 max-w-[60%]">
                         {selectedBrand ? selectedBrand.name : 'Select Brand'}
                     </h3>
                     <button 
                        onClick={addPricelist} 
                        disabled={!selectedBrand}
                        className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        <Plus size={12} /> Add <span className="hidden md:inline">Pricelist</span>
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 content-start pb-10">
                     {sortedLists.map((item) => (
                         <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-3 md:p-4 gap-3">
                             <div className="flex justify-between items-start">
                                 <div className="flex-1">
                                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">List Title</label>
                                     <input 
                                         value={item.title} 
                                         onChange={(e) => updatePricelist(item.id, { title: e.target.value })}
                                         className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs md:text-sm" 
                                         placeholder="e.g. Retail Price List"
                                     />
                                 </div>
                                 <div className="flex flex-col items-end gap-2">
                                     <div className="flex bg-slate-100 p-1 rounded-lg">
                                         <button 
                                            onClick={() => updatePricelist(item.id, { type: 'pdf' })}
                                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${item.type === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                         >PDF</button>
                                         <button 
                                            onClick={() => updatePricelist(item.id, { type: 'manual' })}
                                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${item.type === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                         >Manual</button>
                                     </div>
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                 <div>
                                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label>
                                     <select 
                                         value={item.month} 
                                         onChange={(e) => updatePricelist(item.id, { month: e.target.value })}
                                         className="w-full text-[10px] md:text-xs font-bold p-1 bg-slate-50 rounded border border-slate-200"
                                     >
                                         {months.map(m => <option key={m} value={m}>{m}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label>
                                     <input 
                                         type="number"
                                         value={item.year} 
                                         onChange={(e) => updatePricelist(item.id, { year: e.target.value })}
                                         className="w-full text-[10px] md:text-xs font-bold p-1 bg-slate-50 rounded border border-slate-200"
                                     />
                                 </div>
                             </div>

                             {item.type === 'pdf' ? (
                                <div className="mt-1 md:mt-2 grid grid-cols-2 gap-2">
                                    <FileUpload 
                                        label="Thumbnail" 
                                        accept="image/*"
                                        currentUrl={item.thumbnailUrl}
                                        onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url })} 
                                    />
                                    <FileUpload 
                                        label="Upload PDF" 
                                        accept="application/pdf" 
                                        icon={<FileText />}
                                        currentUrl={item.url}
                                        onUpload={(url: any) => updatePricelist(item.id, { url: url })} 
                                    />
                                </div>
                             ) : (
                                <div className="mt-1 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                     <div className="flex justify-between items-center">
                                         <label className="text-[9px] font-black text-slate-400 uppercase">Pricelist Items</label>
                                         <button 
                                            onClick={() => addManualItem(item.id)}
                                            className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase flex items-center gap-1"
                                         >
                                             <Plus size={10} /> Add Item
                                         </button>
                                     </div>
                                     <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                         {(item.manualItems || []).map((mItem) => (
                                             <div key={mItem.id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm relative group">
                                                 <button 
                                                    onClick={() => removeManualItem(item.id, mItem.id)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                 ><X size={8}/></button>
                                                 <div className="grid grid-cols-12 gap-2">
                                                     <input 
                                                        value={mItem.name} 
                                                        onChange={(e) => updateManualItem(item.id, mItem.id, { name: e.target.value })}
                                                        placeholder="Product Name" 
                                                        className="col-span-8 text-[10px] font-bold outline-none border-b border-transparent focus:border-blue-300" 
                                                     />
                                                     <input 
                                                        value={mItem.price} 
                                                        onChange={(e) => updateManualItem(item.id, mItem.id, { price: e.target.value })}
                                                        placeholder="Price" 
                                                        className="col-span-4 text-[10px] font-mono font-black text-green-600 outline-none border-b border-transparent focus:border-blue-300 text-right" 
                                                     />
                                                 </div>
                                                 <input 
                                                    value={mItem.category || ''} 
                                                    onChange={(e) => updateManualItem(item.id, mItem.id, { category: e.target.value })}
                                                    placeholder="Category / Short Desc" 
                                                    className="w-full text-[8px] mt-1 text-slate-400 outline-none border-b border-transparent focus:border-blue-300 uppercase tracking-wider" 
                                                 />
                                             </div>
                                         ))}
                                         {(item.manualItems || []).length === 0 && (
                                             <div className="py-4 text-center text-slate-300 text-[10px] font-bold uppercase italic">No items added</div>
                                         )}
                                     </div>
                                </div>
                             )}

                             <button 
                                onClick={() => handleDeletePricelist(item.id)}
                                className="mt-auto pt-2 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                             >
                                 <Trash2 size={12} /> Delete
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

// AdminDashboard component added to fix 'Module has no exported member AdminDashboard'
const AdminDashboard = ({ 
    storeData, 
    onUpdateData, 
    onRefresh 
}: { 
    storeData: StoreData | null, 
    onUpdateData: (d: StoreData) => Promise<void>,
    onRefresh: () => void
}) => {
    const [activeTab, setActiveTab] = useState('inventory');
    
    if (!storeData) return null;

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Minimal Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                <div className="p-6 font-black text-xl uppercase tracking-widest border-b border-slate-800 flex items-center gap-2">
                    <RIcon size={24} className="text-blue-500" /> Admin
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('inventory')} className={`w-full text-left p-3 rounded-xl font-bold uppercase text-xs ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Inventory</button>
                    <button onClick={() => setActiveTab('pricelists')} className={`w-full text-left p-3 rounded-xl font-bold uppercase text-xs ${activeTab === 'pricelists' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Pricelists</button>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => window.location.pathname = '/'} className="w-full flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase text-xs p-2">
                        <LogOut size={16} /> Exit
                    </button>
                </div>
            </div>
            
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
                    <h2 className="font-black text-slate-900 uppercase tracking-tight">{activeTab}</h2>
                    <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <RefreshCw size={20} />
                    </button>
                </header>
                <div className="flex-1 overflow-hidden p-6">
                    {activeTab === 'pricelists' && (
                        <PricelistManager 
                            pricelists={storeData.pricelists || []}
                            pricelistBrands={storeData.pricelistBrands || []}
                            onSavePricelists={(p) => onUpdateData({ ...storeData, pricelists: p })}
                            onSaveBrands={(b) => onUpdateData({ ...storeData, pricelistBrands: b })}
                            onDeletePricelist={(id) => onUpdateData({ ...storeData, pricelists: (storeData.pricelists || []).filter(p => p.id !== id) })}
                        />
                    )}
                    {activeTab === 'inventory' && (
                        <div className="text-slate-400 font-bold uppercase italic text-center py-20">Inventory Manager Placeholder</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export { AdminDashboard, PricelistManager };
