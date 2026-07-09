// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = 'https://yufbvyrxxkqsdtgbrqrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZmJ2eXJ4eGtxc2R0Z2JycXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Nzc3MjksImV4cCI6MjA5NTM1MzcyOX0.BB7B8yldEIw5f4n-9FlC8u3qxuWy2F6svrZtymdiMwo';

// Simpan library dulu sebelum di-overwrite
const _supabaseLib = window.supabase;

// Buat client dengan nama berbeda agar tidak bentrok
const _supabaseClient = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Set window.supabase ke CLIENT (bukan library)
// script.js memanggil window.supabase.from(...) jadi harus client
window.supabase = _supabaseClient;
window.supabaseClient = _supabaseClient;

console.log('✅ Supabase connected!');