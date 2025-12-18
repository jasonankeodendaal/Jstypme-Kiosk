
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
import JSZip from 'jszip';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

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

// ... Rest of component same as before ...
