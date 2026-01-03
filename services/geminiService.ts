import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand, FlatProduct } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";
import { GoogleGenAI, Type } from "@google/genai";

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
            description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.',
            specs: { 'Chip': 'A17 Pro', 'Display': '6.7-inch Super Retina XDR', 'Camera': '48MP Main | Ultra Wide | Telephoto' },
            features: ['Titanium design', 'Action button', 'USB-C with USB 3 speeds', 'All-day battery life'],
            dimensions: [{ label: 'Device', width: '76.7 mm', height: '159.9 mm', depth: '8.25 mm', weight: '221 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop'
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
    showCustomAds: true,
    transitionStyle: 'random'
  },
  catalogues: [],
  pricelists: [],
  pricelistBrands: [],
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
      text: "Welcome to the Kiosk Pro Showcase. Our mission is to bridge the gap between digital convenience and physical retail experience.",
      audioUrl: ""
  },
  admins: [DEFAULT_ADMIN],
  appConfig: {
      kioskIconUrl: "https://i.ibb.co/S7Nxv1dD/android-launchericon-512-512.png",
      adminIconUrl: "https://i.ibb.co/qYDggwHs/android-launchericon-512-512.png",
      themeColor: "#2563eb"
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
    if (!data.ads) data.ads = { ...DEFAULT_DATA.ads };
    if (!data.screensaverSettings) data.screensaverSettings = { ...DEFAULT_DATA.screensaverSettings };
    if (!data.about) data.about = { ...DEFAULT_DATA.about };
    
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) {
        data.admins = [DEFAULT_ADMIN];
    }

    if (!data.appConfig) data.appConfig = { ...DEFAULT_DATA.appConfig };
    if (!data.tv) data.tv = { brands: [] };
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
              localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData));
              return processedData;
          }
      } catch (e) {
          console.warn("Cloud fetch unavailable, falling back to local cache.");
      }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_DATA);
    if (stored) return migrateData(JSON.parse(stored));
  } catch (e) {}

  return migrateData(DEFAULT_DATA);
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    if (!supabase) initSupabase();
    if (supabase) {
        const { fleet, ...dataToSave } = data;
        await supabase.from('store_config').upsert({ id: 1, data: dataToSave });
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    await saveStoreData(DEFAULT_DATA);
    return DEFAULT_DATA;
};

/** AI SERVICES **/

export const performSemanticSearch = async (query: string, products: FlatProduct[]): Promise<string[]> => {
    if (!process.env.API_KEY) return [];
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const productListStr = products.map(p => `${p.id}: ${p.name} - ${p.description}`).join('\n');
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `The user is searching for: "${query}". Based on the following product catalog, return a comma-separated list of product IDs that are semantically relevant. If none, return "NONE".\n\nCatalog:\n${productListStr}`,
            config: {
                systemInstruction: "You are a retail product expert. Match user intent (e.g. 'gaming' to products with high refresh screens or GPUs) to product IDs.",
                temperature: 0.1
            }
        });

        const text = response.text || "";
        if (text.includes("NONE")) return [];
        return text.split(',').map(s => s.trim());
    } catch (e) {
        console.error("AI Search Failed", e);
        return [];
    }
};

export const compareProductsWithAI = async (products: Product[]): Promise<string> => {
    if (!process.env.API_KEY) return "Comparison engine offline.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const data = products.map(p => JSON.stringify({ name: p.name, specs: p.specs, features: p.features })).join('\n---\n');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Please provide a professional, concise retail comparison of these products for a customer. Highlight the best use-case for each.\n\n${data}`,
            config: {
                systemInstruction: "You are a helpful in-store sales assistant. Use bullet points. Be honest and objective.",
            }
        });

        return response.text || "Unable to generate comparison.";
    } catch (e) {
        return "AI analysis failed. Please compare manually.";
    }
};