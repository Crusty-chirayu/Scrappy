import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDefaultAdapters, findAdapterForUrl, AmazonInAdapter, FlipkartAdapter } from "../index.js";
import { FetchResult } from "@scrappy/scraping";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Source Adapters & Fixtures", () => {
  it("registers all required adapters", () => {
    const adapters = createDefaultAdapters();
    expect(adapters.length).toBe(4);
    const ids = adapters.map((a) => a.id);
    expect(ids).toContain("amazon-in");
    expect(ids).toContain("flipkart");
    expect(ids).toContain("croma");
    expect(ids).toContain("reliance-digital");
  });

  it("identifies Amazon India URLs", () => {
    const adapter = findAdapterForUrl("https://www.amazon.in/dp/B0CX21Q8TG");
    expect(adapter).not.toBeNull();
    expect(adapter?.id).toBe("amazon-in");
  });

  it("identifies Flipkart URLs", () => {
    const adapter = findAdapterForUrl("https://www.flipkart.com/apple-iphone-15/p/itm12345");
    expect(adapter).not.toBeNull();
    expect(adapter?.id).toBe("flipkart");
  });

  it("marks Croma and Reliance Digital as unsupported with honest error", async () => {
    const croma = findAdapterForUrl("https://www.croma.com/p/123");
    expect(croma?.id).toBe("croma");
    const health = await croma?.getHealth();
    expect(health?.status).toBe("unsupported");
    await expect(croma?.fetch("https://www.croma.com/p/123")).rejects.toThrow(/unsupported/);
  });

  describe("Amazon India Fixture Parsing", () => {
    const adapter = new AmazonInAdapter();

    it("parses Amazon PA-API JSON fixture correctly", async () => {
      const fixturePath = path.resolve(__dirname, "../amazon-in/fixtures/pa-api-response.json");
      const fixtureJson = fs.readFileSync(fixturePath, "utf-8");

      const fetchResult: FetchResult = {
        url: "https://www.amazon.in/dp/B0DGJ9M8V2",
        source: "amazon-in",
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: fixtureJson,
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "api",
        durationMs: 85,
      };

      const offer = await adapter.parse(fetchResult);
      expect(offer.title).toBe("Apple iPhone 16 (128 GB) - Black");
      expect(offer.brand).toBe("Apple");
      expect(offer.pricePaise).toBe(7990000);
      expect(offer.inStock).toBe(true);
      expect(offer.sku).toBe("B0DGJ9M8V2");
      expect(offer.provenance.confidence).toBeGreaterThanOrEqual(0.95);
      expect(offer.provenance.source).toBe("amazon-in");
    });

    it("parses Amazon HTML product page fixture correctly", async () => {
      const fixturePath = path.resolve(__dirname, "../amazon-in/fixtures/sample-product.html");
      const fixtureHtml = fs.readFileSync(fixturePath, "utf-8");

      const fetchResult: FetchResult = {
        url: "https://www.amazon.in/dp/B09XS7JWHH",
        source: "amazon-in",
        statusCode: 200,
        headers: { "content-type": "text/html" },
        body: fixtureHtml,
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "http",
        durationMs: 240,
      };

      const offer = await adapter.parse(fetchResult);
      expect(offer.title).toContain("Sony WH-1000XM5 Wireless");
      expect(offer.brand).toBe("Sony");
      expect(offer.pricePaise).toBe(2699000);
      expect(offer.originalPricePaise).toBe(3499000);
      expect(offer.inStock).toBe(true);
      expect(offer.merchantName).toBe("Electronic Vault Pvt Ltd");
      expect(offer.sellerRating).toBe(4.5);
      expect(offer.sku).toBe("B09XS7JWHH");
      expect(offer.provenance.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe("Flipkart Fixture Parsing", () => {
    const adapter = new FlipkartAdapter();

    it("parses Flipkart Affiliate API JSON fixture correctly", async () => {
      const fixturePath = path.resolve(__dirname, "../flipkart/fixtures/affiliate-feed-response.json");
      const fixtureJson = fs.readFileSync(fixturePath, "utf-8");

      const fetchResult: FetchResult = {
        url: "https://www.flipkart.com/item/p/itm12345",
        source: "flipkart",
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: fixtureJson,
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "api",
        durationMs: 70,
      };

      const offer = await adapter.parse(fetchResult);
      expect(offer.title).toBe("APPLE iPhone 16 (Black, 128 GB)");
      expect(offer.brand).toBe("Apple");
      expect(offer.model).toBe("iPhone 16");
      expect(offer.pricePaise).toBe(7899900);
      expect(offer.originalPricePaise).toBe(7990000);
      expect(offer.inStock).toBe(true);
      expect(offer.sku).toBe("MOBH2GXYZ123456");
      expect(offer.provenance.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it("parses Flipkart HTML product page fixture correctly", async () => {
      const fixturePath = path.resolve(__dirname, "../flipkart/fixtures/sample-product.html");
      const fixtureHtml = fs.readFileSync(fixturePath, "utf-8");

      const fetchResult: FetchResult = {
        url: "https://www.flipkart.com/sony-wh-1000xm5/p/itm98765",
        source: "flipkart",
        statusCode: 200,
        headers: { "content-type": "text/html" },
        body: fixtureHtml,
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "http",
        durationMs: 190,
      };

      const offer = await adapter.parse(fetchResult);
      expect(offer.title).toContain("SONY WH-1000XM5");
      expect(offer.pricePaise).toBe(2649000);
      expect(offer.originalPricePaise).toBe(3499000);
      expect(offer.inStock).toBe(true);
      expect(offer.merchantName).toBe("SuperComNet");
      expect(offer.sellerRating).toBe(4.6);
      expect(offer.provenance.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });
});
