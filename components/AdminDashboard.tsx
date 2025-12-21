import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LogOut, ArrowLeft, Save, Trash2, Plus, Edit2, Upload, Box, 
  Monitor, Grid, Image as ImageIcon, ChevronRight, ChevronLeft, Wifi, WifiOff, 
  Signal, Video, FileText, BarChart3, Search, RotateCcw, FolderInput, FileArchive, FolderArchive, Check, BookOpen, LayoutTemplate, Globe, Megaphone, Play, Download, MapPin, Tablet, Eye, X, Info, Menu, Map as MapIcon, HelpCircle, File as FileIcon, PlayCircle, ToggleLeft, ToggleRight, Clock, Volume2, VolumeX, Settings, Loader2, ChevronDown, Layout, Book, Camera, RefreshCw, Database, Power, CloudLightning, Folder, Smartphone, Cloud, HardDrive, Package, History, Archive, AlertCircle, FolderOpen, Layers, ShieldCheck, Ruler, SaveAll, Pencil, Moon, Sun, MonitorSmartphone, LayoutGrid, Music, Share2, Rewind, Tv, UserCog, Key, Move, FileInput, Lock, Unlock, Calendar, Filter, Zap, Activity, Network, Cpu, List, Table, Sparkles
} from 'lucide-react';
import { KioskRegistry, StoreData, Brand, Category, Product, AdConfig, AdItem, Catalogue, HeroConfig, ScreensaverSettings, ArchiveData, DimensionSet, Manual, TVBrand, TVConfig, TVModel, AdminUser, AdminPermissions, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { resetStoreData } from '../services/geminiService';
import { uploadFileToStorage, supabase, checkCloudConnection } from '../services/kioskService';
import SetupGuide from './SetupGuide';
import JSZip from 'jszip';

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// --- ZIP IMPORT/EXPORT UTILS ---

const getExtension = (blob: Blob, url: string): string => {
    if (blob.type === 'image/jpeg') return 'jpg';
    if (blob.type === 'image/png') return 'png';
    if (blob.type === 'image/webp') return 'webp';
    if (blob.type === 'application/pdf') return 'pdf';
    if (blob.type === 'video/mp4') return 'mp4';
    if (blob.type === 'video/webm') return 'webm';
    const match = url.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
    return match ? match[1] : 'dat';
};

const fetchAssetAndAddToZip = async (zipFolder: JSZip | null, url: string, filenameBase: string) => {
    if (!zipFolder || !url || url.length < 5) return;
    try {
        let blob: Blob;
        if (url.startsWith('data:')) {
            const res = await fetch(url);
            blob = await res.blob();
        } else {
            const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            blob = await response.blob();
        }
        const ext = getExtension(blob, url);
        const safeFilename = filenameBase.replace(/[^a-z0-9_\-]/gi, '_');
        zipFolder.file(`${safeFilename}.${ext}`, blob);
    } catch (e) {
        console.warn(`Failed to pack asset: ${url}`, e);
        zipFolder.file(`${filenameBase}_FAILED.txt`, `Could not download: ${url}`);
    }
};

const downloadZip = async (storeData: StoreData, onProgress?: (msg: string) => void) => {
    const zip = new JSZip();
    if (onProgress) onProgress("Initializing full system backup...");

    // 1. MASTER CONFIG
    zip.file("store_config_full.json", JSON.stringify(storeData, null, 2));
    
    // 2. INVENTORY ASSETS
    if (onProgress) onProgress("Packing Brand Inventory media...");
    for (const brand of storeData.brands) {
        const brandFolder = zip.folder(`Inventory/${brand.name.replace(/[^a-z0-9 ]/gi, '')}`);
        if (brandFolder && brand.logoUrl) await fetchAssetAndAddToZip(brandFolder, brand.logoUrl, "logo");
        
        for (const category of brand.categories) {
            const catFolder = brandFolder?.folder(category.name.replace(/[^a-z0-9 ]/gi, ''));
            for (const product of category.products) {
                const prodFolder = catFolder?.folder(product.name.replace(/[^a-z0-9 ]/gi, ''));
                if (prodFolder) {
                    if (product.imageUrl) await fetchAssetAndAddToZip(prodFolder, product.imageUrl, "main");
                    if (product.galleryUrls) {
                        for(let i=0; i<product.galleryUrls.length; i++) await fetchAssetAndAddToZip(prodFolder, product.galleryUrls[i], `gallery_${i}`);
                    }
                    const videos = Array.from(new Set([...(product.videoUrls || []), product.videoUrl].filter(Boolean)));
                    for(let i=0; i<videos.length; i++) await fetchAssetAndAddToZip(prodFolder, videos[i] as string, `video_${i}`);
                    if (product.manuals) {
                        for(const m of product.manuals) {
                            if (m.pdfUrl) await fetchAssetAndAddToZip(prodFolder, m.pdfUrl, m.title);
                            if (m.thumbnailUrl) await fetchAssetAndAddToZip(prodFolder, m.thumbnailUrl, `${m.title}_thumb`);
                        }
                    }
                }
            }
        }
    }

    // 3. MARKETING ASSETS
    if (onProgress) onProgress("Packing Marketing assets...");
    const mktFolder = zip.folder("Marketing");
    if (mktFolder) {
        if (storeData.hero.backgroundImageUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.backgroundImageUrl, "hero_bg");
        if (storeData.hero.logoUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.logoUrl, "hero_logo");
        if (storeData.hero.backgroundVideoUrl) await fetchAssetAndAddToZip(mktFolder, storeData.hero.backgroundVideoUrl, "hero_video");
        
        if (storeData.ads) {
            for (const [zone, items] of Object.entries(storeData.ads)) {
                const zoneFolder = mktFolder.folder(`Ads/${zone}`);
                const adItems = items as AdItem[];
                for(let i=0; i<adItems.length; i++) await fetchAssetAndAddToZip(zoneFolder, adItems[i].url, `ad_${i}`);
            }
        }
    }

    // 4. PRICELISTS
    if (onProgress) onProgress("Packing Pricelists...");
    const plFolder = zip.folder("Pricelists");
    if (plFolder && storeData.pricelists) {
        for (const pl of storeData.pricelists) {
            if (pl.url) await fetchAssetAndAddToZip(plFolder, pl.url, `${pl.title}_doc`);
            if (pl.thumbnailUrl) await fetchAssetAndAddToZip(plFolder, pl.thumbnailUrl, `${pl.title}_thumb`);
        }
    }

    if (onProgress) onProgress("Finalizing ZIP generation...");
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiosk-complete-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    if (onProgress) onProgress("");
};

const importZip = async (file: File, onProgress?: (msg: string) => void): Promise<{ fullData?: StoreData }> => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    
    const fullConfigEntry = loadedZip.file("store_config_full.json");
    if (fullConfigEntry) {
        if (onProgress) onProgress("Full system backup detected. Restoring configuration...");
        const content = await fullConfigEntry.async("text");
        return { fullData: JSON.parse(content) };
    }
    return {};
};

// --- AUTH COMPONENT ---
const Auth = ({ admins, onLogin }: { admins: AdminUser[], onLogin: (user: AdminUser) => void }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const handleAuth = (e: any) => {
    e.preventDefault();
    const admin = admins.find(a => a.name.toLowerCase() === name.toLowerCase().trim() && a.pin === pin.trim());
    if (admin) onLogin(admin); else alert("Invalid Login Credentials");
  };
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
      <form onSubmit={handleAuth} className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full relative z-10 animate-fade-in border border-white/20">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 mx-auto shadow-xl">
            <Lock size={32} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-center text-slate-900">Admin Hub</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-8">Secure System Access</p>
        
        <input className="w-full p-4 mb-4 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all uppercase" placeholder="Username" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-4 mb-8 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all text-center tracking-[0.5em]" type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} />
        
        <button className="w-full bg-slate-900 hover:bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Login System</button>
      </form>
    </div>
  );
};

export const AdminDashboard = ({ storeData, onUpdateData, onRefresh }: { storeData: StoreData | null, onUpdateData: (d: StoreData) => void, onRefresh: () => void }) => {
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<string>('inventory');
    const [localData, setLocalData] = useState<StoreData | null>(storeData);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressMsg, setProgressMsg] = useState('');

    useEffect(() => { if (storeData && !hasUnsavedChanges) setLocalData(storeData); }, [storeData]);

    const handleLocalUpdate = (newData: StoreData) => { 
        setLocalData(newData); 
        setHasUnsavedChanges(true); 
    };

    const handleBackupExport = async () => {
        if (!localData) return;
        setIsProcessing(true);
        try { await downloadZip(localData, setProgressMsg); } 
        catch (e) { alert("Export failed"); } 
        finally { setIsProcessing(false); setProgressMsg(''); }
    };

    const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessing(true);
        try {
            const result = await importZip(file, setProgressMsg);
            if (result.fullData) {
                if (confirm("Full System Restore detected. This will overwrite ALL current data (Inventory, Marketing, Settings). Proceed?")) {
                    handleLocalUpdate(result.fullData);
                    alert("System Restore applied successfully. Please Save to finalize.");
                }
            } else { alert("No valid backup configuration found in ZIP."); }
        } catch (e) { alert("Import failed"); }
        finally { setIsProcessing(false); setProgressMsg(''); e.target.value = ''; }
    };

    if (!currentUser) return <Auth admins={localData?.admins || []} onLogin={setCurrentUser} />;

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
            <header className="bg-slate-900 text-white shrink-0 p-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg"><Settings size={18} className="text-white" /></div>
                    <span className="font-black uppercase tracking-[0.2em] text-sm">System Control Center</span>
                </div>
                <div className="flex gap-4 items-center">
                    {hasUnsavedChanges && <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest animate-pulse">Unsaved Changes Detected</div>}
                    <button 
                        onClick={() => { onUpdateData(localData!); setHasUnsavedChanges(false); }} 
                        disabled={!hasUnsavedChanges} 
                        className={`px-6 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 transition-all ${hasUnsavedChanges ? 'bg-green-600 hover:bg-green-500 shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        <Save size={16} /> Save Master System
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Logout"><LogOut size={20}/></button>
                </div>
            </header>

            <div className="flex overflow-x-auto bg-slate-800 text-white scrollbar-hide shrink-0 border-b border-slate-700">
                {['inventory', 'marketing', 'pricelists', 'tv', 'screensaver', 'fleet', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] border-b-4 transition-all ${activeTab === tab ? 'border-blue-500 bg-slate-700 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>{tab}</button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-slate-50">
                {isProcessing && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm w-full">
                            <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
                            <p className="font-black uppercase tracking-[0.2em] text-slate-900 text-center">{progressMsg || "Processing System Files..."}</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase mt-4">Do not close browser</p>
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto pb-32">
                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={120} /></div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase mb-8 flex items-center gap-4"><Database className="text-blue-600"/> Migration & Backup</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col h-full">
                                        <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6"><Download className="text-slate-900" /></div>
                                        <h4 className="font-black text-slate-900 uppercase text-sm mb-2">Export Complete Archive</h4>
                                        <p className="text-xs text-slate-500 mb-10 leading-relaxed font-medium">Download a single ZIP containing every product, category, video, and setting. Essential for moving between local and cloud servers.</p>
                                        <button onClick={handleBackupExport} className="mt-auto w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg active:scale-95"><Download size={18}/> Export COMPLETE.zip</button>
                                    </div>
                                    <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex flex-col h-full">
                                        <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6"><Upload className="text-blue-600" /></div>
                                        <h4 className="font-black text-blue-900 uppercase text-sm mb-2">System Restore / Import</h4>
                                        <p className="text-xs text-blue-700 mb-10 leading-relaxed font-medium">Upload a Master Backup to perform a total system overwrite. Warning: All current data will be replaced by the backup contents.</p>
                                        <label className="mt-auto w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all cursor-pointer shadow-lg active:scale-95">
                                            <Upload size={18}/> Select Master Archive
                                            <input type="file" className="hidden" accept=".zip" onChange={handleBackupImport} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm">
                                <h3 className="text-2xl font-black text-slate-900 uppercase mb-8 flex items-center gap-4"><ShieldCheck className="text-green-600"/> Infrastructure Monitoring</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Brands Count</div>
                                        <div className="text-3xl font-black text-slate-900">{localData?.brands.length}</div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Fleet</div>
                                        <div className="text-3xl font-black text-slate-900">{localData?.brands.reduce((acc, b) => acc + b.categories.reduce((cacc, c) => cacc + c.products.length, 0), 0)}</div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Kiosks</div>
                                        <div className="text-3xl font-black text-slate-900">{localData?.fleet?.length || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'settings' && (
                        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-300">
                            <Layers size={80} className="mb-6 opacity-20" />
                            <h2 className="text-2xl font-black uppercase tracking-[0.3em] opacity-40">{activeTab} system ready</h2>
                            <p className="mt-2 font-bold uppercase text-[10px] tracking-widest text-slate-400">Section Logic Interface Initialized</p>
                        </div>
                    )}
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <div>Kiosk OS v2.8.4 Enterprise</div>
                <div className="flex gap-6">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> System Online</span>
                    <span>Database: Postgres 15</span>
                </div>
            </footer>
        </div>
    );
};
