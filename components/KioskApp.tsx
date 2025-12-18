
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
import { Store, RotateCcw, X, Loader2, Wifi, WifiOff, Clock, MapPin, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Check, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, ListOrdered, DollarSign, Settings } from 'lucide-react';

const DEFAULT_IDLE_TIMEOUT = 60000;

const isNew = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
};

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const ManualPricelistView = ({ pricelist, onClose }: { pricelist: Pricelist, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[110] bg-slate-950 flex flex-col animate-fade-in">
            <header className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-center shrink-0 border-b border-white/5 shadow-2xl">
                 <div className="flex items-center gap-6">
                     <div className="p-3 bg-green-600 rounded-2xl shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                         <RIcon size={32} className="text-white" />
                     </div>
                     <div>
                         <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">{pricelist.title}</h2>
                         <p className="text-blue-500 font-black uppercase tracking-widest text-xs md:text-sm mt-2">{pricelist.month} {pricelist.year}</p>
                     </div>
                 </div>
                 <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/10">
                     <X size={32} />
                 </button>
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-6xl mx-auto space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {(pricelist.manualItems || []).map((item) => (
                             <div key={item.id} className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:-translate-y-1 transition-all group">
                                 <div className="flex justify-between items-start mb-4">
                                     <div className="flex-1">
                                         {item.category && (
                                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">{item.category}</span>
                                         )}
                                         <h3 className="text-xl font-black text-slate-900 uppercase leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                     </div>
                                     <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-1.5 shrink-0">
                                         <DollarSign size={14} className="text-green-600" />
                                         <span className="text-xl font-black text-green-700 font-mono tracking-tight">{item.price}</span>
                                     </div>
                                 </div>
                                 <div className="h-1 w-12 bg-slate-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
                             </div>
                         ))}
                     </div>

                     {(!pricelist.manualItems || pricelist.manualItems.length === 0) && (
                         <div className="py-24 text-center text-slate-500 font-bold uppercase tracking-widest border-4 border-dashed border-slate-800 rounded-3xl">
                             No items found in this pricelist.
                         </div>
                     )}

                     <div className="bg-slate-900 p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white"><Clock size={24} /></div>
                             <div>
                                 <div className="text-white font-black uppercase text-lg">Daily Updates</div>
                                 <div className="text-slate-400 text-sm font-medium">Prices are subject to change without prior notice.</div>
                             </div>
                         </div>
                         <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-white font-mono font-bold">
                             REF: {pricelist.id.substring(0, 8).toUpperCase()}
                         </div>
                     </div>
                </div>
            </main>
            
            <footer className="bg-slate-900 p-6 text-center border-t border-white/5 shrink-0">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Consult Staff for Store Specific Discounts</p>
            </footer>
        </div>
    );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div 
    className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
    onClick={onClose}
  >
    <div 
      className={`relative w-full max-w-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
      style={{ 
        backgroundImage: 'url(https://i.ibb.co/dsh2c2hp/unnamed.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-popup-title"
    >
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-center">
        <div className="w-32 h-32 mb-2 hover:scale-105 transition-transform duration-500">
           <img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        <h2 id="creator-popup-title" className="text-white font-black text-3xl mb-1 drop-shadow-lg tracking-tight">JSTYP.me</h2>
        <p className="text-white/90 text-sm font-bold mb-4 drop-shadow-md italic max-w-[90%]">"Jason's Solution To Your Problems, Yes me!"</p>
        <p className="text-white text-xs font-bold mb-8 drop-shadow-md text-center px-4 leading-relaxed uppercase tracking-wide bg-black/40 rounded-lg py-2 border border-white/10">
            Need a website/ APP or a special tool, get in touch today!
        </p>
        <div className="flex items-center justify-center gap-8">
           <a href="https://wa.me/27695989427" target="_blank" rel="noreferrer" className="transition-transform hover:scale-125 duration-300" title="WhatsApp">
              <img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" className="w-12 h-12 object-contain drop-shadow-lg" alt="WhatsApp" />
           </a>
           <a href="mailto:jstypme@gmail.com" className="transition-transform hover:scale-125 duration-300" title="Email">
              <img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" className="w-12 h-12 object-contain drop-shadow-lg" alt="Email" />
           </a>
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-20 bg-black/40 p-1 rounded-full transition-colors" aria-label="Close creator information">
         <X size={20} />
      </button>
    </div>
  </div>
);

// SetupScreen component added to fix 'Cannot find name SetupScreen' error
const SetupScreen = ({ kioskId, onComplete, onRestoreId }: { kioskId: string, onComplete: (name: string, type: any) => void, onRestoreId: (id: string) => void }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'kiosk' | 'mobile' | 'tv'>('kiosk');
  const [restoreId, setRestoreId] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 uppercase mb-6 flex items-center gap-2">
          <Settings className="text-blue-600" /> Device Setup
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Device Name (Shop/Location)</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-3 bg-slate-100 rounded-xl outline-none focus:ring-2 ring-blue-500 font-bold"
              placeholder="e.g. Flagship Store Main"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Device Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['kiosk', 'mobile', 'tv'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t as any)}
                  className={`p-3 rounded-xl border-2 font-bold uppercase text-[10px] transition-all ${type === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button 
            disabled={!name}
            onClick={() => onComplete(name, type)}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            Register Device
          </button>
          
          <div className="pt-6 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Restore Existing ID</label>
            <div className="flex gap-2">
              <input 
                value={restoreId} 
                onChange={e => setRestoreId(e.target.value)} 
                className="flex-1 p-2 bg-slate-50 rounded-lg outline-none font-mono text-xs"
                placeholder="LOC-XXXXX"
              />
              <button onClick={() => onRestoreId(restoreId)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">Restore</button>
            </div>
          </div>
        </div>
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
        setActiveProduct(null);
        setActiveCategory(null);
        setActiveBrand(null);
        setShowFlipbook(false);
        setViewingPdf(null);
        setViewingManualList(null);
        setShowCreator(false);
        setShowPricelistModal(false);
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  useEffect(() => {
    if (!isSetup || !kioskId) return;
    initSupabase();
    if (!supabase) return;
    const channel = supabase.channel(`kiosk_commands_${kioskId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kiosks', filter: `id=eq.${kioskId}` },
          async (payload: any) => {
              if (payload.new.restart_requested) window.location.reload();
              if (payload.new.device_type && payload.new.device_type !== deviceType) {
                  localStorage.setItem('kiosk_pro_device_type', payload.new.device_type);
                  setDeviceTypeState(payload.new.device_type);
              }
          }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isSetup, kioskId, deviceType]);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    checkCloudConnection().then(setIsCloudConnected);
    const cloudInterval = setInterval(() => checkCloudConnection().then(setIsCloudConnected), 60000);
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
      return () => { clearInterval(interval); clearInterval(clockInterval); clearInterval(cloudInterval); };
    }
    return () => { clearInterval(clockInterval); clearInterval(cloudInterval); };
  }, [resetIdleTimer, isSetup, onSyncRequest]);

  const filteredCatalogs = useMemo(() => {
      if(!storeData?.catalogues) return [];
      const now = new Date();
      return storeData.catalogues.filter(c => !c.endDate || new Date(c.endDate) >= now);
  }, [storeData?.catalogues]);

  const allProducts = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData]);
  
  const pricelistBrands = useMemo(() => {
      if (!storeData?.pricelistBrands) return [];
      return [...storeData.pricelistBrands].sort((a, b) => a.name.localeCompare(b.name));
  }, [storeData]);

  if (!isSetup && kioskId) return <SetupScreen kioskId={kioskId} onComplete={(n:string, t:any) => completeKioskSetup(n, t).then(() => { setDeviceTypeState(t); setCurrentShopName(n); setIsSetup(true); })} onRestoreId={(id:string) => { setCustomKioskId(id); setKioskId(id); setDeviceTypeState(getDeviceType()); setCurrentShopName(getShopName()); setIsSetup(true); }} />;
  if (!storeData) return null;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProducts} ads={storeData.ads?.screensaver || []} pamphlets={filteredCatalogs} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain opacity-80" alt="" /> : <Store size={16} className="text-blue-500" />}
               <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold text-slate-300">
                  {deviceType === 'mobile' ? <Smartphone size={10} className="text-purple-500" /> : <ShieldCheck size={10} className="text-blue-500" />}
                  <span className="font-mono text-white tracking-wider truncate max-w-[60px]">{kioskId}</span>
               </div>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                    {isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}
                    <span className="text-[7px] md:text-[9px] font-black uppercase hidden sm:inline">{isCloudConnected ? getCloudProjectName() : 'Local'}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                    {deviceType === 'kiosk' && <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`p-1 rounded ${screensaverEnabled ? 'text-green-400 bg-green-900/30' : 'text-slate-500 bg-slate-800'}`}>{screensaverEnabled ? <MonitorPlay size={12} /> : <MonitorStop size={12} />}</button>}
                    <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold uppercase transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}>{zoomLevel === 1 ? <ZoomIn size={12} /> : <ZoomOut size={12} />}</button>
                </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={filteredCatalogs} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[8px] md:text-[10px]">
          <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</span></div>
          <div className="flex items-center gap-4">
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(null); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800"><RIcon size={12} /></button>}
              {lastSyncTime && <div className="flex items-center gap-1 font-bold"><RefreshCw size={8} /><span>Sync: {lastSyncTime}</span></div>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span><img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" className="w-2 h-2 object-contain opacity-50" alt="" /></button>
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
                                   <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center p-1 relative">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div>
                                   <span className={`font-bold text-[8px] md:text-sm uppercase ${selectedBrandForPricelist === brand.id ? 'text-slate-900' : 'text-slate-500'}`}>{brand.name}</span>
                               </button>
                           ))}
                       </div>
                       <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                           {selectedBrandForPricelist ? (
                               <div className="grid grid-cols-3 gap-2 md:gap-4">
                                   {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).sort((a,b) => parseInt(b.year) - parseInt(a.year)).map(pl => (
                                       <button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({ url: pl.url!, title: pl.title }); }} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg border border-slate-200 flex flex-col h-full"><div className="aspect-[3/4] bg-white relative p-2">{pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">{pl.type === 'manual' ? <ListOrdered size={32} /> : <FileText size={32} />}</div>}<div className={`absolute top-1 right-1 ${pl.type === 'manual' ? 'bg-blue-500' : 'bg-red-500'} text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm`}>{pl.type === 'manual' ? 'LIST' : 'PDF'}</div></div><div className="p-2 md:p-4 flex-1 flex flex-col"><h3 className="font-bold text-slate-900 text-[9px] md:text-sm uppercase leading-tight mb-1">{pl.title}</h3><div className="mt-auto text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">{pl.month} {pl.year}</div></div></button>
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
       {viewingManualList && <ManualPricelistView pricelist={viewingManualList} onClose={() => setViewingManualList(null)} />}
    </div>
  );
};
