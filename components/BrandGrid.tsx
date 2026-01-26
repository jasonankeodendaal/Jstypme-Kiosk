
import React, { useEffect, useState, useRef, useMemo, memo } from 'react';
import { Brand, Catalogue, HeroConfig, AdConfig, AdItem, Pricelist } from '../types';
import { BookOpen, Globe, ChevronRight, X, Grid, Library } from 'lucide-react';

interface BrandGridProps {
  brands: Brand[];
  heroConfig?: HeroConfig;
  allCatalogs?: Catalogue[]; 
  ads?: AdConfig;
  onSelectBrand: (brand: Brand) => void;
  onViewDocument: (document: Catalogue | Pricelist) => void; 
  onViewWebsite?: (url: string) => void;
  onExport: () => void; 
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  deviceType?: string;
  isIdle?: boolean; // New prop to track screensaver state
}

// Improved AdUnit with robust playback logic for Firefox & Error Recovery
const AdUnit = ({ items, className, isActive = true }: { items?: AdItem[], className?: string, isActive?: boolean }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<number | null>(null);

    // Reset index safely when items array changes significantly (length diff)
    useEffect(() => {
        if (!items || items.length === 0) return;
        // Keep current index if valid, otherwise reset
        setCurrentIndex(prev => prev >= items.length ? 0 : prev);
    }, [items?.length]);

    const activeItem = items && items.length > 0 ? items[currentIndex % items.length] : null;
    
    // Preload Logic: Determine the next item in the cycle
    const nextIndex = items && items.length > 0 ? (currentIndex + 1) % items.length : 0;
    const nextItem = items && items.length > 0 ? items[nextIndex] : null;

    const advanceSlide = () => {
        if (items && items.length > 0) {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }
    };

    // Wake up logic: When becoming active, ensure video plays
    useEffect(() => {
        if (isActive && activeItem?.type === 'video' && videoRef.current) {
            // Force reload to recover lost video surface on Android WebViews
            videoRef.current.load();
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // If play fails (e.g. strict autoplay policy), skip to next
                    advanceSlide();
                });
            }
        } else if (!isActive && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isActive, activeItem]);

    useEffect(() => {
        if (!activeItem || !isActive) return;
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (activeItem.type === 'image') {
            // Only cycle if we have multiple items
            if (items && items.length > 1) {
                timeoutRef.current = window.setTimeout(advanceSlide, 6000);
            }
        } else {
            // Video Fallback Timer: If video hangs or metadata fails, skip after 3 mins
            // Note: Normal advance happens via onEnded
            timeoutRef.current = window.setTimeout(advanceSlide, 180000); // 3m watchdog
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentIndex, activeItem, items, isActive]);

    if (!items || items.length === 0) return (
       <div className={`relative overflow-hidden rounded-xl border border-slate-200/50 bg-slate-50/50 ${className}`}></div>
    );

    const handleVideoEnded = () => {
        if (items.length > 1) {
            advanceSlide();
        } else if (videoRef.current) {
            videoRef.current.currentTime = 0;
            if(isActive) videoRef.current.play().catch(() => {});
        }
    };

    const handleError = () => {
        console.warn("AdUnit: Media failed to load, skipping...", activeItem?.url);
        // Force skip to next item immediately to prevent freeze
        if (items.length > 1) {
            advanceSlide();
        }
    };

    return (
        <div className={`relative overflow-hidden rounded-xl shadow-sm border border-slate-200 bg-white group ${className}`}>
            <div className="absolute top-2 right-2 z-10 bg-black/30 text-white px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">Ad</div>
            
            <div key={`${activeItem!.id}-${currentIndex}`} className="w-full h-full animate-fade-in bg-slate-50">
                {activeItem!.type === 'video' ? (
                    <video 
                        ref={videoRef}
                        key={`ad-vid-${activeItem!.url}`}
                        src={activeItem!.url} 
                        muted={true} 
                        autoPlay={isActive} 
                        playsInline={true}
                        loop={items.length === 1}
                        className="w-full h-full object-cover"
                        onEnded={handleVideoEnded}
                        onError={handleError} 
                    />
                ) : (
                    <img 
                        src={activeItem!.url} 
                        alt="Advertisement" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        onError={handleError}
                    />
                )}
            </div>

            {items.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                    {items.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === (currentIndex % items.length) ? 'bg-white' : 'bg-white/50'}`}
                        ></div>
                    ))}
                </div>
            )}

            {/* Hidden Preloader to prevent buffering/flash when cycling ads */}
            <div className="absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none">
                {nextItem && isActive && (
                    nextItem.type === 'video' ? (
                        <video src={nextItem.url} preload="auto" muted playsInline />
                    ) : (
                        <img src={nextItem.url} loading="eager" decoding="async" />
                    )
                )}
            </div>
        </div>
    );
};

const BrandGrid: React.FC<BrandGridProps> = ({ brands, heroConfig, allCatalogs, ads, onSelectBrand, onViewDocument, onViewWebsite, onExport, screensaverEnabled, onToggleScreensaver, deviceType, isIdle }) => {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(19);
  
  useEffect(() => {
    const handleResize = () => {
        const width = window.innerWidth;
        if (width < 640) {
            setDisplayLimit(11); 
        } else if (width < 1024) {
            setDisplayLimit(19);
        } else {
            // Increased limit for 10-column desktop view
            setDisplayLimit(29);
        }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sort pamphlets by date (Newest First) so Hero gets the latest
  const sortedPamphlets = useMemo(() => {
      const list = allCatalogs?.filter(c => !c.brandId) || [];
      return list.sort((a, b) => {
           // Sort by startDate descending (newest first)
           const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
           const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
           if (dateA !== dateB) return dateB - dateA;
           // Fallback to year
           return (b.year || 0) - (a.year || 0);
      });
  }, [allCatalogs]);

  const mainPamphlet = sortedPamphlets[0]; 

  const sortedBrands = useMemo(() => {
      return [...brands].sort((a, b) => a.name.localeCompare(b.name));
  }, [brands]);

  const visibleBrands = sortedBrands.slice(0, displayLimit);
  const hasMoreBrands = sortedBrands.length > displayLimit;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto animate-fade-in pb-40 md:pb-24">
      {/* 3D Styles Injection */}
      <style>{`
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        
        @media (min-width: 768px) {
            .perspective-container { perspective: 1000px; }
            .book-wrapper { transform-style: preserve-3d; transform: rotateY(-20deg) rotateX(5deg); transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .book-wrapper:hover { transform: rotateY(0deg) rotateX(0deg) scale(1.05) translateY(-10px); }
            .book-spine { border-left: 4px solid #cbd5e1; }
            .book-shadow { box-shadow: 20px 30px 50px -15px rgba(0,0,0,0.5); }
        }
        
        @media (max-width: 767px) {
            .perspective-container { perspective: none; }
            .book-wrapper { transform: none !important; }
            .book-spine { border-left: 1px solid #cbd5e1; }
            .animate-float { animation: none; }
            .book-shadow { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        }
      `}</style>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white relative overflow-hidden shrink-0 min-h-[20vh] md:min-h-[35vh] flex flex-col">
        {heroConfig?.backgroundImageUrl ? (
            <div className="absolute inset-0 z-0">
                <img src={heroConfig.backgroundImageUrl} alt="" className="w-full h-full object-cover opacity-40 blur-sm scale-105" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/30"></div>
            </div>
        ) : (
             <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
        )}

        <div className="relative z-10 flex-1 flex flex-row items-center justify-center p-4 md:p-12 gap-4 md:gap-12 max-w-7xl mx-auto w-full">
            <div className="flex-1 flex flex-col justify-center text-left space-y-1 md:space-y-6 max-w-[60%] md:max-w-2xl shrink-0 h-full">
                {heroConfig?.logoUrl && (
                    <img src={heroConfig.logoUrl} alt="Logo" className="h-10 md:h-32 object-contain mb-2 md:mb-6 mr-auto drop-shadow-md" loading="eager" />
                )}
                <div>
                   <h1 className="text-xl md:text-6xl font-black tracking-tight leading-none md:leading-tight mb-1">
                      {heroConfig?.title || "Welcome"}
                   </h1>
                   <div className="h-0.5 w-8 md:w-24 bg-blue-500 rounded-full mr-auto mb-2 md:mb-4"></div>
                   <p className="text-[10px] md:text-xl text-slate-300 font-light leading-tight line-clamp-2 md:line-clamp-none">
                      {heroConfig?.subtitle || "Explore our premium collection."}
                   </p>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-4 justify-start pt-2 md:pt-6">
                     {mainPamphlet && (
                        <button 
                            onClick={() => onViewDocument(mainPamphlet)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-8 md:py-3.5 rounded-lg md:rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-base shadow-xl hover:-translate-y-1 transition-all flex items-center gap-1.5 md:gap-3"
                        >
                            <BookOpen size={14} className="md:size-auto" /> 
                            <span className="hidden md:block">Open Main Catalogue</span>
                            <span className="md:hidden">View</span>
                        </button>
                     )}
                     {heroConfig?.websiteUrl && (
                         <button 
                            onClick={() => onViewWebsite?.(heroConfig.websiteUrl!)}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 md:px-8 md:py-3.5 rounded-lg md:rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-base border border-white/20 hover:-translate-y-1 transition-all flex items-center gap-1.5 md:gap-3 shadow-lg"
                         >
                            <Globe size={14} className="md:size-auto" /> 
                            <span className="hidden md:block">Visit Website</span>
                            <span className="md:hidden">Web</span>
                         </button>
                     )}
                </div>
            </div>

            {mainPamphlet && (
                <div className="perspective-container shrink-0 w-[35%] md:w-[320px] max-w-[160px] md:max-w-none flex items-center justify-center">
                    <div 
                        className="relative w-full aspect-[2/3] cursor-pointer animate-float book-wrapper"
                        onClick={() => onViewDocument(mainPamphlet)}
                        role="button"
                    >
                        <div className="book-container absolute inset-0 bg-white rounded-r-sm md:rounded-r-2xl book-shadow overflow-hidden">
                             {mainPamphlet.thumbnailUrl || (mainPamphlet.pages && mainPamphlet.pages[0]) ? (
                                <img 
                                    src={mainPamphlet.thumbnailUrl || mainPamphlet.pages[0]} 
                                    className="w-full h-full object-cover rounded-r-sm md:rounded-r-2xl book-spine"
                                    alt={`${mainPamphlet.title} Cover`}
                                    loading="eager"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold uppercase text-[10px] book-spine">No Cover</div>
                             )}
                             <div className="absolute top-0 bottom-0 left-0 w-0.5 md:w-1.5 bg-gradient-to-r from-slate-300 to-transparent pointer-events-none"></div>
                             <div className="absolute bottom-2 md:bottom-6 left-0 right-0 text-center bg-black/80 text-white py-1 md:py-3 backdrop-blur-sm">
                                <span className="text-[7px] md:text-sm font-black uppercase tracking-[0.2em] block truncate px-2">{mainPamphlet.title}</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Tiny Strip Carousel - Only if > 1 pamphlet */}
      {sortedPamphlets.length > 1 && (
          <div className="w-full bg-slate-100 border-b border-slate-200 py-3 px-4 md:px-8 shadow-inner relative z-20 animate-fade-in">
              <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar max-w-[1700px] mx-auto pb-1">
                  <div className="flex flex-col items-center justify-center shrink-0 pr-4 md:pr-6 border-r border-slate-300/50 text-slate-400 gap-1 opacity-80">
                      <Library size={20} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">All<br/>Issues</span>
                  </div>
                  {sortedPamphlets.map((pamphlet) => (
                      <button 
                          key={pamphlet.id}
                          onClick={() => onViewDocument(pamphlet)}
                          className="group relative flex flex-col items-center shrink-0 w-16 md:w-20 transition-all duration-300 hover:-translate-y-1"
                          title={pamphlet.title}
                      >
                          <div className="w-full aspect-[2/3] bg-white rounded-md shadow-sm group-hover:shadow-md border border-slate-200 overflow-hidden relative">
                              {pamphlet.thumbnailUrl || (pamphlet.pages && pamphlet.pages[0]) ? (
                                  <img 
                                      src={pamphlet.thumbnailUrl || pamphlet.pages[0]} 
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                      alt={pamphlet.title}
                                      loading="lazy"
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                      <BookOpen size={16} />
                                  </div>
                              )}
                          </div>
                          <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase mt-1.5 text-center line-clamp-1 w-full group-hover:text-blue-600 transition-colors">
                              {pamphlet.title}
                          </span>
                      </button>
                  ))}
              </div>
          </div>
      )}

      <div className="w-full bg-white pt-10 pb-6 text-center border-b border-slate-100">
            <h2 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-[0.2em] inline-block px-10 pb-2 relative">
                Featured Brands
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-blue-600 rounded-full"></div>
            </h2>
      </div>

      <div className="flex-1 p-4 md:p-12 max-w-[1700px] mx-auto w-full flex flex-col gap-10">
        <div className="flex-1 flex flex-col gap-12">
            {/* Grid updated to support 10 columns (xl:grid-cols-10) and smaller icon sizes (max-w-[100px]) */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-4 w-full place-items-center">
              {visibleBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onSelectBrand(brand)}
                  className="group flex flex-col items-center justify-center w-full max-w-[100px] p-1 md:p-3 bg-white rounded-2xl shadow-sm hover:shadow-[0_15px_35px_rgba(37,99,235,0.08)] transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-1 aspect-square"
                  title={brand.name}
                >
                  <div className="relative w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl} 
                        alt={brand.name} 
                        loading="lazy"
                        className="w-full h-full object-contain transition-all duration-500 p-1 md:p-2"
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-sm md:text-xl font-black transition-all duration-500 border-2 border-dashed border-slate-200 group-hover:border-transparent">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {hasMoreBrands && (
                <button
                  onClick={() => setShowAllBrands(true)}
                  className="group flex flex-col items-center justify-center w-full max-w-[100px] p-1 md:p-3 bg-slate-50 rounded-2xl shadow-sm hover:shadow-[0_15px_35px_rgba(37,99,235,0.08)] transition-all duration-500 border border-slate-200 hover:border-blue-500 hover:-translate-y-1 aspect-square"
                >
                   <div className="relative flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-105">
                       <Grid size={18} className="text-slate-400 group-hover:text-blue-600 mb-0.5" />
                       <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-700">More</span>
                   </div>
                </button>
              )}
            </div>

            {deviceType !== 'mobile' && ads && (
                <div className="grid grid-cols-2 gap-6 mt-12 w-full">
                    {/* Pass isActive={!isIdle} to control playback when screensaver is active */}
                    <AdUnit items={ads.homeBottomLeft} className="aspect-[2.2/1] w-full" isActive={!isIdle} />
                    <AdUnit items={ads.homeBottomRight} className="aspect-[2.2/1] w-full" isActive={!isIdle} />
                </div>
            )}
        </div>
      </div>

      {showAllBrands && (
        <div className="fixed inset-0 z-[60] bg-blue-50/70 backdrop-blur-2xl p-6 md:p-20 animate-fade-in flex flex-col">
            <div className="flex justify-between items-center mb-12 shrink-0 max-w-7xl mx-auto w-full">
                <div>
                   <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                      <Grid className="text-blue-600" size={40} /> All Brands
                   </h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">Full manufacturer directory</p>
                </div>
                <button 
                  onClick={() => setShowAllBrands(false)}
                  className="bg-white/50 hover:bg-red-500 hover:text-white text-slate-400 p-4 rounded-full transition-all duration-300 shadow-sm border border-blue-100"
                >
                   <X size={32} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20">
               <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 md:gap-8 p-4 place-items-center">
                 {sortedBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => {
                          setShowAllBrands(false);
                          onSelectBrand(brand);
                      }}
                      className="group flex flex-col items-center justify-center w-full p-2 md:p-4 transition-all duration-500 hover:-translate-y-1.5 rounded-3xl hover:bg-white/80 border border-transparent hover:border-blue-100 shadow-transparent hover:shadow-xl hover:shadow-blue-500/5"
                      title={brand.name}
                    >
                      <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all duration-500 group-hover:scale-110 mb-3">
                        {brand.logoUrl ? (
                          <img 
                            src={brand.logoUrl} 
                            alt={brand.name} 
                            loading="lazy"
                            className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-lg"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-blue-100 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-sm font-black transition-all duration-500 shadow-inner">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-900 truncate w-full text-center transition-colors px-1">{brand.name}</span>
                    </button>
                  ))}
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default memo(BrandGrid);
