
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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown } from 'lucide-react';
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
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  // Helper to load images for jsPDF
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
        
        // 1. Fetch Logos First
        const [brandImg, companyImg] = await Promise.all([
            brandLogo ? loadImage(brandLogo) : Promise.resolve(null),
            companyLogo ? loadImage(companyLogo) : Promise.resolve(null)
        ]);

        const drawHeader = (pageNum: number) => {
            let topY = 15;

            // Brand Logo (Left)
            if (brandImg) {
                const ratio = brandImg.width / brandImg.height;
                const h = 18;
                const w = h * ratio;
                doc.addImage(brandImg, 'PNG', margin, topY, w, h);
            }

            // Company Logo (Right)
            if (companyImg) {
                const ratio = companyImg.width / companyImg.height;
                const h = 14;
                const w = h * ratio;
                doc.addImage(companyImg, 'PNG', pageWidth - margin - w, topY + 2, w, h);
            }

            // Titles
            doc.setTextColor(30, 41, 59); // Slate-900
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text("Official Price List", margin, topY + 30);
            
            doc.setTextColor(37, 99, 235); // Blue-600
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(pricelist.title.toUpperCase(), margin, topY + 38);

            // Month/Year Box
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
            
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.setFontSize(7);
            doc.text(`REF: ${pricelist.id.substring(0,8).toUpperCase()}`, boxX + boxW, boxY + 12, { align: 'right' });

            // Horizontal Rule
            doc.setDrawColor(30, 41, 59);
            doc.setLineWidth(1.5);
            doc.line(margin, topY + 45, pageWidth - margin, topY + 45);

            return topY + 55;
        };

        const drawTableHeaders = (startY: number) => {
            doc.setFillColor(241, 245, 249); // Slate-100
            doc.rect(margin, startY - 6, pageWidth - (margin * 2), 10, 'F');
            doc.setDrawColor(203, 213, 225); // Slate-300
            doc.setLineWidth(0.1);
            doc.rect(margin, startY - 6, pageWidth - (margin * 2), 10, 'S');

            doc.setTextColor(100, 116, 139); // Slate-500
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text("CODE", margin + 3, startY);
            doc.text("PRODUCT DESCRIPTION", margin + 40, startY);
            doc.text("NORMAL", pageWidth - margin - 35, startY, { align: 'right' });
            doc.text("OFFER", pageWidth - margin - 5, startY, { align: 'right' });
            
            return startY + 8;
        };

        // Initialize First Page
        let currentY = drawHeader(1);
        currentY = drawTableHeaders(currentY);

        const items = pricelist.items || [];
        
        items.forEach((item, index) => {
            // Page Break Logic
            if (currentY > pageHeight - 25) {
                doc.addPage();
                currentY = drawHeader(doc.internal.getNumberOfPages());
                currentY = drawTableHeaders(currentY);
            }

            // Alternating Row Background
            if (index % 2 !== 0) {
                doc.setFillColor(248, 250, 252); // Slate-50
                doc.rect(margin, currentY - 5.5, pageWidth - (margin * 2), 8, 'F');
            }
            
            doc.setDrawColor(241, 245, 249);
            doc.line(margin, currentY + 2.5, pageWidth - margin, currentY + 2.5);

            // Code (Monospace-ish)
            doc.setFont('courier', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(30, 41, 59);
            doc.text(item.sku || 'N/A', margin + 3, currentY);

            // Description
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            const desc = item.description.length > 55 ? item.description.substring(0, 52) + "..." : item.description;
            doc.text(desc.toUpperCase(), margin + 40, currentY);

            // Normal Price
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(item.promoPrice ? 100 : 30); // Dim if promo exists
            doc.text(item.normalPrice || 'POA', pageWidth - margin - 35, currentY, { align: 'right' });

            // Offer Price
            if (item.promoPrice) {
                doc.setTextColor(220, 38, 38); // Red-600
                doc.setFont('helvetica', 'bold');
                doc.text(item.promoPrice, pageWidth - margin - 5, currentY, { align: 'right' });
                doc.setTextColor(30, 41, 59);
            } else {
                doc.text(item.normalPrice || '—', pageWidth - margin - 5, currentY, { align: 'right' });
            }

            currentY += 8;
        });

        // Footer on all pages (Manual loop back if needed, but here just last page for simplicity)
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(`Official Document Generated by Kiosk Pro System | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
        }

        // Save
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
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            margin: 0 !important; 
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
          }
          .print-hidden { display: none !important; }
          .print-only { display: block !important; }
          .viewer-container { 
            position: relative !important; 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            top: 0 !important;
            display: block !important;
            transform: none !important;
          }
          .table-scroll { overflow: visible !important; height: auto !important; padding: 0 !important; }
          .spreadsheet-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            border: 1px solid #000 !important; 
          }
          .spreadsheet-table th { 
            background: #f1f5f9 !important; 
            color: #000 !important; 
            border: 1px solid #000 !important; 
            font-weight: 900 !important;
            text-transform: uppercase !important;
            padding: 8px 10px !important;
            font-size: 11px !important;
          }
          .spreadsheet-table td { 
            border: 1px solid #e2e8f0 !important; 
            color: #000 !important; 
            padding: 8px 10px !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          .spreadsheet-table .excel-row:nth-child(even) {
            background-color: #f8fafc !important;
          }
        }
        
        .spreadsheet-table {
          border-collapse: separate;
          border-spacing: 0;
        }
        .spreadsheet-table th {
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #71717a;
          color: white;
          box-shadow: inset 0 -1px 0 #3f3f46;
        }
        .excel-row:nth-child(even) {
          background-color: #f8fafc;
        }
        .excel-row:hover {
          background-color: #f1f5f9;
        }
        .sku-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        
        .shrink-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: clamp(8.5px, 1.3vw, 14px);
          line-height: 1.2;
        }
        .sku-container {
           font-size: clamp(7.5px, 1.1vw, 12px);
           white-space: nowrap;
        }
      `}</style>

      <div className={`viewer-container relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none print:shadow-none print:max-h-none ${isNewlyUpdated ? 'ring-4 ring-yellow-400 print:ring-0' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* Screen-Only Header */}
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
                <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg hover:bg-blue-50 transition-all active:scale-95 group disabled:opacity-50"
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} className="text-blue-600" />}
                    <span>{isExporting ? 'Building PDF...' : 'Save as PDF'}</span>
                </button>
                <button 
                    onClick={handlePrint}
                    className="hidden md:flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-lg hover:bg-slate-700 transition-all group"
                >
                    <Printer size={16} /> <span>Print</span>
                </button>
             </div>
             <button onClick={onClose} className="p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5"><X size={20}/></button>
          </div>
        </div>

        {/* Professional Print-Only Header */}
        <div className="hidden print-only w-full px-10 pt-8 pb-4">
            <div className="flex justify-between items-end mb-8">
                <div className="flex flex-col gap-4">
                    {brandLogo && <img src={brandLogo} alt="Brand Logo" className="h-16 object-contain self-start" />}
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Official Price List</h1>
                        <p className="text-lg font-bold text-blue-600 uppercase tracking-[0.2em] mt-2">{pricelist.title}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-14 object-contain" />}
                    <div className="text-right">
                        <div className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-widest inline-block">{pricelist.month} {pricelist.year}</div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Document Reference: {pricelist.id.substring(0,8).toUpperCase()}</p>
                    </div>
                </div>
            </div>
            <div className="h-1.5 bg-slate-900 w-full rounded-full mb-8"></div>
        </div>

        {/* Spreadsheet / Table Area */}
        <div className="table-scroll flex-1 overflow-auto bg-white p-0 md:p-4 print:px-10">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', paddingBottom: zoom > 1 ? `${(zoom-1)*100}%` : '0' }} className="transition-transform duration-200">
            <table className="spreadsheet-table w-full text-left border-collapse shadow-sm">
                <thead>
                <tr className="print:bg-[#f1f5f9]">
                    <th className="p-3 md:p-4 text-[10px] md:text-[14px] font-black uppercase tracking-tight border border-slate-300 w-24 md:w-40 print:text-slate-900 print:border-slate-800">CODE</th>
                    <th className="p-3 md:p-4 text-[10px] md:text-[14px] font-black uppercase tracking-tight border border-slate-300 print:text-slate-900 print:border-slate-800">PRODUCT DESCRIPTION</th>
                    <th className="p-3 md:p-4 text-[10px] md:text-[14px] font-black uppercase tracking-tight border border-slate-300 text-right w-24 md:w-32 print:text-slate-900 print:border-slate-800">NORMAL</th>
                    <th className="p-3 md:p-4 text-[10px] md:text-[14px] font-black uppercase tracking-tight border border-slate-300 text-right w-24 md:w-32 print:text-slate-900 print:border-slate-800">OFFER</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {(pricelist.items || []).map((item) => (
                    <tr key={item.id} className="excel-row transition-colors group">
                    <td className="p-2 md:p-3 border border-slate-200 print:border-slate-300">
                        <span className="sku-font font-bold sku-container text-slate-900 uppercase tracking-tighter">
                        {item.sku || 'N/A'}
                        </span>
                    </td>
                    <td className="p-2 md:p-3 border border-slate-200 print:border-slate-300">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 shrink-text uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                {item.description}
                            </span>
                        </div>
                    </td>
                    <td className="p-2 md:p-3 text-right border border-slate-200 print:border-slate-300">
                        <span className={`font-bold text-[10px] md:text-sm tracking-tighter ${item.promoPrice ? 'text-slate-500' : 'text-slate-900'}`}>
                        {item.normalPrice || 'POA'}
                        </span>
                    </td>
                    <td className="p-2 md:p-3 text-right border border-slate-200 print:border-slate-300 bg-slate-50/10">
                        {item.promoPrice ? (
                        <span className="font-black text-[11px] md:text-base text-red-600 tracking-tighter print:text-red-600">
                            {item.promoPrice}
                        </span>
                        ) : (
                        <span className="font-bold text-[10px] md:text-sm text-slate-900 tracking-tighter">
                            {item.normalPrice || '—'}
                        </span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-3 md:p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 print:hidden z-10">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Items: {(pricelist.items || []).length}</span>
              </div>
          </div>
          <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">
            Generated Document • Prices include VAT where applicable.
          </p>
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

// --- NEW COMPONENT: COMPARISON MODAL ---
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
                        <h2 className="text-2xl font-black uppercase text-slate-900 flex items-center gap-3">
                            <Layers className="text-blue-600" /> Product Comparison
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase">Side-by-side Technical Analysis</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors">
                        <X size={24} />
                    </button>
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
                            <tr className="hover:bg-slate-50/50">
                                <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Description</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-6 text-sm font-medium text-slate-600 leading-relaxed italic border-r border-slate-100">
                                        {p.description ? p.description.substring(0, 150) + '...' : 'No description provided.'}
                                    </td>
                                ))}
                            </tr>
                            {specKeys.map(key => (
                                <tr key={key} className="hover:bg-slate-50/50">
                                    <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">{key}</td>
                                    {products.map(p => (
                                        <td key={p.id} className="p-6 text-sm font-black text-slate-900 border-r border-slate-100">
                                            {p.specs[key] || <span className="text-slate-200">—</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr className="hover:bg-slate-50/50">
                                <td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">Key Features</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-6 border-r border-slate-100">
                                        <ul className="space-y-2">
                                            {p.features.slice(0, 5).map((f, i) => (
                                                <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-slate-700">
                                                    <Check size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}
                                                </li>
                                            ))}
                                            {p.features.length > 5 && <li className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-5">+{p.features.length - 5} more</li>}
                                        </ul>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: GLOBAL SEARCH ---
const SearchModal = ({ storeData, onClose, onSelectProduct }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void }) => {
    const [query, setQuery] = useState('');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterHasVideo, setFilterHasVideo] = useState(false);

    const allFlattenedProducts = useMemo(() => {
        return storeData.brands.flatMap(b => 
            b.categories.flatMap(c => 
                c.products.map(p => ({
                    ...p,
                    brandName: b.name,
                    brandId: b.id,
                    categoryName: c.name,
                    categoryId: c.id
                }))
            )
        );
    }, [storeData]);

    const results = useMemo(() => {
        const lower = query.toLowerCase().trim();
        return allFlattenedProducts.filter(p => {
            const matchesQuery = !lower || 
                p.name.toLowerCase().includes(lower) || 
                (p.sku && p.sku.toLowerCase().includes(lower)) ||
                p.description.toLowerCase().includes(lower);
            
            const matchesBrand = filterBrand === 'all' || p.brandId === filterBrand;
            const matchesCat = filterCategory === 'all' || p.categoryName === filterCategory;
            const matchesVideo = !filterHasVideo || (p.videoUrl || (p.videoUrls && p.videoUrls.length > 0));

            return matchesQuery && matchesBrand && matchesCat && matchesVideo;
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [query, filterBrand, filterCategory, filterHasVideo, allFlattenedProducts]);

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in" onClick={onClose}>
            <div className="p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
                <div className="shrink-0 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 group-focus-within:scale-110 transition-transform" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Find any product, SKU, or feature..." 
                            className="w-full bg-white/10 text-white placeholder:text-slate-500 text-3xl md:text-5xl font-black uppercase tracking-tight py-6 pl-20 pr-20 border-b-4 border-white/10 outline-none focus:border-blue-500 transition-all rounded-t-3xl"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2">
                            <X size={40} />
                        </button>
                    </div>
                </div>
                <div className="shrink-0 flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="p-2 bg-blue-600 rounded-lg text-white"><Filter size={16} /></div>
                        <select 
                            value={filterBrand} 
                            onChange={e => setFilterBrand(e.target.value)}
                            className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"
                        >
                            <option value="all" className="bg-slate-900">All Brands</option>
                            {storeData.brands.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                        <div className="p-2 bg-purple-600 rounded-lg text-white"><LayoutGrid size={16} /></div>
                        <select 
                            value={filterCategory} 
                            onChange={e => setFilterCategory(e.target.value)}
                            className="bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer pr-4"
                        >
                            <option value="all" className="bg-slate-900">All Categories</option>
                            {Array.from(new Set(allFlattenedProducts.map(p => p.categoryName))).sort().map(c => (
                                <option key={c} value={c} className="bg-slate-900">{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.map(p => (
                            <button
                                key={p.id}
                                onClick={() => { onSelectProduct(p); onClose(); }}
                                className="group bg-white rounded-3xl overflow-hidden flex flex-col text-left transition-all hover:scale-105 active:scale-95 shadow-xl border-4 border-transparent hover:border-blue-500"
                            >
                                <div className="aspect-square bg-white relative flex items-center justify-center p-4">
                                    {p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}
                                </div>
                                <div className="p-4 bg-slate-50/50 flex-1 flex flex-col">
                                    <h4 className="font-black text-slate-900 uppercase text-xs leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{p.name}</h4>
                                    <div className="mt-auto text-[9px] font-mono font-bold text-slate-400">{p.sku || 'N/A'}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBrandForPricelist, setSelectedBrandForPricelist] = useState<string | null>(null);
  
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

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
        setShowGlobalSearch(false);
        setShowCompareModal(false);
        setCompareProductIds([]);
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
      const interval = setInterval(syncCycle, 30000);
      return () => { clearInterval(interval); clearInterval(clockInterval); };
    }
    return () => { clearInterval(clockInterval); };
  }, [resetIdleTimer, isSetup, resetDeviceIdentity]);

  const allProductsFlat = useMemo(() => {
      if (!storeData?.brands) return [];
      return storeData.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct))));
  }, [storeData?.brands]);
  
  const pricelistBrands = useMemo(() => {
      return (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [storeData?.pricelistBrands]);

  const toggleCompareProduct = (product: Product) => {
    setCompareProductIds(prev => 
        prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id].slice(-5)
    );
  };

  const productsToCompare = useMemo(() => {
    return allProductsFlat.filter(p => compareProductIds.includes(p.id));
  }, [allProductsFlat, compareProductIds]);

  if (!storeData) return null;

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
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-2 md:px-4 z-50 border-b border-slate-800 shadow-md print:hidden">
           <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
               {storeData.companyLogoUrl ? <img src={storeData.companyLogoUrl} className="h-4 md:h-6 object-contain" alt="" /> : <Store size={16} className="text-blue-500" />}
               <button 
                  onClick={() => setShowGlobalSearch(true)}
                  className="bg-white/10 hover:bg-blue-600 transition-colors px-2 py-1 rounded-md flex items-center gap-1.5 md:ml-4 group"
               >
                   <Search size={12} className="text-blue-400 group-hover:text-white" />
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest hidden md:inline">Universal Search</span>
               </button>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}>
                    {isCloudConnected ? <Cloud size={8} /> : <HardDrive size={8} />}
                </div>
                <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                    <button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className={`p-1 rounded flex items-center gap-1 text-[8px] md:text-[10px] font-bold transition-colors ${zoomLevel === 1 ? 'text-blue-400 bg-blue-900/30' : 'text-purple-400 bg-purple-900/30'}`}><ZoomOut size={12} /></button>
                </div>
           </div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={setActiveBrand} onViewGlobalCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectCategory={setActiveCategory} onViewCatalog={(c:any) => { if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={setActiveProduct} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} selectedForCompare={compareProductIds} onToggleCompare={toggleCompareProduct} onStartCompare={() => setShowCompareModal(true)} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={deviceType === 'kiosk'} />}
       </div>
       <footer className="shrink-0 bg-white border-t border-slate-200 text-slate-500 h-8 flex items-center justify-between px-2 md:px-6 z-50 text-[8px] md:text-[10px] print:hidden">
          <div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Connected' : 'Offline'}</span></div>
          <div className="flex items-center gap-4">
              {pricelistBrands.length > 0 && (
                <button 
                  onClick={() => { setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-5 h-5 rounded flex items-center justify-center shadow-sm active:scale-95 transition-all"
                  title="Pricelists"
                >
                  <RIcon size={10} className="text-white" />
                </button>
              )}
              <button onClick={() => setShowCreator(true)} className="flex items-center gap-1 font-black uppercase tracking-widest"><span>JSTYP</span></button>
          </div>
       </footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showGlobalSearch && <SearchModal storeData={storeData} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b => b.id === (p as any).brandId)!); setActiveCategory(storeData.brands.find(b => b.id === (p as any).brandId)!.categories.find(c => c.id === (p as any).categoryId)!); setActiveProduct(p); }} onClose={() => setShowGlobalSearch(false)} />}
       {showCompareModal && <ComparisonModal products={productsToCompare} onClose={() => setShowCompareModal(false)} onShowDetail={setActiveProduct} />}
       {showPricelistModal && (
           <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in print:hidden" onClick={() => setShowPricelistModal(false)}>
               <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <h2 className="text-base md:text-xl font-black uppercase text-slate-900 flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2>
                      <button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full transition-colors hover:bg-slate-200"><X size={24} className="text-slate-500" /></button>
                   </div>
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                       <div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden flex flex-col">
                           <div className="md:hidden">
                               <div className="overflow-x-auto no-scrollbar py-2">
                                   <div className="grid grid-rows-2 grid-flow-col gap-2 px-2 min-w-max">
                                       {pricelistBrands.map(brand => (
                                           <button 
                                               key={brand.id} 
                                               onClick={() => setSelectedBrandForPricelist(brand.id)} 
                                               className={`flex items-center gap-2 p-2 rounded-xl border transition-all min-w-[120px] ${selectedBrandForPricelist === brand.id ? 'bg-white border-green-500 shadow-sm ring-1 ring-green-500/20' : 'bg-slate-100 border-transparent hover:bg-white'}`}
                                           >
                                               <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                                  {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-[10px]">{brand.name.charAt(0)}</span>}
                                               </div>
                                               <span className={`font-black text-[9px] uppercase leading-tight truncate flex-1 text-left ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-500'}`}>{brand.name}</span>
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           </div>
                           <div className="hidden md:flex flex-1 flex-col overflow-y-auto no-scrollbar">
                               {pricelistBrands.map(brand => (
                                   <button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}>
                                       <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                          {brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}
                                       </div>
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
                                                onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} 
                                                className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-white hover:border-green-400'}`}
                                            >
                                                <div className="aspect-[3/4] bg-slate-50 relative p-2 md:p-3 overflow-hidden">
                                                    {pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded shadow-sm" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">{pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}</div>}
                                                    <div className={`absolute top-2 right-2 text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-500'}`}>{pl.type === 'manual' ? 'TABLE' : 'PDF'}</div>
                                                </div>
                                                <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                                                    <h3 className="font-black text-slate-900 text-[10px] md:text-sm uppercase leading-tight line-clamp-2">{pl.title}</h3>
                                                    <div className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-2">{pl.month} {pl.year}</div>
                                                </div>
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           ) : <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"><RIcon size={64} className="opacity-10" /></div>}
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
            companyLogo={storeData.hero.logoUrl || storeData.companyLogoUrl}
            brandLogo={getActiveBrandLogo()}
          />
       )}
    </div>
  );
};
