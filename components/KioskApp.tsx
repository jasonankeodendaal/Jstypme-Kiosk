
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand, UI_Z_INDEX } from '../types';
import { 
  getKioskId, 
  provisionKioskId, 
  completeKioskSetup, 
  isKioskConfigured, 
  sendHeartbeat, 
  getShopName, 
  getDeviceType,
  checkCloudConnection,
  getCloudProjectName
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { RIcon } from './Icons';
import { Store, X, Loader2, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomOut, Tv, FileText, List, Search, Layers, Package, FileDown, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';

const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
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
                  // Lock orientation after user gesture
                  // Fix: lockOrientation cast to any
                  if ((window as any).lockOrientation) (window as any).lockOrientation();
                  onComplete();
                } else {
                  setError('Setup failed. Local storage error.');
                }
            } catch (e) {
                setError('Cloud registration failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div 
          className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4"
          style={{ zIndex: UI_Z_INDEX.SETUP }}
        >
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
  const items = pricelist.items || [];
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
                resolve({ 
                  imgData: canvas.toDataURL('image/png'), 
                  format: 'PNG', 
                  width: img.width, 
                  height: img.height 
                });
            } catch (err) { 
                console.error("Canvas Taint Error during PDF export:", err);
                resolve(null); 
            }
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
        
        const skuW = 25;
        const normalW = 28;
        const promoW = 28;
        const descW = innerWidth - skuW - normalW - promoW;

        const line1 = margin;
        const line2 = line1 + skuW;
        const line3 = line2 + descW;
        const line4 = line3 + normalW;
        const line5 = line1 + innerWidth;

        const skuX = line1 + 2;
        const descX = line2 + 2;
        const normalPriceX = line4 - 2;
        const promoPriceX = line5 - 2;
        
        const skuMaxW = skuW - 4;
        const descMaxW = descW - 4;

        const [brandAsset, companyAsset] = await Promise.all([
            brandLogo ? loadImageForPDF(brandLogo) : Promise.resolve(null),
            companyLogo ? loadImageForPDF(companyLogo) : Promise.resolve(null)
        ]);

        const drawHeader = () => {
            let topY = 15;
            if (brandAsset) {
                const h = 20; const w = h * (brandAsset.width / brandAsset.height);
                doc.addImage(brandAsset.imgData, brandAsset.format, margin, topY, w, h);
            } else if (brandName) {
                doc.setTextColor(30, 41, 59); doc.setFontSize(28); doc.setFont('helvetica', 'black');
                doc.text(brandName.toUpperCase(), margin, topY + 15);
            }
            if (companyAsset) {
                const h = 12; const w = h * (companyAsset.width / companyAsset.height);
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
            doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
            doc.line(margin, topY + 44, pageWidth - margin, topY + 44);
            return topY + 54;
        };

        const drawTableHeaders = (startY: number) => {
            const headerHeight = 10;
            doc.setFillColor(113, 113, 122); 
            doc.rect(margin, startY - 7, pageWidth - (margin * 2), headerHeight, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text("SKU", skuX, startY); 
            doc.text("DESCRIPTION", descX, startY);
            doc.text("NORMAL", normalPriceX, startY, { align: 'right' });
            doc.text("PROMO", promoPriceX, startY, { align: 'right' });
            return startY + 8;
        };

        const drawTextFit = (text: string, x: number, y: number, maxWidth: number, baseSize: number, align: 'left' | 'right' = 'left'): number => {
            let currentSize = baseSize;
            doc.setFontSize(currentSize);
            while (doc.getTextWidth(text) > maxWidth && currentSize > 7) {
                currentSize -= 0.5; doc.setFontSize(currentSize);
            }
            if (doc.getTextWidth(text) > maxWidth) {
                const lines = doc.splitTextToSize(text, maxWidth); 
                doc.text(lines, x, y, { align });
                return lines.length;
            }
            doc.text(text, x, y, { align }); 
            return 1;
        };

        let currentY = drawHeader();
        currentY = drawTableHeaders(currentY);
        const baseRowHeight = 9; const footerMargin = 20;

        items.forEach((item, index) => {
            doc.setFontSize(8);
            const skuLines = doc.splitTextToSize(item.sku || '', skuMaxW).length;
            doc.setFontSize(9);
            const descLines = doc.splitTextToSize(item.description.toUpperCase(), descMaxW).length;
            const maxLines = Math.max(skuLines, descLines);
            const rowHeight = maxLines > 1 ? (baseRowHeight + (maxLines - 1) * 4) : baseRowHeight;

            // Fix: getNumberOfPages is directly on doc
            if (currentY + rowHeight > pageHeight - footerMargin) {
                doc.addPage(); 
                currentY = drawHeader(); 
                currentY = drawTableHeaders(currentY);
            }
            
            if (index % 2 !== 0) {
                doc.setFillColor(250, 250, 250); 
                doc.rect(margin, currentY - 6, pageWidth - (margin * 2), rowHeight, 'F');
            }

            doc.setTextColor(30, 41, 59); 
            doc.setFont('helvetica', 'normal');
            drawTextFit(item.sku || '', skuX, currentY, skuMaxW, 8);
            doc.setFont('helvetica', 'bold');
            drawTextFit(item.description.toUpperCase(), descX, currentY, descMaxW, 8.5);
            doc.setFont('helvetica', 'normal'); 
            doc.setTextColor(0, 0, 0);
            drawTextFit(item.normalPrice || '', normalPriceX, currentY, normalW - 4, 8, 'right');
            
            if (item.promoPrice) {
                doc.setTextColor(239, 68, 68); 
                doc.setFont('helvetica', 'bold');
                drawTextFit(item.promoPrice, promoPriceX, currentY, promoW - 4, 10, 'right');
            } else {
                doc.setTextColor(0, 0, 0);
                drawTextFit(item.normalPrice || '', promoPriceX, currentY, promoW - 4, 8, 'right');
            }

            doc.setDrawColor(203, 213, 225); 
            doc.setLineWidth(0.1);
            doc.line(line1, currentY + rowHeight - 6, line5, currentY + rowHeight - 6);
            currentY += rowHeight;
        });

        // Fix: getNumberOfPages is directly on doc
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i); 
            doc.setFontSize(7); 
            doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
        doc.save(`${pricelist.title.replace(/\s+/g, '_')}_${pricelist.month}.pdf`);
    } catch (err) { 
        alert("An error occurred generating the PDF. Try again."); 
    } finally { 
        setIsExporting(false); 
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white print:p-0 print:block overflow-hidden print:overflow-visible" 
      style={{ zIndex: UI_Z_INDEX.MODAL + 60 }}
      onClick={onClose}
    >
      <style>{`
        @media print {
          @page { size: portrait; margin: 5mm; }
          body { background: white !important; margin: 0 !important; overflow: visible !important; }
          .print-hidden { display: none !important; }
          .spreadsheet-table { width: 100% !important; border-collapse: collapse !important; }
          .spreadsheet-table th { background: #71717a !important; color: #fff !important; padding: 8pt !important; }
          .spreadsheet-table td { border: 0.5pt solid #e2e8f0 !important; padding: 8pt !important; }
        }
        .spreadsheet-table { border-collapse: separate; border-spacing: 0; table-layout: fixed; width: 100%; }
        .spreadsheet-table th { position: sticky; top: 0; z-index: 10; background-color: #71717a; color: white; white-space: nowrap; }
        .excel-row:nth-child(even) { background-color: #f8fafc; }
        .sku-cell { word-break: break-all; font-size: clamp(8px, 1.4vw, 13px); padding: 12px 8px; }
        .desc-cell { line-height: 1.3; font-size: clamp(9px, 1.5vw, 14px); padding: 12px 10px; }
        .price-cell { font-size: clamp(10px, 1.6vw, 16px); font-weight: 900; }
      `}</style>
      <div className="viewer-container relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col print:block" onClick={e => e.stopPropagation()}>
        <div className="print-hidden p-4 md:p-8 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
          <div className="flex items-center gap-6"><RIcon size={36} /><h2 className="text-lg md:text-3xl font-black uppercase tracking-tight">{pricelist.title}</h2></div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportPDF} disabled={isExporting} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black text-xs md:text-sm uppercase flex items-center gap-2 hover:bg-black transition-colors shadow-lg">
              {isExporting ? <Loader2 className="animate-spin" size={18}/> : <FileDown size={22} />} Save PDF
            </button>
            <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={28}/></button>
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
          className={`flex-1 overflow-auto bg-slate-100/50 relative p-0 md:p-6 print:p-0 ${isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'}`}
        >
          <table className="spreadsheet-table w-full text-left bg-white shadow-xl rounded-xl overflow-hidden print:table">
            <thead className="print:table-header-group">
              <tr className="print:bg-[#71717a] bg-[#71717a] text-white">
                <th className="p-4">SKU</th>
                <th className="p-4">DESCRIPTION</th>
                <th className="text-right p-4">NORMAL</th>
                <th className="text-right p-4">PROMO</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="excel-row border-b border-slate-100">
                  <td className="sku-cell">{item.sku}</td>
                  <td className="desc-cell font-bold">{item.description}</td>
                  <td className="text-right p-4 price-cell">{item.normalPrice}</td>
                  <td className="text-right p-4 price-cell text-red-600 font-black">{item.promoPrice || item.normalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div 
    className={`fixed inset-0 flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
    style={{ zIndex: UI_Z_INDEX.MODAL + 100 }}
    onClick={onClose}
  >
    <div className="relative w-full max-w-xs md:max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 bg-slate-900" onClick={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')] bg-cover opacity-30"></div>
      <div className="relative z-10 text-center">
        <img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-white font-black text-2xl">JSTYP.me</h2>
        <button onClick={onClose} className="absolute top-0 right-0 text-white/50 hover:text-white p-2 transition-colors"><X size={20}/></button>
      </div>
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
        <div 
          className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in p-2 md:p-12" 
          style={{ zIndex: UI_Z_INDEX.MODAL + 70 }}
          onClick={onClose}
        >
            <div className="relative w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h2 className="text-2xl font-black uppercase flex items-center gap-3"><Layers className="text-blue-600" /> Comparison</h2><button onClick={onClose} className="p-3 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"><X size={24} /></button></div>
                <div className="flex-1 overflow-auto"><table className="w-full border-collapse min-w-[800px]"><thead className="sticky top-0 bg-white shadow-sm"><tr><th className="p-6 bg-slate-50 w-64 border-r"></th>{products.map(p => (<th key={p.id} className="p-6 border-r text-center"><div className="w-40 h-40 bg-white p-2 rounded-2xl mb-4 flex items-center justify-center shadow-sm border mx-auto">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-200" />}</div><h3 className="font-black text-lg uppercase leading-tight mb-4 truncate">{p.name}</h3><button onClick={() => { onShowDetail(p); onClose(); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black transition-colors">View Details</button></th>))}</tr></thead><tbody><tr className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] border-r">Summary</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-medium border-r">{p.description?.substring(0,120)}...</td>))}</tr>{specKeys.map(key => (<tr key={key} className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] border-r">{key}</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-black border-r text-slate-700">{p.specs[key] || '—'}</td>))}</tr>))}</tbody></table></div>
            </div>
        </div>
    );
};

const SearchModal = ({ storeData, onClose, onSelectProduct }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void }) => {
    const [query, setQuery] = useState('');
    const allFlattenedProducts = useMemo(() => storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({...p, brandName: b.name, brandId: b.id, categoryName: c.name, categoryId: c.id})))), [storeData]);
    const results = useMemo(() => {
        const lower = query.toLowerCase().trim();
        return allFlattenedProducts.filter(p => !lower || p.name.toLowerCase().includes(lower) || p.sku?.toLowerCase().includes(lower)).sort((a,b) => a.name.localeCompare(b.name));
    }, [query, allFlattenedProducts]);
    return (
        <div 
          className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in" 
          style={{ zIndex: UI_Z_INDEX.MODAL + 70 }}
          onClick={onClose}
        >
            <div className="p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
                <div className="relative mb-8"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8" /><input autoFocus type="text" placeholder="Search Products or SKUs..." className="w-full bg-white/10 text-white text-3xl md:text-5xl font-black uppercase tracking-tight py-6 pl-20 pr-20 border-b-4 border-white/10 outline-none focus:border-blue-500 rounded-t-3xl transition-all" value={query} onChange={(e) => setQuery(e.target.value)} /><button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"><X size={40} /></button></div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">{results.map(p => (<button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className="group bg-white rounded-3xl overflow-hidden flex flex-col text-left hover:scale-105 transition-all shadow-xl"><div className="aspect-square bg-white relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}</div><div className="p-4 bg-slate-50/50 flex-1 border-t border-slate-100"><h4 className="font-black text-slate-900 uppercase text-xs line-clamp-2">{p.name}</h4><div className="text-[9px] font-mono font-bold text-slate-400 mt-2">{p.sku}</div></div></button>))}</div>
            </div>
        </div>
    );
};

export const KioskApp = ({ storeData, lastSyncTime, onSyncRequest }: { storeData: StoreData | null, lastSyncTime?: string, onSyncRequest?: () => void }) => {
  const [isSetup, setIsSetup] = useState(isKioskConfigured());
  const [kioskId, setKioskId] = useState(getKioskId());
  const myFleetEntry = useMemo(() => storeData?.fleet?.find(f => f.id === kioskId), [storeData?.fleet, kioskId]);
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
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const idleTimeout = (storeData?.screensaverSettings?.idleTimeout || 60) * 1000;
  
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screensaverEnabled && deviceType === 'kiosk' && isSetup) {
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true); setActiveProduct(null); setActiveCategory(null); setActiveBrand(null); setShowFlipbook(false); setViewingPdf(null); setViewingManualList(null); setShowPricelistModal(false); setShowGlobalSearch(false); setShowCompareModal(false); setCompareProductIds([]);
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
      syncCycle();
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = window.setInterval(syncCycle, 30000);
    }
    
    return () => { 
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current); 
        clearInterval(clockInterval); 
        window.removeEventListener('touchstart', resetIdleTimer);
        window.removeEventListener('click', resetIdleTimer);
    };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity]);

  const allProductsFlat = useMemo(() => storeData?.brands?.flatMap(b => b.categories?.flatMap(c => c.products?.map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct)))) || [], [storeData]);
  const pricelistBrands = useMemo(() => (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name)), [storeData]);
  const toggleCompareProduct = (product: Product) => setCompareProductIds(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(-5));
  const productsToCompare = useMemo(() => allProductsFlat.filter(p => compareProductIds.includes(p.id)), [allProductsFlat, compareProductIds]);

  const activePricelistBrand = useMemo(() => {
      if (!viewingManualList) return undefined;
      let found: any = pricelistBrands.find(b => b.id === viewingManualList.brandId);
      if (!found && storeData?.brands) found = storeData.brands.find(b => b.id === viewingManualList.brandId);
      return found;
  }, [viewingManualList, pricelistBrands, storeData]);

  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header 
         className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden"
         style={{ zIndex: UI_Z_INDEX.HEADER }}
       >
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">{storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain" /> : <Store size={16} className="text-blue-500" />}<button onClick={() => setShowGlobalSearch(true)} className="bg-white/10 hover:bg-blue-600 px-2 py-1 rounded-md flex items-center gap-1.5 transition-colors"><Search size={12} className="text-blue-400" /><span className="text-[8px] md:text-[10px] font-black uppercase hidden md:inline">Universal Search</span></button></div>
           <div className="flex items-center gap-2 md:gap-4">{deviceType === 'kiosk' && (<button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'}`}>{screensaverEnabled ? <MonitorPlay size={14} className="animate-pulse" /> : <MonitorStop size={14} />}<span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest hidden sm:inline">Screensaver</span></button>)}<div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300' : 'bg-orange-900/50 text-orange-300'}`}>{isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}</div><button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-all ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-800/40' : 'text-purple-400 bg-purple-900/30 hover:bg-purple-800/40'}`}><ZoomOut size={12} /></button></div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => c.pdfUrl ? setViewingPdf({url:c.pdfUrl, title:c.title}) : (c.pages?.length && (setFlipbookPages(c.pages), setFlipbookTitle(c.title), setShowFlipbook(true)))} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => c.pdfUrl ? setViewingPdf({url:c.pdfUrl, title:c.title}) : (c.pages?.length && (setFlipbookPages(c.pages), setFlipbookTitle(c.title), setShowFlipbook(true)))} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} showScreensaverButton={false} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} showScreensaverButton={false} selectedForCompare={compareProductIds} onToggleCompare={toggleCompareProduct} onStartCompare={() => setShowCompareModal(true)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} showScreensaverButton={false} />}
       </div>
       <footer 
         className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[7px] md:text-[10px] print:hidden"
         style={{ zIndex: UI_Z_INDEX.HEADER }}
       >
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden"><div className="flex items-center gap-1 shrink-0"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Live' : 'Offline'}</span></div><div className="flex items-center gap-1 border-l pl-2 md:pl-4 shrink-0"><span className="font-bold text-slate-600">{kioskId}</span></div><div className="flex items-center gap-1 border-l pl-2 md:pl-4 truncate"><RefreshCw size={8} className="text-slate-300" /><span className="font-bold uppercase text-slate-400">Sync: {lastSyncTime || '--:--'}</span></div></div>
          <div className="flex items-center gap-4 shrink-0 ml-2">{pricelistBrands.length > 0 && (<button onClick={() => (setSelectedBrandForPricelist(pricelistBrands[0]?.id || null), setShowPricelistModal(true))} className="bg-blue-600 text-white w-5 h-5 rounded flex items-center justify-center shadow-sm active:scale-95 transition-all"><RIcon size={10} /></button>)}<button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest text-[8px] md:text-[10px]">JSTYP</button></div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showGlobalSearch && <SearchModal storeData={storeData} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b => b.id === (p as any).brandId)!); setActiveCategory(storeData.brands.find(b => b.id === (p as any).brandId)!.categories.find(c => c.id === (p as any).categoryId)!); setActiveProduct(p); }} onClose={() => setShowGlobalSearch(false)} />}
       {showCompareModal && <ComparisonModal products={productsToCompare} onClose={() => setShowCompareModal(false)} onShowDetail={setActiveProduct} />}
       {showPricelistModal && (
           <div 
             className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in print:hidden" 
             style={{ zIndex: UI_Z_INDEX.MODAL + 60 }}
             onClick={() => setShowPricelistModal(false)}
           >
               <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0"><h2 className="text-base md:text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2><button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full hover:bg-slate-200 transition-colors"><X size={24} /></button></div>
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                     <div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden flex flex-col">
                       <div className="md:flex flex-1 flex-col overflow-y-auto no-scrollbar">
                         {pricelistBrands.map(brand => (
                           <button 
                             key={brand.id} 
                             onClick={() => setSelectedBrandForPricelist(brand.id)} 
                             className={`w-full text-left p-4 transition-colors flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}
                           >
                             <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}</div>
                             <span className={`font-black text-sm uppercase leading-tight ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-400'}`}>{brand.name}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50 relative">
                       {selectedBrandForPricelist ? (
                         <div className="animate-fade-in">
                           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                             {storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (
                               <button 
                                 key={pl.id} 
                                 onClick={() => pl.type === 'manual' ? setViewingManualList(pl) : setViewingPdf({url: pl.url, title: pl.title})} 
                                 className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400' : 'border-white'}`}
                               >
                                 <div className="aspect-[3/4] bg-slate-50 relative p-2 md:p-3 overflow-hidden">
                                   {pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded shadow-sm" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">{pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}</div>}
                                 </div>
                                 <div className="p-3 flex-1 flex flex-col justify-between bg-white border-t border-slate-50">
                                   <h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase leading-tight line-clamp-2">{pl.title}</h3>
                                   <div className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-2">{pl.month} {pl.year}</div>
                                 </div>
                               </button>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"><RIcon size={64} className="opacity-10" /></div>
                       )}
                     </div>
                   </div>
               </div>
           </div>
       )}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       {viewingManualList && <ManualPricelistViewer pricelist={viewingManualList} onClose={() => setViewingManualList(null)} companyLogo={storeData.companyLogoUrl || storeData.hero.logoUrl} brandLogo={activePricelistBrand?.logoUrl} brandName={activePricelistBrand?.name} />}
    </div>
  );
};

export default KioskApp;
