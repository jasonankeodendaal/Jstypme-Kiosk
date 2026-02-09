
export interface SyncSettings {
  bridgeStatus: 'online' | 'offline';
  lastSync: string;
  localPath?: string;
  syncKey: string;
  autoSyncEnabled: boolean;
}

export interface DimensionSet {
  label?: string; // e.g. "Device", "Stand", "Box 1"
  width: string;
  height: string;
  depth: string;
  weight: string;
}

export interface Manual {
  id: string;
  title: string;
  images: string[]; // Converted pages
  pdfUrl?: string;  // Optional backing PDF
  thumbnailUrl?: string; // New field for cover image
}

export interface Product {
  id: string;
  sku?: string; 
  name: string;
  description: string;
  terms?: string; 
  specs: Record<string, string>;
  features: string[];
  boxContents?: string[]; 
  dimensions: DimensionSet[]; 
  imageUrl: string;
  galleryUrls?: string[]; 
  videoUrl?: string; 
  videoUrls?: string[]; 
  manuals?: Manual[];
  manualUrl?: string; 
  manualImages?: string[]; 
  dateAdded?: string; 
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string; 
  products: Product[];
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  themeColor?: string; 
  categories: Category[];
}

export interface TVModel {
  id: string;
  name: string; 
  imageUrl?: string; 
  videoUrls: string[];
}

export interface TVBrand {
  id: string;
  name: string;
  logoUrl?: string;
  models: TVModel[];
  videoUrls?: string[];
}

export interface TVConfig {
  brands: TVBrand[];
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface Catalogue {
  id: string;
  brandId?: string; 
  title: string;
  type: 'catalogue' | 'pamphlet'; 
  year?: number; 
  startDate?: string; 
  endDate?: string;   
  promoText?: string; 
  pdfUrl?: string; 
  thumbnailUrl?: string; 
  pages: string[]; 
}

export interface PricelistBrand {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface PricelistItem {
  id: string;
  sku: string;
  description: string;
  normalPrice: string;
  promoPrice?: string;
  imageUrl?: string; 
}

export interface Pricelist {
  id: string;
  brandId: string;
  title: string;
  type?: 'pdf' | 'manual'; 
  items?: PricelistItem[]; 
  url: string; 
  thumbnailUrl?: string; 
  month: string;
  year: string;
  dateAdded?: string; 
  kind?: 'standard' | 'promotion'; 
  startDate?: string; 
  endDate?: string;   
  promoText?: string; 
  headers?: {         
    sku?: string;
    description?: string;
    normalPrice?: string;
    promoPrice?: string;
  };
}

export interface AdItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  dateAdded?: string; 
}

export interface AdConfig {
  homeBottomLeft: AdItem[];
  homeBottomRight: AdItem[];
  screensaver: AdItem[];
}

export interface ScreensaverSettings {
  idleTimeout: number; 
  imageDuration: number; 
  muteVideos: boolean;
  showProductImages: boolean;
  showProductVideos: boolean;
  showPamphlets: boolean;
  showCustomAds: boolean;
  displayStyle?: 'contain' | 'cover';
  showInfoOverlay?: boolean;
  activeHoursStart?: string; 
  activeHoursEnd?: string;   
  enableSleepMode?: boolean; 
  animationStyle?: 'random' | 'cinematic' | 'pulse' | 'static'; 
  enableKenBurns?: boolean;
  transitionType?: 'fade' | 'slide';
  textGlow?: boolean;
  showClock?: boolean;
  textAlignment?: 'left' | 'center' | 'right';
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontSize?: 'small' | 'medium' | 'large';
}

export interface KioskRegistry {
  id: string;
  name: string;
  deviceType?: 'kiosk' | 'mobile' | 'tv'; 
  status: 'online' | 'offline';
  last_seen: string;
  wifiStrength: number; 
  ipAddress: string;
  version: string;
  locationDescription?: string;
  assignedZone?: string;
  notes?: string;
  restartRequested?: boolean; 
  showPricelists?: boolean;
}

export interface ArchivedItem {
    id: string;
    type: 'product' | 'pricelist' | 'tv_model' | 'device' | 'brand' | 'catalogue' | 'other';
    action: 'delete' | 'restore' | 'update' | 'create';
    name: string;
    userName: string;
    method: 'admin_panel' | 'system_auto' | 'import';
    data: any;
    deletedAt: string;
}

export interface ArchiveData {
    brands: Brand[];
    products: { product: Product, originalBrand: string, originalCategory: string }[]; 
    catalogues: Catalogue[];
    deletedItems?: ArchivedItem[]; 
    deletedAt: Record<string, string>; 
}

export interface AboutConfig {
    title?: string;
    text?: string;
    audioUrl?: string;
}

export interface AppConfig {
    kioskIconUrl?: string;
    adminIconUrl?: string;
}

export interface SystemSettings {
    setupPin?: string;
}

export interface AdminPermissions {
    inventory: boolean;
    marketing: boolean;
    tv: boolean;
    screensaver: boolean;
    fleet: boolean;
    history: boolean;
    settings: boolean;
    pricelists: boolean;
}

export interface AdminUser {
    id: string;
    name: string;
    pin: string;
    isSuperAdmin: boolean;
    permissions: AdminPermissions;
}

export interface StoreData {
  companyLogoUrl?: string; 
  hero: HeroConfig;
  catalogues?: Catalogue[]; 
  pricelists?: Pricelist[];
  pricelistBrands?: PricelistBrand[]; 
  brands: Brand[];
  tv?: TVConfig; 
  ads?: AdConfig;
  screensaverSettings?: ScreensaverSettings; 
  fleet?: KioskRegistry[]; 
  archive?: ArchiveData; 
  about?: AboutConfig;
  admins: AdminUser[]; 
  appConfig?: AppConfig; 
  systemSettings?: SystemSettings; 
  syncSettings?: SyncSettings; // Added for folder sync
}

export interface FlatProduct extends Product {
  brandName: string;
  categoryName: string;
  brandThemeColor?: string;
}
