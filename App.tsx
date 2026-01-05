
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
      // If we are admin and this is a background pulse, we ONLY want fleet telemetry.
      // We must avoid fetching store_config because it might be stale compared to our local draft.
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

               // Kiosk logic: Full update always
               if (!isAdmin) return { ...data };

               // Admin logic: 
               // Background syncs are now handled above (fleet only).
               // If this is a manual refresh (!isBackground), allow full data replacement.
               if (!isBackground) return { ...data };

               // Fallback: merge fleet anyway
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

    // Routine Sync (Fleet telemetry heartbeat)
    const interval = setInterval(() => {
        fetchData(true);
    }, 60000); 

    // Realtime Event Listener - Disabled for Admin to prevent intrusive data loss
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
    // Immediate local update to keep UI responsive and prevent stale background fetches
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
