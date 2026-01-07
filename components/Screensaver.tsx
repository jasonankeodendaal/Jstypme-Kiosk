
import React, { useEffect, useState, useRef, memo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, VolumeX } from 'lucide-react';

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

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings, isAudioUnlocked = false }) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default config
  const config: ScreensaverSettings = {
      idleTimeout: 60,
      imageDuration: 8,
      muteVideos: false,
      showProductImages: true,
      showProductVideos: true,
      showPamphlets: true,
      showCustomAds: true,
      displayStyle: 'contain', 
      visualEffect: 'ken-burns', // Default effect
      showInfoOverlay: true,
      enableSleepMode: false,
      activeHoursStart: '08:00',
      activeHoursEnd: '20:00',
      ...settings
  };

  // Resolve legacy displayStyle to new visualEffect if undefined
  const effectiveVisualEffect = config.visualEffect || (config.displayStyle === 'cover' ? 'cover' : 'contain');

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

          let isActive = false;
          if (startMinutes < endMinutes) {
              isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
          } else {
              isActive = currentMinutes >= startMinutes || currentMinutes < endMinutes;
          }
          
          setIsSleepMode(!isActive);
      };

      checkTime();
      const interval = setInterval(checkTime, 60000);
      return () => clearInterval(interval);
  }, [config.activeHoursStart, config.activeHoursEnd, config.enableSleepMode]);

  const shouldIncludeItem = (dateString?: string): boolean => {
      if (!dateString) return true;
      const addedDate = new Date(dateString);
      const now = new Date();
      const monthsOld = (now.getFullYear() - addedDate.getFullYear()) * 12 + (now.getMonth() - addedDate.getMonth());
      if (monthsOld >= 6) return Math.random() < 0.25; 
      return true;
  };

  useEffect(() => {
    const list: PlaylistItem[] = [];

    if (config.showCustomAds) {
        ads.forEach((ad, i) => {
          if (shouldIncludeItem(ad.dateAdded)) {
            // Reduced frequency to save memory
            list.push({
                id: `ad-${ad.id}-${i}`,
                type: ad.type,
                url: ad.url,
                title: "Sponsored",
                subtitle: "",
                dateAdded: ad.dateAdded
            });
          }
        });
    }

    if (config.showPamphlets) {
        pamphlets.forEach((pamphlet) => {
           if (pamphlet.pages && pamphlet.pages.length > 0) {
               if (!pamphlet.endDate || shouldIncludeItem(pamphlet.startDate)) {
                  list.push({
                    id: `pamphlet-${pamphlet.id}`,
                    type: 'image',
                    url: pamphlet.pages[0],
                    title: pamphlet.title,
                    subtitle: "Showcase Catalogue",
                    startDate: pamphlet.startDate,
                    endDate: pamphlet.endDate
                 });
               }
           }
        });
    }

    products.forEach((p) => {
        if (!shouldIncludeItem(p.dateAdded)) return;

        if (config.showProductImages && p.imageUrl) {
            list.push({
                id: `prod-img-${p.id}`,
                type: 'image',
                url: p.imageUrl,
                title: p.brandName,
                subtitle: p.name,
                dateAdded: p.dateAdded
            });
        }
        if (config.showProductVideos) {
            if (p.videoUrl) {
                 list.push({
                    id: `prod-vid-${p.id}`,
                    type: 'video',
                    url: p.videoUrl,
                    title: p.brandName,
                    subtitle: `${p.name} - Official Video`,
                    dateAdded: p.dateAdded
                 });
            }
            if (p.videoUrls) {
                p.videoUrls.forEach((url, idx) => {
                    if (url !== p.videoUrl) {
                        list.push({
                            id: `prod-vid-${p.id}-${idx}`,
                            type: 'video',
                            url: url,
                            title: p.brandName,
                            subtitle: `${p.name} - Video Showcase`,
                            dateAdded: p.dateAdded
                        });
                    }
                });
            }
        }
    });

    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    // Limit playlist size to prevent memory leaks on huge inventories
    const safeList = list.slice(0, 50);
    setPlaylist(safeList);
    setCurrentIndex(0);
  }, [
    products.length, 
    ads.length, 
    pamphlets.length, 
    config.showProductImages, 
    config.showProductVideos, 
    config.showCustomAds, 
    config.showPamphlets
  ]);

  const nextSlide = () => {
      if (playlist.length === 0) return;
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleMediaError = (e: any) => {
      // Clean up failed resource immediately
      if (e.target) {
          e.target.src = "";
          e.target.load?.();
      }
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
          nextSlide();
      }, 1000); 
  };

  const currentItem = playlist[currentIndex];
  
  // Predictive Loading: Get the next item to preload
  const nextItemIndex = playlist.length > 0 ? (currentIndex + 1) % playlist.length : 0;
  const nextItem = playlist.length > 0 ? playlist[nextItemIndex] : null;

  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (watchdogRef.current) clearTimeout(watchdogRef.current);

    if (currentItem.type === 'image') {
        const duration = (config.imageDuration && config.imageDuration > 0) ? config.imageDuration * 1000 : 8000;
        timerRef.current = window.setTimeout(() => {
            nextSlide();
        }, duration);
    } else {
        if (videoRef.current) {
            const isMuted = config.muteVideos || !isAudioUnlocked;
            videoRef.current.muted = isMuted;
            
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(() => nextSlide());
                    }
                });
            }

            watchdogRef.current = window.setTimeout(() => {
                nextSlide(); // Force skip if video stalls
            }, 30000); 
        } else {
            timerRef.current = window.setTimeout(nextSlide, 5000);
        }
    }

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
        // Explicitly unload video to free memory
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
        }
    };
  }, [currentIndex, currentItem, config.imageDuration, isSleepMode]);

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

  // Determine effect class
  let effectClass = '';
  let fitClass = 'object-contain';

  switch (effectiveVisualEffect) {
      case 'cover':
          fitClass = 'object-cover';
          effectClass = '';
          break;
      case 'ken-burns':
          fitClass = 'object-cover';
          effectClass = 'animate-ken-burns';
          break;
      case 'cinematic':
          fitClass = 'object-cover';
          effectClass = 'animate-pan-cinematic';
          break;
      case 'float':
          fitClass = 'object-contain';
          effectClass = 'animate-float-subtle';
          break;
      case 'pulse':
          fitClass = 'object-contain';
          effectClass = 'animate-pulse-zoom';
          break;
      case 'contain':
      default:
          fitClass = 'object-contain';
          effectClass = '';
          break;
  }

  return (
    <div 
      onClick={onWake}
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden"
    >
      {/* Hidden Preloader for Next Item */}
      <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        {nextItem && (
            nextItem.type === 'image' && (
                <img 
                    key={`preload-${nextItem.url}`}
                    src={nextItem.url} 
                    loading="eager" 
                    alt="preload"
                />
            )
        )}
      </div>

      <style>{`
        /* Standard Ken Burns: Slow Zoom In */
        @keyframes kenBurns { 
            0% { transform: scale(1.0); } 
            100% { transform: scale(1.15); } 
        }
        .animate-ken-burns { animation: kenBurns 20s ease-out forwards; will-change: transform; }

        /* Cinematic Pan: Horizontal Slide */
        @keyframes panCinematic {
            0% { object-position: 0% 50%; transform: scale(1.1); }
            50% { object-position: 100% 50%; transform: scale(1.1); }
            100% { object-position: 0% 50%; transform: scale(1.1); }
        }
        .animate-pan-cinematic { animation: panCinematic 60s linear infinite alternate; will-change: object-position, transform; }

        /* Floating Drift: Subtle translation */
        @keyframes floatSubtle {
            0% { transform: scale(0.95) translate(0, 0); }
            33% { transform: scale(0.95) translate(-1%, 1%); }
            66% { transform: scale(0.95) translate(1%, -1%); }
            100% { transform: scale(0.95) translate(0, 0); }
        }
        .animate-float-subtle { animation: floatSubtle 15s ease-in-out infinite; will-change: transform; }

        /* Pulse Zoom: Gentle breath */
        @keyframes pulseZoom {
            0% { transform: scale(0.9); opacity: 0.9; }
            50% { transform: scale(1.0); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.9; }
        }
        .animate-pulse-zoom { animation: pulseZoom 10s ease-in-out infinite; will-change: transform, opacity; }

        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0" />

      {/* Main Content */}
      <div key={`${currentItem.id}`} className="w-full h-full relative z-20 flex items-center justify-center overflow-hidden p-0">
         
         {currentItem.type === 'video' ? (
             <>
                 <video 
                    ref={videoRef}
                    src={currentItem.url} 
                    className={`w-full h-full ${fitClass}`}
                    muted={config.muteVideos || !isAudioUnlocked} 
                    autoPlay={true}
                    playsInline={true}
                    onEnded={nextSlide} 
                    onError={handleMediaError} 
                    style={{ maxHeight: '100vh', maxWidth: '100vw' }}
                 />
                 {!config.muteVideos && !isAudioUnlocked && (
                     <div className="absolute top-8 right-8 bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 text-white/50 animate-pulse">
                         <VolumeX size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Muted</span>
                     </div>
                 )}
             </>
         ) : (
             <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
                 <img 
                   src={currentItem.url} 
                   alt="Screensaver" 
                   className={`w-full h-full ${fitClass} ${effectClass}`}
                   loading="eager"
                   decoding="sync"
                   onError={handleMediaError}
                 />
             </div>
         )}

         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className="absolute bottom-12 left-10 md:bottom-20 md:left-20 max-w-[80%] md:max-w-[70%] pointer-events-none z-30">
                {currentItem.title && (
                    <div className="slide-up">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-2 leading-tight">
                            {currentItem.title}
                        </h1>
                        <div className="h-1.5 w-20 bg-blue-600 mt-2 mb-4 rounded-full shadow-lg"></div>
                    </div>
                )}
                
                {currentItem.subtitle && (
                    <div className="bg-black/60 border border-white/10 px-5 py-2.5 rounded-2xl w-fit slide-up shadow-2xl backdrop-blur-md">
                        <p className="text-white text-xs md:text-xl font-black uppercase tracking-[0.2em]">
                            {currentItem.subtitle}
                        </p>
                    </div>
                )}
             </div>
         )}
      </div>
    </div>
  );
};

export default memo(Screensaver);
