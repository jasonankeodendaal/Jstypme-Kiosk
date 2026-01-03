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
  tryRecoverIdentity
} from '../services/kioskService';
import { performSemanticSearch, compareProductsWithAI } from '../services/geminiService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomOut, Tv, FileText, Monitor, List, Sparkles, ChevronRight, LayoutGrid, Search, Filter, Layers, Package, Tag, Activity, Globe, MessageSquare, Bot } from 'lucide-react';
import { jsPDF } from 'jspdf';

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 21V3h7a5 5 0 0 1 0 10H7" /><path d="M13 13l5 8" /><path d="M10 8h4" /></svg>
);

const SearchModal = ({ storeData, onClose, onSelectProduct, productsFlat }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void, productsFlat: FlatProduct[] }) => {
    const [query, setQuery] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiResults, setAiResults] = useState<string[] | null>(null);

    const literalResults = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        return productsFlat.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))).slice(0, 10);
    }, [query, productsFlat]);

    const handleAISearch = async () => {
        if (!query.trim()) return;
        setIsAILoading(true);
        const ids = await performSemanticSearch(query, productsFlat);
        setAiResults(ids);
        setIsAILoading(false);
    };

    const finalResults = useMemo(() => {
        if (aiResults) {
            return productsFlat.filter(p => aiResults.includes(p.id));
        }
        return literalResults;
    }, [aiResults, literalResults, productsFlat]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/98 backdrop-blur-2xl flex flex-col animate-fade-in p-6 md:p-12" onClick={onClose}>
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
                <div className="relative mb-12">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8" />
                    <input autoFocus type="text" placeholder="Search by name, feature or intent..." className="w-full bg-white/5 text-white text-3xl md:text-5xl font-black uppercase tracking-tight py-8 pl-20 pr-32 border-b-4 border-white/10 outline-none focus:border-blue-500 transition-all rounded-t-3xl" value={query} onChange={(e) => { setQuery(e.target.value); setAiResults(null); }} onKeyDown={(e)=>e.key==='Enter' && handleAISearch()}/>
                    <button onClick={handleAISearch} disabled={isAILoading || !query.trim()} className="absolute right-6 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-xl disabled:opacity-30">
                        {isAILoading ? <Loader2 className="animate-spin" size={16}/> : <Bot size={16}/>} AI Search
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {finalResults.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {finalResults.map(p => (
                                <button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className="bg-white rounded-3xl p-4 text-left hover:scale-105 transition-all shadow-2xl group">
                                    <div className="aspect-square bg-slate-50 rounded-2xl mb-4 p-4 flex items-center justify-center">
                                        <img src={p.imageUrl} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase text-xs mb-1 line-clamp-2">{p.name}</h4>
                                    <div className="flex items-center gap-2 text-[8px] font-black text-blue-600 uppercase tracking-widest"><Tag size={10}/> {p.sku}</div>
                                </button>
                            ))}
                        </div>
                    ) : query && (
                        <div className="text-center py-20">
                            <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] inline-block">
                                <Search size={64} className="mx-auto text-slate-600 mb-6" />
                                <h3 className="text-white font-black text-2xl uppercase">No matches found</h3>
                                <p className="text-slate-500 mt-2 font-bold uppercase text-xs">Try asking the AI for broader concepts</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [screensaverEnabled, setScreensaverEnabled] = useState(true);
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const timerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;

  useEffect(() => {
    const color = storeData?.appConfig?.themeColor || '#2563eb';
    document.documentElement.style.setProperty('--kiosk-primary', color);
  }, [storeData?.appConfig?.themeColor]);

  const resetIdleTimer = useCallback((targetProductId?: string) => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (targetProductId && storeData) {
        const found = storeData.brands.flatMap(b => b.categories.flatMap(c => c.products)).find(p => p.id === targetProductId);
        if (found) {
            const b = storeData.brands.find(br => br.categories.some(c => c.products.some(p => p.id === targetProductId)));
            const c = b?.categories.find(cat => cat.products.some(p => p.id === targetProductId));
            if (b && c) { setActiveBrand(b); setActiveCategory(c); setActiveProduct(found); }
        }
    }

    if (screensaverEnabled && isSetup) {
      timerRef.current = window.setTimeout(() => setIsIdle(true), idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, isSetup, storeData]);

  useEffect(() => {
    window.addEventListener('touchstart', () => resetIdleTimer());
    window.addEventListener('click', () => resetIdleTimer());
    if (isSetup) {
      const syncCycle = async () => { await sendHeartbeat(); };
      syncCycle(); setInterval(syncCycle, 30000);
    }
  }, [isSetup]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);

  if (!storeData) return null;
  const deviceType = getDeviceType();
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;

  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       <style>{`
         :root { --kiosk-primary: #2563eb; }
         .bg-primary { background-color: var(--kiosk-primary); }
         .text-primary { color: var(--kiosk-primary); }
         .border-primary { border-color: var(--kiosk-primary); }
       `}</style>
       
       {isIdle && screensaverEnabled && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} isAudioUnlocked={isAudioUnlocked} />}
       
       <header className="shrink-0 h-14 bg-slate-900 text-white flex items-center justify-between px-6 z-50 shadow-xl">
           <button onClick={() => setShowGlobalSearch(true)} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 px-6 py-2 rounded-2xl border border-white/5 group transition-all w-full max-w-sm">
               <Search size={18} className="text-primary" />
               <span className="text-xs font-black uppercase tracking-widest text-slate-400">Search Product catalog...</span>
           </button>
           <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                    <Activity size={16} className="text-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Pulse</span>
               </div>
               <button onClick={() => setShowPricelistModal(true)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"><RIcon size={18} className="text-white"/></button>
           </div>
       </header>

       <div className="flex-1 relative flex flex-col min-h-0">
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={()=>{}} onViewWebsite={()=>{}} onExport={()=>{}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>setScreensaverEnabled(!screensaverEnabled)} deviceType={deviceType} /> : !activeCategory ? <CategoryGrid brand={activeBrand} onSelectCategory={setActiveCategory} onBack={()=>setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>setScreensaverEnabled(!screensaverEnabled)} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={[]} onSelectProduct={setActiveProduct} onBack={()=>setActiveCategory(null)} onViewCatalog={()=>{}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>setScreensaverEnabled(!screensaverEnabled)} selectedForCompare={[]} onToggleCompare={()=>{}} onStartCompare={()=>{}} /> : <ProductDetail product={activeProduct} onBack={()=>setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={()=>setScreensaverEnabled(!screensaverEnabled)} />}
       </div>

       <footer className="shrink-0 bg-white border-t h-12 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-400">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> System Live</div>
              <div className="flex items-center gap-2 border-l pl-6">ID: {kioskId}</div>
              <div className="flex items-center gap-2 border-l pl-6">Sync: {lastSyncTime || '--:--'}</div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">© JSTYP KIOSK PRO v2.8</div>
       </footer>

       {showGlobalSearch && <SearchModal storeData={storeData} productsFlat={allProductsFlat} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b=>b.categories.some(c=>c.products.some(x=>x.id===p.id)))!); setActiveCategory(storeData.brands.flatMap(b=>b.categories).find(c=>c.products.some(x=>x.id===p.id))!); setActiveProduct(p); }} onClose={() => setShowGlobalSearch(false)} />}
    </div>
  );
};

export default KioskApp;