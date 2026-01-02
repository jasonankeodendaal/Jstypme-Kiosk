
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import { ChevronLeft, Info, PlayCircle, FileText, Check, Box as BoxIcon, ChevronRight as RightArrow, ChevronLeft as LeftArrow, X, Image as ImageIcon, Tag, Layers, Ruler, Package, LayoutGrid, Settings, BookOpen, Video, Download, ChevronRight } from 'lucide-react';

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

  const allVideos = useMemo(() => {
      return allMedia.filter(m => m.type === 'video');
  }, [allMedia]);

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
          className="w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-slate-900 hover:bg-white active:scale-95 transition-all border border-slate-200/50"
        >
          <LeftArrow size={18} />
        </button>
      </div>

      {/* SINGLE SCROLLABLE CONTAINER */}
      <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pb-32">
        
        {/* STANDARDIZED MEDIA SHOWCASE (500x500) */}
        <div className="w-full h-[500px] bg-slate-50 relative group flex items-center justify-center overflow-hidden border-b border-slate-100 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 z-10 pointer-events-none"></div>
            
            {/* 500x500 Centered Container */}
            <div className="w-[500px] h-[500px] flex items-center justify-center bg-white relative">
                {currentMedia ? (
                currentMedia.type === 'image' ? (
                    <img 
                    src={currentMedia.url} 
                    className="w-full h-full object-contain p-4 cursor-zoom-in" 
                    alt={product.name} 
                    onClick={() => handleEnlargeMedia(currentMediaIndex)} 
                    />
                ) : (
                    <div className="w-full h-full relative bg-black flex items-center justify-center cursor-zoom-in" onClick={() => handleEnlargeMedia(currentMediaIndex)}>
                    <video 
                        src={currentMedia.url} 
                        className="w-full h-full object-contain" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <PlayCircle size={60} className="text-white/50 group-hover:text-white/80 transition-all scale-100 group-hover:scale-110" />
                    </div>
                    </div>
                )
                ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-white">
                    <ImageIcon size={48} className="mb-4 opacity-20" />
                    <span className="font-black uppercase tracking-widest text-[8px]">No Visual Content</span>
                </div>
                )}
            </div>

            {/* NAVIGATION ARROWS */}
            {allMedia.length > 1 && (
            <>
                <button 
                  onClick={handlePrevMedia} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-600 hover:text-white text-slate-900 w-10 h-10 rounded-full shadow-lg z-30 transition-all border border-slate-200 active:scale-90 flex items-center justify-center"
                >
                    <LeftArrow size={18} strokeWidth={3} />
                </button>
                <button 
                  onClick={handleNextMedia} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-600 hover:text-white text-slate-900 w-10 h-10 rounded-full shadow-lg z-30 transition-all border border-slate-200 active:scale-90 flex items-center justify-center"
                >
                    <RightArrow size={18} strokeWidth={3} />
                </button>
                
                {/* Slim Media Progress Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
                {allMedia.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all shadow-md ${i === currentMediaIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300'}`} />
                ))}
                </div>
            </>
            )}

            {/* Floating Gallery Toggle */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
            {allMedia.length > 0 && (
                <button 
                onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
                className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 shadow-2xl border border-white/10 backdrop-blur-md transition-all"
                >
                <LayoutGrid size={12} /> GALLERY
                </button>
            )}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-6xl mx-auto px-6 py-10 md:px-16">
            {/* Title & Description */}
            <div className="mb-10 border-b border-slate-100 pb-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {product.sku && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border border-slate-200">
                    <Tag size={12} /> SKU: {product.sku}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border border-blue-100">
                  Data Sheet Verified
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-6">{product.name}</h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium max-w-4xl">{product.description || "No specific description available."}</p>
            </div>

            {/* DEDICATED SECTION: Product Videos, Manuals & Docs */}
            {(allVideos.length > 0 || allManuals.length > 0) && (
              <div className="mb-12 bg-slate-50 p-6 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Download size={20} className="text-blue-600" /> Product Videos, Manuals & Docs
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Videos Sub-section */}
                  {allVideos.length > 0 && (
                    <div className="space-y-5">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Video size={16} /> Available Multimedia
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {allVideos.map((vid, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleEnlargeMedia(allMedia.indexOf(vid))}
                            className="group relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-200 shadow-md transition-transform hover:scale-[1.02]"
                          >
                            <video src={vid.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayCircle size={32} className="text-white shadow-xl" />
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] px-2 py-1 rounded font-black uppercase backdrop-blur-sm">Video {idx+1}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manuals Sub-section */}
                  {allManuals.length > 0 && (
                    <div className="space-y-5">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={16} /> PDF Manuals & Docs
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {allManuals.map(manual => (
                          <button 
                            key={manual.id}
                            onClick={() => openManual(manual)}
                            className="flex items-center gap-4 p-4 bg-white hover:bg-blue-50 border border-slate-200 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                          >
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <FileText size={24} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="text-xs font-black uppercase text-slate-900 truncate leading-tight mb-1">{manual.title}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{manual.pdfUrl ? 'Official PDF Document' : 'View Image Gallery'}</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
              {/* Features Section */}
              {product.features.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Check size={20} className="text-green-500" /> Key Features
                  </h3>
                  <div className="space-y-4">
                    {product.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-5 p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:translate-x-2 group">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform"></div>
                        <span className="text-base font-bold text-slate-700 leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs & Dimensions Section */}
              <div className="space-y-16">
                {/* SPECS */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <Settings size={20} className="text-blue-600" /> Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(product.specs).map(([key, value], idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-200 transition-colors">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{key}</span>
                          <span className="block text-sm font-black text-slate-900 leading-tight">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* DIMENSIONS */}
                {dimensionSets.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <Ruler size={20} className="text-orange-500" /> Dimensions
                    </h3>
                    <div className="space-y-4">
                      {dimensionSets.map((dims, i) => (
                        <div key={i} className="bg-orange-50/30 p-5 rounded-[2rem] border border-orange-100 shadow-sm">
                          <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">{dims.label || `Unit ${i+1}`}</div>
                          <div className="grid grid-cols-4 gap-3 text-center">
                            <div><span className="block text-[8px] text-slate-400 font-black uppercase mb-1">Height</span><span className="block text-sm font-black text-slate-900">{dims.height || '-'}</span></div>
                            <div><span className="block text-[8px] text-slate-400 font-black uppercase mb-1">Width</span><span className="block text-sm font-black text-slate-900">{dims.width || '-'}</span></div>
                            <div><span className="block text-[8px] text-slate-400 font-black uppercase mb-1">Depth</span><span className="block text-sm font-black text-slate-900">{dims.depth || '-'}</span></div>
                            <div><span className="block text-[8px] text-slate-400 font-black uppercase mb-1">Weight</span><span className="block text-sm font-black text-slate-900">{dims.weight || '-'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (FLOATING) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-40 animate-slide-up">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-3xl p-4 shadow-2xl flex justify-between items-center">
          <div className="hidden md:flex flex-col ml-4 min-w-0">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Viewing Asset</span>
            <span className="text-sm font-bold text-slate-600 uppercase tracking-tight truncate pr-6">{product.name}</span>
          </div>
          <button 
            onClick={onBack} 
            className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
          >
            <ChevronLeft size={18} /> Exit to Menu
          </button>
        </div>
      </div>

      {/* ENLARGED MODAL (800x800) */}
      {showEnlargedMedia && enlargedMedia && (
        <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowEnlargedMedia(false)}>
          <button onClick={() => setShowEnlargedMedia(false)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/40 text-white p-4 rounded-full transition-colors z-50 shadow-2xl"><X size={32} /></button>
          
          {allMedia.length > 1 && (
            <>
               <button onClick={handlePrevEnlarged} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-6 transition-all z-50">
                   <LeftArrow size={48} />
               </button>
               <button onClick={handleNextEnlarged} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-6 transition-all z-50">
                   <RightArrow size={48} />
               </button>
            </>
          )}

          {/* 800x800 Enlarged Container */}
          <div className="relative w-[800px] h-[800px] max-w-full max-h-full flex items-center justify-center bg-white rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
            {enlargedMedia.type === 'image' ? (
                <img src={enlargedMedia.url} className="w-full h-full object-contain p-4 rounded-2xl" alt="Product detail" />
            ) : (
                <video src={enlargedMedia.url} controls autoPlay className="w-full h-full object-contain rounded-2xl" />
            )}
          </div>
        </div>
      )}

      {/* GALLERY GRID MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[105] bg-slate-950/98 p-6 md:p-16 animate-fade-in flex flex-col" onClick={() => setShowGalleryModal(false)}>
            <div className="flex justify-between items-center mb-12 shrink-0 max-w-7xl mx-auto w-full" onClick={e => e.stopPropagation()}>
                <div>
                   <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-5">
                      <LayoutGrid className="text-blue-500" size={40} /> Visual Index
                   </h2>
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
                      className={`group relative aspect-square rounded-3xl overflow-hidden border-2 transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl ${currentMediaIndex === idx ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-800 hover:border-blue-400/50'}`}
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
                                      <PlayCircle size={32} />
                                  </div>
                              </div>
                          </div>
                      )}
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
