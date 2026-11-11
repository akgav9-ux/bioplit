-- Выполнить один раз в Supabase Dashboard -> SQL Editor.
alter table public.catalog_products
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists width text,
  add column if not exists length text,
  add column if not exists thickness text;

alter table public.catalog_items
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists width text,
  add column if not exists length text,
  add column if not exists thickness text;

update public.catalog_products set images = jsonb_build_array(image_url)
where image_url is not null and image_url <> '' and (images is null or images = '[]'::jsonb);
update public.catalog_items set images = jsonb_build_array(image_url)
where image_url is not null and image_url <> '' and (images is null or images = '[]'::jsonb);
