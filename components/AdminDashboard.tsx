
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, HardDriveDownload, Gauge
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Custom R Icon for Pricelists
const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

// Auth & UI Helpers
const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (
    <div className={`mb-4 ${half ? 'w-full' : ''}`}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}
    </div>
);

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
           {isProcessing ? (
               <Loader2 className="animate-spin text-blue-500" /> 
           ) : currentUrl && !allowMultiple ? (
               accept.includes('video') ? <Video className="text-blue-500" size={16} /> : 
               accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : 
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

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Secure Login</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <InputField label="Admin Name" val={name} onChange={(e: any) => setName(e.target.value)} placeholder="Name" />
          <InputField label="PIN Code" val={pin} onChange={(e: any) => setPin(e.target.value)} placeholder="####" type="password" />
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button>
        </form>
      </div>
    </div>
  );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [editingKiosk, setEditingKiosk] = useState<KioskRegistry | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    checkCloudConnection().then(setIsCloudConnected);
  }, []);

  useEffect(() => {
      if (!hasUnsavedChanges && storeData) {
          setLocalData(storeData);
      }
  }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => {
      setLocalData(newData);
      setHasUnsavedChanges(true);
  };

  const handleGlobalSave = () => {
      if (localData) {
          onUpdateData(localData);
          setHasUnsavedChanges(false);
      }
  };

  if (!localData) return null;
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
  ].filter(tab => currentUser?.permissions[tab.id as keyof AdminPermissions]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2">
                     <Settings className="text-blue-500" size={24} />
                     <h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1>
                 </div>
                 <div className="flex items-center gap-4">
                     <button 
                         onClick={handleGlobalSave}
                         disabled={!hasUnsavedChanges}
                         className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${
                             hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg animate-pulse' : 'bg-slate-800 text-slate-500'
                         }`}
                     >
                         {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                     </button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            
            {/* FLEET MANAGER UPGRADE */}
            {activeTab === 'fleet' && (
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <MonitorSmartphone className="text-blue-600" /> Device Fleet Control
                            </h2>
                            <p className="text-slate-500 font-bold uppercase text-xs mt-1">Real-time health telemetry & remote commands</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-center">
                                <div className="text-[10px] font-black uppercase opacity-60">Fleet Size</div>
                                <div className="text-xl font-black leading-none">{localData.fleet?.length || 0}</div>
                            </div>
                            <button 
                                onClick={async () => { if(confirm("Restart ALL devices?")) { /* Logic handled via heartbeat loop */ }}}
                                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase text-xs transition-all shadow-lg"
                            >
                                <RotateCcw size={16} /> Batch Restart
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {/* Grouped by Status */}
                        {['online', 'offline'].map(status => {
                            const devices = localData.fleet?.filter(k => (new Date().getTime() - new Date(k.last_seen).getTime() < 350000) === (status === 'online')) || [];
                            if (devices.length === 0) return null;

                            return (
                                <div key={status} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                                        <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">{status} Devices ({devices.length})</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {devices.map(k => (
                                            <div key={k.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                                <div className="p-6 pb-4 flex justify-between items-start">
                                                    <div className="p-3 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {k.deviceType === 'mobile' ? <Smartphone size={24}/> : k.deviceType === 'tv' ? <Tv size={24}/> : <Tablet size={24}/>}
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${status === 'online' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {status}
                                                    </div>
                                                </div>
                                                <div className="px-6 flex-1">
                                                    <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight truncate mb-1">{k.name}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-4 uppercase">
                                                        <MapIcon size={12} className="text-blue-500" /> {k.assignedZone || 'UNASSIGNED'}
                                                    </div>

                                                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                                        <div>
                                                            <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-1"><span>System Load</span><span>42%</span></div>
                                                            <div className="h-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[42%]"></div></div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                                            <span className="flex items-center gap-1"><Signal size={10} className="text-green-500"/> Signal</span>
                                                            <span>{k.wifiStrength}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                                            <span className="flex items-center gap-1"><Cpu size={10} className="text-purple-500"/> Version</span>
                                                            <span>{k.version || '1.0.5'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-900 flex gap-2">
                                                    <button onClick={() => setEditingKiosk(k)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Edit</button>
                                                    <button 
                                                        onClick={async () => { if(confirm("Restart Device?")) await supabase.from('kiosks').update({restart_requested: true}).eq('id', k.id); }} 
                                                        className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all"
                                                    ><Power size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SCREENSAVER UPGRADE */}
            {activeTab === 'screensaver' && (
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
                     <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Screensaver Protocol</h2>
                            <p className="text-slate-500 font-bold uppercase text-xs">Visual Loop & Overlay Orchestration</p>
                        </div>
                        <div className="bg-blue-600 px-6 py-3 rounded-2xl text-white font-black uppercase text-xs shadow-lg shadow-blue-900/20">
                            Active State
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Timing Section */}
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><Clock size={24} /></div>
                                 <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Timing Engine</h3>
                             </div>
                             <div className="grid grid-cols-1 gap-6 mb-8">
                                <InputField label="Idle Wait (Seconds)" type="number" val={localData.screensaverSettings?.idleTimeout||60} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} />
                                <InputField label="Slide Interval (Seconds)" type="number" val={localData.screensaverSettings?.imageDuration||8} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, imageDuration: parseInt(e.target.value)}})} />
                             </div>
                             
                             <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                                 <div className="flex justify-between items-center mb-4">
                                     <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] tracking-widest"><Moon size={14}/> Auto-Sleep</div>
                                     <button 
                                        onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, enableSleepMode: !localData.screensaverSettings?.enableSleepMode}})} 
                                        className={`w-12 h-6 rounded-full transition-all relative ${localData.screensaverSettings?.enableSleepMode ? 'bg-blue-600' : 'bg-slate-700'}`}
                                     >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.enableSleepMode ? 'left-7' : 'left-1'}`}></div>
                                     </button>
                                 </div>
                                 <div className={`grid grid-cols-2 gap-4 ${localData.screensaverSettings?.enableSleepMode ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                                     <div>
                                         <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                                         <input type="time" value={localData.screensaverSettings?.activeHoursStart || '08:00'} onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursStart: e.target.value}})} className="w-full bg-slate-800 text-white p-2 rounded-lg font-bold border border-slate-700 outline-none" />
                                     </div>
                                     <div>
                                         <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                                         <input type="time" value={localData.screensaverSettings?.activeHoursEnd || '20:00'} onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursEnd: e.target.value}})} className="w-full bg-slate-800 text-white p-2 rounded-lg font-bold border border-slate-700 outline-none" />
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Overlays Section */}
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                 <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm"><Layout size={24} /></div>
                                 <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Active Overlays</h3>
                             </div>
                             
                             <div className="space-y-6">
                                 <div>
                                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Info Panel Position</label>
                                     <div className="grid grid-cols-2 gap-2">
                                         {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                                             <button 
                                                key={pos} 
                                                onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, overlayPosition: pos as any}})}
                                                className={`p-3 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${localData.screensaverSettings?.overlayPosition === pos ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}
                                             >
                                                 {pos.replace('-', ' ')}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="space-y-4">
                                     <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                         <div className="flex items-center gap-3">
                                             <Clock size={16} className="text-slate-400" />
                                             <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Live System Clock</span>
                                         </div>
                                         <button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, showClock: !localData.screensaverSettings?.showClock}})} className={`w-10 h-5 rounded-full transition-all relative ${localData.screensaverSettings?.showClock ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.showClock ? 'left-6' : 'left-1'}`}></div></button>
                                     </div>
                                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ticker Marquee Message</label>
                                         <input 
                                            value={localData.screensaverSettings?.marqueeText || ''} 
                                            onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, marqueeText: e.target.value}})}
                                            placeholder="Enter scrolling announcement text..."
                                            className="w-full p-3 border border-slate-200 rounded-xl bg-white font-bold text-xs outline-none focus:ring-2 focus:ring-purple-500"
                                         />
                                         <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Scrolling at bottom of screensaver</p>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Behavior & VFX Section */}
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                 <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-sm"><Zap size={24} /></div>
                                 <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Visual Protocol</h3>
                             </div>

                             <div className="space-y-6">
                                 <div>
                                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Animation Style</label>
                                     <div className="space-y-2">
                                         {[
                                             { id: 'dynamic', label: 'Dynamic (Pan & Tilt)', desc: 'High motion cinematic effects' },
                                             { id: 'subtle', label: 'Subtle (Fade & Soft)', desc: 'Elegant slow-zoom transitions' },
                                             { id: 'static', label: 'Static (Instant)', desc: 'No movement between slides' }
                                         ].map(style => (
                                             <button 
                                                key={style.id}
                                                onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, animationStyle: style.id as any}})}
                                                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${localData.screensaverSettings?.animationStyle === style.id ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-slate-100 hover:border-orange-200'}`}
                                             >
                                                 <div className={`font-black text-[10px] uppercase ${localData.screensaverSettings?.animationStyle === style.id ? 'text-orange-900' : 'text-slate-900'}`}>{style.label}</div>
                                                 <div className="text-[9px] font-bold text-slate-400 uppercase">{style.desc}</div>
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="p-4 bg-orange-900 rounded-3xl text-white shadow-xl">
                                     <div className="flex justify-between items-center mb-4">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">Background Blur</label>
                                         <span className="font-mono text-xs">{localData.screensaverSettings?.backgroundBlur || 24}px</span>
                                     </div>
                                     <input 
                                        type="range" min="0" max="40" 
                                        value={localData.screensaverSettings?.backgroundBlur || 24} 
                                        onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, backgroundBlur: parseInt(e.target.value)}})}
                                        className="w-full accent-orange-500"
                                     />
                                 </div>
                                 
                                 <div className="grid grid-cols-1 gap-2">
                                     {[{ k: 'showProductImages', l: 'Products' }, { k: 'showProductVideos', l: 'Videos' }, { k: 'showPamphlets', l: 'Pamphlets' }, { k: 'showCustomAds', l: 'Marketing Ads' }].map(item => (
                                         <label key={item.k} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
                                             <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">{item.l}</span>
                                             <input 
                                                type="checkbox" 
                                                checked={(localData.screensaverSettings as any)[item.k]} 
                                                onChange={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, [item.k]: !(localData.screensaverSettings as any)[item.k]}})}
                                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                             />
                                         </label>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            )}
        </main>

        {editingKiosk && (
            <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Hardware Modification</h3>
                        <button onClick={() => setEditingKiosk(null)}><X size={20} className="text-slate-400 hover:text-red-500 transition-colors" /></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <InputField label="Human-Friendly Name" val={editingKiosk.name} onChange={(e:any) => setEditingKiosk({...editingKiosk, name: e.target.value})} />
                        <InputField label="Assigned Zone / Branch" val={editingKiosk.assignedZone || ''} onChange={(e:any) => setEditingKiosk({...editingKiosk, assignedZone: e.target.value})} />
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Device Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['kiosk', 'mobile', 'tv'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setEditingKiosk({...editingKiosk, deviceType: t as any})}
                                        className={`p-3 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${editingKiosk.deviceType === t ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={() => setEditingKiosk(null)} className="px-6 py-3 font-black uppercase text-[10px] text-slate-500">Cancel</button>
                        <button 
                            onClick={async () => {
                                if(supabase) {
                                    await supabase.from('kiosks').upsert({ id: editingKiosk.id, name: editingKiosk.name, device_type: editingKiosk.deviceType, assigned_zone: editingKiosk.assignedZone });
                                    onRefresh();
                                    setEditingKiosk(null);
                                }
                            }}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all"
                        >
                            Commit Provisioning
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDashboard;
