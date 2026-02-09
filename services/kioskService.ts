import { KioskRegistry } from '../types';

export const getEnv = (key: string, fallback: string) => {
  try {
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
    if (metaEnv[key]) return metaEnv[key];
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  } catch (e) {}
  return fallback;
};

// --- GLOBAL CONFIGURATION ---
// Connect via Cloudflare Tunnel or Public IP for global access
const PC_API_URL = getEnv('VITE_PC_API_URL', 'https://your-kiosk-api.com');

// Supabase is completely bypassed in this architecture
export const supabase: any = null;
export const initSupabase = () => true; 

export const getCloudProjectName = (): string => "KIOSK-PRO-CLOUD";

/**
 * Check if the central API server is reachable globally.
 */
export const checkCloudConnection = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${PC_API_URL}/api/health`, { 
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return res.ok;
    } catch (e) {
        return false;
    }
};

const STORAGE_KEY_ID = 'kiosk_pro_device_id';
const STORAGE_KEY_NAME = 'kiosk_pro_shop_name';
const STORAGE_KEY_TYPE = 'kiosk_pro_device_type';

export const getKioskId = (): string | null => localStorage.getItem(STORAGE_KEY_ID);
export const setCustomKioskId = (id: string) => localStorage.setItem(STORAGE_KEY_ID, id);

/**
 * Assign a unique identifier to the hardware.
 */
export const provisionKioskId = async (): Promise<string> => {
  let id = localStorage.getItem(STORAGE_KEY_ID);
  if (id) return id;
  const nextId = "LOC-" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  localStorage.setItem(STORAGE_KEY_ID, nextId);
  return nextId;
};

/**
 * Recover device metadata if the tablet was cleared but exists in the cloud registry.
 */
export const tryRecoverIdentity = async (id: string): Promise<boolean> => {
    try {
        const res = await fetch(`${PC_API_URL}/api/fleet/${id}`);
        if (!res.ok) return false;
        const data = await res.json();
        if (data) {
            localStorage.setItem(STORAGE_KEY_NAME, data.name);
            localStorage.setItem(STORAGE_KEY_TYPE, data.deviceType || 'kiosk');
            return true;
        }
    } catch (e) {}
    return false;
};

export const getShopName = (): string | null => localStorage.getItem(STORAGE_KEY_NAME);
export const getDeviceType = (): 'kiosk' | 'mobile' | 'tv' => (localStorage.getItem(STORAGE_KEY_TYPE) as any) || 'kiosk';
export const isKioskConfigured = (): boolean => !!getKioskId() && !!getShopName();

export const completeKioskSetup = async (shopName: string, deviceType: string): Promise<boolean> => {
  localStorage.setItem(STORAGE_KEY_NAME, shopName);
  localStorage.setItem(STORAGE_KEY_TYPE, deviceType);
  return true;
};

/**
 * Upload binary assets (Images/PDFs/Videos) to the custom cloud storage endpoint.
 */
export const smartUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${PC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
    }

    const data = await response.json();
    return data.url; // Returns the full URL to the hosted asset
};

/**
 * Convert PDF pages to high-res images for better mobile performance.
 */
export const convertPdfToImages = async (file: File, onProgress?: (curr: number, total: number) => void): Promise<File[]> => {
    // This is handled via the pdfjs-dist library in the UI components
    // and passed as a list of Files for smartUpload.
    return []; 
};

/**
 * Send telemetry data to the Command Center.
 * Includes health checks, battery, and remote command fetching.
 */
export const sendHeartbeat = async (currentLocalShowPricelists?: boolean): Promise<any> => {
  const id = getKioskId();
  if (!id) return null;
  
  try {
    const res = await fetch(`${PC_API_URL}/api/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name: getShopName(),
        deviceType: getDeviceType(),
        lastSeen: new Date().toISOString(),
        showPricelists: currentLocalShowPricelists,
        version: '3.1.0-CLOUD'
      })
    });
    
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Heartbeat offline");
  }
  return null;
};
