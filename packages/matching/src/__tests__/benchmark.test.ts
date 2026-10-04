import { describe, it, expect } from "vitest";
import { Product } from "@scrappy/core";
import {
  DeterministicMatchingEngine,
  MatchingBenchmarkHarness,
  GroundTruthPair,
  MatchReviewQueue,
} from "../index.js";

const TEST_CATALOG: Product[] = [
  {
    id: "prod-apple-iphone-15-128",
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
    id: "prod-samsung-galaxy-s24-256",
    title: "Samsung Galaxy S24 5G (Onyx Black, 256 GB)",
    brand: "Samsung",
    model: "Galaxy S24",
    ean: "8806095384921",
    categoryId: "smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-sony-wh-1000xm5",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black",
    brand: "Sony",
    model: "WH-1000XM5",
    ean: "4548736132566",
    categoryId: "audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const GROUND_TRUTH_PAIRS: GroundTruthPair[] = [
  // Exact EAN match
  {
    id: "gt-1",
    offer: {
      title: "Apple iPhone 15 128GB Black Smartphone with Dynamic Island",
      ean: "0195949038289",
      sourceUrl: "https://amazon.in/dp/B0CHX1W1XY",
    },
    expectedProductId: "prod-apple-iphone-15-128",
    description: "Exact EAN match for iPhone 15",
  },
  // Exact UPC match
  {
    id: "gt-2",
    offer: {
      title: "Apple iPhone 15 - Black, 128 GB",
      upc: "195949038289",
      sourceUrl: "https://flipkart.com/item/1",
    },
    expectedProductId: "prod-apple-iphone-15-128",
    description: "Exact UPC match for iPhone 15",
  },
  // Exact Brand + Model match
  {
    id: "gt-3",
    offer: {
      title: "Sony WH-1000XM5 Over-Ear Headphones (Silver edition)",
      brand: "Sony",
      model: "WH-1000XM5",
      sourceUrl: "https://croma.com/p/123",
    },
    expectedProductId: "prod-sony-wh-1000xm5",
    description: "Brand and Model identifier match",
  },
  // Similar title but DIFFERENT model variant (must NOT merge!)
  {
    id: "gt-4",
    offer: {
      title: "Apple iPhone 15 Plus (128 GB) - Black",
      brand: "Apple",
      model: "iPhone 15 Plus",
      sourceUrl: "https://amazon.in/dp/B0CHX9999",
    },
    expectedProductId: null, // Plus is different from Base
    description: "Similar title but iPhone 15 Plus instead of base model (must reject/flag)",
  },
  // Completely unrelated offer
  {
    id: "gt-5",
    offer: {
      title: "boAt Rockerz 450 Bluetooth On Ear Headphones with Mic",
      brand: "boAt",
      model: "Rockerz 450",
      sourceUrl: "https://amazon.in/dp/B07PR1CL3S",
    },
    expectedProductId: null,
    description: "Unrelated audio product",
  },
  // Ambiguous title match (should be flagged as possible match, not merged!)
  {
    id: "gt-6",
    offer: {
      title: "Samsung Galaxy S24 Smartphone (No accessories)",
      sourceUrl: "https://ebay.com/item/99",
    },
    expectedProductId: null, // should NOT auto-merge without verified barcode/model
    description: "Ambiguous title without barcode (Constitution: never merge silently)",
  },
];

describe("Entity Matching Benchmark & Review Queue", () => {
  it("executes benchmark with 0% false positives (Constitution Rule 4)", async () => {
    const engine = new DeterministicMatchingEngine(TEST_CATALOG);
    const harness = new MatchingBenchmarkHarness(engine);

    const metrics = await harness.evaluate(TEST_CATALOG, GROUND_TRUTH_PAIRS);

    expect(metrics.totalPairs).toBe(6);
    expect(metrics.falsePositives).toBe(0); // STRICT: ZERO FALSE POSITIVES
    expect(metrics.falsePositiveRate).toBe(0);
    expect(metrics.precision).toBe(1.0); // 100% precision
    expect(metrics.truePositives).toBe(3);
    expect(metrics.trueNegatives).toBe(3);
  });

  it("handles ReviewQueue lifecycle: enqueue, approve, reject", () => {
    const queue = new MatchReviewQueue();
    const offer = GROUND_TRUTH_PAIRS[3]!.offer;
    const candidate = TEST_CATALOG[0]!;

    const item = queue.enqueue(offer, candidate, {
      productId: null,
      confidence: 0.75,
      confidenceLevel: "possible_match",
      reasons: ["Title overlap with iPhone 15 base"],
      matchedFields: { titleSimilarity: 0.75 },
    });

    expect(item.status).toBe("pending");
    expect(queue.getPending().length).toBe(1);

    // Reject match (iPhone 15 Plus is not base iPhone 15)
    const rejected = queue.reject(item.id, "reviewer@scrappy.in", "Plus is a distinct display size variant");
    expect(rejected.status).toBe("rejected");
    expect(rejected.reviewerNotes).toContain("Plus is a distinct");
    expect(queue.getPending().length).toBe(0);
  });
});
