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
import { validateEnv, ApiEnvSchema, formatINR } from "@scrappy/core";
import { defaultCatalogRepository } from "@scrappy/db";
import { calculateDealScore, analyzeFakeDiscount } from "@scrappy/pricing";

const env = validateEnv(ApiEnvSchema, process.env, "API Service");

export async function buildApp() {
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
      const res = defaultCatalogRepository.search({
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
      const suggestions = defaultCatalogRepository.autocomplete(request.query.q, request.query.limit);
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
      const product = defaultCatalogRepository.getProductDetail(request.params.id);
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
      const product = defaultCatalogRepository.getProductDetail(request.params.id);
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
      const prices = product.priceHistory.map((h) => h.pricePaise);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const sorted = [...prices].sort((a, b) => a - b);
      const medianPrice = sorted[Math.floor(sorted.length / 2)] ?? lowestPrice;
      const allTimeLow = Math.min(...prices);

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
      const items = defaultCatalogRepository.getWatchlist(workspaceId);
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
      const item = defaultCatalogRepository.addToWatchlist(workspaceId, userId, request.body.productId);
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
      const success = defaultCatalogRepository.removeFromWatchlist(workspaceId, request.params.productId);
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
      const alerts = defaultCatalogRepository.getAlerts(workspaceId);
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
      const alert = defaultCatalogRepository.createAlert({
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
      const success = defaultCatalogRepository.deleteAlert(workspaceId, request.params.id);
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
