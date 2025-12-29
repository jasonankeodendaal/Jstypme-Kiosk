import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection, initSupabase } from '../services/kioskService';
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

// --- SYSTEM DOCUMENTATION COMPONENT (ENHANCED FOR BEGINNERS) ---
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

            {/* Enhanced Sidebar */}
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
            
            {/* Dynamic Content Area */}
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {/* Visual Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] pointer-events-none rounded-full"></div>

                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk is designed to work <strong>offline</strong> first. It doesn't need internet to show products—it only needs it to "sync up" with your latest changes.</p>
                        </div>

                        {/* Interactive Data Flow Illustration */}
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                {/* Component: Admin PC */}
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

                                {/* The Central Logic Pipe */}
                                <div className="flex-1 w-full h-24 relative flex items-center justify-center">
                                    <div className="w-full h-1 bg-white/5 rounded-full relative">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
                                        {/* Animated Data Packets */}
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" style={{ animationDelay: `${i * 1}s` }}></div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-8 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest">Encrypted Cloud Tunnel</div>
                                </div>

                                {/* Component: Kiosk Tablet */}
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

                        {/* Beginner Explanation Blocks */}
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

                        {/* Animated "Sifter" Illustration */}
                        <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                            <div className="absolute top-0 right-0 p-12 text-slate-200/50"><Layers size={200} /></div>
                            
                            {/* Input Side: Mixed Data */}
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

                            {/* Processing Logic: The Funnel */}
                            <div className="flex flex-col items-center justify-center relative">
                                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl z-20 animate-pulse">
                                    <RefreshCw size={40} className="animate-spin" style={{ animationDuration: '8s' }} />
                                </div>
                                <div className="mt-4 text-[10px] font-black text-orange-600 uppercase tracking-widest">Logic: Flatten()</div>
                                {/* Particles */}
                                <div className="absolute top-0 left-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
                            </div>

                            {/* Output Side: Searchable List */}
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

                        {/* Interactive Ingestion Illustration */}
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

                            {/* Conveyor Belt Effect */}
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

                        {/* Weighted Shuffling Illustration */}
                        <div className="bg-white border border-slate-200 rounded-[3rem] p-12 md:p-20 shadow-xl relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={250}/></div>
                            <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-12">Smart Playlist Assembly</div>

                            <div className="relative w-full max-w-2xl flex flex-col gap-4">
                                 {/* The "Priority" Zone */}
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

                                 {/* Standard Zone */}
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

                                 {/* New Zone */}
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

                        {/* Animated Fleet Monitoring Illustration */}
                        <div className="bg-slate-950 rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden flex flex-col items-center">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            
                            <div className="relative w-full h-full flex flex-col items-center gap-12">
                                {/* The Dashboard Hub */}
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
                                            {/* Incoming Ping line */}
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

                        {/* TV Reel Illustration */}
                        <div className="bg-slate-200 rounded-[4rem] p-12 shadow-inner border-4 border-slate-300 relative overflow-hidden flex flex-col items-center">
                            <div className="bg-black aspect-video w-full max-w-3xl rounded-[2rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-slate-900">
                                     {/* Mock Film Strip Animation */}
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
                                {/* Player Overlay */}
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

                {/* Bottom Spacer */}
                <div className="h-40"></div>
            </div>
        </div>
    );
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
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [pendingWorkbook, setPendingWorkbook] = useState<XLSX.WorkBook | null>(null);
  
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
        if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`);
        return;
    }
    let num = parseFloat(numericPart);
    if (num % 1 !== 0) num = Math.ceil(num);
    if (Math.floor(num) % 10 === 9) num += 1;
    updateItem(id, field, `R ${num.toLocaleString()}`);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const processWorkbookSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));

    if (validRows.length === 0) {
        alert("The selected sheet appears to be empty.");
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
        return { id: generateId('imp'), sku: String(row[sIdx] || '').trim().toUpperCase(), description: String(row[dIdx] || '').trim(), normalPrice: formatImported(row[nIdx]), promoPrice: row[pIdx] ? formatImported(row[pIdx]) : '' };
    });

    if (newImportedItems.length > 0) {
        const userChoice = confirm(`Parsed ${newImportedItems.length} items.\n\nOK -> UPDATE existing SKUs and ADD new ones (Merge).\nCANCEL -> REPLACE entire current list.`);
        if (userChoice) {
            const merged = [...items];
            const onlyNew: PricelistItem[] = [];
            newImportedItems.forEach(newItem => {
                const existingIdx = merged.findIndex(curr => curr.sku && newItem.sku && curr.sku.trim().toUpperCase() === newItem.sku.trim().toUpperCase());
                if (existingIdx > -1) {
                    merged[existingIdx] = { ...merged[existingIdx], description: newItem.description || merged[existingIdx].description, normalPrice: newItem.normalPrice || merged[existingIdx].normalPrice, promoPrice: newItem.promoPrice || merged[existingIdx].promoPrice };
                } else onlyNew.push(newItem);
            });
            setItems([...merged, ...onlyNew]);
        } else setItems(newImportedItems);
    } else alert("Could not extract any valid items.");
  };

  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        if (workbook.SheetNames.length > 1) {
            setAvailableSheets(workbook.SheetNames);
            setPendingWorkbook(workbook);
        } else processWorkbookSheet(workbook, workbook.SheetNames[0]);
    } catch (err) { alert("Error parsing file."); }
    finally { setIsImporting(false); e.target.value = ''; }
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
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel/CSV
              <input type="file" className="hidden" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} />
            </label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"><Plus size={16} /> Add Row</button>
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
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save</button>
        </div>
      </div>

      {availableSheets.length > 0 && (
          <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                  <h4 className="font-black text-slate-900 uppercase mb-4 text-center">Select Spreadsheet Sheet</h4>
                  <div className="space-y-2">
                      {availableSheets.map(s => (
                          <button key={s} onClick={() => { if(pendingWorkbook) processWorkbookSheet(pendingWorkbook, s); setAvailableSheets([]); setPendingWorkbook(null); }} className="w-full p-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl border border-slate-200 transition-colors text-sm">{s}</button>
                      ))}
                  </div>
              </div>
          </div>
      )}
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
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
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
        if (selectedBrand && !sortedBrands.find(b => b.id === selectedBrand.id)) setSelectedBrand(sortedBrands.length > 0 ? sortedBrands[0] : null);
    }, [sortedBrands]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const filteredLists = selectedBrand ? pricelists.filter(p => p.brandId === selectedBrand.id) : [];
    const sortedLists = [...filteredLists].sort((a, b) => {
        const yearA = parseInt(a.year) || 0; const yearB = parseInt(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    return (
        <div className="max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2>
                     <button onClick={() => { const n = prompt("Brand Name:"); if(n) onSaveBrands([...pricelistBrands, {id:generateId('plb'), name:n, logoUrl:''}]); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-[10px] uppercase truncate">{brand.name}</div><div className="text-[9px] text-slate-400 font-mono">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}>
                                     <FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => onSaveBrands(pricelistBrands.map(b=>b.id===brand.id?{...b, logoUrl:url}:b))} />
                                     <button onClick={() => confirm("Delete brand?") && onSaveBrands(pricelistBrands.filter(b=>b.id!==brand.id))} className="w-full text-center text-[10px] text-red-500 font-bold uppercase py-1">Delete</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{selectedBrand?.name || 'Select Brand'}</h3>
                     <button onClick={() => selectedBrand && onSavePricelists([...pricelists, {id:generateId('pl'), brandId:selectedBrand.id, title:'New List', url:'', type:'pdf', month:'January', year:new Date().getFullYear().toString(), dateAdded:new Date().toISOString()}])} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1"><Plus size={12} /> Add List</button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-start pb-10">
                     {sortedLists.map((item) => (
                         <div key={item.id} className={`rounded-xl border shadow-sm p-3 flex flex-col gap-2 h-fit bg-white border-slate-200`}>
                             <input value={item.title} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, title:e.target.value, dateAdded:new Date().toISOString()}:p))} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs" placeholder="Title" />
                             <div className="grid grid-cols-2 gap-2">
                                 <select value={item.month} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, month:e.target.value, dateAdded:new Date().toISOString()}:p))} className="w-full text-[10px] font-bold p-1 bg-white border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                 <input type="number" value={item.year} onChange={(e) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, year:e.target.value, dateAdded:new Date().toISOString()}:p))} className="w-full text-[10px] font-bold p-1 bg-white border border-slate-200" />
                             </div>
                             <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded">
                                <button onClick={() => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, type:'pdf', dateAdded:new Date().toISOString()}:p))} className={`py-1 text-[9px] font-black uppercase rounded ${item.type !== 'manual' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>PDF</button>
                                <button onClick={() => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, type:'manual', dateAdded:new Date().toISOString()}:p))} className={`py-1 text-[9px] font-black uppercase rounded ${item.type === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>TABLE</button>
                             </div>
                             {item.type === 'manual' ? <button onClick={() => setEditingManualList(item)} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-black text-[10px] uppercase border border-blue-200">Builder</button> : <FileUpload label="Upload PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => onSavePricelists(pricelists.map(p=>p.id===item.id?{...p, url, dateAdded:new Date().toISOString()}:p))} />}
                             <button onClick={() => onDeletePricelist(item.id)} className="mt-auto pt-2 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                         </div>
                     ))}
                 </div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => onSavePricelists(pricelists.map(p=>p.id===pl.id?pl:p))} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    const [draft, setDraft] = useState<Product>({ ...product, dimensions: Array.isArray(product.dimensions) ? product.dimensions : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []), videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []), manuals: product.manuals || (product.manualUrl || (product.manualImages && product.manualImages.length > 0) ? [{ id: generateId('man'), title: "User Manual", images: product.manualImages || [], pdfUrl: product.manualUrl }] : []), dateAdded: product.dateAdded || new Date().toISOString() });
    const [newFeature, setNewFeature] = useState('');
    const [newBoxItem, setNewBoxItem] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold uppercase tracking-wide">Edit: {draft.name || 'New Product'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-center mb-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dimensions</label><button onClick={() => setDraft({ ...draft, dimensions: [...draft.dimensions, { label: "New Set", width: "", height: "", depth: "", weight: "" }] })} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase"><Plus size={10}/> Add</button></div>
                             {draft.dimensions.map((dim, idx) => (
                                 <div key={idx} className="mb-4 bg-white p-3 rounded-lg border border-slate-200 relative">
                                     <button onClick={() => setDraft({ ...draft, dimensions: draft.dimensions.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-400"><Trash2 size={12}/></button>
                                     <input value={dim.label || ''} onChange={(e) => { const nd = [...draft.dimensions]; nd[idx].label = e.target.value; setDraft({...draft, dimensions: nd}); }} placeholder="Label" className="w-full text-xs font-black uppercase mb-2 outline-none border-b border-slate-100" />
                                     <div className="grid grid-cols-2 gap-2">
                                         <InputField label="H" val={dim.height} onChange={(e:any) => { const nd=[...draft.dimensions]; nd[idx].height=e.target.value; setDraft({...draft, dimensions:nd}); }} half />
                                         <InputField label="W" val={dim.width} onChange={(e:any) => { const nd=[...draft.dimensions]; nd[idx].width=e.target.value; setDraft({...draft, dimensions:nd}); }} half />
                                         <InputField label="D" val={dim.depth} onChange={(e:any) => { const nd=[...draft.dimensions]; nd[idx].depth=e.target.value; setDraft({...draft, dimensions:nd}); }} half />
                                         <InputField label="Wt" val={dim.weight} onChange={(e:any) => { const nd=[...draft.dimensions]; nd[idx].weight=e.target.value; setDraft({...draft, dimensions:nd}); }} half />
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Features</label>
                             <div className="flex gap-2 mb-2"><input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add..." onKeyDown={(e) => e.key === 'Enter' && (setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }), setNewFeature(''))} /><button onClick={() => (setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }), setNewFeature(''))} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button></div>
                             <ul className="space-y-1">{draft.features.map((f, i) => (<li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold">{f}<button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button></li>))}</ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Save</button></div>
        </div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true });

    const handleAddOrUpdate = () => {
        if (!newName || !newPin) return alert("Name/PIN required");
        let updatedList = [...admins];
        if (editingId) updatedList = updatedList.map(a => a.id === editingId ? { ...a, name: newName, pin: newPin, permissions: newPermissions } : a);
        else updatedList.push({ id: generateId('adm'), name: newName, pin: newPin, isSuperAdmin: false, permissions: newPermissions });
        onUpdate(updatedList); setEditingId(null); setNewName(''); setNewPin('');
    };

    return (
        <div className="space-y-8">
            <div className="xl:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-xs mb-6">{editingId ? 'Edit Admin' : 'New Admin'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InputField label="Name" val={newName} onChange={(e:any) => setNewName(e.target.value)} />
                    <InputField label="PIN" val={newPin} onChange={(e:any) => setNewPin(e.target.value)} />
                </div>
                <button onClick={handleAddOrUpdate} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase">Save Admin</button>
            </div>
            <div className="space-y-3">{admins.map(a => (<div key={a.id} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center"><div className="font-bold">{a.name} ({a.pin})</div><div className="flex gap-2"><button onClick={() => {setEditingId(a.id); setNewName(a.name); setNewPin(a.pin); setNewPermissions(a.permissions);}} className="text-blue-500"><Edit2 size={14}/></button>{!a.isSuperAdmin && <button onClick={() => onUpdate(admins.filter(x=>x.id!==a.id))} className="text-red-500"><Trash2 size={14}/></button>}</div></div>))}</div>
        </div>
    );
};

/* Missing MoveProductModal component for moving products between brands/categories */
const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: { 
    product: Product, 
    allBrands: Brand[], 
    currentBrandId: string, 
    currentCategoryId: string, 
    onClose: () => void, 
    onMove: (p: Product, brandId: string, catId: string) => void 
}) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);

    const targetBrand = allBrands.find(b => b.id === targetBrandId);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <h3 className="font-black uppercase text-sm tracking-tight">Move Product</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product</div>
                        <div className="font-bold text-slate-900">{product.name}</div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Destination Brand</label>
                        <select 
                            value={targetBrandId} 
                            onChange={(e) => {
                                setTargetBrandId(e.target.value);
                                const b = allBrands.find(x => x.id === e.target.value);
                                if (b && b.categories.length > 0) setTargetCategoryId(b.categories[0].id);
                            }}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Destination Category</label>
                        <select 
                            value={targetCategoryId} 
                            onChange={(e) => setTargetCategoryId(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {targetBrand?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
                    <button 
                        onClick={() => onMove(product, targetBrandId, targetCategoryId)}
                        className="px-8 py-3 bg-orange-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-orange-700 transition-all"
                    >
                        Move Now
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ZIP HELPER FUNCTIONS ---
const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip();
    let loadedZip;
    try { loadedZip = await zip.loadAsync(file); } catch (e) { throw new Error("Invalid ZIP"); }
    const newBrands: Record<string, Brand> = {};
    const validFiles = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir && !path.includes('__MACOSX') && !path.includes('.DS_Store'));
    
    let processedCount = 0;
    for (const rawPath of validFiles) {
        const fileObj = loadedZip.files[rawPath];
        const parts = rawPath.split('/').filter(p => p.trim() !== '');
        if (parts.length < 2) continue;
        processedCount++;
        if (onProgress && processedCount % 5 === 0) onProgress(`Processing ${processedCount}/${validFiles.length}...`);
        
        const brandName = parts[0];
        if (!newBrands[brandName]) newBrands[brandName] = { id: generateId('brand'), name: brandName, categories: [] };
        
        if (parts.length === 2 && (parts[1].includes('logo') || parts[1].includes('brand_logo'))) {
            const blob = await fileObj.async("blob");
            if (!supabase) throw new Error("Cloud Storage unavailable. Halt import to prevent crash.");
            newBrands[brandName].logoUrl = await uploadFileToStorage(new File([blob], parts[1], { type: 'image/png' }));
            continue;
        }
        if (parts.length < 4) continue;
        const catName = parts[1], prodName = parts[2], fileName = parts.slice(3).join('/');
        let category = newBrands[brandName].categories.find(c => c.name === catName);
        if (!category) { category = { id: generateId('cat'), name: catName, icon: 'Box', products: [] }; newBrands[brandName].categories.push(category); }
        let product = category.products.find(p => p.name === prodName);
        if (!product) { product = { id: generateId('prod'), name: prodName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '', galleryUrls: [], videoUrls: [], manuals: [], dateAdded: new Date().toISOString() }; category.products.push(product); }
        
        if (fileName.endsWith('.json')) {
            try { const meta = JSON.parse(await fileObj.async("text")); Object.assign(product, meta); } catch(e) {}
        } else if (fileName.match(/\.(jpg|jpeg|png|webp)$/i)) {
            const blob = await fileObj.async("blob");
            if (!supabase) throw new Error("Cloud Storage unavailable.");
            const url = await uploadFileToStorage(new File([blob], fileName, { type: 'image/png' }));
            if (fileName.includes('main') || fileName.includes('cover')) product.imageUrl = url;
            else product.galleryUrls = [...(product.galleryUrls || []), url];
        }
    }
    return Object.values(newBrands);
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return;
    const zip = new JSZip();
    zip.file("store_config.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url; link.download = `backup_${Date.now()}.zip`; link.click();
    URL.revokeObjectURL(url);
};

/* Moved handleMoveProduct inside AdminDashboard where it has access to localData and selected brand context */
const MoveProductModalWrapper = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: any) => {
    return <MoveProductModal product={product} allBrands={allBrands} currentBrandId={currentBrandId} currentCategoryId={currentCategoryId} onClose={onClose} onMove={onMove} />;
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
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');

  const availableTabs = [
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'pricelists', label: 'Pricelists', icon: RIcon },
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'screensaver', label: 'Screensaver', icon: Monitor },
      { id: 'fleet', label: 'Fleet', icon: Tablet },
      { id: 'history', label: 'History', icon: History },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'guide', label: 'Guide', icon: BookOpen }
  ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => { if (currentUser && !availableTabs.find(t => t.id === activeTab)) setActiveTab(availableTabs[0].id); }, [currentUser]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData, hasUnsavedChanges]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };

  /* handleMoveProduct: Logic to move a product across the brand/category tree */
  const handleMoveProduct = (product: Product, targetBrandId: string, targetCategoryId: string) => {
    if (!localData) return;
    
    const targetBrand = localData.brands.find(b => b.id === targetBrandId);
    if (!targetBrand) return;
    const targetCategory = targetBrand.categories.find(c => c.id === targetCategoryId);
    if (!targetCategory) return;

    let updatedBrands = localData.brands.map(b => {
      if (b.id === selectedBrand?.id) {
        return {
          ...b,
          categories: b.categories.map(c => {
            if (c.id === selectedCategory?.id) {
              return {
                ...c,
                products: c.products.filter(p => p.id !== product.id)
              };
            }
            return c;
          })
        };
      }
      return b;
    });

    updatedBrands = updatedBrands.map(b => {
      if (b.id === targetBrandId) {
        return {
          ...b,
          categories: b.categories.map(c => {
            if (c.id === targetCategoryId) {
              const exists = c.products.some(p => p.id === product.id);
              return {
                ...c,
                products: exists ? c.products : [...c.products, product]
              };
            }
            return c;
          })
        };
      }
      return b;
    });

    handleLocalUpdate({ ...localData, brands: updatedBrands });
    setMovingProduct(null);
  };

  if (!localData) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div>
                 <button onClick={() => { onUpdateData(localData); setHasUnsavedChanges(false); }} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500'}`}>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button>
                 <div className="flex items-center gap-3"><button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button><button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg"><LogOut size={16} /></button></div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && (!selectedBrand ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <button onClick={() => { const name = prompt("Brand:"); if(name) handleLocalUpdate({...localData, brands:[...localData.brands,{id:generateId('b'), name, categories:[]}]}) }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-500 aspect-square"><Plus size={24} /><span className="font-bold text-xs uppercase mt-2">New Brand</span></button>
                    {localData.brands.map(b => (<div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col"><div className="aspect-square bg-slate-50 flex items-center justify-center p-4">{b.logoUrl ? <img src={b.logoUrl} className="max-w-full max-h-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{b.name.charAt(0)}</span>}</div><div className="p-4"><h3 className="font-black text-sm uppercase truncate mb-3">{b.name}</h3><button onClick={() => setSelectedBrand(b)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs uppercase">Manage</button></div></div>))}
                </div>
            ) : !selectedCategory ? (
                <div>
                    <div className="flex gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase">{selectedBrand.name}</h2></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => { const name = prompt("Category:"); if(name) { const ub={...selectedBrand, categories:[...selectedBrand.categories,{id:generateId('c'), name, icon:'Box', products:[]}]}; handleLocalUpdate({...localData, brands:localData.brands.map(b=>b.id===ub.id?ub:b)}); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center aspect-square"><Plus size={24}/><span className="font-bold text-xs uppercase mt-2">New Category</span></button>
                        {selectedBrand.categories.map(c => (<button key={c.id} onClick={() => setSelectedCategory(c)} className="bg-white border rounded-xl p-6 flex flex-col justify-center aspect-square text-left font-black uppercase"><Box size={24} className="mb-4 text-slate-400" />{c.name}<div className="text-[10px] text-slate-500 mt-1">{c.products.length} Models</div></button>))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex gap-4 mb-6 shrink-0"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border rounded-lg"><ArrowLeft size={20}/></button><h2 className="text-2xl font-black uppercase">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({id:generateId('p'), name:'', description:'', specs:{}, features:[], dimensions:[], imageUrl:''} as any)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase ml-auto">Add Product</button></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {selectedCategory.products.map(p => (<div key={p.id} className="bg-white border rounded-xl overflow-hidden flex flex-col"><div className="aspect-square bg-slate-50 relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24}/>}<div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={() => setEditingProduct(p)} className="p-2 bg-white rounded-lg text-blue-600 font-bold text-xs uppercase">Edit</button><button onClick={() => setMovingProduct(p)} className="p-2 bg-white rounded-lg text-orange-600 font-bold text-xs uppercase">Move</button></div></div><div className="p-4 font-bold text-xs uppercase truncate">{p.name}</div></div>))}
                    </div>
                </div>
            ))}

            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists||[]} pricelistBrands={localData.pricelistBrands||[]} onSavePricelists={p=>handleLocalUpdate({...localData, pricelists:p})} onSaveBrands={b=>handleLocalUpdate({...localData, pricelistBrands:b})} onDeletePricelist={id=>handleLocalUpdate({...localData, pricelists:localData.pricelists?.filter(p=>p.id!==id)})} />}
            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-black uppercase text-sm mb-6 flex gap-2"><Database size={20} className="text-blue-500" /> System Backup</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => downloadZip(localData)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 shadow-lg"><Download size={16}/> Export Full .zip Backup</button>
                            <label className={`w-full py-4 ${importProcessing ? 'bg-slate-300' : 'bg-slate-800'} text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-pointer`}>{importProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} <span>{importProcessing ? importProgress || 'Processing...' : 'Import Data from .zip'}</span><input type="file" accept=".zip" className="hidden" disabled={importProcessing} onChange={async (e) => { if(e.target.files?.[0] && confirm("Merge imported data?")) { setImportProcessing(true); try { const nb = await importZip(e.target.files[0], setImportProgress); handleLocalUpdate({...localData, brands:[...localData.brands, ...nb]}); } catch(err) { alert(err instanceof Error ? err.message : "Import failed."); } finally { setImportProcessing(false); setImportProgress(''); } } }} /></label>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"><AdminManager admins={localData.admins||[]} onUpdate={a=>handleLocalUpdate({...localData, admins:a})} currentUser={currentUser} /></div>
                </div>
            )}
        </main>

        {editingProduct && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-8 flex items-center justify-center">
                <ProductEditor product={editingProduct} onSave={p => { const np=selectedCategory!.products.find(x=>x.id===p.id) ? selectedCategory!.products.map(x=>x.id===p.id?p:x) : [...selectedCategory!.products, p]; const uc={...selectedCategory!, products:np}; const ub={...selectedBrand!, categories:selectedBrand!.categories.map(c=>c.id===uc.id?uc:c)}; handleLocalUpdate({...localData, brands:localData.brands.map(b=>b.id===ub.id?ub:b)}); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} />
            </div>
        )}
        {movingProduct && <MoveProductModal product={movingProduct} allBrands={localData.brands} currentBrandId={selectedBrand!.id} currentCategoryId={selectedCategory!.id} onClose={()=>setMovingProduct(null)} onMove={(p,tb,tc) => handleMoveProduct(p,tb,tc)} />}
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;