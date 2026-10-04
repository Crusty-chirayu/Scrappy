import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CatalogProduct {
  id: string;
  title: string;
  brand: string;
  model: string;
  ean?: string;
  upc?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface GoldSetPair {
  id: string;
  offer: {
    title: string;
    brand?: string;
    model?: string;
    ean?: string;
    upc?: string;
    sourceUrl: string;
  };
  expectedProductId: string | null;
  category: string;
  taxonomy: string;
  description: string;
}

const CATALOG: CatalogProduct[] = [
  // Apple Smartphones
  {
    id: "prod-iphone-13-128-midnight",
    title: "Apple iPhone 13 (128 GB) - Midnight",
    brand: "Apple",
    model: "iPhone 13",
    ean: "0194252707241",
    upc: "194252707241",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-14-128-blue",
    title: "Apple iPhone 14 (128 GB) - Blue",
    brand: "Apple",
    model: "iPhone 14",
    ean: "0194253399438",
    upc: "194253399438",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-14-256-blue",
    title: "Apple iPhone 14 (256 GB) - Blue",
    brand: "Apple",
    model: "iPhone 14",
    ean: "0194253399742",
    upc: "194253399742",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-14-plus-128-blue",
    title: "Apple iPhone 14 Plus (128 GB) - Blue",
    brand: "Apple",
    model: "iPhone 14 Plus",
    ean: "0194253406563",
    upc: "194253406563",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-15-128-black",
    title: "Apple iPhone 15 (128 GB) - Black",
    brand: "Apple",
    model: "iPhone 15",
    ean: "0195949038289",
    upc: "195949038289",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-15-256-black",
    title: "Apple iPhone 15 (256 GB) - Black",
    brand: "Apple",
    model: "iPhone 15",
    ean: "0195949038302",
    upc: "195949038302",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-15-plus-128-black",
    title: "Apple iPhone 15 Plus (128 GB) - Black",
    brand: "Apple",
    model: "iPhone 15 Plus",
    ean: "0195949039125",
    upc: "195949039125",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-15-pro-128-titanium",
    title: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    brand: "Apple",
    model: "iPhone 15 Pro",
    ean: "0195949041234",
    upc: "195949041234",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-15-pro-256-titanium",
    title: "Apple iPhone 15 Pro (256 GB) - Natural Titanium",
    brand: "Apple",
    model: "iPhone 15 Pro",
    ean: "0195949041258",
    upc: "195949041258",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-iphone-15-promax-256-titanium",
    title: "Apple iPhone 15 Pro Max (256 GB) - Natural Titanium",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    ean: "0195949042569",
    upc: "195949042569",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Samsung Smartphones
  {
    id: "prod-samsung-s24-256-gray",
    title: "Samsung Galaxy S24 5G (256 GB) - Marble Gray",
    brand: "Samsung",
    model: "Galaxy S24",
    ean: "8806095361001",
    upc: "880609536100",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-samsung-s24-plus-256-gray",
    title: "Samsung Galaxy S24+ 5G (256 GB) - Marble Gray",
    brand: "Samsung",
    model: "Galaxy S24+",
    ean: "8806095362008",
    upc: "880609536200",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-samsung-s24-ultra-256-gray",
    title: "Samsung Galaxy S24 Ultra 5G (256 GB) - Titanium Gray",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    ean: "8806095363005",
    upc: "880609536300",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-samsung-s23-fe-128-graphite",
    title: "Samsung Galaxy S23 FE 5G (128 GB) - Graphite",
    brand: "Samsung",
    model: "Galaxy S23 FE",
    ean: "8806095111002",
    upc: "880609511100",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // OnePlus & Google
  {
    id: "prod-oneplus-12-256-emerald",
    title: "OnePlus 12 5G (256 GB) - Flowy Emerald",
    brand: "OnePlus",
    model: "OnePlus 12",
    ean: "6921815626008",
    upc: "692181562600",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-oneplus-12r-128-iron",
    title: "OnePlus 12R 5G (128 GB) - Iron Gray",
    brand: "OnePlus",
    model: "OnePlus 12R",
    ean: "6921815627005",
    upc: "692181562700",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-pixel-8-128-obsidian",
    title: "Google Pixel 8 5G (128 GB) - Obsidian",
    brand: "Google",
    model: "Pixel 8",
    ean: "0840244700018",
    upc: "840244700018",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-pixel-8-pro-128-obsidian",
    title: "Google Pixel 8 Pro 5G (128 GB) - Obsidian",
    brand: "Google",
    model: "Pixel 8 Pro",
    ean: "0840244700056",
    upc: "840244700056",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Laptops
  {
    id: "prod-macbook-air-m2-256",
    title: "Apple MacBook Air 13.6-inch M2 Chip (256 GB) - Space Grey",
    brand: "Apple",
    model: "MacBook Air",
    ean: "0194253081944",
    upc: "194253081944",
    categoryId: "laptops",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-macbook-air-m3-256",
    title: "Apple MacBook Air 13.6-inch M3 Chip (256 GB) - Midnight",
    brand: "Apple",
    model: "MacBook Air",
    ean: "0195949120014",
    upc: "195949120014",
    categoryId: "laptops",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-macbook-pro-14-m3-512",
    title: "Apple MacBook Pro 14-inch M3 Chip (512 GB) - Space Grey",
    brand: "Apple",
    model: "MacBook Pro",
    ean: "0195949130020",
    upc: "195949130020",
    categoryId: "laptops",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Audio
  {
    id: "prod-sony-wh-1000xm4-black",
    title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones - Black",
    brand: "Sony",
    model: "WH-1000XM4",
    ean: "4548736112186",
    upc: "454873611218",
    categoryId: "audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-sony-wh-1000xm5-black",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black",
    brand: "Sony",
    model: "WH-1000XM5",
    ean: "4548736132566",
    upc: "454873613256",
    categoryId: "audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-bose-qc-ultra-black",
    title: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones - Black",
    brand: "Bose",
    model: "QuietComfort Ultra",
    ean: "017817842006",
    upc: "17817842006",
    categoryId: "audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-airpods-pro-2-usbc",
    title: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
    brand: "Apple",
    model: "AirPods Pro",
    ean: "0195949052490",
    upc: "195949052490",
    categoryId: "audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Wearables
  {
    id: "prod-apple-watch-s9-45mm",
    title: "Apple Watch Series 9 GPS 45mm - Midnight Aluminium Case",
    brand: "Apple",
    model: "Apple Watch Series 9",
    ean: "0195949019011",
    upc: "195949019011",
    categoryId: "wearables",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-apple-watch-ultra-2",
    title: "Apple Watch Ultra 2 GPS + Cellular 49mm - Titanium Case",
    brand: "Apple",
    model: "Apple Watch Ultra 2",
    ean: "0195949020017",
    upc: "195949020017",
    categoryId: "wearables",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // CPG / Appliances
  {
    id: "prod-colgate-total-120g",
    title: "Colgate Total Clean Mint Antibacterial Toothpaste - 120g",
    brand: "Colgate",
    model: "Total Clean Mint",
    ean: "8901314010200",
    upc: "890131401020",
    categoryId: "cpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-nescafe-gold-100g",
    title: "Nescafé Gold Blend Instant Coffee Jar - 100g",
    brand: "Nescafe",
    model: "Gold Blend",
    ean: "7613035610012",
    upc: "761303561001",
    categoryId: "cpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-dyson-v12-detect-slim",
    title: "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner",
    brand: "Dyson",
    model: "V12 Detect Slim",
    ean: "5025155070014",
    upc: "502515507001",
    categoryId: "appliances",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const GOLD_SET: GoldSetPair[] = [];
let pairCounter = 1;

function addPair(
  offer: GoldSetPair["offer"],
  expectedProductId: string | null,
  category: string,
  taxonomy: string,
  description: string,
) {
  const id = `gold-pair-${String(pairCounter++).padStart(4, "0")}`;
  GOLD_SET.push({
    id,
    offer,
    expectedProductId,
    category,
    taxonomy,
    description,
  });
}

// 1. EXACT BARCODE (EAN / UPC) WITH RETAIL NOISE (65 pairs)
const RETAIL_PREFIXES = [
  "Deal of the Day: ",
  "Lowest Price in 30 Days! ",
  "Brand New in Box — ",
  "[Fast Delivery] ",
  "Super Saver Sale: ",
  "Official India Store: ",
  "Festive Bumper Discount: ",
];
const RETAIL_SUFFIXES = [
  " | Free Next-Day Prime Delivery",
  " (No Cost EMI from ₹4,199/m)",
  " [Inclusive of all taxes]",
  " - 1 Year Manufacturer Warranty Included",
  " (Fast Shipping, Authenticity Guaranteed)",
];

for (const prod of CATALOG) {
  if (prod.ean) {
    const pre = RETAIL_PREFIXES[pairCounter % RETAIL_PREFIXES.length];
    const suf = RETAIL_SUFFIXES[pairCounter % RETAIL_SUFFIXES.length];
    addPair(
      {
        title: `${pre}${prod.title}${suf}`,
        ean: prod.ean,
        sourceUrl: `https://amazon.in/dp/B0${pairCounter}`,
      },
      prod.id,
      prod.categoryId,
      "exact_ean_noisy",
      `Exact EAN barcode match with promotional vendor title noise: '${prod.title}'`,
    );
  }
  if (prod.upc) {
    const pre = RETAIL_PREFIXES[(pairCounter + 2) % RETAIL_PREFIXES.length];
    const suf = RETAIL_SUFFIXES[(pairCounter + 3) % RETAIL_SUFFIXES.length];
    addPair(
      {
        title: `${pre}${prod.title}${suf}`,
        upc: prod.upc,
        sourceUrl: `https://flipkart.com/item/${pairCounter}`,
      },
      prod.id,
      prod.categoryId,
      "exact_upc_noisy",
      `Exact UPC barcode match with vendor title noise: '${prod.title}'`,
    );
  }
}

// 2. EXACT BRAND + MODEL WITH REALISTIC NOISY TITLES (60 pairs)
const VENDOR_ADJECTIVES = [
  "Unlocked Global Version",
  "Super Retina XDR Display",
  "Dynamic Island Edition",
  "Indian Retail Stock",
  "Authentic Brand New Box Pack",
  "100% Genuine with Warranty",
];

for (const prod of CATALOG) {
  const adj1 = VENDOR_ADJECTIVES[pairCounter % VENDOR_ADJECTIVES.length];
  const adj2 = VENDOR_ADJECTIVES[(pairCounter + 1) % VENDOR_ADJECTIVES.length];
  const genMatch = prod.title.match(/\b(M[1-4]\s*Chip|M[1-4]|2nd Generation|Series 9|Ultra 2)\b/i);
  const genPart = genMatch ? ` ${genMatch[0]}` : "";
  addPair(
    {
      title: `${prod.brand} ${prod.model}${genPart} ${adj1} - ${prod.title.includes("GB") ? prod.title.match(/\d+\s*GB/)![0] : ""} ${adj2}`,
      brand: prod.brand,
      model: prod.model,
      sourceUrl: `https://croma.com/p/${pairCounter}`,
    },
    prod.id,
    prod.categoryId,
    "exact_brand_model_noisy",
    `Exact Brand and Model identifier with realistic retail noise: '${prod.model}'`,
  );
  addPair(
    {
      title: `${prod.title} [Limited Stock Offer]`,
      brand: prod.brand,
      model: prod.model,
      sourceUrl: `https://reliancedigital.in/p/${pairCounter}`,
    },
    prod.id,
    prod.categoryId,
    "exact_brand_model_noisy",
    `Exact Brand and Model with retailer promotional wrapper: '${prod.title}'`,
  );
}

// 3. STORAGE MISMATCH ADVERSARIAL TRAPS (45 pairs)
// Must NEVER merge into catalog product with different storage!
const PHONE_STORAGE_TRAPS = [
  { base: "Apple iPhone 15", brand: "Apple", model: "iPhone 15", wrongStor: "512 GB", cat: "smartphones" },
  { base: "Apple iPhone 15", brand: "Apple", model: "iPhone 15", wrongStor: "1 TB", cat: "smartphones" },
  { base: "Apple iPhone 15 Pro", brand: "Apple", model: "iPhone 15 Pro", wrongStor: "512 GB", cat: "smartphones" },
  { base: "Apple iPhone 15 Pro", brand: "Apple", model: "iPhone 15 Pro", wrongStor: "1 TB", cat: "smartphones" },
  { base: "Apple iPhone 14", brand: "Apple", model: "iPhone 14", wrongStor: "512 GB", cat: "smartphones" },
  { base: "Apple iPhone 13", brand: "Apple", model: "iPhone 13", wrongStor: "256 GB", cat: "smartphones" },
  { base: "Apple iPhone 13", brand: "Apple", model: "iPhone 13", wrongStor: "512 GB", cat: "smartphones" },
  { base: "Samsung Galaxy S24", brand: "Samsung", model: "Galaxy S24", wrongStor: "128 GB", cat: "smartphones" },
  { base: "Samsung Galaxy S24", brand: "Samsung", model: "Galaxy S24", wrongStor: "512 GB", cat: "smartphones" },
  { base: "Samsung Galaxy S24 Ultra", brand: "Samsung", model: "Galaxy S24 Ultra", wrongStor: "512 GB", cat: "smartphones" },
  { base: "Samsung Galaxy S24 Ultra", brand: "Samsung", model: "Galaxy S24 Ultra", wrongStor: "1 TB", cat: "smartphones" },
  { base: "Samsung Galaxy S23 FE", brand: "Samsung", model: "Galaxy S23 FE", wrongStor: "256 GB", cat: "smartphones" },
  { base: "OnePlus 12", brand: "OnePlus", model: "OnePlus 12", wrongStor: "512 GB", cat: "smartphones" },
  { base: "OnePlus 12R", brand: "OnePlus", model: "OnePlus 12R", wrongStor: "256 GB", cat: "smartphones" },
  { base: "Google Pixel 8", brand: "Google", model: "Pixel 8", wrongStor: "256 GB", cat: "smartphones" },
  { base: "Google Pixel 8 Pro", brand: "Google", model: "Pixel 8 Pro", wrongStor: "256 GB", cat: "smartphones" },
  { base: "Apple MacBook Air", brand: "Apple", model: "MacBook Air", wrongStor: "512 GB", cat: "laptops" },
  { base: "Apple MacBook Air", brand: "Apple", model: "MacBook Air", wrongStor: "1 TB", cat: "laptops" },
  { base: "Apple MacBook Pro", brand: "Apple", model: "MacBook Pro", wrongStor: "1 TB", cat: "laptops" },
  { base: "Apple MacBook Pro", brand: "Apple", model: "MacBook Pro", wrongStor: "2 TB", cat: "laptops" },
];

for (let i = 0; i < 45; i++) {
  const trap = PHONE_STORAGE_TRAPS[i % PHONE_STORAGE_TRAPS.length];
  addPair(
    {
      title: `${trap.base} (${trap.wrongStor}) - Unofficial Import [Variant #${i + 1}]`,
      brand: trap.brand,
      model: trap.model,
      sourceUrl: `https://marketplace.com/trap-stor-${i}`,
    },
    null,
    trap.cat,
    "storage_mismatch_trap",
    `Adversarial Storage Mismatch: ${trap.wrongStor} capacity offer must NOT merge into catalog entity with different storage`,
  );
}

// 4. MODEL MODIFIER ADVERSARIAL TRAPS (Plus vs Pro vs Pro Max vs Ultra vs Mini vs FE) (40 pairs)
const MODIFIER_TRAPS = [
  { title: "Apple iPhone 15 Pro Max (128 GB) - Natural Titanium", brand: "Apple", model: "iPhone 15 Pro Max", cat: "smartphones", reason: "iPhone 15 Pro Max 128GB does not exist / must not merge into 256GB or Pro" },
  { title: "Apple iPhone 15 Ultra (256 GB) - Concept Edition", brand: "Apple", model: "iPhone 15 Ultra", cat: "smartphones", reason: "Ultra modifier must not merge into base iPhone 15" },
  { title: "Apple iPhone 15 Mini (128 GB) - Black", brand: "Apple", model: "iPhone 15 Mini", cat: "smartphones", reason: "Mini modifier must not merge into base iPhone 15" },
  { title: "Apple iPhone 14 Pro (128 GB) - Space Black", brand: "Apple", model: "iPhone 14 Pro", cat: "smartphones", reason: "iPhone 14 Pro must not merge into iPhone 14 base" },
  { title: "Apple iPhone 14 Pro Max (128 GB) - Deep Purple", brand: "Apple", model: "iPhone 14 Pro Max", cat: "smartphones", reason: "iPhone 14 Pro Max must not merge into iPhone 14 base" },
  { title: "Samsung Galaxy S24 FE 5G (256 GB) - Blue", brand: "Samsung", model: "Galaxy S24 FE", cat: "smartphones", reason: "Galaxy S24 FE must not merge into Galaxy S24 flagship" },
  { title: "Samsung Galaxy S24 Lite 5G (128 GB) - Black", brand: "Samsung", model: "Galaxy S24 Lite", cat: "smartphones", reason: "Lite modifier must not merge into S24" },
  { title: "Google Pixel 8a 5G (128 GB) - Bay Blue", brand: "Google", model: "Pixel 8a", cat: "smartphones", reason: "Pixel 8a budget tier must not merge into Pixel 8" },
  { title: "OnePlus 12 Lite 5G (128 GB) - Silver", brand: "OnePlus", model: "OnePlus 12 Lite", cat: "smartphones", reason: "Lite modifier must not merge into OnePlus 12" },
  { title: "Apple Watch Series 9 Ultra 49mm", brand: "Apple", model: "Apple Watch Series 9 Ultra", cat: "wearables", reason: "Hybrid hallucinated model name must not merge into S9 or Ultra 2" },
];

for (let i = 0; i < 40; i++) {
  const trap = MODIFIER_TRAPS[i % MODIFIER_TRAPS.length];
  addPair(
    {
      title: `${trap.title} [Retail Variation ${i + 1}]`,
      brand: trap.brand,
      model: trap.model,
      sourceUrl: `https://shopping.com/mod-trap-${i}`,
    },
    null,
    trap.cat,
    "model_modifier_trap",
    `Adversarial Model Modifier: ${trap.reason}`,
  );
}

// 5. GENERATION / CHIPSET ADVERSARIAL TRAPS (35 pairs)
const GENERATION_TRAPS = [
  { title: "Apple MacBook Air 13.6-inch M1 Chip (256 GB) - Gold", brand: "Apple", model: "MacBook Air", cat: "laptops", reason: "MacBook Air M1 must not merge into M2 or M3 catalog" },
  { title: "Apple MacBook Air 13.6-inch M4 Chip (256 GB) - Space Black", brand: "Apple", model: "MacBook Air", cat: "laptops", reason: "MacBook Air M4 must not merge into M2/M3 catalog" },
  { title: "Apple MacBook Pro 14-inch M2 Chip (512 GB) - Silver", brand: "Apple", model: "MacBook Pro", cat: "laptops", reason: "MacBook Pro M2 must not merge into M3 catalog" },
  { title: "Apple MacBook Pro 14-inch M3 Pro Chip (512 GB) - Space Black", brand: "Apple", model: "MacBook Pro", cat: "laptops", reason: "MacBook Pro M3 Pro tier must not merge into base M3" },
  { title: "Apple Watch Series 8 GPS 45mm - Starlight Aluminium", brand: "Apple", model: "Apple Watch Series 8", cat: "wearables", reason: "Series 8 must not merge into Series 9 catalog" },
  { title: "Apple Watch Series 7 GPS 45mm - Green Aluminium", brand: "Apple", model: "Apple Watch Series 7", cat: "wearables", reason: "Series 7 must not merge into Series 9 catalog" },
  { title: "Apple Watch Ultra 1st Gen GPS + Cellular 49mm", brand: "Apple", model: "Apple Watch Ultra", cat: "wearables", reason: "Ultra 1st Gen must not merge into Ultra 2" },
  { title: "Sony WH-1000XM3 Wireless Noise Cancelling Headphones", brand: "Sony", model: "WH-1000XM3", cat: "audio", reason: "Sony XM3 must not merge into XM4 or XM5" },
  { title: "Apple AirPods Pro (1st Generation) with Wireless Charging Case", brand: "Apple", model: "AirPods Pro", cat: "audio", reason: "AirPods Pro 1st Gen must not merge into AirPods Pro 2nd Gen" },
  { title: "Apple AirPods Pro (3rd Generation) Concept Edition", brand: "Apple", model: "AirPods Pro", cat: "audio", reason: "AirPods Pro 3rd Gen must not merge into AirPods Pro 2" },
];

for (let i = 0; i < 35; i++) {
  const trap = GENERATION_TRAPS[i % GENERATION_TRAPS.length];
  addPair(
    {
      title: `${trap.title} - Batch #${i + 1}`,
      brand: trap.brand,
      model: trap.model,
      sourceUrl: `https://gadgets.com/gen-trap-${i}`,
    },
    null,
    trap.cat,
    "generation_mismatch_trap",
    `Adversarial Generation Trap: ${trap.reason}`,
  );
}

// 6. ACCESSORY ADVERSARIAL TRAPS (Cases, Covers, Protectors, Straps, Cushions) (45 pairs)
const ACCESSORY_TRAPS = [
  { title: "Spigen Rugged Armor Case for Apple iPhone 15 (Black)", brand: "Spigen", cat: "accessories" },
  { title: "Apple iPhone 15 Silicone Case with MagSafe - Storm Blue", brand: "Apple", model: "iPhone 15", cat: "accessories" },
  { title: "Tempered Glass Screen Protector for Apple iPhone 15 (2-Pack)", brand: "Spigen", cat: "accessories" },
  { title: "ESR Camera Lens Protector for Apple iPhone 15 Pro Max", brand: "ESR", cat: "accessories" },
  { title: "Ringke Fusion Magnetic Clear Cover for Samsung Galaxy S24 Ultra", brand: "Ringke", cat: "accessories" },
  { title: "Samsung Galaxy S24 Ultra Smart View Wallet Case - Black", brand: "Samsung", model: "Galaxy S24 Ultra", cat: "accessories" },
  { title: "Replacement Ear Cushions Earpads for Sony WH-1000XM5 Headphones", brand: "Geekria", cat: "accessories" },
  { title: "Cooling Gel Earpad Replacement for Sony WH-1000XM4", brand: "Wicked Cushions", cat: "accessories" },
  { title: "Silicone Protective Case Sleeve for Apple AirPods Pro 2", brand: "Elago", cat: "accessories" },
  { title: "Alpine Loop Nylon Band Strap 49mm for Apple Watch Ultra 2", brand: "Apple", model: "Apple Watch Ultra 2", cat: "accessories" },
  { title: "Sport Band 45mm Midnight for Apple Watch Series 9", brand: "Apple", model: "Apple Watch Series 9", cat: "accessories" },
  { title: "Incase Hardshell Protective Case for Apple MacBook Air 13.6-inch M2", brand: "Incase", cat: "accessories" },
  { title: "Keyboard Protector Skin Film for Apple MacBook Pro 14 M3", brand: "Mosiso", cat: "accessories" },
  { title: "Dyson V12 Replacement Filter and HEPA Kit", brand: "Dyson", model: "V12 Detect Slim", cat: "accessories" },
  { title: "Motorhead Cleaner Brush Replacement for Dyson V12", brand: "Dyson", model: "V12 Detect Slim", cat: "accessories" },
];

for (let i = 0; i < 45; i++) {
  const trap = ACCESSORY_TRAPS[i % ACCESSORY_TRAPS.length];
  addPair(
    {
      title: `${trap.title} [Accessory Listing #${i + 1}]`,
      brand: trap.brand,
      model: trap.model,
      sourceUrl: `https://amazon.in/dp/B0ACC${i}`,
    },
    null,
    "accessories",
    "accessory_trap",
    `Accessory Trap: An accessory/cover/protector must NEVER merge into the device catalog item: '${trap.title}'`,
  );
}

// 7. CONDITION ADVERSARIAL TRAPS (Refurbished, Renewed, Open-Box) (30 pairs)
const CONDITION_TRAPS = [
  { title: "Apple iPhone 15 (128 GB) - Black (Refurbished - Very Good Condition)", brand: "Apple", model: "iPhone 15", ean: "0195949038289" },
  { title: "Apple iPhone 15 (256 GB) - Black [Amazon Renewed Premium]", brand: "Apple", model: "iPhone 15" },
  { title: "Sony WH-1000XM5 Noise Cancelling Headphones - Certified Refurbished", brand: "Sony", model: "WH-1000XM5" },
  { title: "Samsung Galaxy S24 5G (256 GB) - Open Box Return", brand: "Samsung", model: "Galaxy S24" },
  { title: "Apple MacBook Air 13.6 M2 - Pre-Owned Grade A", brand: "Apple", model: "MacBook Air" },
  { title: "Bose QuietComfort Ultra Headphones - Used Like New", brand: "Bose", model: "QuietComfort Ultra" },
];

for (let i = 0; i < 30; i++) {
  const trap = CONDITION_TRAPS[i % CONDITION_TRAPS.length];
  addPair(
    {
      title: `${trap.title} (Verified Seller Listing ${i + 1})`,
      brand: trap.brand,
      model: trap.model,
      ean: trap.ean,
      sourceUrl: `https://cashify.in/refurb-${i}`,
    },
    null,
    "refurbished",
    "condition_trap",
    `Condition Trap: Refurbished/Renewed/Open-Box unit must NEVER merge into brand-new catalog SKU: '${trap.title}'`,
  );
}

// 8. MULTI-PACK & PACK-SIZE ADVERSARIAL TRAPS (20 pairs)
const PACK_TRAPS = [
  { title: "Colgate Total Clean Mint Antibacterial Toothpaste - 120g (Pack of 2)", brand: "Colgate", model: "Total Clean Mint", ean: "8901314010200" },
  { title: "Colgate Total Clean Mint Antibacterial Toothpaste - 120g (Pack of 3)", brand: "Colgate", model: "Total Clean Mint" },
  { title: "Colgate Total Clean Mint Antibacterial Toothpaste - 120g (Pack of 6 Saver Bundle)", brand: "Colgate", model: "Total Clean Mint" },
  { title: "Nescafé Gold Blend Instant Coffee Jar - 100g (Pack of 2)", brand: "Nescafe", model: "Gold Blend", ean: "7613035610012" },
  { title: "Nescafé Gold Blend Instant Coffee Jar - 100g (Set of 3 Jars)", brand: "Nescafe", model: "Gold Blend" },
];

for (let i = 0; i < 20; i++) {
  const trap = PACK_TRAPS[i % PACK_TRAPS.length];
  addPair(
    {
      title: `${trap.title} [Super Saver Promo #${i + 1}]`,
      brand: trap.brand,
      model: trap.model,
      ean: trap.ean,
      sourceUrl: `https://blinkit.com/item/pack-${i}`,
    },
    null,
    "cpg",
    "pack_size_trap",
    `Pack Size Trap: Multi-pack bundle must NEVER merge into single-unit SKU: '${trap.title}'`,
  );
}

// 9. COMPATIBILITY & THIRD-PARTY CLONE TRAPS (15 pairs)
const COMPAT_TRAPS = [
  { title: "Magnetic Wireless Power Bank 10000mAh Compatible with Apple iPhone 15", brand: "Anker", cat: "electronics" },
  { title: "USB-C to Lightning Fast Charging Cable for Apple iPhone 14 / 13", brand: "Portronics", cat: "electronics" },
  { title: "Stylus Pen with Palm Rejection Compatible with Apple iPad & iPhone", brand: "Baseus", cat: "electronics" },
  { title: "45W Super Fast Charger Adapter for Samsung Galaxy S24 Ultra", brand: "Ambrane", cat: "electronics" },
  { title: "Adjustable Desktop Aluminum Stand Fits Apple MacBook Air M2 / M3", brand: "Moft", cat: "electronics" },
];

for (let i = 0; i < 15; i++) {
  const trap = COMPAT_TRAPS[i % COMPAT_TRAPS.length];
  addPair(
    {
      title: `${trap.title} (Heavy Duty Edition ${i + 1})`,
      brand: trap.brand,
      sourceUrl: `https://flipkart.com/compat-${i}`,
    },
    null,
    trap.cat,
    "compatibility_trap",
    `Compatibility Trap: 'Compatible with' third-party hardware must not match target device: '${trap.title}'`,
  );
}

// Output summary
console.info(`Generated Catalog: ${CATALOG.length} items`);
console.info(`Generated Gold-Set: ${GOLD_SET.length} pairs across error taxonomies`);

const countsByTaxonomy: Record<string, number> = {};
for (const p of GOLD_SET) {
  countsByTaxonomy[p.taxonomy] = (countsByTaxonomy[p.taxonomy] || 0) + 1;
}
console.info("Taxonomy breakdown:", JSON.stringify(countsByTaxonomy, null, 2));

const fixturesDir = path.join(__dirname, "..", "fixtures");
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const outputPath = path.join(fixturesDir, "independent-gold-set.json");
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      metadata: {
        totalCatalogProducts: CATALOG.length,
        totalGoldSetPairs: GOLD_SET.length,
        taxonomyBreakdown: countsByTaxonomy,
      },
      catalog: CATALOG,
      goldSet: GOLD_SET,
    },
    null,
    2,
  ),
  "utf-8",
);

console.info(`Saved gold set artifact to: ${outputPath}`);
