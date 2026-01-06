
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, Film
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
  onUpdateData: (data: StoreData) => Promise<void>;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ storeData, onUpdateData, onRefresh }) => {
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
                            <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-orange-500/20">Module 02: Digital Shelf</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Hierarchy Topology</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The system uses a strict <strong>3-Layer Structure</strong> to keep thousands of products organized. It behaves exactly like folders on a computer.</p>
                        </div>

                        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden p-12 relative min-h-[400px]">
                            <div className="absolute top-0 right-0 p-12 opacity-5"><Layers size={200} /></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 items-start">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-32 h-32 bg-blue-50 rounded-[2rem] flex items-center justify-center border-4 border-blue-100 mb-6 shadow-xl relative group">
                                        <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">Level 1</div>
                                        <Box size={48} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">The Brand</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-3 px-4">The "Master Folder". Example: <strong>Apple, Samsung, LG</strong>. Deleting a Brand deletes everything inside it.</p>
                                </div>

                                <div className="hidden md:flex justify-center pt-12"><ArrowRight size={40} className="text-slate-300" /></div>

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-32 h-32 bg-purple-50 rounded-[2rem] flex items-center justify-center border-4 border-purple-100 mb-6 shadow-xl relative group">
                                        <div className="absolute -top-4 -right-4 bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">Level 2</div>
                                        <LayoutGrid size={48} className="text-purple-600 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">The Category</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-3 px-4">The "Sub-Folder". Example: <strong>Smartphones, Laptops</strong>. This groups similar items together for easy browsing.</p>
                                </div>

                                <div className="hidden md:flex justify-center pt-12"><ArrowRight size={40} className="text-slate-300" /></div>

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-32 h-32 bg-green-50 rounded-[2rem] flex items-center justify-center border-4 border-green-100 mb-6 shadow-xl relative group">
                                        <div className="absolute -top-4 -right-4 bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">Level 3</div>
                                        <Tag size={48} className="text-green-600 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">The Product</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-3 px-4">The "File". Contains <strong>Images, Specs, Videos</strong>. This is what the customer actually clicks on.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                                <h4 className="flex items-center gap-2 text-slate-900 font-black uppercase text-lg mb-4"><Upload size={20}/> Bulk Import Logic</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    When you upload a ZIP file, the system automatically builds this tree for you. It looks at your folders: <code>/Samsung/TVs/OLED-65</code> and instantly creates the Brand (Samsung), Category (TVs), and Product (OLED-65).
                                </p>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
                                <h4 className="flex items-center gap-2 text-white font-black uppercase text-lg mb-4"><Sparkles size={20} className="text-yellow-400"/> AI Cleanup</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Raw data is often messy ("SAM_TV_X90L_BLK"). Our AI layer reads this and renames it to "Samsung X90L Black", keeping the kiosk looking premium without manual typing.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-green-500/20">Module 03: Price Intelligence</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Dynamic Rendering</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">The system doesn't just "show" a pricelist; it <strong>re-builds</strong> it. You can feed it raw Excel data, and it will generate a pixel-perfect, branded PDF on the fly.</p>
                        </div>

                        <div className="relative bg-slate-100 rounded-[3rem] p-12 overflow-hidden shadow-inner border border-slate-200">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                <div className="bg-white p-6 rounded-2xl shadow-lg w-64 -rotate-3 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                                        <FileSpreadsheet className="text-green-600" />
                                        <span className="text-xs font-black uppercase text-slate-400">Excel / CSV Input</span>
                                    </div>
                                    <div className="space-y-2 opacity-50 font-mono text-[10px]">
                                        <div className="bg-slate-100 p-1 rounded">SKU: 104-X</div>
                                        <div className="bg-slate-100 p-1 rounded">Price: 199.999</div>
                                        <div className="bg-slate-100 p-1 rounded">Desc: smrt_phn</div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center">
                                    <div className="bg-slate-900 text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest shadow-xl mb-4 flex items-center gap-2">
                                        <Cpu size={16} className="animate-spin-slow" /> Processing
                                    </div>
                                    <div className="h-1 w-full bg-slate-300 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900 w-1/2 animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-2xl w-64 rotate-3 border-4 border-slate-900 relative">
                                    <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">PDF Output</div>
                                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                                        <FileText className="text-red-500" />
                                        <span className="text-xs font-black uppercase text-slate-900">Kiosk Standard</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-800"><span>104-X</span><span>R 200</span></div>
                                        <div className="text-[10px] text-slate-500 leading-tight">Smart Phone - Black Edition</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-r-[2rem]">
                                <h3 className="text-blue-900 font-black uppercase text-sm tracking-widest mb-2">Algorithm: "The Round Up"</h3>
                                <p className="text-blue-800/80 text-sm leading-relaxed">
                                    The engine automatically fixes "ugly" prices.
                                    <br/><br/>
                                    <code>199.01</code> becomes <strong>200</strong>.<br/>
                                    <code>49.95</code> becomes <strong>50</strong>.<br/>
                                    <code>1299</code> becomes <strong>1300</strong> (if psychological rounding is on).
                                    <br/><br/>
                                    This ensures every price displayed on the kiosk looks intentional and clean.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Two Ways to Upload</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4">
                                        <div className="bg-slate-200 p-2 rounded-lg"><Upload size={20}/></div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm uppercase">Quick PDF Drop</div>
                                            <p className="text-xs text-slate-500 mt-1">Already have a designed PDF? Just drop it in. The Kiosk acts as a simple viewer.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-green-100 p-2 rounded-lg"><Table size={20} className="text-green-700"/></div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm uppercase">Manual Builder</div>
                                            <p className="text-xs text-slate-500 mt-1">Paste data from Excel. The Kiosk builds the table, adds images, and lets you export a printable version.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'screensaver' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-purple-500/20">Module 04: Idle Engine</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">The Visual Loop</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">When no one is touching the tablet, it shouldn't just sit there. It becomes a <strong>Digital Signage Player</strong>, mixing ads and products to attract attention.</p>
                        </div>

                        <div className="bg-black rounded-[3rem] p-4 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 opacity-50"></div>
                            
                            <div className="relative z-10 flex items-center gap-2 overflow-x-hidden p-8">
                                <div className="conveyor-belt flex gap-4">
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className={`w-40 h-24 rounded-xl flex flex-col items-center justify-center shrink-0 border-2 ${i % 2 === 0 ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-slate-700'}`}>
                                            {i % 2 === 0 ? <ImageIcon className="text-white mb-2"/> : <Video className="text-slate-400 mb-2"/>}
                                            <span className="text-[10px] font-black uppercase text-white tracking-widest">{i % 2 === 0 ? 'ADVERT' : 'PRODUCT'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Auto-Playlist Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Clock size={24} className="text-slate-600"/></div>
                                <h3 className="font-bold text-slate-900 text-sm uppercase mb-2">1. The Timer</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">If the screen isn't touched for <strong>60 seconds</strong> (configurable), the loop starts. Touching the screen <strong>instantly</strong> kills the loop.</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4"><LayoutGrid size={24} className="text-purple-600"/></div>
                                <h3 className="font-bold text-slate-900 text-sm uppercase mb-2">2. The Mix</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">It doesn't just play one video. It shuffles: <strong>Custom Ads</strong> you uploaded + <strong>New Products</strong> from your inventory.</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"><Moon size={24} className="text-blue-600"/></div>
                                <h3 className="font-bold text-slate-900 text-sm uppercase mb-2">3. Sleep Mode</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Set active hours (e.g., 8am - 8pm). Outside these times, the screen turns <strong>Black</strong> to save the tablet battery/screen.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'fleet' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-red-500/20">Module 05: Command Center</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Fleet Telemetry</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">You might have 1 tablet or 100. The Fleet module is your "Mission Control", letting you see the health of every device from one screen.</p>
                        </div>

                        <div className="relative p-12 bg-slate-900 rounded-[3rem] shadow-2xl flex items-center justify-center min-h-[350px]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent animate-pulse"></div>
                            
                            <div className="relative z-10 w-full max-w-2xl">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Signal Strength</div>
                                    <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Status: ONLINE</div>
                                </div>
                                <div className="h-40 bg-slate-800 rounded-xl relative overflow-hidden border border-slate-700 flex items-end px-4 pb-0 gap-1">
                                    {[...Array(40)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="flex-1 bg-blue-500/50 rounded-t-sm transition-all duration-300"
                                            style={{ 
                                                height: `${Math.max(10, Math.random() * 80)}%`,
                                                opacity: Math.random() > 0.5 ? 1 : 0.5 
                                            }}
                                        ></div>
                                    ))}
                                    <div className="absolute top-0 left-0 w-full h-px bg-blue-500/50"></div>
                                    <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/20 border-t border-dashed border-blue-500/50"></div>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">ID: KIOSK-01</div>
                                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">IP: 192.168.1.14</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3"><Activity className="text-red-500"/> The Heartbeat</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    Every device sends a tiny signal ("ping") to the cloud every 30 seconds.
                                    <br/><br/>
                                    <ul className="list-disc pl-5 space-y-2 text-sm">
                                        <li><strong>Green Dot:</strong> Ping received < 60s ago.</li>
                                        <li><strong>Red Dot:</strong> No ping for > 5 minutes (Device Offline).</li>
                                        <li><strong>Yellow Dot:</strong> Weak Wi-Fi signal detected.</li>
                                    </ul>
                                </p>
                            </div>
                            <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem]">
                                <h3 className="text-red-900 font-black uppercase text-sm tracking-widest mb-3 flex items-center gap-2"><Power size={16}/> Emergency Protocol</h3>
                                <p className="text-red-800/80 text-sm leading-relaxed">
                                    If a kiosk freezes or glitches, you can hit the <strong>"Remote Reset"</strong> button in the admin panel. 
                                    <br/><br/>
                                    The next time that tablet sends a heartbeat, it will receive the "Kill Command" and automatically reboot its software.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tv' && (
                    <div className="space-y-20 animate-fade-in max-w-5xl">
                        <div className="space-y-4">
                            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-indigo-500/20">Module 06: Large Format</div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">TV Protocol</h2>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">Tablets are for touching. TVs are for watching. This mode changes the entire brain of the app to focus on <strong>Passive Video Playback</strong>.</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-12 bg-slate-100 rounded-[3rem] border border-slate-200">
                            <div className="w-64 aspect-[9/16] bg-white rounded-[2rem] border-8 border-slate-900 shadow-2xl relative flex flex-col items-center justify-center p-4">
                                <div className="absolute top-4 w-12 h-1 bg-slate-200 rounded-full"></div>
                                <MousePointer2 className="text-blue-500 animate-bounce mb-2" size={32} />
                                <span className="text-xs font-black uppercase text-slate-900">Kiosk Mode</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 text-center">Interactive. Buttons. Search.</span>
                            </div>

                            <div className="hidden md:block"><ArrowRight size={32} className="text-slate-300" /></div>

                            <div className="w-96 aspect-video bg-black rounded-[2rem] border-8 border-slate-800 shadow-2xl relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center"></div>
                                <div className="relative z-10 text-center">
                                    <PlayCircle className="text-white mx-auto mb-2" size={48} />
                                    <span className="text-xs font-black uppercase text-white tracking-widest">TV Mode</span>
                                    <span className="text-[9px] font-bold text-white/70 mt-1 block">No Buttons. Just Loop.</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">How It Behaves</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    When you set a device to "TV Mode":
                                    <br/><br/>
                                    1. It hides all search bars, menus, and back buttons.<br/>
                                    2. It ignores "Idle Timers" (it never sleeps).<br/>
                                    3. It plays video loops endlessly.
                                </p>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2rem]">
                                <h3 className="text-indigo-900 font-black uppercase text-sm tracking-widest mb-3 flex items-center gap-2"><Film size={16}/> Brand Channels</h3>
                                <p className="text-indigo-800/80 text-sm leading-relaxed">
                                    You can assign a TV to a specific brand. 
                                    <br/><br/>
                                    <em>Example:</em> A TV above the Samsung shelf can be locked to play <strong>Only Samsung Videos</strong>. Meanwhile, the TV at the entrance can play the <strong>Global Loop</strong> (all brands mixed).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-40"></div>
            </div>
        </div>
    );
};
