
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';

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
  about: { title: "About Our Vision", text: "Welcome to Kiosk Pro.", audioUrl: "" },
  admins: [DEFAULT_ADMIN],
  appConfig: { kioskIconUrl: "", adminIconUrl: "" },
  systemSettings: { setupPin: "0000" }
};

const migrateData = (data: any): StoreData => {
    if (!data.brands) data.brands = [...DEFAULT_DATA.brands];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.admins || data.admins.length === 0) data.admins = [DEFAULT_ADMIN];
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
    if (!data.pricelists) data.pricelists = [];
    if (!data.pricelistBrands) data.pricelistBrands = [];
    return data as StoreData;
};

/**
 * GENERATE DATA: Tries Cloud first, falls back to local cache if no connection.
 */
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();

  if (supabase) {
      try {
          const [configResponse, fleetResponse] = await Promise.all([
              supabase.from('store_config').select('data').eq('id', 1).single(),
              supabase.from('kiosks').select('*')
          ]);
          
          if (configResponse.data) {
              let processedData = migrateData(configResponse.data.data || {});
              
              if (fleetResponse.data) {
                  processedData.fleet = fleetResponse.data.map((k: any) => ({
                      id: k.id,
                      name: k.name,
                      deviceType: k.device_type,
                      status: k.status,
                      last_seen: k.last_seen,
                      wifiStrength: k.wifi_strength,
                      ipAddress: k.ip_address,
                      version: k.version,
                      locationDescription: k.location_description,
                      assignedZone: k.assigned_zone,
                      notes: k.notes,
                      restartRequested: k.restart_requested
                  }));
              }
                  
              // Keep local cache updated for offline emergency boot
              localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData));
              return processedData;
          }
      } catch (e) {
          console.warn("Cloud connection lost, using local cache.");
      }
  }

  const stored = localStorage.getItem(STORAGE_KEY_DATA);
  if (stored) return migrateData(JSON.parse(stored));
  return migrateData(DEFAULT_DATA);
};

/**
 * SAVE DATA: Strictly awaits Cloud confirmation. Returns boolean success.
 */
export const saveStoreData = async (data: StoreData): Promise<boolean> => {
    if (!supabase) initSupabase();
    
    // Fleet is managed in its own table via heartbeats
    const { fleet, ...dataToSave } = data;

    // 1. Primary Save: Cloud
    if (supabase) {
        try {
            const { error } = await supabase
                .from('store_config')
                .upsert({ id: 1, data: dataToSave }, { onConflict: 'id' });
            
            if (error) {
                console.error("Cloud Save Failed:", error.message);
                return false;
            }
        } catch (e) {
            console.error("Network Error during save:", e);
            return false;
        }
    } else {
        console.warn("Saving in Local-Only mode. Data not backed up to Cloud.");
    }

    // 2. Secondary Cache: Local
    try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    } catch (e) {
        console.warn("Local storage full, but Cloud save succeeded.");
    }

    return true;
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};
