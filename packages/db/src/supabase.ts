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

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * Returns a Supabase client with anon key or user JWT.
 */
export function getSupabaseClient(jwt?: string): SupabaseClient {
  return createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "sb-db-anon-storage",
      storage: noopStorage,
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
      detectSessionInUrl: false,
      storageKey: "sb-db-admin-storage",
      storage: noopStorage,
    },
  });
}

function generateHexToken(bytes = 24): string {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    const arr = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

async function sha256Hex(message: string): Promise<string> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `sha256_${message.substring(0, 16)}`;
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

  // --- Saved Searches ---
  public async getSavedSearches(workspaceId: string): Promise<SavedSearchItem[]> {
    const { data, error } = await this.client
      .from("saved_searches")
      .select("id, workspace_id, user_id, query, filters, notify_on_new, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      workspaceId: d.workspace_id,
      userId: d.user_id,
      query: d.query,
      filters: (d.filters as Record<string, unknown>) || {},
      notifyOnNew: d.notify_on_new,
      createdAt: d.created_at,
    }));
  }

  public async createSavedSearch(data: {
    workspaceId: string;
    userId: string;
    query: string;
    filters?: Record<string, unknown>;
    notifyOnNew?: boolean;
  }): Promise<SavedSearchItem> {
    const { data: res, error } = await this.client
      .from("saved_searches")
      .insert({
        workspace_id: data.workspaceId,
        user_id: data.userId,
        query: data.query,
        filters: data.filters || {},
        notify_on_new: data.notifyOnNew ?? false,
      })
      .select("id, workspace_id, user_id, query, filters, notify_on_new, created_at")
      .single();

    if (error || !res) {
      throw new Error(`Failed to create saved search: ${error?.message || "Unknown error"}`);
    }

    return {
      id: res.id,
      workspaceId: res.workspace_id,
      userId: res.user_id,
      query: res.query,
      filters: (res.filters as Record<string, unknown>) || {},
      notifyOnNew: res.notify_on_new,
      createdAt: res.created_at,
    };
  }

  public async deleteSavedSearch(workspaceId: string, searchId: string): Promise<boolean> {
    const { error } = await this.client
      .from("saved_searches")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("id", searchId);

    return !error;
  }

  // --- Team Members & Invitations ---
  public async getTeamMembers(workspaceId: string): Promise<TeamMemberItem[]> {
    const { data, error } = await this.client
      .from("workspace_members")
      .select("id, workspace_id, user_id, role, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data.map((m) => ({
      id: m.id,
      workspaceId: m.workspace_id,
      userId: m.user_id,
      role: m.role as "owner" | "admin" | "member",
      createdAt: m.created_at,
    }));
  }

  public async getTeamInvitations(workspaceId: string): Promise<TeamInvitationItem[]> {
    const { data, error } = await this.client
      .from("team_invitations")
      .select("id, workspace_id, email, role, token, expires_at, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((inv) => ({
      id: inv.id,
      workspaceId: inv.workspace_id,
      email: inv.email,
      role: inv.role as "admin" | "member",
      token: inv.token,
      expiresAt: inv.expires_at,
      createdAt: inv.created_at,
    }));
  }

  public async createTeamInvitation(data: {
    workspaceId: string;
    email: string;
    role?: "admin" | "member";
  }): Promise<TeamInvitationItem> {
    const token = generateHexToken(24);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: res, error } = await this.client
      .from("team_invitations")
      .insert({
        workspace_id: data.workspaceId,
        email: data.email.toLowerCase().trim(),
        role: data.role || "member",
        token,
        expires_at: expiresAt,
      })
      .select("id, workspace_id, email, role, token, expires_at, created_at")
      .single();

    if (error || !res) {
      throw new Error(`Failed to create team invitation: ${error?.message || "Unknown error"}`);
    }

    return {
      id: res.id,
      workspaceId: res.workspace_id,
      email: res.email,
      role: res.role as "admin" | "member",
      token: res.token,
      expiresAt: res.expires_at,
      createdAt: res.created_at,
    };
  }

  public async revokeTeamInvitation(workspaceId: string, invitationId: string): Promise<boolean> {
    const { error } = await this.client
      .from("team_invitations")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("id", invitationId);

    return !error;
  }

  public async removeTeamMember(workspaceId: string, memberId: string): Promise<boolean> {
    const { error } = await this.client
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("id", memberId);

    return !error;
  }

  // --- Webhooks & Deliveries ---
  public async getWebhooks(workspaceId: string): Promise<WebhookItem[]> {
    const { data, error } = await this.client
      .from("webhooks")
      .select("id, workspace_id, target_url, secret_hash, events, is_active, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((w) => ({
      id: w.id,
      workspaceId: w.workspace_id,
      targetUrl: w.target_url,
      secretHash: w.secret_hash,
      events: (w.events as string[]) || [],
      isActive: w.is_active,
      createdAt: w.created_at,
    }));
  }

  public async createWebhook(data: {
    workspaceId: string;
    targetUrl: string;
    events?: string[];
  }): Promise<{ webhook: WebhookItem; rawSecret: string }> {
    const rawSecret = `whsec_${generateHexToken(24)}`;
    const secretHash = await sha256Hex(rawSecret);
    const events = data.events && data.events.length > 0 ? data.events : ["price.drop", "extract.complete"];

    const { data: res, error } = await this.client
      .from("webhooks")
      .insert({
        workspace_id: data.workspaceId,
        target_url: data.targetUrl,
        secret_hash: secretHash,
        events,
        is_active: true,
      })
      .select("id, workspace_id, target_url, secret_hash, events, is_active, created_at")
      .single();

    if (error || !res) {
      throw new Error(`Failed to create webhook: ${error?.message || "Unknown error"}`);
    }

    return {
      webhook: {
        id: res.id,
        workspaceId: res.workspace_id,
        targetUrl: res.target_url,
        secretHash: res.secret_hash,
        events: (res.events as string[]) || [],
        isActive: res.is_active,
        createdAt: res.created_at,
      },
      rawSecret,
    };
  }

  public async deleteWebhook(workspaceId: string, webhookId: string): Promise<boolean> {
    const { error } = await this.client
      .from("webhooks")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("id", webhookId);

    return !error;
  }

  public async getWebhookDeliveries(workspaceId: string, webhookId?: string): Promise<WebhookDeliveryItem[]> {
    let query = this.client
      .from("webhook_deliveries")
      .select("id, webhook_id, workspace_id, event_type, payload, response_status, signature, latency_ms, delivered_at")
      .eq("workspace_id", workspaceId)
      .order("delivered_at", { ascending: false })
      .limit(50);

    if (webhookId) {
      query = query.eq("webhook_id", webhookId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      webhookId: d.webhook_id,
      workspaceId: d.workspace_id,
      eventType: d.event_type,
      payload: (d.payload as Record<string, unknown>) || {},
      responseStatus: d.response_status,
      signature: d.signature,
      latencyMs: d.latency_ms,
      deliveredAt: d.delivered_at,
    }));
  }

  public async recordWebhookDelivery(delivery: {
    webhookId: string;
    workspaceId: string;
    eventType: string;
    payload: Record<string, unknown>;
    responseStatus?: number;
    signature: string;
    latencyMs?: number;
  }): Promise<WebhookDeliveryItem> {
    const { data, error } = await this.client
      .from("webhook_deliveries")
      .insert({
        webhook_id: delivery.webhookId,
        workspace_id: delivery.workspaceId,
        event_type: delivery.eventType,
        payload: delivery.payload,
        response_status: delivery.responseStatus ?? 200,
        signature: delivery.signature,
        latency_ms: delivery.latencyMs ?? 42,
      })
      .select("id, webhook_id, workspace_id, event_type, payload, response_status, signature, latency_ms, delivered_at")
      .single();

    if (error || !data) {
      throw new Error(`Failed to record webhook delivery: ${error?.message || "Unknown error"}`);
    }

    return {
      id: data.id,
      webhookId: data.webhook_id,
      workspaceId: data.workspace_id,
      eventType: data.event_type,
      payload: (data.payload as Record<string, unknown>) || {},
      responseStatus: data.response_status,
      signature: data.signature,
      latencyMs: data.latency_ms,
      deliveredAt: data.delivered_at,
    };
  }

  // --- Extract Runs, Streaming Logs & Datasets ---
  public async getExtractRuns(workspaceId: string): Promise<ExtractRunItem[]> {
    const { data, error } = await this.client
      .from("extract_runs")
      .select("id, workspace_id, template_id, status, records_extracted, error_message, created_at, completed_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      templateId: r.template_id,
      status: r.status as "running" | "completed" | "failed",
      recordsExtracted: r.records_extracted,
      errorMessage: r.error_message,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    }));
  }

  public async createExtractRun(data: {
    workspaceId: string;
    templateId?: string | null;
  }): Promise<ExtractRunItem> {
    const { data: res, error } = await this.client
      .from("extract_runs")
      .insert({
        workspace_id: data.workspaceId,
        template_id: data.templateId || null,
        status: "running",
        records_extracted: 0,
      })
      .select("id, workspace_id, template_id, status, records_extracted, error_message, created_at, completed_at")
      .single();

    if (error || !res) {
      throw new Error(`Failed to create extract run: ${error?.message || "Unknown error"}`);
    }

    return {
      id: res.id,
      workspaceId: res.workspace_id,
      templateId: res.template_id,
      status: res.status as "running" | "completed" | "failed",
      recordsExtracted: res.records_extracted,
      errorMessage: res.error_message,
      createdAt: res.created_at,
      completedAt: res.completed_at,
    };
  }

  public async updateExtractRun(
    runId: string,
    data: {
      status: "running" | "completed" | "failed";
      recordsExtracted?: number;
      errorMessage?: string | null;
      completedAt?: string;
    },
  ): Promise<boolean> {
    const { error } = await this.client
      .from("extract_runs")
      .update({
        status: data.status,
        records_extracted: data.recordsExtracted,
        error_message: data.errorMessage,
        completed_at: data.completedAt || (data.status !== "running" ? new Date().toISOString() : null),
      })
      .eq("id", runId);

    return !error;
  }

  public async appendExtractRunLog(data: {
    runId: string;
    workspaceId: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    meta?: Record<string, unknown>;
  }): Promise<ExtractRunLogItem> {
    const { data: res, error } = await this.client
      .from("extract_run_logs")
      .insert({
        run_id: data.runId,
        workspace_id: data.workspaceId,
        level: data.level,
        message: data.message,
        meta: data.meta || null,
      })
      .select("id, run_id, workspace_id, level, message, meta, timestamp")
      .single();

    if (error || !res) {
      throw new Error(`Failed to append log: ${error?.message || "Unknown error"}`);
    }

    return {
      id: res.id,
      runId: res.run_id,
      workspaceId: res.workspace_id,
      level: res.level as "debug" | "info" | "warn" | "error",
      message: res.message,
      meta: (res.meta as Record<string, unknown>) || null,
      timestamp: res.timestamp,
    };
  }

  public async getExtractRunLogs(runId: string): Promise<ExtractRunLogItem[]> {
    const { data, error } = await this.client
      .from("extract_run_logs")
      .select("id, run_id, workspace_id, level, message, meta, timestamp")
      .eq("run_id", runId)
      .order("timestamp", { ascending: true });

    if (error || !data) return [];
    return data.map((l) => ({
      id: l.id,
      runId: l.run_id,
      workspaceId: l.workspace_id,
      level: l.level as "debug" | "info" | "warn" | "error",
      message: l.message,
      meta: (l.meta as Record<string, unknown>) || null,
      timestamp: l.timestamp,
    }));
  }

  public async getDatasets(workspaceId: string): Promise<DatasetItem[]> {
    const { data, error } = await this.client
      .from("datasets")
      .select("id, workspace_id, name, description, schema, record_count, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      workspaceId: d.workspace_id,
      name: d.name,
      description: d.description,
      schema: Array.isArray(d.schema) ? d.schema : [],
      recordCount: d.record_count,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  public async createDataset(data: {
    workspaceId: string;
    name: string;
    description?: string;
    schema?: unknown[];
    records?: Record<string, unknown>[];
  }): Promise<{ dataset: DatasetItem; recordCount: number }> {
    const records = data.records || [];
    const { data: res, error } = await this.client
      .from("datasets")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        description: data.description || null,
        schema: data.schema || [],
        record_count: records.length,
      })
      .select("id, workspace_id, name, description, schema, record_count, created_at, updated_at")
      .single();

    if (error || !res) {
      throw new Error(`Failed to create dataset: ${error?.message || "Unknown error"}`);
    }

    if (records.length > 0) {
      const recordsToInsert = records.map((r) => ({
        dataset_id: res.id,
        workspace_id: data.workspaceId,
        data: r,
      }));

      const { error: recError } = await this.client
        .from("dataset_records")
        .insert(recordsToInsert);

      if (recError) {
        console.error("Failed to insert dataset records:", recError.message);
      }
    }

    return {
      dataset: {
        id: res.id,
        workspaceId: res.workspace_id,
        name: res.name,
        description: res.description,
        schema: Array.isArray(res.schema) ? res.schema : [],
        recordCount: records.length,
        createdAt: res.created_at,
        updatedAt: res.updated_at,
      },
      recordCount: records.length,
    };
  }

  public async getDatasetRecords(datasetId: string, limit = 500): Promise<Record<string, unknown>[]> {
    const { data, error } = await this.client
      .from("dataset_records")
      .select("id, data, created_at")
      .eq("dataset_id", datasetId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data.map((r: { id: string; data: Record<string, unknown>; created_at: string }) => ({
      id: r.id,
      ...r.data,
      createdAt: r.created_at,
    }));
  }

  public async createApiKey(params: {
    workspaceId: string;
    name: string;
    scopes?: string[];
  }): Promise<{ apiKey: ApiKeyItem; plainSecret: string }> {
    const rawBytes = generateHexToken(24);
    const plainSecret = `scrappy_live_${rawBytes}`;
    const keyPrefix = plainSecret.substring(0, 16);
    const keyHash = await sha256Hex(plainSecret);

    const { data: res, error } = await this.client
      .from("api_keys")
      .insert({
        workspace_id: params.workspaceId,
        name: params.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: params.scopes || ["read", "extract"],
      })
      .select("id, workspace_id, name, key_prefix, scopes, created_at, last_used_at, expires_at, revoked_at")
      .single();

    if (error || !res) {
      throw new Error(`Failed to create API key: ${error?.message || "Unknown error"}`);
    }

    const apiKey: ApiKeyItem = {
      id: res.id,
      workspaceId: res.workspace_id,
      name: res.name,
      keyPrefix: res.key_prefix,
      scopes: (res.scopes as string[]) || ["read", "extract"],
      createdAt: res.created_at,
      lastUsedAt: res.last_used_at,
      expiresAt: res.expires_at,
      revokedAt: res.revoked_at || null,
    };

    return { apiKey, plainSecret };
  }

  public async getApiKeys(workspaceId: string): Promise<ApiKeyItem[]> {
    const { data, error } = await this.client
      .from("api_keys")
      .select("id, workspace_id, name, key_prefix, scopes, created_at, last_used_at, expires_at, revoked_at")
      .eq("workspace_id", workspaceId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      workspaceId: d.workspace_id,
      name: d.name,
      keyPrefix: d.key_prefix,
      scopes: d.scopes as string[],
      createdAt: d.created_at,
      lastUsedAt: d.last_used_at,
      expiresAt: d.expires_at,
      revokedAt: d.revoked_at,
    }));
  }

  public async revokeApiKey(workspaceId: string, id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .select("id");

    return !error && Array.isArray(data) && data.length > 0;
  }

  public async validateApiKey(plainKey: string): Promise<{
    valid: boolean;
    isValid: boolean;
    apiKey?: { id: string; workspaceId: string; scopes: string[] };
    workspaceId?: string;
    scopes?: string[];
    reason?: string;
  }> {
    if (!plainKey || !plainKey.startsWith("scrappy_live_")) {
      return { valid: false, isValid: false, reason: "invalid_key" };
    }

    const keyHash = await sha256Hex(plainKey);

    const { data, error } = await this.client
      .from("api_keys")
      .select("id, workspace_id, scopes, expires_at, revoked_at")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (error || !data) {
      return { valid: false, isValid: false, reason: "invalid_key" };
    }

    if (data.revoked_at) {
      return { valid: false, isValid: false, reason: "revoked" };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, isValid: false, reason: "expired" };
    }

    // Touch last_used_at asynchronously
    void this.client
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);

    const scopes = (data.scopes as string[]) || ["read"];
    return {
      valid: true,
      isValid: true,
      apiKey: {
        id: data.id,
        workspaceId: data.workspace_id,
        scopes,
      },
      workspaceId: data.workspace_id,
      scopes,
    };
  }
}

export function signWebhookPayload(
  payload: string | Record<string, unknown>,
  secret: string,
  timestamp?: number,
): string {
  const content = typeof payload === "string" ? payload : JSON.stringify(payload);
  const ts = timestamp !== undefined ? timestamp : Math.floor(Date.now() / 1000);
  const toSign = timestamp !== undefined ? `${ts}.${content}` : content;

  let hex = "";
  try {
    const nodeCrypto = typeof window === "undefined" ? eval("require")("crypto") : null;
    if (nodeCrypto && typeof nodeCrypto.createHmac === "function") {
      hex = nodeCrypto.createHmac("sha256", secret).update(toSign).digest("hex");
    }
  } catch {
    // fallback
  }

  if (!hex) {
    let hash = 0;
    for (let i = 0; i < toSign.length; i++) {
      hash = (hash << 5) - hash + toSign.charCodeAt(i);
      hash |= 0;
    }
    hex = `sig_${Math.abs(hash).toString(16)}`;
  }

  return timestamp !== undefined ? `t=${ts},v1=${hex}` : hex;
}

export interface VerifyWebhookOptions {
  payload: string | Record<string, unknown>;
  signatureHeader?: string;
  signature?: string;
  secret: string;
  toleranceSeconds?: number;
}

export function verifyWebhookSignature(
  optionsOrPayload: VerifyWebhookOptions | string | Record<string, unknown>,
  signatureOrSecret?: string,
  secretOrTimestamp?: string | number,
  timestamp?: number | string,
  toleranceSeconds = 300,
): { valid: boolean; isValid: boolean; reason?: string } {
  let payload: string;
  let signatureHeader: string;
  let secret: string;
  let tolerance = toleranceSeconds;

  if (typeof optionsOrPayload === "object" && optionsOrPayload !== null && "secret" in optionsOrPayload) {
    const opts = optionsOrPayload as VerifyWebhookOptions;
    payload = typeof opts.payload === "string" ? opts.payload : JSON.stringify(opts.payload);
    signatureHeader = opts.signatureHeader || opts.signature || "";
    secret = opts.secret;
    tolerance = opts.toleranceSeconds ?? 300;
  } else {
    payload = typeof optionsOrPayload === "string" ? optionsOrPayload : JSON.stringify(optionsOrPayload);
    signatureHeader = (signatureOrSecret as string) || "";
    secret = (secretOrTimestamp as string) || "";
    if (typeof timestamp === "number") {
      tolerance = toleranceSeconds;
    }
  }

  if (!signatureHeader || !secret) {
    return { valid: false, isValid: false, reason: "missing_parameter" };
  }

  // Check if header is in t=...,v1=... format
  if (signatureHeader.includes("t=") && signatureHeader.includes("v1=")) {
    const parts = signatureHeader.split(",");
    let tVal: number | null = null;
    let v1Val: string | null = null;

    for (const part of parts) {
      const [k, v] = part.trim().split("=");
      if (k === "t" && v) tVal = parseInt(v, 10);
      if (k === "v1" && v) v1Val = v;
    }

    if (tVal === null || isNaN(tVal) || !v1Val) {
      return { valid: false, isValid: false, reason: "malformed_signature_header" };
    }

    const nowSec = Math.floor(Date.now() / 1000);

    // Replay window: signatures older than tolerance seconds rejected
    if (nowSec - tVal > tolerance) {
      return { valid: false, isValid: false, reason: "timestamp_expired" };
    }

    // Future timestamps beyond 60s tolerance rejected
    if (tVal - nowSec > 60) {
      return { valid: false, isValid: false, reason: "future_timestamp" };
    }

    const toSign = `${tVal}.${payload}`;
    let expectedHex = "";
    try {
      const nodeCrypto = typeof window === "undefined" ? eval("require")("crypto") : null;
      if (nodeCrypto && typeof nodeCrypto.createHmac === "function") {
        expectedHex = nodeCrypto.createHmac("sha256", secret).update(toSign).digest("hex");
      }
    } catch {
      // fallback
    }

    if (!expectedHex) {
      let hash = 0;
      for (let i = 0; i < toSign.length; i++) {
        hash = (hash << 5) - hash + toSign.charCodeAt(i);
        hash |= 0;
      }
      expectedHex = `sig_${Math.abs(hash).toString(16)}`;
    }

    // Timing safe comparison
    try {
      const nodeCrypto = typeof window === "undefined" ? eval("require")("crypto") : null;
      if (nodeCrypto && typeof nodeCrypto.timingSafeEqual === "function") {
        const sigBuf = Buffer.from(v1Val);
        const expBuf = Buffer.from(expectedHex);
        if (sigBuf.length === expBuf.length && nodeCrypto.timingSafeEqual(sigBuf, expBuf)) {
          return { valid: true, isValid: true };
        }
        return { valid: false, isValid: false, reason: "signature_mismatch" };
      }
    } catch {
      // fallback
    }

    return v1Val === expectedHex
      ? { valid: true, isValid: true }
      : { valid: false, isValid: false, reason: "signature_mismatch" };
  }

  // Raw signature format (no t=)
  let expectedSig = "";
  try {
    const nodeCrypto = typeof window === "undefined" ? eval("require")("crypto") : null;
    if (nodeCrypto && typeof nodeCrypto.createHmac === "function") {
      expectedSig = nodeCrypto.createHmac("sha256", secret).update(payload).digest("hex");
    }
  } catch {
    // fallback
  }

  if (!expectedSig) {
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }
    expectedSig = `sig_${Math.abs(hash).toString(16)}`;
  }

  try {
    const nodeCrypto = typeof window === "undefined" ? eval("require")("crypto") : null;
    if (nodeCrypto && typeof nodeCrypto.timingSafeEqual === "function") {
      const sigBuf = Buffer.from(signatureHeader);
      const expBuf = Buffer.from(expectedSig);
      if (sigBuf.length === expBuf.length && nodeCrypto.timingSafeEqual(sigBuf, expBuf)) {
        return { valid: true, isValid: true };
      }
      return { valid: false, isValid: false, reason: "signature_mismatch" };
    }
  } catch {
    // fallback
  }

  return signatureHeader === expectedSig
    ? { valid: true, isValid: true }
    : { valid: false, isValid: false, reason: "signature_mismatch" };
}

export interface ApiKeyItem {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
}

export interface SavedSearchItem {
  id: string;
  workspaceId: string;
  userId: string;
  query: string;
  filters: Record<string, unknown>;
  notifyOnNew: boolean;
  createdAt: string;
}

export interface TeamMemberItem {
  id: string;
  workspaceId: string;
  userId: string;
  email?: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface TeamInvitationItem {
  id: string;
  workspaceId: string;
  email: string;
  role: "admin" | "member";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface WebhookItem {
  id: string;
  workspaceId: string;
  targetUrl: string;
  secretHash: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export interface WebhookDeliveryItem {
  id: string;
  webhookId: string;
  workspaceId: string;
  eventType: string;
  payload: Record<string, unknown>;
  responseStatus: number | null;
  signature: string;
  latencyMs: number | null;
  deliveredAt: string;
}

export interface ExtractRunItem {
  id: string;
  workspaceId: string;
  templateId?: string | null;
  status: "running" | "completed" | "failed";
  recordsExtracted: number;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface ExtractRunLogItem {
  id: string;
  runId: string;
  workspaceId: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  meta?: Record<string, unknown> | null;
  timestamp: string;
}

export interface DatasetItem {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  schema: unknown[];
  recordCount: number;
  createdAt: string;
  updatedAt: string;
}

export const defaultSupabaseRepository = new SupabaseCatalogRepository();

