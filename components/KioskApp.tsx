
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StoreData, Brand, Category, Product, FlatProduct, Catalogue, Pricelist, PricelistBrand, PricelistItem } from '../types';
import { 
  getKioskId, 
  provisionKioskId, 
  completeKioskSetup, 
  isKioskConfigured, 
  sendHeartbeat, 
  getShopName, 
  getDeviceType,
  supabase,
} from '../services/kioskService';
import BrandGrid from './BrandGrid';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Screensaver from './Screensaver';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import TVMode from './TVMode';
import { Store, X, Loader2, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Tv, Info, Sparkles, ChevronRight, LayoutGrid, Printer, ZoomIn, ZoomOut, Maximize, FileDown, Film } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Helper to determine if an item was recently added or updated (within 30 days)
const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const addedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - addedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
};

// Custom Icon for Pricelist Branding and Navigation
const RIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5v14" />
    <path d="M7 5h5.5a4.5 4.5 0 0 1 0 9H7" />
    <path d="M11.5 14L17 19" />
  </svg>
);

// --- SETUP SCREEN COMPONENT ---
// Handles the initial device registration, naming, and hardware profiling
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

// --- MANUAL PRICELIST VIEWER COMPONENT ---
// Renders manual pricing tables with PDF generation and printing support
const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  const loadImage = (url: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        
        const [brandImg, companyImg] = await Promise.all([
            brandLogo ? loadImage(brandLogo) : Promise.resolve(null),
            companyLogo ? loadImage(companyLogo) : Promise.resolve(null)
        ]);

        const drawHeader = (pageNum: number) => {
            let topY = 15;

            if (brandImg) {
                const ratio = brandImg.width / brandImg.height;
                const h = 18;
                const w = h * ratio;
                doc.addImage(brandImg, 'PNG', margin, topY, w, h);
            }

            if (companyImg) {
                const ratio = companyImg.width / companyImg.height;
                const h = 14;
                const w = h * ratio;
                doc.addImage(companyImg, 'PNG', pageWidth - margin - w, topY + 2, w, h);
            }

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text("Official Price List", margin, topY + 30);
            
            doc.setTextColor(37, 99, 235);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(pricelist.title.toUpperCase(), margin, topY + 38);

            const boxW = 40;
            const boxH = 8;
            const boxX = pageWidth - margin - boxW;
            const boxY = topY + 30;
            doc.setFillColor(30, 41, 59);
            doc.rect(boxX, boxY, boxW, boxH, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`${pricelist.month} ${pricelist.year}`.toUpperCase(), boxX + (boxW/2), boxY + 5.5, { align: 'center' });
            
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(7);
            doc.text(`REF: ${pricelist.id.substring(0,8).toUpperCase()}`, boxX + boxW, boxY + 12, { align: 'right' });

            doc.setDrawColor(30, 41, 59);
            doc.setLineWidth(1.5);
            doc.line(margin, topY + 45, pageWidth - margin, topY + 45);

            return topY + 55;
        };

        const drawTableHeaders = (startY: number) => {
            doc.setFillColor(241, 245, 249);
            doc.rect(margin, startY - 6, pageWidth - (margin * 2), 10, 'F');
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.1);
            doc.rect(margin, startY - 6, pageWidth - (margin * 2), 10, 'S');

            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text("CODE", margin + 3, startY);
            doc.text("PRODUCT DESCRIPTION", margin + 40, startY);
            doc.text("NORMAL", pageWidth - margin - 35, startY, { align: 'right' });
            doc.text("OFFER", pageWidth - margin - 5, startY, { align: 'right' });
            
            return startY + 8;
        };

        let currentY = drawHeader(1);
        currentY = drawTableHeaders(currentY);

        const items = pricelist.items || [];
        
        items.forEach((item, index) => {
            if (currentY > pageHeight - 25) {
                doc.addPage();
                currentY = drawHeader(doc.internal.getNumberOfPages());
                currentY = drawTableHeaders(currentY);
            }

            if (index % 2 !== 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(margin, currentY - 5.5, pageWidth - (margin * 2), 8, 'F');
            }
            
            doc.setDrawColor(241, 245, 249);
            doc.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);

            doc.setFont('courier', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(30, 41, 59);
            doc.text(item.sku || 'N/A', margin + 3, currentY);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            const desc = item.description.length > 55 ? item.description.substring(0, 52) + "..." : item.description;
            doc.text(desc.toUpperCase(), margin + 40, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(item.promoPrice ? 100 : 30);
            doc.text(item.normalPrice || 'POA', pageWidth - margin - 35, currentY, { align: 'right' });

            if (item.promoPrice) {
                doc.setTextColor(220, 38, 38);
                doc.setFont('helvetica', 'bold');
                doc.text(item.promoPrice, pageWidth - margin - 5, currentY, { align: 'right' });
                doc.setTextColor(30, 41, 59);
            } else {
                doc.text(item.normalPrice || '—', pageWidth - margin - 5, currentY, { align: 'right' });
            }

            currentY += 8;
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(`Official Document Generated by Kiosk Pro System | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
        }

        doc.save(`${pricelist.title.replace(/\s+/g, '_')}_${pricelist.month}_${pricelist.year}.pdf`);

    } catch (err) {
        console.error("PDF Export failed", err);
        alert("Could not generate PDF. Using standard print fallback.");
        window.print();
    } finally {
        setIsExporting(false);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.1, 2.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white print:p-0 print:block" onClick={onClose}>
      <style>{`
        @media print {
          @page { size: portrait; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; height: auto !important; width: 100% !important; }
          .print-hidden { display: none !important; }
          .print-only { display: block !important; }
          .viewer-container { position: relative !important; box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; background: white !important; top: 0 !important; display: block !important; transform: none !important; }
          .table-scroll { overflow: visible !important; height: auto !important; padding: 0 !important; }
          .spreadsheet-table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
          .spreadsheet-table th { background: #f1f5f9 !important; color: #000 !important; border: 1px solid #000 !important; font-weight: 900 !important; text-transform: uppercase !important; padding: 8px 10px !important; font-size: 11px !important; }
          .spreadsheet-table td { border: 1px solid #e2e8f0 !important; color: #000 !important; padding: 8px 10px !important; font-weight: 600 !important; font-size: 11px !important; line-height: 1.2 !important; }
          .spreadsheet-table .excel-row:nth-child(even) { background-color: #f8fafc !important; }
        }
        .spreadsheet-table { border-collapse: separate; border-spacing: 0; }
        .spreadsheet-table th { position: sticky; top: 0; z-index: 10; background-color: #71717a; color: white; box-shadow: inset 0 -1px 0 #3f3f46; }
        .excel-row:nth-child(even) { background-color: #f8fafc; }
        .excel-row:hover { background-color: #f1f5f9; }
        .sku-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .shrink-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: clamp(8.5px, 1.3vw, 14px); line-height: 1.2; }
        .sku-container { font-size: clamp(7.5px, 1.1vw, 12px); white-space: nowrap; }
      `}</style>

      <div className={`viewer-container relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none print:shadow-none print:max-h-none ${isNewlyUpdated ? 'ring-4 ring-yellow-400 print:ring-0' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* Header (Screen-Only) */}
        <div className={`print-hidden p-4 md:p-6 text-white flex justify-between items-center shrink-0 border-b border-white/5 z-20 ${isNewlyUpdated ? 'bg-yellow-600 shadow-yellow-600/20' : 'bg-slate-900 shadow-xl'}`}>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <RIcon size={28} className={isNewlyUpdated ? 'text-white' : 'text-green-400'} />
             </div>
             <div>
                <div className="flex items-center gap-2 md:gap-3">
                  <h2 className="text-sm md:text-2xl font-black uppercase tracking-tight truncate max-w-[150px] md:max-w-none">{pricelist.title}</h2>
                  {isNewlyUpdated && <span className="bg-white text-yellow-700 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black uppercase flex items-center gap-1 shadow-lg shrink-0 animate-pulse"><Sparkles size={10} /> NEW</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-slate-400'} font-bold uppercase tracking-widest text-[9px] md:text-xs`}>{pricelist.month} {pricelist.year}</p>
                   <div className={`w-1 h-1 rounded-full ${isNewlyUpdated ? 'bg-yellow-200' : 'bg-slate-700'}`}></div>
                   <p className={`${isNewlyUpdated ? 'text-yellow-100' : 'text-slate-400'} font-bold uppercase tracking-widest text-[9px] md:text-xs`}>Pricelist Sheet</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ZoomOut size={18}/></button>
                <button onClick={handleResetZoom} className="px-2 text-[10px] font-black uppercase tracking-widest min-w-[50px]">{Math.round(zoom * 100)}%</button>
                <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ZoomIn size={18}/></button>
                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                <button onClick={handleResetZoom} title="Reset to Fit" className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Maximize size={18}/></button>
             </div>

             <div className="flex gap-2">
                <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg hover:bg-blue-50 transition-all active:scale-95 group disabled:opacity-50">
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} className="text-blue-600" />}
                    <span>{isExporting ? 'Building PDF...' : 'Save as PDF'}</span>
                </button>
                <button onClick={handlePrint} className="hidden md:flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg hover:bg-slate-700 transition-all group">
                    <Printer size={16} /> <span>Print</span>
                </button>
             </div>
             <button onClick={onClose} className="p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5"><X size={20}/></button>
          </div>
        </div>

        {/* Print Content Area */}
        <div className="table-scroll flex-1 overflow-auto bg-white p-0 md:p-4 print:px-10">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', paddingBottom: zoom > 1 ? `${(zoom-1)*100}%` : '0' }} className="transition-transform duration-200">
            <table className="spreadsheet-table w-full text-left border-collapse shadow-sm">
                <thead>
                <tr className="print:bg-slate-100">
                    <th className="p-3 md:p-4 text-[10px] md:text-xs font-black text-slate-400 print:text-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">Code</th>
                    <th className="p-3 md:p-4 text-[10px] md:text-xs font-black text-slate-400 print:text-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">Description</th>
                    <th className="p-3 md:p-4 text-[10px] md:text-xs font-black text-slate-400 print:text-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/50 text-right">Normal</th>
                    <th className="p-3 md:p-4 text-[10px] md:text-xs font-black text-slate-400 print:text-black uppercase tracking-widest border-b border-slate-100 bg-slate-50/50 text-right">Offer</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {(pricelist.items || []).map((item) => (
                    <tr key={item.id} className="excel-row transition-colors">
                        <td className="p-3 md:p-4 sku-container">
                            <span className="sku-font font-bold text-slate-500 print:text-black">{item.sku || 'N/A'}</span>
                        </td>
                        <td className="p-3 md:p-4">
                            <div className="font-bold text-slate-900 print:text-black uppercase shrink-text">{item.description}</div>
                        </td>
                        <td className="p-3 md:p-4 text-right">
                            <span className={`font-bold ${item.promoPrice ? 'text-slate-400 line-through text-[10px] md:text-xs' : 'text-slate-900 print:text-black text-xs md:text-sm'}`}>{item.normalPrice || 'POA'}</span>
                        </td>
                        <td className="p-3 md:p-4 text-right">
                            <span className="font-black text-blue-600 print:text-black text-xs md:text-sm">{item.promoPrice || item.normalPrice || 'POA'}</span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>

        <div className="print-hidden p-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px]">
             <ShieldCheck size={14} className="text-green-500" />
             <span>Verified Registry • ID: {pricelist.id.substring(0,8).toUpperCase()}</span>
          </div>
          <button onClick={onClose} className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg">Close View</button>
        </div>
      </div>
    </div>
  );
};

interface KioskAppProps {
  storeData: StoreData;
  lastSyncTime: string;
  onSyncRequest: () => void;
}

/**
 * Main Kiosk Application Shell.
 * Manages device routing, idle state management for screensavers, and real-time heartbeats.
 */
export const KioskApp: React.FC<KioskAppProps> = ({ storeData, lastSyncTime, onSyncRequest }) => {
    const [isConfigured, setIsConfigured] = useState(isKioskConfigured());
    const [currentView, setCurrentView] = useState<'brands' | 'categories' | 'products' | 'detail' | 'compare'>('brands');
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [screensaverActive, setScreensaverActive] = useState(false);
    const [viewingCatalogue, setViewingCatalogue] = useState<Catalogue | null>(null);
    const [viewingPricelist, setViewingPricelist] = useState<Pricelist | null>(null);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [deviceType, setDeviceType] = useState(getDeviceType());
    
    const idleTimerRef = useRef<number | null>(null);

    // Resets the idle timer upon any physical interaction
    const resetIdleTimer = useCallback(() => {
        setScreensaverActive(false);
        if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        
        const timeout = (storeData.screensaverSettings?.idleTimeout || 60) * 1000;
        idleTimerRef.current = window.setTimeout(() => {
            setScreensaverActive(true);
        }, timeout);
    }, [storeData.screensaverSettings?.idleTimeout]);

    useEffect(() => {
        const interactionEvents = ['mousedown', 'touchstart', 'mousemove', 'keydown'];
        interactionEvents.forEach(e => window.addEventListener(e, resetIdleTimer));
        resetIdleTimer();
        return () => {
            interactionEvents.forEach(e => window.removeEventListener(e, resetIdleTimer));
            if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer]);

    // Background heartbeat task for device management
    useEffect(() => {
        const interval = setInterval(async () => {
            const status = await sendHeartbeat();
            if (status) {
                if (status.restart) window.location.reload();
                if (status.deleted) {
                    localStorage.clear();
                    window.location.reload();
                }
                if (status.deviceType && status.deviceType !== deviceType) {
                    setDeviceType(status.deviceType as any);
                }
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [deviceType]);

    // Memoized flat product list for screensaver playlist generation
    const allFlatProducts = useMemo(() => {
        const products: FlatProduct[] = [];
        storeData.brands.forEach(b => {
            b.categories.forEach(c => {
                c.products.forEach(p => {
                    products.push({ ...p, brandName: b.name, categoryName: c.name });
                });
            });
        });
        return products;
    }, [storeData.brands]);

    if (!isConfigured) return <SetupScreen storeData={storeData} onComplete={() => setIsConfigured(true)} />;

    // Specialized render for non-interactive TV wall displays
    if (deviceType === 'tv') {
        return (
            <>
                <TVMode 
                    storeData={storeData} 
                    onRefresh={onSyncRequest} 
                    screensaverEnabled={screensaverActive}
                    onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                />
                {screensaverActive && (
                    <Screensaver 
                        products={allFlatProducts} 
                        ads={storeData.ads?.screensaver || []} 
                        pamphlets={storeData.catalogues?.filter(c => !c.brandId)}
                        onWake={resetIdleTimer}
                        settings={storeData.screensaverSettings}
                    />
                )}
            </>
        );
    }

    const handleToggleCompare = (product: Product) => {
        setSelectedForCompare(prev => 
            prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]
        );
    };

    return (
        <div className="h-screen w-screen bg-slate-50 overflow-hidden flex flex-col font-sans">
            <div className="flex-1 overflow-hidden relative">
                {currentView === 'brands' && (
                    <BrandGrid 
                        brands={storeData.brands} 
                        heroConfig={storeData.hero}
                        allCatalogs={storeData.catalogues}
                        ads={storeData.ads}
                        onSelectBrand={(b) => { setSelectedBrand(b); setCurrentView('categories'); }}
                        onViewGlobalCatalog={setViewingCatalogue}
                        onExport={() => {}}
                        screensaverEnabled={screensaverActive}
                        onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                    />
                )}

                {currentView === 'categories' && selectedBrand && (
                    <CategoryGrid 
                        brand={selectedBrand}
                        storeCatalogs={storeData.catalogues}
                        onSelectCategory={(c) => { setSelectedCategory(c); setCurrentView('products'); }}
                        onViewCatalog={setViewingCatalogue}
                        onBack={() => setCurrentView('brands')}
                        screensaverEnabled={screensaverActive}
                        onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                    />
                )}

                {currentView === 'products' && selectedBrand && selectedCategory && (
                    <ProductList 
                        category={selectedCategory}
                        brand={selectedBrand}
                        storeCatalogs={storeData.catalogues || []}
                        onSelectProduct={(p) => { setSelectedProduct(p); setCurrentView('detail'); }}
                        onBack={() => setCurrentView('categories')}
                        onViewCatalog={(pages) => setViewingCatalogue({ id: 'temp', title: 'Catalogue', pages, type: 'pamphlet' })}
                        screensaverEnabled={screensaverActive}
                        onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                        selectedForCompare={selectedForCompare}
                        onToggleCompare={handleToggleCompare}
                        onStartCompare={() => setCurrentView('compare')}
                    />
                )}

                {currentView === 'detail' && selectedProduct && (
                    <ProductDetail 
                        product={selectedProduct}
                        onBack={() => setCurrentView('products')}
                        screensaverEnabled={screensaverActive}
                        onToggleScreensaver={() => setScreensaverActive(!screensaverActive)}
                    />
                )}
            </div>

            {/* Overlays */}
            {screensaverActive && (
                <Screensaver 
                    products={allFlatProducts} 
                    ads={storeData.ads?.screensaver || []} 
                    pamphlets={storeData.catalogues?.filter(c => !c.brandId)}
                    onWake={resetIdleTimer}
                    settings={storeData.screensaverSettings}
                />
            )}

            {viewingCatalogue && (
                <Flipbook 
                    pages={viewingCatalogue.pages} 
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
                    companyLogo={storeData.appConfig?.pricelistCompanyLogoUrl || storeData.hero.logoUrl}
                    brandLogo={storeData.pricelistBrands?.find(b => b.id === viewingPricelist.brandId)?.logoUrl}
                />
            )}

            {/* Global Bottom Navigation */}
            <nav className="bg-slate-900 text-white p-3 md:p-4 flex items-center justify-between border-t border-slate-800 shadow-2xl shrink-0 z-40">
                <div className="flex items-center gap-6">
                    <button onClick={() => { setCurrentView('brands'); setSelectedBrand(null); setSelectedCategory(null); setSelectedProduct(null); }} className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors"><Store size={18} /></div>
                        <span className="font-black uppercase tracking-widest text-[10px] md:text-sm">Home</span>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-800 hidden md:block"></div>
                    <div className="hidden md:flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">Location</span>
                        <span className="text-xs font-bold truncate max-w-[120px]">{getShopName() || 'Registering...'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                             const pl = storeData.pricelists?.[0];
                             if(pl) setViewingPricelist(pl);
                             else alert("No pricelists available.");
                        }}
                        className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/5 transition-all"
                    >
                        <RIcon size={14} className="text-green-400" /> Pricelists
                    </button>
                    <button 
                        onClick={() => window.history.pushState({}, '', '/about')}
                        className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/5 transition-all"
                    >
                        <Info size={14} className="text-blue-400" /> About
                    </button>
                </div>
            </nav>

            <div className="fixed bottom-20 right-4 pointer-events-none opacity-30">
                <div className="bg-slate-900/50 backdrop-blur-sm text-white px-2 py-1 rounded text-[8px] font-mono">
                    SYNC: {lastSyncTime}
                </div>
            </div>
        </div>
    );
};
