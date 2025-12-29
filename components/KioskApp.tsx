
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, ArrowLeft } from 'lucide-react';
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
    setScrollPos({ 
      left: scrollContainerRef.current.scrollLeft, 
      top: scrollContainerRef.current.scrollTop 
    });
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    scrollContainerRef.current.scrollLeft = scrollPos.left - dx;
    scrollContainerRef.current.scrollTop = scrollPos.top - dy;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onDragStart(e.pageX, e.pageY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    onDragMove(e.pageX, e.pageY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    onDragStart(e.touches[0].pageX, e.touches[0].pageY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    if (zoom > 1) e.preventDefault();
    onDragMove(e.touches[0].pageX, e.touches[0].pageY);
  };

  const handleDragEnd = () => setIsDragging(false);

  const loadImageForPDF = async (url: string): Promise<{ imgData: string, format: string, width: number, height: number } | null> => {
    if (!url) return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; 
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(null); return; }
                ctx.drawImage(img, 0, 0);
                resolve({ imgData: canvas.toDataURL('image/png'), format: 'PNG', width: img.width, height: img.height });
            } catch (err) { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const innerWidth = pageWidth - (margin * 2);
        
        const imgW = 12;
        const skuW = 22;
        const normalW = 28;
        const promoW = 28;
        const descW = innerWidth - imgW - skuW - normalW - promoW;

        const line1 = margin;
        const line2 = line1 + imgW;
        const line3 = line2 + skuW;
        const line4 = line3 + descW;
        const line5 = line4 + normalW;
        const line6 = line1 + innerWidth;

        const imgX = line1 + 1;
        const skuX = line2 + 2;
        const descX = line3 + 2;
        const normalPriceX = line5 - 2;
        const promoPriceX = line6 - 2;
        
        const descMaxW = descW - 4;

        /* Completed loadImageForPDF call to finish truncated function */
        const [brandAsset, companyAsset] = await Promise.all([
            loadImageForPDF(brandLogo || ''),
            loadImageForPDF(companyLogo || '')
        ]);
        
        let y = 50;
        if (companyAsset) {
            const aspect = companyAsset.width / companyAsset.height;
            const w = 40;
            const h = w / aspect;
            doc.addImage(companyAsset.imgData, 'PNG', margin, 15, w, h);
        }
        
        if (brandAsset) {
            const aspect = brandAsset.width / brandAsset.height;
            const w = 30;
            const h = w / aspect;
            doc.addImage(brandAsset.imgData, 'PNG', pageWidth - margin - w, 15, w, h);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(brandName || "PRICE LIST", margin, 42);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${pricelist.month} ${pricelist.year}`, margin, 48);

        doc.setFillColor(240, 245, 255);
        doc.rect(margin, y, innerWidth, 10, 'F');
        doc.setFontSize(8);
        doc.setTextColor(50);
        doc.text("PRODUCT", descX, y + 6);
        doc.text("SKU", skuX, y + 6);
        doc.text("NORMAL", normalPriceX, y + 6, { align: 'right' });
        doc.text("PROMO", promoPriceX, y + 6, { align: 'right' });
        
        y += 15;

        for (const item of pricelist.items || []) {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(0);
            
            const descLines = doc.splitTextToSize(item.description, descMaxW);
            doc.text(descLines, descX, y);
            
            doc.setFont("courier", "bold");
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(item.sku, skuX, y);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(item.normalPrice, normalPriceX, y, { align: 'right' });
            
            if (item.promoPrice) {
                doc.setTextColor(220, 0, 0);
                doc.text(item.promoPrice, promoPriceX, y, { align: 'right' });
            }
            
            y += (descLines.length * 5) + 5;
        }

        doc.save(`${brandName}_Pricelist_${pricelist.month}_${pricelist.year}.pdf`);
    } catch (err) {
        alert("Export failed.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900 flex flex-col animate-fade-in" onClick={onClose}>
        <div className="bg-slate-900 border-b border-slate-800 p-4 md:p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"><ArrowLeft size={24} /></button>
                <div>
                    <h2 className="text-white font-black uppercase tracking-widest text-sm md:text-xl">{pricelist.title}</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase">{brandName} • {pricelist.month} {pricelist.year}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                    {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={24} /></button>
            </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className={`flex-1 overflow-auto bg-slate-800 p-4 md:p-12 scrollbar-hide ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
            <div 
                className="mx-auto bg-white shadow-2xl transition-transform duration-300 origin-top"
                style={{ width: '100%', maxWidth: '800px', transform: `scale(${zoom})`, minHeight: '1122px', padding: '60px' }}
            >
                <div className="flex justify-between items-start mb-12">
                    {companyLogo && <img src={companyLogo} className="h-12 object-contain" alt="Company" />}
                    {brandLogo && <img src={brandLogo} className="h-10 object-contain" alt="Brand" />}
                </div>

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-1">{brandName || "Price List"}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest">{pricelist.month} {pricelist.year}</p>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400">Item</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400">Description</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400 text-right">Normal</th>
                            <th className="py-4 text-[10px] font-black uppercase text-slate-400 text-right">Promo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(pricelist.items || []).map(item => (
                            <tr key={item.id} className="group">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        {item.imageUrl && <img src={item.imageUrl} className="w-10 h-10 object-contain" />}
                                        <span className="font-mono font-bold text-xs text-slate-400">{item.sku}</span>
                                    </div>
                                </td>
                                <td className="py-4 pr-4">
                                    <div className="font-bold text-slate-900 text-sm leading-tight">{item.description}</div>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="font-black text-slate-900">R {item.normalPrice.replace('R ', '')}</span>
                                </td>
                                <td className="py-4 text-right">
                                    {item.promoPrice && <span className="font-black text-red-600">R {item.promoPrice.replace('R ', '')}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center gap-4 shrink-0">
             <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 border border-white/10">
                 <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-2 hover:bg-white/10 rounded-xl text-white"><ZoomOut size={18} /></button>
                 <span className="text-[10px] font-mono font-bold text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
                 <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-2 hover:bg-white/10 rounded-xl text-white"><ZoomIn size={18} /></button>
             </div>
        </div>
    </div>
  );
};

// --- MAIN KIOSK APP COMPONENT ---
/* Added KioskApp component and export to resolve Module not found error in App.tsx */
export const KioskApp: React.FC<{ storeData: StoreData, lastSyncTime: string, onSyncRequest: () => void }> = ({ storeData, lastSyncTime, onSyncRequest }) => {
    const [isConfigured, setIsConfigured] = useState(false);
    const [view, setView] = useState<'brands' | 'categories' | 'products' | 'detail' | 'tv'>('brands');
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);
    const [screensaverManualOverride, setScreensaverManualOverride] = useState(false);
    
    // Global Components
    const [activeCatalogue, setActiveCatalogue] = useState<Catalogue | null>(null);
    const [viewingPricelist, setViewingPricelist] = useState<Pricelist | null>(null);
    
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [isComparing, setIsComparing] = useState(false);

    const idleTimer = useRef<number | null>(null);

    const resetIdleTimer = useCallback(() => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        if (isScreensaverActive) setIsScreensaverActive(false);
        
        const timeout = (storeData.screensaverSettings?.idleTimeout || 60) * 1000;
        idleTimer.current = window.setTimeout(() => {
            if (!screensaverManualOverride) setIsScreensaverActive(true);
        }, timeout);
    }, [isScreensaverActive, screensaverManualOverride, storeData.screensaverSettings?.idleTimeout]);

    useEffect(() => {
        setIsConfigured(isKioskConfigured());
        
        window.addEventListener('mousedown', resetIdleTimer);
        window.addEventListener('touchstart', resetIdleTimer);
        window.addEventListener('keypress', resetIdleTimer);
        
        resetIdleTimer();
        
        const heartbeatInterval = setInterval(async () => {
            const command = await sendHeartbeat();
            if (command?.restart) window.location.reload();
            if (command?.deleted) {
                localStorage.clear();
                window.location.reload();
            }
        }, 30000);

        return () => {
            window.removeEventListener('mousedown', resetIdleTimer);
            window.removeEventListener('touchstart', resetIdleTimer);
            window.removeEventListener('keypress', resetIdleTimer);
            if (idleTimer.current) window.clearTimeout(idleTimer.current);
            clearInterval(heartbeatInterval);
        };
    }, [resetIdleTimer]);

    useEffect(() => {
        const deviceType = getDeviceType();
        if (deviceType === 'tv') {
            setView('tv');
        }
    }, []);

    const allFlatProducts: FlatProduct[] = useMemo(() => {
        return storeData.brands.flatMap(b => 
            b.categories.flatMap(c => 
                c.products.map(p => ({ ...p, brandName: b.name, categoryName: c.name }))
            )
        );
    }, [storeData]);

    const screensaverAds = storeData.ads?.screensaver || [];

    if (!isConfigured) return <SetupScreen storeData={storeData} onComplete={() => setIsConfigured(true)} />;

    const handleBack = () => {
        if (view === 'categories') { setView('brands'); setSelectedBrand(null); }
        else if (view === 'products') { setView('categories'); setSelectedCategory(null); }
        else if (view === 'detail') { setView('products'); setSelectedProduct(null); }
        else if (view === 'tv') { setView('brands'); }
    };

    const toggleScreensaver = () => {
        setScreensaverManualOverride(!screensaverManualOverride);
        if (!isScreensaverActive) setIsScreensaverActive(true);
        else setIsScreensaverActive(false);
    };

    return (
        <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden select-none">
            {isScreensaverActive && (
                <Screensaver 
                    products={allFlatProducts} 
                    ads={screensaverAds} 
                    pamphlets={storeData.catalogues?.filter(c => !c.brandId)}
                    settings={storeData.screensaverSettings}
                    onWake={() => setIsScreensaverActive(false)} 
                />
            )}

            <main className="flex-1 relative overflow-hidden">
                {view === 'brands' && (
                    <BrandGrid 
                        brands={storeData.brands} 
                        heroConfig={storeData.hero}
                        allCatalogs={storeData.catalogues}
                        ads={storeData.ads}
                        onSelectBrand={(b) => { setSelectedBrand(b); setView('categories'); }}
                        onViewGlobalCatalog={setActiveCatalogue}
                        onExport={() => {}}
                        screensaverEnabled={!screensaverManualOverride}
                        onToggleScreensaver={toggleScreensaver}
                    />
                )}

                {view === 'categories' && selectedBrand && (
                    <CategoryGrid 
                        brand={selectedBrand} 
                        storeCatalogs={storeData.catalogues}
                        onSelectCategory={(c) => { setSelectedCategory(c); setView('products'); }}
                        onViewCatalog={setActiveCatalogue}
                        onBack={handleBack}
                        screensaverEnabled={!screensaverManualOverride}
                        onToggleScreensaver={toggleScreensaver}
                    />
                )}

                {view === 'products' && selectedCategory && selectedBrand && (
                    <ProductList 
                        category={selectedCategory} 
                        brand={selectedBrand}
                        storeCatalogs={storeData.catalogues || []}
                        onSelectProduct={(p) => { setSelectedProduct(p); setView('detail'); }}
                        onBack={handleBack}
                        onViewCatalog={() => {}}
                        screensaverEnabled={!screensaverManualOverride}
                        onToggleScreensaver={toggleScreensaver}
                        selectedForCompare={selectedForCompare}
                        onToggleCompare={(p) => {
                            setSelectedForCompare(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                        }}
                        onStartCompare={() => setIsComparing(true)}
                    />
                )}

                {view === 'detail' && selectedProduct && (
                    <ProductDetail 
                        product={selectedProduct} 
                        onBack={handleBack}
                        screensaverEnabled={!screensaverManualOverride}
                        onToggleScreensaver={toggleScreensaver}
                    />
                )}

                {view === 'tv' && (
                    <TVMode 
                        storeData={storeData} 
                        onRefresh={onSyncRequest}
                        screensaverEnabled={!screensaverManualOverride}
                        onToggleScreensaver={toggleScreensaver}
                    />
                )}
            </main>

            <footer className="bg-white border-t border-slate-200 p-2 md:p-4 flex items-center justify-between shrink-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                 <div className="flex items-center gap-4">
                     <button onClick={() => setView('brands')} className={`p-3 rounded-2xl transition-all ${view === 'brands' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                         <LayoutGrid size={24} />
                     </button>
                     <div className="h-8 w-px bg-slate-200"></div>
                     <button 
                        onClick={() => {
                            const pl = storeData.pricelists?.[0];
                            if (pl) setViewingPricelist(pl);
                            else alert("No pricelists available.");
                        }} 
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                         <RIcon size={16} /> <span>Pricelists</span>
                     </button>
                 </div>

                 <div className="flex items-center gap-3">
                     <div className="text-right hidden md:block">
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Cloud Sync</div>
                         <div className="text-[10px] font-bold text-slate-900 uppercase">{lastSyncTime || 'Pending...'}</div>
                     </div>
                     <button 
                        onClick={() => window.location.assign('/about')}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors"
                     >
                         <Info size={14} /> <span>About</span>
                     </button>
                 </div>
            </footer>

            {activeCatalogue && (
                <Flipbook 
                    pages={activeCatalogue.pages} 
                    onClose={() => setActiveCatalogue(null)} 
                    catalogueTitle={activeCatalogue.title}
                    startDate={activeCatalogue.startDate}
                    endDate={activeCatalogue.endDate}
                />
            )}

            {viewingPricelist && (
                <ManualPricelistViewer 
                    pricelist={viewingPricelist} 
                    onClose={() => setViewingPricelist(null)}
                    companyLogo={storeData.companyLogoUrl}
                    brandLogo={storeData.pricelistBrands?.find(b => b.id === viewingPricelist.brandId)?.logoUrl}
                    brandName={storeData.pricelistBrands?.find(b => b.id === viewingPricelist.brandId)?.name}
                />
            )}
        </div>
    );
};
