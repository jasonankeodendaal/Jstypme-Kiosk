
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Tag, Sparkles, FileSpreadsheet, ArrowRight, MousePointer2, GitBranch, Globe2, Wind, Binary, Columns, FileType, FileOutput, Maximize, Terminal, MousePointer, Shield, Radio, Activity as Pulse, Volume, User, FileDigit, Code2, Workflow, Link2, Eye, MoveHorizontal, AlignLeft, AlignCenter, AlignRight, Type, Lamp, Film, Eraser, FolderSync, ActivitySquare
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem, ArchivedItem, SyncSettings } from '../types';
import { resetStoreData, generateStoreData, saveStoreData } from '../services/geminiService';
import { smartUpload, checkCloudConnection, getEnv } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const PC_API_URL = getEnv('VITE_PC_API_URL', 'https://your-kiosk-api.com');

// --- SHARED COMPONENTS ---
const SignalStrengthBars = ({ strength }: { strength: number }) => (
    <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3, 4].map((bar) => {
            const isActive = (strength / 25) >= bar;
            return (<div key={bar} className={`w-1 rounded-full transition-all duration-500 ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`} style={{ height: `${bar * 25}%` }}/>);
        })}
    </div>
);

const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const admin = admins.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else setError('Invalid credentials.');
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4"><div className="bg-slate-100 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300"><h1 className="text-4xl font-black mb-2 text-center text-slate-900 tracking-tight">Admin Hub</h1><p className="text-center text-slate-500 text-sm mb-6 font-bold uppercase">Enter Name & PIN</p><form onSubmit={handleAuth} className="space-y-4"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">Admin Name</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold outline-none" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">PIN Code</label><input className="w-full p-4 border border-slate-300 rounded-xl bg-white font-bold outline-none" type="password" placeholder="####" value={pin} onChange={(e) => setPin(e.target.value)} /></div>{error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}<button type="submit" className="w-full p-4 font-black rounded-xl bg-slate-900 text-white uppercase shadow-lg">Login</button></form></div></div>
  );
};

const SyncBridgePanel = ({ syncSettings, onUpdate }: { syncSettings?: SyncSettings, onUpdate: (s: SyncSettings) => void }) => {
    const isConnected = syncSettings?.bridgeStatus === 'online';
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Status Card */}
                <div className="flex-1 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500"><FolderSync size={120} /></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-700'}`}></div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sync Bridge Status</span>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
                            {isConnected ? 'Bridge Online' : 'Bridge Offline'}
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
                            {isConnected ? `Connected to: ${syncSettings.localPath || 'Remote Main PC'}` : 'Start the Bridge Script on your Main PC to link folders'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Last Data Pulse</span>
                                <span className="block text-white font-mono text-xs">{syncSettings?.lastSync || 'Never'}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Authorization Key</span>
                                <div className="flex items-center gap-2">
                                    <span className="block text-blue-400 font-mono text-xs truncate">{syncSettings?.syncKey || 'KIOSK-SYNC-XXXX'}</span>
                                    <button onClick={() => {
                                        const newKey = `SYNC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                                        onUpdate({ ...(syncSettings || {} as SyncSettings), syncKey: newKey, bridgeStatus: 'offline', lastSync: 'Waiting...', autoSyncEnabled: true });
                                    }} className="text-slate-500 hover:text-white transition-colors"><RefreshCw size={12}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="w-full md:w-80 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center">
                    <h3 className="text-slate-900 font-black uppercase text-sm mb-4 flex items-center gap-2"><Info className="text-blue-600" size={18} /> How it works</h3>
                    <ul className="space-y-4">
                        {[
                            'Run the Bridge script on your PC.',
                            'Select any local folder to watch.',
                            'Drop files into the folder.',
                            'Files auto-upload to the cloud.',
                            'Global Kiosks update instantly.'
                        ].map((step, i) => (
                            <li key={i} className="flex gap-3 text-xs font-bold text-slate-500">
                                <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-slate-900">{i+1}</span>
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sync Logs */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-black uppercase text-xs flex items-center gap-2 tracking-widest"><Terminal size={14} className="text-blue-500"/> Real-time Sync Pipeline</h3>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Live from Bridge</div>
                </div>
                <div className="space-y-3 font-mono text-[11px] h-48 overflow-y-auto no-scrollbar">
                    {isConnected ? (
                        <>
                            <div className="text-green-500 flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span>CONNECTED: Bridge handshake successful.</span></div>
                            <div className="text-slate-500 flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span>WATCHING: {syncSettings.localPath || 'C:\\KioskAssets'}</span></div>
                        </>
                    ) : (
                        <div className="text-red-500/50 flex gap-4 animate-pulse"><span>[--:--:--]</span> <span>WAITING: No active bridge connection detected. Ensure Node.js script is running.</span></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [localData, setLocalData] = useState<StoreData | null>(storeData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const logout = useCallback(() => setCurrentUser(null), []);

  useEffect(() => {
    checkCloudConnection().then(setIsCloudConnected);
    const interval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalSave = async () => {
    if (localData) {
        try {
            await saveStoreData(localData);
            setHasUnsavedChanges(false);
            alert("Cloud Sync Successful");
        } catch (e) {
            alert("Sync Failed. Ensure server is online.");
        }
    }
  };

  if (!localData) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /> Booting Admin...</div>;
  if (!currentUser) return <Auth admins={localData.admins || []} onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <header className="bg-slate-900 text-white shrink-0 shadow-xl z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2"><Settings className="text-blue-500" size={24} /><h1 className="text-lg font-black uppercase tracking-widest">Admin Hub</h1></div>
                <div className="flex items-center gap-4">
                    <button onClick={handleGlobalSave} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase text-xs transition-all ${hasUnsavedChanges ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}><SaveAll size={16} /> Sync to Cloud</button>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-red-900/50 text-red-300 border-red-800'}`}>
                        {isCloudConnected ? <Cloud size={14} /> : <WifiOff size={14} />}
                        <span className="text-[10px] font-bold uppercase">{isCloudConnected ? 'Cloud Online' : 'Server Offline'}</span>
                    </div>
                    <button onClick={() => setShowGuide(true)} className="p-2 bg-slate-800 rounded-lg text-white"><BookOpen size={16}/></button>
                    <button onClick={logout} className="p-2 bg-red-900/50 rounded-lg text-red-400 hover:text-white"><LogOut size={16} /></button>
                </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar">
                {['inventory', 'marketing', 'pricelists', 'fleet', 'sync', 'settings'].map(id => (
                    <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 min-w-[100px] py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === id ? 'border-blue-500 text-white bg-slate-800' : 'border-transparent text-slate-500'}`}>{id === 'sync' ? 'Sync Bridge' : id}</button>
                ))}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {activeTab === 'sync' ? (
                    <SyncBridgePanel 
                        syncSettings={localData.syncSettings} 
                        onUpdate={(s) => { 
                            setLocalData({ ...localData, syncSettings: s }); 
                            setHasUnsavedChanges(true); 
                        }} 
                    />
                ) : (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-blue-500" />
                            <h2 className="text-xl font-black uppercase">System Console</h2>
                        </div>
                        <p className="text-slate-500 font-medium">Use the tabs above to manage your global kiosk network.</p>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-blue-600 font-black text-2xl mb-1">{localData.brands.length}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Brands</div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-green-600 font-black text-2xl mb-1">{localData.fleet?.length || 0}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Devices</div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-purple-600 font-black text-2xl mb-1">{localData.pricelists?.length || 0}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cloud Assets</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default AdminDashboard;
