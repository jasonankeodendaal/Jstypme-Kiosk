
import React, { useState, useEffect, useRef } from 'react';
import { StoreData, TVBrand, TVModel } from '../types';
import { Play, Tv, ArrowLeft, ChevronLeft, ChevronRight, Pause, RotateCcw, MonitorPlay, MonitorStop, Film, LayoutGrid, SkipForward, Monitor } from 'lucide-react';

interface TVModeProps {
  storeData: StoreData;
  onRefresh: () => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
}

const TVMode: React.FC<TVModeProps> = ({ storeData, onRefresh, screensaverEnabled, onToggleScreensaver }) => {
  const [viewingBrand, setViewingBrand] = useState<TVBrand | null>(null);
  const [viewingModel, setViewingModel] = useState<TVModel | null>(null);
  
  const [activePlaylist, setActivePlaylist] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isPaused, setIsPaused] = useState(false); 

  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<number | null>(null);
  const watchdogRef = useRef<number | null>(null);

  const tvBrands = storeData.tv?.brands || [];

  const handleUserActivity = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => setShowControls(false), 4000);
  };

  useEffect(() => {
      if (isPlaying) {
          window.addEventListener('mousemove', handleUserActivity);
          window.addEventListener('touchstart', handleUserActivity);
          window.addEventListener('keydown', handleUserActivity);
          handleUserActivity();
      }
      return () => {
          window.removeEventListener('mousemove', handleUserActivity);
          window.removeEventListener('touchstart', handleUserActivity);
          window.removeEventListener('keydown', handleUserActivity);
          if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      };
  }, [isPlaying]);

  const handlePlayGlobal = () => {
      if (tvBrands.length === 0) return;
      const allVideos = tvBrands.flatMap(b => (b.models || []).flatMap(m => m.videoUrls || []));
      if (allVideos.length === 0) return;
      
      const shuffled = [...allVideos];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setActivePlaylist(shuffled);
      setCurrentVideoIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
  };

  const handlePlayModel = (model: TVModel, startIndex: number = 0) => {
      if (!model.videoUrls?.length) return;
      setActivePlaylist(model.videoUrls);
      setCurrentVideoIndex(startIndex);
      setIsPlaying(true);
      setIsPaused(false);
  };

  const handlePlayBrandLoop = (brand: TVBrand) => {
      const allBrandVideos = (brand.models || []).flatMap(m => m.videoUrls || []);
      if (!allBrandVideos.length) return;
      setActivePlaylist(allBrandVideos);
      setCurrentVideoIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
  };

  const skipToNext = () => {
      const nextIndex = (currentVideoIndex + 1) % activePlaylist.length;
      if (nextIndex === currentVideoIndex) {
          if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(console.warn);
          }
      } else {
          setCurrentVideoIndex(nextIndex);
      }
  };

  useEffect(() => {
    if (isPlaying && activePlaylist.length > 0) {
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
        // Force skip if video stays on screen too long without event
        watchdogRef.current = window.setTimeout(() => {
            console.warn("TV Mode Watchdog Triggered");
            skipToNext();
        }, 120000); // 2 minute maximum for any single video
    }
    return () => { if (watchdogRef.current) clearTimeout(watchdogRef.current); };
  }, [currentVideoIndex, isPlaying, activePlaylist.length]);

  const handleVideoEnded = () => {
      skipToNext();
  };

  const handleNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      skipToNext();
  };

  const handlePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      const prevIndex = (currentVideoIndex - 1 + activePlaylist.length) % activePlaylist.length;
      if (prevIndex === currentVideoIndex && videoRef.current) {
           videoRef.current.currentTime = 0;
           videoRef.current.play().catch(console.warn);
      } else {
           setCurrentVideoIndex(prevIndex);
      }
  };
  
  const handleVideoError = () => {
      setTimeout(skipToNext, 2000);
  }

  const exitPlayer = () => {
      setIsPlaying(false);
      setActivePlaylist([]);
  };

  if (isPlaying && activePlaylist.length > 0) {
      const currentUrl = activePlaylist[currentVideoIndex];
      return (
          <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center overflow-hidden group cursor-none">
              <video 
                  key={`${currentUrl}-${currentVideoIndex}`} 
                  ref={videoRef}
                  src={currentUrl} 
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  onPlay={() => setIsPaused(false)}
                  onPause={() => setIsPaused(true)}
              />
              <div className={`absolute inset-0 flex flex-col justify-between p-4 md:p-8 transition-opacity duration-300 bg-gradient-to-b from-black/60 via-transparent to-black/60 ${showControls ? 'opacity-100 pointer-events-auto cursor-auto' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex justify-between items-start">
                      <button onClick={exitPlayer} className="bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full border border-white/10">
                          <ArrowLeft size={24} className="md:w-8 md:h-8" />
                      </button>
                      <div className="bg-black/60 px-6 py-2 rounded-xl border border-white/10 text-center">
                          <h2 className="text-white font-black uppercase tracking-widest text-sm md:text-lg">TV Channel Loop</h2>
                          <div className="text-blue-400 text-[10px] md:text-xs font-bold uppercase mt-1 flex items-center justify-center gap-2">
                              <Film size={12} /> Video {currentVideoIndex + 1} of {activePlaylist.length}
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center justify-center gap-8 md:gap-16">
                      <button onClick={handlePrev} className="p-4 md:p-6 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 group">
                          <ChevronLeft size={32} className="md:w-12 md:h-12 group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => {
                            if (videoRef.current) {
                                if (isPaused) videoRef.current.play().catch(() => {});
                                else videoRef.current.pause();
                            }
                        }} 
                        className="p-6 md:p-8 bg-white text-black rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform flex items-center justify-center"
                      >
                          {isPaused ? <Play size={40} fill="currentColor" className="ml-2 md:w-12 md:h-12" /> : <Pause size={40} fill="currentColor" className="md:w-12 md:h-12" />}
                      </button>
                      <button onClick={handleNext} className="p-4 md:p-6 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 group">
                          <ChevronRight size={32} className="md:w-12 md:h-12 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="text-white text-xs font-mono font-bold">{currentVideoIndex + 1} / {activePlaylist.length}</div>
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentVideoIndex + 1) / activePlaylist.length) * 100}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col animate-fade-in overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 z-0 pointer-events-none"></div>
        <header className="relative z-10 p-6 md:p-10 flex items-center justify-between border-b border-white/5 shrink-0 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20">
                    <Tv size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-none drop-shadow-lg">TV Mode</h1>
                    <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-wide mt-1">Select Channel or Global Loop</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button 
                    onClick={handlePlayGlobal}
                    className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg border border-white/20"
                >
                    <SkipForward size={20} fill="currentColor" /> Play Global Loop
                </button>
                <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
                <button onClick={onToggleScreensaver} className={`p-3 rounded-xl border transition-colors hidden md:block ${screensaverEnabled ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                   {screensaverEnabled ? <MonitorPlay size={20} /> : <MonitorStop size={20} />}
                </button>
            </div>
        </header>
        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                 {tvBrands.map((brand) => (
                     <button key={brand.id} onClick={() => setViewingBrand(brand)} className="group bg-slate-800/50 border border-white/5 rounded-3xl aspect-video md:aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:-translate-y-2">
                         <div className="w-full h-full p-8 flex items-center justify-center relative z-10">
                             {brand.logoUrl ? <img src={brand.logoUrl} className="max-w-full max-h-full object-contain filter drop-shadow-xl transition-transform duration-500 group-hover:scale-110" /> : <Tv size={64} className="text-slate-600" />}
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end">
                              <div className="text-left">
                                  <h3 className="text-white font-black uppercase tracking-wider text-sm md:text-base leading-none mb-1 group-hover:text-blue-400 transition-colors">{brand.name}</h3>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                                      <Monitor size={10} /> {brand.models?.length || 0} Models
                                  </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                  <ChevronRight size={16} />
                              </div>
                         </div>
                     </button>
                 ))}
            </div>
        </div>
    </div>
  );
};

export default TVMode;
