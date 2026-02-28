-- Create inspiration_photos table for the "Inspiration" board feature
-- Users can upload images as a playground for wedding ideas and themes

CREATE TABLE IF NOT EXISTS public.inspiration_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_path text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.inspiration_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view their inspiration photos"
  ON public.inspiration_photos FOR SELECT
  USING (public.is_couple_member(couple_id));

CREATE POLICY "Couple members can insert inspiration photos"
  ON public.inspiration_photos FOR INSERT
  WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Couple members can delete inspiration photos"
  ON public.inspiration_photos FOR DELETE
  USING (public.is_couple_member(couple_id));

CREATE INDEX idx_inspiration_photos_couple ON public.inspiration_photos(couple_id);

-- Create inspiration storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspiration', 'inspiration', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload inspiration photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspiration'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Anyone can view inspiration photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration');

CREATE POLICY "Authenticated users can delete their inspiration photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inspiration'
    AND auth.uid() IS NOT NULL
  );
