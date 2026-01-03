import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { 
  getKioskId, 
  provisionKioskId, 
  completeKioskSetup, 
  isKioskConfigured, 
  sendHeartbeat, 
  setCustomKioskId, 
  getShopName, 
  getDeviceType,
  supabase,
  checkCloudConnection,
  initSupabase,
  getCloudProjectName,
  tryRecoverIdentity
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Image as ImageIcon, SearchIcon, Minus, Plus, ToggleLeft, ToggleRight, Globe, Activity } from 'lucide-react';
import { jsPDF } from 'jspdf';

declare global {
  interface Window {
    signalAppHeartbeat?: () => void;
  }
}

const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
};

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 21V3h7a5 5 0 0 1 0 10H7" />
    <path d="M13 13l5 8" />
    <path d="M10 8h4" />
  </svg>
);

const SetupScreen = ({ storeData, onComplete }: { storeData: StoreData, onComplete: () => void }) => {
    const [step, setStep] = useState(1);
    const [shopName, setShopName] = useState('');
    const [deviceType, setDeviceType] = useState<'kiosk' | 'mobile' | 'tv'>('kiosk');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = async () => {
        setError('');
        if (step === 1) {
            if (!shopName.trim()) return setError('Enter location name.');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            const systemPin = storeData.systemSettings?.setupPin || '0000';
            if (pin !== systemPin) return setError('Invalid PIN.');
            setIsProcessing(true);
            try {
                await provisionKioskId();
                const success = await completeKioskSetup(shopName.trim(), deviceType);
                if (success) onComplete();
                else setError('Storage error.');
            } catch (e) {
                setError('Sync failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-[#0f172a] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden border-2 border-white">
                <div className="bg-[#1e293b] text-white p-6 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-600 p-2 rounded-lg mb-3">
                            <Store size={28} />
                        </div>
                        <h1 style={{fontSize: '24px', fontWeight: 900}} className="uppercase tracking-tight">System Setup</h1>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 rounded-full transition-all ${step >= s ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}></div>
                        ))}
                    </div>
                    <div style={{minHeight: '200px'}}>
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">01. Device Location</label>
                                <input autoFocus className="w-full p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-bold text-lg text-black uppercase" placeholder="e.g. Front Desk" value={shopName} onChange={(e) => setShopName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
                            </div>
                        )}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">02. Display Mode</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {[{ id: 'kiosk', icon: <Tablet size={20}/>, label: 'Kiosk' }, { id: 'mobile', icon: <Smartphone size={20}/>, label: 'Handheld' }, { id: 'tv', icon: <Tv size={20}/>, label: 'TV Display' }].map(type => (
                                        <button key={type.id} onClick={() => setDeviceType(type.id as any)} style={{borderWidth: '3px'}} className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${deviceType === type.id ? 'bg-blue-600 border-blue-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            <div>{type.icon}</div>
                                            <div style={{fontWeight: 900}} className="uppercase text-xs">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="animate-fade-in text-center">
                                <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">03. Security PIN</label>
                                <input autoFocus type="password" maxLength={8} className="w-full max-w-[200px] p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-mono font-bold text-3xl text-center tracking-[0.5em] text-black" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
                            </div>
                        )}
                    </div>
                    {error && <div className="mt-4 p-3 rounded-lg text-xs font-black uppercase flex items-center gap-2 bg-red-100 text-red-700 border border-red-200">{error}</div>}
                    <div className="mt-8 flex gap-3">
                        {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-200 text-black rounded-lg font-black uppercase text-xs tracking-widest">Back</button>}
                        <button onClick={handleNext} disabled={isProcessing} className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg">
                            {isProcessing ? <><Loader2 className="animate-spin" size={14} /> Syncing...</> : <>{step === 3 ? 'Start Application' : 'Next Step'} <ChevronRight size={14} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
  const myFleetEntry = useMemo(() => storeData?.fleet?.find(f => f.id === kioskId), [storeData?.fleet, kioskId]);
  const deviceType = myFleetEntry?.deviceType || getDeviceType() || 'kiosk';
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [screensaverEnabled, setScreensaverEnabled] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [flipbookPages, setFlipbookPages] = useState<string[]>([]);
  const [flipbookTitle, setFlipbookTitle] = useState<string | undefined>(undefined); 
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [viewingManualList, setViewingManualList] = useState<Pricelist | null>(null);
  const [viewingWebsite, setViewingWebsite] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const timerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;

  useEffect(() => {
    const heartbeat = setInterval(() => {
        if (window.signalAppHeartbeat) window.signalAppHeartbeat();
    }, 2000);
    return () => clearInterval(heartbeat);
  }, []);
  
  useEffect(() => {
    const unlockAudio = () => {
        if (!isAudioUnlocked) {
            setIsAudioUnlocked(true);
            const silentCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buffer = silentCtx.createBuffer(1, 1, 22050);
            const source = silentCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(silentCtx.destination);
            source.start(0);
        }
    };
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('mousedown', unlockAudio, { once: true });
  }, [isAudioUnlocked]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true); 
        // Respect Wake Behavior
        if (storeData?.screensaverSettings?.wakeBehavior !== 'resume') {
            setActiveProduct(null); setActiveCategory(null); setActiveBrand(null); setShowFlipbook(false); setViewingPdf(null); setViewingManualList(null); setShowPricelistModal(false); setShowGlobalSearch(false); setShowCompareModal(false); setCompareProductIds([]); setViewingWebsite(null);
        }
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup, storeData?.screensaverSettings?.wakeBehavior]);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer); 
    window.addEventListener('click', resetIdleTimer);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true)); 
    window.addEventListener('offline', () => setIsOnline(false));
    checkCloudConnection().then(setIsCloudConnected);
    if (isSetup) {
      const syncCycle = async () => {
         const syncResult = await sendHeartbeat();
         if (syncResult?.deleted) { localStorage.clear(); window.location.reload(); } else if (syncResult?.restart) { window.location.reload(); }
      };
      syncCycle(); const interval = setInterval(syncCycle, 30000);
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => clearInterval(clockInterval);
  }, [resetIdleTimer, isSetup]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);

  const pricelistBrands = useMemo(() => (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name)), [storeData?.pricelistBrands]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} isAudioUnlocked={isAudioUnlocked} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
           <div className="flex items-center flex-1 max-w-xs md:max-w-md overflow-hidden mr-4">
               <button onClick={() => setShowGlobalSearch(true)} className="flex items-center gap-3 bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-white px-3 md:px-4 py-1 rounded-lg border border-white/5 transition-all group w-full text-left">
                   <Search size={12} className="text-blue-500 group-hover:text-blue-400" />
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">Inventory Search...</span>
               </button>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
               <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
                    <Activity size={12} className="text-green-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Watchdog Active</span>
               </div>
               {deviceType === 'kiosk' && (
                   <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'}`}>
                       {screensaverEnabled ? <MonitorPlay size={14} className="animate-pulse" /> : <MonitorStop size={14} />}
                       <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest hidden sm:inline">{screensaverEnabled ? 'Screensaver ON' : 'Screensaver OFF'}</span>
                   </button>
               )}
               <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}><Cloud size={8} /></div>
               <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                   <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}><ZoomOut size={12} /></button>
               </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onViewWebsite={(url) => setViewingWebsite(url)} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} deviceType={deviceType} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} selectedForCompare={compareProductIds} onToggleCompare={(p: any) => setCompareProductIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id].slice(-5))} onStartCompare={() => setShowCompareModal(true)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 h-10 flex items-center justify-between px-2 md:px-6 z-50 text-[7px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">Live</span></div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 md:pl-4"><span className="font-mono font-bold text-slate-600">{kioskId}</span></div>
          </div>
          {pricelistBrands.length > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                  <button onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-white"><RIcon size={16} /></button>
              </div>
          )}
          <button onClick={() => setShowCreator(true)} className="font-black uppercase tracking-widest hover:text-blue-600">JSTYP</button>
       </footer>
       {/* ... rest of modals ... */}
    </div>
  );
};

export default KioskApp;