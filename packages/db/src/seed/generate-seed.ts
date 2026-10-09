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
  isSynthetic: boolean;
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
  isSynthetic: boolean;
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
  { id: "c1000000-0000-0000-0000-000000000005", name: "Televisions", slug: "televisions" },
  { id: "c1000000-0000-0000-0000-000000000006", name: "Footwear", slug: "footwear" },
  { id: "c1000000-0000-0000-0000-000000000007", name: "Appliances", slug: "appliances" },
  { id: "c1000000-0000-0000-0000-000000000008", name: "Grocery Staples", slug: "grocery" },
];

export const BRANDS: BrandSeed[] = [
  { id: "b1000000-0000-0000-0000-000000000001", name: "Apple", slug: "apple" },
  { id: "b1000000-0000-0000-0000-000000000002", name: "Samsung", slug: "samsung" },
  { id: "b1000000-0000-0000-0000-000000000003", name: "Sony", slug: "sony" },
  { id: "b1000000-0000-0000-0000-000000000004", name: "OnePlus", slug: "oneplus" },
  { id: "b1000000-0000-0000-0000-000000000005", name: "Dell", slug: "dell" },
  { id: "b1000000-0000-0000-0000-000000000006", name: "LG", slug: "lg" },
  { id: "b1000000-0000-0000-0000-000000000007", name: "Xiaomi", slug: "xiaomi" },
  { id: "b1000000-0000-0000-0000-000000000008", name: "Nike", slug: "nike" },
  { id: "b1000000-0000-0000-0000-000000000009", name: "Voltas", slug: "voltas" },
  { id: "b1000000-0000-0000-0000-000000000010", name: "Tata Sampann", slug: "tata-sampann" },
];

export const MERCHANTS: MerchantSeed[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    name: "Amazon.in",
    slug: "amazon-in",
    sourceId: "amazon-in",
    baseUrl: "https://www.amazon.in",
    trustScore: 0.98,
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    name: "Flipkart",
    slug: "flipkart",
    sourceId: "flipkart",
    baseUrl: "https://www.flipkart.com",
    trustScore: 0.95,
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    name: "Croma",
    slug: "croma",
    sourceId: "croma",
    baseUrl: "https://www.croma.com",
    trustScore: 0.92,
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    name: "Reliance Digital",
    slug: "reliance-digital",
    sourceId: "reliance-digital",
    baseUrl: "https://www.reliancedigital.in",
    trustScore: 0.91,
  },
];

// Realistic curated Indian Market products
const REALISTIC_INDIAN_CATALOG = [
  { brand: "Apple", category: "Smartphones", title: "Apple iPhone 15 (128 GB) - Black", model: "A3090", baseRupees: 71999 },
  { brand: "Apple", category: "Smartphones", title: "Apple iPhone 15 Pro (256 GB) - Natural Titanium", model: "A3102", baseRupees: 134900 },
  { brand: "Samsung", category: "Smartphones", title: "Samsung Galaxy S24 Ultra 5G (256 GB) - Titanium Gray", model: "SM-S928B", baseRupees: 129999 },
  { brand: "OnePlus", category: "Smartphones", title: "OnePlus 12 (256 GB) - Silky Black", model: "CPH2581", baseRupees: 64999 },
  { brand: "Xiaomi", category: "Smartphones", title: "Redmi Note 13 Pro 5G (128 GB) - Arctic White", model: "2312DRA50G", baseRupees: 23999 },

  { brand: "Apple", category: "Laptops", title: "Apple MacBook Air M3 (13.6-inch, 16GB, 512GB) - Space Gray", model: "MRX43HN/A", baseRupees: 134900 },
  { brand: "Dell", category: "Laptops", title: "Dell XPS 13 (Intel Core Ultra 7, 16GB, 1TB SSD) - Platinum", model: "9340", baseRupees: 154990 },
  { brand: "Apple", category: "Laptops", title: "Apple MacBook Pro 14 (M3 Pro, 18GB, 512GB) - Space Black", model: "MRX33HN/A", baseRupees: 199900 },

  { brand: "Sony", category: "Audio", title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black", model: "WH1000XM5/B", baseRupees: 29990 },
  { brand: "Apple", category: "Audio", title: "Apple AirPods Pro (2nd Generation with USB-C)", model: "MTJV3HN/A", baseRupees: 22900 },
  { brand: "Sony", category: "Audio", title: "Sony WF-1000XM5 True Wireless Earbuds - Silver", model: "WF1000XM5/S", baseRupees: 24990 },

  { brand: "Apple", category: "Smartwatches", title: "Apple Watch Series 9 GPS 45mm - Midnight Aluminum", model: "MR993HN/A", baseRupees: 44900 },
  { brand: "Samsung", category: "Smartwatches", title: "Samsung Galaxy Watch6 Classic Bluetooth 47mm - Black", model: "SM-R960N", baseRupees: 36999 },

  { brand: "LG", category: "Televisions", title: "LG 55-inch 4K Smart OLED evo TV C3 Series", model: "OLED55C3PSA", baseRupees: 119990 },
  { brand: "Sony", category: "Televisions", title: "Sony Bravia 65-inch 4K Ultra HD Smart LED Google TV", model: "KD-65X74L", baseRupees: 74990 },

  { brand: "Nike", category: "Footwear", title: "Nike Air Zoom Pegasus 40 Men's Road Running Shoes", model: "DV3853-001", baseRupees: 9995 },
  { brand: "Nike", category: "Footwear", title: "Nike Air Force 1 '07 All White Leather Sneakers", model: "CW2288-111", baseRupees: 7495 },

  { brand: "Voltas", category: "Appliances", title: "Voltas 1.5 Ton 3 Star Inverter Split AC (Copper, 183V Vectra Prism)", model: "183V Vectra Prism", baseRupees: 34990 },
  { brand: "LG", category: "Appliances", title: "LG 260 L 3 Star Smart Inverter Double Door Refrigerator - Shiny Steel", model: "GL-S292RDSY", baseRupees: 26990 },

  { brand: "Tata Sampann", category: "Grocery Staples", title: "Tata Sampann Unpolished Toor Dal (Pigeon Pea), 1kg Pack", model: "TS-TD-1KG", baseRupees: 195 },
  { brand: "Tata Sampann", category: "Grocery Staples", title: "Tata Sampann Premium Roasted Makhana (Fox Nuts), 250g", model: "TS-MK-250G", baseRupees: 320 },
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
    const prodId = `b2000000-0000-0000-0000-${pad.padStart(12, "0")}`;

    const catalogItem = REALISTIC_INDIAN_CATALOG[(i - 1) % REALISTIC_INDIAN_CATALOG.length]!;
    const cat = CATEGORIES.find((c) => c.name === catalogItem.category) || CATEGORIES[0]!;
    const brand = BRANDS.find((b) => b.name === catalogItem.brand) || BRANDS[0]!;

    const variantSuffix = i > REALISTIC_INDIAN_CATALOG.length ? ` (Batch ${Math.floor(i / REALISTIC_INDIAN_CATALOG.length) + 1})` : "";
    const title = `${catalogItem.title}${variantSuffix}`;
    const model = `${catalogItem.model}-${pad.slice(-3)}`;
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
      isSynthetic: true,
    });

    const basePriceRupees = catalogItem.baseRupees;

    // Amazon Offer (Anchor)
    const amazonPriceRupees = basePriceRupees;
    const amazonPricePaise = amazonPriceRupees * 100;
    const amazonOrigPaise = Math.round(basePriceRupees * 1.15) * 100;
    const amazonOfferId = `c2000000-0000-0000-0001-${pad.padStart(12, "0")}`;

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
      isSynthetic: true,
      provenance: {
        source: "amazon-in",
        sourceUrl: `https://www.amazon.in/dp/B00SYN${pad}`,
        fetchedAt: "2026-10-07T08:00:00Z",
        extractionMethod: "http",
        confidence: 0.99,
        adapterVersion: "0.3.0",
      },
    });

    // Flipkart Offer (2% to 6% variation)
    const flipkartPct = 1 - (((i % 7) - 3) * 0.015);
    const flipkartPricePaise = Math.round(basePriceRupees * flipkartPct) * 100;
    const flipkartOfferId = `c2000000-0000-0000-0002-${pad.padStart(12, "0")}`;

    offers.push({
      id: flipkartOfferId,
      productId: prodId,
      merchantId: MERCHANTS[1]!.id,
      source: "flipkart",
      merchantName: "Flipkart",
      url: `https://www.flipkart.com/item/p/itm${pad}`,
      currentPricePaise: flipkartPricePaise,
      originalPricePaise: amazonOrigPaise,
      inStock: i % 18 !== 0, // occasional stock out
      isSynthetic: true,
      provenance: {
        source: "flipkart",
        sourceUrl: `https://www.flipkart.com/item/p/itm${pad}`,
        fetchedAt: "2026-10-07T08:00:00Z",
        extractionMethod: "http",
        confidence: 0.97,
        adapterVersion: "0.3.0",
      },
    });

    // Croma Offer (available on electronics)
    if (["Smartphones", "Laptops", "Audio", "Televisions", "Appliances"].includes(cat.name)) {
      const cromaPct = 1 - (((i % 5) - 2) * 0.02);
      const cromaPricePaise = Math.round(basePriceRupees * cromaPct) * 100;
      const cromaOfferId = `c2000000-0000-0000-0003-${pad.padStart(12, "0")}`;

      offers.push({
        id: cromaOfferId,
        productId: prodId,
        merchantId: MERCHANTS[2]!.id,
        source: "croma",
        merchantName: "Croma",
        url: `https://www.croma.com/p/${pad}`,
        currentPricePaise: cromaPricePaise,
        originalPricePaise: amazonOrigPaise,
        inStock: true,
        isSynthetic: true,
        provenance: {
          source: "croma",
          sourceUrl: `https://www.croma.com/p/${pad}`,
          fetchedAt: "2026-10-07T07:30:00Z",
          extractionMethod: "http",
          confidence: 0.95,
          adapterVersion: "0.3.0",
        },
      });
    }
  }

  return { categories: CATEGORIES, brands: BRANDS, merchants: MERCHANTS, products, offers };
}

export function generateSeedSQL(totalProducts = 500): string {
  const seed = generateSeedObjects(totalProducts);
  const lines: string[] = [
    "-- ==============================================================================",
    "-- SCRAPPY SEED DATA v2 (REALISTIC INDIAN MARKET CATALOG + MULTI-RETAILER OFFERS)",
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
      `INSERT INTO public.products (id, title, brand_id, category_id, model, ean, upc, is_synthetic) VALUES ('${p.id}', '${p.title.replace(/'/g, "''")}', '${p.brandId}', '${p.categoryId}', '${p.model}', '${p.ean}', '${p.upc}', true) ON CONFLICT DO NOTHING;`,
    );
  }

  for (const o of seed.offers) {
    const provJson = JSON.stringify(o.provenance);
    lines.push(
      `INSERT INTO public.offers (id, product_id, merchant_id, source, merchant_name, url, current_price_paise, original_price_paise, in_stock, provenance, is_synthetic) VALUES ('${o.id}', '${o.productId}', '${o.merchantId}', '${o.source}', '${o.merchantName}', '${o.url}', ${o.currentPricePaise}, ${o.originalPricePaise ?? "NULL"}, ${o.inStock}, '${provJson}'::jsonb, true) ON CONFLICT DO NOTHING;`,
    );
  }

  return lines.join("\n");
}
