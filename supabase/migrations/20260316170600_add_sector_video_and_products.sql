-- Add video_url support to sectors
ALTER TABLE sectors ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create joining table for Sector <-> Product relationship
CREATE TABLE IF NOT EXISTS sector_products (
    sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(sector_id, product_id)
);

ALTER TABLE sector_products ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Allow public read access to linked products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sector_products' AND policyname = 'Allow anon read sector_products'
    ) THEN
        CREATE POLICY "Allow anon read sector_products" 
        ON sector_products FOR SELECT TO anon USING (true);
    END IF;

    -- Allow admin full access to linked products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sector_products' AND policyname = 'Allow admin all sector_products'
    ) THEN
        CREATE POLICY "Allow admin all sector_products" 
        ON sector_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
