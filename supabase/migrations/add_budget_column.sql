-- Add total_budget column to couples table
ALTER TABLE public.couples ADD COLUMN total_budget numeric DEFAULT 0;
