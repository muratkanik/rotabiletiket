-- Secure, admin-free review workflow for AI-generated article drafts.
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS review_token_hash TEXT,
    ADD COLUMN IF NOT EXISTS review_token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
    ADD COLUMN IF NOT EXISTS review_email_status TEXT,
    ADD COLUMN IF NOT EXISTS review_email_error TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS articles_review_token_hash_idx
    ON public.articles (review_token_hash)
    WHERE review_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS articles_ai_draft_idx
    ON public.articles (ai_generated, review_status, created_at DESC);
