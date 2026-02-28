-- Rename instagram_handle to social_media
-- This broadens the column to support any social media link (IG, TikTok, website, etc.)

ALTER TABLE public.suppliers
  RENAME COLUMN instagram_handle TO social_media;
