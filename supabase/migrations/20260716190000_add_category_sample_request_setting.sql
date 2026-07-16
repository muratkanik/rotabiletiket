ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS sample_request_enabled BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.categories
SET sample_request_enabled = TRUE
WHERE slug IN (
    'etiket-cozumleri-ile-marka-bilinirliginizi-artirin',
    'ribon-fiyatlari-ve-cesitleri-ile-kaliteyi-yakalayin'
);
