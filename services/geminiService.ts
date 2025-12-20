
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Pricelist, PricelistBrand } from "../types";
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

const MOCK_BRANDS: any[] = [
  {
    id: 'b-samsung',
    name: 'Samsung',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
    themeColor: '#034EA2',
    categories: [
      {
        id: 'c-phones',
        name: 'Smartphone',
        icon: 'Smartphone',
        products: [
          {
            id: 'p-s24u',
            sku: 'SM-S928B',
            name: 'Galaxy S24 Ultra',
            description: 'The ultimate Galaxy AI experience. Titanium frame, 200MP camera, and built-in S Pen.',
            features: ['Galaxy AI', 'Snapdragon 8 Gen 3', '2600 nits display', 'Titanium Build'],
            specs: { 'Display': '6.8" QHD+', 'Camera': '200MP Main', 'Battery': '5000mAh', 'Storage': '256GB/512GB/1TB' },
            boxContents: ['Handset', 'S-Pen', 'USB-C Cable', 'Ejection Pin'],
            dimensions: [{ label: 'Device', width: '79.0mm', height: '162.3mm', depth: '8.6mm', weight: '232g' }],
            imageUrl: 'https://images.samsung.com/is/image/samsung/p6pim/za/2401/gb/sm-s928bztqxea/7.png?$720_576_PNG$',
            galleryUrls: [
               'https://images.samsung.com/is/image/samsung/p6pim/za/2401/gb/sm-s928bztqxea/1.png',
               'https://images.samsung.com/is/image/samsung/p6pim/za/2401/gb/sm-s928bztqxea/3.png'
            ],
            dateAdded: new Date().toISOString()
          }
        ]
      },
      {
        id: 'c-tablets',
        name: 'Tablet',
        icon: 'Tablet',
        products: [
          {
            id: 'p-s9u',
            sku: 'SM-X910',
            name: 'Galaxy Tab S9 Ultra',
            description: 'Our largest, most powerful tablet ever. IP68 water resistance and Dynamic AMOLED 2X.',
            features: ['14.6" Display', 'IP68 Rated', 'S Pen Included', 'Vapor Chamber Cooling'],
            specs: { 'Display': '14.6" AMOLED', 'Processor': 'SD 8 Gen 2', 'RAM': '12GB/16GB' },
            dimensions: [{ width: '326.4mm', height: '208.6mm', depth: '5.5mm', weight: '732g' }],
            imageUrl: 'https://images.samsung.com/is/image/samsung/p6pim/za/sm-x910nzaaxfa/gallery/za-galaxy-tab-s9-ultra-sm-x910-471249-sm-x910nzaaxfa-537446702?$720_576_PNG$',
            dateAdded: new Date().toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'b-apple',
    name: 'Apple',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1665px-Apple_logo_black.svg.png',
    categories: [
      {
        id: 'c-iphones',
        name: 'Smartphone',
        products: [
          {
            id: 'p-i15p',
            sku: 'MTPV3AA/A',
            name: 'iPhone 15 Pro Max',
            description: 'Forged in titanium. Features the groundbreaking A17 Pro chip and a customizable Action button.',
            features: ['Titanium Design', 'A17 Pro Chip', 'USB-C', '5x Telephoto'],
            specs: { 'Screen': '6.7" OLED', 'Chip': 'A17 Pro', 'Connection': 'USB-C 3.0' },
            dimensions: [{ width: '76.7mm', height: '159.9mm', depth: '8.25mm', weight: '221g' }],
            imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
            dateAdded: new Date().toISOString()
          }
        ]
      }
    ]
  },
  {
      id: 'b-sony',
      name: 'Sony',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png',
      categories: [
          {
              id: 'c-audio',
              name: 'Headphones',
              products: [
                  {
                      id: 'p-xm5',
                      sku: 'WH1000XM5',
                      name: 'Sony WH-1000XM5',
                      description: 'Industry-leading noise cancellation. Exceptional sound quality and crystal clear calls.',
                      features: ['Auto NC Optimizer', 'Multipoint Connection', '30hr Battery', 'LDAC Support'],
                      specs: { 'Battery': '30 Hours', 'Weight': '250g', 'Bluetooth': '5.2' },
                      imageUrl: 'https://www.sony.co.za/image/5d02da5df552836db894cead8afc2098?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
                      dateAdded: new Date().toISOString()
                  }
              ]
          }
      ]
  }
];

const MOCK_PRICELISTS: Pricelist[] = [
    {
        id: 'pl-1',
        brandId: 'b-samsung',
        title: 'Mobile Master Pricelist',
        type: 'manual',
        month: 'October',
        year: '2023',
        dateAdded: new Date().toISOString(),
        url: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop',
        items: [
            { id: 'i1', sku: 'S24-U-256', description: 'Galaxy S24 Ultra 256GB', normalPrice: 'R 29,999', promoPrice: 'R 27,499' },
            { id: 'i2', sku: 'S24-P-256', description: 'Galaxy S24 Plus 256GB', normalPrice: 'R 22,499', promoPrice: 'R 20,999' },
            { id: 'i3', sku: 'Z-FOLD-5', description: 'Galaxy Z Fold 5 512GB', normalPrice: 'R 45,999', promoPrice: 'R 39,999' }
        ]
    },
    {
        id: 'pl-2',
        brandId: 'b-apple',
        title: 'iPhone 15 Series Rates',
        type: 'manual',
        month: 'October',
        year: '2023',
        dateAdded: new Date().toISOString(),
        url: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2070&auto=format&fit=crop',
        items: [
            { id: 'i4', sku: 'IP15-PM-256', description: 'iPhone 15 Pro Max 256GB', normalPrice: 'R 33,499', promoPrice: 'R 31,999' },
            { id: 'i5', sku: 'IP15-P-128', description: 'iPhone 15 Pro 128GB', normalPrice: 'R 27,999', promoPrice: 'R 26,499' }
        ]
    }
];

const MOCK_PL_BRANDS: PricelistBrand[] = [
    { id: 'b-samsung', name: 'Samsung Mobile', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png' },
    { id: 'b-apple', name: 'Apple Authorized', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1665px-Apple_logo_black.svg.png' },
    { id: 'b-sony', name: 'Sony Music & Tech', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png' }
];

const DEFAULT_DATA: StoreData = {
  companyLogoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
  hero: {
    title: "Flagship Retail Experience",
    subtitle: "Experience the pinnacle of innovation. Browse our curated collection of premium electronics and lifestyle tech.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop",
    logoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
    websiteUrl: "https://jstyp.me"
  },
  screensaverSettings: {
    idleTimeout: 45,
    imageDuration: 6,
    muteVideos: true,
    showProductImages: true,
    showProductVideos: true,
    showPamphlets: true,
    showCustomAds: true,
    displayStyle: 'cover'
  },
  catalogues: [
      { 
          id: 'cat-main', 
          title: 'Flagship Store Guide', 
          type: 'pamphlet', 
          year: 2024, 
          thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
          pages: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'] 
      }
  ],
  pricelists: MOCK_PRICELISTS,
  pricelistBrands: MOCK_PL_BRANDS,
  brands: MOCK_BRANDS,
  tv: {
    brands: [
        {
            id: 'tvb-sony',
            name: 'Sony Bravia',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png',
            models: [
                {
                    id: 'm-oled',
                    name: 'A95L OLED Master',
                    videoUrls: ['https://v4.cdnpk.net/videvo_files/video/free/2014-12/large_watermarked/Raindrops_v2_videvo_preview.mp4']
                }
            ]
        }
    ]
  },
  ads: {
    homeBottomLeft: [
        { id: 'ad1', type: 'image', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop' }
    ],
    homeBottomRight: [
        { id: 'ad2', type: 'image', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=2070&auto=format&fit=crop' }
    ],
    homeSideVertical: [],
    screensaver: []
  },
  fleet: [],
  about: {
      title: "Our Tech Vision",
      text: "Serving the community with the latest innovation since 2010. Our store is designed to bring you closer to the future of retail.",
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
    if (!data.brands || !Array.isArray(data.brands)) data.brands = DEFAULT_DATA.brands;
    if (!data.catalogues || !Array.isArray(data.catalogues)) data.catalogues = DEFAULT_DATA.catalogues;
    if (!data.pricelists || !Array.isArray(data.pricelists)) data.pricelists = DEFAULT_DATA.pricelists;
    if (!data.pricelistBrands || !Array.isArray(data.pricelistBrands)) data.pricelistBrands = DEFAULT_DATA.pricelistBrands;
    if (!data.fleet || !Array.isArray(data.fleet)) data.fleet = [];
    if (!data.hero) data.hero = { ...DEFAULT_DATA.hero };
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.about) data.about = { ...DEFAULT_DATA.about };
    
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) {
        data.admins = [DEFAULT_ADMIN];
    }

    if (!data.appConfig) data.appConfig = { ...DEFAULT_DATA.appConfig };
    if (!data.tv) data.tv = DEFAULT_DATA.tv;
    if (!data.systemSettings) data.systemSettings = { ...DEFAULT_DATA.systemSettings };

    // Migrate nested products for dimensions and manuals
    data.brands.forEach((b: any) => {
        if (!b.categories) b.categories = [];
        b.categories.forEach((c: any) => {
            if (!c.products) c.products = [];
            c.products.forEach((p: any) => {
                if (p.dimensions && !Array.isArray(p.dimensions)) {
                    p.dimensions = [{ label: "Dimensions", ...p.dimensions }];
                }
                if (!p.manuals) p.manuals = [];
                if (!p.dateAdded) p.dateAdded = new Date().toISOString();
            });
        });
    });

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
                  localStorage.setItem(STORAGE_KEY_ID + '_cloud_state', 'online');
                  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData));
              } catch (e) {}
              
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
