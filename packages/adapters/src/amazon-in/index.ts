import { SourceAdapter, FetchResult, ExtractedOffer, AdapterHealth } from "@scrappy/scraping";

export class AmazonInAdapter implements SourceAdapter {
  public readonly id = "amazon-in";
  public readonly name = "Amazon India";
  public readonly version = "0.1.0";

  public canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?amazon\.in/i.test(url);
  }

  public async fetch(url: string): Promise<FetchResult> {
    return {
      url,
      source: this.id,
      statusCode: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: "<html><body>Amazon Stub</body></html>",
      fetchedAt: new Date().toISOString(),
      extractionMethod: "http",
      durationMs: 120,
    };
  }

  public async parse(fetchResult: FetchResult): Promise<ExtractedOffer> {
    return {
      title: "Sample Amazon Product",
      pricePaise: 499900,
      inStock: true,
      merchantName: "Amazon.in",
      provenance: {
        source: this.id,
        sourceUrl: fetchResult.url,
        fetchedAt: fetchResult.fetchedAt,
        extractionMethod: fetchResult.extractionMethod,
        confidence: 0.95,
        adapterVersion: this.version,
      },
    };
  }

  public async getHealth(): Promise<AdapterHealth> {
    return {
      source: this.id,
      status: "healthy",
      consecutiveFailures: 0,
      successRate24h: 1.0,
      lastCheckedAt: new Date().toISOString(),
    };
  }
}
