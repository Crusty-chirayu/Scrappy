import { SourceAdapter, FetchResult, ExtractedOffer, AdapterHealth } from "@scrappy/scraping";

export class FlipkartAdapter implements SourceAdapter {
  public readonly id = "flipkart";
  public readonly name = "Flipkart";
  public readonly version = "0.1.0";

  public canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?flipkart\.com/i.test(url);
  }

  public async fetch(url: string): Promise<FetchResult> {
    return {
      url,
      source: this.id,
      statusCode: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: "<html><body>Flipkart Stub</body></html>",
      fetchedAt: new Date().toISOString(),
      extractionMethod: "http",
      durationMs: 140,
    };
  }

  public async parse(fetchResult: FetchResult): Promise<ExtractedOffer> {
    return {
      title: "Sample Flipkart Product",
      pricePaise: 489900,
      inStock: true,
      merchantName: "Flipkart",
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
