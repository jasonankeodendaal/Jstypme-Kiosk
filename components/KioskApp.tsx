
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
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

// Lazy Load heavy components to keep main bundle small
const ManualPricelistViewer = lazy(() => import('./ManualPricelistViewer'));
const SearchModal = lazy(() => import('./SearchModal'));
const ComparisonModal = lazy(() => import('./ComparisonModal'));

import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Image as ImageIcon, SearchIcon, Minus, Plus, ToggleLeft, ToggleRight, Globe } from 'lucide-react';

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

// --- SETUP SCREEN ---
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
                        <p style={{color: '#94a3b8', fontSize: '10px', fontWeight: 'bold'}} className="uppercase tracking-widest mt-1">Kiosk Firmware v2.8</p>
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
                                <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Where is this tablet located?</h2>
                                <input 
                                    autoFocus
                                    className="w-full p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-bold text-lg text-black uppercase"
                                    placeholder="e.g. Front Desk"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in">
                                <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">02. Display Mode</label>
                                <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Hardware Profile</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {[
                                        { id: 'kiosk', icon: <Tablet size={20}/>, label: 'Kiosk' },
                                        { id: 'mobile', icon: <Smartphone size={20}/>, label: 'Handheld' },
                                        { id: 'tv', icon: <Tv size={20}/>, label: 'TV Display' }
                                    ].map(type => (
                                        <button 
                                            key={type.id}
                                            onClick={() => setDeviceType(type.id as any)}
                                            style={{borderWidth: '3px'}}
                                            className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${deviceType === type.id ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                        >
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
                                <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Authorized Admin Entry</h2>
                                <input 
                                    autoFocus
                                    type="password"
                                    maxLength={8}
                                    className="w-full max-w-[200px] p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-mono font-bold text-3xl text-center tracking-[0.5em] text-black"
                                    placeholder="****"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                />
                            </div>
                        )}
                    </div>

                    {error && <div style={{background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171'}} className="mt-4 p-3 rounded-lg text-xs font-black uppercase flex items-center gap-2"> {error}</div>}

                    <div className="mt-8 flex gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-200 text-black rounded-lg font-black uppercase text-xs tracking-widest">Back</button>
                        )}
                        <button 
                            onClick={handleNext}
                            disabled={isProcessing}
                            className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={14} /> Syncing...</>
                            ) : (
                                <>{step === 3 ? 'Start Application' : 'Next Step'} <ChevronRight size={14} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}>
    <div className="relative w-full max-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 bg-slate-900" onClick={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')] bg-cover bg-center opacity-30"></div>
      <div className="relative z-10">
        <img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-white font-black text-2xl mb-1">JSTYP.me</h2>
        <p className="text-white/70 text-xs italic mb-8">Digital Retail Specialist</p>
        <div className="flex gap-4 justify-center">
           <a href="https://wa.me/27695989427" target="_blank" className="bg-green-600 p-3 rounded-full"><img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" className="w-6 h-6" /></a>
           <a href="mailto:jstypme@gmail.com" className="bg-white p-3 rounded-full"><img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" className="w-6 h-6" /></a>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
    </div>
  </div>
);

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
  const myFleetEntry = useMemo(() => storeData?.fleet?.find(f => f.id === kioskId), [storeData?.fleet, kioskId]);
  const currentShopName = myFleetEntry?.name || getShopName() || "New Device";
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
    window.addEventListener('keydown', unlockAudio, { once: true });
  }, [isAudioUnlocked]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true); setActiveProduct(null); setActiveCategory(null); setActiveBrand(null); setShowFlipbook(false); setViewingPdf(null); setViewingManualList(null); setShowPricelistModal(false); setShowGlobalSearch(false); setShowCompareModal(false); setCompareProductIds([]); setViewingWebsite(null);
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  const resetDeviceIdentity = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer); window.addEventListener('click', resetIdleTimer);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true)); window.addEventListener('offline', () => setIsOnline(false));
    checkCloudConnection().then(setIsCloudConnected);
    if (isSetup) {
      const syncCycle = async () => {
         const syncResult = await sendHeartbeat();
         if (syncResult?.deleted) { resetDeviceIdentity(); } else if (syncResult?.restart) { window.location.reload(); }
      };
      syncCycle(); const interval = setInterval(syncCycle, 30000);
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);

  const pricelistBrands = useMemo(() => (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name)), [storeData?.pricelistBrands]);
  const toggleCompareProduct = (product: Product) => setCompareProductIds(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(-5));
  const productsToCompare = useMemo(() => allProductsFlat.filter(p => compareProductIds.includes(p.id)), [allProductsFlat, compareProductIds]);

  const activePricelistBrand = useMemo(() => {
      if (!viewingManualList) return undefined;
      let found: any = pricelistBrands.find(b => b.id === viewingManualList.brandId);
      if (!found && storeData?.brands) {
          found = storeData.brands.find(b => b.id === viewingManualList.brandId);
      }
      return found;
  }, [viewingManualList, pricelistBrands, storeData?.brands]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full" style={{ WebkitFontSmoothing: 'antialiased', transform: 'translate3d(0,0,0)' }}>
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} isAudioUnlocked={isAudioUnlocked} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
           <div className="flex items-center flex-1 max-w-xs md:max-w-md overflow-hidden mr-4">
               <button 
                   onClick={() => setShowGlobalSearch(true)} 
                   className="flex items-center gap-3 bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-white px-3 md:px-4 py-1 rounded-lg border border-white/5 transition-all group w-full text-left"
               >
                   <Search size={12} className="text-blue-500 group-hover:text-blue-400" />
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">Inventory Search...</span>
               </button>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
               {deviceType === 'kiosk' && (
                   <button 
                       onClick={() => setScreensaverEnabled(!screensaverEnabled)}
                       className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'}`}
                       title={screensaverEnabled ? 'Screensaver: ACTIVE' : 'Screensaver: PAUSED'}
                   >
                       {screensaverEnabled ? <MonitorPlay size={14} className="animate-pulse" /> : <MonitorStop size={14} />}
                       <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest hidden sm:inline">
                           {screensaverEnabled ? 'Screensaver ON' : 'Screensaver OFF'}
                       </span>
                   </button>
               )}
               <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                   {isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}
               </div>
               <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                   <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}><ZoomOut size={12} /></button>
               </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onViewWebsite={(url) => setViewingWebsite(url)} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} deviceType={deviceType} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} selectedForCompare={compareProductIds} onToggleCompare={toggleCompareProduct} onStartCompare={() => setShowCompareModal(true)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} />}
       </div>
       <footer className="relative shrink-0 bg-white border-t border-slate-200 text-slate-500 h-10 flex items-center justify-between px-2 md:px-6 z-50 text-[7px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
              <div className="flex items-center gap-1 shrink-0">
                  <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-bold uppercase whitespace-nowrap">{isOnline ? 'Live' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 md:pl-4 shrink-0">
                  <span className="font-black text-slate-300 uppercase hidden md:inline">ID:</span>
                  <span className="font-mono font-bold text-slate-600">{kioskId}</span>
              </div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 md:pl-4 truncate">
                  <RefreshCw size={8} className="text-slate-300 hidden md:inline" />
                  <span className="font-bold uppercase text-slate-400">Sync: {lastSyncTime || '--:--'}</span>
              </div>
          </div>

          {pricelistBrands.length > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                  <button 
                    onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-white ring-8 ring-blue-600/5 group" 
                    title="Pricelists"
                  >
                    <RIcon size={16} className="text-white group-hover:scale-110 transition-transform" />
                  </button>
              </div>
          )}

          <div className="flex items-center gap-4 shrink-0 ml-2">
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:text-blue-600 transition-colors">
                  <span>JSTYP</span>
              </button>
          </div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       
       <Suspense fallback={<div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
        {showGlobalSearch && <SearchModal storeData={storeData} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b => b.id === (p as any).brandId)!); setActiveCategory(storeData.brands.find(b => b.id === (p as any).brandId)!.categories.find(c => c.id === (p as any).categoryId)!); setActiveProduct(p); }} onClose={() => setShowGlobalSearch(false)} />}
        {showCompareModal && <ComparisonModal products={productsToCompare} onClose={() => setShowCompareModal(false)} onShowDetail={setActiveProduct} />}
       </Suspense>

       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in print:hidden" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0"><h2 className="text-base md:text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2><button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full transition-colors hover:bg-slate-200"><X size={24} className="text-slate-500" /></button></div>
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row"><div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden flex flex-col"><div className="md:hidden"><div className="overflow-x-auto no-scrollbar py-2"><div className="grid grid-rows-2 grid-flow-col gap-2 px-2 min-w-max">{pricelistBrands.map(brand => (<button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`flex items-center gap-2 p-2 rounded-xl border transition-all min-w-[120px] ${selectedBrandForPricelist === brand.id ? 'bg-white border-green-500 shadow-sm ring-1 ring-green-500/20' : 'bg-slate-100 border-transparent hover:bg-white'}`}><div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-[10px]">{brand.name.charAt(0)}</span>}</div><span className={`font-black text-[9px] uppercase leading-tight truncate flex-1 text-left ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-500'}`}>{brand.name}</span></button>))}</div></div></div><div className="hidden md:flex flex-1 flex-col overflow-y-auto no-scrollbar">{pricelistBrands.map(brand => (<button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}><div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}</div><span className={`font-black text-sm uppercase leading-tight ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-400'}`}>{brand.name}</span></button>))}</div></div><div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50 relative">{selectedBrandForPricelist ? (<div className="animate-fade-in"><div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (<button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-white hover:border-green-400'}`}><div className="aspect-[3/4] bg-slate-50 relative p-2 md:p-3 overflow-hidden">{pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded shadow-sm" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">{pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}</div>}<div className={`absolute top-2 right-2 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-50'}`}>{pl.type === 'manual' ? 'TABLE' : 'PDF'}</div></div><div className="p-3 flex-1 flex flex-col justify-between bg-white"><h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase leading-tight line-clamp-2">{pl.title}</h3><div className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-2">{pl.month} {pl.year}</div></div></button>))}</div></div>) : <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"><RIcon size={64} className="opacity-10" /></div>}</div></div></div></div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       
       <Suspense fallback={null}>
       {viewingManualList && (
          <ManualPricelistViewer 
            pricelist={viewingManualList} 
            onClose={() => setViewingManualList(null)} 
            companyLogo={storeData.companyLogoUrl || storeData.hero.logoUrl}
            brandLogo={activePricelistBrand?.logoUrl}
            brandName={activePricelistBrand?.name}
          />
       )}
       </Suspense>

       {viewingWebsite && (
           <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-fade-in print:hidden">
               <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 border-b border-white/5 shadow-xl">
                   <div className="flex items-center gap-4">
                       <div className="p-2 bg-blue-600 rounded-xl"><Globe size={20} /></div>
                       <div className="flex flex-col">
                           <span className="text-xs font-black uppercase tracking-widest leading-none">In-App Browser</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 truncate max-w-xs">{viewingWebsite.replace(/^https?:\/\//, '')}</span>
                       </div>
                   </div>
                   <button 
                      onClick={() => setViewingWebsite(null)} 
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                       <X size={16} strokeWidth={3} /> Exit Browser
                   </button>
               </div>
               <div className="flex-1 bg-slate-100 relative">
                   <iframe 
                      src={viewingWebsite} 
                      className="w-full h-full border-none" 
                      title="Kiosk Web Portal"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                   />
               </div>
           </div>
       )}
    </div>
  );
};

export default KioskApp;
