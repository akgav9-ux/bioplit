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
  is_active boolean not null default true,
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

-- Переносим исходные карточки сайта в CMS, чтобы первый добавленный элемент
-- не заменил весь существующий каталог или список работ.
insert into public.catalog_items (title, title_short, category, image_url, sort_order, is_active)
select v.title, v.title_short, v.category, v.image_url, v.sort_order, true
from (values
  ('ФАСАДНАЯ ПЛИТКА И КАМЕНЬ','Фасадная плитка и камень','facade','/images/catalog/facade/1.jpg',1),
  ('ЦОКОЛЬНЫЕ ПАНЕЛИ','Цокольные панели','cokol','/images/catalog/cokol/1.jpg',2),
  ('БРУСЧАТКА И ТРОТУАРНАЯ ПЛИТКА','Брусчатка и тротуарная плитка','brus','/images/catalog/brus/1.jpg',3),
  ('ТАКТИЛЬНАЯ ПЛИТКА','Тактильная плитка','tactile','/images/catalog/tactile/1.jpg',4),
  ('БОРДЮРЫ И ВОДОСТОКИ','Бордюры и водостоки','bord','/images/catalog/bord/1.jpg',5),
  ('ЦВЕТОЧНЫЕ ВАЗОНЫ','Цветочные вазоны','vazon','/images/catalog/vazon/1.jpg',6)
) as v(title,title_short,category,image_url,sort_order)
where not exists (select 1 from public.catalog_items c where c.category = v.category);

insert into public.works (title, category, description, image_url, video_url, year, location, sort_order, is_active)
select 'Проект #' || n, 'Наши работы', 'Описание проекта', '/images/works/work' || n || '.jpg',
       case when n = 1 then 'https://rutube.ru/play/embed/2bb783d89c63eac106018c32466b6159/' else null end,
       '2025', 'СПб', n, true
from generate_series(1,20) as n
where not exists (select 1 from public.works w where w.title = 'Проект #' || n);

insert into public.services (title, description, sort_order, is_active)
select v.title, v.description, v.sort_order, true
from (values
  ('Монтаж фасада под ключ','Подсистема, утеплитель, плитка, затирка. Бригада 4 чел, от 80 м² за 5 дней.',1),
  ('Укладка брусчатки','Подготовка основания, геотекстиль, вибротрамбовка. Гарантия на просадку 2 года.',2),
  ('Бесплатный замер и 3D-визуализация','Выезд инженера по СПб бесплатно, покажем как будет выглядеть ваш дом.',3)
) as v(title,description,sort_order)
where not exists (select 1 from public.services s where s.title = v.title);
