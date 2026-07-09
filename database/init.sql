-- ============================================
-- AURA EV Database Schema for Supabase
-- ============================================

-- Drop tables if exists (untuk development)
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- ============================================
-- 1. ADMIN PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    price DECIMAL(15,2) NOT NULL,
    images TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    
    -- Spesifikasi Teknis
    battery_capacity VARCHAR(50),
    range_km VARCHAR(50),
    max_speed VARCHAR(50),
    charging_time VARCHAR(100),
    warranty_years INTEGER,
    year INTEGER,
    
    -- Inventory
    stock INTEGER DEFAULT 0,
    stock_status VARCHAR(50) DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock, pre_order
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE, -- Diubah jadi nullable sementara karena digenerate via trigger BEFORE INSERT
    
    -- Customer Info
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    address TEXT,
    
    -- Product Info
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(15,2) NOT NULL,
    color VARCHAR(100),
    
    -- Order Status
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    
    notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. ORDER STATUS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES admin_profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    product_interest VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA: CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, image_url) VALUES
('Mobil Listrik', 'mobil', 'images/mobillistrik1.png'),
('Motor Listrik', 'motor', 'images/motorlistrik1.png'),
('Sepeda Listrik', 'sepeda', 'images/sepedalistrik1.png'),
('Truk Listrik', 'truk', 'images/truklistrik1.png')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: PRODUCTS
-- ============================================
INSERT INTO products (name, brand, category_id, price, images, colors, battery_capacity, range_km, max_speed, charging_time, warranty_years, year, stock, stock_status) VALUES
-- MOBIL LISTRIK
('BYD Seal AWD', 'BYD', (SELECT id FROM categories WHERE slug = 'mobil'), 899000000, ARRAY['images/byd-seal-removebg.jpg', 'images/byd-seal.jpg'], ARRAY['Hitam Metalik', 'Putih Mutiara', 'Biru Atlantik', 'Abu-abu Titanium'], '82.5 kWh', '650 km', '180 km/h', '30 menit (DC fast charging)', 6, 2024, 15, 'in_stock'),
('BYD Atto 3', 'BYD', (SELECT id FROM categories WHERE slug = 'mobil'), 549000000, ARRAY['images/byd-atto-removebg.png'], ARRAY['Merah Passion', 'Putih Mutiara', 'Hitam Metalik', 'Biru Elektrik'], '60.48 kWh', '480 km', '160 km/h', '45 menit (DC fast charging)', 6, 2024, 20, 'in_stock'),
('BYD Han EV', 'BYD', (SELECT id FROM categories WHERE slug = 'mobil'), 1250000000, ARRAY['images/bydhan-removebg.png'], ARRAY['Hitam Midnight', 'Putih Mutiara', 'Silver Prestige'], '85.4 kWh', '605 km', '185 km/h', '25 menit (DC fast charging)', 6, 2024, 10, 'in_stock'),
('Tesla Model 3', 'Tesla', (SELECT id FROM categories WHERE slug = 'mobil'), 750000000, ARRAY['images/tesla-model3.jpg'], ARRAY['Putih Pearl', 'Hitam Solid', 'Biru Midnight', 'Merah Multi-Coat'], '75 kWh', '580 km', '225 km/h', '30 menit (Supercharger)', 4, 2024, 8, 'in_stock'),
('Hyundai Ioniq 5', 'Hyundai', (SELECT id FROM categories WHERE slug = 'mobil'), 650000000, ARRAY['images/ioniq5.jpg'], ARRAY['Putih Phantom', 'Hitam Midnight', 'Silver Metalik', 'Biru Teal'], '72.6 kWh', '481 km', '185 km/h', '18 menit (350kW charging)', 5, 2024, 12, 'in_stock'),

-- MOTOR LISTRIK
('Gesits G1', 'Gesits', (SELECT id FROM categories WHERE slug = 'motor'), 25000000, ARRAY['images/gesits-g1.jpg'], ARRAY['Merah', 'Putih', 'Hitam', 'Biru'], '3.24 kWh', '100 km', '70 km/h', '4-5 jam', 2, 2024, 30, 'in_stock'),
('Volta 401', 'Volta', (SELECT id FROM categories WHERE slug = 'motor'), 18000000, ARRAY['images/volta-401.jpg'], ARRAY['Hitam', 'Putih', 'Merah', 'Abu-abu'], '2.88 kWh', '80 km', '60 km/h', '3-4 jam', 2, 2024, 25, 'in_stock'),
('Selis E-Max', 'Selis', (SELECT id FROM categories WHERE slug = 'motor'), 15000000, ARRAY['images/selis-emax.jpg'], ARRAY['Merah', 'Biru', 'Hitam'], '2.4 kWh', '70 km', '55 km/h', '4 jam', 2, 2024, 35, 'in_stock'),
('Viar Q1', 'Viar', (SELECT id FROM categories WHERE slug = 'motor'), 22000000, ARRAY['images/viar-q1.jpg'], ARRAY['Putih', 'Hitam', 'Silver'], '3.0 kWh', '90 km', '65 km/h', '3-4 jam', 2, 2024, 20, 'in_stock'),
('United T-1800', 'United', (SELECT id FROM categories WHERE slug = 'motor'), 19500000, ARRAY['images/united-t1800.jpg'], ARRAY['Hitam', 'Merah', 'Putih'], '2.7 kWh', '85 km', '60 km/h', '4 jam', 2, 2024, 28, 'in_stock'),

-- SEPEDA LISTRIK
('Polygon Path E5', 'Polygon', (SELECT id FROM categories WHERE slug = 'sepeda'), 12000000, ARRAY['images/polygon-pathe5.jpg'], ARRAY['Hitam', 'Abu-abu'], '0.5 kWh', '50 km', '25 km/h', '3 jam', 1, 2024, 40, 'in_stock'),
('United E-Bike', 'United', (SELECT id FROM categories WHERE slug = 'sepeda'), 8500000, ARRAY['images/united-ebike.jpg'], ARRAY['Merah', 'Biru', 'Hitam'], '0.36 kWh', '40 km', '25 km/h', '2-3 jam', 1, 2024, 50, 'in_stock'),
('Selis Butterfly', 'Selis', (SELECT id FROM categories WHERE slug = 'sepeda'), 6500000, ARRAY['images/selis-butterfly.jpg'], ARRAY['Pink', 'Putih', 'Biru'], '0.3 kWh', '35 km', '25 km/h', '2 jam', 1, 2024, 45, 'in_stock'),
('Viar Razor', 'Viar', (SELECT id FROM categories WHERE slug = 'sepeda'), 9500000, ARRAY['images/viar-razor.jpg'], ARRAY['Hitam', 'Silver'], '0.48 kWh', '45 km', '25 km/h', '3 jam', 1, 2024, 35, 'in_stock'),
('Pacific E-Bike Pro', 'Pacific', (SELECT id FROM categories WHERE slug = 'sepeda'), 11000000, ARRAY['images/pacific-ebike.jpg'], ARRAY['Hitam', 'Putih', 'Merah'], '0.52 kWh', '55 km', '25 km/h', '3 jam', 1, 2024, 30, 'in_stock'),

-- TRUK LISTRIK
('Hino Dutro EV', 'Hino', (SELECT id FROM categories WHERE slug = 'truk'), 850000000, ARRAY['images/hino-dutro-ev.jpg'], ARRAY['Putih'], '150 kWh', '200 km', '90 km/h', '2 jam (DC fast charging)', 3, 2024, 5, 'in_stock'),
('Mitsubishi eCanter', 'Mitsubishi', (SELECT id FROM categories WHERE slug = 'truk'), 920000000, ARRAY['images/mitsubishi-ecanter.jpg'], ARRAY['Putih', 'Silver'], '170 kWh', '220 km', '95 km/h', '1.5 jam (DC fast charging)', 3, 2024, 4, 'in_stock'),
('BYD T3', 'BYD', (SELECT id FROM categories WHERE slug = 'truk'), 780000000, ARRAY['images/byd-t3.jpg'], ARRAY['Putih'], '140 kWh', '180 km', '85 km/h', '2 jam (DC fast charging)', 3, 2024, 6, 'in_stock'),
('Isuzu ELF EV', 'Isuzu', (SELECT id FROM categories WHERE slug = 'truk'), 890000000, ARRAY['images/isuzu-elf-ev.jpg'], ARRAY['Putih', 'Biru'], '160 kWh', '210 km', '90 km/h', '1.8 jam (DC fast charging)', 3, 2024, 5, 'in_stock'),
('Foton Aumark EV', 'Foton', (SELECT id FROM categories WHERE slug = 'truk'), 750000000, ARRAY['images/foton-aumark.jpg'], ARRAY['Putih'], '135 kWh', '190 km', '85 km/h', '2 jam (DC fast charging)', 3, 2024, 7, 'in_stock');
-- Klausa ON CONFLICT DO NOTHING dihapus karena tidak ada constraint unique non-id pada tabel products.

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- REPARASI: Menggunakan nextval dari sequence agar ID bisa terbaca sebelum data masuk ke tabel
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_id BIGINT;
BEGIN
    -- Mengambil id berikutnya dari sequence bawaan BIGSERIAL tabel orders
    next_id := nextval('orders_id_seq');
    
    NEW.id := next_id;
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(next_id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-generate order number
CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Admin Profiles Policies
CREATE POLICY "Admins can view own profile" ON admin_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can update own profile" ON admin_profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Products Policies
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Orders Policies
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Order Status History Policies
CREATE POLICY "Admins can view order history" ON order_status_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Admins can insert order history" ON order_status_history FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Contact Messages Policies
CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON contact_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Admins can update contact messages" ON contact_messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- ============================================
-- INDEXES for Performance (Bersih dari duplikasi)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_profiles(email);

-- ============================================
-- COMPLETED
-- ============================================