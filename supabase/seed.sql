-- ==============================================================================
-- SCRAPPY LOCAL SEED DATA
-- Baseline synthetic fixture data for local development
-- ==============================================================================

-- 1. Default Categories
INSERT INTO public.categories (id, name, slug) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones'),
  ('c1000000-0000-0000-0000-000000000002', 'Laptops', 'laptops'),
  ('c1000000-0000-0000-0000-000000000003', 'Audio', 'audio')
ON CONFLICT (slug) DO NOTHING;

-- 2. Default Brands
INSERT INTO public.brands (id, name, slug) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Apple', 'apple'),
  ('b1000000-0000-0000-0000-000000000002', 'Sony', 'sony'),
  ('b1000000-0000-0000-0000-000000000003', 'Samsung', 'samsung')
ON CONFLICT (slug) DO NOTHING;

-- 3. Merchants
INSERT INTO public.merchants (id, name, slug, source_id, base_url, trust_score) VALUES
  ('m1000000-0000-0000-0000-000000000001', 'Amazon India', 'amazon-in', 'amazon-in', 'https://www.amazon.in', 0.98),
  ('m1000000-0000-0000-0000-000000000002', 'Flipkart', 'flipkart', 'flipkart', 'https://www.flipkart.com', 0.95)
ON CONFLICT (slug) DO NOTHING;

-- 4. Sample Products
INSERT INTO public.products (id, title, brand_id, category_id, model, ean, upc, created_at) VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'Apple iPhone 15 (128 GB) - Black',
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'iPhone 15',
    '0195949038280',
    '195949038280',
    now()
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000003',
    'WH-1000XM5',
    '4548736132566',
    '027242923454',
    now()
  )
ON CONFLICT DO NOTHING;

-- 5. Sample Offers with Provenance
INSERT INTO public.offers (
  id,
  product_id,
  merchant_id,
  source,
  merchant_name,
  url,
  current_price_paise,
  original_price_paise,
  in_stock,
  provenance,
  last_observed_at
) VALUES
  (
    'o1000000-0000-0000-0000-000000000001',
    'p1000000-0000-0000-0000-000000000001',
    'm1000000-0000-0000-0000-000000000001',
    'amazon-in',
    'Amazon.in',
    'https://www.amazon.in/dp/B0CX21Q8TG',
    6999900,
    7990000,
    true,
    '{"source": "amazon-in", "sourceUrl": "https://www.amazon.in/dp/B0CX21Q8TG", "fetchedAt": "2026-10-04T12:00:00Z", "extractionMethod": "http", "confidence": 0.98, "adapterVersion": "0.1.0"}'::jsonb,
    now()
  ),
  (
    'o1000000-0000-0000-0000-000000000002',
    'p1000000-0000-0000-0000-000000000001',
    'm1000000-0000-0000-0000-000000000002',
    'flipkart',
    'Flipkart',
    'https://www.flipkart.com/apple-iphone-15/p/itm12345',
    6999900,
    7990000,
    true,
    '{"source": "flipkart", "sourceUrl": "https://www.flipkart.com/apple-iphone-15/p/itm12345", "fetchedAt": "2026-10-04T12:00:00Z", "extractionMethod": "http", "confidence": 0.98, "adapterVersion": "0.1.0"}'::jsonb,
    now()
  )
ON CONFLICT DO NOTHING;
