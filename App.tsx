
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
      // 1. If it's a background sync call but we are in Admin, abort.
      // Admin should NEVER background-sync to avoid overwriting active forms.
      if (isAdmin && isBackground) return;

      if (!isBackground && isFirstLoad) setIsSyncing(true);
      
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(prev => {
               // 1. Initial Load: Always accept
               if (!prev) return data;

               // 2. Admin Logic: Only allow manual refresh to update full data.
               // We never background-sync Admin data.
               if (isAdmin && isBackground) {
                   return prev; 
               }

               // 3. Kiosk Logic: Full update
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
  }, [isAdmin, isFirstLoad]);

  useEffect(() => {
    initSupabase();
    // Initial fetch to get the current system state
    fetchData();

    // 1. Background Routine Sync (Pulsing Heartbeat) - STRICTLY KIOSK ONLY
    let interval: any = null;
    if (!isAdmin) {
        interval = setInterval(() => {
            fetchData(true);
        }, 60000); 
    }

    // 2. Realtime Event Listener - STRICTLY KIOSK ONLY
    // We don't want Admin state jumping because a Kiosk registered itself.
    let channel: any = null;
    if (supabase && !isAdmin) {
        channel = supabase
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
              
              if (isMyUpdate || isMyDelete) {
                  if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
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
  }, [fetchData, kioskId, isAdmin]);

  const handleUpdateData = async (newData: StoreData) => {
    setIsSyncing(true);
    setStoreData({ ...newData }); 
    try {
        await saveStoreData(newData);
        setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
        console.error("Manual save failed", e);
    } finally {
        setIsSyncing(false);
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
      
      {isSyncing && isAdmin && (
         <div className="fixed top-12 right-4 z-[200] bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
            <Loader2 className="animate-spin text-blue-400" size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Updating Cloud</span>
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
