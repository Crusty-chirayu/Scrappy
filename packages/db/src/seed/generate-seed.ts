
export interface CategorySeed {
  id: string;
  name: string;
  slug: string;
}

export interface BrandSeed {
  id: string;
  name: string;
  slug: string;
}

export interface MerchantSeed {
  id: string;
  name: string;
  slug: string;
  sourceId: string;
  baseUrl: string;
  trustScore: number;
}

export interface ProductSeed {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  model: string;
  ean: string;
  upc: string;
}

export interface OfferSeed {
  id: string;
  productId: string;
  merchantId: string;
  source: string;
  merchantName: string;
  url: string;
  currentPricePaise: number;
  originalPricePaise?: number;
  inStock: boolean;
  provenance: {
    source: string;
    sourceUrl: string;
    fetchedAt: string;
    extractionMethod: "http" | "browser" | "api" | "feed";
    confidence: number;
    adapterVersion: string;
  };
}

export const CATEGORIES: CategorySeed[] = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "Smartphones", slug: "smartphones" },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Laptops", slug: "laptops" },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Audio", slug: "audio" },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Smartwatches", slug: "smartwatches" },
  { id: "c1000000-0000-0000-0000-000000000005", name: "Tablets", slug: "tablets" },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Televisions", slug: "televisions" },
];

export const BRANDS: BrandSeed[] = [
  { id: "b1000000-0000-0000-0000-000000000001", name: "Apple", slug: "apple" },
  { id: "b1000000-0000-0000-0000-000000000002", name: "Samsung", slug: "samsung" },
  { id: "b1000000-0000-0000-0000-000000000003", name: "Sony", slug: "sony" },
  { id: "b1000000-0000-0000-0000-000000000004", name: "OnePlus", slug: "oneplus" },
  { id: "b1000000-0000-0000-0000-000000000005", name: "Dell", slug: "dell" },
  { id: "b1000000-0000-0000-0000-000000000006", name: "LG", slug: "lg" },
  { id: "b1000000-0000-0000-0000-000000000007", name: "Xiaomi", slug: "xiaomi" },
  { id: "b1000000-0000-0000-0000-000000000008", name: "HP", slug: "hp" },
];

export const MERCHANTS: MerchantSeed[] = [
  {
    id: "m1000000-0000-0000-0000-000000000001",
    name: "Amazon India",
    slug: "amazon-in",
    sourceId: "amazon-in",
    baseUrl: "https://www.amazon.in",
    trustScore: 0.98,
  },
  {
    id: "m1000000-0000-0000-0000-000000000002",
    name: "Flipkart",
    slug: "flipkart",
    sourceId: "flipkart",
    baseUrl: "https://www.flipkart.com",
    trustScore: 0.95,
  },
];

export function generateSeedObjects(totalProducts = 500): {
  categories: CategorySeed[];
  brands: BrandSeed[];
  merchants: MerchantSeed[];
  products: ProductSeed[];
  offers: OfferSeed[];
} {
  const products: ProductSeed[] = [];
  const offers: OfferSeed[] = [];

  for (let i = 1; i <= totalProducts; i++) {
    const pad = String(i).padStart(6, "0");
    const prodId = `p2000000-0000-0000-0000-${pad.padStart(12, "0")}`;
    const cat = CATEGORIES[(i - 1) % CATEGORIES.length]!;
    const brand = BRANDS[(i - 1) % BRANDS.length]!;
    const title = `${brand.name} ${cat.name.slice(0, -1)} Model Pro-${i}X`;
    const model = `Pro-${i}X`;
    const ean = `890${String(1000000000 + i).slice(-10)}`;
    const upc = `012${String(100000000 + i).slice(-9)}`;

    products.push({
      id: prodId,
      title,
      brandId: brand.id,
      brandName: brand.name,
      categoryId: cat.id,
      categoryName: cat.name,
      model,
      ean,
      upc,
    });

    // Amazon Offer
    const basePriceRupees = 1000 + ((i * 137) % 85000);
    const amazonPricePaise = basePriceRupees * 100;
    const amazonOrigPaise = Math.round(basePriceRupees * 1.15) * 100;
    const amazonOfferId = `o2000000-0000-0001-${pad.padStart(12, "0")}`;

    offers.push({
      id: amazonOfferId,
      productId: prodId,
      merchantId: MERCHANTS[0]!.id,
      source: "amazon-in",
      merchantName: "Amazon.in",
      url: `https://www.amazon.in/dp/B00SYN${pad}`,
      currentPricePaise: amazonPricePaise,
      originalPricePaise: amazonOrigPaise,
      inStock: true,
      provenance: {
        source: "amazon-in",
        sourceUrl: `https://www.amazon.in/dp/B00SYN${pad}`,
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "http",
        confidence: 0.98,
        adapterVersion: "0.2.0",
      },
    });

    // Flipkart Offer
    const flipkartDiff = ((i % 5) - 2) * 200;
    const flipkartPricePaise = Math.max(50000, (basePriceRupees + flipkartDiff) * 100);
    const flipkartOfferId = `o2000000-0000-0002-${pad.padStart(12, "0")}`;

    offers.push({
      id: flipkartOfferId,
      productId: prodId,
      merchantId: MERCHANTS[1]!.id,
      source: "flipkart",
      merchantName: "Flipkart",
      url: `https://www.flipkart.com/item/p/itm${pad}`,
      currentPricePaise: flipkartPricePaise,
      originalPricePaise: amazonOrigPaise,
      inStock: true,
      provenance: {
        source: "flipkart",
        sourceUrl: `https://www.flipkart.com/item/p/itm${pad}`,
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "http",
        confidence: 0.96,
        adapterVersion: "0.2.0",
      },
    });
  }

  return { categories: CATEGORIES, brands: BRANDS, merchants: MERCHANTS, products, offers };
}

export function generateSeedSQL(totalProducts = 500): string {
  const seed = generateSeedObjects(totalProducts);
  const lines: string[] = [
    "-- ==============================================================================",
    "-- SCRAPPY SEED DATA (500 SYNTHETIC CANONICAL PRODUCTS + MULTI-MERCHANT OFFERS)",
    "-- Generated automatically by packages/db/src/seed/generate-seed.ts",
    "-- ==============================================================================",
    "",
  ];

  // 1. Categories
  lines.push("-- Categories");
  for (const cat of seed.categories) {
    lines.push(
      `INSERT INTO public.categories (id, name, slug) VALUES ('${cat.id}', '${cat.name}', '${cat.slug}') ON CONFLICT (slug) DO NOTHING;`,
    );
  }
  lines.push("");

  // 2. Brands
  lines.push("-- Brands");
  for (const b of seed.brands) {
    lines.push(
      `INSERT INTO public.brands (id, name, slug) VALUES ('${b.id}', '${b.name}', '${b.slug}') ON CONFLICT (slug) DO NOTHING;`,
    );
  }
  lines.push("");

  // 3. Merchants
  lines.push("-- Merchants");
  for (const m of seed.merchants) {
    lines.push(
      `INSERT INTO public.merchants (id, name, slug, source_id, base_url, trust_score) VALUES ('${m.id}', '${m.name}', '${m.slug}', '${m.sourceId}', '${m.baseUrl}', ${m.trustScore}) ON CONFLICT (slug) DO NOTHING;`,
    );
  }
  lines.push("");

  // 4. Products & Offers
  lines.push("-- Products and Offers");
  for (const p of seed.products) {
    lines.push(
      `INSERT INTO public.products (id, title, brand_id, category_id, model, ean, upc) VALUES ('${p.id}', '${p.title}', '${p.brandId}', '${p.categoryId}', '${p.model}', '${p.ean}', '${p.upc}') ON CONFLICT DO NOTHING;`,
    );
  }

  for (const o of seed.offers) {
    const provJson = JSON.stringify(o.provenance);
    lines.push(
      `INSERT INTO public.offers (id, product_id, merchant_id, source, merchant_name, url, current_price_paise, original_price_paise, in_stock, provenance) VALUES ('${o.id}', '${o.productId}', '${o.merchantId}', '${o.source}', '${o.merchantName}', '${o.url}', ${o.currentPricePaise}, ${o.originalPricePaise ?? "NULL"}, ${o.inStock}, '${provJson}'::jsonb) ON CONFLICT DO NOTHING;`,
    );
  }

  return lines.join("\n");
}
