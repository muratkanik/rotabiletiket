-- Add RLS policies for sector_translations table

-- Enable RLS just in case it wasn't enabled (though it already was)
ALTER TABLE public.sector_translations ENABLE ROW LEVEL SECURITY;

-- 1. Allow public to SELECT
CREATE POLICY "Public Read Sector Translations" 
ON public.sector_translations 
FOR SELECT 
TO public 
USING (true);

-- 2. Allow anon to INSERT
CREATE POLICY "Anon Insert Sector Translations" 
ON public.sector_translations 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 3. Allow anon to UPDATE
CREATE POLICY "Anon Update Sector Translations" 
ON public.sector_translations 
FOR UPDATE 
TO anon 
USING (true);

-- 4. Allow authenticated to do ALL
CREATE POLICY "Enable all access for authenticated users" 
ON public.sector_translations 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
