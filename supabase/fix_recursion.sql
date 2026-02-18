-- Fix infinite recursion in couple_members policy (RLS Error 42P17)

-- 1. Create helper function to get user's couples without triggering RLS (Security Definer bypasses RLS)
create or replace function public.get_my_couple_ids()
returns setof uuid as $$
begin
  return query
  select couple_id from public.couple_members
  where user_id = auth.uid();
end;
$$ language plpgsql security definer stable;

-- 2. Drop the problematic recursive policy
drop policy if exists "Users can view co-members" on public.couple_members;

-- 3. Re-create the policy using the helper function
create policy "Users can view co-members"
  on public.couple_members for select
  using (
    couple_id in ( select public.get_my_couple_ids() )
  );
