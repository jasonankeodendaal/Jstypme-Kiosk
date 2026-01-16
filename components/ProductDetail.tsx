
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import Flipbook from './Flipbook';
import PdfViewer from './PdfViewer';
import { fetchProductDetails } from '../services/geminiService';
// Fix: Added ChevronRight to imports from lucide-react
import { ChevronLeft, ChevronRight, Info, PlayCircle, FileText, Check, Box as BoxIcon, ChevronRight as RightArrow, ChevronLeft as LeftArrow, X, Image as ImageIcon, Tag, Layers, Ruler, Package, LayoutGrid, Settings, BookOpen, CornerDownRight, Loader2 } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  showScreensaverButton?: boolean;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  // Merge prop product (light) with fetched detailed product (heavy)
  const [detailedProduct, setDetailedProduct] = useState<Product>(product);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); 
  const [showEnlargedMedia, setShowEnlargedMedia] = useState(false);
  const [enlargedMediaIndex, setEnlargedMediaIndex] = useState(0);
  const [flipbookData, setFlipbookData] = useState<{ isOpen: boolean, pages: string[], title: string }>({ isOpen: false, pages: [], title: '' });
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Auto-Fetch Details on Mount if missing
  useEffect(() => {
      // Heuristic: If specs are empty and description is empty, assume we have a "Light" object
      const hasSpecs = Object.keys(product.specs || {}).length > 0;
      const hasDesc = product.description && product.description.length > 0;
      
      if (!hasSpecs && !hasDesc) {
          setIsLoadingDetails(true);
          fetchProductDetails(product.id).then((details) => {
              if (details) {
                  setDetailedProduct(prev => ({ ...prev, ...details }));
              }
              setIsLoadingDetails(false);
          });
      } else {
          setDetailedProduct(product);
      }
  }, [product.id]);

  useEffect(() => {
    const handleScroll = (e: any) => {
        setScrolled(e.target.scrollTop > 50);
    };
    const container = document.getElementById('product-scroll-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const dimensionSets = useMemo(() => {
      if (Array.isArray(detailedProduct.dimensions)) return detailedProduct.dimensions;
      if (typeof detailedProduct.dimensions === 'object' && detailedProduct.dimensions) {
          return [{ label: "Device", ...(detailedProduct.dimensions as any) }];
      }
      return [];
  }, [detailedProduct.dimensions]);

  const allMedia = useMemo(() => {
    const media: { type: 'image' | 'video', url: string }[] = [];
    if (detailedProduct.imageUrl) {
      media.push({ type: 'image', url: detailedProduct.imageUrl });
    }
    detailedProduct.galleryUrls?.forEach(url => {
      media.push({ type: 'image', url });
    });
    if (detailedProduct.videoUrl) {
      media.push({ type: 'video', url: detailedProduct.videoUrl });
    }
    detailedProduct.videoUrls?.forEach(url => {
        if (url !== detailedProduct.videoUrl) {
             media.push({ type: 'video', url });
        }
    });
    return media;
  }, [detailedProduct]);

  const allManuals = useMemo(() => {
      const mans = detailedProduct.manuals || [];
      if (mans.length === 0 && (detailedProduct.manualUrl || (detailedProduct.manualImages && detailedProduct.manualImages.length > 0))) {
          return [{
              id: 'legacy',
              title: 'User Manual',
              images: detailedProduct.manualImages || [],
              pdfUrl: detailedProduct.manualUrl,
              thumbnailUrl: detailedProduct.manualImages?.[0] || undefined
          }];
      }
      return mans;
  }, [detailedProduct]);

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
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
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in overflow-hidden">
      
      {/* HEADER BAR - BLURS ON SCROLL */}
      <div className={`fixed top-10 left-0 right-0 z-50 transition-all duration-500 px-4 py-3 flex items-center justify-between border-b ${scrolled ? 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-sm' : 'bg-transparent border-transparent'}`}>
         <button 
          onClick={onBack} 
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${scrolled ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/90 text-slate-900 shadow-2xl border border-slate-200'}`}
        >
          <ChevronLeft size={16} strokeWidth={3} /> Back
        </button>
        
        {scrolled && (
            <div className="flex-1 px-6 animate-fade-in">
                <h2 className="font-black text-slate-900 uppercase text-xs truncate max-w-[200px] md:max-w-md">{detailedProduct.name}</h2>
            </div>
        )}

        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div id="product-scroll-container" className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
        <div className="flex flex-col lg:flex-row w-full min-h-full">
            
            {/* LEFT PANEL: STICKY MEDIA */}
            <div className="w-full lg:w-1/2 lg:h-[calc(100vh-80px)] lg:sticky lg:top-10 bg-white flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="relative w-full aspect-square md:aspect-auto md:h-full flex items-center justify-center group">
                    {currentMedia ? (
                        currentMedia.type === 'image' ? (
                            <img 
                                src={currentMedia.url} 
                                className="max-w-full max-h-full object-contain cursor-zoom-in transition-transform duration-700 hover:scale-105" 
                                alt={detailedProduct.name} 
                                onClick={() => { setEnlargedMediaIndex(currentMediaIndex); setShowEnlargedMedia(true); }} 
                            />
                        ) : (
                            <div className="w-full h-full relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl" onClick={() => { setEnlargedMediaIndex(currentMediaIndex); setShowEnlargedMedia(true); }}>
                                <video src={currentMedia.url} className="w-full h-full object-contain" autoPlay muted loop playsInline />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                        <PlayCircle size={48} fill="currentColor" className="opacity-80" />
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center text-slate-300">
                            <ImageIcon size={80} strokeWidth={1} />
                            <span className="font-black uppercase tracking-widest text-[10px] mt-4">No Media Asset</span>
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {allMedia.length > 1 && (
                        <>
                            <button onClick={handlePrevMedia} className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-xl transition-all border border-slate-100 lg:opacity-0 lg:group-hover:opacity-100">
                                <ChevronLeft size={24} strokeWidth={3} />
                            </button>
                            <button onClick={handleNextMedia} className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-xl transition-all border border-slate-100 lg:opacity-0 lg:group-hover:opacity-100">
                                <ChevronRight size={24} strokeWidth={3} />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {allMedia.length > 1 && (
                    <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar pb-2 px-4 max-w-full">
                        {allMedia.map((media, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentMediaIndex(idx)}
                                className={`w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${currentMediaIndex === idx ? 'border-blue-600 shadow-lg scale-105' : 'border-slate-100 grayscale hover:grayscale-0'}`}
                            >
                                {media.type === 'image' ? (
                                    <img src={media.url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                                        <PlayCircle size={20} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT PANEL: INFORMATION STREAM */}
            <div className="w-full lg:w-1/2 p-6 md:p-16 lg:p-24 bg-white lg:bg-transparent">
                
                {/* Title & Sku */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        {detailedProduct.sku && (
                            <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono font-bold text-[10px] tracking-widest uppercase">
                                SKU: {detailedProduct.sku}
                            </div>
                        )}
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] border border-blue-100">
                            Verified Tech Data
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-none tracking-tighter uppercase mb-8">
                        {detailedProduct.name}
                    </h1>
                    
                    {isLoadingDetails ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <p className="text-lg md:text-2xl text-slate-600 leading-relaxed font-medium">
                            {detailedProduct.description || "A premium showcase item with exclusive technical architecture."}
                        </p>
                    )}
                </div>

                <div className="space-y-16 lg:space-y-24">
                    
                    {/* KEY FEATURES SECTION */}
                    {detailedProduct.features && detailedProduct.features.length > 0 && (
                        <div className="animate-slide-up">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                <span className="w-10 h-0.5 bg-slate-200"></span> 01. Key Features
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {detailedProduct.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 leading-tight py-1">{/* DEFENSIVE: Render non-strings as JSON */ typeof f === 'object' ? JSON.stringify(f) : f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TECHNICAL SPEC GRID */}
                    {detailedProduct.specs && Object.keys(detailedProduct.specs).length > 0 && (
                        <div className="animate-slide-up">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                <span className="w-10 h-0.5 bg-slate-200"></span> 02. Data Matrix
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(detailedProduct.specs).map(([key, value], idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{key}</span>
                                        <span className="block text-sm font-black text-slate-900 leading-tight">{/* DEFENSIVE: Render non-strings as JSON */ typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DIMENSIONS & LOGISTICS */}
                    {dimensionSets.length > 0 && (
                        <div className="animate-slide-up">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                <span className="w-10 h-0.5 bg-slate-200"></span> 03. Dimensions & Scale
                            </h3>
                            <div className="space-y-4">
                                {dimensionSets.map((dims, i) => (
                                    <div key={i} className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Ruler size={100} /></div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">
                                            <CornerDownRight size={14} /> {dims.label || `Unit Metrics`}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div><span className="block text-[8px] text-slate-500 font-black uppercase mb-1">H</span><span className="text-xl font-black">{dims.height || 'N/A'}</span></div>
                                            <div><span className="block text-[8px] text-slate-500 font-black uppercase mb-1">W</span><span className="text-xl font-black">{dims.width || 'N/A'}</span></div>
                                            <div><span className="block text-[8px] text-slate-500 font-black uppercase mb-1">D</span><span className="text-xl font-black">{dims.depth || 'N/A'}</span></div>
                                            <div><span className="block text-[8px] text-slate-500 font-black uppercase mb-1">Wt</span><span className="text-xl font-black text-blue-400">{dims.weight || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DOCUMENTATION */}
                    {allManuals.length > 0 && (
                        <div className="animate-slide-up">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                <span className="w-10 h-0.5 bg-slate-200"></span> 04. Repository
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {allManuals.map(manual => (
                                    <button 
                                        key={manual.id}
                                        onClick={() => openManual(manual)} 
                                        className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all group text-left"
                                    >
                                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                                            {manual.pdfUrl ? <FileText className="text-red-500" size={28} /> : <BookOpen className="text-blue-500" size={28} />}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-xs font-black uppercase text-slate-900 truncate">{manual.title}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                                                {manual.pdfUrl ? 'Digital PDF Document' : 'Flipbook Gallery'}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BOTTOM LEGAL SPACE */}
                    {detailedProduct.terms && (
                        <div className="pt-20 pb-10">
                            <div className="bg-slate-100 p-8 rounded-[2rem] border border-slate-200">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Manufacturer Warranty & Protocol</h4>
                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed whitespace-pre-wrap">{detailedProduct.terms}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MEDIA MODALS & LIGHTBOXES */}
      {showEnlargedMedia && enlargedMedia && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowEnlargedMedia(false)}>
          <button onClick={() => setShowEnlargedMedia(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[120] p-4 bg-white/5 rounded-full backdrop-blur-md">
            <X size={32} strokeWidth={3} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {enlargedMedia.type === 'image' ? (
                <img src={enlargedMedia.url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="" />
            ) : (
                <video src={enlargedMedia.url} controls autoPlay className="max-w-full max-h-full object-contain" />
            )}
            
            {allMedia.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); setEnlargedMediaIndex(prev => (prev - 1 + allMedia.length) % allMedia.length); }} className="absolute left-4 p-4 text-white/40 hover:text-white transition-colors">
                        <LeftArrow size={48} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEnlargedMediaIndex(prev => (prev + 1) % allMedia.length); }} className="absolute right-4 p-4 text-white/40 hover:text-white transition-colors">
                        <RightArrow size={48} />
                    </button>
                </>
            )}
          </div>
        </div>
      )}

      {flipbookData.isOpen && (
          <Flipbook pages={flipbookData.pages || []} onClose={() => setFlipbookData({...flipbookData, isOpen: false})} catalogueTitle={flipbookData.title}/>
      )}

      {viewingPdf && (
           <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />
       )}

       <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        #product-scroll-container { scroll-behavior: smooth; }
       `}</style>
    </div>
  );
};

export default ProductDetail;
