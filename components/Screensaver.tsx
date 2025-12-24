
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
      overlayPosition: 'bottom-left',
      animationStyle: 'dynamic',
      showClock: false,
      marqueeText: '',
      marqueeSpeed: 30,
      backgroundBlur: 24,
      ...settings
  };

  // Clock Update
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
                    subtitle: "Catalogue",
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
                    subtitle: p.name,
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
                            subtitle: `${p.name} - Showcase`,
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
  };

  const handleMediaError = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => nextSlide(), 2000); 
  };

  const currentItem = playlist[currentIndex];

  // 2. Effect Selector
  useEffect(() => {
    if (!currentItem) return;

    const dynamicEffects = ['effect-ken-burns', 'effect-twist-enter', 'effect-circle-reveal', 'effect-pan-tilt'];
    const subtleEffects = ['effect-fade-in', 'effect-zoom-soft'];
    
    if (config.animationStyle === 'static') {
        setAnimationEffect('effect-static');
    } else if (config.animationStyle === 'subtle') {
        setAnimationEffect(subtleEffects[Math.floor(Math.random() * subtleEffects.length)]);
    } else {
        // dynamic or mixed
        if (currentItem.type === 'image') {
            setAnimationEffect(dynamicEffects[Math.floor(Math.random() * dynamicEffects.length)]);
        } else {
            setAnimationEffect(subtleEffects[Math.floor(Math.random() * subtleEffects.length)]);
        }
    }
  }, [currentItem?.id, config.animationStyle]);

  // 3. Playback Logic
  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        const duration = (config.imageDuration && config.imageDuration > 0) ? config.imageDuration * 1000 : 8000;
        timerRef.current = window.setTimeout(() => nextSlide(), duration);
    } else {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = config.muteVideos;
            videoRef.current.play().catch(e => {
                if (!videoRef.current!.muted) {
                     videoRef.current!.muted = true;
                     videoRef.current!.play().catch(() => nextSlide());
                } else {
                    nextSlide();
                }
            });
        }
        timerRef.current = window.setTimeout(() => nextSlide(), 180000); 
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, currentItem, animationEffect, config.imageDuration, playlist.length, isSleepMode]);

  if (isSleepMode) {
      return (
          <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm uppercase tracking-widest">Sleep Mode</div>
                  <div className="text-white/40 text-[10px] mt-2 font-black">Tap Screen to Wake</div>
              </div>
          </div>
      );
  }

  if (playlist.length === 0) return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" onClick={onWake}>
          <div className="text-white opacity-10 text-xs font-mono">SYSTEM READY</div>
      </div>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const objectFitClass = config.displayStyle === 'cover' ? 'object-cover' : 'object-contain';

  // Position Classes
  const positionClasses = {
      'bottom-left': 'bottom-12 left-8 md:bottom-20 md:left-20 text-left',
      'bottom-right': 'bottom-12 right-8 md:bottom-20 md:right-20 text-right',
      'top-left': 'top-12 left-8 md:top-20 md:left-20 text-left',
      'top-right': 'top-12 right-8 md:top-20 md:right-20 text-right'
  }[config.overlayPosition || 'bottom-left'];

  const lineClass = (config.overlayPosition?.includes('right')) ? 'ml-auto' : 'mr-auto';

  return (
    <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden">
      <style>{`
        .effect-static { transform: scale(1); }
        .effect-ken-burns { animation: kenBurns 20s ease-out forwards; }
        @keyframes kenBurns { 0% { transform: scale(1); filter: brightness(0.8); } 100% { transform: scale(1.15); filter: brightness(1); } }
        .effect-twist-enter { animation: twistEnter 10s ease-out forwards; }
        @keyframes twistEnter { 0% { opacity: 0; transform: scale(1.5) rotate(-5deg); filter: blur(10px); } 20% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0px); } 100% { transform: scale(1.05) rotate(1deg); } }
        .effect-circle-reveal { animation: circleReveal 8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes circleReveal { 0% { clip-path: circle(0% at 50% 50%); transform: scale(1.2); } 30% { clip-path: circle(150% at 50% 50%); transform: scale(1); } 100% { clip-path: circle(150% at 50% 50%); transform: scale(1.05); } }
        .effect-pan-tilt { animation: panTilt 12s ease-in-out forwards; }
        @keyframes panTilt { 0% { transform: perspective(1000px) rotateY(-5deg) scale(1.1); opacity: 0; } 20% { opacity: 1; } 100% { transform: perspective(1000px) rotateY(5deg) scale(1.2); opacity: 1; } }
        .effect-zoom-soft { animation: zoomSoft 20s linear forwards; }
        @keyframes zoomSoft { from { transform: scale(1); } to { transform: scale(1.1); } }
        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        .slide-up-delay { animation: slideUp 0.8s ease-out forwards 0.5s; opacity: 0; }
        @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .bg-parallax { animation: bgParallax 20s linear infinite alternate; }
        @keyframes bgParallax { 0% { transform: scale(1.2) translate(-2%, -2%); } 100% { transform: scale(1.2) translate(2%, 2%); } }
        
        .marquee-container { width: 100%; overflow: hidden; white-space: nowrap; }
        .marquee-text { display: inline-block; animation: marquee ${config.marqueeSpeed || 30}s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>

      {/* Ambience Layer */}
      <div 
        key={`bg-${currentItem.id}`} 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 bg-parallax"
        style={{ 
            backgroundImage: `url(${currentItem.url})`, 
            filter: `blur(${config.backgroundBlur || 24}px) brightness(0.4)`,
            opacity: 0.6
        }}
      />
      
      {/* Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10" />

      {/* Main Content */}
      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-8 md:p-24 overflow-hidden perspective-1000">
         {currentItem.type === 'video' ? (
             <video 
               ref={videoRef} src={currentItem.url} 
               className={`w-full h-full max-w-full max-h-full ${objectFitClass} shadow-2xl rounded-sm ${animationEffect}`}
               muted={config.muteVideos} autoPlay playsInline onEnded={nextSlide} onError={handleMediaError} 
             />
         ) : (
             <img 
               src={currentItem.url} alt="" 
               className={`max-w-full max-h-full w-auto h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${animationEffect} rounded-md`}
               onError={handleMediaError}
             />
         )}

         {/* Info Overlay */}
         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className={`absolute ${positionClasses} max-w-[80%] md:max-w-[60%] pointer-events-none z-30`}>
                {currentItem.title && (
                    <div className="slide-up">
                        <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2 leading-none opacity-95">
                            {currentItem.title}
                        </h1>
                        <div className={`h-1.5 w-20 bg-blue-500 mt-4 mb-6 rounded-full ${lineClass}`}></div>
                    </div>
                )}
                
                <div className={`flex flex-wrap gap-4 items-center slide-up-delay ${config.overlayPosition?.includes('right') ? 'justify-end' : 'justify-start'}`}>
                    {currentItem.subtitle && (
                        <div className="bg-black/40 backdrop-blur-md border-l-4 border-blue-500 px-5 py-3 rounded-r-lg">
                            <h2 className="text-lg md:text-3xl font-bold text-white tracking-wide uppercase leading-tight">
                                {currentItem.subtitle}
                            </h2>
                        </div>
                    )}
                    {(currentItem.startDate || currentItem.endDate) && (
                        <div className="bg-blue-600 border border-blue-400/30 px-5 py-3 rounded-lg shadow-xl">
                            <p className="text-sm md:text-xl text-white font-mono font-bold uppercase tracking-widest">
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

      {/* Floating Clock */}
      {config.showClock && (
          <div className="absolute top-8 left-8 md:top-12 md:left-12 z-50 flex flex-col items-start bg-black/20 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 text-white">
                  <Clock size={20} className="text-blue-500" />
                  <span className="text-2xl md:text-4xl font-black font-mono tracking-tighter">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1 ml-8">
                  {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
          </div>
      )}

      {/* Marquee Ticker */}
      {config.marqueeText && (
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-blue-600/90 backdrop-blur-md py-2 border-t border-white/10 overflow-hidden">
              <div className="marquee-container">
                  <div className="marquee-text">
                      <span className="text-white font-black uppercase text-xs md:text-sm tracking-[0.1em] px-8">
                          {config.marqueeText} • {config.marqueeText} • {config.marqueeText} • {config.marqueeText}
                      </span>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Screensaver;
