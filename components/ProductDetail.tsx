
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
        
        {/* COMPACT MEDIA SHOWCASE (REDUCED HEIGHT) */}
        <div className="w-full h-[30vh] md:h-[35vh] bg-slate-50 relative group flex items-center justify-center overflow-hidden border-b border-slate-100 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 z-10 pointer-events-none"></div>
            
            {currentMedia ? (
            currentMedia.type === 'image' ? (
                <img 
                src={currentMedia.url} 
                className="w-full h-full object-contain p-4 md:p-6 bg-white cursor-zoom-in" 
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
                    <PlayCircle size={40} className="text-white/50 group-hover:text-white/80 transition-all scale-100 group-hover:scale-110" />
                </div>
                </div>
            )
            ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-white">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <span className="font-black uppercase tracking-widest text-[8px]">No Visual Content</span>
            </div>
            )}

            {/* TINY NAVIGATION ARROWS */}
            {allMedia.length > 1 && (
            <>
                <button 
                  onClick={handlePrevMedia} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-600 hover:text-white text-slate-900 w-8 h-8 rounded-full shadow-lg z-30 transition-all border border-slate-200 active:scale-90 flex items-center justify-center"
                >
                    <LeftArrow size={14} strokeWidth={3} />
                </button>
                <button 
                  onClick={handleNextMedia} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-600 hover:text-white text-slate-900 w-8 h-8 rounded-full shadow-lg z-30 transition-all border border-slate-200 active:scale-90 flex items-center justify-center"
                >
                    <RightArrow size={14} strokeWidth={3} />
                </button>
                
                {/* Slim Media Progress Bar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 pointer-events-none">
                {allMedia.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all shadow-md ${i === currentMediaIndex ? 'w-4 bg-blue-600' : 'w-1 bg-slate-300'}`} />
                ))}
                </div>
            </>
            )}

            {/* Floating Gallery Toggle */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
            {allMedia.length > 0 && (
                <button 
                onClick={(e) => { e.stopPropagation(); setShowGalleryModal(true); }}
                className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded-lg text-[7px] font-black uppercase flex items-center gap-1 shadow-2xl border border-white/10 backdrop-blur-md transition-all"
                >
                <LayoutGrid size={10} /> GALLERY
                </button>
            )}
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-6xl mx-auto px-6 py-6 md:px-16">
            {/* Title & Description */}
            <div className="mb-8 border-b border-slate-100 pb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {product.sku && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-slate-200">
                    <Tag size={10} /> SKU: {product.sku}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-blue-100">
                  Data Sheet Verified
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-none uppercase tracking-tighter mb-4">{product.name}</h1>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium max-w-4xl">{product.description || "No specific description available."}</p>
            </div>

            {/* DEDICATED SECTION: Product Videos, Manuals & Docs */}
            {(allVideos.length > 0 || allManuals.length > 0) && (
              <div className="mb-12 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200">
                <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Download size={16} className="text-blue-600" /> Product Videos, Manuals & Docs
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Videos Sub-section */}
                  {allVideos.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Video size={14} /> Available Multimedia
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {allVideos.map((vid, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleEnlargeMedia(allMedia.indexOf(vid))}
                            className="group relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                          >
                            <video src={vid.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PlayCircle size={24} className="text-white shadow-xl" />
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase">Video {idx+1}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manuals Sub-section */}
                  {allManuals.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} /> PDF Manuals & Docs
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {allManuals.map(manual => (
                          <button 
                            key={manual.id}
                            onClick={() => openManual(manual)}
                            className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl transition-all group"
                          >
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <FileText size={20} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="text-[10px] font-black uppercase text-slate-900 truncate leading-tight">{manual.title}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase">{manual.pdfUrl ? 'Official Document' : 'Image Gallery'}</div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
              {/* Features Section */}
              {product.features.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Check size={16} className="text-green-500" /> Key Features
                  </h3>
                  <div className="space-y-3">
                    {product.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:translate-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        <span className="text-sm font-bold text-slate-700 leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs & Dimensions Section */}
              <div className="space-y-12">
                {/* SPECS */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Settings size={16} className="text-blue-600" /> Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(product.specs).map(([key, value], idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{key}</span>
                          <span className="block text-xs font-black text-slate-900 leading-tight">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* DIMENSIONS */}
                {dimensionSets.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Ruler size={16} className="text-orange-500" /> Dimensions
                    </h3>
                    <div className="space-y-3">
                      {dimensionSets.map((dims, i) => (
                        <div key={i} className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100 shadow-sm">
                          <div className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-3 border-b border-orange-100 pb-1.5">{dims.label || `Unit ${i+1}`}</div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div><span className="block text-[7px] text-slate-400 font-black uppercase mb-0.5">H</span><span className="block text-[10px] font-black text-slate-900">{dims.height || '-'}</span></div>
                            <div><span className="block text-[7px] text-slate-400 font-black uppercase mb-0.5">W</span><span className="block text-[10px] font-black text-slate-900">{dims.width || '-'}</span></div>
                            <div><span className="block text-[7px] text-slate-400 font-black uppercase mb-0.5">D</span><span className="block text-[10px] font-black text-slate-900">{dims.depth || '-'}</span></div>
                            <div><span className="block text-[7px] text-slate-400 font-black uppercase mb-0.5">KG</span><span className="block text-[10px] font-black text-slate-900">{dims.weight || '-'}</span></div>
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-40 animate-slide-up">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-2xl p-3 shadow-2xl flex justify-between items-center">
          <div className="hidden md:flex flex-col ml-3 min-w-0">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Viewing Asset</span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight truncate pr-4">{product.name}</span>
          </div>
          <button 
            onClick={onBack} 
            className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Exit to Menu
          </button>
        </div>
      </div>

      {/* MEDIA ENLARGED MODAL */}
      {showEnlargedMedia && enlargedMedia && (
        <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowEnlargedMedia(false)}>
          <button onClick={() => setShowEnlargedMedia(false)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/40 text-white p-3 rounded-full transition-colors z-50 shadow-2xl"><X size={32} /></button>
          
          {allMedia.length > 1 && (
            <>
               <button onClick={handlePrevEnlarged} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 transition-all z-50">
                   <LeftArrow size={40} />
               </button>
               <button onClick={handleNextEnlarged} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 transition-all z-50">
                   <RightArrow size={40} />
               </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {enlargedMedia.type === 'image' ? (
                <img src={enlargedMedia.url} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" alt="Product detail" />
            ) : (
                <video src={enlargedMedia.url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg" />
            )}
          </div>
        </div>
      )}

      {/* GALLERY GRID MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[105] bg-slate-950/98 p-6 md:p-16 animate-fade-in flex flex-col" onClick={() => setShowGalleryModal(false)}>
            <div className="flex justify-between items-center mb-10 shrink-0 max-w-7xl mx-auto w-full" onClick={e => e.stopPropagation()}>
                <div>
                   <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                      <LayoutGrid className="text-blue-500" size={32} /> Visual Index
                   </h2>
                </div>
                <button 
                  onClick={() => setShowGalleryModal(false)}
                  className="bg-white/10 hover:bg-red-500 hover:text-white text-white p-4 rounded-full transition-all duration-300 shadow-2xl border border-white/5"
                >
                   <X size={24} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-32" onClick={e => e.stopPropagation()}>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                 {allMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                          setCurrentMediaIndex(idx);
                          setEnlargedMediaIndex(idx);
                          setShowGalleryModal(false);
                          setShowEnlargedMedia(true);
                      }}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-2xl ${currentMediaIndex === idx ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-800 hover:border-blue-400/50'}`}
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
                                  <div className="w-12 h-12 bg-blue-600/80 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-sm">
                                      <PlayCircle size={24} />
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
