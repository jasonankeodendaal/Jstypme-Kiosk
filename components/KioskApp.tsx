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
import { Store, RotateCcw, X, Loader2, Wifi, ShieldCheck, MonitorPlay, MonitorStop, Tablet, Smartphone, Cloud, HardDrive, RefreshCw, ZoomIn, ZoomOut, Tv, FileText, Monitor, Lock, List, Sparkles, CheckCircle2, ChevronRight, LayoutGrid, Printer, Download, Search, Filter, Video, Layers, Check, Info, Package, Tag, ArrowUpRight, MoveUp, Maximize, FileDown, Grip, Image as ImageIcon, SearchIcon, Minus, Plus, ToggleLeft, ToggleRight, Globe, Activity, ChevronLeft, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 21V3h7a5 5 0 0 1 0 10H7" /><path d="M13 13l5 8" /><path d="M10 8h4" /></svg>
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
        if (step === 1) { if (!shopName.trim()) return setError('Enter location name.'); setStep(2); } 
        else if (step === 2) { setStep(3); } 
        else if (step === 3) {
            const systemPin = storeData.systemSettings?.setupPin || '0000';
            if (pin !== systemPin) return setError('Invalid PIN.');
            setIsProcessing(true);
            try { await provisionKioskId(); const success = await completeKioskSetup(shopName.trim(), deviceType); if (success) onComplete(); else setError('Storage error.'); } catch (e) { setError('Sync failed.'); } finally { setIsProcessing(false); }
        }
    };
    return (
        <div className="fixed inset-0 z-[300] bg-[#0f172a] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden border-2 border-white">
                <div className="bg-[#1e293b] text-white p-6 text-center"><div className="flex flex-col items-center"><div className="bg-blue-600 p-2 rounded-lg mb-3"><Store size={28} /></div><h1 style={{fontSize: '24px', fontWeight: 900}} className="uppercase tracking-tight">System Setup</h1><p style={{color: '#94a3b8', fontSize: '10px', fontWeight: 'bold'}} className="uppercase tracking-widest mt-1">Kiosk Firmware v2.8</p></div></div>
                <div className="p-6"><div className="flex justify-center gap-2 mb-6">{[1, 2, 3].map(s => (<div key={s} className={`h-2 rounded-full transition-all ${step >= s ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}></div>))}</div>
                    <div style={{minHeight: '200px'}}>{step === 1 && (<div className="animate-fade-in"><label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">01. Device Location</label><h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Where is this tablet located?</h2><input autoFocus className="w-full p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-bold text-lg text-black uppercase" placeholder="e.g. Front Desk" value={shopName} onChange={(e) => setShopName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} /></div>)}
                        {step === 2 && (<div className="animate-fade-in"><label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">02. Display Mode</label><h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Hardware Profile</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-2">{[{ id: 'kiosk', icon: <Tablet size={20}/>, label: 'Kiosk' }, { id: 'mobile', icon: <Smartphone size={20}/>, label: 'Handheld' }, { id: 'tv', icon: <Tv size={20}/>, label: 'TV Display' }].map(type => (<button key={type.id} onClick={() => setDeviceType(type.id as any)} style={{borderWidth: '3px'}} className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${deviceType === type.id ? 'bg-blue-600 border-blue-800 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><div>{type.icon}</div><div style={{fontWeight: 900}} className="uppercase text-xs">{type.label}</div></button>))}</div></div>)}
                        {step === 3 && (<div className="animate-fade-in text-center"><label style={{color: '#475569', fontSize: '11px', fontWeight: 900}} className="block uppercase tracking-widest mb-2">03. Security PIN</label><h2 style={{color: '#000', fontSize: '18px', fontWeight: 900}} className="mb-4">Authorized Admin Entry</h2><input autoFocus type="password" maxLength={8} className="w-full max-w-[200px] p-4 bg-white border-2 border-slate-400 rounded-lg outline-none focus:border-blue-600 font-mono font-bold text-3xl text-center tracking-[0.5em] text-black" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} /></div>)}
                    </div>
                    {error && <div style={{background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171'}} className="mt-4 p-3 rounded-lg text-xs font-black uppercase flex items-center gap-2"> {error}</div>}
                    <div className="mt-8 flex gap-3">{step > 1 && (<button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-slate-200 text-black rounded-lg font-black uppercase text-xs tracking-widest">Back</button>)}<button onClick={handleNext} disabled={isProcessing} className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg">{isProcessing ? <><Loader2 className="animate-spin" size={14} /> Syncing...</> : <>{step === 3 ? 'Start Application' : 'Next Step'} <ChevronRight size={14} /></>}</button></div>
                </div>
            </div>
        </div>
    );
};

const PricelistRow = React.memo(({ item, hasImages, onEnlarge }: { item: PricelistItem, hasImages: boolean, onEnlarge: (url: string) => void }) => (
    <tr className="excel-row border-b border-slate-100 transition-colors group hover:bg-slate-50">{hasImages && (<td className="p-1 border-r border-slate-100 text-center shrink-cell"><div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded flex items-center justify-center mx-auto overflow-hidden cursor-zoom-in hover:ring-1 hover:ring-blue-400 transition-all print:w-6 print:h-6" onClick={(e) => { e.stopPropagation(); if(item.imageUrl) onEnlarge(item.imageUrl); }}>{item.imageUrl ? <img src={item.imageUrl} loading="lazy" decoding="async" className="w-full h-full object-contain" alt="" /> : <ImageIcon size={16} className="text-slate-100" />}</div></td>)}<td className="sku-cell border-r border-slate-100"><span className="sku-font font-bold text-slate-900 uppercase">{item.sku || ''}</span></td><td className="desc-cell border-r border-slate-100"><span className="font-bold text-slate-900 uppercase tracking-tight group-hover:text-[#c0810d] transition-colors whitespace-normal break-words leading-tight">{item.description}</span></td><td className="price-cell text-right border-r border-slate-100 whitespace-nowrap"><span className="font-bold text-slate-900">{item.normalPrice || ''}</span></td><td className="price-cell text-right bg-slate-50/10 whitespace-nowrap">{item.promoPrice ? (<span className="font-black text-[#ef4444] tracking-tighter">{item.promoPrice}</span>) : (<span className="font-bold text-slate-900">{item.normalPrice || ''}</span>)}</td></tr>
));

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo, brandName }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string, brandName?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const items = pricelist.items || [];
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const hasImages = useMemo(() => pricelist.items?.some(item => item.imageUrl && item.imageUrl.trim() !== '') || false, [pricelist.items]);
  const displayedItems = useMemo(() => items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [items, currentPage]);

  // NAVIGATION HUD LOGIC
  const scrollInterval = useRef<number | null>(null);
  const startScrolling = (dx: number, dy: number) => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    const step = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: dx * 20, top: dy * 20, behavior: 'auto' });
        }
    };
    scrollInterval.current = window.setInterval(step, 16);
  };
  const stopScrolling = () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation(); setIsExporting(true);
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const margin = 8; const pageWidth = doc.internal.pageSize.getWidth();
        const innerWidth = pageWidth - (margin * 2);
        const mediaW = hasImages ? 14 : 0; const skuW = hasImages ? 20 : 25; const normalW = 22; const promoW = 22;
        const descW = innerWidth - mediaW - skuW - normalW - promoW;
        let currentY = 20; doc.text(pricelist.title.toUpperCase(), margin, currentY);
        doc.save(`${pricelist.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { alert("Unable to generate PDF."); } finally { setIsExporting(false); }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-0 md:p-8 animate-fade-in print:bg-white print:p-0 print:block overflow-hidden print:overflow-visible" onClick={onClose}>
      <style>{`
        @media print { .print-hidden { display: none !important; } .viewer-container { box-shadow: none !important; border: none !important; display: block !important; width: 100% !important; height: auto !important; position: static !important; overflow: visible !important; } .spreadsheet-table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; display: table !important; } .spreadsheet-table th { background: #71717a !important; color: #fff !important; border: 0.2pt solid #94a3b8 !important; padding: 2pt !important; font-size: 6pt !important; } .spreadsheet-table td { border: 0.1pt solid #cbd5e1 !important; color: #000 !important; padding: 1.5pt 2pt !important; font-size: 6.5pt !important; vertical-align: middle !important; line-height: 1 !important; } .excel-row { height: auto !important; page-break-inside: avoid !important; display: table-row !important; } }
        .spreadsheet-table { border-collapse: separate; border-spacing: 0; table-layout: fixed; width: 100%; transform: translate3d(0,0,0); }
        .spreadsheet-table th { position: sticky; top: 0; z-index: 10; background-color: #71717a; color: white; padding: 12px 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .excel-row { height: 44px; content-visibility: auto; contain-intrinsic-size: 44px; }
        .excel-row:nth-child(even) { background-color: #f8fafc; }
        .sku-font { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .sku-cell { word-break: break-all; font-size: clamp(7px, 1.1vw, 10px); padding: 4px; width: 15%; }
        .desc-cell { font-size: clamp(8px, 1.2vw, 12px); padding: 4px 8px; width: auto; }
        .price-cell { font-size: clamp(9px, 1.4vw, 13px); font-weight: 900; padding: 4px; width: 14%; }
        .shrink-cell { width: 40px; }
      `}</style>

      <div className="viewer-container relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none print:shadow-none print:max-h-none print:block" onClick={e => e.stopPropagation()}>
        <div className="print-hidden p-4 md:p-6 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
          <div className="flex items-center gap-4 overflow-hidden"><div className="hidden md:flex bg-white/10 p-2 rounded-xl border border-white/10"><RIcon size={24} className="text-white" /></div><div className="flex flex-col min-w-0"><div className="flex items-center gap-2"><h2 className="text-sm md:text-2xl font-black uppercase tracking-tight leading-none truncate">{pricelist.title}</h2>{isNewlyUpdated && (<span className="bg-white text-[#c0810d] px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-md">NEW</span>)}</div><p className="text-yellow-100 font-bold uppercase tracking-widest text-[8px] mt-1">{pricelist.month} {pricelist.year}</p></div></div>
          <div className="flex items-center gap-4"><div className="flex items-center gap-3 bg-black/30 p-1.5 rounded-full border border-white/10"><button onClick={() => setZoom(prev => Math.max(prev - 0.25, 1))} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><SearchIcon size={14} className="scale-x-[-1]"/></button><span className="text-[10px] font-black tracking-widest min-w-[40px] text-center">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><SearchIcon size={14}/></button></div><button onClick={handleExportPDF} disabled={isExporting} className="bg-[#0f172a] text-white px-6 py-3 rounded-xl font-black text-xs uppercase shadow-2xl hover:bg-black transition-all">{isExporting ? '...' : 'PDF'}</button><button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30"><X size={20}/></button></div>
        </div>

        <div ref={scrollContainerRef} className={`flex-1 overflow-auto bg-slate-100/50 relative p-4 print:p-0 print:overflow-visible transition-all duration-300`}>
          <div className="min-w-full min-h-full flex items-start justify-center">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: zoom > 1 ? 'max-content' : '100%' }} className="bg-white shadow-xl rounded-xl overflow-hidden print:transform-none print:shadow-none print:rounded-none">
              <table className="spreadsheet-table w-full text-left border-collapse print:table"><thead className="print:table-header-group"><tr className="print:bg-[#71717a] bg-[#71717a]">{hasImages && <th className="p-3 shrink-cell text-white">Media</th>}<th className="p-3 sku-cell text-white">SKU</th><th className="p-3 desc-cell text-white">Description</th><th className="p-3 price-cell text-right text-white">Normal</th><th className="p-3 price-cell text-right text-white">Promo</th></tr></thead>
                  <tbody>{displayedItems.map((item) => (<PricelistRow key={item.id} item={item} hasImages={hasImages} onEnlarge={url => setEnlargedImage(url)} />))}</tbody></table>
            </div>
          </div>
        </div>

        {/* NAVIGATION D-PAD (HUD) */}
        {zoom > 1.2 && (
            <div className="fixed bottom-24 right-8 z-[120] flex flex-col items-center gap-2 bg-black/40 backdrop-blur-xl p-4 rounded-full border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in select-none" onMouseUp={stopScrolling} onTouchEnd={stopScrolling}>
                <button onMouseDown={()=>startScrolling(0,-1)} onTouchStart={()=>startScrolling(0,-1)} className="p-4 bg-white/10 hover:bg-blue-600 rounded-full text-white transition-all active:scale-95"><ChevronUp size={24}/></button>
                <div className="flex gap-2">
                    <button onMouseDown={()=>startScrolling(-1,0)} onTouchStart={()=>startScrolling(-1,0)} className="p-4 bg-white/10 hover:bg-blue-600 rounded-full text-white transition-all active:scale-95"><ChevronLeft size={24}/></button>
                    <div className="w-12 h-12 flex items-center justify-center text-white/20"><Grip size={20}/></div>
                    <button onMouseDown={()=>startScrolling(1,0)} onTouchStart={()=>startScrolling(1,0)} className="p-4 bg-white/10 hover:bg-blue-600 rounded-full text-white transition-all active:scale-95"><ChevronRight size={24}/></button>
                </div>
                <button onMouseDown={()=>startScrolling(0,1)} onTouchStart={()=>startScrolling(0,1)} className="p-4 bg-white/10 hover:bg-blue-600 rounded-full text-white transition-all active:scale-95"><ChevronDown size={24}/></button>
            </div>
        )}
        
        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0 print:hidden z-10">
          <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">TOTAL: {items.length}</span>
              {totalPages > 1 && (
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollContainerRef.current?.scrollTo(0,0); }} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                      <span className="text-[10px] font-black text-slate-700 uppercase min-w-[60px] text-center">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollContainerRef.current?.scrollTo(0,0); }} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
              )}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OFFICIAL KIOSK PRO DOCUMENT</p>
        </div>
      </div>
      {enlargedImage && <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setEnlargedImage(null)}><img src={enlargedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="" /></div>}
    </div>
  );
};

export const CreatorPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}><div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/5] flex flex-col items-center justify-center text-center p-6 bg-slate-900" onClick={e => e.stopPropagation()}><div className="absolute inset-0 bg-[url('https://i.ibb.co/dsh2c2hp/unnamed.jpg')] bg-cover bg-center opacity-30"></div><div className="relative z-10"><img src="https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-4" /><h2 className="text-white font-black text-2xl mb-1">JSTYP.me</h2><p className="text-white/70 text-xs italic mb-8">Digital Retail Specialist</p><div className="flex gap-4 justify-center"><a href="https://wa.me/27695989427" target="_blank" className="bg-green-600 p-3 rounded-full"><img src="https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png" className="w-6 h-6" /></a><a href="mailto:jstypme@gmail.com" className="bg-white p-3 rounded-full"><img src="https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png" className="w-6 h-6" /></a></div></div><button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button></div></div>
);

const ComparisonModal = ({ products, onClose, onShowDetail }: { products: Product[], onClose: () => void, onShowDetail: (p: Product) => void }) => {
    const specKeys = useMemo(() => { const keys = new Set<string>(); products.forEach(p => Object.keys(p.specs).forEach(k => keys.add(k))); return Array.from(keys).sort(); }, [products]);
    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in p-2 md:p-12" onClick={onClose}><div className="relative w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}><div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"><div><h2 className="text-2xl font-black uppercase text-slate-900 flex items-center gap-3"><Layers className="text-blue-600" /> Comparison</h2><p className="text-xs text-slate-500 font-bold uppercase">Technical Analysis</p></div><button onClick={onClose} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors"><X size={24} /></button></div><div className="flex-1 overflow-x-auto overflow-y-auto"><table className="w-full border-collapse min-w-[800px]"><thead className="sticky top-0 z-20 bg-white shadow-sm"><tr><th className="p-6 bg-slate-50 w-64 border-r border-slate-100 shrink-0"></th>{products.map(p => (<th key={p.id} className="p-6 border-r border-slate-100 text-center min-w-[300px]"><div className="flex flex-col items-center"><div className="w-40 h-40 bg-white p-2 rounded-2xl mb-4 flex items-center justify-center shadow-sm border border-slate-100">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}</div><h3 className="font-black text-lg text-slate-900 uppercase leading-tight mb-1">{p.name}</h3><button onClick={() => { onShowDetail(p); onClose(); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">View Details</button></div></th>))}</tr></thead><tbody className="divide-y divide-slate-100">{specKeys.map(key => (<tr key={key} className="hover:bg-slate-50/50"><td className="p-6 bg-slate-50/50 font-black uppercase text-[10px] text-slate-400 border-r border-slate-100">{key}</td>{products.map(p => (<td key={p.id} className="p-6 text-sm font-black text-slate-900 border-r border-slate-100">{p.specs[key] || <span className="text-slate-200">—</span>}</td>))}</tr>))}</tbody></table></div></div></div>
    );
};

const SearchModal = ({ storeData, onClose, onSelectProduct }: { storeData: StoreData, onClose: () => void, onSelectProduct: (p: Product) => void }) => {
    const [query, setQuery] = useState('');
    const allFlattenedProducts = useMemo(() => storeData.brands.flatMap(b => b.categories.flatMap(c => c.products.map(p => ({...p, brandName: b.name, brandId: b.id, categoryName: c.name, categoryId: c.id})))), [storeData]);
    const results = useMemo(() => { const lower = query.toLowerCase().trim(); return allFlattenedProducts.filter(p => !lower || p.name.toLowerCase().includes(lower) || (p.sku && p.sku.toLowerCase().includes(lower))).sort((a,b) => a.name.localeCompare(b.name)); }, [query, allFlattenedProducts]);
    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-fade-in" onClick={onClose}><div className="p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}><div className="shrink-0 mb-8"><div className="relative group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8" /><input autoFocus type="text" placeholder="Search inventory..." className="w-full bg-white/10 text-white placeholder:text-slate-500 text-3xl md:text-5xl font-black uppercase tracking-tight py-6 pl-20 pr-20 border-b-4 border-white/10 outline-none focus:border-blue-500 transition-all rounded-t-3xl" value={query} onChange={(e) => setQuery(e.target.value)} /><button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-2"><X size={40} /></button></div></div>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{results.map(p => (<button key={p.id} onClick={() => { onSelectProduct(p); onClose(); }} className="group bg-white rounded-3xl overflow-hidden flex flex-col text-left transition-all hover:scale-105 active:scale-95 shadow-xl border-4 border-transparent hover:border-blue-500"><div className="aspect-square bg-white relative flex items-center justify-center p-4">{p.imageUrl ? <img src={p.imageUrl} className="max-w-full max-h-full object-contain" /> : <Package size={48} className="text-slate-100" />}</div><div className="p-4 bg-slate-50/50 flex-1 flex flex-col"><h4 className="font-black text-slate-900 uppercase text-xs leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{p.name}</h4><div className="mt-auto text-[9px] font-mono font-bold text-slate-400">{p.sku || 'N/A'}</div></div></button>))}</div></div></div></div>
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
  const [viewingWebsite, setViewingWebsite] = useState<string | null>(null);
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

  useEffect(() => { const h = setInterval(() => { if (window.signalAppHeartbeat) window.signalAppHeartbeat(); }, 2000); return () => clearInterval(h); }, []);
  useEffect(() => { const unlock = () => { if (!isAudioUnlocked) { setIsAudioUnlocked(true); const silent = new (window.AudioContext || (window as any).webkitAudioContext)(); const buf = silent.createBuffer(1, 1, 22050); const src = silent.createBufferSource(); src.buffer = buf; src.connect(silent.destination); src.start(0); } }; window.addEventListener('touchstart', unlock, { once: true }); window.addEventListener('mousedown', unlock, { once: true }); window.addEventListener('keydown', unlock, { once: true }); }, [isAudioUnlocked]);
  const resetIdleTimer = useCallback(() => { setIsIdle(false); if (timerRef.current) clearTimeout(timerRef.current); if (screensaverEnabled && deviceType === 'kiosk' && isSetup) { timerRef.current = window.setTimeout(() => { setIsIdle(true); setActiveProduct(null); setActiveCategory(null); setActiveBrand(null); setShowFlipbook(false); setViewingPdf(null); setViewingManualList(null); setShowPricelistModal(false); setShowGlobalSearch(false); setShowCompareModal(false); setCompareProductIds([]); setViewingWebsite(null); }, idleTimeout); } }, [screensaverEnabled, idleTimeout, deviceType, isSetup]);
  const resetDeviceIdentity = useCallback(() => { localStorage.clear(); window.location.reload(); }, []);
  useEffect(() => { window.addEventListener('touchstart', resetIdleTimer); window.addEventListener('click', resetIdleTimer); window.addEventListener('online', () => setIsOnline(true)); window.addEventListener('offline', () => setIsOnline(false)); checkCloudConnection().then(setIsCloudConnected); if (isSetup) { const sync = async () => { const res = await sendHeartbeat(); if (res?.deleted) resetDeviceIdentity(); else if (res?.restart) window.location.reload(); }; sync(); const i = setInterval(sync, 30000); return () => clearInterval(i); } }, [resetIdleTimer, isSetup, resetDeviceIdentity]);
  const navigateDeeper = () => window.history.pushState({ depth: Date.now() }, '', '');
  const allProductsFlat = useMemo(() => storeData?.brands.flatMap(b => (b.categories || []).flatMap(c => (c.products || []).map(p => ({...p, brandName: b.name, categoryName: c.name} as FlatProduct)))) || [], [storeData?.brands]);
  const pricelistBrands = useMemo(() => (storeData?.pricelistBrands || []).slice().sort((a, b) => a.name.localeCompare(b.name)), [storeData?.pricelistBrands]);
  if (!storeData) return null;
  if (!isSetup) return <SetupScreen storeData={storeData} onComplete={() => setIsSetup(true)} />;
  if (deviceType === 'tv') return <TVMode storeData={storeData} onRefresh={() => window.location.reload()} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(!screensaverEnabled)} isAudioUnlocked={isAudioUnlocked} />;
  
  return (
    <div className="relative bg-slate-100 overflow-hidden flex flex-col h-[100dvh] w-full">
       {isIdle && screensaverEnabled && deviceType === 'kiosk' && <Screensaver products={allProductsFlat} ads={storeData.ads?.screensaver || []} pamphlets={storeData.catalogues || []} onWake={resetIdleTimer} settings={storeData.screensaverSettings} isAudioUnlocked={isAudioUnlocked} />}
       <header className="shrink-0 h-10 bg-slate-900 text-white flex items-center justify-between px-4 z-50 border-b border-slate-800 shadow-md">
           <div className="flex items-center flex-1 max-w-md overflow-hidden mr-4"><button onClick={() => { setShowGlobalSearch(true); navigateDeeper(); }} className="flex items-center gap-3 bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-white px-4 py-1 rounded-lg border border-white/5 transition-all group w-full text-left"><Search size={12} className="text-blue-500"/><span className="text-[10px] font-black uppercase tracking-widest truncate">Inventory Search...</span></button></div>
           <div className="flex items-center gap-4"><div className="hidden lg:flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700"><Activity size={12} className="text-green-500 animate-pulse"/><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Watchdog Active</span></div>{deviceType === 'kiosk' && (<button onClick={() => setScreensaverEnabled(!screensaverEnabled)} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${screensaverEnabled ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'}`}>{screensaverEnabled ? <MonitorPlay size={14} className="animate-pulse" /> : <MonitorStop size={14} />}<span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{screensaverEnabled ? 'ON' : 'OFF'}</span></button>)}<div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isCloudConnected ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-orange-900/50 text-orange-300 border-orange-800'} border`}><Cloud size={8} /></div><button onClick={() => setZoomLevel(zoomLevel === 1 ? 0.75 : 1)} className="p-1 rounded text-blue-400 bg-blue-900/30"><ZoomOut size={12}/></button></div>
       </header>
       <div className="flex-1 relative flex flex-col min-h-0 print:overflow-visible" style={{ zoom: zoomLevel }}>
         {!activeBrand ? <BrandGrid brands={storeData.brands || []} heroConfig={storeData.hero} allCatalogs={storeData.catalogues || []} ads={storeData.ads} onSelectBrand={(b) => { setActiveBrand(b); navigateDeeper(); }} onViewGlobalCatalog={(c:any) => { navigateDeeper(); if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onViewWebsite={(url) => { navigateDeeper(); setViewingWebsite(url); }} onExport={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} deviceType={deviceType} /> : !activeCategory ? <CategoryGrid brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectCategory={(c) => { setActiveCategory(c); navigateDeeper(); }} onViewCatalog={(c:any) => { navigateDeeper(); if(c.pdfUrl) setViewingPdf({url:c.pdfUrl, title:c.title}); else if(c.pages?.length) { setFlipbookPages(c.pages); setFlipbookTitle(c.title); setShowFlipbook(true); }}} onBack={() => setActiveBrand(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} /> : !activeProduct ? <ProductList category={activeCategory} brand={activeBrand} storeCatalogs={storeData.catalogues || []} onSelectProduct={(p) => { setActiveProduct(p); navigateDeeper(); }} onBack={() => setActiveCategory(null)} onViewCatalog={() => {}} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} selectedForCompare={compareProductIds} onToggleCompare={(p) => setCompareProductIds(prev => prev.includes(p.id)?prev.filter(id=>id!==p.id):[...prev,p.id].slice(-5))} onStartCompare={() => { navigateDeeper(); setShowCompareModal(true); }} /> : <ProductDetail product={activeProduct} onBack={() => setActiveProduct(null)} screensaverEnabled={screensaverEnabled} onToggleScreensaver={() => setScreensaverEnabled(prev => !prev)} showScreensaverButton={false} />}
       </div>
       <footer className="relative shrink-0 bg-white border-t border-slate-200 h-10 flex items-center justify-between px-6 z-50 text-[10px] print:hidden"><div className="flex items-center gap-4"><div className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="font-bold uppercase">{isOnline ? 'Live' : 'Offline'}</span></div><div className="flex items-center gap-1 border-l border-slate-200 pl-4"><span className="font-mono font-bold text-slate-600">{kioskId}</span></div><div className="flex items-center gap-1 border-l border-slate-200 pl-4"><span className="font-bold uppercase text-slate-400">Sync: {lastSyncTime || '--:--'}</span></div></div>{pricelistBrands.length > 0 && (<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><button onClick={() => { navigateDeeper(); setSelectedBrandForPricelist(pricelistBrands[0]?.id || null); setShowPricelistModal(true); }} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 border-2 border-white ring-8 ring-blue-600/5 group"><RIcon size={16} className="text-white group-hover:scale-110 transition-transform" /></button></div>)}<div className="flex items-center gap-4 shrink-0"><button onClick={() => setShowCreator(true)} className="font-black uppercase tracking-widest text-[10px] hover:text-blue-600 transition-colors">JSTYP</button></div></footer>
       <CreatorPopup isOpen={showCreator} onClose={() => setShowCreator(false)} />
       {showGlobalSearch && <SearchModal storeData={storeData} onSelectProduct={(p) => { setActiveBrand(storeData.brands.find(b => b.id === (p as any).brandId)!); setActiveCategory(storeData.brands.find(b => b.id === (p as any).brandId)!.categories.find(c => c.id === (p as any).categoryId)!); setActiveProduct(p); }} onClose={() => setShowGlobalSearch(false)} />}
       {showCompareModal && <ComparisonModal products={allProductsFlat.filter(p => compareProductIds.includes(p.id))} onClose={() => setShowCompareModal(false)} onShowDetail={(p) => { setShowCompareModal(false); setActiveProduct(p); }} />}
       {showPricelistModal && (<div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in print:hidden" onClick={() => setShowPricelistModal(false)}><div className="relative w-full md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden md:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0"><h2 className="text-xl font-black uppercase flex items-center gap-2"><RIcon size={24} className="text-green-600" /> Pricelists</h2><button onClick={() => setShowPricelistModal(false)} className="p-2 rounded-full transition-colors hover:bg-slate-200"><X size={24}/></button></div><div className="flex-1 overflow-hidden flex flex-col md:flex-row"><div className="shrink-0 w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col overflow-y-auto no-scrollbar">{pricelistBrands.map(brand => (<button key={brand.id} onClick={() => setSelectedBrandForPricelist(brand.id)} className={`w-full text-left p-4 transition-colors flex items-center gap-3 border-b border-slate-100 ${selectedBrandForPricelist === brand.id ? 'bg-white border-l-4 border-green-500' : 'hover:bg-white'}`}><div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">{brand.logoUrl ? <img src={brand.logoUrl} className="w-full h-full object-contain" /> : <span className="font-black text-slate-300 text-sm">{brand.name.charAt(0)}</span>}</div><span className={`font-black text-sm uppercase ${selectedBrandForPricelist === brand.id ? 'text-green-600' : 'text-slate-400'}`}>{brand.name}</span></button>))}</div><div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 relative">{selectedBrandForPricelist ? (<div className="animate-fade-in"><div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{storeData.pricelists?.filter(p => p.brandId === selectedBrandForPricelist).map(pl => (<button key={pl.id} onClick={() => { if(pl.type === 'manual') setViewingManualList(pl); else setViewingPdf({url: pl.url, title: pl.title}); }} className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border-2 flex flex-col h-full relative transition-all active:scale-95 ${isRecent(pl.dateAdded) ? 'border-yellow-400' : 'border-white hover:border-green-400'}`}><div className="aspect-[3/4] bg-slate-50 relative p-3 overflow-hidden">{pl.thumbnailUrl ? <img src={pl.thumbnailUrl} className="w-full h-full object-contain rounded shadow-sm" /> : <div className="w-full h-full flex items-center justify-center text-slate-200">{pl.type === 'manual' ? <List size={32}/> : <FileText size={32} />}</div>}<div className={`absolute top-2 right-2 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ${pl.type === 'manual' ? 'bg-blue-600' : 'bg-red-50'}`}>{pl.type === 'manual' ? 'TABLE' : 'PDF'}</div></div><div className="p-3 flex-1 flex flex-col justify-between bg-white"><h3 className="font-black text-slate-900 text-xs uppercase leading-tight line-clamp-2">{pl.title}</h3><div className="text-[9px] font-black text-slate-400 uppercase mt-2">{pl.month} {pl.year}</div></div></button>))}</div></div>) : <div className="h-full flex flex-col items-center justify-center text-slate-300"><RIcon size={64} className="opacity-10" /></div>}</div></div></div></div>)}
       {showFlipbook && <Flipbook pages={flipbookPages} onClose={() => setShowFlipbook(false)} catalogueTitle={flipbookTitle} />}
       {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
       {viewingManualList && <ManualPricelistViewer pricelist={viewingManualList} onClose={() => setViewingManualList(null)} companyLogo={storeData.companyLogoUrl} brandName={pricelistBrands.find(b=>b.id===viewingManualList.brandId)?.name} brandLogo={pricelistBrands.find(b=>b.id===viewingManualList.brandId)?.logoUrl} />}
       {viewingWebsite && (<div className="fixed inset-0 z-[150] bg-white flex flex-col animate-fade-in"><div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 border-b border-white/5 shadow-xl"><div className="flex items-center gap-4"><div className="p-2 bg-blue-600 rounded-xl"><Globe size={20} /></div><span className="text-xs font-black uppercase tracking-widest">{viewingWebsite.replace(/^https?:\/\//, '')}</span></div><button onClick={() => setViewingWebsite(null)} className="bg-red-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest"><X size={16} strokeWidth={3} /> Exit Browser</button></div><div className="flex-1 bg-white relative overflow-hidden"><iframe src={viewingWebsite} className="absolute inset-0 w-full h-full border-none" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" loading="lazy" /></div></div>)}
    </div>
  );
};

export default KioskApp;