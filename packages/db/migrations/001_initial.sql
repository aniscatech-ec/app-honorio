-- ============================================================
-- Raíces Familiares — Schema Supabase
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── families ──────────────────────────────────────────
create table public.families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

-- ── profiles (extends auth.users) ─────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  family_id   uuid references public.families(id) on delete set null,
  role        text not null default 'pending' check (role in ('admin','member','pending')),
  name        text not null default '',
  last        text not null default '',
  email       text not null default '',
  created_at  timestamptz default now()
);

-- ── persons ───────────────────────────────────────────
create table public.persons (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  name        text not null,
  last        text not null default '',
  gender      text not null default 'M' check (gender in ('M','F')),
  born        date,
  died        date,
  born_place  text,
  died_place  text,
  nationality text,
  address     text,
  phone       text,
  email       text,
  country     text,
  city        text,
  lat         numeric(10,6),
  lng         numeric(10,6),
  is_root     boolean not null default false,
  cedula      text,
  profession  text,
  notes       text,
  photo_url   text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

create index persons_family_id_idx on public.persons(family_id);

-- ── links ─────────────────────────────────────────────
create table public.links (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  from_id     uuid not null references public.persons(id) on delete cascade,
  to_id       uuid not null references public.persons(id) on delete cascade,
  type        text not null,
  created_at  timestamptz default now(),
  constraint links_no_self check (from_id <> to_id)
);

create index links_family_id_idx on public.links(family_id);
create index links_from_id_idx   on public.links(from_id);
create index links_to_id_idx     on public.links(to_id);

-- ── events ────────────────────────────────────────────
create table public.family_events (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  person_id   uuid not null references public.persons(id) on delete cascade,
  type        text not null check (type in (
    'nacimiento','bautizo','matrimonio','divorcio',
    'fallecimiento','graduación','viaje','otro'
  )),
  date        date,
  place       text,
  description text,
  lat         numeric(10,6),
  lng         numeric(10,6),
  created_at  timestamptz default now()
);

create index events_family_id_idx on public.family_events(family_id);
create index events_person_id_idx on public.family_events(person_id);

-- ── event_documents (attachments) ─────────────────────
create table public.event_documents (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.family_events(id) on delete cascade,
  name        text not null,
  url         text not null,
  mime_type   text,
  created_at  timestamptz default now()
);

-- ── person_documents ──────────────────────────────────
create table public.person_documents (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references public.persons(id) on delete cascade,
  name        text not null,
  url         text not null,
  mime_type   text,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.families         enable row level security;
alter table public.profiles         enable row level security;
alter table public.persons          enable row level security;
alter table public.links            enable row level security;
alter table public.family_events    enable row level security;
alter table public.event_documents  enable row level security;
alter table public.person_documents enable row level security;

-- Helper: get current user's family_id
create or replace function public.my_family_id()
returns uuid language sql security definer stable as $$
  select family_id from public.profiles where id = auth.uid()
$$;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select role = 'admin' from public.profiles where id = auth.uid()
$$;

-- families: member can read own family; admin can do anything
create policy "read_own_family" on public.families
  for select using (id = public.my_family_id());

create policy "admin_all_families" on public.families
  for all using (public.is_admin());

-- profiles: users can read own; admin reads all
create policy "read_own_profile" on public.profiles
  for select using (id = auth.uid());

create policy "admin_all_profiles" on public.profiles
  for all using (public.is_admin());

-- persons: members of same family can read; admin can all
create policy "family_read_persons" on public.persons
  for select using (family_id = public.my_family_id());

create policy "family_insert_persons" on public.persons
  for insert with check (family_id = public.my_family_id() and public.is_admin());

create policy "family_update_persons" on public.persons
  for update using (family_id = public.my_family_id() and public.is_admin());

create policy "family_delete_persons" on public.persons
  for delete using (family_id = public.my_family_id() and public.is_admin());

-- links: same pattern
create policy "family_read_links" on public.links
  for select using (family_id = public.my_family_id());

create policy "family_write_links" on public.links
  for all using (family_id = public.my_family_id() and public.is_admin());

-- events
create policy "family_read_events" on public.family_events
  for select using (family_id = public.my_family_id());

create policy "family_write_events" on public.family_events
  for all using (family_id = public.my_family_id() and public.is_admin());

-- documents
create policy "family_docs_event" on public.event_documents
  for select using (
    event_id in (select id from public.family_events where family_id = public.my_family_id())
  );

create policy "family_docs_person" on public.person_documents
  for select using (
    person_id in (select id from public.persons where family_id = public.my_family_id())
  );

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, last, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'last', ''),
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE buckets
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('photos',     'photos',    true),
  ('documents',  'documents', false)
on conflict do nothing;

create policy "public_photos" on storage.objects
  for select using (bucket_id = 'photos');

create policy "auth_upload_photos" on storage.objects
  for insert with check (
    bucket_id = 'photos' and auth.role() = 'authenticated'
  );

create policy "auth_docs" on storage.objects
  for all using (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );
