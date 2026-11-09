ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS seo_score INTEGER,
    ADD COLUMN IF NOT EXISTS seo_score_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS source_fingerprint TEXT,
    ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS articles_review_status_idx ON public.articles (review_status, is_published, created_at DESC);

ALTER TABLE public.ai_content_generation_runs
    ADD COLUMN IF NOT EXISTS article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL;
