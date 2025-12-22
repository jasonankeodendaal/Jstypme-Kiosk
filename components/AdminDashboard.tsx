
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, FileSpreadsheet, ArrowRight
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
        { id: 'pricelists', label: 'Pricelist Engine', icon: <Table size={16}/> },
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
                @keyframes slide-right {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .data-scan {
                    animation: slide-right 2.5s infinite linear;
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

                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8">
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <HardDrive size={40} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div>
                                        <div className="text-blue-400 text-[10px] font-mono">IndexedDB / Cache</div>
                                    </div>
                                </div>
                                <div className="flex-1 h-24 relative mx-4 flex items-center">
                                    <svg className="w-full h-12 overflow-visible">
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
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
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><RefreshCw size={18} className="text-green-600"/> Synchronization Logic</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    The system maintains a background connection to Supabase to keep data fresh without interrupting the user.
                                </p>
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
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8 animate-fade-in">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div>
                            </div>
                            <div className="absolute top-24 bottom-20 w-0.5 bg-slate-300"></div>
                            <div className="relative z-10 flex gap-4 mb-8">
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category</div>
                                </div>
                            </div>
                            <div className="relative z-10 flex gap-2">
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/>
                                    <div className="text-[10px] font-bold">Product</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Table className="text-green-600" size={32} /> Pricelist Engine
                            </h2>
                            <p className="text-slate-500 font-medium">Automated Ingestion, Normalization, and Multi-Channel Distribution.</p>
                        </div>

                        {/* Animated Processing Visualization */}
                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                             
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 py-8">
                                {/* Step 1: Input */}
                                <div className="flex flex-col items-center gap-3 group">
                                    <div className="w-20 h-20 bg-white/5 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-green-500/10 data-scan"></div>
                                        <FileSpreadsheet size={32} className="text-green-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">XLSX Import</span>
                                </div>

                                {/* Flow 1 */}
                                <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative mx-4">
                                    <div className="absolute inset-0 bg-blue-500 data-packet"></div>
                                </div>

                                {/* Step 2: Logic */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-float-small">
                                        <RefreshCw size={32} className="text-white animate-spin-slow" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Normalization</span>
                                </div>

                                {/* Flow 2 */}
                                <div className="hidden md:block flex-1 h-1 bg-white/10 relative mx-4">
                                    <div className="absolute inset-0 bg-purple-500 data-packet" style={{animationDelay: '1s'}}></div>
                                </div>

                                {/* Step 3: Distribution */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 bg-white/5 rounded-2xl border-2 border-purple-500/30 flex items-center justify-center">
                                        <div className="grid grid-cols-2 gap-1 scale-75">
                                            <FileText size={20} className="text-red-400" />
                                            <Smartphone size={20} className="text-purple-400" />
                                            <Tv size={20} className="text-purple-400" />
                                            <Globe size={20} className="text-blue-400" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Multi-Channel</span>
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Sparkles size={18} className="text-orange-500"/> Normalization Logic</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    The engine automatically sanitizes manual entries to ensure professional retail pricing standards.
                                </p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold uppercase">Rounding:</span>
                                        <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border">Math.ceil(p / 10) * 10</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold uppercase">Formatting:</span>
                                        <span className="font-mono text-green-600 bg-white px-2 py-0.5 rounded border">"R " + num.toLocaleString()</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Share2 size={18} className="text-purple-600"/> Distribution Pipeline</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Once processed, pricelists are deployed via three parallel channels:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex gap-3 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                                        <span><strong>Fleet Sync:</strong> Realtime push to all active kiosks via Postgres CDC.</span>
                                    </li>
                                    <li className="flex gap-3 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                                        <span><strong>PDF Engine:</strong> Vector-perfect A4 documents generated via jsPDF.</span>
                                    </li>
                                    <li className="flex gap-3 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                                        <span><strong>Asset Export:</strong> Standardized XLSX generation for external vendors.</span>
                                    </li>
                                </ul>
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
    zip.file("store_config_full.json", JSON.stringify(storeData, null, 2));
    
    if (storeData.fleet && storeData.fleet.length > 0) {
        const csvHeader = "ID,Name,Type,Status,LastSeen,IP,Zone,Version\n";
        const csvRows = storeData.fleet.map(k => 
            `"${k.id}","${k.name}","${k.deviceType}","${k.status}","${k.last_seen}","${k.ipAddress}","${k.assignedZone || ''}","${k.version}"`
        ).join("\n");
        zip.file("_System_Backup/Fleet/fleet_registry.csv", csvHeader + csvRows);
    }

    if (storeData.archive) {
        zip.file("_System_Backup/History/archive_data.json", JSON.stringify(storeData.archive, null, 2));
    }
    if (storeData.systemSettings) {
        zip.file("_System_Backup/Settings/system_settings.json", JSON.stringify(storeData.systemSettings, null, 2));
    }
    const safeAdmins = storeData.admins.map(a => ({ ...a, pin: "****" }));
    zip.file("_System_Backup/Settings/admin_users.json", JSON.stringify(safeAdmins, null, 2));

    // --- 2. INVENTORY ---
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
                    const metadata = { ...product, originalImageUrl: product.imageUrl };
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
                             if (m.pdfUrl) await fetchAssetAndAddToZip(prodFolder, m.pdfUrl, m.title || `manual_${i}`);
                             if (m.thumbnailUrl) await fetchAssetAndAddToZip(prodFolder, m.thumbnailUrl, `manual_thumb_${i}`);
                         }
                    }
                }
            }
        }
    }

    const mktFolder = zip.folder("_System_Backup/Marketing");
    if (mktFolder) {
        if (storeData.hero.backgroundImageUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.backgroundImageUrl, "hero_background");
        if (storeData.hero.logoUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.logoUrl, "hero_logo");
        const adsFolder = mktFolder.folder("Ads");
        if (adsFolder && storeData.ads) {
            for (const zone of ['homeBottomLeft', 'homeBottomRight', 'homeSideVertical', 'homeSideLeftVertical', 'screensaver']) {
                const zoneFolder = adsFolder.folder(zone);
                const ads = (storeData.ads as any)[zone] || [];
                for(let i=0; i<ads.length; i++) await fetchAssetAndAddToZip(zoneFolder, ads[i].url, `ad_${i}`);
            }
        }
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
                        if (model.videoUrls) {
                            for(let i=0; i<model.videoUrls.length; i++) await fetchAssetAndAddToZip(modelFolder, model.videoUrls[i], `video_${i}`);
                        }
                    }
                }
            }
        }
    }

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

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !pin.trim()) { setError('Please enter both Name and PIN.'); return; }
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

const FileUpload = ({ currentUrl, onUpload, label, accept = "image/*", icon = <ImageIcon />, allowMultiple = false }: any) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true); setUploadProgress(10); 
      const files = Array.from(e.target.files) as File[];
      let fileType = files[0].type.startsWith('video') ? 'video' : files[0].type === 'application/pdf' ? 'pdf' : files[0].type.startsWith('audio') ? 'audio' : 'image';
      const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(file); });
      const uploadSingle = async (file: File) => { const localBase64 = await readFileAsBase64(file); try { const url = await uploadFileToStorage(file); return { url, base64: localBase64 }; } catch (e) { return { url: localBase64, base64: localBase64 }; } };
      try {
          if (allowMultiple) {
              const results: string[] = []; const base64s: string[] = [];
              for(let i=0; i<files.length; i++) { const res = await uploadSingle(files[i]); results.push(res.url); base64s.push(res.base64); setUploadProgress(((i+1)/files.length)*100); }
              onUpload(results, fileType, base64s);
          } else { const res = await uploadSingle(files[0]); setUploadProgress(100); onUpload(res.url, fileType, res.base64); }
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
           {isProcessing ? <Loader2 className="animate-spin text-blue-500" /> : currentUrl && !allowMultiple ? (accept.includes('video') ? <Video className="text-blue-500" size={16} /> : accept.includes('pdf') ? <FileText className="text-red-500" size={16} /> : accept.includes('audio') ? <div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div> : <img src={currentUrl} className="w-full h-full object-contain" />) : React.cloneElement(icon, { size: 16 })}
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
    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => { handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }]); };
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => { handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c)); };
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
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> : <BookOpen size={32} className="text-slate-300" />}
                            {cat.pdfUrl && <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            {cat.type === 'catalogue' || brandId ? (
                                <div><label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label><input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" /></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2"><div><label className="text-[8px] font-bold text-slate-400 uppercase">Start</label><input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div><div><label className="text-[8px] font-bold text-slate-400 uppercase">End</label><input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div></div>
                            )}
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2"><FileUpload label="Thumbnail" accept="image/*" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} /><FileUpload label="Doc (PDF)" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} /></div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2"><button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete</button></div>
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
  const addItem = () => { setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '' }]); };
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => { setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item)); };
  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value || value.trim() === '') return;
    const numericPart = value.replace(/[^0-9]/g, '');
    if (!numericPart) { if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`); return; }
    let num = parseInt(numericPart);
    if (num % 10 !== 0) num = Math.ceil(num / 10) * 10;
    updateItem(id, field, `R ${num.toLocaleString()}`);
  };
  const removeItem = (id: string) => { setItems(items.filter(item => item.id !== id)); };

  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsImporting(true);
    try {
        const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) { alert("Empty file."); return; }
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        if (validRows.length === 0) { alert("No data rows."); return; }
        const firstRow = validRows[0].map(c => String(c).toLowerCase());
        const hasHeader = firstRow.some(c => c.includes('sku') || c.includes('code') || c.includes('desc') || c.includes('price'));
        const dataRows = hasHeader ? validRows.slice(1) : validRows;
        
        const newItems: PricelistItem[] = dataRows.map(row => {
            const formatImported = (val: string) => { 
                if (!val || val.trim() === '') return ''; 
                const numeric = val.replace(/[^0-9]/g, ''); 
                if (!numeric) return val; 
                let n = parseInt(numeric); 
                if (n % 10 !== 0) n = Math.ceil(n / 10) * 10; 
                return `R ${n.toLocaleString()}`; 
            };
            return { 
                id: generateId('imp'), 
                sku: String(row[0] || '').trim().toUpperCase(), 
                description: String(row[1] || '').trim(), 
                normalPrice: formatImported(String(row[2] || '').trim()), 
                promoPrice: row[3] ? formatImported(String(row[3]).trim()) : '' 
            };
        });

        if (newItems.length > 0) {
            if (items.length === 0) {
                setItems(newItems);
            } else {
                if (confirm(`Import successful! ${newItems.length} items found.\n\nClick OK to REPLACE ALL existing items.\nClick CANCEL to APPEND these items to the current list.`)) {
                    setItems(newItems);
                } else {
                    setItems([...items, ...newItems]);
                }
            }
        }
    } catch (err) { alert("Import error."); } finally { setIsImporting(false); e.target.value = ''; }
  };

  const handleSpreadsheetExport = () => {
    const ws = XLSX.utils.json_to_sheet(items.map(i => ({
        SKU: i.sku,
        Description: i.description,
        'Normal Price': i.normalPrice,
        'Promo Price': i.promoPrice
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pricelist");
    XLSX.writeFile(wb, `${pricelist.title}_${pricelist.month}_${pricelist.year}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <div>
            <h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2"><Table className="text-blue-600" size={24} /> Pricelist Builder</h3>
            <p className="text-xs text-slate-500 font-bold uppercase">{pricelist.title} ({pricelist.month} {pricelist.year})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSpreadsheetExport} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> Export XLSX
            </button>
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import XLSX/CSV
              <input type="file" className="hidden" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} />
            </label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Normal Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Promo Price</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU-123" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Product details..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save Pricelist Table</button>
        </div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: { pricelists: Pricelist[], pricelistBrands: PricelistBrand[], onSavePricelists: (p: Pricelist[]) => void, onSaveBrands: (b: PricelistBrand[]) => void, onDeletePricelist: (id: string) => void }) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    useEffect(() => { if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null); }, [sortedBrands]);
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const sortedLists = [...filteredLists].sort((a, b) => { const yearA = parseInt(a.year) || 0; const yearB = parseInt(b.year) || 0; if (yearA !== yearB) return yearB - yearA; return months.indexOf(b.month) - months.indexOf(a.month); });
    const addBrand = () => { const name = prompt("Enter Brand Name:"); if (!name) return; const newBrand = { id: generateId('plb'), name, logoUrl: '' }; onSaveBrands([...pricelistBrands, newBrand]); setSelectedBrand(newBrand); };
    const updateBrand = (id: string, updates: Partial<PricelistBrand>) => { const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b); onSaveBrands(updatedBrands); if (selectedBrand?.id === id) setSelectedBrand({ ...selectedBrand, ...updates }); };
    const deleteBrand = (id: string) => { if (confirm("Delete brand?")) onSaveBrands(pricelistBrands.filter(b => b.id !== id)); };
    const addPricelist = () => { if (!selectedBrand) return; onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: new Date().getFullYear().toString(), dateAdded: new Date().toISOString() }]); };
    const updatePricelist = (id: string, updates: Partial<Pricelist>) => onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    const handleDeletePricelist = (id: string) => { if(confirm("Archive pricelist?")) onDeletePricelist(id); };
    const isNewlyUpdated = (dateStr?: string) => { if (!dateStr) return false; const diff = Math.abs(new Date().getTime() - new Date(dateStr).getTime()); return Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 30; };
    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0"><div><h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2></div><button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button></div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(brand => (<div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}><div className="flex items-center gap-2 md:gap-3"><div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>}</div><div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div><div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div></div>{selectedBrand?.id === brand.id && (<div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}><input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Brand Name" /><FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url })} /><button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }} className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete Brand</button></div>)}</div>))}</div>
             </div>
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0"><h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate mr-2 max-w-[60%]">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"><Plus size={12} /> Add <span className="hidden md:inline">Pricelist</span></button></div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 content-start pb-10">{sortedLists.map((item) => { const recent = isNewlyUpdated(item.dateAdded); return (<div key={item.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col p-3 md:p-4 gap-2 md:gap-3 h-fit relative group transition-all ${recent ? 'bg-yellow-50 border-yellow-300 ring-1 ring-yellow-200' : 'bg-white border-slate-200'}`}>{recent && (<div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse z-10"><Sparkles size={10} /> NEW</div>)}<div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value, dateAdded: new Date().toISOString() })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs md:text-sm bg-transparent" placeholder="e.g. Retail Price List" /></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label><select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label><input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200" /></div></div><div className="bg-white/40 p-2 rounded-lg border border-slate-100"><label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Mode</label><div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-md border border-slate-200"><button onClick={() => updatePricelist(item.id, { type: 'pdf', dateAdded: new Date().toISOString() })} className={`py-1 text-[9px] font-black uppercase rounded flex items-center justify-center gap-1 transition-all ${item.type !== 'manual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}><FileText size={10}/> PDF</button><button onClick={() => updatePricelist(item.id, { type: 'manual', dateAdded: new Date().toISOString() })} className={`py-1 text-[9px] font-black uppercase rounded flex items-center justify-center gap-1 transition-all ${item.type === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}><List size={10}/> Manual</button></div></div>{item.type === 'manual' ? (<div className="mt-1 space-y-2"><button onClick={() => setEditingManualList(item)} className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"><Edit2 size={12}/> {item.items?.length || 0} Items - Open Builder</button><FileUpload label="Thumb" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() })} /></div>) : (<div className="mt-1 md:mt-2 grid grid-cols-2 gap-2"><FileUpload label="Thumb" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() })} /><FileUpload label="PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url, dateAdded: new Date().toISOString() })} /></div>)}<button onClick={() => handleDeletePricelist(item.id)} className="mt-auto pt-2 md:pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button></div>)})}</div>
             </div>
             {editingManualList && (<ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl })} onClose={() => setEditingManualList(null)} />)}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ 
      ...product, 
      dimensions: Array.isArray(product.dimensions) ? product.dimensions : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []), 
      videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), 
      manuals: product.manuals || [], 
      dateAdded: product.dateAdded || new Date().toISOString(),
      boxContents: product.boxContents || [],
      specs: product.specs || {}
    });
    
    const [newFeature, setNewFeature] = useState(''); 
    const [newBoxItem, setNewBoxItem] = useState(''); 
    const [newSpecKey, setNewSpecKey] = useState(''); 
    const [newSpecValue, setNewSpecValue] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');

    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };
    const removeSpec = (key: string) => { const newSpecs = { ...draft.specs }; delete newSpecs[key]; setDraft({ ...draft, specs: newSpecs }); };
    
    const addDimensionSet = () => setDraft({ ...draft, dimensions: [...draft.dimensions, { label: "New Set", width: "", height: "", depth: "", weight: "" }] });
    const updateDimension = (index: number, field: keyof DimensionSet, value: string) => { const newDims = [...draft.dimensions]; newDims[index] = { ...newDims[index], [field]: value }; setDraft({ ...draft, dimensions: newDims }); };
    const removeDimension = (index: number) => setDraft({ ...draft, dimensions: draft.dimensions.filter((_, i) => i !== index) });
    
    const addManual = () => setDraft({ ...draft, manuals: [...(draft.manuals || []), { id: generateId('man'), title: "New Manual", images: [], pdfUrl: '', thumbnailUrl: '' }] });
    const removeManual = (id: string) => setDraft({ ...draft, manuals: (draft.manuals || []).filter(m => m.id !== id) });
    const updateManual = (id: string, updates: Partial<Manual>) => setDraft({ ...draft, manuals: (draft.manuals || []).map(m => m.id === id ? { ...m, ...updates } : m) });

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-6xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold uppercase tracking-wide">Product Forge: {draft.name || 'Unidentified Item'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-white p-2 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Column 1: Core Details */}
                    <div className="space-y-6">
                        <SectionHeader icon={<Info size={16}/>}>General Information</SectionHeader>
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. iPhone 15 Pro Max" />
                        <InputField label="SKU Code" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} placeholder="e.g. APL-IP15-PM-256" />
                        <InputField label="Marketing Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} placeholder="Compelling sales copy..." />
                        <InputField label="Warranty & Terms" isArea val={draft.terms || ''} onChange={(e: any) => setDraft({ ...draft, terms: e.target.value })} placeholder="Warranty details, T&Cs..." />

                        <SectionHeader icon={<Ruler size={16}/>}>Physical Dimensions</SectionHeader>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Measurement Sets</p>
                                <button onClick={addDimensionSet} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-md hover:bg-blue-500"><Plus size={14}/> Add Set</button>
                            </div>
                            {draft.dimensions.map((dim, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 relative shadow-sm">
                                    <button onClick={() => removeDimension(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                    <div className="mb-4">
                                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Label (e.g. Device, Box)</label>
                                        <input value={dim.label || ''} onChange={(e) => updateDimension(idx, 'label', e.target.value)} placeholder="Device" className="w-full text-xs font-black uppercase border-b-2 border-slate-100 focus:border-blue-500 outline-none pb-1" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <InputField label="Height" val={dim.height} onChange={(e:any) => updateDimension(idx, 'height', e.target.value)} placeholder="150mm" />
                                        <InputField label="Width" val={dim.width} onChange={(e:any) => updateDimension(idx, 'width', e.target.value)} placeholder="70mm" />
                                        <InputField label="Depth" val={dim.depth} onChange={(e:any) => updateDimension(idx, 'depth', e.target.value)} placeholder="8mm" />
                                        <InputField label="Weight" val={dim.weight} onChange={(e:any) => updateDimension(idx, 'weight', e.target.value)} placeholder="200g" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Media & Lists */}
                    <div className="space-y-6">
                        <SectionHeader icon={<ImageIcon size={16}/>}>Visual Assets</SectionHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileUpload label="Master Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Gallery Extension</label>
                                <FileUpload label="Append Multi" allowMultiple onUpload={(urls: any) => setDraft(prev => ({ ...prev, galleryUrls: [...(prev.galleryUrls || []), ...(Array.isArray(urls)?urls:[urls])] }))} />
                            </div>
                        </div>
                        {draft.galleryUrls && draft.galleryUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                {draft.galleryUrls.map((url, i) => (
                                    <div key={i} className="w-12 h-12 relative rounded border bg-white p-1">
                                        <img src={url} className="w-full h-full object-contain" />
                                        <button onClick={() => setDraft({ ...draft, galleryUrls: draft.galleryUrls!.filter((_, idx) => idx !== i) })} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm"><X size={8}/></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <SectionHeader icon={<Video size={16}/>}>Video Resources</SectionHeader>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="Paste MP4 URL..." className="flex-1 p-3 bg-slate-50 border rounded-xl text-xs font-mono" />
                                <button onClick={() => { if(newVideoUrl) { setDraft({...draft, videoUrls: [...(draft.videoUrls || []), newVideoUrl]}); setNewVideoUrl(''); } }} className="bg-blue-600 text-white p-3 rounded-xl"><Plus size={18}/></button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {(draft.videoUrls || []).map((url, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border rounded-lg text-[10px] font-mono group">
                                        <span className="truncate flex-1 pr-4">{url}</span>
                                        <button onClick={() => setDraft({ ...draft, videoUrls: draft.videoUrls!.filter((_, idx) => idx !== i) })} className="text-red-400 group-hover:text-red-600"><Trash2 size={12}/></button>
                                    </div>
                                ))}
                            </div>
                            <FileUpload label="Direct Upload" accept="video/*" onUpload={(url: any) => setDraft(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || []), url] }))} />
                        </div>

                        <SectionHeader icon={<Layers size={16}/>}>Technical Specs</SectionHeader>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex gap-2">
                                <input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} className="w-1/3 p-2 bg-white border rounded-lg text-xs font-bold uppercase" placeholder="Key (e.g. CPU)" />
                                <input value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} className="flex-1 p-2 bg-white border rounded-lg text-xs" placeholder="Value (e.g. M3 Max)" />
                                <button onClick={addSpec} className="p-2 bg-slate-900 text-white rounded-lg"><Plus size={16}/></button>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(draft.specs).map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-[11px] group">
                                        <div className="flex gap-2"><span className="font-black text-slate-400 uppercase">{k}:</span><span className="font-bold text-slate-800">{v}</span></div>
                                        <button onClick={() => removeSpec(k)} className="text-red-300 group-hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Full-Width Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <SectionHeader icon={<Check size={16}/>}>Feature Bulletpoints</SectionHeader>
                        <div className="flex gap-2 mb-2">
                            <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Key feature..." onKeyDown={(e) => e.key === 'Enter' && addFeature()} />
                            <button onClick={addFeature} className="p-3 bg-blue-600 text-white rounded-xl shadow-md"><Plus size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {draft.features.map((f, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 group">
                                    <span className="text-xs font-bold text-slate-700">{f}</span>
                                    <button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SectionHeader icon={<Package size={16}/>}>Box Contents</SectionHeader>
                        <div className="flex gap-2 mb-2">
                            <input value={newBoxItem} onChange={(e) => setNewBoxItem(e.target.value)} className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Item in box..." onKeyDown={(e) => e.key === 'Enter' && addBoxItem()} />
                            <button onClick={addBoxItem} className="p-3 bg-orange-500 text-white rounded-xl shadow-md"><Plus size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {(draft.boxContents || []).map((f, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 group">
                                    <span className="text-xs font-bold text-slate-700">{f}</span>
                                    <button onClick={() => setDraft({...draft, boxContents: draft.boxContents!.filter((_, ix) => ix !== i)})} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <SectionHeader icon={<BookOpen size={16}/>}>Product Documentation</SectionHeader>
                    <div className="flex justify-end"><button onClick={addManual} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Plus size={16}/> New Manual</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(draft.manuals || []).map(man => (
                            <div key={man.id} className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative shadow-sm">
                                <button onClick={() => removeManual(man.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                <input value={man.title} onChange={(e) => updateManual(man.id, { title: e.target.value })} className="font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none uppercase text-xs pb-1 pr-8" placeholder="Manual Name" />
                                <div className="grid grid-cols-2 gap-2">
                                    <FileUpload label="Thumbnail" currentUrl={man.thumbnailUrl} onUpload={(url: any) => updateManual(man.id, { thumbnailUrl: url })} />
                                    <FileUpload label="PDF / Doc" accept="application/pdf" icon={<FileText/>} currentUrl={man.pdfUrl} onUpload={(url: any) => updateManual(man.id, { pdfUrl: url })} />
                                </div>
                                <FileUpload label="Gallery Pages (Multi)" allowMultiple onUpload={(urls: any) => updateManual(man.id, { images: [...(man.images || []), ...(Array.isArray(urls)?urls:[urls])] })} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end items-center gap-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="mr-auto text-[10px] font-mono text-slate-400 uppercase tracking-widest">Last Modified: {new Date().toLocaleDateString()}</div>
                <button onClick={onCancel} className="px-8 py-4 font-black text-slate-500 uppercase text-xs tracking-widest transition-colors hover:text-slate-800">Abort Changes</button>
                <button onClick={() => onSave(draft)} className="px-10 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95">Deploy to Fleet</button>
            </div>
        </div>
    );
};

const SectionHeader = ({ children, icon }: any) => (
    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-4">
        <div className="text-blue-600">{icon}</div>
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{children}</h4>
    </div>
);

const KioskEditorModal = ({ kiosk, onSave, onClose }: { kiosk: KioskRegistry, onSave: (k: KioskRegistry) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-black text-slate-900 uppercase">Edit Device</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div>
                <div className="p-6 space-y-4"><InputField label="Device Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} /><InputField label="Zone" val={draft.assignedZone || ''} onChange={(e:any) => setDraft({...draft, assignedZone: e.target.value})} /></div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save</button></div>
            </div>
        </div>
    );
};

const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: { product: Product, allBrands: Brand[], currentBrandId: string, currentCategoryId: string, onClose: () => void, onMove: (p: Product, b: string, c: string) => void }) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);
    const targetBrand = allBrands.find(b => b.id === targetBrandId);
    const targetCategories = targetBrand?.categories || [];
    useEffect(() => { if (targetBrand && !targetBrand.categories.find(c => c.id === targetCategoryId)) { if (targetBrand.categories.length > 0) setTargetCategoryId(targetBrand.categories[0].id); } }, [targetBrandId]);
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"><div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50"><h3>Move Product</h3><button onClick={onClose}><X size={20}/></button></div><div className="p-6 space-y-4"><div><label className="text-[10px] font-black uppercase">Brand</label><select value={targetBrandId} onChange={(e) => setTargetBrandId(e.target.value)} className="w-full p-2 border rounded">{allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div><label className="text-[10px] font-black uppercase">Category</label><select value={targetCategoryId} onChange={(e) => setTargetCategoryId(e.target.value)} className="w-full p-2 border rounded">{targetCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div><div className="p-4 border-t flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-xs">Cancel</button><button onClick={() => onMove(product, targetBrandId, targetCategoryId)} className="bg-blue-600 text-white px-6 py-2 rounded text-xs">Move</button></div></div></div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: { model: TVModel, onSave: (m: TVModel) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"><div className="p-4 border-b bg-slate-50 flex justify-between"><h3>Edit TV Model</h3><button onClick={onClose}><X size={20}/></button></div><div className="flex-1 overflow-y-auto p-6 space-y-6"><InputField label="Name" val={draft.name} onChange={(e:any)=>setDraft({...draft, name: e.target.value})} /><FileUpload label="Videos" accept="video/*" allowMultiple onUpload={(urls:any)=>setDraft(prev=>({...prev, videoUrls: [...prev.videoUrls, ...(Array.isArray(urls)?urls:[urls])]}))} /></div><div className="p-4 border-t flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2">Cancel</button><button onClick={()=>onSave(draft)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button></div></div></div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingId, setEditingId] = useState<string | null>(null); const [newName, setNewName] = useState(''); const [newPin, setNewPin] = useState('');
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true });
    const resetForm = () => { setEditingId(null); setNewName(''); setNewPin(''); setNewPermissions({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true }); };
    const handleAddOrUpdate = () => { if (!newName || !newPin) return alert("Required"); let updatedList = [...admins]; if (editingId) updatedList = updatedList.map(a => a.id === editingId ? { ...a, name: newName, pin: newPin, permissions: newPermissions } : a); else updatedList.push({ id: generateId('adm'), name: newName, pin: newPin, isSuperAdmin: false, permissions: newPermissions }); onUpdate(updatedList); resetForm(); };
    const startEdit = (admin: AdminUser) => { setEditingId(admin.id); setNewName(admin.name); setNewPin(admin.pin); setNewPermissions(admin.permissions); };
    return (
        <div className="space-y-4"><div className="bg-slate-50 p-4 rounded-xl border"><InputField label="Name" val={newName} onChange={(e:any)=>setNewName(e.target.value)} /><InputField label="PIN" val={newPin} onChange={(e:any)=>setNewPin(e.target.value)} /><button onClick={handleAddOrUpdate} className="w-full py-2 bg-slate-900 text-white rounded mt-4">Save Admin</button></div><div className="space-y-2">{admins.map(a=>(<div key={a.id} className="p-3 bg-white rounded border flex justify-between items-center"><div><span className="font-bold">{a.name}</span><span className="text-[10px] ml-2 font-mono">({a.pin})</span></div><button onClick={()=>startEdit(a)}><Edit2 size={14}/></button></div>))}</div></div>
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
  
  const availableTabs = [{ id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'tv', label: 'TV', icon: Tv }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'System Guide', icon: BookOpen }].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);
  
  useEffect(() => { if (currentUser && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) setActiveTab(availableTabs[0].id); }, [currentUser]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);
  useEffect(() => { const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', handleBeforeUnload); return () => window.removeEventListener('beforeunload', handleBeforeUnload); }, [hasUnsavedChanges]);
  
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

  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };
  
  const addToArchive = (type: 'product' | 'pricelist' | 'tv_model' | 'device' | 'other', name: string, data: any) => { 
    if (!localData) return; 
    const now = new Date().toISOString(); 
    const newItem = { id: generateId('arch'), type, name, data, deletedAt: now }; 
    const currentArchive = localData.archive || { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} }; 
    return { ...currentArchive, deletedItems: [newItem, ...(currentArchive.deletedItems || [])] }; 
  };

  const handleDeleteProduct = (product: Product) => {
    if (!confirm(`Delete ${product.name}? This will move it to archive.`)) return;
    if (!selectedCategory || !selectedBrand || !localData) return;
    
    const updatedCat = { ...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id) };
    const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === selectedCategory.id ? updatedCat : c) };
    const newBrands = localData.brands.map(b => b.id === selectedBrand.id ? updatedBrand : b);
    
    const newArchive = addToArchive('product', product.name, product);
    handleLocalUpdate({ ...localData, brands: newBrands, archive: newArchive });
  };

  const handleMoveProduct = (product: Product, targetBrandId: string, targetCategoryId: string) => { 
    if (!localData || !selectedBrand || !selectedCategory) return; 
    const updatedSourceCat = { ...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id) }; 
    let newBrands = localData.brands.map(b => { 
        if (b.id === selectedBrand.id) return { ...b, categories: b.categories.map(c => c.id === selectedCategory.id ? updatedSourceCat : c) }; 
        return b; 
    }); 
    newBrands = newBrands.map(b => { 
        if (b.id === targetBrandId) return { ...b, categories: b.categories.map(c => c.id === targetCategoryId ? { ...c, products: [...c.products, product] } : c) }; 
        return b; 
    }); 
    handleLocalUpdate({ ...localData, brands: newBrands }); 
    setMovingProduct(null); 
  };

  const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip(); const loadedZip = await zip.loadAsync(file); const newBrands: Record<string, Brand> = {};
    const getCleanPath = (filename: string) => filename.replace(/\\/g, '/');
    const validFiles = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir && !path.includes('__MACOSX') && !path.includes('.DS_Store'));
    const getMimeType = (filename: string) => { const ext = filename.split('.').pop()?.toLowerCase(); if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'; if (ext === 'png') return 'image/png'; if (ext === 'mp4') return 'video/mp4'; if (ext === 'pdf') return 'application/pdf'; return 'application/octet-stream'; };
    const processAsset = async (zipObj: any, filename: string): Promise<string> => { const blob = await zipObj.async("blob"); if (supabase) { try { const mimeType = getMimeType(filename); const fileToUpload = new File([blob], `import_${Date.now()}_${filename.replace(/[^a-z0-9._-]/gi, '_')}`, { type: mimeType }); return await uploadFileToStorage(fileToUpload); } catch (e) {} } return new Promise(resolve => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(blob); }); };
    let processedCount = 0;
    for (const rawPath of Object.keys(loadedZip.files)) {
        let path = getCleanPath(rawPath); if (loadedZip.files[rawPath].dir || path.includes('__MACOSX') || path.startsWith('_System_Backup/')) continue;
        const parts = path.split('/').filter(p => p.trim() !== ''); if (parts.length < 2) continue;
        processedCount++; if (onProgress && processedCount % 5 === 0) onProgress(`Processing ${processedCount}/${validFiles.length}...`);
        const brandName = parts[0]; if (!newBrands[brandName]) newBrands[brandName] = { id: generateId('brand'), name: brandName, categories: [] };
        if (parts.length === 2) { const f = parts[1].toLowerCase(); if (f.includes('logo')) newBrands[brandName].logoUrl = await processAsset(loadedZip.files[rawPath], parts[1]); continue; }
        if (parts.length < 4) continue;
        const catName = parts[1], prodName = parts[2], fileName = parts.slice(3).join('/');
        let cat = newBrands[brandName].categories.find(c => c.name === catName); if (!cat) { cat = { id: generateId('cat'), name: catName, icon: 'Box', products: [] }; newBrands[brandName].categories.push(cat); }
        let prod = cat.products.find(p => p.name === prodName); if (!prod) { prod = { id: generateId('prod'), name: prodName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '', galleryUrls: [], videoUrls: [], manuals: [], dateAdded: new Date().toISOString() }; cat.products.push(prod); }
        const lowerF = fileName.toLowerCase();
        if (fileName.endsWith('.json')) { try { const text = await loadedZip.files[rawPath].async("text"); const m = JSON.parse(text); if (m.name) prod.name = m.name; if (m.sku) prod.sku = m.sku; if (m.specs) prod.specs = m.specs; } catch(e) {} }
        else if (lowerF.endsWith('.jpg') || lowerF.endsWith('.png')) { const url = await processAsset(loadedZip.files[rawPath], fileName); if (lowerF.includes('cover')) prod.imageUrl = url; else prod.galleryUrls?.push(url); }
        else if (lowerF.endsWith('.mp4')) prod.videoUrls?.push(await processAsset(loadedZip.files[rawPath], fileName));
    }
    return Object.values(newBrands);
  };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;
  
  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div>
                 <div className="flex items-center gap-4">
                    <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                        <SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                    </button>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                        {isCloudConnected ? <Cloud size={14} /> : <HardDrive size={14} />}
                        <span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span>
                    </div>
                    <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button>
                    <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2"><LogOut size={16} /></button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'guide' && <SystemDocumentation />}
            
            {activeTab === 'inventory' && (!selectedBrand ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in">
                    {brands.map(brand => (
                        <div key={brand.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group">
                            <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 relative aspect-square">
                                {brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}
                            </div>
                            <div className="p-4 border-t border-slate-50">
                                <h3 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-tight truncate mb-3">{brand.name}</h3>
                                <button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase hover:bg-blue-600 transition-colors shadow-lg">Manage Brand</button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { const name = prompt("Brand Name?"); if(name) handleLocalUpdate({...localData, brands: [...localData.brands, {id: generateId('b'), name, categories: []}]}); }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all gap-2">
                        <Plus size={32} />
                        <span className="font-black uppercase text-xs">New Brand</span>
                    </button>
                </div>
            ) : !selectedCategory ? (
                <div className="animate-fade-in">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setSelectedBrand(null)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-900">{selectedBrand.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Product Category</p>
                        </div>
                        <button onClick={() => { const name = prompt("Category Name?"); if(name) { const newCat = {id: generateId('c'), name, products: [], icon: 'Box'}; handleLocalUpdate({...localData, brands: localData.brands.map(b => b.id === selectedBrand.id ? {...b, categories: [...b.categories, newCat]} : b)}); }}} className="ml-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2"><Plus size={16}/> New Category</button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {selectedBrand.categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat)} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all text-left flex flex-col items-center justify-center text-center gap-4 aspect-square">
                                <div className="p-4 bg-slate-50 text-slate-400 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100"><Box size={24} /></div>
                                <h3 className="font-black text-slate-900 uppercase text-xs md:text-sm truncate w-full">{cat.name}</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{cat.products.length} Items</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col animate-fade-in">
                    <div className="flex items-center gap-4 mb-8 shrink-0">
                        <button onClick={() => setSelectedCategory(null)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-900">{selectedCategory.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedBrand.name} Inventory</p>
                        </div>
                        <button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '', dateAdded: new Date().toISOString() })} className="ml-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-lg shadow-blue-900/20 hover:bg-blue-500"><Plus size={16}/> Add Product</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pb-40 pr-2">
                        {selectedCategory.products.map(product => (
                            <div key={product.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-2xl transition-all h-full">
                                <div className="aspect-square bg-white relative flex items-center justify-center p-6">
                                    {product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" /> : <Box size={40} className="text-slate-100" />}
                                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-6">
                                        <button onClick={() => setEditingProduct(product)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-500 shadow-xl"><Edit2 size={14}/> Edit Item</button>
                                        <button onClick={() => setMovingProduct(product)} className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-100 shadow-xl"><Move size={14}/> Relocate</button>
                                        <button onClick={() => handleDeleteProduct(product)} className="w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-colors"><Trash2 size={14}/> Delete</button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col border-t border-slate-50">
                                    <h4 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight line-clamp-2">{product.name}</h4>
                                    <div className="mt-auto flex justify-between items-center pt-2">
                                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{product.sku || 'No SKU'}</span>
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {activeTab === 'pricelists' && (<PricelistManager pricelists={localData.pricelists || []} pricelistBrands={localData.pricelistBrands || []} onSavePricelists={(p) => handleLocalUpdate({ ...localData, pricelists: p })} onSaveBrands={(b) => handleLocalUpdate({ ...localData, pricelistBrands: b })} onDeletePricelist={(id) => { const toDelete = localData.pricelists?.find(p => p.id === id); if (toDelete) { const newArchive = addToArchive('pricelist', toDelete.title, toDelete); handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id), archive: newArchive }); } }} />)}
            
            {activeTab === 'settings' && (<div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500 pointer-events-none"><Database size={120} /></div><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Database size={20} className="text-blue-500"/> System Data & Backup</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"><div className="space-y-4"><div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs"><strong>Export System Backup:</strong> Downloads full archive.</div><button onClick={async () => { setExportProcessing(true); try { await downloadZip(localData); } catch (e) { alert("Export Failed"); } finally { setExportProcessing(false); } }} disabled={exportProcessing} className={`w-full py-4 ${exportProcessing ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg`}>{exportProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exportProcessing ? 'Packaging...' : 'Download Full Backup (.zip)'}</button></div><div className="space-y-4"><div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs"><strong>Import Structure:</strong> Brand/Category/Product/</div><label className={`w-full py-4 ${importProcessing ? 'bg-slate-300 cursor-wait' : 'bg-slate-800 hover:bg-slate-900 cursor-pointer'} text-white rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg relative overflow-hidden`}>{importProcessing ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16} />}<span className="relative z-10">{importProcessing ? importProgress || 'Processing...' : 'Import Data from ZIP'}</span><input type="file" accept=".zip" className="hidden" disabled={importProcessing} onChange={async (e) => { if(e.target.files && e.target.files[0]) { setImportProcessing(true); try { const newBrands = await importZip(e.target.files[0], (msg) => setImportProgress(msg)); let mergedBrands = [...localData.brands]; newBrands.forEach(nb => { const ex = mergedBrands.findIndex(b => b.name === nb.name); if (ex > -1) { nb.categories.forEach(nc => { const excat = mergedBrands[ex].categories.findIndex(c => c.name === nc.name); if (excat > -1) { const exp = mergedBrands[ex].categories[excat].products; const unique = nc.products.filter(np => !exp.find(ep => ep.name === np.name)); mergedBrands[ex].categories[excat].products = [...exp, ...unique]; } else { mergedBrands[ex].categories.push(nc); } }); } else mergedBrands.push(nb); }); handleLocalUpdate({ ...localData, brands: mergedBrands }); alert(`Import Successful!`); } catch(err) { alert("Import Failed."); } finally { setImportProcessing(false); setImportProgress(''); } } }} /></label></div></div></div></div>)}
        </main>

        {editingProduct && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-4 md:p-8 flex items-center justify-center animate-fade-in">
                <ProductEditor 
                    product={editingProduct} 
                    onSave={(p) => { 
                        if (!selectedBrand || !selectedCategory) return; 
                        const isNew = !selectedCategory.products.find(x => x.id === p.id); 
                        const newProducts = isNew ? [...selectedCategory.products, p] : selectedCategory.products.map(x => x.id === p.id ? p : x); 
                        const updatedCat = { ...selectedCategory, products: newProducts }; 
                        const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }; 
                        handleLocalUpdate({ ...localData, brands: localData.brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }); 
                        setEditingProduct(null); 
                    }} 
                    onCancel={() => setEditingProduct(null)} 
                />
            </div>
        )}

        {movingProduct && selectedBrand && selectedCategory && (
            <MoveProductModal 
                product={movingProduct} 
                allBrands={localData.brands} 
                currentBrandId={selectedBrand.id} 
                currentCategoryId={selectedCategory.id} 
                onClose={() => setMovingProduct(null)} 
                onMove={handleMoveProduct} 
            />
        )}
        
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;
