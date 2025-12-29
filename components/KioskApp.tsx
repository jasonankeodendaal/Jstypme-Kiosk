
// KioskApp.tsx - Main entry point for the customer-facing Kiosk UI.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StoreData, Product, Brand, Category, Catalogue, Pricelist, FlatProduct } from '../types';
import { 
  Menu, X, Search, ChevronLeft, ChevronRight, BookOpen, 
  MonitorPlay, MonitorStop, Info, LogIn, LayoutGrid, 
  ArrowLeft, ZoomIn, ZoomOut, FileDown, Sparkles, Grip, Loader2,
  Clock, RefreshCcw, HelpCircle, User, Monitor
} from 'lucide-react';
import jsPDF from 'jspdf';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import Screensaver from './Screensaver';
import TVMode from './TVMode';
import SetupGuide from './SetupGuide';
import { 
  sendHeartbeat, 
  isKioskConfigured, 
  provisionKioskId, 
  getKioskId, 
  getShopName, 
  getDeviceType,
  completeKioskSetup
} from '../services/kioskService';

const isRecent = (dateString?: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
};

const RIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5(4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo, brandName }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string, brandName?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const onDragStart = (clientX: number, clientY: number) => {
    if (zoom <= 1 || !scrollContainerRef.current) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setScrollPos({ left: scrollContainerRef.current.scrollLeft, top: scrollContainerRef.current.scrollTop });
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    scrollContainerRef.current.scrollLeft = scrollPos.left - dx;
    scrollContainerRef.current.scrollTop = scrollPos.top - dy;
  };

  const handleMouseDown = (e: React.MouseEvent) => { if (e.button !== 0) return; onDragStart(e.pageX, e.pageY); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging) return; e.preventDefault(); onDragMove(e.pageX, e.pageY); };
  const handleTouchStart = (e: React.TouchEvent) => { if (e.touches.length !== 1) return; onDragStart(e.touches[0].pageX, e.touches[0].pageY); };
  const handleTouchMove = (e: React.TouchEvent) => { if (!isDragging || e.touches.length !== 1) return; if (zoom > 1) e.preventDefault(); onDragMove(e.touches[0].pageX, e.touches[0].pageY); };
  const handleDragEnd = () => setIsDragging(false);

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        doc.text(pricelist.title, 10, 10);
        doc.save(`${pricelist.title}.pdf`);
    } catch (err) { alert("Unable to generate PDF."); } finally { setIsExporting(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in overflow-hidden" onClick={onClose}>
      <div className="viewer-container relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 md:p-8 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
          <div className="flex items-center gap-6">
             <RIcon size={36} className="text-white" />
             <div className="flex flex-col">
                <h2 className="text-lg md:text-3xl font-black uppercase tracking-tight leading-none">{pricelist.title}</h2>
                <p className="text-yellow-100 font-bold uppercase tracking-widest text-[10px] md:sm mt-1">{pricelist.month} {pricelist.year}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <button onClick={handleExportPDF} disabled={isExporting} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">
                {isExporting ? <Loader2 className="animate-spin" /> : <FileDown size={22} />} Save PDF
             </button>
             <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20"><X size={28}/></button>
          </div>
        </div>
        <div ref={scrollContainerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleDragEnd} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleDragEnd} className="flex-1 overflow-auto bg-slate-100 p-6">
            <div className="min-w-full bg-white p-8 rounded-xl shadow-lg">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-4 uppercase text-xs font-black">SKU</th>
                            <th className="p-4 uppercase text-xs font-black">Description</th>
                            <th className="p-4 uppercase text-xs font-black text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(pricelist.items || []).map(i => (
                            <tr key={i.id} className="border-b border-slate-50">
                                <td className="p-4 font-mono text-sm">{i.sku}</td>
                                <td className="p-4 font-bold text-sm">{i.description}</td>
                                <td className="p-4 font-black text-sm text-right">{i.normalPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export const KioskApp: React.FC<{
  storeData: StoreData;
  lastSyncTime: string;
  onSyncRequest: () => void;
}> = ({ storeData, lastSyncTime, onSyncRequest }) => {
    const [view, setView] = useState<{ type: 'home' | 'brand' | 'category' | 'product' | 'tv' | 'about', data?: any }>({ type: 'home' });
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);
    const [activePricelist, setActivePricelist] = useState<Pricelist | null>(null);
    const [showSetup, setShowSetup] = useState(!isKioskConfigured());
    const idleTimer = useRef<number | null>(null);

    const flatProducts = useMemo(() => {
        return storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({ ...p, brandName: b.name, categoryName: c.name }))));
    }, [storeData]);

    const resetIdleTimer = useCallback(() => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        if (isScreensaverActive) setIsScreensaverActive(false);
        const timeout = (storeData.screensaverSettings?.idleTimeout || 60) * 1000;
        idleTimer.current = window.setTimeout(() => setIsScreensaverActive(true), timeout);
    }, [isScreensaverActive, storeData.screensaverSettings?.idleTimeout]);

    useEffect(() => {
        window.addEventListener('mousedown', resetIdleTimer);
        window.addEventListener('touchstart', resetIdleTimer);
        resetIdleTimer();
        return () => {
            window.removeEventListener('mousedown', resetIdleTimer);
            window.removeEventListener('touchstart', resetIdleTimer);
        };
    }, [resetIdleTimer]);

    if (showSetup) return <SetupGuide onClose={() => setShowSetup(false)} />;
    if (isScreensaverActive) return <Screensaver products={flatProducts} ads={storeData.ads?.screensaver || []} onWake={() => setIsScreensaverActive(false)} settings={storeData.screensaverSettings} />;

    return (
        <div className="h-screen w-screen bg-white flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-hidden">
                {view.type === 'home' && (
                    <BrandGrid 
                        brands={storeData.brands} 
                        heroConfig={storeData.hero} 
                        ads={storeData.ads} 
                        onSelectBrand={(b) => setView({ type: 'brand', data: b })}
                        onViewGlobalCatalog={() => {}} 
                        onExport={() => {}}
                        screensaverEnabled={false}
                        onToggleScreensaver={() => {}}
                    />
                )}
                {view.type === 'brand' && (
                    <CategoryGrid 
                        brand={view.data} 
                        onSelectCategory={(c) => setView({ type: 'category', data: { brand: view.data, category: c } })}
                        onBack={() => setView({ type: 'home' })}
                        screensaverEnabled={false}
                        onToggleScreensaver={() => {}}
                    />
                )}
                {view.type === 'category' && (
                    <ProductList 
                        brand={view.data.brand} 
                        category={view.data.category}
                        storeCatalogs={[]}
                        onSelectProduct={(p) => setView({ type: 'product', data: p })}
                        onBack={() => setView({ type: 'brand', data: view.data.brand })}
                        onViewCatalog={() => {}}
                        screensaverEnabled={false}
                        onToggleScreensaver={() => {}}
                        selectedForCompare={[]}
                        onToggleCompare={() => {}}
                        onStartCompare={() => {}}
                    />
                )}
                {view.type === 'product' && (
                    <ProductDetail 
                        product={view.data} 
                        onBack={() => window.history.back()}
                        screensaverEnabled={false}
                        onToggleScreensaver={() => {}}
                    />
                )}
            </div>

            {/* Bottom Navigation / Status Bar */}
            <footer className="h-12 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView({ type: 'home' })} className="text-white flex items-center gap-2"><LayoutGrid size={18}/> <span className="text-[10px] font-black uppercase">Home</span></button>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <button onClick={() => setView({ type: 'about' })} className="text-slate-400 flex items-center gap-2"><Info size={18}/> <span className="text-[10px] font-black uppercase">About</span></button>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[8px] font-black uppercase text-slate-500">Sync: {lastSyncTime}</span>
                    <button onClick={onSyncRequest} className="text-blue-400"><RefreshCcw size={14}/></button>
                    <button onClick={() => window.location.href = '/admin'} className="bg-white/10 p-2 rounded-lg text-white"><LogIn size={14}/></button>
                </div>
            </footer>

            {activePricelist && (
                <ManualPricelistViewer 
                    pricelist={activePricelist} 
                    onClose={() => setActivePricelist(null)} 
                    companyLogo={storeData.companyLogoUrl}
                />
            )}
        </div>
    );
};
