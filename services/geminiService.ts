
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, Category, Pricelist, PricelistBrand } from "../types";
import { supabase, getEnv, initSupabase, checkCloudConnection } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
const STORAGE_KEY_OFFLINE_QUEUE = 'kiosk_pro_offline_queue';

// Progress broadcasting utility
const broadcastSync = (progress: number, status: 'idle' | 'syncing' | 'complete' | 'error') => {
    window.dispatchEvent(new CustomEvent('kiosk-sync-event', { 
        detail: { progress, status } 
    }));
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
            description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.',
            specs: { 'Chip': 'A17 Pro', 'Display': '6.7-inch Super Retina XDR', 'Camera': '48MP Main | Ultra Wide | Telephoto' },
            features: ['Titanium design', 'Action button', 'USB-C with USB 3 speeds', 'All-day battery life'],
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

// Storage Safety: Remove large Base64 strings to prevent Quota Exceeded Errors
const sanitizeData = (data: any): any => {
    if (typeof data === 'string') {
        if (data.startsWith('data:') && data.length > 2048) { 
             console.warn("Storage Guard: Large Base64 string sanitized to prevent quota crash.");
             return ''; 
        }
        if (data.length > 500000) {
            return data.substring(0, 500000) + '...[TRUNCATED]';
        }
        return data;
    }
    if (Array.isArray(data)) return data.map(item => sanitizeData(item));
    if (data !== null && typeof data === 'object') {
        const newData: any = {};
        Object.keys(data).forEach(key => { newData[key] = sanitizeData(data[key]); });
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
        // Optimize: Remove previous pending actions for the same ID to prevent redundant writes
        this.queue = this.queue.filter(a => !(a.type === action.type && a.id === action.id));
        this.queue.push(action);
        this.save();
    }

    async process() {
        if (this.queue.length === 0) return;
        if (!supabase) initSupabase();
        if (!supabase) return;

        // Check connection specifically before processing queue
        const online = await checkCloudConnection();
        if (!online) return;

        console.log(`Processing ${this.queue.length} offline actions...`);
        broadcastSync(10, 'syncing');

        const remaining: SyncAction[] = [];
        let successCount = 0;

        for (const action of this.queue) {
            try {
                if (action.subtype === 'delete') {
                    const tableMap: any = {
                        'BRAND': 'brands', 'CATEGORY': 'categories', 'PRODUCT': 'products',
                        'PRICELIST': 'pricelists', 'PRICELIST_BRAND': 'pricelist_brands'
                    };
                    const table = tableMap[action.type];
                    if (table) {
                        await supabase.from(table).delete().eq('id', action.id);
                    }
                } else {
                    // Upsert logic
                    if (action.type === 'BRAND') await supabase.from('brands').upsert(action.data);
                    else if (action.type === 'CATEGORY') await supabase.from('categories').upsert(action.data);
                    else if (action.type === 'PRODUCT') await supabase.from('products').upsert(action.data);
                    else if (action.type === 'PRICELIST') await supabase.from('pricelists').upsert(action.data);
                    else if (action.type === 'PRICELIST_BRAND') await supabase.from('pricelist_brands').upsert(action.data);
                }
                successCount++;
            } catch (e) {
                console.error("Sync action failed", action, e);
                remaining.push(action); // Keep in queue
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

// Helpers to flatten data for SQL
const flattenBrand = (b: Brand) => ({
    id: b.id, name: b.name, logo_url: b.logoUrl, theme_color: b.themeColor, updated_at: new Date().toISOString()
});
const flattenCategory = (c: Category, brandId: string) => ({
    id: c.id, brand_id: brandId, name: c.name, icon: c.icon, updated_at: new Date().toISOString()
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

/**
 * Updates a single brand in the cloud or queues it.
 * NOTE: This assumes you handle local state update in UI separately or via reload.
 */
export const upsertBrand = async (brand: Brand) => {
    if (!supabase) initSupabase();
    try {
        await supabase.from('brands').upsert(flattenBrand(brand));
    } catch (e) {
        offlineQueue.add({ type: 'BRAND', data: flattenBrand(brand), id: brand.id, timestamp: Date.now() });
    }
};

export const upsertCategory = async (category: Category, brandId: string) => {
    if (!supabase) initSupabase();
    try {
        await supabase.from('categories').upsert(flattenCategory(category, brandId));
    } catch (e) {
        offlineQueue.add({ type: 'CATEGORY', data: flattenCategory(category, brandId), id: category.id, timestamp: Date.now() });
    }
};

export const upsertProduct = async (product: Product, categoryId: string) => {
    if (!supabase) initSupabase();
    try {
        await supabase.from('products').upsert(flattenProduct(product, categoryId));
    } catch (e) {
        offlineQueue.add({ type: 'PRODUCT', data: flattenProduct(product, categoryId), id: product.id, timestamp: Date.now() });
    }
};

export const upsertPricelist = async (pricelist: Pricelist) => {
    if (!supabase) initSupabase();
    try {
        await supabase.from('pricelists').upsert(flattenPricelist(pricelist));
    } catch (e) {
        offlineQueue.add({ type: 'PRICELIST', data: flattenPricelist(pricelist), id: pricelist.id, timestamp: Date.now() });
    }
};

export const upsertPricelistBrand = async (pb: PricelistBrand) => {
    if (!supabase) initSupabase();
    const data = { id: pb.id, name: pb.name, logo_url: pb.logoUrl, updated_at: new Date().toISOString() };
    try {
        await supabase.from('pricelist_brands').upsert(data);
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
        if (tableMap[type]) await supabase.from(tableMap[type]).delete().eq('id', id);
    } catch (e) {
        offlineQueue.add({ type, subtype: 'delete', data: null, id, timestamp: Date.now() });
    }
};

// Process offline queue on init
setTimeout(() => offlineQueue.process(), 5000);
setInterval(() => offlineQueue.process(), 60000);

/**
 * RELATIONAL FETCH STRATEGY
 * Fetches flattened tables (brands, categories, products) and reconstructs the StoreData tree.
 */
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  if (supabase) {
      try {
          // 1. Fetch Core Config (Settings)
          const { data: configRow } = await supabase.from('store_config').select('data').eq('id', 1).single();
          let baseData = migrateData(configRow?.data || {});

          // 2. Fetch Fleet
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

          // 3. ATTEMPT RELATIONAL FETCH
          try {
              // We do a probe first to avoid Promise.all failure if tables don't exist
              const probe = await supabase.from('brands').select('id').limit(1);
              if (probe.error) throw new Error("Relational tables not ready");

              const [brandsRes, catsRes, prodsRes, plBrandsRes, plRes] = await Promise.all([
                  supabase.from('brands').select('*'),
                  supabase.from('categories').select('*'),
                  supabase.from('products').select('*'),
                  supabase.from('pricelist_brands').select('*'),
                  supabase.from('pricelists').select('*')
              ]);

              // Check if we actually got relational data (if tables exist)
              if (brandsRes.data && catsRes.data && prodsRes.data) {
                  // Reconstruct Tree: Brand -> Categories -> Products
                  const relationalBrands: Brand[] = brandsRes.data.map((b: any) => ({
                      id: b.id,
                      name: b.name,
                      logoUrl: b.logo_url,
                      themeColor: b.theme_color,
                      categories: catsRes.data
                          .filter((c: any) => c.brand_id === b.id)
                          .map((c: any) => ({
                              id: c.id,
                              name: c.name,
                              icon: c.icon,
                              products: prodsRes.data
                                  .filter((p: any) => p.category_id === c.id)
                                  .map((p: any) => ({
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
                          }))
                  }));

                  // IMPORTANT: Only override if we actually found brands. 
                  if (brandsRes.data) {
                      baseData.brands = relationalBrands;
                  }

                  // Reconstruct Pricelists
                  if (plBrandsRes.data && plRes.data) {
                      baseData.pricelistBrands = plBrandsRes.data.map((pb: any) => ({
                          id: pb.id, name: pb.name, logoUrl: pb.logo_url
                      }));
                      baseData.pricelists = plRes.data.map((pl: any) => ({
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
                  }
              }
          } catch (relationalError) {
              console.warn("Relational tables not found or empty. Using legacy monolith data from store_config.", relationalError);
          }

          // Cache & Return
          try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(baseData)); } catch (e) {}
          return baseData;

      } catch (e) { 
          console.warn("Cloud fetch failed, using local cache.", e); 
      }
  }
  
  // Fallback to local cache
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}
  return migrateData(DEFAULT_DATA);
};

/**
 * RELATIONAL SAVE STRATEGY (Batch Upsert)
 * Now smarter: It can optionally skip heavy inventory syncs if granular updates are used.
 * But we keep it robust for "Save Settings" or bulk migrations.
 */
export const saveStoreData = async (data: StoreData): Promise<void> => {
    // 1. Sanitize & Local Save
    const cleanData = sanitizeData(data);
    try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(cleanData));
    } catch (e) {
        console.error("Local Storage Quota Exceeded");
    }

    if (!supabase) initSupabase();
    if (supabase) {
        broadcastSync(10, 'syncing');
        
        try {
            // --- CHECK FOR RELATIONAL TABLE EXISTENCE ---
            let relationalTablesExist = false;
            try {
                const check = await supabase.from('brands').select('id').limit(1);
                if (!check.error) {
                    relationalTablesExist = true;
                }
            } catch(e) {
                relationalTablesExist = false;
            }

            // --- A. SAVE GLOBAL SETTINGS ---
            let settingsPayload = { ...cleanData };
            
            // Only strip heavy data if we are SURE we can save it to relational tables
            if (relationalTablesExist) {
                const { fleet, brands, pricelists, pricelistBrands, ...settingsData } = cleanData;
                settingsPayload = settingsData;
            }
            
            // Prune archive for settings payload regardless
            const archivePruned = {
                ...(settingsPayload.archive || {}),
                deletedItems: (settingsPayload.archive?.deletedItems || []).slice(0, 30),
                brands: [], products: [], catalogues: [] 
            };
            settingsPayload.archive = archivePruned;

            await supabase.from('store_config').upsert({ id: 1, data: settingsPayload }, { onConflict: 'id' });
            broadcastSync(30, 'syncing');

            // --- B. RELATIONAL SAVE (Only if tables exist) ---
            if (relationalTablesExist) {
                // We perform a full sync here to ensure consistency, 
                // but arguably we could skip this if we trusted granular updates 100%.
                // For safety in this version, we keep the full sync but chunk it effectively.
                
                // 1. Flatten Brands
                const flatBrands = cleanData.brands.map((b: Brand) => flattenBrand(b));

                // 2. Flatten Categories
                const flatCategories = cleanData.brands.flatMap((b: Brand) => 
                    b.categories.map((c: Category) => flattenCategory(c, b.id))
                );

                // 3. Flatten Products
                const flatProducts = cleanData.brands.flatMap((b: Brand) => 
                    b.categories.flatMap((c: Category) => 
                        c.products.map((p: Product) => flattenProduct(p, c.id))
                    )
                );

                // 4. Flatten Pricelists
                const flatPLBrands = (cleanData.pricelistBrands || []).map((pb: PricelistBrand) => ({
                    id: pb.id, name: pb.name, logo_url: pb.logoUrl, updated_at: new Date().toISOString()
                }));

                const flatPricelists = (cleanData.pricelists || []).map((pl: Pricelist) => flattenPricelist(pl));

                // EXECUTE BATCH UPSERTS
                if (flatBrands.length > 0) await supabase.from('brands').upsert(flatBrands);
                if (flatPLBrands.length > 0) await supabase.from('pricelist_brands').upsert(flatPLBrands);
                broadcastSync(50, 'syncing');

                if (flatCategories.length > 0) await supabase.from('categories').upsert(flatCategories);
                
                const chunkArray = (arr: any[], size: number) => {
                    const chunks = [];
                    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
                    return chunks;
                };

                const productChunks = chunkArray(flatProducts, 50);
                for (const chunk of productChunks) {
                    await supabase.from('products').upsert(chunk);
                }
                broadcastSync(80, 'syncing');

                const plChunks = chunkArray(flatPricelists, 20); 
                for (const chunk of plChunks) {
                    await supabase.from('pricelists').upsert(chunk);
                }
            }

            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 2500);

        } catch (e: any) {
            console.error("Save Sync Error:", e);
            broadcastSync(0, 'error');
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    // If resetting, we try to clear all tables
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
