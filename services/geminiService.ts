
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand } from "../types";
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
  },
  {
    id: 'b-lg',
    name: 'LG',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/1024px-LG_logo_%282015%29.svg.png',
    categories: [
      {
        id: 'c-lg-tv',
        name: 'Monitor',
        icon: 'Monitor',
        products: [
          {
            id: 'p-lg-c3',
            sku: 'LG-65C3',
            name: 'OLED evo C3 65"',
            description: 'The world’s #1 OLED brand. Boasting over a decade of excellence in the field.',
            specs: { 'Resolution': '4K UHD', 'Refresh Rate': '120Hz', 'Panel': 'OLED evo' },
            features: ['α9 AI Processor Gen6', 'Brightness Booster', 'Ultra Slim Design'],
            dimensions: [{ label: 'With Stand', width: '1441 mm', height: '880 mm', depth: '230 mm', weight: '18.5 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-canon',
    name: 'Canon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Canon_logo.svg/1280px-Canon_logo.svg.png',
    categories: [
      {
        id: 'c-canon-cam',
        name: 'Camera',
        icon: 'Box',
        products: [
          {
            id: 'p-eos-r6',
            sku: 'CAN-R6II',
            name: 'EOS R6 Mark II',
            description: 'The ultimate hybrid camera. Master the art of video and photography with unrivaled performance.',
            specs: { 'Sensor': '24.2MP Full-Frame', 'Video': '4K 60p', 'AF': 'Dual Pixel CMOS AF II' },
            features: ['Up to 40fps electronic shutter', 'In-body Image Stabilization', 'Weather sealed'],
            dimensions: [{ width: '138.4 mm', height: '98.4 mm', depth: '88.4 mm', weight: '670 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-dji',
    name: 'DJI',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/DJI_Logo.svg/1200px-DJI_Logo.svg.png',
    categories: [
      {
        id: 'c-dji-drone',
        name: 'Drone',
        icon: 'Box',
        products: [
          {
            id: 'p-avata2',
            sku: 'DJI-AVATA2',
            name: 'Avata 2',
            description: 'The ultimate adrenaline-fueled FPV drone experience with enhanced safety and battery life.',
            specs: { 'Video': '4K/60fps HDR', 'Flight Time': '23 mins', 'Sensor': '1/1.3-inch CMOS' },
            features: ['Integrated Propeller Guard', 'Easy ACRO', 'O4 Video Transmission'],
            dimensions: [{ width: '185 mm', height: '64 mm', depth: '212 mm', weight: '377 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e44a224fe8f?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-bose',
    name: 'Bose',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bose_Logo.svg/1200px-Bose_Logo.svg.png',
    categories: [
      {
        id: 'c-bose-audio',
        name: 'Headphones',
        icon: 'Headphones',
        products: [
          {
            id: 'p-qc-ultra',
            sku: 'BSE-QC-ULTRA',
            name: 'QuietComfort Ultra',
            description: 'World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for more immersive listening.',
            specs: { 'Battery': 'Up to 24 hours', 'Modes': 'Quiet, Aware, Immersion', 'Bluetooth': '5.3' },
            features: ['CustomTune technology', 'Immersive Audio', 'All-day comfort'],
            dimensions: [{ width: '150 mm', height: '190 mm', depth: '50 mm', weight: '250 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-kitchenaid',
    name: 'KitchenAid',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/KitchenAid_logo.svg/1200px-KitchenAid_logo.svg.png',
    categories: [
      {
        id: 'c-ka-mixer',
        name: 'Appliances',
        icon: 'Box',
        products: [
          {
            id: 'p-artisan-mixer',
            sku: 'KTC-MIX',
            name: 'Artisan 4.8L Stand Mixer',
            description: 'The iconic kitchen essential. Smooth, rounded tilt-head design with high-quality metal construction.',
            specs: { 'Capacity': '4.8 Liters', 'Power': '300 Watts', 'Speeds': '10 Speeds' },
            features: ['Original planetary action', 'Full metal construction', 'Versatile attachments'],
            dimensions: [{ width: '240 mm', height: '360 mm', depth: '370 mm', weight: '10.4 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1594385208974-2e75f9d8ad48?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-microsoft',
    name: 'Microsoft',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png',
    categories: [
      {
        id: 'c-ms-surface',
        name: 'Laptop',
        icon: 'Laptop',
        products: [
          {
            id: 'p-surface-l5',
            sku: 'MS-SURF-L5',
            name: 'Surface Laptop 5',
            description: 'Sleek, powerful, and elegant. Multi-tasking speed with 12th Gen Intel Core i5/i7 processors.',
            specs: { 'Display': '13.5" or 15" PixelSense', 'RAM': 'Up to 32GB', 'Battery': 'Up to 18 hours' },
            features: ['Dolby Vision IQ', 'Omnisonic Speakers', 'Windows 11'],
            dimensions: [{ label: '13.5"', width: '308 mm', height: '223 mm', depth: '14.5 mm', weight: '1.27 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-nintendo',
    name: 'Nintendo',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/1200px-Nintendo.svg.png',
    categories: [
      {
        id: 'c-n-gaming',
        name: 'Gaming',
        icon: 'Box',
        products: [
          {
            id: 'p-switch-oled',
            sku: 'NIN-SW-OLED',
            name: 'Switch (OLED Model)',
            description: 'Vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.',
            specs: { 'Screen': '7" OLED', 'Storage': '64GB', 'Battery': 'Up to 9 hours' },
            features: ['Three modes in one', 'Local and online multiplayer', 'Share the fun'],
            dimensions: [{ width: '242 mm', height: '102 mm', depth: '13.9 mm', weight: '420 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-hp',
    name: 'HP',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/1200px-HP_logo_2012.svg.png',
    categories: [
      {
        id: 'c-hp-laptop',
        name: 'Laptop',
        icon: 'Laptop',
        products: [
          {
            id: 'p-spectre-x360',
            sku: 'HP-SPEC-360',
            name: 'Spectre x360',
            description: 'Elevate your every day with the Spectre x360. Combining premium craftsmanship with powerful performance.',
            specs: { 'Processor': 'Intel Core i7-1355U', 'RAM': '16GB LPDDR4x', 'Storage': '512GB SSD' },
            features: ['360-degree hinge', 'OLED Touch Display', 'Long battery life'],
            dimensions: [{ width: '298 mm', height: '220 mm', depth: '16.9 mm', weight: '1.36 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-dell',
    name: 'Dell',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/1200px-Dell_logo_2016.svg.png',
    categories: [
      {
        id: 'c-dell-laptop',
        name: 'Laptop',
        icon: 'Laptop',
        products: [
          {
            id: 'p-xps-13',
            sku: 'DELL-XPS-13',
            name: 'XPS 13 Laptop',
            description: 'The world\'s smallest 13-inch laptop with the first InfinityEdge display. Stunning inside and out.',
            specs: { 'Display': '13.4" FHD+ InfinityEdge', 'CPU': '12th Gen Intel Core', 'Weight': 'Starting at 1.17kg' },
            features: ['Precision-machined aluminum', 'Gorilla Glass 6', 'Eyesafe display technology'],
            dimensions: [{ width: '295 mm', height: '199 mm', depth: '13.9 mm', weight: '1.17 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-asus',
    name: 'ASUS',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/1200px-ASUS_Logo.svg.png',
    categories: [
      {
        id: 'c-asus-gaming',
        name: 'Laptop',
        icon: 'Laptop',
        products: [
          {
            id: 'p-rog-g14',
            sku: 'ASU-ROG-G14',
            name: 'ROG Zephyrus G14',
            description: 'The world\'s most powerful 14-inch Windows 11 gaming laptop. Portable and powerful.',
            specs: { 'GPU': 'RTX 4060', 'Display': 'ROG Nebula HDR 165Hz', 'Storage': '1TB NVMe' },
            features: ['AniMe Matrix display', 'Liquid metal cooling', 'Lightweight chassis'],
            dimensions: [{ width: '312 mm', height: '227 mm', depth: '19.5 mm', weight: '1.72 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-garmin',
    name: 'Garmin',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Garmin_logo.svg/1200px-Garmin_logo.svg.png',
    categories: [
      {
        id: 'c-garmin-watch',
        name: 'Watch',
        icon: 'Watch',
        products: [
          {
            id: 'p-epix-2',
            sku: 'GAR-EPIX2',
            name: 'Epix (Gen 2)',
            description: 'The premium active smartwatch. Featuring a stunning AMOLED display and built-in maps.',
            specs: { 'Display': '1.3" AMOLED', 'Battery': 'Up to 16 days', 'Memory': '32GB' },
            features: ['Built-in sports apps', 'TOPO mapping', 'Music storage'],
            dimensions: [{ width: '47 mm', height: '47 mm', depth: '14.5 mm', weight: '76 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-sennheiser',
    name: 'Sennheiser',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sennheiser_logo.svg/1280px-Sennheiser_logo.svg.png',
    categories: [
      {
        id: 'c-senn-audio',
        name: 'Headphones',
        icon: 'Headphones',
        products: [
          {
            id: 'p-mom-4',
            sku: 'SEN-MOM4',
            name: 'Momentum 4 Wireless',
            description: 'Unmatched 60-hour battery life and incredible sound quality with personalized listening.',
            specs: { 'Battery': '60 Hours', 'Bluetooth': '5.2', 'Driver': '42mm' },
            features: ['Adaptive Noise Cancellation', 'Smart Pause', 'Built-in EQ'],
            dimensions: [{ width: '160 mm', height: '210 mm', depth: '60 mm', weight: '293 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-nikon',
    name: 'Nikon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nikon_logo.svg/1200px-Nikon_logo.svg.png',
    categories: [
      {
        id: 'c-nikon-cam',
        name: 'Camera',
        icon: 'Box',
        products: [
          {
            id: 'p-nikon-z8',
            sku: 'NIK-Z8',
            name: 'Nikon Z8',
            description: 'The ultimate agile full-frame mirrorless. Video and photo performance in a compact body.',
            specs: { 'Sensor': '45.7MP Stacked CMOS', 'Video': '8.3K/60p', 'AF': 'Subject detection with 3D tracking' },
            features: ['Real-Live Viewfinder', 'ProRes RAW internal', 'Rugged build'],
            dimensions: [{ width: '144 mm', height: '118.5 mm', depth: '83 mm', weight: '910 g' }],
            imageUrl: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-razer',
    name: 'Razer',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/40/Razer_snake_logo.svg/1200px-Razer_snake_logo.svg.png',
    categories: [
      {
        id: 'c-razer-gaming',
        name: 'Laptop',
        icon: 'Laptop',
        products: [
          {
            id: 'p-blade-16',
            sku: 'RAZ-BLD16',
            name: 'Razer Blade 16',
            description: 'Uncompromising power and portability. The most powerful gaming laptop in its class.',
            specs: { 'GPU': 'RTX 4090', 'CPU': 'Intel Core i9-14900HX', 'Display': 'Dual Mode Mini-LED' },
            features: ['CNC aluminum unibody', 'Chroma RGB', 'THX Spatial Audio'],
            dimensions: [{ width: '355 mm', height: '244 mm', depth: '21.9 mm', weight: '2.45 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-sonos',
    name: 'Sonos',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Sonos_logo.svg/1200px-Sonos_logo.svg.png',
    categories: [
      {
        id: 'c-sonos-audio',
        name: 'Headphones',
        icon: 'Headphones',
        products: [
          {
            id: 'p-era-300',
            sku: 'SONO-ERA300',
            name: 'Sonos Era 300',
            description: 'Feel the music. With next-level audio that hits from every direction, Era 300 doesn’t just surround you, it puts you inside your music.',
            specs: { 'Drivers': '6 Class-D digital amplifiers', 'Connectivity': 'Wi-Fi 6, Bluetooth 5.0', 'Weight': '4.47kg' },
            features: ['Spatial audio with Dolby Atmos', 'Trueplay tuning', 'Apple AirPlay 2'],
            dimensions: [{ width: '260 mm', height: '160 mm', depth: '185 mm', weight: '4.47 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'b-nespresso',
    name: 'Nespresso',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nespresso_logo.svg/1200px-Nespresso_logo.svg.png',
    categories: [
      {
        id: 'c-nesp-app',
        name: 'Appliances',
        icon: 'Box',
        products: [
          {
            id: 'p-vertuo-next',
            sku: 'NES-VRTO',
            name: 'Vertuo Next',
            description: 'Centrifusion technology to gently and fully extract all the aromas of your coffee.',
            specs: { 'Cup Sizes': '5 Sizes', 'Heat up': '30 Seconds', 'Water Tank': '1.1 L' },
            features: ['One-touch brewing', 'Automatic capsule ejection', 'Sustainability first'],
            dimensions: [{ width: '142 mm', height: '314 mm', depth: '429 mm', weight: '4 kg' }],
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop'
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
    assets: [
      { id: 'h-1', type: 'image', url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" }
    ],
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
    
    // Migrate Hero
    if (!data.hero) {
        data.hero = { ...DEFAULT_DATA.hero };
    } else {
        if (!data.hero.assets) {
            data.hero.assets = [];
            if (data.hero.backgroundImageUrl) {
                data.hero.assets.push({ id: 'legacy-hero', type: 'image', url: data.hero.backgroundImageUrl });
            }
        }
        if (data.hero.assets.length === 0 && DEFAULT_DATA.hero.assets) {
            data.hero.assets = [...DEFAULT_DATA.hero.assets];
        }
    }

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
