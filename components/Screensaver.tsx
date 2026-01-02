
import React, { useEffect, useState, useRef, memo, useCallback } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, Volume2, VolumeX, Pointer, Music, Loader2 } from 'lucide-react';

interface ScreensaverProps {
  products: FlatProduct[];
  ads: AdItem[];
  pamphlets?: Catalogue[];
  onWake: () => void;
  settings?: ScreensaverSettings;
  isAudioUnlocked?: boolean;
  onAudioUnlock?: () => void;
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

const Screensaver: React.FC<ScreensaverProps> = ({ 
    products, 
    ads, 
    pamphlets = [], 
    onWake, 
    settings,
    isAudioUnlocked: globalAudioUnlocked = false,
    onAudioUnlock
}) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [localAudioUnlocked, setLocalAudioUnlocked] = useState(globalAudioUnlocked);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  const [animationEffect, setAnimationEffect] = useState('effect-ken-burns');
  
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isUnlocked = globalAudioUnlocked || localAudioUnlocked;

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

  const nextSlide = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  useEffect(() => {
      if (!config.enableSleepMode) {
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
            ? (currentMinutes >= startMinutes && currentMinutes < endMinutes)
            : (currentMinutes >= startMinutes || currentMinutes < endMinutes);
          setIsSleepMode(!isActive);
      };
      checkTime();
      const interval = setInterval(checkTime, 60000);
      return () => clearInterval(interval);
  }, [config.activeHoursStart, config.activeHoursEnd, config.enableSleepMode]);

  const handleManualUnlock = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setLocalAudioUnlocked(true);
      if (onAudioUnlock) onAudioUnlock();
      setIsAutoplayBlocked(false);
      
      if (videoRef.current && !config.muteVideos) {
          videoRef.current.muted = false;
          videoRef.current.play().catch(() => {});
      }
  };

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
                list.push({ id: `ad-${ad.id}-${i}-${c}`, type: ad.type, url: ad.url, title: "Marketing Highlight", dateAdded: ad.dateAdded });
            }
          }
        });
    }
    if (config.showPamphlets) {
        pamphlets.forEach((p) => {
           if (p.pages?.length > 0 && (!p.endDate || shouldIncludeItem(p.startDate))) {
              list.push({ id: `pamphlet-${p.id}`, type: 'image', url: p.pages[0], title: p.title, subtitle: "Current Catalogue" });
           }
        });
    }
    products.forEach((p) => {
        if (!shouldIncludeItem(p.dateAdded)) return;
        if (config.showProductImages && p.imageUrl) {
            list.push({ id: `prod-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name, dateAdded: p.dateAdded });
        }
        if (config.showProductVideos) {
            const vids = [...(p.videoUrls || []), p.videoUrl].filter(Boolean);
            vids.forEach((url, idx) => {
                list.push({ id: `prod-vid-${p.id}-${idx}`, type: 'video', url: url!, title: p.brandName, subtitle: p.name, dateAdded: p.dateAdded });
            });
        }
    });

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    setPlaylist(list);
    setCurrentIndex(0);
  }, [products.length, ads.length, pamphlets.length, config.showProductImages, config.showProductVideos]);

  const currentItem = playlist[currentIndex];

  useEffect(() => {
    if (!currentItem) return;
    const imageEffects = ['effect-ken-burns', 'effect-pop-dynamic', 'effect-twist-enter', 'effect-circle-reveal', 'effect-pan-tilt'];
    const videoEffects = ['effect-fade-in', 'effect-zoom-soft']; 
    setAnimationEffect(currentItem.type === 'image' 
        ? imageEffects[Math.floor(Math.random() * imageEffects.length)]
        : videoEffects[Math.floor(Math.random() * videoEffects.length)]);
    
    if (currentItem.type === 'video') {
        setIsVideoLoading(true);
    }
  }, [currentItem?.id]);

  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        timerRef.current = window.setTimeout(nextSlide, (config.imageDuration || 8) * 1000);
    } else {
        // Safe play sequence
        const attemptPlay = async () => {
            if (!videoRef.current) return;
            
            // 1. Initial State: Set muted based on hardware unlock to increase play success
            videoRef.current.muted = config.muteVideos || !isUnlocked;
            
            try {
                await videoRef.current.play();
                setIsAutoplayBlocked(false);
            } catch (err) {
                // 2. Fallback: Browser blocked sound. Force muted play.
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    try {
                        await videoRef.current.play();
                        if (!config.muteVideos && !isUnlocked) {
                            setIsAutoplayBlocked(true);
                        }
                    } catch (finalErr) {
                        console.error("Video failed to play even in muted mode:", finalErr);
                        nextSlide();
                    }
                }
            }
        };

        attemptPlay();
        // Emergency watchdog: If video hangs without ending, skip after 3 minutes
        timerRef.current = window.setTimeout(nextSlide, 180000); 
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, currentItem, isSleepMode, isUnlocked, config.muteVideos, nextSlide]);

  if (isSleepMode) {
      return (
          <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm uppercase tracking-widest">Sleep Mode Active</div>
                  <div className="text-white/50 text-[10px] mt-2 font-black uppercase">Tap to Wake System</div>
              </div>
          </div>
      );
  }

  if (playlist.length === 0) return null;

  const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div 
      onClick={onWake}
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden"
    >
      <style>{`
        .effect-ken-burns { animation: kenBurns 20s ease-out forwards; }
        @keyframes kenBurns { 0% { transform: scale(1); filter: brightness(0.8); } 100% { transform: scale(1.15); filter: brightness(1); } }
        .effect-pop-dynamic { animation: popDynamic 8s ease-out forwards; }
        @keyframes popDynamic { 0% { opacity: 0; transform: scale(0.8); } 20% { opacity: 1; transform: scale(1.02); } 100% { transform: scale(1); } }
        .effect-twist-enter { animation: twistEnter 10s ease-out forwards; }
        @keyframes twistEnter { 0% { opacity: 0; transform: scale(1.2) rotate(-5deg); filter: blur(10px); } 20% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0px); } 100% { transform: scale(1.05) rotate(1deg); } }
        .effect-circle-reveal { animation: circleReveal 8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes circleReveal { 0% { clip-path: circle(0% at 50% 50%); } 30% { clip-path: circle(150% at 50% 50%); } 100% { transform: scale(1.05); } }
        .effect-pan-tilt { animation: panTilt 12s ease-in-out forwards; }
        @keyframes panTilt { 0% { transform: perspective(1000px) rotateY(-5deg) scale(1); opacity: 0; } 20% { opacity: 1; } 100% { transform: perspective(1000px) rotateY(5deg) scale(1.1); } }
        .effect-fade-in { animation: fadeInVideo 1.5s ease-out forwards; }
        @keyframes fadeInVideo { from { opacity: 0; } to { opacity: 1; } }
        .effect-zoom-soft { animation: zoomSoft 20s linear forwards; }
        @keyframes zoomSoft { from { transform: scale(1); } to { transform: scale(1.1); } }
        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        @keyframes slideUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div 
        key={`bg-${currentItem.id}`} 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 transition-all duration-1000 blur-3xl scale-125"
        style={{ backgroundImage: `url(${currentItem.url})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 z-10" />

      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-4 md:p-24 overflow-hidden">
         {currentItem.type === 'video' ? (
             <div className="relative w-full h-full flex items-center justify-center">
                 {isVideoLoading && (
                     <div className="absolute inset-0 z-10 flex items-center justify-center">
                         <Loader2 size={48} className="text-blue-500 animate-spin opacity-30" />
                     </div>
                 )}
                 <video 
                    ref={videoRef}
                    src={currentItem.url} 
                    className={`w-full h-full max-w-full max-h-full ${objectFitClass} shadow-2xl rounded-sm ${animationEffect} ${isVideoLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}
                    muted={config.muteVideos || !isUnlocked} 
                    autoPlay
                    playsInline
                    onLoadedData={() => setIsVideoLoading(false)}
                    onEnded={nextSlide} 
                    onError={() => {
                        console.error("Media source error for:", currentItem.url);
                        nextSlide();
                    }} 
                 />
             </div>
         ) : (
            <img 
              src={currentItem.url} 
              alt="" 
              className={`max-w-full max-h-full w-auto h-auto shadow-2xl ${animationEffect}`}
              loading="eager"
            />
         )}

         {/* UNLOCK AUDIO OVERLAY */}
         {isAutoplayBlocked && !isUnlocked && !config.muteVideos && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                 <button 
                    onClick={handleManualUnlock}
                    className="bg-white text-slate-900 px-8 py-5 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.3)] flex flex-col items-center gap-4 hover:scale-105 active:scale-95 transition-all group"
                 >
                     <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:animate-bounce">
                         <Volume2 size={32} />
                     </div>
                     <div className="text-center">
                         <div className="font-black uppercase tracking-widest text-lg">Interactive Audio</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Tap to Enable Full Experience</div>
                     </div>
                 </button>
             </div>
         )}

         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className="absolute bottom-12 left-8 md:bottom-20 md:left-20 max-w-[80%] pointer-events-none z-30">
                {currentItem.title && (
                    <div className="slide-up">
                        <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-2 leading-none">
                            {currentItem.title}
                        </h1>
                        <div className="h-1.5 w-20 bg-blue-500 my-4 rounded-full shadow-lg"></div>
                    </div>
                )}
                {currentItem.subtitle && (
                    <div className="slide-up" style={{ animationDelay: '0.5s' }}>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl inline-block">
                            <p className="text-white text-sm md:text-xl font-bold uppercase tracking-widest">
                                {currentItem.subtitle}
                            </p>
                        </div>
                    </div>
                )}
             </div>
         )}
      </div>
    </div>
  );
};

export default memo(Screensaver);
