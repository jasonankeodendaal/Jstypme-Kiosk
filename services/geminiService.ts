
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, Category, Pricelist, ArchivedItem } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';

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
    permissions: { inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true }
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
  hero: { title: "Future Retail Experience", subtitle: "Discover the latest in Tech, Fashion, and Lifestyle.", backgroundImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", logoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png", websiteUrl: "https://jstyp.me" },
  screensaverSettings: { idleTimeout: 60, imageDuration: 8, muteVideos: false, showProductImages: true, showProductVideos: true, showPamphlets: true, showCustomAds: true },
  catalogues: [],
  pricelists: [],
  pricelistBrands: [],
  brands: MOCK_BRANDS,
  tv: { brands: [] },
  ads: { homeBottomLeft: [], homeBottomRight: [], screensaver: [] },
  fleet: [],
  about: { title: "About Our Vision", text: "Welcome to the Kiosk Pro Showcase.", audioUrl: "" },
  admins: [DEFAULT_ADMIN],
  appConfig: { kioskIconUrl: "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png", adminIconUrl: "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png" },
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

/**
 * RECONSTRUCTION ENGINE:
 * Fetches data from multiple tables and stitches them into the unified StoreData object.
 * Updated to handle individual table 404s gracefully.
 */
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  
  let cloudData: any = {};
  let brandData: any[] = [];
  let catData: any[] = [];
  let prodData: any[] = [];
  let catalogueData: any[] = [];
  let pricelistData: any[] = [];
  let fleetData: any[] = [];
  let logData: any[] = [];

  if (supabase) {
      try {
          // Perform fetches individually to avoid Promise.all failure on 404s
          const fetchWithCatch = async (query: any) => {
              try {
                  const { data, error } = await query;
                  if (error) return null;
                  return data;
              } catch (e) { return null; }
          };

          const [config, brands, cats, prods, catalogues, pricelists, fleet, logs] = await Promise.all([
              fetchWithCatch(supabase.from('store_config').select('data').eq('id', 1).maybeSingle()),
              fetchWithCatch(supabase.from('brands').select('*')),
              fetchWithCatch(supabase.from('categories').select('*')),
              fetchWithCatch(supabase.from('products').select('*')),
              fetchWithCatch(supabase.from('catalogues').select('*')),
              fetchWithCatch(supabase.from('pricelists').select('*')),
              fetchWithCatch(supabase.from('kiosks').select('*')),
              fetchWithCatch(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100))
          ]);

          if (config) cloudData = config.data || {};
          if (brands) brandData = brands;
          if (cats) catData = cats;
          if (prods) prodData = prods;
          if (catalogues) catalogueData = catalogues;
          if (pricelists) pricelistData = pricelists;
          if (fleet) fleetData = fleet;
          if (logs) logData = logs;

          let processedData = migrateData(cloudData);
          
          // Reconstruct Brands -> Categories -> Products
          if (brandData.length > 0) {
              processedData.brands = brandData.map((b: any) => {
                  const brand = b.data as Brand;
                  brand.id = b.id;
                  brand.categories = (catData || [])
                      .filter((c: any) => c.brand_id === b.id)
                      .map((c: any) => {
                          const cat = c.data as Category;
                          cat.id = c.id;
                          cat.products = (prodData || [])
                              .filter((p: any) => p.category_id === c.id)
                              .map((p: any) => ({ ...(p.data as Product), id: p.id }));
                          return cat;
                      });
                  return brand;
              });
          }

          if (catalogueData.length > 0) processedData.catalogues = catalogueData.map((x: any) => ({ ...x.data, id: x.id }));
          if (pricelistData.length > 0) processedData.pricelists = pricelistData.map((x: any) => ({ ...x.data, id: x.id }));
          if (logData.length > 0) processedData.archive = { ...processedData.archive, deletedItems: logData.map((x: any) => ({ ...x.data, id: x.id })), brands: [], products: [], catalogues: [], deletedAt: {} };
          
          if (fleetData.length > 0) {
              processedData.fleet = fleetData.map((k: any) => ({
                  id: k.id, name: k.name, deviceType: k.device_type, status: k.status,
                  last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address,
                  version: k.version, locationDescription: k.location_description,
                  assigned_zone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested
              }));
          }

          try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData)); } catch (e) {}
          return processedData;
      } catch (e) { console.warn("Relational fetch encountered an unexpected error.", e); }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}
  return migrateData(DEFAULT_DATA);
};

/**
 * INCREMENTAL PATCHING ENGINE:
 * Determines what exactly changed and sends ONLY that part to the cloud.
 */
export const saveStoreData = async (data: StoreData, partial?: { type: string, action: 'upsert' | 'delete', item: any }): Promise<void> => {
    // 1. Always sync local cache first
    try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data)); } catch (e) {}

    if (!supabase) initSupabase();
    if (!supabase) return;

    broadcastSync(5, 'syncing');

    (async () => {
        try {
            if (partial) {
                const { type, action, item } = partial;
                let response;

                switch (type) {
                    case 'product':
                        if (action === 'upsert') response = await supabase.from('products').upsert({ id: item.id, category_id: item.categoryId, data: item }, { onConflict: 'id' });
                        else response = await supabase.from('products').delete().eq('id', item.id);
                        break;
                    case 'category':
                        if (action === 'upsert') response = await supabase.from('categories').upsert({ id: item.id, brand_id: item.brandId, data: item }, { onConflict: 'id' });
                        else response = await supabase.from('categories').delete().eq('id', item.id);
                        break;
                    case 'brand':
                        if (action === 'upsert') response = await supabase.from('brands').upsert({ id: item.id, data: { name: item.name, logoUrl: item.logoUrl, themeColor: item.themeColor } }, { onConflict: 'id' });
                        else response = await supabase.from('brands').delete().eq('id', item.id);
                        break;
                    case 'catalogue':
                        if (action === 'upsert') response = await supabase.from('catalogues').upsert({ id: item.id, data: item }, { onConflict: 'id' });
                        else response = await supabase.from('catalogues').delete().eq('id', item.id);
                        break;
                    case 'pricelist':
                        if (action === 'upsert') response = await supabase.from('pricelists').upsert({ id: item.id, data: item }, { onConflict: 'id' });
                        else response = await supabase.from('pricelists').delete().eq('id', item.id);
                        break;
                    case 'audit':
                        response = await supabase.from('audit_logs').insert({ id: item.id, data: item });
                        break;
                }

                if (response?.error) throw response.error;
            } else {
                // Global Config Save (Hero, Ads, Settings, etc.)
                const { brands, catalogues, pricelists, fleet, archive, ...configOnly } = data;
                const { error } = await supabase.from('store_config').upsert({ id: 1, data: configOnly }, { onConflict: 'id' });
                if (error) throw error;
            }

            broadcastSync(100, 'complete');
            setTimeout(() => broadcastSync(0, 'idle'), 1500);
        } catch (e) {
            console.error("Incremental Sync Error:", e);
            broadcastSync(0, 'error');
        }
    })();
};

export const resetStoreData = async (): Promise<StoreData> => {
    // Factory reset logic needs careful handling with relational tables
    if (supabase) {
        await Promise.all([
            supabase.from('products').delete().neq('id', '0'),
            supabase.from('categories').delete().neq('id', '0'),
            supabase.from('brands').delete().neq('id', '0'),
            supabase.from('catalogues').delete().neq('id', '0'),
            supabase.from('pricelists').delete().neq('id', '0'),
            supabase.from('audit_logs').delete().neq('id', '0'),
            supabase.from('store_config').upsert({ id: 1, data: DEFAULT_DATA })
        ]);
    }
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};
