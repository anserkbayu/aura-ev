DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders" ON orders 
FOR INSERT TO anon 
WITH CHECK (true);