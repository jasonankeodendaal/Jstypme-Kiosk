
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Calendar, ZoomIn, ZoomOut, RotateCcw, Maximize, Grip } from 'lucide-react';

interface FlipbookProps {
  pages: string[];
  onClose: () => void;
  catalogueTitle?: string;
  startDate?: string;
  endDate?: string;
  promoText?: string;
}

const Flipbook: React.FC<FlipbookProps> = ({ pages, onClose, catalogueTitle, startDate, endDate, promoText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPages = pages.length;

  // Reset view when page changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalPages]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Unified Start
  const onStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartDrag({ x: clientX - position.x, y: clientY - position.y });
  };

  // Unified Move
  const onMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const newX = clientX - startDrag.x;
    const newY = clientY - startDrag.y;

    // Swipe logic (Only if zoomed out)
    if (scale <= 1.1) {
        const diffX = clientX - (startDrag.x + position.x);
        if (Math.abs(diffX) > 120) {
            if (diffX > 0) handlePrev();
            else handleNext();
            setIsDragging(false);
        }
    } else {
        // Panning logic (Free form when zoomed)
        setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    onMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    onStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if (scale > 1) e.preventDefault(); // Prevent bounce scroll when panning
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextScale = Math.max(scale - 0.5, 1);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      setScale(nextScale);
  };

  const handleResetZoom = (e: React.MouseEvent) => {
      e.stopPropagation();
      setScale(1);
      setPosition({ x: 0, y: 0 });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-slate-900/98 flex flex-col items-center justify-center animate-fade-in touch-none" 
      onClick={onClose}
    >
      <div 
        className="absolute inset-0 z-0 opacity-20 blur-3xl scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${pages[currentIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg"><BookOpen size={20} className="text-white" /></div>
            <div>
                <h2 className="text-sm md:text-2xl font-black tracking-tight leading-none uppercase">{catalogueTitle || "Catalogue"}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Page {currentIndex + 1} of {totalPages}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
             <div className="flex items-center gap-1 bg-white/10 rounded-2xl p-1 backdrop-blur-md border border-white/10">
                 <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"><ZoomOut size={18} /></button>
                 <span className="text-[10px] font-mono font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
                 <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"><ZoomIn size={18} /></button>
                 {scale > 1 && (<button onClick={handleResetZoom} className="p-2 hover:bg-white/10 rounded-xl text-blue-400 border-l border-white/10 ml-1 transition-colors"><RotateCcw size={18} /></button>)}
             </div>
             <button onClick={onClose} className="bg-white text-slate-900 p-2 md:p-3 rounded-full transition-all hover:scale-110 shadow-xl"><X size={24} strokeWidth={3} /></button>
        </div>
      </div>

      {(promoText || startDate || endDate) && (
        <div 
            className="absolute top-20 md:top-24 left-0 right-0 z-40 flex justify-center pointer-events-none"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-lg py-3 px-8 rounded-full text-center max-w-[90%] pointer-events-auto transition-transform animate-fade-in-up">
                {promoText && (
                    <p className="text-slate-900 font-black uppercase tracking-widest text-[10px] md:text-xs leading-relaxed">
                        {promoText}
                    </p>
                )}
                {(startDate || endDate) && (
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                        Valid: {formatDate(startDate)} - {formatDate(endDate)}
                    </p>
                )}
            </div>
        </div>
      )}

      <div 
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${scale > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging && scale > 1 ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {scale <= 1.1 && (
            <>
                <button disabled={currentIndex === 0} onClick={handlePrev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-4 md:p-6 rounded-full shadow-2xl disabled:opacity-0 transition-all hover:bg-white active:scale-90 z-50 border border-slate-200"><ChevronLeft size={32} strokeWidth={3} /></button>
                <button disabled={currentIndex >= totalPages - 1} onClick={handleNext} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-4 md:p-6 rounded-full shadow-2xl disabled:opacity-0 transition-all hover:bg-white active:scale-90 z-50 border border-slate-200"><ChevronRight size={32} strokeWidth={3} /></button>
            </>
        )}

        <div 
            className="w-full h-full flex items-center justify-center p-4 md:p-20 pointer-events-none"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
            }}
        >
            <div className="relative shadow-[0_30px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-white max-w-full max-h-full pointer-events-auto">
                <img 
                    src={pages[currentIndex]} 
                    alt={`Page ${currentIndex + 1}`} 
                    className="max-w-full max-h-[85vh] object-contain select-none pointer-events-none"
                    draggable={false}
                />
                {scale > 1.2 && !isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <Grip size={48} className="text-white" />
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {scale === 1 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2 opacity-30">
              <Maximize size={24} className="text-white" />
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Pinch or Use buttons to Zoom</span>
          </div>
      )}
    </div>
  );
};

export default Flipbook;
