import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, Server, ZapOff, Fingerprint
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

const DocSection = ({ title, subtitle, children }: { title: string, subtitle: string, children?: React.ReactNode }) => (
    <div className="animate-fade-in space-y-8 max-w-5xl mx-auto pb-20">
        <div className="border-b border-slate-200 pb-6 mb-8">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{title}</h2>
            <div className="flex items-center gap-3 text-slate-500">
                <div className="h-0.5 w-8 bg-blue-600 rounded-full"></div>
                <p className="text-lg font-bold uppercase tracking-wide">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

const InfoCard = ({ icon: Icon, title, color = "blue", children }: any) => (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full bg-${color}-500`}></div>
        <div className="flex items-start gap-5">
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 shrink-0`}>
                <Icon size={28} />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">{title}</h3>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">{children}</div>
            </div>
        </div>
    </div>
);

interface AdminDashboardProps {
  storeData: StoreData | null;
  onUpdateData: (data: StoreData) => Promise<void>;
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ storeData, onUpdateData, onRefresh }) => {
    const [activeSection, setActiveSection] = useState('architecture');
    
    if (!storeData) {
        return <div className="flex items-center justify-center h-screen bg-slate-900 text-white"><Loader2 className="animate-spin" /></div>;
    }

    const sections = [
        { id: 'architecture', label: '1. Architecture', icon: <Network size={18} />, desc: 'Cloud & Offline Sync', color: 'blue' },
        { id: 'inventory', label: '2. Inventory Data', icon: <Database size={18}/>, desc: 'Relational Structure', color: 'purple' },
        { id: 'pricelists', label: '3. Pricing Engine', icon: <Table size={18}/>, desc: 'Auto-Rounding & PDF', color: 'green' },
        { id: 'screensaver', label: '4. Visuals & Sleep', icon: <Zap size={18}/>, desc: 'Idle Loop Logic', color: 'orange' },
        { id: 'fleet', label: '5. Fleet Command', icon: <Activity size={18}/>, desc: 'Heartbeats & Status', color: 'red' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-fade-in m-4 md:m-8 h-[95vh]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-80 bg-slate-900 p-6 overflow-y-auto shrink-0 flex flex-col gap-2 border-r border-slate-800">
               <div className="mb-8 pl-2">
                   <div className="flex items-center gap-2 mb-2 text-blue-500">
                       <ShieldCheck size={24} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">System Manual</span>
                   </div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Documentation</h2>
                   <p className="text-slate-500 text-xs font-bold mt-2">Kiosk Firmware v2.5</p>
               </div>
               
               <div className="space-y-2">
                   {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border relative overflow-hidden group ${
                                activeSection === section.id 
                                ? 'bg-slate-800 border-slate-700 shadow-xl' 
                                : 'bg-transparent border-transparent hover:bg-slate-800/50'
                            }`}
                        >
                            {activeSection === section.id && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${section.color}-500`}></div>}
                            <div className={`p-2.5 rounded-xl transition-colors ${activeSection === section.id ? `bg-${section.color}-500/20 text-${section.color}-400` : 'bg-slate-950 text-slate-500 group-hover:text-slate-300'}`}>
                                {section.icon}
                            </div>
                            <div className="text-left">
                                <div className={`text-xs font-black uppercase tracking-wider mb-0.5 ${activeSection === section.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{section.label}</div>
                                <div className="text-[10px] font-mono text-slate-600 uppercase">{section.desc}</div>
                            </div>
                        </button>
                   ))}
               </div>

               <div className="mt-auto p-4 bg-slate-950 rounded-2xl border border-slate-800">
                   <div className="flex items-center gap-3 mb-3">
                       <div className="relative">
                           <Server size={16} className="text-slate-400" />
                           <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       </div>
                       <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">System Status</div>
                   </div>
                   <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Build</span><span className="text-green-400">Stable</span></div>
                       <div className="flex justify-between text-[10px] font-mono text-slate-500"><span>Sync</span><span className="text-blue-400">Auto (30s)</span></div>
                   </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white relative scroll-smooth">
                <div className="p-8 md:p-16">
                    {activeSection === 'architecture' && (
                        <DocSection title="System Architecture" subtitle="Offline-First Synchronization Model">
                            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-500 pointer-events-none"><Cloud size={200} /></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                                    <div className="flex-1 text-center">
                                        <div className="w-24 h-24 bg-slate-800 rounded-3xl border-2 border-slate-700 flex items-center justify-center mx-auto mb-6 shadow-xl relative">
                                            <Database size={40} className="text-blue-400" />
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-slate-900 text-[8px] font-black px-2 py-1 rounded-full uppercase">Master</div>
                                        </div>
                                        <h3 className="text-white font-black uppercase tracking-widest text-sm">Supabase Cloud</h3>
                                        <p className="text-slate-500 text-xs mt-2 font-medium">PostgreSQL Source of Truth</p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-center gap-2 flex-1">
                                        <div className="h-0.5 w-full bg-slate-700 relative">
                                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3 h-3 bg-blue-500 rounded-full animate-[ping_2s_linear_infinite]"></div>
                                            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3 bg-green-500 rounded-full animate-[ping_2s_linear_infinite_1s]"></div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-950 px-3 py-1 rounded-full border border-slate-800">Bi-Directional Sync</span>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="w-24 h-24 bg-slate-800 rounded-3xl border-2 border-slate-700 flex items-center justify-center mx-auto mb-6 shadow-xl relative">
                                            <Tablet size={40} className="text-green-400" />
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Replica</div>
                                        </div>
                                        <h3 className="text-white font-black uppercase tracking-widest text-sm">Device Local DB</h3>
                                        <p className="text-slate-500 text-xs mt-2 font-medium">IndexedDB (Offline Cache)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard icon={Wifi} title="Offline Capability" color="blue">
                                    The Kiosk is designed to work 100% offline. It downloads a full snapshot of the inventory ('Monolith' or 'Relational') upon startup. All customer interactions (browsing, searching) happen locally with <strong>Zero Latency</strong>.
                                </InfoCard>
                                <InfoCard icon={RefreshCw} title="Smart Synchronization" color="green">
                                    The device sends a 'Heartbeat' every 30 seconds. If the Admin Hub has new data, the device detects a version mismatch and silently pulls the latest updates in the background without interrupting the user.
                                </InfoCard>
                                <InfoCard icon={Shield} title="Data Integrity" color="purple">
                                    We use a strict 'Read-Heavy, Write-Light' policy. Kiosks only write telemetry (status logs) to the cloud. They never modify inventory data directly, preventing conflicts between multiple devices.
                                </InfoCard>
                                <InfoCard icon={Fingerprint} title="Device Identity" color="orange">
                                    Each kiosk generates a unique <strong>UUID (e.g. LOC-83729)</strong> stored in the secure hardware enclave (LocalStorage). If you clear browser data, the device must be 'Recovered' using the Admin Panel credentials.
                                </InfoCard>
                            </div>
                        </DocSection>
                    )}

                    {activeSection === 'inventory' && (
                        <DocSection title="Inventory Logic" subtitle="Hierarchical Data Structure">
                            <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-center bg-slate-50 p-12 rounded-3xl border border-slate-200">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white"><Grid size={32} /></div>
                                    <div className="text-center"><div className="font-black uppercase text-sm text-slate-900">Brand</div><div className="text-[10px] font-bold text-slate-400 uppercase">Top Level</div></div>
                                </div>
                                <ArrowRight size={24} className="text-slate-300 rotate-90 md:rotate-0" />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center shadow-sm text-blue-500"><Box size={32} /></div>
                                    <div className="text-center"><div className="font-black uppercase text-sm text-slate-900">Category</div><div className="text-[10px] font-bold text-slate-400 uppercase">Grouping</div></div>
                                </div>
                                <ArrowRight size={24} className="text-slate-300 rotate-90 md:rotate-0" />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-white border-2 border-purple-100 rounded-2xl flex items-center justify-center shadow-sm text-purple-500"><Smartphone size={32} /></div>
                                    <div className="text-center"><div className="font-black uppercase text-sm text-slate-900">Product</div><div className="text-[10px] font-bold text-slate-400 uppercase">SKU Item</div></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-black text-slate-900 uppercase">Core Rules</h3>
                                    <ul className="space-y-4">
                                        {[
                                            "A Product must always belong to a Category.",
                                            "Deleting a Brand will Archive all its Products.",
                                            "SKUs must be unique across the entire system.",
                                            "Images are stored in the 'kiosk-media' cloud bucket."
                                        ].map((rule, i) => (
                                            <li key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                                <span className="text-xs font-bold text-slate-700">{rule}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase mb-4">Archive Protocol</h3>
                                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                        <div className="flex items-center gap-3 mb-4 text-orange-600">
                                            <Archive size={20} />
                                            <span className="font-black uppercase text-xs tracking-wider">Soft Delete System</span>
                                        </div>
                                        <p className="text-xs text-orange-800 leading-relaxed font-medium mb-4">
                                            When you delete an item, it is not removed from the database immediately. Instead, it is moved to the <strong>Archive</strong>. This allows for:
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="bg-white px-3 py-1 rounded-lg border border-orange-200 text-[10px] font-bold text-orange-700 uppercase">Instant Restoration</span>
                                            <span className="bg-white px-3 py-1 rounded-lg border border-orange-200 text-[10px] font-bold text-orange-700 uppercase">Audit Trail</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DocSection>
                    )}

                    {activeSection === 'screensaver' && (
                        <DocSection title="Visuals & Sleep Mode" subtitle="Idle Loop Logic">
                            <div className="mb-12">
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex relative mb-2">
                                    <div className="w-[20%] bg-green-500 h-full"></div>
                                    <div className="w-[60%] bg-blue-500 h-full"></div>
                                    <div className="w-[20%] bg-slate-800 h-full"></div>
                                    
                                    <div className="absolute top-0 bottom-0 w-0.5 bg-black left-[20%]"></div>
                                    <div className="absolute top-0 bottom-0 w-0.5 bg-black left-[80%]"></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <span>Active Use</span>
                                    <span>Screensaver Loop</span>
                                    <span>Sleep Mode</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <InfoCard icon={Clock} title="Idle Timer" color="blue">
                                    The system tracks all touch events. If no interaction is detected for <strong>{storeData.screensaverSettings?.idleTimeout || 60} seconds</strong>, the screensaver engine engages.
                                </InfoCard>
                                <InfoCard icon={Layers} title="Double Buffering" color="purple">
                                    To ensure seamless transitions between images and videos, the screensaver uses two invisible layers. While Layer A is showing, Layer B preloads the next asset. They cross-fade instantly to prevent black flashes.
                                </InfoCard>
                                <InfoCard icon={Moon} title="Sleep Schedule" color="slate">
                                    You can define 'Active Hours' (e.g. 08:00 to 20:00). Outside these hours, the screen turns black to save the backlight and prevent burn-in. Tapping the screen wakes it up immediately.
                                </InfoCard>
                                <InfoCard icon={Volume2} title="Audio Policy" color="green">
                                    Modern browsers block auto-playing audio. The screensaver attempts to play videos muted first. If a user has interacted with the kiosk at least once since boot, audio is unlocked and will play unmuted.
                                </InfoCard>
                            </div>
                        </DocSection>
                    )}

                    {activeSection === 'fleet' && (
                        <DocSection title="Fleet Command" subtitle="Remote Device Management">
                            <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 border border-slate-800 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-500/20 p-3 rounded-2xl text-red-500 border border-red-500/50 animate-pulse"><Activity size={24} /></div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-widest">Heartbeat Signal</h3>
                                            <p className="text-slate-400 text-xs font-mono">Frequency: 30s</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Payload Size</div>
                                        <div className="text-2xl font-mono font-bold text-blue-400">2KB</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">Status</div>
                                        <div className="text-green-400 font-bold text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</div>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">WiFi</div>
                                        <div className="text-white font-bold text-sm">Signal Strength</div>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">Version</div>
                                        <div className="text-purple-400 font-bold text-sm font-mono">v2.5.0</div>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">Commands</div>
                                        <div className="text-orange-400 font-bold text-sm">Listen Mode</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard icon={Power} title="Remote Restart" color="red">
                                    If a device is acting up, you can flag it for 'Restart' in the Fleet tab. On its next heartbeat (within 30s), the device will receive this flag and force a full page reload to clear its memory.
                                </InfoCard>
                                <InfoCard icon={WifiOff} title="Offline Detection" color="slate">
                                    If a device misses 5 consecutive heartbeats (> 2.5 minutes), it is marked as 'Offline'. This usually means the WiFi dropped or the power was cut. It will auto-recover when connection is restored.
                                </InfoCard>
                            </div>
                        </DocSection>
                    )}

                    {activeSection === 'pricelists' && (
                        <DocSection title="Pricing Engine" subtitle="PDF Generation & Logic">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                                <div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="font-black text-slate-900 uppercase text-xs mb-4">Algorithmic Rounding</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="font-mono text-slate-400 line-through">R 199.99</span>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <span className="font-mono font-bold text-green-600">R 200.00</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="font-mono text-slate-400 line-through">R 459.50</span>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <span className="font-mono font-bold text-green-600">R 460.00</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 italic">
                                                The engine automatically ceilings decimals and bumps any price ending in '9' to the next round integer for a premium aesthetic.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <InfoCard icon={FileText} title="PDF Generation" color="red">
                                        The system uses a client-side PDF engine (jspdf). It takes the raw product data, images, and prices, and draws a vector PDF directly in the browser memory. This ensures high-quality prints without needing a server to render the file.
                                    </InfoCard>
                                    <InfoCard icon={Table} title="Manual Mode" color="blue">
                                        For ultimate control, you can switch a pricelist to 'Manual Mode'. This lets you build a table row-by-row, upload custom images for each row, and override the SKU or Description text freely.
                                    </InfoCard>
                                </div>
                            </div>
                        </DocSection>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;