export type SourceId = "amazon-in" | "flipkart" | "croma" | "reliance-digital" | "custom";

export type ExtractionMethod = "http" | "browser" | "api" | "feed";

export type ConfidenceLevel =
  "verified" | "estimated" | "matched" | "possible_match" | "source_unavailable";

export interface Provenance {
  source: SourceId;
  sourceUrl: string;
  fetchedAt: string; // ISO string
  extractionMethod: ExtractionMethod;
  confidence: number; // 0.00 to 1.00
  adapterVersion: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  model?: string | null;
  category: string;
  ean?: string | null;
  upc?: string | null;
  sku?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  productId: string;
  source: SourceId;
  merchantName: string;
  sellerRating?: number | null;
  url: string;
  currentPricePaise: number;
  originalPricePaise?: number | null;
  currency: "INR";
  inStock: boolean;
  provenance: Provenance;
  lastObservedAt: string;
}

export interface PriceObservation {
  id: string;
  offerId: string;
  productId: string;
  pricePaise: number;
  inStock: boolean;
  recordedAt: string;
  provenance: Provenance;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionSchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  selector?: string;
  attribute?: string;
  required: boolean;
  description?: string;
}

export interface ExtractionTask {
  id: string;
  workspaceId: string;
  url: string;
  schema: ExtractionSchemaField[];
  status: "pending" | "running" | "completed" | "failed";
  result?: Record<string, unknown> | null;
  error?: string | null;
  createdAt: string;
  completedAt?: string | null;
}
