import React, { useEffect, useState, useRef, memo, useMemo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon, VolumeX, Sparkles, MoveUpRight } from 'lucide-react';

interface ScreensaverProps {
  products: FlatProduct[];
  ads: AdItem[];
  pamphlets?: Catalogue[];
  onWake: (targetProductId?: string) => void;
  settings?: ScreensaverSettings;
  isAudioUnlocked?: boolean; 
}

interface PlaylistItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  subtitle?: string;
  targetProductId?: string;
  weight: number;
}

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings, isAudioUnlocked = false }) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [animationEffect, setAnimationEffect] = useState('effect-smooth-zoom');
  
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      ...settings
  };

  useEffect(() => {
      if (!config.enableSleepMode) { setIsSleepMode(false); return; }
      const checkTime = () => {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const [startH, startM] = config.activeHoursStart!.split(':').map(Number);
          const [endH, endM] = config.activeHoursEnd!.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const isActive = startMinutes < endMinutes ? (currentMinutes >= startMinutes && currentMinutes < endMinutes) : (currentMinutes >= startMinutes || currentMinutes < endMinutes);
          setIsSleepMode(!isActive);
      };
      checkTime();
      const interval = setInterval(checkTime, 60000);
      return () => clearInterval(interval);
  }, [config.activeHoursStart, config.activeHoursEnd, config.enableSleepMode]);

  useEffect(() => {
    const list: PlaylistItem[] = [];
    const now = new Date();

    const isLive = (start?: string, end?: string) => {
        if (!start && !end) return true;
        const s = start ? new Date(start) : null;
        const e = end ? new Date(end) : null;
        if (s && now < s) return false;
        if (e && now > e) return false;
        return true;
    };

    if (config.showCustomAds) {
        ads.forEach((ad) => {
          if (isLive(ad.startDate, ad.endDate)) {
              list.push({
                  id: `ad-${ad.id}`,
                  type: ad.type,
                  url: ad.url,
                  title: "Promotional",
                  weight: ad.weight || 3,
                  targetProductId: ad.targetProductId
              });
          }
        });
    }

    if (config.showPamphlets) {
        pamphlets.forEach((pamphlet) => {
           if (pamphlet.pages?.length > 0 && isLive(pamphlet.startDate, pamphlet.endDate)) {
               list.push({
                    id: `pamphlet-${pamphlet.id}`,
                    type: 'image',
                    url: pamphlet.pages[0],
                    title: pamphlet.title,
                    subtitle: "Catalogue",
                    weight: 1
               });
           }
        });
    }

    products.forEach((p) => {
        if (config.showProductImages && p.imageUrl) {
            list.push({ id: `prod-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name, weight: 1, targetProductId: p.id });
        }
        if (config.showProductVideos && p.videoUrl) {
            list.push({ id: `prod-vid-${p.id}`, type: 'video', url: p.videoUrl, title: p.brandName, subtitle: p.name, weight: 1, targetProductId: p.id });
        }
    });

    // Create weighted array
    const weighted: PlaylistItem[] = [];
    list.forEach(item => {
        for(let i=0; i<item.weight; i++) { weighted.push(item); }
    });

    // Shuffle
    for (let i = weighted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
    }

    setPlaylist(weighted);
    setCurrentIndex(0);
  }, [products.length, ads.length, pamphlets.length, config.showProductImages, config.showProductVideos, config.showCustomAds, config.showPamphlets]);

  const nextSlide = () => {
      if (playlist.length === 0) return;
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const currentItem = playlist[currentIndex];

  useEffect(() => {
    if (!currentItem) return;
    const effects = ['effect-smooth-zoom', 'effect-subtle-drift', 'effect-soft-scale', 'effect-gentle-pan'];
    if (config.transitionStyle !== 'random') {
        setAnimationEffect(`effect-${config.transitionStyle}`);
    } else {
        setAnimationEffect(currentItem.type === 'image' ? effects[Math.floor(Math.random() * effects.length)] : 'effect-fade-in');
    }
  }, [currentItem?.id, config.transitionStyle]);

  useEffect(() => {
    if (isSleepMode || !currentItem) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        timerRef.current = window.setTimeout(nextSlide, config.imageDuration * 1000);
    } else if (videoRef.current) {
        videoRef.current.muted = config.muteVideos || !isAudioUnlocked;
        videoRef.current.play().catch(() => nextSlide());
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, currentItem, config.imageDuration, isSleepMode, isAudioUnlocked, config.muteVideos]);

  if (isSleepMode) {
      return (
          <div onClick={() => onWake()} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
              <div className="flex flex-col items-center opacity-30 animate-pulse">
                  <Moon size={48} className="text-blue-500 mb-4" />
                  <div className="text-white font-mono text-sm uppercase tracking-widest">Sleep Mode</div>
              </div>
          </div>
      );
  }

  if (playlist.length === 0) return <div className="fixed inset-0 z-[100] bg-black" onClick={() => onWake()} />;

  return (
    <div 
      onClick={() => onWake(currentItem.targetProductId)}
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden"
    >
      <style>{`
        .effect-smooth-zoom { animation: smoothZoom 15s ease-out forwards; }
        @keyframes smoothZoom { 0% { transform: scale(1.0); opacity: 0.8; } 100% { transform: scale(1.15); opacity: 1; } }
        .effect-subtle-drift { animation: subtleDrift 20s linear forwards; }
        @keyframes subtleDrift { 0% { transform: translate(-2%, -2%) scale(1.05); } 100% { transform: translate(2%, 2%) scale(1.05); } }
        .effect-soft-scale { animation: softScale 10s ease-in-out forwards; }
        @keyframes softScale { 0% { transform: scale(1.2); opacity: 0; } 20% { opacity: 1; } 100% { transform: scale(1.0); } }
        .effect-gentle-pan { animation: gentlePan 12s ease-in-out forwards; }
        @keyframes gentlePan { 0% { transform: translateX(-30px) scale(1.1); } 100% { transform: translateX(30px) scale(1.1); } }
        .effect-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .letterbox-blur { filter: blur(80px) brightness(0.3); transform: scale(1.5); transition: opacity 1s; }
      `}</style>

      <div key={`bg-${currentItem.id}`} className="absolute inset-0 letterbox-blur opacity-50 bg-cover bg-center" style={{ backgroundImage: `url(${currentItem.url})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />

      <div key={`${currentItem.id}-${animationEffect}`} className="w-full h-full relative z-20 flex items-center justify-center p-4">
         {currentItem.type === 'video' ? (
             <video ref={videoRef} src={currentItem.url} className={`max-w-full max-h-full ${config.displayStyle === 'cover' ? 'object-cover' : 'object-contain'} shadow-2xl ${animationEffect}`} muted={config.muteVideos || !isAudioUnlocked} playsInline onEnded={nextSlide} />
         ) : (
             <img src={currentItem.url} className={`max-w-full max-h-full ${config.displayStyle === 'cover' ? 'object-cover' : 'object-contain'} shadow-2xl ${animationEffect}`} loading="eager" />
         )}

         {config.showInfoOverlay && (
             <div className="absolute bottom-16 left-12 max-w-[80%] pointer-events-none z-30 space-y-2">
                <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{currentItem.title}</h1>
                {currentItem.subtitle && (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl w-fit flex items-center gap-3">
                        <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.2em]">{currentItem.subtitle}</p>
                        {currentItem.targetProductId && <Sparkles size={14} className="text-blue-400 animate-pulse" />}
                    </div>
                )}
                {currentItem.targetProductId && (
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mt-4">
                        <MoveUpRight size={14} /> Tap to explore product
                    </div>
                )}
             </div>
         )}

         {!config.muteVideos && !isAudioUnlocked && (
             <div className="absolute top-8 right-8 bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/50">
                 <VolumeX size={16} /> <span className="text-[10px] font-black uppercase">Muted</span>
             </div>
         )}
      </div>
    </div>
  );
};

export default memo(Screensaver);