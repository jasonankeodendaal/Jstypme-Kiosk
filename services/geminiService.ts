
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

const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

const broadcastSync = (progress: number, status: 'idle' | 'syncing' | 'complete' | 'error') => {
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('kiosk-sync-event', { 
            detail: { progress, status } 
        }));
    }, 0);
};

// --- DATA HELPERS ---

const DEFAULT_ADMIN: AdminUser = {
    id: 'super-admin',
    name: 'Admin',
    pin: '1723',
    isSuperAdmin: true,
    permissions: {
        inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true
    }
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
  screensaverSettings: {
    idleTimeout: 60, imageDuration: 8, muteVideos: false, showProductImages: true, showProductVideos: true, showPamphlets: true, showCustomAds: true
  },
  catalogues: [], pricelists: [], pricelistBrands: [], brands: [], tv: { brands: [] },
  ads: { homeBottomLeft: [], homeBottomRight: [], screensaver: [] },
  fleet: [], about: { title: "About Our Vision", text: "Welcome to the Kiosk Pro Showcase.", audioUrl: "" },
  admins: [DEFAULT_ADMIN],
  appConfig: {
      kioskIconUrl: "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png",
      adminIconUrl: "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png"
  },
  systemSettings: { setupPin: "0000" }
};

const migrateData = (data: any): StoreData => {
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [];
    if (!data.catalogues) data.catalogues = [];
    if (!data.pricelists) data.pricelists = [];
    if (!data.pricelistBrands) data.pricelistBrands = [];
    if (!data.fleet) data.fleet = [];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.about) data.about = { ...DEFAULT_DATA.about };
    if (!data.admins || data.admins.length === 0) data.admins = [DEFAULT_ADMIN];
    if (!data.appConfig) data.appConfig = { ...DEFAULT_DATA.appConfig };
    if (!data.tv) data.tv = { brands: [] };
    if (!data.systemSettings) data.systemSettings = { ...DEFAULT_DATA.systemSettings };
    return data as StoreData;
};

// --- REAL-TIME DELTA LOGIC ---

/**
 * Merges a single table change into the complex StoreData tree.
 * This runs on the client to apply updates without full re-fetching.
 */
export const mergeDelta = (currentData: StoreData, payload: any): StoreData => {
    const { table, eventType, new: newRow, old: oldRow } = payload;
    const newData = { ...currentData };

    // 1. FLEET (Kiosks)
    if (table === 'kiosks') {
        const fleet = [...(newData.fleet || [])];
        if (eventType === 'DELETE') {
            newData.fleet = fleet.filter(k => k.id !== oldRow.id);
        } else {
            const index = fleet.findIndex(k => k.id === newRow.id);
            // Map snake_case DB columns to camelCase types
            const mappedKiosk: KioskRegistry = {
                id: newRow.id,
                name: newRow.name,
                status: newRow.status,
                last_seen: newRow.last_seen,
                deviceType: newRow.device_type,
                assignedZone: newRow.assigned_zone,
                wifiStrength: newRow.wifi_strength,
                ipAddress: newRow.ip_address,
                version: newRow.version,
                locationDescription: newRow.location_description,
                notes: newRow.notes,
                restartRequested: newRow.restart_requested,
                showPricelists: newRow.show_pricelists
            };
            
            if (index >= 0) fleet[index] = mappedKiosk;
            else fleet.push(mappedKiosk);
            
            newData.fleet = fleet;
        }
    }

    // 2. BRANDS
    else if (table === 'brands') {
        const brands = [...newData.brands];
        if (eventType === 'DELETE') {
            newData.brands = brands.filter(b => b.id !== oldRow.id);
        } else {
            const index = brands.findIndex(b => b.id === newRow.id);
            const mappedBrand: Brand = {
                id: newRow.id,
                name: newRow.name,
                logoUrl: newRow.logo_url,
                themeColor: newRow.theme_color,
                // Preserve existing categories if updating, or start empty
                categories: index >= 0 ? brands[index].categories : []
            };
            if (index >= 0) brands[index] = mappedBrand;
            else brands.push(mappedBrand);
            newData.brands = brands;
        }
    }

    // 3. CATEGORIES
    else if (table === 'categories') {
        // Need to find which brand this category belongs to
        const brands = [...newData.brands];
        // If updating/inserting, use newRow.brand_id. If deleting, we might need to search.
        const brandId = newRow?.brand_id || oldRow?.brand_id;
        
        const brandIndex = brands.findIndex(b => b.id === brandId);
        if (brandIndex >= 0) {
            const brand = { ...brands[brandIndex] };
            const cats = [...brand.categories];
            
            if (eventType === 'DELETE') {
                brand.categories = cats.filter(c => c.id !== oldRow.id);
            } else {
                const catIndex = cats.findIndex(c => c.id === newRow.id);
                const mappedCat: Category = {
                    id: newRow.id,
                    name: newRow.name,
                    icon: newRow.icon,
                    imageUrl: newRow.image_url,
                    // Preserve products
                    products: catIndex >= 0 ? cats[catIndex].products : []
                };
                if (catIndex >= 0) cats[catIndex] = mappedCat;
                else cats.push(mappedCat);
                brand.categories = cats;
            }
            brands[brandIndex] = brand;
            newData.brands = brands;
        }
    }

    // 4. PRODUCTS
    else if (table === 'products') {
        // This is complex because we need to find the product deeply nested.
        // Or if it's a new product, find the right category.
        
        // Helper to map DB row to Product type
        const mapProduct = (row: any): Product => ({
            id: row.id,
            name: row.name,
            sku: row.sku,
            description: row.description,
            imageUrl: row.image_url,
            galleryUrls: row.gallery_urls,
            videoUrls: row.video_urls,
            specs: row.specs,
            features: row.features,
            dimensions: row.dimensions,
            boxContents: row.box_contents,
            manuals: row.manuals,
            terms: row.terms,
            dateAdded: row.date_added
        });

        const brands = [...newData.brands];
        let found = false;

        // OPTIMIZATION: If we have category_id, go straight there
        const targetCatId = newRow?.category_id || oldRow?.category_id;

        for (let bIdx = 0; bIdx < brands.length; bIdx++) {
            const brand = brands[bIdx];
            const catIndex = brand.categories.findIndex(c => c.id === targetCatId);
            
            if (catIndex >= 0) {
                const newBrand = { ...brand };
                const newCats = [...newBrand.categories];
                const newCat = { ...newCats[catIndex] };
                const prods = [...newCat.products];

                if (eventType === 'DELETE') {
                    newCat.products = prods.filter(p => p.id !== oldRow.id);
                } else {
                    const pIdx = prods.findIndex(p => p.id === newRow.id);
                    if (pIdx >= 0) prods[pIdx] = mapProduct(newRow);
                    else prods.push(mapProduct(newRow));
                    newCat.products = prods;
                }

                newCats[catIndex] = newCat;
                newBrand.categories = newCats;
                brands[bIdx] = newBrand;
                found = true;
                break;
            }
        }
        if (found) newData.brands = brands;
    }

    // 5. PRICELISTS
    else if (table === 'pricelists') {
        const lists = [...(newData.pricelists || [])];
        if (eventType === 'DELETE') {
            newData.pricelists = lists.filter(p => p.id !== oldRow.id);
        } else {
            const index = lists.findIndex(p => p.id === newRow.id);
            const mappedList: Pricelist = {
                id: newRow.id,
                brandId: newRow.brand_id,
                title: newRow.title,
                month: newRow.month,
                year: newRow.year,
                url: newRow.url,
                thumbnailUrl: newRow.thumbnail_url,
                type: newRow.type,
                kind: newRow.kind,
                startDate: newRow.start_date,
                endDate: newRow.end_date,
                promoText: newRow.promo_text,
                items: newRow.items,
                headers: newRow.headers,
                dateAdded: newRow.date_added
            };
            if (index >= 0) lists[index] = mappedList;
            else lists.push(mappedList);
            newData.pricelists = lists;
        }
    }

    // Update local cache asynchronously to persist the delta
    dbPut(STORAGE_KEY_DATA, newData).catch(console.warn);
    
    return newData;
};

export const subscribeToDeltas = (callback: (payload: any) => void) => {
    if (!supabase) initSupabase();
    if (!supabase) return null;

    const channel = supabase.channel('delta_sync_v1')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kiosks' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pricelists' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pricelist_brands' }, callback)
        .subscribe();

    return channel;
};

// --- CRUD OPS (Push Deltas) ---

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
        console.error("Delta Sync Error", e);
    }
};

export const upsertCategory = async (category: Category, brandId: string) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('categories').upsert(flattenCategory(category, brandId));
        if (error) throw error;
    } catch (e) {
        console.error("Delta Sync Error", e);
    }
};

export const upsertProduct = async (product: Product, categoryId: string) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('products').upsert(flattenProduct(product, categoryId));
        if (error) throw error;
    } catch (e) {
        console.error("Delta Sync Error", e);
    }
};

export const upsertPricelist = async (pricelist: Pricelist) => {
    if (!supabase) initSupabase();
    try {
        const { error } = await supabase.from('pricelists').upsert(flattenPricelist(pricelist));
        if (error) throw error;
    } catch (e) { console.error("Delta Error", e); }
};

export const upsertPricelistBrand = async (pb: PricelistBrand) => {
    if (!supabase) initSupabase();
    const data = { id: pb.id, name: pb.name, logo_url: pb.logoUrl, updated_at: new Date().toISOString() };
    try {
        const { error } = await supabase.from('pricelist_brands').upsert(data);
        if (error) throw error;
    } catch (e) { console.error("Delta Error", e); }
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
    } catch (e) { console.error("Delete Error", e); }
};

// --- INITIAL LOAD ---

export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  const isOnline = await checkCloudConnection();

  if (isOnline && supabase) {
      try {
          const { data: configRow } = await supabase.from('store_config').select('data').eq('id', 1).single();
          let baseData = migrateData(configRow?.data || {});
          await yieldToMain();

          // Construct Relational Tree
          try {
              const [brandsRes, catsRes, prodsRes, plBrandsRes, plRes, fleetRes] = await Promise.all([
                  supabase.from('brands').select('*'),
                  supabase.from('categories').select('*'),
                  supabase.from('products').select('*'),
                  supabase.from('pricelist_brands').select('*'),
                  supabase.from('pricelists').select('*'),
                  supabase.from('kiosks').select('*')
              ]);

              if (fleetRes.data) {
                  baseData.fleet = fleetRes.data.map((k: any) => ({
                      id: k.id, name: k.name, deviceType: k.device_type, status: k.status,
                      last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address,
                      version: k.version, locationDescription: k.location_description,
                      assignedZone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested,
                      showPricelists: k.show_pricelists
                  }));
              }

              if (brandsRes.data && catsRes.data && prodsRes.data) {
                  const relationalBrands: Brand[] = [];
                  for (let i = 0; i < brandsRes.data.length; i++) {
                      const b = brandsRes.data[i];
                      const brandCats = catsRes.data.filter((c: any) => c.brand_id === b.id);
                      const categories: Category[] = [];
                      for (const c of brandCats) {
                          const catProds = prodsRes.data.filter((p: any) => p.category_id === c.id);
                          categories.push({
                              id: c.id, name: c.name, icon: c.icon, imageUrl: c.image_url,
                              products: catProds.map((p: any) => ({
                                  id: p.id, name: p.name, sku: p.sku, description: p.description,
                                  imageUrl: p.image_url, galleryUrls: p.gallery_urls, videoUrls: p.video_urls,
                                  specs: p.specs, features: p.features, dimensions: p.dimensions,
                                  boxContents: p.box_contents, manuals: p.manuals, terms: p.terms,
                                  dateAdded: p.date_added
                              }))
                          });
                      }
                      relationalBrands.push({
                          id: b.id, name: b.name, logoUrl: b.logo_url, themeColor: b.theme_color, categories
                      });
                  }
                  baseData.brands = relationalBrands;

                  if (plBrandsRes.data && plRes.data) {
                      baseData.pricelistBrands = plBrandsRes.data.map((pb: any) => ({
                          id: pb.id, name: pb.name, logoUrl: pb.logo_url
                      }));
                      baseData.pricelists = plRes.data.map((pl: any) => ({
                          id: pl.id, brandId: pl.brand_id, title: pl.title, month: pl.month, year: pl.year,
                          url: pl.url, thumbnailUrl: pl.thumbnail_url, type: pl.type, kind: pl.kind,
                          startDate: pl.start_date, endDate: pl.end_date, promoText: pl.promo_text,
                          items: pl.items, headers: pl.headers, dateAdded: pl.date_added
                      }));
                  }
              }
          } catch (e) {
              console.warn("Relational construction failed, using snapshot.", e);
          }

          try { await dbPut(STORAGE_KEY_DATA, baseData); } catch (e) {}
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
    // This function now only handles global settings (store_config) 
    // or batch saves. Granular updates should use upsertX functions.
    await dbPut(STORAGE_KEY_DATA, data);
    
    if (!supabase) initSupabase();
    if (supabase) {
        broadcastSync(50, 'syncing');
        try {
            // Save JSON config (Settings, Hero, Ads, etc)
            // We strip out the inventory arrays to keep the JSON blob light
            const settingsPayload = { ...data };
            settingsPayload.brands = []; // Inventory handled by tables
            settingsPayload.pricelists = [];
            settingsPayload.fleet = []; 
            
            await supabase.from('store_config').upsert({ id: 1, data: settingsPayload }, { onConflict: 'id' });
            
            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 2500);
        } catch (e) {
            broadcastSync(0, 'error');
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
