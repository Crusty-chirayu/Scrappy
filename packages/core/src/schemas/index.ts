import { z } from "zod";

export const SourceIdSchema = z.enum([
  "amazon-in",
  "flipkart",
  "croma",
  "reliance-digital",
  "custom",
]);

export const ExtractionMethodSchema = z.enum(["http", "browser", "api", "feed"]);

export const ConfidenceLevelSchema = z.enum([
  "verified",
  "estimated",
  "matched",
  "possible_match",
  "source_unavailable",
]);

export const ProvenanceSchema = z.object({
  source: SourceIdSchema,
  sourceUrl: z.string().url(),
  fetchedAt: z.string().datetime(),
  extractionMethod: ExtractionMethodSchema,
  confidence: z.number().min(0).max(1),
  adapterVersion: z.string().min(1),
});

export const ProductSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  title: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().nullable().optional(),
  category: z.string().min(1),
  ean: z.string().nullable().optional(),
  upc: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const OfferSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  productId: z.string().min(1),
  source: SourceIdSchema,
  merchantName: z.string().min(1),
  sellerRating: z.number().min(0).max(5).nullable().optional(),
  url: z.string().url(),
  currentPricePaise: z.number().int().nonnegative(),
  originalPricePaise: z.number().int().nonnegative().nullable().optional(),
  currency: z.literal("INR"),
  inStock: z.boolean(),
  provenance: ProvenanceSchema,
  lastObservedAt: z.string().datetime(),
});

export const PriceObservationSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  offerId: z.string().min(1),
  productId: z.string().min(1),
  pricePaise: z.number().int().nonnegative(),
  inStock: z.boolean(),
  recordedAt: z.string().datetime(),
  provenance: ProvenanceSchema,
});

export const WorkspaceSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1),
  slug: z.string().min(1),
  plan: z.enum(["free", "starter", "pro", "enterprise"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ExtractionSchemaFieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "array", "object"]),
  selector: z.string().optional(),
  attribute: z.string().optional(),
  required: z.boolean().default(false),
  description: z.string().optional(),
});

export const ExtractionTaskSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  workspaceId: z.string().min(1),
  url: z.string().url(),
  schema: z.array(ExtractionSchemaFieldSchema),
  status: z.enum(["pending", "running", "completed", "failed"]),
  result: z.record(z.unknown()).nullable().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
});
