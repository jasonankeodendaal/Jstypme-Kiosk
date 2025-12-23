
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles, FileSpreadsheet, ArrowRight, Regex, ShieldAlert, Binary
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Custom R Icon for Pricelists
const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

// --- SYSTEM DOCUMENTATION COMPONENT ---
const SystemDocumentation = () => {
    const [activeSection, setActiveSection] = useState('architecture');

    const sections = [
        { id: 'architecture', label: 'Core Architecture', icon: <Network size={16} /> },
        { id: 'inventory', label: 'Inventory Logic', icon: <Box size={16}/> },
        { id: 'pricelists', label: 'Pricelist Engine', icon: <Table size={16}/> },
        { id: 'screensaver', label: 'Screensaver Automation', icon: <Zap size={16}/> },
        { id: 'fleet', label: 'Fleet & Telemetry', icon: <Activity size={16}/> },
        { id: 'tv', label: 'TV Mode Logic', icon: <Tv size={16}/> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
            <style>{`
                @keyframes dash { to { stroke-dashoffset: -20; } }
                .animate-dash { animation: dash 1s linear infinite; }
                @keyframes flow { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(100px); opacity: 0; } }
                .packet { animation: flow 2s infinite ease-in-out; }
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
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white">
                {activeSection === 'architecture' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <Network className="text-blue-600" size={32} /> Hybrid Cloud Architecture
                            </h2>
                            <p className="text-slate-500 font-medium">Local-First performance with Cloud synchronization.</p>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 flex items-center justify-between px-4 md:px-12 py-8">
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <HardDrive size={40} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Local Device</div>
                                        <div className="text-blue-400 text-[10px] font-mono">localStorage</div>
                                    </div>
                                </div>
                                <div className="flex-1 h-24 relative mx-4 flex items-center">
                                    <svg className="w-full h-12 overflow-visible">
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-center gap-4 z-20">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl border-2 border-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                                        <Database size={40} className="text-green-400" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-bold uppercase tracking-widest text-sm">Supabase Cloud</div>
                                    </div>
                                </div>
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
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-blue-600 p-4 mb-8">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 1 (Parent)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><FolderOpen size={20} className="text-blue-600"/> Brand</div>
                            </div>
                            <div className="w-1 h-8 bg-slate-200"></div>
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-orange-500 p-4 mb-8">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 2 (Child)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><Folder size={20} className="text-orange-500"/> Category</div>
                            </div>
                            <div className="w-1 h-8 bg-slate-200"></div>
                            <div className="relative z-10 w-64 bg-white shadow-lg rounded-xl border-l-4 border-green-500 p-4">
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Level 3 (Grandchild)</div>
                                <div className="font-black text-xl text-slate-900 flex items-center gap-2"><Package size={20} className="text-green-500"/> Product</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { 
  storeData: StoreData, 
  onUpdateData: (newData: StoreData) => void,
  onRefresh: () => void 
}) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [isSaving, setIsSaving] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateData(storeData);
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: 'fleet', label: 'Fleet Control', icon: <MonitorSmartphone size={18} />, color: 'bg-blue-600' },
    { id: 'inventory', label: 'Inventory', icon: <Package size={18} />, color: 'bg-orange-600' },
    { id: 'pricelists', label: 'Pricelists', icon: <RIcon size={18} />, color: 'bg-green-600' },
    { id: 'marketing', label: 'Marketing', icon: <Megaphone size={18} />, color: 'bg-red-600' },
    { id: 'tv', label: 'TV Mode', icon: <Tv size={18} />, color: 'bg-purple-600' },
    { id: 'screensaver', label: 'Screensaver', icon: <Sparkles size={18} />, color: 'bg-cyan-600' },
    { id: 'docs', label: 'System Guide', icon: <BookOpen size={18} />, color: 'bg-slate-700' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, color: 'bg-slate-400' },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 flex flex-col shrink-0 text-white z-20">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-widest">Admin Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Control Panel v2.8</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === item.id ? item.color : 'bg-slate-800'}`}>
                {item.icon}
              </div>
              <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t border-white/5">
          <button 
            onClick={() => setShowSetupGuide(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest"
          >
            <ShieldCheck size={18} /> Setup Guide
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut size={18} /> Exit Admin
          </button>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-black text-slate-900 uppercase tracking-tight text-lg">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'docs' ? (
            <SystemDocumentation />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <Box size={64} className="opacity-20" />
              <p className="font-black uppercase tracking-widest text-sm">Dashboard content for {activeTab} coming soon</p>
              <button 
                onClick={() => setActiveTab('docs')}
                className="text-blue-600 font-bold uppercase text-xs border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Read System Documentation
              </button>
            </div>
          )}
        </main>
      </div>

      {showSetupGuide && <SetupGuide onClose={() => setShowSetupGuide(false)} />}
    </div>
  );
};
