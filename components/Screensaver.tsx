import React, { useEffect, useState, useRef, memo, useMemo } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings, ScreensaverAnimationMode } from '../types';
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
  dateAdded?: string;
}

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings, isAudioUnlocked = false }) => {
  // Config merged with defaults
  const config: ScreensaverSettings = useMemo(() => ({
    idleTimeout: 60,
    imageDuration: 8,
    muteVideos: false,
    showProductImages: true,
    showProductVideos: true,
    showPamphlets: true,
    showCustomAds: true,
    displayStyle: 'contain', 
    animationMode: 'random-mix',
    showInfoOverlay: true,
    enableSleepMode: false,
    activeHoursStart: '08:00',
    activeHoursEnd: '20:00',
    ...settings
  }), [settings]);

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [isSleepMode, setIsSleepMode] = useState(false);

  // Double Buffer State
  const [activeBuffer, setActiveBuffer] = useState<'A' | 'B'>('A');
  const [slideA, setSlideA] = useState<PlaylistItem | null>(null);
  const [slideB, setSlideB] = useState<PlaylistItem | null>(null);
  const [effectA, setEffectA] = useState('');
  const [effectB, setEffectB] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const timerRef = useRef<number | null>(null);
  const videoRefs = {
    A: useRef<HTMLVideoElement>(null),
    B: useRef<HTMLVideoElement>(null)
  };

  // 1. SLEEP MODE LOGIC
  useEffect(() => {
    if (!config.enableSleepMode || !config.activeHoursStart || !config.activeHoursEnd) {
      setIsSleepMode(false);
      return;
    }
    const checkTime = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [sh, sm] = config.activeHoursStart!.split(':').map(Number);
      const [eh, em] = config.activeHoursEnd!.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      let isActive = start < end ? (currentMinutes >= start && currentMinutes < end) : (currentMinutes >= start || currentMinutes < end);
      setIsSleepMode(!isActive);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [config]);

  // 2. PLAYLIST GENERATOR
  useEffect(() => {
    const list: PlaylistItem[] = [];
    if (config.showCustomAds) {
      ads.forEach((ad, i) => {
        list.push({ id: `ad-${ad.id}-${i}`, type: ad.type, url: ad.url, title: "Official Advertisement", dateAdded: ad.dateAdded });
      });
    }
    if (config.showPamphlets) {
      pamphlets.forEach((pamphlet) => {
        if (pamphlet.pages?.length > 0) {
          list.push({ id: `pam-${pamphlet.id}`, type: 'image', url: pamphlet.pages[0], title: pamphlet.title, subtitle: "Full Catalogue Inside" });
        }
      });
    }
    products.forEach((p) => {
      if (config.showProductImages && p.imageUrl) {
        list.push({ id: `img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name });
      }
      if (config.showProductVideos) {
        const vurls = p.videoUrls || (p.videoUrl ? [p.videoUrl] : []);
        vurls.forEach((url, idx) => {
          list.push({ id: `vid-${p.id}-${idx}`, type: 'video', url, title: p.brandName, subtitle: p.name });
        });
      }
    });
    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setPlaylist(list);
    if (list.length > 0) {
      setSlideA(list[0]);
      setActiveBuffer('A');
    }
  }, [products.length, ads.length, pamphlets.length, config]);

  const getRandomEffect = (type: 'image' | 'video'): string => {
    if (type === 'video') return 'effect-fade-in';
    const modes: ScreensaverAnimationMode[] = ['ken-burns', 'cinematic-pan', 'floating-drift', 'gentle-pulse'];
    const chosen = config.animationMode === 'random-mix' ? modes[Math.floor(Math.random() * modes.length)] : (config.animationMode || 'ken-burns');
    return `effect-${chosen}`;
  };

  // 3. SEAMLESS TRANSITION ENGINE
  const triggerTransition = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    const nextItem = playlist[nextIdx];
    
    if (activeBuffer === 'A') {
      setSlideB(nextItem);
      setEffectB(getRandomEffect(nextItem.type));
      // Buffer will cross-fade once ready (handled in component via useEffect)
    } else {
      setSlideA(nextItem);
      setEffectA(getRandomEffect(nextItem.type));
    }
    setCurrentIndex(nextIdx);
  };

  // Effect to switch active buffer once data is ready
  useEffect(() => {
    if (playlist.length === 0) return;
    
    const nextIdx = (currentIndex + 1) % playlist.length;
    const item = playlist[currentIndex];

    if (timerRef.current) clearTimeout(timerRef.current);

    if (item.type === 'image') {
      timerRef.current = window.setTimeout(() => {
        setActiveBuffer(prev => (prev === 'A' ? 'B' : 'A'));
        triggerTransition();
      }, config.imageDuration * 1000);
    } else {
      // Video timing handled by onEnded
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, playlist, config.imageDuration]);

  if (isSleepMode) {
    return (
      <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center">
        <div className="flex flex-col items-center opacity-30 animate-pulse">
          <Moon size={48} className="text-blue-500 mb-4" />
          <div className="text-white font-mono text-sm uppercase tracking-widest">Sleep Mode Active</div>
          <div className="text-white/50 text-xs mt-2 uppercase">Tap to Wake Kiosk</div>
        </div>
      </div>
    );
  }

  if (playlist.length === 0) return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer" onClick={onWake}>
      <div className="text-white opacity-30 text-xs font-mono uppercase tracking-widest">No Items in Playlist</div>
    </div>
  );

  const renderContent = (buffer: 'A' | 'B', item: PlaylistItem | null, isActive: boolean, effect: string) => {
    if (!item) return null;
    const isMuted = config.muteVideos || !isAudioUnlocked;
    const fit = config.displayStyle || 'contain';

    return (
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
        {/* Cinematic Letterbox Aura */}
        <div 
          className="absolute inset-0 z-0 opacity-40 blur-3xl scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        <div className="relative w-full h-full flex items-center justify-center p-8 md:p-20 overflow-hidden">
          {item.type === 'video' ? (
            <video 
              ref={videoRefs[buffer]}
              src={item.url}
              className={`max-w-full max-h-full shadow-2xl object-${fit} ${effect}`}
              muted={isMuted}
              playsInline
              autoPlay={isActive}
              onEnded={() => {
                if (isActive) {
                  setActiveBuffer(prev => (prev === 'A' ? 'B' : 'A'));
                  triggerTransition();
                }
              }}
            />
          ) : (
            <img 
              src={item.url}
              className={`max-w-full max-h-full shadow-2xl object-${fit} ${effect}`}
              alt=""
            />
          )}

          {config.showInfoOverlay && (item.title || item.subtitle) && isActive && (
             <div className="absolute bottom-16 left-16 md:bottom-24 md:left-24 max-w-[80%] pointer-events-none z-30 animate-slide-up">
                <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-2">{item.title}</h1>
                <div className="h-2 w-24 bg-blue-600 mb-4 rounded-full shadow-lg"></div>
                {item.subtitle && (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-2xl w-fit shadow-2xl">
                        <p className="text-white text-sm md:text-xl font-black uppercase tracking-[0.2em]">{item.subtitle}</p>
                    </div>
                )}
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer overflow-hidden">
      <style>{`
        .effect-static-contain { transform: scale(1); }
        .effect-static-fill { transform: scale(1); }
        
        .effect-ken-burns { animation: kenBurns 20s ease-out infinite alternate; }
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.2); } }

        .effect-cinematic-pan { animation: cinematicPan 15s linear infinite alternate; }
        @keyframes cinematicPan { 0% { transform: translateX(-5%); } 100% { transform: translateX(5%); } }

        .effect-floating-drift { animation: floatingDrift 10s ease-in-out infinite alternate; }
        @keyframes floatingDrift { 
          0% { transform: translate3d(-10px, -10px, 0) rotate(0.1deg); } 
          100% { transform: translate3d(10px, 10px, 0) rotate(-0.1deg); } 
        }

        .effect-gentle-pulse { animation: gentlePulse 6s ease-in-out infinite; }
        @keyframes gentlePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }

        .effect-fade-in { animation: fadeIn 1.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        img, video { will-change: transform, opacity; contain: content; }
      `}</style>

      {renderContent('A', slideA, activeBuffer === 'A', effectA)}
      {renderContent('B', slideB, activeBuffer === 'B', effectB)}

      {!config.muteVideos && !isAudioUnlocked && (
          <div className="absolute top-12 right-12 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 text-white/50 animate-pulse z-50 shadow-2xl">
              <VolumeX size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Tap to Unmute</span>
          </div>
      )}
    </div>
  );
};

export default memo(Screensaver);