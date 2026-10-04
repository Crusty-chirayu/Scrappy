import { SourceAdapter, FetchResult, ExtractedOffer, AdapterHealth } from "@scrappy/scraping";
import { ScrappyError } from "@scrappy/core";

export class CromaAdapter implements SourceAdapter {
  public readonly id = "croma";
  public readonly name = "Croma";
  public readonly version = "0.1.0";

  public canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?croma\.com/i.test(url);
  }

  public async fetch(url: string): Promise<FetchResult> {
    // In accordance with research findings, Croma currently lacks affiliate feed/API
    throw new ScrappyError(
      "Croma source is currently unsupported due to policy restrictions",
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
      consecutiveFailures: 0,
      successRate24h: 0,
      lastCheckedAt: new Date().toISOString(),
      lastError: "Official affiliate feed unavailable; scraping disallowed by policy",
    };
  }
}
