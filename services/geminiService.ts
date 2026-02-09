
import { StoreData, Product, Catalogue, KioskRegistry, Brand, Category, Pricelist, PricelistBrand } from "../types";
import { getEnv, checkCloudConnection } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
const PC_API_URL = getEnv('VITE_PC_API_URL', 'https://your-kiosk-api.com');

// --- IDB WRAPPER (Async Local Cache) ---
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
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
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

const broadcastSync = (progress: number, status: 'idle' | 'syncing' | 'complete' | 'error') => {
    window.dispatchEvent(new CustomEvent('kiosk-sync-event', { detail: { progress, status } }));
};

const DEFAULT_DATA: StoreData = {
  companyLogoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
  hero: {
    title: "Future Retail Experience",
    subtitle: "Global Product Showcase Platform",
    backgroundImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    logoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
    websiteUrl: "https://jstyp.me"
  },
  screensaverSettings: {
    idleTimeout: 60,
    imageDuration: 8,
    muteVideos: false,
    showProductImages: true,
    showProductVideos: true,
    showPamphlets: true,
    showCustomAds: true,
    displayStyle: 'contain',
    showInfoOverlay: true
  },
  catalogues: [],
  pricelists: [],
  pricelistBrands: [],
  brands: [],
  tv: { brands: [] },
  ads: { homeBottomLeft: [], homeBottomRight: [], screensaver: [] },
  fleet: [],
  admins: [{ id: 'admin', name: 'Admin', pin: '1723', isSuperAdmin: true, permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true } }],
  systemSettings: { setupPin: "0000" }
};

export const fetchFleetRegistry = async (): Promise<KioskRegistry[]> => {
    try {
        const res = await fetch(`${PC_API_URL}/api/fleet`);
        if (res.ok) return await res.json();
    } catch(e) {}
    return [];
};

// Fix type inference in generateStoreData by adding explicit StoreData casts to returned values.
export const generateStoreData = async (): Promise<StoreData> => {
  const isOnline = await checkCloudConnection();

  if (isOnline) {
      try {
          const res = await fetch(`${PC_API_URL}/api/config`);
          if (res.ok) {
              const data = await res.json();
              await dbPut(STORAGE_KEY_DATA, data);
              return data as StoreData;
          }
      } catch (e) {}
  }
  
  const stored = await dbGet(STORAGE_KEY_DATA);
  if (stored) return stored as StoreData;

  return DEFAULT_DATA;
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    await dbPut(STORAGE_KEY_DATA, data);
    
    const isOnline = await checkCloudConnection();
    if (isOnline) {
        broadcastSync(20, 'syncing');
        try {
            const res = await fetch(`${PC_API_URL}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                broadcastSync(100, 'complete');
                setTimeout(() => broadcastSync(0, 'idle'), 2000);
            } else throw new Error();
        } catch (e) {
            broadcastSync(0, 'error');
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};

// Bypassed Granular Sync Functions (Now using Monolith Cloud JSON for high-performance kiosks)
export const upsertBrand = async (brand: Brand) => {};
export const upsertCategory = async (category: Category, brandId: string) => {};
export const upsertProduct = async (product: Product, categoryId: string) => {};
export const upsertPricelist = async (pricelist: Pricelist) => {};
export const upsertPricelistBrand = async (pb: PricelistBrand) => {};
export const deleteItem = async (type: any, id: string) => {};
export const clearOfflineQueue = () => {};
