import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface CategorySeed {
  id: string;
  name: string;
  slug: string;
}

interface BrandSeed {
  id: string;
  name: string;
  slug: string;
}

const CATEGORIES: CategorySeed[] = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "Smartphones", slug: "smartphones" },
  { id: "c1000000-0000-0000-0000-000000000002", name: "Laptops", slug: "laptops" },
  { id: "c1000000-0000-0000-0000-000000000003", name: "Audio", slug: "audio" },
  { id: "c1000000-0000-0000-0000-000000000004", name: "Smartwatches", slug: "smartwatches" },
  { id: "c1000000-0000-0000-0000-000000000005", name: "Tablets", slug: "tablets" },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Televisions", slug: "televisions" },
];

const BRANDS: BrandSeed[] = [
  { id: "b1000000-0000-0000-0000-000000000001", name: "Apple", slug: "apple" },
  { id: "b1000000-0000-0000-0000-000000000002", name: "Samsung", slug: "samsung" },
  { id: "b1000000-0000-0000-0000-000000000003", name: "Sony", slug: "sony" },
  { id: "b1000000-0000-0000-0000-000000000004", name: "OnePlus", slug: "oneplus" },
  { id: "b1000000-0000-0000-0000-000000000005", name: "Dell", slug: "dell" },
  { id: "b1000000-0000-0000-0000-000000000006", name: "LG", slug: "lg" },
  { id: "b1000000-0000-0000-0000-000000000007", name: "Xiaomi", slug: "xiaomi" },
  { id: "b1000000-0000-0000-0000-000000000008", name: "HP", slug: "hp" },
];

export function generateSeedSQL(totalProducts = 500): string {
  const lines: string[] = [
    "-- ==============================================================================",
    "-- SCRAPPY SEED DATA (500 SYNTHETIC CANONICAL PRODUCTS + MULTI-MERCHANT OFFERS)",
    "-- Generated automatically by packages/db/src/seed/generate-seed.ts",
    "-- ==============================================================================",
    "",
  ];

  // 1. Categories
  lines.push("-- Categories");
  for (const cat of CATEGORIES) {
    lines.push(
      `INSERT INTO public.categories (id, name, slug) VALUES ('${cat.id}', '${cat.name}', '${cat.slug}') ON CONFLICT (slug) DO NOTHING;`,
    );
  }
  lines.push("");

  // 2. Brands
  lines.push("-- Brands");
  for (const b of BRANDS) {
    lines.push(
      `INSERT INTO public.brands (id, name, slug) VALUES ('${b.id}', '${b.name}', '${b.slug}') ON CONFLICT (slug) DO NOTHING;`,
    );
  }
  lines.push("");

  // 3. Merchants
  lines.push("-- Merchants");
  lines.push(
    `INSERT INTO public.merchants (id, name, slug, source_id, base_url, trust_score) VALUES ('m1000000-0000-0000-0000-000000000001', 'Amazon India', 'amazon-in', 'amazon-in', 'https://www.amazon.in', 0.98) ON CONFLICT (slug) DO NOTHING;`,
  );
  lines.push(
    `INSERT INTO public.merchants (id, name, slug, source_id, base_url, trust_score) VALUES ('m1000000-0000-0000-0000-000000000002', 'Flipkart', 'flipkart', 'flipkart', 'https://www.flipkart.com', 0.95) ON CONFLICT (slug) DO NOTHING;`,
  );
  lines.push("");

  // 4. Products & Offers
  lines.push("-- Products and Offers");
  for (let i = 1; i <= totalProducts; i++) {
    const pad = String(i).padStart(6, "0");
    const prodId = `p2000000-0000-0000-0000-${pad.padStart(12, "0")}`;
    const cat = CATEGORIES[(i - 1) % CATEGORIES.length]!;
    const brand = BRANDS[(i - 1) % BRANDS.length]!;
    const title = `${brand.name} ${cat.name.slice(0, -1)} Model Pro-${i}X`;
    const model = `Pro-${i}X`;
    const ean = `890${String(1000000000 + i).slice(-10)}`;
    const upc = `012${String(100000000 + i).slice(-9)}`;

    lines.push(
      `INSERT INTO public.products (id, title, brand_id, category_id, model, ean, upc) VALUES ('${prodId}', '${title}', '${brand.id}', '${cat.id}', '${model}', '${ean}', '${upc}') ON CONFLICT DO NOTHING;`,
    );

    // Amazon Offer
    const basePriceRupees = 1000 + ((i * 137) % 85000);
    const amazonPricePaise = basePriceRupees * 100;
    const amazonOrigPaise = Math.round(basePriceRupees * 1.15) * 100;
    const amazonOfferId = `o2000000-0000-0000-0001-${pad.padStart(12, "0")}`;

    const amazonProvenance = JSON.stringify({
      source: "amazon-in",
      sourceUrl: `https://www.amazon.in/dp/B00SYN${pad}`,
      fetchedAt: "2026-10-04T12:00:00Z",
      extractionMethod: "http",
      confidence: 0.98,
      adapterVersion: "0.1.0",
    });

    lines.push(
      `INSERT INTO public.offers (id, product_id, merchant_id, source, merchant_name, url, current_price_paise, original_price_paise, in_stock, provenance) VALUES ('${amazonOfferId}', '${prodId}', 'm1000000-0000-0000-0000-000000000001', 'amazon-in', 'Amazon.in', 'https://www.amazon.in/dp/B00SYN${pad}', ${amazonPricePaise}, ${amazonOrigPaise}, true, '${amazonProvenance}'::jsonb) ON CONFLICT DO NOTHING;`,
    );

    // Flipkart Offer
    const flipkartDiff = ((i % 5) - 2) * 200; // variations: -400 to +400
    const flipkartPricePaise = Math.max(50000, (basePriceRupees + flipkartDiff) * 100);
    const flipkartOfferId = `o2000000-0000-0000-0002-${pad.padStart(12, "0")}`;

    const flipkartProvenance = JSON.stringify({
      source: "flipkart",
      sourceUrl: `https://www.flipkart.com/item/p/itm${pad}`,
      fetchedAt: "2026-10-04T12:00:00Z",
      extractionMethod: "http",
      confidence: 0.96,
      adapterVersion: "0.1.0",
    });

    lines.push(
      `INSERT INTO public.offers (id, product_id, merchant_id, source, merchant_name, url, current_price_paise, original_price_paise, in_stock, provenance) VALUES ('${flipkartOfferId}', '${prodId}', 'm1000000-0000-0000-0000-000000000002', 'flipkart', 'Flipkart', 'https://www.flipkart.com/item/p/itm${pad}', ${flipkartPricePaise}, ${amazonOrigPaise}, true, '${flipkartProvenance}'::jsonb) ON CONFLICT DO NOTHING;`,
    );
  }

  return lines.join("\n");
}

if (process.argv[1] && process.argv[1].endsWith("generate-seed.ts")) {
  const sql = generateSeedSQL(500);
  const targetPath = path.resolve(__dirname, "../../../../supabase/seed.sql");
  fs.writeFileSync(targetPath, sql, "utf-8");
  console.info(`Generated 500-product seed file at: ${targetPath}`);
}
