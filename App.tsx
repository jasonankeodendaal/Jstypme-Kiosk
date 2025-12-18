
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase, getKioskId } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, Cloud, Download, CheckCircle2 } from 'lucide-react';

// === OPTIMIZED APP ICON UPDATER ===
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

             const baseManifest = isAdmin ? '/manifest-admin.json' : '/manifest-kiosk.json';
             const manifestLink = document.getElementById('pwa-manifest') as HTMLLinkElement;

             if (targetIconUrl === DEFAULT_ADMIN_ICON || targetIconUrl === DEFAULT_KIOSK_ICON) {
                 if (manifestLink) {
                     const currentHref = manifestLink.getAttribute('href') || '';
                     if (!currentHref.endsWith(baseManifest.substring(1)) && currentHref !== baseManifest) {
                         if (manifestLink.href.startsWith('blob:')) URL.revokeObjectURL(manifestLink.href);
                         manifestLink.href = baseManifest;
                     }
                 }
                 return;
             }

             try {
                if (manifestLink) {
                    const response = await fetch(baseManifest);
                    if (!response.ok) throw new Error("Manifest fetch failed");
                    const manifest = await response.json();
                    
                    const isSvg = targetIconUrl.endsWith('.svg');
                    const iconType = isSvg ? "image/svg+xml" : "image/png";
                    const sizes = "192x192"; 
                    const largeSizes = "512x512";

                    manifest.icons = [
                        { src: targetIconUrl, sizes: sizes, type: iconType, purpose: "any" },
                        { src: targetIconUrl, sizes: sizes, type: iconType, purpose: "maskable" },
                        { src: targetIconUrl, sizes: largeSizes, type: iconType, purpose: "any" },
                        { src: targetIconUrl, sizes: largeSizes, type: iconType, purpose: "maskable" }
                    ];
                    
                    const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
                    const blobUrl = URL.createObjectURL(blob);
                    manifestLink.href = blobUrl;
                }
             } catch (e) {
                 console.error("Manifest update failed:", e);
             }
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

  useEffect(() => {
    const handleLocationChange = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchData = useCallback(async (isBackground = false) => {
      if (!isBackground) setIsSyncing(true);
      try {
        const data = await generateStoreData();
        if (data) {
           setStoreData(data);
           setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
  }, []);

  useEffect(() => {
    initSupabase();
    fetchData();

    // Background Polling (Authority Fallback)
    const interval = setInterval(() => {
        console.log("Routine System Sync...");
        fetchData(true);
    }, 60000); 

    // Setup Realtime WebSocket Subscription
    if (supabase) {
        const channel = supabase
          .channel('system_sync')
          // Listen to GLOBAL config changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'store_config' },
            (payload: any) => {
              console.log("Global Remote Update Signal:", payload.eventType);
              if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
              syncTimeoutRef.current = window.setTimeout(() => fetchData(true), 500);
            }
          )
          // Listen to FLEET changes (specific to this kiosk or all fleet if admin)
          .on(
             'postgres_changes',
             { event: '*', schema: 'public', table: 'kiosks' },
             (payload: any) => {
                 // Trigger refresh if my specific row changed or if any row changed (for admin views)
                 const isAdminView = window.location.pathname.startsWith('/admin');
                 const isMyUpdate = payload.new && payload.new.id === kioskId;
                 
                 if (isAdminView || isMyUpdate) {
                    console.log("Fleet Update Signal detected.");
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
  }, [fetchData, kioskId]);

  const handleUpdateData = async (newData: StoreData) => {
    setIsSyncing(true);
    setStoreData(newData); 
    try {
        await saveStoreData(newData);
        setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
        console.error("Sync failed", e);
        alert(`SYNC ERROR: ${e.message || "Cloud unavailable."}`);
    } finally {
        setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const normalizedRoute = currentRoute.endsWith('/') && currentRoute.length > 1 
    ? currentRoute.slice(0, -1) 
    : currentRoute;

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-black">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <div className="tracking-[0.2em] uppercase text-sm">System Initialize</div>
      </div>
    );
  }

  if (normalizedRoute === '/admin') {
    return (
      <>
        {storeData && <AppIconUpdater storeData={storeData} />}
        <AdminDashboard 
            storeData={storeData}
            onUpdateData={handleUpdateData}
            onRefresh={() => fetchData(false)}
        />
      </>
    );
  }

  if (normalizedRoute === '/about') {
    return (
        <AboutPage 
            storeData={storeData!} 
            onBack={() => { window.history.pushState({}, '', '/'); setCurrentRoute('/'); }}
        />
    );
  }

  return (
    <>
      {storeData && <AppIconUpdater storeData={storeData} />}
      {isSyncing && (
         <div className="fixed top-12 right-4 z-[200] bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
            <Loader2 className="animate-spin text-blue-400" size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Syncing</span>
         </div>
      )}
      <KioskApp 
        storeData={storeData}
        lastSyncTime={lastSyncTime}
        onSyncRequest={() => fetchData(true)}
      />
    </>
  );
}
