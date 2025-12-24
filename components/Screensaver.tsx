
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, Clock, QrCode } from 'lucide-react';

interface ScreensaverProps {
  products: FlatProduct[];
  ads: AdItem[];
  pamphlets?: Catalogue[];
  onWake: () => void;
  settings?: ScreensaverSettings;
  companyLogo?: string;
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

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings, companyLogo }) => {
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
      transitionStyle: 'random',
      showClock: true,
      clockFormat: '24h',
      overlayPosition: 'bottom-left',
      overlayTheme: 'glass',
      showWatermark: false,
      watermarkOpacity: 0.2,
      showQrCode: false,
      ...settings
  };

  // 1. Clock Update
  useEffect(() => {
    if (!config.showClock) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [config.showClock]);

  // 2. Check Active Hours for Sleep Mode
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

  // Aging Logic
  const shouldIncludeItem = (dateString?: string): boolean => {
      if (!dateString) return true;
      const addedDate = new Date(dateString);
      const now = new Date();
      const monthsOld = (now.getFullYear() - addedDate.getFullYear()) * 12 + (now.getMonth() - addedDate.getMonth());
      if (monthsOld >= 6) return Math.random() < 0.25; 
      return true;
  };

  // 3. Build & Shuffle Playlist
  useEffect(() => {
    const list: PlaylistItem[] = [];

    if (config.showCustomAds) {
        ads.forEach((ad, i) => {
          if (shouldIncludeItem(ad.dateAdded)) {
            for(let c=0; c<3; c++) {
                list.push({ id: `ad-${ad.id}-${i}-${c}`, type: ad.type, url: ad.url, title: "Special Feature", dateAdded: ad.dateAdded });
            }
          }
        });
    }

    if (config.showPamphlets) {
        pamphlets.forEach((pamphlet) => {
           if (pamphlet.pages && pamphlet.pages.length > 0) {
               if (!pamphlet.endDate || shouldIncludeItem(pamphlet.startDate)) {
                  list.push({ id: `pamphlet-${pamphlet.id}`, type: 'image', url: pamphlet.pages[0], title: pamphlet.title, subtitle: "Interactive Brochure" });
               }
           }
        });
    }

    products.forEach((p) => {
        if (!shouldIncludeItem(p.dateAdded)) return;
        if (config.showProductImages && p.imageUrl) {
            list.push({ id: `prod-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name, dateAdded: p.dateAdded });
        }
        if (config.showProductVideos) {
            const vids = p.videoUrls || (p.videoUrl ? [p.videoUrl] : []);
            vids.forEach((url, idx) => {
                list.push({ id: `prod-vid-${p.id}-${idx}`, type: 'video', url: url, title: p.brandName, subtitle: p.name, dateAdded: p.dateAdded });
            });
        }
    });

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    setPlaylist(list);
    setCurrentIndex(0);
  }, [products.length, ads.length, pamphlets.length, config.showProductImages, config.showProductVideos, config.showCustomAds, config.showPamphlets]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % playlist.length);

  const handleMediaError = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(nextSlide, 2000); 
  };

  const currentItem = playlist[currentIndex];

  // Transition Selector logic
  useEffect(() => {
    if (!currentItem) return;
    if (config.transitionStyle && config.transitionStyle !== 'random') {
        setAnimationEffect(`effect-${config.transitionStyle}`);
        return;
    }
    const effects = ['effect-ken-burns', 'effect-fade', 'effect-zoom', 'effect-slide', 'effect-circle-reveal'];
    setAnimationEffect(effects[Math.floor(Math.random() * effects.length)]);
  }, [currentItem?.id, config.transitionStyle]);

  // Playback Logic
  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        const duration = (config.imageDuration && config.imageDuration > 0) ? config.imageDuration * 1000 : 8000;
        timerRef.current = window.setTimeout(nextSlide, duration);
    } else {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = config.muteVideos;
            videoRef.current.play().catch(() => nextSlide());
        }
        timerRef.current = window.setTimeout(nextSlide, 180000); 
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, currentItem, animationEffect, config.imageDuration, playlist.length, isSleepMode]);

  if (isSleepMode) return (
      <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
          <div className="flex flex-col items-center opacity-30 animate-pulse">
              <Moon size={48} className="text-blue-500 mb-4" />
              <div className="text-white font-mono text-sm uppercase tracking-widest">Sleep Mode Active</div>
          </div>
      </div>
  );

  if (playlist.length === 0) return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" onClick={onWake}>
          <div className="text-white opacity-10 text-[10px] font-mono">Initializing Sequence...</div>
      </div>
  );

  const getOverlayPosition = () => {
      switch(config.overlayPosition) {
          case 'top-left': return 'top-12 left-12';
          case 'top-right': return 'top-12 right-12 text-right';
          case 'bottom-right': return 'bottom-12 right-12 text-right';
          case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center';
          default: return 'bottom-12 left-12';
      }
  };

  const getOverlayTheme = () => {
      switch(config.overlayTheme) {
          case 'dark': return 'bg-black/80 border-white/10';
          case 'blue': return 'bg-blue-900/80 border-blue-500/30';
          case 'light': return 'bg-white/90 border-slate-200 text-slate-900';
          default: return 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl';
      }
  };

  const timeString = currentTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: config.clockFormat === '12h' 
  });

  return (
    <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden">
      <style>{`
        .effect-ken-burns { animation: kenBurns 20s ease-out forwards; }
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        .effect-fade { animation: fadeEffect 1.5s ease-out forwards; }
        @keyframes fadeEffect { 0% { opacity: 0; } 100% { opacity: 1; } }
        .effect-zoom { animation: zoomEffect 10s ease-out forwards; }
        @keyframes zoomEffect { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .effect-slide { animation: slideEffect 1s cubic-bezier(0.2, 0, 0.2, 1) forwards; }
        @keyframes slideEffect { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
        .effect-circle-reveal { animation: circleReveal 2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes circleReveal { 0% { clip-path: circle(0% at 50% 50%); } 100% { clip-path: circle(150% at 50% 50%); } }
        .slide-up { animation: slideUp 0.8s ease-out forwards 0.3s; opacity: 0; }
        @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Ambient Background */}
      <div key={`bg-${currentItem.id}`} className="absolute inset-0 z-0 bg-cover bg-center opacity-30 transition-all duration-1000 blur-3xl scale-125" style={{ backgroundImage: `url(${currentItem.url})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10" />

      {/* Main Content */}
      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-0 overflow-hidden">
         {currentItem.type === 'video' ? (
             <video 
               ref={videoRef} src={currentItem.url} 
               className={`w-full h-full max-w-full max-h-full ${config.displayStyle === 'cover' ? 'object-cover' : 'object-contain'} ${animationEffect}`}
               muted={config.muteVideos} autoPlay playsInline onEnded={nextSlide} onError={handleMediaError} 
             />
         ) : (
             <img 
               src={currentItem.url} alt="" 
               className={`w-full h-full ${config.displayStyle === 'cover' ? 'object-cover' : 'object-contain'} ${animationEffect}`}
               onError={handleMediaError}
             />
         )}

         {/* Info Overlay */}
         {config.showInfoOverlay && (currentItem.title || currentItem.subtitle) && (
             <div className={`absolute z-30 pointer-events-none p-8 rounded-3xl border shadow-2xl slide-up ${getOverlayPosition()} ${getOverlayTheme()}`}>
                {currentItem.title && <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">{currentItem.title}</h1>}
                {currentItem.subtitle && (
                    <div className="h-1 w-20 bg-blue-500 mb-4 rounded-full mx-auto md:mx-0"></div>
                )}
                {currentItem.subtitle && <h2 className="text-sm md:text-xl font-bold uppercase tracking-widest opacity-80">{currentItem.subtitle}</h2>}
             </div>
         )}

         {/* Live Clock Overlay */}
         {config.showClock && (
             <div className="absolute top-12 right-12 z-40 bg-black/40 backdrop-blur-lg px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 text-white">
                 <Clock size={24} className="text-blue-400" />
                 <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-widest leading-none">{timeString}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 mt-1">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                 </div>
             </div>
         )}

         {/* QR Code Overlay */}
         {config.showQrCode && (
             <div className="absolute bottom-12 right-12 z-40 bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 group hover:scale-105 transition-transform">
                 <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <QrCode size={64} className="text-slate-900" />
                 </div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scan to Visit</span>
             </div>
         )}

         {/* Watermark */}
         {config.showWatermark && companyLogo && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3" style={{ opacity: config.watermarkOpacity }}>
                 <img src={companyLogo} className="h-8 grayscale invert brightness-0" alt="" />
                 <div className="h-4 w-[1px] bg-white opacity-30"></div>
                 <span className="text-[10px] font-black uppercase text-white tracking-[0.4em]">Official Showcase</span>
             </div>
         )}
      </div>
    </div>
  );
};

export default Screensaver;
