
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle, Maximize, Grip } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

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
  const [debouncedScale, setDebouncedScale] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Debounce scale updates to prevent rendering on every slider tick
  useEffect(() => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
          setDebouncedScale(scale);
      }, 150);
      return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [scale]);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true); setError(null); setPageNum(1);
        if (loadingTaskRef.current) loadingTaskRef.current.destroy().catch(() => {});
        const loadingTask = pdfjs.getDocument({ url, disableRange: false, disableStream: false });
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
        let renderScale = debouncedScale;
        if (renderScale <= 0) {
            renderScale = Math.min((containerSize.width - 48) / viewportUnscaled.width, (containerSize.height - 48) / viewportUnscaled.height, 2.0);
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
            const renderContext = { canvasContext: context, viewport: viewport, transform: [dpr, 0, 0, dpr, 0, 0] };
            const task = page.render(renderContext);
            renderTaskRef.current = task;
            await task.promise;
        }
      } catch (err: any) { if (err?.name !== 'RenderingCancelledException') console.error("Render Error", err); }
    };
    renderPage();
  }, [pdf, pageNum, debouncedScale, containerSize]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col animate-fade-in" onClick={onClose}>
       <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 shrink-0 z-20">
          <div className="flex items-center gap-4 overflow-hidden">
              <div className="bg-red-500 p-2 rounded-lg shrink-0"><span className="font-black text-[10px] uppercase">PDF</span></div>
              <h2 className="text-lg font-bold uppercase tracking-wider truncate max-w-md">{title}</h2>
              {pdf && (
                  <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg p-1 ml-4 border border-slate-700">
                      <button onClick={() => setScale(0)} className={`p-1.5 rounded ${scale === 0 ? 'bg-blue-600' : ''}`}><Maximize size={16}/></button>
                      <button onClick={() => setScale(s => Math.max(0.2, (s||1)/1.5))} className="p-1.5"><ZoomOut size={16}/></button>
                      <button onClick={() => setScale(s => Math.min(5.0, (s||1)*1.5))} className="p-1.5"><ZoomIn size={16}/></button>
                  </div>
              )}
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20"><X size={24} /></button>
       </div>
       <div ref={containerRef} className="flex-1 w-full h-full bg-slate-950/20 relative overflow-auto">
          <div className="min-w-full min-h-full flex items-center justify-center p-8 pointer-events-none">
             <div className={`relative shadow-2xl transition-opacity duration-500 pointer-events-auto ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  <canvas ref={canvasRef} className="bg-white rounded" />
             </div>
          </div>
       </div>
    </div>
  );
};

export default PdfViewer;
