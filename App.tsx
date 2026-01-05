
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const isSavingRef = useRef(false); // CRITICAL: Stop overwrites during active edits
  const syncTimeoutRef = useRef<number | null>(null);
  const kioskId = getKioskId();
  const isAdmin = currentRoute.startsWith('/admin');

  const fetchData = useCallback(async (isBackground = false) => {
      // NEVER pull data if the Admin is currently pushing a change
      if (isSavingRef.current) return;

      if (!isBackground && isFirstLoad) setIsSyncing(true);
      
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(prev => {
               if (!prev) return data;
               
               // IN ADMIN MODE: Background pulses ONLY update fleet telemetry.
               // We NEVER pull 'store_config' metadata in the background for Admin.
               if (isAdmin && isBackground) {
                   return { ...prev, fleet: data.fleet };
               }

               // For Kiosk or foreground refresh: Full sync
               return { ...data };
           });
           setLastSyncTime(new Date().toLocaleTimeString());
           setSyncError(null);
        }
      } catch (e) {
        console.error("Sync Pulse Failed:", e);
        if (!isBackground) setSyncError("Cloud Sync Error");
      } finally {
        setIsFirstLoad(false);
        setIsSyncing(false);
      }
  }, [isAdmin, isFirstLoad]);

  useEffect(() => {
    initSupabase();
    fetchData();

    // Pulse: 60s
    const interval = setInterval(() => {
        fetchData(true);
    }, 60000); 

    // Realtime: Kiosk Only
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
    isSavingRef.current = true; // LOCK UI
    setIsSyncing(true);
    setSyncError(null);
    
    try {
        const success = await saveStoreData(newData);
        if (success) {
            setStoreData({ ...newData }); 
            setLastSyncTime(new Date().toLocaleTimeString());
            // Delay release of lock to allow DB triggers to finish
            setTimeout(() => { isSavingRef.current = false; }, 2000);
        } else {
            throw new Error("Save rejected by backbone.");
        }
    } catch (e: any) {
        console.error("Persistence failed:", e);
        setSyncError("Cloud connection unstable. Save failed.");
        isSavingRef.current = false;
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
      {isSyncing && isAdmin && (
         <div className="fixed top-14 right-4 z-[200] bg-blue-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 animate-pulse">
            <Loader2 className="animate-spin" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pushing to Cloud...</span>
         </div>
      )}

      {syncError && isAdmin && (
          <div className="fixed top-14 right-4 z-[200] bg-red-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20">
            <AlertCircle size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{syncError}</span>
            <button onClick={() => setSyncError(null)} className="ml-2 hover:bg-white/20 p-1 rounded-lg">×</button>
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
