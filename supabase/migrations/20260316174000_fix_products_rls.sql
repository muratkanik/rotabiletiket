-- Fix RLS for products

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;

CREATE POLICY "Enable all access for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);

-- Same for translations
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON product_translations;
DROP POLICY IF EXISTS "Enable read access for all users" ON product_translations;

CREATE POLICY "Enable all access for authenticated users" ON product_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON product_translations FOR SELECT USING (true);
