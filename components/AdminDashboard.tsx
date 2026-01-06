import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, MonitorPlay
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
                            <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg">Module 02: Storage Logic</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Structured Hierarchy</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The database is strictly hierarchical. This ensures that every product belongs to a specific "shelf" (Category) within a specific "Store" (Brand).</p>
                        </div>
                        {/* Visual Diagram of Brand > Category > Product */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             {/* Card 1: Brand */}
                             <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={80} /></div>
                                 <h3 className="text-xl font-black text-slate-900 mb-2">1. Brand Root</h3>
                                 <p className="text-sm text-slate-500 font-medium">The top-level container (e.g., "Samsung"). It holds global assets like the Logo and Theme Color.</p>
                             </div>
                             {/* Card 2: Category */}
                             <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10"><Grid size={80} /></div>
                                 <h3 className="text-xl font-black text-slate-900 mb-2">2. Category Node</h3>
                                 <p className="text-sm text-slate-500 font-medium">Groups similar items (e.g., "Smartphones"). Defines the icon used in the navigation grid.</p>
                             </div>
                             {/* Card 3: Product */}
                             <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10"><Box size={80} /></div>
                                 <h3 className="text-xl font-black text-white mb-2">3. Product Leaf</h3>
                                 <p className="text-sm text-blue-100 font-medium">The actual item. Contains Specs, Gallery, Videos, and Manuals. Linked via SKU.</p>
                             </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg">Module 03: Pricing Engine</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Rounding & Generation</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The system automatically "cleans" prices to look professional. It converts raw Excel data into a standardized format.</p>
                        </div>
                        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative">
                             <h3 className="text-blue-400 font-black uppercase text-xs tracking-widest mb-6">Algorithm Visualization</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                 <div>
                                     <div className="text-3xl font-mono text-red-400 line-through opacity-50 mb-2">129.99</div>
                                     <ArrowRight className="mx-auto rotate-90 md:rotate-0 my-2 text-slate-600" />
                                     <div className="text-4xl font-mono font-black text-white">130</div>
                                     <div className="text-[10px] uppercase text-slate-500 mt-2 font-bold">Decimal Ceiling</div>
                                 </div>
                                 <div>
                                     <div className="text-3xl font-mono text-red-400 line-through opacity-50 mb-2">799</div>
                                     <ArrowRight className="mx-auto rotate-90 md:rotate-0 my-2 text-slate-600" />
                                     <div className="text-4xl font-mono font-black text-white">800</div>
                                     <div className="text-[10px] uppercase text-slate-500 mt-2 font-bold">Psychological Rounding</div>
                                 </div>
                                 <div>
                                     <div className="text-3xl font-mono text-red-400 line-through opacity-50 mb-2">122</div>
                                     <ArrowRight className="mx-auto rotate-90 md:rotate-0 my-2 text-slate-600" />
                                     <div className="text-4xl font-mono font-black text-white">122</div>
                                     <div className="text-[10px] uppercase text-slate-500 mt-2 font-bold">Integer Preservation</div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg">Module 04: Visual Loop</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Smart Playlist</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The screensaver doesn't just play random files. It constructs a dynamic playlist every time the device goes idle, ensuring fresh content.</p>
                        </div>
                        <div className="p-8 bg-purple-50 rounded-[2rem] border border-purple-100">
                            <h3 className="font-black text-purple-900 uppercase text-lg mb-4">Construction Logic</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-sm">1</span>
                                    <span className="font-bold text-slate-700">Inject Custom Ads (High Priority)</span>
                                </li>
                                <li className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-sm">2</span>
                                    <span className="font-bold text-slate-700">Inject Pamphlet Covers (Date Sensitive)</span>
                                </li>
                                <li className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-sm">3</span>
                                    <span className="font-bold text-slate-700">Mix in Product Images & Videos</span>
                                </li>
                                <li className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-black text-sm">4</span>
                                    <span className="font-bold text-slate-700">Shuffle & Play Loop</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-slate-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg">Module 05: Fleet Watch</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Telemetry Pulse</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Every device sends a "Heartbeat" to the cloud every 30 seconds. This allows you to see which units are online, what WiFi strength they have, and if they need a reboot.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                                <h4 className="font-black text-green-700 uppercase">Online Pulse</h4>
                                <p className="text-sm text-green-800 mt-2">If last seen &lt; 2 mins ago. Device is active and syncing.</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                                <h4 className="font-black text-red-700 uppercase">Offline State</h4>
                                <p className="text-sm text-red-800 mt-2">If last seen &gt; 5 mins ago. Device may be off or disconnected.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg">Module 06: TV Protocol</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Passive Display</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">TV Mode removes all interactive elements. It is designed for large video walls where no user touch input is expected.</p>
                        </div>
                        <div className="p-8 bg-slate-900 rounded-[2rem] text-white">
                            <div className="flex items-center gap-4 mb-6">
                                <MonitorPlay size={32} className="text-indigo-400" />
                                <div>
                                    <h3 className="font-black uppercase text-xl">Playback Rules</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase">Difference from Kiosk Mode</p>
                                </div>
                            </div>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <li className="bg-white/10 p-4 rounded-xl border border-white/5">
                                    <span className="text-indigo-300 font-black uppercase text-xs block mb-1">No Idle Timer</span>
                                    Videos play forever. The screen never goes black (unless Sleep Mode is active).
                                </li>
                                <li className="bg-white/10 p-4 rounded-xl border border-white/5">
                                    <span className="text-indigo-300 font-black uppercase text-xs block mb-1">Audio Unlocked</span>
                                    Designed for showrooms where sound is encouraged.
                                </li>
                                <li className="bg-white/10 p-4 rounded-xl border border-white/5">
                                    <span className="text-indigo-300 font-black uppercase text-xs block mb-1">Specific Loops</span>
                                    Can lock to a specific Brand or Model, unlike Kiosk which mixes everything.
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
                
                <div className="h-40"></div>
            </div>
        </div>
    );
};

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = () => {
        const admin = admins.find(a => a.pin === pin);
        if (admin) {
            onLogin(admin);
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl border-4 border-slate-900">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase mb-2 tracking-tight">System Locked</h2>
                <p className="text-slate-500 mb-8 text-xs font-bold uppercase tracking-widest">Authorized Personnel Only</p>
                
                <input 
                    type="password" 
                    value={pin}
                    onChange={e => { setPin(e.target.value); setError(false); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className={`w-full text-center text-3xl font-mono font-black tracking-[0.5em] p-4 border-2 rounded-2xl mb-6 outline-none transition-all ${error ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50'}`}
                    maxLength={6}
                    placeholder="••••"
                    autoFocus
                />

                <button 
                    onClick={handleLogin}
                    className="w-full bg-slate-900 text-white font-black uppercase py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                    <Unlock size={18} /> Access Dashboard
                </button>
            </div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState('docs');

    if (!storeData) return null;

    if (!currentUser) {
        return <Auth admins={storeData.admins} onLogin={setCurrentUser} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
            <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col shrink-0 z-20">
                <div className="p-6 border-b border-white/10">
                    <h1 className="font-black text-xl uppercase tracking-widest flex items-center gap-2"><LayoutGrid className="text-blue-500"/> Kiosk<span className="text-blue-500">Admin</span></h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <button onClick={() => setActiveTab('docs')} className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-3 transition-all ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <BookOpen size={18} /> Documentation
                    </button>
                    {/* Placeholder for other navigation items based on imports */}
                    <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-3 transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <Box size={18} /> Inventory
                    </button>
                </nav>
                <div className="p-4 border-t border-white/10">
                     <button onClick={() => setCurrentUser(null)} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all">
                         <LogOut size={16} /> Sign Out
                     </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
                {activeTab === 'docs' && <SystemDocumentation />}
                {activeTab === 'inventory' && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Box size={64} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-black uppercase">Inventory Manager</h2>
                        <p className="text-sm">Functionality to be implemented.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
