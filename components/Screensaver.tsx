
import React, { useEffect, useState, useRef } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, Volume2, VolumeX, AlertCircle } from 'lucide-react';

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
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  
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
      ...settings
  };

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

  // Audio Unlock Checker - Persistent for Kiosk Session
  useEffect(() => {
    const handleTouch = () => {
        setIsAudioUnlocked(true);
        // Persist to window to share across re-mounts if needed
        (window as any).isKioskAudioUnlocked = true;
    };
    
    if ((window as any).isKioskAudioUnlocked) {
        setIsAudioUnlocked(true);
    }

    window.addEventListener('click', handleTouch);
    window.addEventListener('touchstart', handleTouch);
    return () => {
        window.removeEventListener('click', handleTouch);
        window.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  // Helper to determine if item should be included based on age
  const shouldIncludeItem = (dateString?: string): boolean => {
      if (!dateString) return true;
      const addedDate = new Date(dateString);
      const now = new Date();
      const monthsOld = (now.getFullYear() - addedDate.getFullYear()) * 12 + (now.getMonth() - addedDate.getMonth());
      if (monthsOld >= 6) return Math.random() < 0.25; 
      return true;
  };

  // 1. Build & Shuffle Playlist
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
                    title: "Special Promotion",
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
                    subtitle: "Digital Catalogue",
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
                    subtitle: `${p.name} - Official Showcase`,
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
                            subtitle: `${p.name} - Visual Tour`,
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
  }, [products.length, ads.length, pamphlets.length, config.showProductImages, config.showProductVideos, config.showCustomAds, config.showPamphlets]);

  const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
      setPlaybackError(null);
  };

  const handleMediaError = (e: any) => {
      console.error("Screensaver Media Error:", playlist[currentIndex]?.url, e);
      setPlaybackError("Media Load Failure");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
          nextSlide();
      }, 3000); 
  };

  const currentItem = playlist[currentIndex];

  // 2. Effect Selector
  useEffect(() => {
    if (!currentItem) return;
    const imageEffects = ['effect-ken-burns', 'effect-pop-dynamic', 'effect-twist-enter', 'effect-circle-reveal', 'effect-pan-tilt'];
    const videoEffects = ['effect-fade-in', 'effect-zoom-soft']; 
    if (currentItem.type === 'image') {
        setAnimationEffect(imageEffects[Math.floor(Math.random() * imageEffects.length)]);
    } else {
        setAnimationEffect(videoEffects[Math.floor(Math.random() * videoEffects.length)]);
    }
  }, [currentItem?.id]);

  // 3. Playback Logic - FORCED PERSISTENCE
  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        const duration = (config.imageDuration && config.imageDuration > 0) ? config.imageDuration * 1000 : 8000;
        timerRef.current = window.setTimeout(() => {
            nextSlide();
        }, duration);
    } else {
        // Video Logic - Don't use window timeout for transitions, use onEnded
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            
            // Try playing with sound if allowed
            const attemptPlay = async () => {
                if (!videoRef.current) return;
                
                // If user hasn't touched yet, we MUST mute to prevent the browser from blocking the play() call
                videoRef.current.muted = config.muteVideos || !isAudioUnlocked;
                
                try {
                    await videoRef.current.play();
                } catch (error) {
                    console.warn("Unmuted autoplay blocked. Falling back to muted playback.");
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        await videoRef.current.play().catch(err => {
                            console.error("Total video block:", err);
                            setPlaybackError("Playback Blocked by Device");
                            // ONLY skip if the video literally cannot play even when muted
                            timerRef.current = window.setTimeout(nextSlide, 2000);
                        });
                    }
                }
            };

            attemptPlay();
        }
        
        // Universal watchdog for stuck videos
        timerRef.current = window.setTimeout(() => {
            console.warn("Video watchdog triggered.");
            nextSlide();
        }, 120000); // 2 minutes max
    }

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, currentItem, animationEffect, config.imageDuration, playlist.length, isSleepMode, isAudioUnlocked]);

  if (isSleepMode) {
      return (
          <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm uppercase tracking-widest">Sleep Mode Active</div>
                  <div className="text-white/50 text-xs mt-2 uppercase">Tap to Wake</div>
              </div>
          </div>
      );
  }

  if (playlist.length === 0) return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" onClick={onWake}>
          <div className="text-white opacity-20 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Showcase...</div>
      </div>
  );

  const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div 
      onClick={onWake}
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden"
    >
      <style>{`
        .effect-ken-burns { animation: kenBurns 20s ease-out forwards; }
        @keyframes kenBurns { 0% { transform: scale(1); filter: brightness(0.8); } 100% { transform: scale(1.15); filter: brightness(1); } }
        .effect-pop-dynamic { animation: popDynamic 8s ease-out forwards; transform-origin: center center; }
        @keyframes popDynamic { 0% { opacity: 0; transform: scale(0.5); } 20% { opacity: 1; transform: scale(1.05); } 40% { transform: scale(0.95); } 100% { transform: scale(1); } }
        .effect-twist-enter { animation: twistEnter 10s ease-out forwards; }
        @keyframes twistEnter { 0% { opacity: 0; transform: scale(1.5) rotate(-10deg); filter: blur(10px); } 20% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0px); } 100% { transform: scale(1.1) rotate(2deg); } }
        .effect-circle-reveal { animation: circleReveal 8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes circleReveal { 0% { clip-path: circle(0% at 50% 50%); transform: scale(1.2); } 30% { clip-path: circle(150% at 50% 50%); transform: scale(1); } 100% { clip-path: circle(150% at 50% 50%); transform: scale(1.05); } }
        .effect-pan-tilt { animation: panTilt 12s ease-in-out forwards; }
        @keyframes panTilt { 0% { transform: perspective(1000px) rotateY(-5deg) scale(1.1); opacity: 0; } 20% { opacity: 1; } 100% { transform: perspective(1000px) rotateY(5deg) scale(1.2); opacity: 1; } }
        .effect-fade-in { animation: fadeInVideo 1s ease-out forwards; }
        @keyframes fadeInVideo { from { opacity: 0; } to { opacity: 1; } }
        .effect-zoom-soft { animation: zoomSoft 20s linear forwards; }
        @keyframes zoomSoft { from { transform: scale(1); } to { transform: scale(1.1); } }
        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        .slide-up-delay { animation: slideUp 0.8s ease-out forwards 0.5s; opacity: 0; }
        @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .bg-parallax { animation: bgParallax 20s linear infinite alternate; }
        @keyframes bgParallax { 0% { transform: scale(1.2) translate(-2%, -2%); } 100% { transform: scale(1.2) translate(2%, 2%); } }
      `}</style>

      {/* Dynamic Blurred Background */}
      <div 
        key={`bg-${currentItem.id}`} 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 transition-all duration-1000 bg-parallax blur-2xl"
        style={{ backgroundImage: `url(${currentItem.url})` }}
      />
      
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/70 z-10" />

      {/* Error Overlay */}
      {playbackError && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md animate-pulse">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{playbackError}</span>
          </div>
      )}

      {/* Main Content Layer */}
      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-8 md:p-24 overflow-hidden">
         
         {currentItem.type === 'video' ? (
             <div className="w-full h-full flex items-center justify-center relative">
                 <video 
                    ref={videoRef}
                    src={currentItem.url} 
                    className={`w-full h-full max-w-full max-h-full ${objectFitClass} shadow-[0_30px_100px_rgba(0,0,0,0.6)] rounded-sm ${animationEffect}`}
                    playsInline
                    onEnded={nextSlide} 
                    onError={handleMediaError} 
                 />
                 
                 {/* Visual Audio Status Indicator */}
                 {!config.muteVideos && !isAudioUnlocked && (
                     <div className="absolute top-8 right-8 bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/50 animate-pulse backdrop-blur-md">
                         <VolumeX size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Audio Blocked (Tap Screen to Unlock)</span>
                     </div>
                 )}
                 {!config.muteVideos && isAudioUnlocked && (
                     <div className="absolute top-8 right-8 bg-blue-600/60 border border-blue-400/20 px-4 py-2 rounded-full flex items-center gap-2 text-white shadow-xl backdrop-blur-md">
                         <Volume2 size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Audio Active</span>
                     </div>
                 )}
             </div>
         ) : (
             <div className={`w-full h-full flex items-center justify-center relative`}>
                <img 
                  src={currentItem.url} 
                  alt="Screensaver" 
                  className={`max-w-full max-h-full w-auto h-auto shadow-[0_30px_100px_rgba(0,0,0,0.6)] ${animationEffect}`}
                  style={{ borderRadius: '4px' }}
                  onError={handleMediaError}
                />
             </div>
         )}

         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className="absolute bottom-12 left-8 md:bottom-20 md:left-20 max-w-[80%] md:max-w-[70%] pointer-events-none z-30">
                {currentItem.title && (
                    <div className="slide-up">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,1)] mb-2 leading-tight opacity-95 break-words">
                            {currentItem.title}
                        </h1>
                        <div className="h-1 sm:h-1.5 w-16 sm:w-20 bg-blue-500 mt-2 sm:mt-4 mb-4 sm:mb-6 rounded-full shadow-lg shadow-blue-500/50"></div>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center slide-up-delay">
                    {currentItem.subtitle && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-2xl">
                            <p className="text-white text-sm md:text-xl font-bold uppercase tracking-widest drop-shadow-md">
                                {currentItem.subtitle}
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
