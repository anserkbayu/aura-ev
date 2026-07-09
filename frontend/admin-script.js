// ============================================
// AURA EV - ADMIN DASHBOARD SCRIPT
// ============================================

// Kalau dibuka dari localhost (development di laptop) -> pakai backend lokal.
// Kalau sudah online (hosting) -> pakai URL backend Railway/Render.
// GANTI "URL_BACKEND_RAILWAY_KAMU" di bawah ini setelah backend selesai di-deploy.
const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const API_BASE = isLocal
  ? "http://localhost:8080/api"
  : "https://URL_BACKEND_RAILWAY_KAMU.up.railway.app/api";

// ============================================
// API HELPER
// ============================================

async function fetchAPI(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  // Remove active from all menu items
  document.querySelectorAll(".sidebar-menu li").forEach((item) => {
    item.classList.remove("active");
  });

  // Show selected page
  const page = document.getElementById(`page-${pageName}`);
  if (page) {
    page.classList.remove("hidden");
  }

  // Set active menu item
  event.target.classList.add("active");

  // Load data for the page
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
    const [products, orders, contacts] = await Promise.all([
      fetchAPI("/products"),
      fetchAPI("/orders"),
      fetchAPI("/contact"),
    ]);

    document.getElementById("stat-products").textContent = products.data.length;
    document.getElementById("stat-orders").textContent = orders.data.length;

    const pendingOrders = orders.data.filter(
      (o) =>
        o.status === "PENDING" ||
        o.status === "pending" ||
        o.status === "Pending",
    ).length;
    document.getElementById("stat-pending").textContent = pendingOrders;
    document.getElementById("stat-messages").textContent = contacts.data.length;

    const totalRevenue = orders.data.reduce((sum, o) => {
      const price = o.product?.price || 0;
      const qty = o.quantity || 1;
      return sum + parseFloat(price) * qty;
    }, 0);
    document.getElementById("stat-revenue").textContent = new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      },
    ).format(totalRevenue);

    renderOrdersChart(orders.data);
  } catch (error) {
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
    const key = o.createdAt ? o.createdAt.split("T")[0] : null;
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
    const response = await fetchAPI("/products");
    const products = response.data.slice().sort((a, b) => a.id - b.id);

    tbody.innerHTML = products
      .map(
        (product) => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category.name}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="badge ${product.isActive ? "badge-active" : "badge-inactive"}">
                        ${product.isActive ? "Aktif" : "Non-aktif"}
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
    loading.innerHTML = "<p>Gagal memuat data produk</p>";
    showToast("Gagal memuat produk", "error");
  }
}

async function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) {
    return;
  }

  try {
    await fetchAPI(`/products/${id}`, { method: "DELETE" });
    showToast("Produk berhasil dihapus", "success");
    loadProducts();
  } catch (error) {
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
    const response = await fetchAPI("/orders");
    const orders = response.data.slice().sort((a, b) => a.id - b.id);

    tbody.innerHTML = orders
      .map(
        (order) => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.customerEmail}</td>
                <td>${order.product.name}</td>
                <td>
                    <div style="width:30px;height:30px;background:${order.color};border-radius:50%;border:2px solid #fff;"></div>
                </td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" 
                            style="background:var(--dark-bg);color:white;padding:0.5rem;border:1px solid rgba(255,255,255,0.2);border-radius:5px;">
                        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                        <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                    </select>
                </td>
                <td>${formatDate(order.createdAt)}</td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    loading.innerHTML = "<p>Gagal memuat data pesanan</p>";
    showToast("Gagal memuat pesanan", "error");
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await fetchAPI(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });
    showToast("Status pesanan berhasil diupdate", "success");
  } catch (error) {
    showToast("Gagal mengupdate status", "error");
    loadOrders(); // Reload to reset dropdown
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
    const response = await fetchAPI("/contact");
    const messages = response.data.slice().sort((a, b) => a.id - b.id);

    tbody.innerHTML = messages
      .map(
        (msg) => `
            <tr>
                <td>${msg.id}</td>
                <td>${msg.name}</td>
                <td>${msg.email}</td>
                <td>${msg.productInterest || "-"}</td>
                <td>${truncate(msg.message, 50)}</td>
                <td>${formatDate(msg.createdAt)}</td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
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
    const response = await fetchAPI("/test-drive");
    const data = response.data.slice().sort((a, b) => a.id - b.id);

    tbody.innerHTML = data
      .map(
        (td) => `
            <tr>
                <td>${td.id}</td>
                <td>${td.name}</td>
                <td>${td.email}</td>
                <td>${td.phone}</td>
                <td>${td.productName}</td>
                <td>${formatDate(td.testDriveDate)}</td>
                <td>${td.location}</td>
                <td>
                    <select onchange="updateTestDriveStatus(${td.id}, this.value)"
                            style="background:var(--dark-bg);color:white;padding:0.5rem;border:1px solid rgba(255,255,255,0.2);border-radius:5px;">
                        <option value="Pending" ${td.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${td.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Done" ${td.status === "Done" ? "selected" : ""}>Done</option>
                    </select>
                </td>
            </tr>
        `,
      )
      .join("");

    loading.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    loading.innerHTML = "<p>Gagal memuat data test drive</p>";
    showToast("Gagal memuat test drive", "error");
  }
}

async function updateTestDriveStatus(id, newStatus) {
  try {
    await fetchAPI(`/test-drive/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });
    showToast("Status test drive berhasil diupdate", "success");
  } catch (error) {
    showToast("Gagal mengupdate status", "error");
    loadTestDrive();
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function truncate(str, length) {
  if (!str) return "-";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

// ============================================
// INITIALIZATION
// Note: loadStatistics() dipanggil dari admin.html setelah auth berhasil
// ============================================

async function handleAdminLogout() {
  // Gunakan loading overlay SPA dari admin.html
  if (typeof showLoading === "function") {
    showLoading("LOGGING OUT", "Sampai jumpa lagi...");
  }
  await window.supabase.auth.signOut();
  setTimeout(() => {
    if (typeof hideLoading === "function") hideLoading();
    if (typeof showAuthView === "function") {
      document.getElementById("loginForm") &&
        document.getElementById("loginForm").reset();
      document.getElementById("alertError") &&
        document.getElementById("alertError").classList.remove("show");
      showAuthView();
    }
  }, 1200);
}