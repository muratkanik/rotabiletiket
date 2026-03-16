-- Add video_url support to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS video_url TEXT;
