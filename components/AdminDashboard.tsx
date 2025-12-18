
import React, { useState, useEffect, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List
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

// ... (SystemDocumentation component omitted for brevity as no changes needed there) ...
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash { to { stroke-dashoffset: -20; } }
                .animate-dash { animation: dash 1s linear infinite; }
                @keyframes flow { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(100px); opacity: 0; } }
                .packet { animation: flow 2s infinite ease-in-out; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2); opacity: 0; } }
                .radar-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
                @keyframes scroll-film { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .film-strip { animation: scroll-film 10s linear infinite; }
            `}</style>
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
                <div className="mb-6 px-2"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Manual</h3><p className="text-[10px] text-slate-500 font-medium">v2.5 Technical Reference</p></div>
                <div className="space-y-1">{sections.map(section => (<button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeSection === section.id ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'}`}><span className={activeSection === section.id ? 'opacity-100' : 'opacity-70'}>{section.icon}</span><span className="text-xs uppercase tracking-wide">{section.label}</span></button>))}</div>
            </div>
            <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0">{sections.map(section => (<button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex-none px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeSection === section.id ? 'bg-blue-600 text-white shadow-md font-bold' : 'bg-white border border-slate-200 text-slate-600'}`}>{section.icon}<span className="text-xs uppercase tracking-wide whitespace-nowrap">{section.label}</span></button>))}</div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white scroll-smooth">
                {activeSection === 'architecture' && (<div className="space-y-8 max-w-4xl mx-auto"><div className="border-b border-slate-100 pb-6"><h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3"><Network className="text-blue-600" size={32} /> Hybrid Cloud Architecture</h2><p className="text-slate-500 font-medium">Local-First performance with Cloud synchronization.</p></div><div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl"><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div><div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8"><div className="flex flex-col items-center gap-4 z-20"><div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]"><HardDrive size={40} className="text-blue-400" /></div><div className="text-center"><div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div><div className="text-blue-400 text-[10px] font-mono">IndexedDB / Cache</div></div></div><div className="flex-1 h-24 relative mx-4 flex items-center"><svg className="w-full h-12 overflow-visible"><line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" /><circle r="4" fill="#60a5fa" className="packet" style={{ animationDelay: '0s' }}><animateMotion dur="2s" repeatCount="indefinite" path="M0,6 L300,6" /></circle><circle r="4" fill="#4ade80" className="packet" style={{ animationDelay: '1s' }}><animateMotion dur="2s" repeatCount="indefinite" path="M300,6 L0,6" /></circle></svg><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-slate-400">Sync (60s)</div></div><div className="flex flex-col items-center gap-4 z-20"><div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]"><Database size={40} className="text-green-400" /></div><div className="text-center"><div className="text-white font-bold uppercase tracking-widest text-sm">Supabase Cloud</div><div className="text-green-400 text-[10px] font-mono">PostgreSQL DB</div></div></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><HardDrive size={18} className="text-blue-600"/> The "Local-First" Strategy</h3><p className="text-sm text-slate-600 leading-relaxed">To ensure instant performance in retail environments with unstable WiFi, the kiosk <strong>never</strong> loads data directly from the cloud during customer interaction.</p><ul className="space-y-2"><li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div><span><strong>Instant Boot:</strong> Uses `localStorage` to load the full inventory in milliseconds.</span></li><li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div><span><strong>Zero Latency:</strong> Product images and videos are cached by the Service Worker.</span></li></ul></div><div className="space-y-4"><h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><RefreshCw size={18} className="text-green-600"/> Synchronization Logic</h3><p className="text-sm text-slate-600 leading-relaxed">The system maintains a background connection to Supabase to keep data fresh without interrupting the user.</p><div className="border-l-2 border-green-200 pl-4 py-1 space-y-2"><div className="text-xs font-mono text-slate-500">1. Startup</div><div className="text-sm font-bold text-slate-800">Fetch latest JSON config & Telemetry</div><div className="text-xs font-mono text-slate-500 mt-2">2. Runtime (Loop)</div><div className="text-sm font-bold text-slate-800">Every 60s: Push Heartbeat & Pull Config Changes</div><div className="text-xs font-mono text-slate-500 mt-2">3. Admin Event</div><div className="text-sm font-bold text-slate-800">Realtime WebSocket triggers immediate refresh</div></div></div></div></div>)}
                {activeSection === 'inventory' && (<div className="space-y-8 max-w-4xl mx-auto"><div className="border-b border-slate-100 pb-6"><h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3"><Box className="text-orange-600" size={32} /> Data Hierarchy</h2><p className="text-slate-500 font-medium">Strict 3-Level Parent-Child Relationship Model.</p></div><div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden"><div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8 animate-fade-in"><div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div><div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div><div className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">Contains: Logo, Theme Color</div></div><div className="absolute top-24 bottom-20 w-0.5 bg-slate-300"></div><div className="relative z-10 flex gap-4 mb-8"><div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.1s'}}><div className="text-[9px] font-black uppercase text-slate-400">Level 2</div><div className="font-bold text-sm text-slate-900">Category A</div></div><div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.2s'}}><div className="text-[9px] font-black uppercase text-slate-400">Level 2</div><div className="font-bold text-sm text-slate-900">Category B</div></div></div><div className="relative z-10 flex gap-2"><div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.3s'}}><Box size={16} className="mx-auto text-orange-500 mb-1"/><div className="text-[10px] font-bold">Product 1</div></div><div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.4s'}}><Box size={16} className="mx-auto text-orange-500 mb-1"/><div className="text-[10px] font-bold">Product 2</div></div><div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.5s'}}><Box size={16} className="mx-auto text-orange-500 mb-1"/><div className="text-[10px] font-bold">Product 3</div></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="prose prose-sm prose-slate"><h3 className="text-slate-900 font-bold">Why this structure?</h3><p>This rigid hierarchy ensures consistent navigation on the kiosk. A product <strong>cannot</strong> exist without a Category, and a Category <strong>cannot</strong> exist without a Brand.</p><ul><li><strong>Brands:</strong> Act as the main filter on the Home Screen.</li><li><strong>Categories:</strong> Auto-generate icons based on name (e.g., "Watch" gets a watch icon).</li><li><strong>Products:</strong> The actual leaf nodes containing SKU, Specs, and Media.</li></ul></div><div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-xs overflow-x-auto"><div className="text-green-400 font-bold mb-2">// Data Model (JSON)</div>{`{
  "brands": [
    {
      "id": "b-123",
      "name": "Samsung",
      "categories": [
        {
          "name": "Smartphones",
          "products": [
             { "sku": "S24-ULTRA", ... }
          ]
        }
      ]
    }
  ]
}`}</div></div></div>)}
                {activeSection === 'screensaver' && (<div className="space-y-8 max-w-4xl mx-auto"><div className="border-b border-slate-100 pb-6"><h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3"><Zap className="text-yellow-500" size={32} /> Screensaver Automation</h2><p className="text-slate-500 font-medium">Autonomous marketing engine with probabilistic scheduling.</p></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-slate-50 rounded-2xl p-6 border border-slate-200"><h3 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Decision Engine</h3><div className="space-y-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400">1</div><div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><div className="font-bold text-sm text-slate-800">Idle Timer</div><div className="text-xs text-slate-500">Wait 60s without touch input.</div></div></div><div className="flex justify-center"><div className="h-4 w-0.5 bg-slate-300"></div></div><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-full border-2 border-blue-200 flex items-center justify-center font-bold text-blue-500">2</div><div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><div className="font-bold text-sm text-slate-800">Content Gathering</div><div className="text-xs text-slate-500">Collect Ads, Products, Pamphlets.</div></div></div><div className="flex justify-center"><div className="h-4 w-0.5 bg-slate-300"></div></div><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-full border-2 border-green-200 flex items-center justify-center font-bold text-green-500">3</div><div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><div className="font-bold text-sm text-slate-800">Playlist Generation</div><div className="text-xs text-slate-500">Apply weights & shuffle.</div></div></div></div></div><div><h3 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Weighting Algorithm</h3><div className="space-y-4"><div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><div className="flex justify-between items-center mb-2"><span className="font-bold text-purple-900 text-sm">Custom Ads</span><span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px] font-black">3x Frequency</span></div><p className="text-xs text-purple-700 leading-relaxed">Any image/video uploaded to "Screensaver Ads" in Marketing is added <strong>3 times</strong> to the playlist to ensure high visibility.</p></div><div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><div className="flex justify-between items-center mb-2"><span className="font-bold text-blue-900 text-sm">Products</span><span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-[10px] font-black">Age Filtered</span></div><p className="text-xs text-blue-700 leading-relaxed">Products older than 6 months have a <strong>75% chance</strong> of being skipped. This keeps the screensaver focused on fresh inventory.</p></div><div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><div className="flex justify-between items-center mb-2"><span className="font-bold text-slate-900 text-sm">Sleep Mode</span><span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">Schedule</span></div><p className="text-xs text-slate-600 leading-relaxed">Outside of Active Hours (e.g. 8am-8pm), the screen turns <strong>black</strong> to save panel life and electricity. Touch still wakes it.</p></div></div></div></div></div>)}
                {activeSection === 'fleet' && (<div className="space-y-8 max-w-4xl mx-auto"><div className="border-b border-slate-100 pb-6"><h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3"><Activity className="text-green-600" size={32} /> Fleet Telemetry</h2><p className="text-slate-500 font-medium">Real-time device monitoring and remote command execution.</p></div><div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden min-h-[300px] flex items-center justify-center"><div className="absolute w-64 h-64 border border-green-500/20 rounded-full radar-ring"></div><div className="absolute w-64 h-64 border border-green-500/20 rounded-full radar-ring" style={{animationDelay: '0.5s'}}></div><div className="relative z-10 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)]"><Database size={32} className="text-white" /></div><div className="absolute top-10 left-10 flex flex-col items-center"><Tablet size={24} className="text-blue-400 mb-1" /><div className="text-[10px] text-blue-400 font-mono">Kiosk 1</div></div><div className="absolute bottom-16 right-20 flex flex-col items-center"><Smartphone size={24} className="text-purple-400 mb-1" /><div className="text-[10px] text-purple-400 font-mono">Mobile 1</div></div><div className="absolute top-20 right-10 flex flex-col items-center"><Tv size={24} className="text-indigo-400 mb-1" /><div className="text-[10px] text-indigo-400 font-mono">TV Wall</div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><h3 className="font-bold text-slate-900 text-lg">Heartbeat Protocol</h3><p className="text-sm text-slate-600">Every device calls the `sendHeartbeat()` function every 60 seconds.</p><div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><h4 className="text-xs font-black uppercase text-slate-400 mb-2">Payload Sent</h4><pre className="text-[10px] font-mono text-blue-600 bg-blue-50 p-2 rounded">{`{ "id": "LOC-84921", "status": "online", "last_seen": "2023-10-27T10:00:00Z", "wifi_strength": 80, "version": "1.0.5" }`}</pre></div></div><div className="space-y-4"><h3 className="font-bold text-slate-900 text-lg">Command & Control</h3><p className="text-sm text-slate-600">The server responds with configuration overrides.</p><ul className="space-y-2"><li className="flex gap-3 text-sm text-slate-700"><Check size={16} className="text-green-500 mt-0.5" /><span><strong>Remote Restart:</strong> Setting `restart_requested=true` in DB forces the page to reload on next heartbeat.</span></li><li className="flex gap-3 text-sm text-slate-700"><Check size={16} className="text-green-500 mt-0.5" /><span><strong>Config Sync:</strong> Changing a device name in Admin Hub automatically updates the physical device within 60s.</span></li></ul></div></div></div>)}
                {activeSection === 'tv' && (<div className="space-y-8 max-w-4xl mx-auto"><div className="border-b border-slate-100 pb-6"><h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3"><Tv className="text-indigo-600" size={32} /> TV Mode Logic</h2><p className="text-slate-500 font-medium">Specialized routing for non-interactive displays.</p></div><div className="bg-black rounded-3xl p-8 relative overflow-hidden h-40 flex items-center"><div className="film-strip flex gap-4 absolute left-0">{[1,2,3,4,5,6].map(i => (<div key={i} className="w-48 h-28 bg-slate-800 border-y-4 border-dashed border-slate-600 shrink-0 flex items-center justify-center"><PlayCircle size={32} className="text-white opacity-50" /></div>))}{[1,2,3,4,5,6].map(i => (<div key={`dup-${i}`} className="w-48 h-28 bg-slate-800 border-y-4 border-dashed border-slate-600 shrink-0 flex items-center justify-center"><PlayCircle size={32} className="text-white opacity-50" /></div>))}</div><div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none"></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100"><h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><PlayCircle size={18}/> Autoplay Policy</h3><p className="text-xs text-indigo-800 leading-relaxed">Modern browsers block video autoplay with sound. <br/><br/> <strong>Solution:</strong> TV Mode videos are muted by default. A staff member must tap the screen <em>once</em> after launch to unlock the audio context if sound is required.</p></div><div className="space-y-4"><h3 className="font-bold text-slate-900 text-lg">Routing & UI</h3><p className="text-sm text-slate-600">When a device is set to "TV Mode":</p><ul className="list-disc pl-5 space-y-2 text-sm text-slate-600"><li><strong>Hidden Navigation:</strong> The standard Kiosk header, footer, and back buttons are removed or minimized.</li><li><strong>Landscape Lock:</strong> CSS rules force visual rotation prompts if the device is held in portrait.</li><li><strong>Interaction:</strong> Touches bring up overlay controls (Play/Pause/Next) which fade out after 4 seconds of inactivity.</li></ul></div></div></div>)}
            </div>
        </div>
    );
};

// Fix: Added missing Auth component for admin PIN verification
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admin Access</h2>
          <p className="text-slate-500 text-sm font-medium">Enter secure PIN to continue</p>
        </div>
        
        <input 
          type="password" 
          value={pin} 
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          placeholder="••••"
          maxLength={8}
          className={`w-full p-4 bg-slate-100 border-2 rounded-xl text-center text-3xl font-black tracking-[0.5em] outline-none transition-all ${error ? 'border-red-500 text-red-600' : 'border-transparent focus:border-blue-500 focus:bg-white'}`}
          autoFocus
        />
        
        {error && <p className="text-red-500 text-[10px] font-black mt-2 text-center uppercase tracking-widest animate-pulse">Invalid Security PIN</p>}
        
        <button type="submit" className="w-full mt-8 bg-slate-900 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
          Verify Identity
        </button>
      </form>
    </div>
  );
};

// ... (Rest of utils/FileUpload/ManualPricelistEditor components omitted for brevity) ...

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

  // Handle Global Save
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
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button>
                 </div>
                 <div className="flex items-center gap-3">
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'}`}><Cloud size={14} /><span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span></div>
                     <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button>
                     <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2"><LogOut size={16} /><span className="text-[10px] font-bold uppercase hidden md:inline">Logout</span></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'inventory' && (
                /* ... (Inventory management UI) ... */
                <div className="animate-fade-in">
                    <p className="text-slate-400 uppercase font-black text-[10px] tracking-widest mb-4">Manage Core Stock & Brands</p>
                    {!selectedBrand ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            <button onClick={() => { const name = prompt("Brand Name:"); if(name) setLocalData({...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }]}) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group min-h-[120px] md:min-h-[200px]"><Plus size={24} className="mb-2" /><span className="font-bold uppercase text-[10px] md:text-xs tracking-wider text-center">Add Brand</span></button>
                            {brands.map(brand => (
                                <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col h-full"><div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}</div><div className="p-2 md:p-4"><h3 className="font-black text-slate-900 text-xs md:text-lg uppercase tracking-tight mb-1 truncate">{brand.name}</h3><p className="text-[10px] md:text-xs text-slate-500 font-bold mb-2 md:mb-4">{brand.categories.length} Categories</p><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase hover:bg-blue-600 transition-colors">Manage</button></div></div>
                            ))}
                        </div>
                    ) : (
                         /* Specific brand logic... */
                         <div className="bg-white p-6 rounded-2xl border border-slate-200"><button onClick={() => setSelectedBrand(null)} className="mb-4 text-xs font-black uppercase text-blue-600 flex items-center gap-1"><ArrowLeft size={14}/> Back to Brands</button><h2 className="text-2xl font-black uppercase mb-4">{selectedBrand.name}</h2></div>
                    )}
                </div>
            )}

            {activeTab === 'fleet' && (
                <div className="animate-fade-in max-w-6xl mx-auto pb-24">
                   <div className="flex items-center justify-between mb-8">
                       <h2 className="text-2xl font-black text-slate-900 uppercase">Live Device Fleet</h2>
                       <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-xs font-bold text-slate-500 flex items-center gap-2">
                           <RefreshCw size={12} className="text-blue-500 animate-spin" /> Auto-Refreshing Live Logs
                       </div>
                   </div>

                   {['kiosk', 'mobile', 'tv'].map((type) => {
                       const devices = localData.fleet?.filter(k => k.deviceType === type || (type === 'kiosk' && !k.deviceType)) || [];
                       if (devices.length === 0) return null;

                       const config = {
                           kiosk: { label: 'Interactive Kiosks', icon: <Tablet size={20} className="text-blue-600" />, color: 'blue' },
                           mobile: { label: 'Mobile Handhelds', icon: <Smartphone size={20} className="text-purple-600" />, color: 'purple' },
                           tv: { label: 'TV Displays', icon: <Tv size={20} className="text-indigo-600" />, color: 'indigo' }
                       }[type as 'kiosk' | 'mobile' | 'tv'];

                       return (
                           <div key={type} className="mb-10 last:mb-0">
                               <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
                                   <div className={`p-2 rounded-lg bg-${config.color}-50`}>{config.icon}</div>
                                   <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{config.label}</h3>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {devices.map(kiosk => {
                                       // Tighter threshold for "Live" status: 3 minutes (180,000ms)
                                       const isOnline = (new Date().getTime() - new Date(kiosk.last_seen).getTime()) < 180000;
                                       return (
                                           <div key={kiosk.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
                                               <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-start">
                                                   <div className="flex-1 min-w-0 pr-2">
                                                       <h4 className="font-bold text-slate-900 uppercase text-sm leading-tight break-words">{kiosk.name}</h4>
                                                       <div className="text-[10px] font-mono text-slate-400">ID: {kiosk.id}</div>
                                                   </div>
                                                   <div className={`shrink-0 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${isOnline ? 'bg-green-50 text-green-700 border-green-200 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                       <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                       {isOnline ? 'Online' : 'Offline'}
                                                   </div>
                                               </div>
                                               <div className="p-4 flex-1">
                                                   <div className="flex justify-between items-center text-xs mb-2">
                                                       <span className="text-slate-400 font-bold uppercase text-[10px]">Zone</span>
                                                       <span className="font-bold text-slate-700">{kiosk.assignedZone || 'Unassigned'}</span>
                                                   </div>
                                                   <div className="flex justify-between items-center text-xs">
                                                       <span className="text-slate-400 font-bold uppercase text-[10px]">Last Seen</span>
                                                       <span className="font-bold text-slate-500">{new Date(kiosk.last_seen).toLocaleTimeString()}</span>
                                                   </div>
                                               </div>
                                               <div className="bg-slate-50 p-2 border-t border-slate-100 flex gap-2">
                                                   <button onClick={() => setEditingKiosk(kiosk)} className="flex-1 py-2 bg-white text-slate-600 rounded-lg border border-slate-200 hover:text-blue-600 text-[10px] font-bold uppercase">Edit</button>
                                                   <button onClick={async () => { if(confirm("Restart Device?")) await supabase.from('kiosks').update({restart_requested: true}).eq('id', kiosk.id); }} className="flex-1 py-2 bg-white text-orange-600 rounded-lg border border-slate-200 text-[10px] font-bold uppercase">Restart</button>
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           </div>
                       );
                   })}
                </div>
            )}
        </main>
        {/* ... (Modals omitted for brevity) ... */}
    </div>
  );
};

export default AdminDashboard;
