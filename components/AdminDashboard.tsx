
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, MoveHorizontal, AlignLeft, AlignCenter, AlignRight, Type, Lamp, Film, Cast
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData, upsertBrand, upsertCategory, upsertProduct, upsertPricelist, upsertPricelistBrand, deleteItem } from '../services/geminiService';
import { smartUpload, supabase, checkCloudConnection, convertPdfToImages } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// ... existing SignalStrengthBars, RIcon ...
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

// ... SystemDocumentation ...
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    
    const sections = [
        { id: 'architecture', label: '1. Architecture', icon: <Network size={16} />, desc: 'Offline-First Philosophy' },
        { id: 'inventory', label: '2. Data Tree', icon: <Box size={16}/>, desc: 'Relational Structure' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Rounding Psychology' },
        { id: 'screensaver', label: '4. Visual Engine', icon: <Zap size={16}/>, desc: 'Double-Buffer Loop' },
        { id: 'fleet', label: '5. Fleet Pulse', icon: <Activity size={16}/>, desc: 'Telemetry Heartbeat' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Display Queue' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Deep-dive engineering concepts explained simply.</p>
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
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-6">
                            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Philosophy</div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Delta Architecture</h2>
                            <div className="prose prose-lg text-slate-600 leading-relaxed">
                                <p>
                                    Most systems save the entire database on every edit. We use a <strong>Delta Update</strong> strategy. When you edit a single product, the Admin Dashboard pushes only that tiny JSON fragment to the cloud.
                                </p>
                                <p>
                                    The <strong>Real-Time Socket</strong> layer immediately broadcasts this delta to all active Kiosks. They patch their local database instantly, without reloading the page or re-fetching the entire inventory.
                                    This ensures the system remains lightning fast even with thousands of products.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* ... other sections unchanged ... */}
            </div>
        </div>
    );
};

// ... existing HexagonIcon, CalculatorIcon, Auth ...
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) { onLogin(admin); } else { setError('Invalid credentials.'); }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in"><div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300"><h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1><p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p><form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} /></div>{error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}<button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button></form></div></div>
  );
};

// ... existing FileUpload, InputField ...
const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false, onRasterize }: any) => {
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Uploading...');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files && e.target.files.length > 0) { 
          setIsProcessing(true); 
          setUploadProgress(10); 
          const files = Array.from(e.target.files) as File[]; 
          let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image'; 
          
          const uploadSingle = async (file: File) => { 
              try { 
                  const url = await smartUpload(file); 
                  return url; 
              } catch (e: any) { 
                  const msg = e.message || "Storage Access Error"; 
                  alert(`Upload Failed: ${msg}\n\nPlease ensure your device is online and has access to Cloud Storage.`); 
                  throw e; 
              } 
          }; 

          try { 
              if (allowMultiple) { 
                  const results: string[] = []; 
                  for(let i=0; i<files.length; i++) { 
                      try { 
                          const url = await uploadSingle(files[i]); 
                          results.push(url); 
                      } catch (e) {} 
                      setUploadProgress(((i+1)/files.length)*100); 
                  } 
                  if (results.length > 0) { onUpload(results, fileType); } 
              } else { 
                  try { 
                      const file = files[0];
                      const url = await uploadSingle(file); 
                      if (fileType === 'pdf' && onRasterize) {
                          setStatusText("Processing Visuals...");
                          setUploadProgress(50);
                          try {
                              const images = await convertPdfToImages(file, (curr, total) => {
                                  setStatusText(`Rasterizing Pg ${curr}/${total}`);
                                  setUploadProgress(50 + ((curr/total) * 40));
                              });
                              if (images.length > 0) {
                                  setStatusText("Uploading Pages...");
                                  const imageUrls: string[] = [];
                                  for (let i=0; i<images.length; i++) {
                                      const pageUrl = await uploadSingle(images[i]);
                                      imageUrls.push(pageUrl);
                                  }
                                  onRasterize(imageUrls);
                              }
                          } catch (err) {
                              alert("Visual conversion failed. The PDF will still be available for download.");
                          }
                      }
                      setUploadProgress(100); 
                      onUpload(url, fileType); 
                  } catch (e) {} 
              } 
          } catch (err) { 
              console.error(err); 
          } finally { 
              setTimeout(() => { 
                  setIsProcessing(false); 
                  setUploadProgress(0); 
                  setStatusText("Uploading...");
              }, 500); 
              e.target.value = ''; 
          } 
      } 
  };

  return (<div className="mb-4"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label><div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">{isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}<div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">{isProcessing ? (<Loader2 className="animate-spin text-blue-500" />) : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? (<div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div>) : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}</div><label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}><Upload size={10} className="inline mr-1" /> {isProcessing ? statusText : 'Select File'}<input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/></label></div></div>);
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (<div className={`mb-4 ${half ? 'w-full' : ''}`}><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>{isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}</div>);

// --- MODALS UPDATED FOR GRANULAR SAVE ---

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => { 
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : [], features: Array.isArray(product.features) ? product.features : [], boxContents: Array.isArray(product.boxContents) ? product.boxContents : [], specs: product.specs || {}, videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), manuals: product.manuals || [], dateAdded: product.dateAdded || new Date().toISOString() }); 
    const [newFeature, setNewFeature] = useState(''); 
    const [newBoxItem, setNewBoxItem] = useState(''); 
    const [newSpecKey, setNewSpecKey] = useState(''); 
    const [newSpecValue, setNewSpecValue] = useState(''); 
    
    // ... existing helper functions (addFeature, etc.) ...
    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } }; 
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } }; 
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } }; 
    const addDimensionSet = () => { setDraft({ ...draft, dimensions: [...draft.dimensions, { label: "New Set", width: "", height: "", depth: "", weight: "" }] }); }; 
    const updateDimension = (index: number, field: keyof DimensionSet, value: string) => { const newDims = [...draft.dimensions]; newDims[index] = { ...newDims[index], [field]: value }; setDraft({ ...draft, dimensions: newDims }); }; 
    const removeDimension = (index: number) => { const newDims = draft.dimensions.filter((_, i) => i !== index); setDraft({ ...draft, dimensions: newDims }); }; 
    const addManual = () => { const newManual: Manual = { id: generateId('man'), title: "New Manual", images: [], pdfUrl: '', thumbnailUrl: '' }; setDraft({ ...draft, manuals: [...(draft.manuals || []), newManual] }); }; 
    const removeManual = (id: string) => { setDraft({ ...draft, manuals: (draft.manuals || []).filter(m => m.id !== id) }); }; 
    const updateManual = (id: string, updates: Partial<Manual>) => { setDraft({ ...draft, manuals: (draft.manuals || []).map(m => m.id === id ? { ...m, ...updates } : m) }); }; 

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pb-20">
                {/* ... existing input fields for name, sku, description, media, features, specs ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        {/* ... */}
                    </div>
                    {/* ... Media, Features, Specs UI ... */}
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        {/* ... etc ... */}
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0">
                <button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button>
                <button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg flex items-center gap-2">
                    <Check size={16} /> Save Product (Push Delta)
                </button>
            </div>
        </div>
    ); 
};

// ... CategoryEditorModal, KioskEditorModal similarly updated to ensure cleaner UI ...

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData, saveToCloud: boolean) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  // ... state ...
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  // Sync localData with storeData prop (which is updated by Realtime Deltas in App.tsx)
  useEffect(() => {
      setLocalData(storeData);
  }, [storeData]);

  // Updated to support granular "delta" updates without triggering full save
  const handleLocalUpdate = (newData: StoreData, immediate = false, saveToCloud = true) => {
      setLocalData(newData);
      if (immediate) { 
          onUpdateData(newData, saveToCloud); 
      }
  };

  // ... other logic ...

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  // ... renders ...

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            {/* Header Content */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Settings className="text-blue-500" size={24} />
                    <h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                        {isCloudConnected ? <Cast size={14} className="animate-pulse"/> : <HardDrive size={14} />}
                        <span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Live Socket' : 'Local Mode'}</span>
                    </div>
                    {/* ... Logout ... */}
                </div>
            </div>
            {/* Tabs */}
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {/* ... Content ... */}
            {activeTab === 'inventory' && (
                // ... Inventory Logic ...
                // Example: Creating a Brand
                <button onClick={() => { 
                    const name = prompt("Brand Name:"); 
                    if(name) { 
                        const newBrand = { id: generateId('b'), name, categories: [] };
                        // 1. Push Delta
                        upsertBrand(newBrand);
                        // 2. Update Local State (Immediate Feedback), BUT skip full cloud save
                        const updatedData = { ...localData, brands: [...localData.brands, newBrand] };
                        handleLocalUpdate(updatedData, true, false); 
                    } 
                }} className="...">Add Brand</button>
            )}
        </main>

        {/* Example: Saving Product via Delta */}
        {/* editingProduct Modal logic */}
        {/* onSave: (p) => {
             // 1. Push Delta to Cloud
             upsertProduct(p, selectedCategory.id);
             // 2. Update Local State
             const updatedData = ... ; // merge logic
             // 3. Notify App (but skip full save)
             handleLocalUpdate(updatedData, true, false);
             setEditingProduct(null);
        } */}
    </div>
  );
};

export default AdminDashboard;
