# 📊 Panduan Database Supabase - Aura EV

## 🎯 Ringkasan

Database ini dirancang untuk toko online kendaraan listrik dengan 4 kategori utama:
- **Mobil Listrik** (5 produk)
- **Motor Listrik** (5 produk)
- **Sepeda Listrik** (5 produk)
- **Truk Listrik** (5 produk)

**Total: 20 produk siap dijual**

---

## 📋 Struktur Tabel

### 1. **admin_profiles** - Data Admin yang Login
Menyimpan informasi admin yang bisa login ke dashboard.

**Kolom:**
- `id` - UUID dari Supabase Auth
- `full_name` - Nama lengkap admin
- `email` - Email admin (unique)
- `role` - Role admin (default: 'admin')
- `is_active` - Status aktif/nonaktif
- `created_at`, `updated_at` - Timestamp

**Catatan:** Terintegrasi dengan Supabase Authentication

---

### 2. **categories** - Kategori Kendaraan
4 kategori kendaraan listrik.

**Kolom:**
- `id` - ID kategori
- `name` - Nama kategori (contoh: "Mobil Listrik")
- `slug` - URL-friendly name (contoh: "mobil")
- `image_url` - Gambar kategori
- `created_at` - Timestamp

---

### 3. **products** - Produk Kendaraan
Menyimpan semua produk yang dijual (20 produk).

**Kolom Utama:**
- `id`, `name`, `brand`, `category_id`, `price`
- `images` - Array gambar produk
- `colors` - Array pilihan warna

**Spesifikasi Teknis:**
- `battery_capacity` - Kapasitas baterai (contoh: "82.5 kWh")
- `range_km` - Jarak tempuh (contoh: "650 km")
- `max_speed` - Kecepatan maksimal (contoh: "180 km/h")
- `charging_time` - Waktu charging (contoh: "30 menit")
- `warranty_years` - Garansi dalam tahun
- `year` - Tahun produksi

**Inventory:**
- `stock` - Jumlah stok
- `stock_status` - Status stok (in_stock, low_stock, out_of_stock, pre_order)
- `is_active` - Produk aktif/nonaktif

---

### 4. **orders** - Pesanan Customer
Menyimpan semua pesanan dari customer.

**Kolom:**
- `id`, `order_number` - ID dan nomor order (auto-generated)
- `customer_name`, `customer_email`, `customer_phone`, `address`
- `product_id`, `product_name`, `product_price` - Info produk saat order
- `color` - Warna yang dipilih
- `status` - Status order (pending, confirmed, processing, shipped, delivered, cancelled)
- `payment_status` - Status pembayaran (unpaid, paid, refunded)
- `notes` - Catatan customer
- `admin_notes` - Catatan admin
- `created_at`, `updated_at`

---

### 5. **order_status_history** - Riwayat Perubahan Status Order
Tracking setiap perubahan status order.

**Kolom:**
- `id`, `order_id`
- `status` - Status baru
- `notes` - Catatan perubahan
- `changed_by` - Admin yang mengubah
- `created_at`

---

### 6. **contact_messages** - Pesan dari Form Kontak
Menyimpan pesan dari customer via form kontak.

**Kolom:**
- `id`, `name`, `email`, `phone`
- `product_interest` - Produk yang diminati
- `message` - Isi pesan
- `is_read` - Sudah dibaca atau belum
- `replied_at` - Kapan dibalas
- `created_at`

---

## 🔐 Row Level Security (RLS)

### Public Access (Tanpa Login):
✅ Baca semua kategori
✅ Baca produk yang aktif
✅ Buat order baru
✅ Kirim pesan kontak

### Admin Access (Harus Login):
✅ Lihat dan edit profil sendiri
✅ Kelola semua kategori
✅ Kelola semua produk
✅ Lihat dan update semua order
✅ Lihat riwayat order
✅ Lihat dan update pesan kontak

---

## 🚀 Cara Setup di Supabase

### Step 1: Buat Project Baru
1. Login ke [Supabase](https://supabase.com)
2. Klik "New Project"
3. Isi nama project, database password, region
4. Tunggu project selesai dibuat

### Step 2: Jalankan SQL Script
1. Buka **SQL Editor** di dashboard Supabase
2. Copy semua isi file `init.sql`
3. Paste dan klik **Run**
4. Database siap digunakan!

### Step 3: Setup Authentication (untuk Admin)
1. Buka **Authentication** > **Providers**
2. Enable **Email** provider
3. Buat admin user:
   - Buka **Authentication** > **Users**
   - Klik **Add User**
   - Isi email dan password
   - Setelah user dibuat, tambahkan ke tabel `admin_profiles`:

```sql
INSERT INTO admin_profiles (id, full_name, email, role, is_active)
VALUES (
    'USER_UUID_DARI_AUTH',
    'Nama Admin',
    'admin@auraev.com',
    'admin',
    true
);
```

### Step 4: Dapatkan API Keys
1. Buka **Settings** > **API**
2. Copy:
   - **Project URL**
   - **anon/public key** (untuk frontend)
   - **service_role key** (untuk backend, JANGAN EXPOSE!)

---

## 📝 Contoh Query

### Ambil Semua Produk Mobil
```sql
SELECT p.*, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'mobil' AND p.is_active = true
ORDER BY p.price ASC;
```

### Ambil Order dengan Detail Produk
```sql
SELECT 
    o.*,
    p.name as product_name,
    p.brand,
    c.name as category_name
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC;
```

### Update Stok Produk
```sql
UPDATE products
SET stock = stock - 1,
    stock_status = CASE 
        WHEN stock - 1 <= 0 THEN 'out_of_stock'
        WHEN stock - 1 <= 5 THEN 'low_stock'
        ELSE 'in_stock'
    END
WHERE id = 1;
```

---

## 🎨 Fitur Tambahan yang Sudah Ada

### 1. Auto-Generate Order Number
Order number otomatis dibuat dengan format: `ORD-YYYYMMDD-000001`

### 2. Auto-Update Timestamp
Field `updated_at` otomatis diupdate saat ada perubahan data.

### 3. Indexes untuk Performance
Database sudah dioptimasi dengan indexes pada kolom yang sering diquery.

---

## 💡 Tips Penggunaan

### Untuk Stok Management:
- Set `stock_status` ke `low_stock` jika stok < 5
- Set `stock_status` ke `out_of_stock` jika stok = 0
- Set `stock_status` ke `pre_order` untuk produk yang belum ready

### Untuk Order Management:
- Gunakan `order_status_history` untuk tracking perubahan
- Simpan `product_name` dan `product_price` di order untuk history
- Update `payment_status` terpisah dari `status` order

### Untuk Admin:
- Gunakan Supabase Auth untuk login
- Semua admin harus ada di tabel `admin_profiles`
- Set `is_active = false` untuk nonaktifkan admin tanpa hapus data

---

## 🔄 Maintenance

### Backup Database:
```bash
# Via Supabase Dashboard
Settings > Database > Backups
```

### Monitor Performance:
```bash
# Via Supabase Dashboard
Database > Query Performance
```

---

## 📞 Troubleshooting

### Error: "new row violates row-level security policy"
**Solusi:** Pastikan user sudah login dan ada di tabel `admin_profiles`

### Error: "relation does not exist"
**Solusi:** Jalankan ulang script `init.sql`

### Produk tidak muncul di frontend
**Solusi:** Cek `is_active = true` dan `stock_status != 'out_of_stock'`

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Database Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** Aura EV Team
