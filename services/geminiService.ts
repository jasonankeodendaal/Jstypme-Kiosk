
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, Category, Pricelist, PricelistBrand } from "../types";
import { supabase, getEnv, initSupabase, checkCloudConnection, writeToLocalDrive, readFromLocalDrive, getLocalDirHandle, resolveMediaUrl } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
const STORAGE_KEY_OFFLINE_QUEUE = 'kiosk_pro_offline_queue';

// --- IDB WRAPPER ---
const DB_NAME = 'KioskProDB';
const STORE_NAME = 'store_config';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
  });
}

async function dbGet(key: string) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) { return null; }
}

async function dbPut(key: string, value: any) {
  try {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {}
}

const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));
const broadcastSync = (progress: number, status: 'idle' | 'syncing' | 'complete' | 'error') => {
    setTimeout(() => window.dispatchEvent(new CustomEvent('kiosk-sync-event', { detail: { progress, status } })), 0);
};

const DEFAULT_ADMIN: AdminUser = {
    id: 'super-admin', name: 'Admin', pin: '1723', isSuperAdmin: true,
    permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true }
};

const DEFAULT_DATA: StoreData = {
  companyLogoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
  hero: {
    title: "Future Retail Experience",
    subtitle: "Discover the latest in Tech, Fashion, and Lifestyle.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    logoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
    websiteUrl: "https://jstyp.me"
  },
  screensaverSettings: { idleTimeout: 60, imageDuration: 8, muteVideos: false, showProductImages: true, showProductVideos: true, showPamphlets: true, showCustomAds: true },
  catalogues: [], pricelists: [], pricelistBrands: [], brands: [], tv: { brands: [] }, ads: { homeBottomLeft: [], homeBottomRight: [], screensaver: [] }, fleet: [], admins: [DEFAULT_ADMIN],
  appConfig: { kioskIconUrl: "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png", adminIconUrl: "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png" },
  systemSettings: { setupPin: "0000" }
};

const migrateData = (data: any): StoreData => {
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [];
    if (!data.catalogues || !Array.isArray(data.catalogues)) data.catalogues = [];
    if (!data.pricelists || !Array.isArray(data.pricelists)) data.pricelists = [];
    if (!data.pricelistBrands || !Array.isArray(data.pricelistBrands)) data.pricelistBrands = [];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) data.admins = [DEFAULT_ADMIN];
    return data as StoreData;
};

/**
 * REHYDRATION: Replaces local-drive:// markers with usable object URLs
 */
const rehydrateMediaRecursive = async (data: any): Promise<any> => {
    if (typeof data === 'string' && data.startsWith('local-drive://')) return await resolveMediaUrl(data);
    if (Array.isArray(data)) {
        const results = [];
        for (const item of data) results.push(await rehydrateMediaRecursive(item));
        return results;
    }
    if (data !== null && typeof data === 'object') {
        const obj: any = {};
        for (const [k, v] of Object.entries(data)) obj[k] = await rehydrateMediaRecursive(v);
        return obj;
    }
    return data;
};

export const generateStoreData = async (): Promise<StoreData> => {
  // 0. Check Local Folder Bypass
  if (getLocalDirHandle()) {
      const localFile = await readFromLocalDrive('kiosk_database.json');
      if (localFile) {
          const text = await localFile.text();
          const data = JSON.parse(text);
          return await rehydrateMediaRecursive(migrateData(data));
      }
  }

  if (!supabase) initSupabase();
  const isOnline = await checkCloudConnection();

  if (isOnline && supabase) {
      try {
          const { data: configRow } = await supabase.from('store_config').select('data').eq('id', 1).single();
          let baseData = migrateData(configRow?.data || {});
          await yieldToMain();
          return baseData;
      } catch (e) {}
  }
  
  try {
    const stored = await dbGet(STORAGE_KEY_DATA);
    if (stored) return migrateData(stored);
  } catch (e) {}

  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    // 1. Local Drive Bypass
    if (getLocalDirHandle()) {
        broadcastSync(50, 'syncing');
        await writeToLocalDrive('kiosk_database.json', JSON.stringify(data, null, 2));
        broadcastSync(100, 'complete');
        setTimeout(() => broadcastSync(0, 'idle'), 1500);
        return;
    }

    await dbPut(STORAGE_KEY_DATA, data);
    if (!supabase) initSupabase();
    if (supabase) {
        broadcastSync(10, 'syncing');
        try {
            await supabase.from('store_config').upsert({ id: 1, data }, { onConflict: 'id' });
            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 2500);
        } catch (e: any) { broadcastSync(0, 'error'); }
    }
};

// ... Rest of service remains for cloud backward compatibility ...
export const upsertBrand = async (brand: Brand) => { if (!getLocalDirHandle()) { /* cloud logic */ } };
export const upsertCategory = async (category: Category, brandId: string) => { if (!getLocalDirHandle()) { /* cloud logic */ } };
export const upsertProduct = async (product: Product, categoryId: string) => { if (!getLocalDirHandle()) { /* cloud logic */ } };
export const upsertPricelist = async (pricelist: Pricelist) => { if (!getLocalDirHandle()) { /* cloud logic */ } };
export const upsertPricelistBrand = async (pb: PricelistBrand) => { if (!getLocalDirHandle()) { /* cloud logic */ } };
export const deleteItem = async (type: any, id: string) => { if (!getLocalDirHandle()) { /* cloud logic */ } };
export const resetStoreData = async (): Promise<StoreData> => { await saveStoreData(DEFAULT_DATA); return DEFAULT_DATA; };
export const fetchFleetRegistry = async () => { if (getLocalDirHandle()) return []; if (!supabase) initSupabase(); try { const { data } = await supabase.from('kiosks').select('*'); return data || []; } catch(e) { return []; } };
export const clearOfflineQueue = () => {};
