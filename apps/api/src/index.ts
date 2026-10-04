import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { validateEnv, ApiEnvSchema, formatINR } from "@scrappy/core";

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
        version: "0.1.0",
      },
      servers: [{ url: env.API_BASE_URL }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // Health Check
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
        version: "0.1.0",
      };
    },
  );

  // Price Calculation & Normalization endpoint
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
        response: {
          200: z.object({
            pricePaise: z.number().int(),
            formatted: z.string(),
            rupees: z.string(),
            paise: z.string(),
          }),
        },
      },
    },
    async (request) => {
      // Basic normalization
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
