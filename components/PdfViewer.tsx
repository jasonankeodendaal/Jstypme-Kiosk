
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Maximize, Grip } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { UI_Z_INDEX } from '../types';

const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

// Use a consistent version matching the ESM import
const PDF_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
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
        setContainerSize({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', updateSize); updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true); setError(null); setPageNum(1);
        if (loadingTaskRef.current) {
          loadingTaskRef.current.destroy().catch(() => {});
        }
        
        // CMap required for many commercial PDFs
        const loadingTask = pdfjs.getDocument({ 
          url, 
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/', 
          cMapPacked: true 
        });
        
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        
        if (loadingTaskRef.current === loadingTask) { 
          setPdf(doc); 
          setLoading(false); 
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && err?.message !== 'Loading aborted') { 
          console.error("PDF Load Error:", err);
          setError("Unable to load document. Check your connection."); 
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
      try {
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel().catch(() => {});
        }
        
        const page = await pdf.getPage(pageNum);
        const viewportUnscaled = page.getViewport({ scale: 1.0 });
        
        let renderScale = scale;
        if (renderScale <= 0) {
            const padding = 48;
            renderScale = Math.min(
              (containerSize.width - padding) / viewportUnscaled.width, 
              (containerSize.height - padding) / viewportUnscaled.height, 
              2.0
            );
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
            
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            
            const renderContext = { 
              canvasContext: context, 
              viewport: viewport 
            };
            
            const task = page.render(renderContext);
            renderTaskRef.current = task; 
            await task.promise;
        }
      } catch (err: any) { 
        if (err?.name !== 'RenderingCancelledException') {
          console.error("PDF Render Error", err); 
        }
      }
    };
    renderPage();
  }, [pdf, pageNum, scale, containerSize]);

  const onStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    setIsDragging(true); 
    setStartPos({ x: clientX, y: clientY });
    setScrollPos({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
  };
  
  const onMove = (clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    containerRef.current.scrollLeft = scrollPos.left - (clientX - startPos.x);
    containerRef.current.scrollTop = scrollPos.top - (clientY - startPos.y);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col animate-fade-in" 
      style={{ zIndex: UI_Z_INDEX.MODAL + 50 }}
      onClick={onClose}
    >
       <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 shrink-0 z-20" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-4 overflow-hidden">
              <div className="bg-red-500 p-2 rounded-lg"><span className="font-black text-[10px] uppercase text-white">PDF</span></div>
              <h2 className="text-lg font-bold uppercase truncate max-w-md">{title}</h2>
              {pdf && (
                  <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg p-1 ml-4">
                      <button onClick={() => setScale(0)} className={`p-1.5 rounded transition-colors ${scale === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}><Maximize size={16}/></button>
                      <button onClick={() => setScale(prev => Math.max(0.2, (prev || 1) / 1.5))} className="p-1.5 text-slate-400 hover:text-white transition-colors"><ZoomOut size={16}/></button>
                      <button onClick={() => setScale(prev => Math.min(5, (prev || 1) * 1.5))} className="p-1.5 text-slate-400 hover:text-white transition-colors"><ZoomIn size={16}/></button>
                  </div>
              )}
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={24} /></button>
       </div>
       
       <div 
         ref={containerRef} 
         className={`flex-1 w-full h-full bg-slate-950/20 relative overflow-auto touch-none ${isDragging ? 'cursor-grabbing' : scale > 0 ? 'cursor-grab' : 'cursor-default'}`} 
         onClick={e => e.stopPropagation()} 
         onMouseDown={e => e.button === 0 && onStart(e.pageX, e.pageY)} 
         onMouseMove={e => isDragging && (e.preventDefault(), onMove(e.pageX, e.pageY))} 
         onMouseUp={() => setIsDragging(false)} 
         onMouseLeave={() => setIsDragging(false)} 
         onTouchStart={e => e.touches.length === 1 && onStart(e.touches[0].pageX, e.touches[0].pageY)} 
         onTouchMove={e => isDragging && e.touches.length === 1 && (e.preventDefault(), onMove(e.touches[0].pageX, e.touches[0].pageY))} 
         onTouchEnd={() => setIsDragging(false)}
       >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
              <span className="font-bold uppercase text-xs tracking-widest">Decoding Stream...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-slate-800 p-8 rounded-3xl text-center border border-white/10 shadow-2xl">
                <p className="font-bold text-lg text-white mb-6">{error}</p>
                <button onClick={onClose} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold uppercase text-xs hover:bg-slate-200 transition-colors">Close Viewer</button>
              </div>
            </div>
          )}
          
          <div className="min-w-full min-h-full flex items-center justify-center p-8 md:p-12 pointer-events-none">
            <div className={`relative shadow-2xl transition-opacity duration-500 pointer-events-auto ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <canvas ref={canvasRef} className="bg-white rounded" />
              {scale > 1.2 && !isDragging && (
                <div className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full opacity-30 pointer-events-none">
                  <Grip size={24} />
                </div>
              )}
            </div>
          </div>
       </div>
       
       {pdf && (
           <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center items-center gap-8 shrink-0 z-20" onClick={e => e.stopPropagation()}>
               <button 
                 disabled={pageNum <= 1} 
                 onClick={() => setPageNum(p => Math.max(1, p-1))} 
                 className="p-3 bg-blue-600 rounded-full text-white disabled:opacity-20 hover:bg-blue-500 transition-colors"
               >
                 <ChevronLeft size={24} />
               </button>
               <span className="text-white font-black text-xl tracking-tighter">
                 {pageNum} <span className="text-slate-500 text-sm ml-1">/ {pdf.numPages}</span>
               </span>
               <button 
                 disabled={pageNum >= pdf.numPages} 
                 onClick={() => setPageNum(p => Math.min(pdf.numPages, p+1))} 
                 className="p-3 bg-blue-600 rounded-full text-white disabled:opacity-20 hover:bg-blue-500 transition-colors"
               >
                 <ChevronRight size={24} />
               </button>
           </div>
       )}
    </div>
  );
};

export default PdfViewer;
