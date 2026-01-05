
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
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
        }
      } catch (err) {
        console.warn('Wake Lock Failed', err);
      }
    };
    requestWakeLock();
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
        // Add a timeout to the fetch so it doesn't spin forever
        const dataPromise = generateStoreData();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Cloud Connection Timeout")), 15000)
        );

        const data = await Promise.race([dataPromise, timeoutPromise]) as StoreData;
        
        if (data) {
           setStoreData(prev => {
               if (!prev) return data;
               if (!isAdmin) return { ...data };
               if (!isBackground) return { ...data };
               return { ...prev, fleet: data.fleet };
           });
           setLastSyncTime(new Date().toLocaleTimeString());
           setError(null);
        }
      } catch (e: any) {
        console.error("Fetch failed", e);
        setError(e.message || "Unknown Connection Error");
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

    return () => clearInterval(interval);
  }, [fetchData]);

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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-6">
        {error ? (
          <div className="bg-red-900/20 border-2 border-red-500/50 p-8 rounded-[2rem] max-w-md w-full text-center animate-fade-in shadow-2xl">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Sync Protocol Failed</h2>
            <p className="text-slate-400 text-sm font-mono mb-6 break-all bg-black/40 p-3 rounded-xl">{error}</p>
            <button 
                onClick={() => { setError(null); fetchData(); }}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-xl"
            >
                <RefreshCw size={18} /> Retry Connection
            </button>
            <p className="text-[9px] text-slate-500 mt-6 uppercase font-bold tracking-widest leading-relaxed">
              Verify VITE_SUPABASE_URL & ANON_KEY in environment settings.
            </p>
          </div>
        ) : (
          <>
            <div className="spinner mb-6"></div>
            <div className="tracking-[0.2em] uppercase text-[10px] text-slate-500 font-black">Initializing Firmware...</div>
          </>
        )}
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
