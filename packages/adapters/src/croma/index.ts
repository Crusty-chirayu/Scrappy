import {
  SourceAdapter,
  FetchResult,
  FetchOptions,
  ExtractedOffer,
  AdapterHealth,
  SourceCircuitBreaker,
} from "@scrappy/scraping";
import { ScrappyError } from "@scrappy/core";

export class CromaAdapter implements SourceAdapter {
  public readonly id = "croma";
  public readonly name = "Croma";
  public readonly version = "0.2.0";
  public readonly verificationStatus = "fixture-only" as const;
  public readonly circuitBreaker: SourceCircuitBreaker;

  constructor() {
    this.circuitBreaker = new SourceCircuitBreaker(this.id);
  }

  public canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?croma\.com\b/i.test(url);
  }

  public async fetch(url: string, _options?: FetchOptions): Promise<FetchResult> {
    // In accordance with Constitution Rule 6 & research findings,
    // Croma currently lacks an affiliate feed and prohibits automated scraping in ToS.
    throw new ScrappyError(
      "Croma source is currently unsupported due to policy restrictions (honest 'Source unavailable' state)",
      "ADAPTER_ERROR",
      501,
      { source: this.id, url },
    );
  }

  public async parse(_fetchResult: FetchResult): Promise<ExtractedOffer> {
    throw new ScrappyError("Parsing unsupported for Croma", "ADAPTER_ERROR", 501, {
      source: this.id,
    });
  }

  public async getHealth(): Promise<AdapterHealth> {
    return {
      source: this.id,
      status: "unsupported",
      verificationStatus: this.verificationStatus,
      consecutiveFailures: 0,
      successRate24h: 0,
      lastCheckedAt: new Date().toISOString(),
      lastError: "Official affiliate feed unavailable; scraping disallowed by policy",
    };
  }
}
