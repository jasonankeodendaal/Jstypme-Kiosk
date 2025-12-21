
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles
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

// --- SYSTEM DOCUMENTATION COMPONENT ---
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');

    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'pricelists', label: 'Pricelist Engine', icon: <RIcon size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash {
                  to { stroke-dashoffset: -20; }
                }
                .animate-dash {
                  animation: dash 1s linear infinite;
                }
                @keyframes flow {
                    0% { transform: translateX(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100px); opacity: 0; }
                }
                .packet {
                    animation: flow 2s infinite ease-in-out;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .radar-ring {
                    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
                @keyframes scroll-film {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .film-strip {
                    animation: scroll-film 10s linear infinite;
                }
                @keyframes data-stream {
                    0% { stroke-dashoffset: 100; }
                    100% { stroke-dashoffset: 0; }
                }
                .animate-data {
                    stroke-dasharray: 5 5;
                    animation: data-stream 2s linear infinite;
                }
            `}</style>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
                <div className="mb-6 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Manual</h3>
                    <p className="text-[10px] text-slate-500 font-medium">v2.5 Technical Reference</p>
                </div>
                <div className="space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'
                            }`}
                        >
                            <span className={activeSection === section.id ? 'opacity-100' : 'opacity-70'}>
                                {section.icon}
                            </span>
                            <span className="text-xs uppercase tracking-wide">{section.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Mobile Sidebar (Horizontal) */}
            <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0">
                 {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-none px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                        >
                            {section.icon}
                            <span className="text-xs uppercase tracking-wide whitespace-nowrap">{section.label}</span>
                        </button>
                    ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Network className="text-blue-600" size={32} /> Hybrid Cloud Architecture
                            </h2>
                            <p className="text-slate-500 font-medium">Local-First performance with Cloud synchronization.</p>
                        </div>

                        {/* Animated Architecture Diagram */}
                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8">
                                {/* Local Node */}
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <HardDrive size={40} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div>
                                        <div className="text-blue-400 text-[10px] font-mono">IndexedDB / Cache</div>
                                    </div>
                                </div>

                                {/* Connection Lines */}
                                <div className="flex-1 h-24 relative mx-4 flex items-center">
                                    <svg className="w-full h-12 overflow-visible">
                                        {/* Dashed Base Line */}
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
                                        
                                        {/* Data Packets */}
                                        <circle r="4" fill="#60a5fa" className="packet" style={{ animationDelay: '0s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M0,6 L300,6" />
                                        </circle>
                                        <circle r="4" fill="#4ade80" className="packet" style={{ animationDelay: '1s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M300,6 L0,6" />
                                        </circle>
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-slate-400">
                                        Sync (60s)
                                    </div>
                                </div>

                                {/* Cloud Node */}
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                                        <Database size={40} className="text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Supabase Cloud</div>
                                        <div className="text-green-400 text-[10px] font-mono">PostgreSQL DB</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><HardDrive size={18} className="text-blue-600"/> The "Local-First" Strategy</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    To ensure instant performance in retail environments with unstable WiFi, the kiosk <strong>never</strong> loads data directly from the cloud during customer interaction.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                                        <span><strong>Instant Boot:</strong> Uses `localStorage` to load the full inventory in milliseconds.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                                        <span><strong>Zero Latency:</strong> Product images and videos are cached by the Service Worker.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><RefreshCw size={18} className="text-green-600"/> Synchronization Logic</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    The system maintains a background connection to Supabase to keep data fresh without interrupting the user.
                                </p>
                                <div className="border-l-2 border-green-200 pl-4 py-1 space-y-2">
                                    <div className="text-xs font-mono text-slate-500">1. Startup</div>
                                    <div className="text-sm font-bold text-slate-800">Fetch latest JSON config & Telemetry</div>
                                    
                                    <div className="text-xs font-mono text-slate-500 mt-2">2. Runtime (Loop)</div>
                                    <div className="text-sm font-bold text-slate-800">Every 60s: Push Heartbeat & Pull Config Changes</div>
                                    
                                    <div className="text-xs font-mono text-slate-500 mt-2">3. Admin Event</div>
                                    <div className="text-sm font-bold text-slate-800">Realtime WebSocket triggers immediate refresh</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Box className="text-orange-600" size={32} /> Data Hierarchy
                            </h2>
                            <p className="text-slate-500 font-medium">Strict 3-Level Parent-Child Relationship Model.</p>
                        </div>

                        {/* Hierarchical Visualization */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
                            {/* Level 1: Brand */}
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8 animate-fade-in">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div>
                                <div className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">
                                    Contains: Logo, Theme Color
                                </div>
                            </div>

                            {/* Connector Line */}
                            <div className="absolute top-24 bottom-20 w-0.5 bg-slate-300"></div>

                            {/* Level 2: Categories */}
                            <div className="relative z-10 flex gap-4 mb-8">
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category A</div>
                                </div>
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.2s'}}>
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category B</div>
                                </div>
                            </div>

                            {/* Level 3: Products */}
                            <div className="relative z-10 flex gap-2">
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/>
                                    <div className="text-[10px] font-bold">Product 1</div>
                                </div>
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/>
                                    <div className="text-[10px] font-bold">Product 2</div>
                                </div>
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.5s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/>
                                    <div className="text-[10px] font-bold">Product 3</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="prose prose-sm prose-slate">
                                <h3 className="text-slate-900 font-bold">Why this structure?</h3>
                                <p>
                                    This rigid hierarchy ensures consistent navigation on the kiosk. A product <strong>cannot</strong> exist without a Category, and a Category <strong>cannot</strong> exist without a Brand.
                                </p>
                                <ul>
                                    <li><strong>Brands:</strong> Act as the main filter on the Home Screen.</li>
                                    <li><strong>Categories:</strong> Auto-generate icons based on name (e.g., "Watch" gets a watch icon).</li>
                                    <li><strong>Products:</strong> The actual leaf nodes containing SKU, Specs, and Media.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                                <div className="text-green-400 font-bold mb-2">// Data Model (JSON)</div>
                                {`{
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
}`}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <RIcon className="text-green-600" size={32} /> Pricelist Engine
                            </h2>
                            <p className="text-slate-500 font-medium">Hybrid document distribution with bulk ingestion logic.</p>
                        </div>

                        {/* Visualization of Modes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 text-white/5 group-hover:text-white/10 transition-colors">
                                    <FileText size={120} />
                                </div>
                                <h3 className="text-white font-black uppercase text-sm mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Mode A: PDF Cloud
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                                    Legacy documents and external brochures are served via Cloud Storage CDN. 
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 bg-blue-400/5 p-2 rounded">
                                        <Cloud size={12} /> GET -> /storage/v1/object/public/...
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-600 rounded-2xl p-6 border border-blue-500 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 text-white/10 group-hover:text-white/20 transition-colors">
                                    <Table size={120} />
                                </div>
                                <h3 className="text-white font-black uppercase text-sm mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white"></div> Mode B: Native Tables
                                </h3>
                                <p className="text-blue-100 text-xs leading-relaxed mb-6">
                                    High-density interactive tables built directly in the Admin Hub via spreadsheet import.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-200 bg-white/10 p-2 rounded">
                                        <Table size={12} /> RENDER -> components/ManualPricelist
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><FileInput size={18} className="text-blue-600"/> The Bulk Workflow</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Pricing managers can bypass manual entry by importing standard CSV or Excel text exports directly into the system.
                                </p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <ol className="text-xs space-y-3 font-bold text-slate-700">
                                        <li className="flex gap-2"><span className="text-blue-600">01.</span> Prepare columns: SKU, Description, Price, Promo.</li>
                                        <li className="flex gap-2"><span className="text-blue-600">02.</span> Use "Import CSV" to parse rows into JSONB.</li>
                                        <li className="flex gap-2"><span className="text-blue-600">03.</span> Assets are immediately synced to all field tablets.</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Sparkles size={18} className="text-yellow-500"/> Temporal Flagging Logic</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    To highlight recent updates to staff and customers, the system applies an automatic "New" badge based on date metadata.
                                </p>
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800">
                                    <div className="text-[10px] font-black uppercase mb-1">Visibility Rule:</div>
                                    <p className="text-xs font-mono">if (currentTime - item.dateAdded &lt; 30_DAYS) &#123; render(NEW_BADGE) &#125;</p>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                    *This logic applies across all display modes (PDF and Native).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Zap className="text-yellow-500" size={32} /> Screensaver Automation
                            </h2>
                            <p className="text-slate-500 font-medium">Autonomous marketing engine with probabilistic scheduling.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Visual Logic Flow */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Decision Engine</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400">1</div>
                                        <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="font-bold text-sm text-slate-800">Idle Timer</div>
                                            <div className="text-xs text-slate-500">Wait 60s without touch input.</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center"><div className="h-4 w-0.5 bg-slate-300"></div></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full border-2 border-blue-200 flex items-center justify-center font-bold text-blue-500">2</div>
                                        <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="font-bold text-sm text-slate-800">Content Gathering</div>
                                            <div className="text-xs text-slate-500">Collect Ads, Products, Pamphlets.</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center"><div className="h-4 w-0.5 bg-slate-300"></div></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full border-2 border-green-200 flex items-center justify-center font-bold text-green-500">3</div>
                                        <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="font-bold text-sm text-slate-800">Playlist Generation</div>
                                            <div className="text-xs text-slate-500">Apply weights & shuffle.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weighting Explanation */}
                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">Weighting Algorithm</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-purple-900 text-sm">Custom Ads</span>
                                            <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px] font-black">3x Frequency</span>
                                        </div>
                                        <p className="text-xs text-purple-700 leading-relaxed">
                                            Any image/video uploaded to "Screensaver Ads" in Marketing is added <strong>3 times</strong> to the playlist to ensure high visibility.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-blue-900 text-sm">Products</span>
                                            <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-[10px] font-black">Age Filtered</span>
                                        </div>
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            Products older than 6 months have a <strong>75% chance</strong> of being skipped. This keeps the screensaver focused on fresh inventory.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-900 text-sm">Sleep Mode</span>
                                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">Schedule</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Outside of Active Hours (e.g. 8am-8pm), the screen turns <strong>black</strong> to save panel life and electricity. Touch still wakes it.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Activity className="text-green-600" size={32} /> Fleet Telemetry
                            </h2>
                            <p className="text-slate-500 font-medium">Real-time device monitoring and remote command execution.</p>
                        </div>

                        {/* Radar Animation */}
                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden min-h-[300px] flex items-center justify-center">
                            {/* Radar Rings */}
                            <div className="absolute w-64 h-64 border border-green-500/20 rounded-full radar-ring"></div>
                            <div className="absolute w-64 h-64 border border-green-500/20 rounded-full radar-ring" style={{animationDelay: '0.5s'}}></div>
                            
                            {/* Central Hub */}
                            <div className="relative z-10 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                                <Database size={32} className="text-white" />
                            </div>

                            {/* Devices */}
                            <div className="absolute top-10 left-10 flex flex-col items-center">
                                <Tablet size={24} className="text-blue-400 mb-1" />
                                <div className="text-[10px] text-blue-400 font-mono">Kiosk 1</div>
                            </div>
                            <div className="absolute bottom-16 right-20 flex flex-col items-center">
                                <Smartphone size={24} className="text-purple-400 mb-1" />
                                <div className="text-[10px] text-purple-400 font-mono">Mobile 1</div>
                            </div>
                            <div className="absolute top-20 right-10 flex flex-col items-center">
                                <Tv size={24} className="text-indigo-400 mb-1" />
                                <div className="text-[10px] text-indigo-400 font-mono">TV Wall</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg">Heartbeat Protocol</h3>
                                <p className="text-sm text-slate-600">
                                    Every device calls the `sendHeartbeat()` function every 60 seconds.
                                </p>
                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Payload Sent</h4>
                                    <pre className="text-[10px] font-mono text-blue-600 bg-blue-50 p-2 rounded">
{`{
  "id": "LOC-84921",
  "status": "online",
  "last_seen": "2023-10-27T10:00:00Z",
  "wifi_strength": 80,
  "version": "1.0.5"
}`}
                                    </pre>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg">Command & Control</h3>
                                <p className="text-sm text-slate-600">
                                    The server responds with configuration overrides.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex gap-3 text-sm text-slate-700">
                                        <Check size={16} className="text-green-500 mt-0.5" />
                                        <span><strong>Remote Restart:</strong> Setting `restart_requested=true` in DB forces the page to reload on next heartbeat.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm text-slate-700">
                                        <Check size={16} className="text-green-500 mt-0.5" />
                                        <span><strong>Config Sync:</strong> Changing a device name in Admin Hub automatically updates the physical device within 60s.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Tv className="text-indigo-600" size={32} /> TV Mode Logic
                            </h2>
                            <p className="text-slate-500 font-medium">Specialized routing for non-interactive displays.</p>
                        </div>

                        {/* Film Strip Animation */}
                        <div className="bg-black rounded-3xl p-8 relative overflow-hidden h-40 flex items-center">
                            <div className="film-strip flex gap-4 absolute left-0">
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="w-48 h-28 bg-slate-800 border-y-4 border-dashed border-slate-600 shrink-0 flex items-center justify-center">
                                        <PlayCircle size={32} className="text-white opacity-50" />
                                    </div>
                                ))}
                                {/* Repeat for smooth loop */}
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={`dup-${i}`} className="w-48 h-28 bg-slate-800 border-y-4 border-dashed border-slate-600 shrink-0 flex items-center justify-center">
                                        <PlayCircle size={32} className="text-white opacity-50" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <PlayCircle size={18}/> Autoplay Policy
                                </h3>
                                <p className="text-xs text-indigo-800 leading-relaxed">
                                    Modern browsers block video autoplay with sound.
                                    <br/><br/>
                                    <strong>Solution:</strong> TV Mode videos are muted by default. A staff member must tap the screen <em>once</em> after launch to unlock the audio context if sound is required.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg">Routing & UI</h3>
                                <p className="text-sm text-slate-600">
                                    When a device is set to "TV Mode":
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                                    <li><strong>Hidden Navigation:</strong> The standard Kiosk header, footer, and back buttons are removed or minimized.</li>
                                    <li><strong>Landscape Lock:</strong> CSS rules force visual rotation prompts if the device is held in portrait.</li>
                                    <li><strong>Interaction:</strong> Touches bring up overlay controls (Play/Pause/Next) which fade out after 4 seconds of inactivity.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Fix: Implement the missing AdminDashboard component and its named export as required by App.tsx
export const AdminDashboard: React.FC<{
    storeData: StoreData;
    onUpdateData: (data: StoreData) => Promise<void>;
    onRefresh: () => void;
}> = ({ storeData, onUpdateData, onRefresh }) => {
    const [activeSection, setActiveSection] = useState('inventory');
    const [isSaving, setIsSaving] = useState(false);

    const menuItems = [
        { id: 'inventory', label: 'Inventory', icon: <Box size={20} /> },
        { id: 'pricelists', label: 'Pricelists', icon: <RIcon size={20} /> },
        { id: 'marketing', label: 'Marketing', icon: <Megaphone size={20} /> },
        { id: 'tv', label: 'TV Mode', icon: <Tv size={20} /> },
        { id: 'fleet', label: 'Fleet Hub', icon: <Activity size={20} /> },
        { id: 'docs', label: 'Systems Manual', icon: <HelpCircle size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdateData(storeData);
        } finally {
            setTimeout(() => setIsSaving(false), 800);
        }
    };

    const handleLogout = () => {
        window.history.pushState({}, '', '/');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.4s ease-out forwards;
                }
            `}</style>

            {/* Admin Sidebar */}
            <div className="w-72 bg-slate-900 text-white flex flex-col shrink-0 z-30 shadow-2xl relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                
                <div className="p-8 border-b border-slate-800 flex items-center gap-4 relative">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-900/40"><LayoutGrid size={28} /></div>
                    <div>
                        <h1 className="font-black text-xl tracking-tighter uppercase leading-none mb-1">Kiosk Hub</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Management Suite</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar relative">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${
                                activeSection === item.id 
                                ? 'bg-blue-600 text-white shadow-lg translate-x-1' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`${activeSection === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                                    {item.icon}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                            {activeSection === item.id && <ChevronRight size={16} className="animate-pulse" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800 space-y-3 relative bg-slate-900/50 backdrop-blur-md">
                    <button 
                        onClick={onRefresh}
                        className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
                    >
                        <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-xs font-black uppercase tracking-widest">Refresh Cloud</span>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Logout Admin</span>
                    </button>
                </div>
            </div>

            {/* Right Side Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 shadow-sm relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-2xl text-slate-400 border border-slate-200">
                             {menuItems.find(m => m.id === activeSection)?.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {menuItems.find(m => m.id === activeSection)?.label}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Module Access: /admin/{activeSection}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200">
                             <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Sync Tunnel</span>
                        </div>
                        
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <SaveAll size={16} />}
                            {isSaving ? 'Cloud Syncing...' : 'Deploy Changes'}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50 scroll-smooth">
                    {activeSection === 'docs' ? (
                        <SystemDocumentation />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-8">
                            <div className="relative mb-8 group">
                                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="relative bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 max-w-lg">
                                    <div className="text-blue-500 mb-8 flex justify-center scale-150 transform">
                                        {menuItems.find(m => m.id === activeSection)?.icon && React.cloneElement(menuItems.find(m => m.id === activeSection)!.icon as React.ReactElement, { size: 48 })}
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                                        {menuItems.find(m => m.id === activeSection)?.label} Interface
                                    </h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-10 leading-relaxed">
                                        This technical infrastructure node is currently undergoing maintenance and schema optimization.
                                    </p>
                                    
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between gap-8">
                                            <div className="text-left">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Module Integrity</div>
                                                <div className="text-xs font-bold text-slate-800">Locked - Root Privileges Req.</div>
                                            </div>
                                            <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[9px] font-black uppercase border border-yellow-200">Pending</div>
                                        </div>
                                        <button 
                                            onClick={() => setActiveSection('docs')}
                                            className="mt-6 text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:text-blue-800 transition-colors group"
                                        >
                                            <BookOpen size={14} className="group-hover:scale-110 transition-transform" /> Browse Documentation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
