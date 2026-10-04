import { NextResponse } from "next/server";
import { defaultSupabaseRepository } from "@scrappy/db";

interface CacheEntry {
  expiresAt: number;
  data: unknown;
}

const SEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 60s cache

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? searchParams.get("query") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  const safePage = isNaN(page) ? 1 : page;
  const safeLimit = isNaN(limit) ? 20 : limit;
  const cacheKey = `${query.toLowerCase().trim()}_${safePage}_${safeLimit}`;

  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        "X-Cache": "HIT",
      },
    });
  }

  const results = await defaultSupabaseRepository.search({
    query,
    page: safePage,
    limit: safeLimit,
  });

  // Prune cache if it grows large
  if (SEARCH_CACHE.size > 500) {
    SEARCH_CACHE.clear();
  }

  SEARCH_CACHE.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: results,
  });

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      "X-Cache": "MISS",
    },
  });
}

