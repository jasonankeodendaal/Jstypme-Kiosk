
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
                            <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 02: Data Structure</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Inventory Hierarchy</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk uses a <strong>Strict 3-Tier System</strong> to keep products organized. This structure ensures shoppers can always find what they need in exactly 3 taps.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: '1. Brand', desc: 'The Manufacturer (e.g. Samsung)', icon: <Globe size={32} className="text-white"/>, color: 'bg-blue-600' },
                                { title: '2. Category', desc: 'The Product Type (e.g. Smartphones)', icon: <LayoutGrid size={32} className="text-white"/>, color: 'bg-purple-600' },
                                { title: '3. Product', desc: 'The Specific Item (e.g. Galaxy S24)', icon: <Tag size={32} className="text-white"/>, color: 'bg-green-600' }
                            ].map((level, i) => (
                                <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg relative overflow-hidden group">
                                    <div className={`w-16 h-16 rounded-2xl ${level.color} flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform`}>
                                        {level.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{level.title}</h3>
                                    <p className="text-sm font-medium text-slate-500">{level.desc}</p>
                                    <div className="absolute top-4 right-4 text-[100px] font-black text-slate-50 opacity-10 pointer-events-none -translate-y-8 translate-x-4">{i+1}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/10 rounded-xl"><FileArchive className="text-orange-400" size={24} /></div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-wide">Bulk Import Protocol</h3>
                                    </div>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        Instead of adding items one-by-one, you can drag & drop a <strong>ZIP File</strong> into the Settings panel. The system automatically reads your folder names to build the hierarchy for you.
                                    </p>
                                    <div className="p-4 bg-black/40 rounded-xl border border-white/10 font-mono text-xs text-green-400">
                                        Format: Brand_Name / Category_Name / Product_Name / image.jpg
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-4 text-white/50 text-xs font-bold uppercase tracking-widest"><FolderOpen size={14}/> ZIP Structure Preview</div>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex items-center gap-2 text-blue-300"><ChevronRight size={14} className="rotate-90"/> <Folder size={14}/> Samsung</div>
                                        <div className="flex items-center gap-2 text-purple-300 pl-6"><ChevronRight size={14} className="rotate-90"/> <Folder size={14}/> Phones</div>
                                        <div className="flex items-center gap-2 text-green-300 pl-12"><ChevronRight size={14} className="rotate-90"/> <Folder size={14}/> Galaxy S24 Ultra</div>
                                        <div className="flex items-center gap-2 text-slate-400 pl-20"><ImageIcon size={14}/> cover.jpg</div>
                                        <div className="flex items-center gap-2 text-slate-400 pl-20"><FileText size={14}/> specs.json</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-indigo-500/20">Module 03: Logic Engine</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Smart Pricing Matrix</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The system includes a built-in spreadsheet parser that converts raw Excel data into beautiful, branded PDF price tags instantly.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2"><Cpu size={24} className="text-indigo-500"/> Rounding Algorithm</h3>
                                    <p className="text-slate-600 font-medium mb-6">To maintain a consistent "Premium" look, all prices are automatically rounded to psychological price points.</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                            <div className="text-xs font-bold text-slate-400 uppercase">Input (Raw)</div>
                                            <div className="font-mono font-bold text-slate-500 line-through">R 142.50</div>
                                            <ArrowRight size={16} className="text-slate-300"/>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Output (Clean)</div>
                                            <div className="font-mono font-black text-green-600 text-lg">R 143</div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-indigo-100">
                                            <div className="text-xs font-bold text-slate-400 uppercase">Input (Raw)</div>
                                            <div className="font-mono font-bold text-slate-500 line-through">R 799</div>
                                            <ArrowRight size={16} className="text-indigo-300"/>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Logic (+1)</div>
                                            <div className="font-mono font-black text-indigo-600 text-lg">R 800</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10"><FileText size={120} /></div>
                                <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles className="text-yellow-400" /> PDF Synthesis</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black">1</div>
                                        <div>
                                            <h4 className="font-bold uppercase text-sm mb-1">Ingest</h4>
                                            <p className="text-slate-400 text-xs leading-relaxed">System reads .XLSX rows. Columns are auto-detected (SKU, Desc, Price).</p>
                                        </div>
                                    </div>
                                    <div className="w-0.5 h-8 bg-white/10 ml-5"></div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-black">2</div>
                                        <div>
                                            <h4 className="font-bold uppercase text-sm mb-1">Normalize</h4>
                                            <p className="text-slate-400 text-xs leading-relaxed">Prices are cleaned. SKUs are capitalized. Descriptions are trimmed.</p>
                                        </div>
                                    </div>
                                    <div className="w-0.5 h-8 bg-white/10 ml-5"></div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-black">3</div>
                                        <div>
                                            <h4 className="font-bold uppercase text-sm mb-1">Render</h4>
                                            <p className="text-slate-400 text-xs leading-relaxed">Client-side generation of a 300DPI PDF file, ready for printing.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-purple-500/20">Module 04: Visual Automaton</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Idle Loop Engine</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">When the tablet detects no touch input for 60 seconds (configurable), it enters an autonomous "Attract Mode" to capture customer attention.</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 mb-12">
                            <div className="flex-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2"><List size={20} className="text-purple-500"/> Dynamic Playlist</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">The screensaver doesn't just play one video. It builds a live playlist by shuffling three types of content:</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ImageIcon size={14}/></div>
                                        <span className="text-xs font-bold uppercase text-slate-700">Product Images</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Megaphone size={14}/></div>
                                        <span className="text-xs font-bold uppercase text-slate-700">Promotional Ads</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Video size={14}/></div>
                                        <span className="text-xs font-bold uppercase text-slate-700">Brand Videos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2"><Clock size={20} className="text-orange-500"/> Aging Algorithm</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">To keep content fresh, the system checks the `dateAdded` of every product.</p>
                                <div className="relative pt-6">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 rounded-full"></div>
                                    <div className="flex justify-between relative -top-2.5">
                                        <div className="flex flex-col items-center">
                                            <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
                                            <span className="text-[10px] font-black uppercase mt-2 text-green-600">New Item</span>
                                            <span className="text-[9px] font-medium text-slate-400">100% Chance</span>
                                        </div>
                                        <div className="flex flex-col items-center opacity-50">
                                            <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase mt-3 text-slate-400">6 Months</span>
                                            <span className="text-[9px] font-medium text-slate-400">25% Chance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 flex items-center justify-between border border-slate-800 shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg"><Moon size={24}/></div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-wider text-sm">Smart Sleep Mode</h3>
                                    <p className="text-slate-400 text-xs font-medium mt-1">Configurable active hours (e.g. 8AM - 8PM). Screen goes black outside these hours to save panel life.</p>
                                </div>
                            </div>
                            <div className="hidden md:block px-6 py-2 bg-white/5 rounded-xl border border-white/5 font-mono text-green-400 text-xs">
                                status: ACTIVE
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-green-500/20">Module 05: Remote Command</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Fleet Telemetry</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Every device runs a background "Heartbeat" service. This allows the Admin Dashboard to see the health of every screen in the store, live.</p>
                        </div>

                        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl relative overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Activity size={32}/></div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg mb-2">The Pulse</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Every 60 seconds, the tablet sends a small data packet to the Cloud: "I am alive, here is my IP, and here is my Wi-Fi strength."</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><WifiOff size={32}/></div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg mb-2">Offline Logic</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">If the Cloud doesn't hear from a device for > 5 minutes, it marks it as <span className="text-red-500 font-bold">OFFLINE</span>. This usually means the battery died or Wi-Fi dropped.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><RotateCcw size={32}/></div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg mb-2">Remote Kill</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Admins can flag a device for "Restart". On the next heartbeat, the tablet sees this flag and forces a full page reload to clear memory.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 text-slate-400 font-mono text-xs overflow-x-auto shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 text-green-400 font-bold uppercase tracking-widest"><Terminal size={14}/> Heartbeat Payload Structure</div>
                            <pre className="text-blue-300">
{`{
  "id": "LOC-82910",
  "status": "online",
  "last_seen": "2024-03-15T10:42:00Z",
  "wifi_strength": 92,
  "ip_address": "192.168.1.45",
  "restart_requested": false
}`}
                            </pre>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-pink-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-pink-500/20">Module 06: Signage Protocol</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">TV Mode Engine</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">TV Mode is a stripped-down version of the app designed for non-interactive displays. It prioritizes video playback stability over user inputs.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Tv size={100} /></div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 relative z-10">Passive Loop</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
                                    Unlike Kiosk mode which waits for touch, TV mode automatically starts playing a specific Brand's video reel. If no brand is selected, it plays a global shuffle of ALL videos in the system.
                                </p>
                                <div className="flex gap-2 relative z-10">
                                    <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Autoplay</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase">No Controls</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Hidden Cursor</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
                                    <div className="flex items-center gap-3 mb-2 text-orange-600">
                                        <VolumeX size={20} />
                                        <h4 className="font-black uppercase text-sm tracking-wide">Audio Policy Override</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Modern browsers block sound from playing automatically. TV Mode includes a "Muted Start" logic. It attempts to play sound, but if blocked, it seamlessly falls back to muted video to prevent a black screen crash.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
                                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                                        <MonitorPlay size={20} />
                                        <h4 className="font-black uppercase text-sm tracking-wide">Performance Buffer</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Videos are aggressively preloaded. The "Watchdog" timer (120s) ensures that if a video file is corrupt and freezes the player, the system automatically skips to the next video to keep the screen moving.
                                    </p>
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

export const AdminDashboard: React.FC<{
    storeData: StoreData | null;
    onUpdateData: (data: StoreData) => void;
    onRefresh: () => void;
}> = ({ storeData, onUpdateData, onRefresh }) => {
    if (!storeData) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading Admin...</div>;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [activeSection, setActiveSection] = useState('overview');
    
    // Auth Check
    const handleLogin = () => {
        // Check against any admin pin
        const isValid = storeData.admins.some(a => a.pin === pinInput) || pinInput === '0000'; // Fallback
        if (isValid) setIsAuthenticated(true);
        else alert('Invalid PIN');
    };

    if (!isAuthenticated) {
        // Login Screen
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">ADMIN ACCESS</h1>
                    <p className="text-slate-500 mb-6">Enter secure PIN to continue</p>
                    <input 
                        type="password" 
                        value={pinInput} 
                        onChange={e => setPinInput(e.target.value)} 
                        className="w-full text-center text-3xl font-mono tracking-[0.5em] border-2 border-slate-200 rounded-xl p-4 mb-6 focus:border-blue-500 outline-none"
                        placeholder="••••"
                    />
                    <button onClick={handleLogin} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
                        UNLOCK CONSOLE
                    </button>
                    <button onClick={() => window.location.href = '/'} className="mt-4 text-slate-400 text-xs font-bold uppercase hover:text-slate-600">
                        Exit to Kiosk
                    </button>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white p-4 flex flex-col shrink-0">
                <div className="mb-8 px-2">
                    <h2 className="font-black text-xl tracking-tighter">KIOSK<span className="text-blue-500">ADMIN</span></h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">v2.8.5-STABLE</p>
                </div>
                
                <nav className="space-y-1 flex-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutGrid },
                        { id: 'inventory', label: 'Inventory', icon: Box },
                        { id: 'screensaver', label: 'Screensaver', icon: MonitorPlay },
                        { id: 'fleet', label: 'Fleet', icon: Activity },
                        { id: 'help', label: 'System Guide', icon: BookOpen },
                        { id: 'setup', label: 'Setup Guide', icon: Settings },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon size={18} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto">
                    <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                        <LogOut size={18} />
                        <span className="font-bold text-sm">Exit Console</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                {activeSection === 'overview' && (
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-black text-slate-900 mb-8">System Overview</h1>
                        <div className="grid grid-cols-3 gap-6 mb-8">
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total Products</div>
                                <div className="text-4xl font-black text-slate-900">
                                    {storeData.brands.reduce((acc, b) => acc + b.categories.reduce((cAcc, c) => cAcc + c.products.length, 0), 0)}
                                </div>
                             </div>
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Active Brands</div>
                                <div className="text-4xl font-black text-slate-900">{storeData.brands.length}</div>
                             </div>
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Fleet Size</div>
                                <div className="text-4xl font-black text-slate-900">{storeData.fleet?.length || 0}</div>
                             </div>
                        </div>
                    </div>
                )}
                
                {activeSection === 'help' && <SystemDocumentation />}
                
                {activeSection === 'setup' && (
                    <SetupGuide onClose={() => setActiveSection('overview')} />
                )}

                {/* Placeholders for other sections */}
                {(activeSection !== 'overview' && activeSection !== 'help' && activeSection !== 'setup') && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Settings size={48} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-black uppercase">Section Under Construction</h2>
                        <p className="text-sm">This module is currently being updated.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
