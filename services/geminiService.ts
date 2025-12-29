
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';
const DB_NAME = 'KioskProDB';
const STORE_NAME = 'config';

// Simple IndexedDB wrapper for large data storage
const dbRequest = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(STORE_NAME)) {
                request.result.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const getDBValue = async (key: string): Promise<any> => {
    const db = await dbRequest();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const setDBValue = async (key: string, value: any): Promise<void> => {
    const db = await dbRequest();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
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
      },
      {
        id: 'c-watch',
        name: 'Watch',
        icon: 'Watch',
        products: [
          {
            id: 'p-awultra2',
            sku: 'AW-ULTRA2',
            name: 'Apple Watch Ultra 2',
            description: 'The most rugged and capable Apple Watch. Designed for outdoor adventures and supercharged workouts.',
            specs: { 'Display': '3000 nits Retina', 'Water Resistance': '100m', 'Battery': 'Up to 36 hours' },
            features: ['Aerospace-grade titanium', 'Dual-frequency GPS', 'Action button', 'Siren'],
            dimensions: [{ label: 'Case', width: '44 mm', height: '49 mm', depth: '14.4 mm', weight: '61.4 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1695663363300-8488e0b68673?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-samsung',
    name: 'Samsung',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1024px-Samsung_Logo.svg.png',
    categories: [
      {
        id: 'c-s-phone',
        name: 'Smartphone',
        icon: 'Smartphone',
        products: [
          {
            id: 'p-s24u',
            sku: 'SAM-S24U',
            name: 'Galaxy S24 Ultra',
            description: 'The ultimate form of Galaxy Ultra with Galaxy AI. Experience a new level of creativity and productivity.',
            specs: { 'Processor': 'Snapdragon 8 Gen 3', 'Screen': '6.8" QHD+ Dynamic AMOLED', 'Camera': '200MP Wide-angle' },
            features: ['Circle to Search', 'Note Assist', 'Titanium frame', 'Built-in S Pen'],
            dimensions: [{ width: '79 mm', height: '162.3 mm', depth: '8.6 mm', weight: '232 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1707231454157-8106206f477b?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-sony',
    name: 'Sony',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/1200px-Sony_logo.svg.png',
    categories: [
      {
        id: 'c-sony-audio',
        name: 'Headphones',
        icon: 'Headphones',
        products: [
          {
            id: 'p-xm5',
            sku: 'SNY-WH1000',
            name: 'WH-1000XM5',
            description: 'Industry-leading noise cancellation and magnificent sound quality. Integrated Processor V1 and 8 microphones.',
            specs: { 'Battery': '30 Hours', 'Charging': 'USB-C', 'Weight': '250g' },
            features: ['Auto NC Optimizer', 'Crystal-clear calls', 'Multipoint connection'],
            dimensions: [{ width: '180 mm', height: '220 mm', depth: '70 mm', weight: '250 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1671049281512-bc78b6680a6b?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-dyson',
    name: 'Dyson',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Dyson_logo.svg/1280px-Dyson_logo.svg.png',
    categories: [
      {
        id: 'c-dyson-vac',
        name: 'Appliances',
        icon: 'Box',
        products: [
          {
            id: 'p-v15',
            sku: 'DYS-V15',
            name: 'V15 Detect Absolute',
            description: 'The most powerful, intelligent cordless vacuum. With Laser Slim Fluffy cleaner head.',
            specs: { 'Suction Power': '230 AW', 'Run Time': '60 mins', 'Bin Volume': '0.76 L' },
            features: ['Laser detects invisible dust', 'Piezo sensor counts particles', 'Digital Motorbar'],
            dimensions: [{ width: '250 mm', height: '1264 mm', depth: '252 mm', weight: '3.1 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop'
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
    }
  ],
  pricelistBrands: [
    { id: 'plb-mock-1', name: 'Mobile Tech', logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop' }
  ],
  brands: MOCK_BRANDS,
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
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [...MOCK_BRANDS];
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
              await setDBValue(STORAGE_KEY_DATA, processedData);
              return processedData;
          }
      } catch (e) {
          console.warn("Cloud fetch unavailable, falling back to local cache.", e);
      }
  }

  try {
    const stored = await getDBValue(STORAGE_KEY_DATA);
    if (stored) return migrateData(stored);
    
    // Legacy migration
    const legacy = localStorage.getItem(STORAGE_KEY_DATA);
    if (legacy) {
        const parsed = JSON.parse(legacy);
        await setDBValue(STORAGE_KEY_DATA, parsed);
        localStorage.removeItem(STORAGE_KEY_DATA);
        return migrateData(parsed);
    }
  } catch (e) {}

  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    try {
        await setDBValue(STORAGE_KEY_DATA, data);
    } catch (e) {
        console.error("Storage Critical Failure: Unable to save to IndexedDB.", e);
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
