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
      expect(data.items[0].merchants).toContain("Amazon.in");
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

  describe("Billing API", () => {
    it("POST /v1/billing/checkout creates checkout session", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/v1/billing/checkout",
        headers: { "x-workspace-id": "ws-billing-test" },
        payload: {
          planId: "growth",
          billingInterval: "monthly",
        },
      });
      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.orderId).toContain("order_fake");
      expect(data.amountPaise).toBe(1990000);
      expect(data.currency).toBe("INR");
    });
  });
});
