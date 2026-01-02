
import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ChevronLeft, ChevronRight, Globe, Loader2, ExternalLink, ShieldAlert } from 'lucide-react';

interface InternalBrowserProps {
  url: string;
  onClose: () => void;
  title?: string;
}

const InternalBrowser: React.FC<InternalBrowserProps> = ({ url, onClose, title }) => {
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const handleReload = () => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
  };

  // Pre-formatted display URL
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900 flex flex-col animate-fade-in overflow-hidden">
      {/* Browser Chrome (Address Bar & Controls) */}
      <header className="shrink-0 bg-slate-900 border-b border-slate-800 p-3 md:p-4 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-xl transition-all text-slate-400 shrink-0"
            title="Exit Browser"
          >
            <X size={24} />
          </button>
          
          <div className="flex-1 max-w-2xl bg-black/40 border border-white/5 rounded-2xl p-2 px-4 flex items-center gap-3 overflow-hidden">
             <Globe size={14} className="text-blue-500 shrink-0" />
             <div className="flex flex-col min-w-0 flex-1">
                {title && <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate leading-none mb-0.5">{title}</span>}
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300 truncate lowercase">{displayUrl}</span>
             </div>
             {loading && <Loader2 size={14} className="animate-spin text-blue-500 shrink-0" />}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button 
            onClick={handleReload}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
            title="Reload Page"
          >
            <RotateCcw size={20} />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
          <button 
            onClick={onClose}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95"
          >
            Return to Kiosk
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 size={32} className="animate-spin text-blue-500" />
              </div>
            </div>
            <p className="mt-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Connecting to Secure Web Service</p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={url}
          className="w-full h-full border-none bg-white"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
          title="Kiosk Internal Discovery"
        />

        {/* Safety Disclaimer (Floats bottom right) */}
        <div className="absolute bottom-6 right-6 pointer-events-none z-20">
           <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-2xl">
              <div className="p-2 bg-blue-500/20 rounded-lg"><ExternalLink size={14} className="text-blue-400" /></div>
              <div className="text-left">
                 <div className="text-[8px] font-black text-white uppercase tracking-widest">Discovery Engine</div>
                 <div className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">Secure Sandboxed Connection</div>
              </div>
           </div>
        </div>
      </div>

      {/* Error Fallback Logic (Heuristic for blocked iframes) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-none">
          <div className="bg-orange-600 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 delay-5000 duration-500 fill-mode-forwards border border-orange-500">
              <ShieldAlert className="shrink-0" size={24} />
              <div>
                  <h4 className="font-black uppercase text-xs">Connection Warning</h4>
                  <p className="text-[10px] font-bold opacity-90 mt-1 leading-relaxed">
                      If the page below is blank, the destination website might be blocking internal kiosk discovery for security. Please contact your system administrator.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default InternalBrowser;
