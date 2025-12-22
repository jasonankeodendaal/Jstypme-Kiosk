
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Calendar, ZoomIn, ZoomOut, RotateCcw, Maximize, Grip } from 'lucide-react';

interface FlipbookProps {
  pages: string[];
  onClose: () => void;
  catalogueTitle?: string;
  startDate?: string;
  endDate?: string;
}

const Flipbook: React.FC<FlipbookProps> = ({ pages, onClose, catalogueTitle, startDate, endDate }) => {
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

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setStartDrag({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const newX = clientX - startDrag.x;
    const newY = clientY - startDrag.y;

    // If zoomed out (scale=1), handle swiping
    if (scale === 1) {
        const diffX = clientX - (startDrag.x + position.x);
        if (Math.abs(diffX) > 100) {
            if (diffX > 0) handlePrev();
            else handleNext();
            setIsDragging(false);
        }
    } else {
        setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Fixed: Math.max expects a number, not a callback function. Use the current state value directly.
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-slate-900/98 flex flex-col items-center justify-center animate-fade-in touch-none" 
      onClick={onClose}
    >
      {/* Dynamic Background Blur */}
      <div 
        className="absolute inset-0 z-0 opacity-20 blur-3xl scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${pages[currentIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                <BookOpen size={20} className="text-white" />
            </div>
            <div>
                <h2 className="text-sm md:text-2xl font-black tracking-tight leading-none uppercase">
                    {catalogueTitle || "Catalogue"}
                </h2>
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
                 {scale > 1 && (
                     <button onClick={handleResetZoom} className="p-2 hover:bg-white/10 rounded-xl text-blue-400 border-l border-white/10 ml-1 transition-colors"><RotateCcw size={18} /></button>
                 )}
             </div>

             <button 
              onClick={onClose}
              className="bg-white text-slate-900 p-2 md:p-3 rounded-full transition-all hover:scale-110 shadow-xl"
            >
              <X size={24} strokeWidth={3} />
            </button>
        </div>
      </div>

      {/* Navigation Indicators (Visual) */}
      {scale === 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 pointer-events-none">
              <div className="flex gap-1.5 overflow-hidden max-w-[200px] justify-center">
                  {pages.map((_, idx) => (
                      <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-blue-500' : 'w-1 bg-white/20'}`} />
                  ))}
              </div>
          </div>
      )}

      {/* Main Interactive Stage */}
      <div 
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${scale > 1 ? 'cursor-grab' : 'cursor-default'} ${isDragging && scale > 1 ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Navigation Buttons - Hidden when zoomed for focus */}
        {scale === 1 && (
            <>
                <button 
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-4 md:p-6 rounded-full shadow-2xl disabled:opacity-0 transition-all hover:bg-white active:scale-90 z-50 border border-slate-200"
                >
                    <ChevronLeft size={32} strokeWidth={3} />
                </button>

                <button 
                    disabled={currentIndex >= totalPages - 1}
                    onClick={handleNext}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-4 md:p-6 rounded-full shadow-2xl disabled:opacity-0 transition-all hover:bg-white active:scale-90 z-50 border border-slate-200"
                >
                    <ChevronRight size={32} strokeWidth={3} />
                </button>
            </>
        )}

        {/* The Page Container */}
        <div 
            className="w-full h-full flex items-center justify-center p-4 md:p-20"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)'
            }}
        >
            <div className="relative shadow-[0_30px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-white max-w-full max-h-full aspect-[1/1.4] md:aspect-auto">
                <img 
                    src={pages[currentIndex]} 
                    alt={`Page ${currentIndex + 1}`} 
                    className="max-w-full max-h-[85vh] object-contain select-none pointer-events-none"
                    draggable={false}
                />
                
                {/* Drag Indicator Overlay when zoomed */}
                {scale > 1.2 && !isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <Grip size={48} className="text-white" />
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Zoom hint */}
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
