
import React, { useEffect, useState, useRef } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, Clock } from 'lucide-react';

interface ScreensaverProps {
  products: FlatProduct[];
  ads: AdItem[];
  pamphlets?: Catalogue[];
  onWake: () => void;
  settings?: ScreensaverSettings;
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

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings }) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation State
  const [animationEffect, setAnimationEffect] = useState('effect-ken-burns');
  
  const timerRef = useRef<number | null>(null);
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
      // Engine additions
      transitionStyle: 'cinematic',
      showClock: false,
      clockFormat: '24h',
      enableAmbienceBlur: true,
      marketingPriority: 3,
      ...settings
  };

  // Clock Logic
  useEffect(() => {
    if (!config.showClock) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [config.showClock]);

  // Check Active Hours for Sleep Mode
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

  // Helper to determine if item should be included based on age
  const shouldIncludeItem = (dateString?: string): boolean => {
      if (!dateString) return true;
      const addedDate = new Date(dateString);
      const now = new Date();
      const monthsOld = (now.getFullYear() - addedDate.getFullYear()) * 12 + (now.getMonth() - addedDate.getMonth());
      if (monthsOld >= 6) {
          return Math.random() < 0.25; 
      }
      return true;
  };

  // 1. Build & Weighted Shuffle Playlist
  useEffect(() => {
    const list: PlaylistItem[] = [];

    // Add Custom Ads - MULTIPLIED BY MARKETING PRIORITY
    if (config.showCustomAds) {
        const adWeight = config.marketingPriority || 3;
        ads.forEach((ad, i) => {
          if (shouldIncludeItem(ad.dateAdded)) {
            // Push N copies of each ad to increase frequency
            for(let c=0; c < adWeight; c++) {
                list.push({
                    id: `ad-${ad.id}-${i}-${c}`,
                    type: ad.type,
                    url: ad.url,
                    title: "Special Promotion",
                    subtitle: "",
                    dateAdded: ad.dateAdded
                });
            }
          }
        });
    }

    // Add Pamphlets
    if (config.showPamphlets) {
        pamphlets.forEach((pamphlet) => {
           if (pamphlet.pages && pamphlet.pages.length > 0) {
               if (!pamphlet.endDate || shouldIncludeItem(pamphlet.startDate)) {
                  list.push({
                    id: `pamphlet-${pamphlet.id}`,
                    type: 'image',
                    url: pamphlet.pages[0],
                    title: pamphlet.title,
                    subtitle: "Current Catalogue",
                    startDate: pamphlet.startDate,
                    endDate: pamphlet.endDate
                 });
               }
           }
        });
    }

    // Add Products
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
                    subtitle: `${p.name}`,
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
                            subtitle: `${p.name}`,
                            dateAdded: p.dateAdded
                        });
                    }
                });
            }
        }
    });

    // Robust Shuffle
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    setPlaylist(list);
    setCurrentIndex(0);
  }, [products.length, ads.length, pamphlets.length, config.showProductImages, config.showProductVideos, config.showCustomAds, config.showPamphlets, config.marketingPriority]);

  // Helper to move to next slide
  const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleMediaError = () => {
      console.warn("Media failed to load:", playlist[currentIndex]?.url);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
          nextSlide();
      }, 2000); 
  };

  const currentItem = playlist[currentIndex];

  // 2. Effect Selector based on Transition Style
  useEffect(() => {
    if (!currentItem) return;

    if (config.transitionStyle === 'fade') {
        setAnimationEffect('effect-simple-fade');
        return;
    }

    // Pick a random animation effect for this slide
    const imageEffects = ['effect-ken-burns', 'effect-pop-dynamic', 'effect-twist-enter', 'effect-circle-reveal', 'effect-pan-tilt'];
    const videoEffects = ['effect-fade-in', 'effect-zoom-soft']; 
    
    const useCinematic = config.transitionStyle === 'cinematic' || Math.random() > 0.5;

    if (useCinematic) {
        if (currentItem.type === 'image') {
            setAnimationEffect(imageEffects[Math.floor(Math.random() * imageEffects.length)]);
        } else {
            setAnimationEffect(videoEffects[Math.floor(Math.random() * videoEffects.length)]);
        }
    } else {
        setAnimationEffect('effect-simple-fade');
    }
  }, [currentItem?.id, config.transitionStyle]);

  // 3. Playback Logic
  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        const duration = (config.imageDuration && config.imageDuration > 0) ? config.imageDuration * 1000 : 8000;
        timerRef.current = window.setTimeout(() => {
            nextSlide();
        }, duration);
    } else {
        // Video Handling
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = config.muteVideos;
            
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay prevented:", error);
                    if (!videoRef.current!.muted) {
                         videoRef.current!.muted = true;
                         videoRef.current!.play().catch(e => nextSlide());
                    } else {
                        nextSlide(); 
                    }
                });
            }
        }
        
        timerRef.current = window.setTimeout(() => {
            console.warn("Video timeout, skipping.");
            nextSlide();
        }, 180000); 
    }

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, currentItem, animationEffect, config.imageDuration, playlist.length, isSleepMode]);

  // Sleep Mode Render
  if (isSleepMode) {
      return (
          <div 
             onClick={onWake} 
             className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center"
          >
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm">Sleep Mode Active</div>
                  <div className="text-white/50 text-xs mt-2">Tap to Wake</div>
              </div>
          </div>
      );
  }

  // Initial buffer
  if (playlist.length === 0) return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" onClick={onWake}>
          <div className="text-white opacity-30 text-xs font-mono">...</div>
      </div>
  );

  const formatClock = (date: Date) => {
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    if (config.clockFormat === '12h') {
        const h12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${h12}:${mins} ${ampm}`;
    }
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div 
      onClick={onWake}
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden"
    >
      <style>{`
        /* Transition Effects */
        .effect-simple-fade {
          animation: simpleFade 1.2s ease-out forwards;
        }
        @keyframes simpleFade { from { opacity: 0; } to { opacity: 1; } }

        .effect-ken-burns {
          animation: kenBurns 20s ease-out forwards;
        }
        @keyframes kenBurns {
          0% { transform: scale(1); filter: brightness(0.8); }
          100% { transform: scale(1.15); filter: brightness(1); }
        }

        .effect-pop-dynamic {
          animation: popDynamic 8s ease-out forwards;
          transform-origin: center center;
        }
        @keyframes popDynamic {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.05); }
          40% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        .effect-twist-enter {
          animation: twistEnter 10s ease-out forwards;
        }
        @keyframes twistEnter {
          0% { opacity: 0; transform: scale(1.5) rotate(-10deg); filter: blur(10px); }
          20% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0px); }
          100% { transform: scale(1.1) rotate(2deg); }
        }

        .effect-circle-reveal {
          animation: circleReveal 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes circleReveal {
          0% { clip-path: circle(0% at 50% 50%); transform: scale(1.2); }
          30% { clip-path: circle(150% at 50% 50%); transform: scale(1); }
          100% { clip-path: circle(150% at 50% 50%); transform: scale(1.05); }
        }

        .effect-pan-tilt {
            animation: panTilt 12s ease-in-out forwards;
        }
        @keyframes panTilt {
            0% { transform: perspective(1000px) rotateY(-5deg) scale(1.1); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: perspective(1000px) rotateY(5deg) scale(1.2); opacity: 1; }
        }

        .effect-fade-in { animation: simpleFade 1s ease-out forwards; }

        .effect-zoom-soft {
            animation: zoomSoft 20s linear forwards;
        }
        @keyframes zoomSoft { from { transform: scale(1); } to { transform: scale(1.1); } }

        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        .slide-up-delay { animation: slideUp 0.8s ease-out forwards 0.5s; opacity: 0; }
        
        @keyframes slideUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .bg-parallax {
            animation: bgParallax 20s linear infinite alternate;
        }
        @keyframes bgParallax {
            0% { transform: scale(1.2) translate(-2%, -2%); }
            100% { transform: scale(1.2) translate(2%, 2%); }
        }
      `}</style>

      {/* Optional Ambience Blur Layer */}
      {config.enableAmbienceBlur && (
        <div 
            key={`bg-${currentItem.id}`} 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-40 transition-all duration-1000 bg-parallax blur-2xl"
            style={{ backgroundImage: `url(${currentItem.url})` }}
        />
      )}
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 z-10" />

      {/* Clock Overlay */}
      {config.showClock && (
          <div className="absolute top-8 right-8 md:top-12 md:right-12 z-50 animate-fade-in">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                  <Clock size={20} className="text-blue-500" />
                  <span className="text-white font-mono text-2xl md:text-3xl font-black tracking-tighter">
                      {formatClock(currentTime)}
                  </span>
              </div>
          </div>
      )}

      {/* Main Content Layer */}
      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-8 md:p-24 overflow-hidden perspective-1000">
         
         {currentItem.type === 'video' ? (
             <video 
               ref={videoRef}
               src={currentItem.url} 
               className={`w-full h-full max-w-full max-h-full ${objectFitClass} shadow-2xl rounded-sm ${animationEffect}`}
               muted={config.muteVideos} 
               autoPlay
               playsInline
               onEnded={nextSlide} 
               onError={handleMediaError} 
             />
         ) : (
             <div className={`w-full h-full flex items-center justify-center relative`}>
                <img 
                  src={currentItem.url} 
                  alt="Screensaver" 
                  className={`max-w-full max-h-full w-auto h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${animationEffect}`}
                  style={{ borderRadius: '4px' }}
                  onError={handleMediaError}
                />
             </div>
         )}

         {/* Info Overlay */}
         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className="absolute bottom-12 left-8 md:bottom-20 md:left-20 max-w-[80%] md:max-w-[70%] pointer-events-none z-30">
                {currentItem.title && (
                    <div className="slide-up">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2 leading-tight opacity-95 break-words">
                            {currentItem.title}
                        </h1>
                        <div className="h-1 sm:h-1.5 w-16 sm:w-20 bg-blue-500 mt-2 sm:mt-4 mb-4 sm:mb-6 rounded-full"></div>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center slide-up-delay">
                    {currentItem.subtitle && (
                        <div className="bg-white/10 backdrop-blur-md border-l-2 sm:border-l-4 border-blue-500 px-3 sm:px-5 py-2 sm:py-3 shadow-xl rounded-r-lg">
                            <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-white tracking-wide uppercase leading-tight">
                                {currentItem.subtitle}
                            </h2>
                        </div>
                    )}
                    
                    {(currentItem.startDate || currentItem.endDate) && (
                        <div className="bg-blue-900/80 border border-blue-400/30 px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow-xl">
                            <p className="text-xs sm:text-sm md:text-lg text-white font-mono font-bold uppercase tracking-widest">
                                {currentItem.startDate && formatDate(currentItem.startDate)}
                                {currentItem.startDate && currentItem.endDate && ` — `}
                                {currentItem.endDate && formatDate(currentItem.endDate)}
                            </p>
                        </div>
                    )}
                </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default Screensaver;
