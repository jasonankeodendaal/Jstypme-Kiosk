
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Image as ImageIcon, SearchIcon, Minus, Plus, ToggleLeft, ToggleRight, Globe, Activity, ChevronLeft, ArrowRight, LifeBuoy } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Extend window interface for custom watchdog properties
declare global {
  interface Window {
    signalAppHeartbeat?: () => void;
  }
}

const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
};

const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 21V3h7a5 5 0 0 1 0 10H7" />
    <path d="M13 13l5 8" />
    <path d="M10 8h4" />
  </svg>
);

// --- SETUP SCREEN ---
const SetupScreen = ({ storeData, onComplete }: { storeData: StoreData, onComplete: () => void }) => {
    const [mode, setMode] = useState<'setup' | 'recover'>('setup');
    const [step, setStep] = useState(1);
    
    // Setup State
    const [shopName, setShopName] = useState('');
    const [deviceType, setDeviceType] = useState<'kiosk' | 'mobile' | 'tv'>('kiosk');
    
    // Recovery State
    const [recoverId, setRecoverId] = useState('');

    // Shared State
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = async () => {
        setError('');
        if (step === 1) {
            if (!shopName.trim()) return setError('Enter location name.');
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            const systemPin = storeData.systemSettings?.setupPin || '0000';
            if (pin !== systemPin) return setError('Invalid PIN.');
            
            setIsProcessing(true);
            try {
                await provisionKioskId();
                const success = await completeKioskSetup(shopName.trim(), deviceType);
                if (success) onComplete();
                else setError('Storage error.');
            } catch (e) {
                setError('Sync failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleRecover = async () => {
        setError('');
        if (!recoverId.trim()) return setError('Enter Device ID (LOC-XXXX).');
        if (!pin.trim()) return setError('Enter Security PIN.');

        const systemPin = storeData.systemSettings?.setupPin || '0000';
        if (pin !== systemPin) return setError('Invalid Security PIN.');

        setIsProcessing(true);
        try {
            const success = await tryRecoverIdentity(recoverId.trim());
            if (success) {
                setCustomKioskId(recoverId.trim());
                onComplete();
            } else {
                setError('Device ID not found in cloud registry.');
            }
        } catch (e) {
            console.error(e);
            setError('Recovery failed due to network error.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-[#0f172a] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden border-2 border-white">
                <div className="bg-[#1e293b] text-white p-6 text-center relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`p-2 rounded-lg mb-3 ${mode === 'recover' ? 'bg-orange-600' : 'bg-blue-600'}`}>
                            {mode === 'recover' ? <LifeBuoy size={28} /> : <Store size={28} />}
                        </div>
                        <h1 style={{fontSize: '24px', fontWeight: 900}} className="uppercase tracking-tight">
                            {mode === 'recover' ? 'System Recovery' : 'System Setup'}
                        </h1>
                        <p style={{color: '#94a3b8', fontSize: '10px', fontWeight: 'bold'}} className="uppercase tracking-widest mt-1">Kiosk Firmware v2.8</p>
                    </div>
                </div>

                <div className="p-6">
                    {mode === 'setup' && (
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`h-2 rounded-full transition-all ${step >= s ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}></div>
                            ))}
                        </div>
                    )}

                    <div style={{minHeight: '200px'}}>
                        {mode === 'setup' ? (
                            <>
                                {step === 1 && (
                                    <div className="animate-fade-in">
                                        <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">01. Device Location</label>
                                        <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Where is this tablet located?</h2>
                                        <input 
                                            autoFocus
                                            className="w-full p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-bold text-lg text-black uppercase"
                                            placeholder="e.g. Front Desk"
                                            value={shopName}
                                            onChange={(e) => setShopName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        />
                                        <button 
                                            onClick={() => { setMode('recover'); setError(''); setPin(''); }}
                                            className="mt-6 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-blue-600 flex items-center gap-2 transition-colors"
                                        >
                                            <RotateCcw size={12} /> Recover Existing Device
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="animate-fade-in">
                                        <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">02. Display Mode</label>
                                        <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Hardware Profile</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {[
                                                { id: 'kiosk', icon: <Tablet size={20}/>, label: 'Kiosk' },
                                                { id: 'mobile', icon: <Smartphone size={20}/>, label: 'Handheld' },
                                                { id: 'tv', icon: <Tv size={20}/>, label: 'TV Display' }
                                            ].map(type => (
                                                <button 
                                                    key={type.id}
                                                    onClick={() => setDeviceType(type.id as any)}
                                                    style={{borderWidth: '3px'}}
                                                    className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${deviceType === type.id ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                                >
                                                    <div>{type.icon}</div>
                                                    <div style={{fontWeight: 900}} className="uppercase text-xs">{type.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="animate-fade-in text-center">
                                        <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">03. Security PIN</label>
                                        <h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Authorized Admin Entry</h2>
                                        <input 
                                            autoFocus
                                            type="password"
                                            maxLength={8}
                                            className="w-full max-w-[200px] p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-mono font-bold text-3xl text-center tracking-[0.5em] text-black"
                                            placeholder="****"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="animate-fade-in space-y-4">
                                <div>
                                    <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">Target Device ID</label>
                                    <input 
                                        autoFocus
                                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-orange-500 font-mono font-bold text-base text-black uppercase placeholder:normal-case"
                                        placeholder="LOC-XXXXX"
                                        value={recoverId}
                                        onChange={(e) => setRecoverId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">Security PIN</label>
                                    <input 
                                        type="password"
                                        maxLength={8}
                                        className="w-full p-3 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-orange-500 font-mono font-bold text-base tracking-widest text-black"
                                        placeholder="****"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRecover()}
                                    />
                                </div>
                                <div className="p-3 bg-orange-50 text-orange-800 text-[10px] font-bold rounded-lg border border-orange-100 flex items-start gap-2 leading-relaxed">
                                    <Info size={14} className="shrink-0 mt-0.5" />
                                    Recovering a device will restore its identity from the cloud. It must have been previously active.
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div style={{background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171'}} className="mt-4 p-3 rounded-lg text-xs font-black uppercase flex items-center gap-2"> {error}</div>}

                    <div className="mt-8 flex gap-3">
                        {(step > 1 || mode === 'recover') && (
                            <button 
                                onClick={() => {
                                    if (mode === 'recover') {
                                        setMode('setup');
                                        setError('');
                                    } else {
                                        setStep(step - 1);
                                    }
                                }} 
                                className="px-6 py-4 bg-slate-200 text-black rounded-lg font-black uppercase text-xs tracking-widest hover:bg-slate-300 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        
                        {mode === 'setup' ? (
                            <button 
                                onClick={handleNext}
                                disabled={isProcessing}
                                className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animate-spin" size={14} /> Syncing...</>
                                ) : (
                                    <>{step === 3 ? 'Start Application' : 'Next Step'} <ChevronRight size={14} /></>
                                )}
                            </button>
                        ) : (
                            <button 
                                onClick={handleRecover}
                                disabled={isProcessing}
                                className="flex-1 bg-orange-600 text-white p-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animate-spin" size={14} /> Validating...</>
                                ) : (
                                    <>Recover Identity <CheckCircle2 size={14} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HIGH PERFORMANCE ROW COMPONENT ---
const PricelistRow = React.memo(({ item, showImages, showSku, showDesc, showNormal, showPromo, onEnlarge }: { item: PricelistItem, showImages: boolean, showSku: boolean, showDesc: boolean, showNormal: boolean, showPromo: boolean, onEnlarge: (url: string) => void }) => (
    <tr className="excel-row border-b border-slate-100 transition-colors group hover:bg-slate-50">
        {showImages && (
            <td className="p-1 border-r border-slate-100 text-center shrink-cell">
                <div 
                    className="w-8 h-8 md:w-10 md:h-10 bg-white rounded flex items-center justify-center mx-auto overflow-hidden cursor-zoom-in hover:ring-1 hover:ring-blue-400 transition-all print:w-6 print:h-6"
                    onClick={(e) => { e.stopPropagation(); if(item.imageUrl) onEnlarge(item.imageUrl); }}
                >
                    {item.imageUrl ? (
                        <img 
                            src={item.imageUrl} 
                            loading="lazy" 
                            decoding="async" 
                            className="w-full h-full object-contain" 
                            alt="" 
                        />
                    ) : (
                        <ImageIcon size={16} className="text-slate-100" />
                    )}
                </div>
            </td>
        )}
        {showSku && <td className="sku-cell border-r border-slate-100"><span className="sku-font font-bold text-slate-900 uppercase">{item.sku || ''}</span></td>}
        {showDesc && <td className="desc-cell border-r border-slate-100"><span className="font-bold text-slate-900 uppercase tracking-tight group-hover:text-[#c0810d] transition-colors whitespace-normal break-words leading-tight">{item.description}</span></td>}
        {showNormal && <td className={`price-cell text-left ${showPromo ? 'border-r border-slate-100' : ''} whitespace-nowrap`}><span className="font-bold text-slate-900">{item.normalPrice || ''}</span></td>}
        {showPromo && (
            <td className="price-cell text-left bg-slate-50/10 whitespace-nowrap">{item.promoPrice ? (<span className="font-black text-[#ef4444] tracking-tighter">{item.promoPrice}</span>) : null}</td>
        )}
    </tr>
));

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo, brandName }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string, brandName?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [includePhotosInPdf, setIncludePhotosInPdf] = useState(true);
  
  // Custom Headers from Pricelist with Default Fallbacks
  const headers = pricelist.headers || {
      sku: 'SKU',
      description: 'Description',
      normalPrice: 'Normal Price',
      promoPrice: 'Promo Price'
  };

  // Pagination State
  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const items = pricelist.items || [];

  // Dynamic Column Detection - Hide empty columns
  const hasImages = useMemo(() => items.some(item => item.imageUrl && item.imageUrl.trim() !== ''), [items]);
  const hasSku = useMemo(() => items.some(item => item.sku && item.sku.trim() !== ''), [items]);
  const hasDescription = useMemo(() => items.some(item => item.description && item.description.trim() !== ''), [items]);
  const hasNormalPrice = useMemo(() => items.some(item => item.normalPrice && item.normalPrice.trim() !== ''), [items]);
  const hasPromoPrice = useMemo(() => items.some(item => item.promoPrice && item.promoPrice.trim() !== ''), [items]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  
  const displayedItems = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return items.slice(start, end);
  }, [items, currentPage]);

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    scrollContainerRef.current.scrollLeft = scrollPos.left - dx;
    scrollContainerRef.current.scrollTop = scrollPos.top - dy;
  }, [isDragging, startPos, scrollPos]);

  const onDragStart = (clientX: number, clientY: number) => {
    if (zoom <= 1 || !scrollContainerRef.current) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setScrollPos({ 
      left: scrollContainerRef.current.scrollLeft, 
      top: scrollContainerRef.current.scrollTop 
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => { if (e.button === 0) onDragStart(e.pageX, e.pageY); };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) onDragMove(e.pageX, e.pageY); };
  const handleTouchStart = (e: React.TouchEvent) => { if (e.touches.length === 1) onDragStart(e.touches[0].pageX, e.touches[0].pageY); };
  const handleTouchMove = (e: React.TouchEvent) => { if (isDragging && e.touches.length === 1) { if (zoom > 1) e.preventDefault(); onDragMove(e.touches[0].pageX, e.touches[0].pageY); } };
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
        const margin = 8; 
        const innerWidth = pageWidth - (margin * 2);
        
        // Auto-detect columns for PDF
        const effectiveShowImages = hasImages && includePhotosInPdf;
        
        // --- NEW WIDTH CALCULATION ---
        const mediaW = effectiveShowImages ? 14 : 0;
        const normalW = hasNormalPrice ? 24 : 0; // Fixed width for Normal Price
        
        let remainingW = innerWidth - mediaW - normalW;
        
        let skuW = 0;
        let descW = 0;
        let promoW = 0;
        
        if (hasDescription) {
            skuW = hasSku ? 24 : 0;
            promoW = hasPromoPrice ? 24 : 0;
            descW = remainingW - skuW - promoW;
        } else {
            // No Description - Expand Promo or SKU
            if (hasSku) {
                if (hasPromoPrice) {
                    skuW = 35; // Fixed wider SKU if no desc
                    promoW = remainingW - skuW; // Promo takes remaining
                } else {
                    skuW = remainingW;
                }
            } else {
                if (hasPromoPrice) {
                    promoW = remainingW;
                }
            }
        }
        
        // Coordinates
        let currentX = margin;
        
        const mediaX = currentX + 1;
        if (effectiveShowImages) currentX += mediaW;
        
        const skuX = currentX + 1.5;
        if (hasSku) currentX += skuW;
        
        const descX = currentX + 1.5;
        if (hasDescription) currentX += descW;
        
        // Left Align X Coordinates for Prices
        const normalPriceX = currentX + 1.5; 
        if (hasNormalPrice) currentX += normalW;
        
        const promoPriceX = currentX + 1.5;
        if (hasPromoPrice) currentX += promoW;
        
        const rightEdge = margin + innerWidth;

        const skuMaxW = skuW > 3 ? skuW - 3 : 0;
        const descMaxW = descW > 3 ? descW - 3 : 0;
        // ------------------------------

        const [brandAsset, companyAsset] = await Promise.all([
            brandLogo ? loadImageForPDF(brandLogo) : Promise.resolve(null),
            companyLogo ? loadImageForPDF(companyLogo) : Promise.resolve(null)
        ]);

        const drawHeader = () => {
            let topY = 8;
            if (brandAsset) {
                const h = 12; const w = h * (brandAsset.width / brandAsset.height);
                doc.addImage(brandAsset.imgData, brandAsset.format, margin, topY, w, h);
            } else if (brandName) {
                doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.setFont('helvetica', 'black');
                doc.text(brandName.toUpperCase(), margin, topY + 8);
            }
            if (companyAsset) {
                const h = 7; const w = h * (companyAsset.width / companyAsset.height);
                doc.addImage(companyAsset.imgData, companyAsset.format, pageWidth - margin - w, topY, w, h);
            }
            doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            const titleText = pricelist.kind === 'promotion' ? "PROMOTION" : "PRICE LIST";
            doc.text(titleText, margin, topY + 18);
            doc.setTextColor(30, 41, 59); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text(pricelist.title.toUpperCase(), margin, topY + 23);
            
            const boxW = 32; const boxH = 6; const boxX = pageWidth - margin - boxW; const boxY = topY + 13;
            doc.setFillColor(30, 41, 59); doc.rect(boxX, boxY, boxW, boxH, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
            doc.text(`${pricelist.month} ${pricelist.year}`.toUpperCase(), boxX + (boxW/2), boxY + 4, { align: 'center' });
            
            // Draw Promotion Dates if applicable
            if (pricelist.kind === 'promotion' && (pricelist.startDate || pricelist.endDate)) {
                 doc.setTextColor(100); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
                 const formatDate = (d: string) => {
                     if (!d) return '';
                     try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch(e) { return d; }
                 };
                 const start = formatDate(pricelist.startDate || '');
                 const end = formatDate(pricelist.endDate || '');
                 const dateText = `Valid: ${start || 'Now'} - ${end || 'Until Stock Lasts'}`;
                 doc.text(dateText, margin, topY + 28);
            }

            const lineY = topY + 30;
            doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.1);
            doc.line(margin, lineY, pageWidth - margin, lineY);
            
            let nextSectionY = lineY + 6;

            // Draw Promo Banner Text centered above columns
            if (pricelist.promoText) {
                doc.setTextColor(15, 23, 42); // Dark Slate
                doc.setFontSize(10);
                doc.setFont('helvetica', 'black'); // Heavy/Black font
                doc.text(pricelist.promoText.toUpperCase(), pageWidth / 2, nextSectionY + 2, { align: 'center' });
                nextSectionY += 8; 
            }

            return nextSectionY;
        };

        const drawTableHeaders = (startY: number) => {
            doc.setFillColor(113, 113, 122); 
            doc.rect(margin, startY - 4.5, rightEdge - margin, 6, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
            if (effectiveShowImages) doc.text("MEDIA", mediaX, startY);
            if (hasSku) doc.text((headers.sku || "SKU").toUpperCase(), skuX, startY); 
            if (hasDescription) doc.text((headers.description || "DESCRIPTION").toUpperCase(), descX, startY);
            if (hasNormalPrice) doc.text((headers.normalPrice || "NORMAL").toUpperCase(), normalPriceX, startY);
            if (hasPromoPrice) doc.text((headers.promoPrice || "PROMO").toUpperCase(), promoPriceX, startY);
            return startY + 4;
        };

        const drawTextFit = (text: string, x: number, y: number, maxWidth: number, baseSize: number, align: 'left' | 'right' = 'left'): number => {
            let currentSize = baseSize;
            doc.setFontSize(currentSize);
            while (doc.getTextWidth(text) > maxWidth && currentSize > 5.5) { 
                currentSize -= 0.5; doc.setFontSize(currentSize);
            }
            if (doc.getTextWidth(text) > maxWidth) {
                const lines = doc.splitTextToSize(text, maxWidth); doc.text(lines, x, y, { align }); return lines.length;
            }
            doc.text(text, x, y, { align }); return 1;
        };

        let currentY = drawHeader();
        currentY = drawTableHeaders(currentY);
        
        // Export ALL items, ignoring pagination
        const itemsToExport = pricelist.items || [];
        const baseRowHeight = effectiveShowImages ? 9 : 6; 
        const footerMargin = 12;

        for (let index = 0; index < itemsToExport.length; index++) {
            const item = itemsToExport[index];
            doc.setFontSize(6.5);
            let maxLines = 1;
            
            if (hasSku) {
                const skuLines = doc.splitTextToSize(item.sku || '', skuMaxW).length;
                maxLines = Math.max(maxLines, skuLines);
            }
            
            if (hasDescription) {
                doc.setFontSize(7.5);
                const descLines = doc.splitTextToSize(item.description?.toUpperCase() || '', descMaxW).length;
                maxLines = Math.max(maxLines, descLines);
            }
            
            const contentHeight = maxLines > 1 ? (baseRowHeight + (maxLines - 1) * 3.0) : baseRowHeight;
            const rowHeight = Math.max(contentHeight, effectiveShowImages ? 9.5 : 6);

            if (currentY + rowHeight > pageHeight - footerMargin) {
                doc.addPage(); currentY = drawHeader(); currentY = drawTableHeaders(currentY);
            }
            
            if (index % 2 !== 0) {
                doc.setFillColor(250, 250, 250); doc.rect(margin, currentY - 3.5, rightEdge - margin, rowHeight, 'F');
            }

            if (effectiveShowImages && item.imageUrl) {
                const asset = await loadImageForPDF(item.imageUrl);
                if (asset) doc.addImage(asset.imgData, asset.format, mediaX, currentY - 2.8, 7.5, 7.5);
            }

            doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'normal');
            if (hasSku) drawTextFit(item.sku || '', skuX, currentY, skuMaxW, 6.5);
            
            doc.setFont('helvetica', 'bold');
            if (hasDescription) drawTextFit(item.description?.toUpperCase() || '', descX, currentY, descMaxW, 7.5);
            
            doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0); // Enforce Black Text
            if (hasNormalPrice) drawTextFit(item.normalPrice || '', normalPriceX, currentY, normalW - 3, 7.5, 'left');
            
            if (hasPromoPrice) {
                if (item.promoPrice) {
                    doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold'); // Enforce Black & Bold
                    drawTextFit(item.promoPrice, promoPriceX, currentY, promoW > 0 ? promoW - 3 : 10, 8.0, 'left');
                }
            }

            doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.04);
            // Draw underline using the dynamically calculated right edge
            doc.line(margin, currentY + rowHeight - 3.5, rightEdge, currentY + rowHeight - 3.5);
            currentY += rowHeight;
        }

        doc.save(`${pricelist.title.replace(/\s+/g, '_')}_${pricelist.month}.pdf`);
    } catch (err) { alert("Unable to generate PDF."); } finally { setIsExporting(false); }
  };

  const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(prev => Math.min(prev + 0.25, 2.5)); };
  const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(prev => Math.max(prev - 0.25, 1)); };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white print:p-0 print:block overflow-hidden print:overflow-visible" onClick={onClose}>
      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          .viewer-container { box-shadow: none !important; border: none !important; display: block !important; width: 100% !important; height: auto !important; position: static !important; overflow: visible !important; }
          .spreadsheet-table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; display: table !important; }
          .spreadsheet-table th { background: #71717a !important; color: #fff !important; border: 0.2pt solid #94a3b8 !important; padding: 2pt !important; font-size: 6pt !important; }
          .spreadsheet-table td { border: 0.1pt solid #cbd5e1 !important; color: #000 !important; padding: 1.5pt 2pt !important; font-size: 6.5pt !important; vertical-align: middle !important; line-height: 1 !important; }
          .excel-row { height: auto !important; page-break-inside: avoid !important; display: table-row !important; }
        }
        
        .spreadsheet-table { border-collapse: separate; border-spacing: 0; table-layout: fixed; width: 100%; transform: translate3d(0,0,0); }
        .spreadsheet-table th { position: sticky; top: 0; z-index: 10; background-color: #71717a; color: white; padding: 12px 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
        
        /* Optimization: content-visibility allows browser to skip rendering off-screen rows */
        .excel-row { 
          height: 44px;
          content-visibility: auto;
          contain-intrinsic-size: 44px;
        }
        
        .excel-row:nth-child(even) { background-color: #f8fafc; }
        .sku-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .sku-cell { word-break: break-all; font-size: clamp(7px, 1.1vw, 10px); padding: 4px; width: 15%; }
        .desc-cell { font-size: clamp(8px, 1.2vw, 12px); padding: 4px 8px; width: auto; }
        .price-cell { font-size: clamp(9px, 1.4vw, 13px); font-weight: 900; padding: 4px; width: 14%; }
        .shrink-cell { width: 40px; }
      `}</style>

      <div className="viewer-container relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none print:shadow-none print:max-h-none print:block" onClick={e => e.stopPropagation()}>
        <div className="print-hidden p-4 md:p-6 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
          <div className="flex items-center gap-4 overflow-hidden">
             <div className="hidden md:flex bg-white/10 p-2 rounded-xl border border-white/10"><RIcon size={24} className="text-white" /></div>
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm md:text-2xl font-black uppercase tracking-tight leading-none truncate">{pricelist.title}</h2>
                  {isNewlyUpdated && (<span className="hidden sm:inline bg-white text-[#c0810d] px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black uppercase shadow-md">NEW</span>)}
                </div>
                <p className="text-yellow-100 font-bold uppercase tracking-widest text-[8px] md:text-xs mt-1">{pricelist.month} {pricelist.year}</p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {/* Persistently showing zoom controls for all screen sizes */}
             <div className="flex items-center gap-2 md:gap-3 bg-black/30 p-1 md:p-1.5 rounded-full border border-white/10">
                <button onClick={handleZoomOut} className="p-1 md:p-1.5 hover:bg-white/20 rounded-full transition-colors"><SearchIcon size={14} className="scale-x-[-1] md:w-4 md:h-4"/></button>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest min-w-[30px] md:min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} className="p-1 md:p-1.5 hover:bg-white/20 rounded-full transition-colors"><SearchIcon size={14} className="md:w-4 md:h-4"/></button>
             </div>
             <button onClick={handleExportPDF} disabled={isExporting} className="bg-[#0f172a] text-white px-3 md:px-6 py-2 md:py-3 rounded-xl font-black text-[9px] md:text-xs uppercase shadow-2xl hover:bg-black transition-all border border-white/5">
                {isExporting ? '...' : 'PDF'}
             </button>
             <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 border border-white/5"><X size={20}/></button>
          </div>
        </div>

        {pricelist.promoText && (
            <div className="w-full bg-slate-50 border-b border-slate-200 py-3 px-4 text-center print:hidden shrink-0 z-10 shadow-sm relative">
                <p className="text-slate-900 font-black uppercase tracking-widest text-xs md:text-sm leading-relaxed">
                    {pricelist.promoText}
                </p>
            </div>
        )}

        <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleDragEnd}
            className={`flex-1 overflow-auto bg-slate-100/50 relative p-0 md:p-4 print:p-0 print:overflow-visible ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          <div className="min-w-full min-h-full flex items-start justify-center">
            <div 
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: zoom > 1 ? 'max-content' : '100%' }} 
              className={`select-none relative bg-white shadow-xl rounded-xl overflow-hidden print:transform-none print:shadow-none print:rounded-none`}
            >
              <table className="spreadsheet-table w-full text-left border-collapse print:table">
                  <thead className="print:table-header-group">
                    <tr className="print:bg-[#71717a] bg-[#71717a]">
                        {hasImages && <th className="p-2 md:p-3 shrink-cell text-white">Media</th>}
                        {hasSku && <th className="p-2 md:p-3 sku-cell text-white">{headers.sku || "SKU"}</th>}
                        {hasDescription && <th className="p-2 md:p-3 desc-cell text-white">{headers.description || "Description"}</th>}
                        {hasNormalPrice && <th className="p-2 md:p-3 price-cell text-left text-white">{headers.normalPrice || "Normal Price"}</th>}
                        {hasPromoPrice && <th className="p-2 md:p-3 price-cell text-left text-white">{headers.promoPrice || "Promo Price"}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item) => (
                        <PricelistRow 
                            key={item.id} 
                            item={item} 
                            showImages={hasImages}
                            showSku={hasSku}
                            showDesc={hasDescription}
                            showNormal={hasNormalPrice}
                            showPromo={hasPromoPrice} 
                            onEnlarge={url => setEnlargedImage(url)} 
                        />
                    ))}
                    {/* Add blank rows to maintain height if needed, or leave dynamic */}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* FOOTER CONTROLS - PAGINATION ADDED */}
        <div className="p-3 md:p-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0 print:hidden z-10">
          <div className="flex items-center gap-4">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">TOTAL ITEMS: {items.length}</span>
              {totalPages > 1 && (
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollContainerRef.current?.scrollTo(0,0); }} 
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-600"
                      >
                          <ChevronLeft size={16} />
                      </button>
                      <span className="text-[10px] font-black text-slate-700 uppercase min-w-[60px] text-center">Page {currentPage} of {totalPages}</span>
                      <button 
                        onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollContainerRef.current?.scrollTo(0,0); }} 
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-600"
                      >
                          <ChevronRight size={16} />
                      </button>
                  </div>
              )}
          </div>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">OFFICIAL KIOSK PRO DOCUMENT</p>
        </div>
      </div>

      {enlargedImage && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in cursor-zoom-out print:hidden" onClick={() => setEnlargedImage(null)}>
          <img src={enlargedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="" />
        </div>
      )}
    </div>
  );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}>
    <div className="relative w-full max-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 bg-slate-900" onClick={e => e.stopPropagation()}>
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

const ComparisonModal = ({ products, onClose, onShowDetail }: { products: Product[], onClose: () => void, onShowDetail: (p: Product) => void }) => {
    const specKeys = useMemo(() => {
        const keys = new Set<string>();
        products.forEach(p => Object.keys(p.specs).forEach(k => keys.add(k)));
        return Array.from(keys).sort();
    }, [products]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in p-2 md:p-12" onClick={onClose}>
            <div className="relative w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase text-slate-900">Product Comparison</h2>
                    <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 bg-slate-50 border border-slate-200 min-w-[200px]">Feature</th>
                                {products.map(p => (
                                    <th key={p.id} className="p-4 bg-white border border-slate-200 min-w-[250px] align-top">
                                        <div className="flex flex-col items-center text-center gap-4">
                                            {p.imageUrl ? <img src={p.imageUrl} className="h-32 object-contain" /> : <div className="h-32 bg-slate-50 w-full flex items-center justify-center text-slate-300">No Image</div>}
                                            <div>
                                                <div className="font-black uppercase text-sm">{p.name}</div>
                                                <button onClick={() => onShowDetail(p)} className="mt-2 text-xs font-bold text-blue-600 uppercase hover:underline">View Details</button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {specKeys.map(key => (
                                <tr key={key}>
                                    <td className="p-4 font-bold text-slate-500 uppercase text-xs border border-slate-200 bg-slate-50">{key}</td>
                                    {products.map(p => (
                                        <td key={p.id} className="p-4 text-sm border border-slate-200 font-medium">
                                            {/* DEFENSIVE: Render non-string values safely */}
                                            {typeof p.specs[key] === 'object' ? JSON.stringify(p.specs[key]) : (p.specs[key] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime: string, onSyncRequest: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [view, setView] = useState<'brands' | 'categories' | 'products' | 'detail'>('brands');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [screensaverActive, setScreensaverActive] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  
  // Interactive Overlays
  const [viewingCatalogue, setViewingCatalogue] = useState<Catalogue | null>(null);
  const [viewingManualPricelist, setViewingManualPricelist] = useState<Pricelist | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string; pricelist?: Pricelist } | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  
  // Comparison
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const deviceType = getDeviceType();

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    const timeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;
    idleTimerRef.current = window.setTimeout(() => {
      setScreensaverActive(true);
      // Reset view to brands when screensaver activates
      setView('brands');
      setSelectedBrand(null);
      setSelectedCategory(null);
      setSelectedProduct(null);
      setViewingCatalogue(null);
      setViewingManualPricelist(null);
      setViewingPdf(null);
      setShowCompareModal(false);
    }, timeout);
  }, [storeData?.screensaverSettings?.idleTimeout]);

  const handleInteraction = useCallback(() => {
    if (screensaverActive) setScreensaverActive(false);
    if (!isAudioUnlocked) setIsAudioUnlocked(true);
    resetIdleTimer();
  }, [screensaverActive, isAudioUnlocked, resetIdleTimer]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleInteraction));
    resetIdleTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handleInteraction));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleInteraction, resetIdleTimer]);

  // Heartbeat Logic
  useEffect(() => {
      if (!isSetup) return;
      const interval = setInterval(async () => {
          const remoteCmd = await sendHeartbeat();
          if (remoteCmd?.restart) window.location.reload();
          // Potentially handle remote config changes
      }, 60000);
      return () => clearInterval(interval);
  }, [isSetup]);

  if (!isSetup && storeData) {
      return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  }

  if (!storeData) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" size={48} /></div>;

  // TV Mode Hijack
  if (deviceType === 'tv') {
      return (
          <TVMode 
            storeData={storeData} 
            onRefresh={onSyncRequest} 
            screensaverEnabled={screensaverActive} 
            onToggleScreensaver={() => setScreensaverActive(!screensaverActive)} 
            isAudioUnlocked={isAudioUnlocked} 
          />
      );
  }

  const allProducts: FlatProduct[] = storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({
      ...p,
      brandName: b.name,
      categoryName: c.name
  }))));

  const compareProducts = allProducts.filter(p => selectedForCompare.includes(p.id));

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-slate-50">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
            {view === 'brands' && (
                <BrandGrid 
                    brands={storeData.brands}
                    heroConfig={storeData.hero}
                    allCatalogs={storeData.catalogues}
                    ads={storeData.ads}
                    onSelectBrand={(b) => { setSelectedBrand(b); setView('categories'); }}
                    onViewGlobalCatalog={(c) => c.pdfUrl ? setViewingPdf({ url: c.pdfUrl, title: c.title }) : setViewingCatalogue(c)}
                    onViewWebsite={(url) => window.open(url, '_blank')}
                    onExport={() => setShowCreator(true)}
                    screensaverEnabled={screensaverActive}
                    onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                    deviceType={deviceType}
                />
            )}

            {view === 'categories' && selectedBrand && (
                <CategoryGrid 
                    brand={selectedBrand}
                    storeCatalogs={storeData.catalogues}
                    pricelists={storeData.pricelists}
                    onSelectCategory={(c) => { setSelectedCategory(c); setView('products'); }}
                    onBack={() => { setSelectedBrand(null); setView('brands'); }}
                    onViewCatalog={(c) => c.pdfUrl ? setViewingPdf({ url: c.pdfUrl, title: c.title }) : setViewingCatalogue(c)}
                    screensaverEnabled={screensaverActive}
                    onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                />
            )}

            {view === 'products' && selectedCategory && selectedBrand && (
                <ProductList 
                    category={selectedCategory}
                    brand={selectedBrand}
                    storeCatalogs={storeData.catalogues || []}
                    onSelectProduct={(p) => { setSelectedProduct(p); setView('detail'); }}
                    onBack={() => { setSelectedCategory(null); setView('categories'); }}
                    onViewCatalog={(pages) => setViewingCatalogue({ id: 'temp', title: 'Product Catalog', pages, type: 'catalogue' })}
                    screensaverEnabled={screensaverActive}
                    onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                    selectedForCompare={selectedForCompare}
                    onToggleCompare={(p) => setSelectedForCompare(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                    onStartCompare={() => setShowCompareModal(true)}
                />
            )}

            {view === 'detail' && selectedProduct && (
                <ProductDetail 
                    product={selectedProduct}
                    onBack={() => { setSelectedProduct(null); setView('products'); }}
                    screensaverEnabled={screensaverActive}
                    onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                />
            )}
        </div>

        {/* Global Overlays */}
        {screensaverActive && (
            <Screensaver 
                products={allProducts}
                ads={storeData.ads?.screensaver || []}
                pamphlets={storeData.catalogues?.filter(c => c.type === 'pamphlet') || []}
                settings={storeData.screensaverSettings}
                onWake={() => setScreensaverActive(false)}
                isAudioUnlocked={isAudioUnlocked}
            />
        )}

        {viewingCatalogue && (
            <Flipbook 
                pages={viewingCatalogue.pages} 
                onClose={() => setViewingCatalogue(null)} 
                catalogueTitle={viewingCatalogue.title}
                startDate={viewingCatalogue.startDate}
                endDate={viewingCatalogue.endDate}
                promoText={viewingCatalogue.promoText}
            />
        )}

        {viewingManualPricelist && (
            <ManualPricelistViewer 
                pricelist={viewingManualPricelist} 
                onClose={() => setViewingManualPricelist(null)} 
                companyLogo={storeData.companyLogoUrl}
                brandLogo={selectedBrand?.logoUrl} // Best effort guess
                brandName={selectedBrand?.name}
            />
        )}

        {viewingPdf && (
            <PdfViewer 
                url={viewingPdf.url} 
                title={viewingPdf.title} 
                pricelist={viewingPdf.pricelist}
                onClose={() => setViewingPdf(null)} 
            />
        )}

        {showCompareModal && (
            <ComparisonModal 
                products={compareProducts} 
                onClose={() => setShowCompareModal(false)}
                onShowDetail={(p) => { 
                    setShowCompareModal(false); 
                    setSelectedBrand(storeData.brands.find(b => b.name === (p as any).brandName) || null);
                    setSelectedCategory(storeData.brands.flatMap(b => b.categories).find(c => c.name === (p as any).categoryName) || null);
                    setSelectedProduct(p); 
                    setView('detail'); 
                }}
            />
        )}

        <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />

        {/* Pricelist Sidebar Toggle */}
        <div className="absolute top-24 right-0 z-40 hidden lg:block">
             {/* Logic for sidebar would go here if needed */}
        </div>
    </div>
  );
};
