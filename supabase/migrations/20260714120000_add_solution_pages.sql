-- Technical solution pages for localized B2B content and SEO landing pages.
CREATE TABLE IF NOT EXISTS public.solution_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    page_kind TEXT NOT NULL DEFAULT 'solution' CHECK (page_kind IN ('solution', 'industry', 'guide')),
    title TEXT NOT NULL,
    excerpt TEXT,
    content_html TEXT,
    technical_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    proof_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.solution_page_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_page_id UUID NOT NULL REFERENCES public.solution_pages(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content_html TEXT,
    technical_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (solution_page_id, language_code),
    UNIQUE (language_code, slug)
);

CREATE INDEX IF NOT EXISTS solution_pages_published_order_idx
    ON public.solution_pages (is_published, display_order);

CREATE INDEX IF NOT EXISTS solution_page_translations_slug_idx
    ON public.solution_page_translations (language_code, slug);

ALTER TABLE public.solution_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_page_translations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'solution_pages'
          AND policyname = 'Public read published solution pages'
    ) THEN
        CREATE POLICY "Public read published solution pages"
            ON public.solution_pages FOR SELECT TO anon, authenticated
            USING (is_published = true OR auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'solution_pages'
          AND policyname = 'Authenticated manage solution pages'
    ) THEN
        CREATE POLICY "Authenticated manage solution pages"
            ON public.solution_pages FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'solution_page_translations'
          AND policyname = 'Public read solution page translations'
    ) THEN
        CREATE POLICY "Public read solution page translations"
            ON public.solution_page_translations FOR SELECT TO anon, authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.solution_pages page
                    WHERE page.id = solution_page_id
                      AND (page.is_published = true OR auth.role() = 'authenticated')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'solution_page_translations'
          AND policyname = 'Authenticated manage solution page translations'
    ) THEN
        CREATE POLICY "Authenticated manage solution page translations"
            ON public.solution_page_translations FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;
