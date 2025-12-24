
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
  dateAdded?: string;
}

const Screensaver: React.FC<ScreensaverProps> = ({ products, ads, pamphlets = [], onWake, settings }) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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
      transitionStyle: 'mix',
      enableAmbience: true,
      showClock: false,
      clockFormat: '24h',
      marketingWeight: 3,
      ...settings
  };

  useEffect(() => {
    if (!config.showClock) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [config.showClock]);

  useEffect(() => {
      if (!config.enableSleepMode) { setIsSleepMode(false); return; }
      const checkTime = () => {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const [startH, startM] = config.activeHoursStart!.split(':').map(Number);
          const [endH, endM] = config.activeHoursEnd!.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const isActive = startMinutes < endMinutes 
              ? currentMinutes >= startMinutes && currentMinutes < endMinutes
              : currentMinutes >= startMinutes || currentMinutes < endMinutes;
          setIsSleepMode(!isActive);
      };
      checkTime();
      const interval = setInterval(checkTime, 60000);
      return () => clearInterval(interval);
  }, [config.activeHoursStart, config.activeHoursEnd, config.enableSleepMode]);

  useEffect(() => {
    const list: PlaylistItem[] = [];
    if (config.showCustomAds) {
        const weight = config.marketingWeight || 3;
        ads.forEach(ad => {
          for(let i=0; i<weight; i++) {
              list.push({ id: `ad-${ad.id}-${i}`, type: ad.type, url: ad.url, title: "Special Promotion", subtitle: "Limited Offer" });
          }
        });
    }
    products.forEach(p => {
        if (config.showProductImages && p.imageUrl) list.push({ id: `prod-img-${p.id}`, type: 'image', url: p.imageUrl, title: p.brandName, subtitle: p.name });
        if (config.showProductVideos && p.videoUrl) list.push({ id: `prod-vid-${p.id}`, type: 'video', url: p.videoUrl, title: p.brandName, subtitle: p.name });
    });
    setPlaylist(list.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  }, [products.length, ads.length, config.marketingWeight]);

  useEffect(() => {
    if (isSleepMode || playlist.length === 0) return;
    const item = playlist[currentIndex];
    if (item.type === 'image') {
      timerRef.current = window.setTimeout(() => setCurrentIndex(prev => (prev + 1) % playlist.length), config.imageDuration * 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, playlist, isSleepMode]);

  if (isSleepMode) return <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center" onClick={onWake}><Moon className="text-slate-800" size={64} /></div>;
  if (playlist.length === 0) return null;
  const currentItem = playlist[currentIndex];

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden flex items-center justify-center cursor-none" onClick={onWake}>
        {config.enableAmbience && <div className="absolute inset-0 z-0 opacity-30 blur-3xl scale-110"><img src={currentItem.url} className="w-full h-full object-cover" alt="" /></div>}
        <div className="relative w-full h-full flex items-center justify-center z-10">
             {currentItem.type === 'video' ? <video src={currentItem.url} autoPlay muted={config.muteVideos} onEnded={() => setCurrentIndex(prev => (prev + 1) % playlist.length)} className={`w-full h-full ${config.displayStyle === 'cover' ? 'object-cover' : 'object-contain'}`} /> : <img src={currentItem.url} className={`w-full h-full transition-all duration-1000 ${config.displayStyle === 'cover' ? 'object-cover' : 'object-contain'}`} alt="" />}
        </div>
        {config.showInfoOverlay && <div className="absolute bottom-12 left-12 right-12 z-20 flex justify-between items-end animate-fade-in"><div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 max-w-xl"><h2 className="text-white text-5xl font-black uppercase tracking-tighter mb-2">{currentItem.title}</h2><p className="text-blue-400 text-xl font-bold uppercase tracking-widest">{currentItem.subtitle}</p></div>{config.showClock && <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-right"><div className="flex items-center gap-3 text-white/40 mb-2 justify-end"><Clock size={20} /><span className="text-xs font-black uppercase tracking-widest">Store Time</span></div><div className="text-white text-6xl font-black font-mono tracking-tighter">{currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: config.clockFormat === '12h' })}</div></div>}</div>}
    </div>
  );
};
export default Screensaver;
