
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, Server, RadioReceiver, Scan, FileCode, Braces, RefreshCcw, Calculator
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
        { id: 'architecture', label: '01. Architecture', icon: <Network size={16} />, desc: 'Offline-First Sync Protocol' },
        { id: 'inventory', label: '02. Inventory', icon: <Box size={16}/>, desc: 'Relational Node Tree' },
        { id: 'pricelists', label: '03. Price Engine', icon: <Table size={16}/>, desc: 'Vector PDF Generation' },
        { id: 'screensaver', label: '04. Visual Loop', icon: <Zap size={16}/>, desc: 'Weighted Playlist Algo' },
        { id: 'fleet', label: '05. Fleet Watch', icon: <Activity size={16}/>, desc: 'Telemetry & Heartbeat' },
        { id: 'tv', label: '06. TV Protocol', icon: <Tv size={16}/>, desc: 'State Machine Loop' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl font-mono animate-fade-in">
            <style>{`
                @keyframes data-flow { 0% { left: 10%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { left: 90%; opacity: 0; } }
                @keyframes pulse-node { 0%, 100% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.4); } 50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } }
                @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes gear-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes scan-line { 0% { top: 0%; } 100% { top: 100%; } }
                
                .tech-grid { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 20px 20px; }
                .flow-packet { position: absolute; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 10px #3b82f6; animation: data-flow 2s infinite linear; }
                .radar-sweep { background: conic-gradient(from 0deg, transparent 0deg, rgba(34, 197, 94, 0.2) 360deg); border-radius: 50%; animation: radar-spin 3s infinite linear; }
            `}</style>

            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-500/10 border border-blue-500/50 rounded">
                            <Terminal size={14} className="text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sys_Manual_v3.0</span>
                    </div>
                    <h2 className="text-slate-100 font-bold text-lg tracking-tight">Engineering <br/><span className="text-slate-500">Blueprint</span></h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 group border border-transparent ${
                                activeSection === section.id 
                                ? 'bg-slate-800 border-slate-700 text-white' 
                                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                            }`}
                        >
                            <div className={`transition-colors ${activeSection === section.id ? 'text-blue-400' : 'text-slate-600'}`}>
                                {section.icon}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider leading-none mb-1">{section.label}</div>
                                <div className="text-[9px] truncate opacity-60 font-medium">{section.desc}</div>
                            </div>
                            {activeSection === section.id && <ChevronRight size={12} className="ml-auto text-blue-500 animate-pulse" />}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Main Content Blueprint Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950 relative tech-grid">
                <div className="p-8 md:p-12 max-w-5xl mx-auto">
                    
                    {/* Header */}
                    <div className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
                                {sections.find(s => s.id === activeSection)?.label.split('. ')[1]}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Module Status: Active
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-[10px] text-slate-600 font-mono">MEM_USAGE: 42MB</div>
                            <div className="text-[10px] text-slate-600 font-mono">LATENCY: 12ms</div>
                        </div>
                    </div>

                    {/* 01. ARCHITECTURE */}
                    {activeSection === 'architecture' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-64 flex items-center justify-center overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-blue-500/5"></div>
                                <div className="flex items-center justify-between w-full max-w-lg relative z-10">
                                    {/* Cloud Node */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-blue-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]" style={{animation: 'pulse-node 3s infinite'}}>
                                            <Database size={32} className="text-blue-400" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Supabase Cloud</div>
                                            <div className="text-[8px] text-slate-500 font-mono mt-1">PostgreSQL + Storage</div>
                                        </div>
                                    </div>

                                    {/* Connection Line */}
                                    <div className="flex-1 h-0.5 bg-slate-800 relative mx-8">
                                        <div className="flow-packet" style={{animationDelay: '0s'}}></div>
                                        <div className="flow-packet" style={{animationDelay: '1s'}}></div>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 uppercase bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                                            JSON Payload
                                        </div>
                                    </div>

                                    {/* Local Node */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                            <Tablet size={32} className="text-green-400" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-green-400 uppercase tracking-widest">Local Replica</div>
                                            <div className="text-[8px] text-slate-500 font-mono mt-1">IndexedDB / LocalStorage</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-blue-500 pl-3">Core Logic</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        The application employs a <strong>"Snapshot-First"</strong> architecture. Upon initialization, the client attempts to fetch the latest `StoreData` JSON blob from the edge. If the network is unavailable, it immediately falls back to the locally cached version in `localStorage` or `IndexedDB`. This ensures the Kiosk interface remains interactive with <strong>zero latency</strong>, regardless of connectivity.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-amber-500 pl-3">Technical Constraints</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Legacy Android WebViews (v5.0 / Chrome 37) have strict memory limits (~50MB heap for JS). We sanitize and truncate large Base64 strings before saving to local storage to prevent <code>QuotaExceededError</code> crashes. Large media assets are referenced via URL, never stored as blobs.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px]">
                                <div className="text-slate-500 mb-2">// Sync Payload Structure</div>
                                <div className="text-purple-400">interface <span className="text-yellow-400">StoreData</span> {'{'}</div>
                                <div className="pl-4 text-blue-300">brands: <span className="text-slate-400">Brand[];</span></div>
                                <div className="pl-4 text-blue-300">fleet: <span className="text-slate-400">KioskRegistry[];</span></div>
                                <div className="pl-4 text-blue-300">screensaverSettings: <span className="text-slate-400">Config;</span></div>
                                <div className="pl-4 text-slate-500">... // 40kb compressed JSON</div>
                                <div className="text-purple-400">{'}'}</div>
                            </div>
                        </div>
                    )}

                    {/* 02. INVENTORY */}
                    {activeSection === 'inventory' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-2xl">
                                    {/* Root */}
                                    <div className="flex flex-col items-center relative">
                                        <div className="w-12 h-12 bg-indigo-900/50 border border-indigo-500 rounded-xl flex items-center justify-center text-indigo-300 mb-2 z-10">
                                            <Database size={20} />
                                        </div>
                                        <div className="text-[9px] font-black uppercase text-indigo-400 tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-indigo-900">Brand Root</div>
                                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-indigo-900"></div>
                                    </div>

                                    {/* Branches */}
                                    <div className="flex justify-between w-full relative">
                                        <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-indigo-900 -translate-y-4"></div>
                                        <div className="absolute top-0 left-1/4 h-4 w-0.5 bg-indigo-900 -translate-y-4"></div>
                                        <div className="absolute top-0 right-1/4 h-4 w-0.5 bg-indigo-900 -translate-y-4"></div>

                                        {/* Branch 1 */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-blue-900/50 border border-blue-500 rounded-lg flex items-center justify-center text-blue-300 mb-2">
                                                <LayoutGrid size={16} />
                                            </div>
                                            <div className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Category A</div>
                                            <div className="h-4 w-0.5 bg-blue-900 my-1"></div>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 bg-slate-800 border border-slate-600 rounded flex items-center justify-center"><Box size={10} className="text-slate-400"/></div>
                                                <div className="w-6 h-6 bg-slate-800 border border-slate-600 rounded flex items-center justify-center"><Box size={10} className="text-slate-400"/></div>
                                            </div>
                                        </div>

                                        {/* Branch 2 */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-purple-900/50 border border-purple-500 rounded-lg flex items-center justify-center text-purple-300 mb-2">
                                                <LayoutGrid size={16} />
                                            </div>
                                            <div className="text-[9px] font-black uppercase text-purple-400 tracking-wider">Category B</div>
                                            <div className="h-4 w-0.5 bg-purple-900 my-1"></div>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 bg-slate-800 border border-slate-600 rounded flex items-center justify-center"><Box size={10} className="text-slate-400"/></div>
                                                <div className="w-6 h-6 bg-slate-800 border border-slate-600 rounded flex items-center justify-center"><Box size={10} className="text-slate-400"/></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-indigo-500 pl-3 mb-4">Hierarchical Logic</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                        Data is strictly enforced in a 3-tier hierarchy: <code>Brand</code> &rarr; <code>Category</code> &rarr; <code>Product</code>. This structure is essential for the Kiosk's "Drill-Down" navigation pattern. Products cannot exist as orphans; they must belong to a category branch.
                                    </p>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                        <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Search Indexing</div>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-slate-800 text-blue-400 rounded text-[9px] border border-slate-700">SKU</span>
                                            <span className="px-2 py-1 bg-slate-800 text-blue-400 rounded text-[9px] border border-slate-700">Name</span>
                                            <span className="px-2 py-1 bg-slate-800 text-blue-400 rounded text-[9px] border border-slate-700">Description</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-purple-500 pl-3 mb-4">Data Model</h3>
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px] overflow-x-auto">
                                        <div className="text-purple-400">interface <span className="text-yellow-400">Product</span> {'{'}</div>
                                        <div className="pl-4 text-blue-300">id: <span className="text-green-400">'p-iphone15'</span>;</div>
                                        <div className="pl-4 text-blue-300">sku: <span className="text-green-400">'APL-15'</span>;</div>
                                        <div className="pl-4 text-blue-300">specs: <span className="text-slate-400">{'{ Chip: "A16", RAM: "6GB" }'}</span>;</div>
                                        <div className="pl-4 text-blue-300">features: <span className="text-slate-400">["5G", "OLED"];</span></div>
                                        <div className="pl-4 text-blue-300">manuals: <span className="text-slate-400">Manual[];</span></div>
                                        <div className="text-purple-400">{'}'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 03. PRICELISTS */}
                    {activeSection === 'pricelists' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-64 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-900" style={{backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2}}></div>
                                
                                <div className="flex items-center gap-8 relative z-10">
                                    {/* Input CSV */}
                                    <div className="flex flex-col items-center gap-2 group">
                                        <div className="w-16 h-20 bg-green-900/20 border border-green-500/50 rounded-lg flex items-center justify-center relative">
                                            <div className="absolute top-0 right-0 w-4 h-4 bg-green-500/20 border-l border-b border-green-500/50 rounded-bl-lg"></div>
                                            <FileSpreadsheet size={32} className="text-green-500" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-green-600 tracking-widest">CSV / XLSX</span>
                                    </div>

                                    {/* Processing Gear */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                                        <Settings size={48} className="text-orange-500" style={{animation: 'gear-spin 4s infinite linear'}} />
                                        <ArrowRight size={24} className="text-slate-600 absolute top-1/2 -left-8 -translate-y-1/2" />
                                        <ArrowRight size={24} className="text-slate-600 absolute top-1/2 -right-8 -translate-y-1/2" />
                                    </div>

                                    {/* Output PDF */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-20 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center justify-center relative shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500/20 border-l border-b border-red-500/50 rounded-bl-lg"></div>
                                            <FileText size={32} className="text-red-500" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-red-600 tracking-widest">Vector PDF</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-red-500 pl-3">Client-Side Rendering</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        To avoid server costs and latency, PDF generation happens entirely in the browser using <code>jspdf</code>. The engine calculates column widths dynamically based on content (SKU length, description density) and enforces a "Psychological Rounding" algorithm (e.g., 99.99 &rarr; 100.00) to maintain a premium look.
                                    </p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <div className="text-[10px] font-black uppercase text-orange-500 mb-3 flex items-center gap-2"><Calculator size={12}/> Rounding Logic</div>
                                    <code className="block font-mono text-[9px] text-blue-300 whitespace-pre">
{`function formatPrice(val) {
  let n = parseFloat(val);
  // Ceiling Logic
  if (n % 1 !== 0) n = Math.ceil(n);
  // Psycho-Pricing Bump
  if (Math.floor(n) % 10 === 9) n += 1;
  return "R " + n.toLocaleString();
}`}
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 04. SCREENSAVER */}
                    {activeSection === 'screensaver' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-48 flex flex-col justify-center shadow-2xl relative overflow-hidden">
                                <div className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Playlist Sequence Buffer</div>
                                <div className="flex gap-2 overflow-hidden relative">
                                    {[
                                        { type: 'AD', col: 'bg-yellow-500', w: 'w-24' },
                                        { type: 'PROD', col: 'bg-blue-600', w: 'w-16' },
                                        { type: 'PROD', col: 'bg-blue-600', w: 'w-16' },
                                        { type: 'CAT', col: 'bg-green-500', w: 'w-20' },
                                        { type: 'AD', col: 'bg-yellow-500', w: 'w-24' },
                                        { type: 'PROD', col: 'bg-blue-600', w: 'w-16' },
                                        { type: 'PROD', col: 'bg-blue-600', w: 'w-16' },
                                        { type: 'CAT', col: 'bg-green-500', w: 'w-20' },
                                    ].map((item, i) => (
                                        <div key={i} className={`${item.w} h-16 rounded-xl ${item.col} flex items-center justify-center shrink-0 border border-white/10 shadow-lg relative overflow-hidden group`}>
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            <span className="text-[10px] font-black text-white mix-blend-overlay">{item.type}</span>
                                        </div>
                                    ))}
                                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 to-transparent"></div>
                                </div>
                                <div className="mt-4 flex gap-6 text-[9px] font-mono text-slate-500 uppercase">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Sponsored Ad (Weighted x2)</div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> Product Highlight</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-yellow-500 pl-3">Weighted Randomness</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        The playlist generator does not use pure random selection. It builds a queue that guarantees:
                                        <br/>1. <strong>Separation:</strong> Two ads never play back-to-back.
                                        <br/>2. <strong>Freshness:</strong> Products added in the last 30 days are prioritized.
                                        <br/>3. <strong>Pacing:</strong> Pamphlet covers are injected every 4th slot to break visual monotony.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-red-500 pl-3">Browser Autoplay Policy</h3>
                                    <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-xl flex gap-3">
                                        <VolumeX className="text-red-500 shrink-0" size={16} />
                                        <p className="text-[10px] text-red-300 leading-tight">
                                            Modern browsers block unmuted video autoplay without user interaction. The system boots in "Muted" mode. A single touch interaction unlocks the <code>AudioContext</code>, allowing subsequent screensaver loops to play sound.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 05. FLEET */}
                    {activeSection === 'fleet' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-64 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                {/* Radar Grid */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 border border-green-500/20 rounded-full"></div>
                                    <div className="w-32 h-32 border border-green-500/30 rounded-full absolute"></div>
                                    <div className="w-16 h-16 border border-green-500/50 rounded-full absolute bg-green-500/10 flex items-center justify-center">
                                        <Server size={24} className="text-green-400" />
                                    </div>
                                </div>
                                
                                {/* Radar Sweep */}
                                <div className="absolute inset-0 radar-sweep opacity-30"></div>

                                {/* Nodes */}
                                <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80] animate-pulse"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80] animate-pulse" style={{animationDelay: '0.5s'}}></div>
                                <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" title="Offline"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-green-500 pl-3 mb-4">Telemetry Protocol</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                        Devices act as "dumb terminals" that report their state every 60 seconds. This <strong>Heartbeat</strong> payload includes WiFi strength, active version, and IP address. If the server timestamp for a device exceeds 5 minutes, it is automatically flagged as <code>OFFLINE</code>.
                                    </p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px]">
                                    <div className="text-slate-500 mb-2">// Heartbeat Payload</div>
                                    <div className="text-purple-400">{`{`}</div>
                                    <div className="pl-4 text-blue-300">"id": <span className="text-green-400">"LOC-8821"</span>,</div>
                                    <div className="pl-4 text-blue-300">"status": <span className="text-green-400">"online"</span>,</div>
                                    <div className="pl-4 text-blue-300">"wifi_strength": <span className="text-yellow-400">92</span>,</div>
                                    <div className="pl-4 text-blue-300">"version": <span className="text-slate-400">"2.4.1"</span></div>
                                    <div className="text-purple-400">{`}`}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 06. TV PROTOCOL */}
                    {activeSection === 'tv' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-56 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                <div className="w-full max-w-lg bg-black rounded-xl border-4 border-slate-700 aspect-video relative overflow-hidden shadow-2xl flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-900/20"></div>
                                    <div className="text-center z-10">
                                        <Tv size={48} className="text-slate-600 mb-2 mx-auto" />
                                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">No Signal</div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 h-1 bg-slate-800 rounded overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/3 animate-pulse"></div>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-[8px] font-black text-red-500 uppercase">Live Loop</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-blue-500 pl-3">State Machine</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        TV Mode strips all interactive UI elements. It operates on a strict state machine:
                                        <br/>1. <strong>Global Loop:</strong> Plays ALL videos from ALL brands in a randomized shuffle.
                                        <br/>2. <strong>Brand Channel:</strong> Locks the player to a specific Brand ID, cycling only relevant content.
                                        <br/>A hardware watchdog resets the player if a video stalls for >10 seconds.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold uppercase text-sm tracking-wider border-l-2 border-slate-500 pl-3">Interaction Lock</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        The UI is overlay-free. Controls only appear on mouse movement or touch, fading out after 4 seconds to ensure a clean "Digital Signage" appearance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<{
    storeData: StoreData;
    onUpdateData: (data: StoreData) => void;
    onRefresh: () => void;
}> = ({ storeData, onUpdateData, onRefresh }) => {
    return (
        <div className="h-screen bg-slate-950 flex flex-col">
             <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-600 rounded-lg"><Settings className="text-white" size={20} /></div>
                     <h1 className="text-white font-bold uppercase tracking-wider">Admin Dashboard</h1>
                </div>
                <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <LogOut size={16} /> Exit
                </button>
             </header>
             <div className="flex-1 overflow-hidden">
                <SystemDocumentation />
             </div>
        </div>
    );
};
