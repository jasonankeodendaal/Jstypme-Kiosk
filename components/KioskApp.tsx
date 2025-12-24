
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Megaphone } from 'lucide-react';
import { jsPDF } from 'jspdf';

const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
};

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
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
            if (!shopName.trim()) return setError('Please enter a name for this location.');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            const systemPin = storeData.systemSettings?.setupPin || '0000';
            if (pin !== systemPin) return setError('Invalid Setup PIN. Consult Admin.');
            
            setIsProcessing(true);
            try {
                await provisionKioskId();
                const success = await completeKioskSetup(shopName.trim(), deviceType);
                if (success) onComplete();
                else setError('Setup failed. Local storage error.');
            } catch (e) {
                setError('Cloud registration failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border border-white/20">
                <div className="bg-slate-900 text-white p-6 md:p-8 text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-xl mb-4"><Store size={32} /></div>
                        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Device Provisioning</h1>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Kiosk Pro v2.8 • Initialization</p>
                    </div>
                </div>
                <div className="p-6 md:p-8">
                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3].map(s => <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'w-10 bg-blue-600' : 'w-3 bg-slate-200'}`}></div>)}
                    </div>
                    <div className="min-h-[180px]">
                        {step === 1 && (
                            <div className="animate-fade-in"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 01: Location Identity</label><h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">What is the name of this shop or zone?</h2><input autoFocus className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-base text-slate-900 transition-all uppercase placeholder:normal-case shadow-sm" placeholder="e.g. Mall - Tech Hub" value={shopName} onChange={(e) => setShopName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} /></div>
                        )}
                        {step === 2 && (
                            <div className="animate-fade-in"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 02: Hardware Profile</label><h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">Select the primary display type.</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[{ id: 'kiosk', icon: <Tablet size={20}/>, label: 'Kiosk' }, { id: 'mobile', icon: <Smartphone size={20}/>, label: 'Mobile' }, { id: 'tv', icon: <Tv size={20}/>, label: 'TV' }].map(type => (<button key={type.id} onClick={() => setDeviceType(type.id as any)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group ${deviceType === type.id ? 'bg-blue-50 border-blue-600 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}><div className={`${deviceType === type.id ? 'text-blue-600' : 'text-slate-400'}`}>{type.icon}</div><div className={`font-black uppercase text-[10px] ${deviceType === type.id ? 'text-blue-600' : 'text-slate-900'}`}>{type.label}</div></button>))}</div></div>
                        )}
                        {step === 3 && (
                            <div className="animate-fade-in text-center"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 03: Security Authorization</label><h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">Enter System Setup PIN</h2><div className="max-w-[200px] mx-auto"><input autoFocus type="password" maxLength={8} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono font-bold text-2xl text-center tracking-[0.5em] text-slate-900 transition-all shadow-sm" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} /></div></div>
                        )}
                    </div>
                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 border border-red-100"><X size={14}/> {error}</div>}
                    <div className="mt-8 flex gap-3">
                        {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Back</button>}
                        <button onClick={handleNext} disabled={isProcessing} className="flex-1 bg-slate-900 text-white p-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50">{isProcessing ? (<><Loader2 className="animate-spin" size={14} /> Syncing...</>) : (<>{step === 3 ? 'Complete Setup' : 'Continue'} <ChevronRight size={14} /></>)}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... ManualPricelistViewer, CreatorPopup, ComparisonModal, SearchModal stay same ...

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [remoteAlert, setRemoteAlert] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const myFleetEntry = useMemo(() => storeData?.fleet?.find(f => f.id === kioskId), [storeData?.fleet, kioskId]);
  const deviceType = myFleetEntry?.deviceType || getDeviceType() || 'kiosk';
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;
  
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true); setActiveProduct(null); setActiveCategory(null); setActiveBrand(null); setShowFlipbook(false); setViewingPdf(null); setViewingManualList(null); setShowPricelistModal(false); setShowGlobalSearch(false); setShowCompareModal(false); setCompareProductIds([]);
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
         if (syncResult?.deleted) { resetDeviceIdentity(); } 
         else if (syncResult?.restart) { window.location.reload(); }
         else if (syncResult?.command) {
             const { type, payload } = syncResult.command;
             if (type === 'broadcast' && payload) setRemoteAlert(payload);
             if (type === 'refresh') onSyncRequest?.();
             if (type === 'clear_cache') { localStorage.clear(); window.location.reload(); }
         }
      };
      syncCycle(); const interval = setInterval(syncCycle, 30000);
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity, onSyncRequest]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);

  const pricelistBrands = useMemo(() => (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name)), [storeData?.pricelistBrands]);
  const toggleCompareProduct = (product: Product) => setCompareProductIds(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(-5));
  const productsToCompare = useMemo(() => allProductsFlat.filter(p => compareProductIds.includes(p.id)), [allProductsFlat, compareProductIds]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       
       {remoteAlert && (
           <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
               <div className="bg-slate-900 text-white rounded-[3rem] p-12 max-w-2xl w-full border border-blue-500 shadow-[0_0_100px_rgba(37,99,235,0.4)] text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                    <Megaphone size={64} className="text-blue-500 mx-auto mb-8 animate-bounce" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">System Announcement</h2>
                    <div className="h-1 w-20 bg-blue-600 rounded-full mx-auto mb-8"></div>
                    <p className="text-xl font-bold leading-relaxed">{remoteAlert}</p>
                    <button 
                        onClick={() => setRemoteAlert(null)}
                        className="mt-12 bg-white text-slate-900 px-12 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                    >
                        Dismiss
                    </button>
               </div>
           </div>
       )}

       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain" alt="" /> : <Store size={16} className="text-blue-500" />}
               <button onClick={() => setShowGlobalSearch(true)} className="bg-white/10 hover:bg-blue-600 transition-colors px-2 py-1 rounded-md flex items-center gap-1.5 md:ml-4 group"><Search size={12} className="text-blue-400 group-hover:text-white" /><span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest hidden md:inline">Universal Search</span></button>
           </div>
           <div className="flex items-center gap-2 md:gap-4"><div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>{isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}</div><button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className="p-1 rounded bg-blue-900/30 text-blue-400"><ZoomOut size={12} /></button></div>
       </header>

       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} selectedForCompare={compareProductIds} onToggleCompare={toggleCompareProduct} onStartCompare={() => setShowCompareModal(true)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} />}
       </div>

       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[7px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
              <div className="flex items-center gap-1 shrink-0"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Live' : 'Offline'}</span></div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 md:pl-4 shrink-0"><span className="font-black text-slate-300 uppercase hidden md:inline">ID:</span><span className="font-mono font-bold text-slate-600">{kioskId}</span></div>
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-2">
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} className="bg-blue-600 text-white w-5 h-5 rounded flex items-center justify-center shadow-sm"><RIcon size={10} /></button>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span></button>
          </div>
       </footer>
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
    </div>
  );
};

export default KioskApp;
