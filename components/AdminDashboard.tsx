
import React, { useState, useEffect, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, AlignLeft, Table
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistRow } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const FileUpload = ({ label, currentUrl, onUpload, accept = "image/*", icon }: { label: string, currentUrl?: string, onUpload: (url: string) => void, accept?: string, icon?: React.ReactNode }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadFileToStorage(file);
            onUpload(url);
        } catch (err) {
            alert("Upload failed. Check cloud connection.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={currentUrl || ''} 
                        onChange={(e) => onUpload(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute right-1 top-1 bottom-1 px-2 bg-white border border-slate-200 rounded text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : icon || <Upload size={14} />}
                    </button>
                    <input ref={fileInputRef} type="file" accept={accept} className="hidden" onChange={handleFileChange} />
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
    const [editingManualRows, setEditingManualRows] = useState<string | null>(null);

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
        const newBrand: PricelistBrand = { id: generateId('plb'), name: name, logoUrl: '' };
        onSaveBrands([...pricelistBrands, newBrand]);
        setSelectedBrand(newBrand);
    };

    const updateBrand = (id: string, updates: Partial<PricelistBrand>) => {
        const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b);
        onSaveBrands(updatedBrands);
        if (selectedBrand?.id === id) setSelectedBrand({ ...selectedBrand, ...updates });
    };

    const deleteBrand = (id: string) => {
        if (confirm("Delete this brand? This will also hide associated pricelists.")) {
            onSaveBrands(pricelistBrands.filter(b => b.id !== id));
        }
    };

    const addPricelist = (type: 'pdf' | 'manual') => {
        if (!selectedBrand) return;
        const newItem: Pricelist = {
            id: generateId('pl'),
            brandId: selectedBrand.id,
            title: type === 'manual' ? 'Manual Price Table' : 'New Price List Document',
            type: type,
            url: '',
            month: months[new Date().getMonth()],
            year: new Date().getFullYear().toString(),
            dateAdded: new Date().toISOString(),
            rows: type === 'manual' ? [] : undefined
        };
        onSavePricelists([...pricelists, newItem]);
        if (type === 'manual') setEditingManualRows(newItem.id);
    };

    const updatePricelist = (id: string, updates: Partial<Pricelist>) => {
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const addRow = (listId: string) => {
        const list = pricelists.find(p => p.id === listId);
        if (!list) return;
        const newRow: PricelistRow = { sku: '', description: '', normalPrice: '', promoPrice: '' };
        updatePricelist(listId, { rows: [...(list.rows || []), newRow] });
    };

    const updateRow = (listId: string, rowIndex: number, updates: Partial<PricelistRow>) => {
        const list = pricelists.find(p => p.id === listId);
        if (!list || !list.rows) return;
        const newRows = [...list.rows];
        newRows[rowIndex] = { ...newRows[rowIndex], ...updates };
        updatePricelist(listId, { rows: newRows });
    };

    const removeRow = (listId: string, rowIndex: number) => {
        const list = pricelists.find(p => p.id === listId);
        if (!list || !list.rows) return;
        updatePricelist(listId, { rows: list.rows.filter((_, i) => i !== rowIndex) });
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2>
                     <button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div><div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Brand Name" />
                                     <FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url })} />
                                     <button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }} className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete Brand</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate mr-2 max-w-[40%]">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3>
                     <div className="flex gap-2">
                        <button onClick={() => addPricelist('pdf')} disabled={!selectedBrand} className="bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 disabled:opacity-50"><FileText size={12} /> <span className="hidden md:inline">Add PDF</span></button>
                        <button onClick={() => addPricelist('manual')} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 disabled:opacity-50"><Table size={12} /> <span className="hidden md:inline">Manual Builder</span></button>
                     </div>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start pb-10">
                     {sortedLists.map((item) => (
                         <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 relative">
                             <div className="flex justify-between items-start">
                                 <div className="flex-1">
                                     <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Title</label>
                                     <input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-sm" />
                                 </div>
                                 <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.type === 'manual' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.type}</div>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                 <div><label className="block text-[9px] font-bold text-slate-400 mb-1">Month</label><select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                                 <div><label className="block text-[9px] font-bold text-slate-400 mb-1">Year</label><input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value })} className="w-full text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200" /></div>
                             </div>
                             
                             {item.type === 'pdf' ? (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <FileUpload label="Thumbnail" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url })} />
                                    <FileUpload label="Upload PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url })} />
                                </div>
                             ) : (
                                <button onClick={() => setEditingManualRows(item.id)} className="w-full py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"><Table size={14} /> Open Row Editor ({item.rows?.length || 0} Rows)</button>
                             )}

                             <button onClick={() => onDeletePricelist(item.id)} className="pt-2 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                         </div>
                     ))}
                 </div>
             </div>

             {/* MANUAL ROW EDITOR MODAL */}
             {editingManualRows && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
                    <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Manual Price Builder</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase">{pricelists.find(p=>p.id===editingManualRows)?.title}</p>
                            </div>
                            <button onClick={() => setEditingManualRows(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="text-[10px] font-black uppercase text-slate-400 border-b-2 border-slate-100">
                                        <th className="p-3 text-left w-[150px]">SKU</th>
                                        <th className="p-3 text-left">Description</th>
                                        <th className="p-3 text-left w-[120px]">Normal Price</th>
                                        <th className="p-3 text-left w-[120px]">Promo Price</th>
                                        <th className="p-3 text-center w-[50px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(pricelists.find(p=>p.id===editingManualRows)?.rows || []).map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 group hover:bg-slate-50 transition-colors">
                                            <td className="p-1"><input value={row.sku} onChange={(e)=>updateRow(editingManualRows!, idx, {sku: e.target.value})} className="w-full p-2 text-xs font-bold bg-transparent focus:bg-white border-transparent focus:border-blue-500 border rounded outline-none" placeholder="SKU-123"/></td>
                                            <td className="p-1"><input value={row.description} onChange={(e)=>updateRow(editingManualRows!, idx, {description: e.target.value})} className="w-full p-2 text-xs font-bold bg-transparent focus:bg-white border-transparent focus:border-blue-500 border rounded outline-none" placeholder="Product Name / Model"/></td>
                                            <td className="p-1"><input value={row.normalPrice} onChange={(e)=>updateRow(editingManualRows!, idx, {normalPrice: e.target.value})} className="w-full p-2 text-xs font-bold bg-transparent focus:bg-white border-transparent focus:border-blue-500 border rounded outline-none" placeholder="R 1,299"/></td>
                                            <td className="p-1"><input value={row.promoPrice} onChange={(e)=>updateRow(editingManualRows!, idx, {promoPrice: e.target.value})} className="w-full p-2 text-xs font-bold bg-transparent focus:bg-white border-transparent focus:border-blue-500 border rounded outline-none" placeholder="R 999"/></td>
                                            <td className="p-1 text-center"><button onClick={()=>removeRow(editingManualRows!, idx)} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={()=>addRow(editingManualRows!)} className="mt-6 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-black uppercase text-xs hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Plus size={18}/> Add New Price Row</button>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button onClick={() => setEditingManualRows(null)} className="px-10 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-slate-800 transition-all">Done Editing</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export const AdminDashboard = ({ 
    storeData, 
    onUpdateData, 
    onRefresh 
}: { 
    storeData: StoreData | null, 
    onUpdateData: (d: StoreData) => void,
    onRefresh: () => void
}) => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [showSetupGuide, setShowSetupGuide] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!storeData) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdateData(storeData);
        } finally {
            setSaving(false);
        }
    };

    const addBrand = () => {
        const name = prompt("Enter Brand Name:");
        if (!name) return;
        const newBrand: Brand = { id: generateId('br'), name, categories: [] };
        onUpdateData({ ...storeData, brands: [...(storeData.brands || []), newBrand] });
    };

    const deleteBrand = (id: string) => {
        if (!confirm("Are you sure? This deletes ALL categories and products for this brand.")) return;
        onUpdateData({ ...storeData, brands: storeData.brands.filter(b => b.id !== id) });
    };

    const updateBrand = (id: string, updates: Partial<Brand>) => {
        const updatedBrands = storeData.brands.map(b => b.id === id ? { ...b, ...updates } : b);
        onUpdateData({ ...storeData, brands: updatedBrands });
    };

    // Sub-renderers for Inventory
    const renderInventory = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><Box className="text-blue-500" /> Catalog Inventory</h2>
                <button onClick={addBrand} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-900/20"><Plus size={16} /> Add Brand</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeData.brands.map(brand => (
                    <div key={brand.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-blue-300 transition-all">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0">
                                {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-xl">{brand.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-900 uppercase truncate text-sm">{brand.name}</h3>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{brand.categories.length} Categories</div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setEditingBrandId(editingBrandId === brand.id ? null : brand.id)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                <button onClick={() => deleteBrand(brand.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {editingBrandId === brand.id && (
                            <div className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-4 animate-fade-in">
                                <input value={brand.name} onChange={e => updateBrand(brand.id, { name: e.target.value })} className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-bold uppercase outline-none focus:ring-2 ring-blue-500/20" placeholder="Brand Name" />
                                <FileUpload label="Logo URL" currentUrl={brand.logoUrl} onUpload={url => updateBrand(brand.id, { logoUrl: url })} />
                            </div>
                        )}

                        <div className="p-2 space-y-1">
                            {brand.categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group/cat transition-colors">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight size={14} className="text-slate-300" />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{cat.name} ({cat.products.length})</span>
                                    </div>
                                    <div className="flex opacity-0 group-hover/cat:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600"><Plus size={14} /></button>
                                        <button className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 border-2 border-dashed border-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-300 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mt-2"><Plus size={14} /> New Category</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderScreensaver = () => (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
                 <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><MonitorPlay className="text-blue-500" /> Screensaver Engine</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Idle Timeout (Seconds)</label>
                        <input 
                            type="number" 
                            value={storeData.screensaverSettings?.idleTimeout} 
                            onChange={e => onUpdateData({ ...storeData, screensaverSettings: { ...storeData.screensaverSettings!, idleTimeout: parseInt(e.target.value) } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Image Duration (Seconds)</label>
                        <input 
                            type="number" 
                            value={storeData.screensaverSettings?.imageDuration} 
                            onChange={e => onUpdateData({ ...storeData, screensaverSettings: { ...storeData.screensaverSettings!, imageDuration: parseInt(e.target.value) } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl outline-none focus:border-blue-500"
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                    {[
                        { label: 'Show Products', key: 'showProductImages' },
                        { label: 'Show Videos', key: 'showProductVideos' },
                        { label: 'Show Catalogues', key: 'showPamphlets' },
                        { label: 'Show Ads', key: 'showCustomAds' },
                        { label: 'Mute Videos', key: 'muteVideos' },
                        { label: 'Info Overlay', key: 'showInfoOverlay' }
                    ].map(opt => (
                        <button 
                            key={opt.key}
                            onClick={() => onUpdateData({ ...storeData, screensaverSettings: { ...storeData.screensaverSettings!, [opt.key]: !(storeData.screensaverSettings as any)[opt.key] } })}
                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${(storeData.screensaverSettings as any)[opt.key] ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                            {(storeData.screensaverSettings as any)[opt.key] ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                    ))}
                 </div>
             </div>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden">
            {/* Admin Bar */}
            <header className="bg-slate-900 text-white h-16 md:h-20 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-2xl z-50">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none flex items-center gap-3">
                            <ShieldCheck className="text-blue-500" size={24} /> Admin Hub
                        </h1>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 hidden md:block">System Management Console</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={onRefresh} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors" title="Reload Cloud Data"><RefreshCw size={20} /></button>
                    <button onClick={() => setShowSetupGuide(true)} className="flex items-center gap-2 bg-blue-900/40 text-blue-400 px-4 py-2 rounded-xl font-black uppercase text-[10px] border border-blue-800/30 hover:bg-blue-800/50 transition-all"><HelpCircle size={14} /> Setup Guide</button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 md:py-3 rounded-xl font-black uppercase text-xs shadow-lg shadow-green-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <SaveAll size={16} />}
                        <span>Save Changes</span>
                    </button>
                    <button onClick={() => window.location.href = "/"} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-red-400 transition-colors" title="Exit to Kiosk"><Power size={20} /></button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Navigation Sidebar */}
                <nav className="w-64 bg-white border-r border-slate-200 overflow-y-auto hidden lg:flex flex-col p-4 shrink-0">
                    <div className="space-y-1">
                        {[
                            { id: 'inventory', icon: Package, label: 'Inventory' },
                            { id: 'marketing', icon: Megaphone, label: 'Marketing' },
                            { id: 'pricelists', icon: Table, label: 'Pricelists' },
                            { id: 'tv', icon: Tv, label: 'TV Mode' },
                            { id: 'screensaver', icon: MonitorPlay, label: 'Screensaver' },
                            { id: 'fleet', icon: Tablet, label: 'Fleet' },
                            { id: 'settings', icon: Settings, label: 'Settings' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button onClick={() => { if(confirm("RESET ALL DATA TO DEFAULTS?")) resetStoreData(); }} className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500 hover:bg-red-50 font-black uppercase text-[10px] transition-all">
                            <RotateCcw size={18} /> Reset System
                        </button>
                    </div>
                </nav>

                {/* Main View Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                    {activeTab === 'inventory' && renderInventory()}
                    {activeTab === 'screensaver' && renderScreensaver()}
                    {activeTab === 'pricelists' && (
                        <PricelistManager 
                            pricelists={storeData.pricelists || []} 
                            pricelistBrands={storeData.pricelistBrands || []} 
                            onSavePricelists={p => onUpdateData({ ...storeData, pricelists: p })} 
                            onSaveBrands={b => onUpdateData({ ...storeData, pricelistBrands: b })} 
                            onDeletePricelist={id => onUpdateData({ ...storeData, pricelists: storeData.pricelists?.filter(p => p.id !== id) })} 
                        />
                    )}
                    
                    {/* Placeholder for other tabs to keep UI responsive */}
                    {['marketing', 'tv', 'fleet', 'settings'].includes(activeTab) && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                            <LayoutGrid size={80} />
                            <h2 className="font-black uppercase text-xl tracking-widest">{activeTab} Manager</h2>
                            <p className="font-medium text-sm">Full management logic for this tab is coming in next release.</p>
                        </div>
                    )}
                </main>
            </div>

            {showSetupGuide && <SetupGuide onClose={() => setShowSetupGuide(false)} />}
        </div>
    );
};
