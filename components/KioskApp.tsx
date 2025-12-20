
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Search, BookOpen, ArrowRight } from 'lucide-react';

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

// --- NEW COMPONENT: SETUP SCREEN ---
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
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-xl mb-4">
                            <Store size={32} />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Device Provisioning</h1>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Kiosk Pro v2.8 • System Initialization</p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {/* Stepper */}
                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'w-10 bg-blue-600' : 'w-3 bg-slate-200'}`}></div>
                        ))}
                    </div>

                    <div className="min-h-[180px]">
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 01: Location Identity</label>
                                <h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">What is the name of this shop or zone?</h2>
                                <input 
                                    autoFocus
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-base text-slate-900 transition-all uppercase placeholder:normal-case shadow-sm"
                                    placeholder="e.g. Waterfront Mall - Tech Hub"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 02: Hardware Profile</label>
                                <h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">Select the primary display type.</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 'kiosk', icon: <Tablet size={20}/>, label: 'Kiosk', desc: 'Interactive Stand' },
                                        { id: 'mobile', icon: <Smartphone size={20}/>, label: 'Mobile', desc: 'Handheld Unit' },
                                        { id: 'tv', icon: <Tv size={20}/>, label: 'TV Wall', desc: 'Non-Interactive' }
                                    ].map(type => (
                                        <button 
                                            key={type.id}
                                            onClick={() => setDeviceType(type.id as any)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group ${deviceType === type.id ? 'bg-blue-50 border-blue-600 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className={`${deviceType === type.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{type.icon}</div>
                                            <div className={`font-black uppercase text-[10px] ${deviceType === type.id ? 'text-blue-600' : 'text-slate-900'}`}>{type.label}</div>
                                            <div className="text-[8px] font-bold text-slate-400 uppercase">{type.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in text-center">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 03: Security Authorization</label>
                                <h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">Enter System Setup PIN</h2>
                                <div className="max-w-[200px] mx-auto">
                                    <input 
                                        autoFocus
                                        type="password"
                                        maxLength={8}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono font-bold text-2xl text-center tracking-[0.5em] text-slate-900 transition-all shadow-sm"
                                        placeholder="****"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                    />
                                </div>
                                <p className="text-slate-400 text-[10px] font-medium mt-3">Required to register device with Cloud Fleet</p>
                            </div>
                        )}
                    </div>

                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 border border-red-100"><X size={14}/> {error}</div>}

                    <div className="mt-8 flex gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Back</button>
                        )}
                        <button 
                            onClick={handleNext}
                            disabled={isProcessing}
                            className="flex-1 bg-slate-900 text-white p-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={14} /> Syncing...</>
                            ) : (
                                <>{step === 3 ? 'Complete Setup' : 'Continue'} <ChevronRight size={14} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManualPricelistViewer = ({ pricelist, onClose }: { pricelist: Pricelist, onClose: () => void }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={onClose}>
      <div className={`relative w-full max-w-6xl h-full max-h-[85vh] bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border-2 ${isNewlyUpdated ? 'border-yellow-400' : 'border-slate-200'}`} onClick={e => e.stopPropagation()}>
        
        {/* Header - Compact */}
        <div className={`px-6 py-5 text-white flex justify-between items-center shrink-0 ${isNewlyUpdated ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' : 'bg-slate-900'}`}>
          <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-xl">
                  <List size={20} />
              </div>
              <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">{pricelist.title}</h2>
                  <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-blue-400'} font-bold uppercase tracking-widest text-[9px] mt-1`}>{pricelist.month} {pricelist.year}</p>
              </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <X size={24}/>
          </button>
        </div>

        {/* Content Area - Denser Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pricelist.items || []).map((item) => (
                  <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition-all flex flex-col justify-between group ${isNewlyUpdated ? 'ring-1 ring-yellow-100' : ''}`}>
                      <div>
                          <div className="flex justify-between items-start mb-3">
                              <span className="text-[8px] font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.sku || 'N/A'}</span>
                          </div>
                          <h4 className="text-sm md:text-base font-black text-slate-800 uppercase leading-tight line-clamp-2 mb-4">{item.description}</h4>
                      </div>
                      
                      <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                          <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Normal</p>
                              <p className="text-base font-bold text-slate-400 line-through">{item.normalPrice}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 justify-end">Promo</p>
                              <p className="text-2xl font-black text-red-600 tracking-tighter">{item.promoPrice || item.normalPrice}</p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Prices valid for {pricelist.month} {pricelist.year} • E&OE</p>
          <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold uppercase text-[10px] hover:bg-blue-600 transition-all">Close</button>
        </div>
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
  const [pricelistSearch, setPricelistSearch] = useState('');

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
      const interval = setInterval(syncCycle, 30000); 
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

  // Duplicated brands for "Infinite" scroll feel
  const loopingBrands = useMemo(() => {
      if (pricelistBrands.length === 0) return [];
      // Triple the list to ensure there's always plenty to scroll
      return [...pricelistBrands, ...pricelistBrands, ...pricelistBrands];
  }, [pricelistBrands]);

  const filteredPricelists = useMemo(() => {
      if (!selectedBrandForPricelist) return [];
      let lists = storeData?.pricelists?.filter(p => p.brandId === selectedBrandForPricelist) || [];
      if (pricelistSearch.trim()) {
          const s = pricelistSearch.toLowerCase();
          lists = lists.filter(l => l.title.toLowerCase().includes(s) || l.month.toLowerCase().includes(s) || l.year.includes(s));
      }
      return lists;
  }, [selectedBrandForPricelist, storeData?.pricelists, pricelistSearch]);

  if (!storeData) return null;

  if (!isSetup) {
      return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  }

  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProducts} ads={storeData.ads?.screensaver || []} pamphlets={filteredCatalogs} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain" alt="" /> : <Store size={16} className="text-blue-50" />}
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
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0].id); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800 transition-transform active:scale-90"><RIcon size={12} /></button>}
              {lastSyncTime && <div className="flex items-center gap-1 font-bold"><RefreshCw size={8} /><span>{lastSyncTime}</span></div>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span></button>
          </div>
       </footer>

       {/* REDESIGNED COMPACT PRICELIST CENTER */}
       {showPricelistModal && (
           <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-white rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
                   {/* Modal Header - Compact */}
                   <div className="p-5 md:p-8 flex items-center justify-between bg-slate-900 shrink-0">
                       <div className="flex items-center gap-4">
                           <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                               <RIcon size={20} className="text-white" />
                           </div>
                           <div>
                               <h2 className="text-xl md:text-3xl font-black uppercase text-white tracking-tight leading-none">Document Center</h2>
                               <p className="text-blue-400 font-bold uppercase tracking-widest text-[8px] mt-1">Retail Asset Repository</p>
                           </div>
                       </div>
                       <button onClick={() => setShowPricelistModal(false)} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                           <X size={24} />
                       </button>
                   </div>

                   <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
                       {/* Compact Sidebar - 3 Rows vertical layout with scrolling */}
                       <div className="w-full md:w-48 bg-slate-50 border-r border-slate-100 overflow-y-auto shrink-0 p-3 no-scrollbar">
                           <div className="grid grid-cols-3 md:grid-cols-3 gap-1 content-start">
                               {loopingBrands.map((brand, idx) => (
                                   <button 
                                       key={`${brand.id}-${idx}`} 
                                       onClick={() => setSelectedBrandForPricelist(brand.id)} 
                                       className={`aspect-square p-2 rounded-xl transition-all flex items-center justify-center border-2 ${selectedBrandForPricelist === brand.id ? 'bg-blue-600 border-blue-400 shadow-md ring-2 ring-blue-500/20' : 'bg-white border-transparent hover:border-slate-200'}`}
                                       title={brand.name}
                                   >
                                       <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                           {brand.logoUrl ? (
                                               <img src={brand.logoUrl} className={`w-full h-full object-contain ${selectedBrandForPricelist === brand.id ? 'brightness-0 invert' : ''}`} alt={brand.name} />
                                           ) : (
                                               <span className={`font-black text-[10px] uppercase ${selectedBrandForPricelist === brand.id ? 'text-white' : 'text-slate-400'}`}>{brand.name.charAt(0)}</span>
                                           )}
                                       </div>
                                   </button>
                               ))}
                           </div>
                           <div className="h-4 w-full shrink-0"></div> {/* Spacer for scroll feel */}
                       </div>

                       {/* Compact List View - Denser grid and shrink-to-fit labels */}
                       <div className="flex-1 bg-white flex flex-col min-w-0">
                           <div className="p-4 md:p-6 flex items-center justify-between gap-4 shrink-0 border-b border-slate-50">
                               <div className="relative flex-1 group">
                                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                   <input 
                                       type="text" 
                                       placeholder="Filter catalogs..." 
                                       className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-slate-900 text-[10px] font-bold outline-none focus:border-blue-500/50 transition-all"
                                       value={pricelistSearch}
                                       onChange={(e) => setPricelistSearch(e.target.value)}
                                   />
                               </div>
                           </div>

                           <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
                               {selectedBrandForPricelist ? (
                                   filteredPricelists.length > 0 ? (
                                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 items-start">
                                           {filteredPricelists.map(pl => {
                                               const recent = isRecent(pl.dateAdded);
                                               return (
                                               <button 
                                                    key={pl.id} 
                                                    onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} 
                                                    className={`group relative bg-white rounded-2xl overflow-hidden border transition-all flex flex-col hover:shadow-xl hover:-translate-y-1 shadow-sm ${recent ? 'border-yellow-200 ring-1 ring-yellow-400/30' : 'border-slate-100'}`}
                                               >
                                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-50">
                                                        {pl.thumbnailUrl ? (
                                                            <img src={pl.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                        ) : (
                                                            <div className="text-slate-300">
                                                                {pl.type === 'manual' ? <List size={24} /> : <FileText size={24} />}
                                                            </div>
                                                        )}
                                                        <div className={`absolute top-1.5 right-1.5 text-white text-[6px] font-black uppercase px-1.5 py-0.5 rounded backdrop-blur-md ${pl.type === 'manual' ? 'bg-blue-600/80' : 'bg-red-600/80'}`}>
                                                            {pl.type === 'manual' ? 'Table' : 'PDF'}
                                                        </div>
                                                        {recent && <div className="absolute bottom-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-[6px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">New</div>}
                                                    </div>
                                                    <div className="p-3 text-left">
                                                        <h3 className="font-black text-slate-800 text-[9px] uppercase leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">{pl.title}</h3>
                                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{pl.month} {pl.year}</span>
                                                    </div>
                                               </button>
                                           )})}
                                       </div>
                                   ) : (
                                       <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                           <Search size={32} className="opacity-20 mb-2" />
                                           <p className="uppercase font-bold text-[10px] tracking-widest">No matching results</p>
                                       </div>
                                   )
                               ) : (
                                   <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center p-8">
                                       <RIcon size={48} className="opacity-10 mb-4" />
                                       <p className="uppercase font-black text-[10px] tracking-widest leading-relaxed">Select brand to browse technical catalogs</p>
                                   </div>
                               )}
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       )}

       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       {viewingManualList && <ManualPricelistViewer pricelist={viewingManualList} onClose={() => setViewingManualList(null)} />}
    </div>
  );
};
