
import React, { useState, useEffect, useCallback } from 'react';
import { KioskApp } from './components/KioskApp';
import { AdminDashboard } from './components/AdminDashboard';
import AboutPage from './components/AboutPage';
import { generateStoreData, saveStoreData } from './services/geminiService';
import { initSupabase, supabase } from './services/kioskService';
import { StoreData } from './types';
import { Loader2, Cloud, Download, CheckCircle2 } from 'lucide-react';

// === NEW: OPTIMIZED APP ICON UPDATER ===
const AppIconUpdater = ({ storeData }: { storeData: StoreData }) => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    
    // Default High-Res URLs (Used to check if we should use static manifest or dynamic override)
    const DEFAULT_ADMIN_ICON = "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png";
    const DEFAULT_KIOSK_ICON = "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png";

    // Memoize the target URL to prevent effect loops on general storeData updates
    const targetIconUrl = isAdmin 
        ? (storeData.appConfig?.adminIconUrl || DEFAULT_ADMIN_ICON)
        : (storeData.appConfig?.kioskIconUrl || DEFAULT_KIOSK_ICON);

    useEffect(() => {
        const updateAppIdentity = async () => {
             // 1. Update Tab Icons (Immediate Visual Feedback)
             const iconLink = document.getElementById('pwa-icon') as HTMLLinkElement;
             const appleLink = document.getElementById('pwa-apple-icon') as HTMLLinkElement;
             
             if (iconLink && iconLink.href !== targetIconUrl) iconLink.href = targetIconUrl;
             if (appleLink && appleLink.href !== targetIconUrl) appleLink.href = targetIconUrl;

             // 2. Update Manifest (For Install Prompt & PWA Launches)
             const defaultForMode = isAdmin ? DEFAULT_ADMIN_ICON : DEFAULT_KIOSK_ICON;
             const isDefault = (targetIconUrl === defaultForMode);
             
             const baseManifest = isAdmin ? '/manifest-admin.json' : '/manifest-kiosk.json';
             const manifestLink = document.getElementById('pwa-manifest') as HTMLLinkElement;

             if (isDefault) {
                 if (manifestLink) {
                     const currentHref = manifestLink.getAttribute('href') || '';
                     if (!currentHref.endsWith(baseManifest.substring(1)) && currentHref !== baseManifest) {
                         if (manifestLink.href.startsWith('blob:')) {
                             URL.revokeObjectURL(manifestLink.href);
                         }
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

                    manifest.orientation = "any";
                    manifest.icons = [
                        { src: targetIconUrl, sizes: sizes, type: iconType, purpose: "any" },
                        { src: targetIconUrl, sizes: sizes, type: iconType, purpose: "maskable" },
                        { src: targetIconUrl, sizes: largeSizes, type: iconType, purpose: "any" },
                        { src: targetIconUrl, sizes: largeSizes, type: iconType, purpose: "maskable" }
                    ];

                    if (!manifest.lang) manifest.lang = "en";
                    if (typeof manifest.prefer_related_applications === 'undefined') manifest.prefer_related_applications = false;
                    
                    const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
                    const blobUrl = URL.createObjectURL(blob);
                    
                    manifestLink.href = blobUrl;
                }
             } catch (e) {
                 console.error("Manifest update failed:", e);
             }
        };

        if (targetIconUrl) {
            updateAppIdentity();
        }
    }, [targetIconUrl, isAdmin]);

    return null;
};


export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // 1. Simple Router Logic
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchData = useCallback(async () => {
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
      }
  }, []);

  // 2. Data Synchronization & Realtime
  useEffect(() => {
    initSupabase();
    fetchData();

    // Polling Logic: Check every 60s for changes if Realtime fails
    const interval = setInterval(() => {
        console.log("Background Refresh (60s cycle)...");
        fetchData();
    }, 60000); 

    // Setup Realtime Subscription
    if (supabase) {
        // Subscribe to ANY change in the store_config table
        const channel = supabase
          .channel('system_sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'store_config' },
            (payload: any) => {
              console.log("Remote Config Update detected via Realtime!", payload);
              // Trigger a fresh fetch
              fetchData();
            }
          )
          .on(
             'postgres_changes',
             { event: '*', schema: 'public', table: 'kiosks' },
             (payload: any) => {
                 console.log("Fleet status changed remotely.");
                 // Refreshing data ensures fleet view in Admin is live
                 fetchData();
             }
          )
          .subscribe((status: string) => {
             console.log("Sync Channel Status:", status);
          });

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdateData = async (newData: StoreData) => {
    setIsSyncing(true);
    setStoreData(newData); 
    
    try {
        await saveStoreData(newData);
        setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e: any) {
        console.error("Cloud Sync failed", e);
        alert(`SYNC ERROR: ${e.message || "Failed to connect to server."}`);
    } finally {
        setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <div className="text-xl font-bold tracking-widest uppercase">System Boot</div>
        <div className="text-xs text-slate-500 mt-2">Initializing Modules...</div>
      </div>
    );
  }

  const normalizedRoute = currentRoute.endsWith('/') && currentRoute.length > 1 
    ? currentRoute.slice(0, -1) 
    : currentRoute;

  if (normalizedRoute === '/admin') {
    return (
      <>
        {storeData && <AppIconUpdater storeData={storeData} />}
        <AdminDashboard 
            storeData={storeData}
            onUpdateData={handleUpdateData}
            onRefresh={() => {
                setIsSyncing(true);
                fetchData().then(() => {
                    setIsSyncing(false);
                });
            }}
        />
      </>
    );
  }

  if (normalizedRoute === '/about') {
    return (
        <AboutPage 
            storeData={storeData!} 
            onBack={() => {
                window.history.pushState({}, '', '/');
                setCurrentRoute('/');
            }}
        />
    );
  }

  return (
    <>
      {storeData && <AppIconUpdater storeData={storeData} />}
      {isSyncing && (
         <div className="fixed bottom-4 right-4 z-[200] bg-slate-900/90 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-3 backdrop-blur-md border border-white/10 animate-fade-in transition-all">
            <Loader2 className="animate-spin text-blue-400" size={16} />
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System</span>
                <span className="text-xs font-bold">Syncing Data...</span>
            </div>
         </div>
      )}
      <KioskApp 
        storeData={storeData}
        lastSyncTime={lastSyncTime}
        onSyncRequest={fetchData}
      />
    </>
  );
}
