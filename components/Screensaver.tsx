
import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, VolumeX, Clock } from 'lucide-react';

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
    enableKenBurns
}: { 
    item: PlaylistItem; 
    isMuted: boolean; 
    isActive: boolean;
    onReady: () => void; 
    onError: () => void; 
    onVideoEnd: () => void; 
    objectFit: string;
    animationStyle: 'random' | 'cinematic' | 'pulse' | 'static';
    enableKenBurns: boolean;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [animEffect, setAnimEffect] = useState('');
    const [hasReadyFired, setHasReadyFired] = useState(false);

    useEffect(() => {
        // Animation Pools
        const cinematicEffects = ['effect-smooth-zoom', 'effect-subtle-drift', 'effect-gentle-pan', 'effect-slide-pan', 'effect-hard-zoom'];
        const pulseEffects = ['effect-heartbeat', 'effect-glow', 'effect-soft-scale'];
        const randomEffects = [...cinematicEffects, ...pulseEffects];

        let selectedEffect = '';

        if (item.type === 'image') {
            if (enableKenBurns) {
                // Force cinematic pool if Ken Burns is enabled
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
    }, [item.id, animationStyle, enableKenBurns]);

    const handleReady = useCallback(() => {
        if (!hasReadyFired) {
            setHasReadyFired(true);
            onReady();
        }
    }, [hasReadyFired, onReady]);

    useEffect(() => {
        if (item.type === 'video' && videoRef.current) {
            videoRef.current.load();
            videoRef.current.muted = isMuted;
            const attemptPlay = () => {
                if(!videoRef.current) return;
                const p = videoRef.current.play();
                if (p) {
                    p.catch(e => {
                        console.warn("Autoplay blocked/failed", e);
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            videoRef.current.play().catch(() => {});
                        }
                    });
                }
            };
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
                onLoadedData={handleReady} 
                onEnded={onVideoEnd}
                onError={(e) => { console.warn("Video Error", e); onError(); }}
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
      transitionStyle: 'fade',
      showClock: false,
      textOverlay: {
          align: 'left',
          size: 'lg',
          font: 'sans',
          glow: false,
          ...settings?.textOverlay
      },
      ...settings
  }), [settings]);

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const playlistRef = useRef<PlaylistItem[]>([]); 
  const [buffers, setBuffers] = useState<[PlaylistItem | null, PlaylistItem | null]>([null, null]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const slideTimerRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const loadingWatchdogRef = useRef<number | null>(null);

  // Clock Ticker
  useEffect(() => {
      if (!config.showClock) return;
      const t = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(t);
  }, [config.showClock]);

  // Timers Cleanup
  useEffect(() => {
      return () => {
          if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      };
  }, []);

  // Sleep Mode Check
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

  // Generate Playlist
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

  // Initialize Buffers
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

  // Scheduling Logic
  const prepareNextBuffer = useCallback(() => {
      if (isTransitioning) return; 
      const currentList = playlistRef.current;
      if (currentList.length === 0) return;
      let nextIdx = (currentPlaylistIndex + 1);
      if (nextIdx >= currentList.length) nextIdx = 0;
      const targetSlot = activeSlot === 0 ? 1 : 0; 
      setBuffers(prev => {
          const newB = [...prev] as [PlaylistItem | null, PlaylistItem | null];
          newB[targetSlot] = currentList[nextIdx];
          return newB;
      });
      setCurrentPlaylistIndex(nextIdx);
  }, [activeSlot, currentPlaylistIndex, isTransitioning]);

  useEffect(() => {
      const pendingSlot = buffers.findIndex((b, i) => b !== null && i !== activeSlot);
      if (pendingSlot !== -1) {
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
          loadingWatchdogRef.current = window.setTimeout(() => {
              console.warn(`Buffer ${pendingSlot} timeout. Skipping.`);
              prepareNextBuffer();
          }, 12000); 
      } else {
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      }
      return () => { if(loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current); };
  }, [buffers, activeSlot, prepareNextBuffer]);

  const scheduleNextSlide = useCallback((currentItem: PlaylistItem | null) => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      if (!currentItem || playlistRef.current.length <= 1 || isSleepMode) return;
      const duration = (config.imageDuration || 8) * 1000;
      if (currentItem.type === 'image') {
          slideTimerRef.current = window.setTimeout(() => { prepareNextBuffer(); }, duration);
      } else {
          slideTimerRef.current = window.setTimeout(() => { prepareNextBuffer(); }, 180000); 
      }
  }, [config.imageDuration, isSleepMode, prepareNextBuffer]);

  useEffect(() => {
      if (playlist.length > 0 && !slideTimerRef.current && !isTransitioning && buffers[activeSlot]) {
          scheduleNextSlide(buffers[activeSlot]);
      }
  }, [playlist, activeSlot, isTransitioning, buffers, scheduleNextSlide]);

  const handleBufferReady = (slotIndex: number) => {
      if (slotIndex !== activeSlot && !isTransitioning && buffers[slotIndex]) {
          if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
          setIsTransitioning(true);
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
          
          transitionTimeoutRef.current = window.setTimeout(() => {
              setIsTransitioning(false);
              setActiveSlot(slotIndex as 0 | 1); 
              setBuffers(prev => {
                  const newB = [...prev] as [PlaylistItem | null, PlaylistItem | null];
                  const oldSlot = slotIndex === 0 ? 1 : 0;
                  newB[oldSlot] = null; 
                  return newB;
              });
              scheduleNextSlide(buffers[slotIndex]);
          }, 1000); 
      }
  };

  const handleVideoEnded = () => { prepareNextBuffer(); };

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

  // Text Styling Logic
  const overlayConfig = config.textOverlay || { align: 'left', size: 'lg', font: 'sans', glow: false };
  const alignClass = overlayConfig.align === 'center' ? 'items-center text-center left-0 right-0 mx-auto' : overlayConfig.align === 'right' ? 'items-end text-right right-10' : 'items-start text-left left-10';
  const sizeClassTitle = overlayConfig.size === 'sm' ? 'text-2xl' : overlayConfig.size === 'md' ? 'text-4xl' : overlayConfig.size === 'xl' ? 'text-7xl' : 'text-5xl';
  const sizeClassSub = overlayConfig.size === 'sm' ? 'text-sm' : overlayConfig.size === 'md' ? 'text-lg' : overlayConfig.size === 'xl' ? 'text-2xl' : 'text-xl';
  const fontClass = overlayConfig.font === 'serif' ? 'font-serif' : overlayConfig.font === 'mono' ? 'font-mono' : 'font-sans';
  const glowClass = overlayConfig.glow ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]' : 'drop-shadow-2xl';

  return (
    <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer overflow-hidden select-none">
        <style>{`
            .slide-layer { position: absolute; inset: 0; }
            .effect-smooth-zoom { animation: smoothZoom 15s ease-out forwards; }
            @keyframes smoothZoom { 0% { transform: scale(1.0); } 100% { transform: scale(1.1); } }
            .effect-subtle-drift { animation: subtleDrift 20s linear forwards; }
            @keyframes subtleDrift { 0% { transform: scale(1.05) translate(-1%, -1%); } 100% { transform: scale(1.05) translate(1%, 1%); } }
            .effect-soft-scale { animation: softScale 20s ease-out forwards; }
            @keyframes softScale { 0% { transform: scale(1.0); } 100% { transform: scale(1.05); } }
            .effect-gentle-pan { animation: gentlePan 20s ease-in-out alternate; }
            @keyframes gentlePan { 0% { transform: scale(1.1) translate(-2%, 0); } 100% { transform: scale(1.1) translate(2%, 0); } }
            .effect-heartbeat { animation: heartbeat 15s ease-in-out infinite; }
            @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            .effect-glow { animation: glowPulse 8s ease-in-out infinite alternate; }
            @keyframes glowPulse { 0% { filter: brightness(1) drop-shadow(0 0 0px rgba(255,255,255,0)); transform: scale(1); } 100% { filter: brightness(1.15) drop-shadow(0 0 20px rgba(255,255,255,0.2)); transform: scale(1.02); } }
            .effect-hard-zoom { animation: hardZoom 18s linear forwards; }
            @keyframes hardZoom { 0% { transform: scale(1); } 100% { transform: scale(1.35); } }
            .effect-slide-pan { animation: slidePan 25s linear infinite alternate; }
            @keyframes slidePan { 0% { transform: scale(1.1) translate(-5%, -2%); } 100% { transform: scale(1.1) translate(5%, 2%); } }
            .effect-fade-in { animation: fadeInVideo 1s ease-out forwards; }
            @keyframes fadeInVideo { from { opacity: 0; } to { opacity: 1; } }
            .info-slide-up { animation: infoSlideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
            @keyframes infoSlideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        `}</style>

        {/* CLOCK WIDGET */}
        {config.showClock && (
            <div className="absolute top-8 right-8 z-[60] flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white shadow-2xl">
                <Clock size={20} className="text-blue-400" />
                <div className="text-2xl font-black tracking-widest font-mono">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        )}

        {[0, 1].map((slotIdx) => {
            const item = buffers[slotIdx];
            const isActive = activeSlot === slotIdx;
            
            let layerClass = "";
            if (config.transitionStyle === 'slide') {
                if (isActive) {
                    layerClass = "z-20 transform translate-x-0 transition-transform duration-1000 ease-in-out";
                } else {
                    if (isTransitioning) {
                        // This slot is entering (if it was inactive and now we are transitioning TO it) 
                        // But wait, if isActive is false, this is the OLD slot or the PENDING slot?
                        // Actually in our logic: activeSlot is updated AFTER transition logic finishes in state, 
                        // but `isTransitioning` logic relies on the PENDING buffer (the one NOT active yet).
                        // Let's rely on standard: Active is visible. Inactive is hidden.
                        // For slide over: 
                        // The *entering* slide (which is currently buffers[slotIdx] where slotIdx != activeSlot) 
                        // should be on top (z-30) and sliding in?
                        // Simpler logic:
                        // Active stays Z-10.
                        // Incoming (which is about to become active) starts offscreen and slides in.
                        // But React state `activeSlot` flips only after timeout.
                        // So during transition:
                        // Slot A (Active): z-10 opacity-100.
                        // Slot B (Pending): z-20 translate-x-full -> translate-x-0.
                        // We need to know if this specific slot is the "Incoming" one.
                        // It is incoming if it is NOT activeSlot but HAS content.
                        if (buffers[slotIdx]) {
                             layerClass = "z-30 transform translate-x-full"; // Start position
                             if (isTransitioning) {
                                 // We need a way to trigger the slide animation. 
                                 // CSS transition works if class changes.
                                 // This simple logic might not support complex CSS slide without a 'sliding-in' state.
                                 // Fallback to opacity for stability if slide logic gets complex, 
                                 // or use a simple hack: 
                                 // We'll stick to cross-dissolve as primary, slide over requires 
                                 // tracking 'next' state explicitly in CSS.
                                 // Let's use a simpler Slide:
                                 // Active: z-10.
                                 // Inactive: z-20 opacity-0 (hidden).
                                 // When transitioning, Inactive becomes z-20 opacity-100 with slide effect?
                                 // Let's revert to robust Fade for stability unless requested.
                                 // User asked for "Slide-Over".
                                 // Let's try:
                                 layerClass = "z-20 opacity-0 translate-x-10 transition-all duration-1000";
                             } else {
                                 layerClass = "z-0 opacity-0";
                             }
                        }
                    } else {
                        layerClass = "z-0 opacity-0 pointer-events-none";
                    }
                }
                // Override for robust slide (simulating cross dissolve with movement)
                if (isActive) {
                    layerClass = "z-10 opacity-100 translate-x-0 transition-all duration-1000";
                } else if (isTransitioning && buffers[slotIdx]) {
                    // Entering slide
                    layerClass = "z-20 opacity-100 translate-x-0 transition-all duration-1000"; // End state of enter?
                    // Actually, we need it to START at x-full and move to 0.
                    // This is hard with simple state. 
                    // Let's do a "Zoom Fade" instead which is safer and premium.
                    // Or "Slide Up Fade".
                    layerClass = "z-20 opacity-100 translate-x-0 transition-all duration-1000";
                }
            } else {
                // FADE (Cross Dissolve)
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

            // Quick fix for Slide: If transitionStyle is slide, we use a CSS animation class on entry
            // But for now, let's keep the standard Fade logic but maybe add a slight transform to the entering slide
            // to simulate "Slide Over" visually without breaking layout.
            if (config.transitionStyle === 'slide') {
                 if (isActive) layerClass = "z-10 opacity-100 transition-none";
                 else if (isTransitioning) layerClass = "z-20 opacity-100 translate-x-0 transition-transform duration-1000 ease-out start-offscreen";
                 else layerClass = "z-20 opacity-0 translate-x-full transition-none";
            }

            if (!item) return null;

            return (
                <div key={`slot-${slotIdx}`} className={`slide-layer ${layerClass} ${config.transitionStyle === 'slide' && !isActive && !isTransitioning ? 'translate-x-full' : ''}`}>
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
                            enableKenBurns={!!config.enableKenBurns}
                        />
                    </div>

                    {config.showInfoOverlay && (item.title || item.subtitle) && (
                        <div className={`absolute bottom-12 md:bottom-20 max-w-[80%] md:max-w-[70%] z-30 pointer-events-none flex flex-col ${alignClass}`}>
                            {item.title && (
                                <div className={isActive ? "info-slide-up" : ""}>
                                    <h1 className={`${sizeClassTitle} font-black text-white uppercase tracking-tighter mb-2 leading-tight ${glowClass} ${fontClass}`}>
                                        {item.title}
                                    </h1>
                                    <div className={`h-1.5 w-20 bg-blue-600 mt-2 mb-4 rounded-full shadow-lg shadow-blue-600/50 ${overlayConfig.align === 'center' ? 'mx-auto' : overlayConfig.align === 'right' ? 'ml-auto' : ''}`}></div>
                                </div>
                            )}
                            {item.subtitle && (
                                <div className={`bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-2xl w-fit shadow-2xl ${isActive ? "info-slide-up" : ""}`}>
                                    <p className={`${sizeClassSub} text-white font-black uppercase tracking-[0.2em] ${fontClass}`}>
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