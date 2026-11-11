-- Allow the new large-format paving category in catalog products.
alter table public.catalog_products
  drop constraint if exists catalog_products_category_check;

alter table public.catalog_products
  add constraint catalog_products_category_check
  check (category in ('facade', 'cokol', 'brus', 'large-format', 'tactile', 'bord', 'vazon'));
