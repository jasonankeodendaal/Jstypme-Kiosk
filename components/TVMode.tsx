
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
  const [playerTitle, setPlayerTitle] = useState("");
  const [showControls, setShowControls] = useState(true);
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
          handleUserActivity();
      }
      return () => {
          window.removeEventListener('mousemove', handleUserActivity);
          window.removeEventListener('touchstart', handleUserActivity);
      };
  }, [isPlaying]);

  const handlePlayGlobal = () => {
      const allVideos = tvBrands.flatMap(b => (b.models || []).flatMap(m => m.videoUrls || []));
      if (allVideos.length === 0) return alert("No videos found.");
      setActivePlaylist([...allVideos].sort(() => Math.random() - 0.5));
      setCurrentVideoIndex(0);
      setPlayerTitle("Global Loop");
      setIsPlaying(true);
  };

  const handlePlayModel = (model: TVModel, startIdx = 0) => {
      if (!model.videoUrls?.length) return alert("No videos.");
      setActivePlaylist(model.videoUrls);
      setCurrentVideoIndex(startIdx);
      setPlayerTitle(model.name);
      setIsPlaying(true);
  };

  const handleVideoEnded = () => {
      if (activePlaylist.length === 1 && videoRef.current) {
          videoRef.current.currentTime = 0;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) playPromise.catch(() => {});
      } else {
          setCurrentVideoIndex((prev) => (prev + 1) % activePlaylist.length);
      }
  };

  if (isPlaying && activePlaylist.length > 0) {
      return (
          <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center overflow-hidden" onClick={handleUserActivity}>
              <video 
                  key={activePlaylist[currentVideoIndex]}
                  ref={videoRef} src={activePlaylist[currentVideoIndex]} 
                  className="w-full h-full object-contain" autoPlay playsInline onEnded={handleVideoEnded}
                  onPlay={() => setIsPaused(false)} onPause={() => setIsPaused(true)}
              />
              <div className={`absolute inset-0 p-8 flex flex-col justify-between transition-opacity duration-300 bg-black/40 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex justify-between items-start">
                      <button onClick={() => setIsPlaying(false)} className="bg-white/10 p-4 rounded-full text-white"><ArrowLeft size={32} /></button>
                      <div className="bg-black/60 px-6 py-2 rounded-xl text-white font-black uppercase text-lg">{playerTitle}</div>
                  </div>
                  <div className="flex items-center justify-center gap-16">
                      <button onClick={() => setCurrentVideoIndex((currentVideoIndex - 1 + activePlaylist.length) % activePlaylist.length)} className="text-white"><ChevronLeft size={48} /></button>
                      <button onClick={() => videoRef.current && (isPaused ? videoRef.current.play() : videoRef.current.pause())} className="p-8 bg-white text-black rounded-full">{isPaused ? <Play size={48} /> : <Pause size={48} />}</button>
                      <button onClick={() => setCurrentVideoIndex((currentVideoIndex + 1) % activePlaylist.length)} className="text-white"><ChevronRight size={48} /></button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col animate-fade-in overflow-hidden relative">
        <header className="relative z-10 p-6 md:p-10 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><Tv size={32} /></div><div><h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest leading-none">TV Mode</h1></div></div>
            <button onClick={handlePlayGlobal} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Play Global Loop</button>
        </header>
        <div className="relative z-10 flex-1 overflow-y-auto p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                 {tvBrands.map((brand) => (
                     <button key={brand.id} onClick={() => setViewingBrand(brand)} className="group bg-slate-800/50 border border-white/5 rounded-3xl aspect-[4/3] flex flex-col items-center justify-center relative transition-all hover:bg-slate-800 hover:border-blue-500/50">
                         {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="w-full h-full p-8 object-contain transition-transform duration-500 group-hover:scale-110" /> : <div className="flex flex-col items-center gap-2"><Tv size={64} className="text-slate-600" /><span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{brand.name}</span></div>}
                     </button>
                 ))}
            </div>
        </div>
        {viewingBrand && (
            <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in">
                <header className="p-10 flex justify-between items-center"><button onClick={() => setViewingBrand(null)} className="flex items-center gap-2 text-slate-400 font-bold uppercase"><ArrowLeft size={16} /> Back</button><h2 className="text-4xl font-black uppercase">{viewingBrand.name} Models</h2></header>
                <div className="p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {(viewingBrand.models || []).map(m => (<button key={m.id} onClick={() => handlePlayModel(m)} className="bg-slate-800 p-8 rounded-3xl border border-white/5 text-left group hover:border-blue-500 transition-all"><h3 className="text-2xl font-black uppercase mb-2 group-hover:text-blue-400">{m.name}</h3><p className="text-slate-500 uppercase font-bold text-xs">{m.videoUrls?.length || 0} Videos</p></button>))}
                </div>
            </div>
        )}
    </div>
  );
};

export default TVMode;
