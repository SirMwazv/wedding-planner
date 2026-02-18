-- Add invite_code to couples table
ALTER TABLE public.couples 
ADD COLUMN invite_code text DEFAULT substring(md5(random()::text) from 0 for 7);

-- Ensure invite_code is unique
CREATE UNIQUE INDEX idx_couples_invite_code ON public.couples(invite_code);

-- Backfill existing couples with unique codes (if default didn't catch them uniquely, though highly likely it did for small dataset)
-- But the default applies to NEW rows. We need to update existing ones.
UPDATE public.couples 
SET invite_code = substring(md5(random()::text || id::text) from 0 for 7) 
WHERE invite_code IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE public.couples 
ALTER COLUMN invite_code SET NOT NULL;
