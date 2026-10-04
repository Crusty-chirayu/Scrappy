import { pgTable, text, timestamp, integer, boolean, uuid, jsonb } from "drizzle-orm/pg-core";

// Workspaces (Tenants)
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Products (Canonical product catalog)
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  model: text("model"),
  category: text("category").notNull(),
  ean: text("ean"),
  upc: text("upc"),
  sku: text("sku"),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Offers (Specific merchant listing for a product)
export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  source: text("source").notNull(), // 'amazon-in', 'flipkart', etc.
  merchantName: text("merchant_name").notNull(),
  url: text("url").notNull(),
  currentPricePaise: integer("current_price_paise").notNull(),
  originalPricePaise: integer("original_price_paise"),
  inStock: boolean("in_stock").notNull().default(true),
  provenance: jsonb("provenance").notNull(),
  lastObservedAt: timestamp("last_observed_at", { withTimezone: true }).defaultNow().notNull(),
});

// Price Observations (Historical time-series partitioned table)
export const priceObservations = pgTable("price_observations", {
  id: uuid("id").defaultRandom().primaryKey(),
  offerId: uuid("offer_id")
    .references(() => offers.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  pricePaise: integer("price_paise").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  provenance: jsonb("provenance").notNull(),
});

// Extraction Tasks (Workspace tenant-isolated)
export const extractionTasks = pgTable("extraction_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  schema: jsonb("schema").notNull(),
  status: text("status").notNull().default("pending"),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
