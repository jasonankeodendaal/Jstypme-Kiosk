
import { createClient } from '@supabase/supabase-js';
import { KioskRegistry } from '../types';

export const getEnv = (key: string, fallback: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
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
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    } catch (e) {
      console.warn("Supabase init failed", e);
    }
  }
  return false;
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

/**
 * Attempts to find this device in the Supabase database.
 * If found, restores name and type to localStorage.
 */
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
        const kioskData = {
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
          restart_requested: false
        };
        await supabase.from('kiosks').upsert(kioskData);
      } catch(e: any) {
        console.warn("Cloud registration deferred.", e.message);
      }
  }
  return true;
};

export const sendHeartbeat = async (): Promise<{ deviceType?: string, name?: string, restart?: boolean, deleted?: boolean } | null> => {
  const id = getKioskId();
  if (!id) return null;
  if (!supabase) initSupabase();
  
  let currentName = getShopName() || "Unknown Device";
  let currentDeviceType = getDeviceType();
  let currentZone = "Unassigned";
  let configChanged = false;
  let restartFlag = false;

  try {
      // 1. SYNC: Pull latest configuration from cloud first
      if (supabase) {
          const { data: remoteData, error: fetchError } = await supabase
              .from('kiosks')
              .select('name, device_type, assigned_zone, restart_requested')
              .eq('id', id)
              .maybeSingle();

          // CRITICAL FIX: If device not found in DB, it has been deleted from fleet
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
          }
      }

      // 2. TELEMETRY: Push status update
      if (supabase) {
          const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
          let wifiStrength = 100;
          let ipAddress = 'Unknown';
          if(connection) {
              if(connection.downlink < 1) wifiStrength = 20;
              else if(connection.downlink < 5) wifiStrength = 50;
              else if(connection.downlink < 10) wifiStrength = 80;
              ipAddress = `${connection.effectiveType?.toUpperCase() || 'NET'} | ${connection.downlink}Mbps`;
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
          
          // Only clear the restart flag in the payload if it was actually true and we are acknowledging it
          if (restartFlag) {
              payload.restart_requested = false;
          }

          await supabase.from('kiosks').upsert(payload);
      }

      if (restartFlag || configChanged) {
          return { deviceType: currentDeviceType, name: currentName, restart: restartFlag };
      }

  } catch (e) {
      console.warn("Sync cycle failed", e);
  }

  return null;
};

export const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!supabase) initSupabase();
    if (!supabase) throw new Error("Cloud Storage unavailable.");

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage.from('kiosk-media').upload(filePath, file);
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('kiosk-media').getPublicUrl(filePath);
        return publicUrl;
    } catch (e: any) {
        console.error("Storage error", e);
        throw e;
    }
};
