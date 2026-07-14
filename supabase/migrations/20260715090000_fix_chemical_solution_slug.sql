-- Correct the Turkish draft slug without rewriting the already-applied seed migration.
UPDATE public.solution_pages
SET slug = 'kimyasala-dayanikli-fici-ve-ibc-etiketleri',
    updated_at = NOW()
WHERE slug = 'kimyasala-dayanikli-fass-ve-ibc-etiketleri';
