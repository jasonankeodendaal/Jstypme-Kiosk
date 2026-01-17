
import React, { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, VolumeX, Clock as ClockIcon, AlertCircle } from 'lucide-react';

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
  dateAdded?: string;
}

type SlotStatus = 'empty' | 'loading' | 'ready' | 'error';

// --- UTILITIES ---

// Robust Interval Hook
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const ClockWidget = memo(() => {
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
});

// --- SLIDE COMPONENT ---
// Simplified to be purely reactive to props and load events
const Slide = memo(({ 
    item, 
    isActive, 
    isMuted, 
    onReady, 
    onError, 
    onVideoEnd, 
    objectFit,
    animationStyle,
    forceKenBurns
}: { 
    item: PlaylistItem; 
    isActive: boolean;
    isMuted: boolean; 
    onReady: () => void; 
    onError: () => void; 
    onVideoEnd: () => void; 
    objectFit: string;
    animationStyle: string;
    forceKenBurns: boolean;
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [animClass, setAnimClass] = useState('');

    // Animation Logic
    useEffect(() => {
        const cinematic = ['effect-smooth-zoom', 'effect-subtle-drift', 'effect-gentle-pan', 'effect-slide-pan', 'effect-hard-zoom'];
        const pulse = ['effect-heartbeat', 'effect-glow', 'effect-soft-scale'];
        
        let selected = '';
        if (item.type === 'image') {
            if (forceKenBurns) {
                selected = cinematic[Math.floor(Math.random() * cinematic.length)];
            } else {
                const pool = animationStyle === 'cinematic' ? cinematic : 
                             animationStyle === 'pulse' ? pulse : 
                             animationStyle === 'static' ? [] : [...cinematic, ...pulse];
                selected = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : '';
            }
        } else {
            selected = 'effect-fade-in';
        }
        setAnimClass(selected);
    }, [item.id, animationStyle, forceKenBurns]);

    // Cleanup Logic
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.removeAttribute('src');
                videoRef.current.load();
            }
        };
    }, [item.url]);

    // Image Handling - CRITICAL CACHE FIX
    useEffect(() => {
        if (item.type === 'image' && imgRef.current) {
            const img = imgRef.current;
            
            const handleLoad = () => onReady();
            const handleError = () => {
                console.warn(`[Screensaver] Image Failed: ${item.url}`);
                onError();
            };

            img.onload = handleLoad;
            img.onerror = handleError;

            // Immediate check for cached images
            if (img.complete && img.naturalWidth > 0) {
                onReady();
            }
        }
    }, [item, onReady, onError]);

    // Video Handling
    useEffect(() => {
        if (item.type === 'video' && videoRef.current) {
            const vid = videoRef.current;
            vid.muted = isMuted; // Enforce mute prop on element
            
            const handleReady = () => onReady();
            const handleError = (e: any) => {
                console.warn(`[Screensaver] Video Failed: ${item.url}`, e);
                onError();
            };

            vid.addEventListener('loadeddata', handleReady);
            vid.addEventListener('error', handleError);
            vid.addEventListener('ended', onVideoEnd);

            return () => {
                vid.removeEventListener('loadeddata', handleReady);
                vid.removeEventListener('error', handleError);
                vid.removeEventListener('ended', onVideoEnd);
            };
        }
    }, [item, isMuted, onReady, onError, onVideoEnd]);

    // Playback Control
    useEffect(() => {
        if (item.type === 'video' && videoRef.current) {
            if (isActive) {
                videoRef.current.play().catch(e => {
                    console.warn("Autoplay blocked, attempting muted fallback", e);
                    videoRef.current!.muted = true;
                    videoRef.current!.play().catch(() => onError());
                });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isActive, item.type, onError]);

    if (item.type === 'video') {
        return (
            <video
                ref={videoRef}
                src={item.url}
                className={`w-full h-full ${objectFit} ${isActive ? animClass : ''}`}
                muted={isMuted}
                playsInline
                preload="auto"
                style={{ willChange: 'transform, opacity' }}
            />
        );
    }

    return (
        <img
            ref={imgRef}
            src={item.url}
            alt=""
            className={`w-full h-full ${objectFit} ${isActive ? animClass : ''}`}
            loading="eager"
            decoding="async"
            style={{ willChange: 'transform, opacity' }}
        />
    );
});

// --- MAIN SCREENSAVER ---

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings, isAudioUnlocked = false }) => {
    // 1. Config Memos
    const config = useMemo(() => ({
        idleTimeout: 60,
        imageDuration: 8,
        muteVideos: false,
        displayStyle: 'contain',
        activeHoursStart: '08:00',
        activeHoursEnd: '20:00',
        enableSleepMode: false,
        animationStyle: 'random',
        enableKenBurns: false,
        transitionType: 'fade',
        ...settings
    }), [settings]);

    // 2. State: Playlist
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);

    // 3. State: Double Buffer
    const [slots, setSlots] = useState<[PlaylistItem | null, PlaylistItem | null]>([null, null]);
    const [slotStatus, setSlotStatus] = useState<[SlotStatus, SlotStatus]>(['empty', 'empty']);
    const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // 4. State: Timers & Control
    const lastTransitionTime = useRef(Date.now());
    const videoEndedRef = useRef(false);
    const [isSleepMode, setIsSleepMode] = useState(false);

    // 5. Generate Playlist (On Mount or Data Change)
    useEffect(() => {
        const list: PlaylistItem[] = [];
        const shouldInclude = (dateStr?: string) => {
            if (!dateStr) return true;
            const diff = new Date().getTime() - new Date(dateStr).getTime();
            return diff < (1000 * 60 * 60 * 24 * 180) || Math.random() < 0.25; // 6 months or random chance
        };

        if (settings?.showCustomAds) {
            ads.forEach((ad, i) => { if (shouldInclude(ad.dateAdded)) for(let c=0;c<3;c++) list.push({ id: `ad-${ad.id}-${c}`, type: ad.type, url: ad.url, title: 'Sponsored', dateAdded: ad.dateAdded }); });
        }
        if (settings?.showPamphlets) {
            pamphlets.forEach(p => { if (p.pages?.[0] && shouldInclude(p.startDate)) list.push({ id: `cat-${p.id}`, type: 'image', url: p.pages[0], title: p.title }); });
        }
        products.forEach(p => {
            if (!shouldInclude(p.dateAdded)) return;
            if (settings?.showProductImages && p.imageUrl) list.push({ id: `p-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name });
            if (settings?.showProductVideos) {
                if (p.videoUrl) list.push({ id: `p-vid-${p.id}`, type: 'video', url: p.videoUrl, title: p.brandName, subtitle: p.name });
                p.videoUrls?.forEach((v, i) => { if(v !== p.videoUrl) list.push({ id: `p-vid-${p.id}-${i}`, type: 'video', url: v, title: p.brandName, subtitle: p.name }); });
            }
        });

        // Shuffle
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }

        setPlaylist(list);
        
        // Initialize First Slot immediately if list exists
        if (list.length > 0) {
            setSlots([list[0], null]);
            setSlotStatus(['loading', 'empty']); // Will switch to 'ready' via Slide callback
            setCurrentIdx(0);
            setActiveSlot(0);
            lastTransitionTime.current = Date.now();
        }
    }, [products, ads, pamphlets, settings]);

    // 6. Sleep Mode Check (Every Minute)
    useInterval(() => {
        if (!config.enableSleepMode || !config.activeHoursStart || !config.activeHoursEnd) {
            setIsSleepMode(false); return;
        }
        const now = new Date();
        const mins = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = config.activeHoursStart.split(':').map(Number);
        const [eh, em] = config.activeHoursEnd.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        const isActive = start < end ? (mins >= start && mins < end) : (mins >= start || mins < end);
        setIsSleepMode(!isActive);
    }, 60000);

    // 7. PRELOADER PIPELINE (Pending Slot Manager)
    // Whenever activeSlot settles, we ensure the OTHER slot is loading the NEXT item.
    useEffect(() => {
        if (playlist.length === 0) return;

        const pendingSlot = activeSlot === 0 ? 1 : 0;
        const nextIdx = (currentIdx + 1) % playlist.length;
        const nextItem = playlist[nextIdx];

        // Only update if the pending slot is not already holding the correct item
        if (slots[pendingSlot]?.id !== nextItem.id) {
            // RESOURCE CONTENTION FIX:
            // Delay the preloading of the NEXT slide by 2.5 seconds.
            // This allows the CURRENT slide (especially video) to fill its buffer
            // and start playing smoothly before we hog the bandwidth with the next download.
            // This effectively serializes the heavy network usage.
            const contentionDelay = 2500;

            const timer = setTimeout(() => {
                setSlots(prev => {
                    const newSlots = [...prev] as [PlaylistItem | null, PlaylistItem | null];
                    newSlots[pendingSlot] = nextItem;
                    return newSlots;
                });
                // Mark as loading immediately. Slide component will flip this to ready/error.
                setSlotStatus(prev => {
                    const newStatus = [...prev] as [SlotStatus, SlotStatus];
                    newStatus[pendingSlot] = 'loading';
                    return newStatus;
                });
            }, contentionDelay);

            return () => clearTimeout(timer);
        }
    }, [activeSlot, currentIdx, playlist]);

    // 8. MASTER CLOCK & STATE MACHINE (The "Game Loop")
    // Runs frequently to check timing and trigger transitions.
    useInterval(() => {
        if (playlist.length === 0 || isSleepMode) return;

        const now = Date.now();
        const elapsed = now - lastTransitionTime.current;
        const activeItem = slots[activeSlot];
        
        // Determine Duration
        // Videos wait for 'ended' event (via ref) OR a max timeout of 3 mins
        // Images use config duration
        let isTimeUp = false;
        
        if (activeItem?.type === 'video') {
            if (videoEndedRef.current || elapsed > 180000) { 
                isTimeUp = true;
            }
        } else {
            if (elapsed > (config.imageDuration * 1000)) {
                isTimeUp = true;
            }
        }

        // FAIL-SAFE WATCHDOG
        // If stuck on same slide for 3x duration, force reset
        const watchdogLimit = (activeItem?.type === 'video' ? 180000 : config.imageDuration * 1000) * 3;
        if (elapsed > watchdogLimit) {
            console.warn("[Screensaver] Watchdog triggered! Force resetting buffers.");
            // Force jump to next
            const nextIdx = (currentIdx + 1) % playlist.length;
            setCurrentIdx(nextIdx);
            setSlots([playlist[nextIdx], null]);
            setSlotStatus(['loading', 'empty']); // Slide will fix this to ready
            setActiveSlot(0);
            lastTransitionTime.current = Date.now();
            videoEndedRef.current = false;
            return;
        }

        // TRANSITION LOGIC
        if (isTimeUp && !isTransitioning) {
            const pendingSlot = activeSlot === 0 ? 1 : 0;
            const status = slotStatus[pendingSlot];

            if (status === 'ready') {
                // PERFORM SWAP
                setIsTransitioning(true);
                // Wait for CSS transition (1s), then finalize state
                setTimeout(() => {
                    setActiveSlot(pendingSlot);
                    setCurrentIdx((prev) => (prev + 1) % playlist.length);
                    lastTransitionTime.current = Date.now();
                    videoEndedRef.current = false;
                    setIsTransitioning(false);
                    
                    // Clear old slot to save memory
                    setSlots(prev => {
                        const newSlots = [...prev];
                        newSlots[activeSlot] = null; // The slot that WAS active is now cleared
                        return newSlots as [PlaylistItem | null, PlaylistItem | null];
                    });
                }, 1000); // 1s matches CSS transition duration
            } else if (status === 'error') {
                // Pending item failed. Skip it logically without showing it.
                console.warn("[Screensaver] Pending item error. Skipping index.");
                setCurrentIdx((prev) => (prev + 1) % playlist.length);
                // This state change will trigger the Preloader useEffect to load the *next* next item into the pending slot
                // We keep 'isTimeUp' true effectively by not resetting lastTransitionTime, so loop checks again immediately next tick
            } else {
                // Status is 'loading' or 'empty'. 
                // Do nothing. Wait for next tick. The current slide stays visible.
                // The watchdog protects us if it never loads.
            }
        }
    }, 250); // 4Hz heartbeat

    // Slide Callbacks
    const handleReady = useCallback((slotIdx: number) => {
        setSlotStatus(prev => {
            if (prev[slotIdx] === 'ready') return prev; // No op
            const newStatus = [...prev] as [SlotStatus, SlotStatus];
            newStatus[slotIdx] = 'ready';
            return newStatus;
        });
    }, []);

    const handleError = useCallback((slotIdx: number) => {
        setSlotStatus(prev => {
            const newStatus = [...prev] as [SlotStatus, SlotStatus];
            newStatus[slotIdx] = 'error';
            return newStatus;
        });
    }, []);

    const handleVideoEnd = useCallback(() => {
        // Only relevant if coming from active slot
        videoEndedRef.current = true;
    }, []);

    // --- RENDER ---

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

    const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';
    const alignClass = config.textAlignment === 'center' ? 'text-center items-center left-0 right-0 max-w-[90%] mx-auto' 
                     : config.textAlignment === 'right' ? 'text-right items-end right-10 md:right-20 left-auto max-w-[70%]' 
                     : 'text-left items-start left-10 md:left-20 max-w-[70%]';
    const fontClass = config.fontFamily === 'serif' ? 'font-serif' : config.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
    const glowClass = config.textGlow ? 'drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]' : 'drop-shadow-2xl';

    return (
        <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer overflow-hidden select-none">
            <style>{`
                .slide-layer { position: absolute; inset: 0; transition: opacity 1s ease-in-out; }
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

            {config.showClock && <ClockWidget />}

            {[0, 1].map((idx) => {
                const item = slots[idx];
                const isActiveSlot = activeSlot === idx;
                
                let opacityClass = 'opacity-0 z-0';
                if (isActiveSlot && !isTransitioning) {
                    opacityClass = 'opacity-100 z-10'; // Stable state
                } else if (isActiveSlot && isTransitioning) {
                    opacityClass = 'opacity-0 z-10'; // Fading out (old active)
                } else if (!isActiveSlot && isTransitioning) {
                    opacityClass = 'opacity-100 z-20'; // Fading in (new active)
                } else {
                    opacityClass = 'opacity-0 z-0'; // Hidden pending
                }

                if (!item) return null;

                return (
                    <div key={`slot-${idx}`} className={`slide-layer ${opacityClass}`}>
                        {/* Background Blur */}
                        <div 
                            className="absolute inset-0 z-0 opacity-40 blur-[60px] scale-110 transition-all duration-1000"
                            style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
                        
                        {/* Content */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 md:p-12">
                            <Slide 
                                item={item}
                                isActive={isActiveSlot || isTransitioning} // Keep playing during cross-fade
                                isMuted={config.muteVideos || !isAudioUnlocked}
                                onReady={() => handleReady(idx)}
                                onError={() => handleError(idx)}
                                onVideoEnd={isActiveSlot ? handleVideoEnd : () => {}}
                                objectFit={objectFitClass}
                                animationStyle={config.animationStyle || 'random'}
                                forceKenBurns={!!config.enableKenBurns}
                            />
                        </div>

                        {/* Info Overlay */}
                        {config.showInfoOverlay && (item.title || item.subtitle) && (
                            <div className={`absolute bottom-12 md:bottom-20 z-30 pointer-events-none flex flex-col ${alignClass} ${fontClass}`}>
                                {item.title && (
                                    <div className={isActiveSlot ? "info-slide-up" : ""}>
                                        <h1 className={`text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2 leading-tight ${glowClass}`}>
                                            {item.title}
                                        </h1>
                                        <div className="h-1.5 w-20 bg-blue-600 mt-2 mb-4 rounded-full shadow-lg shadow-blue-600/50"></div>
                                    </div>
                                )}
                                {item.subtitle && (
                                    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-2xl w-fit shadow-2xl ${isActiveSlot ? "info-slide-up" : ""}`}>
                                        <p className={`text-sm md:text-xl text-white font-black uppercase tracking-[0.2em] ${config.textGlow ? 'animate-pulse' : ''}`}>
                                            {item.subtitle}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Mute Indicator */}
            {slots[activeSlot] && !config.muteVideos && !isAudioUnlocked && slots[activeSlot]?.type === 'video' && (
                 <div className="absolute top-8 left-8 z-[50] bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/50 animate-pulse pointer-events-none">
                     <VolumeX size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Muted</span>
                 </div>
            )}
        </div>
    );
};

export default memo(Screensaver);
