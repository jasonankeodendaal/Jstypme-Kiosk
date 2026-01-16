
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StoreData, TVBrand, TVModel } from '../types';
import { Play, Tv, ArrowLeft, ChevronLeft, ChevronRight, Pause, MonitorPlay, MonitorStop, Film, SkipForward, Monitor, VolumeX, Loader2, AlertCircle } from 'lucide-react';

interface TVModeProps {
  storeData: StoreData;
  onRefresh: () => void;
  screensaverEnabled: boolean;
  onToggleScreensaver: () => void;
  isAudioUnlocked: boolean;
}

const TVMode: React.FC<TVModeProps> = ({ storeData, onRefresh, screensaverEnabled, onToggleScreensaver, isAudioUnlocked }) => {
  const [viewingBrand, setViewingBrand] = useState<TVBrand | null>(null);
  
  // Playlist State
  const [activePlaylist, setActivePlaylist] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isPaused, setIsPaused] = useState(false); 
  
  // Double Buffer State
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [showUpNext, setShowUpNext] = useState(false);
  const [nextTitle, setNextTitle] = useState('');

  // UI State
  const [showControls, setShowControls] = useState(true);
  
  // Refs
  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<number | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const stallCounter = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const tvBrands = storeData.tv?.brands || [];

  // Helper to find video title
  const getVideoTitle = (url: string) => {
      for (const b of tvBrands) {
          for (const m of b.models) {
              const idx = m.videoUrls.indexOf(url);
              if (idx !== -1) {
                  return m.videoUrls.length > 1 ? `${m.name} (${idx + 1}/${m.videoUrls.length})` : m.name;
              }
          }
      }
      return url.split('/').pop() || 'Unknown Clip';
  };

  // Activity Monitor
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

  // Playlist Generators
  const handlePlayGlobal = () => {
      if (tvBrands.length === 0) return;
      const allVideos = tvBrands.flatMap(b => (b.models || []).flatMap(m => m.videoUrls || []));
      if (allVideos.length === 0) return;
      
      // Fisher-Yates Shuffle
      const shuffled = [...allVideos];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setActivePlaylist(shuffled);
      setCurrentVideoIndex(0);
      setActiveSlot('A');
      setIsPlaying(true);
      setIsPaused(false);
  };

  const handlePlayModel = (model: TVModel) => {
      if (!model.videoUrls?.length) return;
      setActivePlaylist(model.videoUrls);
      setCurrentVideoIndex(0);
      setActiveSlot('A');
      setIsPlaying(true);
      setIsPaused(false);
  };

  const handlePlayBrandLoop = (brand: TVBrand) => {
      const allBrandVideos = (brand.models || []).flatMap(m => m.videoUrls || []);
      if (!allBrandVideos.length) return;
      setActivePlaylist(allBrandVideos);
      setCurrentVideoIndex(0);
      setActiveSlot('A');
      setIsPlaying(true);
      setIsPaused(false);
  };

  // Gapless Engine Logic
  const srcA = activePlaylist.length > 0 
      ? (activeSlot === 'A' ? activePlaylist[currentVideoIndex] : activePlaylist[(currentVideoIndex + 1) % activePlaylist.length]) 
      : '';
  
  const srcB = activePlaylist.length > 0 
      ? (activeSlot === 'B' ? activePlaylist[currentVideoIndex] : activePlaylist[(currentVideoIndex + 1) % activePlaylist.length]) 
      : '';

  const skipToNext = () => {
      const nextIndex = (currentVideoIndex + 1) % activePlaylist.length;
      const nextSlot = activeSlot === 'A' ? 'B' : 'A';
      
      // Update State for Swap
      setCurrentVideoIndex(nextIndex);
      setActiveSlot(nextSlot);
      setShowUpNext(false);
      setIsPaused(false);
      
      // Reset Watchdogs
      stallCounter.current = 0;
      lastTimeRef.current = 0;
  };

  const handlePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      const prevIndex = (currentVideoIndex - 1 + activePlaylist.length) % activePlaylist.length;
      const nextSlot = activeSlot === 'A' ? 'B' : 'A';
      
      // Force manual swap to prev
      // Note: This breaks the preloading chain slightly but is acceptable for manual navigation
      setCurrentVideoIndex(prevIndex);
      setActiveSlot(nextSlot);
      setShowUpNext(false);
      setIsPaused(false);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const vid = e.currentTarget;
      if (vid.duration - vid.currentTime <= 5 && !showUpNext) {
          const nextIdx = (currentVideoIndex + 1) % activePlaylist.length;
          const title = getVideoTitle(activePlaylist[nextIdx]);
          setNextTitle(title);
          setShowUpNext(true);
      }
      // Watchdog Heartbeat
      lastTimeRef.current = vid.currentTime;
      stallCounter.current = 0; 
  };

  const exitPlayer = () => {
      setIsPlaying(false);
      setActivePlaylist([]);
      setShowUpNext(false);
  };

  // Watchdog Effect
  useEffect(() => {
      if (!isPlaying || isPaused) return;
      
      const interval = setInterval(() => {
          const activeRef = activeSlot === 'A' ? refA.current : refB.current;
          
          // Check if stalled
          if (activeRef && !activeRef.paused && !activeRef.ended && activeRef.readyState < 3) {
              // Standard buffer wait, do nothing yet
          } else if (activeRef && Math.abs(activeRef.currentTime - lastTimeRef.current) < 0.1) {
              stallCounter.current += 1;
          } else {
              stallCounter.current = 0;
          }

          if (stallCounter.current > 5) { // 5 seconds of no progress
              console.warn("Watchdog: Video Stalled. Skipping...");
              skipToNext();
          }
          
          if (activeRef) lastTimeRef.current = activeRef.currentTime;

      }, 1000);

      return () => clearInterval(interval);
  }, [isPlaying, isPaused, activeSlot, currentVideoIndex]);

  // Auto-Play Effect
  useEffect(() => {
      if (!isPlaying) return;

      const activeRef = activeSlot === 'A' ? refA.current : refB.current;
      const bufferRef = activeSlot === 'A' ? refB.current : refA.current;

      if (activeRef) {
          const p = activeRef.play();
          if (p) {
              p.catch(e => {
                  console.warn("Autoplay Blocked", e);
                  activeRef.muted = true;
                  activeRef.play().catch(console.error);
              });
          }
      }

      if (bufferRef) {
          // Ensure buffer is ready but paused
          bufferRef.load();
          // We don't call pause() immediately as load() stops playback usually, 
          // but we want it to buffer. 
      }

  }, [activeSlot, currentVideoIndex, isPlaying]);

  // Render
  if (isPlaying && activePlaylist.length > 0) {
      return (
          <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center overflow-hidden group cursor-none">
              
              {/* SLOT A */}
              <video 
                  ref={refA}
                  src={srcA}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${activeSlot === 'A' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  muted={!isAudioUnlocked}
                  playsInline
                  onEnded={skipToNext}
                  onError={() => { console.error("Error Slot A"); if(activeSlot === 'A') skipToNext(); }}
                  onTimeUpdate={activeSlot === 'A' ? handleTimeUpdate : undefined}
              />

              {/* SLOT B */}
              <video 
                  ref={refB}
                  src={srcB}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${activeSlot === 'B' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  muted={!isAudioUnlocked}
                  playsInline
                  onEnded={skipToNext}
                  onError={() => { console.error("Error Slot B"); if(activeSlot === 'B') skipToNext(); }}
                  onTimeUpdate={activeSlot === 'B' ? handleTimeUpdate : undefined}
              />

              {/* CONTROLS OVERLAY */}
              <div className={`absolute inset-0 flex flex-col justify-between p-4 md:p-8 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100 pointer-events-auto cursor-auto' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex justify-between items-start">
                      <button onClick={exitPlayer} className="bg-black/40 hover:bg-black/60 text-white p-3 md:p-4 rounded-full border border-white/10 backdrop-blur-md transition-all">
                          <ArrowLeft size={24} className="md:w-8 md:h-8" />
                      </button>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <div className="bg-black/60 px-6 py-2 rounded-xl border border-white/10 text-center backdrop-blur-md">
                            <h2 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">Now Playing</h2>
                            <div className="text-blue-400 text-[10px] md:text-xs font-bold uppercase mt-1 flex items-center justify-center gap-2 max-w-[200px] truncate">
                                <Film size={12} /> {getVideoTitle(activePlaylist[currentVideoIndex])}
                            </div>
                        </div>
                        {!isAudioUnlocked && (
                            <div className="bg-orange-500/80 backdrop-blur-md px-4 py-1.5 rounded-lg border border-orange-400 flex items-center gap-2 animate-pulse">
                                <VolumeX size={14} className="text-white" />
                                <span className="text-white font-black text-[9px] uppercase tracking-wider">Muted</span>
                            </div>
                        )}
                      </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 md:gap-16">
                      <button onClick={handlePrev} className="p-4 md:p-6 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 group backdrop-blur-sm">
                          <ChevronLeft size={32} className="md:w-12 md:h-12 group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => {
                            const activeRef = activeSlot === 'A' ? refA.current : refB.current;
                            if (activeRef) {
                                if (isPaused) { activeRef.play(); setIsPaused(false); }
                                else { activeRef.pause(); setIsPaused(true); }
                            }
                        }} 
                        className="p-6 md:p-8 bg-white text-black rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform flex items-center justify-center"
                      >
                          {isPaused ? <Play size={40} fill="currentColor" className="ml-2 md:w-12 md:h-12" /> : <Pause size={40} fill="currentColor" className="md:w-12 md:h-12" />}
                      </button>
                      <button onClick={skipToNext} className="p-4 md:p-6 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10 group backdrop-blur-sm">
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

              {/* UP NEXT TOAST (Independent of Controls) */}
              <div className={`absolute bottom-8 right-8 z-30 transition-all duration-700 transform ${showUpNext ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
                      <div className="relative w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          <div className="absolute inset-0 border-[3px] border-blue-500 rounded-xl border-t-transparent animate-spin"></div>
                          <SkipForward size={20} className="text-white" />
                      </div>
                      <div className="min-w-0">
                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Up Next</div>
                          <div className="text-sm font-bold text-white truncate leading-tight">{nextTitle}</div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- STANDARD BROWSE UI (Unchanged) ---
  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col animate-fade-in overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 z-0 pointer-events-none"></div>
        
        <header className="relative z-10 p-6 md:p-10 flex items-center justify-between border-b border-white/5 shrink-0 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {viewingBrand ? (
                    <button 
                        onClick={() => setViewingBrand(null)}
                        className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors border border-white/10 group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20">
                        <Tv size={32} className="text-white" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-none drop-shadow-lg">
                        {viewingBrand ? viewingBrand.name : 'TV Mode'}
                    </h1>
                    <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-wide mt-1">
                        {viewingBrand ? `Explore ${viewingBrand.models.length} Models` : 'Select Channel or Global Loop'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {viewingBrand ? (
                    <button 
                        onClick={() => handlePlayBrandLoop(viewingBrand)}
                        className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg border border-blue-400/20"
                    >
                        <Play size={20} fill="currentColor" /> Play Brand Loop
                    </button>
                ) : (
                    <button 
                        onClick={handlePlayGlobal}
                        className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg border border-white/20"
                    >
                        <SkipForward size={20} fill="currentColor" /> Play Global Loop
                    </button>
                )}
                <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
                <button onClick={onToggleScreensaver} className={`p-3 rounded-xl border transition-colors hidden md:block ${screensaverEnabled ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                   {screensaverEnabled ? <MonitorPlay size={20} /> : <MonitorStop size={20} />}
                </button>
            </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
            {viewingBrand ? (
                // Models View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {viewingBrand.models.map((model) => (
                        <div 
                            key={model.id}
                            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all group flex flex-col"
                        >
                            <div className="aspect-video relative overflow-hidden bg-slate-950">
                                {model.imageUrl ? (
                                    <img src={model.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt={model.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-800">
                                        <Monitor size={80} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                <button 
                                    onClick={() => handlePlayModel(model)}
                                    className="absolute bottom-4 right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <Play size={24} fill="currentColor" />
                                </button>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{model.name}</h3>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-white/5">
                                        {model.videoUrls.length} Video Clips
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handlePlayModel(model)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/10"
                                        >
                                            Play Sequence
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {viewingBrand.models.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30">
                            <Monitor size={80} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-widest">No Models Available</p>
                        </div>
                    )}
                </div>
            ) : (
                // Brands Grid View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                    {tvBrands.map((brand) => (
                        <button 
                            key={brand.id} 
                            onClick={() => setViewingBrand(brand)} 
                            className="group bg-slate-800/50 border border-white/5 rounded-3xl aspect-video md:aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:-translate-y-2"
                        >
                            <div className="w-full h-full p-8 flex items-center justify-center relative z-10">
                                {brand.logoUrl ? (
                                    <img src={brand.logoUrl} className="max-w-full max-h-full object-contain filter drop-shadow-xl transition-transform duration-500 group-hover:scale-110" alt={brand.name} />
                                ) : (
                                    <Tv size={64} className="text-slate-600" />
                                )}
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
                    {tvBrands.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30">
                            <Tv size={80} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-widest">No Brands Configured</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default TVMode;
