import { SourceId, ExtractionMethod } from "@scrappy/core";
import { validateSafeUrl } from "./ssrf.js";
import { HostRateLimiter, globalRateLimiter } from "./rate-limiter.js";
import { RobotsEnforcer, globalRobotsEnforcer } from "./robots.js";
import { FetchOptions, FetchResult } from "./types.js";

export const SCRAPPY_BOT_USER_AGENT = "ScrappyBot/1.0 (+https://scrappy.in/bot; data-ethics@scrappy.in)";

export class ScrapingHttpError extends Error {
  constructor(
    public readonly url: string,
    public readonly statusCode: number,
    message: string,
  ) {
    super(`HTTP ${statusCode} for ${url}: ${message}`);
    this.name = "ScrapingHttpError";
  }
}

export class RobotsDisallowedError extends Error {
  constructor(public readonly url: string) {
    super(`URL disallowed by robots.txt policy: ${url}`);
    this.name = "RobotsDisallowedError";
  }
}

export class HttpFetcher {
  constructor(
    private readonly rateLimiter: HostRateLimiter = globalRateLimiter,
    private readonly robotsEnforcer: RobotsEnforcer = globalRobotsEnforcer,
    private readonly userAgent: string = SCRAPPY_BOT_USER_AGENT,
  ) {}

  public async fetch(
    rawUrl: string,
    sourceId: SourceId,
    options: FetchOptions = {},
  ): Promise<FetchResult> {
    const parsedUrl = validateSafeUrl(rawUrl);
    const url = parsedUrl.toString();

    // 1. Check robots.txt
    if (!this.robotsEnforcer.isAllowed(url)) {
      throw new RobotsDisallowedError(url);
    }

    // 2. Enforce per-host rate limit
    await this.rateLimiter.acquire(parsedUrl.hostname);

    const timeoutMs = options.timeoutMs ?? 8000;
    const maxRetries = options.maxRetries ?? 2;

    const reqHeaders: Record<string, string> = {
      "User-Agent": this.userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IN,en;q=0.9",
      ...options.headers,
    };

    if (options.etag) {
      reqHeaders["If-None-Match"] = options.etag;
    }
    if (options.ifModifiedSince) {
      reqHeaders["If-Modified-Since"] = options.ifModifiedSince;
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method: "GET",
          headers: reqHeaders,
          signal: controller.signal,
          redirect: options.allowRedirects === false ? "manual" : "follow",
        });

        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;

        const resHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          resHeaders[key.toLowerCase()] = val;
        });

        // 304 Not Modified
        if (response.status === 304) {
          return {
            url,
            source: sourceId,
            statusCode: 304,
            headers: resHeaders,
            body: "",
            fetchedAt: new Date().toISOString(),
            extractionMethod: "http" as ExtractionMethod,
            durationMs,
            isNotModified: true,
          };
        }

        if (response.status >= 500 && attempt < maxRetries) {
          // Transient server error - retry with backoff
          attempt++;
          await new Promise((res) => setTimeout(res, 300 * Math.pow(2, attempt)));
          continue;
        }

        if (!response.ok) {
          throw new ScrapingHttpError(url, response.status, response.statusText);
        }

        const body = await response.text();

        return {
          url,
          source: sourceId,
          statusCode: response.status,
          headers: resHeaders,
          body,
          fetchedAt: new Date().toISOString(),
          extractionMethod: "http" as ExtractionMethod,
          durationMs,
          isNotModified: false,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          attempt++;
          await new Promise((res) => setTimeout(res, 200 * Math.pow(2, attempt)));
          continue;
        }
        break;
      }
    }

    throw lastError ?? new Error(`Failed to fetch ${url}`);
  }
}

export const defaultHttpFetcher = new HttpFetcher();
