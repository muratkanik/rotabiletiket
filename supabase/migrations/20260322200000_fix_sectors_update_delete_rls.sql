-- Add missing UPDATE and DELETE policies to sectors table
CREATE POLICY "Anon Update Sectors" ON sectors FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon Delete Sectors" ON sectors FOR DELETE TO anon USING (true);
CREATE POLICY "Enable all access for authenticated users sectors" ON sectors FOR ALL TO authenticated USING (true) WITH CHECK (true);
