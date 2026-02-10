import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, MoveHorizontal, AlignLeft, AlignCenter, AlignRight, Type, Lamp, Film, Eraser
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData, upsertBrand, upsertCategory, upsertProduct, upsertPricelist, upsertPricelistBrand, deleteItem, clearOfflineQueue, saveStoreData } from '../services/geminiService';
import { smartUpload, supabase, checkCloudConnection, convertPdfToImages, saveLocalDirHandle, loadLocalDirHandle, clearLocalDirHandle } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// --- SHARED COMPONENTS ---
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

    const renderContent = () => {
        switch (activeSection) {
            case 'architecture':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Offline-First <span className="text-blue-500">Pipeline</span></h3>
                            <div className="relative h-40 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between px-4 md:px-12 overflow-hidden mb-8">
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] animate-[shimmer_3s_infinite]"></div>
                                <div className="z-10 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center text-blue-500"><Cloud size={32}/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supabase</span>
                                </div>
                                <div className="flex-1 h-1 bg-slate-200 mx-4 relative overflow-hidden rounded-full">
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-blue-400 animate-[slideRight_1.5s_infinite_linear]"></div>
                                </div>
                                <div className="z-10 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center text-orange-500"><RefreshCw size={32}/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Service</span>
                                </div>
                                <div className="flex-1 h-1 bg-slate-200 mx-4 relative overflow-hidden rounded-full">
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-orange-400 animate-[slideRight_1.5s_infinite_linear_0.5s]"></div>
                                </div>
                                <div className="z-10 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center text-green-500"><Database size={32}/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">IndexedDB</span>
                                </div>
                                <div className="flex-1 h-1 bg-slate-200 mx-4 relative overflow-hidden rounded-full">
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-green-400 animate-[slideRight_1.5s_infinite_linear_1s]"></div>
                                </div>
                                <div className="z-10 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-center text-white"><Layout size={32}/></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">React UI</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3"><Download size={16}/></div>
                                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Snapshot Pull</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">System downloads a full JSON configuration blob on boot to ensure complete data availability.</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3"><Database size={16}/></div>
                                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Local Hydration</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Data persists in IndexedDB. The app works offline immediately after the first successful sync.</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3"><Zap size={16}/></div>
                                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">Optimistic UI</h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Reads from local cache instantly. Writes update UI immediately, then sync to cloud in background.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'inventory':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Relational <span className="text-purple-500">Hierarchy</span></h3>
                            <div className="flex flex-col items-center relative">
                                <div className="z-10 w-64 p-4 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 text-center relative group cursor-default">
                                    <div className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-1">Root Entity</div>
                                    <div className="text-xl font-black uppercase">Brand</div>
                                    <div className="text-[10px] text-slate-400 mt-1">e.g. Apple, Samsung</div>
                                    <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-slate-300"></div>
                                </div>
                                <div className="mt-8 z-10 w-64 p-4 bg-white text-slate-900 rounded-2xl shadow-lg border-2 border-slate-100 text-center relative group cursor-default">
                                    <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Branch</div>
                                    <div className="text-lg font-black uppercase">Category</div>
                                    <div className="text-[10px] text-slate-400 mt-1">e.g. Smartphones, Tablets</div>
                                    <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-slate-300"></div>
                                </div>
                                <div className="mt-8 z-10 w-64 p-4 bg-slate-50 text-slate-900 rounded-2xl shadow-md border border-slate-200 text-center relative group cursor-default">
                                    <div className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-1">Leaf</div>
                                    <div className="text-base font-black uppercase">Product</div>
                                    <div className="text-[10px] text-slate-400 mt-1">e.g. iPhone 15 Pro</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'pricelists':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Algorithmic <span className="text-green-500">Pricing</span></h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Ceiling Logic</div>
                                    <div className="text-2xl font-mono text-slate-400 line-through decoration-red-400 decoration-2 opacity-50">129.99</div>
                                    <ArrowRight className="text-slate-300 my-2 rotate-90 md:rotate-0" />
                                    <div className="text-4xl font-black text-slate-900">130.00</div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">The "99" Bump</div>
                                    <div className="text-2xl font-mono text-slate-400 line-through decoration-red-400 decoration-2 opacity-50">799.00</div>
                                    <ArrowRight className="text-slate-300 my-2 rotate-90 md:rotate-0" />
                                    <div className="text-4xl font-black text-slate-900">800.00</div>
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl">Psychology</div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Whole Numbers</div>
                                    <div className="text-2xl font-mono text-slate-400 line-through decoration-red-400 decoration-2 opacity-50">122.50</div>
                                    <ArrowRight className="text-slate-300 my-2 rotate-90 md:rotate-0" />
                                    <div className="text-4xl font-black text-slate-900">123.00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'screensaver':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Double-Buffer <span className="text-pink-500">Engine</span></h3>
                            <div className="relative h-64 bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl mb-8 flex items-center justify-center">
                                <div className="z-10 flex gap-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-24 h-32 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden">
                                            <span className="font-black text-white text-2xl">A</span>
                                            <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_lime]"></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Active</span>
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <RefreshCw size={32} className="animate-spin-slow" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-24 h-32 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden opacity-50">
                                            <span className="font-black text-white text-2xl">B</span>
                                            <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Preloading</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <style>{`
                @keyframes slideRight { 0% { left: -33%; } 100% { left: 100%; } }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
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
            <div className="flex-1 overflow-y-auto bg-slate-50/50 relative p-6 md:p-12 scroll-smooth">
                {renderContent()}
            </div>
        </div>
    );
};

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
        <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300">
            <h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tight">Admin Hub</h1>
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

const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false, onRasterize }: any) => {
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files && e.target.files.length > 0) { 
          setIsProcessing(true); setUploadProgress(10); 
          const files = Array.from(e.target.files) as File[]; 
          let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image'; 
          try { 
              if (allowMultiple) { 
                  const results: string[] = []; 
                  for(let i=0; i<files.length; i++) { 
                      try { results.push(await smartUpload(files[i])); } catch (e) {} 
                      setUploadProgress(((i+1)/files.length)*100); 
                  } 
                  if (results.length > 0) onUpload(results, fileType); 
              } else { 
                  const url = await smartUpload(files[0]); 
                  if (fileType === 'pdf' && onRasterize) {
                      const images = await convertPdfToImages(files[0], (curr, total) => setUploadProgress(50 + ((curr/total) * 40)));
                      if (images.length > 0) {
                          const imageUrls: string[] = [];
                          for (let i=0; i<images.length; i++) imageUrls.push(await smartUpload(images[i]));
                          onRasterize(imageUrls);
                      }
                  }
                  setUploadProgress(100); onUpload(url, fileType); 
              } 
          } catch (err) { console.error(err); } finally { setIsProcessing(false); setUploadProgress(0); e.target.value = ''; } 
      } 
  };
  return (<div className="mb-4"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{label}</label><div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">{isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>}<div className="w-10 h-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0 text-slate-400">{isProcessing ? (<Loader2 className="animate-spin text-blue-500" />) : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? (<div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div>) : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}</div><label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}><Upload size={10} className="inline mr-1" /> {isProcessing ? 'Processing...' : 'Select File'}<input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isProcessing} multiple={allowMultiple}/></label></div></div>);
};

const InputField = ({ label, val, onChange, placeholder, isArea = false, half = false, type = 'text' }: any) => (<div className={`mb-4 ${half ? 'w-full' : ''}`}><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>{isArea ? <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} /> : <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />}</div>);

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[], immediate: boolean) => void, brandId?: string }) => { 
    const [localList, setLocalList] = useState(catalogues || []); 
    useEffect(() => setLocalList(catalogues || []), [catalogues]); 
    const handleUpdate = (newList: Catalogue[], immediate = false) => { setLocalList(newList); onSave(newList, immediate); }; 
    const addCatalogue = () => { const newItem: Catalogue = { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }; const newList = [...localList, newItem]; handleUpdate(newList, true); }; 
    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => { const newList = localList.map(c => c.id === id ? { ...c, ...updates } : c); handleUpdate(newList, immediate); }; 
    return (<div className="space-y-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold uppercase text-slate-500 text-xs tracking-wider">{brandId ? 'Brand Catalogues' : 'Global Pamphlets'}</h3><button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{localList.map((cat) => (<div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"><div className="h-40 bg-slate-100 relative group flex items-center justify-center overflow-hidden">{cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? (<img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" />) : (<BookOpen size={32} className="text-slate-300" />)}</div><div className="p-4 space-y-3 flex-1 flex flex-col"><input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" /><div className="grid grid-cols-2 gap-2 mt-auto pt-2"><FileUpload label="Thumbnail" accept="image/*" currentUrl={cat.thumbnailUrl} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url }, true)} /><FileUpload label="PDF" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url }, true)} onRasterize={(urls: string[]) => updateCatalogue(cat.id, { pages: urls }, true)} /></div><button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase mt-2"><Trash2 size={12} /> Delete</button></div></div>))}</div></div>); };

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => { 
    const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []); 
    const [title, setTitle] = useState(pricelist.title || ''); 
    const [isImporting, setIsImporting] = useState(false); 
    const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item)); 
    const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => { 
        const file = e.target.files?.[0]; if (!file) return; setIsImporting(true); 
        try { 
            const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' }); const firstSheetName = workbook.SheetNames[0]; const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 }) as any[][]; 
            const dataRows = jsonData.slice(1).filter(row => row.length > 0);
            const newImportedItems: PricelistItem[] = dataRows.map(row => ({ id: generateId('imp'), sku: String(row[0] || '').trim().toUpperCase(), description: String(row[1] || '').trim().toUpperCase(), normalPrice: String(row[2] || ''), promoPrice: String(row[3] || ''), imageUrl: '' })); 
            setItems(newImportedItems);
        } catch (err) { alert("Error parsing file."); } finally { setIsImporting(false); } 
    }; 
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="font-black text-slate-900 uppercase text-lg bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none w-full" placeholder="ENTER LIST TITLE..." />
                    <div className="flex gap-2"><label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase cursor-pointer flex items-center gap-2">{isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import CSV/XLSX<input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleSpreadsheetImport} /></label><button onClick={onClose} className="p-2 text-slate-400"><X size={24}/></button></div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-slate-50"><th className="p-3 text-[10px] font-black text-slate-400 uppercase">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase">Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase">Promo</th></tr></thead>
                        <tbody>{items.map(item => (<tr key={item.id} className="border-b border-slate-100"><td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td><td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td><td className="p-2"><input value={item.normalPrice} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm" /></td><td className="p-2"><input value={item.promoPrice} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm text-red-600" /></td></tr>))}</tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0"><button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold">Cancel</button><button onClick={() => { onSave({ ...pricelist, title, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase rounded-xl">Save Pricelist</button></div>
            </div>
        </div>
    ); 
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: { pricelists: Pricelist[], pricelistBrands: PricelistBrand[], onSavePricelists: (p: Pricelist[], immediate?: boolean) => void, onSaveBrands: (b: PricelistBrand[], immediate?: boolean) => void, onDeletePricelist: (id: string) => void }) => { 
    const sortedBrands = useMemo(() => { return [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)); }, [pricelistBrands]); 
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null); 
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null); 
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : []; 
    const addBrand = () => { const name = prompt("Brand Name:"); if (!name) return; const newBrand = { id: generateId('plb'), name }; onSaveBrands([...pricelistBrands, newBrand], true); setSelectedBrand(newBrand); }; 
    const addPricelist = () => { if (!selectedBrand) return; const newItem: Pricelist = { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: '2024', dateAdded: new Date().toISOString() }; onSavePricelists([...pricelists, newItem], true); }; 
    return (<div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]"><div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shrink-0"><div className="p-4 bg-slate-50 border-b flex justify-between items-center shrink-0"><div><h2 className="font-black text-slate-900 uppercase text-sm">Pricelist Brands</h2></div><button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase"><Plus size={12} /> Add</button></div><div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(brand => (<div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-3 rounded-xl border cursor-pointer ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div><div className="font-bold text-slate-900 text-xs uppercase truncate">{brand.name}</div></div></div>))}</div></div><div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col"><div className="flex justify-between items-center mb-4 shrink-0"><h3 className="font-bold text-slate-700 uppercase text-xs">{selectedBrand?.name || 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={12} /> Add Pricelist</button></div><div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredLists.map(pl => (<div key={pl.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 relative"><h3 className="font-black text-slate-900 text-sm uppercase">{pl.title}</h3><div className="flex gap-2"><button onClick={() => setEditingManualList(pl)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase">Table</button><button onClick={() => onDeletePricelist(pl.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button></div></div>))}</div></div>{editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(updated) => onSavePricelists(pricelists.map(p => p.id === updated.id ? updated : p), true)} onClose={() => setEditingManualList(null)} />}</div>); };

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => { const [draft, setDraft] = useState<Product>({ ...product }); return (<div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl"><div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit: {draft.name || 'New Product'}</h3><button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button></div><div className="flex-1 overflow-y-auto p-8 pb-20"><InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} /><InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} /><InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} /><FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} /></div><div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Confirm Changes</button></div></div>); };

const CategoryEditorModal = ({ category, onSave, onClose }: { category: Category, onSave: (c: Category) => void, onClose: () => void }) => { const [draft, setDraft] = useState({ ...category }); return (<div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4"><div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"><div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-black text-slate-900 uppercase">Edit Category</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div><div className="p-6 space-y-6"><InputField label="Category Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} /><FileUpload label="Category Image" currentUrl={draft.imageUrl} onUpload={(url: string) => setDraft({ ...draft, imageUrl: url })} /></div><div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Save Category</button></div></div></div>); };

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => { const [editingId, setEditingId] = useState<string | null>(null); const [newName, setNewName] = useState(''); const [newPin, setNewPin] = useState(''); const [newPermissions, setNewPermissions] = useState<AdminPermissions>({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true }); return (<div className="space-y-4"><h4 className="font-bold text-slate-900 uppercase text-xs mb-2">Active Admins ({admins.length})</h4><div className="space-y-3">{admins.map(admin => (<div key={admin.id} className="p-4 rounded-xl border bg-white border-slate-200 flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><UserCog size={16} /></div><div><div className="font-bold text-slate-900 text-sm">{admin.name}</div><div className="text-[10px] text-slate-400 font-mono">PIN: {admin.pin}</div></div></div><div className="flex items-center gap-2"><button onClick={() => { setEditingId(admin.id); setNewName(admin.name); setNewPin(admin.pin); setNewPermissions(admin.permissions); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={14}/></button></div></div>))}</div></div>); };

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => { const zip = new JSZip(); const loadedZip = await zip.loadAsync(file); return []; };

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
  const [linkedFolder, setLinkedFolder] = useState<any>(null);

  const logout = useCallback(() => { setCurrentUser(null); }, []);

  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'tv', label: 'TV', icon: Tv }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'System Guide', icon: BookOpen } ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) { setLocalData(storeData); } }, [storeData, hasUnsavedChanges]);
  
  useEffect(() => { loadLocalDirHandle().then(setLinkedFolder); }, []);

  const handleLinkFolder = async () => {
      try {
          if ('showDirectoryPicker' in window) {
              const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
              await saveLocalDirHandle(handle);
              setLinkedFolder(handle);
              
              // AUTOMATIC MIGRATION: 
              // Immediately sync current memory data to the new db.json in the folder
              if (localData) {
                  await saveStoreData(localData);
                  alert(`Folder Linked! Existing data has been migrated to: ${handle.name}/db.json`);
              }
          } else {
              alert("Browser doesn't support local folder linking.");
          }
      } catch (e: any) {
          if (e.name !== 'AbortError') alert("Link failed.");
      }
  };

  const handleUnlinkFolder = async () => {
      if(confirm("Unlink Folder? No files will be deleted.")) { await clearLocalDirHandle(); setLinkedFolder(null); }
  };

  const handleLocalUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) { onUpdateData(newData); setHasUnsavedChanges(false); } else { setHasUnsavedChanges(true); }
      if (selectedBrand) { const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id); if (updatedBrand) setSelectedBrand(updatedBrand); }
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20"><div className="flex items-center justify-between px-4 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div><div className="flex items-center gap-4"><button onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'bg-slate-800 text-slate-500 hover:text-white'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Force Cloud Backup' : 'Force Backup'}</button></div><div className="flex items-center gap-3"><div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}><div className="flex items-center gap-2">{isCloudConnected ? <Cloud size={14} /> : <HardDrive size={14} />}<span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span></div></div><button onClick={logout} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2"><LogOut size={16} /><span className="text-[10px] font-bold uppercase hidden md:inline">Logout</span></button></div></div><div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div></header>
        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                       <button onClick={() => { const name = prompt("Brand Name:"); if(name) { const newBrand = { id: generateId('b'), name, categories: [] }; handleLocalUpdate({ ...localData, brands: [...brands, newBrand] }, true); } }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[120px] text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all"><Plus size={24} className="mb-2" /><span className="font-bold uppercase text-[10px]">Add Brand</span></button>
                       {brands.map(brand => (
                           <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col h-full">
                               <div className="flex-1 bg-slate-50 flex items-center justify-center p-2 aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div>
                               <div className="p-4"><h3 className="font-black text-slate-900 text-xs md:text-lg uppercase truncate mb-1">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-blue-600 transition-colors">Manage</button></div>
                           </div>
                       ))}
                   </div>
                ) : !selectedCategory ? (
                   <div className="animate-fade-in">
                       <div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg"><ArrowLeft size={20} /></button><h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2></div>
                       <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                           <button onClick={() => { const name = prompt("Category Name:"); if(name) { const newCat = { id: generateId('c'), name, icon: 'Box', products: [] }; const updated = {...selectedBrand, categories: [...selectedBrand.categories, newCat]}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b)}, true); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 aspect-square"><Plus size={24} /><span className="font-bold text-[10px] uppercase mt-2">New Cat</span></button>
                           {selectedBrand.categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative aspect-square flex flex-col justify-center items-center overflow-hidden"><Box size={20} className="text-slate-400 mb-1" /><h3 className="font-black text-slate-900 uppercase text-[10px] text-center truncate w-full">{cat.name}</h3></button>))}
                       </div>
                   </div>
                ) : (
                    <div className="animate-fade-in h-full flex flex-col">
                       <div className="flex items-center gap-4 mb-6 shrink-0"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-lg md:text-2xl font-black uppercase text-slate-900 flex-1 truncate">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2">Add Product</button></div>
                       <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">{selectedCategory.products.map(p => (<div key={p.id} onClick={() => setEditingProduct(p)} className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col cursor-pointer hover:border-blue-500 transition-all"><div className="aspect-square bg-slate-50 flex items-center justify-center p-2 mb-2">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-200" />}</div><h4 className="font-bold text-slate-900 text-[10px] uppercase truncate">{p.name}</h4></div>))}</div>
                    </div>
                )
            )}
            {activeTab === 'pricelists' && (
                <PricelistManager 
                    pricelists={localData.pricelists || []} 
                    pricelistBrands={localData.pricelistBrands || []}
                    onSavePricelists={(p, immediate) => handleLocalUpdate({ ...localData, pricelists: p }, immediate)}
                    onSaveBrands={(b, immediate) => handleLocalUpdate({ ...localData, pricelistBrands: b }, immediate)}
                    onDeletePricelist={(id) => handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id) }, true)}
                />
            )}
            {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Folder size={20} className="text-yellow-600" /> Local Storage Orchestration</h3><div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-6"><div className="flex-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Master Storage Folder (Local PC)</label><div className="flex items-center gap-3">{linkedFolder ? (<div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-blue-200 shadow-sm flex-1"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FolderOpen size={18} /></div><div className="min-w-0"><div className="text-xs font-black text-slate-900 uppercase truncate">{linkedFolder.name}</div><div className="text-[9px] text-green-600 font-bold uppercase">Folder Linked</div></div></div>) : (<div className="flex-1 text-slate-400 text-xs italic bg-white border border-dashed border-slate-300 rounded-xl px-4 py-3">No local folder linked...</div>)}<button onClick={linkedFolder ? handleUnlinkFolder : handleLinkFolder} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-md active:scale-95 flex items-center gap-2 ${linkedFolder ? 'bg-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{linkedFolder ? <X size={14}/> : <FolderInput size={14}/>} {linkedFolder ? 'Unlink' : 'Link PC Folder'}</button></div><p className="text-[10px] text-slate-400 mt-3 font-medium">Once linked, the app uses your PC folder as the primary database (db.json) and storage repo. All changes will migrate automatically.</p></div></div></div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> System Branding</h3><FileUpload label="Main Company Logo" currentUrl={localData.companyLogoUrl} onUpload={(url: string) => handleLocalUpdate({...localData, companyLogoUrl: url}, true)} /></div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><AdminManager admins={localData.admins || []} onUpdate={(admins) => handleLocalUpdate({ ...localData, admins }, true)} currentUser={currentUser} /></div>
               </div>
            )}
        </main>
        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in"><ProductEditor product={editingProduct} onSave={(p) => { const isNew = !selectedCategory?.products.find(x => x.id === p.id); const newProducts = isNew ? [...(selectedCategory?.products || []), p] : selectedCategory?.products.map(x => x.id === p.id ? p : x); const updatedBrand = { ...selectedBrand!, categories: selectedBrand!.categories.map(c => c.id === selectedCategory!.id ? { ...selectedCategory!, products: newProducts } : c) }; handleLocalUpdate({ ...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }, true); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;