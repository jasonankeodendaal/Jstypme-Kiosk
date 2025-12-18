import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, Maximize } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for ESM import in some environments where the module is wrapped in 'default'
const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

// Worker configuration matching the version in importmap
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
  const [scale, setScale] = useState(0); // 0 = Auto Fit Mode
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

  // Track container size for responsive fitting
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
    updateSize(); // Initial call
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setPageNum(1);
        
        if (loadingTaskRef.current) {
            loadingTaskRef.current.destroy().catch(() => {});
        }

        const loadingTask = pdfjs.getDocument({
            url,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            disableRange: false,
            disableStream: false,
        });
        
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        
        if (loadingTaskRef.current === loadingTask) {
            setPdf(doc);
            setLoading(false);
        }
      } catch (err: any) {
        if (err?.message !== 'Loading aborted') {
            console.error("PDF Load Error:", err);
            setError("Unable to load document.");
            setLoading(false);
        }
      }
    };
    loadPdf();
    return () => {
        if (loadingTaskRef.current) loadingTaskRef.current.destroy().catch(() => {});
    };
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current || !containerRef.current) return;
      
      try {
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
        }

        const page = await pdf.getPage(pageNum);
        const viewportUnscaled = page.getViewport({ scale: 1.0 });
        
        let renderScale = scale;
        
        // Dynamic "Shrink to Fit" Logic
        if (renderScale <= 0) {
            const padding = 48; // Responsive margin
            const availableWidth = containerSize.width - padding;
            const availableHeight = containerSize.height - padding;
            
            const scaleX = availableWidth / viewportUnscaled.width;
            const scaleY = availableHeight / viewportUnscaled.height;
            
            renderScale = Math.min(scaleX, scaleY, 2.0); // Don't auto-fit beyond 200% zoom
        }

        const outputScale = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: renderScale }); 
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
            const renderContext = { canvasContext: context, viewport: viewport, transform: transform };
            
            const task = page.render(renderContext);
            renderTaskRef.current = task;
            await task.promise;
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') console.error("Render Error", err);
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
      const current = prev <= 0 ? (canvasRef.current?.clientWidth || 0) / (pdf ? 1000 : 1) : prev; // Approximate unscaled width
      return Math.min(5.0, (current || 1) * 1.2);
  });
  const handleZoomOut = () => setScale(prev => prev > 0 ? Math.max(0.2, prev / 1.2) : 0);
  const handleFit = () => setScale(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current || scale <= 0) return;
    setIsDragging(true);
    setStartPos({ x: e.pageX, y: e.pageY });
    setScrollPos({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - startPos.x;
    const y = e.pageY - startPos.y;
    containerRef.current.scrollLeft = scrollPos.left - x;
    containerRef.current.scrollTop = scrollPos.top - y;
  };

  const handleMouseUp = () => setIsDragging(false);

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
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5"><X size={24} /></button>
       </div>

       <div 
         ref={containerRef}
         className={`flex-1 w-full h-full bg-slate-950/20 relative flex items-center justify-center overflow-auto ${isDragging ? 'cursor-grabbing' : scale > 0 ? 'cursor-grab' : 'cursor-default'}`} 
         onClick={e => e.stopPropagation()}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}
       >
          {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                  <span className="font-bold uppercase tracking-widest text-xs">Opening Document...</span>
              </div>
          )}
          {error && (
              <div className="bg-slate-800 p-8 rounded-2xl border border-red-500/50 text-center max-w-md shadow-2xl">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="font-bold text-lg mb-6 text-white">{error}</p>
                  <button onClick={onClose} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold uppercase text-xs">Close Viewer</button>
              </div>
          )}
          <div className={`relative shadow-2xl transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
               <canvas ref={canvasRef} className="bg-white rounded shadow-inner" />
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