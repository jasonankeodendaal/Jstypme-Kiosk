
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download } from 'lucide-react';

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

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-12 animate-fade-in print:bg-white print:p-0" onClick={onClose}>
      <style>{`
        @media print {
          @page { size: auto; margin: 15mm; }
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .print-only { display: flex !important; }
          .viewer-container { 
            position: relative !important; 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            height: auto !important;
            overflow: visible !important;
          }
          .table-scroll { overflow: visible !important; height: auto !important; padding: 0 !important; }
          .print-table { width: 100% !important; display: table !important; border-collapse: collapse !important; }
          .print-table tr { display: table-row !important; border-bottom: 1px solid #e2e8f0 !important; }
          .print-table td, .print-table th { display: table-cell !important; padding: 10px !important; }
          .card-view { display: none !important; }
        }
        .shrink-text { font-size: clamp(8px, 1.2vw, 14px); line-height: 1.1; }
        .price-text { font-size: clamp(10px, 1.8vw, 24px); }
      `}</style>

      <div className={`viewer-container relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none ${isNewlyUpdated ? 'ring-4 ring-yellow-400 print:ring-0' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* Screen-Only Header */}
        <div className={`print-hidden p-4 md:p-6 text-white flex justify-between items-center shrink-0 border-b border-white/5 ${isNewlyUpdated ? 'bg-yellow-600' : 'bg-slate-900'}`}>
          <div>
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-sm md:text-3xl font-black uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{pricelist.title}</h2>
              {isNewlyUpdated && <span className="bg-white text-yellow-700 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase flex items-center gap-1 shadow-lg shrink-0"><Sparkles size={10} /> NEW</span>}
            </div>
            <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-blue-400'} font-bold uppercase tracking-widest text-[10px] md:text-sm`}>{pricelist.month} {pricelist.year}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
             <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white text-slate-900 px-3 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-50 transition-all active:scale-95"
             >
                <Printer size={14} /> <span className="hidden sm:inline">Print / Save PDF</span>
             </button>
             <button onClick={onClose} className="p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={20}/></button>
          </div>
        </div>

        {/* Print-Only Professional Header */}
        <div className="hidden print-only print:flex items-center justify-between p-8 border-b-4 border-slate-900 mb-8 w-full">
            <div className="w-1/4 flex justify-start">
                {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="h-20 object-contain" />
                ) : (
                    <div className="h-20 w-20 bg-slate-900 text-white flex items-center justify-center font-black rounded-xl text-center">LOGO</div>
                )}
            </div>
            
            <div className="flex-1 text-center px-4">
                <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">{pricelist.title}</h1>
                <div className="h-1 w-24 bg-blue-600 mx-auto mb-2"></div>
                <p className="text-lg font-bold text-slate-600 uppercase tracking-[0.3em]">{pricelist.month} {pricelist.year}</p>
            </div>

            <div className="w-1/4 flex justify-end">
                {brandLogo ? (
                    <img src={brandLogo} alt="Brand Logo" className="h-20 object-contain" />
                ) : (
                    <div className="h-20 w-20 border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs rounded-xl uppercase text-center">Brand</div>
                )}
            </div>
        </div>

        {/* Side-by-Side Content Area */}
        <div className="table-scroll flex-1 overflow-auto bg-slate-50">
          
          {/* Card View (Mobile/Tablet Side-by-Side) */}
          <div className="print:hidden grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-2 md:p-6 card-view">
             {(pricelist.items || []).map((item) => (
                <div key={item.id} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                   <div className="mb-2">
                       <span className="block text-[7px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">{item.sku || 'NO SKU'}</span>
                       <h4 className="font-bold text-slate-900 shrink-text uppercase tracking-tight mt-1 line-clamp-3">{item.description}</h4>
                   </div>
                   <div className="mt-3 pt-3 border-t border-slate-100">
                       {item.normalPrice && (
                           <span className="block text-[8px] md:text-[10px] font-bold text-slate-400 line-through decoration-red-500/30 mb-0.5">WAS: {item.normalPrice}</span>
                       )}
                       <span className="block font-black text-red-600 price-text uppercase tracking-tighter leading-none">{item.promoPrice || item.normalPrice || 'POA'}</span>
                   </div>
                </div>
             ))}
          </div>

          {/* Hidden Table for Printing */}
          <table className="hidden print-table w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">SKU</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Description</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right">Normal Price</th>
                <th className="p-4 text-xs font-black text-red-500 uppercase tracking-widest border-b border-slate-200 text-right">Promo Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pricelist.items || []).map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-mono font-bold text-sm text-slate-500 uppercase">{item.sku || '-'}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{item.description}</td>
                  <td className="p-4 font-bold text-slate-400 line-through text-right">{item.normalPrice}</td>
                  <td className="p-4 font-black text-xl text-red-600 text-right">{item.promoPrice || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 bg-white border-t border-slate-100 text-center shrink-0">
          <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Valid for {pricelist.month} {pricelist.year} • Prices subject to change and stock availability.
          </p>
          <p className="hidden print:block text-[8px] text-slate-300 mt-2 font-bold uppercase tracking-widest">Generated by Kiosk Pro System • Digital Showcase Document</p>
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

  // Handle Setup Prompt
  if (!isSetup) {
      return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  }

  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  const getActiveBrandLogo = () => {
      if (!viewingManualList) return undefined;
      return pricelistBrands.find(b => b.id === viewingManualList.brandId)?.logoUrl;
  };

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProducts} ads={storeData.ads?.screensaver || []} pamphlets={filteredCatalogs} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
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
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={filteredCatalogs} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={filteredCatalogs} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[8px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Connected' : 'Offline'}</span></div>
          <div className="flex items-center gap-4">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter hidden md:inline">{currentShopName}</span>
              {pricelistBrands.length > 0 && <button onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} className="text-blue-600 hover:text-blue-800"><RIcon size={12} /></button>}
              {lastSyncTime && <div className="flex items-center gap-1 font-bold"><RefreshCw size={8} /><span>{lastSyncTime}</span></div>}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span></button>
          </div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in print:hidden" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <h2 className="text-base md:text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2>
                      <button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full transition-colors hover:bg-slate-200"><X size={24} className="text-slate-500" /></button>
                   </div>
                   <div className="flex-1 overflow-hidden flex flex-row">
                       {/* Permanent Side-by-Side Brand Selector */}
                       <div className="w-16 md:w-1/3 bg-slate-50 overflow-y-auto flex flex-col border-r border-slate-200 no-scrollbar">
                           {pricelistBrands.map(brand => (
                               <button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-2 md:p-4 transition-colors flex flex-col md:flex-row items-center gap-2 md:gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-r-4 md:border-r-0 md:border-l-4 border-green-500' : 'hover:bg-white'}`}>
                                   <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                      {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-xs">{brand.name.charAt(0)}</span>}
                                   </div>
                                   <span className={`font-black text-[7px] md:text-sm uppercase text-center md:text-left leading-tight ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-400'}`}>{brand.name}</span>
                               </button>
                           ))}
                       </div>
                       
                       {/* Pricelists Grid */}
                       <div className="flex-1 overflow-y-auto p-2 md:p-6 bg-slate-100/50">
                           {selectedBrandForPricelist ? (
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                   {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (
                                       <button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-slate-200'}`}>
                                            <div className="aspect-[3/4] bg-white relative p-2 md:p-3">
                                                {pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded-md" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">{pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}</div>}
                                                <div className={`absolute top-1.5 right-1.5 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-500'}`}>{pl.type === 'manual' ? 'LIST' : 'PDF'}</div>
                                            </div>
                                            <div className="p-2 md:p-4 flex-1 flex flex-col bg-slate-50/50">
                                                <h3 className="font-black text-slate-900 text-[9px] md:text-sm uppercase leading-tight mb-1 line-clamp-2">{pl.title}</h3>
                                                <div className="mt-auto flex justify-between items-center">
                                                   <div className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{pl.month} {pl.year}</div>
                                                   {isRecent(pl.dateAdded) && <div className="text-[7px] font-black text-yellow-600 uppercase">RECENT</div>}
                                                </div>
                                            </div>
                                       </button>
                                   ))}
                                   {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).length === 0 && (
                                       <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                                           <FileText size={48} className="opacity-10" />
                                           <p className="uppercase font-bold text-[10px] tracking-widest">No pricelists for this brand</p>
                                       </div>
                                   )}
                               </div>
                           ) : <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2"><RIcon size={48} className="opacity-10" /><p className="uppercase font-black text-[10px] tracking-widest">Choose a brand</p></div>}
                       </div>
                   </div>
               </div>
           </div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       {viewingManualList && (
          <ManualPricelistViewer 
            pricelist={viewingManualList} 
            onClose={() => setViewingManualList(null)} 
            companyLogo={storeData.companyLogoUrl}
            brandLogo={getActiveBrandLogo()}
          />
       )}
    </div>
  );
};
