
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { KioskRegistry } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

export const getEnv = (key: string, fallback: string) => {
  try {
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
    if (metaEnv[key]) {
      return metaEnv[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return fallback;
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 
    getEnv('NEXT_PUBLIC_SUPABASE_URL', 
        getEnv('SUPABASE_URL', 'YOUR_SUPABASE_PROJECT_URL')
    )
);

const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 
        getEnv('SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_PUBLIC_KEY')
    )
);

export let supabase: any = null;

export const initSupabase = () => {
  if (supabase) return true;
  if (SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10) {
    try {
      // FIX: Explicitly pass the bound fetch polyfill to the Supabase client.
      // Chrome 37's native fetch (if any) or missing fetch causes connection failures.
      // Binding to window ensures we use the whatwg-fetch polyfill injected in index.html.
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          fetch: window.fetch.bind(window)
        }
      });
      return true;
    } catch (e) {
      console.warn("Supabase init failed", e);
    }
  }
  return false;
};

/**
 * Subscribes to real-time updates for key store tables.
 * Returns the RealtimeChannel object which can be used to unsubscribe() later.
 */
export const subscribeToStoreUpdates = (onUpdate: (payload: any) => void): RealtimeChannel | null => {
    if (!supabase) initSupabase();
    if (!supabase) return null;

    // Listen to changes on all granular inventory tables
    const channel = supabase.channel('store-db-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'brands' },
            (payload: any) => onUpdate(payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'categories' },
            (payload: any) => onUpdate(payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload: any) => onUpdate(payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'pricelists' },
            (payload: any) => onUpdate(payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'pricelist_brands' },
            (payload: any) => onUpdate(payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'kiosks' },
            (payload: any) => onUpdate(payload)
        )
        .subscribe();

    return channel;
};

export const getCloudProjectName = (): string => {
    if (!SUPABASE_URL) return "Local";
    try {
        const url = new URL(SUPABASE_URL);
        const parts = url.hostname.split('.');
        if (parts.length > 0) return parts[0].toUpperCase();
    } catch (e) {
        return "Unknown";
    }
    return "Local";
};

export const checkCloudConnection = async (): Promise<boolean> => {
    if (!supabase) {
        initSupabase();
        if(!supabase) return false;
    }
    try {
        const { error } = await supabase.from('store_config').select('id', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
};

const STORAGE_KEY_ID = 'kiosk_pro_device_id';
const STORAGE_KEY_NAME = 'kiosk_pro_shop_name';
const STORAGE_KEY_TYPE = 'kiosk_pro_device_type';

export const getKioskId = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_ID);
};

export const setCustomKioskId = (id: string) => {
  localStorage.setItem(STORAGE_KEY_ID, id);
};

export const provisionKioskId = async (): Promise<string> => {
  let id = localStorage.getItem(STORAGE_KEY_ID);
  if (id) return id;
  const randomSuffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const nextId = "LOC-" + randomSuffix;
  localStorage.setItem(STORAGE_KEY_ID, nextId);
  return nextId;
};

export const tryRecoverIdentity = async (id: string): Promise<boolean> => {
    if (!supabase) initSupabase();
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('kiosks')
            .select('name, device_type')
            .eq('id', id)
            .maybeSingle();
        
        if (!error && data) {
            if (data.name) localStorage.setItem(STORAGE_KEY_NAME, data.name);
            if (data.device_type) localStorage.setItem(STORAGE_KEY_TYPE, data.device_type);
            return true;
        }
    } catch (e) {
        console.warn("Identity recovery failed", e);
    }
    return false;
};

export const getShopName = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_NAME);
};

export const getDeviceType = (): 'kiosk' | 'mobile' | 'tv' => {
    return (localStorage.getItem(STORAGE_KEY_TYPE) as 'kiosk' | 'mobile' | 'tv') || 'kiosk';
};

export const isKioskConfigured = (): boolean => {
  return !!getKioskId() && !!getShopName();
};

export const completeKioskSetup = async (shopName: string, deviceType: 'kiosk' | 'mobile' | 'tv'): Promise<boolean> => {
  const id = getKioskId();
  if (!id) return false;
  
  localStorage.setItem(STORAGE_KEY_NAME, shopName);
  localStorage.setItem(STORAGE_KEY_TYPE, deviceType);
  
  initSupabase();
  if (supabase) {
      try {
        const kioskData: any = {
          id,
          name: shopName,
          device_type: deviceType,
          status: 'online',
          last_seen: new Date().toISOString(),
          wifi_strength: 100,
          ip_address: 'Unknown',
          version: '1.0.5',
          location_description: 'Newly Registered',
          assigned_zone: 'Unassigned',
          restart_requested: false,
          show_pricelists: true // Default to visible
        };
        const { error } = await supabase.from('kiosks').upsert(kioskData);
        if (error) throw error;
      } catch(e: any) {
        // Fallback: If show_pricelists doesn't exist yet, retry without it to prevent crash
        if (e.code === '42703' || e.message?.includes('show_pricelists')) {
            console.warn("Schema mismatch: Retrying setup without show_pricelists column.");
            try {
                const legacyData = {
                    id,
                    name: shopName,
                    device_type: deviceType,
                    status: 'online',
                    last_seen: new Date().toISOString()
                };
                await supabase.from('kiosks').upsert(legacyData);
                return true; // Success on fallback
            } catch (retryError) {
                console.error("Critical Setup Error", retryError);
                return false;
            }
        }
        console.warn("Cloud registration deferred.", e.message);
      }
  }
  return true;
};

export const sendHeartbeat = async (currentLocalShowPricelists?: boolean): Promise<{ deviceType?: string, name?: string, restart?: boolean, deleted?: boolean, showPricelists?: boolean } | null> => {
  const id = getKioskId();
  if (!id) return null;
  if (!supabase) initSupabase();
  
  let currentName = getShopName() || "Unknown Device";
  let currentDeviceType = getDeviceType();
  let currentZone = "Unassigned";
  let configChanged = false;
  let restartFlag = false;
  let remoteShowPricelists = true;

  try {
      if (supabase) {
          const { data: remoteData, error: fetchError } = await supabase
              .from('kiosks')
              .select('name, device_type, assigned_zone, restart_requested, show_pricelists')
              .eq('id', id)
              .maybeSingle();

          if (!fetchError && !remoteData) {
              return { deleted: true };
          }

          if (!fetchError && remoteData) {
              if (remoteData.name && remoteData.name !== currentName) {
                  localStorage.setItem(STORAGE_KEY_NAME, remoteData.name);
                  currentName = remoteData.name;
                  configChanged = true;
              }
              if (remoteData.device_type && remoteData.device_type !== currentDeviceType) {
                  localStorage.setItem(STORAGE_KEY_TYPE, remoteData.device_type);
                  currentDeviceType = remoteData.device_type;
                  configChanged = true;
              }
              if (remoteData.assigned_zone) currentZone = remoteData.assigned_zone;
              if (remoteData.restart_requested) restartFlag = true;
              
              if (remoteData.show_pricelists !== undefined && remoteData.show_pricelists !== null) {
                  remoteShowPricelists = remoteData.show_pricelists;
                  // If local state doesn't match remote state, trigger config update
                  if (currentLocalShowPricelists !== undefined && currentLocalShowPricelists !== remoteShowPricelists) {
                      configChanged = true;
                  }
              }
          }
      }

      if (supabase) {
          const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
          let wifiStrength = 100;
          let ipAddress = 'Unknown';
          if(connection) {
              if(connection.downlink < 1) wifiStrength = 20;
              else if(connection.downlink < 5) wifiStrength = 50;
              else if(connection.downlink < 10) wifiStrength = 80;
              ipAddress = (connection.effectiveType ? connection.effectiveType.toUpperCase() : 'NET') + ' | ' + connection.downlink + 'Mbps';
          }

          const payload: any = {
              id,
              name: currentName,
              device_type: currentDeviceType,
              assigned_zone: currentZone,
              last_seen: new Date().toISOString(),
              status: 'online',
              wifi_strength: wifiStrength,
              ip_address: ipAddress
          };
          
          if (restartFlag) {
              payload.restart_requested = false;
          }

          await supabase.from('kiosks').upsert(payload);
      }

      if (restartFlag || configChanged) {
          return { deviceType: currentDeviceType, name: currentName, restart: restartFlag, showPricelists: remoteShowPricelists };
      }

  } catch (e) {
      console.warn("Sync cycle failed", e);
  }

  return null;
};

// --- SMART UPLOADER WITH CONCURRENCY QUEUE ---

interface QueueItem {
    id: string;
    file: File;
    resolve: (url: string) => void;
    reject: (err: any) => void;
    retries: number;
}

class UploadQueue {
    private queue: QueueItem[] = [];
    private activeCount = 0;
    private maxConcurrent = 3;
    private maxRetries = 3;

    add(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                resolve,
                reject,
                retries: 0
            });
            this.process();
        });
    }

    private async process() {
        if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;

        const item = this.queue.shift();
        if (!item) return;

        this.activeCount++;
        
        try {
            const url = await this.uploadWithRetry(item);
            item.resolve(url);
        } catch (e) {
            item.reject(e);
        } finally {
            this.activeCount--;
            this.process(); // Process next item
        }
    }

    private async uploadWithRetry(item: QueueItem): Promise<string> {
        if (!supabase) initSupabase();
        if (!supabase) throw new Error("Cloud Storage unavailable.");

        const fileExt = item.file.name.split('.').pop();
        const fileName = Math.random().toString(36).substring(2, 15) + '_' + Date.now() + '.' + fileExt;
        const filePath = fileName;

        try {
            const { error } = await supabase.storage.from('kiosk-media').upload(filePath, item.file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('kiosk-media').getPublicUrl(filePath);
            return publicUrl;
        } catch (e) {
            if (item.retries < this.maxRetries) {
                console.warn(`Upload failed for ${item.file.name}, retrying (${item.retries + 1}/${this.maxRetries})...`);
                item.retries++;
                // Exponential backoff
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, item.retries)));
                return this.uploadWithRetry(item);
            }
            throw e;
        }
    }
}

const uploader = new UploadQueue();

export const smartUpload = (file: File): Promise<string> => {
    return uploader.add(file);
};

/**
 * Legacy upload function kept for backward compatibility, now proxies to smartUpload
 */
export const uploadFileToStorage = async (file: File): Promise<string> => {
    return smartUpload(file);
};

/**
 * PDF Rasterization Service
 * Converts PDF pages to high-quality JPEG images for flipbook display.
 */
export const convertPdfToImages = async (file: File, onProgress?: (current: number, total: number) => void): Promise<File[]> => {
    const pdfjs: any = pdfjsLib;
    
    // Ensure worker is set (safe to set multiple times)
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    // Load document
    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const images: File[] = [];

    // Render each page
    for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(i, totalPages);
        
        const page = await pdf.getPage(i);
        // Scale 2.0 provides good quality for tablet retina displays without being excessive
        const viewport = page.getViewport({ scale: 2.0 }); 
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context!, viewport }).promise;

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        
        if (blob) {
            images.push(new File([blob], `page_${i}_${Date.now()}.jpg`, { type: 'image/jpeg' }));
        }
    }
    
    return images;
};
