# Panduan Hosting AURA EV (Backend Java + Frontend)

File yang sudah disiapkan di zip ini:
- `backend/Dockerfile` → supaya Railway/Render bisa build & jalankan backend Java otomatis
- `backend/.dockerignore` → build lebih cepat
- `backend/src/main/resources/application.properties` → sudah diubah pakai Environment Variable (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `PORT`), bukan password hardcode lagi
- `frontend/admin-script.js` → sudah otomatis pindah antara `localhost:8080` (saat development) dan URL backend hosting (setelah kamu isi)

## ⚠️ Ganti password Supabase kamu
Password database (`dbauraev30#1`) sempat tertulis polos di `application.properties` versi lama. Sebelum push ke GitHub (apalagi kalau repo-nya public), sebaiknya:
1. Buka **Supabase → Project Settings → Database**
2. Reset/ganti password database
3. Nanti password baru dimasukkan lewat Environment Variable di Railway (langkah di bawah), bukan ditulis di kode

## 1. Push ke GitHub
```bash
git init
git add .
git commit -m "ready for hosting"
```
Buat repo baru di GitHub, lalu push.

## 2. Deploy backend ke Railway
1. Buka https://railway.app → login GitHub
2. **New Project → Deploy from GitHub repo** → pilih repo ini
3. Di pengaturan project, set **Root Directory** ke `backend` (karena project kamu monorepo, backend-nya ada di subfolder)
4. Railway otomatis pakai `backend/Dockerfile` untuk build
5. Buka tab **Variables**, tambahkan:
   - `DB_URL` = `jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
   - `DB_USERNAME` = `postgres.yufbvyrxxkqsdtgbrqrh`
   - `DB_PASSWORD` = *(password baru dari Supabase)*
6. Deploy → Railway kasih URL publik, contoh: `https://aura-ev-backend-production.up.railway.app`
7. Cek dengan buka: `https://aura-ev-backend-production.up.railway.app/api/products` di browser — kalau muncul JSON data produk, berarti sukses

## 3. Isi URL backend ke frontend
Buka `frontend/admin-script.js`, cari baris ini:
```js
: "https://URL_BACKEND_RAILWAY_KAMU.up.railway.app/api";
```
Ganti `URL_BACKEND_RAILWAY_KAMU.up.railway.app` dengan URL asli dari Railway (langkah 2.6 di atas).

## 4. Deploy frontend ke Vercel
1. Buka https://vercel.com → login GitHub
2. **New Project** → pilih repo ini → set **Root Directory** ke `frontend`
3. Deploy (tidak perlu build command, ini HTML statis)
4. Dapat URL, contoh: `https://aura-ev.vercel.app`

## 5. Test
- Buka `https://aura-ev.vercel.app/admin.html`
- Login admin → cek halaman Statistik, Produk, Pesanan — data dari Supabase harus otomatis muncul, **tanpa kamu jalankan `mvn spring-boot:run` di laptop sendiri**, karena backend-nya sudah jalan 24 jam di Railway

## Catatan
- CORS di backend (`CorsConfig`, ada di dalam `AuraEvApplication.java`) masih `allowedOrigins("*")` — artinya semua domain boleh akses API. Ini oke untuk mulai, tapi kalau mau lebih aman nanti bisa dibatasi hanya ke domain Vercel kamu.
- Kalau Railway free tier habis, alternatif: **Render.com** — caranya mirip, tinggal pilih "New Web Service", root directory `backend`, Render otomatis deteksi Dockerfile-nya.
