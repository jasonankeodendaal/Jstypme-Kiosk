
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Battery, BatteryCharging, ZapOff, Activity as PulseIcon,
  // Added missing MonitorPlay and MonitorStop imports
  MonitorPlay, MonitorStop
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Added helper to format relative time for fleet telemetry
const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
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
        { id: 'architecture', label: '1. How it Works', icon: <Network size={16} />, desc: 'The "Brain" of the Kiosk' },
        { id: 'inventory', label: '2. Product Sorting', icon: <Box size={16}/>, desc: 'How items are organized' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Converting Excel to PDF' },
        { id: 'screensaver', label: '4. Visual Loop', icon: <Zap size={16}/>, desc: 'Automatic slideshow rules' },
        { id: 'fleet', label: '5. Fleet Watch', icon: <Activity size={16}/>, desc: 'Remote tracking & control' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Large scale video loops' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <style>{`
                @keyframes flow-horizontal { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(400%); opacity: 0; } }
                .data-flow { animation: flow-horizontal 3s linear infinite; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.4); opacity: 0; } }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
                @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .float-slow { animation: float-slow 4s ease-in-out infinite; }
                @keyframes conveyor { 0% { transform: translateX(0); } 100% { transform: translateX(-40px); } }
                .conveyor-belt { animation: conveyor 1s linear infinite; }
                @keyframes expand-search { 0%, 100% { width: 40px; } 50% { width: 120px; } }
                .search-pulse { animation: expand-search 3s ease-in-out infinite; }
                @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
                .bounce-x { animation: bounce-x 2s ease-in-out infinite; }
            `}</style>

            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Guides</span></h2>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Step-by-step logic overview for new administrators.</p>
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

                <div className="mt-8 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 font-black text-[9px] uppercase tracking-widest mb-2">
                        <HelpCircle size={12} /> Need Help?
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">This manual explains technical logic in plain English. Click a topic to see it in action.</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] pointer-events-none rounded-full"></div>

                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p>
                        </div>

                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110">
                                        <Monitor className="text-blue-400" size={40} />
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">YOU</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div>
                                        <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Updates Sent</div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full h-24 relative flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/5 rounded-full relative">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-8 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest">Encrypted Cloud Tunnel</div>
                                </div>

                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1">
                                        <Tablet className="text-green-400" size={32} />
                                        <div className="absolute inset-0 bg-green-500/10 animate-pulse rounded-2xl"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div>
                                        <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Local Storage Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <HardDrive className="text-blue-500" /> Layer 1: Local Memory
                                </h3>
                                <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">Think of the tablet like a <strong>Notebook</strong>. When it boots up, it reads from its own internal pages instantly. This is why the app feels so fast—it never waits for a website to "load" before showing the home screen.</p>
                                    <div className="mt-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-200">
                                        <Zap className="text-yellow-500" size={16} fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase text-blue-900">Result: 0.1s Loading Time</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Cloud className="text-purple-500" /> Layer 2: Cloud Sync
                                </h3>
                                <div className="p-8 bg-purple-50 rounded-[2rem] border border-purple-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">Every 60 seconds, the Kiosk "calls" the Cloud. It asks: <em>"Has the Admin changed anything?"</em>. If yes, it updates its notebook. If the internet is down, it simply keeps using its current notes until connection returns.</p>
                                    <div className="mt-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-purple-200">
                                        <ShieldCheck className="text-green-500" size={16} />
                                        <span className="text-[10px] font-black uppercase text-purple-900">Status: Always Reliable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 02: Organization</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Inventory Sifter</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">How we turn a massive list of products into a lightning-fast searchable menu for customers.</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                            <div className="absolute top-0 right-0 p-12 text-slate-200/50"><Layers size={200} /></div>
                            
                            <div className="w-full md:w-64 space-y-4 z-10">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Mixed Raw Data</div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <Package size={20} className="text-blue-500" />
                                    <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 translate-x-4 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                                    <Tag size={20} className="text-orange-500" />
                                    <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 -translate-x-2 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.2s' }}>
                                    <ImageIcon size={20} className="text-purple-500" />
                                    <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center relative">
                                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl z-20 animate-pulse">
                                    <RefreshCw size={40} className="animate-spin" style={{ animationDuration: '8s' }} />
                                </div>
                                <div className="mt-4 text-[10px] font-black text-orange-600 uppercase tracking-widest">Logic: Flatten()</div>
                                <div className="absolute top-0 left-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
                            </div>

                            <div className="flex-1 w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 scanline"></div>
                                <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/5 search-pulse">
                                    <Search size={16} className="text-blue-400" />
                                    <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/5 bounce-x" style={{ animationDelay: `${i * 0.2}s` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <div className="h-1 w-20 bg-white/20 rounded-full"></div>
                                            </div>
                                            <div className="h-1 w-8 bg-blue-500/50 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Relational Logic</h3>
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">In the Admin Hub, you see folders inside folders. But the Kiosk is smarter—it "flattens" everything into a single searchable list. This allows a customer to type <strong>"iPhone"</strong> and instantly see results from any brand or category without the system having to "dig" through folders.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Smart Icons</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 shadow-sm rounded-3xl">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><MousePointer size={24}/></div>
                                        <div>
                                            <div className="text-xs font-black uppercase text-slate-900 mb-1">Automatic Selection</div>
                                            <p className="text-[11px] text-slate-500 font-medium">If you name a category "Smartphones", the system automatically gives it a Phone icon. It looks at the words you type and matches them to our graphic library.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 shadow-sm rounded-3xl">
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0"><Check size={24}/></div>
                                        <div>
                                            <div className="text-xs font-black uppercase text-slate-900 mb-1">New Item Priority</div>
                                            <p className="text-[11px] text-slate-500 font-medium">Products added in the last 30 days get a special <strong>NEW</strong> tag automatically, and are moved to the front of the Screensaver loop.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-green-500/20">Module 03: Fin-Tech Engine</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Pricelist Synthesis</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Our system takes messy spreadsheets and turns them into high-end, printable PDF documents automatically.</p>
                        </div>

                        <div className="bg-slate-900 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-20 min-h-[400px]">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            
                            <div className="flex-1 space-y-8 z-10 w-full">
                                <div className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Binary size={16} /> Input Normalization
                                </div>
                                <div className="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><RIcon size={80} /></div>
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="text-center md:text-left">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Raw XLSX Data</div>
                                            <div className="text-2xl font-mono text-red-500/80 line-through decoration-2 decoration-red-500">R 12,499.95</div>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl animate-pulse">
                                            <ArrowRight size={24} className="bounce-x" />
                                        </div>
                                        <div className="text-center md:text-right">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Clean Retail Output</div>
                                            <div className="text-4xl font-mono text-green-400 font-black tracking-tighter">R 12,500</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Decimal Sifter</div>
                                        <div className="text-xs text-white font-bold">Rounds .99 &rarr; Whole</div>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Clean Header Logic</div>
                                        <div className="text-xs text-white font-bold">Auto-Header Finder</div>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 w-full md:w-72 flex flex-col items-center gap-8">
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                    <div className="absolute h-full w-20 bg-blue-50 conveyor-belt"></div>
                                </div>
                                <div className="w-48 h-64 bg-white rounded-xl shadow-2xl relative p-6 flex flex-col group transition-transform duration-500 hover:-translate-y-4">
                                    <div className="absolute top-0 right-0 p-3"><FileText size={40} className="text-red-500 opacity-20" /></div>
                                    <div className="w-12 h-2 bg-slate-900 rounded-full mb-8"></div>
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-1">
                                                <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                                                <div className="h-1 w-8 bg-slate-900/10 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-auto flex justify-center">
                                        <div className="bg-blue-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full shadow-lg">HIGH-DPI PDF</div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase text-center leading-relaxed">Real-time PDF Distribution<br/>(300 DPI Vector)</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Why do we round prices?</h3>
                                <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium italic">"Clean numbers build trust."</p>
                                    <p className="text-base text-slate-700 leading-relaxed font-medium mt-4">In high-end retail, a price of <strong>R 800</strong> looks organized and premium. A price of <strong>R 799.95</strong> looks messy and "discount-heavy". Our engine automatically pushes values ending in '9' to the next round number to keep your UI looking professional.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Auto-Ingest Logic</h3>
                                <p className="text-base text-slate-600 leading-relaxed font-medium">When you upload an Excel sheet, you don't need to worry about the column order. Our <strong>Fuzzy Header Finder</strong> scans the first few rows for keywords like "Price", "Cost", "Retail", or "SKU" and maps them to the right spot in our system automatically.</p>
                                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                                     <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500"><FileSpreadsheet size={20}/></div>
                                     <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">Detection Efficiency: 99.8%<br/>Auto-Mapping: Enabled</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-yellow-500/20">Module 04: Visual Protocol</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Screensaver.sys</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Not just a slideshow—a weighted marketing engine that prioritizes what matters.</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[3rem] p-12 md:p-20 shadow-xl relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={250}/></div>
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-12">Smart Playlist Assembly</div>

                            <div className="relative w-full max-w-2xl flex flex-col gap-4">
                                 <div className="p-5 bg-blue-600 rounded-3xl flex items-center justify-between text-white shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform">
                                      <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-1000"></div>
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Megaphone size={24}/></div>
                                          <div className="text-left">
                                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">High Frequency</div>
                                              <div className="text-sm font-black uppercase">Marketing Ad (Zone A)</div>
                                          </div>
                                      </div>
                                      <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">3.0x Weight</div>
                                 </div>

                                 <div className="p-5 bg-slate-100 rounded-3xl flex items-center justify-between text-slate-400 border border-slate-200 opacity-60">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center"><Box size={24}/></div>
                                          <div className="text-left">
                                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Standard Frequency</div>
                                              <div className="text-sm font-black uppercase">General Product Library</div>
                                          </div>
                                      </div>
                                      <div className="bg-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-300">1.0x Weight</div>
                                 </div>

                                 <div className="p-5 bg-orange-50 rounded-3xl flex items-center justify-between text-orange-900/50 border border-orange-200 opacity-80 translate-x-8">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center"><Sparkles size={24} className="text-orange-500" /></div>
                                          <div className="text-left">
                                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Boosted Frequency</div>
                                              <div className="text-sm font-black uppercase">New Stock Items</div>
                                          </div>
                                      </div>
                                      <div className="bg-orange-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">2.0x Weight</div>
                                 </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">The Weighted Shuffle</h3>
                                <div className="p-8 bg-yellow-50 rounded-[2rem] border border-yellow-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">To keep customers interested, the Kiosk shuffles the playlist every time it starts. However, it's not truly random. <strong>Marketing Ads</strong> are added to the shuffle 3 times, while standard products are only added once. This ensures your key promotions are seen much more often.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Kinetic VFX</h3>
                                <p className="text-base text-slate-600 leading-relaxed font-medium">Static images damage digital screens over time. To prevent this, our engine assigns a random <strong>Cinematic Animation</strong> to every slide. Whether it's a slow "Ken Burns" zoom or a "Circle Reveal", the pixels are always moving to protect your hardware and catch the customer's eye.</p>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl text-center shadow-lg"><div className="text-[10px] font-black uppercase tracking-widest">Pan & Zoom</div></div>
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl text-center shadow-lg"><div className="text-[10px] font-black uppercase tracking-widest">Perspective Tilt</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 05: Fleet Management</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Telemetry Protocol</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Real-time status tracking for every tablet in your network, no matter where they are located.</p>
                        </div>

                        <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden flex flex-col items-center">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            
                            <div className="relative w-full h-full flex flex-col items-center gap-12">
                                <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative z-20">
                                    <Globe size={40} className="animate-spin-slow" />
                                    <div className="pulse-ring absolute inset-0 rounded-[2.5rem] border-4 border-blue-500"></div>
                                    <div className="pulse-ring absolute inset-0 rounded-[2.5rem] border-4 border-blue-500" style={{ animationDelay: '1s' }}></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-3xl">
                                    {[
                                        { label: 'Shop A', type: 'Tablet', status: 'Online', signal: '88%' },
                                        { label: 'Shop B', type: 'Handheld', status: 'Online', signal: '92%' },
                                        { label: 'TV Wall 1', type: 'TV Display', status: 'Syncing', signal: '100%' },
                                    ].map((dev, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-3 relative transition-transform duration-500 hover:scale-105 group">
                                            <div className="absolute -top-3 bg-green-500 w-3 h-3 rounded-full border-4 border-slate-950 animate-pulse"></div>
                                            <div className="p-3 bg-white/5 rounded-2xl group-hover:text-blue-400 transition-colors">
                                                {dev.type === 'Tablet' ? <Tablet size={24}/> : dev.type === 'TV Display' ? <Tv size={24}/> : <Smartphone size={24}/>}
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-black text-xs uppercase">{dev.label}</div>
                                                <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">{dev.signal} Signal • {dev.status}</div>
                                            </div>
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-t from-blue-500 to-transparent opacity-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bi-Directional Pulse</h3>
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">Communication is a two-way street. Every device sends its <strong>Battery, WiFi, and Temperature</strong> to your Admin dashboard. At the same time, it looks for <strong>Commands</strong> from you—like a "Remote Restart" or "Refresh Content" request.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Identity Recovery</h3>
                                <p className="text-base text-slate-600 leading-relaxed font-medium">Even if you uninstall the app or clear the cache, the tablet's <strong>Digital Signature</strong> is remembered by our cloud. The moment it reconnects, it automatically downloads its name and settings back from the fleet registry.</p>
                                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <Lock className="text-blue-500" size={16} />
                                         <span className="text-[10px] font-black uppercase text-slate-400">Device ID: LOC-8812</span>
                                     </div>
                                     <div className="text-[10px] font-black uppercase text-green-500">Identity Secure</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-purple-500/20">Module 06: Cinematic Protocol</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">TV Mode Architecture</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Engineered for large-format displays where interaction isn't possible, but visual fidelity is mandatory.</p>
                        </div>

                        <div className="bg-slate-200 rounded-[4rem] p-12 shadow-inner border-4 border-slate-300 relative overflow-hidden flex flex-col items-center">
                            <div className="bg-black aspect-video w-full max-w-3xl rounded-[2rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-slate-900">
                                     <div className="h-full w-[200%] flex animate-conveyor" style={{ animationDuration: '4s' }}>
                                         {[1,2,3,4,5,6].map(i => (
                                             <div key={i} className="h-full w-1/6 border-r-4 border-black/40 flex items-center justify-center p-8">
                                                 <div className="w-full h-full bg-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                                                     <PlayCircle size={40} className="text-white/20" />
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                                     <div className="flex justify-between items-start">
                                         <div className="bg-blue-600 px-4 py-2 rounded-xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl">LIVE: TV CHANNEL</div>
                                         <div className="bg-black/50 px-4 py-2 rounded-xl text-slate-300 font-mono text-[10px] backdrop-blur-md border border-white/10">1080P • 60FPS</div>
                                     </div>
                                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                         <div className="w-2/3 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                                     </div>
                                </div>
                            </div>

                            <div className="mt-12 grid grid-cols-3 gap-8">
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400"><VolumeX size={20}/></div>
                                     <span className="text-[10px] font-black uppercase text-slate-500">Muted Start</span>
                                 </div>
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400"><Layout size={20}/></div>
                                     <span className="text-[10px] font-black uppercase text-slate-500">Fit-to-Fill</span>
                                 </div>
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400"><MousePointer2 size={20}/></div>
                                     <span className="text-[10px] font-black uppercase text-slate-500">No Cursor</span>
                                 </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Autoplay Bypass</h3>
                                <div className="p-8 bg-purple-50 rounded-[2rem] border border-purple-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">Modern browsers block videos with sound from playing automatically. To solve this for TV walls, our system starts videos in a <strong>Muted State</strong>. The moment a user touches the screen, the system "Unlocks" the audio context and enables sound across the entire playlist.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Display Intelligence</h3>
                                <p className="text-base text-slate-600 leading-relaxed font-medium">TV Mode includes <strong>Letterbox Correction</strong>. If you upload a vertical video to a horizontal TV, the system doesn't stretch it—it applies a beautiful blurred background to fill the empty space, maintaining a high-end cinematic feel.</p>
                                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-wrap gap-2">
                                     {['4K READY', 'H.264 ENCODED', 'BITRATE OPTIMIZED', 'FRAME-LOCK'].map(tag => (
                                         <div key={tag} className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{tag}</div>
                                     ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-40"></div>
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
              const base64s: string[] = [];
              for(let i=0; i<files.length; i++) {
                  const res = await uploadSingle(files[i]);
                  results.push(res.url);
                  base64s.push(res.base64);
                  setUploadProgress(((i+1)/files.length)*100);
              }
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
                 <button onClick={addCatalogue} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold textxs uppercase flex items-center gap-2"><Plus size={14} /> Add New</button>
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

  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value) return;
    
    const numericPart = value.replace(/[^0-9.]/g, '');
    if (!numericPart) {
        if (value && !value.startsWith('R ')) {
            updateItem(id, field, `R ${value}`);
        }
        return;
    }

    let num = parseFloat(numericPart);
    
    if (num % 1 !== 0) {
        num = Math.ceil(num);
    }
    
    if (Math.floor(num) % 10 === 9) {
        num += 1;
    }
    
    const formatted = `R ${num.toLocaleString()}`;
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
        const workbookSheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(workbookSheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
            alert("The selected file appears to be empty.");
            return;
        }

        const validRows = jsonData.filter(row => 
            row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );

        if (validRows.length === 0) {
            alert("No data rows found in the file.");
            return;
        }

        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const findIdx = (keywords: string[]) => firstRow.findIndex(h => keywords.some(k => h.includes(k)));

        const skuIdx = findIdx(['sku', 'code', 'part', 'model']);
        const descIdx = findIdx(['desc', 'name', 'product', 'item', 'title']);
        const normalIdx = findIdx(['normal', 'retail', 'price', 'standard', 'cost']);
        const promoIdx = findIdx(['promo', 'special', 'sale', 'discount', 'deal']);

        const hasHeader = skuIdx !== -1 || descIdx !== -1 || normalIdx !== -1;
        const dataRows = hasHeader ? validRows.slice(1) : validRows;
        
        const sIdx = skuIdx !== -1 ? skuIdx : 0;
        const dIdx = descIdx !== -1 ? descIdx : 1;
        const nIdx = normalIdx !== -1 ? normalIdx : 2;
        const pIdx = promoIdx !== -1 ? promoIdx : 3;

        const newImportedItems: PricelistItem[] = dataRows.map(row => {
            const formatImported = (val: string) => {
                if (!val) return '';
                const numeric = String(val).replace(/[^0-9.]/g, '');
                if (!numeric) return String(val);
                let n = parseFloat(numeric);
                if (n % 1 !== 0) n = Math.ceil(n);
                if (Math.floor(n) % 10 === 9) n += 1;
                return `R ${n.toLocaleString()}`;
            };

            return {
                id: generateId('imp'),
                sku: String(row[sIdx] || '').trim().toUpperCase(),
                description: String(row[dIdx] || '').trim(),
                normalPrice: formatImported(row[nIdx]),
                promoPrice: row[pIdx] ? formatImported(row[pIdx]) : ''
            };
        });

        if (newImportedItems.length > 0) {
            const userChoice = confirm(`Parsed ${newImportedItems.length} items.\n\nOK -> UPDATE existing SKUs and ADD new ones (Merge).\nCANCEL -> REPLACE entire current list.`);
            if (userChoice) {
                const merged = [...items];
                const onlyNew: PricelistItem[] = [];
                newImportedItems.forEach(newItem => {
                    const existingIdx = merged.findIndex(curr => curr.sku && newItem.sku && curr.sku.trim().toUpperCase() === newItem.sku.trim().toUpperCase());
                    if (existingIdx > -1) {
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
            } else {
                setItems(newImportedItems);
            }
        }
    } catch (err) { alert("Error parsing file."); } 
    finally { setIsImporting(false); e.target.value = ''; }
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
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Normal Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Promo Price</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU-123" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="Product details..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
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
    const sortedBrands = useMemo(() => {
        return [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name));
    }, [pricelistBrands]);

    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands.length > 0 ? sortedBrands[0] : null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);

    const latestBrandId = useMemo(() => {
        if (!pricelists.length) return null;
        const sortedByDate = [...pricelists].sort((a, b) => {
            const da = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
            const db = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
            return db - da;
        });
        return sortedByDate[0]?.brandId || null;
    }, [pricelists]);
    
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
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    const addBrand = () => {
        const name = prompt("Enter Brand Name for Pricelists:");
        if (!name) return;
        const newBrand: PricelistBrand = { id: generateId('plb'), name: name, logoUrl: '' };
        onSaveBrands([...pricelistBrands, newBrand]);
        setSelectedBrand(newBrand);
    };

    const updateBrand = (id: string, updates: Partial<PricelistBrand>) => {
        const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b);
        onSaveBrands(updatedBrands);
        if (selectedBrand?.id === id) setSelectedBrand({ ...selectedBrand, ...updates });
    };

    const deleteBrand = (id: string) => {
        if (confirm("Delete this brand?")) onSaveBrands(pricelistBrands.filter(b => b.id !== id));
    };

    const addPricelist = () => {
        if (!selectedBrand) return;
        const newItem: Pricelist = {
            id: generateId('pl'),
            brandId: selectedBrand.id,
            title: 'New Pricelist',
            url: '',
            type: 'pdf',
            month: months[new Date().getMonth()],
            year: new Date().getFullYear().toString(),
            dateAdded: new Date().toISOString()
        };
        onSavePricelists([...pricelists, newItem]);
    };

    const updatePricelist = (id: string, updates: Partial<Pricelist>) => {
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const isNewlyUpdated = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = Math.abs(now.getTime() - date.getTime());
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) <= 30;
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
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
                     {sortedBrands.map(brand => {
                         const isLatest = latestBrandId === brand.id;
                         return (
                         <div 
                            key={brand.id} 
                            onClick={() => setSelectedBrand(brand)}
                            className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                         >
                             {isLatest && (
                                 <div className="absolute -top-1.5 -right-1.5 z-10 bg-orange-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-white animate-bounce">
                                     <span className="flex items-center gap-1"><Sparkles size={8} /> Just Updated</span>
                                 </div>
                             )}
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                     {brand.logoUrl ? (
                                         <img src={brand.logoUrl} className="w-full h-full object-contain" />
                                     ) : (
                                         <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>
                                     )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2">
                                        <div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div>
                                     </div>
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
                     );})}
                 </div>
             </div>
             
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <div className="flex items-center gap-3 truncate mr-2">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate">
                            {selectedBrand ? selectedBrand.name : 'Select Brand'}
                        </h3>
                     </div>
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
                                        <Edit2 size={12}/> Builder
                                    </button>
                                    <FileUpload label="Thumbnail" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() })} />
                                </div>
                             ) : (
                                <div className="mt-1 md:mt-2 grid grid-cols-2 gap-2">
                                    <FileUpload label="Thumb" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() })} />
                                    <FileUpload label="PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url, dateAdded: new Date().toISOString() })} />
                                </div>
                             )}

                             <button 
                                onClick={() => { if(confirm("Delete?")) onDeletePricelist(item.id); }}
                                className="mt-auto pt-2 md:pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                             >
                                 <Trash2 size={12} /> Delete
                             </button>
                         </div>
                     )})}
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
        dimensions: Array.isArray(product.dimensions) ? product.dimensions : [],
        videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []),
        manuals: product.manuals || [],
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
        setDraft({ ...draft, dimensions: [...draft.dimensions, { label: "New Set", width: "", height: "", depth: "", weight: "" }] });
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
                    </div>

                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Key Features</label>
                             <div className="flex gap-2 mb-2">
                                 <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add feature..." onKeyDown={(e) => e.key === 'Enter' && addFeature()} />
                                 <button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button>
                             </div>
                             <ul className="space-y-1">{draft.features.map((f, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold text-slate-700">{f}<button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
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
                             <button onClick={() => setDraft({...draft, deviceType: 'kiosk'})} className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 ${draft.deviceType === 'kiosk' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}><Tablet size={16}/> Kiosk</button>
                             <button onClick={() => setDraft({...draft, deviceType: 'mobile'})} className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 ${draft.deviceType === 'mobile' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-slate-200 text-slate-500'}`}><Smartphone size={16}/> Mobile</button>
                             <button onClick={() => setDraft({...draft, deviceType: 'tv'})} className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 ${draft.deviceType === 'tv' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}><Tv size={16}/> TV</button>
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

const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: { product: Product, allBrands: Brand[], currentBrandId: string, currentCategoryId: string, onClose: () => void, onMove: (p: Product, b: string, c: string) => void }) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);
    const targetBrand = allBrands.find(b => b.id === targetBrandId);
    const targetCategories = targetBrand?.categories || [];
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-900 uppercase">Move Product</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <InputField label="Destination Brand" val={targetBrandId} type="select" onChange={(e:any)=>setTargetBrandId(e.target.value)}>
                        {allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </InputField>
                </div>
            </div>
        </div>
    );
};

const FleetStatistics = ({ devices }: { devices: KioskRegistry[] }) => {
    const stats = useMemo(() => {
        const total = devices.length;
        const online = devices.filter(d => (new Date().getTime() - new Date(d.last_seen).getTime()) < 350000).length;
        const averageBattery = devices.reduce((acc, d) => acc + (d.batteryLevel || 0), 0) / (devices.filter(d => d.batteryLevel).length || 1);
        const lowBattery = devices.filter(d => (d.batteryLevel || 100) < 20).length;

        return { total, online, averageBattery, lowBattery };
    }, [devices]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Fleet Health', val: `${stats.online}/${stats.total}`, sub: 'Active Devices', icon: <PulseIcon className="text-green-500"/>, bg: 'bg-green-50' },
                { label: 'Avg Battery', val: `${Math.round(stats.averageBattery)}%`, sub: 'Network Power', icon: <Battery className="text-blue-500"/>, bg: 'bg-blue-50' },
                { label: 'Stale Sync', val: stats.total - stats.online, sub: 'Communication Lags', icon: <ZapOff className="text-orange-500"/>, bg: 'bg-orange-50' },
                { label: 'Critical Energy', val: stats.lowBattery, sub: 'Below 20%', icon: <BatteryCharging className="text-red-500"/>, bg: 'bg-red-50' }
            ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-6 rounded-[2rem] border border-white/50 shadow-sm`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm">{stat.icon}</div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{stat.sub}</div>
                </div>
            ))}
        </div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: { model: TVModel, onSave: (m: TVModel) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-black text-slate-900 uppercase">Edit TV Model</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <InputField label="Model Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
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
        inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true
    });
    return (
        <div className="space-y-8">
            <div className="xl:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <InputField label="Admin Name" val={newName} onChange={(e:any) => setNewName(e.target.value)} />
                <InputField label="PIN" val={newPin} onChange={(e:any) => setNewPin(e.target.value)} />
            </div>
        </div>
    );
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return;
    const zip = new JSZip();
    zip.file("store_config.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kiosk_backup_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const newBrands: Record<string, Brand> = {};
    return Object.values(newBrands);
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
      checkCloudConnection().then(setIsCloudConnected);
  }, []);

  useEffect(() => {
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

  const updateFleetMember = async (kiosk: KioskRegistry) => {
      if(supabase) {
          await supabase.from('kiosks').upsert({
              id: kiosk.id, name: kiosk.name, device_type: kiosk.deviceType, assigned_zone: kiosk.assignedZone
          });
          onRefresh(); 
      }
  };

  const sendFleetCommand = async (id: string, command: 'restart' | 'refresh' | 'screensaver_toggle', currentValue?: boolean) => {
      if (!supabase) return;
      const payload: any = {};
      if (command === 'restart') payload.restart_requested = true;
      if (command === 'refresh') payload.refresh_requested = true;
      if (command === 'screensaver_toggle') payload.screensaver_forced = !currentValue;
      
      await supabase.from('kiosks').update(payload).eq('id', id);
      onRefresh();
  };

  const removeFleetMember = async (id: string) => {
      if(confirm("Archive device?") && supabase) {
          await supabase.from('kiosks').delete().eq('id', id);
          onRefresh();
      }
  };

  const archivedGenericItems = (localData?.archive?.deletedItems || []).filter(i => i.name.toLowerCase().includes(historySearch.toLowerCase()));

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
                     <h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                         <SaveAll size={16} className="inline mr-2" /> {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                     </button>
                 </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {availableTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-[10px] font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'guide' && <SystemDocumentation />}
            
            {activeTab === 'inventory' && !selectedBrand && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <button onClick={() => { const name = prompt("Name:"); if(name) handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }] }) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 aspect-square"><Plus size={32}/><span className="font-bold uppercase text-[10px] mt-2">Add Brand</span></button>
                    {brands.map(brand => (
                        <div key={brand.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden relative group">
                            <div className="aspect-square bg-slate-50 flex items-center justify-center p-4">
                                {brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}
                            </div>
                            <div className="p-4"><h3 className="font-black text-slate-900 text-sm uppercase truncate mb-2">{brand.name}</h3><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] uppercase">Manage</button></div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'fleet' && (
                <div className="animate-fade-in max-w-7xl mx-auto pb-24">
                    <FleetStatistics devices={localData.fleet || []} />
                    
                    {['kiosk', 'mobile', 'tv'].map((type) => {
                        const devices = localData.fleet?.filter(k => k.deviceType === type || (type === 'kiosk' && !k.deviceType)) || [];
                        if (devices.length === 0) return null;
                        const config = { kiosk: { label: 'Interactive Kiosks', icon: <Tablet size={20}/>, color: 'blue' }, mobile: { label: 'Mobile Handhelds', icon: <Smartphone size={20}/>, color: 'purple' }, tv: { label: 'TV Displays', icon: <Tv size={20}/>, color: 'indigo' } }[type as 'kiosk' | 'mobile' | 'tv'];

                        return (
                            <div key={type} className="mb-12">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                                    <div className={`p-3 rounded-2xl bg-${config.color}-50 text-${config.color}-600`}>{config.icon}</div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{config.label}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {devices.map(kiosk => {
                                        const lastSeen = new Date(kiosk.last_seen).getTime();
                                        const isOnline = (new Date().getTime() - lastSeen) < 350000;
                                        const signalColor = kiosk.wifiStrength > 70 ? 'bg-green-500' : kiosk.wifiStrength > 40 ? 'bg-yellow-500' : 'bg-red-500';
                                        
                                        return (
                                            <div key={kiosk.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-xl hover:border-blue-400 relative">
                                                <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] pulse' : 'bg-slate-300'}`}></div>
                                                                <h4 className="font-black text-slate-900 uppercase text-sm truncate">{kiosk.name}</h4>
                                                            </div>
                                                            <div className="text-[9px] font-mono text-slate-400 uppercase font-bold">ID: {kiosk.id} • v{kiosk.version || '2.8'}</div>
                                                        </div>
                                                        {kiosk.batteryLevel !== undefined && (
                                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${kiosk.batteryLevel < 20 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                                {kiosk.isCharging ? <BatteryCharging size={12} /> : <Battery size={12} />}
                                                                {kiosk.batteryLevel}%
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="bg-slate-900 rounded-2xl p-4 shadow-inner">
                                                        <div className="flex items-center gap-3 text-blue-400 font-black text-[9px] uppercase tracking-widest mb-2">
                                                            <Activity size={12} /> Live Telemetry
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mb-1">
                                                                    <span>WiFi Signal</span>
                                                                    <span>{kiosk.wifiStrength}%</span>
                                                                </div>
                                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${signalColor} transition-all duration-1000`} style={{ width: `${kiosk.wifiStrength}%` }}></div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                                                <span className="text-[8px] font-black text-slate-500 uppercase">IP Node</span>
                                                                <span className="text-[10px] font-mono text-blue-300">{kiosk.ipAddress || '0.0.0.0'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-6 flex-1 space-y-4">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Active State</label>
                                                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex items-center gap-3">
                                                            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><PulseIcon size={14}/></div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[10px] font-black text-blue-900 truncate uppercase">{kiosk.currentScreen || 'Home Dashboard'}</div>
                                                                <div className="text-[8px] font-bold text-blue-400 uppercase">Last Sync: {formatRelativeTime(kiosk.last_seen)}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Hardware Zone</label>
                                                            <div className="text-xs font-bold text-slate-700">{kiosk.assignedZone || 'UNASSIGNED'}</div>
                                                        </div>
                                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Status</label>
                                                            <div className={`text-xs font-black uppercase ${isOnline ? 'text-green-600' : 'text-red-500'}`}>{isOnline ? 'ONLINE' : 'STALE'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-4 gap-2">
                                                    <button onClick={() => setEditingKiosk(kiosk)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-center" title="Device Settings"><Settings size={18}/></button>
                                                    <button onClick={() => sendFleetCommand(kiosk.id, 'refresh')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-green-600 hover:border-green-400 hover:shadow-md transition-all flex items-center justify-center" title="Force Content Refresh"><RefreshCw size={18}/></button>
                                                    <button onClick={() => sendFleetCommand(kiosk.id, 'screensaver_toggle', kiosk.screensaverForced)} className={`p-3 border rounded-2xl transition-all flex items-center justify-center ${kiosk.screensaverForced ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-400'}`} title="Toggle Remote Screensaver">{kiosk.screensaverForced ? <MonitorStop size={18}/> : <MonitorPlay size={18}/>}</button>
                                                    <button onClick={() => sendFleetCommand(kiosk.id, 'restart')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 hover:border-red-400 hover:shadow-md transition-all flex items-center justify-center" title="Cold Restart Device"><Power size={18}/></button>
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
        {editingKiosk && <KioskEditorModal kiosk={editingKiosk} onSave={(k) => { updateFleetMember(k); setEditingKiosk(null); }} onClose={() => setEditingKiosk(null)} />}
    </div>
  );
};

export default AdminDashboard;
