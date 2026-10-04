import { describe, it, expect } from "vitest";
import { Product } from "@scrappy/core";
import {
  DeterministicMatchingEngine,
  MatchingBenchmarkHarness,
  GroundTruthPair,
} from "../index.js";

const ADVERSARIAL_CATALOG: Product[] = [
  {
    id: "prod-apple-iphone-15-128-black",
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
    id: "prod-apple-iphone-15-256-black",
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
    id: "prod-apple-iphone-15-pro-128",
    title: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    brand: "Apple",
    model: "iPhone 15 Pro",
    ean: "0195949041234",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-sony-wh-1000xm5-black",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black",
    brand: "Sony",
    model: "WH-1000XM5",
    ean: "4548736132566",
    categoryId: "audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-colgate-total-120g",
    title: "Colgate Total Clean Mint Antibacterial Toothpaste - 120g",
    brand: "Colgate",
    model: "Total Clean Mint",
    ean: "8901314010200",
    categoryId: "oral-care",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ADVERSARIAL_GOLD_SET: GroundTruthPair[] = [
  // 1. Positive: Exact EAN match
  {
    id: "adv-pos-1",
    offer: {
      title: "Apple iPhone 15 128GB Black Smartphone with Dynamic Island",
      ean: "0195949038289",
      sourceUrl: "https://amazon.in/dp/B0CHX1W1XY",
    },
    expectedProductId: "prod-apple-iphone-15-128-black",
    description: "Exact EAN barcode match for 128GB iPhone 15",
  },
  // 2. Positive: Exact UPC match
  {
    id: "adv-pos-2",
    offer: {
      title: "Apple iPhone 15 - Black, 128 GB",
      upc: "195949038289",
      sourceUrl: "https://flipkart.com/item/1",
    },
    expectedProductId: "prod-apple-iphone-15-128-black",
    description: "Exact UPC barcode match for 128GB iPhone 15",
  },
  // 3. Positive: Exact Brand + Model + Storage match
  {
    id: "adv-pos-3",
    offer: {
      title: "Apple iPhone 15 256GB Black Super Retina XDR",
      brand: "Apple",
      model: "iPhone 15",
      sourceUrl: "https://croma.com/p/iphone15-256",
    },
    expectedProductId: "prod-apple-iphone-15-256-black",
    description: "Brand + Model with verified 256GB storage match",
  },
  // 4. Positive: Exact Brand + Model for headphones
  {
    id: "adv-pos-4",
    offer: {
      title: "Sony WH-1000XM5 Over-Ear Noise Cancelling Headphones",
      brand: "Sony",
      model: "WH-1000XM5",
      sourceUrl: "https://sony.com/wh1000xm5",
    },
    expectedProductId: "prod-sony-wh-1000xm5-black",
    description: "Verified Brand and Model for Sony headphones",
  },
  // --- ADVERSARIAL NEGATIVES (Must NEVER false merge!) ---
  // 5. Adversarial Storage Conflict (128GB vs 256GB)
  {
    id: "adv-neg-storage",
    offer: {
      title: "Apple iPhone 15 (512 GB) - Black",
      brand: "Apple",
      model: "iPhone 15",
      sourceUrl: "https://retailer.com/iphone-512",
    },
    expectedProductId: null, // Catalog only has 128 and 256; 512 must NOT merge into either
    description: "Storage mismatch: 512GB offer must not merge into 128GB or 256GB catalog item",
  },
  // 6. Adversarial Accessory Collision (Silicone Case with phone title in string)
  {
    id: "adv-neg-accessory-1",
    offer: {
      title: "Apple iPhone 15 Silicone Case with MagSafe - Black",
      brand: "Apple",
      model: "iPhone 15", // often tagged by naive scrapers with phone's model
      sourceUrl: "https://amazon.in/dp/B0CASE123",
    },
    expectedProductId: null, // An accessory must NEVER merge into the device entity
    description: "Accessory trap: Silicone case must not merge into smartphone device",
  },
  // 7. Adversarial Accessory Collision (Screen Protector)
  {
    id: "adv-neg-accessory-2",
    offer: {
      title: "Tempered Glass Screen Protector for Apple iPhone 15 (Pack of 2)",
      sourceUrl: "https://flipkart.com/screen-guard",
    },
    expectedProductId: null,
    description: "Accessory trap: Screen protector must not merge into phone",
  },
  // 8. Adversarial Refurbished vs New Collision
  {
    id: "adv-neg-refurbished",
    offer: {
      title: "Sony WH-1000XM5 Headphones - Certified Refurbished",
      brand: "Sony",
      model: "WH-1000XM5",
      sourceUrl: "https://backmarket.com/sony-renewed",
    },
    expectedProductId: null, // Refurbished SKU must not merge silently into brand-new product
    description: "Condition trap: Refurbished offer must not merge into new product",
  },
  // 9. Adversarial Pack-Size Collision (Single vs Multi-pack)
  {
    id: "adv-neg-pack-size",
    offer: {
      title: "Colgate Total Clean Mint Antibacterial Toothpaste - 120g (Pack of 3)",
      brand: "Colgate",
      model: "Total Clean Mint",
      sourceUrl: "https://amazon.in/dp/B0PACKOF3",
    },
    expectedProductId: null, // Pack of 3 must not merge into single 120g unit
    description: "Pack size trap: 3-pack must not merge into 1-pack SKU",
  },
  // 10. Adversarial Tier/Modifier Collision (iPhone 15 vs iPhone 15 Pro / Plus)
  {
    id: "adv-neg-tier-modifier",
    offer: {
      title: "Apple iPhone 15 Plus (128 GB) - Black",
      brand: "Apple",
      model: "iPhone 15 Plus",
      sourceUrl: "https://retailer.com/iphone15-plus",
    },
    expectedProductId: null, // iPhone 15 Plus is not iPhone 15
    description: "Model modifier trap: iPhone 15 Plus must not merge into base iPhone 15",
  },
];

describe("Adversarial Entity Matching Gold-Set Benchmark", () => {
  it("achieves 100% precision with 0.0% false positives across adversarial edge cases", async () => {
    const engine = new DeterministicMatchingEngine(ADVERSARIAL_CATALOG);
    const harness = new MatchingBenchmarkHarness(engine);

    const metrics = await harness.evaluate(ADVERSARIAL_CATALOG, ADVERSARIAL_GOLD_SET);

    // Constitution Rule 4: A false product match is worse than a missed match.
    // False positive rate MUST be 0.0%
    expect(metrics.falsePositives).toBe(0);
    expect(metrics.falsePositiveRate).toBe(0.0);
    expect(metrics.precision).toBe(1.0);
    expect(metrics.truePositives).toBe(4);
    expect(metrics.trueNegatives).toBe(6);
    expect(metrics.totalPairs).toBe(10);
  });
});
