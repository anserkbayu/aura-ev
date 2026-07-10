# 🚀 Tutorial Hosting Frontend AURA EV di Firebase (Tanpa Java Backend)

Panduan ini menjelaskan bagaimana cara menghosting website **AURA EV** menggunakan **Firebase Hosting** tanpa perlu menjalankan atau mendeploy backend Java (Spring Boot). 

## 💡 Mengapa Bisa Tanpa Java Backend?
Aplikasi frontend AURA EV pada dasarnya dibuat menggunakan HTML, CSS, dan JavaScript statis. Di sisi lain, database yang digunakan adalah **Supabase**.
- Supabase menyediakan API client langsung (menggunakan `supabase-js`) yang memungkinkan frontend berinteraksi dengan database secara aman menggunakan **Row Level Security (RLS)**.
- Landing page utama (`index.html` & `script.js`) Anda **sudah** terhubung langsung ke Supabase secara client-side.
- Untuk halaman dashboard admin (`admin.html`), awalnya ia menggunakan perantara backend Java (`admin-script.js`). Namun, kita bisa mengubah `admin-script.js` agar langsung memanggil database Supabase via JavaScript, sama seperti halaman landing page.
- Dengan cara ini, Anda tidak perlu mengeluarkan biaya atau repot menjalankan server Java di Railway/Render/VPS!

---

## 🛠️ Langkah 1: Buat Tabel Test Drive di Supabase (Jika Belum Ada)

Karena kita tidak memakai Java Spring Boot (yang biasanya membuat tabel otomatis menggunakan Hibernate), pastikan tabel `test_drive_requests` sudah dibuat di Supabase Anda.

Jalankan perintah SQL berikut di **Supabase Dashboard → SQL Editor → New Query**:

```sql
-- Buat Tabel Test Drive Requests
CREATE TABLE IF NOT EXISTS test_drive_requests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(200),
    test_drive_date DATE NOT NULL,
    location VARCHAR(200) DEFAULT 'Dealer AURA EV - Jakarta',
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aktifkan RLS
ALTER TABLE test_drive_requests ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan RLS (Security Policies)
CREATE POLICY "Public can insert test drive requests" 
ON test_drive_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view test drive requests" 
ON test_drive_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can update test drive requests" 
ON test_drive_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
);

-- Buat Index untuk performa
CREATE INDEX IF NOT EXISTS idx_test_drive_status ON test_drive_requests(status);
```

---

## 🔄 Langkah 2: Ubah `admin-script.js` agar Berbicara Langsung ke Supabase

Untuk melepaskan ketergantungan dari Java backend, ganti seluruh isi file `frontend/admin-script.js` dengan kode berikut yang menggunakan SDK Supabase langsung:

```javascript
// ============================================
// AURA EV - ADMIN DASHBOARD SCRIPT (SUPABASE DIRECT VERSION)
// ============================================

// Helper untuk format mata uang IDR
function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

// Helper untuk format tanggal
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Helper untuk membatasi panjang teks
function truncate(str, length) {
  if (!str) return "-";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(pageName) {
  // Sembunyikan semua halaman
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  // Hapus kelas aktif dari menu sidebar
  document.querySelectorAll(".sidebar-menu li").forEach((item) => {
    item.classList.remove("active");
  });

  // Tampilkan halaman terpilih
  const page = document.getElementById(`page-${pageName}`);
  if (page) {
    page.classList.remove("hidden");
  }

  // Set item menu aktif
  if (event && event.target) {
    event.target.classList.add("active");
  }

  // Muat data untuk halaman yang dibuka
  switch (pageName) {
    case "statistik":
      loadStatistics();
      break;
    case "produk":
      loadProducts();
      break;
    case "pesanan":
      loadOrders();
      break;
    case "kontak":
      loadContactMessages();
      break;
    case "testdrive":
      loadTestDrive();
      break;
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// STATISTICS
// ============================================
async function loadStatistics() {
  try {
    // Ambil data produk aktif, semua pesanan, dan pesan kontak langsung dari Supabase
    const [productsRes, ordersRes, contactsRes] = await Promise.all([
      window.supabase.from("products").select("*").eq("is_active", true),
      window.supabase.from("orders").select("*, product:products(price)"),
      window.supabase.from("contact_messages").select("*")
    ]);

    if (productsRes.error) throw productsRes.error;
    if (ordersRes.error) throw ordersRes.error;
    if (contactsRes.error) throw contactsRes.error;

    const products = productsRes.data;
    const orders = ordersRes.data;
    const contacts = contactsRes.data;

    document.getElementById("stat-products").textContent = products.length;
    document.getElementById("stat-orders").textContent = orders.length;

    const pendingOrders = orders.filter(
      (o) => o.status?.toLowerCase() === "pending"
    ).length;
    
    document.getElementById("stat-pending").textContent = pendingOrders;
    document.getElementById("stat-messages").textContent = contacts.length;

    // Hitung total pendapatan
    const totalRevenue = orders.reduce((sum, o) => {
      const price = o.product_price || o.product?.price || 0;
      return sum + parseFloat(price);
    }, 0);

    document.getElementById("stat-revenue").textContent = formatPrice(totalRevenue);

    renderOrdersChart(orders);
  } catch (error) {
    console.error("Gagal memuat statistik:", error);
    showToast("Gagal memuat statistik", "error");
  }
}

function renderOrdersChart(orders) {
  const labels = [];
  const counts = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    labels.push(label);
    counts[key] = 0;
  }

  orders.forEach((o) => {
    const key = o.created_at ? o.created_at.split("T")[0] : null;
    if (key && counts[key] !== undefined) counts[key]++;
  });

  const data = Object.values(counts);

  if (window._ordersChart) window._ordersChart.destroy();

  const ctx = document.getElementById("ordersChart").getContext("2d");
  window._ordersChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Pesanan Masuk",
          data,
          borderColor: "#4a90d9",
          backgroundColor: "rgba(74,144,217,0.1)",
          borderWidth: 2,
          pointBackgroundColor: "#4a90d9",
          pointRadius: 5,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#a0a0a0" } },
      },
      scales: {
        x: {
          ticks: { color: "#a0a0a0" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          ticks: { color: "#a0a0a0", stepSize: 1 },
          grid: { color: "rgba(255,255,255,0.05)" },
          beginAtZero: true,
        },
      },
    },
  });
}

// ============================================
// PRODUCTS
// ============================================
async function loadProducts() {
  const loading = document.getElementById("loading-produk");
  const table = document.getElementById("table-produk");
  const tbody = document.getElementById("tbody-produk");

  loading.classList.remove("hidden");
  table.classList.add("hidden");

  try {
    const { data: products, error } = await window.supabase
      .from("products")
      .select("*, categories(name)")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) throw error;

    tbody.innerHTML = products
      .map(
        (product) => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.categories?.name || "-"}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="badge ${product.is_active ? "badge-active" : "badge-inactive"}">
                        ${product.is_active ? "Aktif" : "Non-aktif"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                        Hapus
                    </button>
                </td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    console.error("Gagal memuat produk:", error);
    loading.innerHTML = "<p>Gagal memuat data produk</p>";
    showToast("Gagal memuat produk", "error");
  }
}

async function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) {
    return;
  }

  try {
    // Soft delete: ubah status is_active menjadi false
    const { error } = await window.supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    showToast("Produk berhasil dihapus", "success");
    loadProducts();
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    showToast("Gagal menghapus produk", "error");
  }
}

// ============================================
// ORDERS
// ============================================
async function loadOrders() {
  const loading = document.getElementById("loading-pesanan");
  const table = document.getElementById("table-pesanan");
  const tbody = document.getElementById("tbody-pesanan");

  loading.classList.remove("hidden");
  table.classList.add("hidden");

  try {
    const { data: orders, error } = await window.supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    tbody.innerHTML = orders
      .map(
        (order) => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.customer_email}</td>
                <td>${order.product_name}</td>
                <td>
                    <div style="width:30px;height:30px;background:${order.color};border-radius:50%;border:2px solid #fff;"></div>
                </td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" 
                            style="background:var(--dark-bg);color:white;padding:0.5rem;border:1px solid rgba(255,255,255,0.2);border-radius:5px;">
                        <option value="Pending" ${order.status === "Pending" || order.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${order.status === "Confirmed" || order.status === "confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Shipped" ${order.status === "Shipped" || order.status === "shipped" ? "selected" : ""}>Shipped</option>
                        <option value="Delivered" ${order.status === "Delivered" || order.status === "delivered" ? "selected" : ""}>Delivered</option>
                    </select>
                </td>
                <td>${formatDate(order.created_at)}</td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    console.error("Gagal memuat pesanan:", error);
    loading.innerHTML = "<p>Gagal memuat data pesanan</p>";
    showToast("Gagal memuat pesanan", "error");
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const { error } = await window.supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) throw error;

    showToast("Status pesanan berhasil diupdate", "success");
  } catch (error) {
    console.error("Gagal mengupdate status pesanan:", error);
    showToast("Gagal mengupdate status", "error");
    loadOrders();
  }
}

// ============================================
// CONTACT MESSAGES
// ============================================
async function loadContactMessages() {
  const loading = document.getElementById("loading-kontak");
  const table = document.getElementById("table-kontak");
  const tbody = document.getElementById("tbody-kontak");

  loading.classList.remove("hidden");
  table.classList.add("hidden");

  try {
    const { data: messages, error } = await window.supabase
      .from("contact_messages")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    tbody.innerHTML = messages
      .map(
        (msg) => `
            <tr>
                <td>${msg.id}</td>
                <td>${msg.name}</td>
                <td>${msg.email}</td>
                <td>${msg.product_interest || "-"}</td>
                <td>${truncate(msg.message, 50)}</td>
                <td>${formatDate(msg.created_at)}</td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    console.error("Gagal memuat pesan kontak:", error);
    loading.innerHTML = "<p>Gagal memuat data pesan kontak</p>";
    showToast("Gagal memuat pesan kontak", "error");
  }
}

// ============================================
// TEST DRIVE
// ============================================
async function loadTestDrive() {
  const loading = document.getElementById("loading-testdrive");
  const table = document.getElementById("table-testdrive");
  const tbody = document.getElementById("tbody-testdrive");

  loading.classList.remove("hidden");
  table.classList.add("hidden");

  try {
    const { data, error } = await window.supabase
      .from("test_drive_requests")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    tbody.innerHTML = data
      .map(
        (td) => `
            <tr>
                <td>${td.id}</td>
                <td>${td.name}</td>
                <td>${td.email}</td>
                <td>${td.phone}</td>
                <td>${td.product_name}</td>
                <td>${formatDate(td.test_drive_date)}</td>
                <td>${td.location}</td>
                <td>
                    <select onchange="updateTestDriveStatus(${td.id}, this.value)"
                            style="background:var(--dark-bg);color:white;padding:0.5rem;border:1px solid rgba(255,255,255,0.2);border-radius:5px;">
                        <option value="Pending" ${td.status === "Pending" || td.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${td.status === "Confirmed" || td.status === "confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Done" ${td.status === "Done" || td.status === "done" ? "selected" : ""}>Done</option>
                    </select>
                </td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    console.error("Gagal memuat test drive:", error);
    loading.innerHTML = "<p>Gagal memuat data test drive</p>";
    showToast("Gagal memuat test drive", "error");
  }
}

async function updateTestDriveStatus(id, newStatus) {
  try {
    const { error } = await window.supabase
      .from("test_drive_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) throw error;

    showToast("Status test drive berhasil diupdate", "success");
  } catch (error) {
    console.error("Gagal mengupdate status test drive:", error);
    showToast("Gagal mengupdate status", "error");
    loadTestDrive();
  }
}
```

---

## 🌐 Langkah 3: Hosting ke Firebase Hosting

Berikut adalah langkah-langkah untuk mendeploy folder `frontend` ke Firebase Hosting.

### 1. Install Firebase CLI
Pastikan Anda sudah memiliki Node.js terinstal. Buka Command Prompt / PowerShell, lalu jalankan perintah berikut untuk menginstal Firebase CLI secara global:

```bash
npm install -g firebase-tools
```

### 2. Login ke Akun Firebase Anda
Jalankan perintah ini untuk melakukan login melalui browser:

```bash
firebase login
```

### 3. Masuk ke Direktori Project Aura EV
Arahkan terminal ke root folder project Anda (tempat folder `frontend` berada):

```bash
cd "c:\Users\HP\Desktop\Projek Aura EV - AkhirnyaDone"
```

### 4. Inisialisasi Firebase di Project Anda
Jalankan perintah inisialisasi:

```bash
firebase init hosting
```

Akan muncul beberapa pilihan/pertanyaan di terminal, jawab seperti berikut:
1. **Project Setup**: Pilih **`Use an existing project`** (jika Anda sudah membuat project di konsol Firebase) atau **`Create a new project`** (untuk membuat project baru).
2. **What do you want to use as your public directory?**: Ketik **`frontend`** (karena semua file HTML/CSS/JS statis berada di dalam folder `frontend`).
3. **Configure as a single-page app (rewrite all urls to /index.html)?**: Pilih **`No`** (karena kita memiliki file HTML terpisah untuk admin seperti `admin.html`).
4. **Set up automatic builds and deploys with GitHub?**: Pilih **`No`**.

Perintah ini akan menghasilkan file konfigurasi `firebase.json` dan `.firebaserc` di root folder project Anda.

### 5. Konfigurasi `firebase.json` (Opsional tapi Direkomendasikan)
Buka file `firebase.json` yang baru terbentuk di root project, pastikan isinya mirip seperti berikut untuk memastikan folder `frontend` dideploy dengan benar:

```json
{
  "hosting": {
    "public": "frontend",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

### 6. Jalankan Deploy
Untuk mulai mendeploy website Anda ke internet, jalankan perintah:

```bash
firebase deploy
```

Setelah proses deploy selesai, Firebase CLI akan menampilkan **Hosting URL** tempat website Anda aktif secara online. Contoh:
`https://nama-project-anda.web.app` atau `https://nama-project-anda.firebaseapp.com`

---

## 🧪 Langkah 4: Uji Coba

1. Buka URL Hosting yang diberikan oleh Firebase di browser.
2. Coba kirim pesan melalui form kontak atau lakukan pesanan mobil di halaman utama.
3. Buka halaman admin di `https://nama-project-anda.web.app/admin.html`.
4. Login menggunakan email dan password admin Anda.
5. Periksa apakah data statistik, daftar produk, pesanan masuk, pesan kontak, dan test drive muncul dengan benar.
6. Coba ubah status salah satu pesanan untuk menguji koneksi tulis ke Supabase.

**Selamat!** Website AURA EV Anda sekarang berhasil dihosting di Firebase secara gratis, cepat, dan sepenuhnya berjalan secara serverless langsung berkomunikasi dengan Supabase tanpa memerlukan backend Java!
