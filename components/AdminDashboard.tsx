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
import * as XLSX from 'xlsx';

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

// Helper Icon for CPU
const CpuIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
);

// --- ZIP IMPORT/EXPORT UTILS ---

// Helper: Determine extension from MIME type or URL
const getExtension = (blob: Blob, url: string): string => {
    if (blob.type === 'image/jpeg') return 'jpg';
    if (blob.type === 'image/png') return 'png';
    if (blob.type === 'image/webp') return 'webp';
    if (blob.type === 'application/pdf') return 'pdf';
    if (blob.type === 'video/mp4') return 'mp4';
    if (blob.type === 'video/webm') return 'webm';
    
    // Fallback to URL extension
    const match = url.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
    return match ? match[1] : 'dat';
};

const fetchAssetAndAddToZip = async (zipFolder: JSZip | null, url: string, filenameBase: string) => {
    if (!zipFolder || !url) return;
    try {
        let blob: Blob;
        
        // Handle Base64 Data URLs
        if (url.startsWith('data:')) {
            const res = await fetch(url);
            blob = await res.blob();
        } else {
            // Handle Remote URLs
            const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            blob = await response.blob();
        }

        const ext = getExtension(blob, url);
        // Replace potential invalid chars
        const safeFilename = filenameBase.replace(/[^a-z0-9_\-]/gi, '_');
        zipFolder.file(`${safeFilename}.${ext}`, blob);
    } catch (e) {
        console.warn(`Failed to pack asset: ${url}`, e);
        zipFolder.file(`${filenameBase}_FAILED.txt`, `Could not download: ${url}`);
    }
};

const downloadZip = async (storeData: StoreData) => {
    const zip = new JSZip();
    console.log("Starting Full System Backup...");

    // --- 1. SYSTEM DATA ---
    // Root Config
    zip.file("store_config_full.json", JSON.stringify(storeData, null, 2));
    
    // Fleet CSV
    if (storeData.fleet && storeData.fleet.length > 0) {
        const csvHeader = "ID,Name,Type,Status,LastSeen,IP,Zone,Version\n";
        const csvRows = storeData.fleet.map(k => 
            `"${k.id}","${k.name}","${k.deviceType}","${k.status}","${k.last_seen}","${k.ipAddress}","${k.assignedZone || ''}","${k.version}"`
        ).join("\n");
        zip.file("_System_Backup/Fleet/fleet_registry.csv", csvHeader + csvRows);
    }

    // Settings & History
    if (storeData.archive) {
        zip.file("_System_Backup/History/archive_data.json", JSON.stringify(storeData.archive, null, 2));
    }
    if (storeData.systemSettings) {
        zip.file("_System_Backup/Settings/system_settings.json", JSON.stringify(storeData.systemSettings, null, 2));
    }
    // Backup Admins but redact PINs for safety in the easy-read JSON
    const safeAdmins = storeData.admins.map(a => ({ ...a, pin: "****" }));
    zip.file("_System_Backup/Settings/admin_users.json", JSON.stringify(safeAdmins, null, 2));


    // --- 2. INVENTORY (Root Folders for backward compat with Importer) ---
    for (const brand of storeData.brands) {
        const brandFolder = zip.folder(brand.name.replace(/[^a-z0-9 ]/gi, '').trim() || 'Untitled Brand');
        
        if (brandFolder) {
            brandFolder.file("brand.json", JSON.stringify(brand, null, 2));
            if (brand.logoUrl) await fetchAssetAndAddToZip(brandFolder, brand.logoUrl, "brand_logo");
        }
        
        for (const category of brand.categories) {
            const catFolder = brandFolder?.folder(category.name.replace(/[^a-z0-9 ]/gi, '').trim() || 'Untitled Category');
            
            for (const product of category.products) {
                const prodFolder = catFolder?.folder(product.name.replace(/[^a-z0-9 ]/gi, '').trim() || 'Untitled Product');
                
                if (prodFolder) {
                    const metadata = {
                        ...product, // Backup full product object
                        originalImageUrl: product.imageUrl, 
                    };
                    prodFolder.file("details.json", JSON.stringify(metadata, null, 2));

                    if (product.imageUrl) await fetchAssetAndAddToZip(prodFolder, product.imageUrl, "cover");

                    if (product.galleryUrls) {
                        for (let i = 0; i < product.galleryUrls.length; i++) {
                            await fetchAssetAndAddToZip(prodFolder, product.galleryUrls[i], `gallery_${i}`);
                        }
                    }

                    const videos = [...(product.videoUrls || [])];
                    if (product.videoUrl && !videos.includes(product.videoUrl)) videos.push(product.videoUrl);
                    for (let i = 0; i < videos.length; i++) {
                        await fetchAssetAndAddToZip(prodFolder, videos[i], `video_${i}`);
                    }

                    if (product.manuals) {
                         for (let i = 0; i < product.manuals.length; i++) {
                             const m = product.manuals[i];
                             if (m.pdfUrl) {
                                 await fetchAssetAndAddToZip(prodFolder, m.pdfUrl, m.title || `manual_${i}`);
                             }
                             if (m.thumbnailUrl) {
                                 await fetchAssetAndAddToZip(prodFolder, m.thumbnailUrl, `manual_thumb_${i}`);
                             }
                         }
                    }
                }
            }
        }
    }

    // --- 3. MARKETING ---
    const mktFolder = zip.folder("_System_Backup/Marketing");
    if (mktFolder) {
        // Hero
        if (storeData.hero.backgroundImageUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.backgroundImageUrl, "hero_background");
        if (storeData.hero.logoUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.logoUrl, "hero_logo");
        
        // Ads
        const adsFolder = mktFolder.folder("Ads");
        if (adsFolder && storeData.ads) {
            for (const zone of ['homeBottomLeft', 'homeBottomRight', 'homeSideVertical', 'homeSideLeftVertical', 'screensaver']) {
                const zoneFolder = adsFolder.folder(zone);
                const ads = (storeData.ads as any)[zone] || [];
                for(let i=0; i<ads.length; i++) {
                    await fetchAssetAndAddToZip(zoneFolder, ads[i].url, `ad_${i}`);
                }
            }
        }

        // Pamphlets
        const pamFolder = mktFolder.folder("Pamphlets");
        if (pamFolder && storeData.catalogues) {
            const globalCats = storeData.catalogues.filter(c => !c.brandId);
            for(let i=0; i<globalCats.length; i++) {
                const c = globalCats[i];
                if (c.pdfUrl) await fetchAssetAndAddToZip(pamFolder, c.pdfUrl, c.title);
                if (c.thumbnailUrl) await fetchAssetAndAddToZip(pamFolder, c.thumbnailUrl, `${c.title}_thumb`);
            }
        }
    }

    // --- 4. PRICELISTS ---
    const plFolder = zip.folder("_System_Backup/Pricelists");
    if (plFolder && storeData.pricelists) {
        for(const pl of storeData.pricelists) {
            const brand = storeData.pricelistBrands?.find(b => b.id === pl.brandId);
            const brandName = brand ? brand.name.replace(/[^a-z0-9 ]/gi, '') : 'Unknown_Brand';
            const brandFolder = plFolder.folder(brandName);
            if (brandFolder) {
                if (pl.url) await fetchAssetAndAddToZip(brandFolder, pl.url, `${pl.title}_${pl.year}`);
                if (pl.thumbnailUrl) await fetchAssetAndAddToZip(brandFolder, pl.thumbnailUrl, `${pl.title}_thumb`);
            }
        }
    }

    // --- 5. TV ---
    const tvFolder = zip.folder("_System_Backup/TV");
    if (tvFolder && storeData.tv?.brands) {
        for (const tvb of storeData.tv.brands) {
            const brandFolder = tvFolder.folder(tvb.name.replace(/[^a-z0-9 ]/gi, ''));
            if (brandFolder) {
                if (tvb.logoUrl) await fetchAssetAndAddToZip(brandFolder, tvb.logoUrl, "logo");
                
                for(const model of (tvb.models || [])) {
                    const modelFolder = brandFolder.folder(model.name.replace(/[^a-z0-9 ]/gi, ''));
                    if (modelFolder) {
                        if (model.imageUrl) await fetchAssetAndAddToZip(modelFolder, model.imageUrl, "cover");
                        // Videos might be heavy, but requested "Backup Everything"
                        if (model.videoUrls) {
                            for(let i=0; i<model.videoUrls.length; i++) {
                                await fetchAssetAndAddToZip(modelFolder, model.videoUrls[i], `video_${i}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // Generate
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiosk-full-system-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


// Updated Auth Component with Name/PIN and Admin validation
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !pin.trim()) {
        setError('Please enter both Name and PIN.');
        return;
    }

    const admin = admins.find(a => 
        a.name.toLowerCase().trim() === name.toLowerCase().trim() && 
        a.pin === pin.trim()
    );

    if (admin) {
        onLogin(admin);
    } else {
        setError('Invalid credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4 animate-fade-in">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden border border-slate-300">
        <h1 className="text-4xl font-black mb-2 text-center text-slate-900 mt-4 tracking-tight">Admin Hub</h1>
        <p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase tracking-wide">Enter Name & PIN</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label>
              <input 
                 className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" 
                 type="text" 
                 placeholder="Name" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)} 
                 autoFocus 
              />
          </div>
          <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label>
              <input 
                 className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 outline-none focus:border-blue-500" 
                 type="password" 
                 placeholder="####" 
                 value={pin} 
                 onChange={(e) => setPin(e.target.value)} 
              />
          </div>
          
          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}

          <button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase hover:bg-slate-800 transition-colors shadow-lg">Login</button>
        </form>
      </div>
    </div>
  );
};

// Updated FileUpload to always return Base64 for local processing if needed
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
           // Always get local base64 first (useful for PDF conversion locally)
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
              // Pass back both URL list and Base64 list (last arg)
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

const ManualPricelistEditor = ({ pricelist, onSave, onClose }: { pricelist: Pricelist, onSave: (pl: Pricelist) => void, onClose: () => void }) => {
  const [items, setItems] = useState<PricelistItem[]>(pricelist.items || []);
  const [isImporting, setIsImporting] = useState(false);
  
  const addItem = () => {
    setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '' }]);
  };

  const updateItem = (id: string, field: keyof PricelistItem, val: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  /**
   * Universal format and rounding logic:
   * 1. Handles decimals correctly (R20 000.00 -> R 20 000)
   * 2. Rounds up to nearest 10 (R299 -> R 300, R20 999 -> R 21 000)
   */
  const smartFormatPrice = (value: string): string => {
    if (!value) return '';
    
    // First, remove "R", spaces, and any standard thousands separators like commas
    // but KEEP the decimal point for float parsing
    let clean = value.replace(/[R\s,]/g, '');
    
    // Try to parse the numeric value
    let num = parseFloat(clean);
    
    if (isNaN(num)) {
        // Fallback for cases with mixed text: just strip everything but digits and dots
        const numericOnly = value.replace(/[^0-9.]/g, '');
        num = parseFloat(numericOnly);
    }

    if (isNaN(num)) return value;

    // Phase 1: Round up to the nearest whole integer to strip cents/decimals
    num = Math.ceil(num);
    
    // Phase 2: Apply the "round up to nearest 10" rule
    // This handles the user examples: 299 -> 300, 20999 -> 21000
    if (num % 10 !== 0) {
        num = Math.ceil(num / 10) * 10;
    }
    
    // Format back with R and grouping using space as thousands separator
    return `R ${num.toLocaleString().replace(/,/g, ' ')}`;
  };

  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value) return;
    const formatted = smartFormatPrice(value);
    updateItem(id, field, formatted);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to 2D array for easy mapping
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
            alert("The selected file appears to be empty.");
            return;
        }

        // Filter out completely empty rows
        const validRows = jsonData.filter(row => 
            row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );

        if (validRows.length === 0) {
            alert("No data rows found in the file.");
            return;
        }

        // Detect if first row is a header
        const firstRow = validRows[0].map(c => String(c).toLowerCase());
        const hasHeader = firstRow.some(c => 
            c.includes('sku') || c.includes('code') || c.includes('desc') || 
            c.includes('price') || c.includes('name') || c.includes('product')
        );

        const dataRows = hasHeader ? validRows.slice(1) : validRows;
        
        const newImportedItems: PricelistItem[] = dataRows.map(row => {
            const rawNormal = String(row[2] || '').trim();
            const rawPromo = String(row[3] || '').trim();
            
            return {
                id: generateId('imp'),
                sku: String(row[0] || '').trim().toUpperCase(),
                description: String(row[1] || '').trim(),
                normalPrice: smartFormatPrice(rawNormal),
                promoPrice: rawPromo ? smartFormatPrice(rawPromo) : ''
            };
        });

        if (newImportedItems.length > 0) {
            const userChoice = confirm(`Parsed ${newImportedItems.length} items.\n\nOK -> UPDATE existing SKUs and ADD new ones (Merge).\nCANCEL -> REPLACE entire current list.`);
            
            if (userChoice) {
                // MERGE Logic
                const merged = [...items];
                const onlyNew: PricelistItem[] = [];

                newImportedItems.forEach(newItem => {
                    const existingIdx = merged.findIndex(curr => curr.sku && newItem.sku && curr.sku.trim().toUpperCase() === newItem.sku.trim().toUpperCase());
                    if (existingIdx > -1) {
                        // Update existing entry with new prices (and description if provided)
                        merged[existingIdx] = {
                            ...merged[existingIdx],
                            description: newItem.description || merged[existingIdx].description,
                            normalPrice: newItem.normalPrice || merged[existingIdx].normalPrice,
                            promoPrice: newItem.promoPrice || merged[existingIdx].promoPrice
                        };
                    } else {
                        onlyNew.push(newItem);
                    }
                });
                setItems([...merged, ...onlyNew]);
                alert(`Merge Complete: Updated existing SKUs and added ${onlyNew.length} new items.`);
            } else {
                // REPLACE Logic
                setItems(newImportedItems);
                alert("Pricelist replaced with imported data.");
            }
        } else {
            alert("Could not extract any valid items. Ensure the sheet follows the format: SKU, Description, Normal Price, Promo Price.");
        }
    } catch (err) {
        console.error("Spreadsheet Import Error:", err);
        alert("Error parsing file. Ensure it is a valid .xlsx or .csv file.");
    } finally {
        setIsImporting(false);
        e.target.value = ''; // Reset input for re-upload if needed
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2">
                <Table className="text-blue-600" size={24} /> Pricelist Builder
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase">{pricelist.title} ({pricelist.month} {pricelist.year})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />}
              Import Excel/CSV
              <input type="file" className="hidden" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} />
            </label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10">
              <Plus size={16} /> Add Row
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
              <Info size={18} className="text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-800 font-bold uppercase leading-tight">
                  Price Logic: .00 decimals are automatically removed and prices round up to the nearest 10 (e.g. 299 → 300, 20999 → 21000).
              </p>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">DESCRIPTION</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">NORMAL</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">PROMO</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU-123" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Product details..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 text-sm font-bold uppercase italic">No items yet. Click "Add Row" or "Import" to start.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <Save size={16} /> Save Pricelist Table
          </button>
        </div>
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
    // Sort Brands Alphabetically for Display
    const sortedBrands = useMemo(() => {
        return [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name));
    }, [pricelistBrands]);

    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    
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
        // Date Descending (Closest date first)
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    const addBrand = () => {
        const name = prompt("Enter Brand Name for Pricelists:");
        if (!name) return;
        const newBrand: PricelistBrand = {
            id: generateId('plb'),
            name: name,
            logoUrl: ''
        };
        onSaveBrands([...pricelistBrands, newBrand]);
        setSelectedBrand(newBrand);
    };

    const updateBrand = (id: string, updates: Partial<PricelistBrand>) => {
        const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b);
        onSaveBrands(updatedBrands);
        if (selectedBrand?.id === id) {
            setSelectedBrand({ ...selectedBrand, ...updates });
        }
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
            url: '',
            type: 'pdf', // Default to PDF
            month: 'January',
            year: new Date().getFullYear().toString(),
            dateAdded: new Date().toISOString() // Set dateAdded to now for "New" flag
        };
        onSavePricelists([...pricelists, newItem]);
    };

    const updatePricelist = (id: string, updates: Partial<Pricelist>) => {
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleDeletePricelist = (id: string) => {
        if(confirm("Delete this pricelist? It will be moved to Archive.")) {
            onDeletePricelist(id);
        }
    };

    const isNewlyUpdated = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.abs(now.getTime() - date.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 30;
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             {/* Left Sidebar: Brands List */}
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <div>
                        <h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Independent List</p>
                     </div>
                     <button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1">
                        <Plus size={12} /> Add
                     </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div 
                            key={brand.id} 
                            onClick={() => setSelectedBrand(brand)}
                            className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                         >
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                     {brand.logoUrl ? (
                                         <img src={brand.logoUrl} className="w-full h-full object-contain" />
                                     ) : (
                                         <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>
                                     )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div>
                                     <div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div>
                                 </div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input 
                                         value={brand.name} 
                                         onChange={(e) => updateBrand(brand.id, { name: e.target.value })}
                                         className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent"
                                         placeholder="Brand Name"
                                     />
                                     <FileUpload 
                                         label="Brand Logo" 
                                         currentUrl={brand.logoUrl} 
                                         onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url })} 
                                     />
                                     <button 
                                         onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }}
                                         className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded"
                                     >
                                         Delete Brand
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))}
                     {sortedBrands.length === 0 && (
                         <div className="p-8 text-center text-slate-400 text-xs italic">
                             No brands. Click "Add" to start.
                         </div>
                     )}
                 </div>
             </div>
             
             {/* Right Content: Pricelist Grid */}
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate mr-2 max-w-[60%]">
                         {selectedBrand ? selectedBrand.name : 'Select Brand'}
                     </h3>
                     <button 
                        onClick={addPricelist} 
                        disabled={!selectedBrand}
                        className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        <Plus size={12} /> Add <span className="hidden md:inline">Pricelist</span>
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 content-start pb-10">
                     {sortedLists.map((item) => {
                         const recent = isNewlyUpdated(item.dateAdded);
                         return (
                         <div key={item.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col p-3 md:p-4 gap-2 md:gap-3 h-fit relative group transition-all ${recent ? 'bg-yellow-50 border-yellow-300 ring-1 ring-yellow-200' : 'bg-white border-slate-200'}`}>
                             {recent && (
                                 <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse z-10">
                                     <Sparkles size={10} /> Recently Edited
                                 </div>
                             )}
                             <div>
                                 <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                                 <input 
                                     value={item.title} 
                                     onChange={(e) => updatePricelist(item.id, { title: e.target.value, dateAdded: new Date().toISOString() })}
                                     className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs md:text-sm bg-transparent" 
                                     placeholder="e.g. Retail Price List"
                                 />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-2">
                                 <div>
                                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label>
                                     <select 
                                         value={item.month} 
                                         onChange={(e) => updatePricelist(item.id, { month: e.target.value, dateAdded: new Date().toISOString() })}
                                         className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200"
                                     >
                                         {months.map(m => <option key={m} value={m}>{m}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label>
                                     <input 
                                         type="number"
                                         value={item.year} 
                                         onChange={(e) => updatePricelist(item.id, { year: e.target.value, dateAdded: new Date().toISOString() })}
                                         className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200"
                                     />
                                 </div>
                             </div>

                             <div className="bg-white/40 p-2 rounded-lg border border-slate-100">
                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Pricelist Mode</label>
                                <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-md border border-slate-200">
                                    <button onClick={() => updatePricelist(item.id, { type: 'pdf', dateAdded: new Date().toISOString() })} className={`py-1 text-[9px] font-black uppercase rounded flex items-center justify-center gap-1 transition-all ${item.type !== 'manual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><FileText size={10}/> PDF</button>
                                    <button onClick={() => updatePricelist(item.id, { type: 'manual', dateAdded: new Date().toISOString() })} className={`py-1 text-[9px] font-black uppercase rounded flex items-center justify-center gap-1 transition-all ${item.type === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={10}/> Manual</button>
                                </div>
                             </div>

                             {item.type === 'manual' ? (
                                <div className="mt-1 space-y-2">
                                    <button 
                                        onClick={() => setEditingManualList(item)}
                                        className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
                                    >
                                        <Edit2 size={12}/> {item.items?.length || 0} Items - Open Builder
                                    </button>
                                    <FileUpload 
                                        label="Thumbnail Image" 
                                        accept="image/*"
                                        currentUrl={item.thumbnailUrl}
                                        onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() })} 
                                    />
                                </div>
                             ) : (
                                <div className="mt-1 md:mt-2 grid grid-cols-2 gap-2">
                                    <FileUpload 
                                        label="Thumbnail" 
                                        accept="image/*"
                                        currentUrl={item.thumbnailUrl}
                                        onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() })} 
                                    />
                                    <FileUpload 
                                        label="Upload PDF" 
                                        accept="application/pdf" 
                                        icon={<FileText />}
                                        currentUrl={item.url}
                                        onUpload={(url: any) => updatePricelist(item.id, { url: url, dateAdded: new Date().toISOString() })} 
                                    />
                                </div>
                             )}

                             <button 
                                onClick={() => handleDeletePricelist(item.id)}
                                className="mt-auto pt-2 md:pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                             >
                                 <Trash2 size={12} /> Delete
                             </button>
                         </div>
                     )})}
                     {sortedLists.length === 0 && selectedBrand && (
                         <div className="col-span-full py-8 md:py-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
                             No pricelists found for this brand.
                         </div>
                     )}
                 </div>
             </div>

             {editingManualList && (
               <ManualPricelistEditor 
                  pricelist={editingManualList} 
                  onSave={(pl) => updatePricelist(pl.id, { ...pl })} 
                  onClose={() => setEditingManualList(null)} 
               />
             )}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ 
        ...product, 
        dimensions: Array.isArray(product.dimensions) 
            ? product.dimensions 
            : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []),
        videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []),
        manuals: product.manuals || (product.manualUrl || (product.manualImages && product.manualImages.length > 0) ? [{
            id: generateId('man'),
            title: "User Manual",
            images: product.manualImages || [],
            pdfUrl: product.manualUrl
        }] : []),
        dateAdded: product.dateAdded || new Date().toISOString()
    });
    const [newFeature, setNewFeature] = useState('');
    const [newBoxItem, setNewBoxItem] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };

    const addDimensionSet = () => {
        setDraft({ 
            ...draft, 
            dimensions: [...draft.dimensions, { label: "New Set", width: "", height: "", depth: "", weight: "" }] 
        });
    };
    const updateDimension = (index: number, field: keyof DimensionSet, value: string) => {
        const newDims = [...draft.dimensions];
        newDims[index] = { ...newDims[index], [field]: value };
        setDraft({ ...draft, dimensions: newDims });
    };
    const removeDimension = (index: number) => {
        const newDims = draft.dimensions.filter((_, i) => i !== index);
        setDraft({ ...draft, dimensions: newDims });
    };

    const addManual = () => {
        const newManual: Manual = {
            id: generateId('man'),
            title: "New Manual",
            images: [],
            pdfUrl: '',
            thumbnailUrl: ''
        };
        setDraft({ ...draft, manuals: [...(draft.manuals || []), newManual] });
    };

    const removeManual = (id: string) => {
        setDraft({ ...draft, manuals: (draft.manuals || []).filter(m => m.id !== id) });
    };

    const updateManual = (id: string, updates: Partial<Manual>) => {
        setDraft({ 
            ...draft, 
            manuals: (draft.manuals || []).map(m => m.id === id ? { ...m, ...updates } : m) 
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        <InputField label="Warranty & Terms" isArea val={draft.terms || ''} onChange={(e: any) => setDraft({ ...draft, terms: e.target.value })} placeholder="Enter warranty info or legal terms..." />
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dimensions Sets</label>
                                 <button onClick={addDimensionSet} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase flex items-center gap-1"><Plus size={10}/> Add Set</button>
                             </div>
                             {draft.dimensions.map((dim, idx) => (
                                 <div key={idx} className="mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative">
                                     <button onClick={() => removeDimension(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                                     <input value={dim.label || ''} onChange={(e) => updateDimension(idx, 'label', e.target.value)} placeholder="Label (e.g. Box 1)" className="w-full text-xs font-black uppercase mb-2 border-b border-transparent focus:border-blue-500 outline-none" />
                                     <div className="grid grid-cols-2 gap-2">
                                         <InputField label="Height" val={dim.height} onChange={(e:any) => updateDimension(idx, 'height', e.target.value)} half placeholder="10cm" />
                                         <InputField label="Width" val={dim.width} onChange={(e:any) => updateDimension(idx, 'width', e.target.value)} half placeholder="10cm" />
                                         <InputField label="Depth" val={dim.height} onChange={(e:any) => updateDimension(idx, 'depth', e.target.value)} half placeholder="10cm" />
                                         <InputField label="Weight" val={dim.weight} onChange={(e:any) => updateDimension(idx, 'weight', e.target.value)} half placeholder="1kg" />
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Image Gallery (Multiple)</label>
                            <FileUpload 
                                label="Add Images" 
                                allowMultiple={true} 
                                currentUrl="" 
                                onUpload={(urls: any) => {
                                    const newUrls = Array.isArray(urls) ? urls : [urls];
                                    setDraft(prev => ({ ...prev, galleryUrls: [...(prev.galleryUrls || []), ...newUrls] }));
                                }} 
                            />
                            {draft.galleryUrls && draft.galleryUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {draft.galleryUrls.map((url, idx) => (
                                        <div key={idx} className="relative group aspect-square bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                            <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                            <button 
                                                onClick={() => setDraft(prev => ({...prev, galleryUrls: prev.galleryUrls?.filter((_, i) => i !== idx)}))}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Product Videos</label>
                            <FileUpload 
                                label="Add Videos" 
                                allowMultiple={true} 
                                accept="video/*"
                                icon={<Video />}
                                currentUrl="" 
                                onUpload={(urls: any) => {
                                    const newUrls = Array.isArray(urls) ? urls : [urls];
                                    setDraft(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || []), ...newUrls] }));
                                }} 
                            />
                            {draft.videoUrls && draft.videoUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {draft.videoUrls.map((url, idx) => (
                                        <div key={idx} className="relative group aspect-square bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                                            <video src={url} className="w-full h-full object-cover opacity-60" muted />
                                            <Video size={20} className="absolute text-white" />
                                            <button 
                                                onClick={() => setDraft(prev => ({...prev, videoUrls: prev.videoUrls?.filter((_, i) => i !== idx)}))}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Key Features</label>
                             <div className="flex gap-2 mb-2">
                                 <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add feature..." onKeyDown={(e) => e.key === 'Enter' && addFeature()} />
                                 <button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button>
                             </div>
                             <ul className="space-y-1">{draft.features.map((f, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold text-slate-700">{f}<button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                             <label className="block text-[10px] font-black text-orange-600 uppercase tracking-wider mb-2">What's in the Box</label>
                             <div className="flex gap-2 mb-2">
                                 <input type="text" value={newBoxItem} onChange={(e) => setNewBoxItem(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add item..." onKeyDown={(e) => e.key === 'Enter' && addBoxItem()} />
                                 <button onClick={addBoxItem} className="p-2 bg-orange-500 text-white rounded-lg"><Plus size={16} /></button>
                             </div>
                             <ul className="space-y-1">{(draft.boxContents || []).map((item, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold text-slate-700">{item}<button onClick={() => setDraft({...draft, boxContents: (draft.boxContents || []).filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 border-t border-slate-100 pt-8">
                     <h4 className="font-bold text-slate-900 uppercase text-sm mb-4">Manuals & Docs</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider">Product Manuals</h5>
                                <button onClick={addManual} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase flex items-center gap-1"><Plus size={10}/> Add Manual</button>
                             </div>
                             
                             <div className="space-y-4">
                                {(draft.manuals || []).map((manual, idx) => (
                                    <div key={manual.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group">
                                        <button onClick={() => removeManual(manual.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                        
                                        <input 
                                            value={manual.title} 
                                            onChange={(e) => updateManual(manual.id, { title: e.target.value })} 
                                            placeholder="Manual Title (e.g. User Guide)" 
                                            className="w-full font-bold text-slate-900 border-b border-slate-100 pb-1 focus:border-blue-500 outline-none pr-8 text-sm" 
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FileUpload 
                                                label="Thumbnail (Image)" 
                                                accept="image/*"
                                                currentUrl={manual.thumbnailUrl} 
                                                onUpload={(url: any) => updateManual(manual.id, { thumbnailUrl: url })} 
                                            />
                                            <FileUpload 
                                                label="Document (PDF)" 
                                                accept="application/pdf"
                                                icon={<FileText />}
                                                currentUrl={manual.pdfUrl} 
                                                onUpload={(url: any) => updateManual(manual.id, { pdfUrl: url })} 
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(draft.manuals || []).length === 0 && (
                                    <div className="text-center text-slate-400 text-xs italic py-4 border-2 border-dashed border-slate-200 rounded-xl">
                                        No manuals added. Click "Add Manual" above.
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                             <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Technical Specs</h5>
                             <div className="flex flex-wrap gap-2 mb-4 items-end">
                                <input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Spec Name" className="flex-1 min-w-[80px] p-2 border border-slate-300 rounded-lg text-sm font-bold" />
                                <input value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Value" className="flex-1 min-w-[80px] p-2 border border-slate-300 rounded-lg text-sm font-bold" onKeyDown={(e) => e.key === 'Enter' && addSpec()} />
                                <button onClick={addSpec} className="bg-blue-600 text-white p-2.5 rounded-lg shrink-0"><Plus size={18} /></button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {Object.entries(draft.specs).map(([key, value]) => (<div key={key} className="flex justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><div><span className="block text-[10px] font-bold text-slate-400 uppercase">{key}</span><span className="block text-sm font-black">{value}</span></div><button onClick={() => { const s = {...draft.specs}; delete s[key]; setDraft({...draft, specs: s}); }} className="text-red-400"><Trash2 size={16}/></button></div>))}
                             </div>
                        </div>
                     </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0">
                <button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button>
                <button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Confirm Changes</button>
            </div>
        </div>
    );
};

const KioskEditorModal = ({ kiosk, onSave, onClose }: { kiosk: KioskRegistry, onSave: (k: KioskRegistry) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-900 uppercase">Edit Device</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <InputField label="Device Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} />
                    <InputField label="Assigned Zone" val={draft.assignedZone || ''} onChange={(e:any) => setDraft({...draft, assignedZone: e.target.value})} />
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Device Type</label>
                        <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => setDraft({...draft, deviceType: 'kiosk'})} className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 ${draft.deviceType === 'kiosk' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                 <Tablet size={16}/> Kiosk
                             </button>
                             <button onClick={() => setDraft({...draft, deviceType: 'mobile'})} className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 ${draft.deviceType === 'mobile' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                 <Smartphone size={16}/> Mobile
                             </button>
                             <button onClick={() => setDraft({...draft, deviceType: 'tv'})} className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 ${draft.deviceType === 'tv' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                 <Tv size={16}/> TV
                             </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
                    <button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- MOVE PRODUCT MODAL COMPONENT ---
const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: { product: Product, allBrands: Brand[], currentBrandId: string, currentCategoryId: string, onClose: () => void, onMove: (p: Product, b: string, c: string) => void }) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);

    const targetBrand = allBrands.find(b => b.id === targetBrandId);
    const targetCategories = targetBrand?.categories || [];

    // Reset target category if brand changes and current cat not in new brand
    useEffect(() => {
        if (targetBrand && !targetBrand.categories.find(c => c.id === targetCategoryId)) {
            if (targetBrand.categories.length > 0) {
                setTargetCategoryId(targetBrand.categories[0].id);
            }
        }
    }, [targetBrandId]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-900 uppercase">Move Product</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-[10px] font-black text-blue-400 uppercase mb-1">Moving Product</div>
                        <div className="font-bold text-slate-900">{product.name}</div>
                        {product.sku && <div className="text-[10px] font-mono text-slate-400 uppercase">{product.sku}</div>}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Destination Brand</label>
                            <select 
                                value={targetBrandId} 
                                onChange={(e) => setTargetBrandId(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm"
                            >
                                {allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Destination Category</label>
                            <select 
                                value={targetCategoryId} 
                                onChange={(e) => setTargetCategoryId(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm"
                            >
                                {targetCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
                         <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                         <p className="text-[10px] text-orange-700 leading-relaxed font-bold uppercase">
                             Moving this product will transfer all specifications and media to the selected category.
                         </p>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs hover:text-slate-700">Cancel</button>
                    <button 
                        onClick={() => onMove(product, targetBrandId, targetCategoryId)}
                        disabled={targetBrandId === currentBrandId && targetCategoryId === currentCategoryId}
                        className="px-6 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                        <Move size={14} /> Confirm Move
                    </button>
                </div>
            </div>
        </div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: { model: TVModel, onSave: (m: TVModel) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-black text-slate-900 uppercase">Edit TV Model: {draft.name}</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Model Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. OLED G3" />
                        <FileUpload 
                            label="Cover Image (Optional)" 
                            currentUrl={draft.imageUrl} 
                            onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} 
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-900 uppercase text-xs">Videos for this Model</h4>
                            <span className="text-[10px] font-bold bg-white text-slate-500 px-2 py-1 rounded border border-slate-200 uppercase">{draft.videoUrls.length} Videos</span>
                        </div>
                        
                        <FileUpload 
                            label="Upload Videos" 
                            accept="video/*" 
                            allowMultiple={true}
                            icon={<Video />}
                            currentUrl="" 
                            onUpload={(urls: any) => {
                                const newUrls = Array.isArray(urls) ? urls : [urls];
                                setDraft(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ...newUrls] }));
                            }} 
                        />
                        
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {draft.videoUrls.map((url, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 group">
                                    <div className="w-16 h-10 bg-slate-900 rounded flex items-center justify-center shrink-0">
                                        <Video size={16} className="text-white opacity-50" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Video {idx + 1}</div>
                                        <div className="text-xs font-mono truncate text-slate-700">{url.split('/').pop()}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {idx > 0 && <button onClick={() => {
                                            const newUrls = [...draft.videoUrls];
                                            [newUrls[idx], newUrls[idx-1]] = [newUrls[idx-1], newUrls[idx]];
                                            setDraft({ ...draft, videoUrls: newUrls });
                                        }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><ChevronDown size={14} className="rotate-180"/></button>}
                                        
                                        {idx < draft.videoUrls.length - 1 && <button onClick={() => {
                                            const newUrls = [...draft.videoUrls];
                                            [newUrls[idx], newUrls[idx+1]] = [newUrls[idx+1], newUrls[idx]];
                                            setDraft({ ...draft, videoUrls: newUrls });
                                        }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><ChevronDown size={14} /></button>}
                                        
                                        <button onClick={() => {
                                            setDraft({ ...draft, videoUrls: draft.videoUrls.filter((_, i) => i !== idx) });
                                        }} className="p-1.5 bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 rounded ml-2"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {draft.videoUrls.length === 0 && (
                                <div className="text-center py-6 text-slate-400 text-xs italic">No videos uploaded for this model yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
                    <button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Model</button>
                </div>
            </div>
        </div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({
        inventory: true,
        marketing: true,
        tv: false,
        screensaver: false,
        fleet: false,
        history: false,
        settings: false,
        pricelists: true
    });

    const PERMISSION_GROUPS = [
        {
            title: "Inventory & Products",
            icon: <Box size={14} />,
            color: "blue",
            items: [
                { key: 'inventory', label: 'Inventory Management', desc: 'Create brands, categories, products and upload media.' }
            ]
        },
        {
            title: "Marketing & Content",
            icon: <Megaphone size={14} />,
            color: "purple",
            items: [
                { key: 'marketing', label: 'Marketing Hub', desc: 'Edit Hero banner, Ad zones, and Pamphlets.' },
                { key: 'pricelists', label: 'Pricelists', desc: 'Manage PDF pricelists and brand documents.' },
                { key: 'screensaver', label: 'Screensaver Control', desc: 'Configure screensaver timing and display rules.' }
            ]
        },
        {
            title: "System & Devices",
            icon: <Settings size={14} />,
            color: "slate",
            items: [
                { key: 'fleet', label: 'Fleet Management', desc: 'Monitor active devices and remote restart.' },
                { key: 'tv', label: 'TV Mode Config', desc: 'Manage TV video loops and brand channels.' },
                { key: 'settings', label: 'Global Settings', desc: 'System backups, app icons, and admin users.' },
                { key: 'history', label: 'Archive History', desc: 'View logs and restore deleted items.' }
            ]
        }
    ];

    const resetForm = () => {
        setEditingId(null);
        setNewName('');
        setNewPin('');
        setNewPermissions({
            inventory: true,
            marketing: true,
            tv: false,
            screensaver: false,
            fleet: false,
            history: false,
            settings: false,
            pricelists: true
        });
    };

    const handleAddOrUpdate = () => {
        if (!newName || !newPin) return alert("Name and PIN required");
        
        let updatedList = [...admins];

        if (editingId) {
            updatedList = updatedList.map(a => a.id === editingId ? { ...a, name: newName, pin: newPin, permissions: newPermissions } : a);
        } else {
            updatedList.push({
                id: generateId('adm'),
                name: newName,
                pin: newPin,
                isSuperAdmin: false,
                permissions: newPermissions
            });
        }
        
        onUpdate(updatedList);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm("Remove this admin?")) {
             onUpdate(admins.filter(a => a.id !== id));
        }
    };

    const startEdit = (admin: AdminUser) => {
        setEditingId(admin.id);
        setNewName(admin.name);
        setNewPin(admin.pin);
        setNewPermissions(admin.permissions);
    };

    const toggleAll = (enable: boolean) => {
        const p = { ...newPermissions };
        (Object.keys(p) as Array<keyof AdminPermissions>).forEach(k => p[k] = enable);
        setNewPermissions(p);
    };

    const isEditingSuperAdmin = editingId && admins.find(a => a.id === editingId)?.isSuperAdmin;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="xl:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                         <h4 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2">
                             <UserCog size={16} className="text-blue-600"/> {editingId ? 'Edit Admin Profile' : 'Create New Admin'}
                         </h4>
                         {isEditingSuperAdmin && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-black uppercase">Super Admin (Full Access)</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InputField label="Admin Name" val={newName} onChange={(e:any) => setNewName(e.target.value)} placeholder="e.g. John Doe" />
                        <InputField label="4-Digit PIN" val={newPin} onChange={(e:any) => setNewPin(e.target.value)} placeholder="####" type="text" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Access Permissions</label>
                            {!isEditingSuperAdmin && (
                                <div className="flex gap-2">
                                    <button onClick={() => toggleAll(true)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Select All</button>
                                    <button onClick={() => toggleAll(false)} className="text-[10px] font-bold text-slate-400 hover:bg-slate-100 px-2 py-1 rounded">Clear All</button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PERMISSION_GROUPS.map(group => (
                                <div key={group.title} className={`bg-white rounded-xl border border-${group.color}-100 overflow-hidden shadow-sm`}>
                                    <div className={`bg-${group.color}-50 p-3 border-b border-${group.color}-100 flex items-center gap-2`}>
                                        <span className={`text-${group.color}-600`}>{group.icon}</span>
                                        <span className={`text-[10px] font-black uppercase text-${group.color}-800`}>{group.title}</span>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {group.items.map(item => (
                                            <label key={item.key} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isEditingSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}>
                                                <div className="pt-0.5">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={(newPermissions as any)[item.key]} 
                                                        onChange={(e) => setNewPermissions({...newPermissions, [item.key]: e.target.checked})}
                                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                        disabled={isEditingSuperAdmin}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-800">{item.label}</div>
                                                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
                            {editingId && <button onClick={resetForm} className="px-6 py-3 bg-white border border-slate-300 text-slate-600 rounded-xl text-xs font-bold uppercase hover:bg-slate-50">Cancel Edit</button>}
                            <button onClick={handleAddOrUpdate} className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
                                <Check size={16} /> {editingId ? 'Update Admin Permissions' : 'Create Admin User'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Column */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 uppercase text-xs mb-2">Active Admins ({admins.length})</h4>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 pb-20">
                        {admins.map(admin => (
                            <div key={admin.id} className={`p-4 rounded-xl border transition-all ${editingId === admin.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${admin.isSuperAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                            <UserCog size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{admin.name}</div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                                <Lock size={10} /> {admin.pin}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEdit(admin)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Permissions"><Edit2 size={14} /></button>
                                        {admin.id !== 'super-admin' && currentUser.name === 'Admin' && currentUser.pin === '1723' && (
                                            <button onClick={() => handleDelete(admin.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Admin"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {admin.isSuperAdmin ? (
                                        <span className="text-[9px] font-bold uppercase bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">Full Access</span>
                                    ) : (
                                        Object.entries(admin.permissions).filter(([_, v]) => v).map(([k]) => (
                                            <span key={k} className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{k}</span>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
  
  // History State
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
      { id: 'guide', label: 'System Guide', icon: BookOpen } // New Tab
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

  const checkSkuDuplicate = (sku: string, currentId: string) => {
    if (!sku || !localData) return false;
    for (const b of localData.brands) {
        for (const c of b.categories) {
            for (const p of c.products) {
                if (p.sku && p.sku.toLowerCase() === sku.toLowerCase() && p.id !== currentId) return true;
            }
        }
    }
    return false;
  };

  const handleGlobalSave = () => {
      if (localData) {
          onUpdateData(localData);
          setHasUnsavedChanges(false);
      }
  };

  const updateFleetMember = async (kiosk: KioskRegistry) => {
      if(supabase) {
          const payload = {
              id: kiosk.id,
              name: kiosk.name,
              device_type: kiosk.deviceType,
              assigned_zone: kiosk.assignedZone
          };
          await supabase.from('kiosks').upsert(payload);
          onRefresh(); 
      }
  };

  const removeFleetMember = async (id: string) => {
      const kiosk = localData?.fleet?.find(f => f.id === id);
      if(!kiosk) return;

      if(confirm(`Archive and remove device "${kiosk.name}" from live monitoring?`) && supabase) {
          // 1. Archive the device data
          const newArchive = addToArchive('device', kiosk.name, kiosk);
          
          // 2. Update local data state
          const updatedData = { ...localData!, archive: newArchive };
          
          // 3. Delete from live table
          await supabase.from('kiosks').delete().eq('id', id);
          
          // 4. Force cloud sync of config (archive)
          onUpdateData(updatedData);
          
          onRefresh();
      }
  };

  // ARCHIVE HANDLERS
  const addToArchive = (type: 'product' | 'pricelist' | 'tv_model' | 'device' | 'other', name: string, data: any) => {
      if (!localData) return;
      const now = new Date().toISOString();
      const newItem = {
          id: generateId('arch'),
          type,
          name,
          data,
          deletedAt: now
      };
      
      const currentArchive = localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} };
      const newArchive = {
          ...currentArchive,
          deletedItems: [newItem, ...(currentArchive.deletedItems || [])]
      };
      
      return newArchive;
  };

  const restoreBrand = (b: Brand) => {
     if(!localData) return;
     const newArchiveBrands = localData.archive?.brands.filter(x => x.id !== b.id) || [];
     const newBrands = [...localData.brands, b];
     handleLocalUpdate({
         ...localData,
         brands: newBrands,
         archive: { ...localData.archive!, brands: newArchiveBrands }
     });
  };
  
  const restoreCatalogue = (c: Catalogue) => {
     if(!localData) return;
     const newArchiveCats = localData.archive?.catalogues.filter(x => x.id !== c.id) || [];
     const newCats = [...(localData.catalogues || []), c];
     handleLocalUpdate({
         ...localData,
         catalogues: newCats,
         archive: { ...localData.archive!, catalogues: newArchiveCats }
     });
  };

  const handleMoveProduct = (product: Product, targetBrandId: string, targetCategoryId: string) => {
      if (!localData || !selectedBrand || !selectedCategory) return;
      
      const updatedSourceCat = {
          ...selectedCategory,
          products: selectedCategory.products.filter(p => p.id !== product.id)
      };
      
      let newBrands = localData.brands.map(b => {
          if (b.id === selectedBrand.id) {
              return {
                  ...b,
                  categories: b.categories.map(c => c.id === selectedCategory.id ? updatedSourceCat : c)
              };
          }
          return b;
      });

      newBrands = newBrands.map(b => {
          if (b.id === targetBrandId) {
              return {
                  ...b,
                  categories: b.categories.map(c => {
                      if (c.id === targetCategoryId) {
                          return { ...c, products: [...c.products, product] };
                      }
                      return c;
                  })
              };
          }
          return b;
      });

      handleLocalUpdate({ ...localData, brands: newBrands });
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
      if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
      return date.toLocaleDateString();
  };

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip();
    let loadedZip;
    try {
        loadedZip = await zip.loadAsync(file);
    } catch (e) {
        throw new Error("Invalid ZIP file");
    }
    
    const newBrands: Record<string, Brand> = {};
    
    // Helper: Normalize path to avoid Windows/Mac slash issues
    const getCleanPath = (filename: string) => filename.replace(/\\/g, '/');

    // 1. Detect Root Wrapper (e.g. user zipped a folder "Backup" containing Brands)
    const validFiles = Object.keys(loadedZip.files).filter(path => {
        return !loadedZip.files[path].dir && !path.includes('__MACOSX') && !path.includes('.DS_Store');
    });

    let rootPrefix = "";
    if (validFiles.length > 0) {
        const firstFileParts = getCleanPath(validFiles[0]).split('/').filter(p => p);
        if (firstFileParts.length > 1) {
            const possibleRoot = firstFileParts[0];
            const allHaveRoot = validFiles.every(path => getCleanPath(path).startsWith(possibleRoot + '/'));
            if (allHaveRoot) {
                rootPrefix = possibleRoot + '/';
                console.log("Import: Stripping root folder:", rootPrefix);
            }
        }
    }

    // Helper: Determine MIME type
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

    // Helper: Process Asset (Upload to Cloud if available to save JSON size)
    const processAsset = async (zipObj: any, filename: string): Promise<string> => {
        const blob = await zipObj.async("blob");
        
        // Try Cloud Upload First (To keep JSON small)
        if (supabase) {
             try {
                 const mimeType = getMimeType(filename);
                 // Sanitize filename
                 const safeName = filename.replace(/[^a-z0-9._-]/gi, '_');
                 // Create File object
                 const fileToUpload = new File([blob], `import_${Date.now()}_${safeName}`, { type: mimeType });
                 // Upload sequentially (this function is called inside sequential loop)
                 const url = await uploadFileToStorage(fileToUpload);
                 return url;
             } catch (e) {
                 console.warn(`Asset upload failed for ${filename}. Fallback to Base64.`, e);
             }
        }

        // Fallback Base64 (Only if offline or upload failed)
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    };

    // Iterate files
    const filePaths = Object.keys(loadedZip.files);
    let processedCount = 0;
    
    for (const rawPath of filePaths) {
        let path = getCleanPath(rawPath);
        const fileObj = loadedZip.files[rawPath];
        if (fileObj.dir) continue;
        if (path.includes('__MACOSX') || path.includes('.DS_Store')) continue;

        // Remove Root Prefix if detected
        if (rootPrefix && path.startsWith(rootPrefix)) {
            path = path.substring(rootPrefix.length);
        }

        // SKIP SYSTEM BACKUP FOLDERS in Inventory Import
        if (path.startsWith('_System_Backup/')) continue;
        if (path.includes('store_config')) continue;

        // Path: Brand/Category/Product/File.ext OR Brand/BrandFile.ext
        const parts = path.split('/').filter(p => p.trim() !== '');
        
        // Skip root files if any (files not inside a Brand folder)
        if (parts.length < 2) continue;

        processedCount++;
        if (onProgress && processedCount % 5 === 0) onProgress(`Processing item ${processedCount}/${validFiles.length}...`);

        const brandName = parts[0];

        // Init Brand
        if (!newBrands[brandName]) {
            newBrands[brandName] = {
                id: generateId('brand'),
                name: brandName,
                categories: []
            };
        }

        // Handle Brand Assets (Level 2: Brand/brand_logo.png)
        if (parts.length === 2) {
             const fileName = parts[1].toLowerCase();
             // Parse brand logo
             if (fileName.includes('brand_logo') || fileName.includes('logo')) {
                  const url = await processAsset(fileObj, parts[1]);
                  newBrands[brandName].logoUrl = url;
             }
             // Parse Brand JSON metadata if exists
             if (fileName.endsWith('.json') && fileName.includes('brand')) {
                 try {
                     const text = await fileObj.async("text");
                     const meta = JSON.parse(text);
                     if (meta.themeColor) newBrands[brandName].themeColor = meta.themeColor;
                     // Allow ID overwrite if restoring backup
                     if (meta.id) newBrands[brandName].id = meta.id; 
                 } catch(e) {}
             }
             continue;
        }

        // Require Product Depth for rest (Brand/Category/Product/File)
        if (parts.length < 4) continue;

        const categoryName = parts[1];
        const productName = parts[2];
        const fileName = parts.slice(3).join('/'); // In case of subfolders inside product (e.g. gallery)

        // Init Category
        let category = newBrands[brandName].categories.find(c => c.name === categoryName);
        if (!category) {
            category = {
                id: generateId('cat'),
                name: categoryName,
                icon: 'Box',
                products: []
            };
            newBrands[brandName].categories.push(category);
        }

        // Init Product
        let product = category.products.find(p => p.name === productName);
        if (!product) {
            product = {
                id: generateId('prod'),
                name: productName, 
                description: '',
                specs: {},
                features: [],
                dimensions: [],
                imageUrl: '',
                galleryUrls: [],
                videoUrls: [],
                manuals: [],
                dateAdded: new Date().toISOString()
            };
            category.products.push(product);
        }

        const lowerFile = fileName.toLowerCase();
        
        // Handle Details JSON - Deep Merge
        if (fileName.endsWith('.json') && (fileName.includes('details') || fileName.includes('product'))) {
             try {
                 const text = await fileObj.async("text");
                 const meta = JSON.parse(text);
                 if (meta.id) product.id = meta.id; // Restore ID
                 if (meta.name) product.name = meta.name;
                 if (meta.description) product.description = meta.description;
                 if (meta.sku) product.sku = meta.sku;
                 if (meta.specs) product.specs = { ...product.specs, ...meta.specs };
                 if (meta.features) product.features = [...(product.features || []), ...(meta.features || [])];
                 if (meta.dimensions) product.dimensions = meta.dimensions;
                 if (meta.boxContents) product.boxContents = meta.boxContents;
                 if (meta.terms) product.terms = meta.terms;
                 if (meta.dateAdded) product.dateAdded = meta.dateAdded;
             } catch(e) { console.warn("Failed to parse JSON for " + productName); }
        }
        // Handle Images
        else if (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg') || lowerFile.endsWith('.png') || lowerFile.endsWith('.webp')) {
             const url = await processAsset(fileObj, parts.slice(3).join('_'));
             if (lowerFile.includes('cover') || lowerFile.includes('main') || (!product.imageUrl && !lowerFile.includes('gallery'))) {
                 product.imageUrl = url;
             } else if (lowerFile.includes('gallery')) {
                 product.galleryUrls = [...(product.galleryUrls || []), url];
             }
        }
        // Handle Videos
        else if (lowerFile.endsWith('.mp4') || lowerFile.endsWith('.webm')) {
            const url = await processAsset(fileObj, parts.slice(3).join('_'));
            product.videoUrls = [...(product.videoUrls || []), url];
        }
        // Handle PDFs (Manuals)
        else if (lowerFile.endsWith('.pdf')) {
            const url = await processAsset(fileObj, parts.slice(3).join('_'));
            const title = fileName.split('/').pop()?.replace('.pdf', '') || 'User Manual';
            product.manuals = [...(product.manuals || []), {
                id: generateId('man'),
                title: title.charAt(0).toUpperCase() + title.slice(1),
                images: [],
                pdfUrl: url
            }];
        }
    }
    
    return Object.values(newBrands);
};

  if (!currentUser) return <Auth admins={localData?.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* GLOBAL SIDEBAR */}
      <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 z-50">
        <div className="p-4 md:p-6 mb-6">
           <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shrink-0">
                 <ShieldCheck size={24} />
              </div>
              <div className="hidden md:block overflow-hidden">
                 <h2 className="font-black uppercase tracking-tight truncate">Admin Hub</h2>
                 <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">Kiosk Pro v2.8</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {availableTabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedBrand(null); setSelectedCategory(null); }}
              className={`w-full text-left p-3 md:px-4 md:py-3 rounded-xl flex items-center gap-4 transition-all duration-200 group ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon size={20} className={`shrink-0 ${activeTab === tab.id ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`} />
              <span className="hidden md:block font-bold text-xs uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
            <div className="hidden md:flex items-center gap-3 px-2 py-3 bg-white/5 rounded-2xl mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <UserCog size={16} />
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-white truncate">{currentUser.name}</div>
                    <div className="text-[8px] font-bold uppercase text-slate-500">Connected Admin</div>
                </div>
            </div>
            <button onClick={() => window.location.href = '/'} className="w-full p-3 rounded-xl flex items-center gap-4 text-slate-400 hover:text-white transition-all group">
               <Eye size={20} className="shrink-0" />
               <span className="hidden md:block font-bold text-xs uppercase">Live Kiosk</span>
            </button>
            <button onClick={() => setCurrentUser(null)} className="w-full p-3 rounded-xl flex items-center gap-4 text-red-400 hover:bg-red-500/10 transition-all group">
               <Power size={20} className="shrink-0" />
               <span className="hidden md:block font-bold text-xs uppercase">Logout</span>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
        
        {/* HEADER BAR */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-40">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               <h2 className="text-sm md:text-xl font-black uppercase text-slate-900 tracking-tight whitespace-nowrap">
                  {availableTabs.find(t => t.id === activeTab)?.label} Control
               </h2>
               <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border ${isCloudConnected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'} animate-fade-in`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">{isCloudConnected ? 'Cloud Sync Active' : 'Cloud Offline'}</span>
               </div>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
               {hasUnsavedChanges && (
                   <div className="flex items-center gap-2 animate-pulse pr-2 md:pr-4 border-r border-slate-200 mr-2 md:mr-4">
                       <AlertCircle size={16} className="text-orange-500" />
                       <span className="text-[10px] font-black uppercase text-orange-600 hidden md:inline">Unsaved Changes</span>
                   </div>
               )}
               <button onClick={onRefresh} className="p-2 md:p-3 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all" title="Refresh from Cloud">
                  <RotateCcw size={20} />
               </button>
               <button 
                  onClick={handleGlobalSave} 
                  disabled={!hasUnsavedChanges}
                  className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
               >
                  <Save size={18} />
                  <span className="hidden md:inline">Save To Cloud</span>
               </button>
           </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
          
          {activeTab === 'inventory' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                {/* Inventory Context Breadcrumb */}
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => { setSelectedBrand(null); setSelectedCategory(null); }} className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${!selectedBrand ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}>All Brands</button>
                    {selectedBrand && (
                        <>
                            <ChevronRight size={14} className="text-slate-300" />
                            <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedBrand && !selectedCategory ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}>{selectedBrand.name}</button>
                        </>
                    )}
                    {selectedCategory && (
                        <>
                            <ChevronRight size={14} className="text-slate-300" />
                            <div className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow-md font-black uppercase text-[10px] tracking-widest">{selectedCategory.name}</div>
                        </>
                    )}
                </div>

                {!selectedBrand ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <button 
                            onClick={() => {
                                const name = prompt("New Brand Name:");
                                if(name) handleLocalUpdate({ ...localData!, brands: [...localData!.brands, { id: generateId('b'), name, categories: [] }] });
                            }}
                            className="bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group aspect-square"
                        >
                            <Plus size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                            <span className="font-black uppercase tracking-widest text-sm">Add New Brand</span>
                        </button>

                        {localData?.brands.map(brand => (
                            <div key={brand.id} className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col p-4">
                                <div className="aspect-square bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 relative overflow-hidden">
                                    {brand.logoUrl ? (
                                        <img src={brand.logoUrl} className="max-w-[70%] max-h-[70%] object-contain" alt="" />
                                    ) : (
                                        <span className="text-6xl font-black text-slate-200">{brand.name.charAt(0)}</span>
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                                        <button onClick={() => setSelectedBrand(brand)} className="bg-white text-slate-900 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">Manage Brand</button>
                                    </div>
                                </div>
                                <div className="px-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-black text-lg text-slate-900 uppercase leading-none mb-1">{brand.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{brand.categories.length} Categories</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(confirm(`Delete ${brand.name}? This will move the entire brand to the History archive.`)) {
                                                const newArchive = addToArchive('other', `Brand: ${brand.name}`, brand);
                                                handleLocalUpdate({ ...localData!, brands: localData!.brands.filter(b => b.id !== brand.id), archive: newArchive });
                                            }
                                        }}
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !selectedCategory ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                        <button 
                            onClick={() => {
                                const name = prompt("New Category Name:");
                                if(name) {
                                    const updatedBrands = localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, categories: [...b.categories, { id: generateId('c'), name, icon: 'Box', products: [] }] } : b);
                                    handleLocalUpdate({ ...localData!, brands: updatedBrands });
                                }
                            }}
                            className="bg-white border-2 border-dashed border-slate-300 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all group aspect-square"
                        >
                            <Plus size={32} className="mb-2" />
                            <span className="font-black uppercase tracking-widest text-xs">New Category</span>
                        </button>

                        {selectedBrand.categories.map(cat => (
                            <div key={cat.id} className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden p-4 flex flex-col">
                                <div className="aspect-square bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-4 relative group">
                                    <FolderOpen size={48} className="text-slate-200 group-hover:text-blue-200 transition-colors" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                         <button onClick={() => setSelectedCategory(cat)} className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Manage Models</button>
                                    </div>
                                </div>
                                <div className="px-2 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-900 uppercase tracking-tight">{cat.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{cat.products.length} Products</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(confirm(`Delete ${cat.name}?`)) {
                                                const updatedBrands = localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, categories: b.categories.filter(c => c.id !== cat.id) } : b);
                                                handleLocalUpdate({ ...localData!, brands: updatedBrands });
                                            }
                                        }}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    ><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Brand Settings Section in Categories View */}
                        <div className="col-span-full mt-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                             <h4 className="font-black uppercase text-slate-400 text-xs tracking-[0.2em] mb-8 pb-4 border-b border-slate-100">Brand Identity Settings</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <InputField label="Official Brand Name" val={selectedBrand.name} onChange={(e:any) => {
                                        const val = e.target.value;
                                        handleLocalUpdate({ ...localData!, brands: localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, name: val } : b) });
                                    }} />
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Primary Theme Color</label>
                                            <div className="flex gap-4">
                                                <input type="color" value={selectedBrand.themeColor || '#2563eb'} onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleLocalUpdate({ ...localData!, brands: localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, themeColor: val } : b) });
                                                }} className="w-16 h-12 rounded-lg cursor-pointer bg-white border border-slate-200 p-1" />
                                                <input type="text" value={selectedBrand.themeColor || '#2563eb'} onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleLocalUpdate({ ...localData!, brands: localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, themeColor: val } : b) });
                                                }} className="flex-1 p-3 border border-slate-300 rounded-xl font-mono text-sm uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <FileUpload 
                                        label="Brand Official Logo" 
                                        currentUrl={selectedBrand.logoUrl} 
                                        onUpload={(url: any) => handleLocalUpdate({ ...localData!, brands: localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, logoUrl: url } : b) })} 
                                    />
                                    <div className="mt-6">
                                        <CatalogueManager 
                                            catalogues={localData?.catalogues?.filter(c => c.brandId === selectedBrand.id) || []} 
                                            brandId={selectedBrand.id}
                                            onSave={(newList) => {
                                                const otherCatalogues = localData?.catalogues?.filter(c => c.brandId !== selectedBrand.id) || [];
                                                handleLocalUpdate({ ...localData!, catalogues: [...otherCatalogues, ...newList] });
                                            }}
                                        />
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            <button 
                                onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' })}
                                className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group aspect-square"
                            >
                                <Plus size={32} className="mb-2" />
                                <span className="font-black uppercase tracking-widest text-[10px]">Add Product</span>
                            </button>

                            {selectedCategory.products.map(product => (
                                <div key={product.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                                    <div className="aspect-square bg-white relative p-4 flex items-center justify-center group">
                                        {product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box className="text-slate-100" size={64}/>}
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 p-4 justify-center">
                                             <button onClick={() => setEditingProduct(product)} className="w-full bg-white text-slate-900 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={12}/> Edit Product</button>
                                             <button onClick={() => setMovingProduct(product)} className="w-full bg-slate-800 text-white py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-purple-600 transition-all"><Move size={12}/> Move</button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 flex-1 flex flex-col justify-between">
                                        <h4 className="font-bold text-slate-900 uppercase text-xs leading-tight mb-2 line-clamp-2">{product.name}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">{product.sku || 'No SKU'}</span>
                                            <button 
                                                onClick={() => {
                                                    if(confirm(`Move ${product.name} to archive?`)) {
                                                        const newArchive = addToArchive('product', product.name, product);
                                                        const updatedBrands = localData!.brands.map(b => b.id === selectedBrand.id ? { ...b, categories: b.categories.map(c => c.id === selectedCategory.id ? { ...c, products: c.products.filter(p => p.id !== product.id) } : c) } : b);
                                                        handleLocalUpdate({ ...localData!, brands: updatedBrands, archive: newArchive });
                                                    }
                                                }}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            ><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                {/* Hero Section Config */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                        <LayoutTemplate className="text-blue-600" /> Hero Branding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <InputField label="Headline Title" val={localData?.hero.title} onChange={(e:any) => handleLocalUpdate({ ...localData!, hero: { ...localData!.hero, title: e.target.value } })} />
                            <InputField label="Subtitle Text" isArea val={localData?.hero.subtitle} onChange={(e:any) => handleLocalUpdate({ ...localData!, hero: { ...localData!.hero, subtitle: e.target.value } })} />
                            <InputField label="Website URL" val={localData?.hero.websiteUrl} onChange={(e:any) => handleLocalUpdate({ ...localData!, hero: { ...localData!.hero, websiteUrl: e.target.value } })} />
                        </div>
                        <div className="space-y-6">
                            <FileUpload label="Background Banner Image" currentUrl={localData?.hero.backgroundImageUrl} onUpload={(url: any) => handleLocalUpdate({ ...localData!, hero: { ...localData!.hero, backgroundImageUrl: url } })} />
                            <FileUpload label="Secondary Logo Overlay" currentUrl={localData?.hero.logoUrl} onUpload={(url: any) => handleLocalUpdate({ ...localData!, hero: { ...localData!.hero, logoUrl: url } })} />
                        </div>
                    </div>
                </div>

                {/* Ad Zones Manager */}
                <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10"><Megaphone size={200} /></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Advertisement Placements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {['homeBottomLeft', 'homeBottomRight', 'homeSideVertical', 'homeSideLeftVertical', 'screensaver'].map(zone => (
                                <div key={zone} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="font-bold text-xs uppercase tracking-widest text-blue-400">{zone.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                        <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-1 rounded">{(localData?.ads as any)[zone].length} Assets</span>
                                    </div>
                                    <FileUpload 
                                        label="Add New Media" 
                                        accept="image/*,video/*" 
                                        allowMultiple={true}
                                        onUpload={(urls: any, type: any) => {
                                            const newAds = Array.isArray(urls) ? urls.map(u => ({ id: generateId('ad'), type, url: u, dateAdded: new Date().toISOString() })) : [{ id: generateId('ad'), type, url: urls, dateAdded: new Date().toISOString() }];
                                            const currentAds = (localData?.ads as any)[zone] || [];
                                            handleLocalUpdate({ ...localData!, ads: { ...localData!.ads, [zone]: [...currentAds, ...newAds] } });
                                        }} 
                                    />
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        {(localData?.ads as any)[zone].map((ad: AdItem) => (
                                            <div key={ad.id} className="relative group aspect-square bg-black rounded-xl overflow-hidden shadow-lg">
                                                {ad.type === 'video' ? <video src={ad.url} className="w-full h-full object-cover opacity-60" muted /> : <img src={ad.url} className="w-full h-full object-cover" />}
                                                <button 
                                                    onClick={() => {
                                                        const updatedZone = (localData?.ads as any)[zone].filter((a: AdItem) => a.id !== ad.id);
                                                        handleLocalUpdate({ ...localData!, ads: { ...localData!.ads, [zone]: updatedZone } });
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                ><Trash2 size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Global Pamphlets */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
                    <CatalogueManager 
                        catalogues={localData?.catalogues?.filter(c => !c.brandId) || []} 
                        onSave={(newList) => {
                            const brandCatalogues = localData?.catalogues?.filter(c => c.brandId) || [];
                            handleLocalUpdate({ ...localData!, catalogues: [...brandCatalogues, ...newList] });
                        }}
                    />
                </div>
            </div>
          )}

          {activeTab === 'pricelists' && (
              <PricelistManager 
                pricelists={localData?.pricelists || []} 
                pricelistBrands={localData?.pricelistBrands || []}
                onSavePricelists={(newList) => handleLocalUpdate({ ...localData!, pricelists: newList })}
                onSaveBrands={(newBrands) => handleLocalUpdate({ ...localData!, pricelistBrands: newBrands })}
                onDeletePricelist={(id) => {
                    const pl = localData?.pricelists?.find(p => p.id === id);
                    if(pl) {
                        const newArchive = addToArchive('pricelist', `Pricelist: ${pl.title}`, pl);
                        handleLocalUpdate({ ...localData!, pricelists: localData!.pricelists!.filter(p => p.id !== id), archive: newArchive });
                    }
                }}
              />
          )}

          {activeTab === 'tv' && (
              <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-8 h-[calc(100vh-140px)]">
                  {/* Left Column: TV Brand Management */}
                  <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden shrink-0">
                       <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                           <h2 className="font-black text-slate-900 uppercase text-sm">TV Display Channels</h2>
                           <button onClick={() => {
                               const name = prompt("Brand Channel Name:");
                               if(name) handleLocalUpdate({ ...localData!, tv: { brands: [...(localData!.tv?.brands || []), { id: generateId('tvb'), name, models: [] }] } });
                           }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase flex items-center gap-1">
                              <Plus size={14} /> Add Channel
                           </button>
                       </div>
                       <div className="flex-1 overflow-y-auto p-4 space-y-3">
                           {(localData?.tv?.brands || []).map(brand => (
                               <div 
                                  key={brand.id} 
                                  onClick={() => setSelectedTVBrand(brand)}
                                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group ${selectedTVBrand?.id === brand.id ? 'bg-blue-50 border-blue-600 shadow-md scale-[1.02]' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                               >
                                   <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                           {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <Tv size={24} className="text-slate-300" />}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                           <div className="font-black text-slate-900 uppercase text-xs truncate">{brand.name}</div>
                                           <div className="text-[10px] font-bold text-slate-400 uppercase">{(brand.models || []).length} Models</div>
                                       </div>
                                   </div>
                                   {selectedTVBrand?.id === brand.id && (
                                       <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-4" onClick={e => e.stopPropagation()}>
                                           <InputField label="Rename Channel" val={brand.name} onChange={(e:any) => handleLocalUpdate({ ...localData!, tv: { brands: localData!.tv!.brands.map(b => b.id === brand.id ? { ...b, name: e.target.value } : b) } })} />
                                           <FileUpload 
                                                label="Channel Logo" 
                                                currentUrl={brand.logoUrl} 
                                                onUpload={(url: any) => handleLocalUpdate({ ...localData!, tv: { brands: localData!.tv!.brands.map(b => b.id === brand.id ? { ...b, logoUrl: url } : b) } })} 
                                           />
                                           <button 
                                                onClick={() => {
                                                    if(confirm("Delete this entire brand channel?")) {
                                                        handleLocalUpdate({ ...localData!, tv: { brands: localData!.tv!.brands.filter(b => b.id !== brand.id) } });
                                                        setSelectedTVBrand(null);
                                                    }
                                                }}
                                                className="w-full text-center text-[10px] text-red-500 font-black uppercase hover:bg-red-50 py-2 rounded-lg"
                                           >Delete Channel</button>
                                       </div>
                                   )}
                               </div>
                           ))}
                       </div>
                  </div>

                  {/* Right Column: Models for Selected Brand */}
                  <div className="flex-1 h-1/2 md:h-full bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col shadow-inner min-h-0">
                      {!selectedTVBrand ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                              <Tv size={80} className="opacity-10" />
                              <p className="font-black uppercase tracking-widest text-xs opacity-40">Select a Channel to Manage Models</p>
                          </div>
                      ) : (
                          <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
                              <div className="flex justify-between items-center mb-8 shrink-0">
                                  <h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-3">
                                      {selectedTVBrand.name} <span className="text-slate-300">/</span> Models
                                  </h3>
                                  <button onClick={() => setEditingTVModel({ id: generateId('tvm'), name: 'New Model', videoUrls: [] })} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2">
                                      <Plus size={18} /> Add Model
                                  </button>
                              </div>
                              
                              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 content-start pr-2 pb-10">
                                  {selectedTVBrand.models?.map(model => (
                                      <div key={model.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                          <div className="aspect-video bg-slate-900 relative flex items-center justify-center p-2 overflow-hidden">
                                              {model.imageUrl ? <img src={model.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Tv className="text-white/10" size={64}/>}
                                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                                                  <button onClick={() => setEditingTVModel(model)} className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">Edit Videos</button>
                                              </div>
                                          </div>
                                          <div className="p-5 flex justify-between items-center">
                                              <div>
                                                  <h4 className="font-black text-slate-900 uppercase text-sm leading-tight">{model.name}</h4>
                                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{model.videoUrls?.length || 0} Loop Videos</p>
                                              </div>
                                              <button 
                                                  onClick={() => {
                                                      if(confirm(`Delete model ${model.name}?`)) {
                                                          const updatedBrands = localData!.tv!.brands.map(b => b.id === selectedTVBrand.id ? { ...b, models: b.models.filter(m => m.id !== model.id) } : b);
                                                          handleLocalUpdate({ ...localData!, tv: { brands: updatedBrands } });
                                                      }
                                                  }}
                                                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                              ><Trash2 size={20}/></button>
                                          </div>
                                      </div>
                                  ))}
                                  {(!selectedTVBrand.models || selectedTVBrand.models.length === 0) && (
                                      <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase text-xs italic opacity-40">No models for this brand yet.</div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'screensaver' && (
              <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                          <Monitor className="text-blue-600" /> Timing & Display
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                              <InputField label="Idle Timeout (Seconds)" val={localData?.screensaverSettings?.idleTimeout} type="number" onChange={(e:any) => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, idleTimeout: parseInt(e.target.value) } })} />
                              <InputField label="Slide Duration (Seconds)" val={localData?.screensaverSettings?.imageDuration} type="number" onChange={(e:any) => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, imageDuration: parseInt(e.target.value) } })} />
                              
                              <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Display Style</label>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, displayStyle: 'contain' } })} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] transition-all border-2 ${localData?.screensaverSettings?.displayStyle === 'contain' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>Contain</button>
                                      <button onClick={() => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, displayStyle: 'cover' } })} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] transition-all border-2 ${localData?.screensaverSettings?.displayStyle === 'cover' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>Full Cover</button>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-4">Content Switches</label>
                              {[
                                  { key: 'muteVideos', label: 'Mute Videos', icon: <VolumeX size={16}/> },
                                  { key: 'showProductImages', label: 'Show Product Photos', icon: <ImageIcon size={16}/> },
                                  { key: 'showProductVideos', label: 'Show Product Videos', icon: <Video size={16}/> },
                                  { key: 'showPamphlets', label: 'Show Pamphlet Covers', icon: <BookOpen size={16}/> },
                                  { key: 'showCustomAds', label: 'Show Custom Ads', icon: <Megaphone size={16}/> },
                                  { key: 'showInfoOverlay', label: 'Show Information Text', icon: <Info size={16}/> }
                              ].map((item: any) => (
                                  <button 
                                    key={item.key}
                                    onClick={() => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, [item.key]: !(localData!.screensaverSettings as any)[item.key] } })}
                                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border ${ (localData!.screensaverSettings as any)[item.key] ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 opacity-60' }`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <span className={(localData!.screensaverSettings as any)[item.key] ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                                          <span className="font-bold text-xs uppercase">{item.label}</span>
                                      </div>
                                      {(localData!.screensaverSettings as any)[item.key] ? <ToggleRight className="text-blue-600" /> : <ToggleLeft className="text-slate-300" />}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-12 opacity-5"><Moon size={160} /></div>
                       <div className="relative z-10">
                           <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                               <Clock className="text-blue-400" /> Auto-Sleep Mode
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl">
                                        <div>
                                            <div className="font-black uppercase text-xs">Enable Sleep Hours</div>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Turns screen black outside business hours</p>
                                        </div>
                                        <button 
                                            onClick={() => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, enableSleepMode: !localData!.screensaverSettings?.enableSleepMode } })}
                                            className={`p-2 transition-all ${localData?.screensaverSettings?.enableSleepMode ? 'text-green-400' : 'text-slate-600'}`}
                                        >
                                            {localData?.screensaverSettings?.enableSleepMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                        </button>
                                    </div>
                                </div>
                                <div className={`space-y-6 transition-all duration-500 ${localData?.screensaverSettings?.enableSleepMode ? 'opacity-100 scale-100' : 'opacity-20 scale-95 pointer-events-none'}`}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Start</label>
                                            <input type="time" value={localData?.screensaverSettings?.activeHoursStart || '08:00'} onChange={(e) => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, activeHoursStart: e.target.value } })} className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl text-xl font-black text-center text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active End</label>
                                            <input type="time" value={localData?.screensaverSettings?.activeHoursEnd || '20:00'} onChange={(e) => handleLocalUpdate({ ...localData!, screensaverSettings: { ...localData!.screensaverSettings!, activeHoursEnd: e.target.value } })} className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl text-xl font-black text-center text-white" />
                                        </div>
                                    </div>
                                </div>
                           </div>
                       </div>
                  </div>
              </div>
          )}

          {activeTab === 'fleet' && (
            <div className="max-w-6xl mx-auto animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localData?.fleet?.sort((a,b) => b.status.localeCompare(a.status)).map((kiosk) => {
                        const isOnline = (new Date().getTime() - new Date(kiosk.last_seen).getTime()) < 120000;
                        return (
                            <div key={kiosk.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-xl">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${kiosk.deviceType === 'tv' ? 'bg-indigo-50 text-indigo-600' : kiosk.deviceType === 'mobile' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {kiosk.deviceType === 'tv' ? <Tv size={24} /> : kiosk.deviceType === 'mobile' ? <Smartphone size={24} /> : <Tablet size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{kiosk.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{isOnline ? 'Online Now' : 'Offline'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setEditingKiosk(kiosk)} className="p-2 text-slate-300 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Edit2 size={16}/></button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Zone / Area</span>
                                            <span className="block text-xs font-bold text-slate-700 truncate">{kiosk.assignedZone || 'Unassigned'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Last Sync</span>
                                            <span className="block text-xs font-bold text-slate-700">{formatRelativeTime(kiosk.last_seen)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                                        <div className="flex items-center gap-1"><Wifi size={12}/> {kiosk.wifiStrength}%</div>
                                        <div className="flex items-center gap-1"><Cpu size={12}/> v{kiosk.version}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                    <button 
                                        onClick={async () => {
                                            if(confirm(`Request remote system restart for ${kiosk.name}?`)) {
                                                await supabase.from('kiosks').update({ restart_requested: true }).eq('id', kiosk.id);
                                                alert("Command queued. Device will reboot on next heartbeat (max 60s).");
                                            }
                                        }}
                                        className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                                    ><RotateCcw size={14}/> Reboot</button>
                                    <button 
                                        onClick={() => removeFleetMember(kiosk.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    ><Trash2 size={16}/></button>
                                </div>
                            </div>
                        )
                    })}
                    {(!localData?.fleet || localData.fleet.length === 0) && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-slate-300 gap-4 border-4 border-dashed border-slate-200 rounded-[3rem]">
                            <Tablet size={64} className="opacity-20" />
                            <div>
                                <p className="font-black uppercase tracking-widest text-lg opacity-40">No Devices Connected</p>
                                <p className="text-xs font-bold opacity-30 mt-1 uppercase tracking-widest">Connect a tablet and complete setup to monitor fleet</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'history' && (
              <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                       <div className="flex gap-2">
                           {['deletedItems', 'brands', 'catalogues'].map(tab => (
                               <button 
                                  key={tab} 
                                  onClick={() => setHistoryTab(tab as any)}
                                  className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${historyTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-200'}`}
                               >
                                  {tab === 'deletedItems' ? 'Recycle Bin' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                               </button>
                           ))}
                       </div>
                       <div className="relative flex-1 max-w-sm">
                           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                              type="text" 
                              placeholder="Search history..." 
                              value={historySearch}
                              onChange={(e) => setHistorySearch(e.target.value)}
                              className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 shadow-sm"
                           />
                       </div>
                  </div>

                  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                      {historyTab === 'deletedItems' && (
                          <div className="divide-y divide-slate-100">
                             {(localData?.archive?.deletedItems || [])
                                .filter(item => !historySearch || item.name.toLowerCase().includes(historySearch.toLowerCase()))
                                .map(item => (
                                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'product' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {item.type === 'product' ? <Box size={24}/> : <FolderOpen size={24}/>}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase">{item.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.type}</span>
                                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Deleted {formatRelativeTime(item.deletedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                if(item.type === 'product') {
                                                    const prod = item.data as Product;
                                                    setEditingProduct(prod); // Let them edit then save to correct cat
                                                } else if(item.type === 'device') {
                                                    if(confirm("Restore this device to live fleet?")) {
                                                        const registry = item.data as KioskRegistry;
                                                        updateFleetMember(registry);
                                                        const newDeleted = (localData?.archive?.deletedItems || []).filter(i => i.id !== item.id);
                                                        handleLocalUpdate({ ...localData!, archive: { ...localData!.archive!, deletedItems: newDeleted } });
                                                    }
                                                } else if(item.type === 'pricelist') {
                                                    if(confirm("Restore this pricelist?")) {
                                                        const pl = item.data as Pricelist;
                                                        handleLocalUpdate({ 
                                                            ...localData!, 
                                                            pricelists: [...(localData!.pricelists || []), pl],
                                                            archive: { ...localData!.archive!, deletedItems: localData!.archive!.deletedItems!.filter(i => i.id !== item.id) }
                                                        });
                                                    }
                                                }
                                            }}
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                                        ><RefreshCw size={14}/> Restore</button>
                                        <button 
                                            onClick={() => {
                                                if(confirm("Permanently purge this item? This cannot be undone.")) {
                                                    const newDeleted = (localData?.archive?.deletedItems || []).filter(i => i.id !== item.id);
                                                    handleLocalUpdate({ ...localData!, archive: { ...localData!.archive!, deletedItems: newDeleted } });
                                                }
                                            }}
                                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        ><Trash2 size={20}/></button>
                                    </div>
                                </div>
                             ))}
                             {(localData?.archive?.deletedItems || []).length === 0 && (
                                 <div className="py-40 text-center flex flex-col items-center justify-center text-slate-300 gap-4">
                                     <History size={64} className="opacity-10" />
                                     <p className="font-black uppercase tracking-[0.2em] text-sm opacity-30">Archive history is clean</p>
                                 </div>
                             )}
                          </div>
                      )}

                      {historyTab === 'brands' && (
                          <div className="divide-y divide-slate-100">
                             {(localData?.archive?.brands || []).map(brand => (
                                <div key={brand.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                            {brand.logoUrl ? <img src={brand.logoUrl} className="max-w-[70%] max-h-[70%] object-contain" /> : <FolderOpen size={24} className="text-slate-300" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase">{brand.name}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{brand.categories.length} Categories</span>
                                        </div>
                                    </div>
                                    <button onClick={() => restoreBrand(brand)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><RefreshCw size={14}/> Restore Brand</button>
                                </div>
                             ))}
                             {(localData?.archive?.brands || []).length === 0 && (
                                <div className="py-40 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic opacity-30">No Archived Brands</div>
                             )}
                          </div>
                      )}

                      {historyTab === 'catalogues' && (
                          <div className="divide-y divide-slate-100">
                             {(localData?.archive?.catalogues || []).map(cat => (
                                <div key={cat.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-slate-300" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase">{cat.title}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.year || 'No Date'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => restoreCatalogue(cat)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><RefreshCw size={14}/> Restore</button>
                                </div>
                             ))}
                             {(localData?.archive?.catalogues || []).length === 0 && (
                                <div className="py-40 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic opacity-30">No Expired Catalogues</div>
                             )}
                          </div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                  
                  {/* System Administration (Admins) */}
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-100">
                           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                               <ShieldCheck className="text-blue-600" /> Administrative Access
                           </h3>
                      </div>
                      <AdminManager 
                        admins={localData?.admins || []} 
                        currentUser={currentUser}
                        onUpdate={(newAdmins) => handleLocalUpdate({ ...localData!, admins: newAdmins })} 
                      />
                  </div>

                  {/* Icon & Identity Config */}
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                        <ImageIcon className="text-blue-600" /> Application Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <FileUpload 
                            label="Kiosk (PWA) Launcher Icon" 
                            currentUrl={localData?.appConfig?.kioskIconUrl} 
                            onUpload={(url: any) => handleLocalUpdate({ ...localData!, appConfig: { ...localData!.appConfig, kioskIconUrl: url } })} 
                        />
                        <FileUpload 
                            label="Admin Hub Launcher Icon" 
                            currentUrl={localData?.appConfig?.adminIconUrl} 
                            onUpload={(url: any) => handleLocalUpdate({ ...localData!, appConfig: { ...localData!.appConfig, adminIconUrl: url } })} 
                        />
                        <FileUpload 
                            label="Master Company Branding Logo" 
                            currentUrl={localData?.companyLogoUrl} 
                            onUpload={(url: any) => handleLocalUpdate({ ...localData!, companyLogoUrl: url })} 
                        />
                        <div className="space-y-4">
                            <InputField 
                                label="Global Setup Activation PIN" 
                                val={localData?.systemSettings?.setupPin} 
                                onChange={(e:any) => handleLocalUpdate({ ...localData!, systemSettings: { ...localData!.systemSettings, setupPin: e.target.value } })} 
                                placeholder="####"
                            />
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-[10px] text-orange-800 font-bold uppercase leading-relaxed">
                                This PIN is required when provisioning new tablets in-store. Keep it secure.
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Backup & Tools */}
                  <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 left-0 p-12 opacity-5"><HardDrive size={160} /></div>
                       <div className="relative z-10">
                           <h3 className="text-xl font-black uppercase tracking-tight mb-10 flex items-center gap-3">
                               <Database className="text-blue-400" /> Data Maintenance Tools
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl group">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Download size={24}/></div>
                                    <h4 className="font-black text-sm uppercase mb-2">Export Backup</h4>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6">Generates a full JSZip archive of your inventory, branding, assets, and settings.</p>
                                    <button 
                                        onClick={async () => {
                                            if(!localData) return;
                                            setExportProcessing(true);
                                            try { await downloadZip(localData); } catch(e) { alert("Export error"); }
                                            finally { setExportProcessing(false); }
                                        }}
                                        disabled={exportProcessing}
                                        className="w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {exportProcessing ? <Loader2 size={16} className="animate-spin" /> : <SaveAll size={16}/>}
                                        Full System ZIP
                                    </button>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl group">
                                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload size={24}/></div>
                                    <h4 className="font-black text-sm uppercase mb-2">Inventory Import</h4>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6">Mass-upload new Brands and Products via ZIP. Cloud storage will be used for assets.</p>
                                    <label className={`w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer ${importProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {importProcessing ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16}/>}
                                        {importProcessing ? 'Importing...' : 'Select ZIP Bundle'}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept=".zip" 
                                            disabled={importProcessing}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if(file) {
                                                    setImportProcessing(true);
                                                    try {
                                                        const brands = await importZip(file, setImportProgress);
                                                        const userConfirmed = confirm(`Parsed ${brands.length} Brands with ${brands.reduce((acc, b) => acc + b.categories.reduce((cAcc, cat) => cAcc + cat.products.length, 0), 0)} Products.\n\nMerge with existing inventory?`);
                                                        if(userConfirmed) {
                                                            handleLocalUpdate({ ...localData!, brands: [...localData!.brands, ...brands] });
                                                            alert("Inventory successfully updated.");
                                                        }
                                                    } catch(err) {
                                                        alert("Import failed. Ensure ZIP follows correct structure.");
                                                    } finally {
                                                        setImportProcessing(false);
                                                        setImportProgress('');
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                    {importProcessing && <div className="mt-4 text-[9px] font-bold text-purple-400 uppercase text-center animate-pulse">{importProgress || 'Parsing Archive...'}</div>}
                                </div>

                                <div className="bg-red-900/20 border border-red-500/20 p-6 rounded-3xl group">
                                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><RotateCcw size={24}/></div>
                                    <h4 className="font-black text-sm text-red-400 uppercase mb-2">Factory Reset</h4>
                                    <p className="text-[10px] text-red-300/40 font-medium leading-relaxed mb-6">Destructive action. Wipes all data and restores the original system demo content.</p>
                                    <button 
                                        onClick={async () => {
                                            if(confirm("CRITICAL WARNING: This will permanently delete your entire store configuration. Continue?") && confirm("Final Confirmation: Erase everything?")) {
                                                const newData = await resetStoreData();
                                                onUpdateData(newData);
                                                window.location.reload();
                                            }
                                        }}
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg active:scale-95 shadow-red-900/20"
                                    ><Power size={16}/> Wipe Database</button>
                                </div>
                           </div>
                       </div>
                  </div>

                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200">
                       <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-100">
                           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                               <Info className="text-blue-600" /> About Us Content
                           </h3>
                      </div>
                      <div className="space-y-6">
                           <InputField label="About Page Headline" val={localData?.about?.title} onChange={(e:any) => handleLocalUpdate({...localData!, about: { ...localData!.about, title: e.target.value }})} />
                           <InputField label="Corporate Story / Narrative" isArea val={localData?.about?.text} onChange={(e:any) => handleLocalUpdate({...localData!, about: { ...localData!.about, text: e.target.value }})} />
                           <FileUpload label="Voice Guide / Background Audio" accept="audio/*" icon={<Music/>} currentUrl={localData?.about?.audioUrl} onUpload={(url: any) => handleLocalUpdate({...localData!, about: { ...localData!.about, audioUrl: url }})} />
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'guide' && (
              <SystemDocumentation />
          )}

        </div>
      </main>

      {/* GLOBAL OVERLAYS / MODALS */}
      {editingProduct && (
          <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-0 md:p-12 animate-fade-in backdrop-blur-md">
              <div className="w-full h-full max-w-6xl overflow-hidden shadow-2xl relative">
                  <ProductEditor 
                    product={editingProduct} 
                    onSave={(updated) => {
                        let updatedBrands = localData!.brands.map(b => {
                            if (b.id === selectedBrand!.id) {
                                return {
                                    ...b,
                                    categories: b.categories.map(c => {
                                        if (c.id === selectedCategory!.id) {
                                            const exists = c.products.find(p => p.id === updated.id);
                                            return {
                                                ...c,
                                                products: exists ? c.products.map(p => p.id === updated.id ? updated : p) : [...c.products, updated]
                                            };
                                        }
                                        return c;
                                    })
                                };
                            }
                            return b;
                        });
                        handleLocalUpdate({ ...localData!, brands: updatedBrands });
                        setEditingProduct(null);
                    }}
                    onCancel={() => setEditingProduct(null)} 
                  />
              </div>
          </div>
      )}

      {movingProduct && selectedBrand && selectedCategory && (
          <MoveProductModal 
            product={movingProduct} 
            allBrands={localData?.brands || []} 
            currentBrandId={selectedBrand.id} 
            currentCategoryId={selectedCategory.id} 
            onClose={() => setMovingProduct(null)}
            onMove={handleMoveProduct}
          />
      )}

      {editingTVModel && selectedTVBrand && (
          <TVModelEditor 
              model={editingTVModel} 
              onSave={(updated) => {
                  const updatedBrands = localData!.tv!.brands.map(b => {
                      if (b.id === selectedTVBrand.id) {
                          const exists = b.models.find(m => m.id === updated.id);
                          return {
                              ...b,
                              models: exists ? b.models.map(m => m.id === updated.id ? updated : m) : [...b.models, updated]
                          };
                      }
                      return b;
                  });
                  handleLocalUpdate({ ...localData!, tv: { brands: updatedBrands } });
                  setEditingTVModel(null);
              }}
              onClose={() => setEditingTVModel(null)}
          />
      )}

      {editingKiosk && (
          <KioskEditorModal 
            kiosk={editingKiosk} 
            onSave={(updated) => {
                updateFleetMember(updated);
                setEditingKiosk(null);
            }} 
            onClose={() => setEditingKiosk(null)} 
          />
      )}
    </div>
  );
};

export default AdminDashboard;