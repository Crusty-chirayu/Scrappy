import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { validateEnv, ApiEnvSchema, formatINR, validateTargetUrl } from "@scrappy/core";
import {
  defaultCatalogRepository,
  defaultSupabaseRepository,
  type ICatalogRepository,
} from "@scrappy/db";
import { calculateDealScore, analyzeFakeDiscount } from "@scrappy/pricing";
import { extractRecordsFromHtml, exportToCsv, exportToNdjson, type ExtractorField } from "@scrappy/scraping";
import { DeterministicMatchingEngine, MatchReviewQueue } from "@scrappy/matching";

const env = validateEnv(ApiEnvSchema, process.env, "API Service");

export async function buildApp(customRepo?: ICatalogRepository) {
  const repo =
    customRepo ||
    (process.env.NODE_ENV === "test" && !process.env.USE_REAL_DB
      ? defaultCatalogRepository
      : defaultSupabaseRepository);

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "SCRAPPY REST API",
        description: "Public API for Scrappy: Compare, Intelligence, and Extract",
        version: "0.2.0",
      },
      servers: [{ url: env.API_BASE_URL }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // --- System Health ---
  app.get(
    "/health",
    {
      schema: {
        tags: ["System"],
        summary: "System health check",
        response: {
          200: z.object({
            status: z.literal("healthy"),
            timestamp: z.string().datetime(),
            version: z.string(),
          }),
        },
      },
    },
    async () => {
      return {
        status: "healthy" as const,
        timestamp: new Date().toISOString(),
        version: "0.2.0",
      };
    },
  );

  // --- Search & Autocomplete ---
  app.get(
    "/v1/search",
    {
      schema: {
        tags: ["Search"],
        summary: "Search products with facets, price filters, and pagination",
        querystring: z.object({
          q: z.string().optional(),
          category: z.string().optional(),
          brand: z.string().optional(),
          minPrice: z.coerce.number().optional(),
          maxPrice: z.coerce.number().optional(),
          sort: z.enum(["price_asc", "price_desc", "relevance"]).optional(),
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(20),
        }),
      },
    },
    async (request) => {
      const q = request.query;
      const res = await repo.search({
        query: q.q,
        category: q.category,
        brand: q.brand,
        minPricePaise: q.minPrice ? q.minPrice * 100 : undefined,
        maxPricePaise: q.maxPrice ? q.maxPrice * 100 : undefined,
        sort: q.sort,
        page: q.page,
        limit: q.limit,
      });

      return res;
    },
  );

  app.get(
    "/v1/search/autocomplete",
    {
      schema: {
        tags: ["Search"],
        summary: "Instant search prefix autocomplete",
        querystring: z.object({
          q: z.string().min(1),
          limit: z.coerce.number().default(8),
        }),
      },
    },
    async (request) => {
      const suggestions = await repo.autocomplete(request.query.q, request.query.limit);
      return { suggestions };
    },
  );

  // --- Product Details & Price History ---
  app.get(
    "/v1/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Get canonical product details by ID",
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const product = await repo.getProductDetail(request.params.id);
      if (!product) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Product with ID '${request.params.id}' was not found`,
        });
      }
      return product;
    },
  );

  app.get(
    "/v1/products/:id/deal-analysis",
    {
      schema: {
        tags: ["Pricing"],
        summary: "Analyze deal score and detect fake discount claims",
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const product = await repo.getProductDetail(request.params.id);
      if (!product) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Product with ID '${request.params.id}' was not found`,
        });
      }

      const lowestPrice = product.lowestPricePaise;
      const claimedOriginal = product.originalPricePaise ?? lowestPrice;

      // Calculate stats from 30d history
      const prices = (product.priceHistory || []).map((h) => h.pricePaise);
      const avgPrice = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / (prices.length || 1));
      const sorted = [...prices].sort((a: number, b: number) => a - b);
      const medianPrice = sorted[Math.floor(sorted.length / 2)] ?? lowestPrice;
      const allTimeLow = prices.length > 0 ? Math.min(...prices) : lowestPrice;

      const dealScore = calculateDealScore(lowestPrice, {
        productId: product.id,
        minPricePaise: allTimeLow,
        maxPricePaise: Math.max(...prices),
        avgPricePaise: avgPrice,
        medianPricePaise: medianPrice,
        currentLowestPaise: lowestPrice,
        allTimeLowPaise: allTimeLow,
        sampleCount: prices.length,
      });

      const fakeDiscount = analyzeFakeDiscount(lowestPrice, claimedOriginal, medianPrice);

      return {
        productId: product.id,
        lowestPricePaise: lowestPrice,
        dealScore,
        fakeDiscount,
      };
    },
  );

  // --- Watchlist (Tenant Isolated) ---
  app.get(
    "/v1/watchlist",
    {
      schema: {
        tags: ["Watchlist"],
        summary: "List user watchlist items",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const items = await repo.getWatchlist(workspaceId);
      return { items };
    },
  );

  app.post(
    "/v1/watchlist",
    {
      schema: {
        tags: ["Watchlist"],
        summary: "Add product to workspace watchlist",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
          "x-user-id": z.string().default("usr-default"),
        }),
        body: z.object({
          productId: z.string(),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const userId = request.headers["x-user-id"] as string;
      const item = await repo.addToWatchlist(workspaceId, userId, request.body.productId);
      return { item };
    },
  );

  app.delete(
    "/v1/watchlist/:productId",
    {
      schema: {
        tags: ["Watchlist"],
        summary: "Remove product from watchlist",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
        }),
        params: z.object({
          productId: z.string(),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const success = await repo.removeFromWatchlist(workspaceId, request.params.productId);
      return { success };
    },
  );

  // --- Alerts (Tenant Isolated) ---
  app.get(
    "/v1/alerts",
    {
      schema: {
        tags: ["Alerts"],
        summary: "List price drop alerts for workspace",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const alerts = await repo.getAlerts(workspaceId);
      return { alerts };
    },
  );

  app.post(
    "/v1/alerts",
    {
      schema: {
        tags: ["Alerts"],
        summary: "Create price drop alert",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
          "x-user-id": z.string().default("usr-default"),
        }),
        body: z.object({
          productId: z.string(),
          targetPricePaise: z.number().int().positive(),
          notificationChannel: z.enum(["email", "in_app", "webhook"]).default("in_app"),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const userId = request.headers["x-user-id"] as string;
      const alert = await repo.createAlert({
        workspaceId,
        userId,
        productId: request.body.productId,
        targetPricePaise: request.body.targetPricePaise,
        notificationChannel: request.body.notificationChannel,
      });
      return { alert };
    },
  );

  app.delete(
    "/v1/alerts/:id",
    {
      schema: {
        tags: ["Alerts"],
        summary: "Delete price drop alert",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
        }),
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const success = await repo.deleteAlert(workspaceId, request.params.id);
      return { success };
    },
  );

  // --- Billing & Subscription Lifecycle ---
  app.post(
    "/v1/billing/checkout",
    {
      schema: {
        tags: ["Billing"],
        summary: "Initiate subscription checkout session",
        headers: z.object({
          "x-workspace-id": z.string().default("ws-default"),
        }),
        body: z.object({
          planId: z.enum(["starter", "growth", "enterprise"]),
          billingInterval: z.enum(["monthly", "annual"]).default("monthly"),
        }),
      },
    },
    async (request) => {
      const workspaceId = request.headers["x-workspace-id"] as string;
      const planPrices = {
        starter: { monthly: 490000, annual: 4900000 },
        growth: { monthly: 1990000, annual: 19900000 },
        enterprise: { monthly: 7990000, annual: 79900000 },
      };

      const pricePaise = planPrices[request.body.planId][request.body.billingInterval];

      return {
        orderId: `order_fake_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        workspaceId,
        amountPaise: pricePaise,
        currency: "INR",
        keyId: "rzp_test_local_fake_key",
        mode: env.INTEGRATION_MODE,
      };
    },
  );

  // Price Normalization Utility
  app.post(
    "/v1/prices/normalize",
    {
      schema: {
        tags: ["Pricing"],
        summary: "Normalize raw price input to integer paise with provenance",
        body: z.object({
          rawPrice: z.string().min(1),
          source: z.string().default("custom"),
        }),
      },
    },
    async (request) => {
      const cleaned = request.body.rawPrice.replace(/[₹RsINR,\s]/gi, "").trim();
      const parsed = parseFloat(cleaned);
      const paise = Math.round((isNaN(parsed) ? 0 : parsed) * 100);
      const formatted = formatINR(paise, true);

      return {
        pricePaise: paise,
        formatted: formatted.formatted,
        rupees: formatted.rupees,
        paise: formatted.paise,
      };
    },
  );

  // --- Extract Endpoints (Prompt 11) ---
  app.post(
    "/v1/extract/validate-url",
    {
      schema: {
        tags: ["Extract"],
        summary: "Validate a target URL against SSRF rules and restrictions",
        body: z.object({
          url: z.string().min(1),
        }),
        response: {
          200: z.object({
            valid: z.boolean(),
            sanitizedUrl: z.string().optional(),
            reason: z.string().optional(),
          }),
        },
      },
    },
    async (request) => {
      const res = validateTargetUrl(request.body.url);
      return res;
    },
  );

  app.get(
    "/v1/extract/templates",
    {
      schema: {
        tags: ["Extract"],
        summary: "List built-in extraction templates",
      },
    },
    async () => {
      return [
        {
          id: "tpl_ecommerce_list",
          name: "E-Commerce Product Listing",
          description: "Extract titles, prices, ratings, and URLs from catalog listing pages",
          itemSelector: ".product-item, [data-component-type='s-search-result'], ._1AtVbE",
          fields: [
            {
              id: "f_title",
              name: "title",
              type: "string",
              required: true,
              selectors: {
                primary: "h2, .product-title, ._4rR01T",
                fallback1: "[data-title]",
                resilienceScore: 85,
              },
              transforms: [{ type: "trim" }],
            },
            {
              id: "f_price",
              name: "pricePaise",
              type: "currency",
              required: true,
              selectors: {
                primary: ".a-price-whole, .price, ._30jeq3",
                fallback1: "[data-price]",
                resilienceScore: 90,
              },
              transforms: [{ type: "parse_currency_paise" }],
            },
            {
              id: "f_url",
              name: "productUrl",
              type: "url",
              required: true,
              selectors: {
                primary: "a.a-link-normal, a._1fQZEK, a[href*='/dp/']",
                resilienceScore: 80,
              },
              transforms: [{ type: "absolute_url" }],
            },
          ],
        },
        {
          id: "tpl_product_detail",
          name: "Product Detail & Specifications",
          description: "Single-item extractor for canonical specifications, MRP, and stock",
          itemSelector: "body",
          fields: [
            {
              id: "f_title",
              name: "title",
              type: "string",
              required: true,
              selectors: {
                primary: "#productTitle, h1.product-name",
                resilienceScore: 95,
              },
              transforms: [{ type: "trim" }],
            },
            {
              id: "f_price",
              name: "currentPricePaise",
              type: "currency",
              required: true,
              selectors: {
                primary: ".priceToPay span.a-price-whole, span.price",
                resilienceScore: 90,
              },
              transforms: [{ type: "parse_currency_paise" }],
            },
            {
              id: "f_mrp",
              name: "mrpPricePaise",
              type: "currency",
              required: false,
              selectors: {
                primary: ".a-price.a-text-price span[aria-hidden='true']",
                resilienceScore: 75,
              },
              transforms: [{ type: "parse_currency_paise" }],
            },
          ],
        },
      ];
    },
  );

  app.post(
    "/v1/extract/test-run",
    {
      schema: {
        tags: ["Extract"],
        summary: "Execute an extraction test against provided HTML or URL",
        body: z.object({
          html: z.string().min(1),
          itemSelector: z.string().optional(),
          baseUrl: z.string().url().optional(),
          fields: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.enum([
                "string",
                "number",
                "boolean",
                "date",
                "currency",
                "url",
                "image",
                "array",
                "object",
              ]),
              required: z.boolean().default(false),
              selectors: z.object({
                primary: z.string(),
                fallback1: z.string().optional(),
                fallback2: z.string().optional(),
                textAnchor: z.string().optional(),
                resilienceScore: z.number().default(75),
              }),
              transforms: z.array(
                z.object({
                  type: z.enum([
                    "trim",
                    "lowercase",
                    "uppercase",
                    "parse_number",
                    "parse_currency_paise",
                    "clean_whitespace",
                    "absolute_url",
                    "regex_replace",
                    "date_iso",
                  ]),
                  param: z.string().optional(),
                }),
              ).default([]),
            }),
          ),
        }),
      },
    },
    async (request) => {
      const { html, fields, itemSelector, baseUrl } = request.body;
      const { records, diagnostics } = extractRecordsFromHtml(
        html,
        fields as unknown as ExtractorField[],
        itemSelector,
        baseUrl,
      );
      return {
        totalExtracted: records.length,
        records,
        diagnostics,
      };
    },
  );

  app.post(
    "/v1/extract/export",
    {
      schema: {
        tags: ["Extract"],
        summary: "Export extracted records to CSV, JSON, or NDJSON",
        body: z.object({
          format: z.enum(["csv", "json", "ndjson"]),
          records: z.array(z.record(z.unknown())),
        }),
      },
    },
    async (request, reply) => {
      const { format, records } = request.body;
      if (format === "csv") {
        const csv = exportToCsv(records);
        reply.header("Content-Type", "text/csv; charset=utf-8");
        return csv;
      }
      if (format === "ndjson") {
        const ndjson = exportToNdjson(records);
        reply.header("Content-Type", "application/x-ndjson; charset=utf-8");
        return ndjson;
      }
      return records;
    },
  );

  // --- Intelligence Endpoints (Prompt 12) ---
  app.get(
    "/v1/intelligence/competitors",
    {
      schema: {
        tags: ["Intelligence"],
        summary: "Get competitor price spread, undercuts, and stock health",
      },
    },
    async () => {
      const topItems = (await repo.search({ limit: 10 })).items;
      const details = await Promise.all(topItems.map((item) => repo.getProductDetail(item.id)));
      return {
        timestamp: new Date().toISOString(),
        trackedCatalogSize: 500,
        competitorSpread: topItems.map((item, idx) => {
          const detail = details[idx];
          const offers = detail?.offers ?? [];
          const amazonOffer = offers.find((o) => o.source === "amazon-in");
          const flipkartOffer = offers.find((o) => o.source === "flipkart");
          const minPrice = item.lowestPricePaise;
          const maxPrice = offers.reduce((max, o) => Math.max(max, o.currentPricePaise), minPrice);
          const spreadPercent = minPrice > 0 ? Math.round(((maxPrice - minPrice) / minPrice) * 100) : 0;

          return {
            productId: item.id,
            productTitle: item.title,
            brand: item.brand,
            lowestPricePaise: minPrice,
            retailerSpreadPercent: spreadPercent,
            storePrices: {
              amazonPaise: amazonOffer?.currentPricePaise ?? null,
              flipkartPaise: flipkartOffer?.currentPricePaise ?? null,
            },
            undercutLeader: amazonOffer && flipkartOffer
              ? amazonOffer.currentPricePaise < flipkartOffer.currentPricePaise
                ? "Amazon.in"
                : "Flipkart"
              : "Tie",
          };
        }),
      };
    },
  );

  // --- Matching Engine Endpoints (Prompt 11) ---
  const catalogSearch = await repo.search({ limit: 500 });
  const matchingEngine = new DeterministicMatchingEngine(
    catalogSearch.items.map((i) => ({
      id: i.id,
      title: i.title,
      brand: i.brand,
      category: i.category,
      model: i.model,
      ean: i.ean,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  );
  const reviewQueue = new MatchReviewQueue();

  app.post(
    "/v1/matching/evaluate",
    {
      schema: {
        tags: ["Matching"],
        summary: "Evaluate a candidate offer against canonical catalog (Constitution Rule 4)",
        body: z.object({
          title: z.string().min(1),
          brand: z.string().optional(),
          model: z.string().optional(),
          ean: z.string().optional(),
          upc: z.string().optional(),
          sourceUrl: z.string().url().default("https://example.com/offer"),
        }),
      },
    },
    async (request) => {
      const candidates = await matchingEngine.findCandidateMatches(request.body);
      const decision = matchingEngine.resolveMatch(request.body, candidates);

      // If uncertain match (possible_match), submit to review queue
      if (decision.confidenceLevel === "possible_match" && candidates[0]) {
        reviewQueue.enqueue(request.body, candidates[0], decision);
      }

      return {
        decision,
        candidateCount: candidates.length,
        topCandidateTitle: candidates[0]?.title ?? null,
      };
    },
  );

  app.get(
    "/v1/matching/review-queue",
    {
      schema: {
        tags: ["Matching"],
        summary: "Get pending matches awaiting human reviewer verification",
      },
    },
    async () => {
      return {
        pending: reviewQueue.getPending(),
        totalPending: reviewQueue.getPending().length,
      };
    },
  );

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const server = await buildApp();
  server.listen({ port: env.PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`Scrappy API listening on ${address}`);
    server.log.info(`Swagger OpenAPI documentation at ${address}/docs`);
  });
}
