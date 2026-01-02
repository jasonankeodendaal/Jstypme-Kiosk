
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { 
  getKioskId, 
  provisionKioskId, 
  completeKioskSetup, 
  isKioskConfigured, 
  sendHeartbeat, 
  getShopName, 
  getDeviceType,
  checkCloudConnection,
  sendHeartbeat as heartbeatFn
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import { Store, X, Loader2, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomOut, Tv, Search, Filter, LayoutGrid, FileDown, CheckCircle2, ChevronRight, List } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Lazy load non-critical heavy modules
const TVMode = lazy(() => import('./TVMode'));
const Flipbook = lazy(() => import('./Flipbook'));
const PdfViewer = lazy(() => import('./PdfViewer'));

const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
};

const RIcon = React.memo(({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
));

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
                await completeKioskSetup(shopName.trim(), deviceType);
                onComplete();
            } catch (e) {
                setError('Sync failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-[#0f172a] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden border-2 border-white animate-fade-in">
                <div className="bg-[#1e293b] text-white p-6 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-600 p-2 rounded-lg mb-3 shadow-lg">
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
                                <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Where is this tablet located?</h2>
                                <input autoFocus className="w-full p-4 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold uppercase" placeholder="e.g. Front Desk" value={shopName} onChange={(e) => setShopName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
                            </div>
                        )}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">02. Display Mode</label>
                                <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Hardware Profile</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {['kiosk', 'mobile', 'tv'].map(id => (
                                        <button key={id} onClick={() => setDeviceType(id as any)} className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 border-2 ${deviceType === id ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            <div className="font-black uppercase text-xs">{id}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="animate-fade-in text-center">
                                <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">03. Security PIN</label>
                                <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Authorized Admin Entry</h2>
                                <input autoFocus type="password" maxLength={8} className="w-full max-w-[200px] p-4 border-2 border-slate-300 rounded-lg outline-none focus:border-blue-600 font-mono font-bold text-3xl text-center" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
                            </div>
                        )}
                    </div>
                    {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-black uppercase">{error}</div>}
                    <div className="mt-8 flex gap-3">
                        {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-200 rounded-lg font-black uppercase text-xs">Back</button>}
                        <button onClick={handleNext} disabled={isProcessing} className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg">
                            {isProcessing ? <Loader2 className="animate-spin" size={14} /> : step === 3 ? 'Start Application' : 'Next Step'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PricelistRow = React.memo(({ item, hasImages, onEnlarge }: { item: PricelistItem, hasImages: boolean, onEnlarge: (url: string) => void }) => (
    <tr className="excel-row border-b border-slate-100 transition-colors group">
        {hasImages && (
            <td className="p-1 border-r border-slate-100 text-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded flex items-center justify-center mx-auto overflow-hidden cursor-zoom-in" onClick={(e) => { e.stopPropagation(); if(item.imageUrl) onEnlarge(item.imageUrl); }}>
                    {item.imageUrl ? <img src={item.imageUrl} loading="lazy" decoding="async" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-slate-50" />}
                </div>
            </td>
        )}
        <td className="sku-cell border-r border-slate-100"><span className="sku-font font-bold text-slate-900 uppercase">{item.sku || ''}</span></td>
        <td className="desc-cell border-r border-slate-100"><span className="font-bold text-slate-900 uppercase tracking-tight group-hover:text-[#c0810d]">{item.description}</span></td>
        <td className="price-cell text-right border-r border-slate-100 whitespace-nowrap"><span className="font-bold text-slate-900">{item.normalPrice || ''}</span></td>
        <td className="price-cell text-right bg-slate-50/10 whitespace-nowrap">{item.promoPrice ? <span className="font-black text-[#ef4444]">{item.promoPrice}</span> : <span className="font-bold text-slate-900">{item.normalPrice || ''}</span>}</td>
    </tr>
));

const ManualPricelistViewer = React.lazy(() => Promise.resolve({
  default: ({ pricelist, onClose, companyLogo, brandLogo, brandName }: any) => {
    const [zoom, setZoom] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const ROW_HEIGHT = 48;

    const hasImages = useMemo(() => pricelist.items?.some((i: any) => i.imageUrl) || false, [pricelist.items]);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, clientHeight } = scrollContainerRef.current;
        const start = Math.max(0, Math.floor((scrollTop / zoom) / ROW_HEIGHT) - 5);
        const end = Math.min(pricelist.items?.length || 0, Math.ceil(((scrollTop + clientHeight) / zoom) / ROW_HEIGHT) + 5);
        setVisibleRange({ start, end });
    }, [zoom, pricelist.items?.length]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const visibleItems = useMemo(() => pricelist.items?.slice(visibleRange.start, visibleRange.end) || [], [pricelist.items, visibleRange]);
    const topPadding = visibleRange.start * ROW_HEIGHT;
    const bottomPadding = Math.max(0, (pricelist.items?.length - visibleRange.end) * ROW_HEIGHT);

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 md:p-6 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
                    <h2 className="text-sm md:text-2xl font-black uppercase truncate">{pricelist.title}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setZoom(z => Math.max(1, z - 0.25))} className="p-2 bg-black/20 rounded-full hover:bg-black/30"><ZoomOut size={20}/></button>
                        <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30"><X size={20}/></button>
                    </div>
                </div>
                <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-slate-100/50 p-4">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: '100%' }}>
                        <table className="w-full text-left border-collapse bg-white shadow-xl rounded-xl overflow-hidden">
                            <thead className="bg-[#71717a] text-white">
                                <tr>
                                    {hasImages && <th className="p-3 text-xs font-black uppercase w-[10%]">Media</th>}
                                    <th className="p-3 text-xs font-black uppercase">SKU</th>
                                    <th className="p-3 text-xs font-black uppercase">Description</th>
                                    <th className="p-3 text-xs font-black uppercase text-right">Normal</th>
                                    <th className="p-3 text-xs font-black uppercase text-right">Promo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ height: topPadding }} />
                                {visibleItems.map((item: any) => <PricelistRow key={item.id} item={item} hasImages={hasImages} onEnlarge={setEnlargedImage} />)}
                                <tr style={{ height: bottomPadding }} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {enlargedImage && <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-8" onClick={() => setEnlargedImage(null)}><img src={enlargedImage} className="max-w-full max-h-full object-contain" /></div>}
        </div>
    );
  }
}));

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
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [flipbookPages, setFlipbookPages] = useState<string[]>([]);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [viewingManualList, setViewingManualList] = useState<Pricelist | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const timerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;

  useEffect(() => {
    const unlock = () => setIsAudioUnlocked(true);
    window.addEventListener('mousedown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }, []);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true); setActiveProduct(null); setActiveCategory(null); setActiveBrand(null);
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    if (isSetup) {
      const interval = setInterval(async () => {
         const res = await heartbeatFn();
         if (res?.deleted) { localStorage.clear(); window.location.reload(); }
         else if (res?.restart) { window.location.reload(); }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [resetIdleTimer, isSetup]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  
  return (
    <div className="relative bg-slate-100 flex flex-col h-[100dvh] w-full overflow-hidden will-change-contents">
       {isIdle && screensaverEnabled && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} isAudioUnlocked={isAudioUnlocked} />}
       
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-lg">
           <div className="flex items-center gap-4">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} decoding="async" className="h-6 object-contain" alt="" /> : <Store size={18} className="text-blue-500" />}
               <button onClick={() => setShowGlobalSearch(true)} className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 transition-colors">
                  <Search size={12} /> Search
               </button>
           </div>
           <div className="flex items-center gap-4">
               <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`px-2 py-1 rounded border transition-colors ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                   {screensaverEnabled ? <MonitorPlay size={14} /> : <MonitorStop size={14} />}
               </button>
               <div className={`p-1 rounded-full border ${isCloudConnected ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'}`}>
                   {isCloudConnected ? <Cloud size={10} /> : <HardDrive size={10} />}
               </div>
           </div>
       </header>

       <div className="flex-1 relative min-h-0">
         {!activeBrand ? <BrandGrid brands={storeData.brands} heroConfig={storeData.hero} allCatalogs={storeData.catalogues} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={() => {}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => {}} deviceType={deviceType} /> : 
          !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues} onSelectCategory={setActiveCategory} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => {}} /> : 
          !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => {}} selectedForCompare={[]} onToggleCompare={() => {}} onStartCompare={() => {}} /> : 
          <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => {}} />}
       </div>

       <footer className="shrink-0 bg-white border-t border-slate-200 h-8 flex items-center justify-between px-4 z-50 text-[10px]">
          <div className="flex items-center gap-4 font-bold uppercase text-slate-400">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live</div>
              <div className="border-l pl-4 font-mono">{kioskId}</div>
          </div>
          <button onClick={() => { setSelectedBrandForPricelist(storeData.pricelistBrands?.[0]?.id || null); setShowPricelistModal(true); }} className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center shadow-md active:scale-90 transition-transform">
             <RIcon size={12} />
          </button>
       </footer>

       <Suspense fallback={<div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
         {showPricelistModal && <div className="fixed inset-0 z-[60] bg-slate-900/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPricelistModal(false)}>
            <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="p-4 bg-slate-50 border-b flex justify-between items-center shrink-0"><h2 className="font-black uppercase flex items-center gap-2"><RIcon size={20}/> Pricelists</h2><button onClick={() => setShowPricelistModal(false)}><X/></button></div>
               <div className="flex-1 overflow-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                 {storeData.pricelists?.map(pl => (
                   <button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); }} className="bg-slate-50 p-4 rounded-2xl border hover:border-blue-500 transition-all flex flex-col gap-2">
                     <div className="aspect-[3/4] bg-white rounded-xl shadow-inner flex items-center justify-center">{pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain" /> : <List size={32} className="text-slate-200" />}</div>
                     <span className="font-black text-[10px] uppercase leading-tight line-clamp-2">{pl.title}</span>
                   </button>
                 ))}
               </div>
            </div>
         </div>}
         {viewingManualList && <ManualPricelistViewer pricelist={viewingManualList} onClose={() => setViewingManualList(null)} companyLogo={storeData.companyLogoUrl} />}
         {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} />}
       </Suspense>
    </div>
  );
};

export default KioskApp;
