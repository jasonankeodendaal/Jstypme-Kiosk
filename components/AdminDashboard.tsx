
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData, saveStoreData, generateStoreData } from '../services/geminiService';
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

// Auth Component
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} /></div>
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button>
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
      const files = Array.from(e.target.files) as File[];
      try {
          if (allowMultiple) {
              const urls = await Promise.all(files.map(f => uploadFileToStorage(f)));
              onUpload(urls);
          } else {
              const url = await uploadFileToStorage(files[0]);
              onUpload(url);
          }
      } catch (err) { alert("Upload error"); } finally { setIsProcessing(false); }
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}
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

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [activeSubTab, setActiveSubTab] = useState<string>('hero');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  useEffect(() => {
    checkCloudConnection().then(setIsCloudConnected);
    if (!hasUnsavedChanges && storeData) setLocalData(storeData);
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

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

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
                         className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${
                             hasUnsavedChanges ? 'bg-blue-600 text-white shadow-lg animate-pulse' : 'bg-slate-800 text-slate-500'
                         }`}
                     >
                         <Save size={16} /> Save Changes
                     </button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {['inventory', 'marketing', 'screensaver', 'fleet', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'screensaver' && (
                <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
                                 <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Marketing Engine</h3>
                             </div>
                             
                             <div className="space-y-6">
                                 <div>
                                     <div className="flex justify-between mb-2">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ad Weighting (Priority)</label>
                                         <span className="text-xs font-black text-blue-600">{localData.screensaverSettings?.marketingPriority}x</span>
                                     </div>
                                     <input 
                                         type="range" min="1" max="10" step="1"
                                         value={localData.screensaverSettings?.marketingPriority || 3}
                                         onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, marketingPriority: parseInt(e.target.value)}})}
                                         className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                     />
                                     <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase italic">Ads appear {localData.screensaverSettings?.marketingPriority}x more often than products in shuffle.</p>
                                 </div>

                                 <div>
                                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transition Protocol</label>
                                     <div className="grid grid-cols-3 gap-2">
                                         {['fade', 'cinematic', 'mix'].map(style => (
                                             <button 
                                                key={style}
                                                onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, transitionStyle: style as any}})}
                                                className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${localData.screensaverSettings?.transitionStyle === style ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                             >
                                                 {style}
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                     <div>
                                         <label className="block text-[10px] font-black text-slate-900 uppercase">Utility Clock</label>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Overlay time on screen</p>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <select 
                                            value={localData.screensaverSettings?.clockFormat || '24h'}
                                            onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, clockFormat: e.target.value as any}})}
                                            className="text-[9px] font-black uppercase bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                                         >
                                             <option value="12h">12h</option>
                                             <option value="24h">24h</option>
                                         </select>
                                         <button 
                                            onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, showClock: !localData.screensaverSettings?.showClock}})}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${localData.screensaverSettings?.showClock ? 'bg-green-500' : 'bg-slate-300'}`}
                                         >
                                             <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.showClock ? 'left-6' : 'left-1'}`}></div>
                                         </button>
                                     </div>
                                 </div>

                                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                     <div>
                                         <label className="block text-[10px] font-black text-slate-900 uppercase">Ambience Blur</label>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Disable for better performance</p>
                                     </div>
                                     <button 
                                        onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, enableAmbienceBlur: !localData.screensaverSettings?.enableAmbienceBlur}})}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${localData.screensaverSettings?.enableAmbienceBlur ? 'bg-blue-600' : 'bg-slate-300'}`}
                                     >
                                         <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.enableAmbienceBlur ? 'left-6' : 'left-1'}`}></div>
                                     </button>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Monitor size={20} /></div>
                                 <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Timing & Content</h3>
                             </div>
                             <div className="grid grid-cols-2 gap-4 mb-6">
                                 <InputField label="Idle Wait (sec)" val={localData.screensaverSettings?.idleTimeout||60} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}})} />
                                 <InputField label="Slide Duration (sec)" val={localData.screensaverSettings?.imageDuration||8} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, imageDuration: parseInt(e.target.value)}})} />
                             </div>
                             <div className="space-y-3">
                                 {[{ key: 'showProductImages', label: 'Show Product Images' }, { key: 'showProductVideos', label: 'Show Product Videos' }, { key: 'showCustomAds', label: 'Show Custom Ads' }, { key: 'muteVideos', label: 'Mute Audio' }].map(opt => (
                                     <div key={opt.key} className="flex justify-between items-center p-2">
                                         <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide">{opt.label}</label>
                                         <button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, [opt.key]: !(localData.screensaverSettings as any)[opt.key]}})} className={`w-10 h-5 rounded-full relative transition-colors ${(localData.screensaverSettings as any)[opt.key] ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${(localData.screensaverSettings as any)[opt.key] ? 'left-6' : 'left-1'}`}></div></button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>
                </div>
            )}
        </main>
    </div>
  );
};
