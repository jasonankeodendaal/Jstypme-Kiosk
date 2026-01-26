import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, Cloud, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Global Background Sync Progress Popup
 * Resides in App root so it stays visible during login/logout transitions.
 */
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
                    {status === 'syncing' && (
                        <div className="absolute inset-0 border-2 border-slate-700 rounded-full"></div>
                    )}
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
                    
                    {status === 'syncing' ? (
                        <Cloud className="text-blue-400 animate-pulse" size={16} />
                    ) : status === 'complete' ? (
                        <CheckCircle className="text-green-400 animate-bounce" size={20} />
                    ) : (
                        <AlertCircle className="text-red-400" size={20} />
                    )}
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">
                            {status === 'syncing' ? 'Background Sync' : status === 'complete' ? 'Sync Success' : 'Sync Failed'}
                        </span>
                        {status === 'syncing' && <span className="text-[10px] font-bold text-blue-400 tabular-nums">{progress}%</span>}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                        {status === 'syncing' ? 'Updating Cloud Infrastructure' : status === 'complete' ? 'Data is safe in the cloud' : 'Network interruption detected'}
                    </div>
                </div>
            </div>
            
            {status === 'complete' && (
                <div className="absolute -top-4 -left-4 pointer-events-none">
                    <Sparkles className="text-yellow-400 animate-ping opacity-50" size={20} />
                </div>
            )}
        </div>
    );
};

const AppIconUpdater = ({ storeData }: { storeData: StoreData }) => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    const DEFAULT_ADMIN_ICON = "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png";
    const DEFAULT_KIOSK_ICON = "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png";

    const targetIconUrl = isAdmin 
        ? (storeData.appConfig?.adminIconUrl || DEFAULT_ADMIN_ICON)
        : (storeData.appConfig?.kioskIconUrl || DEFAULT_KIOSK_ICON);

    useEffect(() => {
        const updateAppIdentity = async () => {
             const iconLink = document.getElementById('pwa-icon') as HTMLLinkElement;
             const appleLink = document.getElementById('pwa-apple-icon') as HTMLLinkElement;
             if (iconLink && iconLink.href !== targetIconUrl) iconLink.href = targetIconUrl;
             if (appleLink && appleLink.href !== targetIconUrl) appleLink.href = targetIconUrl;
        };
        if (targetIconUrl) updateAppIdentity();
    }, [targetIconUrl, isAdmin]);
    return null;
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  // LOCKS & GUARDS
  const isSavingRef = useRef(false);
  const lastLocalSaveRef = useRef(0);
  
  const syncTimeoutRef = useRef<number | null>(null);
  const kioskId = getKioskId();
  const isAdmin = currentRoute.startsWith('/admin');

  // Modified to allow background updates for admins (enabling Live Fleet Monitor)
  // Implements "Last Write Wins" Guard to discard stale cloud data during/after local edits
  const fetchData = useCallback(async (isBackground = false) => {
      // 1. Check Lock: If currently saving, strictly ignore any fetch requests
      if (isSavingRef.current) {
          if (!isBackground) console.log("Fetch aborted: Save in progress.");
          return;
      }

      // 2. Check Timestamp Guard: If local save happened recently (< 5s), ignore cloud to prevent rollback
      if (Date.now() - lastLocalSaveRef.current < 5000) {
          if (!isBackground) console.log("Fetch aborted: Recent local modification.");
          return;
      }

      // Removed isAdmin restriction to ensure background fleet updates occur
      if (!isBackground && isFirstLoad) setIsSyncing(true);
      
      try {
        const data = await generateStoreData();
        
        // 3. Double Check Lock (Post-Fetch): State might have changed while awaiting
        if (isSavingRef.current || (Date.now() - lastLocalSaveRef.current < 5000)) {
            console.log("Fetch result discarded: Stale due to local update.");
            return;
        }

        if (data) {
           setStoreData(prev => {
               if (!prev) return data;
               // Always return new data so Admin Dashboard receives live Fleet updates.
               // Note: AdminDashboard handles its own "unsaved changes" logic to prevent form overwrites.
               return { ...data };
           });
           setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setIsFirstLoad(false);
        setIsSyncing(false);
      }
  }, [isFirstLoad]);

  useEffect(() => {
    initSupabase();
    fetchData(); // Initial Fetch

    // Polling is now active for EVERYONE (Admins need it for Fleet, Kiosks for Content)
    const interval = setInterval(() => {
        fetchData(true);
    }, 30000); // 30s heartbeat for quicker fleet updates

    let channel: any = null;
    if (supabase) {
        // Subscribe to both 'store_config' (content) and 'kiosks' (fleet status)
        channel = supabase
          .channel('global_sync_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, 
            () => {
              if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
              if (!isSavingRef.current) {
                  syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 1000);
              }
            }
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosks' }, 
            () => {
              if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
              if (!isSavingRef.current) {
                  syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 1000);
              }
            }
          )
          .subscribe();
    }
    return () => {
        if (channel) supabase.removeChannel(channel);
        if (interval) clearInterval(interval);
    };
  }, [fetchData, kioskId]); // Removed isAdmin from deps so it runs for admin too

  const handleUpdateData = async (newData: StoreData) => {
    // 1. Acquire Lock
    isSavingRef.current = true;
    lastLocalSaveRef.current = Date.now();

    // 2. Optimistic Update
    setStoreData({ ...newData }); 
    
    try {
        await saveStoreData(newData);
        setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
        console.error("Manual save failed", e);
    } finally {
        // 3. Release Lock with Buffer
        // Keep lock for 2 seconds after completion to allow cloud propagation
        setTimeout(() => {
            isSavingRef.current = false;
        }, 2000);
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
            onRefresh={() => fetchData(false)} 
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
          onSyncRequest={() => fetchData(true)}
        />
      )}
    </>
  );
}