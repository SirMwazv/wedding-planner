-- Allow couple members to view each other's profiles
-- so we can show display_name in task assignment dropdowns
CREATE POLICY "Couple members can view co-member profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT cm.user_id FROM public.couple_members cm
      WHERE cm.couple_id IN (SELECT public.get_my_couple_ids())
    )
    OR auth.uid() = id
  );
