
import React, { useEffect, useState, useRef } from 'react';
import { FlatProduct, AdItem, Catalogue, ScreensaverSettings } from '../types';
import { Moon } from 'lucide-react';

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
  const [animationEffect, setAnimationEffect] = useState('effect-ken-burns');
  
  const timerRef = useRef<number | null>(null);
  const checkTimeIntervalRef = useRef<number | null>(null);
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
      checkTimeIntervalRef.current = window.setInterval(checkTime, 60000);
      return () => {
          if (checkTimeIntervalRef.current) clearInterval(checkTimeIntervalRef.current);
      };
  }, [config.activeHoursStart, config.activeHoursEnd, config.enableSleepMode]);

  useEffect(() => {
    const list: PlaylistItem[] = [];
    if (config.showCustomAds) {
        ads.forEach((ad, i) => {
          for(let c=0; c<3; c++) {
              list.push({ id: `ad-${ad.id}-${i}-${c}`, type: ad.type, url: ad.url, title: "Sponsored", dateAdded: ad.dateAdded });
          }
        });
    }
    if (config.showPamphlets) {
        pamphlets.forEach((p) => {
           if (p.pages?.length > 0) list.push({ id: `pamp-${p.id}`, type: 'image', url: p.pages[0], title: p.title });
        });
    }
    products.forEach((p) => {
        if (config.showProductImages && p.imageUrl) list.push({ id: `prod-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name });
    });

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    setPlaylist(list);
    setCurrentIndex(0);
  }, [products.length, ads.length, pamphlets.length, config.showProductImages, config.showProductVideos, config.showCustomAds, config.showPamphlets]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % playlist.length);

  const currentItem = playlist[currentIndex];

  useEffect(() => {
    if (isSleepMode || !currentItem || playlist.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentItem.type === 'image') {
        timerRef.current = window.setTimeout(nextSlide, config.imageDuration * 1000);
    } else if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => nextSlide());
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, currentItem, config.imageDuration, playlist.length, isSleepMode]);

  if (isSleepMode) return <div onClick={onWake} className="fixed inset-0 z-[100] bg-black flex items-center justify-center"><Moon size={48} className="text-blue-500 opacity-20" /></div>;
  if (playlist.length === 0) return <div className="fixed inset-0 z-[100] bg-black" onClick={onWake} />;

  return (
    <div onClick={onWake} className="fixed inset-0 z-[100] bg-black cursor-pointer overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl transition-all duration-1000" style={{ backgroundImage: `url(${currentItem.url})` }} />
      <div className="w-full h-full relative z-20 flex items-center justify-center p-8">
         {currentItem.type === 'video' ? (
             <video ref={videoRef} src={currentItem.url} className="w-full h-full object-contain" muted={config.muteVideos} autoPlay onEnded={nextSlide} />
         ) : (
             <img src={currentItem.url} className="max-w-full max-h-full object-contain shadow-2xl" />
         )}
      </div>
    </div>
  );
};

export default Screensaver;
