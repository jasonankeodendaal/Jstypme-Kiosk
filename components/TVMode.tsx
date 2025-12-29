import React, { useState, useEffect, useRef } from 'react';
import { StoreData, TVBrand, TVModel } from '../types';
import { Play, Tv, ArrowLeft, ChevronLeft, ChevronRight, Pause, RotateCcw, MonitorPlay, MonitorStop, Film, LayoutGrid, SkipForward, Monitor, VolumeX, Volume2 } from 'lucide-react';

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
  const [playerTitle, setPlayerTitle] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default to muted for Autoplay
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<number | null>(null);
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
      const allVideos = tvBrands.flatMap(b => (b.models || []).flatMap(m => m.videoUrls || []));
      if (allVideos.length === 0) return alert("No videos found.");
      const shuffled = [...allVideos].sort(() => Math.random() - 0.5);
      setActivePlaylist(shuffled); setCurrentVideoIndex(0); setPlayerTitle("Global TV Loop"); setIsPlaying(true); setIsPaused(false); setIsMuted(true);
  };

  const handlePlayModel = (model: TVModel, startIndex: number = 0) => {
      if (!model.videoUrls?.length) return alert("No videos.");
      setActivePlaylist(model.videoUrls); setCurrentVideoIndex(startIndex); setPlayerTitle(model.name); setIsPlaying(true); setIsPaused(false); setIsMuted(true);
  };

  const handlePlayBrandLoop = (brand: TVBrand) => {
      const allBrandVideos = (brand.models || []).flatMap(m => m.videoUrls || []);
      if (allBrandVideos.length === 0) return alert("No videos.");
      setActivePlaylist(allBrandVideos); setCurrentVideoIndex(0); setPlayerTitle(`${brand.name} - Loop`); setIsPlaying(true); setIsPaused(false); setIsMuted(true);
  };

  const handleVideoEnded = () => {
      const nextIndex = (currentVideoIndex + 1) % activePlaylist.length;
      if (nextIndex === currentVideoIndex && videoRef.current) {
          videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {});
      } else setCurrentVideoIndex(nextIndex);
  };

  if (isPlaying && activePlaylist.length > 0) {
      const currentUrl = activePlaylist[currentVideoIndex];
      return (
          <div className="fixed inset-0 bg-black z-[250] flex flex-col items-center justify-center overflow-hidden group">
              <video 
                  key={`${currentUrl}-${currentVideoIndex}`}
                  ref={videoRef}
                  src={currentUrl} 
                  className="w-full h-full object-contain"
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPaused(false)}
                  onPause={() => setIsPaused(true)}
                  onClick={() => { if(isMuted) setIsMuted(false); setUserHasInteracted(true); }}
              />
              
              {isMuted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[260]">
                      <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black uppercase text-xl animate-bounce shadow-2xl flex items-center gap-4">
                          <VolumeX size={32} /> Tap to Enable Audio
                      </div>
                  </div>
              )}

              <div className={`absolute inset-0 flex flex-col justify-between p-4 md:p-8 transition-opacity duration-300 bg-gradient-to-b from-black/60 via-transparent to-black/60 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex justify-between items-start">
                      <button onClick={() => setIsPlaying(false)} className="bg-white/10 p-4 rounded-full text-white border border-white/10"><ArrowLeft size={24} /></button>
                      <div className="bg-black/60 px-6 py-2 rounded-xl border border-white/10 text-center"><h2 className="text-white font-black uppercase text-sm md:text-lg">{playerTitle}</h2></div>
                      <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full border ${isMuted ? 'bg-red-600 border-red-400' : 'bg-green-600 border-green-400'} text-white`}>{isMuted ? <VolumeX size={24}/> : <Volume2 size={24}/>}</button>
                  </div>
                  <div className="flex items-center justify-center gap-8 md:gap-16">
                      <button onClick={(e) => { e.stopPropagation(); setCurrentVideoIndex((currentVideoIndex - 1 + activePlaylist.length) % activePlaylist.length); }} className="p-6 bg-white/10 rounded-full text-white"><ChevronLeft size={32} /></button>
                      <button onClick={() => { if (videoRef.current) isPaused ? videoRef.current.play() : videoRef.current.pause(); }} className="p-8 bg-white text-black rounded-full shadow-2xl">{isPaused ? <Play size={40} fill="currentColor" className="ml-2" /> : <Pause size={40} fill="currentColor" />}</button>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentVideoIndex((currentVideoIndex + 1) % activePlaylist.length); }} className="p-6 bg-white/10 rounded-full text-white"><ChevronRight size={32} /></button>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((currentVideoIndex + 1) / activePlaylist.length) * 100}%` }}></div></div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col animate-fade-in relative overflow-hidden">
        <header className="relative z-10 p-6 md:p-10 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl"><Tv size={32}/></div><div><h1 className="text-2xl font-black uppercase tracking-widest leading-none">TV Mode</h1><p className="text-white/50 text-xs font-bold mt-1">Select Channel</p></div></div>
            <button onClick={handlePlayGlobal} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg flex items-center gap-2"><SkipForward size={20} fill="currentColor" /> Play Global</button>
        </header>
        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {tvBrands.map(b => (
                <button key={b.id} onClick={() => setViewingBrand(b)} className="group bg-slate-800/50 border border-white/5 rounded-3xl aspect-[4/3] flex flex-col items-center justify-center relative hover:bg-slate-800 transition-all">
                    <div className="w-full h-full p-8 flex items-center justify-center">{b.logoUrl ? <img src={b.logoUrl} className="max-w-full max-h-full object-contain filter drop-shadow-xl" /> : <Tv size={64} className="text-slate-600" />}</div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 flex justify-between items-center"><h3 className="text-white font-black uppercase text-sm">{b.name}</h3><ChevronRight size={16} /></div>
                </button>
            ))}
        </div>
        {viewingBrand && (
            <div className="fixed inset-0 z-[260] bg-slate-900 flex flex-col">
                <header className="p-8 flex justify-between items-center"><button onClick={() => setViewingBrand(null)} className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-xl font-black uppercase text-xs"><ArrowLeft size={16}/> Back</button><h2 className="text-4xl font-black uppercase">{viewingBrand.name}</h2></header>
                <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <button onClick={() => handlePlayBrandLoop(viewingBrand)} className="bg-blue-600 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl"><Play size={64} fill="currentColor" /><h3 className="text-2xl font-black uppercase mt-4">Play All</h3></button>
                    {(viewingBrand.models || []).map(m => (<button key={m.id} onClick={() => handlePlayModel(m)} className="bg-slate-800 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-blue-500 transition-all">{m.imageUrl ? <img src={m.imageUrl} className="w-full h-32 object-cover rounded-xl mb-4" /> : <Monitor size={48} className="text-slate-600 mb-4" /><h3 className="text-xl font-black uppercase">{m.name}</h3><p className="text-xs text-slate-500 font-bold mt-1 uppercase">{m.videoUrls?.length || 0} Videos</p></button>))}
                </div>
            </div>
        )}
    </div>
  );
};

export default TVMode;