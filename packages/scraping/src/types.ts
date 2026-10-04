import { SourceId, Provenance, ExtractionMethod } from "@scrappy/core";
import { SourceCircuitBreaker } from "./circuit-breaker.js";

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRetries?: number;
  etag?: string;
  ifModifiedSince?: string;
  allowRedirects?: boolean;
}

export interface FetchResult {
  url: string;
  source: SourceId;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  fetchedAt: string;
  extractionMethod: ExtractionMethod;
  durationMs: number;
  isNotModified?: boolean;
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

export type AdapterVerificationStatus = "verified_live" | "fixture-only";

export interface AdapterHealth {
  source: SourceId;
  status: "healthy" | "degraded" | "down" | "unsupported";
  verificationStatus: AdapterVerificationStatus;
  consecutiveFailures: number;
  successRate24h: number;
  lastCheckedAt: string;
  lastError?: string;
}

export interface DriftAnalysisResult {
  driftScore: number; // 0.0 to 1.0
  isDrifted: boolean;
  missingFields: string[];
  anomalies: string[];
}

export interface SourceAdapter {
  readonly id: SourceId;
  readonly name: string;
  readonly version: string;
  readonly verificationStatus: AdapterVerificationStatus;
  readonly circuitBreaker: SourceCircuitBreaker;
  canHandle(url: string): boolean;
  fetch(url: string, options?: FetchOptions): Promise<FetchResult>;
  parse(fetchResult: FetchResult): Promise<ExtractedOffer>;
  getHealth(): Promise<AdapterHealth>;
}
