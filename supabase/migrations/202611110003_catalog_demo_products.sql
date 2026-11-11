-- Temporary demonstration catalog products and prices.
-- All prices below are illustrative placeholders and can be edited or deleted in the admin panel.
insert into public.catalog_products
  (title, article, category, description, image_url, price, unit, sort_order, is_active)
select v.title, v.article, v.category, v.description, v.image_url, v.price, v.unit, v.sort_order, true
from (values
  ('Модель #1', 'FACADE-001', 'facade', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/facade/1.jpg', 2450::numeric, 'м²', 1),
  ('Модель #2', 'FACADE-002', 'facade', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/facade/2.jpg', 2750::numeric, 'м²', 2),
  ('Модель #1', 'COKOL-001', 'cokol', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/cokol/1.jpg', 1850::numeric, 'м²', 1),
  ('Модель #1', 'BRUS-001', 'brus', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/brus/1.jpg', 1690::numeric, 'м²', 1),
  ('Модель #1', 'TACTILE-001', 'tactile', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/tactile/1.jpg', 2150::numeric, 'м²', 1),
  ('Модель #1', 'BORD-001', 'bord', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/bord/1.jpg', 490::numeric, 'шт.', 1),
  ('Модель #1', 'VAZON-001', 'vazon', 'Демонстрационная позиция. Цена предварительная.', '/images/catalog/vazon/1.jpg', 7200::numeric, 'шт.', 1)
) as v(title, article, category, description, image_url, price, unit, sort_order)
where not exists (
  select 1 from public.catalog_products existing where existing.article = v.article
);
