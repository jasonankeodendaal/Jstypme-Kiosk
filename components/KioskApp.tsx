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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Image as ImageIcon } from 'lucide-react';
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
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const attemptOrientationLock = () => {
    if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
            console.debug("Orientation lock requires full-screen or persistent user gesture.");
        });
    }
};

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
                if (success) {
                    attemptOrientationLock();
                    onComplete();
                }
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
            <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border border-white/10">
                <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
                        <Store size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Kiosk Provisioning</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mt-1">Step {step} of 3</p>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Shop/Location Name</label>
                            <input 
                                autoFocus
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full p-4 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none font-bold text-lg transition-all"
                                placeholder="e.g. Waterfront Mall"
                            />
                            <p className="text-xs text-slate-400 font-medium italic">This name will appear in the fleet management dashboard.</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Display Profile</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'kiosk', label: 'Interactive Kiosk', icon: <Tablet size={20}/>, desc: 'Large touch display' },
                                    { id: 'mobile', label: 'Handheld Tablet', icon: <Smartphone size={20}/>, desc: 'Portable customer device' },
                                    { id: 'tv', label: 'TV Display Wall', icon: <Tv size={20}/>, desc: 'Passive video loop mode' }
                                ].map((type) => (
                                    <button 
                                        key={type.id}
                                        onClick={() => setDeviceType(type.id as any)}
                                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${deviceType === type.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`p-3 rounded-xl ${deviceType === type.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {type.icon}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 uppercase text-sm">{type.label}</div>
                                            <div className="text-xs text-slate-500 font-bold uppercase opacity-60 tracking-tighter">{type.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest text-center">Enter System PIN</label>
                            <input 
                                autoFocus
                                type="password"
                                maxLength={8}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full p-4 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none font-black text-3xl tracking-[1em] text-center transition-all"
                                placeholder="••••"
                            />
                            <p className="text-xs text-slate-400 font-bold uppercase text-center">Consult administrator for access</p>
                        </div>
                    )}

                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100 uppercase">{error}</div>}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-4 rounded-xl font-black uppercase text-xs text-slate-400 hover:text-slate-600 transition-colors">Back</button>
                    )}
                    <button 
                        onClick={handleNext}
                        disabled={isProcessing}
                        className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : step === 3 ? 'Complete Setup' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const KioskApp: React.FC<{ storeData: StoreData | null, lastSyncTime: string, onSyncRequest: () => void }> = ({ storeData, lastSyncTime, onSyncRequest }) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScreensaver, setIsScreensaver] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [configured, setConfigured] = useState(isKioskConfigured());
  const [isTV, setIsTV] = useState(getDeviceType() === 'tv');
  const [showPricelist, setShowPricelist] = useState(false);
  const [activePricelistBrand, setActivePricelistBrand] = useState<PricelistBrand | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [viewingCatalogue, setViewingCatalogue] = useState<Catalogue | null>(null);
  
  const activityTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!configured) return;

    const updateActivity = () => {
        setLastActivity(Date.now());
        if (isScreensaver) {
            attemptOrientationLock();
            setIsScreensaver(false);
        }
    };

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('keydown', updateActivity);
    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [isScreensaver, configured]);

  useEffect(() => {
    if (!configured || !storeData) return;
    const timeout = (storeData.screensaverSettings?.idleTimeout || 60) * 1000;
    
    if (activityTimer.current) window.clearTimeout(activityTimer.current);
    
    activityTimer.current = window.setTimeout(() => {
        setIsScreensaver(true);
        setSelectedBrand(null);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setShowPricelist(false);
        setCompareList([]);
        setShowComparison(false);
    }, timeout);

    return () => { if (activityTimer.current) window.clearTimeout(activityTimer.current); };
  }, [lastActivity, configured, storeData]);

  useEffect(() => {
    if (!configured) return;
    const interval = setInterval(async () => {
      const response = await sendHeartbeat();
      if (response?.deleted) {
          localStorage.clear();
          window.location.reload();
      }
      if (response?.restart) window.location.reload();
      if (response?.deviceType) setIsTV(response.deviceType === 'tv');
    }, 30000);
    return () => clearInterval(interval);
  }, [configured]);

  const allProducts = useMemo(() => {
    if (!storeData) return [];
    const products: FlatProduct[] = [];
    storeData.brands.forEach(brand => {
      brand.categories.forEach(category => {
        category.products.forEach(product => {
          products.push({ ...product, brandName: brand.name, categoryName: category.name });
        });
      });
    });
    return products;
  }, [storeData]);

  const handleToggleCompare = (product: Product) => {
      setCompareList(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
  };

  const activePricelists = useMemo(() => {
      if (!activePricelistBrand || !storeData?.pricelists) return [];
      return storeData.pricelists.filter(p => p.brandId === activePricelistBrand.id);
  }, [activePricelistBrand, storeData]);

  if (!storeData) return null;
  if (!configured) return <SetupScreen storeData={storeData} onComplete={() => setConfigured(true)} />;

  if (isScreensaver && !isTV) {
    return (
      <Screensaver 
        products={allProducts} 
        ads={storeData.ads?.screensaver || []} 
        pamphlets={storeData.catalogues}
        onWake={() => setIsScreensaver(false)} 
        settings={storeData.screensaverSettings}
      />
    );
  }

  if (isTV) {
      return (
          <TVMode 
              storeData={storeData} 
              onRefresh={onSyncRequest}
              screensaverEnabled={isScreensaver}
              onToggleScreensaver={() => setIsScreensaver(!isScreensaver)}
          />
      );
  }

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden animate-fade-in relative">
      <header className="bg-slate-900 text-white p-4 md:p-6 shadow-xl flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
           {storeData.companyLogoUrl ? (
               <img src={storeData.companyLogoUrl} className="h-8 md:h-12 w-auto object-contain cursor-pointer" onClick={() => { setSelectedBrand(null); setSelectedCategory(null); setSelectedProduct(null); setShowPricelist(false); }} alt="Company Logo" />
           ) : (
               <h1 className="text-xl md:text-3xl font-black uppercase tracking-widest cursor-pointer" onClick={() => { setSelectedBrand(null); setSelectedCategory(null); setSelectedProduct(null); setShowPricelist(false); }}>Kiosk Pro</h1>
           )}
           <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
           <div className="hidden md:flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{getShopName() || 'Standard Station'}</span>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
             <button onClick={() => setShowPricelist(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95">
                 <RIcon size={16} /> 
                 <span className="hidden sm:inline">Pricelists</span>
             </button>
             <button onClick={() => window.history.pushState({}, '', '/about')} className="bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-xl transition-all active:scale-95 border border-white/5">
                 <Info size={20} />
             </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {selectedProduct ? (
            <ProductDetail 
                product={selectedProduct} 
                onBack={() => setSelectedProduct(null)} 
                screensaverEnabled={isScreensaver}
                onToggleScreensaver={() => setIsScreensaver(!isScreensaver)}
            />
        ) : selectedCategory ? (
            <ProductList 
                category={selectedCategory} 
                brand={selectedBrand!}
                storeCatalogs={storeData.catalogues || []}
                onSelectProduct={setSelectedProduct} 
                onBack={() => setSelectedCategory(null)} 
                onViewCatalog={(pages) => setViewingCatalogue({ pages, title: 'Product Guide', type: 'pamphlet', id: 'temp' })}
                screensaverEnabled={isScreensaver}
                onToggleScreensaver={() => setIsScreensaver(!isScreensaver)}
                selectedForCompare={compareList}
                onToggleCompare={handleToggleCompare}
                onStartCompare={() => setShowComparison(true)}
            />
        ) : selectedBrand ? (
            <CategoryGrid 
                brand={selectedBrand} 
                storeCatalogs={storeData.catalogues}
                onSelectCategory={setSelectedCategory} 
                onViewCatalog={setViewingCatalogue}
                onBack={() => setSelectedBrand(null)} 
                screensaverEnabled={isScreensaver}
                onToggleScreensaver={() => setIsScreensaver(!isScreensaver)}
            />
        ) : (
            <BrandGrid 
                brands={storeData.brands} 
                heroConfig={storeData.hero}
                allCatalogs={storeData.catalogues}
                ads={storeData.ads}
                onSelectBrand={setSelectedBrand} 
                onViewGlobalCatalog={setViewingCatalogue}
                onExport={() => {}}
                screensaverEnabled={isScreensaver}
                onToggleScreensaver={() => setIsScreensaver(!isScreensaver)}
            />
        )}
      </main>

      {/* Comparison Modal */}
      {showComparison && (
          <div className="fixed inset-0 z-[150] bg-slate-900/98 backdrop-blur-xl flex flex-col p-4 md:p-12 animate-fade-in">
              <div className="flex justify-between items-center mb-8 text-white shrink-0">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20"><Layers size={28}/></div>
                      <div>
                          <h2 className="text-3xl font-black uppercase tracking-tighter">Model Comparison</h2>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{compareList.length} Units Side-by-Side</p>
                      </div>
                  </div>
                  <button onClick={() => setShowComparison(false)} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all active:rotate-90"><X size={32}/></button>
              </div>
              <div className="flex-1 overflow-x-auto pb-8">
                  <div className="flex gap-4 md:gap-8 min-w-max h-full">
                      {compareList.map(id => {
                          const p = allProducts.find(x => x.id === id);
                          if(!p) return null;
                          return (
                              <div key={id} className="w-[280px] md:w-[350px] bg-white rounded-[2rem] flex flex-col shadow-2xl overflow-hidden animate-fade-in group">
                                  <div className="aspect-square p-6 md:p-10 relative flex items-center justify-center bg-slate-50 border-b border-slate-100">
                                      <img src={p.imageUrl} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform" />
                                      <div className="absolute top-4 left-4 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.brandName}</div>
                                  </div>
                                  <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
                                      <div><h3 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">{p.name}</h3><div className="text-[10px] font-mono text-slate-400 uppercase font-bold">{p.sku}</div></div>
                                      <div className="space-y-4">
                                          {Object.entries(p.specs).map(([k,v]) => (
                                              <div key={k} className="border-b border-slate-50 pb-2">
                                                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{k}</span>
                                                  <span className="block text-sm font-bold text-slate-800">{v}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                                  <button onClick={() => { setSelectedProduct(p); setShowComparison(false); }} className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">View Full Details <ChevronRight size={16}/></button>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Pricelist Browser Modal */}
      {showPricelist && (
          <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-xl flex flex-col p-4 md:p-8 animate-fade-in">
              <div className="flex justify-between items-center mb-8 shrink-0">
                  <div className="flex items-center gap-4 text-white">
                      <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20"><RIcon size={28}/></div>
                      <div>
                          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Digital Pricelists</h2>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Select Brand to View Live Prices</p>
                      </div>
                  </div>
                  <button onClick={() => { setShowPricelist(false); setActivePricelistBrand(null); }} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all text-white"><X size={28}/></button>
              </div>

              {!activePricelistBrand ? (
                  <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                          {(storeData.pricelistBrands || []).map((brand) => (
                              <button key={brand.id} onClick={() => setActivePricelistBrand(brand)} className="bg-white hover:bg-blue-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 border border-white/10 group shadow-lg">
                                  <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center p-2">
                                      {brand.logoUrl ? <img src={brand.logoUrl} className="max-w-full max-h-full object-contain filter group-hover:grayscale-0" /> : <span className="text-3xl font-black text-slate-300">{brand.name.charAt(0)}</span>}
                                  </div>
                                  <span className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest text-center">{brand.name}</span>
                              </button>
                          ))}
                      </div>
                      {(storeData.pricelistBrands || []).length === 0 && (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                               <Package size={64} className="mb-4 opacity-20" />
                               <span className="font-bold uppercase tracking-widest">No pricelist data available</span>
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                      <button onClick={() => setActivePricelistBrand(null)} className="self-start flex items-center gap-2 text-blue-400 font-black uppercase text-xs tracking-widest mb-6 hover:text-blue-300 transition-colors bg-white/5 px-4 py-2 rounded-xl">
                          <ChevronLeft size={16} /> Back to Brands
                      </button>
                      <div className="flex-1 overflow-y-auto">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                              {activePricelists.map((item) => (
                                  <div key={item.id} className="bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all hover:scale-105 group border border-white/5">
                                      <div className="aspect-[3/4] bg-slate-50 relative p-4 flex items-center justify-center border-b border-slate-100">
                                          {item.thumbnailUrl ? (
                                              <img src={item.thumbnailUrl} className="w-full h-full object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform" />
                                          ) : (
                                              <FileText size={64} className="text-slate-200" />
                                          )}
                                          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-lg border border-white/10">{item.month} {item.year}</div>
                                          {isRecent(item.dateAdded) && <div className="absolute top-4 right-4 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-lg border border-white/10 animate-pulse">New</div>}
                                      </div>
                                      <div className="p-5 flex-1 flex flex-col">
                                          <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm md:text-base leading-none mb-4">{item.title}</h3>
                                          <div className="mt-auto space-y-2">
                                              {item.type === 'manual' ? (
                                                  <button onClick={() => { /* Modal for manual list */ alert("Manual list view placeholder"); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg"><List size={14}/> Open Table</button>
                                              ) : (
                                                  <button onClick={() => { if(item.url) window.open(item.url, '_blank'); }} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"><FileText size={14}/> Open PDF</button>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {viewingCatalogue && (
          <Flipbook pages={viewingCatalogue.pages || []} onClose={() => setViewingCatalogue(null)} catalogueTitle={viewingCatalogue.title}/>
      )}

      {/* SYNC INDICATOR */}
      <div className="fixed bottom-4 right-4 z-[200] pointer-events-none flex flex-col items-end gap-2">
          <div className="bg-slate-900/80 backdrop-blur-md text-slate-400 px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border border-white/5 flex items-center gap-2 shadow-2xl">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Synced: {lastSyncTime || 'Just now'}
          </div>
      </div>
    </div>
  );
};

export default KioskApp;
