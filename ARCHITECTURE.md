# 🏗️ AURA EV - Architecture Documentation

Dokumentasi arsitektur lengkap untuk project AURA EV.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Landing Page (index.html)                               │   │
│  │  • Hero Section                                          │   │
│  │  • Categories Grid                                       │   │
│  │  • Product Catalog                                       │   │
│  │  • Contact Form                                          │   │
│  │  • Order Modal                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin Dashboard (admin.html)                            │   │
│  │  • Statistics                                            │   │
│  │  • Product Management                                    │   │
│  │  • Order Management                                      │   │
│  │  • Contact Messages                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Technologies: HTML5, CSS3, Vanilla JavaScript                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JSON)
                              │ CORS Enabled
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Spring Boot Application (AuraEvApplication.java)        │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Controllers (REST API)                            │ │   │
│  │  │  • CategoryController                              │ │   │
│  │  │  • ProductController                               │ │   │
│  │  │  • OrderController                                 │ │   │
│  │  │  • ContactController                               │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                         │                                │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Repositories (JPA)                                │ │   │
│  │  │  • CategoryRepository                              │ │   │
│  │  │  • ProductRepository                               │ │   │
│  │  │  • OrderRepository                                 │ │   │
│  │  │  • ContactMessageRepository                        │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                         │                                │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Entities (JPA)                                    │ │   │
│  │  │  • Category                                        │ │   │
│  │  │  • Product                                         │ │   │
│  │  │  • Order                                           │ │   │
│  │  │  • ContactMessage                                  │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Features:                                               │   │
│  │  • Input Validation (Bean Validation)                   │   │
│  │  • CORS Configuration                                    │   │
│  │  • JSON Response Wrapper                                │   │
│  │  • Error Handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Technologies: Java 17, Spring Boot 3.2.5, Maven                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JDBC
                              │ PostgreSQL Protocol
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Supabase PostgreSQL                                     │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ categories │  │  products  │  │   orders   │        │   │
│  │  ├────────────┤  ├────────────┤  ├────────────┤        │   │
│  │  │ id         │  │ id         │  │ id         │        │   │
│  │  │ name       │  │ name       │  │ customer_* │        │   │
│  │  │ slug       │  │ category_id│  │ product_id │        │   │
│  │  │ description│  │ price      │  │ color      │        │   │
│  │  │ image_url  │  │ images[]   │  │ address    │        │   │
│  │  │ created_at │  │ colors[]   │  │ status     │        │   │
│  │  └────────────┘  │ stock      │  │ created_at │        │   │
│  │                  │ is_active  │  └────────────┘        │   │
│  │                  │ created_at │                         │   │
│  │                  └────────────┘                         │   │
│  │                                                          │   │
│  │  ┌────────────────────┐                                 │   │
│  │  │ contact_messages   │                                 │   │
│  │  ├────────────────────┤                                 │   │
│  │  │ id                 │                                 │   │
│  │  │ name               │                                 │   │
│  │  │ email              │                                 │   │
│  │  │ phone              │                                 │   │
│  │  │ product_interest   │                                 │   │
│  │  │ message            │                                 │   │
│  │  │ is_read            │                                 │   │
│  │  │ created_at         │                                 │   │
│  │  └────────────────────┘                                 │   │
│  │                                                          │   │
│  │  Features:                                               │   │
│  │  • Row Level Security (RLS)                              │   │
│  │  • Foreign Key Constraints                               │   │
│  │  • Indexes for Performance                               │   │
│  │  • Array Types (images, colors)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Technologies: PostgreSQL 15, Supabase                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. User Views Products

```
User Browser
    │
    │ 1. GET /api/products
    ▼
Frontend (script.js)
    │
    │ 2. HTTP Request
    ▼
Backend (ProductController)
    │
    │ 3. findByIsActiveTrue()
    ▼
Database (products table)
    │
    │ 4. Return data
    ▼
Backend (ProductController)
    │
    │ 5. JSON Response
    ▼
Frontend (script.js)
    │
    │ 6. Render UI
    ▼
User Browser (Display products)
```

### 2. User Creates Order

```
User Browser
    │
    │ 1. Fill form & submit
    ▼
Frontend (script.js)
    │
    │ 2. POST /api/orders
    │    Body: { customerName, email, ... }
    ▼
Backend (OrderController)
    │
    │ 3. Validate input (@Valid)
    ▼
Backend (OrderController)
    │
    │ 4. Check product exists
    ▼
Database (products table)
    │
    │ 5. Product found
    ▼
Backend (OrderController)
    │
    │ 6. Save order
    ▼
Database (orders table)
    │
    │ 7. Order saved
    ▼
Backend (OrderController)
    │
    │ 8. JSON Response (success)
    ▼
Frontend (script.js)
    │
    │ 9. Show toast notification
    ▼
User Browser (Success message)
```

---

## 🗂️ File Structure

```
Projek Aura EV - TESTING/
│
├── 📁 frontend/                    # Frontend Layer
│   ├── 📄 index.html               # Landing page
│   ├── 📄 style.css                # Styling (800+ lines)
│   ├── 📄 script.js                # Logic & API calls (500+ lines)
│   ├── 📄 admin.html               # Admin dashboard
│   ├── 📄 admin-script.js          # Admin logic
│   └── 📁 images/                  # Assets
│       ├── 🖼️ byd-seal-removebg.jpg
│       ├── 🖼️ byd-atto-removebg.png
│       ├── 🖼️ bydhan-removebg.png
│       ├── 🖼️ mobillistrik1.png
│       ├── 🖼️ motorlistrik1.png
│       ├── 🖼️ sepedalistrik1.png
│       ├── 🖼️ truklistrik1.png
│       └── 🎥 sinematik.mp4
│
├── 📁 backend/                     # Backend Layer
│   ├── 📄 pom.xml                  # Maven config
│   └── 📁 src/main/
│       ├── 📁 java/com/auraev/api/
│       │   └── 📄 AuraEvApplication.java  # Single file (700+ lines)
│       │       ├── @SpringBootApplication
│       │       ├── CorsConfig
│       │       ├── ApiResponse<T>
│       │       ├── Entities (4)
│       │       ├── DTOs (2)
│       │       ├── Repositories (4)
│       │       └── Controllers (4)
│       └── 📁 resources/
│           └── 📄 application.properties  # DB config
│
├── 📁 database/                    # Database Layer
│   └── 📄 init.sql                 # Schema + seed (200+ lines)
│       ├── CREATE TABLE categories
│       ├── CREATE TABLE products
│       ├── CREATE TABLE orders
│       ├── CREATE TABLE contact_messages
│       ├── INSERT seed data
│       ├── RLS policies
│       └── CREATE INDEX
│
└── 📁 docs/                        # Documentation
    ├── 📄 README.md                # Main guide
    ├── 📄 QUICK-START.md           # Quick setup
    ├── 📄 DEPLOYMENT.md            # Deploy guide
    ├── 📄 API-TESTING.md           # API testing
    ├── 📄 ARCHITECTURE.md          # This file
    ├── 📄 PROJECT-SUMMARY.md       # Summary
    ├── 📄 CHANGELOG.md             # Version history
    └── 📄 .gitignore               # Git ignore
```

---

## 🔌 API Architecture

### REST API Endpoints (13 total)

```
┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📦 CATEGORIES                                               │
│  ├─ GET    /api/categories          → Get all              │
│  └─ POST   /api/categories          → Create               │
│                                                              │
│  🚗 PRODUCTS                                                 │
│  ├─ GET    /api/products             → Get all active      │
│  ├─ GET    /api/products?category=X  → Filter by category  │
│  ├─ GET    /api/products/{id}        → Get detail          │
│  ├─ POST   /api/products             → Create              │
│  └─ DELETE /api/products/{id}        → Soft delete         │
│                                                              │
│  📋 ORDERS                                                   │
│  ├─ GET    /api/orders               → Get all             │
│  ├─ POST   /api/orders               → Create              │
│  └─ PUT    /api/orders/{id}/status   → Update status       │
│                                                              │
│  ✉️  CONTACT                                                 │
│  ├─ GET    /api/contact              → Get all messages    │
│  └─ POST   /api/contact              → Send message        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data produk",
  "data": [...]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Produk tidak ditemukan",
  "data": null
}
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│   categories    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug (UNIQUE)   │
│ description     │
│ image_url       │
│ created_at      │
└─────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│    products     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ category_id (FK)│───────┐
│ price           │       │
│ description     │       │
│ images[]        │       │
│ colors[]        │       │
│ stock           │       │
│ is_active       │       │
│ created_at      │       │
│ updated_at      │       │
└─────────────────┘       │
         │                │
         │ 1:N            │
         │                │
         ▼                │
┌─────────────────┐       │
│     orders      │       │
├─────────────────┤       │
│ id (PK)         │       │
│ customer_name   │       │
│ customer_email  │       │
│ customer_phone  │       │
│ product_id (FK) │───────┘
│ color           │
│ address         │
│ status          │
│ notes           │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────────┐
│  contact_messages   │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email               │
│ phone               │
│ product_interest    │
│ message             │
│ is_read             │
│ created_at          │
└─────────────────────┘
```

---

## 🔐 Security Architecture

### 1. Input Validation

```
User Input
    │
    │ 1. Frontend validation (HTML5)
    ▼
Frontend
    │
    │ 2. Send to backend
    ▼
Backend (@Valid annotation)
    │
    │ 3. Bean Validation
    │    • @NotBlank
    │    • @Email
    │    • @NotNull
    ▼
Database
```

### 2. Database Security

```
┌─────────────────────────────────────────┐
│  Row Level Security (RLS)               │
├─────────────────────────────────────────┤
│  • categories: Public READ              │
│  • products: Public READ (active only)  │
│  • orders: Public INSERT only           │
│  • contact_messages: Public INSERT only │
└─────────────────────────────────────────┘
```

### 3. CORS Configuration

```java
.allowedOrigins("*")           // Allow all origins
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
.allowedHeaders("*")
```

---

## 🚀 Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────┐
│                    USERS                                 │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CDN / Static Hosting                        │
│         (Netlify / Vercel / Nginx)                       │
│                                                          │
│  Frontend Files:                                         │
│  • index.html                                            │
│  • admin.html                                            │
│  • style.css                                             │
│  • script.js                                             │
│  • admin-script.js                                       │
│  • images/                                               │
└─────────────────────────────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Application Server                          │
│         (VPS / Heroku / AWS EC2)                         │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Nginx (Reverse Proxy)                            │  │
│  │  • SSL Termination                                │  │
│  │  • Load Balancing                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Java Application (Spring Boot)                   │  │
│  │  • Port 8080                                      │  │
│  │  • Systemd Service                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ JDBC
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Database (Supabase)                         │
│  • PostgreSQL 15                                         │
│  • Automatic Backups                                     │
│  • Connection Pooling                                    │
│  • SSL Enabled                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Considerations

### Frontend Optimizations

- ✅ Lazy loading images
- ✅ Skeleton screens
- ✅ Minimal JavaScript (no frameworks)
- ✅ CSS animations with GPU acceleration
- ✅ Debounced API calls

### Backend Optimizations

- ✅ JPA query optimization
- ✅ Database indexes
- ✅ Connection pooling
- ✅ Efficient JSON serialization

### Database Optimizations

- ✅ Indexes on foreign keys
- ✅ Indexes on frequently queried columns
- ✅ Array types for multiple values
- ✅ Proper data types

---

## 🔄 Scalability

### Horizontal Scaling

```
Load Balancer
    │
    ├─── Backend Instance 1
    ├─── Backend Instance 2
    └─── Backend Instance 3
              │
              ▼
         Database (Supabase)
```

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching layer (Redis)

---

## 📝 Notes

- **Single-file backend**: Semua kode backend dalam 1 file untuk simplicity
- **No service layer**: Controller langsung ke Repository
- **Soft delete**: Data tidak benar-benar dihapus (is_active = false)
- **Automatic timestamps**: createdAt & updatedAt otomatis

---

**Last Updated**: 2026-05-25  
**Version**: 1.0.0
