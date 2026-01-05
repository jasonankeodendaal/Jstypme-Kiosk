
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileCog, Server, Repeat, Eye, Timer, Workflow, StickyNote
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData } from '../services/geminiService';
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

// --- SYSTEM DOCUMENTATION COMPONENT (COMPREHENSIVE) ---
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    
    const sections = [
        { id: 'architecture', label: '1. How it Works', icon: <Network size={16} />, desc: 'The "Brain" of the Kiosk' },
        { id: 'inventory', label: '2. Product Sorting', icon: <Box size={16}/>, desc: 'Hierarchy & Structure' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Excel to PDF Engine' },
        { id: 'screensaver', label: '4. Visual Loop', icon: <Zap size={16}/>, desc: 'Playlist Algorithms' },
        { id: 'fleet', label: '5. Fleet Watch', icon: <Activity size={16}/>, desc: 'Telemetry & Command' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Signage Loops' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
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
            
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-12">
                {activeSection === 'architecture' && (
                    <div className="max-w-4xl space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">1. The "Brain" of the Kiosk</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">The Kiosk operates on an <strong>Atomic Synchronization</strong> model. Unlike traditional web apps, it is built to survive in retail environments where internet is unstable.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <h4 className="font-black text-slate-900 uppercase text-xs mb-4 flex items-center gap-2 text-blue-600"><Cloud size={16}/> Central Command (Cloud)</h4>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex gap-2"><span>•</span> <span><strong>JSON Master:</strong> All store data is stored as a single JSONB object in Supabase.</span></li>
                                    <li className="flex gap-2"><span>•</span> <span><strong>Versioning:</strong> Every time you "Save Changes", a new timestamp is pulsed to all active devices.</span></li>
                                    <li className="flex gap-2"><span>•</span> <span><strong>Storage:</strong> Images and PDFs are distributed via a Global CDN for instant loading.</span></li>
                                </ul>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <h4 className="font-black text-slate-900 uppercase text-xs mb-4 flex items-center gap-2 text-green-600"><Tablet size={16}/> Edge Intelligence (Tablet)</h4>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex gap-2"><span>•</span> <span><strong>IndexedDB:</strong> The tablet maintains a full local clone of the database in internal memory.</span></li>
                                    <li className="flex gap-2"><span>•</span> <span><span><strong>Watchdog:</strong> A background thread checks the cloud every 30-60 seconds for updates.</span></span></li>
                                    <li className="flex gap-2"><span>•</span> <span><strong>Offline-First:</strong> If internet cuts, the tablet continues showing products from its cache indefinitely.</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="max-w-4xl space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">2. Product Sorting Hierarchy</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">We use a 3-tier strictly enforced structural hierarchy to ensure the UI remains clean regardless of how many products are added.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-6 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg font-black italic">B</div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-900 text-sm mb-1">Level 1: Brands</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">The root container. Brands define the "Shop-in-Shop" experience. Each brand can have its own custom logo and catalogues.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 p-6 bg-purple-50 rounded-3xl border border-purple-100 ml-8 md:ml-12">
                                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg font-black italic">C</div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-900 text-sm mb-1">Level 2: Categories</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">Functional grouping (e.g. Headphones, Laptops). Categories automatically determine which icon appears on the navigation screen.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 p-6 bg-slate-900 rounded-3xl border border-slate-800 ml-16 md:ml-24 text-white">
                                <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-black italic">P</div>
                                <div>
                                    <h4 className="font-black uppercase text-white text-sm mb-1">Level 3: Products</h4>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">The final payload. Contains media libraries, technical specifications, manuals, and physical dimensions for comparison logic.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="max-w-4xl space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">3. Price Logic Engine</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">The system converts complex vendor spreadsheets into high-DPI consumer documents instantly.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                    <h5 className="font-black uppercase text-[10px] text-orange-600 mb-2">Algorithm: Fuzzy Header Mapping</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Our engine scans the first 100 cells for keywords. It doesn't need specific column names. "Model", "SKU", "Part #" all map to the same internal ID.</p>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <h5 className="font-black uppercase text-[10px] text-blue-600 mb-2">Algorithm: Psychological Rounding</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">To maintain a premium aesthetic, price strings like "799.99" are automatically rounded to whole "800" integers if the delta is less than 0.5%.</p>
                                </div>
                            </div>
                            <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-center border border-slate-800 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><FileSpreadsheet size={100} /></div>
                                <h4 className="font-black uppercase text-xs mb-4 text-blue-400">Excel Pipeline</h4>
                                <ol className="space-y-3">
                                    <li className="flex gap-3 text-xs">
                                        <span className="text-slate-500 font-mono">01.</span>
                                        <span>Read binary buffer from XLSX</span>
                                    </li>
                                    <li className="flex gap-3 text-xs">
                                        <span className="text-slate-500 font-mono">02.</span>
                                        <span>Sanitize character encoding</span>
                                    </li>
                                    <li className="flex gap-3 text-xs">
                                        <span className="text-slate-500 font-mono">03.</span>
                                        <span>Apply Pricing Rounding Logic</span>
                                    </li>
                                    <li className="flex gap-3 text-xs font-bold text-green-400">
                                        <span className="text-slate-500 font-mono">04.</span>
                                        <span>Generate 300DPI PDF via jsPDF</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="max-w-4xl space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">4. Visual Playlist Algorithm</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">The screensaver doesn't just loop; it builds a priority-weighted playlist every time it starts.</p>
                        </div>
                        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                            <h4 className="font-black text-slate-900 uppercase text-xs mb-8 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Playback Weighting</h4>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                        <div className="bg-blue-600 w-[60%]" title="Products"></div>
                                        <div className="bg-purple-600 w-[20%]" title="Ads"></div>
                                        <div className="bg-orange-600 w-[20%]" title="Catalogues"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 w-24 text-right">Standard Mix</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                    <div>
                                        <span className="block text-[10px] font-black text-blue-600 uppercase mb-2">High Priority</span>
                                        <p className="text-xs text-slate-600 leading-relaxed">Items added within the last 5 days are injected into the playlist twice as often.</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-purple-600 uppercase mb-2">Ad Injection</span>
                                        <p className="text-xs text-slate-600 leading-relaxed">"Global Ad" items are treated as anchor points, appearing every 3-4 slides to ensure brand visibility.</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-orange-600 uppercase mb-2">Aging Factor</span>
                                        <p className="text-xs text-slate-600 leading-relaxed">Items older than 6 months have a 25% chance of being skipped per loop to keep the content fresh.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="max-w-4xl space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">5. Telemetry & Fleet Command</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">Real-time status monitoring through the "Heartbeat" protocol.</p>
                        </div>
                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-10"><Pulse size={120} className="text-blue-500 animate-pulse" /></div>
                             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                 <div>
                                     <h5 className="font-black text-blue-400 uppercase text-xs mb-4">Heartbeat Payload</h5>
                                     <ul className="space-y-3 font-mono text-[10px] text-slate-400">
                                         <li className="flex justify-between border-b border-white/5 pb-1"><span>DEVICE_ID</span> <span className="text-white">LOC-12345</span></li>
                                         <li className="flex justify-between border-b border-white/5 pb-1"><span>WIFI_STRENGTH</span> <span className="text-green-400">100%</span></li>
                                         <li className="flex justify-between border-b border-white/5 pb-1"><span>CURRENT_VIEW</span> <span className="text-white">"ProductDetail"</span></li>
                                         <li className="flex justify-between border-b border-white/5 pb-1"><span>IDLE_TIME</span> <span className="text-white">12.4s</span></li>
                                     </ul>
                                 </div>
                                 <div>
                                     <h5 className="font-black text-purple-400 uppercase text-xs mb-4">Remote Operations</h5>
                                     <p className="text-xs text-slate-400 leading-relaxed mb-4">Admin Hub can send high-priority interrupt commands to any active device via the Realtime channel.</p>
                                     <div className="flex gap-2">
                                         <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black text-slate-300">FORCE_REBOOT</div>
                                         <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black text-slate-300">WIPE_CACHE</div>
                                         <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black text-slate-300">PUSH_CONFIG</div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="max-w-4xl space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">6. TV Signage Protocol</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">Transforms hardware into a passive high-definition video player with zero user interaction required.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-6">
                                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                     <h5 className="font-black uppercase text-xs text-slate-900 mb-2">Gapless Playback</h5>
                                     <p className="text-xs text-slate-600 font-medium">The TV module pre-fetches the next video URL while the current one is playing, ensuring a sub-100ms transition between clips.</p>
                                 </div>
                                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                     <h5 className="font-black uppercase text-xs text-slate-900 mb-2">Shuffle Seed</h5>
                                     <p className="text-xs text-slate-600 font-medium">Each device generates a unique random seed based on its ID, ensuring that different TV screens in the same store play different videos simultaneously.</p>
                                 </div>
                             </div>
                             <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col items-center justify-center text-center shadow-xl">
                                 <Tv size={64} className="mb-4 opacity-50" />
                                 <h4 className="font-black uppercase text-lg mb-2">Infinite Signage Loop</h4>
                                 <p className="text-sm text-indigo-100 font-medium">Auto-collects all video assets from every brand and product to create a master marketing stream without manual playlist management.</p>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- AUTH COMPONENT ---
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) { onLogin(admin); } else { setError('Invalid credentials.'); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label>
              <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label>
              <input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}
          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- SHARED UI COMPONENTS ---
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
              onUpload(res.url, fileType);
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

const InputField = ({ label, val, onChange, placeholder, isArea = false, type = 'text' }: any) => (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</label>
      {isArea ? (
        <textarea value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" placeholder={placeholder} />
      ) : (
        <input type={type} value={val} onChange={onChange} className="w-full p-3 bg-white text-black border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm" placeholder={placeholder} />
      )}
    </div>
);

// --- COMPREHENSIVE PRODUCT EDITOR ---
const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ 
        ...product, 
        features: product.features || [], 
        specs: product.specs || {},
        dimensions: product.dimensions || [],
        galleryUrls: product.galleryUrls || [],
        videoUrls: product.videoUrls || [],
        manuals: product.manuals || []
    });

    const [activeSection, setActiveSection] = useState<'basics' | 'media' | 'specs' | 'logistics' | 'docs'>('basics');
    
    const [newFeature, setNewFeature] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    const [newDim, setNewDim] = useState<DimensionSet>({ label: '', width: '', height: '', depth: '', weight: '' });
    const [newManualTitle, setNewManualTitle] = useState('');

    const updateDraft = (updates: Partial<Product>) => setDraft(prev => ({ ...prev, ...updates }));

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white">
            {/* Header */}
            <header className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Box size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight leading-none">{draft.name || 'New Product Entity'}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Unique Identifier: {draft.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="px-5 py-2 text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors">Discard</button>
                    <button onClick={() => onSave(draft)} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95">Commit Changes</button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 flex overflow-x-auto no-scrollbar px-6 md:px-8">
                {[
                    { id: 'basics', label: '1. Basics', icon: <StickyNote size={14}/> },
                    { id: 'media', label: '2. Media Library', icon: <ImageIcon size={14}/> },
                    { id: 'specs', label: '3. Technical Specs', icon: <ListCheck size={14}/> },
                    { id: 'logistics', label: '4. Dimensions', icon: <Ruler size={14}/> },
                    { id: 'docs', label: '5. Manuals', icon: <FileText size={14}/> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as any)}
                        className={`px-6 py-4 flex items-center gap-2 border-b-4 transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${activeSection === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* BASICS SECTION */}
                    {activeSection === 'basics' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            <div className="space-y-6">
                                <InputField label="Product Name" val={draft.name} onChange={(e:any) => updateDraft({ name: e.target.value })} placeholder="e.g. iPhone 15 Pro Max" />
                                <InputField label="SKU Code" val={draft.sku || ''} onChange={(e:any) => updateDraft({ sku: e.target.value })} placeholder="e.g. APL-IP15-PRO" />
                                <InputField label="Technical Description" isArea val={draft.description} onChange={(e:any) => updateDraft({ description: e.target.value })} placeholder="Marketing copy and primary technical description..." />
                            </div>
                            <div className="space-y-6">
                                <InputField label="Warranty & Terms" isArea val={draft.terms || ''} onChange={(e:any) => updateDraft({ terms: e.target.value })} placeholder="Manufacturer warranty protocols and legal terms..." />
                                <div className="p-6 bg-blue-900 rounded-3xl text-white shadow-xl">
                                    <h4 className="font-black uppercase text-[10px] mb-4 text-blue-400">Data Validation</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-2 h-2 rounded-full ${draft.name ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span className="opacity-80">Primary Name Defined</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-2 h-2 rounded-full ${draft.sku ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span className="opacity-80">Inventory SKU Assigned</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-2 h-2 rounded-full ${draft.imageUrl ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                            <span className="opacity-80">Master Image Uploaded</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MEDIA LIBRARY */}
                    {activeSection === 'media' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                                    <h4 className="font-black uppercase text-xs text-slate-900 mb-6 flex items-center gap-2"><Sparkles className="text-blue-500" size={16}/> Master Image</h4>
                                    <FileUpload 
                                        label="Primary Showcase Image" 
                                        currentUrl={draft.imageUrl} 
                                        onUpload={(url: string) => updateDraft({ imageUrl: url })} 
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2 uppercase">Used in search results and as the main detail header. Transparent PNG recommended.</p>
                                </div>
                                <div className="p-6 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                                    <h4 className="font-black uppercase text-xs text-slate-900 mb-6 flex items-center gap-2"><Layout className="text-purple-500" size={16}/> Image Gallery</h4>
                                    <FileUpload 
                                        label="Upload Multiple Visuals" 
                                        allowMultiple 
                                        onUpload={(urls: string[]) => updateDraft({ galleryUrls: [...(draft.galleryUrls || []), ...urls] })} 
                                    />
                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                        {(draft.galleryUrls || []).map((url, i) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button onClick={() => updateDraft({ galleryUrls: draft.galleryUrls?.filter((_, idx) => idx !== i) })} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl">
                                <h4 className="font-black uppercase text-xs text-white mb-6 flex items-center gap-2"><Video className="text-red-500" size={20}/> Video Showcase Hub</h4>
                                <FileUpload 
                                    label="Upload 16:9 MP4 Content" 
                                    accept="video/*" 
                                    allowMultiple 
                                    onUpload={(urls: string[]) => updateDraft({ videoUrls: [...(draft.videoUrls || []), ...urls] })} 
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                    {(draft.videoUrls || []).map((url, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group">
                                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0"><Play size={20} fill="white" /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-black text-white uppercase truncate">Video {i+1}</div>
                                                <div className="text-[8px] font-mono text-slate-500 truncate">{url}</div>
                                            </div>
                                            <button onClick={() => updateDraft({ videoUrls: draft.videoUrls?.filter((_, idx) => idx !== i) })} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SPECS & FEATURES */}
                    {activeSection === 'specs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
                            {/* Features */}
                            <div className="space-y-6">
                                <h4 className="font-black uppercase text-xs text-slate-900 flex items-center gap-2"><CheckCircle2 className="text-green-500" /> Key Features (Bullet Points)</h4>
                                <div className="flex gap-2">
                                    <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (newFeature && (updateDraft({ features: [...draft.features, newFeature] }), setNewFeature('')))} className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-inner" placeholder="Enter feature point..." />
                                    <button onClick={() => { if(newFeature) { updateDraft({ features: [...draft.features, newFeature] }); setNewFeature(''); } }} className="p-4 bg-blue-600 text-white rounded-2xl"><Plus size={20}/></button>
                                </div>
                                <div className="space-y-2">
                                    {draft.features.map((f, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group">
                                            <span className="text-sm font-bold text-slate-700">{f}</span>
                                            <button onClick={() => updateDraft({ features: draft.features.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Specs */}
                            <div className="space-y-6">
                                <h4 className="font-black uppercase text-xs text-slate-900 flex items-center gap-2"><Binary className="text-blue-500" /> Technical Data Matrix</h4>
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase" placeholder="Label (e.g. CPU)" />
                                        <input value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold" placeholder="Value (e.g. M3 Pro)" />
                                    </div>
                                    <button onClick={() => { if(newSpecKey && newSpecValue) { updateDraft({ specs: { ...draft.specs, [newSpecKey]: newSpecValue } }); setNewSpecKey(''); setNewSpecValue(''); } }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Add to Matrix</button>
                                    
                                    <div className="pt-4 divide-y divide-slate-50">
                                        {Object.entries(draft.specs).map(([key, val], idx) => (
                                            <div key={idx} className="flex justify-between py-3">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase block">{key}</span>
                                                    <span className="text-xs font-bold text-slate-800">{val}</span>
                                                </div>
                                                <button onClick={() => { const newSpecs = { ...draft.specs }; delete newSpecs[key]; updateDraft({ specs: newSpecs }); }} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOGISTICS & DIMENSIONS */}
                    {activeSection === 'logistics' && (
                        <div className="animate-fade-in space-y-8">
                             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-8 opacity-5"><Ruler size={100}/></div>
                                 <h4 className="font-black uppercase text-xs text-blue-400 mb-8 flex items-center gap-2">Engineering Scale Profiles</h4>
                                 
                                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                     <div className="lg:col-span-4 space-y-4">
                                         <InputField label="Profile Name" val={newDim.label} onChange={(e:any) => setNewDim({...newDim, label: e.target.value})} placeholder="e.g. Device Alone" />
                                         <div className="grid grid-cols-2 gap-4">
                                             <InputField label="Width" val={newDim.width} onChange={(e:any) => setNewDim({...newDim, width: e.target.value})} placeholder="76.7mm" />
                                             <InputField label="Height" val={newDim.height} onChange={(e:any) => setNewDim({...newDim, height: e.target.value})} placeholder="159.9mm" />
                                         </div>
                                         <div className="grid grid-cols-2 gap-4">
                                             <InputField label="Depth" val={newDim.depth} onChange={(e:any) => setNewDim({...newDim, depth: e.target.value})} placeholder="8.25mm" />
                                             <InputField label="Weight" val={newDim.weight} onChange={(e:any) => setNewDim({...newDim, weight: e.target.value})} placeholder="221g" />
                                         </div>
                                         <button onClick={() => { if(newDim.label) { updateDraft({ dimensions: [...(draft.dimensions || []), newDim] }); setNewDim({ label: '', width: '', height: '', depth: '', weight: '' }); } }} className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform">Add Physical Profile</button>
                                     </div>

                                     <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2">
                                         {(draft.dimensions || []).map((dim, i) => (
                                             <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group">
                                                 <div>
                                                     <span className="text-[10px] font-black text-blue-400 uppercase block mb-2">{dim.label || `Profile ${i+1}`}</span>
                                                     <div className="flex gap-4 text-xs font-mono text-slate-300">
                                                         <span>W: {dim.width}</span>
                                                         <span>H: {dim.height}</span>
                                                         <span>D: {dim.depth}</span>
                                                         <span className="text-white font-bold">Wt: {dim.weight}</span>
                                                     </div>
                                                 </div>
                                                 <button onClick={() => updateDraft({ dimensions: draft.dimensions?.filter((_, idx) => idx !== i) })} className="p-3 hover:bg-red-600/20 text-slate-600 hover:text-red-400 rounded-xl transition-all"><Trash2 size={18}/></button>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* MANUALS & DOCS */}
                    {activeSection === 'docs' && (
                        <div className="animate-fade-in space-y-12">
                             <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-sm">
                                 <h4 className="font-black uppercase text-xs text-slate-900 mb-8 flex items-center gap-2"><BookOpen className="text-blue-500" /> Digital Repository</h4>
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                     <div className="space-y-6">
                                         <InputField label="Document Title" val={newManualTitle} onChange={(e:any) => setNewManualTitle(e.target.value)} placeholder="e.g. Quick Start Guide" />
                                         <div className="grid grid-cols-2 gap-4">
                                            <FileUpload label="Manual PDF" accept="application/pdf" icon={<FileText/>} onUpload={(url: string) => { if(newManualTitle) { updateDraft({ manuals: [...(draft.manuals || []), { id: generateId('man'), title: newManualTitle, pdfUrl: url, images: [] }] }); setNewManualTitle(''); } else alert("Enter title first"); }} />
                                            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center opacity-50">
                                                <ImageIcon size={24} className="mb-2 text-slate-300" />
                                                <span className="text-[8px] font-black uppercase text-slate-400">Flipbook Mode via ZIP Export</span>
                                            </div>
                                         </div>
                                     </div>

                                     <div className="space-y-3">
                                         <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Attached Documents</h5>
                                         {(draft.manuals || []).map((man, i) => (
                                             <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-red-500 shadow-sm"><FileText size={20}/></div>
                                                 <div className="flex-1 min-w-0">
                                                     <div className="text-xs font-black uppercase text-slate-900 truncate">{man.title}</div>
                                                     <div className="text-[8px] font-mono text-slate-400 truncate">{man.pdfUrl || 'Local Assets'}</div>
                                                 </div>
                                                 <button onClick={() => updateDraft({ manuals: draft.manuals?.filter((_, idx) => idx !== i) })} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                             </div>
                                         ))}
                                         {(!draft.manuals || draft.manuals.length === 0) && (
                                             <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300">
                                                 <Book size={40} className="mb-3 opacity-20" />
                                                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">No Documents Found</span>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- KIOSK EDITOR MODAL ---
const KioskEditorModal = ({ kiosk, onSave, onClose }: any) => {
    const [name, setName] = useState(kiosk.name);
    const [type, setType] = useState(kiosk.deviceType || 'kiosk');
    const [zone, setZone] = useState(kiosk.assignedZone || '');

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-black text-slate-900 uppercase">Modify Terminal</h3>
                        <p className="text-[9px] font-mono text-slate-400">UID: {kiosk.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <InputField label="Device Identifier (Friendly Name)" val={name} onChange={(e:any) => setName(e.target.value)} placeholder="e.g. Front Window #01" />
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Hardware Profile</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['kiosk', 'mobile', 'tv'].map(t => (
                                <button key={t} onClick={() => setType(t)} className={`py-3 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${type === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <InputField label="Assigned Operational Zone" val={zone} onChange={(e:any) => setZone(e.target.value)} placeholder="e.g. Electronics A" />
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-5 py-2 text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancel</button>
                    <button onClick={() => onSave({...kiosk, name, deviceType: type, assignedZone: zone})} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- MOVE PRODUCT MODAL ---
const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: any) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);
    const targetBrand = allBrands.find((b:any) => b.id === targetBrandId);
    
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-900 uppercase">Relocate Product</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Destination Brand</label>
                        <select value={targetBrandId} onChange={(e) => { setTargetBrandId(e.target.value); setTargetCategoryId(allBrands.find((b:any)=>b.id===e.target.value)?.categories[0]?.id || ''); }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none">{allBrands.map((b:any) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Destination Category</label>
                        <select value={targetCategoryId} onChange={(e) => setTargetCategoryId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none">{targetBrand?.categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
                    <button onClick={() => onMove(product, targetBrandId, targetCategoryId)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Confirm Move</button>
                </div>
            </div>
        </div>
    );
};

// --- TV MODEL EDITOR ---
const TVModelEditor = ({ model, onSave, onClose }: any) => {
    const [draft, setDraft] = useState({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col h-[80vh]">
                <div className="p-6 border-b bg-slate-900 text-white flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-tight">TV Model Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <InputField label="Display Model Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} placeholder="e.g. OLED 65-inch G3" />
                    <FileUpload label="Marketing Cover" currentUrl={draft.imageUrl} onUpload={(url: string) => setDraft({...draft, imageUrl: url})} />
                    <div className="space-y-4">
                        <h4 className="font-black uppercase text-[10px] text-slate-400 flex items-center gap-2 tracking-widest"><Video size={16}/> Signage Video Stream</h4>
                        <FileUpload label="Add High-Res Video Clips" accept="video/*" allowMultiple onUpload={(urls: string[]) => setDraft({...draft, videoUrls: [...(draft.videoUrls || []), ...urls]})} />
                        <div className="grid grid-cols-2 gap-3">
                            {(draft.videoUrls || []).map((url: string, i: number) => (
                                <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Play size={14}/></div>
                                    <span className="text-[10px] font-mono text-slate-500 truncate flex-1">{url}</span>
                                    <button onClick={() => setDraft({...draft, videoUrls: draft.videoUrls.filter((_:any,idx:number)=>idx!==i)})} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-slate-500 font-black uppercase text-[10px]">Cancel</button>
                    <button onClick={() => onSave(draft)} className="px-10 py-3 bg-blue-600 text-white font-black uppercase text-[10px] rounded-xl shadow-lg">Save Profile</button>
                </div>
            </div>
        </div>
    );
};

// --- ADMIN MANAGER ---
const AdminManager = ({ admins, onUpdate, currentUser }: any) => {
    const addAdmin = () => {
        const name = prompt("Enter Admin Name:");
        if(!name) return;
        const pin = prompt("Enter 4-8 Digit PIN:");
        if(!pin) return;
        const newAdmin: AdminUser = { id: generateId('adm'), name, pin, isSuperAdmin: false, permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true } };
        onUpdate([...admins, newAdmin]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Authorized Administrators</h4>
                <button onClick={addAdmin} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><User size={14}/> New Admin</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {admins.map((admin: any) => (
                    <div key={admin.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4 relative group">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300"><User size={24}/></div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-black uppercase text-slate-900 truncate">{admin.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1">PIN: ****</div>
                        </div>
                        {admin.id !== currentUser.id && (
                            <button onClick={() => { if(confirm("Revoke admin access?")) onUpdate(admins.filter((a:any)=>a.id!==admin.id)); }} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        )}
                        {admin.isSuperAdmin && <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-sm">Super</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- IMPORT / EXPORT LOGIC ---
const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip();
    let loadedZip;
    try { loadedZip = await zip.loadAsync(file); } catch (e) { throw new Error("Invalid ZIP file"); }
    const newBrands: Record<string, Brand> = {};
    const getCleanPath = (filename: string) => filename.replace(/\\/g, '/');
    const validFiles = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir && !path.includes('__MACOSX') && !path.includes('.DS_Store'));
    let rootPrefix = "";
    if (validFiles.length > 0) {
        const firstFileParts = getCleanPath(validFiles[0]).split('/').filter(p => p);
        if (firstFileParts.length > 1) {
            const possibleRoot = firstFileParts[0];
            if (validFiles.every(path => getCleanPath(path).startsWith(possibleRoot + '/'))) { rootPrefix = possibleRoot + '/'; }
        }
    }
    const getMimeType = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        if (ext === 'png') return 'image/png';
        if (ext === 'webp') return 'image/webp';
        if (ext === 'gif') return 'image/gif';
        if (ext === 'mp4') return 'video/mp4';
        if (ext === 'webm') return 'video/webm';
        if (ext === 'pdf') return 'application/pdf';
        return 'application/octet-stream';
    };
    const processAsset = async (zipObj: any, filename: string): Promise<string> => {
        const blob = await zipObj.async("blob");
        if (supabase) {
             try {
                 const mimeType = getMimeType(filename);
                 const safeName = filename.replace(/[^a-z0-9._-]/gi, '_');
                 const fileToUpload = new File([blob], `import_${Date.now()}_${safeName}`, { type: mimeType });
                 const url = await uploadFileToStorage(fileToUpload);
                 return url;
             } catch (e) { console.warn(`Asset upload failed for ${filename}. Fallback to Base64.`, e); }
        }
        return new Promise(resolve => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(blob); });
    };
    const filePaths = Object.keys(loadedZip.files);
    let processedCount = 0;
    for (const rawPath of filePaths) {
        let path = getCleanPath(rawPath);
        const fileObj = loadedZip.files[rawPath];
        if (fileObj.dir || path.includes('__MACOSX') || path.includes('.DS_Store')) continue;
        if (rootPrefix && path.startsWith(rootPrefix)) path = path.substring(rootPrefix.length);
        if (path.startsWith('_System_Backup/') || path.includes('store_config')) continue;
        const parts = path.split('/').filter(p => p.trim() !== '');
        if (parts.length < 2) continue;
        processedCount++;
        if (onProgress && processedCount % 5 === 0) onProgress(`Processing item ${processedCount}/${validFiles.length}...`);
        const brandName = parts[0];
        if (!newBrands[brandName]) newBrands[brandName] = { id: generateId('brand'), name: brandName, categories: [] };
        if (parts.length === 2) {
             const fileName = parts[1].toLowerCase();
             if (fileName.includes('brand_logo') || fileName.includes('logo')) { const url = await processAsset(fileObj, parts[1]); newBrands[brandName].logoUrl = url; }
             if (fileName.endsWith('.json') && fileName.includes('brand')) { try { const text = await fileObj.async("text"); const meta = JSON.parse(text); if (meta.themeColor) newBrands[brandName].themeColor = meta.themeColor; if (meta.id) newBrands[brandName].id = meta.id; } catch(e) {} }
             continue;
        }
        if (parts.length < 4) continue;
        const categoryName = parts[1];
        const productName = parts[2];
        const fileName = parts.slice(3).join('/'); 
        let category = newBrands[brandName].categories.find(c => c.name === categoryName);
        if (!category) { category = { id: generateId('c'), name: categoryName, icon: 'Box', products: [] }; newBrands[brandName].categories.push(category); }
        let product = category.products.find(p => p.name === productName);
        if (!product) { product = { id: generateId('p'), name: productName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '', galleryUrls: [], videoUrls: [], manuals: [], dateAdded: new Date().toISOString() }; category.products.push(product); }
        const lowerFile = fileName.toLowerCase();
        if (fileName.endsWith('.json') && (fileName.includes('details') || fileName.includes('product'))) {
             try {
                 const text = await fileObj.async("text"); const meta = JSON.parse(text);
                 if (meta.id) product.id = meta.id; if (meta.name) product.name = meta.name; if (meta.description) product.description = meta.description; if (meta.sku) product.sku = meta.sku; if (meta.specs) product.specs = { ...product.specs, ...meta.specs }; if (meta.features) product.features = [...(product.features || []), ...(meta.features || [])]; if (meta.dimensions) product.dimensions = meta.dimensions; if (meta.boxContents) product.boxContents = meta.boxContents; if (meta.terms) product.terms = meta.terms; if (meta.dateAdded) product.dateAdded = meta.dateAdded;
             } catch(e) { console.warn("Failed to parse JSON for " + productName); }
        } else if (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg') || lowerFile.endsWith('.png') || lowerFile.endsWith('.webp')) {
             const url = await processAsset(fileObj, parts.slice(3).join('_'));
             if (lowerFile.includes('cover') || lowerFile.includes('main') || (!product.imageUrl && !lowerFile.includes('gallery'))) product.imageUrl = url; else product.galleryUrls = [...(product.galleryUrls || []), url];
        } else if (lowerFile.endsWith('.mp4') || lowerFile.endsWith('.webm') || lowerFile.endsWith('.mov')) {
            const url = await processAsset(fileObj, parts.slice(3).join('_')); product.videoUrls = [...(product.videoUrls || []), url];
        } else if (lowerFile.endsWith('.pdf')) {
             const url = await processAsset(fileObj, parts.slice(3).join('_')); product.manuals?.push({ id: generateId('man'), title: fileName.replace('.pdf', '').replace(/_/g, ' '), images: [], pdfUrl: url, thumbnailUrl: '' });
        }
    }
    return Object.values(newBrands);
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return;
    const zip = new JSZip();
    const dataJson = JSON.stringify(data, null, 2);
    zip.file("store_config.json", dataJson);
    const backupFolder = zip.folder("_System_Backup");
    if (backupFolder) backupFolder.file("export_info.txt", `Kiosk Pro Backup\nGenerated: ${new Date().toISOString()}`);
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a"); link.href = url; link.download = `kiosk_backup_${new Date().toISOString().split('T')[0]}.zip`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
};

const ToggleCard = ({ label, desc, icon, active, onClick }: any) => (
    <button onClick={onClick} className={`p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${active ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
        <div className={`p-2 rounded-lg ${active ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>{icon}</div>
        <div>
            <div className={`text-[10px] font-black uppercase ${active ? 'text-blue-900' : 'text-slate-500'}`}>{label}</div>
            <div className="text-[9px] text-slate-400 leading-tight">{desc}</div>
        </div>
        <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
            {active && <Check size={10} />}
        </div>
    </button>
);

const ToggleRow = ({ label, active, onClick }: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-[10px] font-bold text-slate-600 uppercase">{label}</span>
        <button onClick={onClick} className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${active ? 'left-6' : 'left-1'}`}></div>
        </button>
    </div>
);

// --- MAIN ADMIN DASHBOARD COMPONENT ---
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
  
  const [historyTab, setHistoryTab] = useState<'all' | 'delete' | 'restore' | 'update' | 'create'>('all');
  const [historySearch, setHistorySearch] = useState('');
  
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [exportProcessing, setExportProcessing] = useState(false);

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

  useEffect(() => { if (currentUser && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) setActiveTab(availableTabs[0].id); }, [currentUser]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);
  useEffect(() => { const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', handleBeforeUnload); return () => window.removeEventListener('beforeunload', handleBeforeUnload); }, [hasUnsavedChanges]);
  
  useEffect(() => {
    const heartbeat = setInterval(() => { if ((window as any).signalAppHeartbeat) { (window as any).signalAppHeartbeat(); } }, 2000);
    return () => clearInterval(heartbeat);
  }, []);

  const handleLocalUpdate = (newData: StoreData) => {
      setLocalData(newData);
      setHasUnsavedChanges(true);
      if (selectedBrand) { const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id); if (updatedBrand) setSelectedBrand(updatedBrand); }
      if (selectedCategory && selectedBrand) { const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id); const updatedCat = updatedBrand?.categories.find(c => c.id === selectedCategory.id); if (updatedCat) setSelectedCategory(updatedCat); }
      if (selectedTVBrand && newData.tv) { const updatedTVBrand = newData.tv.brands.find(b => b.id === selectedTVBrand.id); if (updatedTVBrand) setSelectedTVBrand(updatedTVBrand); }
  };

  const handleUpdateScreensaver = (key: keyof ScreensaverSettings, value: any) => {
      if (!localData) return;
      const newSettings = { ...localData.screensaverSettings, [key]: value };
      handleLocalUpdate({ ...localData, screensaverSettings: newSettings as ScreensaverSettings, archive: addToArchive('other', 'Screensaver Config Update', { key, value }, 'update') });
  };

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };

  const updateFleetMember = async (kiosk: KioskRegistry) => { if(supabase) { const payload = { id: kiosk.id, name: kiosk.name, device_type: kiosk.deviceType, assigned_zone: kiosk.assignedZone }; await supabase.from('kiosks').upsert(payload); onRefresh(); } };

  const removeFleetMember = async (id: string) => {
      const kiosk = localData?.fleet?.find(f => f.id === id);
      if(!kiosk) return;
      if(confirm(`Archive and remove device "${kiosk.name}" from live monitoring?`) && supabase) {
          const newArchive = addToArchive('device', kiosk.name, kiosk, 'delete');
          const updatedData = { ...localData!, archive: newArchive };
          await supabase.from('kiosks').delete().eq('id', id);
          onUpdateData(updatedData);
          onRefresh();
      }
  };

  const addToArchive = (type: ArchivedItem['type'], name: string, data: any, action: ArchivedItem['action'] = 'delete', method: ArchivedItem['method'] = 'admin_panel') => {
      if (!localData || !currentUser) return;
      const now = new Date().toISOString();
      const newItem: ArchivedItem = { id: generateId('arch'), type, action, name, userName: currentUser.name, method, data, deletedAt: now };
      const currentArchive = localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} };
      const newArchive = { ...currentArchive, deletedItems: [newItem, ...(currentArchive.deletedItems || [])].slice(0, 1000) };
      return newArchive;
  };

  const restoreBrand = (b: Brand) => {
     if(!localData) return;
     const newArchiveBrands = localData.archive?.brands.filter(x => x.id !== b.id) || [];
     const newBrands = [...localData.brands, b];
     const newArchive = addToArchive('brand', b.name, b, 'restore');
     handleLocalUpdate({ ...localData, brands: newBrands, archive: { ...localData.archive!, brands: newArchiveBrands, deletedItems: newArchive?.deletedItems } });
  };
  
  const restoreCatalogue = (c: Catalogue) => {
     if(!localData) return;
     const newArchiveCats = localData.archive?.catalogues.filter(x => x.id !== c.id) || [];
     const newCats = [...(localData.catalogues || []), c];
     const newArchive = addToArchive('catalogue', c.title, c, 'restore');
     handleLocalUpdate({ ...localData, catalogues: newCats, archive: { ...localData.archive!, catalogues: newArchiveCats, deletedItems: newArchive?.deletedItems } });
  };

  const handleMoveProduct = (product: Product, targetBrandId: string, targetCategoryId: string) => {
      if (!localData || !selectedBrand || !selectedCategory) return;
      const updatedSourceCat = { ...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id) };
      let newBrands = localData.brands.map(b => { if (b.id === selectedBrand.id) { return { ...b, categories: b.categories.map(c => c.id === selectedCategory.id ? updatedSourceCat : c) }; } return b; });
      newBrands = newBrands.map(b => { if (b.id === targetBrandId) { return { ...b, categories: b.categories.map(c => { if (c.id === targetCategoryId) { return { ...c, products: [...c.products, product] }; } return c; }) }; } return b; });
      const newArchive = addToArchive('product', product.name, { product, from: selectedCategory.name, to: targetCategoryId }, 'update');
      handleLocalUpdate({ ...localData, brands: newBrands, archive: newArchive });
      setMovingProduct(null);
  };

  const formatRelativeTime = (isoString: string) => {
      if (!isoString) return 'Unknown';
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
  };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const tvBrands = Array.isArray(localData.tv?.brands) ? [...localData.tv!.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const archivedGenericItems = (localData.archive?.deletedItems || []).filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(historySearch.toLowerCase()) || i.userName.toLowerCase().includes(historySearch.toLowerCase()) || i.type.toLowerCase().includes(historySearch.toLowerCase());
      const matchesTab = historyTab === 'all' || i.action === historyTab;
      return matchesSearch && matchesTab;
  });

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
                             hasUnsavedChanges ? 'bg-blue-600 text-white shadow-lg animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                         }`}
                     >
                         <SaveAll size={16} /> {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                     </button>
                 </div>
                 <div className="flex items-center gap-3">
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'} border border-white/10`}>
                         <Cloud size={14} /> <span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local'}</span>
                     </div>
                     <button onClick={logout} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative">
            {activeTab === 'guide' && <SystemDocumentation />}

            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 animate-fade-in">
                       <button onClick={() => { const name = prompt("Brand Name:"); if(name) { handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }], archive: addToArchive('brand', name, null, 'create') }); } }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 min-h-[120px]">
                           <Plus size={24} className="mb-2" /><span className="font-bold uppercase text-[10px] md:text-xs">Add Brand</span>
                       </button>
                       {brands.map(brand => (
                           <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col h-full">
                               <div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">
                                   {brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}
                               </div>
                               <div className="p-2 md:p-4">
                                   <h3 className="font-black text-slate-900 text-xs md:text-lg uppercase truncate mb-1">{brand.name}</h3>
                                   <button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button>
                               </div>
                           </div>
                       ))}
                   </div>
               ) : !selectedCategory ? (
                   <div className="animate-fade-in">
                       <div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2></div>
                       <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                           <button onClick={() => { const name = prompt("Category Name:"); if(name) { const updated = {...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name, icon: 'Box', products: [] }]}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b)}); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 aspect-square"><Plus size={24} /></button>
                           {selectedBrand.categories.map(cat => (
                               <button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-2 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md text-left group relative aspect-square flex flex-col justify-center">
                                   <Box size={20} className="mb-2 text-slate-400 mx-auto md:mx-0" />
                                   <h3 className="font-black text-slate-900 uppercase text-[10px] md:text-sm text-center md:text-left truncate w-full">{cat.name}</h3>
                                   <p className="text-[9px] md:text-xs text-slate-500 font-bold text-center md:text-left">{cat.products.length} Products</p>
                                </button>
                            ))}
                       </div>
                   </div>
               ) : (
                   <div className="animate-fade-in h-full flex flex-col">
                       <div className="flex items-center gap-4 mb-6 shrink-0"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-lg md:text-2xl font-black uppercase text-slate-900 flex-1 truncate">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg font-bold uppercase text-[10px] md:text-xs flex items-center gap-2 shrink-0"><Plus size={14} /> Add</button></div>
                       <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 overflow-y-auto pb-20">
                           {selectedCategory.products.map(product => (
                               <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                                   <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-2 md:p-4">
                                       {product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-300" />}
                                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                           <div className="flex gap-2">
                                                <button onClick={() => setEditingProduct(product)} className="p-2 bg-white text-blue-600 rounded-lg font-bold text-[10px] uppercase shadow-lg">Edit</button>
                                                <button onClick={() => setMovingProduct(product)} className="p-2 bg-white text-orange-600 rounded-lg font-bold text-[10px] uppercase shadow-lg">Move</button>
                                           </div>
                                           <button onClick={() => { if(confirm(`Delete product "${product.name}"?`)) { const updatedCat = {...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id)}; const updatedBrand = {...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) || []}; handleLocalUpdate({...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b)}); } }} className="p-2 bg-white text-red-600 rounded-lg font-bold text-[10px] uppercase shadow-lg w-[80%]">Delete</button>
                                       </div>
                                   </div>
                                   <div className="p-2 md:p-4">
                                       <h4 className="font-bold text-slate-900 text-[10px] md:text-sm truncate uppercase">{product.name}</h4>
                                       <p className="text-[9px] md:text-xs text-slate-500 font-mono truncate">{product.sku || 'No SKU'}</p>
                                   </div>
                               </div>
                            ))}
                       </div>
                   </div>
               )
            )}

            {activeTab === 'screensaver' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Timing & Triggers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2"><span>Idle Timeout</span><span className="text-blue-600">{localData.screensaverSettings?.idleTimeout || 60}s</span></label>
                                <input type="range" min="10" max="300" step="5" value={localData.screensaverSettings?.idleTimeout || 60} onChange={(e) => handleUpdateScreensaver('idleTimeout', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div>
                                <label className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2"><span>Slide Duration</span><span className="text-blue-600">{localData.screensaverSettings?.imageDuration || 8}s</span></label>
                                <input type="range" min="3" max="60" step="1" value={localData.screensaverSettings?.imageDuration || 8} onChange={(e) => handleUpdateScreensaver('imageDuration', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Layers size={18} className="text-purple-500" /> Content Sources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ToggleCard label="Product Images" desc="Include main product photos" icon={<ImageIcon size={16}/>} active={localData.screensaverSettings?.showProductImages} onClick={() => handleUpdateScreensaver('showProductImages', !localData.screensaverSettings?.showProductImages)} />
                            <ToggleCard label="Product Videos" desc="Include uploaded video clips" icon={<Video size={16}/>} active={localData.screensaverSettings?.showProductVideos} onClick={() => handleUpdateScreensaver('showProductVideos', !localData.screensaverSettings?.showProductVideos)} />
                            <ToggleCard label="Pamphlets" desc="Show active catalogue pages" icon={<BookOpen size={16}/>} active={localData.screensaverSettings?.showPamphlets} onClick={() => handleUpdateScreensaver('showPamphlets', !localData.screensaverSettings?.showPamphlets)} />
                            <ToggleCard label="Custom Ads" desc="Interleave Marketing Ads" icon={<Megaphone size={16}/>} active={localData.screensaverSettings?.showCustomAds} onClick={() => handleUpdateScreensaver('showCustomAds', !localData.screensaverSettings?.showCustomAds)} />
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'fleet' && (
                <div className="animate-fade-in max-w-7xl mx-auto pb-24">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(localData.fleet || []).map(kiosk => (
                             <div key={kiosk.id} className="bg-slate-950 border-2 border-slate-800 rounded-[2rem] overflow-hidden p-5 flex flex-col">
                                 <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div><span className="text-[8px] font-black uppercase text-blue-400">Active</span></div>
                                 <h4 className="font-black text-white uppercase text-base leading-none mb-4">{kiosk.name}</h4>
                                 <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 mb-4">
                                     <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Last Seen</div>
                                     <div className="text-xs font-bold text-slate-300">{formatRelativeTime(kiosk.last_seen)}</div>
                                 </div>
                                 <button onClick={() => setEditingKiosk(kiosk)} className="w-full bg-slate-900 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase">Modify Device</button>
                             </div>
                        ))}
                   </div>
                </div>
            )}
        </main>

        {editingProduct && (
            <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md p-4 md:p-12 flex items-center justify-center animate-fade-in">
                <ProductEditor 
                    product={editingProduct} 
                    onSave={(p) => {
                        if (!selectedBrand || !selectedCategory) return;
                        const isNew = !selectedCategory.products.find(x => x.id === p.id);
                        const newProducts = isNew ? [...selectedCategory.products, p] : selectedCategory.products.map(x => x.id === p.id ? p : x);
                        const updatedCat = { ...selectedCategory, products: newProducts };
                        const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) };
                        handleLocalUpdate({ ...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) });
                        setEditingProduct(null);
                    }} 
                    onCancel={() => setEditingProduct(null)} 
                />
            </div>
        )}
        {movingProduct && <MoveProductModal product={movingProduct} allBrands={brands} currentBrandId={selectedBrand?.id || ''} currentCategoryId={selectedCategory?.id || ''} onClose={() => setMovingProduct(null)} onMove={(product, targetBrand, targetCategory) => handleMoveProduct(product, targetBrand, targetCategory)} />}
        {editingKiosk && <KioskEditorModal kiosk={editingKiosk} onSave={(k) => { updateFleetMember(k); setEditingKiosk(null); }} onClose={() => setEditingKiosk(null)} />}
        {editingTVModel && <TVModelEditor model={editingTVModel} onSave={(m) => { if (!selectedTVBrand) return; const isNew = !selectedTVBrand.models.find(x => x.id === m.id); const newModels = isNew ? [...selectedTVBrand.models, m] : selectedTVBrand.models.map(x => x.id === m.id ? m : x); const updatedTVBrand = { ...selectedTVBrand, models: newModels }; handleLocalUpdate({ ...localData, tv: { ...localData.tv, brands: tvBrands.map(b => b.id === selectedTVBrand.id ? updatedTVBrand : b) } as TVConfig }); setEditingTVModel(null); }} onClose={() => setEditingTVModel(null)} />}
    </div>
  );
};

export default AdminDashboard;
