import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye,
  Calculator, Film, SkipForward
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

interface AdminDashboardProps {
    storeData: StoreData | null;
    onUpdateData: (data: StoreData) => void;
    onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ storeData, onUpdateData, onRefresh }) => {
    const [activeSection, setActiveSection] = useState('architecture');
    
    const sections = [
        { id: 'architecture', label: '1. Architecture', icon: <Network size={16} />, desc: 'Atomic Sync & Offline First' },
        { id: 'inventory', label: '2. Inventory', icon: <Box size={16}/>, desc: 'Hierarchical Data Flow' },
        { id: 'pricelists', label: '3. Price Engine', icon: <Table size={16}/>, desc: 'Rounding & Hybrid Rendering' },
        { id: 'screensaver', label: '4. Visual Loop', icon: <Zap size={16}/>, desc: 'Idle Detection & Buffering' },
        { id: 'fleet', label: '5. Fleet Watch', icon: <Activity size={16}/>, desc: 'Telemetry & Heartbeats' },
        { id: 'tv', label: '6. TV Protocol', icon: <Tv size={16}/>, desc: 'Playlist Management' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in">
            <style>{`
                @keyframes flow-horizontal { 0% { left: -10%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { left: 110%; opacity: 0; } }
                .data-packet { animation: flow-horizontal 3s linear infinite; }
                
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.0); opacity: 0; } }
                .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
                
                @keyframes scan-line { 0% { top: 0%; } 100% { top: 100%; } }
                .scan-line { animation: scan-line 4s linear infinite; }

                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                .float { animation: float 4s ease-in-out infinite; }
            `}</style>

            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 shrink-0 overflow-y-auto hidden md:flex flex-col">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
                    </div>
                    <h2 className="text-white font-black text-2xl tracking-tighter leading-none">System <span className="text-blue-500">Logic</span></h2>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Deep-dive technical specifications.</p>
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
                
                {/* 1. ARCHITECTURE */}
                {activeSection === 'architecture' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-blue-500/20">Module 01</div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Atomic Synchronization</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                The Kiosk uses a <span className="text-slate-900 font-bold">Snapshot-First</span> architecture. Instead of querying the database on every click, the entire store configuration is pulled once and stored in the device's indexed memory. This ensures <span className="text-blue-600 font-bold">Zero Latency</span> navigation, even if the internet connection drops.
                            </p>
                        </div>
                        
                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center border border-slate-800">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-blue-900/10"></div>
                            
                            <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-12 z-10">
                                {/* Admin Node */}
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-24 h-24 bg-slate-800 border-2 border-blue-500/30 rounded-[2rem] flex items-center justify-center relative transition-all duration-500 group-hover:border-blue-500 group-hover:scale-110 shadow-2xl">
                                        <Monitor className="text-blue-400" size={40} />
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Admin Hub</div>
                                        <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Source of Truth</div>
                                    </div>
                                </div>

                                {/* Tunnel */}
                                <div className="flex-1 w-full h-32 relative flex items-center justify-center">
                                    {/* Wire */}
                                    <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-md"></div>
                                        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent data-packet"></div>
                                    </div>
                                    
                                    {/* Label */}
                                    <div className="absolute top-1/2 -translate-y-1/2 bg-slate-950 border border-slate-700 px-6 py-2 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest shadow-xl flex items-center gap-2">
                                        <Lock size={10} /> TLS/SSL Tunnel
                                    </div>
                                </div>

                                {/* Kiosk Node */}
                                <div className="flex flex-col items-center gap-4 group">
                                    <div className="w-32 h-24 bg-slate-800 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative shadow-2xl transition-all duration-500 group-hover:border-green-500 group-hover:-rotate-1">
                                        <Tablet className="text-green-400" size={40} />
                                        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-green-500/50">LOCAL_DB: READY</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-black text-xs uppercase tracking-widest">Kiosk Device</div>
                                        <div className="text-slate-500 text-[9px] font-bold uppercase mt-1">Local Storage Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. INVENTORY */}
                {activeSection === 'inventory' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-purple-500/20">Module 02</div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">The Data Pipeline</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                Products are organized in a strict three-tier hierarchy: <span className="text-slate-900 font-bold">Brand &rarr; Category &rarr; Product</span>. 
                                Each product inherits theme colors and assets from its parent Brand.
                            </p>
                        </div>

                        <div className="relative bg-slate-900 rounded-[3rem] p-10 overflow-hidden shadow-2xl border border-slate-800">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                                    <div className="w-full bg-slate-800 rounded-2xl border border-purple-500/30 p-6 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                        <div className="flex items-center justify-between mb-4">
                                            <Database size={24} className="text-purple-400" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Tier 1</span>
                                        </div>
                                        <h3 className="text-white font-black text-xl uppercase">Brand</h3>
                                        <p className="text-xs text-slate-400 mt-2">Root container. Holds Logo & Theme.</p>
                                    </div>
                                    <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" size={24} />
                                </div>

                                {/* Step 2 */}
                                <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                                    <div className="w-full bg-slate-800 rounded-2xl border border-blue-500/30 p-6 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        <div className="flex items-center justify-between mb-4">
                                            <FolderOpen size={24} className="text-blue-400" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Tier 2</span>
                                        </div>
                                        <h3 className="text-white font-black text-xl uppercase">Category</h3>
                                        <p className="text-xs text-slate-400 mt-2">Logical grouping (e.g. "Smartphones").</p>
                                    </div>
                                    <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" size={24} />
                                </div>

                                {/* Step 3 */}
                                <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                                    <div className="w-full bg-slate-800 rounded-2xl border border-green-500/30 p-6 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <div className="flex items-center justify-between mb-4">
                                            <Package size={24} className="text-green-400" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Tier 3</span>
                                        </div>
                                        <h3 className="text-white font-black text-xl uppercase">Product</h3>
                                        <p className="text-xs text-slate-400 mt-2">Leaf node. Contains Specs, Images, Videos.</p>
                                        
                                        {/* Floating Elements */}
                                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. PRICELISTS */}
                {activeSection === 'pricelists' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-red-500/20">Module 03</div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Hybrid Render Engine</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                The system supports two modes: <span className="text-slate-900 font-bold">Static PDF</span> (for printed brochure scans) and <span className="text-slate-900 font-bold">Dynamic Tables</span> (searchable, filterable HTML). Dynamic tables use an algorithmic pricing engine to maintain a premium visual standard.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 text-white"><Calculator size={100} /></div>
                                <h3 className="text-white font-black uppercase text-xl mb-6 flex items-center gap-3"><Sparkles className="text-yellow-400"/> Psycho-Pricing Algo</h3>
                                
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                                        <div className="text-slate-500 font-mono text-lg line-through decoration-red-500/50">199.99</div>
                                        <ArrowRight className="text-slate-600" size={16} />
                                        <div className="text-green-400 font-mono font-black text-2xl">200.00</div>
                                        <div className="ml-auto text-[9px] font-black text-slate-500 uppercase bg-slate-900 px-2 py-1 rounded">Ceiling Rule</div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                                        <div className="text-slate-500 font-mono text-lg line-through decoration-red-500/50">499.00</div>
                                        <ArrowRight className="text-slate-600" size={16} />
                                        <div className="text-green-400 font-mono font-black text-2xl">500.00</div>
                                        <div className="ml-auto text-[9px] font-black text-slate-500 uppercase bg-slate-900 px-2 py-1 rounded">Bump Rule</div>
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 font-medium leading-relaxed">
                                        <strong className="text-white uppercase text-[9px] tracking-widest block mb-1">Why?</strong>
                                        Premium brands avoid decimal pricing ("99 cents"). The algorithm automatically cleans raw data inputs to ensure all displayed prices look intentional and luxury.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute inset-0 bg-slate-50 opacity-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                <div className="relative z-10 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-500 rounded-2xl mb-4 shadow-sm">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="text-slate-900 font-black uppercase text-xl mb-2">Dynamic PDF Export</h3>
                                    <p className="text-slate-500 text-sm font-medium mb-6">
                                        The Kiosk can generate high-res PDFs on-the-fly from manual table data.
                                    </p>
                                    <div className="flex justify-center gap-2">
                                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">SKU Codes</div>
                                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">Images</div>
                                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">Branding</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. SCREENSAVER */}
                {activeSection === 'screensaver' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-yellow-500/20">Module 04</div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">The Idle Loop</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                To prevent screen burn-in and attract customers, the system enters a visual loop when no touch events are detected. This uses a <span className="text-slate-900 font-bold">Double-Buffer</span> rendering strategy.
                            </p>
                        </div>

                        <div className="relative bg-slate-900 rounded-[3rem] p-10 border border-slate-800 overflow-hidden shadow-2xl">
                            {/* Timeline Visual */}
                            <div className="relative h-32 flex items-center w-full">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 rounded-full"></div>
                                
                                {/* Node 1: Activity */}
                                <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                                    <div className="w-4 h-4 bg-slate-700 rounded-full border-4 border-slate-900 z-10"></div>
                                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                                        <MousePointer size={20} className="text-blue-400 mb-1" />
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">User Active</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="absolute left-[10%] right-[50%] top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full">
                                    <div className="absolute right-0 -top-1 w-2 h-3 bg-white blur-md animate-pulse"></div>
                                </div>

                                {/* Node 2: Idle Trigger */}
                                <div className="absolute left-[50%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                                    <div className="w-6 h-6 bg-yellow-500 rounded-full border-4 border-slate-900 z-10 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                                    <div className="bg-yellow-900/30 p-3 rounded-xl border border-yellow-500/30 flex flex-col items-center backdrop-blur-sm -translate-y-24">
                                        <Clock size={20} className="text-yellow-400 mb-1" />
                                        <span className="text-[9px] font-black text-yellow-100 uppercase tracking-widest">60s Timeout</span>
                                        <div className="w-0.5 h-8 bg-yellow-500/30 absolute -bottom-8"></div>
                                    </div>
                                </div>

                                {/* Node 3: Loop */}
                                <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                                    <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-slate-900 z-10"></div>
                                    <div className="bg-purple-900/30 p-3 rounded-xl border border-purple-500/30 flex flex-col items-center">
                                        <Zap size={20} className="text-purple-400 mb-1" />
                                        <span className="text-[9px] font-black text-purple-100 uppercase tracking-widest">Loop Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Slot A (Visible)</div>
                                    <div className="aspect-video bg-slate-800 rounded-lg relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-black">IMAGE 1</div>
                                    </div>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 opacity-50">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Slot B (Buffering)</div>
                                    <div className="aspect-video bg-slate-800 rounded-lg relative overflow-hidden border border-dashed border-slate-600">
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-black">LOADING...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. FLEET */}
                {activeSection === 'fleet' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-green-500/20">Module 05</div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Telemetry Heartbeat</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                Every 30 seconds, each active device sends a "Heartbeat" packet to the Cloud. This payload contains system vitals (WiFi strength, Version) and checks for pending commands (like <span className="font-mono text-slate-900 bg-slate-200 px-1 rounded">REBOOT</span>).
                            </p>
                        </div>

                        <div className="relative h-[500px] bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                            {/* Grid BG */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                            
                            {/* Central Cloud */}
                            <div className="relative z-20 w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)]">
                                <Cloud size={48} className="text-white" />
                                <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-20 pulse-ring"></div>
                            </div>

                            {/* Satellite: Kiosk */}
                            <div className="absolute top-20 left-20 flex flex-col items-center gap-2 float">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-lg relative">
                                    <Tablet className="text-green-400" size={24} />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">Unit 01</div>
                            </div>

                            {/* Satellite: TV */}
                            <div className="absolute bottom-20 right-32 flex flex-col items-center gap-2 float" style={{ animationDelay: '1s' }}>
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl border-2 border-purple-500 flex items-center justify-center shadow-lg relative">
                                    <Tv className="text-purple-400" size={24} />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">Wall Display</div>
                            </div>

                            {/* Satellite: Mobile */}
                            <div className="absolute bottom-32 left-32 flex flex-col items-center gap-2 float" style={{ animationDelay: '2s' }}>
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl border-2 border-orange-500 flex items-center justify-center shadow-lg relative">
                                    <Smartphone className="text-orange-400" size={24} />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-ping"></div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">Handheld</div>
                            </div>

                            {/* Packet Lines (CSS Only) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                                <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                                <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* 6. TV MODE */}
                {activeSection === 'tv' && (
                    <div className="space-y-16 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-indigo-500/20">Module 06</div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">The Playlist Engine</h2>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                TV Mode transforms the application into a digital signage player. It supports <span className="text-slate-900 font-bold">Global Loops</span> (shuffled content across all brands) or focused <span className="text-slate-900 font-bold">Brand Channels</span>.
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>

                            {/* Visual Playlist */}
                            <div className="mt-12 flex items-center gap-4 overflow-hidden relative">
                                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
                                
                                {/* Items */}
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`flex-shrink-0 w-48 aspect-video rounded-xl border-2 transition-all duration-500 transform relative overflow-hidden ${i === 2 ? 'scale-110 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10' : 'border-slate-700 opacity-50 scale-90 grayscale'}`}>
                                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                            <Film size={24} className="text-slate-600" />
                                        </div>
                                        {i === 2 && (
                                            <div className="absolute bottom-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md">
                                            CLIP 0{i}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <div className="bg-slate-800/50 rounded-full px-6 py-2 border border-slate-700 backdrop-blur-sm flex items-center gap-4">
                                    <SkipForward size={16} className="text-slate-500 rotate-180" />
                                    <PlayCircle size={32} className="text-blue-500 fill-current" />
                                    <SkipForward size={16} className="text-slate-500" />
                                </div>
                            </div>
                            
                            <div className="mt-8 p-4 bg-orange-900/20 border border-orange-500/20 rounded-xl max-w-md mx-auto text-center">
                                <div className="text-orange-400 text-[10px] font-black uppercase mb-1 flex items-center justify-center gap-2"><VolumeX size={12}/> Autoplay Policy</div>
                                <p className="text-[10px] text-orange-200/70 leading-relaxed">
                                    Browsers block audio autoplay. The engine starts active videos <span className="text-white font-bold">MUTED</span>. Users must tap once to unlock the audio context.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
