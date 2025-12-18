
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand } from '../types';
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
  getCloudProjectName
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, RotateCcw, X, Loader2, Wifi, WifiOff, Clock, MapPin, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Check, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, Table, Tag } from 'lucide-react';

const DEFAULT_IDLE_TIMEOUT = 60000;

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} onClick={onClose}>
    <div className={`relative w-full max-w-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`} style={{ backgroundImage: 'url(https://i.ibb.co/dsh2c2hp/unnamed.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} onClick={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        <div className="w-32 h-32 mb-2"><img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" alt="Logo" className="w-full h-full object-contain" /></div>
        <h2 className="text-white font-black text-3xl mb-1 drop-shadow-lg">JSTYP.me</h2>
        <p className="text-white/90 text-sm font-bold mb-4 italic max-w-[90%]">"Jason's Solution To Your Problems, Yes me!"</p>
        <p className="text-white text-xs font-bold mb-8 drop-shadow-md text-center px-4 leading-relaxed uppercase tracking-wide bg-black/40 rounded-lg py-2 border border-white/10">Need a website/ APP or a special tool, get in touch today!</p>
        <div className="flex items-center justify-center gap-8">
           <a href="https://wa.me/27695989427" target="_blank" rel="noreferrer"><img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" className="w-12 h-12 object-contain" alt="WhatsApp" /></a>
           <a href="mailto:jstypme@gmail.com"><img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" className="w-12 h-12 object-contain" alt="Email" /></a>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/40 p-1 rounded-full"><X size={20} /></button>
    </div>
  </div>
);

const ManualPricelistView = ({ list, brandName }: { list: Pricelist, brandName: string }) => {
    return (
        <div className="flex flex-col h-full bg-white animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-slate-900 uppercase text-lg leading-tight">{list.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{brandName} • {list.month} {list.year}</p>
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    <Table size={12} /> Live Pricing
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-[10px] md:text-xs font-black uppercase text-slate-400 border-b-2 border-slate-100">
                            <th className="p-4 text-left">SKU</th>
                            <th className="p-4 text-left">Description</th>
                            <th className="p-4 text-right">Normal Price</th>
                            <th className="p-4 text-right">Promo Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(list.rows || []).map((row, idx) => (
                            <tr key={idx} className={`border-b border-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                <td className="p-4 text-xs font-mono font-bold text-slate-400 uppercase tracking-tighter">{row.sku || '-'}</td>
                                <td className="p-4 text-sm font-black text-slate-800 uppercase tracking-tight">{row.description}</td>
                                <td className={`p-4 text-right text-sm font-bold ${row.promoPrice ? 'text-slate-400 line-through decoration-red-400/50' : 'text-slate-900'}`}>
                                    {row.normalPrice}
                                </td>
                                <td className="p-4 text-right">
                                    {row.promoPrice ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-green-600 tracking-tighter leading-none">{row.promoPrice}</span>
                                            <span className="text-[8px] font-black uppercase text-green-500/50 tracking-widest">Promotion</span>
                                        </div>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!list.rows || list.rows.length === 0) && (
                    <div className="p-20 text-center text-slate-300 flex flex-col items-center gap-4">
                        <Tag size={48} className="opacity-20" />
                        <span className="font-bold uppercase text-xs tracking-widest">Pricing items coming soon</span>
                    </div>
                )}
            </div>
            <div className="p-4 bg-slate-900 text-white/50 text-[9px] font-bold uppercase text-center tracking-[0.2em]">
                All prices include VAT where applicable • Valid for {list.month} {list.year}
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
  const [deviceType, setDeviceTypeState] = useState(getDeviceType());
  const [currentShopName, setCurrentShopName] = useState(getShopName());
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
        setActiveProduct(null); setActiveCategory(null); setActiveBrand(null);
        setShowFlipbook(false); setViewingPdf(null); setShowCreator(false);
        setShowPricelistModal(false); setViewingManualList(null);
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    checkCloudConnection().then(setIsCloudConnected);
    resetIdleTimer();
    if (isSetup) {
      const syncCycle = async () => {
         const syncResult = await sendHeartbeat();
         if (syncResult) {
             if (syncResult.restart) window.location.reload();
             if (syncResult.deviceType) setDeviceTypeState(syncResult.deviceType as any);
             if (syncResult.name) setCurrentShopName(syncResult.name);
             if (onSyncRequest) onSyncRequest();
         }
      };
      syncCycle();
      const interval = setInterval(syncCycle, 60000);
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, onSyncRequest]);

  const allProducts = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData]);
  
  const pricelistBrands = useMemo(() => {
      if (!storeData?.pricelistBrands) return [];
      return [...storeData.pricelistBrands].sort((a, b) => a.name.localeCompare(b.name));
  }, [storeData]);

  if (!storeData) return null;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProducts} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain opacity-80" alt="" /> : <Store size={16} className="text-blue-500" />}
               <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-slate-300 truncate max-w-[120px]">
                  <ShieldCheck size={10} className="text-blue-500" /><span className="font-mono text-white tracking-wider">{kioskId}</span>
               </div>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                    {isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}
                    <span className="text-[7px] md:text-[9px] font-black uppercase hidden sm:inline">{isCloudConnected ? getCloudProjectName() : 'Local'}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                    {deviceType === 'kiosk' && <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`p-1 rounded ${screensaverEnabled ? 'text-green-400 bg-green-900/30' : 'text-slate-500 bg-slate-800'}`}>{screensaverEnabled ? <MonitorPlay size={12} /> : <MonitorStop size={12} />}</button>}
                    <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className="p-1 rounded text-blue-400 bg-blue-900/30"><ZoomIn size={12} /></button>
                </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[8px] md:text-[10px]">
          <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span></div>
          <div className="flex items-center gap-4">
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(null); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800"><RIcon size={12} /></button>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span><img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" className="w-2 h-2 object-contain opacity-50" alt="" /></button>
          </div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => { setShowPricelistModal(false); setViewingManualList(null); }}>
               <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={28} className="text-green-600" /> {viewingManualList ? 'Viewing Price Table' : 'Brand Pricelists'}</h2>
                        <div className="flex gap-2">
                            {viewingManualList && <button onClick={()=>setViewingManualList(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-black uppercase text-[10px] hover:bg-slate-300">Back</button>}
                            <button onClick={() => { setShowPricelistModal(false); setViewingManualList(null); }} className="p-2 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button>
                        </div>
                   </div>
                   {viewingManualList ? (
                       <ManualPricelistView list={viewingManualList} brandName={pricelistBrands.find(b=>b.id===viewingManualList.brandId)?.name || 'Brand'} />
                   ) : (
                       <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                           <div className="w-full md:w-1/3 bg-slate-50 overflow-y-auto grid grid-cols-3 md:flex md:flex-col border-r border-slate-200">
                               {pricelistBrands.map(brand => (
                                   <button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex flex-col md:flex-row items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-l-green-500' : 'hover:bg-white'}`}>
                                       <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center p-1">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div>
                                       <span className={`font-bold text-[8px] md:text-sm uppercase truncate ${selectedBrandForPricelist === brand.id ? 'text-slate-900' : 'text-slate-500'}`}>{brand.name}</span>
                                   </button>
                               ))}
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                               {selectedBrandForPricelist ? (
                                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                       {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).sort((a,b) => parseInt(b.year) - parseInt(a.year)).map(pl => (
                                           <button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({ url: pl.url!, title: pl.title }); }} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg border border-slate-200 flex flex-col h-full">
                                               <div className="aspect-[3/4] bg-slate-50 relative p-2 flex items-center justify-center">
                                                   {pl.type === 'manual' ? <Table size={48} className="text-green-500/20" /> : pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain" /> : <FileText size={32} className="text-slate-200" />}
                                                   <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${pl.type === 'manual' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>{pl.type === 'manual' ? 'LIVE' : 'PDF'}</div>
                                               </div>
                                               <div className="p-3 flex-1 flex flex-col">
                                                   <h3 className="font-bold text-slate-900 text-[9px] md:text-xs uppercase leading-tight mb-1">{pl.title}</h3>
                                                   <div className="mt-auto text-[8px] font-bold text-slate-400 uppercase">{pl.month} {pl.year}</div>
                                               </div>
                                           </button>
                                       ))}
                                   </div>
                               ) : <div className="h-full flex flex-col items-center justify-center text-slate-400"><RIcon size={48} className="opacity-20" /><p className="uppercase font-bold text-xs tracking-widest mt-4">Select a brand to view price lists</p></div>}
                           </div>
                       </div>
                   )}
               </div>
           </div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
    </div>
  );
};
