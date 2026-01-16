-- Kiosk Pro: Normalized Relational Schema
-- Version: 2.0 (Senior Architect Edition)
-- Target: Supabase (PostgreSQL 15+)

-- Enable UUID extension just in case, though we use TEXT IDs for app compatibility
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CORE INVENTORY
-- ==========================================

-- Brands: Top level hierarchy
CREATE TABLE public.brands (
    id text PRIMARY KEY, -- e.g. "b-apple"
    name text NOT NULL,
    logo_url text,
    theme_color text DEFAULT '#0f172a',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Categories: Belongs to a Brand
CREATE TABLE public.categories (
    id text PRIMARY KEY, -- e.g. "c-iphone"
    brand_id text NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    icon text DEFAULT 'Box', -- Lucide icon name
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Products: The atomic unit
CREATE TABLE public.products (
    id text PRIMARY KEY, -- e.g. "p-iphone15"
    category_id text NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    sku text,
    name text NOT NULL,
    description text,
    
    -- Flexible Data (JSONB)
    specs jsonb DEFAULT '{}'::jsonb,        -- Key-Value pairs e.g. {"Chip": "A17", "RAM": "8GB"}
    features jsonb DEFAULT '[]'::jsonb,     -- Array of strings e.g. ["5G", "OLED"]
    box_contents jsonb DEFAULT '[]'::jsonb, -- Array of strings
    dimensions jsonb DEFAULT '[]'::jsonb,   -- Array of DimensionSet objects
    
    -- Media
    image_url text,                         -- Main hero image
    gallery_urls jsonb DEFAULT '[]'::jsonb, -- Array of strings
    video_urls jsonb DEFAULT '[]'::jsonb,   -- Array of strings (VideoUrl is deprecated in favor of this)
    manuals jsonb DEFAULT '[]'::jsonb,      -- Array of Manual objects {title, pdfUrl, etc}
    
    terms text,                             -- Warranty/Legal text
    date_added timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. MARKETING & CONTENT
-- ==========================================

-- Hero Configuration (Singleton)
CREATE TABLE public.marketing_hero (
    id text PRIMARY KEY DEFAULT 'hero',
    title text DEFAULT 'Welcome',
    subtitle text DEFAULT 'Explore our collection',
    background_image_url text,
    logo_url text,
    website_url text,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT hero_singleton CHECK (id = 'hero')
);

-- Ads & Screensaver Assets
CREATE TABLE public.marketing_ads (
    id text PRIMARY KEY,
    zone_name text NOT NULL, -- 'homeBottomLeft', 'homeBottomRight', 'screensaver'
    type text NOT NULL CHECK (type IN ('image', 'video')),
    url text NOT NULL,
    sort_order int DEFAULT 0,
    date_added timestamptz DEFAULT now()
);

-- Pamphlets / Catalogues
CREATE TABLE public.pamphlets (
    id text PRIMARY KEY,
    title text NOT NULL,
    type text DEFAULT 'pamphlet', -- 'pamphlet' or 'catalogue'
    thumbnail_url text,
    pdf_url text,
    pages jsonb DEFAULT '[]'::jsonb, -- Array of image URLs for Flipbook
    start_date date,
    end_date date,
    year int,
    promo_text text,
    brand_id text REFERENCES public.brands(id) ON DELETE SET NULL, -- Optional link to brand
    created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. PRICING ENGINE
-- ==========================================

-- Independent Pricelist Brands (Decoupled from Inventory Brands)
CREATE TABLE public.pricelist_brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    logo_url text,
    updated_at timestamptz DEFAULT now()
);

-- Pricelists
CREATE TABLE public.pricelists (
    id text PRIMARY KEY,
    brand_id text NOT NULL REFERENCES public.pricelist_brands(id) ON DELETE CASCADE,
    title text NOT NULL,
    month text,
    year text,
    type text DEFAULT 'pdf', -- 'pdf' or 'manual'
    url text,                -- PDF URL
    thumbnail_url text,
    kind text DEFAULT 'standard', -- 'standard' or 'promotion'
    
    -- Promotion specifics
    start_date date,
    end_date date,
    promo_text text,
    
    -- Manual Table Data
    items jsonb DEFAULT '[]'::jsonb,   -- Array of {sku, desc, price}
    headers jsonb DEFAULT '{}'::jsonb, -- Custom header labels
    
    date_added timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 4. TV DISPLAY MODE
-- ==========================================

CREATE TABLE public.tv_brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    logo_url text,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.tv_models (
    id text PRIMARY KEY,
    tv_brand_id text NOT NULL REFERENCES public.tv_brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    image_url text,
    video_urls jsonb DEFAULT '[]'::jsonb, -- Array of video URLs
    updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 5. FLEET MANAGEMENT
-- ==========================================

CREATE TABLE public.kiosks (
    id text PRIMARY KEY, -- "LOC-XXXXX"
    name text NOT NULL,
    status text DEFAULT 'online',
    device_type text DEFAULT 'kiosk', -- 'kiosk', 'mobile', 'tv'
    
    -- Telemetry
    ip_address text,
    wifi_strength int,
    last_seen timestamptz DEFAULT now(),
    version text,
    
    -- Configuration
    assigned_zone text,
    location_description text,
    show_pricelists boolean DEFAULT true,
    restart_requested boolean DEFAULT false,
    notes text
);

-- ==========================================
-- 6. SYSTEM SETTINGS & SECURITY
-- ==========================================

-- Global Config (Singleton)
CREATE TABLE public.system_settings (
    id text PRIMARY KEY DEFAULT 'config',
    setup_pin text DEFAULT '0000',
    company_logo_url text,
    app_icon_url_kiosk text,
    app_icon_url_admin text,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT settings_singleton CHECK (id = 'config')
);

-- Admins
CREATE TABLE public.admins (
    id text PRIMARY KEY,
    name text NOT NULL,
    pin text NOT NULL, -- In production, hash this. For Kiosk app, plain text is often used for simplicity.
    is_super_admin boolean DEFAULT false,
    permissions jsonb DEFAULT '{}'::jsonb, -- { inventory: true, fleet: false, ... }
    created_at timestamptz DEFAULT now()
);

-- About Page (Singleton)
CREATE TABLE public.about_page (
    id text PRIMARY KEY DEFAULT 'about',
    title text DEFAULT 'About Us',
    text text,
    audio_url text,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT about_singleton CHECK (id = 'about')
);

-- Screensaver Config (Singleton)
CREATE TABLE public.screensaver_settings (
    id text PRIMARY KEY DEFAULT 'saver',
    idle_timeout int DEFAULT 60,
    image_duration int DEFAULT 8,
    mute_videos boolean DEFAULT false,
    
    -- Toggles
    show_product_images boolean DEFAULT true,
    show_product_videos boolean DEFAULT true,
    show_pamphlets boolean DEFAULT true,
    show_custom_ads boolean DEFAULT true,
    show_info_overlay boolean DEFAULT true,
    
    -- Sleep Mode
    enable_sleep_mode boolean DEFAULT false,
    active_hours_start text DEFAULT '08:00',
    active_hours_end text DEFAULT '20:00',
    
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT saver_singleton CHECK (id = 'saver')
);

-- ==========================================
-- 7. AUDIT LOGS
-- ==========================================

CREATE TABLE public.audit_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type text NOT NULL, -- 'product', 'brand', 'kiosk'
    entity_id text,
    action text NOT NULL, -- 'create', 'update', 'delete', 'restore'
    actor_name text DEFAULT 'System',
    payload jsonb, -- Snapshot of data involved
    timestamp timestamptz DEFAULT now()
);

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS) - PUBLIC ACCESS
-- ==========================================
-- Since this is a kiosk app often running without individual user auth,
-- we enable public read/write access protected by the application layer (PINs).

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pamphlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelist_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screensaver_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to create policies
DO $$ 
DECLARE 
    tbl text; 
BEGIN 
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS "Public Access" ON public.%I', tbl); 
        EXECUTE format('CREATE POLICY "Public Access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl); 
    END LOOP; 
END $$;

-- ==========================================
-- 9. INITIAL DATA SEED
-- ==========================================

-- Initialize Singletons
INSERT INTO public.marketing_hero (id) VALUES ('hero') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (id) VALUES ('config') ON CONFLICT DO NOTHING;
INSERT INTO public.about_page (id) VALUES ('about') ON CONFLICT DO NOTHING;
INSERT INTO public.screensaver_settings (id) VALUES ('saver') ON CONFLICT DO NOTHING;

-- Default Admin
INSERT INTO public.admins (id, name, pin, is_super_admin, permissions)
VALUES ('super-admin', 'Admin', '1723', true, 
'{"inventory":true,"marketing":true,"tv":true,"screensaver":true,"fleet":true,"history":true,"settings":true,"pricelists":true}'::jsonb)
ON CONFLICT DO NOTHING;
