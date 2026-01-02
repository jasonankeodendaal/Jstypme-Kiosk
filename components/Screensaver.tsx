
import React, { useEffect, useState, useRef, memo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, Volume2, VolumeX } from 'lucide-react';

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
  
  const [animationEffect, setAnimationEffect] = useState('effect-smooth-zoom');
  
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
      showInfoOverlay: true,
      enableSleepMode: false,
      activeHoursStart: '08:00',
      activeHoursEnd: '20:00',
      ...settings
  };

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
            for(let c=0; c<3; c++) {
                list.push({
                    id: `ad-${ad.id}-${i}-${c}`,
                    type: ad.type,
                    url: ad.url,
                    title: "Sponsored",
                    subtitle: "",
                    dateAdded: ad.dateAdded
                });
            }
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

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    setPlaylist(list);
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
      if (e.target?.error?.name === 'AbortError') return;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      timerRef.current = window.setTimeout(() => {
          nextSlide();
      }, 2000); 
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    
    // Set a dynamic watchdog to force skip if the video duration is exceeded
    // (Duration in seconds * 1000) + 5 second safety buffer
    const durationMs = (video.duration * 1000) + 5000;
    
    watchdogRef.current = window.setTimeout(() => {
      console.warn("Screensaver Watchdog: Video exceeded duration without ended event, skipping.");
      nextSlide();
    }, isFinite(durationMs) ? durationMs : 60000); // Fallback to 60s if duration is NaN/Infinity
  };

  const currentItem = playlist[currentIndex];

  useEffect(() => {
    if (!currentItem) return;
    const imageEffects = ['effect-smooth-zoom', 'effect-subtle-drift', 'effect-soft-scale', 'effect-gentle-pan'];
    const videoEffects = ['effect-fade-in']; 
    if (currentItem.type === 'image') {
        setAnimationEffect(imageEffects[Math.floor(Math.random() * imageEffects.length)]);
    } else {
        setAnimationEffect(videoEffects[0]);
    }
  }, [currentItem?.id]);

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
        // Video specific playback trigger
        if (videoRef.current) {
            const isMuted = config.muteVideos || !isAudioUnlocked;
            videoRef.current.muted = isMuted;
            
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(() => {
                            nextSlide();
                        });
                    }
                });
            }

            // Initial safety watchdog if metadata takes too long to load (15 seconds)
            watchdogRef.current = window.setTimeout(() => {
                if (videoRef.current && videoRef.current.readyState < 1) {
                    console.warn("Screensaver Watchdog: Video failed to load metadata, skipping.");
                    nextSlide();
                }
            }, 15000); 
        } else {
            timerRef.current = window.setTimeout(nextSlide, 5000);
        }
    }

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
    };
  }, [currentIndex, currentItem, config.imageDuration, playlist.length, isSleepMode, isAudioUnlocked, config.muteVideos]);

  if (isSleepMode) {
      return (
          <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm">Sleep Mode Active</div>
                  <div className="text-white/50 text-xs mt-2">Tap to Wake</div>
              </div>
          </div>
      );
  }

  if (playlist.length === 0) return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" onClick={onWake}>
          <div className="text-white opacity-30 text-xs font-mono">No Items in Playlist</div>
      </div>
  );

  const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div 
      onClick={onWake}
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden"
    >
      <style>{`
        .effect-smooth-zoom, .effect-subtle-drift, .effect-soft-scale, .effect-gentle-pan, .effect-fade-in {
            will-change: transform, opacity;
            transform: translate3d(0,0,0);
            backface-visibility: hidden;
            perspective: 1000px;
        }

        .effect-smooth-zoom { animation: smoothZoom 15s ease-out forwards; }
        @keyframes smoothZoom { 
            0% { transform: scale(1) translate3d(0,0,0); opacity: 0.8; } 
            100% { transform: scale(1.1) translate3d(0,0,0); opacity: 1; } 
        }
        
        .effect-subtle-drift { animation: subtleDrift 20s linear forwards; }
        @keyframes subtleDrift {
            0% { transform: scale(1.05) translate3d(-1%, -1%, 0); }
            100% { transform: scale(1.05) translate3d(1%, 1%, 0); }
        }
        
        .effect-soft-scale { animation: softScale 10s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes softScale {
            0% { transform: scale(0.95) translate3d(0,0,0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: scale(1) translate3d(0,0,0); }
        }
        
        .effect-gentle-pan { animation: gentlePan 12s ease-in-out forwards; }
        @keyframes gentlePan {
            0% { transform: translate3d(-20px, 0, 0) scale(1.05); }
            100% { transform: translate3d(20px, 0, 0) scale(1.05); }
        }
        
        .effect-fade-in { animation: fadeInVideo 1.2s ease-out forwards; }
        @keyframes fadeInVideo { from { opacity: 0; } to { opacity: 1; } }

        img, video {
            image-rendering: -webkit-optimize-contrast;
            -webkit-user-drag: none;
            user-select: none;
            contain: strict;
        }

        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div 
        key={`bg-${currentItem.id}`} 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${currentItem.url})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-10" />

      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-8 md:p-24 overflow-hidden">
         
         {currentItem.type === 'video' ? (
             <>
                 <video 
                    ref={videoRef}
                    key={`vid-el-${currentItem.url}-${currentIndex}`}
                    src={currentItem.url} 
                    className={`w-full h-full max-w-full max-h-full ${objectFitClass} shadow-2xl ${animationEffect}`}
                    muted={config.muteVideos || !isAudioUnlocked} 
                    autoPlay={true}
                    playsInline={true}
                    onEnded={nextSlide} 
                    onError={handleMediaError} 
                    onLoadedMetadata={handleLoadedMetadata}
                 />
                 {!config.muteVideos && !isAudioUnlocked && (
                     <div className="absolute top-8 right-8 bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/50 animate-pulse">
                         <VolumeX size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Sound Managed</span>
                     </div>
                 )}
             </>
         ) : (
             <div className="w-full h-full flex items-center justify-center relative">
                <img 
                  src={currentItem.url} 
                  alt="Screensaver" 
                  className={`max-w-full max-h-full w-auto h-auto shadow-2xl ${animationEffect}`}
                  loading="eager"
                  decoding="async"
                  onError={handleMediaError}
                />
             </div>
         )}

         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className="absolute bottom-12 left-8 md:bottom-20 md:left-20 max-w-[80%] md:max-w-[70%] pointer-events-none z-30">
                {currentItem.title && (
                    <div className="slide-up">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2 leading-tight">
                            {currentItem.title}
                        </h1>
                        <div className="h-1 w-16 bg-blue-500 mt-2 mb-4 rounded-full"></div>
                    </div>
                )}
                
                {currentItem.subtitle && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl w-fit slide-up">
                        <p className="text-white text-xs md:text-xl font-bold uppercase tracking-widest">
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
