# 🚗 AURA EV - Premium Electric Vehicle Marketplace

Website marketplace kendaraan listrik premium Indonesia dengan backend Java Spring Boot dan database Supabase PostgreSQL.

## 📋 Fitur Utama

### Frontend
- ✅ Hero section dengan video background
- ✅ Grid kategori kendaraan (Mobil, Motor, Sepeda, Truk)
- ✅ Katalog produk dengan slider interaktif
- ✅ Color picker untuk setiap model
- ✅ Form pemesanan dengan modal
- ✅ Form kontak
- ✅ Mobile responsive dengan hamburger menu
- ✅ Toast notification
- ✅ Loading states & skeleton screens
- ✅ Lazy loading images

### Backend (Java Spring Boot)
- ✅ REST API lengkap
- ✅ CRUD Categories
- ✅ CRUD Products
- ✅ Order management
- ✅ Contact messages
- ✅ CORS configuration
- ✅ Input validation
- ✅ PostgreSQL integration

### Database (Supabase)
- ✅ 4 tabel: categories, products, orders, contact_messages
- ✅ Row Level Security (RLS)
- ✅ Seed data awal
- ✅ Indexes untuk performa

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Java 17, Spring Boot 3.2.5
- **Database**: Supabase PostgreSQL
- **Build Tool**: Maven

## 📁 Struktur Folder

```
Projek Aura EV - TESTING/
│
├── frontend/
│   ├── index.html          # Halaman utama
│   ├── style.css           # Styling lengkap
│   ├── script.js           # Logic & API integration
│   └── images/             # Asset gambar & video
│
├── backend/
│   ├── pom.xml             # Maven dependencies
│   └── src/main/
│       ├── java/com/auraev/api/
│       │   └── AuraEvApplication.java   # Single file backend
│       └── resources/
│           └── application.properties   # Database config
│
└── database/
    └── init.sql            # SQL schema & seed data
```

## 🚀 Cara Menjalankan

### 1. Setup Database (Supabase)

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Buka **SQL Editor**
4. Copy-paste isi file `database/init.sql`
5. Jalankan SQL script
6. Catat **Database URL**, **Username**, dan **Password**

### 2. Konfigurasi Backend

Edit file `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_SUPABASE_PASSWORD
```

Ganti:
- `YOUR_PROJECT_REF` dengan project reference Supabase Anda
- `YOUR_SUPABASE_PASSWORD` dengan password database Anda

### 3. Jalankan Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend akan berjalan di `http://localhost:8080`

**Test API:**
```bash
# Test get products
curl http://localhost:8080/api/products

# Test get categories
curl http://localhost:8080/api/categories
```

### 4. Jalankan Frontend

Buka file `frontend/index.html` di browser, atau gunakan live server:

```bash
cd frontend
# Jika punya Python
python -m http.server 3000

# Jika punya Node.js
npx http-server -p 3000
```

Frontend akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Products
- `GET /api/products` - Get all active products
- `GET /api/products?category=mobil` - Filter by category
- `GET /api/products/{id}` - Get product detail
- `POST /api/products` - Create product
- `DELETE /api/products/{id}` - Soft delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}/status` - Update order status

### Contact
- `GET /api/contact` - Get all messages
- `POST /api/contact` - Send message

## 📝 API Request Examples

### Create Order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "081234567890",
    "productId": 1,
    "color": "#1a1a1a",
    "address": "Jakarta",
    "notes": "Kirim pagi"
  }'
```

### Send Contact Message
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "081234567890",
    "productInterest": "BYD Seal AWD",
    "message": "Saya tertarik dengan produk ini"
  }'
```

## 🎨 Design System

### Colors
- Primary: `#4a90d9` (Blue)
- Dark BG: `#0a0a0a`
- Dark Card: `#1a1a1a`
- Text Light: `#ffffff`
- Text Gray: `#a0a0a0`

### Fonts
- Headings: **Bebas Neue**
- Body: **Barlow**

## 🔧 Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan URL Supabase sudah benar
- Cek username dan password
- Pastikan RLS policy sudah diaktifkan di Supabase

### Frontend tidak bisa fetch data
- Pastikan backend sudah running di port 8080
- Cek CORS configuration
- Buka browser console untuk lihat error

### Gambar tidak muncul
- Pastikan file gambar ada di folder `frontend/images/`
- Cek path gambar di database seed data
- Gunakan relative path, bukan absolute

## 📦 Dependencies

### Backend (pom.xml)
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- PostgreSQL Driver

### Frontend
- No external dependencies (Vanilla JS)

## 🚧 Pengembangan Selanjutnya

- [ ] Admin dashboard untuk CRUD produk
- [ ] Authentication & authorization
- [ ] Payment gateway integration
- [ ] Email notification
- [ ] Product comparison feature
- [ ] Wishlist functionality
- [ ] Advanced search & filter
- [ ] Product reviews & ratings

## 📄 License

© 2026 AURA EV. All rights reserved.

## 👨‍💻 Developer

Dibuat mengikuti spesifikasi dari dokumen **AURA-EV-Prompt-Lengkap.md**

---

**Happy Coding! 🚀**
