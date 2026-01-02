
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import { ChevronLeft, Info, PlayCircle, FileText, Check, Box as BoxIcon, ChevronRight as RightArrow, ChevronLeft as LeftArrow, X, Image as ImageIcon, Tag, Layers, Ruler, Package, LayoutGrid, Settings, BookOpen } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  showScreensaverButton?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); 
  const [showEnlargedMedia, setShowEnlargedMedia] = useState(false);
  const [enlargedMediaIndex, setEnlargedMediaIndex] = useState(0);
  const [flipbookData, setFlipbookData] = useState<{ isOpen: boolean, pages: string[], title: string }>({ isOpen: false, pages: [], title: '' });
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Helper to ensure dimensions is always an array
  const dimensionSets = useMemo(() => {
      if (Array.isArray(product.dimensions)) return product.dimensions;
      if (typeof product.dimensions === 'object' && product.dimensions) {
          return [{ label: "Device", ...(product.dimensions as any) }];
      }
      return [];
  }, [product.dimensions]);

  const allMedia = useMemo(() => {
    const media: { type: 'image' | 'video', url: string }[] = [];
    if (product.imageUrl) {
      media.push({ type: 'image', url: product.imageUrl });
    }
    product.galleryUrls?.forEach(url => {
      media.push({ type: 'image', url });
    });
    if (product.videoUrl) {
      media.push({ type: 'video', url: product.videoUrl });
    }
    product.videoUrls?.forEach(url => {
        if (url !== product.videoUrl) {
             media.push({ type: 'video', url });
        }
    });
    return media;
  }, [product]);

  const allManuals = useMemo(() => {
      const mans = product.manuals || [];
      if (mans.length === 0 && (product.manualUrl || (product.manualImages && product.manualImages.length > 0))) {
          return [{
              id: 'legacy',
              title: 'User Manual',
              images: product.manualImages || [],
              pdfUrl: product.manualUrl,
              thumbnailUrl: product.manualImages?.[0] || undefined
          }];
      }
      return mans;
  }, [product]);

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };
  
  const handleNextEnlarged = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEnlargedMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrevEnlarged = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEnlargedMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleEnlargeMedia = (index: number) => {
    setEnlargedMediaIndex(index);
    setShowEnlargedMedia(true);
  };

  const openManual = (manual: any) => {
      if (manual.pdfUrl) {
          setViewingPdf({ url: manual.pdfUrl, title: manual.title });
      } else if (manual.images && manual.images.length > 0) {
          setFlipbookData({ isOpen: true, pages: manual.images, title: manual.title });
      }
  };

  const currentMedia = allMedia[currentMediaIndex];
  const enlargedMedia = allMedia[enlargedMediaIndex];

  return (
    <div className="flex flex-col h-full bg-white relative animate-fade-in overflow-hidden">
      
      {/* PERSISTENT BACK BUTTON OVERLAY */}
      <div className="fixed top-12 md:top-14 left-4 z-50">
        <button 
          onClick={onBack} 
          className="w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-slate-900 hover:bg-white active:scale-95 transition-all border border-slate-200/50"
        >
          <LeftArrow size={24} />
        </button>
      </div>

      {/* SINGLE SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pb-32">
        
        {/* TOP MEDIA SHOWCASE (NOW PART OF SCROLL) */}
        <div className="w-full min-h-[45vh] md:min-h-[75vh] bg-slate-900 relative group flex items-center justify-center overflow-hidden border-b border-slate-100 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 pointer-events-none"></div>
            
            {currentMedia ? (
            currentMedia.type === 'image' ? (
                <img 
                src={currentMedia.url} 
                className="w-full h-full object-contain p-4 md:p-12 bg-white cursor-zoom-in" 
                alt={product.name} 
                onClick={() => handleEnlargeMedia(currentMediaIndex)} 
                />
            ) : (
                <div className="w-full h-full relative bg-black flex items-center justify-center" onClick={() => handleEnlargeMedia(currentMediaIndex)}>
                <video 
                    src={currentMedia.url} 
                    className="w-full h-full object-contain" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <PlayCircle size={64} className="text-white/50 group-hover:text-white/80 transition-all scale-100 group-hover:scale-110" />
                </div>
                </div>
            )
            ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-white">
                <ImageIcon size={64} className="mb-4 opacity-20" />
                <span className="font-black uppercase tracking-widest text-xs">No Visual Content</span>
            </div>
            )}

            {/* Floating Gallery Toggle */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3">
            {allMedia.length > 0 && (
                <button 
                onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
                className="bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-2xl border border-white/10 backdrop-blur-md transition-all"
                >
                <LayoutGrid size={14} /> Gallery ({allMedia.length})
                </button>
            )}
            </div>

            {allMedia.length > 1 && (
            <>
                <button onClick={handlePrevMedia} className="absolute left-16 md:left-20 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-3 md:p-4 rounded-full shadow-2xl z-30 active:scale-95 transition-all border border-slate-100 hover:bg-white">
                <LeftArrow size={24} />
                </button>
                <button onClick={handleNextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-900 p-3 md:p-4 rounded-full shadow-2xl z-30 active:scale-95 transition-all border border-slate-100 hover:bg-white">
                <RightArrow size={24} />
                </button>
                
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
                {allMedia.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all shadow-md ${i === currentMediaIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`} />
                ))}
                </div>
            </>
            )}
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-20 md:py-20">
            {/* Title & Description */}
            <div className="mb-16 border-b border-slate-100 pb-16">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {product.sku && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200">
                    <Tag size={12} /> SKU: {product.sku}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-blue-100">
                  Official Technical Data
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-none uppercase tracking-tighter mb-10">{product.name}</h1>
              <p className="text-lg md:text-2xl text-slate-600 leading-relaxed font-medium max-w-4xl">{product.description || "No specific description available."}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
              {/* Left Column: Docs & Features */}
              <div className="space-y-16">
                {/* MANUALS */}
                {allManuals.length > 0 && (
                  <div className="bg-blue-50/50 rounded-[3rem] p-10 border border-blue-100 shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <BookOpen size={20} className="text-blue-500" /> Technical Documentation
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {allManuals.map(manual => (
                        <button 
                          key={manual.id}
                          onClick={() => openManual(manual)} 
                          className="w-full flex flex-col bg-white hover:bg-slate-50 text-slate-700 p-4 rounded-3xl transition-all border border-blue-100 hover:shadow-2xl group"
                        >
                          <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl mb-4 overflow-hidden border border-slate-100 relative">
                            {manual.thumbnailUrl ? (
                              <img src={manual.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <FileText size={40} />
                              </div>
                            )}
                            {manual.pdfUrl && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-xl">PDF</div>
                            )}
                          </div>
                          <span className="text-[11px] font-black uppercase text-center leading-tight line-clamp-1 px-1">{manual.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* FEATURES */}
                {product.features.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <Check size={20} className="text-green-500" /> Key Features
                    </h3>
                    <div className="space-y-4">
                      {product.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:translate-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-lg shadow-blue-200"></div>
                          <span className="text-base md:text-xl font-bold text-slate-700 leading-tight">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Specs & Dimensions */}
              <div className="space-y-16">
                {/* SPECS */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <Settings size={20} className="text-blue-600" /> Technical Specs
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(product.specs).map(([key, value], idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{key}</span>
                          <span className="block text-sm md:text-lg font-black text-slate-900 leading-tight">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* DIMENSIONS */}
                {dimensionSets.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <Ruler size={20} className="text-orange-500" /> Dimensions & Weights
                    </h3>
                    <div className="space-y-6">
                      {dimensionSets.map((dims, i) => (
                        <div key={i} className="bg-orange-50/30 p-8 rounded-[3rem] border border-orange-100 shadow-sm">
                          <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-6 border-b border-orange-100 pb-3">{dims.label || `Package ${i+1}`}</div>
                          <div className="grid grid-cols-4 gap-6 text-center">
                            <div><span className="block text-[9px] text-slate-400 font-black uppercase mb-1.5">Height</span><span className="block text-sm md:text-lg font-black text-slate-900">{dims.height || '-'}</span></div>
                            <div><span className="block text-[9px] text-slate-400 font-black uppercase mb-1.5">Width</span><span className="block text-sm md:text-lg font-black text-slate-900">{dims.width || '-'}</span></div>
                            <div><span className="block text-[9px] text-slate-400 font-black uppercase mb-1.5">Depth</span><span className="block text-sm md:text-lg font-black text-slate-900">{dims.depth || '-'}</span></div>
                            <div><span className="block text-[9px] text-slate-400 font-black uppercase mb-1.5">Weight</span><span className="block text-sm md:text-lg font-black text-slate-900">{dims.weight || '-'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TERMS */}
                {product.terms && (
                  <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white/5 mt-10">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                      <Info size={18} /> Warranty Information
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">{product.terms}</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (FLOATING) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-40 animate-slide-up">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-[2.5rem] p-4 md:p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex justify-between items-center">
          <div className="hidden md:flex flex-col ml-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Product</span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight truncate max-w-[200px]">{product.name}</span>
          </div>
          <button 
            onClick={onBack} 
            className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl active:scale-95"
          >
            Return to Directory
          </button>
        </div>
      </div>

      {/* MEDIA ENLARGED MODAL */}
      {showEnlargedMedia && enlargedMedia && (
        <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowEnlargedMedia(false)}>
          <button onClick={() => setShowEnlargedMedia(false)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/40 text-white p-3 rounded-full transition-colors z-50 shadow-2xl"><X size={32} /></button>
          
          {allMedia.length > 1 && (
            <>
               <button onClick={handlePrevEnlarged} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all z-50">
                   <LeftArrow size={48} />
               </button>
               <button onClick={handleNextEnlarged} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all z-50">
                   <RightArrow size={48} />
               </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {enlargedMedia.type === 'image' ? (
                <img src={enlargedMedia.url} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" alt="Product detail" />
            ) : (
                <video src={enlargedMedia.url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg" />
            )}
            
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-50 pointer-events-none">
               <div className="bg-black/80 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                  {enlargedMediaIndex + 1} / {allMedia.length}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY GRID MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[105] bg-slate-950/98 p-6 md:p-16 animate-fade-in flex flex-col" onClick={() => setShowGalleryModal(false)}>
            <div className="flex justify-between items-center mb-12 shrink-0 max-w-7xl mx-auto w-full" onClick={e => e.stopPropagation()}>
                <div>
                   <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                      <LayoutGrid className="text-blue-500" size={40} /> Image Directory
                   </h2>
                   <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Visual Gallery for {product.name}</p>
                </div>
                <button 
                  onClick={() => setShowGalleryModal(false)}
                  className="bg-white/10 hover:bg-red-500 hover:text-white text-white p-5 rounded-full transition-all duration-300 shadow-2xl border border-white/5"
                >
                   <X size={32} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-32" onClick={e => e.stopPropagation()}>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
                 {allMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                          setCurrentMediaIndex(idx);
                          setEnlargedMediaIndex(idx);
                          setShowGalleryModal(false);
                          setShowEnlargedMedia(true);
                      }}
                      className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl ${currentMediaIndex === idx ? 'border-blue-500 ring-8 ring-blue-500/20 shadow-blue-500/30' : 'border-slate-800 hover:border-blue-400/50'}`}
                    >
                      {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={`Gallery ${idx}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                      ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                              <video src={media.url} className="w-full h-full object-cover opacity-60" muted autoPlay loop playsInline />
                              <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <div className="w-16 h-16 bg-blue-600/80 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-sm">
                                      <PlayCircle size={40} />
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      <div className="absolute top-4 left-4 bg-black/80 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                          REF {idx + 1}
                      </div>
                    </button>
                  ))}
               </div>
            </div>
        </div>
      )}

      {flipbookData.isOpen && (
          <Flipbook pages={flipbookData.pages || []} onClose={() => setFlipbookData({...flipbookData, isOpen: false})} catalogueTitle={flipbookData.title}/>
      )}

      {viewingPdf && (
           <PdfViewer 
               url={viewingPdf.url} 
               title={viewingPdf.title} 
               onClose={() => setViewingPdf(null)} 
           />
       )}
    </div>
  );
};

export default ProductDetail;
