import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, Maximize, Grip } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for PDF.js ESM import compatibility in Vite
const pdfjs: any = pdfjsLib;

if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, onClose }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(0); 
  const [loading, setLoading] = useState(true);
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
      try {
        setLoading(true); setError(null); setPageNum(1);
        if (loadingTaskRef.current) loadingTaskRef.current.destroy().catch(() => {});
        const loadingTask = pdfjs.getDocument({
            url,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            disableRange: false,
            disableStream: false,
        });
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        if (loadingTaskRef.current === loadingTask) { setPdf(doc); setLoading(false); }
      } catch (err: any) {
        if (err?.message !== 'Loading aborted') { setError("Unable to load document."); setLoading(false); }
      }
    };
    loadPdf();
    return () => { if (loadingTaskRef.current) loadingTaskRef.current.destroy().catch(() => {}); };
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current || !containerRef.current) return;
      try {
        if (renderTaskRef.current) await renderTaskRef.current.cancel();
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
        const dpr = window.devicePixelRatio || 1;
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
        }
      } catch (err: any) { if (err?.name !== 'RenderingCancelledException') console.error("Render Error", err); }
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
          </div>
          <div className="flex items-center gap-4">
              {pdf && (
                  <div className="flex items-center gap-3">
                      <button 
                        disabled={pageNum <= 1}
                        onClick={() => changePage(-1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                      >
                          <ChevronLeft size={24} />
                      </button>
                      <div className="text-xs font-black tracking-widest uppercase bg-white/10 px-4 py-2 rounded-full border border-white/5">
                          {pageNum} <span className="opacity-40">/</span> {pdf.numPages}
                      </div>
                      <button 
                        disabled={pageNum >= pdf.numPages}
                        onClick={() => changePage(1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
                      >
                          <ChevronRight size={24} />
                      </button>
                  </div>
              )}
              <button onClick={onClose} className="p-2 hover:bg-red-500 rounded-full transition-colors"><X size={24}/></button>
          </div>
       </div>

       <div 
         ref={containerRef}
         className={`flex-1 overflow-auto bg-slate-800 flex items-start justify-center p-4 md:p-8 select-none ${isDragging ? 'cursor-grabbing' : (scale > 0 ? 'cursor-grab' : 'cursor-default')}`}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={onEnd}
         onMouseLeave={onEnd}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={onEnd}
       >
           <div className="relative shadow-2xl bg-white min-w-max">
               {loading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 z-10">
                       <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                       <span className="text-white text-xs font-black uppercase tracking-widest">Rendering Document...</span>
                   </div>
               )}
               {error && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10 p-8 text-center">
                       <AlertCircle size={48} className="text-red-500 mb-4" />
                       <h3 className="text-white font-black uppercase mb-2">Display Error</h3>
                       <p className="text-slate-400 text-sm max-w-xs">{error}</p>
                   </div>
               )}
               <canvas ref={canvasRef} className="block shadow-xl" />
               {scale > 1.2 && !isDragging && !loading && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                       <Grip size={120} className="text-black" />
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default PdfViewer;