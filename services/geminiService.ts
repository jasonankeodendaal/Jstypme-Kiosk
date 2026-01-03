import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, Pricelist } from "../types";
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
        { id: 'item-3', sku: 'SAM-S24', description: 'Samsung Galaxy S24 128GB Cobalt Violet', normalPrice: 'R 17,999' }
      ],
      url: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?w=300&h=400&fit=crop',
      month: 'May',
      year: '2024',
      dateAdded: new Date().toISOString(),
      version: 'v01',
      history: []
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
    if (!data.brands || !Array.isArray(data.brands)) data.brands = [...MOCK_BRANDS];
    if (!data.catalogues || !Array.isArray(data.catalogues)) data.catalogues = [];
    if (!data.pricelists || !Array.isArray(data.pricelists)) data.pricelists = [];
    if (!data.pricelistBrands || !Array.isArray(data.pricelistBrands)) data.pricelistBrands = [];
    if (!data.fleet || !Array.isArray(data.fleet)) data.fleet = [];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.ads) {
        data.ads = { ...DEFAULT_DATA.ads };
    }
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.about) data.about = { ...DEFAULT_DATA.about };
    
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) {
        data.admins = [DEFAULT_ADMIN];
    }

    if (data.pricelists) {
        data.pricelists.forEach((pl: any) => {
            if (pl.type === 'manual' && !pl.version) pl.version = 'v01';
            if (pl.type === 'manual' && !pl.history) pl.history = [];
        });
    }

    if (!data.appConfig) {
        data.appConfig = { ...DEFAULT_DATA.appConfig };
    }
    
    if (!data.tv) data.tv = { brands: [] };
    if (!data.systemSettings) data.systemSettings = { ...DEFAULT_DATA.systemSettings };

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
                  console.error("CRITICAL: LocalStorage is full.", e);
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
        console.warn("Storage Quota Exceeded.");
        const { archive, ...smallerData } = data;
        try {
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(smallerData));
        } catch (innerE) {}
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