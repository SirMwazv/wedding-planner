-- ============================================================
-- Roora — Cultural Wedding Planning Platform
-- Database Schema (Supabase / PostgreSQL)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. COUPLES
-- ============================================================
create table public.couples (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  primary_currency text not null default 'ZAR',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.couples enable row level security;

-- Helper: check if user is a member of a couple
create or replace function public.is_couple_member(couple_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.couple_members
    where couple_id = couple_uuid and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create policy "Couple members can view their couple"
  on public.couples for select
  using (public.is_couple_member(id));

create policy "Couple members can update their couple"
  on public.couples for update
  using (public.is_couple_member(id));

create policy "Authenticated users can create couples"
  on public.couples for insert
  with check (auth.uid() is not null);

-- ============================================================
-- 3. COUPLE MEMBERS
-- ============================================================
create type public.member_role as enum ('bride', 'groom', 'planner', 'family');

create table public.couple_members (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'bride',
  created_at timestamptz default now() not null,
  unique(couple_id, user_id)
);

alter table public.couple_members enable row level security;

create policy "Users can view their own memberships"
  on public.couple_members for select
  using (user_id = auth.uid());

create policy "Users can view co-members"
  on public.couple_members for select
  using (
    couple_id in (
      select couple_id from public.couple_members where user_id = auth.uid()
    )
  );

create policy "Authenticated users can create memberships"
  on public.couple_members for insert
  with check (auth.uid() is not null);

-- ============================================================
-- 4. EVENTS (ceremonies)
-- ============================================================
create type public.event_type as enum (
  'white_wedding',
  'lobola',
  'traditional',
  'kitchen_party',
  'umembeso',
  'umabo',
  'kurova_guva',
  'engagement',
  'other'
);

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null,
  type public.event_type not null default 'other',
  date date,
  location text,
  currency text not null default 'ZAR',
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "Couple members can view their events"
  on public.events for select
  using (public.is_couple_member(couple_id));

create policy "Couple members can create events"
  on public.events for insert
  with check (public.is_couple_member(couple_id));

create policy "Couple members can update events"
  on public.events for update
  using (public.is_couple_member(couple_id));

create policy "Couple members can delete events"
  on public.events for delete
  using (public.is_couple_member(couple_id));

-- ============================================================
-- 5. SUPPLIERS
-- ============================================================
create type public.supplier_status as enum (
  'researching',
  'contacted',
  'quoted',
  'negotiating',
  'booked',
  'rejected'
);

create table public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  category text,
  contact_name text,
  phone text,
  whatsapp_number text,
  instagram_handle text,
  email text,
  notes text,
  status public.supplier_status not null default 'researching',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.suppliers enable row level security;

-- Helper: check event belongs to user's couple
create or replace function public.is_event_member(event_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.events e
    join public.couple_members cm on cm.couple_id = e.couple_id
    where e.id = event_uuid and cm.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create policy "Event members can view suppliers"
  on public.suppliers for select
  using (public.is_event_member(event_id));

create policy "Event members can create suppliers"
  on public.suppliers for insert
  with check (public.is_event_member(event_id));

create policy "Event members can update suppliers"
  on public.suppliers for update
  using (public.is_event_member(event_id));

create policy "Event members can delete suppliers"
  on public.suppliers for delete
  using (public.is_event_member(event_id));

-- ============================================================
-- 6. QUOTES
-- ============================================================
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'ZAR',
  deposit_required numeric(12, 2) default 0,
  deposit_paid numeric(12, 2) default 0,
  outstanding_balance numeric(12, 2) generated always as (amount - deposit_paid) stored,
  due_date date,
  quote_file_url text,
  notes text,
  is_accepted boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.quotes enable row level security;

-- Helper: check supplier belongs to user's event/couple
create or replace function public.is_supplier_member(supplier_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.suppliers s
    join public.events e on e.id = s.event_id
    join public.couple_members cm on cm.couple_id = e.couple_id
    where s.id = supplier_uuid and cm.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create policy "Supplier members can view quotes"
  on public.quotes for select
  using (public.is_supplier_member(supplier_id));

create policy "Supplier members can create quotes"
  on public.quotes for insert
  with check (public.is_supplier_member(supplier_id));

create policy "Supplier members can update quotes"
  on public.quotes for update
  using (public.is_supplier_member(supplier_id));

create policy "Supplier members can delete quotes"
  on public.quotes for delete
  using (public.is_supplier_member(supplier_id));

-- ============================================================
-- 7. PAYMENTS
-- ============================================================
create type public.payment_method as enum (
  'cash',
  'bank_transfer',
  'mobile_money',
  'card',
  'other'
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null default 'ZAR',
  paid_at timestamptz default now() not null,
  method public.payment_method not null default 'bank_transfer',
  reference text,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.payments enable row level security;

-- Helper: check quote belongs to user's supplier/event/couple
create or replace function public.is_quote_member(quote_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.quotes q
    join public.suppliers s on s.id = q.supplier_id
    join public.events e on e.id = s.event_id
    join public.couple_members cm on cm.couple_id = e.couple_id
    where q.id = quote_uuid and cm.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create policy "Quote members can view payments"
  on public.payments for select
  using (public.is_quote_member(quote_id));

create policy "Quote members can create payments"
  on public.payments for insert
  with check (public.is_quote_member(quote_id));

create policy "Quote members can delete payments"
  on public.payments for delete
  using (public.is_quote_member(quote_id));

-- ============================================================
-- 8. TASKS
-- ============================================================
create type public.task_status as enum ('pending', 'in_progress', 'completed');

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status public.task_status not null default 'pending',
  assigned_to uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

create policy "Event members can view tasks"
  on public.tasks for select
  using (public.is_event_member(event_id));

create policy "Event members can create tasks"
  on public.tasks for insert
  with check (public.is_event_member(event_id));

create policy "Event members can update tasks"
  on public.tasks for update
  using (public.is_event_member(event_id));

create policy "Event members can delete tasks"
  on public.tasks for delete
  using (public.is_event_member(event_id));

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_couple_members_user on public.couple_members(user_id);
create index idx_couple_members_couple on public.couple_members(couple_id);
create index idx_events_couple on public.events(couple_id);
create index idx_suppliers_event on public.suppliers(event_id);
create index idx_suppliers_status on public.suppliers(status);
create index idx_quotes_supplier on public.quotes(supplier_id);
create index idx_payments_quote on public.payments(quote_id);
create index idx_tasks_event on public.tasks(event_id);
create index idx_tasks_status on public.tasks(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.couples
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.events
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.suppliers
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.quotes
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.tasks
  for each row execute function public.update_updated_at();

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid() is not null
  );

create policy "Authenticated users can view their documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid() is not null
  );
