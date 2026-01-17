
import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, VolumeX, Clock as ClockIcon } from 'lucide-react';

interface ScreensaverProps {
  products: FlatProduct[];
  ads: AdItem[];
  pamphlets?: Catalogue[];
  onWake: () => void;
  settings?: ScreensaverSettings;
  isAudioUnlocked?: boolean; 
}

interface PlaylistItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  dateAdded?: string;
}

// Clock Widget Component
const ClockWidget = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="absolute top-8 right-8 z-[60] bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl animate-fade-in">
            <ClockIcon className="text-blue-400" size={20} />
            <div className="text-white font-mono font-bold text-xl tracking-widest">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
};

// Internal Slide Component - Handles Media Loading & Playback
const Slide = memo(({ 
    item, 
    isMuted, 
    isActive, // Used for audio control mostly
    onReady, 
    onError, 
    onVideoEnd, 
    objectFit,
    animationStyle,
    forceKenBurns
}: { 
    item: PlaylistItem; 
    isMuted: boolean; 
    isActive: boolean;
    onReady: () => void; 
    onError: () => void; 
    onVideoEnd: () => void; 
    objectFit: string;
    animationStyle: 'random' | 'cinematic' | 'pulse' | 'static';
    forceKenBurns: boolean;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [animEffect, setAnimEffect] = useState('');
    const [hasReadyFired, setHasReadyFired] = useState(false);

    useEffect(() => {
        // Animation Pools
        const cinematicEffects = ['effect-smooth-zoom', 'effect-subtle-drift', 'effect-gentle-pan', 'effect-slide-pan', 'effect-hard-zoom'];
        const pulseEffects = ['effect-heartbeat', 'effect-glow', 'effect-soft-scale'];
        // Default random is everything except static
        const randomEffects = [...cinematicEffects, ...pulseEffects];

        let selectedEffect = '';

        if (item.type === 'image') {
            if (forceKenBurns) {
                // Ken Burns overrides everything to cinematic
                selectedEffect = cinematicEffects[Math.floor(Math.random() * cinematicEffects.length)];
            } else {
                switch (animationStyle) {
                    case 'cinematic':
                        selectedEffect = cinematicEffects[Math.floor(Math.random() * cinematicEffects.length)];
                        break;
                    case 'pulse':
                        selectedEffect = pulseEffects[Math.floor(Math.random() * pulseEffects.length)];
                        break;
                    case 'static':
                        selectedEffect = ''; // No animation
                        break;
                    case 'random':
                    default:
                        selectedEffect = randomEffects[Math.floor(Math.random() * randomEffects.length)];
                        break;
                }
            }
            setAnimEffect(selectedEffect);
        } else {
            setAnimEffect('effect-fade-in');
        }
        setHasReadyFired(false);
    }, [item.id, animationStyle, forceKenBurns]);

    const handleReady = useCallback(() => {
        if (!hasReadyFired) {
            setHasReadyFired(true);
            onReady();
        }
    }, [hasReadyFired, onReady]);

    useEffect(() => {
        if (item.type === 'video' && videoRef.current) {
            // Firefox Fix: Explicitly load to reset decoder state
            videoRef.current.load();
            videoRef.current.muted = isMuted;
            
            const attemptPlay = () => {
                if(!videoRef.current) return;
                const p = videoRef.current.play();
                if (p) {
                    p.catch(e => {
                        console.warn("Autoplay blocked/failed", e);
                        // Fallback to muted if failed (though we likely already muted)
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            videoRef.current.play().catch(() => {});
                        }
                    });
                }
            };
            
            // Slight delay to ensure DOM is ready
            setTimeout(attemptPlay, 50);
        }
    }, [item.type, isMuted, item.id]); 

    if (item.type === 'video') {
        return (
            <video 
                ref={videoRef}
                src={item.url}
                className={`w-full h-full ${objectFit} ${isActive ? animEffect : ''}`}
                muted={isMuted}
                playsInline
                preload="auto"
                onCanPlay={handleReady} 
                onLoadedData={handleReady} // Backup trigger
                onEnded={onVideoEnd}
                onError={(e) => { console.warn("Video Error", e); onError(); }}
                onStalled={() => { 
                    // If stalled for too long and active, force next. 
                    // If loading, the parent watchdog will catch it.
                    console.warn("Video Stalled");
                }}
                loop={false} 
            />
        );
    }

    return (
        <img 
            src={item.url}
            alt="Screensaver"
            className={`w-full h-full ${objectFit} ${isActive ? animEffect : ''}`}
            loading="eager"
            onLoad={handleReady} 
            onError={onError}
        />
    );
});

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings, isAudioUnlocked = false }) => {
  // Config
  const config: ScreensaverSettings = useMemo(() => ({
      idleTimeout: 60,
      imageDuration: 8,
      muteVideos: false,
      showProductImages: true,
      showProductVideos: true,
      showPamphlets: true,
      showCustomAds: true,
      displayStyle: 'contain', 
      showInfoOverlay: true,
      enableSleepMode: false,
      activeHoursStart: '08:00',
      activeHoursEnd: '20:00',
      animationStyle: 'random',
      enableKenBurns: false,
      transitionType: 'fade',
      textGlow: false,
      showClock: false,
      textAlignment: 'left',
      fontFamily: 'sans',
      fontSize: 'medium',
      ...settings
  }), [settings]);

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const playlistRef = useRef<PlaylistItem[]>([]); 
  
  // --- DOUBLE BUFFER STATE ---
  const [buffers, setBuffers] = useState<[PlaylistItem | null, PlaylistItem | null]>([null, null]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);

  // Timers
  const slideTimerRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const loadingWatchdogRef = useRef<number | null>(null);

  // 0. Cleanup Timers on Unmount
  useEffect(() => {
      return () => {
          if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      };
  }, []);

  // 1. Sleep Mode Check
  useEffect(() => {
      if (!config.enableSleepMode || !config.activeHoursStart || !config.activeHoursEnd) {
          setIsSleepMode(false);
          return;
      }
      const checkTime = () => {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const [startH, startM] = config.activeHoursStart!.split(':').map(Number);
          const [endH, endM] = config.activeHoursEnd!.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          let isActive = startMinutes < endMinutes 
              ? currentMinutes >= startMinutes && currentMinutes < endMinutes
              : currentMinutes >= startMinutes || currentMinutes < endMinutes;
          setIsSleepMode(!isActive);
      };
      checkTime();
      const interval = setInterval(checkTime, 60000);
      return () => clearInterval(interval);
  }, [config.activeHoursStart, config.activeHoursEnd, config.enableSleepMode]);

  // 2. Generate Playlist
  useEffect(() => {
    const list: PlaylistItem[] = [];
    const shouldIncludeItem = (dateString?: string): boolean => {
        if (!dateString) return true;
        const addedDate = new Date(dateString);
        const now = new Date();
        const monthsOld = (now.getFullYear() - addedDate.getFullYear()) * 12 + (now.getMonth() - addedDate.getMonth());
        return monthsOld < 6 || Math.random() < 0.25; 
    };

    if (config.showCustomAds) {
        ads.forEach((ad, i) => {
          if (shouldIncludeItem(ad.dateAdded)) {
            for(let c=0; c<3; c++) list.push({ id: `ad-${ad.id}-${i}-${c}`, type: ad.type, url: ad.url, title: "Sponsored", subtitle: "", dateAdded: ad.dateAdded });
          }
        });
    }
    if (config.showPamphlets) {
        pamphlets.forEach((pamphlet) => {
           if (pamphlet.pages?.[0] && (!pamphlet.endDate || shouldIncludeItem(pamphlet.startDate))) {
              list.push({ id: `pamphlet-${pamphlet.id}`, type: 'image', url: pamphlet.pages[0], title: pamphlet.title, subtitle: "Showcase Catalogue", startDate: pamphlet.startDate, endDate: pamphlet.endDate });
           }
        });
    }
    products.forEach((p) => {
        if (!shouldIncludeItem(p.dateAdded)) return;
        if (config.showProductImages && p.imageUrl) {
            list.push({ id: `prod-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name, dateAdded: p.dateAdded });
        }
        if (config.showProductVideos) {
            if (p.videoUrl) list.push({ id: `prod-vid-${p.id}`, type: 'video', url: p.videoUrl, title: p.brandName, subtitle: `${p.name} - Official Video`, dateAdded: p.dateAdded });
            p.videoUrls?.forEach((url, idx) => { if (url !== p.videoUrl) list.push({ id: `prod-vid-${p.id}-${idx}`, type: 'video', url: url, title: p.brandName, subtitle: `${p.name} - Video Showcase`, dateAdded: p.dateAdded }); });
        }
    });

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    setPlaylist(list);
    playlistRef.current = list;
  }, [products, ads, pamphlets, config]);

  // 3. Initialize Buffers
  useEffect(() => {
      if (playlist.length > 0 && (!buffers[0] && !buffers[1])) {
          setBuffers([playlist[0], null]);
          setActiveSlot(0);
          setCurrentPlaylistIndex(0);
          if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
          const duration = (config.imageDuration || 8) * 1000;
          if (playlist[0].type === 'image') {
              slideTimerRef.current = window.setTimeout(() => {}, duration);
          }
      }
  }, [playlist]);

  // 4. Scheduling Logic
  const prepareNextBuffer = useCallback(() => {
      if (isTransitioning) return; 
      
      const currentList = playlistRef.current;
      if (currentList.length === 0) return;

      let nextIdx = (currentPlaylistIndex + 1);
      if (nextIdx >= currentList.length) nextIdx = 0;

      const targetSlot = activeSlot === 0 ? 1 : 0; 

      // Load next item into the target buffer slot
      setBuffers(prev => {
          const newB = [...prev] as [PlaylistItem | null, PlaylistItem | null];
          newB[targetSlot] = currentList[nextIdx];
          return newB;
      });
      setCurrentPlaylistIndex(nextIdx);
  }, [activeSlot, currentPlaylistIndex, isTransitioning]);

  // WATCHDOG: Detect frozen loading
  useEffect(() => {
      // Find if we have a "pending" buffer (not null, but not active)
      const pendingSlot = buffers.findIndex((b, i) => b !== null && i !== activeSlot);
      
      if (pendingSlot !== -1) {
          // We are waiting for this slot to trigger onReady. Start watchdog.
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
          loadingWatchdogRef.current = window.setTimeout(() => {
              console.warn(`Screensaver: Buffer ${pendingSlot} load timed out (Firefox freeze?). Skipping.`);
              // Try next item
              prepareNextBuffer();
          }, 12000); // 12s max load time
      } else {
          // Nothing loading, clean up watchdog
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      }
      return () => { if(loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current); };
  }, [buffers, activeSlot, prepareNextBuffer]);

  const scheduleNextSlide = useCallback((currentItem: PlaylistItem | null) => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      if (!currentItem || playlistRef.current.length <= 1 || isSleepMode) return;

      const duration = (config.imageDuration || 8) * 1000;

      if (currentItem.type === 'image') {
          slideTimerRef.current = window.setTimeout(() => {
              prepareNextBuffer();
          }, duration);
      } else {
          // Video: Wait for 'onEnded', but set a watchdog just in case video decoder hangs
          slideTimerRef.current = window.setTimeout(() => {
              console.warn("Video watchdog: forcing next slide");
              prepareNextBuffer();
          }, 180000); 
      }
  }, [config.imageDuration, isSleepMode, prepareNextBuffer]);

  // 5. Kickstart Loop Effect
  useEffect(() => {
      if (playlist.length > 0 && !slideTimerRef.current && !isTransitioning && buffers[activeSlot]) {
          scheduleNextSlide(buffers[activeSlot]);
      }
  }, [playlist, activeSlot, isTransitioning, buffers, scheduleNextSlide]);


  const handleBufferReady = (slotIndex: number) => {
      // Only care if the ready signal comes from the INACTIVE slot
      if (slotIndex !== activeSlot && !isTransitioning && buffers[slotIndex]) {
          
          // Clear watchdog as we are successfully ready
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);

          setIsTransitioning(true);

          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
          
          transitionTimeoutRef.current = window.setTimeout(() => {
              setIsTransitioning(false);
              setActiveSlot(slotIndex as 0 | 1); 
              
              setBuffers(prev => {
                  const newB = [...prev] as [PlaylistItem | null, PlaylistItem | null];
                  const oldSlot = slotIndex === 0 ? 1 : 0;
                  newB[oldSlot] = null; // Clear old content
                  return newB;
              });

              scheduleNextSlide(buffers[slotIndex]);

          }, 1000); 
      }
  };

  const handleVideoEnded = () => {
      prepareNextBuffer();
  };

  if (isSleepMode) {
      return (
          <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm">Sleep Mode Active</div>
              </div>
          </div>
      );
  }

  if (playlist.length === 0) return null;

  const currentItem = buffers[activeSlot];
  const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';

  // Dynamic Text Styles
  const alignClass = config.textAlignment === 'center' ? 'text-center items-center left-0 right-0 max-w-[90%] mx-auto' 
                   : config.textAlignment === 'right' ? 'text-right items-end right-10 md:right-20 left-auto max-w-[70%]' 
                   : 'text-left items-start left-10 md:left-20 max-w-[70%]'; // Default left
  
  const fontClass = config.fontFamily === 'serif' ? 'font-serif' : config.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  
  const sizeClassTitle = config.fontSize === 'small' ? 'text-xl md:text-3xl' 
                       : config.fontSize === 'large' ? 'text-4xl sm:text-6xl md:text-8xl' 
                       : 'text-2xl sm:text-3xl md:text-5xl'; // Medium default
  
  const sizeClassSub = config.fontSize === 'small' ? 'text-[10px] md:text-sm' 
                     : config.fontSize === 'large' ? 'text-sm md:text-2xl' 
                     : 'text-xs md:text-xl'; // Medium default

  const glowClass = config.textGlow ? 'drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]' : 'drop-shadow-2xl';

  return (
    <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer overflow-hidden select-none">
        <style>{`
            .slide-layer { position: absolute; inset: 0; }
            
            /* ORIGINAL EFFECTS */
            .effect-smooth-zoom { animation: smoothZoom 15s ease-out forwards; }
            @keyframes smoothZoom { 0% { transform: scale(1.0); } 100% { transform: scale(1.1); } }
            
            .effect-subtle-drift { animation: subtleDrift 20s linear forwards; }
            @keyframes subtleDrift { 0% { transform: scale(1.05) translate(-1%, -1%); } 100% { transform: scale(1.05) translate(1%, 1%); } }
            
            .effect-soft-scale { animation: softScale 20s ease-out forwards; }
            @keyframes softScale { 0% { transform: scale(1.0); } 100% { transform: scale(1.05); } }

            .effect-gentle-pan { animation: gentlePan 20s ease-in-out alternate; }
            @keyframes gentlePan { 0% { transform: scale(1.1) translate(-2%, 0); } 100% { transform: scale(1.1) translate(2%, 0); } }

            /* NEW EXPANDED LIBRARY */
            .effect-heartbeat { animation: heartbeat 15s ease-in-out infinite; }
            @keyframes heartbeat { 
                0% { transform: scale(1); } 
                50% { transform: scale(1.05); } 
                100% { transform: scale(1); } 
            }

            .effect-glow { animation: glowPulse 8s ease-in-out infinite alternate; }
            @keyframes glowPulse {
                0% { filter: brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0)); transform: scale(1); }
                100% { filter: brightness(1.15) drop-shadow(0 0 20px rgba(255,255,255,0.2)); transform: scale(1.02); }
            }

            .effect-hard-zoom { animation: hardZoom 18s linear forwards; }
            @keyframes hardZoom { 0% { transform: scale(1); } 100% { transform: scale(1.35); } }

            .effect-slide-pan { animation: slidePan 25s linear infinite alternate; }
            @keyframes slidePan {
                0% { transform: scale(1.1) translate(-5%, -2%); }
                100% { transform: scale(1.1) translate(5%, 2%); }
            }

            /* VIDEO & UI EFFECTS */
            .effect-fade-in { animation: fadeInVideo 1s ease-out forwards; }
            @keyframes fadeInVideo { from { opacity: 0; } to { opacity: 1; } }
            
            .info-slide-up { animation: infoSlideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
            @keyframes infoSlideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        `}</style>

        {config.showClock && <ClockWidget />}

        {/* Render Both Buffers */}
        {[0, 1].map((slotIdx) => {
            const item = buffers[slotIdx];
            const isActive = activeSlot === slotIdx;
            
            let layerClass = "";
            if (config.transitionType === 'slide') {
                if (isActive) {
                    layerClass = "z-10 translate-x-0 transition-none"; 
                } else {
                    if (isTransitioning) {
                        // Incoming slide
                        layerClass = "z-20 translate-x-0 transition-transform duration-1000 ease-in-out";
                    } else {
                        // Resting state off-screen
                        layerClass = "z-20 translate-x-full transition-none";
                    }
                }
            } else {
                // FADE (Default)
                if (isActive) {
                    layerClass = "z-10 opacity-100 transition-none"; 
                } else {
                    if (isTransitioning) {
                        layerClass = "z-20 opacity-100 transition-opacity duration-1000 ease-in-out";
                    } else {
                        layerClass = "z-20 opacity-0 transition-none";
                    }
                }
            }

            if (!item) return null;

            return (
                <div key={`slot-${slotIdx}`} className={`slide-layer ${layerClass}`}>
                    <div 
                        className="absolute inset-0 z-0 opacity-40 blur-[60px] scale-110 transition-all duration-1000"
                        style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
                    
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 md:p-12">
                        <Slide 
                            item={item}
                            isActive={isActive}
                            isMuted={config.muteVideos || !isAudioUnlocked}
                            onReady={() => handleBufferReady(slotIdx)}
                            onError={() => prepareNextBuffer()} 
                            onVideoEnd={() => { if(isActive) handleVideoEnded(); }}
                            objectFit={objectFitClass}
                            animationStyle={config.animationStyle || 'random'}
                            forceKenBurns={!!config.enableKenBurns}
                        />
                    </div>

                    {config.showInfoOverlay && (item.title || item.subtitle) && (
                        <div className={`absolute bottom-12 md:bottom-20 z-30 pointer-events-none flex flex-col ${alignClass} ${fontClass}`}>
                            {item.title && (
                                <div className={isActive ? "info-slide-up" : ""}>
                                    <h1 className={`${sizeClassTitle} font-black text-white uppercase tracking-tighter mb-2 leading-tight ${glowClass}`}>
                                        {item.title}
                                    </h1>
                                    <div className="h-1.5 w-20 bg-blue-600 mt-2 mb-4 rounded-full shadow-lg shadow-blue-600/50"></div>
                                </div>
                            )}
                            {item.subtitle && (
                                <div className={`bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-2xl w-fit shadow-2xl ${isActive ? "info-slide-up" : ""}`}>
                                    <p className={`${sizeClassSub} text-white font-black uppercase tracking-[0.2em] ${config.textGlow ? 'animate-pulse' : ''}`}>
                                        {item.subtitle}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        })}

        {currentItem && !config.muteVideos && !isAudioUnlocked && currentItem.type === 'video' && (
             <div className="absolute top-8 left-8 z-[50] bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/50 animate-pulse pointer-events-none">
                 <VolumeX size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Muted</span>
             </div>
        )}
    </div>
  );
};

export default memo(Screensaver);
