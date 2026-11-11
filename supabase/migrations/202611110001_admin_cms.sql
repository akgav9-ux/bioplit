-- БИОПЛИТ: закрытая CMS.
-- Выполнить целиком в Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_short text,
  category text,
  description text,
  image_url text,
  price numeric(12,2),
  unit text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  image_url text,
  video_url text,
  year text,
  location text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(12,2),
  unit text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  price numeric(12,2) not null default 0,
  unit text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text,
  value text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.catalog_items enable row level security;
alter table public.works enable row level security;
alter table public.services enable row level security;
alter table public.price_items enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list" on public.admin_users
for select to authenticated using (public.is_site_admin());

-- Public visitors can only read published content. Only admins can change it.
do $$
declare t text;
begin
  foreach t in array array['catalog_items','works','services','price_items','site_settings'] loop
    execute format('drop policy if exists "Public read active %1$s" on public.%1$I', t);
    execute format('create policy "Public read active %1$s" on public.%1$I for select to anon, authenticated using (coalesce(is_active, true) = true)', t);
    execute format('drop policy if exists "Admins manage %1$s" on public.%1$I', t);
    execute format('create policy "Admins manage %1$s" on public.%1$I for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin())', t);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select on public.catalog_items, public.works, public.services, public.price_items, public.site_settings to anon, authenticated;
grant insert, update, delete on public.catalog_items, public.works, public.services, public.price_items, public.site_settings to authenticated;
grant select on public.admin_users to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media" on storage.objects
for select to anon, authenticated using (bucket_id = 'site-media');

drop policy if exists "Admins upload site media" on storage.objects;
create policy "Admins upload site media" on storage.objects
for insert to authenticated with check (bucket_id = 'site-media' and public.is_site_admin());

drop policy if exists "Admins update site media" on storage.objects;
create policy "Admins update site media" on storage.objects
for update to authenticated using (bucket_id = 'site-media' and public.is_site_admin())
with check (bucket_id = 'site-media' and public.is_site_admin());

drop policy if exists "Admins delete site media" on storage.objects;
create policy "Admins delete site media" on storage.objects
for delete to authenticated using (bucket_id = 'site-media' and public.is_site_admin());

-- updated_at is maintained automatically.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array['catalog_items','works','services','price_items','site_settings'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
