
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, FileSpreadsheet, ArrowRight, FileDown, Layers3, CheckCircle, Hammer
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// --- SYSTEM DOCUMENTATION COMPONENT ---
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');
    const [roundDemoValue, setRoundDemoValue] = useState(799);

    useEffect(() => {
        if (activeSection === 'pricelists') {
            const interval = setInterval(() => {
                setRoundDemoValue(prev => prev === 799 ? 4449 : prev === 4449 ? 122 : 799);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [activeSection]);

    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'pricelists', label: 'Pricelist Engine', icon: <Table size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash {
                  to { stroke-dashoffset: -20; }
                }
                .animate-dash {
                  animation: dash 1s linear infinite;
                }
                @keyframes flow {
                    0% { transform: translateX(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100px); opacity: 0; }
                }
                .packet {
                    animation: flow 2s infinite ease-in-out;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .radar-ring {
                    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }
                @keyframes scroll-film {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .film-strip {
                    animation: scroll-film 10s linear infinite;
                }
                @keyframes slide-right {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .data-scan {
                    animation: slide-right 2.5s infinite linear;
                }
                @keyframes subtle-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-float-small { animation: subtle-bounce 3s ease-in-out infinite; }
            `}</style>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
                <div className="mb-6 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Manual</h3>
                    <p className="text-[10px] text-slate-500 font-medium">v2.5 Technical Reference</p>
                </div>
                <div className="space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'
                            }`}
                        >
                            <span className={activeSection === section.id ? 'opacity-100' : 'opacity-70'}>
                                {section.icon}
                            </span>
                            <span className="text-xs uppercase tracking-wide">{section.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Mobile Sidebar (Horizontal) */}
            <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0">
                 {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-none px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                activeSection === section.id 
                                ? 'bg-blue-600 text-white shadow-md font-bold' 
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                        >
                            {section.icon}
                            <span className="text-xs uppercase tracking-wide whitespace-nowrap">{section.label}</span>
                        </button>
                    ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white scroll-smooth">
                {activeSection === 'architecture' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Network className="text-blue-600" size={32} /> Hybrid Cloud Architecture
                            </h2>
                            <p className="text-slate-500 font-medium">Local-First performance with Cloud synchronization.</p>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8">
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <HardDrive size={40} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div>
                                        <div className="text-blue-400 text-[10px] font-mono">IndexedDB / Cache</div>
                                    </div>
                                </div>
                                <div className="flex-1 h-24 relative mx-4 flex items-center">
                                    <svg className="w-full h-12 overflow-visible">
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
                                        <circle r="4" fill="#60a5fa" className="packet" style={{ animationDelay: '0s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M0,6 L300,6" />
                                        </circle>
                                        <circle r="4" fill="#4ade80" className="packet" style={{ animationDelay: '1s' }}>
                                            <animateMotion dur="2s" repeatCount="indefinite" path="M300,6 L0,6" />
                                        </circle>
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-slate-400">
                                        Sync (60s)
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                                        <Database size={40} className="text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Supabase Cloud</div>
                                        <div className="text-green-400 text-[10px] font-mono">PostgreSQL DB</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><HardDrive size={18} className="text-blue-600"/> The "Local-First" Strategy</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    To ensure instant performance in retail environments with unstable WiFi, the kiosk <strong>never</strong> loads data directly from the cloud during customer interaction.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><RefreshCw size={18} className="text-green-600"/> Synchronization Logic</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    The system maintains a background connection to Supabase to keep data fresh without interrupting the user.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'pricelists' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Table className="text-green-600" size={32} /> Pricelist Intelligence Engine
                            </h2>
                            <p className="text-slate-500 font-medium">Automated Ingestion, Normalization, and Multi-Channel Distribution.</p>
                        </div>

                        {/* High-Fidelity Visualization */}
                        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                             
                             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 py-8">
                                {/* Step 1: Input */}
                                <div className="flex flex-col items-center gap-3 group">
                                    <div className="w-24 h-24 bg-white/5 rounded-2xl border-2 border-green-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                        <div className="absolute inset-0 bg-green-500/10 data-scan"></div>
                                        <FileSpreadsheet size={32} className="text-green-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">XLSX Import</span>
                                </div>

                                {/* Flow 1 */}
                                <div className="hidden md:block flex-1 h-1 bg-white/10 relative mx-4 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500 data-packet"></div>
                                </div>

                                {/* Step 2: Logic */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] relative animate-float-small">
                                        <div className="absolute inset-0 animate-ring border-2 border-blue-400 rounded-full"></div>
                                        <RefreshCw size={32} className="text-white animate-spin-slow" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Normalization</span>
                                </div>

                                {/* Flow 2 */}
                                <div className="hidden md:block flex-1 h-1 bg-white/10 relative mx-4 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-purple-500 data-packet" style={{animationDelay: '1s'}}></div>
                                </div>

                                {/* Step 3: Distribution */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 bg-white/5 rounded-2xl border-2 border-purple-500/30 flex items-center justify-center">
                                        <div className="grid grid-cols-2 gap-1 scale-75">
                                            <Smartphone size={20} className="text-purple-400" />
                                            <FileText size={20} className="text-red-400" />
                                            <Tv size={20} className="text-blue-400" />
                                            <FileDown size={20} className="text-green-400" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Multi-Channel</span>
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Sparkles size={18} className="text-orange-500"/> Normalization Pipeline</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    To ensure professional retail pricing, all imported numbers are sanitized through a mathematical rounding engine.
                                </p>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 font-bold uppercase">Algorithm:</span>
                                        <span className="font-mono text-blue-600 bg-white px-2 py-0.5 rounded border">Math.ceil(p / 10) * 10</span>
                                    </div>
                                    <div className="h-0.5 bg-slate-100 w-full"></div>
                                    <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl">
                                        <div className="text-[10px] font-mono text-slate-500">R {roundDemoValue}</div>
                                        <ArrowRight size={12} className="text-slate-600" />
                                        <div className="text-xs font-mono text-green-400 font-black animate-pulse">R {Math.ceil(roundDemoValue/10)*10}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Layers3 size={18} className="text-purple-600"/> Distribution Layers</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Once normalized, pricelists are deployed via three parallel channels for maximum store coverage:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                                        <span><strong>Fleet Sync:</strong> Immediate push to all tablets via Postgres CDC.</span>
                                    </li>
                                    <li className="flex gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-5 h-5 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                                        <span><strong>Vector PDF:</strong> A4 generation for high-DPI in-store printing.</span>
                                    </li>
                                    <li className="flex gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                                        <span><strong>XLSX Export:</strong> Normalized data export for ERP/Inventory systems.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Box className="text-orange-600" size={32} /> Data Hierarchy
                            </h2>
                            <p className="text-slate-500 font-medium">Strict 3-Level Parent-Child Relationship Model.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8 animate-fade-in">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div>
                            </div>
                            <div className="absolute top-24 bottom-20 w-0.5 bg-slate-300"></div>
                            <div className="relative z-10 flex gap-4 mb-8">
                                <div className="w-40 bg-white shadow-md rounded-xl border-l-4 border-purple-500 p-3 animate-fade-in" style={{animationDelay: '0.1s'}}>
                                    <div className="text-[9px] font-black uppercase text-slate-400">Level 2</div>
                                    <div className="font-bold text-sm text-slate-900">Category</div>
                                </div>
                            </div>
                            <div className="relative z-10 flex gap-2">
                                <div className="w-28 bg-white shadow-sm rounded-lg border border-slate-200 p-2 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                                    <Box size={16} className="mx-auto text-orange-500 mb-1"/>
                                    <div className="text-[10px] font-bold">Product</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export const AdminDashboard: React.FC<{
  storeData: StoreData;
  onUpdateData: (newData: StoreData) => Promise<void>;
  onRefresh: () => void;
}> = ({ storeData, onUpdateData, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Simple logout
  const handleLogout = () => {
    window.location.href = '/';
  };

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: <Box size={18} /> },
    { id: 'pricelists', label: 'Pricelists', icon: <Table size={18} /> },
    { id: 'marketing', label: 'Ads & Catalogues', icon: <Megaphone size={18} /> },
    { id: 'tv', label: 'TV Mode', icon: <Tv size={18} /> },
    { id: 'screensaver', label: 'Screensaver', icon: <Zap size={18} /> },
    { id: 'fleet', label: 'Fleet', icon: <Activity size={18} /> },
    { id: 'docs', label: 'Docs', icon: <Info size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight">Admin Hub</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kiosk Pro System v2.8</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => setShowSetupGuide(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
          >
            <HelpCircle size={18} />
            Setup Guide
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-600/20 transition-all text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              title="Refresh Cloud Data"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
              onClick={() => onUpdateData(storeData)}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'docs' ? (
            <SystemDocumentation />
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Hammer size={48} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">Module Under Construction</h3>
                <p className="text-slate-500 max-w-sm font-medium">This administration panel is currently being upgraded to the v2.8 protocol.</p>
            </div>
          )}
        </div>
      </main>

      {showSetupGuide && <SetupGuide onClose={() => setShowSetupGuide(false)} />}
    </div>
  );
};
