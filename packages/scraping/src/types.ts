import { SourceId, Provenance, ExtractionMethod } from "@scrappy/core";

export interface FetchResult {
  url: string;
  source: SourceId;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  fetchedAt: string;
  extractionMethod: ExtractionMethod;
  durationMs: number;
}

export interface ExtractedOffer {
  title: string;
  brand?: string;
  model?: string;
  pricePaise: number;
  originalPricePaise?: number;
  inStock: boolean;
  merchantName: string;
  sellerRating?: number;
  sku?: string;
  imageUrl?: string;
  provenance: Provenance;
}

export interface AdapterHealth {
  source: SourceId;
  status: "healthy" | "degraded" | "down" | "unsupported";
  consecutiveFailures: number;
  successRate24h: number;
  lastCheckedAt: string;
  lastError?: string;
}

export interface SourceAdapter {
  readonly id: SourceId;
  readonly name: string;
  readonly version: string;
  canHandle(url: string): boolean;
  fetch(url: string): Promise<FetchResult>;
  parse(fetchResult: FetchResult): Promise<ExtractedOffer>;
  getHealth(): Promise<AdapterHealth>;
}
