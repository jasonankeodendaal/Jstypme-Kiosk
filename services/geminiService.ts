
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
// Define missing constant for device ID storage key to resolve error on line 230
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
  pricelists: [],
  pricelistBrands: [],
  brands: [],
  tv: {
    brands: []
  },
  ads: {
    homeBottomLeft: [],
    homeBottomRight: [],
    homeSideVertical: [],
    screensaver: []
  },
  fleet: [],
  about: {
      title: "About Our Vision",
      text: "Welcome to the Kiosk Pro Showcase.",
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
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
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
             if (admin.name.toLowerCase() === 'admin' && admin.pin === '1723') {
                 admin.isSuperAdmin = true;
                 admin.permissions = {
                    inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true
                 };
             }
        });
    }

    if (!data.appConfig) {
        data.appConfig = { ...DEFAULT_DATA.appConfig };
    } else {
        if (data.appConfig.kioskIconUrl === "/icon-kiosk.svg") data.appConfig.kioskIconUrl = DEFAULT_DATA.appConfig!.kioskIconUrl;
        if (data.appConfig.adminIconUrl === "/icon-admin.svg" || data.appConfig.adminIconUrl === "https://i.ibb.co/RG6qW4Nw/maskable-icon.png") data.appConfig.adminIconUrl = DEFAULT_DATA.appConfig!.adminIconUrl;
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
                    if ((p.manualUrl || (p.manualImages && p.manualImages.length > 0)) && p.manuals.length === 0) {
                        p.manuals.push({
                            id: `legacy-manual-${p.id}`,
                            title: 'User Manual',
                            images: p.manualImages || [],
                            pdfUrl: p.manualUrl
                        });
                    }
                    if (!p.dateAdded) p.dateAdded = new Date().toISOString();
                });
            });
        });
    }

    if (data.tv && data.tv.brands) {
        data.tv.brands.forEach((tvb: any) => {
            if (!tvb.models) tvb.models = [];
            if (tvb.videoUrls && Array.isArray(tvb.videoUrls) && tvb.videoUrls.length > 0) {
                if (tvb.models.length === 0) {
                    tvb.models.push({
                        id: `migrated-model-${tvb.id}`,
                        name: "General Showcase",
                        imageUrl: tvb.logoUrl,
                        videoUrls: [...tvb.videoUrls]
                    });
                }
                tvb.videoUrls = undefined;
            }
        });
    }
    
    if (data.catalogues) {
        data.catalogues.forEach((c: any) => {
             if(!c.type) c.type = c.brandId ? 'catalogue' : 'pamphlet';
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

/**
 * 1. Fetch Data
 * NEVER USE LOCAL STORAGE IF SUPABASE IS CONNECTED.
 */
export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();

  if (supabase) {
      try {
          // Parallel Fetch: Config JSON + Kiosks Table
          const [configResponse, fleetResponse] = await Promise.all([
              supabase.from('store_config').select('data').eq('id', 1).single(),
              supabase.from('kiosks').select('*')
          ]);
          
          if (configResponse.data) {
              console.log("Sync: Prioritizing Cloud Data");
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

              // Still update local storage for "Emergency Offline" boot
              try {
                  localStorage.setItem(STORAGE_KEY_ID + '_cloud_state', 'online');
                  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData));
              } catch (e) {}
              
              return processedData;
          }
      } catch (e) {
          console.warn("Cloud fetch unavailable, falling back to local cache.", e);
      }
  }

  // Fallback to Local Storage ONLY IF OFFLINE or CLOUD FAILED
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}

  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    } catch (e) {}

    if (!supabase) initSupabase();

    if (supabase) {
        try {
            const { fleet, ...dataToSave } = data;
            const { error } = await supabase
                .from('store_config')
                .upsert({ id: 1, data: dataToSave });
            
            if (error) throw error;
        } catch (e) {
            console.error("Cloud sync failed. Changes saved LOCALLY only.");
            throw new Error("Connection failed.");
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};
