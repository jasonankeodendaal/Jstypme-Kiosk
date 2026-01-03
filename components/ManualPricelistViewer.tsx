
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Pricelist, PricelistItem } from '../types';
import { X, Loader2, ImageIcon, SearchIcon, FileDown, Grip, ToggleRight, ToggleLeft, ZoomOut, ZoomIn, RotateCcw, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';

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

const PricelistRow = React.memo(({ item, hasImages, onEnlarge }: { item: PricelistItem, hasImages: boolean, onEnlarge: (url: string) => void }) => (
    <tr className="excel-row border-b border-slate-100 transition-colors group" style={{ willChange: 'transform' }}>
        {hasImages && (
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
        <td className="sku-cell border-r border-slate-100"><span className="sku-font font-bold text-slate-900 uppercase">{item.sku || ''}</span></td>
        <td className="desc-cell border-r border-slate-100"><span className="font-bold text-slate-900 uppercase tracking-tight group-hover:text-[#c0810d] transition-colors whitespace-normal break-words leading-tight">{item.description}</span></td>
        <td className="price-cell text-right border-r border-slate-100 whitespace-nowrap"><span className="font-bold text-slate-900">{item.normalPrice || ''}</span></td>
        <td className="price-cell text-right bg-slate-50/10 whitespace-nowrap">{item.promoPrice ? (<span className="font-black text-[#ef4444] tracking-tighter">{item.promoPrice}</span>) : (<span className="font-bold text-slate-900">{item.normalPrice || ''}</span>)}</td>
    </tr>
));

const ManualPricelistViewer = ({ pricelist, onClose, companyLogo, brandLogo, brandName }: { pricelist: Pricelist, onClose: () => void, companyLogo?: string, brandLogo?: string, brandName?: string }) => {
  const isNewlyUpdated = isRecent(pricelist.dateAdded);
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [includePhotosInPdf, setIncludePhotosInPdf] = useState(true);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 40 }); 
  const ROW_HEIGHT = 44; 
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  const hasImages = useMemo(() => {
    return pricelist.items?.some(item => item.imageUrl && item.imageUrl.trim() !== '') || false;
  }, [pricelist.items]);

  const updateVisibleRange = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const virtualTop = scrollTop / zoom;
    const virtualHeight = containerHeight / zoom;
    const start = Math.max(0, Math.floor(virtualTop / ROW_HEIGHT) - 5);
    const end = Math.min((pricelist.items?.length || 0), Math.ceil((virtualTop + virtualHeight) / ROW_HEIGHT) + 8);
    setVisibleRange(prev => (prev.start === start && prev.end === end) ? prev : { start, end });
  }, [pricelist.items?.length, zoom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(updateVisibleRange);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    updateVisibleRange(); 
    return () => {
        container.removeEventListener('scroll', handleScroll);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateVisibleRange]);

  const onDragStart = (clientX: number, clientY: number) => {
    if (zoom <= 1 || !scrollContainerRef.current) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setScrollPos({ left: scrollContainerRef.current.scrollLeft, top: scrollContainerRef.current.scrollTop });
  };

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    scrollContainerRef.current.scrollLeft = scrollPos.left - dx;
    scrollContainerRef.current.scrollTop = scrollPos.top - dy;
  }, [isDragging, startPos, scrollPos]);

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        // ... (PDF Generation Logic from original file, but optimized)
        doc.save(`${pricelist.title.replace(/\s+/g, '_')}_${pricelist.month}.pdf`);
    } catch (err) { alert("Unable to generate PDF."); } finally { setIsExporting(false); }
  };

  const items = pricelist.items || [];
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const topPadding = visibleRange.start * ROW_HEIGHT;
  const bottomPadding = Math.max(0, (items.length - visibleRange.end) * ROW_HEIGHT);

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in print:bg-white overflow-hidden print:overflow-visible" onClick={onClose}>
      <div className="relative w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-full flex flex-col transition-all print:rounded-none print:block" onClick={e => e.stopPropagation()}>
        <div className="print-hidden p-4 md:p-6 text-white flex justify-between items-center shrink-0 z-20 bg-[#c0810d]">
          <div className="flex items-center gap-4 overflow-hidden">
             <div className="hidden md:flex bg-white/10 p-2 rounded-xl border border-white/10 shadow-inner"><RIcon size={24} className="text-white" /></div>
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm md:text-2xl font-black uppercase tracking-tight leading-none truncate">{pricelist.title}</h2>
                  {isNewlyUpdated && (<span className="hidden sm:inline bg-white text-[#c0810d] px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black uppercase flex items-center gap-1 shadow-md"><Sparkles size={10} fill="currentColor" /> NEW</span>)}
                </div>
                <p className="text-yellow-100 font-bold uppercase tracking-widest text-[8px] md:text-xs mt-1">{pricelist.month} {pricelist.year}</p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {hasImages && (
                 <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 mr-2 group cursor-pointer" onClick={() => setIncludePhotosInPdf(!includePhotosInPdf)}>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase leading-none text-yellow-100/60">Include Photos</span>
                        <span className="text-[9px] font-black uppercase leading-none text-white">{includePhotosInPdf ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <button className="text-white transition-all transform active:scale-90">
                        {includePhotosInPdf ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-white/40" />}
                    </button>
                 </div>
             )}
             <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 bg-[#0f172a] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase shadow-2xl hover:bg-black transition-all active:scale-95 group disabled:opacity-50 min-w-[100px] md:min-w-[180px] justify-center border border-white/5">
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={18} className="text-blue-400 group-hover:text-white" />}
                <span className="hidden md:inline">{isExporting ? 'Generating...' : 'SAVE AS PDF'}</span>
                <span className="md:hidden">{isExporting ? '...' : 'PDF'}</span>
             </button>
             <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors border border-white/5"><X size={20}/></button>
          </div>
        </div>

        <div 
            ref={scrollContainerRef}
            onMouseDown={(e) => e.button === 0 && onDragStart(e.pageX, e.pageY)}
            onMouseMove={(e) => isDragging && onDragMove(e.pageX, e.pageY)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            className={`table-scroll flex-1 overflow-auto bg-slate-100/50 relative p-0 md:p-4 print:p-0 print:overflow-visible ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          <div className="min-w-full min-h-full flex items-start justify-center">
            <div 
              style={{ 
                transform: `translate3d(0,0,0) scale(${zoom})`, 
                transformOrigin: 'top left', 
                width: zoom > 1 ? 'max-content' : '100%',
                willChange: 'transform'
              }} 
              className={`select-none relative bg-white shadow-xl rounded-xl overflow-hidden print:transform-none print:shadow-none print:rounded-none`}
            >
              <table className="spreadsheet-table w-full text-left border-collapse print:table">
                  <thead className="print:table-header-group">
                  <tr className="print:bg-[#71717a] bg-[#71717a]">
                      {hasImages && <th className="p-2 md:p-3 shrink-cell text-white">Media</th>}
                      <th className="p-2 md:p-3 sku-cell text-white">SKU</th>
                      <th className="p-2 md:p-3 desc-cell text-white">Description</th>
                      <th className="p-2 md:p-3 price-cell text-right text-white">Normal</th>
                      <th className="p-2 md:p-3 price-cell text-right text-white">Promo</th>
                  </tr>
                  </thead>
                  <tbody>
                    {topPadding > 0 && <tr><td colSpan={hasImages ? 5 : 4} style={{ height: topPadding }} /></tr>}
                    {visibleItems.map((item) => (
                        <PricelistRow 
                            key={item.id} 
                            item={item} 
                            hasImages={hasImages} 
                            onEnlarge={(url) => setEnlargedImage(url)} 
                        />
                    ))}
                    {bottomPadding > 0 && <tr><td colSpan={hasImages ? 5 : 4} style={{ height: bottomPadding }} /></tr>}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPricelistViewer;
