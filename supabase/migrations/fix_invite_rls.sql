-- Helper function to find a couple by invite code without exposing all couples via RLS
-- This is SECURITY DEFINER, so it runs with the privileges of the creator (admin-like), bypassing RLS.

create or replace function public.get_couple_by_invite_code(code_input text)
returns table (id uuid, name text)
language plpgsql
security definer
as $$
begin
  return query 
  select c.id, c.name 
  from public.couples c 
  where c.invite_code = code_input;
end;
$$;
