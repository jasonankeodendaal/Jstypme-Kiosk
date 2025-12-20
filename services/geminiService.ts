import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
const STORAGE_KEY_ID = 'kiosk_pro_device_id';

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
  pricelists: [
    {
      id: 'pl-mock-1',
      brandId: 'plb-mock-1',
      title: 'Flagship Mobile Pricing',
      type: 'manual',
      items: [
        { id: 'item-1', sku: 'SAM-S24U', description: 'Samsung Galaxy S24 Ultra 512GB Titanium Black', normalPrice: 'R 29,999', promoPrice: 'R 27,499' },
        { id: 'item-2', sku: 'SAM-S24P', description: 'Samsung Galaxy S24+ 256GB Marble Gray', normalPrice: 'R 22,499', promoPrice: 'R 20,999' },
        { id: 'item-3', sku: 'SAM-S24', description: 'Samsung Galaxy S24 128GB Cobalt Violet', normalPrice: 'R 17,999' },
        { id: 'item-4', sku: 'APL-I15PM', description: 'Apple iPhone 15 Pro Max 256GB Natural Titanium', normalPrice: 'R 31,500', promoPrice: 'R 29,999' },
        { id: 'item-5', sku: 'APL-I15P', description: 'Apple iPhone 15 Pro 128GB Blue Titanium', normalPrice: 'R 26,500' }
      ],
      url: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?w=300&h=400&fit=crop',
      month: 'May',
      year: '2024',
      dateAdded: new Date().toISOString()
    },
    {
      id: 'pl-mock-2',
      brandId: 'plb-mock-2',
      title: 'Spring Home Collection',
      type: 'manual',
      items: [
        { id: 'item-6', sku: 'DYS-V15', description: 'Dyson V15 Detect Absolute Cordless Vacuum', normalPrice: 'R 15,999', promoPrice: 'R 13,499' },
        { id: 'item-7', sku: 'NES-VRTO', description: 'Nespresso Vertuo Next Coffee Machine Black', normalPrice: 'R 3,499', promoPrice: 'R 2,899' },
        { id: 'item-8', sku: 'LG-65C3', description: 'LG 65" C3 Series OLED 4K Smart TV', normalPrice: 'R 44,999', promoPrice: 'R 38,999' }
      ],
      url: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&h=400&fit=crop',
      month: 'August',
      year: '2024',
      dateAdded: new Date().toISOString()
    }
  ],
  pricelistBrands: [
    { id: 'plb-mock-1', name: 'Mobile Tech', logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop' },
    { id: 'plb-mock-2', name: 'Smart Home', logoUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=100&h=100&fit=crop' }
  ],
  brands: [],
  tv: {
    brands: []
  },
  ads: {
    homeBottomLeft: [],
    homeBottomRight: [],
    homeSideVertical: [],
    homeSideLeftVertical: [],
    screensaver: []
  },
  fleet: [],
  about: {
      title: "About Our Vision",
      text: "Welcome to the Kiosk Pro Showcase. Our mission is to bridge the gap between digital convenience and physical retail experience.",
      audioUrl: ""
  },
  admins: [DEFAULT_ADMIN],
  appConfig: {
      kioskIconUrl: "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png",
      adminIconUrl: "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png"
  },
  systemSettings: {
      setupPin: "0000"
  }
};

const migrateData = (data: any): StoreData => {
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [];
    if (!data.catalogues || !Array.isArray(data.catalogues)) data.catalogues = [];
    if (!data.pricelists || !Array.isArray(data.pricelists)) data.pricelists = [];
    if (!data.pricelistBrands || !Array.isArray(data.pricelistBrands)) data.pricelistBrands = [];
    if (!data.fleet || !Array.isArray(data.fleet)) data.fleet = [];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.ads) {
        data.ads = { ...DEFAULT_DATA.ads };
    } else {
        if (!data.ads.homeSideLeftVertical) data.ads.homeSideLeftVertical = [];
    }
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.about) data.about = { ...DEFAULT_DATA.about };
    
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) {
        data.admins = [DEFAULT_ADMIN];
    } else {
        data.admins.forEach((admin: any) => {
             if (!admin.permissions) admin.permissions = { ...DEFAULT_ADMIN.permissions };
             if (typeof admin.permissions.pricelists === 'undefined' || admin.isSuperAdmin) {
                 admin.permissions.pricelists = true;
             }
        });
    }

    if (!data.appConfig) {
        data.appConfig = { ...DEFAULT_DATA.appConfig };
    }
    
    if (!data.tv) data.tv = { brands: [] };
    if (!data.systemSettings) data.systemSettings = { ...DEFAULT_DATA.systemSettings };

    if (data.brands) {
        data.brands.forEach((b: any) => {
            if (!b.categories) b.categories = [];
            b.categories.forEach((c: any) => {
                if (!c.products) c.products = [];
                c.products.forEach((p: any) => {
                    if (p.dimensions && !Array.isArray(p.dimensions)) {
                        p.dimensions = [{ label: "Dimensions", ...p.dimensions }];
                    }
                    if (!p.manuals) p.manuals = [];
                });
            });
        });
    }

    return data as StoreData;
};

const handleExpiration = async (data: StoreData): Promise<StoreData> => {
    if (!data.catalogues) return data;
    const now = new Date();
    const activeCatalogues: Catalogue[] = [];
    const expiredCatalogues: Catalogue[] = [];

    data.catalogues.forEach(c => {
        if (c.endDate && new Date(c.endDate) < now) expiredCatalogues.push(c);
        else activeCatalogues.push(c);
    });

    if (expiredCatalogues.length > 0) {
        const newArchive: ArchiveData = {
            ...data.archive,
            brands: data.archive?.brands || [],
            products: data.archive?.products || [],
            catalogues: [...(data.archive?.catalogues || []), ...expiredCatalogues],
            deletedItems: data.archive?.deletedItems || [],
            deletedAt: {
                ...(data.archive?.deletedAt || {}),
                ...expiredCatalogues.reduce((acc, curr) => ({ ...acc, [curr.id]: new Date().toISOString() }), {})
            }
        };
        const updatedData = { ...data, catalogues: activeCatalogues, archive: newArchive };
        if (supabase) await supabase.from('store_config').update({ data: updatedData }).eq('id', 1);
        return updatedData;
    }
    return data;
};

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
                  const mappedFleet: KioskRegistry[] = fleetResponse.data.map((k: any) => ({
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
                  processedData.fleet = mappedFleet;
              }
                  
              processedData = await handleExpiration(processedData);

              try {
                  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData));
              } catch (e) {
                  console.error("CRITICAL: LocalStorage is full. Large images/Base64 data might be causing this. Images may disappear on next reload.", e);
              }
              
              return processedData;
          }
      } catch (e) {
          console.warn("Cloud fetch unavailable, falling back to local cache.", e);
      }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}

  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    } catch (e) {
        console.warn("Storage Quota Exceeded. Removing archive data to save space.");
        // Emergency cleanup: Try saving without the archive to stay under 5MB
        const { archive, ...smallerData } = data;
        try {
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(smallerData));
        } catch (innerE) {
             console.error("Local Storage completely full. Kiosk data will not persist offline.");
        }
    }

    if (!supabase) initSupabase();

    if (supabase) {
        try {
            const { fleet, ...dataToSave } = data;
            const { error } = await supabase
                .from('store_config')
                .upsert({ id: 1, data: dataToSave });
            
            if (error) throw error;
        } catch (e) {
            console.error("Cloud sync failed.");
            throw new Error("Connection failed.");
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};