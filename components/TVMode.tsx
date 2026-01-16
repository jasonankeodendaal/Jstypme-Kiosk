
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StoreData, TVBrand, TVModel, FlatProduct } from '../types';
import { Play, Tv, ArrowLeft, ChevronLeft, ChevronRight, Pause, RotateCcw, MonitorPlay, MonitorStop, Film, LayoutGrid, SkipForward, Monitor, PlayCircle, Info, VolumeX, Loader2, Image as ImageIcon, ShoppingBag } from 'lucide-react';

interface TVModeProps {
  storeData: StoreData;
  onRefresh: () => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  isAudioUnlocked: boolean;
}

interface TVPlaylistItem {
    id: string;
    url: string;
    type: 'video' | 'image';
    title: string;
    subtitle?: string;
    duration?: number; // duration in seconds (for images)
}

const TVMode: React.FC<TVModeProps> = ({ storeData, onRefresh, screensaverEnabled, onToggleScreensaver, isAudioUnlocked }) => {
  const [viewingBrand, setViewingBrand] = useState<TVBrand | null>(null);
  
  const [activePlaylist, setActivePlaylist] = useState<TVPlaylistItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isPaused, setIsPaused] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  // Image Timer State
  const [imageProgress, setImageProgress] = useState(0);

  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<number | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const imageTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const tvBrands = storeData.tv?.brands || [];

  // Flatten Inventory for "Filler" content (Product Images)
  const allProductFillers = useMemo(() => {
      const fillers: TVPlaylistItem[] = [];
      
      // 1. Add Configured Ads (Screensaver mixed media)
      if (storeData.ads?.screensaver) {
          storeData.ads.screensaver.forEach(ad => {
              fillers.push({
                  id: `ad-${ad.id}`,
                  url: ad.url,
                  type: ad.type, // Can be 'video' or 'image'
                  title: 'Sponsored Content',
                  subtitle: 'Commercial Break',
                  duration: 10
              });
          });
      }

      // 2. Add Random Products
      storeData.brands.forEach(b => {
          b.categories.forEach(c => {
              c.products.forEach(p => {
                  if (p.imageUrl) {
                      fillers.push({
                          id: `prod-${p.id}`,
                          url: p.imageUrl,
                          type: 'image',
                          title: p.name,
                          subtitle: `Featured: ${b.name}`,
                          duration: 10
                      });
                  }
              });
          });
      });

      return fillers;
  }, [storeData]);

  const generateMixedPlaylist = (sourceVideos: { url: string, title: string, subtitle: string }[]) => {
      if (sourceVideos.length === 0) return [];

      // Shuffle Fillers
      const fillers = [...allProductFillers];
      for (let i = fillers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [fillers[i], fillers[j]] = [fillers[j], fillers[i]];
      }

      const playlist: TVPlaylistItem[] = [];
      let videoCounter = 0;
      let fillerIndex = 0;

      sourceVideos.forEach((vid, idx) => {
          // Add TV Video
          playlist.push({
              id: `tv-${idx}-${Date.now()}`,
              url: vid.url,
              type: 'video',
              title: vid.title,
              subtitle: vid.subtitle
          });

          videoCounter++;

          // Inject Filler every 2 videos
          if (videoCounter % 2 === 0 && fillers.length > 0) {
              const filler = fillers[fillerIndex % fillers.length];
              // Clone to ensure unique ID if reused
              playlist.push({ ...filler, id: `filler-${idx}-${Date.now()}` });
              fillerIndex++;
          }
      });

      return playlist;
  };

  const handleUserActivity = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => setShowControls(false), 4000);
  };

  useEffect(() => {
      if (isPlaying) {
          window.addEventListener('mousemove', handleUserActivity);
          window.addEventListener('touchstart', handleUserActivity);
          window.addEventListener('keydown', handleUserActivity);
          handleUserActivity();
      }
      return () => {
          window.removeEventListener('mousemove', handleUserActivity);
          window.removeEventListener('touchstart', handleUserActivity);
          window.removeEventListener('keydown', handleUserActivity);
          if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      };
  }, [isPlaying]);

  const startPlaylist = (list: TVPlaylistItem[], startIndex: number = 0) => {
      setActivePlaylist(list);
      setCurrentVideoIndex(startIndex);
      setIsPlaying(true);
      setIsPaused(false);
      setImageProgress(0);
  };

  const handlePlayGlobal = () => {
      if (tvBrands.length === 0) return;
      const allVideos = tvBrands.flatMap(b => (b.models || []).flatMap(m => (m.videoUrls || []).map(url => ({
          url,
          title: m.name,
          subtitle: b.name
      }))));
      
      // Shuffle Videos First
      for (let i = allVideos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allVideos[i], allVideos[j]] = [allVideos[j], allVideos[i]];
      }

      startPlaylist(generateMixedPlaylist(allVideos));
  };

  const handlePlayModel = (model: TVModel, brandName: string) => {
      if (!model.videoUrls?.length) return;
      const videos = model.videoUrls.map(url => ({ url, title: model.name, subtitle: brandName }));
      // For single model, we might still want ads if list is long, but usually less frequent.
      // Using standard generator for consistency.
      startPlaylist(generateMixedPlaylist(videos));
  };

  const handlePlayBrandLoop = (brand: TVBrand) => {
      const allBrandVideos = (brand.models || []).flatMap(m => (m.videoUrls || []).map(url => ({
          url,
          title: m.name,
          subtitle: brand.name
      })));
      startPlaylist(generateMixedPlaylist(allBrandVideos));
  };

  const skipToNext = () => {
      setImageProgress(0);
      const nextIndex = (currentVideoIndex + 1) % activePlaylist.length;
      
      // Reset Video Element if looping to self (rare but possible in 1-item lists)
      if (nextIndex === currentVideoIndex && activePlaylist[currentVideoIndex].type === 'video') {
          if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
          }
      } else {
          setCurrentVideoIndex(nextIndex);
      }
  };

  const currentItem = activePlaylist[currentVideoIndex];

  // --- IMAGE DURATION CONTROLLER ---
  useEffect(() => {
      // Clear previous timers
      if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setImageProgress(0);

      if (isPlaying && currentItem && currentItem.type === 'image' && !isPaused) {
          const duration = (currentItem.duration || 10) * 1000;
          const step = 100; // Update every 100ms
          let elapsed = 0;

          // Progress Bar Interval
          progressIntervalRef.current = window.setInterval(() => {
              elapsed += step;
              setImageProgress((elapsed / duration) * 100);
          }, step);

          // Skip Trigger
          imageTimerRef.current = window.setTimeout(() => {
              skipToNext();
          }, duration);
      }

      return () => {
          if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
  }, [currentVideoIndex, isPlaying, isPaused, currentItem]);

  // --- VIDEO WATCHDOG & AUTOPLAY ---
  useEffect(() => {
    if (isPlaying && currentItem?.type === 'video') {
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
        // Video fallback if onEnded never fires (stuck buffer)
        watchdogRef.current = window.setTimeout(() => {
            console.warn("TV Mode Watchdog Triggered");
            skipToNext();
        }, 120000); 

        // AutoPlay Logic
        if (videoRef.current) {
            setIsLoading(true);
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPaused(false);
                    setIsLoading(false);
                }).catch((error) => {
                    console.warn("Autoplay blocked. Retrying muted.", error);
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(e => console.error("Playback failed", e));
                    }
                });
            }
        }
    }
    return () => { if (watchdogRef.current) clearTimeout(watchdogRef.current); };
  }, [currentVideoIndex, isPlaying, currentItem]);

  const handleVideoEnded = () => {
      skipToNext();
  };

  const handleNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      skipToNext();
  };

  const handlePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      const prevIndex = (currentVideoIndex - 1 + activePlaylist.length) % activePlaylist.length;
      setCurrentVideoIndex(prevIndex);
  };
  
  const handleVideoError = () => {
      console.error("Source error on item:", currentItem.url);
      setTimeout(skipToNext, 2000);
  }

  const exitPlayer = () => {
      setIsPlaying(false);
      setActivePlaylist([]);
  };

  // Preload next item
  const nextItem = activePlaylist.length > 0 
      ? activePlaylist[(currentVideoIndex + 1) % activePlaylist.length] 
      : null;

  // --- RENDER FULLSCREEN PLAYER ---
  if (isPlaying && currentItem) {
      return (
          <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center overflow-hidden group cursor-none">
              
              {/* HIDDEN PRELOADER (Supports Image and Video) */}
              {nextItem && nextItem.url !== currentItem.url && (
                  <div className="absolute w-0 h-0 opacity-0 pointer-events-none">
                      {nextItem.type === 'video' ? (
                          <video src={nextItem.url} preload="auto" muted playsInline />
                      ) : (
                          <img src={nextItem.url} loading="eager" />
                      )}
                  </div>
              )}

              {/* ACTIVE CONTENT RENDERER */}
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                  {currentItem.type === 'video' ? (
                      <video 
                          key={`vid-${currentItem.id}`} 
                          ref={videoRef}
                          src={currentItem.url} 
                          className="w-full h-full object-contain"
                          autoPlay
                          playsInline
                          muted={!isAudioUnlocked}
                          onEnded={handleVideoEnded}
                          onError={handleVideoError}
                          onPlay={() => { setIsPaused(false); setIsLoading(false); }}
                          onPause={() => setIsPaused(true)}
                          onLoadStart={() => setIsLoading(true)}
                          onCanPlay={() => setIsLoading(false)}
                      />
                  ) : (
                      <div className="relative w-full h-full animate-fade-in">
                          <div className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110" style={{ backgroundImage: `url(${currentItem.url})`}}></div>
                          <img 
                              key={`img-${currentItem.id}`}
                              src={currentItem.url}
                              className="w-full h-full object-contain relative z-10"
                              onLoad={() => setIsLoading(false)}
                              onError={handleVideoError}
                              alt="TV Content"
                          />
                          {/* Image Duration Progress Bar */}
                          <div className="absolute bottom-0 left-0 h-1.5 bg-blue-600 z-20 transition-all ease-linear" style={{ width: `${imageProgress}%`, transitionDuration: '100ms' }}></div>
                      </div>
                  )}
              </div>
              
              {/* BUFFERING INDICATOR */}
              {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                      <div className="flex flex-col items-center gap-4">
                          <Loader2 size={48} className="text-blue-500 animate-spin" />
                          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Loading Content...</span>
                      </div>
                  </div>
              )}

              {/* OVERLAY CONTROLS */}
              <div className={`absolute inset-0 flex flex-col justify-between p-4 md:p-8 transition-opacity duration-300 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-40 ${showControls ? 'opacity-100 pointer-events-auto cursor-auto' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex justify-between items-start">
                      <button onClick={exitPlayer} className="bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full border border-white/10 backdrop-blur-md">
                          <ArrowLeft size={24} className="md:w-8 md:h-8" />
                      </button>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 text-center shadow-lg">
                            <h2 className="text-white font-black uppercase tracking-widest text-sm md:text-xl leading-none mb-1">{currentItem.title}</h2>
                            <div className="text-blue-400 text-[10px] md:text-xs font-bold uppercase flex items-center justify-center gap-2">
                                {currentItem.type === 'image' ? <ImageIcon size={12} /> : <Film size={12} />} 
                                {currentItem.subtitle || 'TV Loop'}
                            </div>
                        </div>
                        
                        {/* Audio Warning */}
                        {currentItem.type === 'video' && !isAudioUnlocked && (
                            <div className="bg-orange-500/80 backdrop-blur-md px-4 py-1.5 rounded-lg border border-orange-400 flex items-center gap-2 animate-pulse shadow-lg">
                                <VolumeX size={14} className="text-white" />
                                <span className="text-white font-black text-[9px] uppercase tracking-wider">Sound Muted</span>
                            </div>
                        )}
                      </div>
                  </div>
                  
                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-8 md:gap-16">
                      <button onClick={handlePrev} className="p-4 md:p-6 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 group backdrop-blur-sm">
                          <ChevronLeft size={32} className="md:w-12 md:h-12 group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => {
                            if (currentItem.type === 'video' && videoRef.current) {
                                if (isPaused) videoRef.current.play().catch(() => {});
                                else videoRef.current.pause();
                            } else {
                                setIsPaused(!isPaused); // Toggle pause for image timer
                            }
                        }} 
                        className="p-6 md:p-8 bg-white text-black rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform flex items-center justify-center"
                      >
                          {isPaused ? <Play size={40} fill="currentColor" className="ml-2 md:w-12 md:h-12" /> : <Pause size={40} fill="currentColor" className="md:w-12 md:h-12" />}
                      </button>
                      <button onClick={handleNext} className="p-4 md:p-6 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 group backdrop-blur-sm">
                          <ChevronRight size={32} className="md:w-12 md:h-12 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <div className="text-white text-xs font-mono font-bold bg-black/50 px-2 py-1 rounded">{currentVideoIndex + 1} / {activePlaylist.length}</div>
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                           <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentVideoIndex + 1) / activePlaylist.length) * 100}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- MENU INTERFACE (Grid View) ---
  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col animate-fade-in overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 z-0 pointer-events-none"></div>
        
        <header className="relative z-10 p-6 md:p-10 flex items-center justify-between border-b border-white/5 shrink-0 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {viewingBrand ? (
                    <button 
                        onClick={() => setViewingBrand(null)}
                        className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors border border-white/10 group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20">
                        <Tv size={32} className="text-white" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-none drop-shadow-lg">
                        {viewingBrand ? viewingBrand.name : 'TV Mode'}
                    </h1>
                    <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-wide mt-1">
                        {viewingBrand ? `Explore ${viewingBrand.models.length} Models` : 'Select Channel or Global Loop'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {viewingBrand ? (
                    <button 
                        onClick={() => handlePlayBrandLoop(viewingBrand)}
                        className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg border border-blue-400/20"
                    >
                        <Play size={20} fill="currentColor" /> Play Brand Loop
                    </button>
                ) : (
                    <button 
                        onClick={handlePlayGlobal}
                        className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg border border-white/20"
                    >
                        <SkipForward size={20} fill="currentColor" /> Play Global Loop
                    </button>
                )}
                <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
                <button onClick={onToggleScreensaver} className={`p-3 rounded-xl border transition-colors hidden md:block ${screensaverEnabled ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                   {screensaverEnabled ? <MonitorPlay size={20} /> : <MonitorStop size={20} />}
                </button>
            </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
            {viewingBrand ? (
                // Models View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {viewingBrand.models.map((model) => (
                        <div 
                            key={model.id}
                            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all group flex flex-col"
                        >
                            <div className="aspect-video relative overflow-hidden bg-slate-950">
                                {model.imageUrl ? (
                                    <img src={model.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt={model.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-800">
                                        <Monitor size={80} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                <button 
                                    onClick={() => handlePlayModel(model, viewingBrand.name)}
                                    className="absolute bottom-4 right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <Play size={24} fill="currentColor" />
                                </button>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{model.name}</h3>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">
                                        {model.videoUrls.length} Video Clips
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handlePlayModel(model, viewingBrand.name)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/10"
                                        >
                                            Play Sequence
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {viewingBrand.models.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30">
                            <Monitor size={80} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-widest">No Models Available</p>
                        </div>
                    )}
                </div>
            ) : (
                // Brands View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                    {tvBrands.map((brand) => (
                        <button 
                            key={brand.id} 
                            onClick={() => setViewingBrand(brand)} 
                            className="group bg-slate-800/50 border border-white/5 rounded-3xl aspect-video md:aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:-translate-y-2"
                        >
                            <div className="w-full h-full p-8 flex items-center justify-center relative z-10">
                                {brand.logoUrl ? (
                                    <img src={brand.logoUrl} className="max-w-full max-h-full object-contain filter drop-shadow-xl transition-transform duration-500 group-hover:scale-110" alt={brand.name} />
                                ) : (
                                    <Tv size={64} className="text-slate-600" />
                                )}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
                                <div className="text-left">
                                    <h3 className="text-white font-black uppercase tracking-wider text-sm md:text-base leading-none mb-1 group-hover:text-blue-400 transition-colors">{brand.name}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                                        <Monitor size={10} /> {brand.models?.length || 0} Models
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </button>
                    ))}
                    {tvBrands.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30">
                            <Tv size={80} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-widest">No Brands Configured</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default TVMode;
