
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
  verifyKioskIdentity
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, RotateCcw, X, Loader2, Wifi, WifiOff, Clock, MapPin, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Check, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Zap } from 'lucide-react';

const DEFAULT_IDLE_TIMEOUT = 60000;

const isNew = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7; // Highlight if changed in last 7 days
};

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const ManualPricelistViewer = ({ pricelist, onClose }: { pricelist: Pricelist, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">{pricelist.title}</h2>
               {isNew(pricelist.dateAdded) && (
                   <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                       <Zap size={10} fill="currentColor" /> NEWLY UPDATED
                   </span>
               )}
            </div>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs md:text-sm">{pricelist.month} {pricelist.year}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Normal Price</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-red-500">Promo Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pricelist.items || []).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-sm text-slate-500 uppercase">{item.sku || '-'}</td>
                  <td className="p-4 font-bold text-slate-900">{item.description}</td>
                  <td className="p-4 font-black text-lg text-slate-400 line-through decoration-red-500/30">{item.normalPrice}</td>
                  <td className="p-4 font-black text-2xl text-red-600">{item.promoPrice || '-'}</td>
                </tr>
              ))}
              {(!pricelist.items || pricelist.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">No items found in this pricelist.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid for {pricelist.month} {pricelist.year} • Prices subject to change without notice</p>
        </div>
      </div>
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

export const SetupScreen = ({ kioskId, onComplete, onRestoreId }: any) => {
  const [shopName, setShopName] = useState('');
  const [deviceType, setDeviceType] = useState<'kiosk' | 'mobile' | 'tv'>('kiosk');
  const [inputPin, setInputPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoreMode, setIsRestoreMode] = useState(false);
  const [customId, setCustomId] = useState('');
  const [globalPin, setGlobalPin] = useState<string>('0000');
  const [pinError, setPinError] = useState(false);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    document.body.classList.add('allow-landscape');
    return () => document.body.classList.remove('allow-landscape');
  }, []);

  useEffect(() => {
      const fetchGlobalPin = async () => {
          initSupabase();
          if (supabase) {
              const { data, error } = await supabase.from('store_config').select('data').eq('id', 1).single();
              if (!error && data?.data?.systemSettings?.setupPin) {
                  setGlobalPin(data.data.systemSettings.setupPin);
              }
          }
      };
      fetchGlobalPin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;
    if (inputPin !== globalPin) {
        setPinError(true);
        return;
    }
    setIsSubmitting(true);
    if(isRestoreMode && customId.trim()) onRestoreId(customId.trim());
    await new Promise(r => setTimeout(r, 800));
    onComplete(shopName, deviceType);
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-10 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-yellow-400"></div>
        <div className="mb-8 text-center">
           <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600"><Store size={32} /></div>
           <h1 className="text-3xl font-black text-slate-900 mb-2">Device Setup</h1>
           <p className="text-slate-500">Initialize this device for your location.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-3 gap-2">
             <button type="button" onClick={() => setDeviceType('kiosk')} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${deviceType === 'kiosk' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}><Tablet size={24} /><span className="text-[10px] font-black uppercase tracking-wider">Kiosk</span></button>
             <button type="button" onClick={() => setDeviceType('mobile')} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${deviceType === 'mobile' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}><Smartphone size={24} /><span className="text-[10px] font-black uppercase tracking-wider">Mobile</span></button>
             <button type="button" onClick={() => setDeviceType('tv')} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${deviceType === 'tv' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}><Tv size={24} /><span className="text-[10px] font-black uppercase tracking-wider">TV Mode</span></button>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
             <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned ID</span><button type="button" onClick={() => setIsRestoreMode(!isRestoreMode)} className="text-[10px] text-blue-600 font-bold uppercase hover:underline flex items-center gap-1"><RotateCcw size={10} /> {isRestoreMode ? 'Cancel Restore' : 'Restore Device'}</button></div>
             {isRestoreMode ? <input type="text" value={customId} onChange={(e) => setCustomId(e.target.value)} placeholder="Enter ID" className="w-full font-mono font-bold text-slate-700 bg-white px-3 py-2 rounded border border-blue-300 outline-none text-lg text-center" /> : <span className="font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded border border-slate-200 text-lg block text-center">{kioskId}</span>}
          </div>
          <div className="mb-4"><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Shop / Location Name</label><input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. Downtown Mall" className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-lg text-slate-900" /></div>
          <div className="mb-6 relative"><label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex items-center gap-1">Setup Security PIN <Lock size={12} className="text-slate-400"/></label><input type="password" value={inputPin} onChange={(e) => { setInputPin(e.target.value); setPinError(false); }} placeholder="####" maxLength={8} className={`w-full p-4 bg-white border-2 rounded-xl outline-none font-bold text-lg tracking-widest text-center ${pinError ? 'border-red-500 text-red-600' : 'border-slate-200 focus:border-blue-500'}`} />{pinError && <p className="text-red-500 text-xs font-bold mt-1 text-center">Incorrect PIN.</p>}</div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Complete Setup'}</button>
        </form>
        <button onClick={() => setShowCreator(true)} className="absolute bottom-4 left-4 p-2 opacity-50 hover:opacity-100 transition-opacity"><img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" className="w-4 h-4 object-contain grayscale" alt="" /></button>
      </div>
      <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
    </div>
  );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [isVerifying, setIsVerifying] = useState(true);
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

  // STRICT IDENTITY VERIFICATION ON BOOT
  useEffect(() => {
      const verify = async () => {
          if (isSetup && kioskId) {
              const exists = await verifyKioskIdentity(kioskId);
              if (!exists) {
                  console.warn("Unrecognized Device ID. Reverting to setup.");
                  localStorage.removeItem('kiosk_pro_device_id');
                  localStorage.removeItem('kiosk_pro_shop_name');
                  setIsSetup(false);
              } else {
                  setCurrentShopName(getShopName());
                  setDeviceTypeState(getDeviceType());
              }
          }
          setIsVerifying(false);
      };
      verify();
  }, [isSetup, kioskId]);

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
    return () => { clearInterval(clockInterval); clearInterval(clockInterval); };
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

  if (isVerifying) return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (!isSetup && kioskId) return <SetupScreen kioskId={kioskId} onComplete={(n:string, t:any) => completeKioskSetup(n, t).then(() => { setDeviceTypeState(t); setCurrentShopName(n); setIsSetup(true); })} onRestoreId={(id:string) => { setCustomKioskId(id); setKioskId(id); setDeviceTypeState(getDeviceType()); setCurrentShopName(getShopName()); setIsSetup(true); }} />;
  if (!storeData) return null;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  const handleOpenPricelist = (pl: Pricelist) => {
    if (pl.type === 'manual') {
      setViewingManualList(pl);
    } else {
      setViewingPdf({ url: pl.url, title: pl.title });
    }
  };

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
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(null); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800 relative"><RIcon size={12} />{storeData.pricelists?.some(pl => isNew(pl.dateAdded)) && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}</button>}
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
                           {pricelistBrands.map(brand => {
                               const hasNew = storeData.pricelists?.some(p => p.brandId === brand.id && isNew(p.dateAdded));
                               return (
                               <button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex flex-col md:flex-row items-center gap-3 border-b border-slate-100 relative ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-l-green-500' : 'hover:bg-white'}`}>
                                   <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center p-1 relative">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300">{brand.name.charAt(0)}</span>}</div>
                                   <span className={`font-bold text-[8px] md:text-sm uppercase ${selectedBrandForPricelist === brand.id ? 'text-slate-900' : 'text-slate-500'}`}>{brand.name}</span>
                                   {hasNew && <span className="absolute top-2 right-2 bg-red-500 text-white text-[6px] font-black px-1 rounded-full animate-pulse">NEW</span>}
                               </button>
                               );
                           })}
                       </div>
                       <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                           {selectedBrandForPricelist ? (
                               <div className="grid grid-cols-3 gap-2 md:gap-4">
                                   {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).sort((a,b) => parseInt(b.year) - parseInt(a.year)).map(pl => (
                                       <button key={pl.id} onClick={() => handleOpenPricelist(pl)} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg border border-slate-200 flex flex-col h-full relative group">
                                           <div className="aspect-[3/4] bg-white relative p-2">
                                               {pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">{pl.type === 'manual' ? <List size={24}/> : <FileText size={24} />}</div>}
                                               <div className={`absolute top-1 right-1 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-500'}`}>{pl.type === 'manual' ? 'LIST' : 'PDF'}</div>
                                               {isNew(pl.dateAdded) && <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">NEW</div>}
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
