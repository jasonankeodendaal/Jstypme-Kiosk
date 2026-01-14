
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Image as ImageIcon, SearchIcon, Minus, Plus, ToggleLeft, ToggleRight, Globe, Activity, ChevronLeft, ArrowRight } from 'lucide-react';
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
    const [step, setStep] = useState(1);
    const [shopName, setShopName] = useState('');
    const [deviceType, setDeviceType] = useState<'kiosk' | 'mobile' | 'tv'>('kiosk');
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

    return (
        <div className="fixed inset-0 z-[300] bg-[#0f172a] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden border-2 border-white">
                <div className="bg-[#1e293b] text-white p-6 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-600 p-2 rounded-lg mb-3">
                            <Store size={28} />
                        </div>
                        <h1 style={{fontSize: '24px', fontWeight: 900}} className="uppercase tracking-tight">System Setup</h1>
                        <p style={{color: '#94a3b8', fontSize: '10px', fontWeight: 'bold'}} className="uppercase tracking-widest mt-1">Kiosk Firmware v2.8</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 rounded-full transition-all ${step >= s ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}></div>
                        ))}
                    </div>

                    <div style={{minHeight: '200px'}}>
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
                    </div>

                    {error && <div style={{background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171'}} className="mt-4 p-3 rounded-lg text-xs font-black uppercase flex items-center gap-2"> {error}</div>}

                    <div className="mt-8 flex gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-200 text-black rounded-lg font-black uppercase text-xs tracking-widest">Back</button>
                        )}
                        <button 
                            onClick={handleNext}
                            disabled={isProcessing}
                            className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" size={14} /> Syncing...</>
                            ) : (
                                <>{step === 3 ? 'Start Application' : 'Next Step'} <ChevronRight size={14} /></>
                            )}
                        </button>
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
        {showNormal && <td className={`price-cell text-right ${showPromo ? 'border-r border-slate-100' : ''} whitespace-nowrap`}><span className="font-bold text-slate-900">{item.normalPrice || ''}</span></td>}
        {showPromo && (
            <td className="price-cell text-right bg-slate-50/10 whitespace-nowrap">{item.promoPrice ? (<span className="font-black text-[#ef4444] tracking-tighter">{item.promoPrice}</span>) : null}</td>
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
        
        // Dynamic Column Width Calculation
        const mediaW = effectiveShowImages ? 14 : 0;
        const normalW = hasNormalPrice ? 22 : 0;
        const promoW = hasPromoPrice ? 22 : 0;
        const skuW = hasSku ? (effectiveShowImages ? 20 : 25) : 0;
        const fixedW = mediaW + skuW + normalW + promoW;
        
        // Distribute remaining width to description
        const descW = hasDescription ? Math.max(10, innerWidth - fixedW) : 0;

        // Calculate X Positions
        let currentX = margin;
        const mediaX = currentX + 1; 
        if (effectiveShowImages) currentX += mediaW;
        
        const skuX = currentX + 1.5;
        if (hasSku) currentX += skuW;
        
        const descX = currentX + 1.5;
        if (hasDescription) currentX += descW;
        
        const normalPriceX = currentX + normalW - 1.5; // Right aligned anchor
        if (hasNormalPrice) currentX += normalW;
        
        const promoPriceX = currentX + promoW - 1.5; // Right aligned anchor
        if (hasPromoPrice) currentX += promoW;
        
        const rightEdge = currentX;

        const skuMaxW = skuW - 3;
        const descMaxW = descW - 3;

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
            const titleText = pricelist.kind === 'promotion' ? "PROMOTION LIST" : "PRICE LIST";
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
                 topY += 6; 
            }

            doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.1);
            doc.line(margin, topY + 26, pageWidth - margin, topY + 26);
            return topY + 32;
        };

        const drawTableHeaders = (startY: number) => {
            doc.setFillColor(113, 113, 122); 
            doc.rect(margin, startY - 4.5, rightEdge - margin, 6, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
            if (effectiveShowImages) doc.text("MEDIA", mediaX, startY);
            if (hasSku) doc.text((headers.sku || "SKU").toUpperCase(), skuX, startY); 
            if (hasDescription) doc.text((headers.description || "DESCRIPTION").toUpperCase(), descX, startY);
            if (hasNormalPrice) doc.text((headers.normalPrice || "NORMAL").toUpperCase(), normalPriceX, startY, { align: 'right' });
            if (hasPromoPrice) doc.text((headers.promoPrice || "PROMO").toUpperCase(), promoPriceX, startY, { align: 'right' });
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
            
            doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
            if (hasNormalPrice) drawTextFit(item.normalPrice || '', normalPriceX, currentY, normalW - 3, 7.5, 'right');
            
            if (hasPromoPrice) {
                if (item.promoPrice) {
                    doc.setTextColor(239, 68, 68); doc.setFont('helvetica', 'bold');
                    drawTextFit(item.promoPrice, promoPriceX, currentY, promoW - 3, 8.0, 'right');
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
                        {hasNormalPrice && <th className="p-2 md:p-3 price-cell text-right text-white">{headers.normalPrice || "Normal Price"}</th>}
                        {hasPromoPrice && <th className="p-2 md:p-3 price-cell text-right text-white">{headers.promoPrice || "Promo Price"}</th>}
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
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-slate-900 flex items-center gap-3"><Layers className="text-blue-600" /> Product Comparison</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase">Side-by-side Technical Analysis</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-20 bg-white shadow-sm">
                            <tr>
                                <th className="p-6 bg-slate-50 w-64 border-r border-slate-100 shrink-0"></th>
                                {products.map(p => (
                                    <th key={p.id} className="p-6 border-r border-slate-100 text-center min-w-[300px]">
                                        <div className="flex flex-col items-center">
                                            <div className="w-40 h-40 bg-white p-2 rounded-2xl mb-4 flex items-center justify-center shadow-sm border border-slate-100">
                                                {p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}
                                            </div>
                                            <h3 className="font-black text-lg text-slate-900 uppercase leading-tight mb-1">{p.name}</h3>
                                            <div className="text-[10px] font-mono font-bold text-slate-400 mb-4">{p.sku || 'NO SKU'}</div>
                                            <button onClick={() => { onShowDetail(p); onClose(); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">View Details</button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Description</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-medium text-slate-600 leading-relaxed italic border-r border-slate-100">{p.description ? p.description.substring(0, 150) + '...' : 'No description provided.'}</td>))}</tr>
                            {specKeys.map(key => (<tr key={key} className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">{key}</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-black text-slate-900 border-r border-slate-100">{p.specs[key] || <span className="text-slate-200">—</span>}</td>))}</tr>))}
                            <tr className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Key Features</td>{products.map(p => (<td key={p.id} className="p-6 border-r border-slate-100"><ul className="space-y-2">{p.features.slice(0, 5).map((f, i) => (<li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-700"><Check size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}</li>))}{p.features.length > 5 && <li className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-5">+{p.features.length - 5} more</li>}</ul></td>))}</tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SearchModal = ({ storeData, onClose, onSelectProduct }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void }) => {
    const [query, setQuery] = useState('');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterHasVideo, setFilterHasVideo] = useState(false);
    const allFlattenedProducts = useMemo(() => storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({...p, brandName: b.name, brandId: b.id, categoryName: c.name, categoryId: c.id})))), [storeData]);
    const results = useMemo(() => {
        const lower = query.toLowerCase().trim();
        return allFlattenedProducts.filter(p => {
            const matchesQuery = !lower || p.name.toLowerCase().includes(lower) || (p.sku && p.sku.toLowerCase().includes(lower)) || p.description.toLowerCase().includes(lower);
            const matchesBrand = filterBrand === 'all' || p.brandId === filterBrand;
            const matchesCat = filterCategory === 'all' || p.categoryName === filterCategory;
            const matchesVideo = !filterHasVideo || (p.videoUrl || (p.videoUrls && p.videoUrls.length > 0));
            return matchesQuery && matchesBrand && matchesCat && matchesVideo;
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [query, filterBrand, filterCategory, filterHasVideo, allFlattenedProducts]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in" onClick={onClose}>
            <div className="p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
                <div className="shrink-0 mb-8"><div className="relative group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 group-focus-within:scale-110 transition-transform" /><input autoFocus type="text" placeholder="Find any product, SKU, or feature..." className="w-full bg-white/10 text-white placeholder:text-slate-500 text-3xl md:text-5xl font-black uppercase tracking-tight py-6 pl-20 pr-20 border-b-4 border-white/10 outline-none focus:border-blue-500 transition-all rounded-t-3xl" value={query} onChange={(e) => setQuery(e.target.value)} /><button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2"><X size={40} /></button></div></div>
                <div className="shrink-0 flex wrap gap-4 mb-8"><div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10"><div className="p-2 bg-blue-600 rounded-lg text-white"><Filter size={16} /></div><select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"><option value="all" className="bg-slate-900">All Brands</option>{storeData.brands.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}</select></div><div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10"><div className="p-2 bg-purple-600 rounded-lg text-white"><LayoutGrid size={16} /></div><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"><option value="all" className="bg-slate-900">All Categories</option>{Array.from(new Set(allFlattenedProducts.map(p => p.categoryName))).sort().map(c => (<option key={c} value={c} className="bg-slate-900">{c}</option>))}</select></div></div>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{results.map(p => (<button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className="group bg-white rounded-3xl overflow-hidden flex flex-col text-left transition-all hover:scale-105 active:scale-95 shadow-xl border-4 border-transparent hover:border-blue-500"><div className="aspect-square bg-white relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}</div><div className="p-4 bg-slate-50/50 flex-1 flex flex-col"><h4 className="font-black text-slate-900 uppercase text-xs leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{p.name}</h4><div className="mt-auto text-[9px] font-mono font-bold text-slate-400">{p.sku || 'N/A'}</div></div></button>))}</div></div>
            </div>
        </div>
    );
};

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
  const [viewingWebsite, setViewingWebsite] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const timerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;

  // SYSTEM WATCHDOG HEARTBEAT
  useEffect(() => {
    const heartbeat = setInterval(() => {
        if (window.signalAppHeartbeat) {
            window.signalAppHeartbeat();
        }
    }, 2000);
    return () => clearInterval(heartbeat);
  }, []);
  
  useEffect(() => {
    const unlockAudio = () => {
        if (!isAudioUnlocked) {
            setIsAudioUnlocked(true);
            const silentCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buffer = silentCtx.createBuffer(1, 1, 22050);
            const source = silentCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(silentCtx.destination);
            source.start(0);
        }
    };
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('mousedown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
  }, [isAudioUnlocked]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        // Clear all navigation state on idle timeout
        setIsIdle(true); 
        setActiveProduct(null); 
        setActiveCategory(null); 
        setActiveBrand(null); 
        setShowFlipbook(false); 
        setViewingPdf(null); 
        setViewingManualList(null); 
        setShowPricelistModal(false); 
        setShowGlobalSearch(false); 
        setShowCompareModal(false); 
        setCompareProductIds([]); 
        setViewingWebsite(null);
        // Clear history stack
        if (window.history.length > 1) {
            window.history.go(-(window.history.length - 1));
        }
      }, idleTimeout);
    }
  }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);

  const resetDeviceIdentity = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);

  useEffect(() => {
    window.addEventListener('touchstart', resetIdleTimer); window.addEventListener('click', resetIdleTimer);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true)); window.addEventListener('offline', () => setIsOnline(false));
    checkCloudConnection().then(setIsCloudConnected);
    if (isSetup) {
      const syncCycle = async () => {
         const syncResult = await sendHeartbeat();
         if (syncResult?.deleted) { resetDeviceIdentity(); } else if (syncResult?.restart) { window.location.reload(); }
      };
      syncCycle(); const interval = setInterval(syncCycle, 30000);
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity]);

  // --- HARDWARE BACK BUTTON LOGIC ---
  useEffect(() => {
      const handlePopState = (event: PopStateEvent) => {
          // If we have a modal open, close it first
          if (viewingPdf || viewingManualList || showFlipbook || showPricelistModal || showGlobalSearch || showCompareModal || viewingWebsite) {
              setViewingPdf(null);
              setViewingManualList(null);
              setShowFlipbook(false);
              setShowPricelistModal(false);
              setShowGlobalSearch(false);
              setShowCompareModal(false);
              setViewingWebsite(null);
              return;
          }

          // If product open -> close product (back to list)
          if (activeProduct) {
              setActiveProduct(null);
              return;
          }
          // If category open -> close category (back to brand)
          if (activeCategory) {
              setActiveCategory(null);
              return;
          }
          // If brand open -> close brand (back to home)
          if (activeBrand) {
              setActiveBrand(null);
              return;
          }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [activeProduct, activeCategory, activeBrand, viewingPdf, viewingManualList, showFlipbook, showPricelistModal, showGlobalSearch, showCompareModal, viewingWebsite]);

  // Helper to push history state when navigating deeper
  const navigateDeeper = () => {
      window.history.pushState({ depth: Date.now() }, '', '');
  };

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);

  const pricelistBrands = useMemo(() => (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name)), [storeData?.pricelistBrands]);
  const toggleCompareProduct = (product: Product) => setCompareProductIds(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(-5));
  const productsToCompare = useMemo(() => allProductsFlat.filter(p => compareProductIds.includes(p.id)), [allProductsFlat, compareProductIds]);

  const activePricelistBrand = useMemo(() => {
      if (!viewingManualList) return undefined;
      let found: any = pricelistBrands.find(b => b.id === viewingManualList.brandId);
      if (!found && storeData?.brands) {
          found = storeData.brands.find(b => b.id === viewingManualList.brandId);
      }
      return found;
  }, [viewingManualList, pricelistBrands, storeData?.brands]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} isAudioUnlocked={isAudioUnlocked} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} isAudioUnlocked={isAudioUnlocked} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
           <div className="flex items-center flex-1 max-w-xs md:max-w-md overflow-hidden mr-4">
               <button onClick={() => { setShowGlobalSearch(true); navigateDeeper(); }} className="flex items-center gap-3 bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-white px-3 md:px-4 py-1 rounded-lg border border-white/5 transition-all group w-full text-left">
                   <Search size={12} className="text-blue-500 group-hover:text-blue-400" />
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">Inventory Search...</span>
               </button>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
               <div className="hidden lg:flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
                    <Activity size={12} className="text-green-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Watchdog Active</span>
               </div>
               {deviceType === 'kiosk' && (
                   <button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'}`}>
                       {screensaverEnabled ? <MonitorPlay size={14} className="animate-pulse" /> : <MonitorStop size={14} />}
                       <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest hidden sm:inline">{screensaverEnabled ? 'Screensaver ON' : 'Screensaver OFF'}</span>
                   </button>
               )}
               <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}><Cloud size={8} /></div>
               <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                   <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}><ZoomOut size={12} /></button>
               </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? 
            <BrandGrid 
                brands={storeData.brands || []} 
                heroConfig={storeData.hero} 
                allCatalogs={storeData.catalogues || []} 
                ads={storeData.ads} 
                onSelectBrand={(b) => { setActiveBrand(b); navigateDeeper(); }} 
                onViewGlobalCatalog={(c:any) => { navigateDeeper(); if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} 
                onViewWebsite={(url) => { navigateDeeper(); setViewingWebsite(url); }} 
                onExport={() => {}} 
                screensaverEnabled={screensaverEnabled} 
                onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} 
                deviceType={deviceType} 
            /> : 
          !activeCategory ? 
            <CategoryGrid 
                brand={activeBrand} 
                storeCatalogs={storeData.catalogues || []} 
                onSelectCategory={(c) => { setActiveCategory(c); navigateDeeper(); }} 
                onViewCatalog={(c:any) => { navigateDeeper(); if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} 
                onBack={() => window.history.back()} 
                screensaverEnabled={screensaverEnabled} 
                onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} 
                showScreensaverButton={false} 
            /> : 
          !activeProduct ? 
            <ProductList 
                category={activeCategory} 
                brand={activeBrand} 
                storeCatalogs={storeData.catalogues || []} 
                onSelectProduct={(p) => { setActiveProduct(p); navigateDeeper(); }} 
                onBack={() => window.history.back()} 
                onViewCatalog={() => {}} 
                screensaverEnabled={screensaverEnabled} 
                onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} 
                showScreensaverButton={false} 
                selectedForCompare={compareProductIds} 
                onToggleCompare={toggleCompareProduct} 
                onStartCompare={() => { navigateDeeper(); setShowCompareModal(true); }} 
            /> : 
            <ProductDetail 
                product={activeProduct} 
                onBack={() => window.history.back()} 
                screensaverEnabled={screensaverEnabled} 
                onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} 
                showScreensaverButton={false} 
            />
         }
       </div>
       <footer className="relative shrink-0 bg-white border-t border-slate-200 h-10 flex items-center justify-between px-2 md:px-6 z-50 text-[7px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
              <div className="flex items-center gap-1 shrink-0"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase whitespace-nowrap">{isOnline ? 'Live' : 'Offline'}</span></div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 md:pl-4 shrink-0"><span className="font-black text-slate-300 uppercase hidden md:inline">ID:</span><span className="font-mono font-bold text-slate-600">{kioskId}</span></div>
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2 md:pl-4 truncate"><RefreshCw size={8} className="text-slate-300 hidden md:inline" /><span className="font-bold uppercase text-slate-400">Sync: {lastSyncTime || '--:--'}</span></div>
          </div>
          {pricelistBrands.length > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                  <button onClick={() => { navigateDeeper(); setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-white ring-8 ring-blue-600/5 group"><RIcon size={16} className="text-white group-hover:scale-110 transition-transform" /></button>
              </div>
          )}
          <div className="flex items-center gap-4 shrink-0 ml-2"><button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:text-blue-600 transition-colors"><span>JSTYP</span></button></div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showGlobalSearch && <SearchModal storeData={storeData} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b => b.id === (p as any).brandId)!); setActiveCategory(storeData.brands.find(b => b.id === (p as any).brandId)!.categories.find(c => c.id === (p as any).categoryId)!); setActiveProduct(p); }} onClose={() => window.history.back()} />}
       {showCompareModal && <ComparisonModal products={productsToCompare} onClose={() => window.history.back()} onShowDetail={(p) => { setShowCompareModal(false); setActiveProduct(p); }} />}
       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in print:hidden" onClick={() => window.history.back()}>
               <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0"><h2 className="text-base md:text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2><button onClick={() => window.history.back()} className="p-2 rounded-full transition-colors hover:bg-slate-200"><X size={24} className="text-slate-500" /></button></div>
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row"><div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden flex flex-col"><div className="md:hidden"><div className="overflow-x-auto no-scrollbar py-2"><div className="grid grid-rows-2 grid-flow-col gap-2 px-2 min-w-max">{pricelistBrands.map(brand => (<button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`flex items-center gap-2 p-2 rounded-xl border transition-all min-w-[120px] ${selectedBrandForPricelist === brand.id ? 'bg-white border-green-500 shadow-sm ring-1 ring-green-500/20' : 'bg-slate-100 border-transparent hover:bg-white'}`}><div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-[10px]">{brand.name.charAt(0)}</span>}</div><span className={`font-black text-[9px] uppercase leading-tight truncate flex-1 text-left ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-500'}`}>{brand.name}</span></button>))}</div></div></div><div className="hidden md:flex flex-1 flex-col overflow-y-auto no-scrollbar">{pricelistBrands.map(brand => (<button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}><div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}</div><span className={`font-black text-sm uppercase leading-tight ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-400'}`}>{brand.name}</span></button>))}</div></div><div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50 relative">{selectedBrandForPricelist ? (<div className="animate-fade-in"><div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{storeData.pricelists?.filter(p => {
                       if (p.brandId !== selectedBrandForPricelist) return false;
                       // Expiration Filter: Hide promos that ended BEFORE today
                       if (p.kind === 'promotion' && p.endDate) {
                           const end = new Date(p.endDate);
                           const now = new Date();
                           // Set end date to end of day (23:59:59) so it expires only AFTER the day is over
                           end.setHours(23, 59, 59, 999);
                           if (now > end) return false;
                       }
                       return true;
                   }).map(pl => (<button key={pl.id} onClick={() => { navigateDeeper(); if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-white hover:border-green-400'}`}><div className="aspect-[3/4] bg-slate-50 relative p-2 md:p-3 overflow-hidden">{pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded shadow-sm" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">{pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}</div>}<div className={`absolute top-2 right-2 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-50'}`}>{pl.type === 'manual' ? 'TABLE' : 'PDF'}</div></div><div className="p-3 flex-1 flex flex-col justify-between bg-white"><h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase leading-tight line-clamp-2">{pl.title}</h3><div className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-2">{pl.month} {pl.year}</div></div></button>))}</div></div>) : <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"><RIcon size={64} className="opacity-10" /></div>}</div></div></div></div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => window.history.back()} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => window.history.back()} />}
       {viewingManualList && (
          <ManualPricelistViewer 
            pricelist={viewingManualList} 
            onClose={() => window.history.back()} 
            companyLogo={storeData.companyLogoUrl || storeData.hero.logoUrl}
            brandLogo={activePricelistBrand?.logoUrl}
            brandName={activePricelistBrand?.name}
          />
       )}
       {viewingWebsite && (
           <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-fade-in print:hidden">
               <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 border-b border-white/5 shadow-xl">
                   <div className="flex items-center gap-4">
                       <div className="p-2 bg-blue-600 rounded-xl"><Globe size={20} /></div>
                       <div className="flex flex-col">
                           <span className="text-xs font-black uppercase tracking-widest leading-none">In-App Browser</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 truncate max-w-xs">{viewingWebsite.replace(/^https?:\/\//, '')}</span>
                       </div>
                   </div>
                   <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"><X size={16} strokeWidth={3} /> Exit Browser</button>
               </div>
               <div className="flex-1 bg-white relative overflow-hidden">
                   {/* Improved iframe implementation for better scaling and correctness */}
                   <iframe 
                      src={viewingWebsite} 
                      className="absolute inset-0 w-full h-full border-none" 
                      title="Kiosk Web Portal" 
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      loading="lazy"
                      importance="high"
                   />
               </div>
           </div>
       )}
    </div>
  );
};

export default KioskApp;
