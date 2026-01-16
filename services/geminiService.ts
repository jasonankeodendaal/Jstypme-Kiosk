
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
  brands: [],
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
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [];
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
 * FETCH FULL PRODUCT DETAILS (On-Demand)
 * Fetches heavy columns (specs, description, videos) only when requested.
 */
export const fetchProductDetails = async (productId: string): Promise<Partial<Product> | null> => {
    if (!supabase) initSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('products')
            .select('description, specs, features, box_contents, video_urls, manuals, terms, dimensions, gallery_urls')
            .eq('id', productId)
            .single();

        if (error || !data) return null;

        return {
            description: data.description,
            specs: data.specs,
            features: data.features,
            boxContents: data.box_contents,
            videoUrls: data.video_urls,
            manuals: data.manuals,
            terms: data.terms,
            dimensions: data.dimensions,
            galleryUrls: data.gallery_urls
        };
    } catch (e) {
        console.error("Detail fetch failed", e);
        return null;
    }
};

/**
 * RELATIONAL FETCH STRATEGY (Cloud First, Local Fallback)
 * Fetches flattened tables and reconstructs the StoreData tree.
 * OPTIMIZED: Only fetches lightweight columns for initial grid rendering.
 */
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  
  // Start with default structure
  let assembledData: StoreData = { ...DEFAULT_DATA };

  if (supabase) {
      try {
          // 1. Fetch Global Config (Hero, Ads, Settings, Admins) from 'store_config'
          const { data: configRow } = await supabase.from('store_config').select('data').eq('id', 1).single();
          if (configRow?.data) {
              assembledData = migrateData(configRow.data);
          }

          // 2. Fetch Fleet Status
          try {
              const { data: fleetRows } = await supabase.from('kiosks').select('*');
              if (fleetRows) {
                  assembledData.fleet = fleetRows.map((k: any) => ({
                      id: k.id, name: k.name, deviceType: k.device_type, status: k.status,
                      last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address,
                      version: k.version, locationDescription: k.location_description,
                      assignedZone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested,
                      showPricelists: k.show_pricelists
                  }));
              }
          } catch(e) {}

          // 3. Fetch Relational Inventory (Cloud Source of Truth)
          // We fetch all relational tables in parallel.
          // OPTIMIZATION: Select specific lightweight columns for products
          const [brandsRes, catsRes, prodsRes, plBrandsRes, plRes] = await Promise.all([
              supabase.from('brands').select('*'),
              supabase.from('categories').select('*'),
              supabase.from('products').select('id, category_id, name, sku, image_url, date_added'), // LIGHTWEIGHT FETCH
              supabase.from('pricelist_brands').select('*'),
              supabase.from('pricelists').select('*')
          ]);

          // Check if we successfully got relational data
          if (!brandsRes.error && brandsRes.data) {
              
              // Reconstruct Brands -> Categories -> Products Tree
              const relationalBrands: Brand[] = brandsRes.data.map((b: any) => ({
                  id: b.id,
                  name: b.name,
                  logoUrl: b.logo_url,
                  themeColor: b.theme_color,
                  categories: (catsRes.data || [])
                      .filter((c: any) => c.brand_id === b.id)
                      .map((c: any) => ({
                          id: c.id,
                          name: c.name,
                          icon: c.icon,
                          products: (prodsRes.data || [])
                              .filter((p: any) => p.category_id === c.id)
                              .map((p: any) => ({
                                  id: p.id,
                                  name: p.name,
                                  sku: p.sku,
                                  imageUrl: p.image_url,
                                  dateAdded: p.date_added,
                                  // Fill heavy fields with empty defaults until detail fetch
                                  description: '', 
                                  galleryUrls: [],
                                  videoUrls: [],
                                  specs: {},
                                  features: [],
                                  dimensions: [],
                                  boxContents: [],
                                  manuals: [],
                                  terms: ''
                              }))
                      }))
              }));

              // If relational brands exist, they override whatever was in store_config
              if (relationalBrands.length > 0 || (brandsRes.data.length === 0 && configRow?.data?.brands?.length === 0)) {
                   assembledData.brands = relationalBrands;
              }
          }

          // Reconstruct Pricelists
          if (!plBrandsRes.error && plBrandsRes.data) {
              assembledData.pricelistBrands = plBrandsRes.data.map((pb: any) => ({
                  id: pb.id, name: pb.name, logoUrl: pb.logo_url
              }));
          }
          if (!plRes.error && plRes.data) {
              assembledData.pricelists = plRes.data.map((pl: any) => ({
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

          // Cache the fresh cloud data to local storage for offline resilience
          try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(assembledData)); } catch (e) {}
          
          return assembledData;

      } catch (e) { 
          console.warn("Cloud fetch failed, using local cache.", e); 
      }
  }
  
  // Fallback: Offline Mode
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}
  
  return assembledData;
};

/**
 * CLOUD-DIRECT WRITE STRATEGY
 * 1. Validates connection.
 * 2. Writes purely to Supabase (Config + Relational Tables).
 * 3. Throws Error on failure (No silent local fallback).
 * 4. Updates local cache ONLY after successful cloud write.
 */
export const saveStoreData = async (data: StoreData): Promise<void> => {
    if (!supabase) initSupabase();
    if (!supabase) throw new Error("Cloud Sync Error: Connection not initialized.");

    const cleanData = sanitizeData(data);
    broadcastSync(10, 'syncing');
        
    try {
        // --- 1. SAVE GLOBAL SETTINGS TO STORE_CONFIG ---
        const settingsPayload = { ...cleanData };
        delete (settingsPayload as any).brands;
        delete (settingsPayload as any).pricelists;
        delete (settingsPayload as any).pricelistBrands;
        delete (settingsPayload as any).fleet;
        
        // Prune archive log to keep config lightweight
        const archivePruned = {
            ...(settingsPayload.archive || {}),
            deletedItems: (settingsPayload.archive?.deletedItems || []).slice(0, 30),
            brands: [], products: [], catalogues: [] 
        };
        settingsPayload.archive = archivePruned;

        const { error: configError } = await supabase.from('store_config').upsert({ id: 1, data: settingsPayload }, { onConflict: 'id' });
        if (configError) throw new Error(`Settings Save Failed: ${configError.message}`);
        
        broadcastSync(30, 'syncing');

        // --- 2. PREPARE RELATIONAL DATA ---
        
        const flatBrands = cleanData.brands.map((b: Brand) => ({
            id: b.id,
            name: b.name,
            logo_url: b.logoUrl,
            theme_color: b.themeColor,
            updated_at: new Date().toISOString()
        }));

        const flatCategories = cleanData.brands.flatMap((b: Brand) => 
            b.categories.map((c: Category) => ({
                id: c.id,
                brand_id: b.id,
                name: c.name,
                icon: c.icon,
                updated_at: new Date().toISOString()
            }))
        );

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

        // --- 3. EXECUTE BATCH UPSERTS ---
        
        if (flatBrands.length > 0) {
            const { error } = await supabase.from('brands').upsert(flatBrands);
            if (error) throw new Error(`Brands Sync Failed: ${error.message}`);
        }
        
        if (flatPLBrands.length > 0) {
            const { error } = await supabase.from('pricelist_brands').upsert(flatPLBrands);
            if (error) throw new Error(`Pricelist Brands Sync Failed: ${error.message}`);
        }
        broadcastSync(50, 'syncing');

        if (flatCategories.length > 0) {
            const { error } = await supabase.from('categories').upsert(flatCategories);
            if (error) throw new Error(`Categories Sync Failed: ${error.message}`);
        }
        
        const chunkArray = (arr: any[], size: number) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
            return chunks;
        };

        const productChunks = chunkArray(flatProducts, 50);
        for (const chunk of productChunks) {
            const { error } = await supabase.from('products').upsert(chunk);
            if (error) throw new Error(`Product Sync Failed: ${error.message}`);
        }
        broadcastSync(80, 'syncing');

        const plChunks = chunkArray(flatPricelists, 10);
        for (const chunk of plChunks) {
            const { error } = await supabase.from('pricelists').upsert(chunk);
            if (error) throw new Error(`Pricelist Sync Failed: ${error.message}`);
        }

        // --- 4. SUCCESS: UPDATE LOCAL CACHE ---
        try {
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(cleanData));
        } catch (e) {
            console.error("Local Storage Quota Exceeded (Cache Only)");
        }

        broadcastSync(100, 'complete');
        setTimeout(() => broadcastSync(0, 'idle'), 2500);

    } catch (e: any) {
        console.error("Save Sync Error:", e);
        broadcastSync(0, 'error');
        throw e;
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
