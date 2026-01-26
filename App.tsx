
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData, subscribeToDeltas, mergeDelta } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, Cloud, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const SyncStatusPopup = () => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle');

    useEffect(() => {
        const handleSync = (e: any) => {
            const { progress: p, status: s } = e.detail;
            setProgress(p);
            setStatus(s);
        };
        window.addEventListener('kiosk-sync-event', handleSync);
        return () => window.removeEventListener('kiosk-sync-event', handleSync);
    }, []);

    if (status === 'idle') return null;

    return (
        <div className={`fixed bottom-6 right-6 z-[999] animate-fade-in`}>
            <div className={`bg-slate-900/90 backdrop-blur-xl border ${status === 'error' ? 'border-red-500/50' : 'border-blue-500/30'} shadow-2xl p-4 rounded-2xl flex items-center gap-4 min-w-[200px] transition-all duration-500`}>
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                    {status === 'syncing' && <div className="absolute inset-0 border-2 border-slate-700 rounded-full"></div>}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                        <circle
                            className={`transition-all duration-300 ${status === 'error' ? 'text-red-500' : 'text-blue-500'}`}
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            r="18"
                            cx="20"
                            cy="20"
                            strokeDasharray="113"
                            strokeDashoffset={113 - (113 * progress / 100)}
                            strokeLinecap="round"
                        />
                    </svg>
                    {status === 'syncing' ? <Cloud className="text-blue-400 animate-pulse" size={16} /> : status === 'complete' ? <CheckCircle className="text-green-400 animate-bounce" size={20} /> : <AlertCircle className="text-red-400" size={20} />}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">{status === 'syncing' ? 'Cloud Sync' : status === 'complete' ? 'Sync Success' : 'Sync Failed'}</span>
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{status === 'syncing' ? 'Applying Deltas...' : status === 'complete' ? 'Data consistent' : 'Network error'}</div>
                </div>
            </div>
        </div>
    );
};

const AppIconUpdater = ({ storeData }: { storeData: StoreData }) => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    const DEFAULT_ADMIN_ICON = "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png";
    const DEFAULT_KIOSK_ICON = "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png";
    const targetIconUrl = isAdmin ? (storeData.appConfig?.adminIconUrl || DEFAULT_ADMIN_ICON) : (storeData.appConfig?.kioskIconUrl || DEFAULT_KIOSK_ICON);
    useEffect(() => {
        const iconLink = document.getElementById('pwa-icon') as HTMLLinkElement;
        const appleLink = document.getElementById('pwa-apple-icon') as HTMLLinkElement;
        if (iconLink && iconLink.href !== targetIconUrl) iconLink.href = targetIconUrl;
        if (appleLink && appleLink.href !== targetIconUrl) appleLink.href = targetIconUrl;
    }, [targetIconUrl]);
    return null;
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const isAdmin = currentRoute.startsWith('/admin');

  // Initial Full Fetch
  const fetchData = useCallback(async () => {
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData({ ...data });
           setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setIsFirstLoad(false);
      }
  }, []);

  useEffect(() => {
    initSupabase();
    fetchData();

    // DELTA ARCHITECTURE: REAL-TIME LISTENER
    // Instead of re-fetching everything, we listen for granular changes
    const channel = subscribeToDeltas((payload) => {
        // console.debug("Delta Received:", payload.table, payload.eventType);
        setStoreData(prevData => {
            if (!prevData) return prevData;
            // Merge the delta into the tree
            const newData = mergeDelta(prevData, payload);
            setLastSyncTime(new Date().toLocaleTimeString());
            return newData;
        });
    });

    return () => {
        if (channel) supabase?.removeChannel(channel);
    };
  }, [fetchData]);

  // Admin: manual update (triggers batch save for settings or large migrations)
  const handleUpdateData = async (newData: StoreData, shouldSaveToCloud = true) => {
    setStoreData({ ...newData }); 
    if (shouldSaveToCloud) {
        try {
            await saveStoreData(newData);
            setLastSyncTime(new Date().toLocaleTimeString());
        } catch (e: any) {
            console.error("Manual save failed", e);
        }
    }
  };

  if (isFirstLoad && !storeData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] text-white font-black">
        <div className="spinner mb-6"></div>
        <div className="tracking-[0.2em] uppercase text-[10px] text-slate-500">Initializing Firmware...</div>
      </div>
    );
  }

  return (
    <>
      {storeData && <AppIconUpdater storeData={storeData} />}
      <SyncStatusPopup />
      
      {isAdmin ? (
        <AdminDashboard 
            storeData={storeData}
            onUpdateData={handleUpdateData}
            onRefresh={fetchData} 
        />
      ) : currentRoute === '/about' ? (
        <AboutPage 
            storeData={storeData!} 
            onBack={() => { window.history.pushState({}, '', '/'); setCurrentRoute('/'); }}
        />
      ) : (
        <KioskApp 
          storeData={storeData}
          lastSyncTime={lastSyncTime}
          onSyncRequest={() => {}}
        />
      )}
    </>
  );
}
