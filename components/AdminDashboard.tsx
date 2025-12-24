import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
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
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
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
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">The Weighted Shuffle</h3>
                                <div className="p-8 bg-yellow-50 rounded-[2rem] border border-yellow-100 shadow-sm">
                                    <p className="text-base text-slate-700 leading-relaxed font-medium">To keep customers interested, the Kiosk shuffles the playlist every time it starts. However, it's not truly random. <strong>Marketing Ads</strong> are added to the shuffle 3 times, while standard products are only added once. This ensures your key promotions are seen much more often.</p>
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
                                        </div>
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
               accept.includes('audio') ? <div className="flex flex-col items-center justify-center bg-green-50 w-full h-full text-green-600"><Music size={16} /></div> : 
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

    const handleUpdate = (newList: Catalogue[]) => { setLocalList(newList); onSave(newList); };
    const addCatalogue = () => { handleUpdate([...localList, { id: generateId('cat'), title: brandId ? 'New Brand Catalogue' : 'New Pamphlet', brandId: brandId, type: brandId ? 'catalogue' : 'pamphlet', pages: [], year: new Date().getFullYear(), startDate: '', endDate: '' }]); };
    const updateCatalogue = (id: string, updates: Partial<Catalogue>) => { handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c)); };

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
                            {cat.thumbnailUrl || (cat.pages && cat.pages[0]) ? <img src={cat.thumbnailUrl || cat.pages[0]} className="w-full h-full object-contain" /> : <BookOpen size={32} className="text-slate-300" />}
                            {cat.pdfUrl && <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <input value={cat.title} onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })} className="w-full font-black text-slate-900 border-b border-transparent focus:border-blue-500 outline-none text-sm" placeholder="Title" />
                            {cat.type === 'catalogue' || brandId ? <div><label className="text-[8px] font-bold text-slate-400 uppercase">Catalogue Year</label><input type="number" value={cat.year || new Date().getFullYear()} onChange={(e) => updateCatalogue(cat.id, { year: parseInt(e.target.value) })} className="w-full text-xs border border-slate-200 rounded p-1" /></div> : <div className="grid grid-cols-2 gap-2"><div><label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label><input type="date" value={cat.startDate || ''} onChange={(e) => updateCatalogue(cat.id, { startDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div><div><label className="text-[8px] font-bold text-slate-400 uppercase">End Date</label><input type="date" value={cat.endDate || ''} onChange={(e) => updateCatalogue(cat.id, { endDate: e.target.value })} className="w-full text-xs border border-slate-200 rounded p-1" /></div></div>}
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2"><FileUpload label="Thumbnail" currentUrl={cat.thumbnailUrl || (cat.pages?.[0])} onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url })} /><FileUpload label="PDF" accept="application/pdf" currentUrl={cat.pdfUrl} icon={<FileText />} onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url })} /></div>
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
  const addItem = () => setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '' }]);
  const updateItem = (id: string, field: keyof PricelistItem, val: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  const handlePriceBlur = (id: string, field: 'normalPrice' | 'promoPrice', value: string) => {
    if (!value) return;
    const numericPart = value.replace(/[^0-9.]/g, '');
    if (!numericPart) { if (value && !value.startsWith('R ')) updateItem(id, field, `R ${value}`); return; }
    let num = parseFloat(numericPart);
    if (num % 1 !== 0) num = Math.ceil(num);
    if (Math.floor(num) % 10 === 9) num += 1;
    updateItem(id, field, `R ${num.toLocaleString()}`);
  };
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const handleSpreadsheetImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsImporting(true);
    try {
        const data = await file.arrayBuffer(); const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as any[][];
        if (jsonData.length === 0) return;
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && String(cell).trim() !== ''));
        const firstRow = validRows[0].map(c => String(c || '').toLowerCase().trim());
        const findIdx = (kw: string[]) => firstRow.findIndex(h => kw.some(k => h.includes(k)));
        const sIdx = Math.max(0, findIdx(['sku', 'code', 'part'])); const dIdx = Math.max(1, findIdx(['desc', 'name', 'product']));
        const nIdx = Math.max(2, findIdx(['normal', 'retail', 'price'])); const pIdx = findIdx(['promo', 'special', 'sale']);
        const dataRows = (findIdx(['sku', 'desc', 'price']) !== -1) ? validRows.slice(1) : validRows;
        const newItems: PricelistItem[] = dataRows.map(row => {
            const fmt = (v: any) => { if(!v) return ''; let n = parseFloat(String(v).replace(/[^0-9.]/g, '')); if(isNaN(n)) return String(v); if(n%1!==0) n=Math.ceil(n); if(Math.floor(n)%10===9) n+=1; return `R ${n.toLocaleString()}`; };
            return { id: generateId('imp'), sku: String(row[sIdx]||'').trim().toUpperCase(), description: String(row[dIdx]||'').trim(), normalPrice: fmt(row[nIdx]), promoPrice: pIdx!==-1 ? fmt(row[pIdx]) : '' };
        });
        if (newItems.length > 0) { if(confirm(`Imported ${newItems.length} items. Merge with current?`)) setItems([...items, ...newItems]); else setItems(newItems); }
    } catch (err) { alert("Import error"); } finally { setIsImporting(false); e.target.value = ''; }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <div><h3 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2"><Table className="text-blue-600" size={24} /> Pricelist Builder</h3><p className="text-xs text-slate-500 font-bold uppercase">{pricelist.title}</p></div>
          <div className="flex flex-wrap gap-2"><label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 cursor-pointer">{isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel<input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleSpreadsheetImport} /></label><button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700"><Plus size={16} /> Add Row</button><button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button></div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10"><tr><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">SKU</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Description</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Normal</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Promo</th><th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b w-10"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">{items.map((item) => (<tr key={item.id} className="hover:bg-slate-50/50"><td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td><td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold text-sm" /></td><td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm" /></td><td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent outline-none font-black text-sm text-red-600" /></td><td className="p-2"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button></td></tr>))}</tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => { onSave({ ...pricelist, items, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg">Save Table</button></div>
      </div>
    </div>
  );
};

const PricelistManager = ({ pricelists, pricelistBrands, onSavePricelists, onSaveBrands, onDeletePricelist }: any) => {
    const sortedBrands = useMemo(() => [...pricelistBrands].sort((a, b) => a.name.localeCompare(b.name)), [pricelistBrands]);
    const [selectedBrand, setSelectedBrand] = useState<PricelistBrand | null>(sortedBrands[0] || null);
    const [editingManualList, setEditingManualList] = useState<Pricelist | null>(null);
    const filteredLists = selectedBrand ? pricelists.filter((p: any) => p.brandId === selectedBrand.id) : [];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const addPricelist = () => {
        if (!selectedBrand) return;
        onSavePricelists([...pricelists, { id: generateId('pl'), brandId: selectedBrand.id, title: 'New Pricelist', url: '', type: 'pdf', month: 'January', year: '2024', dateAdded: new Date().toISOString() }]);
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
             <div className="w-full md:w-72 bg-white border rounded-2xl flex flex-col shrink-0">
                 <div className="p-4 border-b flex justify-between items-center"><h2 className="font-black text-xs uppercase">Brands</h2><button onClick={() => { const n = prompt("Brand Name:"); if(n) onSaveBrands([...pricelistBrands, { id: generateId('plb'), name: n, logoUrl: '' }]); }} className="bg-blue-600 text-white p-1.5 rounded"><Plus size={12} /></button></div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">{sortedBrands.map(b => (
                     <div key={b.id} onClick={() => setSelectedBrand(b)} className={`p-3 rounded-xl border cursor-pointer ${selectedBrand?.id === b.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                         <div className="font-bold text-xs uppercase">{b.name}</div>
                         {selectedBrand?.id === b.id && <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}><FileUpload label="Logo" currentUrl={b.logoUrl} onUpload={(url: any) => onSaveBrands(pricelistBrands.map((x: any) => x.id === b.id ? { ...x, logoUrl: url } : x))} /><button onClick={() => confirm("Delete?") && onSaveBrands(pricelistBrands.filter((x: any) => x.id !== b.id))} className="w-full text-[9px] text-red-500 font-bold uppercase">Delete</button></div>}
                     </div>
                 ))}</div>
             </div>
             <div className="flex-1 bg-slate-50 border rounded-2xl p-4 flex flex-col">
                 <div className="flex justify-between items-center mb-4"><h3 className="font-bold uppercase text-xs">{selectedBrand?.name || 'Select Brand'}</h3><button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> Add</button></div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                     {filteredLists.map((p: any) => (
                         <div key={p.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3 relative group">
                             <input value={p.title} onChange={(e) => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? { ...x, title: e.target.value } : x))} className="w-full font-bold text-sm outline-none border-b border-transparent focus:border-blue-500 pb-1" />
                             <div className="grid grid-cols-2 gap-2"><select value={p.month} onChange={(e) => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? { ...x, month: e.target.value } : x))} className="p-1 text-[10px] border rounded">{months.map(m => <option key={m} value={m}>{m}</option>)}</select><input type="number" value={p.year} onChange={(e) => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? { ...x, year: e.target.value } : x))} className="p-1 text-[10px] border rounded" /></div>
                             <div className="grid grid-cols-2 gap-2"><button onClick={() => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? { ...x, type: 'pdf' } : x))} className={`py-1 text-[9px] font-bold rounded ${p.type !== 'manual' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>PDF</button><button onClick={() => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? { ...x, type: 'manual' } : x))} className={`py-1 text-[9px] font-bold rounded ${p.type === 'manual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>TABLE</button></div>
                             {p.type === 'manual' ? <button onClick={() => setEditingManualList(p)} className="w-full py-2 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">Edit Items</button> : <FileUpload label="PDF" accept="application/pdf" icon={<FileText />} currentUrl={p.url} onUpload={(url: any) => onSavePricelists(pricelists.map((x: any) => x.id === p.id ? { ...x, url } : x))} />}
                             <button onClick={() => onDeletePricelist(p.id)} className="w-full pt-2 border-t text-[9px] text-red-500 font-bold uppercase">Delete</button>
                         </div>
                     ))}
                 </div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => onSavePricelists(pricelists.map((x: any) => x.id === pl.id ? pl : x))} onClose={() => setEditingManualList(null)} />}
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
    const [newSpecK, setNewSpecK] = useState('');
    const [newSpecV, setNewSpecV] = useState('');

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase text-xs">Edit: {draft.name || 'New'}</h3><button onClick={onCancel}><X size={20}/></button></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <InputField label="Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} />
                    </div>
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border"><label className="block text-[10px] font-black uppercase mb-2">Features</label><div className="flex gap-2 mb-2"><input value={newFeature} onChange={e=>setNewFeature(e.target.value)} className="flex-1 p-2 text-xs border rounded" /><button onClick={() => { if(newFeature.trim()){ setDraft({...draft, features: [...draft.features, newFeature.trim()]}); setNewFeature(''); } }} className="p-2 bg-blue-600 text-white rounded"><Plus size={14}/></button></div><div className="space-y-1">{draft.features.map((f,i)=>(<div key={i} className="flex justify-between p-2 bg-white rounded text-[10px] font-bold">{f}<button onClick={()=>setDraft({...draft, features: draft.features.filter((_,x)=>x!==i)})} className="text-red-400"><Trash2 size={10}/></button></div>))}</div></div>
                        <div className="bg-slate-50 p-4 rounded-xl border"><label className="block text-[10px] font-black uppercase mb-2">Specs</label><div className="flex gap-2 mb-2"><input placeholder="Key" value={newSpecK} onChange={e=>setNewSpecK(e.target.value)} className="flex-1 p-2 text-xs border rounded" /><input placeholder="Value" value={newSpecV} onChange={e=>setNewSpecV(e.target.value)} className="flex-1 p-2 text-xs border rounded" /><button onClick={()=>{ if(newSpecK.trim() && newSpecV.trim()){ setDraft({...draft, specs: {...draft.specs, [newSpecK.trim()]: newSpecV.trim()}}); setNewSpecK(''); setNewSpecV(''); } }} className="p-2 bg-blue-600 text-white rounded"><Plus size={14}/></button></div><div className="grid grid-cols-1 gap-2">{Object.entries(draft.specs).map(([k,v])=>(<div key={k} className="flex justify-between p-2 bg-white rounded text-[10px] font-bold"><span>{k}: {v}</span><button onClick={()=>{const s={...draft.specs}; delete s[k]; setDraft({...draft, specs: s});}} className="text-red-400"><Trash2 size={10}/></button></div>))}</div></div>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={onCancel} className="px-6 py-2 text-slate-500 font-bold text-xs uppercase">Cancel</button><button onClick={() => onSave(draft)} className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase rounded-xl">Confirm</button></div>
        </div>
    );
};

const KioskEditorModal = ({ kiosk, onSave, onClose }: { kiosk: KioskRegistry, onSave: (k: KioskRegistry) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState({ ...kiosk });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-black text-xs uppercase">Edit Device</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-6 space-y-4"><InputField label="Name" val={draft.name} onChange={(e:any) => setDraft({...draft, name: e.target.value})} /><InputField label="Zone" val={draft.assignedZone || ''} onChange={(e:any) => setDraft({...draft, assignedZone: e.target.value})} /><div><label className="block text-[10px] font-black uppercase mb-2">Type</label><div className="grid grid-cols-3 gap-2">{['kiosk', 'mobile', 'tv'].map(t=>(<button key={t} onClick={()=>setDraft({...draft, deviceType: t as any})} className={`p-2 rounded border text-[9px] font-bold uppercase ${draft.deviceType===t ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}>{t}</button>))}</div></div></div>
                <div className="p-4 border-t flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-slate-500">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-lg">Save</button></div>
            </div>
        </div>
    );
};

const MoveProductModal = ({ product, allBrands, currentBrandId, currentCategoryId, onClose, onMove }: any) => {
    const [targetBrandId, setTargetBrandId] = useState(currentBrandId);
    const [targetCategoryId, setTargetCategoryId] = useState(currentCategoryId);
    const targetBrand = allBrands.find((b:any) => b.id === targetBrandId);
    useEffect(() => { if(targetBrand && !targetBrand.categories.find((c:any)=>c.id === targetCategoryId)) setTargetCategoryId(targetBrand.categories[0]?.id || ''); }, [targetBrandId]);
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-black text-xs uppercase">Move Product</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-6 space-y-4">
                    <div className="p-3 bg-blue-50 rounded-xl"><div className="text-[9px] font-bold text-blue-400 uppercase">Product</div><div className="font-bold text-sm">{product.name}</div></div>
                    <div><label className="block text-[10px] font-black uppercase mb-1">Target Brand</label><select value={targetBrandId} onChange={e=>setTargetBrandId(e.target.value)} className="w-full p-2 border rounded text-sm font-bold">{allBrands.map((b:any)=>(<option key={b.id} value={b.id}>{b.name}</option>))}</select></div>
                    <div><label className="block text-[10px] font-black uppercase mb-1">Target Category</label><select value={targetCategoryId} onChange={e=>setTargetCategoryId(e.target.value)} className="w-full p-2 border rounded text-sm font-bold">{targetBrand?.categories.map((c:any)=>(<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-slate-500">Cancel</button><button onClick={() => onMove(product, targetBrandId, targetCategoryId)} className="px-6 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-lg">Move</button></div>
            </div>
        </div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: any) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0"><h3 className="font-black text-xs uppercase">Edit TV Model</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <InputField label="Model Name" val={draft.name} onChange={(e:any)=>setDraft({...draft, name: e.target.value})} />
                    <FileUpload label="Videos" accept="video/*" allowMultiple onUpload={(urls:any)=>setDraft(p=>({...p, videoUrls: [...p.videoUrls, ...(Array.isArray(urls)?urls:[urls])]}))} />
                    <div className="space-y-2">{draft.videoUrls.map((u,i)=>(<div key={i} className="flex items-center justify-between p-2 bg-slate-50 border rounded text-[10px] font-mono"><span>Video {i+1}</span><button onClick={()=>setDraft(p=>({...p, videoUrls: p.videoUrls.filter((_,x)=>x!==i)}))} className="text-red-500"><Trash2 size={12}/></button></div>))}</div>
                </div>
                <div className="p-4 border-t bg-white flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-slate-500">Cancel</button><button onClick={()=>onSave(draft)} className="px-6 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-lg">Save</button></div>
            </div>
        </div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: any) => {
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const reset = () => { setEditId(null); setName(''); setPin(''); };
    return (
        <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                <div className="grid grid-cols-2 gap-4"><InputField label="Name" val={name} onChange={(e:any)=>setName(e.target.value)} /><InputField label="PIN" val={pin} onChange={(e:any)=>setPin(e.target.value)} /></div>
                <button onClick={() => { if(!name || !pin) return; const newList = editId ? admins.map((a:any)=>a.id===editId ? {...a, name, pin} : a) : [...admins, { id: generateId('adm'), name, pin, isSuperAdmin: false, permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true } }]; onUpdate(newList); reset(); }} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase">{editId ? 'Update' : 'Create'} Admin</button>
            </div>
            <div className="space-y-2">{admins.map((a:any)=>(<div key={a.id} className="p-4 bg-white border rounded-xl flex justify-between items-center"><div className="font-bold text-sm uppercase">{a.name} <span className="text-[10px] text-slate-400 ml-2">PIN: {a.pin}</span></div><div className="flex gap-2"><button onClick={()=>{setEditId(a.id); setName(a.name); setPin(a.pin);}} className="text-blue-500"><Edit2 size={14}/></button>{!a.isSuperAdmin && <button onClick={()=>onUpdate(admins.filter((x:any)=>x.id!==a.id))} className="text-red-500"><Trash2 size={14}/></button>}</div></div>))}</div>
        </div>
    );
};

const importZip = async (file: File, onProgress: any) => {
    const zip = new JSZip(); const l = await zip.loadAsync(file);
    const text = await l.file("store_config.json")?.async("text");
    if(text) { const d = JSON.parse(text); return d.brands || []; }
    return [];
};

const downloadZip = async (data: any) => {
    const zip = new JSZip(); zip.file("store_config.json", JSON.stringify(data, null, 2));
    const content = await zip.generateAsync({type:"blob"});
    const link = document.createElement('a'); link.href = URL.createObjectURL(content); link.download = `kiosk_backup_${new Date().toISOString()}.zip`; link.click();
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
  const [selectedTVBrand, setSelectedTVBrand] = useState<TVBrand | null>(null);
  const [editingTVModel, setEditingTVModel] = useState<TVModel | null>(null);
  const [historyTab, setHistoryTab] = useState<'brands' | 'catalogues' | 'deletedItems'>('deletedItems');
  const [historySearch, setHistorySearch] = useState('');
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState('');
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
  ].filter(tab => tab.id === 'guide' || (currentUser && currentUser.permissions[tab.id as keyof AdminPermissions]));

  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) setLocalData(storeData); }, [storeData]);

  const handleLocalUpdate = (newData: StoreData) => { setLocalData(newData); setHasUnsavedChanges(true); };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };
  const updateFleetMember = async (kiosk: KioskRegistry) => { if(supabase) { await supabase.from('kiosks').upsert({ id: kiosk.id, name: kiosk.name, device_type: kiosk.deviceType, assigned_zone: kiosk.assignedZone }); onRefresh(); } };
  const removeFleetMember = async (id: string) => { if(confirm("Remove device?") && supabase) { await supabase.from('kiosks').delete().eq('id', id); onRefresh(); } };
  const handleMoveProduct = (product: Product, targetBrandId: string, targetCategoryId: string) => {
      if(!localData) return;
      const bSource = localData.brands.find(b => b.categories.some(c => c.products.some(p => p.id === product.id)));
      const cSource = bSource?.categories.find(c => c.products.some(p => p.id === product.id));
      if(!bSource || !cSource) return;
      const updatedBrands = localData.brands.map(b => {
          if(b.id === bSource.id) return { ...b, categories: b.categories.map(c => c.id === cSource.id ? { ...c, products: c.products.filter(p => p.id !== product.id) } : c) };
          if(b.id === targetBrandId) return { ...b, categories: b.categories.map(c => c.id === targetCategoryId ? { ...c, products: [...c.products, product] } : c) };
          return b;
      });
      handleLocalUpdate({ ...localData, brands: updatedBrands }); setMovingProduct(null);
  };
  const formatRelativeTime = (iso: string) => { if(!iso) return '--'; const d = new Date(iso); return d.toLocaleDateString(); };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = [...(localData.brands || [])].sort((a,b)=>a.name.localeCompare(b.name));
  const tvBrands = [...(localData.tv?.brands || [])].sort((a,b)=>a.name.localeCompare(b.name));
  const archivedGenericItems = (localData.archive?.deletedItems || []).filter(i => i.name.toLowerCase().includes(historySearch.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                 <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div>
                 <div className="flex items-center gap-4"><button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs ${hasUnsavedChanges ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}><SaveAll size={16} className="inline mr-2" />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button></div>
                 <div className="flex items-center gap-3"><button onClick={onRefresh} className="p-2 bg-slate-800 rounded-lg"><RefreshCw size={16} /></button><button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/50 text-red-400 rounded-lg"><LogOut size={16} /></button></div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500'}`}>{tab.label}</button>))}</div>
        </header>

        {activeTab === 'marketing' && (
            <div className="bg-white border-b flex overflow-x-auto no-scrollbar shadow-sm z-10 shrink-0">
                {['hero', 'ads', 'catalogues'].map(s=>(<button key={s} onClick={() => setActiveSubTab(s)} className={`px-6 py-3 text-xs font-bold uppercase tracking-wide ${activeSubTab === s ? 'text-purple-600 bg-purple-50' : 'text-slate-500'}`}>{s}</button>))}
            </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-20">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && (!selectedBrand ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{brands.map(b=>(<div key={b.id} className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center gap-2 relative group"><div className="aspect-square bg-slate-50 flex items-center justify-center p-2">{b.logoUrl ? <img src={b.logoUrl} className="max-h-full max-w-full object-contain"/> : <span className="text-3xl font-black text-slate-200">{b.name.charAt(0)}</span>}</div><h3 className="font-black text-sm uppercase truncate w-full text-center">{b.name}</h3><button onClick={()=>setSelectedBrand(b)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-[10px] font-bold uppercase">Manage</button></div>))}</div>
            ) : !selectedCategory ? (
                <div className="space-y-6"><button onClick={()=>setSelectedBrand(null)} className="p-2 bg-white border rounded-lg text-slate-500 mb-4"><ArrowLeft size={20}/></button><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{selectedBrand.categories.map(c=>(<button key={c.id} onClick={()=>setSelectedCategory(c)} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center gap-2"><Box className="text-slate-400"/><h3 className="font-black text-xs uppercase">{c.name}</h3><span className="text-[10px] font-bold text-slate-400">{c.products.length} Products</span></button>))}</div></div>
            ) : (
                <div className="space-y-6"><button onClick={()=>setSelectedCategory(null)} className="p-2 bg-white border rounded-lg text-slate-500 mb-4"><ArrowLeft size={20}/></button><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{selectedCategory.products.map(p=>(<div key={p.id} className="bg-white p-4 rounded-xl border shadow-sm group relative"><div className="aspect-square bg-slate-50 p-2 flex items-center justify-center mb-2">{p.imageUrl ? <img src={p.imageUrl} className="max-h-full max-w-full object-contain"/> : <Box className="text-slate-100"/>}</div><h4 className="font-bold text-xs uppercase truncate">{p.name}</h4><div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>setEditingProduct(p)} className="flex-1 py-1.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded">Edit</button><button onClick={()=>setMovingProduct(p)} className="flex-1 py-1.5 bg-orange-500 text-white text-[9px] font-bold uppercase rounded">Move</button></div></div>))}</div></div>
            ))}

            {activeTab === 'pricelists' && <PricelistManager pricelists={localData.pricelists||[]} pricelistBrands={localData.pricelistBrands||[]} onSavePricelists={(p:any)=>handleLocalUpdate({...localData, pricelists:p})} onSaveBrands={(b:any)=>handleLocalUpdate({...localData, pricelistBrands:b})} onDeletePricelist={(id:any)=>handleLocalUpdate({...localData, pricelists:localData.pricelists?.filter(x=>x.id!==id)})} />}
            {activeTab === 'tv' && (!selectedTVBrand ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{tvBrands.map(b=>(<div key={b.id} onClick={()=>setSelectedTVBrand(b)} className="bg-white p-6 rounded-2xl border cursor-pointer hover:border-blue-500 flex flex-col items-center gap-2"><Tv className="text-slate-300"/><h3 className="font-black text-xs uppercase">{b.name}</h3></div>))}</div> : <div className="space-y-6"><button onClick={()=>setSelectedTVBrand(null)} className="p-2 bg-white border rounded-lg text-slate-500"><ArrowLeft size={20}/></button><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{selectedTVBrand.models.map(m=>(<div key={m.id} className="bg-white p-4 rounded-xl border flex justify-between items-center"><div className="font-bold text-xs uppercase">{m.name}</div><button onClick={()=>setEditingTVModel(m)} className="text-blue-500"><Edit2 size={14}/></button></div>))}</div></div>)}
            
            {activeTab === 'fleet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {localData.fleet?.map(kiosk => (
                        <div key={kiosk.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div><h4 className="text-white font-black uppercase text-sm mb-1">{kiosk.name}</h4><div className="text-[9px] font-bold text-slate-500 uppercase">{kiosk.assignedZone || 'GLOBAL'}</div></div>
                                <SignalStrengthBars strength={kiosk.wifiStrength || 0} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-2xl">
                                <div><div className="text-[8px] font-bold text-slate-500 uppercase">Last Seen</div><div className="text-[10px] text-white font-bold">{formatRelativeTime(kiosk.last_seen)}</div></div>
                                <div><div className="text-[8px] font-bold text-slate-500 uppercase">Version</div><div className="text-[10px] text-white font-bold">v{kiosk.version}</div></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingKiosk(kiosk)} className="flex-1 p-2 bg-slate-900 hover:bg-blue-600 text-[9px] font-black uppercase text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800">Edit</button>
                                <button onClick={() => removeFleetMember(kiosk.id)} className="w-12 bg-slate-900 hover:bg-red-600 text-[9px] font-black uppercase text-slate-700 hover:text-white rounded-xl transition-all border border-slate-800 flex items-center justify-center"><Trash2 size={12}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border shadow-sm min-h-[400px]">
                    <div className="flex border-b bg-slate-50"><button onClick={()=>setHistoryTab('deletedItems')} className={`px-6 py-3 text-[10px] font-black uppercase ${historyTab==='deletedItems'?'bg-white border-b-2 border-blue-600':''}`}>Deleted Items</button></div>
                    <div className="p-6 space-y-3">{archivedGenericItems.map(item=>(<div key={item.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center"><div className="font-bold text-xs uppercase">{item.name} <span className="text-[9px] text-slate-400 ml-2">Type: {item.type}</span></div><button onClick={()=>{ if(item.type==='pricelist') handleLocalUpdate({...localData, pricelists: [...(localData.pricelists||[]), item.data], archive: {...localData.archive!, deletedItems: localData.archive?.deletedItems?.filter(x=>x.id!==item.id)}}); }} className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded">Restore</button></div>))}</div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white p-8 rounded-3xl border shadow-sm"><h3 className="font-black text-sm uppercase mb-6">Launcher Icons</h3><div className="grid grid-cols-2 gap-8"><FileUpload label="Kiosk Icon" currentUrl={localData.appConfig?.kioskIconUrl} onUpload={(u:any)=>handleLocalUpdate({...localData, appConfig:{...localData.appConfig, kioskIconUrl:u}})} /><FileUpload label="Admin Icon" currentUrl={localData.appConfig?.adminIconUrl} onUpload={(u:any)=>handleLocalUpdate({...localData, appConfig:{...localData.appConfig, adminIconUrl:u}})} /></div></div>
                    <div className="bg-white p-8 rounded-3xl border shadow-sm"><h3 className="font-black text-sm uppercase mb-6">User Access</h3><AdminManager admins={localData.admins||[]} onUpdate={(a:any)=>handleLocalUpdate({...localData, admins:a})} currentUser={currentUser} /></div>
                    <div className="bg-white p-8 rounded-3xl border shadow-sm"><h3 className="font-black text-sm uppercase mb-6">Backups</h3><div className="grid grid-cols-2 gap-4"><button onClick={()=>downloadZip(localData)} className="p-6 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs">Download ZIP Backup</button></div></div>
                </div>
            )}
        </main>

        {editingProduct && <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"><div className="w-full max-w-6xl h-[90vh]"><ProductEditor product={editingProduct} onCancel={()=>setEditingProduct(null)} onSave={(p)=>{ const updatedCat = {...selectedCategory!, products: selectedCategory!.products.find(x=>x.id===p.id)?selectedCategory!.products.map(x=>x.id===p.id?p:x):[...selectedCategory!.products, p]}; const updatedBrand={...selectedBrand!, categories: selectedBrand!.categories.map(c=>c.id===updatedCat.id?updatedCat:c)}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updatedBrand.id?updatedBrand:b)}); setEditingProduct(null); }} /></div></div>}
        {movingProduct && selectedBrand && selectedCategory && <MoveProductModal product={movingProduct} allBrands={localData.brands} currentBrandId={selectedBrand.id} currentCategoryId={selectedCategory.id} onClose={()=>setMovingProduct(null)} onMove={handleMoveProduct} />}
        {editingKiosk && <KioskEditorModal kiosk={editingKiosk} onClose={()=>setEditingKiosk(null)} onSave={(k)=>{updateFleetMember(k); setEditingKiosk(null);}} />}
        {editingTVModel && selectedTVBrand && <TVModelEditor model={editingTVModel} onClose={()=>setEditingTVModel(null)} onSave={(m:any)=>{ const updatedBrand={...selectedTVBrand, models: selectedTVBrand.models.find(x=>x.id===m.id)?selectedTVBrand.models.map(x=>x.id===m.id?m:x):[...(selectedTVBrand.models||[]), m]}; handleLocalUpdate({...localData, tv:{...localData.tv, brands: tvBrands.map(b=>b.id===updatedBrand.id?updatedBrand:b)} as any}); setEditingTVModel(null); }} />}
    </div>
  );
};