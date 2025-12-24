
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip } from 'lucide-react';
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
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

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
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(null); return; }
                
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                
                resolve({ 
                    imgData: dataUrl, 
                    format: 'PNG', 
                    width: img.width, 
                    height: img.height 
                });
            } catch (err) {
                console.error("PDF Image processing failed", err);
                resolve(null);
            }
        };
        
        img.onerror = () => {
            console.warn("Failed to load image for PDF:", url);
            resolve(null);
        };
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
        
        const [brandAsset, companyAsset] = await Promise.all([
            brandLogo ? loadImageForPDF(brandLogo) : Promise.resolve(null),
            companyLogo ? loadImageForPDF(companyLogo) : Promise.resolve(null)
        ]);

        const drawHeader = (pageNum: number) => {
            let topY = 15;
            if (brandAsset) {
                const ratio = brandAsset.width / brandAsset.height;
                const h = 20; 
                const w = h * ratio;
                doc.addImage(brandAsset.imgData, brandAsset.format, margin, topY, w, h);
            } else if (brandName) {
                doc.setTextColor(30, 41, 59); doc.setFontSize(28); doc.setFont('helvetica', 'black');
                doc.text(brandName.toUpperCase(), margin, topY + 15);
            }

            if (companyAsset) {
                const ratio = companyAsset.width / companyAsset.height;
                const h = 12; 
                const w = h * ratio;
                doc.addImage(companyAsset.imgData, companyAsset.format, pageWidth - margin - w, topY, w, h);
            }

            doc.setTextColor(0, 0, 0); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
            doc.text("PRICE LIST", margin, topY + 28);
            
            doc.setTextColor(30, 41, 59); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
            doc.text(pricelist.title.toUpperCase(), margin, topY + 36);

            const boxW = 45; const boxH = 9; const boxX = pageWidth - margin - boxW; const boxY = topY + 22;
            doc.setFillColor(30, 41, 59); doc.rect(boxX, boxY, boxW, boxH, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.text(`${pricelist.month} ${pricelist.year}`.toUpperCase(), boxX + (boxW/2), boxY + 6, { align: 'center' });
            
            doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
            doc.text(`DOCUMENT REF: ${pricelist.id.substring(0,10).toUpperCase()}`, boxX + boxW, boxY + 14, { align: 'right' });

            doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
            doc.line(margin, topY + 44, pageWidth - margin, topY + 44);
            
            return topY + 54;
        };

        const drawTableHeaders = (startY: number) => {
            doc.setFillColor(113, 113, 122); doc.rect(margin, startY - 7, pageWidth - (margin * 2), 10, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text("SKU", margin + 3, startY); doc.text("DESCRIPTION", margin + 45, startY);
            doc.text("NORMAL", pageWidth - margin - 40, startY, { align: 'right' });
            doc.text("PROMO", pageWidth - margin - 5, startY, { align: 'right' });
            return startY + 8;
        };

        const drawTextShrinkToFit = (text: string, x: number, y: number, maxWidth: number, baseSize: number, align: 'left' | 'right' = 'left') => {
            let currentSize = baseSize;
            doc.setFontSize(currentSize);
            while (doc.getTextWidth(text) > maxWidth && currentSize > 5.5) {
                currentSize -= 0.5;
                doc.setFontSize(currentSize);
            }
            doc.text(text, x, y, { align });
        };

        let currentY = drawHeader(1);
        currentY = drawTableHeaders(currentY);
        
        const items = pricelist.items || [];
        const rowHeight = 9; const footerMargin = 20;

        items.forEach((item, index) => {
            if (currentY + rowHeight > pageHeight - footerMargin) {
                doc.addPage();
                currentY = drawHeader(doc.internal.getNumberOfPages());
                currentY = drawTableHeaders(currentY);
            }
            
            if (index % 2 !== 0) {
                doc.setFillColor(250, 250, 250); doc.rect(margin, currentY - 6, pageWidth - (margin * 2), rowHeight, 'F');
            }

            doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'normal');
            drawTextShrinkToFit(item.sku || '', margin + 3, currentY, 38, 8);
            
            doc.setFont('helvetica', 'bold');
            const desc = item.description.toUpperCase();
            drawTextShrinkToFit(desc, margin + 45, currentY, (pageWidth - margin - 45) - 45, 8.5);
            
            doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
            drawTextShrinkToFit(item.normalPrice || '', pageWidth - margin - 40, currentY, 32, 8, 'right');
            
            if (item.promoPrice) {
                doc.setTextColor(239, 68, 68); doc.setFont('helvetica', 'bold');
                drawTextShrinkToFit(item.promoPrice, pageWidth - margin - 5, currentY, 32, 10, 'right');
            } else {
                doc.setTextColor(0, 0, 0); 
                drawTextShrinkToFit(item.normalPrice || '', pageWidth - margin - 5, currentY, 32, 8, 'right');
            }
            
            currentY += rowHeight;
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text(`Kiosk Pro Smart Retail Solution • ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
        }
        doc.save(`${pricelist.title.replace(/\s+/g, '_')}_${pricelist.month}.pdf`);
    } catch (err) {
        console.error("PDF Export failed", err);
        alert("Unable to generate PDF.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(prev => Math.min(prev + 0.25, 2.5)); };
  const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(prev => Math.max(prev - 0.25, 1)); };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white print:p-0 print:block overflow-hidden print:overflow-visible" onClick={onClose}>
      <style>{`
        @media print {
          @page { size: portrait; margin: 5mm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; height: auto !important; width: 100% !important; overflow: visible !important; transform: none !important; zoom: 1 !important; }
          .print-hidden { display: none !important; }
          .print-only { display: block !important; }
          #root, .relative, .viewer-container, .table-scroll { display: block !important; position: static !important; height: auto !important; width: 100% !important; overflow: visible !important; transform: none !important; zoom: 1 !important; }
          .viewer-container { box-shadow: none !important; border: none !important; }
          .spreadsheet-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
          .spreadsheet-table thead { display: table-header-group !important; }
          .spreadsheet-table tr { page-break-inside: avoid !important; }
          .spreadsheet-table th { position: static !important; background: #71717a !important; color: #fff !important; border: 1pt solid #cbd5e1 !important; font-weight: 900 !important; text-transform: uppercase !important; padding: 8pt !important; font-size: 10pt !important; }
          .spreadsheet-table td { border: 0.5pt solid #e2e8f0 !important; color: #000 !important; padding: 8pt !important; font-size: 10pt !important; }
          .excel-row:nth-child(even) { background-color: #f8fafc !important; }
        }
        .spreadsheet-table { border-collapse: separate; border-spacing: 0; table-layout: fixed; }
        .spreadsheet-table th { position: sticky; top: 0; z-index: 10; background-color: #71717a; color: white; box-shadow: inset 0 -1px 0 #3f3f46; white-space: nowrap; }
        .excel-row:nth-child(even) { background-color: #f8fafc; }
        .excel-row:hover { background-color: #f1f5f9; }
        .sku-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .shrink-title { font-size: clamp(0.75rem, 2.5vw, 1.5rem); }
        .fit-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; }
        .sku-cell { word-break: break-all; line-height: 1.1; font-size: clamp(8px, 1.2vw, 14px); }
        .desc-cell { line-height: 1.2; font-size: clamp(9px, 1.3vw, 15px); }
      `}</style>

      <div className={`viewer-container relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none print:shadow-none print:max-h-none print:block`} onClick={e => e.stopPropagation()}>
        <div className={`print-hidden p-4 md:p-8 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]`}>
          <div className="flex items-center gap-6">
             <div className="flex bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner">
                <RIcon size={36} className="text-white" />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg md:text-3xl font-black uppercase tracking-tight leading-none shrink-title">{pricelist.title}</h2>
                  {isNewlyUpdated && (
                    <span className="bg-white text-yellow-700 px-3 py-1 rounded-full text-[10px] md:text-[12px] font-black uppercase flex items-center gap-1.5 shadow-md">
                      <Sparkles size={12} fill="currentColor" /> NEW
                    </span>
                  )}
                </div>
                <p className="text-yellow-100 font-bold uppercase tracking-widest text-[10px] md:text-sm mt-1">{pricelist.month} {pricelist.year}</p>
             </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <div className="hidden sm:flex items-center gap-3 bg-black/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <button onClick={handleZoomOut} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"><ZoomOut size={22}/></button>
                <span className="text-xs font-black uppercase tracking-widest min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"><ZoomIn size={22}/></button>
             </div>
             
             <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-3 bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-xs md:text-sm uppercase shadow-2xl hover:bg-black transition-all active:scale-95 group disabled:opacity-50 min-w-[200px] justify-center border border-white/5">
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={22} className="text-blue-400 group-hover:text-white" />}
                <span>{isExporting ? 'Generating...' : 'Save as PDF'}</span>
             </button>

             <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5"><X size={28}/></button>
          </div>
        </div>

        <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
            className={`table-scroll flex-1 overflow-auto bg-slate-100/50 relative p-0 md:p-6 print:p-0 print:overflow-visible ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          <div className="min-w-full min-h-full flex items-start justify-center">
            <div 
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'top left',
                width: zoom > 1 ? 'max-content' : '100%'
              }} 
              className="transition-transform duration-200 print:transform-none select-none relative bg-white shadow-xl rounded-xl overflow-hidden"
            >
              <table className="spreadsheet-table w-full text-left border-collapse print:table">
                  <thead className="print:table-header-group">
                  <tr className="hidden print:table-row border-none">
                      <th colSpan={4} className="p-0 border-none bg-white">
                          <div className="w-full px-10 pt-10 pb-6 text-left">
                              <div className="flex justify-between items-start mb-10">
                                  <div className="flex flex-col gap-6">
                                      {brandLogo ? (
                                          <img src={brandLogo} alt="Brand" className="h-20 object-contain self-start" />
                                      ) : brandName ? (
                                          <h2 className="text-6xl font-black uppercase tracking-tighter text-slate-900 leading-none">{brandName}</h2>
                                      ) : null}
                                      <div>
                                          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none mt-4">Price List</h1>
                                          <p className="text-xl font-bold text-slate-900 uppercase tracking-[0.2em] mt-3">{pricelist.title}</p>
                                      </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-6 text-right">
                                      {companyLogo && <img src={companyLogo} alt="Company" className="h-14 object-contain" />}
                                      <div>
                                          <div className="bg-slate-900 text-white px-6 py-2 rounded-xl text-lg font-black uppercase tracking-widest inline-block">{pricelist.month} {pricelist.year}</div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-4">Document REF: {pricelist.id.substring(0,10).toUpperCase()}</p>
                                      </div>
                                  </div>
                              </div>
                              <div className="h-1 bg-slate-200 w-full rounded-full mb-10"></div>
                          </div>
                      </th>
                  </tr>
                  
                  <tr className="print:bg-[#71717a] bg-[#71717a]">
                      <th className="p-4 md:p-6 text-[11px] md:sm font-black uppercase tracking-tight border-r border-white/10 w-[20%] text-white">SKU</th>
                      <th className="p-4 md:p-6 text-[11px] md:sm font-black uppercase tracking-tight border-r border-white/10 w-[50%] text-white">Description</th>
                      <th className="p-4 md:p-6 text-[11px] md:sm font-black uppercase tracking-tight border-r border-white/10 text-right w-[15%] text-white">Normal</th>
                      <th className="p-4 md:p-6 text-[11px] md:sm font-black uppercase tracking-tight text-right w-[15%] text-white">Promo</th>
                  </tr>
                  </thead>
                  <tbody className="print:table-row-group">
                  {(pricelist.items || []).map((item) => (
                      <tr key={item.id} className="excel-row transition-colors group border-b border-slate-100">
                      <td className="p-4 md:p-5 border-r border-slate-100 sku-cell">
                          <span className="sku-font font-bold text-slate-900 uppercase fit-text">
                          {item.sku || ''}
                          </span>
                      </td>
                      <td className="p-4 md:p-5 border-r border-slate-100 desc-cell">
                          <span className="font-bold text-slate-900 uppercase tracking-tight group-hover:text-[#c0810d] transition-colors fit-text">
                              {item.description}
                          </span>
                      </td>
                      <td className="p-4 md:p-5 text-right border-r border-slate-100 whitespace-nowrap">
                          <span className="font-bold text-xs md:text-sm text-slate-900">
                            {item.normalPrice || ''}
                          </span>
                      </td>
                      <td className="p-4 md:p-5 text-right bg-slate-50/10 whitespace-nowrap">
                          {item.promoPrice ? (
                          <span className="font-black text-sm md:text-xl text-[#ef4444] tracking-tighter">
                              {item.promoPrice}
                          </span>
                          ) : (
                          <span className="font-bold text-xs md:text-sm text-slate-900">
                              {item.normalPrice || ''}
                          </span>
                          )}
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
              {zoom > 1.2 && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <Grip size={120} className="text-black" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0 print:hidden z-10">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Items: {(pricelist.items || []).length}</span>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Official Kiosk Pro Document • VAT Incl.</p>
        </div>
      </div>
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
        });
    }, [allFlattenedProducts, query, filterBrand, filterCategory, filterHasVideo]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/90 backdrop-blur-md flex flex-col p-4 md:p-12 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-4xl mx-auto flex flex-col h-full bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4 shrink-0 bg-slate-50">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2"><Search className="text-blue-500" /> Catalog Search</h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                    </div>
                    <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Type product name, SKU, or specs..." className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase">
                            <option value="all">All Brands</option>
                            {storeData.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase">
                            <option value="all">All Categories</option>
                            {Array.from(new Set(storeData.brands.flatMap(b => b.categories.map(c => c.name)))).sort().map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <button onClick={() => setFilterHasVideo(!filterHasVideo)} className={`p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${filterHasVideo ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}>Has Video</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {results.map(p => (
                            <button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-left hover:shadow-md transition-all group">
                                <div className="aspect-square bg-white mb-3 flex items-center justify-center p-2 rounded-xl border border-slate-50">
                                    {p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package className="text-slate-100" size={32} />}
                                </div>
                                <div className="text-[10px] font-black text-blue-500 uppercase mb-1">{p.brandName}</div>
                                <h3 className="font-bold text-sm text-slate-900 leading-tight uppercase line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono font-bold text-slate-400">{p.sku || 'NO SKU'}</span>
                                    {(p.videoUrl || (p.videoUrls && p.videoUrls.length > 0)) && <Video size={12} className="text-blue-400" />}
                                </div>
                            </button>
                        ))}
                    </div>
                    {results.length === 0 && <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs">No matching products found</div>}
                </div>
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime: string, onSyncRequest: () => void }) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isIdle, setIsIdle] = useState(true);
  const [screensaverManualOverride, setScreensaverManualOverride] = useState(false);
  const [viewingCatalogue, setViewingCatalogue] = useState<Catalogue | null>(null);
  const [viewingPricelist, setViewingPricelist] = useState<Pricelist | null>(null);
  const [showPricelistBrands, setShowPricelistBrands] = useState(false);
  const [selectedPricelistBrand, setSelectedPricelistBrand] = useState<PricelistBrand | null>(null);
  const [showPricelistList, setShowPricelistList] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // Enterprise Overrides
  const [remoteScreensaverForce, setRemoteScreensaverForce] = useState<'on' | 'off' | 'none'>('none');

  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const [creatorPopup, setCreatorPopup] = useState(false);
  
  const idleTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const deviceType = getDeviceType();

  // Screen state calculation for telemetry
  const getCurrentScreenLabel = () => {
    if (selectedProduct) return `Product: ${selectedProduct.name}`;
    if (selectedCategory) return `Category: ${selectedCategory.name}`;
    if (selectedBrand) return `Brand: ${selectedBrand.name}`;
    if (viewingCatalogue) return `Catalogue: ${viewingCatalogue.title}`;
    if (viewingPricelist) return `Pricelist: ${viewingPricelist.title}`;
    if (showSearch) return 'Search Terminal';
    return 'Home Screen';
  };

  const handleWake = useCallback(() => {
    if (remoteScreensaverForce === 'on') return; // Cannot wake if forced ON
    setIsIdle(false);
    resetIdleTimer();
  }, [remoteScreensaverForce]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    const timeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;
    idleTimerRef.current = window.setTimeout(() => {
       if (remoteScreensaverForce !== 'off') {
         setIsIdle(true);
       }
    }, timeout);
  }, [storeData, remoteScreensaverForce]);

  const toggleScreensaver = () => {
      if (isIdle) setIsIdle(false);
      else setIsIdle(true);
      setScreensaverManualOverride(!isIdle);
  };

  useEffect(() => {
    const configured = isKioskConfigured();
    setIsSetup(configured);
    if (configured) {
        resetIdleTimer();
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(name => document.addEventListener(name, handleWake));
        
        // HEARTBEAT
        heartbeatTimerRef.current = window.setInterval(async () => {
            const status = await sendHeartbeat(getCurrentScreenLabel());
            if (status) {
                if (status.deleted) { localStorage.clear(); window.location.reload(); }
                if (status.restart) { window.location.reload(); }
                if (status.refresh) { window.location.reload(); }
                if (status.screensaverForce) {
                    setRemoteScreensaverForce(status.screensaverForce);
                    if (status.screensaverForce === 'on') setIsIdle(true);
                    if (status.screensaverForce === 'off') setIsIdle(false);
                }
            }
        }, 30000);

        return () => {
            events.forEach(name => document.removeEventListener(name, handleWake));
            if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
            if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
        };
    }
  }, [storeData, handleWake, remoteScreensaverForce, selectedProduct, selectedCategory, selectedBrand, viewingCatalogue, viewingPricelist, showSearch]);

  const allProducts = useMemo(() => {
    if (!storeData) return [];
    return storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({ ...p, brandName: b.name, categoryName: c.name }))));
  }, [storeData]);

  const allScreensaverAds = storeData?.ads?.screensaver || [];
  const pamphlets = storeData?.catalogues?.filter(c => c.type === 'pamphlet') || [];

  const handleToggleCompare = (product: Product) => {
    setSelectedForCompare(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(0, 3));
  };

  if (!storeData) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white font-bold animate-pulse">BOOTING SYSTEM...</div>;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => { setIsSetup(true); resetIdleTimer(); }} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={onSyncRequest} screensaverEnabled={!isIdle} onToggleScreensaver={toggleScreensaver} />;
  
  if (isIdle && remoteScreensaverForce !== 'off') {
    return (
        <Screensaver 
            products={allProducts} 
            ads={allScreensaverAds} 
            pamphlets={pamphlets}
            onWake={handleWake} 
            settings={storeData.screensaverSettings}
        />
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Top Main Status Bar */}
      <div className="bg-slate-900 text-white px-4 md:px-8 py-2 md:py-3 flex justify-between items-center shrink-0 z-[50] shadow-xl relative">
          <div className="flex items-center gap-2 md:gap-4">
              <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg shadow-inner"><RIcon size={18} className="text-white" /></div>
              <div>
                  <h1 className="text-xs md:text-sm font-black uppercase tracking-widest leading-none">Smart Terminal</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                      <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Live • {getShopName()}</p>
                  </div>
              </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
              <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-blue-400"><Search size={20}/></button>
              <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>
              <div className="hidden md:flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-500 uppercase">System Status</span>
                  <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400"><Cloud size={10} /> Cloud Sync</div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-green-400"><Wifi size={10} /> Network Up</div>
                  </div>
              </div>
              <button 
                  onClick={toggleScreensaver}
                  className={`p-1.5 md:p-2 rounded-xl transition-all border ${!isIdle ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-green-600 border-green-500 text-white'}`}
                  title="Manual Screensaver Start"
              >
                  <MonitorPlay size={18} />
              </button>
          </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
          {selectedProduct ? (
            <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} screensaverEnabled={!isIdle} onToggleScreensaver={toggleScreensaver} />
          ) : selectedCategory ? (
            <ProductList 
                category={selectedCategory} 
                brand={selectedBrand!} 
                storeCatalogs={storeData.catalogues || []} 
                onSelectProduct={setSelectedProduct} 
                onBack={() => setSelectedCategory(null)} 
                onViewCatalog={(p: any) => console.log(p)} 
                screensaverEnabled={!isIdle} 
                onToggleScreensaver={toggleScreensaver}
                selectedForCompare={selectedForCompare}
                onToggleCompare={handleToggleCompare}
                onStartCompare={() => setShowComparison(true)}
            />
          ) : selectedBrand ? (
            <CategoryGrid 
                brand={selectedBrand} 
                storeCatalogs={storeData.catalogues || []} 
                onSelectCategory={setSelectedCategory} 
                onViewCatalog={setViewingCatalogue}
                onBack={() => setSelectedBrand(null)} 
                screensaverEnabled={!isIdle} 
                onToggleScreensaver={toggleScreensaver}
            />
          ) : (
            <BrandGrid 
                brands={storeData.brands} 
                heroConfig={storeData.hero} 
                allCatalogs={storeData.catalogues || []}
                ads={storeData.ads}
                onSelectBrand={setSelectedBrand} 
                onViewGlobalCatalog={setViewingCatalogue}
                onExport={() => {}} 
                screensaverEnabled={!isIdle} 
                onToggleScreensaver={toggleScreensaver}
            />
          )}
      </div>

      {/* Global Toolbar */}
      <div className="bg-white border-t border-slate-200 h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-12 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-500 opacity-20"></div>
          
          <div className="flex gap-1 md:gap-4 items-center">
              <button 
                  onClick={() => { setSelectedBrand(null); setSelectedCategory(null); setSelectedProduct(null); setShowPricelistBrands(false); setShowPricelistList(false); setViewingPricelist(null); }}
                  className={`p-2.5 md:p-4 rounded-2xl transition-all active:scale-95 group ${!selectedBrand && !selectedCategory && !selectedProduct && !viewingPricelist && !showPricelistBrands ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                  <Store size={22} className="group-hover:rotate-6 transition-transform" />
              </button>
              <div className="w-[1px] h-8 bg-slate-200 mx-1 md:mx-2"></div>
              <button 
                onClick={() => setShowPricelistBrands(true)}
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-3.5 rounded-2xl font-black uppercase text-[10px] md:text-sm tracking-widest transition-all active:scale-95 group overflow-hidden relative ${viewingPricelist || showPricelistBrands ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                  <RIcon size={16} /> <span className="hidden sm:inline">Pricelists</span><span className="sm:hidden">Prices</span>
                  {(viewingPricelist || showPricelistBrands) && <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500"></div>}
              </button>
              <button 
                onClick={() => { window.history.pushState({}, '', '/about'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                className="hidden sm:flex items-center gap-3 px-6 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-sm tracking-widest transition-all hover:bg-slate-200 active:scale-95"
              >
                  <Info size={16} /> About
              </button>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
              <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Telemetry</span>
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><Monitor size={12} className="text-blue-500"/> ID: <span className="text-slate-900">{getKioskId()}</span></div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600"><RefreshCw size={12} className="text-purple-500"/> Sync: <span className="text-slate-900">{lastSyncTime || 'Pending'}</span></div>
                  </div>
              </div>
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => setCreatorPopup(true)}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-blue-500 transition-all p-0.5 shadow-sm">
                      <img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" alt="Creator" className="w-full h-full object-contain bg-slate-900" />
                  </div>
                  <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase mt-1 tracking-tighter">Powered by JSTYP</span>
              </div>
          </div>
      </div>

      {/* Comparison Drawer */}
      {showComparison && (
          <ComparisonModal products={allProducts.filter(p => selectedForCompare.includes(p.id))} onClose={() => setShowComparison(false)} onShowDetail={(p) => { setSelectedProduct(p); setShowComparison(false); }} />
      )}

      {/* Global Search */}
      {showSearch && (
          <SearchModal storeData={storeData} onClose={() => setShowSearch(false)} onSelectProduct={setSelectedProduct} />
      )}

      {/* Modals for Catalogues and Pricelists */}
      {viewingCatalogue && (
          <Flipbook 
             pages={viewingCatalogue.pages || []} 
             onClose={() => setViewingCatalogue(null)} 
             catalogueTitle={viewingCatalogue.title}
             startDate={viewingCatalogue.startDate}
             endDate={viewingCatalogue.endDate}
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

      {/* Pricelist Selection Modal */}
      {showPricelistBrands && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPricelistBrands(false)}>
              <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-up" onClick={e => e.stopPropagation()}>
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                      <div>
                          <h2 className="text-3xl font-black uppercase text-slate-900 flex items-center gap-3"><RIcon className="text-[#c0810d]" /> Official Pricelists</h2>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Select a brand to view available price sheets</p>
                      </div>
                      <button onClick={() => setShowPricelistBrands(false)} className="p-3 bg-white hover:bg-slate-100 text-slate-400 rounded-full shadow-sm"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {(storeData.pricelistBrands || []).map((brand) => (
                              <button 
                                key={brand.id}
                                onClick={() => { setSelectedPricelistBrand(brand); setShowPricelistList(true); }}
                                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl hover:border-blue-500 transition-all duration-300 aspect-square"
                              >
                                  <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
                                      {brand.logoUrl ? (
                                          <img src={brand.logoUrl} className="max-w-full max-h-full object-contain" alt={brand.name} />
                                      ) : (
                                          <span className="text-3xl font-black text-slate-300">{brand.name.charAt(0)}</span>
                                      )}
                                  </div>
                                  <div>
                                      <h3 className="font-black text-slate-900 uppercase text-[10px] md:text-xs leading-tight line-clamp-2">{brand.name}</h3>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{storeData.pricelists?.filter(p => p.brandId === brand.id).length || 0} Documents</p>
                                  </div>
                              </button>
                          ))}
                      </div>
                      {(storeData.pricelistBrands || []).length === 0 && (
                          <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs">No pricelists configured by system admin.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Pricelist Items List Modal */}
      {showPricelistList && selectedPricelistBrand && (
          <div className="fixed inset-0 z-[105] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPricelistList(false)}>
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center shadow-sm">
                             {selectedPricelistBrand.logoUrl ? <img src={selectedPricelistBrand.logoUrl} className="max-w-full max-h-full object-contain" /> : <RIcon size={20} />}
                          </div>
                          <div>
                            <h2 className="text-xl font-black uppercase text-slate-900">{selectedPricelistBrand.name} <span className="text-slate-400 ml-1">Archive</span></h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select a specific document to view</p>
                          </div>
                      </div>
                      <button onClick={() => setShowPricelistList(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50 space-y-3">
                      {storeData.pricelists?.filter(p => p.brandId === selectedPricelistBrand.id).sort((a,b) => b.year.localeCompare(a.year) || b.month.localeCompare(a.month)).map((pl) => {
                          const recent = isRecent(pl.dateAdded);
                          return (
                          <button 
                            key={pl.id}
                            onClick={() => { setViewingPricelist(pl); setShowPricelistList(false); setShowPricelistBrands(false); }}
                            className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-6 group"
                          >
                              <div className="w-12 h-16 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white shrink-0 group-hover:bg-blue-600 transition-colors shadow-lg relative overflow-hidden">
                                 {recent && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>}
                                 <span className="text-[7px] font-black uppercase opacity-60">{pl.year}</span>
                                 <RIcon size={18} />
                                 <span className="text-[7px] font-black uppercase opacity-60">{pl.month.substring(0,3)}</span>
                              </div>
                              <div className="flex-1 text-left">
                                  <h3 className="font-black text-slate-900 uppercase text-xs md:text-sm group-hover:text-blue-700 transition-colors">{pl.title}</h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{pl.month} {pl.year}</p>
                                    {recent && <span className="text-[8px] font-black uppercase text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100 animate-pulse">Just Added</span>}
                                  </div>
                              </div>
                              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </button>
                      );})}
                      {(!storeData.pricelists || storeData.pricelists.filter(p => p.brandId === selectedPricelistBrand.id).length === 0) && (
                          <div className="py-12 text-center text-slate-400 font-bold uppercase text-[10px]">No documents available for this brand.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <CreatorPopup isOpen={creatorPopup} onClose={() => setCreatorPopup(false)} />
    </div>
  );
};

export default KioskApp;
