
import React, { useEffect, useState, useRef, useMemo, memo } from 'react';
import { Brand, Catalogue, HeroConfig, AdConfig, AdItem } from '../types';
import { BookOpen, Globe, ChevronRight, X, Grid } from 'lucide-react';

interface BrandGridProps {
  brands: Brand[];
  heroConfig?: HeroConfig;
  allCatalogs?: Catalogue[]; 
  ads?: AdConfig;
  onSelectBrand: (brand: Brand) => void;
  onViewGlobalCatalog: (catalogue: Catalogue) => void; 
  onExport: () => void; 
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  deviceType?: string;
  onLaunchBrowser?: (url: string, title?: string) => void;
}

// Improved AdUnit with robust playback logic for Firefox
const AdUnit = ({ items, className }: { items?: AdItem[], className?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setCurrentIndex(0);
    }, [items?.length]);

    const activeItem = items && items.length > 0 ? items[currentIndex % items.length] : null;

    useEffect(() => {
        if (!activeItem) return;
        if (items && items.length <= 1 && activeItem.type !== 'video') return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (activeItem.type === 'image') {
            timeoutRef.current = window.setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % items!.length);
            }, 6000);
        } else {
            // Firefox reinforcement: Ensure muted property is set and play() called
            if(videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
            }
            // Fallback safety if video stalls
            timeoutRef.current = window.setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % items!.length);
            }, 180000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentIndex, activeItem, items]);

    if (!items || items.length === 0) return (
       <div className={`relative overflow-hidden rounded-xl border border-slate-200/50 bg-slate-50/50 ${className}`}></div>
    );

    const handleVideoEnded = () => {
        if (items.length > 1) {
            setCurrentIndex(prev => (prev + 1) % items.length);
        } else if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => {});
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
                        autoPlay={true} 
                        playsInline={true}
                        loop={items.length === 1}
                        className="w-full h-full object-cover"
                        onEnded={handleVideoEnded}
                        onLoadedMetadata={() => {
                            if (videoRef.current) {
                                videoRef.current.muted = true;
                                videoRef.current.play().catch(() => {});
                            }
                        }}
                    />
                ) : (
                    <img 
                        src={activeItem!.url} 
                        alt="Advertisement" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
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
        </div>
    );
};

const BrandGrid: React.FC<BrandGridProps> = ({ brands, heroConfig, allCatalogs, ads, onSelectBrand, onViewGlobalCatalog, onExport, screensaverEnabled, onToggleScreensaver, deviceType, onLaunchBrowser }) => {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(11);
  
  useEffect(() => {
    const handleResize = () => {
        const width = window.innerWidth;
        if (width < 640) {
            setDisplayLimit(11); 
        } else if (width < 1024) {
            setDisplayLimit(19);
        } else {
            setDisplayLimit(23);
        }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const globalPamphlets = allCatalogs?.filter(c => !c.brandId) || [];
  const mainPamphlet = globalPamphlets[0]; 

  const sortedBrands = useMemo(() => {
      return [...brands].sort((a, b) => a.name.localeCompare(b.name));
  }, [brands]);

  const visibleBrands = sortedBrands.slice(0, displayLimit);
  const hasMoreBrands = sortedBrands.length > displayLimit;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto animate-fade-in pb-40 md:pb-24">
      
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
                            onClick={() => onViewGlobalCatalog(mainPamphlet)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-8 md:py-3.5 rounded-lg md:rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-base shadow-xl hover:-translate-y-1 transition-all flex items-center gap-1.5 md:gap-3"
                        >
                            <BookOpen size={14} className="md:size-auto" /> 
                            <span className="hidden md:block">Open Main Catalogue</span>
                            <span className="md:hidden">View</span>
                        </button>
                     )}
                     {heroConfig?.websiteUrl && (
                         <button 
                            onClick={() => onLaunchBrowser ? onLaunchBrowser(heroConfig.websiteUrl!, "Store Website") : window.open(heroConfig.websiteUrl, '_blank')}
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
                <div className="perspective-1000 shrink-0 w-[35%] md:w-[320px] max-w-[160px] md:max-w-none flex items-center justify-center">
                    <div 
                        className="relative w-full aspect-[2/3] cursor-pointer animate-float"
                        onClick={() => onViewGlobalCatalog(mainPamphlet)}
                        role="button"
                    >
                        <div className="book-container absolute inset-0 bg-white rounded-r-sm md:rounded-r-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                             {mainPamphlet.thumbnailUrl || (mainPamphlet.pages && mainPamphlet.pages[0]) ? (
                                <img 
                                    src={mainPamphlet.thumbnailUrl || mainPamphlet.pages[0]} 
                                    className="w-full h-full object-cover rounded-r-sm md:rounded-r-2xl book-cover border-l-2 md:border-l-[6px] border-slate-200"
                                    alt={`${mainPamphlet.title} Cover`}
                                    loading="eager"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold uppercase text-[10px]">No Cover</div>
                             )}
                             <div className="absolute top-0 bottom-0 left-0 w-0.5 md:w-1.5 bg-gradient-to-r from-slate-300 to-slate-100"></div>
                             <div className="absolute bottom-2 md:bottom-6 left-0 right-0 text-center bg-black/80 text-white py-1 md:py-3">
                                <span className="text-[7px] md:text-sm font-black uppercase tracking-[0.2em] block truncate px-2">{mainPamphlet.title}</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="w-full bg-white pt-10 pb-6 text-center border-b border-slate-100">
            <h2 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-[0.2em] inline-block px-10 pb-2 relative">
                Featured Brands
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-blue-600 rounded-full"></div>
            </h2>
      </div>

      <div className="flex-1 p-4 md:p-12 max-w-[1700px] mx-auto w-full flex flex-col gap-10">
        <div className="flex-1 flex flex-col gap-12">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-6 w-full place-items-center">
              {visibleBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onSelectBrand(brand)}
                  className="group flex flex-col items-center justify-center w-full max-w-[130px] p-1.5 md:p-4 bg-white rounded-3xl shadow-sm hover:shadow-[0_15px_35px_rgba(37,99,235,0.08)] transition-all duration-500 border border-slate-100 hover:border-blue-200 hover:-translate-y-1 aspect-square"
                  title={brand.name}
                >
                  <div className="relative w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl} 
                        alt={brand.name} 
                        loading="lazy"
                        className="w-full h-full object-contain transition-all duration-500 p-1 md:p-3"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-lg md:text-3xl font-black transition-all duration-500 border-2 border-dashed border-slate-200 group-hover:border-transparent">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {hasMoreBrands && (
                <button
                  onClick={() => setShowAllBrands(true)}
                  className="group flex flex-col items-center justify-center w-full max-w-[130px] p-1.5 md:p-4 bg-slate-50 rounded-3xl shadow-sm hover:shadow-[0_15px_35px_rgba(37,99,235,0.08)] transition-all duration-500 border border-slate-200 hover:border-blue-500 hover:-translate-y-1 aspect-square"
                >
                   <div className="relative flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-105">
                       <Grid size={24} className="text-slate-400 group-hover:text-blue-600 mb-1" />
                       <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-700">All Brands</span>
                   </div>
                </button>
              )}
            </div>

            {deviceType !== 'mobile' && ads && (
                <div className="grid grid-cols-2 gap-6 mt-12 w-full">
                    <AdUnit items={ads.homeBottomLeft} className="aspect-[2.2/1] w-full" />
                    <AdUnit items={ads.homeBottomRight} className="aspect-[2.2/1] w-full" />
                </div>
            )}
        </div>
      </div>

      {showAllBrands && (
        <div className="fixed inset-0 z-[60] bg-white/98 p-6 md:p-20 animate-fade-in flex flex-col backdrop-blur-sm">
            <div className="flex justify-between items-center mb-12 shrink-0 max-w-7xl mx-auto w-full">
                <div>
                   <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                      <Grid className="text-blue-600" size={40} /> All Brands
                   </h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">Full manufacturer directory</p>
                </div>
                <button 
                  onClick={() => setShowAllBrands(false)}
                  className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 p-4 rounded-full transition-all duration-300 shadow-sm"
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
                      className="group flex flex-col items-center justify-center w-full p-2 md:p-4 transition-all duration-500 hover:-translate-y-1.5 rounded-3xl hover:bg-blue-50 border border-transparent hover:border-blue-100"
                      title={brand.name}
                    >
                      <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center transition-all duration-500 group-hover:scale-110 mb-3">
                        {brand.logoUrl ? (
                          <img 
                            src={brand.logoUrl} 
                            alt={brand.name} 
                            loading="lazy"
                            className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-lg"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-100 text-slate-300 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-xl font-black transition-all duration-500 shadow-inner">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] md:text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-900 truncate w-full text-center transition-colors px-1">{brand.name}</span>
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
