-- Structured technical quote and sample requests for B2B solution pages.
CREATE TABLE IF NOT EXISTS public.rfq_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT NOT NULL DEFAULT 'DE',
    industry TEXT,
    application TEXT,
    surface TEXT,
    temperature_range TEXT,
    chemical_exposure TEXT,
    quantity TEXT,
    technology TEXT,
    solution_slug TEXT,
    message TEXT NOT NULL,
    request_type TEXT NOT NULL DEFAULT 'quote' CHECK (request_type IN ('quote', 'sample', 'technical_support')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'quoted', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rfq_requests_status_created_at_idx
    ON public.rfq_requests (status, created_at DESC);

ALTER TABLE public.rfq_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'rfq_requests'
          AND policyname = 'Public can submit RFQ requests'
    ) THEN
        CREATE POLICY "Public can submit RFQ requests"
            ON public.rfq_requests FOR INSERT TO anon, authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'rfq_requests'
          AND policyname = 'Authenticated users can manage RFQ requests'
    ) THEN
        CREATE POLICY "Authenticated users can manage RFQ requests"
            ON public.rfq_requests FOR ALL TO authenticated
            USING (true) WITH CHECK (true);
    END IF;
END $$;
