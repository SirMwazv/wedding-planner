-- Add quoted_amount and paid_amount to suppliers table
-- These are the supplier-level amounts that feed into the budget page.
-- quoted_amount = the total quoted cost for this supplier
-- paid_amount = the total amount actually paid to this supplier

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS quoted_amount numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_amount numeric(12, 2) NOT NULL DEFAULT 0;
