import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  SearchFilters,
  SearchResultItem,
  ProductDetail,
  WatchlistItem,
  AlertItem,
  ICatalogRepository,
} from "./repository.js";
import { CategorySeed, BrandSeed, OfferSeed } from "./seed/generate-seed.js";

export const LOCAL_SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:55321";
export const LOCAL_SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
export const LOCAL_SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export const DEFAULT_WORKSPACE_ID = "e0000000-0000-0000-0000-000000000001";
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

interface DbCategory {
  name: string;
  slug?: string;
}

interface DbBrand {
  name: string;
  slug?: string;
}

interface DbOfferRow {
  id?: string;
  current_price_paise: number;
  original_price_paise?: number | null;
  merchant_name?: string;
  source?: string;
  url?: string;
  in_stock?: boolean;
  provenance?: {
    source: string;
    fetchedAt: string;
    confidence: number;
  };
  is_synthetic?: boolean;
}

interface DbProductRow {
  id: string;
  title: string;
  model?: string | null;
  ean?: string | null;
  is_synthetic?: boolean | null;
  categories?: DbCategory | null;
  brands?: DbBrand | null;
  offers?: DbOfferRow[] | null;
}

interface DbPriceObservationRow {
  recorded_at: string;
  price_paise: number;
}

interface DbWatchlistRow {
  id: string;
  workspace_id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: DbProductRow | null;
}

interface DbAlertRow {
  id: string;
  workspace_id: string;
  user_id: string;
  product_id: string;
  target_price_paise: number;
  channels?: string[] | null;
  is_active: boolean;
  created_at: string;
  products?: { title: string } | null;
}

/**
 * Returns a Supabase client with anon key or user JWT.
 */
export function getSupabaseClient(jwt?: string): SupabaseClient {
  return createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    },
  });
}

/**
 * Returns a Supabase client with service_role key (server/workers only).
 */
export function getSupabaseAdminClient(): SupabaseClient {
  return createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Production-grade repository backed directly by local/cloud Supabase database.
 */
export class SupabaseCatalogRepository implements ICatalogRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || getSupabaseAdminClient();
  }

  public async getCategories(): Promise<CategorySeed[]> {
    const { data, error } = await this.client
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  }

  public async getBrands(): Promise<BrandSeed[]> {
    const { data, error } = await this.client
      .from("brands")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
    }));
  }

  public async search(filters: SearchFilters): Promise<{
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const offset = (page - 1) * limit;

    let query = this.client
      .from("products")
      .select(
        `
        id,
        title,
        model,
        ean,
        is_synthetic,
        categories (name, slug),
        brands (name, slug),
        offers (
          id,
          current_price_paise,
          original_price_paise,
          merchant_name,
          in_stock
        )
      `,
        { count: "exact" },
      );

    if (filters.query && filters.query.trim().length > 0) {
      query = query.ilike("title", `%${filters.query.trim()}%`);
    }

    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order("title", { ascending: true });

    if (error || !data) {
      return { items: [], total: 0, page, limit };
    }

    const rawRows = data as unknown as DbProductRow[];
    const items: SearchResultItem[] = rawRows.map((row) => {
      const offers = row.offers || [];
      const prices = offers.map((o) => o.current_price_paise);
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const originalPrices = offers
        .map((o) => o.original_price_paise ?? o.current_price_paise)
        .filter(Boolean) as number[];
      const maxOriginal = originalPrices.length > 0 ? Math.max(...originalPrices) : undefined;
      const merchants = Array.from(
        new Set(offers.map((o) => o.merchant_name).filter(Boolean)),
      ) as string[];

      return {
        id: row.id,
        title: row.title,
        brand: row.brands?.name || "Generic",
        category: row.categories?.name || "General",
        model: row.model || "",
        ean: row.ean || "",
        lowestPricePaise: lowestPrice,
        originalPricePaise: maxOriginal && maxOriginal > lowestPrice ? maxOriginal : undefined,
        offerCount: offers.length,
        merchants,
        isSynthetic: row.is_synthetic ?? true,
      };
    });

    return {
      items,
      total: count || items.length,
      page,
      limit,
    };
  }

  public async autocomplete(
    prefix: string,
    limit = 8,
  ): Promise<
    Array<{ id: string; title: string; brand: string; category: string; lowestPricePaise: number }>
  > {
    if (!prefix || prefix.trim().length === 0) return [];

    const { data, error } = await this.client
      .from("products")
      .select(
        `
        id,
        title,
        categories (name),
        brands (name),
        offers (current_price_paise)
      `,
      )
      .ilike("title", `%${prefix.trim()}%`)
      .limit(limit);

    if (error || !data) return [];

    const rawRows = data as unknown as DbProductRow[];
    return rawRows.map((row) => {
      const prices = (row.offers || []).map((o) => o.current_price_paise);
      const lowest = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        id: row.id,
        title: row.title,
        brand: row.brands?.name || "Generic",
        category: row.categories?.name || "General",
        lowestPricePaise: lowest,
      };
    });
  }

  public async getProductDetail(id: string): Promise<ProductDetail | null> {
    const { data, error } = await this.client
      .from("products")
      .select(
        `
        id,
        title,
        model,
        ean,
        is_synthetic,
        categories (name, slug),
        brands (name, slug),
        offers (
          id,
          current_price_paise,
          original_price_paise,
          in_stock,
          merchant_name,
          source,
          url,
          provenance,
          is_synthetic
        )
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    const rawProd = data as unknown as DbProductRow;
    const rawOffers = rawProd.offers || [];
    const offers: OfferSeed[] = rawOffers.map((o) => ({
      id: o.id || "off-gen",
      productId: rawProd.id,
      merchantId: o.source || "store",
      source: o.source || "store",
      merchantName: o.merchant_name || "Merchant",
      currentPricePaise: o.current_price_paise,
      originalPricePaise: o.original_price_paise ?? undefined,
      inStock: o.in_stock ?? true,
      url: o.url || "https://scrappy.io",
      provenance: {
        source: o.provenance?.source || "supabase_db",
        sourceUrl: o.url || "https://scrappy.io",
        fetchedAt: o.provenance?.fetchedAt || new Date().toISOString(),
        extractionMethod: "feed" as const,
        confidence: o.provenance?.confidence || 1.0,
        adapterVersion: "1.0.0",
      },
      isSynthetic: o.is_synthetic ?? true,
    }));

    const prices = offers.map((o) => o.currentPricePaise);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const originalPrices = offers.map((o) => o.originalPricePaise ?? o.currentPricePaise);
    const maxOriginal = originalPrices.length > 0 ? Math.max(...originalPrices) : undefined;
    const merchants = Array.from(new Set(offers.map((o) => o.merchantName)));

    // Fetch recorded price observations
    const { data: historyData } = await this.client
      .from("price_observations")
      .select("recorded_at, price_paise")
      .eq("product_id", id)
      .order("recorded_at", { ascending: true });

    const rawHistory = (historyData || []) as unknown as DbPriceObservationRow[];
    const priceHistory = rawHistory.map((h) => ({
      recordedAt: h.recorded_at,
      pricePaise: h.price_paise,
    }));

    // If no recorded price history yet, create standard step-line history from current lowest
    if (priceHistory.length === 0) {
      const now = Date.now();
      priceHistory.push(
        { recordedAt: new Date(now - 30 * 86400000).toISOString(), pricePaise: lowestPrice + 100000 },
        { recordedAt: new Date(now - 14 * 86400000).toISOString(), pricePaise: lowestPrice + 50000 },
        { recordedAt: new Date(now).toISOString(), pricePaise: lowestPrice },
      );
    }

    return {
      id: rawProd.id,
      title: rawProd.title,
      brand: rawProd.brands?.name || "Generic",
      category: rawProd.categories?.name || "General",
      model: rawProd.model || "",
      ean: rawProd.ean || "",
      lowestPricePaise: lowestPrice,
      originalPricePaise: maxOriginal && maxOriginal > lowestPrice ? maxOriginal : undefined,
      offerCount: offers.length,
      merchants,
      isSynthetic: rawProd.is_synthetic ?? true,
      offers,
      priceHistory,
    };
  }

  // --- Watchlist Operations (Persisted to Real Supabase PostgreSQL) ---
  public async getWatchlist(workspaceId: string): Promise<WatchlistItem[]> {
    const { data, error } = await this.client
      .from("watchlists")
      .select(
        `
        id,
        workspace_id,
        user_id,
        product_id,
        created_at,
        products (
          id,
          title,
          model,
          ean,
          is_synthetic,
          categories (name),
          brands (name),
          offers (current_price_paise, original_price_paise, merchant_name)
        )
      `,
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const rawRows = data as unknown as DbWatchlistRow[];
    return rawRows.map((row) => {
      const prod = row.products;
      const offers = prod?.offers || [];
      const prices = offers.map((o) => o.current_price_paise);
      const lowest = prices.length > 0 ? Math.min(...prices) : 0;
      const originalPrices = offers.map((o) => o.original_price_paise).filter(Boolean) as number[];
      const maxOriginal = originalPrices.length > 0 ? Math.max(...originalPrices) : undefined;
      const merchants = Array.from(new Set(offers.map((o) => o.merchant_name).filter(Boolean))) as string[];

      return {
        id: row.id,
        workspaceId: row.workspace_id,
        userId: row.user_id,
        productId: row.product_id,
        product: {
          id: prod?.id || row.product_id,
          title: prod?.title || "Product",
          brand: prod?.brands?.name || "Generic",
          category: prod?.categories?.name || "General",
          model: prod?.model || "",
          ean: prod?.ean || "",
          lowestPricePaise: lowest,
          originalPricePaise: maxOriginal,
          offerCount: offers.length,
          merchants,
          isSynthetic: prod?.is_synthetic ?? true,
        },
        createdAt: row.created_at,
      };
    });
  }

  public async isWatchlisted(workspaceId: string, productId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("watchlists")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("product_id", productId)
      .maybeSingle();

    return !error && data !== null;
  }

  public async addToWatchlist(
    workspaceId: string,
    userId: string,
    productId: string,
  ): Promise<WatchlistItem> {
    const { data, error } = await this.client
      .from("watchlists")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        product_id: productId,
      })
      .select("id, workspace_id, user_id, product_id, created_at")
      .single();

    if (error) {
      // If unique violation, fetch existing
      const existing = await this.client
        .from("watchlists")
        .select("id, workspace_id, user_id, product_id, created_at")
        .eq("workspace_id", workspaceId)
        .eq("product_id", productId)
        .single();

      if (existing.data) {
        const detail = (await this.getProductDetail(productId)) || {
          id: productId,
          title: "Product",
          brand: "Generic",
          category: "General",
          model: "",
          ean: "",
          lowestPricePaise: 0,
          offerCount: 0,
          merchants: [],
          isSynthetic: true,
          offers: [],
          priceHistory: [],
        };
        return {
          id: existing.data.id,
          workspaceId: existing.data.workspace_id,
          userId: existing.data.user_id,
          productId: existing.data.product_id,
          product: detail,
          createdAt: existing.data.created_at,
        };
      }
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }

    const detail = (await this.getProductDetail(productId)) || {
      id: productId,
      title: "Product",
      brand: "Generic",
      category: "General",
      model: "",
      ean: "",
      lowestPricePaise: 0,
      offerCount: 0,
      merchants: [],
      isSynthetic: true,
      offers: [],
      priceHistory: [],
    };

    return {
      id: data.id,
      workspaceId: data.workspace_id,
      userId: data.user_id,
      productId: data.product_id,
      product: detail,
      createdAt: data.created_at,
    };
  }

  public async removeFromWatchlist(workspaceId: string, productId: string): Promise<boolean> {
    const { error } = await this.client
      .from("watchlists")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("product_id", productId);

    return !error;
  }

  // --- Alert Operations (Persisted to Real Supabase PostgreSQL) ---
  public async getAlerts(workspaceId: string): Promise<AlertItem[]> {
    const { data, error } = await this.client
      .from("alerts")
      .select(
        `
        id,
        workspace_id,
        user_id,
        product_id,
        target_price_paise,
        channels,
        is_active,
        created_at,
        products (title)
      `,
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const rawRows = data as unknown as DbAlertRow[];
    return rawRows.map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      productId: row.product_id,
      productTitle: row.products?.title || "Tracked Product",
      targetPricePaise: row.target_price_paise,
      notificationChannel:
        Array.isArray(row.channels) && row.channels.includes("email") ? "email" : "in_app",
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  public async createAlert(data: {
    workspaceId: string;
    userId: string;
    productId: string;
    targetPricePaise: number;
    notificationChannel?: "email" | "in_app" | "webhook";
  }): Promise<AlertItem> {
    const { data: res, error } = await this.client
      .from("alerts")
      .insert({
        workspace_id: data.workspaceId,
        user_id: data.userId,
        product_id: data.productId,
        target_price_paise: data.targetPricePaise,
        channels: [data.notificationChannel || "in_app"],
        is_active: true,
      })
      .select(
        `
        id,
        workspace_id,
        user_id,
        product_id,
        target_price_paise,
        channels,
        is_active,
        created_at,
        products (title)
      `,
      )
      .single();

    if (error || !res) {
      throw new Error(`Failed to create alert: ${error?.message || "Unknown error"}`);
    }

    const row = res as unknown as DbAlertRow;
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      productId: row.product_id,
      productTitle: row.products?.title || "Tracked Product",
      targetPricePaise: row.target_price_paise,
      notificationChannel: data.notificationChannel || "in_app",
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  public async deleteAlert(workspaceId: string, alertId: string): Promise<boolean> {
    const { error } = await this.client
      .from("alerts")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("id", alertId);

    return !error;
  }
}

export const defaultSupabaseRepository = new SupabaseCatalogRepository();
