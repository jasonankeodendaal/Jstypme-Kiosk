
import React, { useState, useEffect, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, FileInput as FileInputIcon, ListPlus
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Custom R Icon for Pricelists
const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

// ... (SystemDocumentation and other components omitted for brevity, same as existing) ...

// --- MANUAL PRICELIST EDITOR COMPONENT ---
const ManualPricelistItemsEditor = ({ items, onUpdate }: { items: PricelistItem[], onUpdate: (i: PricelistItem[]) => void }) => {
    const addItem = () => {
        const newItem: PricelistItem = { id: generateId('pli'), name: '', description: '', price: '' };
        onUpdate([...items, newItem]);
    };

    const updateItem = (id: string, updates: Partial<PricelistItem>) => {
        onUpdate(items.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    const removeItem = (id: string) => {
        onUpdate(items.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase">Product Details</span>
                <button onClick={addItem} className="text-blue-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Plus size={12}/> Add Entry</button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 group relative">
                        <div className="col-span-4">
                            <input 
                                value={item.name} 
                                onChange={e => updateItem(item.id, { name: e.target.value })} 
                                placeholder="Product Name" 
                                className="w-full text-[11px] font-bold p-1 bg-transparent border-b border-transparent focus:border-blue-300 outline-none"
                            />
                        </div>
                        <div className="col-span-5">
                            <input 
                                value={item.description} 
                                onChange={e => updateItem(item.id, { description: e.target.value })} 
                                placeholder="Description/Specs" 
                                className="w-full text-[10px] p-1 bg-transparent border-b border-transparent focus:border-blue-300 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <input 
                                value={item.price} 
                                onChange={e => updateItem(item.id, { price: e.target.value })} 
                                placeholder="Price" 
                                className="w-full text-[10px] font-black text-green-700 p-1 bg-transparent border-b border-transparent focus:border-blue-300 outline-none"
                            />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-center py-4 text-[10px] font-bold text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">No entries. Click "Add Entry" to build list.</div>
                )}
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
        if (selectedBrand?.id === id) { setSelectedBrand({ ...selectedBrand, ...updates }); }
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
            items: [],
            month: 'January',
            year: new Date().getFullYear().toString(),
            dateAdded: new Date().toISOString()
        };
        onSavePricelists([...pricelists, newItem]);
    };

    const updatePricelist = (id: string, updates: Partial<Pricelist>) => {
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/4 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                     <h2 className="font-black text-slate-900 uppercase text-xs">Pricelist Brands</h2>
                     <button onClick={addBrand} className="bg-blue-600 text-white px-2 py-1 rounded-lg font-bold text-[9px] uppercase"><Plus size={10} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] uppercase truncate">{brand.name}</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 pt-2 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-[10px] font-bold p-1 border-b border-slate-200 outline-none bg-transparent" placeholder="Brand Name"/>
                                     <FileUpload label="Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url })} />
                                     <button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }} className="w-full text-center text-[9px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3>
                     <button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 disabled:opacity-50"><Plus size={12} /> New Pricelist</button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start pb-10">
                     {sortedLists.map((item) => (
                         <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
                             <div className="flex justify-between items-start gap-4">
                                 <div className="flex-1 space-y-2">
                                     <input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-xs uppercase" placeholder="Title"/>
                                     <div className="flex gap-2">
                                         <select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value })} className="flex-1 text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                         <input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value })} className="w-20 text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200"/>
                                     </div>
                                 </div>
                                 <div className="shrink-0 w-20 flex flex-col gap-1">
                                    <FileUpload label="Cover" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url })} />
                                 </div>
                             </div>

                             <div className="bg-slate-50 p-1 rounded-lg flex border border-slate-200">
                                 <button onClick={() => updatePricelist(item.id, { type: 'pdf' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all flex items-center justify-center gap-1 ${item.type !== 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><FileText size={10}/> PDF Mode</button>
                                 <button onClick={() => updatePricelist(item.id, { type: 'manual' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all flex items-center justify-center gap-1 ${item.type === 'manual' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}><ListPlus size={10}/> Manual Build</button>
                             </div>

                             {item.type === 'manual' ? (
                                 <ManualPricelistItemsEditor items={item.items || []} onUpdate={(items) => updatePricelist(item.id, { items })} />
                             ) : (
                                 <FileUpload label="Select PDF File" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url })} />
                             )}

                             <button onClick={() => { if(confirm("Delete?")) onDeletePricelist(item.id); }} className="mt-2 pt-2 border-t border-slate-100 text-red-500 hover:text-red-600 text-[9px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Remove</button>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};

// ... (Rest of the AdminDashboard logic, Auth, etc, remain same) ...

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[]) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);

    const handleUpdate = (newList: Catalogue[]) => {
        setLocalList(newList);
        onSave(newList); 
    };

    const addCatalogue = () => {
        handleUpdate([...localList, {
            id: generateId('cat'),
            title: brandId ? 'New Brand Catalogue' : 'New Pamphlet',
            brandId: brandId,
            type: brandId ? 'catalogue' : 'pamphlet', 
            pages: [],
            year: new Date().getFullYear(),
            startDate: '',
            endDate: ''
        }]);
    };

    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => {
        handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3>
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localList.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (
                                <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> 
                            ) : (
                                <BookOpen size={32} className="text-slate-300" />
                            )}
                            {cat.pdfUrl && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>
                            )}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            
                            {cat.type === 'catalogue' || brandId ? (
                                <div>
                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label>
                                    <input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label>
                                        <input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label>
                                        <input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" />
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <FileUpload 
                                    label="Thumbnail (Image)" 
                                    accept="image/*" 
                                    currentUrl={cat.thumbnailUrl || (cat.pages?.[0])}
                                    onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} 
                                />
                                <FileUpload 
                                    label="Document (PDF)" 
                                    accept="application/pdf" 
                                    currentUrl={cat.pdfUrl}
                                    icon={<FileText />}
                                    onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} 
                                />
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete Catalogue</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ... (Rest of FileUpload and other helpers remain same) ...
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

// Fixed error: Added missing Auth component for admin login.
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = admins.find(a => a.pin === pin);
        if (user) {
            onLogin(user);
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-2xl mb-6">
                    <ShieldCheck className="text-blue-600" size={40} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Admin Access</h1>
                <p className="text-slate-500 text-sm mb-8">Enter your security PIN to continue</p>
                
                <form onSubmit={handleLogin} className="w-full">
                    <input 
                        type="password" 
                        value={pin} 
                        onChange={(e) => { setPin(e.target.value); setError(false); }}
                        placeholder="####"
                        maxLength={8}
                        className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-center text-2xl font-black tracking-[1em] outline-none transition-all ${error ? 'border-red-500 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-900'}`}
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs font-bold mt-3 text-center uppercase tracking-wider">Invalid Access PIN</p>}
                    <button 
                        type="submit"
                        className="w-full mt-6 bg-slate-900 text-white p-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
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
  
  const [historyTab, setHistoryTab] = useState<'brands' | 'catalogues' | 'deletedItems'>('deletedItems');
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
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'screensaver', label: 'Screensaver', icon: Monitor },
      { id: 'fleet', label: 'Fleet', icon: Tablet },
      { id: 'history', label: 'History', icon: History },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'guide', label: 'System Guide', icon: BookOpen } 
  ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => {
      if (currentUser && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) {
          setActiveTab(availableTabs[0].id);
      }
  }, [currentUser]);

  useEffect(() => {
      checkCloudConnection().then(setIsCloudConnected);
      const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (!hasUnsavedChanges && storeData) {
          setLocalData(storeData);
      }
  }, [storeData]);

  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (hasUnsavedChanges) {
              e.preventDefault();
              e.returnValue = '';
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleLocalUpdate = (newData: StoreData) => {
      setLocalData(newData);
      setHasUnsavedChanges(true);
      
      if (selectedBrand) {
          const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id);
          if (updatedBrand) setSelectedBrand(updatedBrand);
      }
      if (selectedCategory && selectedBrand) {
          const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id);
          const updatedCat = updatedBrand?.categories.find(c => c.id === selectedCategory.id);
          if (updatedCat) setSelectedCategory(updatedCat);
      }
      if (selectedTVBrand && newData.tv) {
          const updatedTVBrand = newData.tv.brands.find(b => b.id === selectedTVBrand.id);
          if (updatedTVBrand) setSelectedTVBrand(updatedTVBrand);
      }
  };

  const handleGlobalSave = () => {
      if (localData) {
          onUpdateData(localData);
          setHasUnsavedChanges(false);
      }
  };
  
  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const tvBrands = Array.isArray(localData.tv?.brands) ? [...localData.tv!.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2">
                     <Settings className="text-blue-500" size={24} />
                     <div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                     <div className="text-xs font-bold text-slate-400 uppercase hidden md:block">
                         Hello, {currentUser.name}
                     </div>
                     <button 
                         onClick={handleGlobalSave}
                         disabled={!hasUnsavedChanges}
                         className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${
                             hasUnsavedChanges 
                             ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' 
                             : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                         }`}
                     >
                         <SaveAll size={16} />
                         {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                     </button>
                 </div>

                 <div className="flex items-center gap-3">
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'}`}>
                         {isCloudConnected ? <Cloud size={14} /> : <HardDrive size={14} />}
                         <span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span>
                     </div>
                     <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2">
                        <LogOut size={16} />
                        <span className="text-[10px] font-bold uppercase hidden md:inline">Logout</span>
                     </button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'inventory' && !selectedBrand && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 animate-fade-in">
                    <button onClick={() => { const name = prompt("Brand Name:"); if(name) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }] }) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group min-h-[120px] md:min-h-[200px]">
                        <Plus size={24} className="mb-2" /><span className="font-bold uppercase text-[10px] md:text-xs tracking-wider text-center">Add Brand</span>
                    </button>
                    {brands.map(brand => (
                        <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col h-full">
                            <div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">
                                {brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}
                            </div>
                            <div className="p-2 md:p-4">
                                <h3 className="font-black text-slate-900 text-xs md:text-lg uppercase tracking-tight mb-1 truncate">{brand.name}</h3>
                                <button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase hover:bg-blue-600 transition-colors">Manage</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'pricelists' && (
                <PricelistManager 
                    pricelists={localData.pricelists || []} 
                    pricelistBrands={localData.pricelistBrands || []}
                    onSavePricelists={(p) => handleLocalUpdate({ ...localData, pricelists: p })}
                    onSaveBrands={(b) => handleLocalUpdate({ ...localData, pricelistBrands: b })}
                    onDeletePricelist={(id) => {
                        const toDelete = localData.pricelists?.find(p => p.id === id);
                        if (toDelete) {
                            handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) });
                        }
                    }}
                />
            )}
            {/* ... other tab renders omitted for brevity ... */}
        </main>
        {/* ... existing modals ... */}
    </div>
  );
};
