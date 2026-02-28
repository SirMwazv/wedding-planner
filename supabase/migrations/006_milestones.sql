-- Add milestone fields to tasks table
-- is_milestone: flags a task as a milestone for the jubilee line
-- sort_order: controls sequencing on the timeline (lower = earlier)

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS is_milestone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON public.tasks(event_id, is_milestone, sort_order);
