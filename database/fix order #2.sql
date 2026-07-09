-- Fix trigger agar bisa dijalankan oleh anon
ALTER FUNCTION generate_order_number() SECURITY DEFINER;

-- Pastikan sequence bisa diakses
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO anon;
GRANT INSERT ON orders TO anon;