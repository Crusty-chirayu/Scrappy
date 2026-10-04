import {
  generateSeedObjects,
  ProductSeed,
  OfferSeed,
  CategorySeed,
  BrandSeed,
} from "./seed/generate-seed.js";

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  sort?: "price_asc" | "price_desc" | "relevance";
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  model: string;
  ean: string;
  lowestPricePaise: number;
  originalPricePaise?: number;
  offerCount: number;
  merchants: string[];
}

export interface ProductDetail extends SearchResultItem {
  offers: OfferSeed[];
  priceHistory: Array<{ recordedAt: string; pricePaise: number }>;
}

export interface WatchlistItem {
  id: string;
  workspaceId: string;
  userId: string;
  productId: string;
  product: SearchResultItem;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  workspaceId: string;
  userId: string;
  productId: string;
  productTitle: string;
  targetPricePaise: number;
  notificationChannel: "email" | "in_app" | "webhook";
  isActive: boolean;
  createdAt: string;
}

export class CatalogRepository {
  private products: ProductSeed[];
  private offers: OfferSeed[];
  private categories: CategorySeed[];
  private brands: BrandSeed[];

  // In-memory tenant tables
  private watchlist: WatchlistItem[] = [];
  private alerts: AlertItem[] = [];

  constructor() {
    const seed = generateSeedObjects(500);
    this.products = seed.products;
    this.offers = seed.offers;
    this.categories = seed.categories;
    this.brands = seed.brands;
  }

  public getCategories(): CategorySeed[] {
    return this.categories;
  }

  public getBrands(): BrandSeed[] {
    return this.brands;
  }

  public search(filters: SearchFilters): { items: SearchResultItem[]; total: number; page: number; limit: number } {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const offset = (page - 1) * limit;

    let results = this.products.map((p) => {
      const pOffers = this.offers.filter((o) => o.productId === p.id);
      const prices = pOffers.map((o) => o.currentPricePaise);
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const originalPrices = pOffers.map((o) => o.originalPricePaise ?? o.currentPricePaise);
      const maxOriginal = originalPrices.length > 0 ? Math.max(...originalPrices) : undefined;
      const merchants = Array.from(new Set(pOffers.map((o) => o.merchantName)));

      return {
        id: p.id,
        title: p.title,
        brand: p.brandName,
        category: p.categoryName,
        model: p.model,
        ean: p.ean,
        lowestPricePaise: lowestPrice,
        originalPricePaise: maxOriginal && maxOriginal > lowestPrice ? maxOriginal : undefined,
        offerCount: pOffers.length,
        merchants,
      };
    });

    // Query filter
    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.ean.includes(q),
      );
    }

    // Category filter
    if (filters.category) {
      const catSlug = filters.category.toLowerCase();
      results = results.filter((item) => item.category.toLowerCase() === catSlug);
    }

    // Brand filter
    if (filters.brand) {
      const bSlug = filters.brand.toLowerCase();
      results = results.filter((item) => item.brand.toLowerCase() === bSlug);
    }

    // Price range filters
    if (filters.minPricePaise !== undefined) {
      results = results.filter((item) => item.lowestPricePaise >= filters.minPricePaise!);
    }
    if (filters.maxPricePaise !== undefined) {
      results = results.filter((item) => item.lowestPricePaise <= filters.maxPricePaise!);
    }

    // Sorting
    if (filters.sort === "price_asc") {
      results.sort((a, b) => a.lowestPricePaise - b.lowestPricePaise);
    } else if (filters.sort === "price_desc") {
      results.sort((a, b) => b.lowestPricePaise - a.lowestPricePaise);
    }

    const total = results.length;
    const items = results.slice(offset, offset + limit);

    return { items, total, page, limit };
  }

  public autocomplete(prefix: string, limit = 8): Array<{ id: string; title: string; brand: string; category: string; lowestPricePaise: number }> {
    if (!prefix || prefix.trim().length === 0) return [];
    const q = prefix.toLowerCase().trim();

    return this.products
      .filter((p) => p.title.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q))
      .slice(0, limit)
      .map((p) => {
        const pOffers = this.offers.filter((o) => o.productId === p.id);
        const lowestPrice = pOffers.length > 0 ? Math.min(...pOffers.map((o) => o.currentPricePaise)) : 0;
        return {
          id: p.id,
          title: p.title,
          brand: p.brandName,
          category: p.categoryName,
          lowestPricePaise: lowestPrice,
        };
      });
  }

  public getProductDetail(id: string): ProductDetail | null {
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;

    const pOffers = this.offers.filter((o) => o.productId === id);
    const lowestPrice = pOffers.length > 0 ? Math.min(...pOffers.map((o) => o.currentPricePaise)) : 0;
    const maxOriginal = pOffers.length > 0 ? Math.max(...pOffers.map((o) => o.originalPricePaise ?? o.currentPricePaise)) : undefined;

    // Generate deterministic 30-day price history ticks
    const now = new Date("2026-10-04T12:00:00Z");
    const history: Array<{ recordedAt: string; pricePaise: number }> = [];
    for (let day = 30; day >= 0; day--) {
      const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      const variation = Math.sin(day * 0.4) * 0.05; // +/- 5% variation
      const tickPrice = Math.round(lowestPrice * (1 + variation));
      history.push({
        recordedAt: date.toISOString().split("T")[0]!,
        pricePaise: tickPrice,
      });
    }

    return {
      id: product.id,
      title: product.title,
      brand: product.brandName,
      category: product.categoryName,
      model: product.model,
      ean: product.ean,
      lowestPricePaise: lowestPrice,
      originalPricePaise: maxOriginal && maxOriginal > lowestPrice ? maxOriginal : undefined,
      offerCount: pOffers.length,
      merchants: Array.from(new Set(pOffers.map((o) => o.merchantName))),
      offers: pOffers,
      priceHistory: history,
    };
  }

  // --- Watchlist Operations (RLS Tenant Isolated) ---
  public getWatchlist(workspaceId: string): WatchlistItem[] {
    return this.watchlist.filter((w) => w.workspaceId === workspaceId);
  }

  public addToWatchlist(workspaceId: string, userId: string, productId: string): WatchlistItem {
    const existing = this.watchlist.find((w) => w.workspaceId === workspaceId && w.productId === productId);
    if (existing) return existing;

    const detail = this.getProductDetail(productId);
    if (!detail) throw new Error(`Product not found: ${productId}`);

    const item: WatchlistItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspaceId,
      userId,
      productId,
      product: {
        id: detail.id,
        title: detail.title,
        brand: detail.brand,
        category: detail.category,
        model: detail.model,
        ean: detail.ean,
        lowestPricePaise: detail.lowestPricePaise,
        originalPricePaise: detail.originalPricePaise,
        offerCount: detail.offerCount,
        merchants: detail.merchants,
      },
      createdAt: new Date().toISOString(),
    };

    this.watchlist.push(item);
    return item;
  }

  public removeFromWatchlist(workspaceId: string, productId: string): boolean {
    const idx = this.watchlist.findIndex((w) => w.workspaceId === workspaceId && w.productId === productId);
    if (idx >= 0) {
      this.watchlist.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Alert Operations ---
  public getAlerts(workspaceId: string): AlertItem[] {
    return this.alerts.filter((a) => a.workspaceId === workspaceId);
  }

  public createAlert(data: {
    workspaceId: string;
    userId: string;
    productId: string;
    targetPricePaise: number;
    notificationChannel?: "email" | "in_app" | "webhook";
  }): AlertItem {
    const detail = this.getProductDetail(data.productId);
    if (!detail) throw new Error(`Product not found: ${data.productId}`);

    const alert: AlertItem = {
      id: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: data.workspaceId,
      userId: data.userId,
      productId: data.productId,
      productTitle: detail.title,
      targetPricePaise: data.targetPricePaise,
      notificationChannel: data.notificationChannel ?? "in_app",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.alerts.push(alert);
    return alert;
  }

  public deleteAlert(workspaceId: string, alertId: string): boolean {
    const idx = this.alerts.findIndex((a) => a.workspaceId === workspaceId && a.id === alertId);
    if (idx >= 0) {
      this.alerts.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const defaultCatalogRepository = new CatalogRepository();
