
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, Category, Pricelist, PricelistBrand } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';

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
          const { data: fleetRows } = await supabase.from('kiosks').select('*');
          if (fleetRows) {
              baseData.fleet = fleetRows.map((k: any) => ({
                  id: k.id, name: k.name, deviceType: k.device_type, status: k.status,
                  last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address,
                  version: k.version, locationDescription: k.location_description,
                  assignedZone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested
              }));
          }

          // 3. ATTEMPT RELATIONAL FETCH
          // If these tables don't exist yet (user hasn't run migration), this will throw error and we fallback to baseData (monolith)
          try {
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

                  // If we found brands in the new tables, use them. 
                  // Otherwise, if new tables are empty but config has data, stick to config (monolith fallback).
                  if (relationalBrands.length > 0) {
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
              console.warn("Relational tables not found or empty. Using legacy monolith data.", relationalError);
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
 * Flattens the StoreData tree and upserts into normalized tables.
 * Falls back to saving Config-only items to store_config.
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
            // --- PREPARE DATA ---
            
            // A. Settings (Monolith)
            // We strip out the heavy inventory to keep store_config light
            const { fleet, brands, pricelists, pricelistBrands, ...settingsData } = cleanData;
            
            // Keep archive in settings but prune it heavily
            const archivePruned = {
                ...(settingsData.archive || {}),
                deletedItems: (settingsData.archive?.deletedItems || []).slice(0, 30),
                brands: [], products: [], catalogues: [] 
            };
            
            const settingsPayload = { ...settingsData, archive: archivePruned };

            // B. Relational Data (Flattened)
            
            // 1. Flatten Brands
            const flatBrands = cleanData.brands.map((b: Brand) => ({
                id: b.id,
                name: b.name,
                logo_url: b.logoUrl,
                theme_color: b.themeColor,
                updated_at: new Date().toISOString()
            }));

            // 2. Flatten Categories
            const flatCategories = cleanData.brands.flatMap((b: Brand) => 
                b.categories.map((c: Category) => ({
                    id: c.id,
                    brand_id: b.id,
                    name: c.name,
                    icon: c.icon,
                    updated_at: new Date().toISOString()
                }))
            );

            // 3. Flatten Products
            const flatProducts = cleanData.brands.flatMap((b: Brand) => 
                b.categories.flatMap((c: Category) => 
                    c.products.map((p: Product) => ({
                        id: p.id,
                        category_id: c.id,
                        name: p.name,
                        sku: p.sku,
                        description: p.description,
                        image_url: p.imageUrl,
                        gallery_urls: p.galleryUrls || [],
                        video_urls: p.videoUrls || [],
                        specs: p.specs || {},
                        features: p.features || [],
                        box_contents: p.boxContents || [],
                        manuals: p.manuals || [],
                        terms: p.terms,
                        dimensions: p.dimensions || [],
                        date_added: p.dateAdded,
                        updated_at: new Date().toISOString()
                    }))
                )
            );

            // 4. Flatten Pricelists
            const flatPLBrands = (cleanData.pricelistBrands || []).map((pb: PricelistBrand) => ({
                id: pb.id,
                name: pb.name,
                logo_url: pb.logoUrl,
                updated_at: new Date().toISOString()
            }));

            const flatPricelists = (cleanData.pricelists || []).map((pl: Pricelist) => ({
                id: pl.id,
                brand_id: pl.brandId,
                title: pl.title,
                month: pl.month,
                year: pl.year,
                url: pl.url,
                thumbnail_url: pl.thumbnailUrl,
                type: pl.type,
                kind: pl.kind,
                start_date: pl.startDate,
                end_date: pl.endDate,
                promo_text: pl.promoText,
                items: pl.items || [],
                headers: pl.headers || {},
                date_added: pl.dateAdded,
                updated_at: new Date().toISOString()
            }));

            // --- EXECUTE BATCH UPSERTS (PARALLEL) ---
            
            // Phase 1: Independent Roots (Settings, Brands, PL Brands)
            const phase1Promises = [];
            phase1Promises.push(supabase.from('store_config').upsert({ id: 1, data: settingsPayload }, { onConflict: 'id' }));
            if (flatBrands.length > 0) phase1Promises.push(supabase.from('brands').upsert(flatBrands));
            if (flatPLBrands.length > 0) phase1Promises.push(supabase.from('pricelist_brands').upsert(flatPLBrands));
            
            await Promise.all(phase1Promises);
            broadcastSync(40, 'syncing');

            // Phase 2: Dependencies Level 1 (Categories)
            // Categories depend on Brands existing, so we wait for Phase 1
            if (flatCategories.length > 0) {
                await supabase.from('categories').upsert(flatCategories);
            }
            broadcastSync(60, 'syncing');
            
            // Phase 3: Leaves (Products & Pricelists) - Parallel Chunks
            const phase3Promises = [];
            const chunkArray = (arr: any[], size: number) => {
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
                return chunks;
            };

            // Increased chunk size for speed (100 products per request)
            const productChunks = chunkArray(flatProducts, 100);
            productChunks.forEach(chunk => {
                phase3Promises.push(supabase.from('products').upsert(chunk));
            });

            // Increased chunk size for pricelists (50 per request)
            const plChunks = chunkArray(flatPricelists, 50);
            plChunks.forEach(chunk => {
                phase3Promises.push(supabase.from('pricelists').upsert(chunk));
            });

            await Promise.all(phase3Promises);

            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 2500);

        } catch (e: any) {
            console.error("Relational Sync Error:", e);
            // If relational tables don't exist yet, this will fail. 
            broadcastSync(0, 'error');
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};
