-- Individual products inside each catalog category.
create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  article text,
  category text not null check (category in ('facade','cokol','brus','tactile','bord','vazon')),
  description text,
  image_url text,
  price numeric(12,2),
  unit text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_products enable row level security;

drop policy if exists "Public read active catalog_products" on public.catalog_products;
create policy "Public read active catalog_products" on public.catalog_products
for select to anon, authenticated using (is_active = true);

drop policy if exists "Admins manage catalog_products" on public.catalog_products;
create policy "Admins manage catalog_products" on public.catalog_products
for all to authenticated using (public.is_site_admin())
with check (public.is_site_admin());

grant select on public.catalog_products to anon, authenticated;
grant insert, update, delete on public.catalog_products to authenticated;

drop trigger if exists set_updated_at on public.catalog_products;
create trigger set_updated_at before update on public.catalog_products
for each row execute function public.set_updated_at();
