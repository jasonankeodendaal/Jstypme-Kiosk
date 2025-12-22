
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Calendar, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface FlipbookProps {
  pages: string[];
  onClose: () => void;
  catalogueTitle?: string;
  startDate?: string;
  endDate?: string;
}

const Flipbook: React.FC<FlipbookProps> = ({ pages, onClose, catalogueTitle, startDate, endDate }) => {
  // Current index refers to the page displayed on the RIGHT side.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Panning state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = pages.length;

  const resetPanning = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex + 2 <= totalPages + 1) { 
      setCurrentIndex(currentIndex + 2);
      setScale(1);
      resetPanning();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex - 2 >= 0) {
      setCurrentIndex(currentIndex - 2);
      setScale(1);
      resetPanning();
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      setScale(prev => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) resetPanning();
          return next;
      });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
      e.stopPropagation();
      setScale(1);
      resetPanning();
  };

  // Dragging handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || scale <= 1) return;
    const newX = clientX - dragStartRef.current.x;
    const newY = clientY - dragStartRef.current.y;
    
    // Boundary checks could be added here, but free-panning is often preferred in kiosks
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const leftPageIdx = currentIndex - 1;
  const rightPageIdx = currentIndex;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12 animate-fade-in select-none" 
      onClick={onClose}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby="flipbook-title"
    >
      <style>{`
        .book-panning-container {
          cursor: ${scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'};
          touch-action: none;
        }
      `}</style>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-50" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <BookOpen size={20} className="text-white" />
            </div>
            <div>
                <h2 id="flipbook-title" className="text-lg md:text-2xl font-black tracking-tight leading-none">
                    {catalogueTitle || "Showcase Pamphlet"}
                </h2>
                {(startDate || endDate) && (
                    <div className="flex items-center gap-1.5 text-blue-300 mt-1">
                        <Calendar size={12} />
                        <span className="text-xs font-mono font-bold uppercase tracking-wide">
                            {startDate && formatDate(startDate)} {startDate && endDate && `-`} {endDate && formatDate(endDate)}
                        </span>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1 bg-black/40 rounded-lg p-1 backdrop-blur-sm border border-white/10">
                 <button onClick={handleZoomOut} className="p-2 hover:bg-white/20 rounded text-white" title="Zoom Out"><ZoomOut size={16} /></button>
                 <span className="text-xs font-mono font-bold w-8 text-center">{Math.round(scale * 100)}%</span>
                 <button onClick={handleZoomIn} className="p-2 hover:bg-white/20 rounded text-white" title="Zoom In"><ZoomIn size={16} /></button>
                 <button onClick={handleResetZoom} className="p-2 hover:bg-white/20 rounded text-white border-l border-white/10 ml-1" title="Reset"><RotateCcw size={16} /></button>
             </div>

             <button 
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-sm border border-white/10"
              aria-label="Close pamphlet viewer"
            >
              <X size={24} />
            </button>
        </div>
      </div>

      <div 
        className="relative w-full max-w-6xl h-full flex items-center justify-center mt-12 overflow-hidden book-panning-container" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        
        {/* Navigation - Only visible when not zoomed or panning */}
        <div className={`transition-opacity duration-300 ${scale > 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button 
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 p-3 md:p-4 rounded-full shadow-2xl disabled:opacity-0 transition-opacity hover:bg-blue-50 z-50 border border-slate-200"
                aria-label="Previous page"
            >
                <ChevronLeft size={24} className="md:w-8 md:h-8" />
            </button>

            <button 
                disabled={currentIndex >= totalPages}
                onClick={handleNext}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 bg-white text-slate-900 p-3 md:p-4 rounded-full shadow-2xl disabled:opacity-0 transition-opacity hover:bg-blue-50 z-50 border border-slate-200"
                aria-label="Next page"
            >
                <ChevronRight size={24} className="md:w-8 md:h-8" />
            </button>
        </div>

        {/* The Book Container */}
        <div 
            ref={containerRef}
            className="flex w-full max-w-6xl aspect-[3/2] ease-out pointer-events-none"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
        >
            <div className="flex w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden relative pointer-events-auto">
                {/* Spine Shadow */}
                <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-transparent via-black/20 to-transparent z-10 pointer-events-none"></div>

                {/* Left Page */}
                <div className="flex-1 bg-white relative overflow-hidden flex items-center justify-center border-r border-slate-200 bg-slate-50">
                    {leftPageIdx >= 0 && pages[leftPageIdx] ? (
                        <img 
                            src={pages[leftPageIdx]} 
                            alt={`Page ${leftPageIdx + 1}`} 
                            className="w-full h-full object-contain pointer-events-none"
                        />
                    ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Back Cover</span>
                    </div>
                    )}
                    <div className="absolute bottom-4 left-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{leftPageIdx >= 0 ? leftPageIdx + 1 : ''}</div>
                </div>

                {/* Right Page */}
                <div className="flex-1 bg-white relative overflow-hidden flex items-center justify-center bg-slate-50">
                    {rightPageIdx < pages.length ? (
                        <img 
                            src={pages[rightPageIdx]} 
                            alt={`Page ${rightPageIdx + 1}`} 
                            className="w-full h-full object-contain pointer-events-none"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                             <div className="text-center">
                                 <BookOpen size={48} className="mx-auto mb-2 opacity-20" />
                                 <span className="text-xs font-bold uppercase tracking-widest opacity-50">End of Catalogue</span>
                             </div>
                        </div>
                    )}
                    <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rightPageIdx < pages.length ? rightPageIdx + 1 : ''}</div>
                </div>
            </div>
        </div>

        {/* Zoom Reset Hint for users */}
        {scale > 1 && !isDragging && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm animate-pulse z-50 pointer-events-none">
                Drag to Panning
            </div>
        )}

      </div>
    </div>
  );
};

export default Flipbook;
