
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

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
        { id: 'architecture', label: '1. How it Works', icon: <Network size={16} />, desc: 'The "Brain" of the Kiosk' },
        { id: 'inventory', label: '2. Product Sorting', icon: <Box size={16}/>, desc: 'Hierarchy & Data JSONB' },
        { id: 'pricelists', label: '3. Price Logic', icon: <Table size={16}/>, desc: 'Auto-Rounding & PDF' },
        { id: 'screensaver', label: '4. Visual Loop', icon: <Zap size={16}/>, desc: 'Double-Buffer Engine' },
        { id: 'fleet', label: '5. Fleet Watch', icon: <Activity size={16}/>, desc: 'Telemetry & Heartbeat' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Playlist Management' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <style>{`
                @keyframes flow-horizontal { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(400%); opacity: 0; } }
                .data-flow { animation: flow-horizontal 3s linear infinite; }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.4); opacity: 0; } }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
                @keyframes orbit { 0% { transform: rotate(0deg) translateX(50px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); } }
                .orbit-item { animation: orbit 8s linear infinite; }
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
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white relative p-6 md:p-12 lg:p-20 scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01: Core Brain</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk works <strong>offline</strong> first. It only needs internet to "sync up" with your changes.</p>
                        </div>
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="flex flex-col items-center gap-4 group"><div className="w-24 h-24 bg-white/5 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110"><Monitor className="text-blue-400" size={40} /></div><div className="text-center"><div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div><div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Updates Sent</div></div></div>
                                <div className="flex-1 w-full h-24 relative flex items-center justify-center"><div className="w-full h-1 bg-white/5 rounded-full relative"><div className="absolute inset-0 bg-blue-500/20 blur-md"></div><div className="data-flow absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]"></div></div><div className="absolute -bottom-8 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest">Encrypted Cloud Tunnel</div></div>
                                <div className="flex flex-col items-center gap-4 group"><div className="w-32 h-20 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:rotate-1"><Tablet className="text-green-400" size={32} /></div><div className="text-center"><div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div><div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Local Storage Active</div></div></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-purple-500/20">Module 02: Data Structure</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Relational Hierarchy</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                Products are organized in a strict <strong className="text-purple-600">3-Tier Tree</strong>. This ensures navigation is always intuitive: Brand &rarr; Category &rarr; Product.
                            </p>
                        </div>

                        <div className="relative p-12 bg-slate-50 rounded-[3rem] border border-slate-200 overflow-hidden min-h-[400px] flex items-center justify-center">
                             <div className="flex items-center gap-8 relative z-10">
                                 {/* Brand Node */}
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="w-20 h-20 bg-white border-2 border-purple-200 rounded-2xl flex items-center justify-center shadow-lg"><HexagonIcon size={40} className="text-purple-600" /></div>
                                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Brand</span>
                                 </div>
                                 <div className="w-12 h-0.5 bg-slate-300"></div>
                                 {/* Category Node */}
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="w-20 h-20 bg-white border-2 border-blue-200 rounded-2xl flex items-center justify-center shadow-lg"><Box size={40} className="text-blue-600" /></div>
                                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Category</span>
                                 </div>
                                 <div className="w-12 h-0.5 bg-slate-300"></div>
                                 {/* Product Node */}
                                 <div className="flex flex-col items-center gap-2">
                                     <div className="w-20 h-20 bg-white border-2 border-green-200 rounded-2xl flex items-center justify-center shadow-lg"><Smartphone size={40} className="text-green-600" /></div>
                                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Product</span>
                                 </div>
                             </div>
                             <div className="absolute inset-0 border-[20px] border-slate-100 rounded-[3rem] pointer-events-none"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 text-white p-8 rounded-3xl">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2"><Binary size={20} className="text-blue-400"/> JSONB Storage</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Technical Specs (like "Screen Size", "Processor") are stored as a flexible JSON Blob. This means you can add <strong>infinite custom fields</strong> to any product without needing a developer to update the database schema.
                                </p>
                            </div>
                            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4 flex items-center gap-2"><Search size={20} className="text-purple-500"/> Search Flattening</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    When you type in the search bar, the system "flattens" the 3-Tier Tree into a single list of thousands of items in milliseconds. This allows instant filtering by SKU, Name, or Description across all brands simultaneously.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-red-500/20">Module 03: Price Engine</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Auto-Rounding Logic</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                The system ensures premium aesthetics by cleaning up messy price inputs automatically.
                            </p>
                        </div>

                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[300px] flex items-center justify-center gap-12">
                             <div className="flex flex-col items-center gap-2 opacity-50">
                                 <span className="font-mono text-2xl text-slate-400 line-through decoration-red-500 decoration-2">R 199.99</span>
                                 <span className="text-[10px] font-black text-slate-600 uppercase">Input</span>
                             </div>
                             <ArrowRight size={32} className="text-slate-600" />
                             <div className="flex flex-col items-center gap-2">
                                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-pulse">
                                     <CalculatorIcon size={32} className="text-white" />
                                 </div>
                                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-900/30 px-2 py-1 rounded">Algorithm</span>
                             </div>
                             <ArrowRight size={32} className="text-slate-600" />
                             <div className="flex flex-col items-center gap-2">
                                 <span className="font-mono text-4xl text-white font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">R 200</span>
                                 <span className="text-[10px] font-black text-green-400 uppercase">Output</span>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase">Ruleset</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
                                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">1</div>
                                        <span>Decimals are always rounded <strong>UP</strong> (Ceiling).</span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
                                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">2</div>
                                        <span>Prices ending in <strong>.9</strong> bump to the next whole number.</span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
                                        <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">3</div>
                                        <span>Empty columns (e.g. no SKUs) are auto-hidden in PDF.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14}/> Client-Side Rendering</div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    We use the <code>jsPDF</code> engine to generate the PDF directly on your device. This means no server usage limits, and your data never leaves your browser during generation. The exact X/Y coordinates of every text element are calculated dynamically based on how many columns are visible.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 04: Visual Loop</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Double-Buffer Engine</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                To achieve <strong>seamless transitions</strong> between high-res videos and images, we use two invisible video players that swap instantly.
                            </p>
                        </div>

                        <div className="relative p-12 bg-black rounded-[3rem] overflow-hidden min-h-[350px] flex items-center justify-center border border-slate-800">
                             <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover mix-blend-overlay"></div>
                             
                             <div className="relative z-10 grid grid-cols-2 gap-12 w-full max-w-2xl">
                                 <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                     <div className="text-blue-400 font-black text-2xl mb-1">Buffer A</div>
                                     <div className="text-[10px] uppercase font-bold text-white tracking-widest bg-green-500 px-2 py-0.5 rounded inline-block mb-4">Playing</div>
                                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-2/3"></div></div>
                                 </div>
                                 <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 text-center opacity-50 scale-95">
                                     <div className="text-slate-500 font-black text-2xl mb-1">Buffer B</div>
                                     <div className="text-[10px] uppercase font-bold text-white tracking-widest bg-orange-500 px-2 py-0.5 rounded inline-block mb-4">Preloading</div>
                                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-1/4 animate-pulse"></div></div>
                                 </div>
                             </div>
                             <div className="absolute bottom-8 text-white/50 text-xs font-mono uppercase tracking-[0.2em] animate-pulse">Cross-Fade Active</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { title: "Idle Trigger", desc: "Starts automatically after 60s of no touch events." },
                                { title: "Smart Shuffle", desc: "Prioritizes products added in the last 30 days." },
                                { title: "Sleep Mode", desc: "Goes black outside business hours (e.g. 8PM - 8AM)." }
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-black text-slate-900 uppercase text-xs mb-2">{card.title}</h4>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-green-500/20">Module 05: Fleet Watch</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Live Telemetry</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                Every 30 seconds, each kiosk sends a tiny "Heartbeat" packet to the cloud to report its health status.
                            </p>
                        </div>

                        <div className="relative p-12 bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden min-h-[400px] flex items-center justify-center">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.1)_0%,_transparent_70%)]"></div>
                             
                             {/* Central Hub */}
                             <div className="relative w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-4 border-green-500/30 z-20 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                                 <Radio size={40} className="text-green-500" />
                             </div>

                             {/* Orbiting Devices */}
                             <div className="absolute w-[300px] h-[300px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]">
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-2 rounded-xl border border-slate-700 text-blue-400 shadow-xl"><Tablet size={20} /></div>
                                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-slate-900 p-2 rounded-xl border border-slate-700 text-purple-400 shadow-xl"><Smartphone size={20} /></div>
                             </div>
                             <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]">
                                 <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 bg-slate-900 p-2 rounded-xl border border-slate-700 text-indigo-400 shadow-xl"><Tv size={20} /></div>
                             </div>

                             <div className="absolute bottom-8 left-8 text-green-500/50 font-mono text-[10px] uppercase">Ping: 34ms</div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                            <h3 className="text-lg font-black text-slate-900 uppercase mb-6 flex items-center gap-2"><Activity size={18}/> Heartbeat Payload</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Last Seen</div>
                                    <div className="font-mono font-bold text-slate-800 text-xs">Timestamp</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Signal</div>
                                    <div className="font-mono font-bold text-slate-800 text-xs">WiFi (0-100)</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Config</div>
                                    <div className="font-mono font-bold text-slate-800 text-xs">Hash Check</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div className="text-[10px] font-black text-red-400 uppercase mb-1">Command</div>
                                    <div className="font-mono font-bold text-red-800 text-xs">Remote Restart</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-indigo-500/20">Module 06: TV Protocol</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Passive Loop Mode</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                                Unlike Kiosk Mode, TV Mode is designed for zero interaction. It suppresses UI controls and loops playlists infinitely.
                            </p>
                        </div>

                        <div className="relative p-12 bg-slate-100 rounded-[3rem] border border-slate-200 overflow-hidden min-h-[300px] flex items-center justify-center">
                             <div className="flex items-center gap-4">
                                 {[1,2,3].map(i => (
                                     <div key={i} className="w-32 h-48 bg-slate-900 rounded-xl border-4 border-white shadow-2xl relative flex items-center justify-center group overflow-hidden">
                                         <div className="absolute top-2 left-2 text-[10px] font-black text-white/50">0{i}</div>
                                         <PlayCircle size={32} className="text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                                         <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
                                     </div>
                                 ))}
                                 <RefreshCw size={32} className="text-slate-300 animate-spin-slow ml-4" />
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <h4 className="font-black text-indigo-900 uppercase text-xs mb-2">No Sleep</h4>
                                <p className="text-xs text-indigo-800 leading-relaxed font-medium">The idle timer and screensaver logic are completely disabled in TV mode to prevent interruption of the video loop.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <h4 className="font-black text-slate-900 uppercase text-xs mb-2">Auto-Hide UI</h4>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Player controls (Play/Pause, Next) automatically fade out after 4 seconds of inactivity to keep the screen clean.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-40"></div>
            </div>
        </div>
    );
};

// Icons not imported in main list
const HexagonIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
);

const CalculatorIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
);

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

      const uploadSingle = async (file: File) => {
           try {
              const url = await uploadFileToStorage(file);
              return url;
           } catch (e: any) {
              const msg = e.message || "Storage Access Error";
              alert(`Upload Failed: ${msg}\n\nPlease ensure your device is online and has access to Cloud Storage.`);
              throw e;
           }
      };

      try {
          if (allowMultiple) {
              const results: string[] = [];
              for(let i=0; i<files.length; i++) {
                  try {
                    const url = await uploadSingle(files[i]);
                    results.push(url);
                  } catch (e) {
                    // Prevent pushing undefined/null
                  }
                  setUploadProgress(((i+1)/files.length)*100);
              }
              if (results.length > 0) {
                  onUpload(results, fileType);
              }
          } else {
              try {
                const url = await uploadSingle(files[0]);
                setUploadProgress(100);
                onUpload(url, fileType);
              } catch (e) {
                // Alert handled in uploadSingle
              }
          }
      } catch (err) { 
          console.error(err);
      } 
      finally { 
          setTimeout(() => { setIsProcessing(false); setUploadProgress(0); }, 500); 
          e.target.value = ''; // Reset input to allow re-selecting same file if needed
      }
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
        <label className={`flex-1 text-center cursor-pointer bg-slate-900 text-white px-2 py-2 rounded-lg font-bold text-[9px] uppercase whitespace-nowrap overflow-hidden text-ellipsis ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload size={10} className="inline mr-1" /> {isProcessing ? 'Uploading...' : 'Select File'}
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

const CatalogueManager = ({ catalogues, onSave, brandId }: { catalogues: Catalogue[], onSave: (c: Catalogue[], immediate: boolean) => void, brandId?: string }) => {
    const [localList, setLocalList] = useState(catalogues || []);
    useEffect(() => setLocalList(catalogues || []), [catalogues]);

    const handleUpdate = (newList: Catalogue[], immediate = false) => {
        setLocalList(newList);
        onSave(newList, immediate); 
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
        }], true);
    };

    const updateCatalogue = (id: string, updates: Partial<Catalogue>, immediate = false) => {
        handleUpdate(localList.map(c => c.id === id ? { ...c, ...updates } : c), immediate);
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
                                <>
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
                                    <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase">Promotional Sub-Header</label>
                                        <textarea 
                                            value={cat.promoText || ''} 
                                            onChange={(e) => updateCatalogue(cat.id, { promoText: e.target.value })} 
                                            className="w-full text-xs border border-slate-200 rounded p-1 resize-none h-12"
                                            placeholder="Enter promo text..."
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                <FileUpload 
                                    label="Thumbnail (Image)" 
                                    accept="image/*" 
                                    currentUrl={cat.thumbnailUrl || (cat.pages?.[0])}
                                    onUpload={(url: any) => updateCatalogue(cat.id, { thumbnailUrl: url }, true)} 
                                />
                                <FileUpload 
                                    label="Document (PDF)" 
                                    accept="application/pdf" 
                                    currentUrl={cat.pdfUrl}
                                    icon={<FileText />}
                                    onUpload={(url: any) => updateCatalogue(cat.id, { pdfUrl: url }, true)} 
                                />
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                <button onClick={() => handleUpdate(localList.filter(c => c.id !== cat.id), true)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase"><Trash2 size={12} /> Delete Catalogue</button>
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
  const [title, setTitle] = useState(pricelist.title || ''); 
  const [isImporting, setIsImporting] = useState(false);
  const [headers, setHeaders] = useState(pricelist.headers || {
      sku: 'SKU',
      description: 'Description',
      normalPrice: 'Normal Price',
      promoPrice: 'Promo Price'
  });
  const [showHeaderConfig, setShowHeaderConfig] = useState(false);
  
  const addItem = () => {
    setItems([...items, { id: generateId('item'), sku: '', description: '', normalPrice: '', promoPrice: '', imageUrl: '' }]);
  };

  const updateItem = (id: string, field: keyof PricelistItem, val: string) => {
    const finalVal = field === 'description' ? val.toUpperCase() : val;
    setItems(items.map(item => item.id === id ? { ...item, [field]: finalVal } : item));
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
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData.length === 0) { alert("The selected file appears to be empty."); return; }
        const validRows = jsonData.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));
        if (validRows.length === 0) { alert("No data rows found in the file."); return; }
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
                description: String(row[dIdx] || '').trim().toUpperCase(),
                normalPrice: formatImported(row[nIdx]),
                promoPrice: row[pIdx] ? formatImported(row[pIdx]) : '',
                imageUrl: ''
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
                    } else { onlyNew.push(newItem); }
                });
                setItems([...merged, ...onlyNew]);
                alert(`Merge Complete: Updated existing SKUs and added ${onlyNew.length} new items.`);
            } else { setItems(newImportedItems); alert("Pricelist replaced with imported data."); }
        } else { alert("Could not extract any valid items. Ensure the sheet follows the format: SKU, Description, Normal Price, Promo Price."); }
    } catch (err) { console.error("Spreadsheet Import Error:", err); alert("Error parsing file. Ensure it is a valid .xlsx or .csv file."); } finally { setIsImporting(false); e.target.value = ''; }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <Table className="text-blue-600" size={24} />
                <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="font-black text-slate-900 uppercase text-lg bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full transition-colors placeholder:text-slate-300"
                    placeholder="ENTER LIST TITLE..."
                />
            </div>
            <div className="flex items-center gap-4">
                <p className="text-xs text-slate-500 font-bold uppercase ml-8">{pricelist.month} {pricelist.year}</p>
                <button onClick={() => setShowHeaderConfig(!showHeaderConfig)} className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><Settings size={12}/> Table Settings</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg cursor-pointer">
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileInput size={16} />} Import Excel/CSV
              <input type="file" className="hidden" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={handleSpreadsheetImport} disabled={isImporting} />
            </label>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/10"><Plus size={16} /> Add Row</button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 ml-2"><X size={24}/></button>
          </div>
        </div>
        
        {showHeaderConfig && (
            <div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">SKU Header</label>
                    <input value={headers.sku} onChange={(e) => setHeaders({...headers, sku: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" />
                </div>
                <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Description Header</label>
                    <input value={headers.description} onChange={(e) => setHeaders({...headers, description: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" />
                </div>
                <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Normal Price Header</label>
                    <input value={headers.normalPrice} onChange={(e) => setHeaders({...headers, normalPrice: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" />
                </div>
                <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Promo Price Header</label>
                    <input value={headers.promoPrice} onChange={(e) => setHeaders({...headers, promoPrice: e.target.value})} className="w-full text-xs font-bold p-2 rounded border border-slate-300 uppercase" />
                </div>
            </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3"><Info size={18} className="text-blue-500 shrink-0" /><p className="text-[10px] text-blue-800 font-bold uppercase leading-tight">Price Strategy: Decimals are rounded UP (129.99 → 130). Values ending in 9 are pushed to the next round number (799 → 800). Whole numbers like 122 are kept.</p></div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-16">Visual</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.sku || 'SKU'}</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.description || 'Description'}</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.normalPrice || 'Normal Price'}</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">{headers.promoPrice || 'Promo Price'}</th>
                <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2">
                    <div className="w-12 h-12 relative group/item-img">
                      {item.imageUrl ? (
                        <><img src={item.imageUrl} className="w-full h-full object-contain rounded bg-white border border-slate-100" /><button onClick={(e) => { e.stopPropagation(); if(confirm("Remove this image?")) updateItem(item.id, 'imageUrl', ''); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/item-img:opacity-100 transition-opacity z-10 hover:bg-red-600"><X size={10} strokeWidth={3} /></button></>
                      ) : (
                        <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300"><ImageIcon size={14} /></div>
                      )}
                      {!item.imageUrl && (
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/item-img:opacity-100 flex items-center justify-center cursor-pointer rounded transition-opacity"><Upload size={12} className="text-white" /><input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { try { const url = await uploadFileToStorage(e.target.files[0]); updateItem(item.id, 'imageUrl', url); } catch (err) { alert("Upload failed"); } } }} /></label>
                      )}
                    </div>
                  </td>
                  <td className="p-2"><input value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm" placeholder="SKU-123" /></td>
                  <td className="p-2"><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-sm uppercase" placeholder="PRODUCT DETAILS..." /></td>
                  <td className="p-2"><input value={item.normalPrice} onBlur={(e) => handlePriceBlur(item.id, 'normalPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'normalPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-black text-sm" placeholder="R 999" /></td>
                  <td className="p-2"><input value={item.promoPrice} onBlur={(e) => handlePriceBlur(item.id, 'promoPrice', e.target.value)} onChange={(e) => updateItem(item.id, 'promoPrice', e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent focus:border-red-500 outline-none font-black text-sm text-red-600" placeholder="R 799" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              ))}
              {items.length === 0 && (<tr><td colSpan={6} className="py-20 text-center text-slate-400 text-sm font-bold uppercase italic">No items yet. Click "Add Row" or "Import" to start.</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button>
          <button onClick={() => { onSave({ ...pricelist, title, items, headers, type: 'manual', dateAdded: new Date().toISOString() }); onClose(); }} className="px-8 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={16} /> Save Pricelist Table</button>
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
    onSavePricelists: (p: Pricelist[], immediate?: boolean) => void,
    onSaveBrands: (b: PricelistBrand[], immediate?: boolean) => void,
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
        onSaveBrands([...pricelistBrands, newBrand], true);
        setSelectedBrand(newBrand);
    };

    const updateBrand = (id: string, updates: Partial<PricelistBrand>, immediate = false) => {
        const updatedBrands = pricelistBrands.map(b => b.id === id ? { ...b, ...updates } : b);
        onSaveBrands(updatedBrands, immediate);
        if (selectedBrand?.id === id) { setSelectedBrand({ ...selectedBrand, ...updates }); }
    };

    const deleteBrand = (id: string) => {
        if (confirm("Delete this brand? This will also hide associated pricelists.")) {
            onSaveBrands(pricelistBrands.filter(b => b.id !== id), true);
        }
    };

    const addPricelist = () => {
        if (!selectedBrand) return;
        const newItem: Pricelist = {
            id: generateId('pl'),
            brandId: selectedBrand.id,
            title: 'New Pricelist',
            url: '',
            type: 'pdf',
            month: 'January',
            year: new Date().getFullYear().toString(),
            dateAdded: new Date().toISOString(),
            kind: 'standard'
        };
        onSavePricelists([...pricelists, newItem], true);
    };

    const updatePricelist = (id: string, updates: Partial<Pricelist>, immediate = false) => {
        onSavePricelists(pricelists.map(p => p.id === id ? { ...p, ...updates } : p), immediate);
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
             <div className="w-full md:w-1/3 h-[35%] md:h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
                 <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                     <div><h2 className="font-black text-slate-900 uppercase text-xs md:text-sm">Pricelist Brands</h2><p className="text-[10px] text-slate-400 font-bold uppercase hidden md:block">Independent List</p></div>
                     <button onClick={addBrand} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {sortedBrands.map(brand => {
                         const isLatest = latestBrandId === brand.id;
                         return (
                         <div key={brand.id} onClick={() => setSelectedBrand(brand)} className={`p-2 md:p-3 rounded-xl border transition-all cursor-pointer relative group ${selectedBrand?.id === brand.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                             {isLatest && <div className="absolute -top-1.5 -right-1.5 z-10 bg-orange-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-white animate-bounce"><span className="flex items-center gap-1"><Sparkles size={8} /> Just Updated</span></div>}
                             <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm md:text-lg">{brand.name.charAt(0)}</span>}</div>
                                 <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><div className="font-bold text-slate-900 text-[10px] md:text-xs uppercase truncate">{brand.name}</div>{isLatest && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>}</div><div className="text-[9px] md:text-[10px] text-slate-400 font-mono truncate">{pricelists.filter(p => p.brandId === brand.id).length} Lists</div></div>
                             </div>
                             {selectedBrand?.id === brand.id && (
                                 <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-200/50 space-y-2" onClick={e => e.stopPropagation()}>
                                     <input value={brand.name} onChange={(e) => updateBrand(brand.id, { name: e.target.value })} className="w-full text-[10px] md:text-xs font-bold p-1 border-b border-slate-200 focus:border-blue-500 outline-none bg-transparent" placeholder="Brand Name" />
                                     <FileUpload label="Brand Logo" currentUrl={brand.logoUrl} onUpload={(url: any) => updateBrand(brand.id, { logoUrl: url }, true)} />
                                     <button onClick={(e) => { e.stopPropagation(); deleteBrand(brand.id); }} className="w-full text-center text-[10px] text-red-500 font-bold uppercase hover:bg-red-50 py-1 rounded">Delete Brand</button>
                                 </div>
                             )}
                         </div>
                     );})}
                     {sortedBrands.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">No brands. Click "Add" to start.</div>}
                 </div>
             </div>
             <div className="flex-1 h-[65%] md:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner min-h-0">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                     <div className="flex items-center gap-3 truncate mr-2"><h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider truncate">{selectedBrand ? selectedBrand.name : 'Select Brand'}</h3>{selectedBrand && latestBrandId === selectedBrand.id && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 border border-orange-200"><Activity size={10} /> Active Refresh</span>}</div>
                     <button onClick={addPricelist} disabled={!selectedBrand} className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"><Plus size={12} /> Add <span className="hidden md:inline">Pricelist</span></button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 content-start pb-10">
                     {sortedLists.map((item) => {
                         const recent = isNewlyUpdated(item.dateAdded);
                         return (
                         <div key={item.id} className={`rounded-xl border shadow-sm overflow-hidden flex flex-col p-3 md:p-4 gap-2 md:gap-3 h-fit relative group transition-all ${recent ? 'bg-yellow-50 border-yellow-300 ring-1 ring-yellow-200' : 'bg-white border-slate-200'}`}>
                             {recent && <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse z-10"><Sparkles size={10} /> Recently Edited</div>}
                             <div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input value={item.title} onChange={(e) => updatePricelist(item.id, { title: e.target.value, dateAdded: new Date().toISOString() })} className="w-full font-bold text-slate-900 border-b border-slate-100 focus:border-blue-500 outline-none pb-1 text-xs md:text-sm bg-transparent" placeholder="e.g. Retail Price List" /></div>
                             
                             <div className="flex bg-slate-100 p-1 rounded-lg mb-1">
                                 <button onClick={() => updatePricelist(item.id, { kind: 'standard' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${!item.kind || item.kind === 'standard' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Standard</button>
                                 <button onClick={() => updatePricelist(item.id, { kind: 'promotion' })} className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${item.kind === 'promotion' ? 'bg-purple-600 shadow text-white' : 'text-slate-400 hover:text-slate-600'}`}>Promotion</button>
                             </div>
                             
                             {item.kind === 'promotion' ? (
                                <div className="flex flex-col gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[8px] font-bold text-purple-800 uppercase mb-1">Start</label>
                                            <input type="date" value={item.startDate || ''} onChange={(e) => updatePricelist(item.id, { startDate: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[9px] font-bold p-1 bg-white border border-purple-200 rounded text-purple-900 outline-none focus:border-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-bold text-purple-800 uppercase mb-1">End</label>
                                            <input type="date" value={item.endDate || ''} onChange={(e) => updatePricelist(item.id, { endDate: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[9px] font-bold p-1 bg-white border border-purple-200 rounded text-purple-900 outline-none focus:border-purple-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-bold text-purple-800 uppercase mb-1">Promotional Sub-Header</label>
                                        <textarea 
                                            value={item.promoText || ''} 
                                            onChange={(e) => updatePricelist(item.id, { promoText: e.target.value, dateAdded: new Date().toISOString() })} 
                                            className="w-full text-[9px] font-bold p-1.5 bg-white border border-purple-200 rounded text-purple-900 outline-none focus:border-purple-500 resize-none h-12 placeholder:text-purple-300"
                                            placeholder="Enter promotional text..."
                                        />
                                    </div>
                                </div>
                             ) : (
                                <div className="grid grid-cols-2 gap-2"><div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label><select value={item.month} onChange={(e) => updatePricelist(item.id, { month: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200">{months.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div><label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label><input type="number" value={item.year} onChange={(e) => updatePricelist(item.id, { year: e.target.value, dateAdded: new Date().toISOString() })} className="w-full text-[10px] md:text-xs font-bold p-1 bg-white/50 rounded border border-slate-200" /></div></div>
                             )}

                             <div className="bg-white/40 p-2 rounded-lg border border-slate-100 mt-2"><label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Pricelist Mode</label><div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-md border border-slate-200"><button onClick={() => updatePricelist(item.id, { type: 'pdf', dateAdded: new Date().toISOString() }, true)} className={`py-1 text-[9px] font-black uppercase rounded items-center justify-center gap-1 transition-all ${item.type !== 'manual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><FileText size={10}/> PDF</button><button onClick={() => updatePricelist(item.id, { type: 'manual', dateAdded: new Date().toISOString() }, true)} className={`py-1 text-[9px] font-black uppercase rounded items-center justify-center gap-1 transition-all ${item.type === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={10}/> Manual</button></div></div>
                             {item.type === 'manual' ? (<div className="mt-1 space-y-2"><button onClick={() => setEditingManualList(item)} className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"><Edit2 size={12}/> {item.items?.length || 0} Items - Open Builder</button><FileUpload label="Thumbnail Image" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() }, true)} /></div>) : (<div className="mt-1 md:mt-2 grid grid-cols-2 gap-2"><FileUpload label="Thumbnail" accept="image/*" currentUrl={item.thumbnailUrl} onUpload={(url: any) => updatePricelist(item.id, { thumbnailUrl: url, dateAdded: new Date().toISOString() }, true)} /><FileUpload label="Upload PDF" accept="application/pdf" icon={<FileText />} currentUrl={item.url} onUpload={(url: any) => updatePricelist(item.id, { url: url, dateAdded: new Date().toISOString() }, true)} /></div>)}
                             <button onClick={() => handleDeletePricelist(item.id)} className="mt-auto pt-2 md:pt-3 border-t border-slate-100 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                         </div>
                     )})}
                     {sortedLists.length === 0 && selectedBrand && <div className="col-span-full py-8 md:py-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">No pricelists found for this brand.</div>}
                 </div>
             </div>
             {editingManualList && <ManualPricelistEditor pricelist={editingManualList} onSave={(pl) => updatePricelist(pl.id, { ...pl }, true)} onClose={() => setEditingManualList(null)} />}
        </div>
    );
};

const ProductEditor = ({ product, onSave, onCancel }: { product: Product, onSave: (p: Product) => void, onCancel: () => void }) => {
    // Defensive initialization for arrays to prevent crashes on legacy or missing data
    const [draft, setDraft] = useState<Product>({ 
        ...product, 
        dimensions: Array.isArray(product.dimensions) ? product.dimensions : (product.dimensions ? [{label: "Device", ...(product.dimensions as any)}] : []),
        features: Array.isArray(product.features) ? product.features : [],
        boxContents: Array.isArray(product.boxContents) ? product.boxContents : [],
        specs: product.specs || {},
        videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []),
        manuals: product.manuals || (product.manualUrl || (product.manualImages && product.manualImages.length > 0) ? [{ id: generateId('man'), title: "User Manual", images: product.manualImages || [], pdfUrl: product.manualUrl }] : []),
        dateAdded: product.dateAdded || new Date().toISOString()
    });
    
    const [newFeature, setNewFeature] = useState('');
    const [newBoxItem, setNewBoxItem] = useState('');
    const [newSpecKey, setNewSpecKey] = useState('');
    const [newSpecValue, setNewSpecValue] = useState('');
    
    const addFeature = () => { if (newFeature.trim()) { setDraft({ ...draft, features: [...draft.features, newFeature.trim()] }); setNewFeature(''); } };
    const addBoxItem = () => { if(newBoxItem.trim()) { setDraft({ ...draft, boxContents: [...(draft.boxContents || []), newBoxItem.trim()] }); setNewBoxItem(''); } };
    const addSpec = () => { if (newSpecKey.trim() && newSpecValue.trim()) { setDraft({ ...draft, specs: { ...draft.specs, [newSpecKey.trim()]: newSpecValue.trim() } }); setNewSpecKey(''); setNewSpecValue(''); } };
    const addDimensionSet = () => { setDraft({ ...draft, dimensions: [...draft.dimensions, { label: "New Set", width: "", height: "", depth: "", weight: "" }] }); };
    const updateDimension = (index: number, field: keyof DimensionSet, value: string) => { const newDims = [...draft.dimensions]; newDims[index] = { ...newDims[index], [field]: value }; setDraft({ ...draft, dimensions: newDims }); };
    const removeDimension = (index: number) => { const newDims = draft.dimensions.filter((_, i) => i !== index); setDraft({ ...draft, dimensions: newDims }); };
    const addManual = () => { const newManual: Manual = { id: generateId('man'), title: "New Manual", images: [], pdfUrl: '', thumbnailUrl: '' }; setDraft({ ...draft, manuals: [...(draft.manuals || []), newManual] }); };
    const removeManual = (id: string) => { setDraft({ ...draft, manuals: (draft.manuals || []).filter(m => m.id !== id) }); };
    const updateManual = (id: string, updates: Partial<Manual>) => { setDraft({ ...draft, manuals: (draft.manuals || []).map(m => m.id === id ? { ...m, ...updates } : m) }); };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0"><h3 className="font-bold uppercase tracking-wide">Edit Product: {draft.name || 'New Product'}</h3><button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <InputField label="Product Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} />
                        <InputField label="SKU" val={draft.sku || ''} onChange={(e: any) => setDraft({ ...draft, sku: e.target.value })} />
                        <InputField label="Description" isArea val={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
                        <InputField label="Warranty & Terms" isArea val={draft.terms || ''} onChange={(e: any) => setDraft({ ...draft, terms: e.target.value })} placeholder="Enter warranty info..." />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><div className="flex justify-between items-center mb-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dimensions Sets</label><button onClick={addDimensionSet} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase flex items-center gap-1"><Plus size={10}/> Add Set</button></div>{draft.dimensions.map((dim, idx) => (<div key={idx} className="mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative"><button onClick={() => removeDimension(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={12}/></button><input value={dim.label || ''} onChange={(e) => updateDimension(idx, 'label', e.target.value)} placeholder="Label (e.g. Box 1)" className="w-full text-xs font-black uppercase mb-2 border-b border-transparent focus:border-blue-500 outline-none" /><div className="grid grid-cols-2 gap-2"><InputField label="Height" val={dim.height} onChange={(e:any) => updateDimension(idx, 'height', e.target.value)} half placeholder="10cm" /><InputField label="Width" val={dim.width} onChange={(e:any) => updateDimension(idx, 'width', e.target.value)} half placeholder="10cm" /><InputField label="Depth" val={dim.height} onChange={(e:any) => updateDimension(idx, 'depth', e.target.value)} half placeholder="10cm" /><InputField label="Weight" val={dim.weight} onChange={(e:any) => updateDimension(idx, 'weight', e.target.value)} half placeholder="1kg" /></div></div>))}</div>
                    </div>
                    <div className="space-y-4">
                        <FileUpload label="Main Image" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url as string })} />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Image Gallery (Multiple)</label><FileUpload label="Add Images" allowMultiple={true} currentUrl="" onUpload={(urls: any) => { const newUrls = Array.isArray(urls) ? urls : [urls]; setDraft(prev => ({ ...prev, galleryUrls: [...(prev.galleryUrls || []), ...newUrls] })); }} />{draft.galleryUrls && draft.galleryUrls.length > 0 && (<div className="grid grid-cols-4 gap-2 mt-2">{draft.galleryUrls.map((url, idx) => (<div key={idx} className="relative group aspect-square bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"><img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} /><button onClick={() => setDraft(prev => ({...prev, galleryUrls: prev.galleryUrls?.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 size={12} /></button></div>))}</div>)}</div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Product Videos</label><FileUpload label="Add Videos" allowMultiple={true} accept="video/*" icon={<Video />} currentUrl="" onUpload={(urls: any) => { const newUrls = Array.isArray(urls) ? urls : [urls]; setDraft(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || []), ...newUrls] })); }} />{draft.videoUrls && draft.videoUrls.length > 0 && (<div className="grid grid-cols-4 gap-2 mt-2">{draft.videoUrls.map((url, idx) => (<div key={idx} className="relative group aspect-square bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-sm flex items-center justify-center"><video src={url} className="w-full h-full object-cover opacity-60" muted /><Video size={20} className="absolute text-white" /><button onClick={() => setDraft(prev => ({...prev, videoUrls: prev.videoUrls?.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"><Trash2 size={12} /></button></div>))}</div>)}</div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Key Features</label>
                            <div className="flex gap-2 mb-2">
                                <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add feature..." onKeyDown={(e) => e.key === 'Enter' && addFeature()} />
                                <button onClick={addFeature} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16} /></button>
                            </div>
                            <ul className="space-y-1">
                                {draft.features.map((f, i) => (
                                    <li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold text-slate-700">
                                        {/* DEFENSIVE: Ensure children are not objects */}
                                        {typeof f === 'object' ? JSON.stringify(f) : f}
                                        <button onClick={() => setDraft({...draft, features: draft.features.filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <label className="block text-[10px] font-black text-orange-600 uppercase tracking-wider mb-2">What's in the Box</label>
                            <div className="flex gap-2 mb-2">
                                <input type="text" value={newBoxItem} onChange={(e) => setNewBoxItem(e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" placeholder="Add item..." onKeyDown={(e) => e.key === 'Enter' && addBoxItem()} />
                                <button onClick={addBoxItem} className="p-2 bg-orange-500 text-white rounded-lg"><Plus size={16} /></button>
                            </div>
                            <ul className="space-y-1">
                                {(draft.boxContents || []).map((item, i) => (
                                    <li key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 text-xs font-bold text-slate-700">
                                        {/* DEFENSIVE: Ensure children are not objects */}
                                        {typeof item === 'object' ? JSON.stringify(item) : item}
                                        <button onClick={() => setDraft({...draft, boxContents: (draft.boxContents || []).filter((_, ix) => ix !== i)})} className="text-red-400"><Trash2 size={12}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-slate-100 pt-8"><h4 className="font-bold text-slate-900 uppercase text-sm mb-4">Manuals & Docs</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-slate-50 p-6 rounded-xl border border-slate-200"><div className="flex justify-between items-center mb-4"><h5 className="text-xs font-black text-slate-500 uppercase tracking-wider">Product Manuals</h5><button onClick={addManual} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase flex items-center gap-1"><Plus size={10}/> Add Manual</button></div><div className="space-y-4">{(draft.manuals || []).map((manual, idx) => (<div key={manual.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group"><button onClick={() => removeManual(manual.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button><input value={manual.title} onChange={(e) => updateManual(manual.id, { title: e.target.value })} placeholder="Manual Title (e.g. User Guide)" className="w-full font-bold text-slate-900 border-b border-slate-100 pb-1 focus:border-blue-500 outline-none pr-8 text-sm" /><div className="grid grid-cols-2 gap-4"><FileUpload label="Thumbnail (Image)" accept="image/*" currentUrl={manual.thumbnailUrl} onUpload={(url: any) => updateManual(manual.id, { thumbnailUrl: url })} /><FileUpload label="Document (PDF)" accept="application/pdf" icon={<FileText />} currentUrl={manual.pdfUrl} onUpload={(url: any) => updateManual(manual.id, { pdfUrl: url })} /></div></div>))}{(draft.manuals || []).length === 0 && (<div className="text-center text-slate-400 text-xs italic py-4 border-2 border-dashed border-slate-200 rounded-xl">No manuals added. Click "Add Manual" above.</div>)}</div></div><div className="bg-slate-50 p-6 rounded-xl border border-slate-200"><h5 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Technical Specs</h5><div className="flex flex-wrap gap-2 mb-4 items-end"><input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Spec Name" className="flex-1 min-w-[80px] p-2 border border-slate-300 rounded-lg text-sm font-bold" /><input value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Value" className="flex-1 min-w-[80px] p-2 border border-slate-300 rounded-lg text-sm font-bold" onKeyDown={(e) => e.key === 'Enter' && addSpec()} /><button onClick={addSpec} className="bg-blue-600 text-white p-2.5 rounded-lg shrink-0"><Plus size={18} /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{Object.entries(draft.specs).map(([key, value]) => (<div key={key} className="flex justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><div><span className="block text-[10px] font-bold text-slate-400 uppercase">{key}</span><span className="block text-sm font-black">{/* DEFENSIVE: Render non-strings as JSON strings */ typeof value === 'object' ? JSON.stringify(value) : value}</span></div><button onClick={() => { const s = {...draft.specs}; delete s[key]; setDraft({...draft, specs: s}); }} className="text-red-400"><Trash2 size={16}/></button></div>))}</div></div></div></div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0"><button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg shadow-lg">Confirm Changes</button></div>
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
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                        <div>
                            <div className="text-xs font-bold text-slate-900 uppercase">Show Pricelists</div>
                            <div className="text-[10px] text-slate-500 font-medium">Allow viewing PDF/Manual lists</div>
                        </div>
                        <button
                            onClick={() => setDraft({ ...draft, showPricelists: !(draft.showPricelists ?? true) })}
                            className={`w-10 h-5 rounded-full transition-colors relative ${ (draft.showPricelists ?? true) ? 'bg-green-500' : 'bg-slate-300' }`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${ (draft.showPricelists ?? true) ? 'left-6' : 'left-1' }`}></div>
                        </button>
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
    useEffect(() => { if (targetBrand && !targetBrand.categories.find(c => c.id === targetCategoryId)) { if (targetBrand.categories.length > 0) { setTargetCategoryId(targetBrand.categories[0].id); } } }, [targetBrandId]);
    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4"><div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"><div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-black text-slate-900 uppercase">Move Product</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div><div className="p-6 space-y-6"><div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><div className="text-[10px] font-black text-blue-400 uppercase mb-1">Moving Product</div><div className="font-bold text-slate-900">{product.name}</div>{product.sku && <div className="text-[10px] font-mono text-slate-400 uppercase">{product.sku}</div>}</div><div className="space-y-4"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Destination Brand</label><select value={targetBrandId} onChange={(e) => setTargetBrandId(e.target.value)} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm">{allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Destination Category</label><select value={targetCategoryId} onChange={(e) => setTargetCategoryId(e.target.value)} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm">{targetCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div><div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3"><Info size={16} className="text-orange-500 shrink-0 mt-0.5" /><p className="text-[10px] text-orange-700 leading-relaxed font-bold uppercase">Moving this product will transfer all specifications and media to the selected category.</p></div></div><div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs hover:text-slate-700">Cancel</button><button onClick={() => onMove(product, targetBrandId, targetCategoryId)} disabled={targetBrandId === currentBrandId && targetCategoryId === currentCategoryId} className="px-6 py-3 bg-blue-600 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"><Move size={14} /> Confirm Move</button></div></div></div>
    );
};

const TVModelEditor = ({ model, onSave, onClose }: { model: TVModel, onSave: (m: TVModel) => void, onClose: () => void }) => {
    const [draft, setDraft] = useState<TVModel>({ ...model });
    return (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center backdrop-blur-sm p-4"><div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"><div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><h3 className="font-black text-slate-900 uppercase">Edit TV Model: {draft.name}</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div><div className="flex-1 overflow-y-auto p-6 space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><InputField label="Model Name" val={draft.name} onChange={(e: any) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. OLED G3" /><FileUpload label="Cover Image (Optional)" currentUrl={draft.imageUrl} onUpload={(url: any) => setDraft({ ...draft, imageUrl: url })} /></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-900 uppercase text-xs">Videos for this Model</h4><span className="text-[10px] font-bold bg-white text-slate-500 px-2 py-1 rounded border border-slate-200 uppercase">{draft.videoUrls.length} Videos</span></div><FileUpload label="Upload Videos" accept="video/*" allowMultiple={true} icon={<Video />} currentUrl="" onUpload={(urls: any) => { const newUrls = Array.isArray(urls) ? urls : [urls]; setDraft(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ...newUrls] })); }} /><div className="grid grid-cols-1 gap-3 mt-4">{draft.videoUrls.map((url, idx) => (<div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 group"><div className="w-16 h-10 bg-slate-900 rounded flex items-center justify-center shrink-0"><Video size={16} className="text-white opacity-50" /></div><div className="flex-1 overflow-hidden"><div className="text-[10px] font-bold text-slate-500 uppercase">Video {idx + 1}</div><div className="text-xs font-mono truncate text-slate-700">{url.split('/').pop()}</div></div><div className="flex items-center gap-1">{idx > 0 && <button onClick={() => { const newUrls = [...draft.videoUrls]; [newUrls[idx], newUrls[idx-1]] = [newUrls[idx-1], newUrls[idx]]; setDraft({ ...draft, videoUrls: newUrls }); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><ChevronDown size={14} className="rotate-180"/></button>}{idx < draft.videoUrls.length - 1 && <button onClick={() => { const newUrls = [...draft.videoUrls]; [newUrls[idx], newUrls[idx+1]] = [newUrls[idx+1], newUrls[idx]]; setDraft({ ...draft, videoUrls: newUrls }); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><ChevronDown size={14} /></button>}<button onClick={() => { setDraft({ ...draft, videoUrls: draft.videoUrls.filter((_, i) => i !== idx) }); }} className="p-1.5 bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 rounded ml-2"><Trash2 size={14} /></button></div></div>))}{draft.videoUrls.length === 0 && (<div className="text-center py-6 text-slate-400 text-xs italic">No videos uploaded for this model yet.</div>)}</div></div></div><div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0"><button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold uppercase text-xs">Cancel</button><button onClick={() => onSave(draft)} className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-lg">Save Model</button></div></div></div>
    );
};

const AdminManager = ({ admins, onUpdate, currentUser }: { admins: AdminUser[], onUpdate: (admins: AdminUser[]) => void, currentUser: AdminUser }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPermissions, setNewPermissions] = useState<AdminPermissions>({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true });
    const PERMISSION_GROUPS = [ { title: "Inventory & Products", icon: <Box size={14} />, color: "blue", items: [ { key: 'inventory', label: 'Inventory Management', desc: 'Create brands, categories, products and upload media.' } ] }, { title: "Marketing & Content", icon: <Megaphone size={14} />, color: "purple", items: [ { key: 'marketing', label: 'Marketing Hub', desc: 'Edit Hero banner, Ad zones, and Pamphlets.' }, { key: 'pricelists', label: 'Pricelists', desc: 'Manage PDF pricelists and brand documents.' }, { key: 'screensaver', label: 'Screensaver Control', desc: 'Configure screensaver timing and display rules.' } ] }, { title: "System & Devices", icon: <Settings size={14} />, color: "slate", items: [ { key: 'fleet', label: 'Fleet Management', desc: 'Monitor active devices and remote restart.' }, { key: 'tv', label: 'TV Mode Config', desc: 'Manage TV video loops and brand channels.' }, { key: 'settings', label: 'Global Settings', desc: 'System backups, app icons, and admin users.' }, { key: 'history', label: 'Archive History', desc: 'View logs and restore deleted items.' } ] } ];
    const resetForm = () => { setEditingId(null); setNewName(''); setNewPin(''); setNewPermissions({ inventory: true, marketing: true, tv: false, screensaver: false, fleet: false, history: false, settings: false, pricelists: true }); };
    const handleAddOrUpdate = () => { if (!newName || !newPin) return alert("Name and PIN required"); let updatedList = [...admins]; if (editingId) { updatedList = updatedList.map(a => a.id === editingId ? { ...a, name: newName, pin: newPin, permissions: newPermissions } : a); } else { updatedList.push({ id: generateId('adm'), name: newName, pin: newPin, isSuperAdmin: false, permissions: newPermissions }); } onUpdate(updatedList); resetForm(); };
    const handleDelete = (id: string) => { if (confirm("Remove this admin?")) { onUpdate(admins.filter(a => a.id !== id)); } };
    const startEdit = (admin: AdminUser) => { setEditingId(admin.id); setNewName(admin.name); setNewPin(admin.pin); setNewPermissions(admin.permissions); };
    const toggleAll = (enable: boolean) => { const p = { ...newPermissions }; (Object.keys(p) as Array<keyof AdminPermissions>).forEach(k => p[k] = enable); setNewPermissions(p); };
    const isEditingSuperAdmin = editingId && admins.find(a => a.id === editingId)?.isSuperAdmin;

    return (
        <div className="space-y-8"><div className="grid grid-cols-1 xl:grid-cols-3 gap-8"><div className="xl:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200"><div className="flex justify-between items-center mb-6"><h4 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2"><UserCog size={16} className="text-blue-600"/> {editingId ? 'Edit Admin Profile' : 'Create New Admin'}</h4>{isEditingSuperAdmin && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-black uppercase">Super Admin (Full Access)</span>}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><InputField label="Admin Name" val={newName} onChange={(e:any) => setNewName(e.target.value)} placeholder="e.g. John Doe" /><InputField label="4-Digit PIN" val={newPin} onChange={(e:any) => setNewPin(e.target.value)} placeholder="####" type="text" /></div><div className="space-y-4"><div className="flex justify-between items-center"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Access Permissions</label>{!isEditingSuperAdmin && (<div className="flex gap-2"><button onClick={() => toggleAll(true)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Select All</button><button onClick={() => toggleAll(false)} className="text-[10px] font-bold text-slate-400 hover:bg-slate-100 px-2 py-1 rounded">Clear All</button></div>)}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{PERMISSION_GROUPS.map(group => (<div key={group.title} className={`bg-white rounded-xl border border-${group.color}-100 overflow-hidden shadow-sm`}><div className={`bg-${group.color}-50 p-3 border-b border-${group.color}-100 flex items-center gap-2`}><span className={`text-${group.color}-600`}>{group.icon}</span><span className={`text-[10px] font-black uppercase text-${group.color}-800`}>{group.title}</span></div><div className="p-3 space-y-3">{group.items.map(item => (<label key={item.key} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isEditingSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}><div className="pt-0.5"><input type="checkbox" checked={(newPermissions as any)[item.key]} onChange={(e) => setNewPermissions({...newPermissions, [item.key]: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" disabled={isEditingSuperAdmin} /></div><div><div className="text-xs font-bold text-slate-800">{item.label}</div><div className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</div></div></label>))}</div></div>))}</div><div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">{editingId && <button onClick={resetForm} className="px-6 py-3 bg-white border border-slate-300 text-slate-600 rounded-xl text-xs font-bold uppercase hover:bg-slate-50">Cancel Edit</button>}<button onClick={handleAddOrUpdate} className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2"><Check size={16} /> {editingId ? 'Update Admin Permissions' : 'Create Admin User'}</button></div></div></div><div className="space-y-4"><h4 className="font-bold text-slate-900 uppercase text-xs mb-2">Active Admins ({admins.length})</h4><div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 pb-20">{admins.map(admin => (<div key={admin.id} className={`p-4 rounded-xl border transition-all ${editingId === admin.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-white border-slate-200 hover:border-blue-300'}`}><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${admin.isSuperAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}><UserCog size={16} /></div><div><div className="font-bold text-slate-900 text-sm">{admin.name}</div><div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono"><Lock size={10} /> {admin.pin}</div></div></div><div className="flex items-center gap-1"><button onClick={() => startEdit(admin)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Permissions"><Edit2 size={14} /></button>{admin.id !== 'super-admin' && currentUser.name === 'Admin' && currentUser.pin === '1723' && (<button onClick={() => handleDelete(admin.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Admin"><Trash2 size={14} /></button>)}</div></div><div className="flex flex-wrap gap-1 mt-2">{admin.isSuperAdmin ? (<span className="text-[9px] font-bold uppercase bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">Full Access</span>) : (Object.entries(admin.permissions).filter(([_, v]) => v).map(([k]) => (<span key={k} className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{k}</span>)))}</div></div>))}</div></div></div></div>
    );
};

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<Brand[]> => {
    const zip = new JSZip();
    let loadedZip;
    try { loadedZip = await zip.loadAsync(file); } catch (e) { throw new Error("Invalid ZIP file"); }
    const newBrands: Record<string, Brand> = {};
    const getCleanPath = (filename: string) => filename.replace(/\\/g, '/');
    const validFiles = Object.keys(loadedZip.files).filter(path => !loadedZip.files[path].dir && !path.includes('__MACOSX') && !path.includes('.DS_Store'));
    let rootPrefix = "";
    if (validFiles.length > 0) { const firstFileParts = getCleanPath(validFiles[0]).split('/').filter(p => p); if (firstFileParts.length > 1) { const possibleRoot = firstFileParts[0]; if (validFiles.every(path => getCleanPath(path).startsWith(possibleRoot + '/'))) { rootPrefix = possibleRoot + '/'; } } }
    const getMimeType = (filename: string) => { const ext = filename.split('.').pop()?.toLowerCase(); if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'; if (ext === 'png') return 'image/png'; if (ext === 'webp') return 'image/webp'; if (ext === 'gif') return 'image/gif'; if (ext === 'mp4') return 'video/mp4'; if (ext === 'webm') return 'video/webm'; if (ext === 'pdf') return 'application/pdf'; return 'application/octet-stream'; };
    const processAsset = async (zipObj: any, filename: string): Promise<string> => { const blob = await zipObj.async("blob"); if (supabase) { try { const mimeType = getMimeType(filename); const safeName = filename.replace(/[^a-z0-9._-]/gi, '_'); const fileToUpload = new File([blob], `import_${Date.now()}_${safeName}`, { type: mimeType }); const url = await uploadFileToStorage(fileToUpload); return url; } catch (e) { console.warn(`Asset upload failed for ${filename}. Fallback to Base64.`, e); } } return new Promise(resolve => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(blob); }); };
    const filePaths = Object.keys(loadedZip.files); let processedCount = 0;
    for (const rawPath of filePaths) { let path = getCleanPath(rawPath); const fileObj = loadedZip.files[rawPath]; if (fileObj.dir) continue; if (path.includes('__MACOSX') || path.includes('.DS_Store')) continue; if (rootPrefix && path.startsWith(rootPrefix)) { path = path.substring(rootPrefix.length); } if (path.startsWith('_System_Backup/')) continue; if (path.includes('store_config')) continue; const parts = path.split('/').filter(p => p.trim() !== ''); if (parts.length < 2) continue; processedCount++; if (onProgress && processedCount % 5 === 0) onProgress(`Processing item ${processedCount}/${validFiles.length}...`); const brandName = parts[0]; if (!newBrands[brandName]) { newBrands[brandName] = { id: generateId('brand'), name: brandName, categories: [] }; } if (parts.length === 2) { const fileName = parts[1].toLowerCase(); if (fileName.includes('brand_logo') || fileName.includes('logo')) { const url = await processAsset(fileObj, parts[1]); newBrands[brandName].logoUrl = url; } if (fileName.endsWith('.json') && fileName.includes('brand')) { try { const text = await fileObj.async("text"); const meta = JSON.parse(text); if (meta.themeColor) newBrands[brandName].themeColor = meta.themeColor; if (meta.id) newBrands[brandName].id = meta.id; } catch(e) {} } continue; } if (parts.length < 4) continue; const categoryName = parts[1]; const productName = parts[2]; const fileName = parts.slice(3).join('/'); let category = newBrands[brandName].categories.find(c => c.name === categoryName); if (!category) { category = { id: generateId('c'), name: categoryName, icon: 'Box', products: [] }; newBrands[brandName].categories.push(category); } let product = category.products.find(p => p.name === productName); if (!product) { product = { id: generateId('p'), name: productName, description: '', specs: {}, features: [], dimensions: [], imageUrl: '', galleryUrls: [], videoUrls: [], manuals: [], dateAdded: new Date().toISOString() }; category.products.push(product); } const lowerFile = fileName.toLowerCase(); if (fileName.endsWith('.json') && (fileName.includes('details') || fileName.includes('product'))) { try { const text = await fileObj.async("text"); const meta = JSON.parse(text); if (meta.id) product.id = meta.id; if (meta.name) product.name = meta.name; if (meta.description) product.description = meta.description; if (meta.sku) product.sku = meta.sku; 
                // DEFENSIVE: Sanitize specs and features to ensure they are strings/serializable
                if (meta.specs) {
                    const cleanSpecs: Record<string, string> = {};
                    Object.entries(meta.specs).forEach(([k, v]) => {
                        cleanSpecs[k] = typeof v === 'object' ? JSON.stringify(v) : String(v || '');
                    });
                    product.specs = { ...product.specs, ...cleanSpecs }; 
                }
                if (meta.features) {
                    const cleanFeatures = (Array.isArray(meta.features) ? meta.features : [meta.features]).map(f => typeof f === 'object' ? JSON.stringify(f) : String(f || ''));
                    product.features = [...(product.features || []), ...cleanFeatures];
                }
                if (meta.dimensions) product.dimensions = Array.isArray(meta.dimensions) ? meta.dimensions : []; 
                if (meta.boxContents) {
                    const cleanBox = (Array.isArray(meta.boxContents) ? meta.boxContents : [meta.boxContents]).map(b => typeof b === 'object' ? JSON.stringify(b) : String(b || ''));
                    product.boxContents = cleanBox;
                }
                if (meta.terms) product.terms = meta.terms; if (meta.dateAdded) product.dateAdded = meta.dateAdded; } catch(e) { console.warn("Failed to parse JSON for " + productName); } } else if (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg') || lowerFile.endsWith('.png') || lowerFile.endsWith('.webp')) { const url = await processAsset(fileObj, parts.slice(3).join('_')); if (lowerFile.includes('cover') || lowerFile.includes('main') || (!product.imageUrl && !lowerFile.includes('gallery'))) { product.imageUrl = url; } else { product.galleryUrls = [...(product.galleryUrls || []), url]; } } else if (lowerFile.endsWith('.mp4') || lowerFile.endsWith('.webm') || lowerFile.endsWith('.mov')) { const url = await processAsset(fileObj, parts.slice(3).join('_')); product.videoUrls = [...(product.videoUrls || []), url]; } else if (lowerFile.endsWith('.pdf')) { const url = await processAsset(fileObj, parts.slice(3).join('_')); product.manuals?.push({ id: generateId('man'), title: fileName.replace('.pdf', '').replace(/_/g, ' '), images: [], pdfUrl: url, thumbnailUrl: '' }); } }
    return Object.values(newBrands);
};

const downloadZip = async (data: StoreData | null) => {
    if (!data) return;
    const zip = new JSZip();
    const dataJson = JSON.stringify(data, null, 2);
    zip.file("store_config.json", dataJson);
    const backupFolder = zip.folder("_System_Backup");
    if (backupFolder) { backupFolder.file("export_info.txt", `Kiosk Pro Backup\nGenerated: ${new Date().toISOString()}`); }
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kiosk_backup_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const availableTabs = [ { id: 'inventory', label: 'Inventory', icon: Box }, { id: 'marketing', label: 'Marketing', icon: Megaphone }, { id: 'pricelists', label: 'Pricelists', icon: RIcon }, { id: 'tv', label: 'TV', icon: Tv }, { id: 'screensaver', label: 'Screensaver', icon: Monitor }, { id: 'fleet', label: 'Fleet', icon: Tablet }, { id: 'history', label: 'History', icon: History }, { id: 'settings', label: 'Settings', icon: Settings }, { id: 'guide', label: 'System Guide', icon: BookOpen } ].filter(tab => tab.id === 'guide' || currentUser?.permissions[tab.id as keyof AdminPermissions]);

  useEffect(() => { if (currentUser && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) { setActiveTab(availableTabs[0].id); } }, [currentUser, availableTabs, activeTab]);
  useEffect(() => { checkCloudConnection().then(setIsCloudConnected); const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (!hasUnsavedChanges && storeData) { setLocalData(storeData); } }, [storeData, hasUnsavedChanges]);

  const handleLocalUpdate = (newData: StoreData, immediate = false) => {
      setLocalData(newData);
      if (immediate) {
          onUpdateData(newData);
          setHasUnsavedChanges(false);
      } else {
          setHasUnsavedChanges(true);
      }
      
      if (selectedBrand) { const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id); if (updatedBrand) setSelectedBrand(updatedBrand); }
      if (selectedCategory && selectedBrand) { const updatedBrand = newData.brands.find(b => b.id === selectedBrand.id); const updatedCat = updatedBrand?.categories.find(c => c.id === selectedCategory.id); if (updatedCat) setSelectedCategory(updatedCat); }
      if (selectedTVBrand && newData.tv) { const updatedTVBrand = newData.tv.brands.find(b => b.id === selectedTVBrand.id); if (updatedTVBrand) setSelectedTVBrand(updatedTVBrand); }
  };

  const checkSkuDuplicate = (sku: string, currentId: string) => { if (!sku || !localData) return false; for (const b of localData.brands) { for (const c of b.categories) { for (const p of c.products) { if (p.sku && p.sku.toLowerCase() === sku.toLowerCase() && p.id !== currentId) return true; } } } return false; };
  const handleGlobalSave = () => { if (localData) { onUpdateData(localData); setHasUnsavedChanges(false); } };
  
  const updateFleetMember = async (kiosk: KioskRegistry): Promise<boolean> => { 
      if(supabase) { 
          try {
              const payload = { 
                  id: kiosk.id, 
                  name: kiosk.name, 
                  device_type: kiosk.deviceType, 
                  assigned_zone: kiosk.assignedZone,
                  show_pricelists: kiosk.showPricelists ?? true
              }; 
              const { error } = await supabase.from('kiosks').upsert(payload); 
              if (error) throw error;
              onRefresh(); 
              return true;
          } catch (e: any) {
              console.error("Fleet update failed", e);
              // Handle missing column errors (400) or other DB constraints
              if (e.code === '42703' || e.message?.includes('show_pricelists')) {
                  alert("Database Error: 'show_pricelists' column missing.\n\nFix: Go to 'System Guide' and run the updated 'Fleet Repair' script (it now includes a cache reload command).");
              } else if (e.code === 'PGRST204') {
                   alert("Update Failed: Database table is missing required columns. Please check Setup Guide > Migration.");
              } else {
                  alert("Update Failed: " + (e.message || "Unknown error"));
              }
              return false;
          }
      } 
      return false;
  };
  
  const removeFleetMember = async (id: string) => {
      const kiosk = localData?.fleet?.find(f => f.id === id);
      if(!kiosk) return;
      if(confirm(`Archive and remove device "${kiosk.name}" from live monitoring?`) && supabase) {
          const newArchive = addToArchive('device', kiosk.name, kiosk, 'delete');
          const updatedData = { ...localData!, archive: newArchive };
          await supabase.from('kiosks').delete().eq('id', id);
          handleLocalUpdate(updatedData, true); 
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

  const restoreBrand = (b: Brand) => { if(!localData) return; const newArchiveBrands = localData.archive?.brands.filter(x => x.id !== b.id) || []; const newBrands = [...localData.brands, b]; const newArchive = addToArchive('brand', b.name, b, 'restore'); handleLocalUpdate({ ...localData, brands: newBrands, archive: { ...localData.archive!, brands: newArchiveBrands, deletedItems: newArchive?.deletedItems } }, true); };
  const restoreCatalogue = (c: Catalogue) => { if(!localData) return; const newArchiveCats = localData.archive?.catalogues.filter(x => x.id !== c.id) || []; const newCats = [...(localData.catalogues || []), c]; const newArchive = addToArchive('catalogue', c.title, c, 'restore'); handleLocalUpdate({ ...localData, catalogues: newCats, archive: { ...localData.archive!, catalogues: newArchiveCats, deletedItems: newArchive?.deletedItems } }, true); };

  const handleMoveProduct = (product: Product, targetBrandId: string, targetCategoryId: string) => {
      if (!localData || !selectedBrand || !selectedCategory) return;
      const updatedSourceCat = { ...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id) };
      let newBrands = localData.brands.map(b => { if (b.id === selectedBrand.id) { return { ...b, categories: b.categories.map(c => c.id === selectedCategory.id ? updatedSourceCat : c) }; } return b; });
      newBrands = newBrands.map(b => { if (b.id === targetBrandId) { return { ...b, categories: b.categories.map(c => { if (c.id === targetCategoryId) { return { ...c, products: [...c.products, product] }; } return c; }) }; } return b; });
      const newArchive = addToArchive('product', product.name, { product, from: selectedCategory.name, to: targetCategoryId }, 'update');
      handleLocalUpdate({ ...localData, brands: newBrands, archive: newArchive }, true); 
      setMovingProduct(null);
  };

  const formatRelativeTime = (isoString: string) => { if (!isoString) return 'Unknown'; const date = new Date(isoString); const now = new Date(); const diffMs = now.getTime() - date.getTime(); const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); if (diffDays === 0) return 'Today'; if (diffDays === 1) return 'Yesterday'; if (diffDays < 7) return `${diffDays} days ago`; if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`; return date.toLocaleDateString(); };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Loading...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  const brands = Array.isArray(localData.brands) ? [...localData.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const tvBrands = Array.isArray(localData.tv?.brands) ? [...localData.tv!.brands].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const archivedGenericItems = (localData.archive?.deletedItems || []).filter(i => { const matchesSearch = i.name.toLowerCase().includes(historySearch.toLowerCase()) || i.userName.toLowerCase().includes(historySearch.toLowerCase()) || i.type.toLowerCase().includes(historySearch.toLowerCase()); const matchesTab = historyTab === 'all' || i.action === historyTab; return matchesSearch && matchesTab; });

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20"><div className="flex items-center justify-between px-4 py-3 border-b border-slate-800"><div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><div><h1 className="text-lg font-black uppercase tracking-widest leading-none">Admin Hub</h1></div></div><div className="flex items-center gap-4"><div className="text-xs font-bold text-slate-400 uppercase hidden md:block">Hello, {currentUser.name}</div><button onClick={handleGlobalSave} disabled={!hasUnsavedChanges} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs transition-all ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}><SaveAll size={16} />{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</button></div><div className="flex items-center gap-3"><div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>{isCloudConnected ? <Cloud size={14} /> : <HardDrive size={14} />}<span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Local Mode'}</span></div><button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><RefreshCw size={16} /></button><button onClick={logout} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-white rounded-lg flex items-center gap-2"><LogOut size={16} /><span className="text-[10px] font-bold uppercase hidden md:inline">Logout</span></button></div></div><div className="flex overflow-x-auto no-scrollbar">{availableTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>))}</div></header>
        {activeTab === 'marketing' && (<div className="bg-white border-b border-slate-200 flex overflow-x-auto no-scrollbar shadow-sm z-10 shrink-0"><button onClick={() => setActiveSubTab('hero')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${activeSubTab === 'hero' ? 'text-purple-600 bg-purple-50' : 'text-slate-500'}`}>Hero Banner</button><button onClick={() => setActiveSubTab('ads')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${activeSubTab === 'ads' ? 'text-purple-600 bg-purple-50' : 'text-slate-500'}`}>Ad Zones</button><button onClick={() => setActiveSubTab('catalogues')} className={`px-6 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${activeSubTab === 'catalogues' ? 'text-purple-600 bg-purple-50' : 'text-slate-500'}`}>Pamphlets</button></div>)}

        <main className="flex-1 overflow-y-auto p-2 md:p-8 relative pb-40 md:pb-8">
            {activeTab === 'guide' && <SystemDocumentation />}
            {activeTab === 'inventory' && (
                !selectedBrand ? (
                   <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 animate-fade-in">
                       <button onClick={() => { const name = prompt("Brand Name:"); if(name) { handleLocalUpdate({ ...localData, brands: [...brands, { id: generateId('b'), name, categories: [] }], archive: addToArchive('brand', name, null, 'create') }, true); } }} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all group min-h-[120px] md:min-h-[200px]"><Plus size={24} className="mb-2" /><span className="font-bold uppercase text-[10px] md:text-xs tracking-wider text-center">Add Brand</span></button>
                       {brands.map(brand => (
                           <div key={brand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col h-full">
                               <div className="flex-1 bg-slate-50 flex items-center justify-center p-2 relative aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-4xl font-black text-slate-200">{brand.name.charAt(0)}</span>}<button onClick={(e) => { e.stopPropagation(); if(confirm("Move to archive?")) { const now = new Date().toISOString(); handleLocalUpdate({...localData, brands: brands.filter(b=>b.id!==brand.id), archive: {...addToArchive('brand', brand.name, brand, 'delete')!, brands: [...(localData.archive?.brands||[]), brand], deletedAt: {...localData.archive?.deletedAt, [brand.id]: now} }}, true); } }} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button></div>
                               <div className="p-2 md:p-4"><h3 className="font-black text-slate-900 text-xs md:text-lg uppercase tracking-tight mb-1 truncate">{brand.name}</h3><p className="text-[10px] md:text-xs text-slate-500 font-bold mb-2 md:mb-4">{brand.categories.length} Categories</p><button onClick={() => setSelectedBrand(brand)} className="w-full bg-slate-900 text-white py-1.5 md:py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase hover:bg-blue-600 transition-colors">Manage</button></div>
                           </div>
                       ))}
                   </div>
               ) : !selectedCategory ? (
                   <div className="animate-fade-in">
                       <div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 flex-1">{selectedBrand.name}</h2><FileUpload label="Brand Logo" currentUrl={selectedBrand.logoUrl} onUpload={(url: any) => { const updated = {...selectedBrand, logoUrl: url}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b), archive: addToArchive('brand', selectedBrand.name, {logo: url}, 'update')}, true); }} /></div>
                       <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                           <button onClick={() => { const name = prompt("Category Name:"); if(name) { const updated = {...selectedBrand, categories: [...selectedBrand.categories, { id: generateId('c'), name, icon: 'Box', products: [] }]}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b), archive: addToArchive('other', `${selectedBrand.name} > ${name}`, null, 'create')}, true); } }} className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-slate-400 hover:border-blue-500 hover:text-blue-500 aspect-square"><Plus size={24} /><span className="font-bold text-[10px] uppercase mt-2 text-center">New Category</span></button>
                           {selectedBrand.categories.map(cat => (
                               <button key={cat.id} onClick={() => setSelectedCategory(cat)} className="bg-white p-2 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md text-left group relative aspect-square flex flex-col justify-center">
                                   <Box size={20} className="mb-2 md:mb-4 text-slate-400 mx-auto md:mx-0" /><h3 className="font-black text-slate-900 uppercase text-[10px] md:text-sm text-center md:text-left truncate w-full">{cat.name}</h3><p className="text-[9px] md:text-xs text-slate-500 font-bold text-center md:text-left">{cat.products.length} Products</p>
                                   <div onClick={(e)=>{e.stopPropagation(); const name = prompt("Rename Category:", cat.name); if(name && name.trim() !== "") { const updated = {...selectedBrand, categories: selectedBrand.categories.map(c => c.id === cat.id ? {...c, name: name.trim()} : c)}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b), archive: addToArchive('other', `Renamed ${cat.name} to ${name}`, null, 'update')}, true); }}} className="absolute top-1 right-8 md:top-2 md:right-8 p-1 md:p-1.5 opacity-0 group-hover:opacity-100 hover:bg-blue-50 text-blue-500 rounded transition-all"><Edit2 size={12}/></div>
                                   <div onClick={(e)=>{e.stopPropagation(); if(confirm("Delete?")){ const updated={...selectedBrand, categories: selectedBrand.categories.filter(c=>c.id!==cat.id)}; handleLocalUpdate({...localData, brands: brands.map(b=>b.id===updated.id?updated:b), archive: addToArchive('other', `Deleted category ${cat.name}`, cat, 'delete')}, true); }}} className="absolute top-1 right-1 md:top-2 md:right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded"><Trash2 size={12}/></div>
                                </button>
                            ))}
                       </div>
                       <div className="mt-8 border-t border-slate-200 pt-8"><h3 className="font-bold text-slate-900 uppercase text-sm mb-4">Brand Catalogues</h3><CatalogueManager catalogues={localData.catalogues?.filter(c => c.brandId === selectedBrand.id) || []} brandId={selectedBrand.id} onSave={(c, immediate) => { const otherCatalogues = (localData.catalogues || []).filter(cat => cat.brandId !== selectedBrand.id); handleLocalUpdate({ ...localData, catalogues: [...otherCatalogues, ...c] }, immediate); }} /></div>
                   </div>
               ) : (
                   <div className="animate-fade-in h-full flex flex-col">
                       <div className="flex items-center gap-4 mb-6 shrink-0"><button onClick={() => setSelectedCategory(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500"><ArrowLeft size={20} /></button><h2 className="text-lg md:text-2xl font-black uppercase text-slate-900 flex-1 truncate">{selectedCategory.name}</h2><button onClick={() => setEditingProduct({ id: generateId('p'), name: '', description: '', specs: {}, features: [], dimensions: [], imageUrl: '' } as any)} className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg font-bold uppercase text-[10px] md:text-xs flex items-center gap-2 shrink-0"><Plus size={14} /> Add</button></div>
                       <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 overflow-y-auto pb-20">
                           {selectedCategory.products.map(product => (
                               <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                                   <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-2 md:p-4">{product.imageUrl ? <img src={product.imageUrl} className="max-w-full max-h-full object-contain" /> : <Box size={24} className="text-slate-300" />}<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"><div className="flex gap-2"><button onClick={() => setEditingProduct(product)} className="p-1.5 md:p-2 bg-white text-blue-600 rounded-lg font-bold text-[10px] md:text-xs uppercase shadow-lg hover:bg-blue-50">Edit</button><button onClick={() => setMovingProduct(product)} className="p-1.5 md:p-2 bg-white text-orange-600 rounded-lg font-bold text-[10px] md:text-xs uppercase shadow-lg hover:bg-orange-50" title="Move Category">Move</button></div><button onClick={() => { if(confirm(`Delete product "${product.name}"?`)) { const updatedCat = {...selectedCategory, products: selectedCategory.products.filter(p => p.id !== product.id)}; const updatedBrand = {...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) || []}; const newArchive = addToArchive('product', product.name, product, 'delete'); handleLocalUpdate({...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b), archive: newArchive}, true); } }} className="p-1.5 md:p-2 bg-white text-red-600 rounded-lg font-bold text-[10px] md:text-xs uppercase shadow-lg hover:bg-red-50 w-[80%]">Delete</button></div></div>
                                   <div className="p-2 md:p-4"><h4 className="font-bold text-slate-900 text-[10px] md:text-sm truncate uppercase">{product.name}</h4><p className="text-[9px] md:text-xs text-slate-500 font-mono truncate">{product.sku || 'No SKU'}</p></div>
                               </div>
                            ))}
                       </div>
                   </div>
               )
            )}

            {activeTab === 'pricelists' && (
                <PricelistManager 
                    pricelists={localData.pricelists || []} 
                    pricelistBrands={localData.pricelistBrands || []}
                    onSavePricelists={(p, immediate) => handleLocalUpdate({ ...localData, pricelists: p, archive: addToArchive('pricelist', 'Batch Update', p, 'update') }, immediate)}
                    onSaveBrands={(b, immediate) => handleLocalUpdate({ ...localData, pricelistBrands: b, archive: addToArchive('other', 'Update Pricelist Brands', b, 'update') }, immediate)}
                    onDeletePricelist={(id) => { const toDelete = localData.pricelists?.find(p => p.id === id); if (toDelete) { const newArchive = addToArchive('pricelist', toDelete.title, toDelete, 'delete'); handleLocalUpdate({ ...localData, pricelists: localData.pricelists?.filter(p => p.id !== id), archive: newArchive }, true); } }}
                />
            )}
            
            {activeTab === 'tv' && (
                !selectedTVBrand ? (
                    <div className="animate-fade-in max-w-6xl mx-auto"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-slate-900 uppercase">TV Video Management</h2></div><div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"><button onClick={() => { const name = prompt("Brand Name:"); if(name) { const newBrand = { id: generateId('tvb'), name, models: [] }; handleLocalUpdate({ ...localData, tv: { ...localData.tv, brands: [...(localData.tv?.brands || []), newBrand] } as TVConfig, archive: addToArchive('brand', name, null, 'create') }, true); }}} className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[160px] text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 transition-all group"><Plus size={32} className="mb-2" /><span className="font-bold uppercase text-xs tracking-wider text-center">Add TV Brand</span></button>{tvBrands.map(brand => (<div key={brand.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all relative"><div className="flex-1 bg-slate-50 flex items-center justify-center p-4 aspect-square">{brand.logoUrl ? <img src={brand.logoUrl} className="max-full max-h-full object-contain" /> : <Tv size={32} className="text-slate-300" />}</div><div className="p-4 bg-white border-t border-slate-100"><h3 className="font-black text-slate-900 text-sm uppercase truncate mb-1">{brand.name}</h3><p className="text-xs text-slate-500 font-bold">{brand.models?.length || 0} Models</p></div><button onClick={(e) => { e.stopPropagation(); if(confirm("Delete TV Brand?")) { handleLocalUpdate({...localData, tv: { ...localData.tv, brands: tvBrands.filter(b => b.id !== brand.id) } as TVConfig, archive: addToArchive('brand', brand.name, brand, 'delete') }, true); } }} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity z-20"><Trash2 size={14}/></button><button onClick={() => setSelectedTVBrand(brand)} className="absolute inset-0 w-full h-full opacity-0 z-10" /></div>))}</div></div>
                ) : (
                    <div className="animate-fade-in max-w-5xl mx-auto"><div className="flex items-center gap-4 mb-6"><button onClick={() => setSelectedTVBrand(null)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase text-slate-900 flex-1">{selectedTVBrand.name} <span className="text-slate-400 font-bold ml-2 text-lg">TV Config</span></h2></div><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="space-y-6"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h4 className="font-bold text-slate-900 uppercase text-xs mb-4">Brand Identity</h4><div className="space-y-4"><InputField label="Brand Name" val={selectedTVBrand.name} onChange={(e: any) => { const updated = { ...selectedTVBrand, name: e.target.value }; handleLocalUpdate({ ...localData, tv: { ...localData.tv, brands: tvBrands.map(b => b.id === selectedTVBrand.id ? updated : b) } as TVConfig, archive: addToArchive('brand', selectedTVBrand.name, {name: e.target.value}, 'update') }); }} /><FileUpload label="Brand Logo" currentUrl={selectedTVBrand.logoUrl} onUpload={(url: any) => { const updated = { ...selectedTVBrand, logoUrl: url }; handleLocalUpdate({ ...localData, tv: { ...localData.tv, brands: tvBrands.map(b => b.id === selectedTVBrand.id ? updated : b) } as TVConfig, archive: addToArchive('brand', selectedTVBrand.name, {logo: url}, 'update') }, true); }} /></div></div></div><div className="md:col-span-2"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><div className="flex justify-between items-center mb-6"><h4 className="font-bold text-slate-900 uppercase text-xs">TV Models</h4><button onClick={() => setEditingTVModel({ id: generateId('tvm'), name: '', videoUrls: [] })} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1"><Plus size={12} /> Add Model</button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{(selectedTVBrand.models || []).map((model) => (<div key={model.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group"><div className="p-4 flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-200">{model.imageUrl ? <img src={model.imageUrl} className="w-full h-full object-cover rounded-lg" /> : <Monitor size={20} className="text-slate-300" />}</div><div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-sm truncate">{model.name}</div><div className="text-[10px] font-bold text-slate-500 uppercase">{model.videoUrls?.length || 0} Videos</div></div></div><div className="flex border-t border-slate-200 divide-x divide-slate-200"><button onClick={() => setEditingTVModel(model)} className="flex-1 py-2 text-[10px] font-bold uppercase text-blue-600 hover:bg-blue-50 transition-colors">Edit / Videos</button><button onClick={() => { if (confirm("Delete this model?")) { const updated = { ...selectedTVBrand, models: selectedTVBrand.models.filter(m => m.id !== model.id) }; handleLocalUpdate({ ...localData, tv: { ...localData.tv, brands: tvBrands.map(b => b.id === selectedTVBrand.id ? updated : b) } as TVConfig, archive: addToArchive('tv_model', model.name, model, 'delete') }, true); } }} className="flex-1 py-2 text-[10px] font-bold uppercase text-red-500 hover:bg-red-50 transition-colors">Delete</button></div></div>))}</div></div></div></div></div>
                )
            )}

            {activeTab === 'marketing' && (
                <div className="max-w-5xl mx-auto">
                    {activeSubTab === 'catalogues' && (
                        <CatalogueManager catalogues={(localData.catalogues || []).filter(c => !c.brandId)} onSave={(c, immediate) => { const brandCatalogues = (localData.catalogues || []).filter(c => c.brandId); handleLocalUpdate({ ...localData, catalogues: [...brandCatalogues, ...c], archive: addToArchive('catalogue', 'Batch Update', c, 'update') }, immediate); }} />
                    )}
                    {activeSubTab === 'hero' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-4"><InputField label="Title" val={localData.hero.title} onChange={(e:any) => handleLocalUpdate({...localData, hero: {...localData.hero, title: e.target.value}, archive: addToArchive('other', 'Hero Title Update', e.target.value, 'update')})} /><InputField label="Subtitle" val={localData.hero.subtitle} onChange={(e:any) => handleLocalUpdate({...localData, hero: {...localData.hero, subtitle: e.target.value}, archive: addToArchive('other', 'Hero Subtitle Update', e.target.value, 'update')})} /><InputField label="Website URL" val={localData.hero.websiteUrl || ''} onChange={(e:any) => handleLocalUpdate({...localData, hero: {...localData.hero, websiteUrl: e.target.value}, archive: addToArchive('other', 'Hero Website Update', e.target.value, 'update')})} placeholder="https://example.com" /></div><div className="space-y-4"><FileUpload label="Background Image" currentUrl={localData.hero.backgroundImageUrl} onUpload={(url:any) => handleLocalUpdate({...localData, hero: {...localData.hero, backgroundImageUrl: url}, archive: addToArchive('other', 'Hero Background Update', url, 'update')}, true)} /><FileUpload label="Brand Logo" currentUrl={localData.hero.logoUrl} onUpload={(url:any) => handleLocalUpdate({...localData, hero: {...localData.hero, logoUrl: url}, archive: addToArchive('other', 'Hero Logo Update', url, 'update')}, true)} /></div></div></div>
                    )}
                    {activeSubTab === 'ads' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{['homeBottomLeft', 'homeBottomRight', 'screensaver'].map(zone => (<div key={zone} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h4 className="font-bold uppercase text-xs mb-1">{zone.replace('home', '')}</h4><p className="text-[10px] text-slate-400 mb-4 uppercase font-bold tracking-wide">{zone.includes('Side') ? 'Size: 1080x1920 (Portrait)' : zone.includes('screensaver') ? 'Mixed Media' : 'Size: 1920x1080 (Landscape)'}</p><FileUpload label="Upload Media" accept="image/*,video/*" allowMultiple onUpload={(urls:any, type:any) => { const newAds = (Array.isArray(urls)?urls:[urls]).map(u=>({id:generateId('ad'), type, url:u, dateAdded: new Date().toISOString()})); handleLocalUpdate({...localData, ads: {...localData.ads, [zone]: [...((localData.ads as any)[zone] || []), ...newAds]} as any, archive: addToArchive('other', `New ads for ${zone}`, newAds, 'create')}, true); }} /><div className="grid grid-cols-3 gap-2 mt-4">{((localData.ads as any)[zone] || []).map((ad: any, idx: number) => (<div key={ad.id} className="relative group aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">{ad.type === 'video' ? <video src={ad.url} className="w-full h-full object-cover opacity-60" /> : <img src={ad.url} alt="Ad" className="w-full h-full object-cover" />}<button onClick={() => { const currentAds = (localData.ads as any)[zone]; const toDelete = currentAds[idx]; const newAdsList = currentAds.filter((_: any, i: number) => i !== idx); handleLocalUpdate({ ...localData, ads: { ...localData.ads, [zone]: newAdsList } as any, archive: addToArchive('other', `Deleted ad from ${zone}`, toDelete, 'delete') }, true); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 size={10} /></button></div>))}</div></div>))}</div>
                    )}
                </div>
            )}
            {activeTab === 'fleet' && (
                <div className="animate-fade-in max-w-7xl mx-auto pb-24">
                   <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-3"><div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-800"><Radio className="text-blue-500 animate-pulse" size={24}/></div><div><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Command Center</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Fleet Telemetry</p></div></div><div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-2xl"><div className="px-4 py-2 border-r border-slate-800"><div className="text-[8px] font-black text-slate-500 uppercase mb-0.5 tracking-widest">Active Units</div><div className="text-lg font-black text-blue-400 font-mono leading-none">{localData.fleet?.length || 0}</div></div><div className="px-4 py-2"><div className="text-[8px] font-black text-slate-500 uppercase mb-0.5 tracking-widest">Health</div><div className="text-lg font-black text-green-400 font-mono leading-none">100%</div></div></div></div>
                   {['kiosk', 'mobile', 'tv'].map((type) => { const devices = localData.fleet?.filter(k => k.deviceType === type || (type === 'kiosk' && !k.deviceType)) || []; if (devices.length === 0) return null; const config = { kiosk: { label: 'Interactive Terminals', icon: <Tablet size={18} className="text-blue-500" />, color: 'blue' }, mobile: { label: 'Handheld Units', icon: <Smartphone size={18} className="text-purple-500" />, color: 'purple' }, tv: { label: 'Display Walls', icon: <Tv size={18} className="text-indigo-500" />, color: 'indigo' } }[type as 'kiosk' | 'mobile' | 'tv']; return (<div key={type} className="mb-12 last:mb-0"><div className="flex items-center gap-3 mb-6"><div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-lg`}>{config.icon}</div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{config.label}</h3><div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-4"></div><span className="text-[10px] font-black bg-white text-slate-400 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">{devices.length} Units</span></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{devices.map(kiosk => { const isOnline = (new Date().getTime() - new Date(kiosk.last_seen).getTime()) < 350000; return (<div key={kiosk.id} className={`group relative bg-slate-950 border-2 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-2xl flex flex-col ${isOnline ? 'border-blue-500/50 shadow-blue-500/10' : 'border-slate-800 grayscale opacity-60'}`}>{isOnline && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] rounded-full"></div>}<div className="p-5 flex justify-between items-start"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1.5"><div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)] animate-pulse' : 'bg-slate-700'}`}></div><span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isOnline ? 'text-blue-400' : 'text-slate-500'}`}>{isOnline ? 'Active Pulse' : 'Offline'}</span></div><h4 className="font-black text-white uppercase text-base leading-none tracking-tight truncate mb-1 group-hover:text-blue-400 transition-colors">{kiosk.name}</h4><div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-1"><MapPin size={10} className="text-slate-700" /> <span className="truncate max-w-[100px]">{kiosk.assignedZone || 'UNASSIGNED'}</span>{(kiosk.showPricelists ?? true) ? (<span className="flex items-center gap-1 text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20 font-bold ml-auto"><Table size={8}/> PL:ON</span>) : (<span className="flex items-center gap-1 text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 font-bold ml-auto"><Table size={8}/> PL:OFF</span>)}</div></div><div className="shrink-0 flex flex-col items-end gap-2"><SignalStrengthBars strength={kiosk.wifiStrength || 0} /><div className="text-[8px] font-black text-slate-600 uppercase font-mono">{kiosk.ipAddress?.split(' | ')[0] || '--'}</div></div></div><div className="px-5 py-4 grid grid-cols-2 gap-3 bg-black/40 border-y border-white/5"><div className="p-2.5 rounded-2xl bg-white/5 border border-white/5"><div className="text-[8px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1.5"><Clock size={10} className="text-blue-500" /> Sync Age</div><div className="text-xs font-bold text-slate-300 truncate">{formatRelativeTime(kiosk.last_seen)}</div></div><div className="p-2.5 rounded-2xl bg-white/5 border border-white/5"><div className="text-[8px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1.5"><Terminal size={10} className="text-purple-500" /> Version</div><div className="text-xs font-mono font-black text-slate-300">v{kiosk.version || '1.0.0'}</div></div></div><div className="mt-auto p-3 flex gap-2"><button onClick={() => setEditingKiosk(kiosk)} className="flex-1 bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white p-2.5 rounded-2xl transition-all border border-slate-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 group/btn"><Edit2 size={12} className="group-hover/btn:scale-110 transition-transform" /> <span className="hidden sm:inline">Modify</span></button>{supabase && isOnline && (<button onClick={async () => { if(confirm("Initiate Remote System Reset?")) await supabase.from('kiosks').update({restart_requested: true}).eq('id', kiosk.id); }} className="flex-1 bg-slate-900 hover:bg-orange-600 text-orange-500 hover:text-white p-2.5 rounded-2xl transition-all border border-slate-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 group/btn"><Power size={12} /> <span className="hidden sm:inline">Reset</span></button>)}<button onClick={() => removeFleetMember(kiosk.id)} className="w-12 bg-slate-900 hover:bg-red-600 text-slate-700 hover:text-white p-2.5 rounded-2xl transition-all border border-slate-800 flex items-center justify-center shadow-lg group/btn" title="De-Authorize Device"><Lock size={12} className="group-hover/btn:rotate-12 transition-transform" /></button></div><div className="absolute bottom-1 right-5 text-[7px] font-mono font-black text-slate-800 uppercase pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">UUID: {kiosk.id}</div></div>); })}</div></div>); })}
                   {localData.fleet?.length === 0 && <div className="p-20 text-center flex flex-col items-center justify-center gap-6 animate-fade-in border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50"><div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300"><Radio size={40} /></div><div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Awaiting Transmissions</h3><p className="text-slate-500 font-medium text-sm">Initialize your first device to begin fleet telemetry monitoring.</p></div></div>}
                </div>
            )}
            
            {activeTab === 'screensaver' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div><h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Timing & Schedule</h3></div><div className="grid grid-cols-2 gap-4 mb-6"><InputField label="Idle Wait (sec)" val={localData.screensaverSettings?.idleTimeout||60} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, idleTimeout: parseInt(e.target.value)}, archive: addToArchive('other', 'Screensaver Idle Timeout', e.target.value, 'update')})} /><InputField label="Slide Duration (sec)" val={localData.screensaverSettings?.imageDuration||8} onChange={(e:any)=>handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, imageDuration: parseInt(e.target.value)}, archive: addToArchive('other', 'Screensaver Slide Duration', e.target.value, 'update')})} /></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><div className="flex justify-between items-center mb-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active Hours (Sleep Mode)</label><button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, enableSleepMode: !localData.screensaverSettings?.enableSleepMode}, archive: addToArchive('other', 'Screensaver Sleep Mode Toggle', !localData.screensaverSettings?.enableSleepMode, 'update')}, true)} className={`w-8 h-4 rounded-full transition-colors relative ${localData.screensaverSettings?.enableSleepMode ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${localData.screensaverSettings?.enableSleepMode ? 'left-5' : 'left-1'}`}></div></button></div><div className={`grid grid-cols-2 gap-4 transition-opacity ${localData.screensaverSettings?.enableSleepMode ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}><div><label className="block text-[10px] font-bold text-slate-400 mb-1">Start Time</label><input type="time" value={localData.screensaverSettings?.activeHoursStart || '08:00'} onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursStart: e.target.value}})} className="w-full p-2 border border-slate-300 rounded text-sm font-bold"/></div><div><label className="block text-[10px] font-bold text-slate-400 mb-1">End Time</label><input type="time" value={localData.screensaverSettings?.activeHoursEnd || '20:00'} onChange={(e) => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, activeHoursEnd: e.target.value}})} className="w-full p-2 border border-slate-300 rounded text-sm font-bold"/></div></div></div></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100"><div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Monitor size={20} /></div><h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Content & Behavior</h3></div><div className="space-y-4">{[{ key: 'showProductImages', label: 'Show Products (Images)' }, { key: 'showProductVideos', label: 'Show Products (Videos)' }, { key: 'showPamphlets', label: 'Show Pamphlet Covers' }, { key: 'showCustomAds', label: 'Show Custom Ads' }, { key: 'muteVideos', label: 'Mute Videos' }, { key: 'showInfoOverlay', label: 'Show Title Overlay' }].map(opt => (<div key={opt.key} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"><label className="text-xs font-bold text-slate-700 uppercase">{opt.label}</label><button onClick={() => handleLocalUpdate({...localData, screensaverSettings: {...localData.screensaverSettings!, [opt.key]: !(localData.screensaverSettings as any)[opt.key]}, archive: addToArchive('other', `Screensaver Opt: ${opt.label}`, !(localData.screensaverSettings as any)[opt.key], 'update')}, true)} className={`w-10 h-5 rounded-full transition-colors relative ${(localData.screensaverSettings as any)[opt.key] ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${(localData.screensaverSettings as any)[opt.key] ? 'left-6' : 'left-1'}`}></div></button></div>))}</div></div></div><div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500"><Volume size={120} /></div><div className="relative z-10"><h3 className="text-white font-black uppercase text-sm tracking-[0.2em] mb-4 flex items-center gap-3"><Volume2 className="text-blue-400" /> Audio Policy Diagnostic</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><p className="text-slate-400 text-sm leading-relaxed font-medium">Browser security prevents <strong className="text-white">Unmuted Video</strong> from playing automatically until a user interacts with the app.</p><div className="flex gap-4"><div className={`flex-1 p-4 rounded-2xl border ${!localData.screensaverSettings?.muteVideos ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500 opacity-50'}`}><div className="text-[10px] font-black uppercase mb-1">Status</div><div className="font-bold">Sound Requested</div></div><div className={`flex-1 p-4 rounded-2xl border ${isCloudConnected ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}><div className="text-[10px] font-black uppercase mb-1">Autoplay</div><div className="font-bold">Managed</div></div></div></div><div className="bg-black/40 rounded-2xl p-6 border border-white/5"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Fixing Muted Videos:</h4><ul className="space-y-3"><li className="flex items-start gap-3 text-xs font-medium text-slate-300"><div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div><span>Turn <strong className="text-blue-400">"Mute Videos"</strong> toggle to <strong className="text-blue-400">OFF</strong> above.</span></li><li className="flex items-start gap-3 text-xs font-medium text-slate-300"><div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div><span>Touch the kiosk screen once after it reloads to "Unlock" the sound engine.</span></li><li className="flex items-start gap-3 text-xs font-medium text-slate-300"><div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</div><span>The screensaver will now play unmuted audio in the next loop.</span></li></ul></div></div></div></div></div>
            )}
            
            {activeTab === 'history' && (
               <div className="max-w-7xl mx-auto space-y-6"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">System Audit Log</h2><p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Detailed track of administrative actions</p></div><div className="flex gap-2"><button onClick={() => { if(confirm("Permanently clear ALL archived history?")) handleLocalUpdate({...localData, archive: { brands: [], products: [], catalogues: [], deletedItems: [], deletedAt: {} }}, true) }} className="text-red-500 font-bold uppercase text-xs flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-lg transition-colors"><Trash2 size={14}/> Wipe History</button></div></div><div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl min-h-[600px] flex flex-col"><div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-6"><div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-2xl self-start overflow-x-auto max-w-full">{[{id: 'all', label: 'All Activity', icon: <History size={14}/>},{id: 'create', label: 'Created', icon: <Plus size={14}/>},{id: 'update', label: 'Updated', icon: <Edit2 size={14}/>},{id: 'delete', label: 'Deleted', icon: <Trash2 size={14}/>},{id: 'restore', label: 'Restored', icon: <RotateCcw size={14}/>}].map(tab => (<button key={tab.id} onClick={() => setHistoryTab(tab.id as any)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex items-center gap-2 ${historyTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>{tab.icon} {tab.label}</button>))}</div><div className="relative group"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" /><input type="text" placeholder="Search actions, users or items..." className="pl-12 pr-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold w-full md:w-80 focus:border-blue-500 outline-none transition-all shadow-sm" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)}/></div></div><div className="flex-1 overflow-y-auto">{archivedGenericItems.length === 0 ? (<div className="flex flex-col items-center justify-center h-96 text-slate-400"><div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-100"><History size={40} className="opacity-20" /></div><span className="text-xs font-black uppercase tracking-widest">No matching activities found</span></div>) : (<table className="w-full text-left border-collapse"><thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md"><tr><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action & Type</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Subject</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Executor</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Reference</th></tr></thead><tbody className="divide-y divide-slate-50">{archivedGenericItems.map(item => (<tr key={item.id} className="hover:bg-blue-50/30 transition-colors group"><td className="px-8 py-5"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.action === 'delete' ? 'bg-red-50 border-red-100 text-red-500' : item.action === 'restore' ? 'bg-green-50 border-green-100 text-green-500' : item.action === 'create' ? 'bg-blue-50 border-blue-100 text-blue-500' : 'bg-orange-50 border-orange-100 text-orange-500'}`}>{item.action === 'delete' ? <Trash2 size={16}/> : item.action === 'restore' ? <RotateCcw size={16}/> : item.action === 'create' ? <Plus size={16}/> : <Edit2 size={16}/>}</div><div><div className="text-[10px] font-black uppercase tracking-tight text-slate-900">{item.action}</div><div className="text-[9px] font-bold text-slate-400 uppercase">{item.type}</div></div></div></td><td className="px-8 py-5"><div className="font-black text-slate-900 uppercase text-xs tracking-tight">{item.name}</div><div className="text-[9px] text-slate-400 font-mono mt-1 opacity-60">ID: {item.id}</div></td><td className="px-8 py-5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center"><User size={12} /></div><span className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.userName || 'System'}</span></div><div className="text-[9px] font-bold text-slate-400 uppercase mt-1">via {item.method || 'admin_panel'}</div></td><td className="px-8 py-5"><div className="text-xs font-black text-slate-900">{formatRelativeTime(item.deletedAt)}</div><div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{new Date(item.deletedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></td><td className="px-8 py-5 text-right"><div className="flex items-center justify-end gap-2">{(item.type === 'brand' || item.type === 'catalogue') && item.action === 'delete' && (<button onClick={() => item.type === 'brand' ? restoreBrand(item.data) : restoreCatalogue(item.data)} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95">Restore</button>)}<button onClick={() => { const json = JSON.stringify(item.data || item, null, 2); const blob = new Blob([json], {type: "application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${item.name}-audit.json`; a.click(); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200" title="Download Audit Payload"><Download size={16} /></button></div></td></tr>))}</tbody></table>)}</div></div></div>
            )}

            {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> System Branding</h3><div className="bg-slate-50 p-6 rounded-xl border border-slate-200"><FileUpload label="Main Company Logo (PDFs & Header)" currentUrl={localData.companyLogoUrl} onUpload={(url: string) => handleLocalUpdate({...localData, companyLogoUrl: url, archive: addToArchive('other', 'Company Logo Update', url, 'update')}, true)} /><p className="text-[10px] text-slate-400 mt-2 font-medium">This logo is used at the top of the Kiosk App and as the primary branding on all exported PDF Pricelists.</p></div></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Lock size={20} className="text-red-500" /> Device Setup Security</h3><div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4"><div className="flex-1"><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Global Setup PIN</label><input type="text" value={localData.systemSettings?.setupPin || '0000'} onChange={(e) => handleLocalUpdate({ ...localData, systemSettings: { ...localData.systemSettings, setupPin: e.target.value }, archive: addToArchive('other', 'System PIN Update', '********', 'update') })} className="w-full md:w-64 p-3 border border-slate-300 rounded-xl bg-white font-mono font-bold text-lg tracking-widest text-center" placeholder="0000" maxLength={8} /><p className="text-[10px] text-slate-400 mt-2 font-medium">This PIN is required on all new devices (Kiosk, Mobile, TV) to complete the setup process. Default: 0000.</p></div><div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-xs max-w-xs"><strong>Security Note:</strong> Changing this PIN will require all future device setups to use the new code. Existing active devices are not affected.</div></div></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500 pointer-events-none"><Database size={120} /></div><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><Database size={20} className="text-blue-500"/> System Data & Backup</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"><div className="space-y-4"><div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs"><strong>Export System Backup:</strong> Downloads a full archive including Inventory, Marketing, TV Config, Fleet logs, and History.<div className="mt-2 text-blue-600 font-bold">Use this to edit offline or migrate data.</div></div><button onClick={async () => { setExportProcessing(true); try { await downloadZip(localData); } catch (e) { console.error(e); alert("Export Failed: " + (e as Error).message); } finally { setExportProcessing(false); } }} disabled={exportProcessing} className={`w-full py-4 ${exportProcessing ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25`}>{exportProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {exportProcessing ? 'Packaging All Assets...' : 'Download Full System Backup (.zip)'}</button></div><div className="space-y-4"><div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs"><strong>Import Structure:</strong> Upload a ZIP file to auto-populate the system.<ul className="list-disc pl-4 mt-2 space-y-1 text-[10px] text-slate-500 font-bold"><li>Folder Structure: <code>Brand/Category/Product/</code></li><li>Place images (.jpg/.png) & manuals (.pdf) inside product folders.</li><li>Images & PDFs are uploaded to Cloud Storage sequentially.</li></ul></div><label className={`w-full py-4 ${importProcessing ? 'bg-slate-300 cursor-wait' : 'bg-slate-800 hover:bg-slate-900 cursor-pointer'} text-white rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl relative overflow-hidden`}>{importProcessing ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16} />} <span className="relative z-10">{importProcessing ? importProgress || 'Processing...' : 'Import Data from ZIP'}</span><input type="file" accept=".zip" className="hidden" disabled={importProcessing} onChange={async (e) => { if(e.target.files && e.target.files[0]) { if(confirm("This will merge imported data into your current inventory. Continue?")) { setImportProcessing(true); setImportProgress('Initializing...'); try { const newBrands = await importZip(e.target.files[0], (msg) => setImportProgress(msg)); let mergedBrands = [...localData.brands]; newBrands.forEach(nb => { const existingBrandIndex = mergedBrands.findIndex(b => b.name === nb.name); if (existingBrandIndex > -1) { if (nb.logoUrl) { mergedBrands[existingBrandIndex].logoUrl = nb.logoUrl; } if (nb.themeColor) { mergedBrands[existingBrandIndex].themeColor = nb.themeColor; } nb.categories.forEach(nc => { const existingCatIndex = mergedBrands[existingBrandIndex].categories.findIndex(c => c.name === nc.name); if (existingCatIndex > -1) { const existingProducts = mergedBrands[existingBrandIndex].categories[existingCatIndex].products; const uniqueNewProducts = nc.products.filter(np => !existingProducts.find(ep => ep.name === np.name)); mergedBrands[existingBrandIndex].categories[existingCatIndex].products = [...existingProducts, ...uniqueNewProducts]; } else { mergedBrands[existingBrandIndex].categories.push(nc); } }); } else { mergedBrands.push(nb); } }); handleLocalUpdate({ ...localData, brands: mergedBrands, archive: addToArchive('other', 'Bulk Import Successful', {brandsCount: newBrands.length}, 'create', 'import') }, true); alert(`Import Successful! Processed ${newBrands.length} brands.`); } catch(err) { console.error(err); alert("Failed to read ZIP file. Ensure structure is correct."); } finally { setImportProcessing(false); setImportProgress(''); } } } }} /></label></div></div></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-black text-slate-900 uppercase text-sm mb-6 flex items-center gap-2"><UserCog size={20} className="text-blue-500"/> Admin Access Control</h3><AdminManager admins={localData.admins || []} onUpdate={(admins) => handleLocalUpdate({ ...localData, admins, archive: addToArchive('other', 'Admin list updated', null, 'update') }, true)} currentUser={currentUser} /></div><div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg text-white"><div className="flex items-center gap-3 mb-6"><CloudLightning size={24} className="text-yellow-400" /><h3 className="font-black uppercase text-sm tracking-wider">System Operations</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><button onClick={() => setShowGuide(true)} className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center gap-3 transition-colors border border-slate-600"><BookOpen size={24} className="text-blue-400"/><div className="text-left"><div className="font-bold text-sm">Setup Guide</div><div className="text-[10px] text-slate-400 font-mono uppercase">Docs & Scripts</div></div></button><button onClick={async () => { if(confirm("WARNING: This will wipe ALL local data and reset to defaults. Continue?")) { const d = await resetStoreData(); setLocalData(d); window.location.reload(); } }} className="p-4 bg-red-900/30 hover:bg-red-900/50 rounded-xl flex items-center gap-3 transition-colors border border-red-900/50 text-red-300"><AlertCircle size={24} /><div className="text-left"><div className="font-bold text-sm">Factory Reset</div><div className="text-[10px] text-red-400 font-mono uppercase">Clear Local Data</div></div></button></div></div></div>
            )}
        </main>

        {editingProduct && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in"><ProductEditor product={editingProduct} onSave={(p) => { if (!selectedBrand || !selectedCategory) return; if (p.sku && checkSkuDuplicate(p.sku, p.id)) { alert(`SKU "${p.sku}" is already used by another product.`); return; } const isNew = !selectedCategory.products.find(x => x.id === p.id); const newProducts = isNew ? [...selectedCategory.products, p] : selectedCategory.products.map(x => x.id === p.id ? p : x); const updatedCat = { ...selectedCategory, products: newProducts }; const updatedBrand = { ...selectedBrand, categories: selectedBrand.categories.map(c => c.id === updatedCat.id ? updatedCat : c) }; const newArchive = addToArchive('product', p.name, p, isNew ? 'create' : 'update'); handleLocalUpdate({ ...localData, brands: brands.map(b => b.id === updatedBrand.id ? updatedBrand : b), archive: newArchive }, true); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} /></div>}
        {movingProduct && <MoveProductModal product={movingProduct} allBrands={brands} currentBrandId={selectedBrand?.id || ''} currentCategoryId={selectedCategory?.id || ''} onClose={() => setMovingProduct(null)} onMove={(product, targetBrand, targetCategory) => handleMoveProduct(product, targetBrand, targetCategory)} />}
        {editingKiosk && <KioskEditorModal kiosk={editingKiosk} onSave={async (k) => { const success = await updateFleetMember(k); if(success) setEditingKiosk(null); }} onClose={() => setEditingKiosk(null)} />}
        {editingTVModel && <TVModelEditor model={editingTVModel} onSave={(m) => { if (!selectedTVBrand) return; const isNew = !selectedTVBrand.models.find(x => x.id === m.id); const newModels = isNew ? [...selectedTVBrand.models, m] : selectedTVBrand.models.map(x => x.id === m.id ? m : x); const updatedTVBrand = { ...selectedTVBrand, models: newModels }; handleLocalUpdate({ ...localData, tv: { ...localData.tv, brands: tvBrands.map(b => b.id === selectedTVBrand.id ? updatedTVBrand : b) } as TVConfig, archive: addToArchive('tv_model', m.name, m, isNew ? 'create' : 'update') }, true); setEditingTVModel(null); }} onClose={() => setEditingTVModel(null)} />}
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;
