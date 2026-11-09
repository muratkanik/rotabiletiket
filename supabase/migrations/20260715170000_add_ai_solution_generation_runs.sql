CREATE TABLE IF NOT EXISTS public.ai_content_generation_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_date date NOT NULL,
    content_type text NOT NULL,
    status text NOT NULL DEFAULT 'started',
    solution_page_id uuid REFERENCES public.solution_pages(id) ON DELETE SET NULL,
    keyword text,
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (run_date, content_type)
);

ALTER TABLE public.ai_content_generation_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_content_generation_runs' AND policyname = 'Service role manages AI generation runs') THEN
        CREATE POLICY "Service role manages AI generation runs" ON public.ai_content_generation_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;
