
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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  const syncTimeoutRef = useRef<number | null>(null);
  const kioskId = getKioskId();
  const isAdmin = currentRoute.startsWith('/admin');

  const fetchData = useCallback(async (isBackground = false) => {
      // Background pulses never show UI spinners or change isFirstLoad
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(prev => {
               if (!prev) return data;
               
               // If we are in Admin mode, merging remote data blindly would wipe unsaved form changes.
               // We only update fleet status silently in background for Admins.
               if (isAdmin && isBackground) {
                   return {
                       ...prev,
                       fleet: data.fleet
                   };
               }

               // For Kiosk mode, we update fully but silently.
               return { ...data };
           });
           setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        if (!isBackground) setIsFirstLoad(false);
      }
  }, [isAdmin]);

  useEffect(() => {
    initSupabase();
    // Initial fetch to boot system
    fetchData(false);

    // Background Routine Sync (Pulsing Heartbeat) - Always Silent
    const interval = setInterval(() => {
        fetchData(true);
    }, 60000); 

    // Realtime Event Listener - Always Silent
    if (supabase) {
        const channel = supabase
          .channel('global_sync_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, 
            () => {
              if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 1000);
            }
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosks' }, 
            (payload: any) => {
              const isMyUpdate = payload.new && payload.new.id === kioskId;
              const isMyDelete = payload.old && payload.old.id === kioskId;
              if (isAdmin || isMyUpdate || isMyDelete) {
                  if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
                  syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 1000);
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
    // Immediate local state update for snappy UI
    setStoreData({ ...newData }); 
    setLastSyncTime(new Date().toLocaleTimeString());
    
    // Silent background save
    setIsSyncing(true);
    try {
        await saveStoreData(newData);
    } catch (e: any) {
        console.error("Manual save failed", e);
    } finally {
        setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // Only block the screen on the VERY first boot
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
      
      {/* Tiny corner indicator for Admin saves, strictly non-blocking */}
      {isSyncing && isAdmin && (
         <div className="fixed bottom-4 right-4 z-[200] bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in pointer-events-none">
            <Loader2 className="animate-spin" size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Cloud Syncing</span>
         </div>
      )}
      
      {isAdmin ? (
        <AdminDashboard 
            storeData={storeData}
            onUpdateData={handleUpdateData}
            onRefresh={() => fetchData(true)} 
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
