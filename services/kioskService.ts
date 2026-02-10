
import { createClient } from '@supabase/supabase-js';
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
let localDirHandle: FileSystemDirectoryHandle | null = null;

export const setLocalDirHandle = (handle: FileSystemDirectoryHandle | null) => {
    localDirHandle = handle;
};

export const getLocalDirHandle = () => localDirHandle;

/**
 * Prompt user to select a local folder for storage (Bypass Supabase)
 */
export const requestLocalFolder = async (): Promise<string | null> => {
    try {
        const handle = await (window as any).showDirectoryPicker({
            mode: 'readwrite'
        });
        localDirHandle = handle;
        return handle.name;
    } catch (e) {
        console.error("User cancelled or browser unsupported", e);
        return null;
    }
};

/**
 * Writes data directly to the local PC folder
 */
export const writeToLocalDrive = async (filename: string, content: Blob | string) => {
    if (!localDirHandle) return;
    try {
        const fileHandle = await localDirHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (e) {
        console.error("Local write failed", e);
    }
};

/**
 * Reads data directly from the local PC folder
 */
export const readFromLocalDrive = async (filename: string): Promise<File | null> => {
    if (!localDirHandle) return null;
    try {
        const fileHandle = await localDirHandle.getFileHandle(filename);
        return await fileHandle.getFile();
    } catch (e) {
        return null;
    }
};

export const initSupabase = () => {
  if (supabase) return true;
  if (SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10) {
    try {
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

export const getCloudProjectName = (): string => {
    if (localDirHandle) return `DRIVE: ${localDirHandle.name}`;
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
    if (localDirHandle) return true; // Local drive is "Always Online"
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
    if (localDirHandle) return true;
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
  
  if (localDirHandle) return true;

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
          show_pricelists: true 
        };
        const { error } = await supabase.from('kiosks').upsert(kioskData);
        if (error) throw error;
      } catch(e: any) {
        if (e.code === '42703' || e.message?.includes('show_pricelists')) {
            try {
                const legacyData = {
                    id,
                    name: shopName,
                    device_type: deviceType,
                    status: 'online',
                    last_seen: new Date().toISOString()
                };
                await supabase.from('kiosks').upsert(legacyData);
                return true;
            } catch (retryError) {
                return false;
            }
        }
      }
  }
  return true;
};

export const sendHeartbeat = async (currentLocalShowPricelists?: boolean): Promise<{ deviceType?: string, name?: string, restart?: boolean, deleted?: boolean, showPricelists?: boolean } | null> => {
  if (localDirHandle) return { showPricelists: true };
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

          const { error: updateError } = await supabase.from('kiosks').upsert(payload);
          if (updateError) throw updateError;
      }
      
      return { 
          name: currentName, 
          deviceType: currentDeviceType, 
          restart: restartFlag,
          showPricelists: remoteShowPricelists
      };
  } catch (e) {
      return null;
  }
};

/**
 * Uploads a file. If local folder is linked, saves to folder. Otherwise Supabase.
 */
export const smartUpload = async (file: File): Promise<string> => {
  if (localDirHandle) {
      try {
          const assetsFolder = await localDirHandle.getDirectoryHandle('assets', { create: true });
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
          const fileHandle = await assetsFolder.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(file);
          await writable.close();
          // We return a unique marker that our drive-rehydration logic understands
          return `local-drive://${fileName}`;
      } catch (e) {
          throw new Error("Local folder write failed.");
      }
  }

  if (!supabase) initSupabase();
  if (!supabase) throw new Error("Cloud Storage Unavailable");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('kiosk-media')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('kiosk-media').getPublicUrl(filePath);
  return publicUrl;
};

/**
 * Helper to turn local-drive:// markers into browser-usable URLs
 */
export const resolveMediaUrl = async (url: string): Promise<string> => {
    if (!url || !url.startsWith('local-drive://')) return url;
    if (!localDirHandle) return '';
    try {
        const fileName = url.replace('local-drive://', '');
        const assetsFolder = await localDirHandle.getDirectoryHandle('assets');
        const fileHandle = await assetsFolder.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return URL.createObjectURL(file);
    } catch (e) {
        return '';
    }
};

export const convertPdfToImages = async (file: File, onProgress?: (curr: number, total: number) => void): Promise<File[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs: any = pdfjsLib;
    if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';
    }
    const pdf = await pdfjs.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
    }).promise;
    const images: File[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        if (blob) images.push(new File([blob], `page_${i}.jpg`, { type: 'image/jpeg' }));
        if (onProgress) onProgress(i, pdf.numPages);
    }
    return images;
};
