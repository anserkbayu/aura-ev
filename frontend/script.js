// ============================================
// AURA EV - FRONTEND JAVASCRIPT (SUPABASE VERSION)
// ============================================

// Global State
let currentCarIndex = 0;
let models = [];
let categories = [];
let selectedColor = "";
let cart = [];

// Color Mapping
const colorMap = {
  Hitam: "#1a1a1a",
  "Hitam Metalik": "#2c2c2c",
  "Hitam Midnight": "#0d0d0d",
  "Hitam Solid": "#000000",
  Putih: "#ffffff",
  "Putih Mutiara": "#f5f5f0",
  "Putih Phantom": "#f8f8f8",
  "Putih Pearl": "#f0f0e8",
  Merah: "#cc0000",
  "Merah Passion": "#cc2200",
  "Merah Multi-Coat": "#b22222",
  Biru: "#1a6bc4",
  "Biru Atlantik": "#0077b6",
  "Biru Elektrik": "#0055cc",
  "Biru Midnight": "#003580",
  "Biru Teal": "#008080",
  "Abu-abu": "#808080",
  "Abu-abu Titanium": "#666666",
  Silver: "#c0c0c0",
  "Silver Metalik": "#a8a8a8",
  "Silver Prestige": "#b0b0b0",
  Pink: "#ff69b4",
};

// Get Supabase client from supabase-config.js
// const supabase = window.supabaseClient; // REMOVED - sudah ada di supabase-config.js

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadCart();
  loadOrderHistory();
  initializeApp();
});

async function initializeApp() {
  console.log("🚀 Initializing Aura EV with Supabase...");
  await loadCategories();
  await loadProducts();
  initializeScrollEffects();
}

// ============================================
// THEME TOGGLE (DARK/LIGHT MODE)
// ============================================

function initTheme() {
  const saved = localStorage.getItem("auraev-theme") || "dark";
  applyTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("auraev-theme", next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-icon").forEach((el) => {
    el.src = theme === "light" ? "images/lightmode.svg" : "images/darkmode.svg";
  });
}

// ============================================
// LOAD CATEGORIES FROM SUPABASE
// ============================================

async function loadCategories() {
  try {
    console.log("📦 Loading categories...");

    const { data, error } = await window.supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    categories = data;

    categories = data;
    console.log("✅ Categories loaded:", categories.length);
    renderCategories();
  } catch (error) {
    console.error("❌ Failed to load categories:", error);
    showToast("Gagal memuat kategori", "error");
  }
}

function renderCategories() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;

  grid.innerHTML = categories
    .map(
      (cat) => `
        <div class="category-card" onclick="showCategoryView('${cat.slug}')">
            <img src="${cat.image_url}" alt="${cat.name}" class="category-image" loading="lazy">
            <div class="category-content">
                <h3 class="category-name">${cat.name}</h3>
            </div>
        </div>
    `,
    )
    .join("");
}

function filterByCategory(slug) {
  document.getElementById("katalog").scrollIntoView({ behavior: "smooth" });
}

// ============================================
// LOAD PRODUCTS FROM SUPABASE
// ============================================

async function loadProducts() {
  const loadingEl = document.getElementById("catalogLoading");
  const contentEl = document.getElementById("catalogContent");

  try {
    console.log("📦 Loading products...");
    loadingEl.style.display = "block";
    contentEl.style.display = "none";

    const { data, error } = await window.supabase
      .from("products")
      .select(
        `
                *,
                categories (
                    id,
                    name,
                    slug
                )
            `,
      )
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) throw error;

    // Transform data
    models = data.map((product) => {
      // Get first image or use placeholder
      let imagePath = "images/placeholder.png";
      if (product.images && product.images.length > 0) {
        imagePath = product.images[0];
      }

      return {
        productId: product.id,
        name: product.name,
        brand: product.brand,
        img: imagePath,
        specs: {
          Harga: formatPrice(product.price),
          Brand: product.brand || "-",
          Baterai: product.battery_capacity || "-",
          Jangkauan: product.range_km || "-",
          "Kecepatan Max": product.max_speed || "-",
          "Waktu Charging": product.charging_time || "-",
          Garansi: product.warranty_years
            ? `${product.warranty_years} Tahun`
            : "-",
          Stok: product.stock > 0 ? `${product.stock} Unit` : "Habis",
        },
        colors: product.colors || ["#000000"],
        stock: product.stock,
        bgLines: generateBgLines(),
      };
    });

    console.log("✅ Products loaded:", models.length);

    if (models.length === 0) {
      throw new Error("No products available");
    }

    populateProductSelect();
    loadingEl.style.display = "none";
    contentEl.style.display = "grid";
    renderCatalog();
    displayCar(0);
  } catch (error) {
    console.error("❌ Failed to load products:", error);
    loadingEl.innerHTML =
      '<p style="color: var(--text-gray);">Gagal memuat produk. Silakan refresh halaman.</p>';
    showToast("Gagal memuat produk", "error");
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function generateBgLines() {
  let lines = "";
  for (let i = 0; i < 5; i++) {
    const top = Math.random() * 100;
    const width = 50 + Math.random() * 50;
    lines += `<div style="position:absolute;top:${top}%;left:0;width:${width}%;height:2px;background:linear-gradient(90deg,transparent,var(--primary),transparent);opacity:0.3;"></div>`;
  }
  return lines;
}

function populateProductSelect() {
  const select = document.getElementById("productInterestSelect");
  if (!select) return;

  select.innerHTML =
    '<option value="">Pilih Model yang Diminati</option>' +
    models.map((m) => `<option value="${m.name}">${m.name}</option>`).join("");
}

// ============================================
// RENDER CATALOG
// ============================================

function renderCatalog() {
  const sliderTrack = document.getElementById("sliderTrack");
  if (!sliderTrack) return;

  sliderTrack.innerHTML = models
    .map(
      (model, index) => `
        <div class="slider-item ${index === 0 ? "active" : ""}" onclick="displayCar(${index})">
            <img src="${model.img}" alt="${model.name}" loading="lazy" 
                 onerror="this.src='images/placeholder.png'">
            <div class="slider-item-name">${model.name}</div>
        </div>
    `,
    )
    .join("");
}

function displayCar(index) {
  currentCarIndex = index;
  const model = models[index];

  // Update active slider item
  document.querySelectorAll(".slider-item").forEach((item, i) => {
    item.classList.toggle("active", i === index);
  });

  // Show skeleton while loading
  const imgSkeleton = document.getElementById("imageSkeleton");
  const carImage = document.getElementById("carImage");

  if (imgSkeleton) imgSkeleton.style.display = "block";
  if (carImage) carImage.style.opacity = "0";

  // Update car image
  if (carImage) {
    carImage.onload = () => {
      if (imgSkeleton) imgSkeleton.style.display = "none";
      carImage.style.opacity = "1";
    };
    carImage.src = model.img;
    carImage.alt = model.name;
  }

  // Update car name
  const carName = document.getElementById("carName");
  if (carName) carName.textContent = model.name;

  // Update specs
  const specsHTML = Object.entries(model.specs)
    .map(
      ([label, value]) => `
        <div class="spec-item">
            <div class="spec-label">${label}</div>
            <div class="spec-value">${value}</div>
        </div>
    `,
    )
    .join("");
  const carSpecs = document.getElementById("carSpecs");
  if (carSpecs) carSpecs.innerHTML = specsHTML;

  // Update colors
  const colorsHTML = model.colors
    .map((color, i) => {
      const bgColor = colorMap[color] || color;
      const isDark = [
        "#1a1a1a",
        "#2c2c2c",
        "#0d0d0d",
        "#000000",
        "#003580",
      ].includes(bgColor);
      const extraStyle = isDark
        ? "outline: 1px solid rgba(255,255,255,0.2); outline-offset: 2px;"
        : "";
      return `
      <div class="color-option ${i === 0 ? "active" : ""}" 
           style="background: ${bgColor}; ${extraStyle}"
           onclick="selectColor('${color}', ${i})"
           title="${color}">
      </div>
    `;
    })
    .join("");
  const colorOptions = document.getElementById("colorOptions");
  if (colorOptions) colorOptions.innerHTML = colorsHTML;
  selectedColor = model.colors[0];

  // Update background lines
  const bgLines = document.getElementById("bgLines");
  if (bgLines) bgLines.innerHTML = model.bgLines;
}

function selectColor(color, index) {
  selectedColor = color;
  document.querySelectorAll(".color-option").forEach((opt, i) => {
    opt.classList.toggle("active", i === index);
  });
  const orderColor = document.getElementById("orderColor");
  if (orderColor) orderColor.value = color;
}

function nextCar() {
  currentCarIndex = (currentCarIndex + 1) % models.length;
  displayCar(currentCarIndex);
}

function prevCar() {
  currentCarIndex = (currentCarIndex - 1 + models.length) % models.length;
  displayCar(currentCarIndex);
}

// ============================================
// SEARCH KENDARAAN (NAVBAR)
// ============================================

function toggleSearch(btn) {
  const wrap = btn.closest(".nav-search");
  if (!wrap) return;
  const wasActive = wrap.classList.contains("active");

  // Close any other open search widgets first
  document.querySelectorAll(".nav-search").forEach((w) => {
    if (w !== wrap && !w.classList.contains("drawer-search")) {
      closeSearchWidget(w);
    }
  });

  if (wasActive) {
    closeSearchWidget(wrap);
  } else {
    wrap.classList.add("active");
    const input = wrap.querySelector(".search-input");
    if (input) setTimeout(() => input.focus(), 50);
  }
}

function closeSearchWidget(wrap) {
  wrap.classList.remove("active", "show-results");
  const input = wrap.querySelector(".search-input");
  if (input) input.value = "";
  const results = wrap.querySelector(".search-results");
  if (results) results.innerHTML = "";
}

function closeAllSearches() {
  document.querySelectorAll(".nav-search").forEach((w) => {
    if (w.classList.contains("drawer-search")) {
      w.classList.remove("show-results");
      const results = w.querySelector(".search-results");
      if (results) results.innerHTML = "";
    } else {
      closeSearchWidget(w);
    }
  });
}

function handleSearchInput(inputEl) {
  const wrap = inputEl.closest(".nav-search");
  const results = wrap ? wrap.querySelector(".search-results") : null;
  if (!wrap || !results) return;

  const query = inputEl.value.trim().toLowerCase();

  if (!query) {
    wrap.classList.remove("show-results");
    results.innerHTML = "";
    return;
  }

  if (!models || models.length === 0) {
    results.innerHTML =
      '<div class="search-no-results">Memuat data kendaraan...</div>';
    wrap.classList.add("show-results");
    return;
  }

  const matches = models
    .filter((m) => {
      const name = (m.name || "").toLowerCase();
      const brand = (m.brand || "").toLowerCase();
      return name.includes(query) || brand.includes(query);
    })
    .slice(0, 8);

  if (matches.length === 0) {
    results.innerHTML =
      '<div class="search-no-results">Kendaraan tidak ditemukan</div>';
  } else {
    results.innerHTML = matches
      .map(
        (m) => `
        <div class="search-result-item" onclick="selectSearchResult(${m.productId})">
            <img src="${m.img}" alt="${m.name}" class="search-result-img"
                 onerror="this.src='images/placeholder.png'">
            <div class="search-result-info">
                <div class="search-result-name">${m.name}</div>
                <div class="search-result-brand">${m.brand || ""}</div>
            </div>
            <div class="search-result-price">${m.specs.Harga || ""}</div>
        </div>
    `,
      )
      .join("");
  }

  wrap.classList.add("show-results");
}

function handleSearchKeydown(event, inputEl) {
  const wrap = inputEl.closest(".nav-search");
  if (!wrap) return;

  if (event.key === "Escape") {
    closeSearchWidget(wrap);
    inputEl.blur();
  } else if (event.key === "Enter") {
    event.preventDefault();
    const firstResult = wrap.querySelector(".search-result-item");
    if (firstResult) firstResult.click();
  }
}

function selectSearchResult(productId) {
  const index = models.findIndex((m) => m.productId === productId);
  if (index === -1) return;

  closeAllSearches();

  const drawer = document.getElementById("mobileDrawer");
  if (drawer && drawer.classList.contains("active")) {
    toggleMobileMenu();
  }

  const categoryView = document.getElementById("category-view");
  if (categoryView && categoryView.classList.contains("active")) {
    showMainViewFromCategory();
  }

  setTimeout(() => {
    const katalogSection = document.getElementById("katalog");
    if (katalogSection) katalogSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => displayCar(index), 450);
  }, 50);
}

// Close search dropdown when clicking outside of it
document.addEventListener("click", (e) => {
  document
    .querySelectorAll(".nav-search.active, .nav-search.show-results")
    .forEach((wrap) => {
      if (wrap.classList.contains("drawer-search")) return;
      if (!wrap.contains(e.target)) {
        closeSearchWidget(wrap);
      }
    });
});

// ============================================
// MOBILE MENU
// ============================================

function toggleMobileMenu() {
  const drawer = document.getElementById("mobileDrawer");
  const overlay = document.getElementById("drawerOverlay");

  if (drawer) drawer.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}

// ============================================
// ORDER MODAL
// ============================================

function openOrderModal() {
  const modal = document.getElementById("orderModal");
  const overlay = document.getElementById("modalOverlay");
  const currentModel = models[currentCarIndex];

  if (!currentModel) {
    showToast("Silakan pilih produk terlebih dahulu", "error");
    return;
  }

  // Pre-fill form
  const orderModelName = document.getElementById("orderModelName");
  const orderColor = document.getElementById("orderColor");

  if (orderModelName) orderModelName.value = currentModel.name;
  if (orderColor) orderColor.value = selectedColor;

  const orderQuantity = document.getElementById("orderQuantity");
  const orderStockInfo = document.getElementById("orderStockInfo");
  if (orderQuantity) orderQuantity.value = 1;
  if (orderStockInfo)
    orderStockInfo.textContent = `Stok tersedia: ${currentModel.stock} unit`;

  if (modal) modal.classList.add("active");
  if (overlay) overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  const overlay = document.getElementById("modalOverlay");

  if (modal) modal.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "auto";

  // Reset form
  const form = document.getElementById("orderForm");
  if (form) form.reset();

  const errorEl = document.getElementById("orderFormError");
  if (errorEl) errorEl.classList.remove("show");
}

// ============================================
// TEST DRIVE
// ============================================

function openTestDriveModal() {
  const currentModel = models[currentCarIndex];
  if (!currentModel) return;

  const tdProductName = document.getElementById("tdProductName");
  if (tdProductName) tdProductName.value = currentModel.name;

  // Set min date = besok
  const tdDate = document.getElementById("tdDate");
  if (tdDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tdDate.min = tomorrow.toISOString().split("T")[0];
  }

  document.getElementById("testDriveModal").classList.add("active");
  document.getElementById("testDriveOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeTestDriveModal() {
  document.getElementById("testDriveModal").classList.remove("active");
  document.getElementById("testDriveOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
  document.getElementById("testDriveForm").reset();
  document.getElementById("testDriveFormError").classList.remove("show");
}

async function submitTestDrive(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById("testDriveSubmitBtn");
  const errorEl = document.getElementById("testDriveFormError");
  const currentModel = models[currentCarIndex];

  submitBtn.disabled = true;
  submitBtn.textContent = "MEMPROSES...";
  errorEl.classList.remove("show");

  try {
    const { data, error } = await window.supabase
      .from("test_drive_requests")
      .insert([
        {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          product_id: currentModel.productId,
          product_name: currentModel.name,
          test_drive_date: form.test_drive_date.value,
          location: "Dealer AURA EV - Jakarta",
          status: "Pending",
        },
      ])
      .select();

    if (error) throw error;

    closeTestDriveModal();
    showToast(
      "✓ Test drive berhasil dipesan! Kami akan menghubungi Anda segera.",
      "success",
    );
  } catch (error) {
    errorEl.textContent =
      error.message || "Gagal memesan test drive. Silakan coba lagi.";
    errorEl.classList.add("show");
    showToast("Gagal memesan test drive", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "KONFIRMASI TEST DRIVE";
  }
}

// ============================================
// SUBMIT ORDER TO SUPABASE
// ============================================
function changeQuantity(delta) {
  const input = document.getElementById("orderQuantity");
  const currentModel = models[currentCarIndex];
  if (!input || !currentModel) return;

  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(val, currentModel.stock));
  input.value = val;
}

function addCurrentOrderToCart(event) {
  event.preventDefault();

  const errorEl = document.getElementById("orderFormError");
  const currentModel = models[currentCarIndex];
  if (errorEl) errorEl.classList.remove("show");
  if (!currentModel) return;

  const quantityInput = document.getElementById("orderQuantity");
  const quantity = parseInt(quantityInput ? quantityInput.value : 1) || 1;

  if (currentModel.stock <= 0) {
    if (errorEl) {
      errorEl.textContent = "Produk ini sudah habis stoknya.";
      errorEl.classList.add("show");
    }
    return;
  }
  if (quantity > currentModel.stock) {
    if (errorEl) {
      errorEl.textContent = `Stok tidak cukup. Tersedia: ${currentModel.stock} unit.`;
      errorEl.classList.add("show");
    }
    return;
  }

  const price =
    parseFloat((currentModel.specs["Harga"] || "0").replace(/[^0-9]/g, "")) ||
    0;

  addToCart({
    productId: currentModel.productId,
    name: currentModel.name,
    image: currentModel.img,
    price,
    color: selectedColor,
    quantity,
    maxStock: currentModel.stock,
  });

  closeOrderModal();
  showToast(`✓ ${currentModel.name} ditambahkan ke keranjang`, "success");
}

// ============================================
// CART (KERANJANG)
// ============================================
const CART_STORAGE_KEY = "auraev_cart";

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
  updateCartBadge();
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Gagal menyimpan keranjang:", e);
  }
}

function addToCart({
  productId,
  name,
  image,
  price,
  color,
  quantity,
  maxStock,
}) {
  const cap = maxStock || quantity;
  const existing = cart.find(
    (it) => it.productId === productId && it.color === color,
  );

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, cap);
    existing.maxStock = cap;
  } else {
    cart.push({
      cartItemId: `${productId}-${color}-${Date.now()}`,
      productId,
      name,
      image,
      price,
      color,
      quantity: Math.min(quantity, cap),
      maxStock: cap,
    });
  }

  saveCart();
  updateCartBadge();
}

function updateCartBadge() {
  const totalQty = cart.reduce((sum, it) => sum + it.quantity, 0);
  document.querySelectorAll(".cart-badge").forEach((el) => {
    el.textContent = totalQty > 99 ? "99+" : String(totalQty);
    el.style.display = totalQty > 0 ? "flex" : "none";
  });

  const cartModal = document.getElementById("cartModal");
  if (cartModal && cartModal.classList.contains("active")) {
    renderCartItems();
  }
}

function openCartModal() {
  if (typeof closeAllSearches === "function") closeAllSearches();
  renderCartItems();
  document.getElementById("cartModal").classList.add("active");
  document.getElementById("cartModalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCartModal() {
  const modal = document.getElementById("cartModal");
  const overlay = document.getElementById("cartModalOverlay");
  if (modal) modal.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

function renderCartItems() {
  const listEl = document.getElementById("cartItemsList");
  const emptyEl = document.getElementById("cartEmptyState");
  const sectionEl = document.getElementById("cartCheckoutSection");
  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
    if (sectionEl) sectionEl.style.display = "none";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (sectionEl) sectionEl.style.display = "block";

  listEl.innerHTML = cart
    .map(
      (it) => `
        <div class="cart-item-row">
            <img src="${it.image || "images/placeholder.png"}" alt="${it.name}"
                 class="cart-item-img" onerror="this.src='images/placeholder.png'">
            <div class="cart-item-info">
                <div class="cart-item-name">${it.name}</div>
                <div class="cart-item-meta">${it.color || "-"} · ${formatPrice(it.price)}</div>
                <div class="cart-item-qty">
                    <button type="button" onclick="changeCartQuantity('${it.cartItemId}', -1)">−</button>
                    <span>${it.quantity}</span>
                    <button type="button" onclick="changeCartQuantity('${it.cartItemId}', 1)">+</button>
                    <button type="button" class="cart-item-remove"
                            onclick="removeFromCart('${it.cartItemId}')" aria-label="Hapus item">
                        Hapus
                    </button>
                </div>
            </div>
            <div class="cart-item-subtotal">${formatPrice(it.price * it.quantity)}</div>
        </div>
    `,
    )
    .join("");

  const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalEl = document.getElementById("cartTotalAmount");
  if (totalEl) totalEl.textContent = formatPrice(total);
}

function changeCartQuantity(cartItemId, delta) {
  const item = cart.find((it) => it.cartItemId === cartItemId);
  if (!item) return;
  item.quantity = Math.max(
    1,
    Math.min(item.quantity + delta, item.maxStock || 999),
  );
  saveCart();
  renderCartItems();
  updateCartBadge();
}

function removeFromCart(cartItemId) {
  cart = cart.filter((it) => it.cartItemId !== cartItemId);
  saveCart();
  renderCartItems();
  updateCartBadge();
}

async function submitCartCheckout(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const form = event.target;
  const submitBtn = document.getElementById("cartCheckoutBtn");
  const errorEl = document.getElementById("cartCheckoutError");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "MEMPROSES...";
  }
  if (errorEl) errorEl.classList.remove("show");

  try {
    const customerName = form.customerName.value.trim();
    const customerEmail = form.customerEmail.value.trim();
    const customerPhone = form.customerPhone.value.trim();
    const address = form.address.value.trim() || null;
    const notes = form.notes.value.trim() || null;

    const ordersPayload = cart.map((it) => ({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      product_id: it.productId,
      product_name: it.name,
      product_price: it.price,
      color: it.color || "-",
      quantity: it.quantity,
      address,
      notes,
      status: "Pending",
      payment_status: "unpaid",
    }));

    const { data, error } = await window.supabase
      .from("orders")
      .insert(ordersPayload)
      .select();
    if (error) throw error;

    // Kurangi stok tiap produk di keranjang
    for (const it of cart) {
      const model = models.find((m) => m.productId === it.productId);
      const baseStock = model ? model.stock : it.maxStock;
      const newStock = Math.max(baseStock - it.quantity, 0);
      const newStockStatus =
        newStock <= 0
          ? "out_of_stock"
          : newStock <= 5
            ? "low_stock"
            : "in_stock";

      const { error: stockError } = await window.supabase
        .from("products")
        .update({ stock: newStock, stock_status: newStockStatus })
        .eq("id", it.productId);

      if (!stockError) {
        if (model) {
          model.stock = newStock;
          model.specs["Stok"] = newStock > 0 ? `${newStock} Unit` : "Habis";
        }
        // Sinkronkan juga daftar produk di halaman katalog kategori, kalau ada
        if (typeof catProducts !== "undefined" && catProducts) {
          const catProduct = catProducts.find((p) => p.id === it.productId);
          if (catProduct) {
            catProduct.stock = newStock;
            catProduct.stock_status = newStockStatus;
          }
        }
      }
    }

    const orderIds = data.map((o) => o.id);
    const totalAmount = cart.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0,
    );
    const cartSnapshot = cart.map((it) => ({ ...it }));

    cart = [];
    saveCart();
    updateCartBadge();
    closeCartModal();
    form.reset();

    openPaymentModal(orderIds, cartSnapshot, totalAmount);
  } catch (error) {
    console.error("❌ Gagal checkout keranjang:", error);
    const errorMsg =
      error.message || "Gagal memproses pesanan. Silakan coba lagi.";
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add("show");
    }
    showToast("Gagal memproses pesanan", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "BAYAR SEKARANG";
    }
  }
}

// ============================================
// PAYMENT
// ============================================
let _pendingPaymentOrderIds = [];
let _lastReceiptOrder = null;

function openPaymentModal(orderIds, items, totalAmount) {
  _pendingPaymentOrderIds = Array.isArray(orderIds) ? orderIds : [orderIds];
  const itemList = Array.isArray(items) ? items : [items];
  const totalQty = itemList.reduce((sum, it) => sum + (it.quantity || 1), 0);

  const productLabel =
    itemList.length === 1
      ? itemList[0].name
      : itemList.map((it) => it.name).join(", ");

  document.getElementById("paymentProductName").textContent = productLabel;
  document.getElementById("paymentQuantity").textContent = totalQty + " unit";
  document.getElementById("paymentTotalAmount").textContent =
    formatPrice(totalAmount);

  document.getElementById("paymentSummaryView").style.display = "block";
  document.getElementById("paymentSuccessView").style.display = "none";
  document.getElementById("paymentError").classList.remove("show");

  const payBtn = document.getElementById("paymentPayBtn");
  payBtn.disabled = false;
  payBtn.textContent = "BAYAR SEKARANG";

  document.getElementById("paymentModal").classList.add("active");
  document.getElementById("paymentModalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePaymentModal() {
  document.getElementById("paymentModal").classList.remove("active");
  document.getElementById("paymentModalOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
  _pendingPaymentOrderIds = [];
}

async function processFakePayment() {
  if (!_pendingPaymentOrderIds || _pendingPaymentOrderIds.length === 0) return;
  const payBtn = document.getElementById("paymentPayBtn");
  const errorEl = document.getElementById("paymentError");

  payBtn.disabled = true;
  payBtn.textContent = "MEMPROSES PEMBAYARAN...";
  errorEl.classList.remove("show");

  // Simulasi delay proses pembayaran (gimik, bukan transaksi asli)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const { error } = await window.supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .in("id", _pendingPaymentOrderIds);

    if (error) throw error;

    // Ambil ulang data order lengkap (nama, email, warna, dll) buat isi struk
    const { data: orderRows, error: fetchError } = await window.supabase
      .from("orders")
      .select("*")
      .in("id", _pendingPaymentOrderIds)
      .order("id", { ascending: true });

    if (fetchError) throw fetchError;

    const paidAt = new Date();
    orderRows.forEach((o) => (o.paid_at_client = paidAt));
    _lastReceiptOrder = orderRows;
    populateReceipt(orderRows);
    recordOrderHistory(orderRows);

    document.getElementById("paymentSummaryView").style.display = "none";
    document.getElementById("paymentSuccessView").style.display = "block";
    showToast(
      "✓ Pembayaran berhasil! Pesanan Anda sedang diproses.",
      "success",
    );
  } catch (err) {
    errorEl.textContent = "Gagal memproses pembayaran. Silakan coba lagi.";
    errorEl.classList.add("show");
    payBtn.disabled = false;
    payBtn.textContent = "BAYAR SEKARANG";
  }
}

// ============================================
// RECEIPT / STRUK PEMBAYARAN
// ============================================

function formatReceiptDate(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function populateReceipt(orders) {
  const list = Array.isArray(orders) ? orders : [orders];
  const first = list[0];
  const invoiceNo =
    "INV-" +
    String(first.id).padStart(6, "0") +
    (list.length > 1 ? `-${list.length}` : "");

  document.getElementById("receiptInvoiceNo").textContent = invoiceNo;
  document.getElementById("receiptDate").textContent = formatReceiptDate(
    first.paid_at_client || first.created_at,
  );

  document.getElementById("receiptCustomerName").textContent =
    first.customer_name || "-";
  document.getElementById("receiptCustomerContact").textContent = [
    first.customer_email,
    first.customer_phone,
  ]
    .filter(Boolean)
    .join(" · ");

  const itemsEl = document.getElementById("receiptItemsList");
  let grandTotal = 0;

  itemsEl.innerHTML = list
    .map((order) => {
      const subtotal = parseFloat(order.product_price) * (order.quantity || 1);
      grandTotal += subtotal;
      const dotColor = order.color
        ? colorMap[order.color] || order.color
        : "#888";
      return `
        <div class="receipt-row" style="margin-bottom: 0.6rem">
            <div style="display: flex; align-items: center; gap: 8px">
                <span class="receipt-color-dot" style="background:${dotColor}"></span>
                <div>
                    <p class="receipt-strong">${order.product_name || "-"}</p>
                    <p class="receipt-subtle">${order.color || "-"} · ${order.quantity || 1} unit</p>
                </div>
            </div>
            <span>${formatPrice(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  document.getElementById("receiptTotal").textContent = formatPrice(grandTotal);
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal load gambar: ${src}`));
    img.src = src;
  });
}

async function downloadReceiptPDF() {
  if (
    !_lastReceiptOrder ||
    (Array.isArray(_lastReceiptOrder) && _lastReceiptOrder.length === 0) ||
    !window.jspdf
  ) {
    showToast("Struk belum siap, coba lagi sebentar.", "error");
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const orderList = Array.isArray(_lastReceiptOrder)
      ? _lastReceiptOrder
      : [_lastReceiptOrder];
    const order = orderList[0];
    const invoiceNo =
      "INV-" +
      String(order.id).padStart(6, "0") +
      (orderList.length > 1 ? `-${orderList.length}` : "");
    const subtotal = orderList.reduce(
      (sum, o) => sum + parseFloat(o.product_price) * (o.quantity || 1),
      0,
    );

    // Logo buat watermark, kalau gagal load PDF tetap jalan tanpa watermark
    let logoImg = null;
    try {
      const img = await loadImageElement("images/aura-logo.png");
      if (!img.naturalWidth || !img.naturalHeight) {
        throw new Error(
          "File logo tidak valid / tidak ditemukan di images/aura-logo.png",
        );
      }
      logoImg = img;
    } catch (e) {
      console.warn("Watermark logo dilewati:", e.message);
      logoImg = null;
    }

    const doc = new jsPDF({ unit: "mm", format: "a5" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 15;
    let y = 18;

    // Watermark logo (digambar duluan biar ada di belakang semua teks)
    // Dibungkus try/catch sendiri: kalau gagal, watermark cuma di-skip, PDF tetap lanjut jadi.
    if (logoImg) {
      try {
        const wmWidth = pageWidth * 0.55;
        const wmHeight =
          wmWidth * (logoImg.naturalHeight / logoImg.naturalWidth);
        const wmX = (pageWidth - wmWidth) / 2;
        const wmY = (pageHeight - wmHeight) / 2;

        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.07 }));
        doc.addImage(logoImg, "PNG", wmX, wmY, wmWidth, wmHeight);
        doc.restoreGraphicsState();
      } catch (wmErr) {
        console.warn(
          "Gagal menambahkan watermark logo, PDF dilanjutkan tanpa watermark:",
          wmErr,
        );
      }
    }

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text("AURA EV", marginX, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Dealer AURA EV - Jakarta", marginX, y + 5);

    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text("LUNAS", pageWidth - marginX, y, { align: "right" });

    y += 12;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 7;

    // Meta
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`No. Invoice: ${invoiceNo}`, marginX, y);
    doc.text(
      formatReceiptDate(order.paid_at_client || order.created_at),
      pageWidth - marginX,
      y,
      { align: "right" },
    );
    y += 9;

    // Pelanggan
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text("PELANGGAN", marginX, y);
    y += 5;
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text(order.customer_name || "-", marginX, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      [order.customer_email, order.customer_phone]
        .filter(Boolean)
        .join("  ·  "),
      marginX,
      y,
    );

    y += 9;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 8;

    // Produk (bisa lebih dari satu item kalau checkout dari keranjang)
    orderList.forEach((o) => {
      const itemSubtotal = parseFloat(o.product_price) * (o.quantity || 1);
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "bold");
      doc.text(o.product_name || "-", marginX, y);
      doc.text(formatPrice(itemSubtotal), pageWidth - marginX, y, {
        align: "right",
      });
      y += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`${o.color || "-"} · ${o.quantity || 1} unit`, marginX, y);
      y += 7;
    });

    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 7;

    // Metode pembayaran
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Metode Pembayaran", marginX, y);
    doc.text("Transfer Bank (Simulasi)", pageWidth - marginX, y, {
      align: "right",
    });

    y += 9;

    // Total
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Total Bayar", marginX, y);
    doc.setFontSize(14);
    doc.setTextColor(74, 144, 217);
    doc.text(formatPrice(subtotal), pageWidth - marginX, y, { align: "right" });

    y += 14;
    doc.setDrawColor(230, 230, 230);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Struk dicetak otomatis oleh sistem AURA EV", pageWidth / 2, y, {
      align: "center",
    });

    doc.save(`Struk-${invoiceNo}.pdf`);
  } catch (err) {
    console.error("Gagal membuat PDF struk:", err);
    showToast(
      "Gagal membuat PDF: " + (err.message || "error tidak diketahui"),
      "error",
    );
  }
}

// ============================================
// ORDER HISTORY (RIWAYAT PEMESANAN)
// Menu ini otomatis muncul di pojok kanan bawah
// setelah pembeli menyelesaikan transaksi/pembayaran.
// ============================================
const ORDER_HISTORY_KEY = "auraev_order_history";
let orderHistory = [];

function loadOrderHistory() {
  try {
    const saved = localStorage.getItem(ORDER_HISTORY_KEY);
    orderHistory = saved ? JSON.parse(saved) : [];
  } catch (e) {
    orderHistory = [];
  }
  updateOrderHistoryFab();
}

function saveOrderHistoryToStorage() {
  try {
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory));
  } catch (e) {
    console.warn("Gagal menyimpan riwayat pesanan:", e);
  }
}

function recordOrderHistory(orderRows) {
  const list = Array.isArray(orderRows) ? orderRows : [orderRows];
  if (list.length === 0) return;

  const first = list[0];
  const invoiceNo =
    "INV-" +
    String(first.id).padStart(6, "0") +
    (list.length > 1 ? `-${list.length}` : "");

  const items = list.map((o) => ({
    name: o.product_name || "-",
    color: o.color || "-",
    quantity: o.quantity || 1,
    price: parseFloat(o.product_price) || 0,
  }));

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const entry = {
    invoiceNo,
    orderIds: list.map((o) => o.id),
    date: new Date(
      first.paid_at_client || first.created_at || Date.now(),
    ).toISOString(),
    customerName: first.customer_name || "-",
    customerEmail: first.customer_email || "-",
    customerPhone: first.customer_phone || "-",
    items,
    total,
    status: "Dibayar",
  };

  // Hindari duplikat kalau fungsi ini terpanggil lebih dari sekali untuk invoice yang sama
  orderHistory = orderHistory.filter((h) => h.invoiceNo !== invoiceNo);
  orderHistory.unshift(entry);
  saveOrderHistoryToStorage();
  updateOrderHistoryFab();
}

function updateOrderHistoryFab() {
  const fab = document.getElementById("orderHistoryFab");
  const badge = document.getElementById("orderHistoryFabBadge");
  if (!fab) return;

  if (orderHistory.length > 0) {
    fab.classList.add("show");
    if (badge) badge.textContent = orderHistory.length;
  } else {
    fab.classList.remove("show");
  }
}

function openOrderHistoryModal() {
  if (typeof closeAllSearches === "function") closeAllSearches();
  renderOrderHistoryList();
  document.getElementById("orderHistoryListView").style.display = "block";
  document.getElementById("orderHistoryDetailView").style.display = "none";
  document.getElementById("orderHistoryModal").classList.add("active");
  document.getElementById("orderHistoryModalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeOrderHistoryModal() {
  document.getElementById("orderHistoryModal").classList.remove("active");
  document
    .getElementById("orderHistoryModalOverlay")
    .classList.remove("active");
  document.body.style.overflow = "auto";
}

function renderOrderHistoryList() {
  const listEl = document.getElementById("orderHistoryList");
  const emptyEl = document.getElementById("orderHistoryEmpty");
  if (!listEl) return;

  if (orderHistory.length === 0) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  listEl.innerHTML = orderHistory
    .map((entry) => {
      const productSummary = entry.items
        .map((it) => `${it.name} (${it.quantity}x)`)
        .join(", ");
      return `
        <div class="oh-item" onclick="viewOrderHistoryDetail('${entry.invoiceNo}')">
            <div class="oh-item-top">
                <span class="oh-invoice">${entry.invoiceNo}</span>
                <span class="oh-status">${entry.status}</span>
            </div>
            <div class="oh-date">${formatReceiptDate(entry.date)}</div>
            <div class="oh-products">${productSummary}</div>
            <div class="oh-bottom">
                <span class="oh-total">${formatPrice(entry.total)}</span>
                <span class="oh-view-detail">Lihat Rincian →</span>
            </div>
        </div>
      `;
    })
    .join("");
}

function viewOrderHistoryDetail(invoiceNo) {
  const entry = orderHistory.find((h) => h.invoiceNo === invoiceNo);
  if (!entry) return;

  const itemsHTML = entry.items
    .map((it) => {
      const subtotal = it.price * it.quantity;
      const dotColor = it.color ? colorMap[it.color] || it.color : "#888";
      return `
        <div class="receipt-row" style="margin-bottom: 0.6rem">
            <div style="display: flex; align-items: center; gap: 8px">
                <span class="receipt-color-dot" style="background:${dotColor}"></span>
                <div>
                    <p class="receipt-strong">${it.name}</p>
                    <p class="receipt-subtle">${it.color} · ${it.quantity} unit</p>
                </div>
            </div>
            <span>${formatPrice(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  document.getElementById("orderHistoryDetailCard").innerHTML = `
    <div class="receipt-header">
        <div>
            <p class="receipt-brand">AURA<span>EV</span></p>
            <p class="receipt-subtle">Dealer AURA EV - Jakarta</p>
        </div>
        <span class="receipt-badge-paid">${entry.status.toUpperCase()}</span>
    </div>
    <div class="receipt-meta">
        <span>No. Invoice <strong>${entry.invoiceNo}</strong></span>
        <span>${formatReceiptDate(entry.date)}</span>
    </div>
    <div class="receipt-section">
        <p class="receipt-subtle">Pelanggan</p>
        <p class="receipt-strong">${entry.customerName}</p>
        <p class="receipt-subtle">${[entry.customerEmail, entry.customerPhone].filter(Boolean).join(" · ")}</p>
    </div>
    <div class="receipt-section">
        ${itemsHTML}
    </div>
    <div class="receipt-section">
        <div class="receipt-row receipt-total">
            <span>Total Bayar</span>
            <span>${formatPrice(entry.total)}</span>
        </div>
    </div>
  `;

  document.getElementById("orderHistoryListView").style.display = "none";
  document.getElementById("orderHistoryDetailView").style.display = "block";
}

function backToOrderHistoryList() {
  document.getElementById("orderHistoryListView").style.display = "block";
  document.getElementById("orderHistoryDetailView").style.display = "none";
}

// ============================================
// SUBMIT CONTACT TO SUPABASE
// ============================================

async function submitContact(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById("contactSubmitBtn");
  const errorEl = document.getElementById("contactFormError");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "MENGIRIM...";
  }
  if (errorEl) errorEl.classList.remove("show");

  try {
    const contactData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || null,
      product_interest: form.productInterest.value || null,
      message: form.message.value.trim(),
      is_read: false,
    };

    console.log("📤 Submitting contact:", contactData);

    const { data, error } = await window.supabase
      .from("contact_messages")
      .insert([contactData])
      .select();

    if (error) throw error;

    console.log("✅ Contact submitted:", data);

    // Success
    showToast(
      "✓ Pesan berhasil dikirim! Terima kasih telah menghubungi kami.",
      "success",
    );
    form.reset();
  } catch (error) {
    console.error("❌ Failed to submit contact:", error);
    const errorMsg =
      error.message || "Gagal mengirim pesan. Silakan coba lagi.";
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add("show");
    }
    showToast("Gagal mengirim pesan", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "KIRIM PESAN";
    }
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// ============================================
// SCROLL EFFECTS
// ============================================

function initializeScrollEffects() {
  // Navbar background on scroll
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.style.background = "rgba(10, 10, 10, 0.98)";
      } else {
        navbar.style.background = "rgba(10, 10, 10, 0.95)";
      }
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

document.addEventListener("keydown", (e) => {
  // Close modal on Escape
  if (e.key === "Escape") {
    closeOrderModal();
    closeCartModal();
    closeOrderHistoryModal();
    closeAllSearches();
    const drawer = document.getElementById("mobileDrawer");
    if (drawer && drawer.classList.contains("active")) {
      toggleMobileMenu();
    }
  }

  // Navigate cars with arrow keys
  const catalogContent = document.getElementById("catalogContent");
  if (catalogContent && catalogContent.style.display !== "none") {
    if (e.key === "ArrowLeft") {
      prevCar();
    } else if (e.key === "ArrowRight") {
      nextCar();
    }
  }
});

console.log("✅ Script loaded successfully!");

// handleLogout dikelola oleh index.html (SPA)
// Fungsi ini hanya sebagai fallback jika dipanggil dari konteks lain
async function handleLogout() {
  if (typeof showLoading === "function") {
    showLoading("LOGGING OUT", "Sampai jumpa lagi...");
  }
  await window.supabase.auth.signOut();
  if (typeof hideLoading === "function" && typeof showAuthView === "function") {
    setTimeout(() => {
      hideLoading();
      showLogin && showLogin();
      showAuthView();
    }, 1200);
  }
}