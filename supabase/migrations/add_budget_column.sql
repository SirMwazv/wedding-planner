-- Move budget from couples to events (per-ceremony budgets)
ALTER TABLE public.events ADD COLUMN budget numeric DEFAULT 0;
