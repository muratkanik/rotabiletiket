-- Add missing DELETE policy to categories table
CREATE POLICY "Anon Delete Categories" ON categories FOR DELETE TO anon USING (true);
CREATE POLICY "Enable all access for authenticated users categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
