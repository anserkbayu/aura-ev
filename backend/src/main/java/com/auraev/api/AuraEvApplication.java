package com.auraev.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// ============================================
// MAIN APPLICATION
// ============================================
@SpringBootApplication
public class AuraEvApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuraEvApplication.class, args);
    }
}

// ============================================
// CORS CONFIGURATION
// ============================================
@Configuration
class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}

// ============================================
// API RESPONSE WRAPPER
// ============================================
record ApiResponse<T>(boolean success, String message, T data) {
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}

// ============================================
// ENTITIES
// ============================================

@Entity
@Table(name = "categories")
class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

@Entity
@Table(name = "products")
class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Category category;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT[]")
    private String[] images;

    @Column(columnDefinition = "TEXT[]")
    private String[] colors;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer stock;

    @Column(name = "is_active", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (stock == null) stock = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String[] getImages() { return images; }
    public void setImages(String[] images) { this.images = images; }
    public String[] getColors() { return colors; }
    public void setColors(String[] colors) { this.colors = colors; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

@Entity
@Table(name = "orders")
class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 200)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 50)
    private String customerPhone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Product product;

    @Column(length = 100)
    private String color;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'PENDING'")
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

@Entity
@Table(name = "contact_messages")
class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "product_interest", length = 200)
    private String productInterest;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isRead;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getProductInterest() { return productInterest; }
    public void setProductInterest(String productInterest) { this.productInterest = productInterest; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

@Entity
@Table(name = "test_drive_requests")
class TestDriveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = false, length = 50)
    private String phone;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "test_drive_date")
    private java.time.LocalDate testDriveDate;

    @Column(length = 200)
    private String location;

    @Column(length = 50)
    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "Pending";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public java.time.LocalDate getTestDriveDate() { return testDriveDate; }
    public void setTestDriveDate(java.time.LocalDate testDriveDate) { this.testDriveDate = testDriveDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

// ============================================
// DTOs
// ============================================

record OrderRequest(
    @NotBlank(message = "Nama tidak boleh kosong") String customerName,
    @NotBlank(message = "Email tidak boleh kosong") @Email(message = "Format email tidak valid") String customerEmail,
    @NotBlank(message = "Nomor telepon tidak boleh kosong") String customerPhone,
    @NotNull(message = "Product ID tidak boleh kosong") Long productId,
    String color,
    String address,
    String notes
) {}

record StatusUpdateRequest(@NotBlank String status) {}

// ============================================
// REPOSITORIES
// ============================================

@Repository
interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
}

@Repository
interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    List<Product> findByCategorySlugAndIsActiveTrue(String categorySlug);
}

@Repository
interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByCreatedAtDesc();
}

@Repository
interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
}

@Repository
interface TestDriveRequestRepository extends JpaRepository<TestDriveRequest, Long> {
    List<TestDriveRequest> findAllByOrderByCreatedAtDesc();
}

// ============================================
// CONTROLLERS
// ============================================

@RestController
@RequestMapping("/api/categories")
class CategoryController {
    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil data kategori", categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category category) {
        try {
            Category saved = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Kategori berhasil ditambahkan", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Gagal menambahkan kategori: " + e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/api/products")
class ProductController {
    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            @RequestParam(required = false) String category) {
        List<Product> products;
        if (category != null && !category.isEmpty()) {
            products = productRepository.findByCategorySlugAndIsActiveTrue(category);
        } else {
            products = productRepository.findByIsActiveTrue();
        }
        return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil data produk", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent() && product.get().getIsActive()) {
            return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil detail produk", product.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Produk tidak ditemukan"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        try {
            Product saved = productRepository.save(product);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Produk berhasil ditambahkan", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Gagal menambahkan produk: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            Product p = product.get();
            p.setIsActive(false);
            productRepository.save(p);
            return ResponseEntity.ok(ApiResponse.success("Produk berhasil dihapus", null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Produk tidak ditemukan"));
    }
}

@RestController
@RequestMapping("/api/orders")
class OrderController {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil data pesanan", orders));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(@Valid @RequestBody OrderRequest request) {
        try {
            Optional<Product> product = productRepository.findById(request.productId());
            if (product.isEmpty() || !product.get().getIsActive()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Produk tidak ditemukan atau tidak tersedia"));
            }

            Order order = new Order();
            order.setCustomerName(request.customerName());
            order.setCustomerEmail(request.customerEmail());
            order.setCustomerPhone(request.customerPhone());
            order.setProduct(product.get());
            order.setColor(request.color());
            order.setAddress(request.address());
            order.setNotes(request.notes());

            Order saved = orderRepository.save(order);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Pesanan berhasil dibuat", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Gagal membuat pesanan: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order o = order.get();
            o.setStatus(request.status());    
            Order updated = orderRepository.save(o);
            return ResponseEntity.ok(ApiResponse.success("Status pesanan berhasil diupdate", updated));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Pesanan tidak ditemukan"));
    }
}

@RestController
@RequestMapping("/api/contact")
class ContactController {
    private final ContactMessageRepository contactMessageRepository;

    public ContactController(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactMessage>>> getAllMessages() {
        List<ContactMessage> messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil data pesan kontak", messages));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactMessage>> createMessage(@Valid @RequestBody ContactMessage message) {
        try {
            ContactMessage saved = contactMessageRepository.save(message);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Pesan berhasil dikirim", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Gagal mengirim pesan: " + e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/api/test-drive")
class TestDriveController {
    private final TestDriveRequestRepository testDriveRequestRepository;

    public TestDriveController(TestDriveRequestRepository testDriveRequestRepository) {
        this.testDriveRequestRepository = testDriveRequestRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestDriveRequest>>> getAllTestDrives() {
        List<TestDriveRequest> list = testDriveRequestRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil data test drive", list));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TestDriveRequest>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        Optional<TestDriveRequest> td = testDriveRequestRepository.findById(id);
        if (td.isPresent()) {
            TestDriveRequest t = td.get();
            t.setStatus(request.status());
            TestDriveRequest updated = testDriveRequestRepository.save(t);
            return ResponseEntity.ok(ApiResponse.success("Status berhasil diupdate", updated));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Data test drive tidak ditemukan"));
    }
}