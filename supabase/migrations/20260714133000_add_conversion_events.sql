-- Privacy-conscious conversion events for technical SEO and B2B funnel reporting.
CREATE TABLE IF NOT EXISTS public.conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    path TEXT NOT NULL,
    locale TEXT,
    solution_slug TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversion_events_name_created_at_idx
    ON public.conversion_events (event_name, created_at DESC);

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'conversion_events'
          AND policyname = 'Public can record conversion events'
    ) THEN
        CREATE POLICY "Public can record conversion events"
            ON public.conversion_events FOR INSERT TO anon, authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'conversion_events'
          AND policyname = 'Authenticated users can read conversion events'
    ) THEN
        CREATE POLICY "Authenticated users can read conversion events"
            ON public.conversion_events FOR SELECT TO authenticated
            USING (true);
    END IF;
END $$;
