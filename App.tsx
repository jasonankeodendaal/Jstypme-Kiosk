
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
  
  // APK NATIVE BRIDGE: Screen Wake Lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Native Bridge: Wake Lock Acquired');
        }
      } catch (err) {
        console.warn('Native Bridge: Wake Lock Failed', err);
      }
    };

    requestWakeLock();
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  // APK NATIVE BRIDGE: Haptics and Immersive Fullscreen
  useEffect(() => {
    const handleFirstTouch = () => {
      // 1. Request Immersive Mode (Fullscreen)
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      
      // 2. Play subtle click vibration if supported
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    };

    const handleHaptic = (e: MouseEvent | TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a, [role="button"]')) {
            if (navigator.vibrate) navigator.vibrate(15);
        }
    };

    window.addEventListener('mousedown', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });
    window.addEventListener('click', handleHaptic);
    
    return () => {
        window.removeEventListener('click', handleHaptic);
    };
  }, []);

  const fetchData = useCallback(async (isBackground = false) => {
      if (isAdmin && isBackground && !isFirstLoad) {
          try {
              if (supabase) {
                  const { data: fleetData } = await supabase.from('kiosks').select('*');
                  if (fleetData) {
                      const mappedFleet = fleetData.map((k: any) => ({
                          id: k.id,
                          name: k.name,
                          deviceType: k.device_type,
                          status: k.status,
                          last_seen: k.last_seen,
                          wifiStrength: k.wifi_strength,
                          ipAddress: k.ip_address,
                          version: k.version,
                          locationDescription: k.location_description,
                          assignedZone: k.assigned_zone,
                          notes: k.notes,
                          restartRequested: k.restart_requested
                      }));
                      setStoreData(prev => prev ? { ...prev, fleet: mappedFleet } : null);
                  }
              }
          } catch (e) {
              console.warn("Background fleet sync failed", e);
          }
          return;
      }

      if (!isBackground && isFirstLoad) setIsSyncing(true);
      
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(prev => {
               if (!prev) return data;
               if (!isAdmin) return { ...data };
               if (!isBackground) return { ...data };
               return {
                   ...prev,
                   fleet: data.fleet
               };
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
    fetchData();

    const interval = setInterval(() => {
        fetchData(true);
    }, 60000); 

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
        clearInterval(interval);
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
