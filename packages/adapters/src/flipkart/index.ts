import {
  SourceAdapter,
  FetchResult,
  FetchOptions,
  ExtractedOffer,
  AdapterHealth,
  SourceCircuitBreaker,
  defaultHttpFetcher,
} from "@scrappy/scraping";

interface FlipkartAffiliateBaseInfo {
  title?: string;
  productBrand?: string;
  flipkartSellingPrice?: { amount?: number };
  flipkartSpecialPrice?: { amount?: number };
  maximumRetailPrice?: { amount?: number };
  inStock?: boolean;
  productIdentifier?: { productId?: string };
  attributes?: { model?: string };
}

export class FlipkartAdapter implements SourceAdapter {
  public readonly id = "flipkart";
  public readonly name = "Flipkart";
  public readonly version = "0.2.0";
  public readonly circuitBreaker: SourceCircuitBreaker;

  private consecutiveFailures = 0;
  private totalRequests24h = 0;
  private successfulRequests24h = 0;
  private lastError?: string;

  constructor() {
    this.circuitBreaker = new SourceCircuitBreaker(this.id, {
      failureThreshold: 4,
      cooldownMs: 30_000,
    });
  }

  public canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?flipkart\.com\b/i.test(url);
  }

  public async fetch(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    this.circuitBreaker.checkHealth();
    this.totalRequests24h++;

    try {
      const result = await defaultHttpFetcher.fetch(url, this.id, options);
      this.circuitBreaker.recordSuccess();
      this.consecutiveFailures = 0;
      this.successfulRequests24h++;
      return result;
    } catch (err: unknown) {
      this.circuitBreaker.recordFailure();
      this.consecutiveFailures++;
      this.lastError = err instanceof Error ? err.message : String(err);
      throw err;
    }
  }

  public async parse(fetchResult: FetchResult): Promise<ExtractedOffer> {
    const raw = fetchResult.body.trim();

    // Check if body is Affiliate API JSON
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const data = JSON.parse(raw);
        if (data.productBaseInfoV1) {
          return this.parseAffiliateResponse(data.productBaseInfoV1, fetchResult);
        }
      } catch {
        // Fall back to HTML parsing
      }
    }

    return this.parseHtml(raw, fetchResult);
  }

  private parseAffiliateResponse(base: FlipkartAffiliateBaseInfo, fetchResult: FetchResult): ExtractedOffer {
    const title = base.title ?? "Unknown Flipkart Product";
    const brand = base.productBrand;
    const priceAmount = base.flipkartSellingPrice?.amount ?? base.flipkartSpecialPrice?.amount ?? 0;
    const origAmount = base.maximumRetailPrice?.amount ?? priceAmount;
    const inStock = Boolean(base.inStock);
    const sku = base.productIdentifier?.productId;
    const model = base.attributes?.model;

    return {
      title,
      brand,
      model,
      pricePaise: Math.round(priceAmount * 100),
      originalPricePaise: origAmount > priceAmount ? Math.round(origAmount * 100) : undefined,
      inStock,
      merchantName: "Flipkart",
      sku,
      provenance: {
        source: this.id,
        sourceUrl: fetchResult.url,
        fetchedAt: fetchResult.fetchedAt,
        extractionMethod: fetchResult.extractionMethod,
        confidence: 0.98,
        adapterVersion: this.version,
      },
    };
  }

  private parseHtml(html: string, fetchResult: FetchResult): ExtractedOffer {
    // 1. Title extraction
    const titleMatch =
      html.match(/class=["'][^"']*B_NuCI[^"']*["'][^>]*>\s*([\s\S]*?)\s*<\/span>/i) ||
      html.match(/<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/i);
    const rawTitle = titleMatch && titleMatch[1] ? titleMatch[1].replace(/&nbsp;/g, " ").trim() : "Unknown Flipkart Product";

    // 2. Current Price
    const priceMatch = html.match(/class=["'][^"']*_30jeq3[^"']*["'][^>]*>\s*₹?\s*([\d,]+)/i);
    let pricePaise = 0;
    if (priceMatch && priceMatch[1]) {
      const clean = priceMatch[1].replace(/,/g, "");
      pricePaise = Math.round(parseFloat(clean) * 100);
    }

    // 3. Original Price
    const origMatch = html.match(/class=["'][^"']*_3I9_wc[^"']*["'][^>]*>\s*₹?\s*([\d,]+)/i);
    let originalPricePaise: number | undefined;
    if (origMatch && origMatch[1]) {
      const clean = origMatch[1].replace(/,/g, "");
      originalPricePaise = Math.round(parseFloat(clean) * 100);
    }

    // 4. In Stock
    const inStock = !html.includes("Currently Out of Stock") && !html.includes("Sold Out");

    // 5. Seller Name
    const sellerMatch = html.match(/id=["']sellerName["'][^>]*>[\s\S]*?<span[^>]*>\s*([^<]+)/i);
    const merchantName = sellerMatch && sellerMatch[1] ? sellerMatch[1].trim() : "Flipkart";

    // 6. Rating
    const ratingMatch = html.match(/class=["'][^"']*_3LWZlK[^"']*["'][^>]*>\s*([\d.]+)/i);
    const sellerRating = ratingMatch && ratingMatch[1] ? parseFloat(ratingMatch[1]) : undefined;

    return {
      title: rawTitle,
      pricePaise,
      originalPricePaise,
      inStock,
      merchantName,
      sellerRating,
      provenance: {
        source: this.id,
        sourceUrl: fetchResult.url,
        fetchedAt: fetchResult.fetchedAt,
        extractionMethod: fetchResult.extractionMethod,
        confidence: 0.94,
        adapterVersion: this.version,
      },
    };
  }

  public async getHealth(): Promise<AdapterHealth> {
    const successRate24h =
      this.totalRequests24h > 0 ? this.successfulRequests24h / this.totalRequests24h : 1.0;
    const circuitState = this.circuitBreaker.getState();

    let status: "healthy" | "degraded" | "down" | "unsupported" = "healthy";
    if (circuitState === "OPEN") {
      status = "down";
    } else if (circuitState === "HALF_OPEN" || this.consecutiveFailures > 0) {
      status = "degraded";
    }

    return {
      source: this.id,
      status,
      consecutiveFailures: this.consecutiveFailures,
      successRate24h,
      lastCheckedAt: new Date().toISOString(),
      lastError: this.lastError,
    };
  }
}
