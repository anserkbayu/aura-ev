# 🧪 AURA EV - API Testing Guide

Panduan lengkap untuk testing API AURA EV menggunakan berbagai tools.

## 📋 Base URL

```
Local: http://localhost:8080/api
Production: https://api.auraev.id/api
```

## 🔍 1. Testing dengan cURL

### Categories

**Get All Categories**
```bash
curl -X GET http://localhost:8080/api/categories
```

**Create Category**
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bus Listrik",
    "slug": "bus",
    "description": "Kendaraan angkutan umum bertenaga listrik",
    "imageUrl": "images/bus.png"
  }'
```

### Products

**Get All Products**
```bash
curl -X GET http://localhost:8080/api/products
```

**Get Products by Category**
```bash
curl -X GET "http://localhost:8080/api/products?category=mobil"
```

**Get Product by ID**
```bash
curl -X GET http://localhost:8080/api/products/1
```

**Create Product**
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tesla Model 3",
    "category": {
      "id": 1
    },
    "price": 750000000,
    "description": "Sedan listrik premium dari Tesla",
    "images": ["images/tesla-model3.png"],
    "colors": ["#000000", "#FFFFFF", "#FF0000"],
    "stock": 5,
    "isActive": true
  }'
```

**Delete Product (Soft Delete)**
```bash
curl -X DELETE http://localhost:8080/api/products/1
```

### Orders

**Get All Orders**
```bash
curl -X GET http://localhost:8080/api/orders
```

**Create Order**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Budi Santoso",
    "customerEmail": "budi@example.com",
    "customerPhone": "081234567890",
    "productId": 1,
    "color": "#000000",
    "address": "Jl. Sudirman No. 123, Jakarta",
    "notes": "Kirim pagi hari"
  }'
```

**Update Order Status**
```bash
curl -X PUT http://localhost:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

### Contact Messages

**Get All Messages**
```bash
curl -X GET http://localhost:8080/api/contact
```

**Send Contact Message**
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Siti Nurhaliza",
    "email": "siti@example.com",
    "phone": "081234567890",
    "productInterest": "BYD Seal AWD",
    "message": "Saya tertarik dengan produk ini. Apakah ada promo?"
  }'
```

## 🎯 2. Testing dengan Postman

### Import Collection

Buat file `AURA-EV.postman_collection.json`:

```json
{
  "info": {
    "name": "AURA EV API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Categories",
      "item": [
        {
          "name": "Get All Categories",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/categories",
              "host": ["{{baseUrl}}"],
              "path": ["categories"]
            }
          }
        },
        {
          "name": "Create Category",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Bus Listrik\",\n  \"slug\": \"bus\",\n  \"description\": \"Kendaraan angkutan umum\",\n  \"imageUrl\": \"images/bus.png\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/categories",
              "host": ["{{baseUrl}}"],
              "path": ["categories"]
            }
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/products",
              "host": ["{{baseUrl}}"],
              "path": ["products"]
            }
          }
        },
        {
          "name": "Get Products by Category",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/products?category=mobil",
              "host": ["{{baseUrl}}"],
              "path": ["products"],
              "query": [
                {
                  "key": "category",
                  "value": "mobil"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Orders",
      "item": [
        {
          "name": "Create Order",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"customerName\": \"Test User\",\n  \"customerEmail\": \"test@example.com\",\n  \"customerPhone\": \"081234567890\",\n  \"productId\": 1,\n  \"color\": \"#000000\",\n  \"address\": \"Jakarta\",\n  \"notes\": \"Test order\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/orders",
              "host": ["{{baseUrl}}"],
              "path": ["orders"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api"
    }
  ]
}
```

### Setup Environment

1. Buka Postman
2. Import collection di atas
3. Buat Environment baru:
   - Name: `AURA EV Local`
   - Variable: `baseUrl` = `http://localhost:8080/api`

## 🔬 3. Testing dengan JavaScript (Browser Console)

Buka browser console (F12) di halaman frontend:

```javascript
// Test Get Products
fetch('http://localhost:8080/api/products')
  .then(res => res.json())
  .then(data => console.log(data));

// Test Create Order
fetch('http://localhost:8080/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    customerPhone: '081234567890',
    productId: 1,
    color: '#000000',
    address: 'Jakarta',
    notes: 'Test'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🧪 4. Testing dengan HTTPie

Install HTTPie:
```bash
pip install httpie
```

### Examples

```bash
# Get products
http GET localhost:8080/api/products

# Create order
http POST localhost:8080/api/orders \
  customerName="Test User" \
  customerEmail="test@example.com" \
  customerPhone="081234567890" \
  productId:=1 \
  color="#000000" \
  address="Jakarta"

# Update order status
http PUT localhost:8080/api/orders/1/status \
  status="CONFIRMED"
```

## ✅ 5. Expected Responses

### Success Response Format

```json
{
  "success": true,
  "message": "Berhasil mengambil data produk",
  "data": [...]
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Produk tidak ditemukan",
  "data": null
}
```

## 🎭 6. Test Scenarios

### Scenario 1: Complete Order Flow

1. **Get Categories**
   ```bash
   curl http://localhost:8080/api/categories
   ```
   Expected: List of 4 categories

2. **Get Products**
   ```bash
   curl http://localhost:8080/api/products?category=mobil
   ```
   Expected: List of car products

3. **Create Order**
   ```bash
   curl -X POST http://localhost:8080/api/orders \
     -H "Content-Type: application/json" \
     -d '{"customerName":"Test","customerEmail":"test@test.com","customerPhone":"081234567890","productId":1,"color":"#000000","address":"Jakarta"}'
   ```
   Expected: Order created with status PENDING

4. **Update Order Status**
   ```bash
   curl -X PUT http://localhost:8080/api/orders/1/status \
     -H "Content-Type: application/json" \
     -d '{"status":"CONFIRMED"}'
   ```
   Expected: Order status updated

### Scenario 2: Validation Testing

**Test Empty Name**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "",
    "customerEmail": "test@test.com",
    "customerPhone": "081234567890",
    "productId": 1
  }'
```
Expected: Validation error

**Test Invalid Email**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "customerEmail": "invalid-email",
    "customerPhone": "081234567890",
    "productId": 1
  }'
```
Expected: Email validation error

**Test Non-existent Product**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "customerEmail": "test@test.com",
    "customerPhone": "081234567890",
    "productId": 99999
  }'
```
Expected: Product not found error

## 📊 7. Performance Testing

### Using Apache Bench (ab)

```bash
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:8080/api/products

# Test with POST
ab -n 100 -c 10 -p order.json -T application/json \
  http://localhost:8080/api/orders
```

### Using wrk

```bash
# Install wrk
sudo apt install wrk

# Test GET endpoint
wrk -t4 -c100 -d30s http://localhost:8080/api/products

# Results will show:
# - Requests/sec
# - Latency
# - Transfer/sec
```

## 🔐 8. Security Testing

### Test CORS

```bash
curl -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:8080/api/orders
```

Expected: CORS headers in response

### Test SQL Injection (Should be prevented)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test'; DROP TABLE orders; --",
    "customerEmail": "test@test.com",
    "customerPhone": "081234567890",
    "productId": 1
  }'
```

Expected: Input sanitized, no SQL injection

## 📝 9. Automated Testing Script

Buat file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api"

echo "🧪 Testing AURA EV API..."

# Test 1: Get Categories
echo "\n1️⃣ Testing GET /categories"
curl -s $BASE_URL/categories | jq '.success'

# Test 2: Get Products
echo "\n2️⃣ Testing GET /products"
curl -s $BASE_URL/products | jq '.success'

# Test 3: Create Order
echo "\n3️⃣ Testing POST /orders"
curl -s -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@test.com",
    "customerPhone": "081234567890",
    "productId": 1,
    "color": "#000000",
    "address": "Jakarta"
  }' | jq '.success'

# Test 4: Get Orders
echo "\n4️⃣ Testing GET /orders"
curl -s $BASE_URL/orders | jq '.success'

echo "\n✅ All tests completed!"
```

Jalankan:
```bash
chmod +x test-api.sh
./test-api.sh
```

## 🎯 10. Health Check Endpoint

Tambahkan di `AuraEvApplication.java`:

```java
@GetMapping("/health")
public ResponseEntity<Map<String, String>> health() {
    Map<String, String> health = new HashMap<>();
    health.put("status", "UP");
    health.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(health);
}
```

Test:
```bash
curl http://localhost:8080/api/health
```

---

**Happy Testing! 🧪**
