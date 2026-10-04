import {
  SourceAdapter,
  FetchResult,
  FetchOptions,
  ExtractedOffer,
  AdapterHealth,
  SourceCircuitBreaker,
  defaultHttpFetcher,
} from "@scrappy/scraping";

interface AmazonPaApiItem {
  ItemInfo?: {
    Title?: { DisplayValue?: string };
    ByLineInfo?: { Brand?: { DisplayValue?: string } };
  };
  Offers?: {
    Listings?: Array<{
      Id?: string;
      Price?: { Amount?: number };
      SavingBasis?: { Amount?: number };
      Availability?: { Type?: string; Message?: string };
      MerchantInfo?: { Name?: string };
    }>;
  };
  ASIN?: string;
}

export class AmazonInAdapter implements SourceAdapter {
  public readonly id = "amazon-in";
  public readonly name = "Amazon India";
  public readonly version = "0.2.0";
  public readonly verificationStatus = "fixture-only" as const;
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
    return /^https?:\/\/(www\.)?amazon\.in\b/i.test(url);
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

    // Check if body is PA-API JSON
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const data = JSON.parse(raw);
        if (data.ItemInfo && data.Offers) {
          return this.parsePaApiResponse(data, fetchResult);
        }
      } catch {
        // Fall back to HTML parsing
      }
    }

    return this.parseHtml(raw, fetchResult);
  }

  private parsePaApiResponse(data: AmazonPaApiItem, fetchResult: FetchResult): ExtractedOffer {
    const title = data.ItemInfo?.Title?.DisplayValue ?? "Unknown Amazon Product";
    const brand = data.ItemInfo?.ByLineInfo?.Brand?.DisplayValue;
    const listing = data.Offers?.Listings?.[0];
    const priceAmount = listing?.Price?.Amount ?? 0;
    const origAmount = listing?.SavingBasis?.Amount ?? priceAmount;
    const inStock = listing?.Availability?.Type === "NOW" || listing?.Availability?.Message?.toLowerCase().includes("in stock");
    const merchantName = listing?.MerchantInfo?.Name ?? "Amazon.in";
    const asin = data.ASIN ?? data.Offers?.Listings?.[0]?.Id;

    return {
      title,
      brand,
      pricePaise: Math.round(priceAmount * 100),
      originalPricePaise: origAmount > priceAmount ? Math.round(origAmount * 100) : undefined,
      inStock: Boolean(inStock),
      merchantName,
      sku: asin,
      provenance: {
        source: this.id,
        sourceUrl: fetchResult.url,
        fetchedAt: fetchResult.fetchedAt,
        extractionMethod: fetchResult.extractionMethod,
        confidence: 0.99,
        adapterVersion: this.version,
      },
    };
  }

  private parseHtml(html: string, fetchResult: FetchResult): ExtractedOffer {
    // 1. Title extraction
    const titleMatch = html.match(/id=["']productTitle["'][^>]*>\s*([\s\S]*?)\s*<\/span>/i);
    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : "Unknown Amazon Product";

    // 2. Brand extraction
    const brandMatch = html.match(/Brand:\s*([^<]+)/i) || html.match(/id=["']bylineInfo["'][^>]*>\s*([^<]+)/i);
    const brand = brandMatch && brandMatch[1] ? brandMatch[1].replace(/Brand:\s*/i, "").trim() : undefined;

    // 3. Current Price
    const priceMatch = html.match(/class=["'][^"']*priceToPay[^"']*["'][\s\S]*?class=["']a-offscreen["']>\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    let pricePaise = 0;
    if (priceMatch && priceMatch[1]) {
      const clean = priceMatch[1].replace(/,/g, "");
      pricePaise = Math.round(parseFloat(clean) * 100);
    }

    // 4. Original Price
    const origPriceMatch = html.match(/class=["'][^"']*basisPrice[^"']*["'][\s\S]*?class=["']a-offscreen["']>\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    let originalPricePaise: number | undefined;
    if (origPriceMatch && origPriceMatch[1]) {
      const clean = origPriceMatch[1].replace(/,/g, "");
      originalPricePaise = Math.round(parseFloat(clean) * 100);
    }

    // 5. In stock
    const inStock = !html.includes("Currently unavailable") && (html.includes("In stock") || html.includes("In Stock"));

    // 6. Merchant Name
    const merchantMatch = html.match(/Sold by\s*<\/span>\s*<a[^>]*>\s*([^<]+)/i);
    const merchantName = merchantMatch && merchantMatch[1] ? merchantMatch[1].trim() : "Amazon.in";

    // 7. SKU / ASIN
    const asinMatch = html.match(/class=["']sku["']>\s*([A-Z0-9]{10})/i) || html.match(/\/dp\/([A-Z0-9]{10})/i);
    const sku = asinMatch && asinMatch[1] ? asinMatch[1] : undefined;

    // 8. Rating
    const ratingMatch = html.match(/([\d.]+)\s*out of 5 stars/i);
    const sellerRating = ratingMatch && ratingMatch[1] ? parseFloat(ratingMatch[1]) : undefined;

    return {
      title,
      brand,
      pricePaise,
      originalPricePaise,
      inStock,
      merchantName,
      sku,
      sellerRating,
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
      verificationStatus: this.verificationStatus,
      consecutiveFailures: this.consecutiveFailures,
      successRate24h,
      lastCheckedAt: new Date().toISOString(),
      lastError: this.lastError,
    };
  }
}
