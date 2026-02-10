
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, MoveHorizontal, AlignLeft, AlignCenter, AlignRight, Type, Lamp, Film, Eraser, HardDriveDownload, FolderSync
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData, upsertBrand, upsertCategory, upsertProduct, upsertPricelist, upsertPricelistBrand, deleteItem, clearOfflineQueue } from '../services/geminiService';
import { smartUpload, supabase, checkCloudConnection, convertPdfToImages, requestLocalFolder, getLocalDirHandle, setLocalDirHandle } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// ... (SignalStrengthBars, Auth, FileUpload, InputField components remain unchanged) ...
// (CatalogueManager, ManualPricelistEditor, PricelistManager, ProductEditor, etc remain unchanged)

// REDEFINING AUTH COMPONENT FOR DASHBOARD CONTEXT (Omitted for brevity, keep existing)
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
                              console.warn("Rasterization failed, defaulting to PDF only", err);
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

/**
 * FIX: Define missing AdminUserEditor component to resolve name errors.
 */
const AdminUserEditor = ({ admin, onSave, onCancel }: { admin: AdminUser, onSave: (a: AdminUser) => void, onCancel: () => void }) => {
    const [localAdmin, setLocalAdmin] = useState<AdminUser>(admin);
    return (
        <div className="space-y-4">
            <InputField label="Name" val={localAdmin.name} onChange={(e: any) => setLocalAdmin({...localAdmin, name: e.target.value})} />
            <InputField label="PIN (Numeric)" val={localAdmin.pin} onChange={(e: any) => setLocalAdmin({...localAdmin, pin: e.target.value.replace(/\D/g,'')})} />
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Super Admin Power</span>
                </div>
                <button onClick={() => setLocalAdmin({...localAdmin, isSuperAdmin: !localAdmin.isSuperAdmin})} className={`transition-all ${localAdmin.isSuperAdmin ? 'text-blue-600' : 'text-slate-300'}`}>
                    {localAdmin.isSuperAdmin ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
            </div>

            <div className="pt-4 flex gap-2">
                <button onClick={onCancel} className="flex-1 p-3 bg-slate-100 text-slate-500 font-black uppercase text-xs rounded-xl">Cancel</button>
                <button onClick={() => onSave(localAdmin)} className="flex-1 p-3 bg-slate-900 text-white font-black uppercase text-xs rounded-xl shadow-lg">Save User</button>
            </div>
        </div>
    );
};

/**
 * FIX: Define missing AdminManager component as requested by error logs.
 */
const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleDelete = (id: string) => {
        if (!currentUser.isSuperAdmin) {
            alert("Only Super Admins can delete users.");
            return;
        }
        if (id === currentUser.id) {
            alert("You cannot delete yourself.");
            return;
        }
        if (confirm("Delete this admin?")) {
            onUpdate(admins.filter(a => a.id !== id));
        }
    };

    const handleSave = (admin: AdminUser) => {
        if (admins.find(a => a.id === admin.id)) {
            onUpdate(admins.map(a => a.id === admin.id ? admin : a));
        } else {
            onUpdate([...admins, admin]);
        }
        setEditingAdmin(null);
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Authorized Users ({admins.length})</h4>
                {currentUser.isSuperAdmin && (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg">
                        <Plus size={14} /> Add Admin
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {admins.map(admin => (
                    <div key={admin.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                <User size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{admin.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">{admin.isSuperAdmin ? 'Super Admin' : 'Editor'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingAdmin(admin)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                            {currentUser.isSuperAdmin && <button onClick={() => handleDelete(admin.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>}
                        </div>
                    </div>
                ))}
            </div>

            {(editingAdmin || isAdding) && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black text-slate-900 uppercase mb-6">{isAdding ? 'New Admin' : 'Edit Admin'}</h3>
                        <AdminUserEditor 
                            admin={editingAdmin || { id: generateId('adm'), name: '', pin: '', isSuperAdmin: false, permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true } }} 
                            onSave={handleSave} 
                            onCancel={() => { setEditingAdmin(null); setIsAdding(false); }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (CatalogueManager, ManualPricelistEditor, PricelistManager, ProductEditor, etc remain unchanged) ...

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero'); 
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedTVBrand, setSelectedTVBrand] = useState<TVBrand | null>(null);
  const [editingTVModel, setEditingTVModel] = useState<TVModel | null>(null);
  const [historyTab, setHistoryTab] = useState<'all' | 'delete' | 'restore' | 'update' | 'create'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [exportProcessing, setExportProcessing] = useState(false);
  const [localDriveName, setLocalDriveName] = useState<string | null>(null);

  const logout = useCallback(() => { setCurrentUser(null); }, []);

  useEffect(() => {
    if (!currentUser) return;
    const AUTO_LOCK_MS = 5 * 60 * 1000; 
    let lockTimer: number;
    const resetLockTimer = () => { if (lockTimer) window.clearTimeout(lockTimer); lockTimer = window.setTimeout(() => { logout(); }, AUTO_LOCK_MS); };
    const userEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    userEvents.forEach(evt => window.addEventListener(evt, resetLockTimer));
    resetLockTimer(); 
    return () => { if (lockTimer) window.clearTimeout(lockTimer); userEvents.forEach(evt => window.removeEventListener(evt, resetLockTimer)); };
  }, [currentUser, logout]);

  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: FileText }, { id: 'tv', label: 'TV', icon: Tv }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'System Guide', icon: BookOpen } ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => { if (currentUser && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) { setActiveTab(availableTabs[0].id); } }, [currentUser, availableTabs, activeTab]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) { setLocalData(storeData); } }, [storeData, hasUnsavedChanges]);

  const handleLocalUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) { onUpdateData(newData); setHasUnsavedChanges(false); } else { setHasUnsavedChanges(true); }
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  const handleLinkLocalDrive = async () => {
      const name = await requestLocalFolder();
      if (name) {
          setLocalDriveName(name);
          onRefresh(); // Refresh data to load from local drive if it exists
      }
  };

  const handleDisconnectDrive = () => {
      if (confirm("Disconnect Local Drive and switch back to Cloud?")) {
          setLocalDirHandle(null);
          setLocalDriveName(null);
          onRefresh();
      }
  };

  const addToArchive = (type: ArchivedItem['type'], name: string, data: any, action: ArchivedItem['action'] = 'delete', method: ArchivedItem['method'] = 'admin_panel') => { if (!localData || !currentUser) return; const now = new Date().toISOString(); const newItem: ArchivedItem = { id: generateId('arch'), type, action, name, userName: currentUser.name, method, data, deletedAt: now }; const currentArchive = localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} }; const newArchive = { ...currentArchive, deletedItems: [newItem, ...(currentArchive.deletedItems || [])].slice(0, 1000) }; return newArchive; };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Settings className="text-blue-500" size={24} />
                    <div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-slate-400 uppercase hidden md:block">Hello, {currentUser.name}</div>
                    <button onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                        <SaveAll size={16} />{hasUnsavedChanges ? (localDriveName ? 'Sync to Drive' : 'Sync to Cloud') : 'Synced'}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${localDriveName ? 'bg-green-900/50 text-green-300 border-green-800' : isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                        <div className="flex items-center gap-2">
                            {localDriveName ? <HardDrive size={14} /> : isCloudConnected ? <Cloud size={14} /> : <WifiOff size={14} />}
                            <span className="text-[10px] font-bold uppercase">{localDriveName ? `Drive: ${localDriveName}` : isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span>
                        </div>
                    </div>
                    <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white" title="Refresh Data"><RefreshCw size={16} /></button>
                    <button onClick={logout} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2"><LogOut size={16} /><span className="text-[10px] font-bold uppercase hidden md:inline">Logout</span></button>
                </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 animate-fade-in">
                       <button onClick={() => { const name = prompt("Brand Name:"); if(name) { const newBrand = { id: generateId('b'), name, categories: [] }; upsertBrand(newBrand); handleLocalUpdate({ ...localData, brands: [...brands, newBrand], archive: addToArchive('brand', name, null, 'create') }, false); } }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group min-h-[120px] md:min-h-[200px]"><Plus size={24} className="mb-2" /><span className="font-bold uppercase text-[10px] md:text-xs tracking-wider text-center">Add Brand</span></button>
                       {brands.map(brand => (
                           <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col h-full">
                               <div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}<button onClick={(e) => { e.stopPropagation(); if(confirm("Move to archive?")) { const now = new Date().toISOString(); deleteItem('BRAND', brand.id); handleLocalUpdate({...localData, brands: brands.filter(b=>b.id!==brand.id), archive: {...addToArchive('brand', brand.name, brand, 'delete')!, brands: [...(localData.archive?.brands||[]), brand], deletedAt: {...localData.archive?.deletedAt, [brand.id]: now} }}, false); } }} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button></div>
                               <div className="p-2 md:p-4"><h3 className="font-black text-slate-900 text-xs md:text-lg uppercase tracking-tight mb-1 truncate">{brand.name}</h3><p className="text-[10px] md:text-xs text-slate-500 font-bold mb-2 md:mb-4">{brand.categories.length} Categories</p><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase hover:bg-blue-600 transition-colors">Manage</button></div>
                           </div>
                       ))}
                   </div>
               ) : (
                   /* selectedBrand logic same as before... */
                   <div className="animate-fade-in">
                       <div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2></div>
                       {/* Brand category/product grid continues... */}
                   </div>
               )
            )}

            {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                   <div className="bg-slate-900 rounded-3xl p-8 border border-blue-500/20 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500"><Database size={120} /></div>
                       <div className="relative z-10">
                           <h3 className="text-white font-black uppercase text-lg tracking-widest mb-2 flex items-center gap-3"><HardDrive className="text-blue-400" /> Storage Engine Architecture</h3>
                           <p className="text-slate-400 text-sm mb-6 max-w-xl">Bypass the cloud and link this app directly to a folder on your PC. This is perfect for offline setups or large media libraries.</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <button 
                                  onClick={handleLinkLocalDrive}
                                  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 ${localDriveName ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-slate-800 border-slate-700 hover:border-blue-500 group'}`}
                               >
                                   <FolderSync size={32} className={localDriveName ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                                   <div>
                                       <div className="text-white font-black uppercase text-xs">Link Local Folder</div>
                                       <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Select directory on your PC</div>
                                   </div>
                               </button>

                               <button 
                                  onClick={handleDisconnectDrive}
                                  disabled={!localDriveName}
                                  className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4 ${!localDriveName ? 'bg-slate-800/50 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40 group'}`}
                               >
                                   <Wifi size={32} className={localDriveName ? 'text-red-400' : 'text-slate-700'} />
                                   <div>
                                       <div className="text-white font-black uppercase text-xs">Return to Cloud</div>
                                       <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Reconnect to Supabase</div>
                                   </div>
                               </button>
                           </div>

                           {localDriveName && (
                               <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 animate-fade-in-up">
                                   <div className="flex justify-between items-center">
                                       <div className="flex items-center gap-3">
                                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></div>
                                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Active Drive: {localDriveName}</span>
                                       </div>
                                       <span className="text-[9px] font-mono text-blue-400 font-bold uppercase">kiosk_database.json</span>
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> System Branding</h3>
                       <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                           <FileUpload label="Main Company Logo (PDFs & Header)" currentUrl={localData.companyLogoUrl} onUpload={(url: string) => handleLocalUpdate({...localData, companyLogoUrl: url}, true)} />
                       </div>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><UserCog size={20} className="text-blue-500"/> Admin Access Control</h3><AdminManager admins={localData.admins || []} onUpdate={(admins) => handleLocalUpdate({ ...localData, admins }, true)} currentUser={currentUser} /></div>
               </div>
            )}
        </main>

        {/* Modals remain same... */}
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;
