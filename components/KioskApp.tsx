
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles } from 'lucide-react';

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

const ManualPricelistViewer = ({ pricelist, onClose }: { pricelist: Pricelist, onClose: () => void }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12 animate-fade-in" onClick={onClose}>
      <div className={`relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-full flex flex-col ${isNewlyUpdated ? 'ring-4 ring-yellow-400' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`p-6 text-white flex justify-between items-center shrink-0 border-b border-white/5 ${isNewlyUpdated ? 'bg-yellow-600' : 'bg-slate-900'}`}>
          <div>
            <div className="flex items-center gap-3"><h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">{pricelist.title}</h2>{isNewlyUpdated && <span className="bg-white text-yellow-700 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg"><Sparkles size={12} /> Recent</span>}</div>
            <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-blue-400'} font-bold uppercase tracking-widest text-xs md:text-sm`}>{pricelist.month} {pricelist.year}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr><th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th><th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th><th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Normal</th><th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-red-500">Promo</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pricelist.items || []).map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isNewlyUpdated ? 'bg-yellow-50/30' : ''}`}><td className="p-4 font-mono font-bold text-sm text-slate-500 uppercase">{item.sku || '-'}</td><td className="p-4 font-bold text-slate-900">{item.description}</td><td className="p-4 font-black text-lg text-slate-400 line-through decoration-red-500/30">{item.normalPrice}</td><td className="p-4 font-black text-2xl text-red-600">{item.promoPrice || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid for {pricelist.month} {pricelist.year} • Prices subject to change</p></div>
      </div>
    </div>
  );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}>
    <div className="relative w-full max-w-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 bg-slate-900" onClick={e => e.stopPropagation()}>
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
  
  // Derived state from storeData (Fleet Telemetry)
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true);
        setActiveProduct(null);
        setActiveCategory(null);
        setActiveBrand(null);
        setShowFlipbook(false);
        setViewingPdf(null);
        setViewingManualList(null);
        setShowPricelistModal(false);
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  const resetDeviceIdentity = useCallback(() => {
      localStorage.clear();
      window.location.reload();
  }, []);

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
         if (syncResult?.deleted) {
             resetDeviceIdentity();
         } else if (syncResult?.restart) {
             window.location.reload();
         }
      };
      syncCycle();
      const interval = setInterval(syncCycle, 30000); // Heartbeat pulse
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity]);

  const filteredCatalogs = useMemo(() => {
      if(!storeData?.catalogues) return [];
      const now = new Date();
      return storeData.catalogues.filter(c => !c.endDate || new Date(c.endDate) >= now);
  }, [storeData?.catalogues]);

  const allProducts = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);
  
  const pricelistBrands = useMemo(() => {
      return (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [storeData?.pricelistBrands]);

  if (!storeData) return null;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProducts} ads={storeData.ads?.screensaver || []} pamphlets={filteredCatalogs} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain" alt="" /> : <Store size={16} className="text-blue-500" />}
               <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold text-slate-300">
                  {deviceType === 'mobile' ? <Smartphone size={10} className="text-purple-500" /> : <ShieldCheck size={10} className="text-blue-500" />}
                  <span className="font-mono text-white tracking-wider truncate max-w-[60px]">{kioskId}</span>
               </div>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                    {isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}
                    <span className="text-[7px] md:text-[9px] font-black uppercase hidden sm:inline">{isCloudConnected ? getCloudProjectName() : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                    {deviceType === 'kiosk' && <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`p-1 rounded ${screensaverEnabled ? 'text-green-400 bg-green-900/30' : 'text-slate-500 bg-slate-800'}`}>{screensaverEnabled ? <MonitorPlay size={12} /> : <MonitorStop size={12} />}</button>}
                    <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}><ZoomOut size={12} /></button>
                </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={filteredCatalogs} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[8px] md:text-[10px]">
          <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Connected' : 'Offline'}</span></div>
          <div className="flex items-center gap-4">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter hidden md:inline">{currentShopName}</span>
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(null); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800"><RIcon size={12} /></button>}
              {lastSyncTime && <div className="flex items-center gap-1 font-bold"><RefreshCw size={8} /><span>{lastSyncTime}</span></div>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span></button>
          </div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0"><h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={28} className="text-green-600" /> Pricelists</h2><button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button></div>
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                       <div className="w-full md:w-1/3 bg-slate-50 overflow-y-auto grid grid-cols-3 md:flex md:flex-col border-r border-slate-200">
                           {pricelistBrands.map(brand => (
                               <button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex flex-col md:flex-row items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-l-green-500' : 'hover:bg-white'}`}>
                                   <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div>
                                   <span className={`font-bold text-[8px] md:text-sm uppercase ${selectedBrandForPricelist === brand.id ? 'text-slate-900' : 'text-slate-500'}`}>{brand.name}</span>
                               </button>
                           ))}
                       </div>
                       <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                           {selectedBrandForPricelist ? (
                               <div className="grid grid-cols-3 gap-2 md:gap-4">
                                   {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (
                                       <button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg border flex flex-col h-full relative transition-all ${isRecent(pl.dateAdded) ? 'border-yellow-400' : 'border-slate-200'}`}>
                                            <div className="aspect-[3/4] bg-white relative p-2">
                                                {pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">{pl.type === 'manual' ? <List size={24}/> : <FileText size={24} />}</div>}
                                                <div className={`absolute top-1 right-1 text-white text-[8px] font-bold px-1.5 py-0.5 rounded ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-500'}`}>{pl.type === 'manual' ? 'LIST' : 'PDF'}</div>
                                            </div>
                                            <div className="p-2 md:p-4 flex-1 flex flex-col">
                                                <h3 className="font-bold text-slate-900 text-[9px] md:text-sm uppercase leading-tight mb-1">{pl.title}</h3>
                                                <div className="mt-auto text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">{pl.month} {pl.year}</div>
                                            </div>
                                       </button>
                                   ))}
                               </div>
                           ) : <div className="h-full flex flex-col items-center justify-center text-slate-400"><RIcon size={48} className="opacity-20" /><p className="uppercase font-bold text-xs tracking-widest">Select a brand</p></div>}
                       </div>
                   </div>
               </div>
           </div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       {viewingManualList && <ManualPricelistViewer pricelist={viewingManualList} onClose={() => setViewingManualList(null)} />}
    </div>
  );
};
