
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, Category, Pricelist, PricelistBrand } from "../types";
import { supabase, getEnv, initSupabase, checkCloudConnection } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
const STORAGE_KEY_OFFLINE_QUEUE = 'kiosk_pro_offline_queue';

// --- IDB WRAPPER (Async Storage) ---
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
  } catch (e) {
    console.warn("IDB Read Error", e);
    return null;
  }
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
  } catch (e) {
    console.warn("IDB Write Error", e);
  }
}

// --- PERFORMANCE UTILITIES ---

// Yield to main thread to prevent "Application Freeze" watchdog triggers
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

// Progress broadcasting utility
const broadcastSync = (progress: number, status: 'idle' | 'syncing' | 'complete' | 'error') => {
    // Dispatch in a timeout to avoid synchronous layout thrashing
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('kiosk-sync-event', { 
            detail: { progress, status } 
        }));
    }, 0);
};

const DEFAULT_ADMIN: AdminUser = {
    id: 'super-admin',
    name: 'Admin',
    pin: '1723',
    isSuperAdmin: true,
    permissions: {
        inventory: true,
        marketing: true,
        tv: true,
        screensaver: true,
        fleet: true,
        history: true,
        settings: true,
        pricelists: true
    }
};

const MOCK_BRANDS: Brand[] = [
  {
    id: 'b-apple',
    name: 'Apple',
    logoUrl: 'https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png',
    categories: [
      {
        id: 'c-iphone',
        name: 'Smartphone',
        icon: 'Smartphone',
        products: [
          {
            id: 'p-iphone15pm',
            sku: 'APL-I15PM',
            name: 'iPhone 15 Pro Max',
            description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip.',
            specs: { 'Chip': 'A17 Pro', 'Display': '6.7-inch Super Retina XDR' },
            features: ['Titanium design', 'Action button'],
            dimensions: [{ label: 'Device', width: '76.7 mm', height: '159.9 mm', depth: '8.25 mm', weight: '221 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  }
];

const DEFAULT_DATA: StoreData = {
  companyLogoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
  hero: {
    title: "Future Retail Experience",
    subtitle: "Discover the latest in Tech, Fashion, and Lifestyle.",
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
    showCustomAds: true
  },
  catalogues: [],
  pricelists: [],
  pricelistBrands: [],
  brands: MOCK_BRANDS,
  tv: { brands: [] },
  ads: { homeBottomLeft: [], homeBottomRight: [], screensaver: [] },
  fleet: [],
  about: { title: "About Our Vision", text: "Welcome to the Kiosk Pro Showcase.", audioUrl: "" },
  admins: [DEFAULT_ADMIN],
  appConfig: {
      kioskIconUrl: "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png",
      adminIconUrl: "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png"
  },
  systemSettings: { setupPin: "0000" }
};

const migrateData = (data: any): StoreData => {
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [...MOCK_BRANDS];
    if (!data.catalogues || !Array.isArray(data.catalogues)) data.catalogues = [];
    if (!data.pricelists || !Array.isArray(data.pricelists)) data.pricelists = [];
    if (!data.pricelistBrands || !Array.isArray(data.pricelistBrands)) data.pricelistBrands = [];
    if (!data.fleet || !Array.isArray(data.fleet)) data.fleet = [];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.about) data.about = { ...DEFAULT_DATA.about };
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) data.admins = [DEFAULT_ADMIN];
    if (!data.appConfig) data.appConfig = { ...DEFAULT_DATA.appConfig };
    if (!data.tv) data.tv = { brands: [] };
    if (!data.systemSettings) data.systemSettings = { ...DEFAULT_DATA.systemSettings };
    return data as StoreData;
};

// Async Storage Safety: Process items in chunks to prevent UI freeze
const sanitizeDataAsync = async (data: any): Promise<any> => {
    if (typeof data === 'string') {
        if (data.startsWith('data:') && data.length > 2048) { 
             return ''; // Strip heavy base64
        }
        if (data.length > 500000) {
            return data.substring(0, 500000) + '...[TRUNCATED]';
        }
        return data;
    }
    
    if (Array.isArray(data)) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push(await sanitizeDataAsync(data[i]));
            // Yield every 50 items to keep UI responsive
            if (i % 50 === 0) await yieldToMain();
        }
        return result;
    }
    
    if (data !== null && typeof data === 'object') {
        const newData: any = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            newData[key] = await sanitizeDataAsync(data[key]);
            if (i % 50 === 0) await yieldToMain();
        }
        return newData;
    }
    return data;
};

// --- OFFLINE QUEUE SYSTEM ---

interface SyncAction {
    type: 'BRAND' | 'CATEGORY' | 'PRODUCT' | 'PRICELIST' | 'PRICELIST_BRAND' | 'ARCHIVE' | 'DELETE_ITEM';
    subtype?: 'upsert' | 'delete';
    data: any;
    id: string;
    timestamp: number;
}

class OfflineQueue {
    private queue: SyncAction[] = [];

    constructor() {
        this.load();
    }

    private load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to load offline queue", e);
        }
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(this.queue));
        } catch (e) {
            console.error("Failed to save offline queue", e);
        }
    }

    add(action: SyncAction) {
        this.queue = this.queue.filter(a => !(a.type === action.type && a.id === action.id));
        this.queue.push(action);
        this.save();
    }

    async process() {
        if (this.queue.length === 0) return;
        if (!supabase) initSupabase();
        if (!supabase) return;

        const online = await checkCloudConnection();
        if (!online) return;

        // Throttled UI update
        broadcastSync(10, 'syncing');

        const remaining: SyncAction[] = [];
        let successCount = 0;

        for (let i = 0; i < this.queue.length; i++) {
            const action = this.queue[i];
            
            // Yield periodically
            if (i % 5 === 0) await yieldToMain();

            try {
                let error = null;
                if (action.subtype === 'delete') {
                    const tableMap: any = {
                        'BRAND': 'brands', 'CATEGORY': 'categories', 'PRODUCT': 'products',
                        'PRICELIST': 'pricelists', 'PRICELIST_BRAND': 'pricelist_brands'
                    };
                    const table = tableMap[action.type];
                    if (table) {
                        const res = await supabase.from(table).delete().eq('id', action.id);
                        error = res.error;
                    }
                } else {
                    let res: any = {};
                    if (action.type === 'BRAND') res = await supabase.from('brands').upsert(action.data);
                    else if (action.type === 'CATEGORY') res = await supabase.from('categories').upsert(action.data);
                    else if (action.type === 'PRODUCT') res = await supabase.from('products').upsert(action.data);
                    else if (action.type === 'PRICELIST') res = await supabase.from('pricelists').upsert(action.data);
                    else if (action.type === 'PRICELIST_BRAND') res = await supabase.from('pricelist_brands').upsert(action.data);
                    error = res.error;
                }
                
                if (error) throw error;
                successCount++;
            } catch (e) {
                console.error("Sync action failed", action, e);
                remaining.push(action); 
            }
        }

        this.queue = remaining;
        this.save();
        
        if (successCount > 0) {
            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 2000);
        }
    }
}

const offlineQueue = new OfflineQueue();

// --- GRANULAR SYNC FUNCTIONS ---

const flattenBrand = (b: Brand) => ({
    id: b.id, name: b.name, logo_url: b.logoUrl, theme_color: b.themeColor, updated_at: new Date().toISOString()
});
const flattenCategory = (c: Category, brandId: string) => ({
    id: c.id, brand_id: brandId, name: c.name, icon: c.icon, image_url: c.imageUrl, updated_at: new Date().toISOString()
});
const flattenProduct = (p: Product, categoryId: string) => ({
    id: p.id, category_id: categoryId, name: p.name, sku: p.sku, description: p.description,
    image_url: p.imageUrl, gallery_urls: p.galleryUrls || [], video_urls: p.videoUrls || [],
    specs: p.specs || {}, features: p.features || [], box_contents: p.boxContents || [],
    manuals: p.manuals || [], terms: p.terms, dimensions: p.dimensions || [],
    date_added: p.dateAdded, updated_at: new Date().toISOString()
});
const flattenPricelist = (pl: Pricelist) => ({
    id: pl.id, brand_id: pl.brandId, title: pl.title, month: pl.month, year: pl.year,
    url: pl.url, thumbnail_url: pl.thumbnailUrl, type: pl.type, kind: pl.kind,
    start_date: pl.startDate, end_date: pl.endDate, promo_text: pl.promoText,
    items: pl.items || [], headers: pl.headers || {}, date_added: pl.dateAdded, updated_at: new Date().toISOString()
});

export const upsertBrand = async (brand: Brand) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('brands').upsert(flattenBrand(brand));
        if (error) throw error;
    } catch (e) {
        offlineQueue.add({ type: 'BRAND', data: flattenBrand(brand), id: brand.id, timestamp: Date.now() });
    }
};

export const upsertCategory = async (category: Category, brandId: string) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('categories').upsert(flattenCategory(category, brandId));
        if (error) throw error;
    } catch (e) {
        offlineQueue.add({ type: 'CATEGORY', data: flattenCategory(category, brandId), id: category.id, timestamp: Date.now() });
    }
};

export const upsertProduct = async (product: Product, categoryId: string) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('products').upsert(flattenProduct(product, categoryId));
        if (error) throw error;
    } catch (e) {
        offlineQueue.add({ type: 'PRODUCT', data: flattenProduct(product, categoryId), id: product.id, timestamp: Date.now() });
    }
};

export const upsertPricelist = async (pricelist: Pricelist) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('pricelists').upsert(flattenPricelist(pricelist));
        if (error) throw error;
    } catch (e) {
        offlineQueue.add({ type: 'PRICELIST', data: flattenPricelist(pricelist), id: pricelist.id, timestamp: Date.now() });
    }
};

export const upsertPricelistBrand = async (pb: PricelistBrand) => {
    if (!supabase) initSupabase();
    const data = { id: pb.id, name: pb.name, logo_url: pb.logoUrl, updated_at: new Date().toISOString() };
    try {
        const { error } = await supabase.from('pricelist_brands').upsert(data);
        if (error) throw error;
    } catch (e) {
        offlineQueue.add({ type: 'PRICELIST_BRAND', data, id: pb.id, timestamp: Date.now() });
    }
};

export const deleteItem = async (type: 'BRAND' | 'CATEGORY' | 'PRODUCT' | 'PRICELIST' | 'PRICELIST_BRAND', id: string) => {
    if (!supabase) initSupabase();
    const tableMap: any = {
        'BRAND': 'brands', 'CATEGORY': 'categories', 'PRODUCT': 'products',
        'PRICELIST': 'pricelists', 'PRICELIST_BRAND': 'pricelist_brands'
    };
    try {
        if (tableMap[type]) {
            const { error } = await supabase.from(tableMap[type]).delete().eq('id', id);
            if (error) throw error;
        }
    } catch (e) {
        offlineQueue.add({ type, subtype: 'delete', data: null, id, timestamp: Date.now() });
    }
};

setTimeout(() => offlineQueue.process(), 5000);
setInterval(() => offlineQueue.process(), 60000);

// Modified: Priority Cloud Fetch, fallback to IDB
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  
  const isOnline = await checkCloudConnection();

  // 1. Try Cloud First (if online)
  if (isOnline && supabase) {
      try {
          const { data: configRow } = await supabase.from('store_config').select('data').eq('id', 1).single();
          let baseData = migrateData(configRow?.data || {});

          // Yield to prevent blocking during initial parsing
          await yieldToMain();

          try {
              const { data: fleetRows } = await supabase.from('kiosks').select('*');
              if (fleetRows) {
                  baseData.fleet = fleetRows.map((k: any) => ({
                      id: k.id, name: k.name, deviceType: k.device_type, status: k.status,
                      last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address,
                      version: k.version, locationDescription: k.location_description,
                      assignedZone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested,
                      showPricelists: k.show_pricelists
                  }));
              }
          } catch(e) {
              console.warn("Fleet fetch error", e);
          }

          try {
              const probe = await supabase.from('brands').select('id').limit(1);
              if (probe.error) throw new Error("Relational tables not ready");

              const [brandsRes, catsRes, prodsRes, plBrandsRes, plRes] = await Promise.all([
                  supabase.from('brands').select('*'),
                  supabase.from('categories').select('*'),
                  supabase.from('products').select('*'),
                  supabase.from('pricelist_brands').select('*'),
                  supabase.from('pricelists').select('*')
              ]);

              await yieldToMain();

              if (brandsRes.data && catsRes.data && prodsRes.data) {
                  // Heavy relational reconstruction - CHUNKED
                  const relationalBrands: Brand[] = [];
                  
                  for (let i = 0; i < brandsRes.data.length; i++) {
                      const b = brandsRes.data[i];
                      const brandCats = catsRes.data.filter((c: any) => c.brand_id === b.id);
                      const categories: Category[] = [];

                      for (const c of brandCats) {
                          const catProds = prodsRes.data.filter((p: any) => p.category_id === c.id);
                          categories.push({
                              id: c.id,
                              name: c.name,
                              icon: c.icon,
                              imageUrl: c.image_url,
                              products: catProds.map((p: any) => ({
                                  id: p.id,
                                  name: p.name,
                                  sku: p.sku,
                                  description: p.description,
                                  imageUrl: p.image_url,
                                  galleryUrls: p.gallery_urls,
                                  videoUrls: p.video_urls,
                                  specs: p.specs,
                                  features: p.features,
                                  dimensions: p.dimensions,
                                  boxContents: p.box_contents,
                                  manuals: p.manuals,
                                  terms: p.terms,
                                  dateAdded: p.date_added
                              }))
                          });
                      }

                      relationalBrands.push({
                          id: b.id,
                          name: b.name,
                          logoUrl: b.logo_url,
                          themeColor: b.theme_color,
                          categories
                      });

                      // Yield every 5 brands to keep UI smooth
                      if (i % 5 === 0) await yieldToMain();
                  }

                  if (relationalBrands.length > 0) {
                      baseData.brands = relationalBrands;
                  }

                  // Process Pricelists
                  if (plBrandsRes.data && plRes.data) {
                      const relPricelistBrands = plBrandsRes.data.map((pb: any) => ({
                          id: pb.id, name: pb.name, logoUrl: pb.logo_url
                      }));
                      const relPricelists = plRes.data.map((pl: any) => ({
                          id: pl.id,
                          brandId: pl.brand_id,
                          title: pl.title,
                          month: pl.month,
                          year: pl.year,
                          url: pl.url,
                          thumbnailUrl: pl.thumbnail_url,
                          type: pl.type,
                          kind: pl.kind,
                          startDate: pl.start_date,
                          endDate: pl.end_date,
                          promoText: pl.promo_text,
                          items: pl.items,
                          headers: pl.headers,
                          dateAdded: pl.date_added
                      }));

                      if (relPricelistBrands.length > 0) {
                          baseData.pricelistBrands = relPricelistBrands;
                          baseData.pricelists = relPricelists;
                      }
                  }
              }
          } catch (relationalError) {
              console.warn("Relational tables not found or empty. Using legacy monolith data.", relationalError);
          }

          // ASYNC SAVE TO INDEXEDDB (Non-blocking)
          try { 
              await dbPut(STORAGE_KEY_DATA, baseData);
          } catch (e) {
              console.warn("Failed to update local cache", e);
          }
          
          return baseData;

      } catch (e) { 
          console.warn("Cloud fetch failed, attempting local cache fallback.", e); 
      }
  }
  
  // 2. Fallback to Local IDB Cache
  try {
    const stored = await dbGet(STORAGE_KEY_DATA);
    if (stored) return migrateData(stored);
  } catch (e) {
      console.warn("IDB fetch failed", e);
  }

  // 3. Fallback to LocalStorage (Legacy/Emergency)
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}

  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    // 1. Sanitize Async
    const cleanData = await sanitizeDataAsync(data);
    
    // 2. Yield before Blocking
    await yieldToMain();
    
    // 3. Save to IDB (Async)
    try {
        await dbPut(STORAGE_KEY_DATA, cleanData);
    } catch (e) {
        console.error("IDB Save Failed", e);
        // Fallback to localStorage only if IDB fails
        try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(cleanData)); } catch(e){}
    }

    if (!supabase) initSupabase();
    if (supabase) {
        broadcastSync(10, 'syncing');
        
        try {
            let relationalTablesExist = false;
            try {
                // Quick check if tables exist
                const check = await supabase.from('brands').select('id').limit(1);
                if (!check.error) relationalTablesExist = true;
            } catch(e) {
                relationalTablesExist = false;
            }

            let settingsPayload = { ...cleanData };
            
            // Increased Archive Limit (200 items)
            const archivePruned = {
                ...(settingsPayload.archive || {}),
                deletedItems: (settingsPayload.archive?.deletedItems || []).slice(0, 200),
                brands: [], products: [], catalogues: [] 
            };
            settingsPayload.archive = archivePruned;

            // 1. CRITICAL: Upload the Monolith JSON first. 
            // This is the source of truth for the app's current session.
            const { error: configError } = await supabase.from('store_config').upsert({ id: 1, data: settingsPayload }, { onConflict: 'id' });
            if (configError) throw configError;
            
            broadcastSync(30, 'syncing');

            // 2. BACKGROUND RELATIONAL SYNC (Optimized)
            if (relationalTablesExist) {
                await yieldToMain();

                const flatBrands = cleanData.brands.map((b: Brand) => flattenBrand(b));
                
                // Optimized Flattening with less blocking
                const flatCategories: any[] = [];
                const flatProducts: any[] = [];
                
                for (const b of cleanData.brands) {
                    for (const c of b.categories) {
                        flatCategories.push(flattenCategory(c, b.id));
                        for (const p of c.products) {
                            flatProducts.push(flattenProduct(p, c.id));
                        }
                    }
                }

                const flatPLBrands = (cleanData.pricelistBrands || []).map((pb: PricelistBrand) => ({
                    id: pb.id, name: pb.name, logo_url: pb.logoUrl, updated_at: new Date().toISOString()
                }));

                const flatPricelists = (cleanData.pricelists || []).map((pl: Pricelist) => flattenPricelist(pl));

                // BATCH 1: Independent Root Tables (Brands & PricelistBrands) - Parallel
                await Promise.all([
                    flatBrands.length > 0 ? supabase.from('brands').upsert(flatBrands) : Promise.resolve(),
                    flatPLBrands.length > 0 ? supabase.from('pricelist_brands').upsert(flatPLBrands) : Promise.resolve()
                ]);
                
                broadcastSync(50, 'syncing');

                // BATCH 2: Categories (Depend on Brands)
                if (flatCategories.length > 0) await supabase.from('categories').upsert(flatCategories);
                
                // BATCH 3: Products (High Volume) - Parallel Batches
                const chunkArray = (arr: any[], size: number) => {
                    const chunks = [];
                    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
                    return chunks;
                };

                // Increase chunk size to 150 (Supabase handles this well)
                const productChunks = chunkArray(flatProducts, 150);
                
                // Concurrency: 4 requests at a time
                const CONCURRENCY = 4;
                for (let i = 0; i < productChunks.length; i += CONCURRENCY) {
                    const batch = productChunks.slice(i, i + CONCURRENCY);
                    await Promise.all(batch.map(chunk => supabase.from('products').upsert(chunk)));
                    
                    // Only yield every few batches to keep momentum
                    if (i % (CONCURRENCY * 2) === 0) await yieldToMain();
                }
                
                broadcastSync(80, 'syncing');

                // BATCH 4: Pricelists
                const plChunks = chunkArray(flatPricelists, 50); 
                for (const chunk of plChunks) {
                    // Keep sequential check here for specific error handling on Pricelists as requested in original code
                    const { error } = await supabase.from('pricelists').upsert(chunk);
                    if (error && (error.code === '42703' || error.message.includes('400'))) {
                        alert("Warning: Pricelists failed due to missing DB columns. Check Setup Guide.");
                    }
                }
            }

            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 2500);

        } catch (e: any) {
            console.error("Save Sync Error:", e);
            broadcastSync(0, 'error');
            // Don't throw here, we want the UI to unblock even if background sync had hiccups, 
            // as IDB save was likely successful.
            throw e; 
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    if (!supabase) initSupabase();
    if (supabase) {
        try {
            await supabase.from('products').delete().neq('id', '0');
            await supabase.from('categories').delete().neq('id', '0');
            await supabase.from('brands').delete().neq('id', '0');
            await supabase.from('pricelists').delete().neq('id', '0');
            await supabase.from('pricelist_brands').delete().neq('id', '0');
        } catch(e) {}
    }
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};
