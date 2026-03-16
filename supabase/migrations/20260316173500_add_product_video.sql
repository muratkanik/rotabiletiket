-- Add video_url support to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
