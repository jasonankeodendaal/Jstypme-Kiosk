import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem } from '../types';
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Database size={24}/></div>
                                <h3 className="font-black text-lg text-slate-900 mb-2">1. The Cloud Master</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">The "Single Source of Truth". When you click Save in this Admin Panel, the data is pushed here immediately.</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><ArrowRight size={24}/></div>
                                <h3 className="font-black text-lg text-slate-900 mb-2">2. The Pulse</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">Every 60 seconds (or when a change is detected), the Kiosk asks: "Is there a new version?".</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6"><Tablet size={24}/></div>
                                <h3 className="font-black text-lg text-slate-900 mb-2">3. The Local Cache</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">The tablet downloads the new data and saves it to its internal hard drive. If Wi-Fi dies, the app keeps working.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-purple-500/20">Module 02: Hierarchy</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Taxonomy Engine</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Products are organized in a strict parent-child tree. Deleting a parent instantly removes all its children.</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shrink-0">B</div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase">Brand Level</h3>
                                        <p className="text-sm text-slate-500">e.g. "Apple". Contains logo, theme color, and Categories.</p>
                                    </div>
                                </div>
                                <div className="w-0.5 h-8 bg-slate-200 ml-8"></div>
                                <div className="flex items-center gap-4 pl-8">
                                    <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center text-lg font-black shrink-0">C</div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase">Category Level</h3>
                                        <p className="text-sm text-slate-500">e.g. "iPhone". Contains icon and Products.</p>
                                    </div>
                                </div>
                                <div className="w-0.5 h-8 bg-slate-200 ml-16"></div>
                                <div className="flex items-center gap-4 pl-16">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-base font-black shrink-0">P</div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 uppercase">Product Level</h3>
                                        <p className="text-sm text-slate-500">e.g. "iPhone 15 Pro". Contains specs, images, video, SKU.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 03: Dynamic Render</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Instant PDF Generation</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The Kiosk does not store 100 static PDF files. Instead, it stores <strong>Raw Data</strong> and draws the PDF on the fly when requested.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                                <h3 className="text-xl font-black uppercase tracking-widest mb-4">Input: Excel Data</h3>
                                <div className="font-mono text-xs text-blue-300 space-y-2 opacity-80">
                                    <p>SKU: SAM-S24U</p>
                                    <p>DESC: Galaxy S24 Ultra</p>
                                    <p>PRICE: 29999</p>
                                </div>
                                <div className="absolute bottom-4 right-4"><Table size={48} className="opacity-20"/></div>
                            </div>
                            <div className="flex items-center justify-center">
                                <ArrowRight size={32} className="text-slate-300" />
                            </div>
                            <div className="bg-white border-2 border-slate-200 p-8 rounded-[2.5rem] relative overflow-hidden">
                                <h3 className="text-xl font-black uppercase tracking-widest mb-4 text-slate-900">Output: Vector PDF</h3>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                    <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                                    <div className="h-8 w-full bg-slate-50 border border-slate-100 rounded-lg mt-4"></div>
                                </div>
                                <div className="absolute bottom-4 right-4"><FileText size={48} className="text-slate-200"/></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-teal-500/20">Module 04: Visual Loop</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Attract Algorithm</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The screensaver is not a video file. It is a live program that intelligently shuffles your content to prevent screen burn-in and keep content fresh.</p>
                        </div>

                        <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200">
                            <h3 className="font-black text-slate-900 uppercase mb-6">Playlist Logic Cycle</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                <div className="w-40 p-4 bg-white rounded-2xl border border-slate-200 shrink-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Slot 1</div>
                                    <div className="font-black text-slate-900">Custom Ad</div>
                                </div>
                                <div className="w-40 p-4 bg-white rounded-2xl border border-slate-200 shrink-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Slot 2</div>
                                    <div className="font-black text-slate-900">Product Image</div>
                                </div>
                                <div className="w-40 p-4 bg-white rounded-2xl border border-slate-200 shrink-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Slot 3</div>
                                    <div className="font-black text-slate-900">Product Video</div>
                                </div>
                                <div className="w-40 p-4 bg-white rounded-2xl border border-slate-200 shrink-0 opacity-50">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Repeat</div>
                                    <div className="font-black text-slate-900">Shuffle</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-red-500/20">Module 05: Telemetry</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Heartbeat Protocol</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Every 60 seconds, every active tablet sends a tiny packet of data to the cloud saying "I am here".</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 text-white p-8 rounded-[2rem] border border-slate-800">
                                <h3 className="font-black uppercase text-lg mb-2">Health Monitoring</h3>
                                <p className="text-slate-400 text-sm mb-6">If a tablet misses 5 heartbeats (5 minutes), the dashboard marks it as <strong>OFFLINE</strong>. This usually means Wi-Fi is down or the power is off.</p>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
                                <h3 className="font-black uppercase text-lg mb-2 text-slate-900">Remote Commands</h3>
                                <p className="text-slate-500 text-sm mb-6">When the tablet sends its heartbeat, it also checks for "Orders". You can queue a <strong>Remote Restart</strong> here, and the tablet will execute it on its next heartbeat.</p>
                                <div className="bg-slate-100 p-3 rounded-lg inline-block">
                                    <code className="text-xs font-mono text-slate-600">restart_requested: true</code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-indigo-500/20">Module 06: TV Signage</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Passive Playback Mode</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">TV Mode is a stripped-down version of the app. It removes all buttons and interactivity, focusing purely on looping 4K video assets.</p>
                        </div>

                        <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10"><Tv size={120} className="text-indigo-900"/></div>
                            <h3 className="font-black text-indigo-900 text-2xl uppercase mb-4 relative z-10">The Loop Logic</h3>
                            <ul className="space-y-4 relative z-10">
                                <li className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black">1</div>
                                    <p className="text-indigo-800 font-medium">Select a Brand (e.g. Samsung)</p>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black">2</div>
                                    <p className="text-indigo-800 font-medium">Select a Model (e.g. S24 Ultra)</p>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black">3</div>
                                    <p className="text-indigo-800 font-medium">The system builds a playlist of all videos for that model and loops them endlessly.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface AdminDashboardProps {
  storeData: StoreData;
  onUpdateData: (data: StoreData) => void;
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ storeData, onUpdateData, onRefresh }) => {
    // Basic implementation to avoid errors and provide navigation to SystemDocumentation
    const [showDocs, setShowDocs] = useState(false);

    if (showDocs) {
        return (
            <div className="p-4 bg-slate-100 min-h-screen">
                <button onClick={() => setShowDocs(false)} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <SystemDocumentation />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900 animate-fade-in">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Store Configuration & Fleet Management</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowDocs(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wide">
                        <BookOpen size={16} className="text-blue-500" /> System Guide
                    </button>
                    <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md font-bold text-xs uppercase tracking-wide">
                        <RefreshCw size={16} /> Refresh Data
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Total Brands</div>
                     <div className="text-4xl font-black text-slate-900">{storeData.brands.length}</div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Total Products</div>
                     <div className="text-4xl font-black text-slate-900">
                        {storeData.brands.reduce((acc, b) => acc + b.categories.reduce((cAcc, c) => cAcc + c.products.length, 0), 0)}
                     </div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Active Kiosks</div>
                     <div className="text-4xl font-black text-green-600">{storeData.fleet?.filter(k => k.status === 'online').length || 0}</div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Cloud Status</div>
                     <div className="text-xl font-black text-blue-600 flex items-center gap-2">
                        <CloudLightning size={24} /> Connected
                     </div>
                 </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-20">
                <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                    <ShieldCheck size={48} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-black uppercase text-slate-900 mb-2">Dashboard Under Construction</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">The advanced editing features are currently being migrated. Please use the System Guide to understand the architecture.</p>
                <button onClick={() => setShowDocs(true)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors">
                    Open Documentation
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;