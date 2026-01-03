
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  const syncTimeoutRef = useRef<number | null>(null);
  const kioskId = getKioskId();
  const isAdmin = currentRoute.startsWith('/admin');

  const fetchData = useCallback(async (isBackground = false) => {
      // Only show visible syncing indicators if explicitly not a background pulse
      if (!isBackground) setIsSyncing(true);
      
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(prev => {
               // SILENT UPDATE LOGIC:
               // If we are in Admin mode, we only update fleet telemetry to avoid 
               // wiping out local draft edits in the form fields.
               if (isAdmin && isBackground && prev) {
                   return {
                       ...prev,
                       fleet: data.fleet
                   };
               }
               // For Kiosks or first load, merge data silently without triggering a reload of the component tree if possible
               return { ...data };
           });
           setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
  }, [isAdmin]);

  useEffect(() => {
    initSupabase();
    // Initial fetch
    fetchData();

    // 1. Routine Sync (Pulsing) - Pulls telemetry every 60s SILENTLY
    const interval = setInterval(() => {
        fetchData(true);
    }, 60000); 

    // 2. Realtime Push (Realtime) - Immediate response to Cloud changes
    if (supabase) {
        const channel = supabase
          .channel('global_sync_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, 
            () => {
              if (!isAdmin) {
                  // Kiosks update silently in background
                  if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
                  syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 500);
              }
            }
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosks' }, 
            (payload: any) => {
              const isMyUpdate = payload.new && payload.new.id === kioskId;
              const isMyDelete = payload.old && payload.old.id === kioskId;
              
              if (isAdmin || isMyUpdate || isMyDelete) {
                  if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
                  syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 500);
              }
            }
          )
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }
    
    return () => clearInterval(interval);
  }, [fetchData, kioskId, isAdmin]);

  const handleUpdateData = async (newData: StoreData) => {
    // Admin explicit saves show a sync indicator
    setIsSyncing(true);
    setStoreData({ ...newData }); 
    try {
        await saveStoreData(newData);
        setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
        console.error("Save failed", e);
    } finally {
        setTimeout(() => setIsSyncing(false), 300);
    }
  };

  // Critical: Only show the "System Initialize" loader on the VERY first boot.
  // Once storeData is present, we never show this again during background syncs.
  if (loading && !storeData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-black">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <div className="tracking-[0.2em] uppercase text-sm">System Initialize</div>
      </div>
    );
  }

  return (
    <>
      {storeData && <AppIconUpdater storeData={storeData} />}
      
      {/* Subtle sync indicator for Admin actions, Kiosks stay silent */}
      {isSyncing && isAdmin && (
         <div className="fixed top-12 right-4 z-[200] bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
            <Loader2 className="animate-spin text-blue-400" size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Updating Cloud</span>
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
