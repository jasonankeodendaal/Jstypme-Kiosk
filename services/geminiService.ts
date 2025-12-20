
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
  }
];

const MOCK_PL_BRANDS: PricelistBrand[] = [
    { id: 'b-samsung', name: 'Samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png' },
    { id: 'b-apple', name: 'Apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1665px-Apple_logo_black.svg.png' },
    { id: 'b-sony', name: 'Sony', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png' },
    { id: 'b-lg', name: 'LG', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png' },
    { id: 'b-huawei', name: 'Huawei', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Huawei_logo.svg/2560px-Huawei_logo.svg.png' },
    { id: 'b-xiaomi', name: 'Xiaomi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-present%29.svg/1200px-Xiaomi_logo_%282021-present%29.svg.png' },
    { id: 'b-oppo', name: 'Oppo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Oppo_logo_2019.svg/2560px-Oppo_logo_2019.svg.png' },
    { id: 'b-vivo', name: 'Vivo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Vivo_logo_2019.svg/2560px-Vivo_logo_2019.svg.png' },
    { id: 'b-nokia', name: 'Nokia', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nokia_logo.svg/2560px-Nokia_logo.svg.png' },
    { id: 'b-motorola', name: 'Motorola', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Motorola_logo.svg/2560px-Motorola_logo.svg.png' },
    { id: 'b-google', name: 'Google', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png' },
    { id: 'b-asus', name: 'Asus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Asus_Logo.svg/2560px-Asus_Logo.svg.png' },
    { id: 'b-dell', name: 'Dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/2560px-Dell_logo_2016.svg.png' },
    { id: 'b-hp', name: 'HP', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2560px-HP_logo_2012.svg.png' },
    { id: 'b-lenovo', name: 'Lenovo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/2560px-Lenovo_logo_2015.svg.png' }
];

const MOCK_PRICELISTS: Pricelist[] = MOCK_PL_BRANDS.map(brand => ({
    id: `pl-${brand.id}`,
    brandId: brand.id,
    title: `${brand.name} Master Rates`,
    type: 'manual',
    month: 'October',
    year: '2023',
    dateAdded: new Date().toISOString(),
    url: '',
    items: [
        { id: `i-${brand.id}-1`, sku: 'SKU-001', description: `${brand.name} Flagship Model A`, normalPrice: 'R 19,999', promoPrice: 'R 17,499' },
        { id: `i-${brand.id}-2`, sku: 'SKU-002', description: `${brand.name} Premium Model B`, normalPrice: 'R 12,499', promoPrice: 'R 10,999' }
    ]
}));

const DEFAULT_DATA: StoreData = {
  companyLogoUrl: "https://i.ibb.co/ZR8bZRSp/JSTYP-me-Logo.png",
  hero: {
    title: "Premium Tech Kiosk",
    subtitle: "Browse the latest hardware and official technical documentation.",
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
          title: 'Official Store Guide', 
          type: 'pamphlet', 
          year: 2024, 
          thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
          pages: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'] 
      }
  ],
  pricelists: MOCK_PRICELISTS,
  pricelistBrands: MOCK_PL_BRANDS,
  brands: MOCK_BRANDS,
  tv: { brands: [] },
  ads: {
    homeBottomLeft: [],
    homeBottomRight: [],
    homeSideVertical: [],
    screensaver: []
  },
  fleet: [],
  about: {
      title: "Retail Innovation",
      text: "Digital transformation for modern storefronts.",
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
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) data.admins = [DEFAULT_ADMIN];
    if (!data.appConfig) data.appConfig = { ...DEFAULT_DATA.appConfig };
    if (!data.tv) data.tv = DEFAULT_DATA.tv;
    if (!data.systemSettings) data.systemSettings = { ...DEFAULT_DATA.systemSettings };
    return data as StoreData;
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
                  processedData.fleet = fleetResponse.data.map((k: any) => ({
                      id: k.id, name: k.name, deviceType: k.device_type, status: k.status,
                      last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address,
                      version: k.version, locationDescription: k.location_description,
                      assignedZone: k.assigned_zone, notes: k.notes, restartRequested: k.restart_requested
                  }));
              }
              return processedData;
          }
      } catch (e) {}
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}
  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data)); } catch (e) {}
    if (!supabase) initSupabase();
    if (supabase) {
        try {
            const { fleet, ...dataToSave } = data;
            await supabase.from('store_config').upsert({ id: 1, data: dataToSave });
        } catch (e) {}
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};
