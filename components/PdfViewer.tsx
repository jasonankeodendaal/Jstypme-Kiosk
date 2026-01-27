
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
  const [loadProgress, setLoadProgress] = useState(0); 
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
    // Delay initial size check slightly to allow layout to settle
    setTimeout(updateSize, 100);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      if (!url) {
          setError("No document URL provided.");
          setLoading(false);
          return;
      }

      try {
        setLoading(true); setError(null); setPageNum(1); setLoadProgress(0);
        
        if (loadingTaskRef.current) {
            loadingTaskRef.current.destroy().catch((e: any) => console.warn('Destroy warning:', e));
        }
        
        const loadingTask = pdfjs.getDocument({
            url,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            disableRange: false,
            disableStream: true, // Critical for legacy
            disableAutoFetch: true, 
            rangeChunkSize: 65536,
        });
        
        loadingTask.onProgress = (progressData: any) => {
            if (progressData.total) {
                const percent = Math.round((progressData.loaded / progressData.total) * 100);
                setLoadProgress(percent);
            }
        };

        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;

        if (loadingTaskRef.current === loadingTask) { 
            setPdf(doc);
        }
      } catch (err: any) {
        // CRITICAL FIX: Suppress worker/engine errors that don't actually break the app
        const msg = (err?.message || '').toLowerCase();
        if (
            msg.includes('message channel') || 
            msg.includes('channel closed') ||
            msg.includes('resizeobserver') ||
            msg.includes('extension')
        ) {
            console.warn('[PdfViewer] Suppressing worker/engine error');
            return;
        }

        if (err?.message !== 'Loading aborted') { 
            setError(`Unable to load document. The file might be corrupted or offline.`); 
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
      
      if (renderTaskRef.current) {
          try { await renderTaskRef.current.cancel(); } catch(e) {}
      }

      setLoading(true);

      try {
        const page = await pdf.getPage(pageNum);
        const viewportUnscaled = page.getViewport({ scale: 1.0 });
        
        // --- 1. HARDWARE DETECTION (MEMORY SAFETY) ---
        const isLowSpec = (() => {
            const ua = (navigator.userAgent || '').toLowerCase();
            const isLegacyAndroid = ua.indexOf('android 5') !== -1 || ua.indexOf('android 6') !== -1;
            const isFirefoxMobile = ua.indexOf('firefox') !== -1 && ua.indexOf('android') !== -1;
            const cores = navigator.hardwareConcurrency || 4;
            return isLegacyAndroid || isFirefoxMobile || cores <= 4;
        })();

        // --- 2. DETERMINE BASE SCALE ---
        let renderScale = scale;
        if (renderScale <= 0) {
            const padding = 24;
            const availableWidth = containerSize.width - padding;
            const availableHeight = containerSize.height - padding;
            
            if (availableWidth <= 0 || availableHeight <= 0) return; // Wait for layout

            const scaleX = availableWidth / viewportUnscaled.width;
            const scaleY = availableHeight / viewportUnscaled.height;
            // Cap auto-zoom to 1.5x on low spec, 2.0x on high spec
            const maxAutoZoom = isLowSpec ? 1.5 : 2.0;
            renderScale = Math.min(scaleX, scaleY, maxAutoZoom); 
        }

        // --- 3. DYNAMIC PIXEL RATIO (CRASH PREVENTION) ---
        // Legacy devices and Firefox Mobile get DPR 1.0 to prevent texture overflow
        const dpr = isLowSpec ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0);

        // --- 4. TEXTURE SIZE SAFETY LIMIT ---
        const projectedW = viewportUnscaled.width * renderScale * dpr;
        const projectedH = viewportUnscaled.height * renderScale * dpr;
        const MAX_TEXTURE = isLowSpec ? 2048 : 4096; // Conservatively limit old devices to 2K textures

        if (projectedW > MAX_TEXTURE || projectedH > MAX_TEXTURE) {
            const reductionRatio = Math.min(MAX_TEXTURE / projectedW, MAX_TEXTURE / projectedH);
            renderScale = renderScale * reductionRatio * 0.9; // 10% safety buffer
        }

        const renderContext = (finalScale: number, finalDpr: number) => {
            const viewport = page.getViewport({ scale: finalScale }); 
            const canvas = canvasRef.current;
            if (!canvas) return null;
            
            // OPTIMIZATION: Disable alpha channel for PDFs (saves 25% RAM)
            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) return null;

            canvas.width = Math.floor(viewport.width * finalDpr);
            canvas.height = Math.floor(viewport.height * finalDpr);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";
            
            return {
                canvasContext: ctx,
                viewport: viewport,
                transform: [finalDpr, 0, 0, finalDpr, 0, 0]
            };
        };

        // --- 5. RENDER EXECUTION ---
        try {
            const ctxConfig = renderContext(renderScale, dpr);
            if (ctxConfig) {
                const task = page.render(ctxConfig);
                renderTaskRef.current = task;
                await task.promise;
                setLoading(false);
            }
        } catch (initialErr: any) {
            if (initialErr?.name === 'RenderingCancelledException') return;
            
            console.warn("[PdfViewer] High-Res Render Failed, attempting Recovery Mode...", initialErr);
            
            // RECOVERY: Force low-res (Scale 0.6, DPR 1.0)
            try {
                const recoveryCtx = renderContext(0.6, 1.0);
                if (recoveryCtx) {
                    const recoveryTask = page.render(recoveryCtx);
                    renderTaskRef.current = recoveryTask;
                    await recoveryTask.promise;
                    setLoading(false);
                }
            } catch (retryErr) {
                console.error("[PdfViewer] Critical Render Failure", retryErr);
                setError("Memory Error: Document too complex for this device.");
                setLoading(false);
            }
        }

      } catch (err: any) { 
          if (err?.name !== 'RenderingCancelledException') {
              const msg = (err?.message || '').toLowerCase();
              // Ignore common engine aborts
              if (!msg.includes('cancelled')) {
                  console.error("[PdfViewer] Render Error:", err);
                  // Don't show error immediately to avoid flickering on rapid navigation
              }
              setLoading(false);
          }
      }
    };
    
    // Debounce render slightly to allow UI to settle
    const t = setTimeout(renderPage, 50);
    return () => clearTimeout(t);
  }, [pdf, pageNum, scale, containerSize]);

  const changePage = (delta: number) => {
      if (!pdf) return;
      const newPage = pageNum + delta;
      if (newPage >= 1 && newPage <= pdf.numPages) setPageNum(newPage);
  };

  const handleZoomIn = () => setScale(prev => {
      // If auto-scaled (0), calculate current visual scale first
      const current = prev <= 0 ? 1.0 : prev;
      return Math.min(3.0, current + 0.5);
  });
  const handleZoomOut = () => setScale(prev => prev > 0 ? Math.max(0.5, prev - 0.5) : 0.5);
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
          alert("Unable to download document.");
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
              <button onClick={handleDownload} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white ml-2 hidden md:flex" title="Save PDF">
                  <Download size={16} />
              </button>
          </div>
          <div className="flex items-center gap-2">
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
                      {loadProgress > 0 && loadProgress < 100 ? `Loading ${loadProgress}%...` : 'Rendering...'}
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
          
          <div className="min-w-full min-h-full flex p-4 md:p-12 pointer-events-none">
             <div className={`m-auto relative shadow-2xl transition-opacity duration-500 pointer-events-auto ${loading ? 'opacity-0' : 'opacity-100'}`}>
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
