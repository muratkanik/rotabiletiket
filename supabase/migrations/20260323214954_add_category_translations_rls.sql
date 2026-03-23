-- Add RLS policies for category_translations table

-- Enable RLS just in case it wasn't enabled
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;

-- 1. Allow public to SELECT
CREATE POLICY "Public Read Category Translations" 
ON public.category_translations 
FOR SELECT 
TO public 
USING (true);

-- 2. Allow anon to INSERT
CREATE POLICY "Anon Insert Category Translations" 
ON public.category_translations 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 3. Allow anon to UPDATE
CREATE POLICY "Anon Update Category Translations" 
ON public.category_translations 
FOR UPDATE 
TO anon 
USING (true);

-- 4. Allow authenticated to do ALL
CREATE POLICY "Enable all access for authenticated users" 
ON public.category_translations 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
