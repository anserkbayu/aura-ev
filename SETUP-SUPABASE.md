# 🚀 PANDUAN SETUP SUPABASE - AURA EV

## ✅ CHECKLIST SETUP

### 1. Setup Database di Supabase ✅
- [x] Buat project Supabase
- [x] Jalankan `database/init.sql`
- [x] Buat admin user di Authentication
- [x] Tambahkan admin ke `admin_profiles`

### 2. Ambil API Keys 🔑
- [ ] Copy Project URL
- [ ] Copy anon/public key
- [ ] Copy service_role key

### 3. Konfigurasi Frontend 🎨
- [ ] Isi `supabase-config.js` dengan API keys
- [ ] Test koneksi

---

## 📋 LANGKAH DETAIL

### STEP 1: Ambil API Keys dari Supabase

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project **Aura EV**
3. Klik **Settings** (⚙️) di sidebar kiri bawah
4. Klik **API**

#### A. Copy Project URL
Cari bagian **Project URL**, copy URL-nya:
```
https://xxxxxxxx.supabase.co
```

#### B. Copy anon/public key
Scroll ke bawah, cari **Project API keys**, copy yang **`anon`** / **`public`**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```
(Panjang banget, pastikan copy semua!)

#### C. Copy service_role key (untuk backend)
Di bawahnya ada **`service_role`**, copy juga:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

---

### STEP 2: Isi File Konfigurasi

#### A. Isi file `.env`
Buka file `.env` di root project, isi dengan API keys:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

ADMIN_EMAIL=adminaura@gmail.com
ADMIN_PASSWORD=admin123
```

#### B. Isi file `frontend/supabase-config.js`
Buka file `frontend/supabase-config.js`, ganti baris ini:

```javascript
// GANTI INI:
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co'; // Ganti dengan Project URL kamu
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Ganti dengan anon key kamu
```

**Contoh setelah diisi:**
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

---

### STEP 3: Test Koneksi

#### A. Buka index.html di Browser
1. Buka file `frontend/index.html` di browser
2. Buka **Developer Console** (F12)
3. Harusnya muncul: `✅ Supabase connected!`

#### B. Cek Data Produk
Di console, ketik:
```javascript
const { data, error } = await supabaseClient.from('products').select('*').limit(5);
console.log(data);
```

Harusnya muncul 5 produk!

---

### STEP 4: Test Login Admin

1. Buka `frontend/admin.html` di browser
2. Login dengan:
   - **Email**: `adminaura@gmail.com`
   - **Password**: `admin123`
3. Harusnya masuk ke dashboard admin!

---

## 🎯 STRUKTUR FILE

```
Projek Aura EV - TESTING/
├── .env                          # API keys (JANGAN COMMIT!)
├── .env.example                  # Template API keys
├── database/
│   ├── init.sql                  # Database schema
│   └── DATABASE-GUIDE.md         # Panduan database
├── frontend/
│   ├── index.html                # Homepage (sudah ada Supabase)
│   ├── admin.html                # Admin dashboard (sudah ada Supabase)
│   ├── supabase-config.js        # Konfigurasi Supabase ⭐ ISI INI!
│   ├── script.js                 # Frontend logic
│   └── admin-script.js           # Admin logic
└── backend/
    └── (untuk nanti)
```

---

## ⚠️ PENTING!

### Keamanan:
- ✅ **anon/public key** AMAN untuk frontend (boleh di-expose)
- ❌ **service_role key** RAHASIA! Jangan pakai di frontend!
- ❌ Jangan commit file `.env` ke Git!

### File `.gitignore` sudah ada:
```
.env
node_modules/
```

---

## 🔧 TROUBLESHOOTING

### Error: "Supabase is not defined"
**Solusi:** Pastikan script Supabase dimuat sebelum `supabase-config.js`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
```

### Error: "Invalid API key"
**Solusi:** 
1. Cek lagi API key di Supabase Dashboard
2. Pastikan tidak ada spasi atau karakter tambahan
3. Copy ulang dari dashboard

### Produk tidak muncul
**Solusi:**
1. Cek di Supabase Dashboard > Table Editor > products
2. Pastikan ada 20 produk
3. Cek `is_active = true`

### Login admin gagal
**Solusi:**
1. Cek di Supabase Dashboard > Authentication > Users
2. Pastikan user `adminaura@gmail.com` ada
3. Cek di Table Editor > admin_profiles, pastikan email sama

---

## 📞 BANTUAN

Kalau masih ada masalah:
1. Cek console browser (F12) untuk error
2. Cek Supabase Dashboard > Logs
3. Baca `database/DATABASE-GUIDE.md`

---

## ✅ SELESAI!

Kalau semua langkah sudah diikuti:
- ✅ Website bisa fetch data dari Supabase
- ✅ Admin bisa login
- ✅ Data produk muncul di homepage
- ✅ Form order & kontak bisa submit

**Selamat! Website kamu sudah connect ke Supabase!** 🎉

---

**Last Updated:** 2024  
**Version:** 1.0.0
