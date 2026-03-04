CREATE POLICY "Enable ALL for authenticated users on product_translations" ON product_translations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable ALL for authenticated users on product_images" ON product_images
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
