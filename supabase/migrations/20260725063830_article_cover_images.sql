-- Add article-specific cover images for published knowledge-base content.
UPDATE public.articles
SET image_url = '/img/articles/ppwr-carton-packaging.jpg', updated_at = now()
WHERE id = '71ac50cf-9721-4b83-940d-8bdd776156fe';

UPDATE public.articles
SET image_url = '/img/articles/thermal-label-prices-2026.jpg', updated_at = now()
WHERE id = 'd91a4d87-7c5d-434f-8691-d1cddd212e74';

-- Correct an existing cover path that pointed to a non-existent extension.
UPDATE public.articles
SET image_url = '/img/blog/printer-guide.jpg', updated_at = now()
WHERE id = '2d7731ac-3db9-419c-863a-c1bc7678fb6d';
