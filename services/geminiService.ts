
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser } from "../types";
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
      text: "Welcome to the Kiosk Pro Showcase.\n\nWe are a premier provider of digital retail solutions...",
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
             if (typeof admin.permissions.pricelists === 'undefined' || admin.isSuperAdmin) admin.permissions.pricelists = true;
             if (admin.name.toLowerCase() === 'admin' && admin.pin === '1723') {
                 admin.isSuperAdmin = true;
                 admin.permissions = {
                    inventory: true, marketing: true, tv: true, screensaver: true, fleet: true, history: true, settings: true, pricelists: true
                 };
             }
        });
    }

    if (data.pricelists) {
        data.pricelists.forEach((pl: any) => {
            if (!pl.type) pl.type = 'pdf';
            if (pl.type === 'manual' && !pl.rows) pl.rows = [];
        });
    }

    if (!data.appConfig) data.appConfig = { ...DEFAULT_DATA.appConfig };
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
                        p.manuals.push({ id: `legacy-manual-${p.id}`, title: 'User Manual', images: p.manualImages || [], pdfUrl: p.manualUrl });
                    }
                    if (!p.dateAdded) p.dateAdded = new Date().toISOString();
                });
            });
        });
    }

    if (data.pricelistBrands.length === 0 && data.pricelists.length > 0 && data.brands.length > 0) {
        const usedBrandIds = new Set(data.pricelists.map((p: any) => p.brandId));
        data.brands.forEach((b: any) => {
            if (usedBrandIds.has(b.id)) {
                data.pricelistBrands.push({ id: b.id, name: b.name, logoUrl: b.logoUrl });
            }
        });
    }

    if (data.ads) {
        Object.keys(data.ads).forEach(key => {
            if (Array.isArray(data.ads[key])) {
                data.ads[key].forEach((ad: any) => { if (!ad.dateAdded) ad.dateAdded = new Date().toISOString(); });
            }
        });
    }

    if (data.tv && data.tv.brands) {
        data.tv.brands.forEach((tvb: any) => {
            if (!tvb.models) tvb.models = [];
            if (tvb.videoUrls && Array.isArray(tvb.videoUrls) && tvb.videoUrls.length > 0) {
                if (tvb.models.length === 0) {
                    tvb.models.push({ id: `migrated-model-${tvb.id}`, name: "General Showcase", imageUrl: tvb.logoUrl, videoUrls: [...tvb.videoUrls] });
                }
                tvb.videoUrls = undefined;
            }
        });
    }
    
    if (data.catalogues) {
        data.catalogues.forEach((c: any) => { if(!c.type) c.type = c.brandId ? 'catalogue' : 'pamphlet'; });
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
            deletedAt: { ...(data.archive?.deletedAt || {}), ...expiredCatalogues.reduce((acc, curr) => ({ ...acc, [curr.id]: new Date().toISOString() }), {}) }
        };
        const updatedData = { ...data, catalogues: activeCatalogues, archive: newArchive };
        if (supabase) await supabase.from('store_config').update({ data: updatedData }).eq('id', 1);
        return updatedData;
    }
    return data;
};

const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  if (supabase) {
      try {
          const [configResponse, fleetResponse] = await Promise.all([
              supabase.from('store_config').select('data').eq('id', 1).single(),
              supabase.from('kiosks').select('*')
          ]);
          const rawConfig = configResponse.data?.data || {};
          let processedData = migrateData(rawConfig);
          if (fleetResponse.data) {
              processedData.fleet = fleetResponse.data.map((k: any) => ({
                  id: k.id, name: k.name, deviceType: k.device_type, status: k.status, last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address, version: k.version, locationDescription: k.location_description, assignedZone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested
              }));
          }
          processedData = await handleExpiration(processedData);
          try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData)); } catch (e) {}
          return processedData;
      } catch (e) {}
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}
  return migrateData(DEFAULT_DATA);
};

const saveStoreData = async (data: StoreData): Promise<void> => {
    try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data)); } catch (e) {}
    if (!supabase) initSupabase();
    if (supabase) {
        try {
            const { fleet, ...dataToSave } = data;
            const { error } = await supabase.from('store_config').upsert({ id: 1, data: dataToSave });
            if (error) throw error;
        } catch (e) { throw new Error("Sync failed. Local save only."); }
    }
};

const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};

export { generateStoreData, saveStoreData, resetStoreData };
