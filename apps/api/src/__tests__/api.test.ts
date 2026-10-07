import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../index.js";

describe("Scrappy REST API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    app = await buildApp();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("GET /health returns healthy status", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("healthy");
    expect(body.version).toBeDefined();
  });

  describe("Search & Autocomplete API", () => {
    it("GET /v1/search returns paginated products from canonical catalog", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/search?q=Apple&limit=5",
      });
      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].title).toContain("Apple");
      expect(data.total).toBeGreaterThan(0);
      expect(data.items[0].lowestPricePaise).toBeGreaterThan(0);
      expect(data.items[0].merchants.some((m: string) => m.toLowerCase().includes("amazon"))).toBe(true);
    });

    it("GET /v1/search/autocomplete returns prefix recommendations", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/search/autocomplete?q=Sony",
      });
      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.suggestions.length).toBeGreaterThan(0);
      expect(data.suggestions[0].brand).toBe("Sony");
    });
  });

  describe("Product Details & Deal Analysis API", () => {
    it("GET /v1/products/:id returns product details, offers, and price history", async () => {
      // Fetch a product ID from search
      const searchRes = await app.inject({ method: "GET", url: "/v1/search?limit=1" });
      const firstId = searchRes.json().items[0].id;

      const res = await app.inject({
        method: "GET",
        url: `/v1/products/${firstId}`,
      });
      expect(res.statusCode).toBe(200);
      const product = res.json();
      expect(product.id).toBe(firstId);
      expect(product.offers.length).toBeGreaterThanOrEqual(2);
      expect(product.priceHistory.length).toBe(31);
    });

    it("GET /v1/products/:id/deal-analysis evaluates deal grade and fake discount", async () => {
      const searchRes = await app.inject({ method: "GET", url: "/v1/search?limit=1" });
      const firstId = searchRes.json().items[0].id;

      const res = await app.inject({
        method: "GET",
        url: `/v1/products/${firstId}/deal-analysis`,
      });
      expect(res.statusCode).toBe(200);
      const analysis = res.json();
      expect(analysis.dealScore).toBeDefined();
      expect(analysis.dealScore.score).toBeGreaterThan(0);
      expect(analysis.fakeDiscount).toBeDefined();
      expect(analysis.fakeDiscount.verdict).toBeDefined();
    });
  });

  describe("Watchlist & Alerts API (Tenant Isolated)", () => {
    it("manages watchlist lifecycle", async () => {
      const searchRes = await app.inject({ method: "GET", url: "/v1/search?limit=1" });
      const prodId = searchRes.json().items[0].id;

      // 1. Add to watchlist
      const addRes = await app.inject({
        method: "POST",
        url: "/v1/watchlist",
        headers: { "x-workspace-id": "ws-test-1" },
        payload: { productId: prodId },
      });
      expect(addRes.statusCode).toBe(200);
      expect(addRes.json().item.productId).toBe(prodId);

      // 2. List watchlist
      const listRes = await app.inject({
        method: "GET",
        url: "/v1/watchlist",
        headers: { "x-workspace-id": "ws-test-1" },
      });
      expect(listRes.statusCode).toBe(200);
      expect(listRes.json().items).toHaveLength(1);

      // 3. Remove from watchlist
      const deleteRes = await app.inject({
        method: "DELETE",
        url: `/v1/watchlist/${prodId}`,
        headers: { "x-workspace-id": "ws-test-1" },
      });
      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.json().success).toBe(true);
    });

    it("manages alerts lifecycle", async () => {
      const searchRes = await app.inject({ method: "GET", url: "/v1/search?limit=1" });
      const prodId = searchRes.json().items[0].id;

      // 1. Create alert
      const createRes = await app.inject({
        method: "POST",
        url: "/v1/alerts",
        headers: { "x-workspace-id": "ws-test-alert" },
        payload: {
          productId: prodId,
          targetPricePaise: 4500000,
          notificationChannel: "in_app",
        },
      });
      expect(createRes.statusCode).toBe(200);
      const alertId = createRes.json().alert.id;
      expect(alertId).toBeDefined();

      // 2. List alerts
      const listRes = await app.inject({
        method: "GET",
        url: "/v1/alerts",
        headers: { "x-workspace-id": "ws-test-alert" },
      });
      expect(listRes.statusCode).toBe(200);
      expect(listRes.json().alerts).toHaveLength(1);

      // 3. Delete alert
      const delRes = await app.inject({
        method: "DELETE",
        url: `/v1/alerts/${alertId}`,
        headers: { "x-workspace-id": "ws-test-alert" },
      });
      expect(delRes.statusCode).toBe(200);
      expect(delRes.json().success).toBe(true);
    });
  });

  describe("Extract API", () => {
    it("POST /v1/extract/validate-url validates safe URLs and blocks private IPs", async () => {
      const safeRes = await app.inject({
        method: "POST",
        url: "/v1/extract/validate-url",
        payload: { url: "https://books.toscrape.com/catalogue/page-1.html" },
      });
      expect(safeRes.statusCode).toBe(200);
      expect(safeRes.json().valid).toBe(true);

      const unsafeRes = await app.inject({
        method: "POST",
        url: "/v1/extract/validate-url",
        payload: { url: "http://169.254.169.254/latest/meta-data/" },
      });
      expect(unsafeRes.statusCode).toBe(200);
      expect(unsafeRes.json().valid).toBe(false);
    });

    it("GET /v1/extract/templates returns built-in scraper configurations", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/extract/templates",
      });
      expect(res.statusCode).toBe(200);
      const templates = res.json();
      expect(templates.length).toBeGreaterThanOrEqual(2);
      expect(templates[0].id).toBe("tpl_ecommerce_list");
    });

    it("POST /v1/extract/test-run extracts structured fields from HTML snippet", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/v1/extract/test-run",
        payload: {
          html: `<div class="product"><h2 class="title">Wireless Earbuds</h2><span class="price">₹2,499</span></div>`,
          itemSelector: ".product",
          fields: [
            {
              id: "f1",
              name: "title",
              type: "string",
              selectors: { primary: ".title", resilienceScore: 80 },
              transforms: [{ type: "trim" }],
            },
            {
              id: "f2",
              name: "pricePaise",
              type: "currency",
              selectors: { primary: ".price", resilienceScore: 80 },
              transforms: [{ type: "parse_currency_paise" }],
            },
          ],
        },
      });
      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.totalExtracted).toBe(1);
      expect(data.records[0].title).toBe("Wireless Earbuds");
      expect(data.records[0].pricePaise).toBe(249900);
      expect(data.diagnostics[0].fillRatePercent).toBe(100);
    });

    it("POST /v1/extract/export exports records to CSV and NDJSON", async () => {
      const csvRes = await app.inject({
        method: "POST",
        url: "/v1/extract/export",
        payload: {
          format: "csv",
          records: [{ id: "1", title: "Item A", price: 100 }],
        },
      });
      expect(csvRes.statusCode).toBe(200);
      expect(csvRes.headers["content-type"]).toContain("text/csv");
      expect(csvRes.body).toContain("id,title,price");
      expect(csvRes.body).toContain("1,Item A,100");
    });
  });

  describe("Price Intelligence API", () => {
    it("GET /v1/intelligence/competitors returns price spread and undercut leader", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/intelligence/competitors",
      });
      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.competitorSpread.length).toBeGreaterThan(0);
      expect(data.competitorSpread[0].storePrices).toBeDefined();
      expect(data.competitorSpread[0].undercutLeader).toBeDefined();
    });
  });

  describe("Matching Engine API", () => {
    it("POST /v1/matching/evaluate returns match decision with reasons", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/v1/matching/evaluate",
        payload: {
          title: "Apple Smartphone Model Pro-1X Special Edition",
          brand: "Apple",
          model: "Pro-1X",
          ean: "8901000000001",
          sourceUrl: "https://amazon.in/dp/B0CX123",
        },
      });
      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.decision).toBeDefined();
      expect(["verified", "matched", "possible_match"]).toContain(data.decision.confidenceLevel);
      expect(data.candidateCount).toBeGreaterThan(0);
    });

    it("GET /v1/matching/review-queue lists items pending human verification", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/v1/matching/review-queue",
      });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.json().pending)).toBe(true);
    });
  });
});
