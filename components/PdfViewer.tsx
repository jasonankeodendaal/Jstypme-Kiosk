import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, Maximize, Grip, Download } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Pricelist } from '../types';

// Robust reference for Vite/ESM/Legacy environments
const pdfjs: any = pdfjsLib;

if (pdfjs.GlobalWorkerOptions) {
  // Use LEGACY worker build for Android 5 / Chrome 37 compatibility
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';
}

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
  pricelist?: Pricelist;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, onClose, pricelist }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0); // Progress tracking
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      console.log(`[PdfViewer] Starting load for URL: "${url}"`);
      
      if (!url) {
          console.error('[PdfViewer] No URL provided');
          setError("No document URL provided.");
          setLoading(false);
          return;
      }

      try {
        setLoading(true); setError(null); setPageNum(1); setLoadProgress(0);
        
        if (loadingTaskRef.current) {
            console.log('[PdfViewer] Destroying previous loading task');
            loadingTaskRef.current.destroy().catch((e: any) => console.warn('[PdfViewer] Destroy warning:', e));
        }
        
        console.log('[PdfViewer] Calling pdfjs.getDocument...');
        
        // OPTIMIZED CONFIGURATION FOR FAST OPENING & LEGACY STABILITY
        const loadingTask = pdfjs.getDocument({
            url,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            disableRange: false, // Range requests allowed (browser handles fallback)
            disableStream: true, // Use chunked XHR instead of streaming (critical for legacy)
            disableAutoFetch: true, // Critical: Do NOT download the whole file automatically
            rangeChunkSize: 65536, // Fetch in 64KB chunks
        });
        
        loadingTask.onProgress = (progressData: any) => {
            if (progressData.total) {
                const percent = Math.round((progressData.loaded / progressData.total) * 100);
                setLoadProgress(percent);
                console.debug(`[PdfViewer] Progress: ${percent}% (${progressData.loaded} bytes)`);
            }
        };

        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        console.log(`[PdfViewer] Document loaded successfully. Pages: ${doc.numPages}`);

        if (loadingTaskRef.current === loadingTask) { 
            setPdf(doc);
            // Optimization: Keep loading true until first page render finishes
        }
      } catch (err: any) {
        console.error('[PdfViewer] Load Error:', err);
        
        // CRITICAL FIX: Suppress "Message channel closed", "ResizeObserver", "extension" errors
        const msg = (err?.message || '').toLowerCase();
        if (
            msg.includes('message channel') || 
            msg.includes('channel closed') ||
            msg.includes('resizeobserver') ||
            msg.includes('extension')
        ) {
            console.warn('[PdfViewer] Suppressing worker/engine error');
            // Do not show error UI, try to remain in loading state or fail silently
            return;
        }

        if (err.name === 'MissingPDFException') {
            console.error('[PdfViewer] File not found or 404');
        } else if (err.name === 'InvalidPDFException') {
            console.error('[PdfViewer] Invalid PDF format');
        }

        if (err?.message !== 'Loading aborted') { 
            setError(`Unable to load document: ${err.message || 'Unknown error'}`); 
            setLoading(false); 
        }
      }
    };
    
    loadPdf();
    return () => { if (loadingTaskRef.current) loadingTaskRef.current.destroy().catch(() => {}); };
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current || !containerRef.current) return;
      
      // Robust Cancellation: Ensure previous render is stopped before starting new one
      if (renderTaskRef.current) {
          try {
              await renderTaskRef.current.cancel();
          } catch(e) {
              // Expected error when cancelling
          }
      }

      try {
        setLoading(true); // Visual feedback during rendering
        const page = await pdf.getPage(pageNum);
        
        const viewportUnscaled = page.getViewport({ scale: 1.0 });
        let renderScale = scale;
        if (renderScale <= 0) {
            const padding = 48;
            const availableWidth = containerSize.width - padding;
            const availableHeight = containerSize.height - padding;
            const scaleX = availableWidth / viewportUnscaled.width;
            const scaleY = availableHeight / viewportUnscaled.height;
            renderScale = Math.min(scaleX, scaleY, 2.0);
        }
        
        // Optimization: Cap DPR at 1.5 to prevent memory crashes on tablets with high-res screens
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        
        const viewport = page.getViewport({ scale: renderScale }); 
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";
            const transform = [dpr, 0, 0, dpr, 0, 0];
            const renderContext = { canvasContext: context, viewport: viewport, transform: transform };
            const task = page.render(renderContext);
            renderTaskRef.current = task;
            await task.promise;
            setLoading(false); // Only finish loading state when drawing is complete
        }
      } catch (err: any) { 
          if (err?.name !== 'RenderingCancelledException') {
              // Suppress message channel errors during render as well
              const msg = (err?.message || '').toLowerCase();
              if (
                  msg.includes('message channel') || 
                  msg.includes('channel closed') || 
                  msg.includes('resizeobserver')
              ) {
                  console.warn('[PdfViewer] Suppressing render worker error');
                  return;
              }
              console.error("[PdfViewer] Render Error:", err); 
              setLoading(false);
          }
      }
    };
    renderPage();
  }, [pdf, pageNum, scale, containerSize]);

  const changePage = (delta: number) => {
      if (!pdf) return;
      const newPage = pageNum + delta;
      if (newPage >= 1 && newPage <= pdf.numPages) setPageNum(newPage);
  };

  const handleZoomIn = () => setScale(prev => {
      const current = prev <= 0 ? (canvasRef.current?.clientWidth || 0) / (pdf ? 1000 : 1) : prev;
      return Math.min(5.0, (current || 1) * 1.5);
  });
  const handleZoomOut = () => setScale(prev => prev > 0 ? Math.max(0.2, prev / 1.5) : 0);
  const handleFit = () => setScale(0);

  const onStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setScrollPos({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
  };
  const onMove = (clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    const dx = clientX - startPos.x;
    const dy = clientY - startPos.y;
    containerRef.current.scrollLeft = scrollPos.left - dx;
    containerRef.current.scrollTop = scrollPos.top - dy;
  };
  const onEnd = () => setIsDragging(false);

  const handleMouseDown = (e: React.MouseEvent) => { if (e.button === 0) onStart(e.pageX, e.pageY); };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) { e.preventDefault(); onMove(e.pageX, e.pageY); } };
  const handleTouchStart = (e: React.TouchEvent) => { if (e.touches.length === 1) onStart(e.touches[0].pageX, e.touches[0].pageY); };
  const handleTouchMove = (e: React.TouchEvent) => { if (isDragging && e.touches.length === 1) { e.preventDefault(); onMove(e.touches[0].pageX, e.touches[0].pageY); } };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
  };

  const handleDownload = async () => {
      try {
          // Robust binary handling for offline/legacy
          // We explicitly fetch as blob to ensure binary integrity during save
          const response = await fetch(url);
          if (!response.ok) throw new Error("Network error");
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = (title || 'document').replace(/[^a-z0-9_\-]/gi, '_') + '.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
      } catch (e) {
          console.error("Export failed", e);
          alert("Unable to download document. Please check your connection.");
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col animate-fade-in" onClick={onClose}>
       <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 shrink-0 z-20" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-4 overflow-hidden">
              <div className="bg-red-500 p-2 rounded-lg shrink-0"><span className="font-black text-[10px] uppercase">PDF</span></div>
              <h2 className="text-lg font-bold uppercase tracking-wider truncate max-w-md">{title}</h2>
              {pdf && (
                  <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg p-1 ml-4 border border-slate-700">
                      <button onClick={handleFit} className={`p-1.5 rounded transition-colors ${scale === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Auto Fit"><Maximize size={16}/></button>
                      <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                      <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><ZoomOut size={16}/></button>
                      <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><ZoomIn size={16}/></button>
                  </div>
              )}
              {/* Manual Download Button for explicit saving */}
              <button onClick={handleDownload} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white ml-2 hidden md:flex" title="Save PDF">
                  <Download size={16} />
              </button>
          </div>
          <div className="flex items-center gap-2">
              {/* Mobile Download Button */}
              <button onClick={handleDownload} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5 md:hidden" title="Save">
                  <Download size={20} />
              </button>
              <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5"><X size={24}/></button>
          </div>
       </div>

       {pricelist?.kind === 'promotion' && (
            <div className="w-full bg-slate-50 border-b border-slate-200 py-3 px-4 text-center shrink-0 z-10 shadow-sm relative animate-fade-in" onClick={e => e.stopPropagation()}>
                {pricelist.promoText && (
                    <p className="text-slate-900 font-black uppercase tracking-widest text-xs md:text-sm leading-relaxed">
                        {pricelist.promoText}
                    </p>
                )}
                {(pricelist.startDate || pricelist.endDate) && (
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                        Valid: {formatDate(pricelist.startDate)} - {formatDate(pricelist.endDate)}
                    </p>
                )}
            </div>
       )}

       <div 
         ref={containerRef}
         className={`flex-1 w-full h-full bg-slate-950/20 relative overflow-auto touch-none ${isDragging ? 'cursor-grabbing' : scale > 0 ? 'cursor-grab' : 'cursor-default'}`} 
         onClick={e => e.stopPropagation()}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={onEnd}
         onMouseLeave={onEnd}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={onEnd}
       >
          {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                  <span className="font-bold uppercase tracking-widest text-xs">
                      {loadProgress > 0 && loadProgress < 100 ? `Loading ${loadProgress}%...` : 'Opening Document...'}
                  </span>
                  {loadProgress > 0 && loadProgress < 100 && (
                      <div className="w-48 h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${loadProgress}%` }}></div>
                      </div>
                  )}
              </div>
          )}
          {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-red-500/50 text-center max-w-md shadow-2xl">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="font-bold text-lg mb-6 text-white">{error}</p>
                    <button onClick={onClose} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold uppercase text-xs">Close Viewer</button>
                </div>
              </div>
          )}
          
          <div className="min-w-full min-h-full flex items-center justify-center p-8 md:p-12 pointer-events-none">
             <div className={`relative shadow-2xl transition-opacity duration-500 pointer-events-auto ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  <canvas ref={canvasRef} className="bg-white rounded shadow-inner" />
                  {scale > 1.2 && !isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                        <Grip size={64} className="text-black" />
                    </div>
                  )}
             </div>
          </div>
       </div>
       
       {pdf && (
           <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center items-center gap-4 md:gap-8 shrink-0 z-20" onClick={e => e.stopPropagation()}>
               <button disabled={pageNum <= 1} onClick={() => changePage(-1)} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-20 transition-all shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
               <div className="flex flex-col items-center min-w-[80px]">
                   <span className="text-white font-black text-xl">{pageNum} <span className="text-slate-500 text-sm">/ {pdf.numPages}</span></span>
               </div>
               <button disabled={pageNum >= pdf.numPages} onClick={() => changePage(1)} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-20 transition-all shadow-lg active:scale-95"><ChevronRight size={24} /></button>
               <div className="flex md:hidden items-center gap-2 bg-slate-800 rounded-lg p-1 ml-4 border border-slate-700">
                    <button onClick={handleZoomOut} className="p-2 text-slate-300"><ZoomOut size={20}/></button>
                    <button onClick={handleFit} className={`p-2 ${scale === 0 ? 'text-blue-400' : 'text-slate-500'}`}><Maximize size={20}/></button>
                    <button onClick={handleZoomIn} className="p-2 text-slate-300"><ZoomIn size={20}/></button>
               </div>
           </div>
       )}
    </div>
  );
};

export default PdfViewer;