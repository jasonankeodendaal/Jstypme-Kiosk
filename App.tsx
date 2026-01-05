
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

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
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const isSavingRef = useRef(false); // CRITICAL: Prevent race conditions
  const syncTimeoutRef = useRef<number | null>(null);
  const kioskId = getKioskId();
  const isAdmin = currentRoute.startsWith('/admin');

  const fetchData = useCallback(async (isBackground = false) => {
      // LOCK: Never fetch while a save is in progress to prevent state overwrites
      if (isSavingRef.current) return;

      if (!isBackground && isFirstLoad) setIsSyncing(true);
      
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(prev => {
               if (!prev) return data;
               
               // In Admin mode background pulses, only update telemetry
               if (isAdmin && isBackground) {
                   return { ...prev, fleet: data.fleet };
               }

               // Full sync for Kiosk or foreground Admin refresh
               return { ...data };
           });
           setLastSyncTime(new Date().toLocaleTimeString());
           setSyncError(null);
        }
      } catch (e) {
        console.error("Fetch failed", e);
        if (!isBackground) setSyncError("Cloud connection unstable");
      } finally {
        setIsFirstLoad(false);
        setIsSyncing(false);
      }
  }, [isAdmin, isFirstLoad]);

  useEffect(() => {
    initSupabase();
    fetchData();

    // Routine background sync
    const interval = setInterval(() => {
        fetchData(true);
    }, 60000); 

    // Realtime sync (Kiosk Only)
    let channel: any = null;
    if (supabase && !isAdmin) {
        channel = supabase
          .channel('global_sync_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, 
            () => {
              if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 1500);
            }
          )
          .subscribe();
    }

    return () => {
        if (channel) supabase.removeChannel(channel);
        clearInterval(interval);
    };
  }, [fetchData, isAdmin]);

  const handleUpdateData = async (newData: StoreData) => {
    isSavingRef.current = true; // Lock fetches
    setIsSyncing(true);
    setSyncError(null);
    
    try {
        const success = await saveStoreData(newData);
        if (success) {
            setStoreData({ ...newData }); 
            setLastSyncTime(new Date().toLocaleTimeString());
            // Buffer to allow Supabase triggers to finish before unlocking
            setTimeout(() => { isSavingRef.current = false; }, 2000);
        } else {
            throw new Error("Save rejected by Cloud.");
        }
    } catch (e: any) {
        console.error("Manual save failed", e);
        setSyncError("Cloud Sync Failed. Check Permissions.");
        isSavingRef.current = false; // Unlock so user can try again
    } finally {
        setIsSyncing(false);
    }
  };

  if (isFirstLoad && !storeData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <div className="spinner mb-6"></div>
        <div className="tracking-[0.2em] uppercase text-[10px] text-slate-500 font-black">Connecting to Backbone...</div>
      </div>
    );
  }

  return (
    <>
      {storeData && <AppIconUpdater storeData={storeData} />}
      
      {isSyncing && isAdmin && (
         <div className="fixed top-14 right-4 z-[200] bg-blue-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 animate-pulse">
            <Loader2 className="animate-spin" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pushing to Cloud</span>
         </div>
      )}

      {syncError && isAdmin && (
         <div className="fixed top-14 right-4 z-[200] bg-red-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20">
            <AlertCircle size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{syncError}</span>
            <button onClick={() => setSyncError(null)} className="ml-2 bg-white/20 px-1.5 rounded-lg">×</button>
         </div>
      )}
      
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
