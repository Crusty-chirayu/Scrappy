import { validateSafeUrl } from "./ssrf.js";
import { HostRateLimiter, globalRateLimiter } from "./rate-limiter.js";

export interface ParsedRobotsRules {
  allows: string[];
  disallows: string[];
  crawlDelayMs?: number;
}

export class RobotsEnforcer {
  private cache = new Map<string, ParsedRobotsRules>();
  private rateLimiter: HostRateLimiter;

  constructor(rateLimiter: HostRateLimiter = globalRateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  public parseRobotsTxt(content: string, targetUserAgent = "scrappybot"): ParsedRobotsRules {
    const lines = content.split(/\r?\n/);
    const allows: string[] = [];
    const disallows: string[] = [];
    let crawlDelayMs: number | undefined;

    let currentUserAgentMatches = false;
    const normalizedTarget = targetUserAgent.toLowerCase();

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const [directive, ...rest] = line.split(":");
      if (!directive || rest.length === 0) continue;

      const key = directive.trim().toLowerCase();
      const value = rest.join(":").trim();

      if (key === "user-agent") {
        const ua = value.toLowerCase();
        currentUserAgentMatches = ua === "*" || ua === normalizedTarget;
      } else if (currentUserAgentMatches) {
        if (key === "disallow") {
          if (value) disallows.push(value);
        } else if (key === "allow") {
          if (value) allows.push(value);
        } else if (key === "crawl-delay") {
          const delaySec = parseFloat(value);
          if (!isNaN(delaySec) && delaySec > 0) {
            crawlDelayMs = Math.round(delaySec * 1000);
          }
        }
      }
    }

    return { allows, disallows, crawlDelayMs };
  }

  public setRules(hostname: string, rules: ParsedRobotsRules): void {
    const host = hostname.toLowerCase();
    this.cache.set(host, rules);
    if (rules.crawlDelayMs) {
      this.rateLimiter.setHostDelay(host, rules.crawlDelayMs);
    }
  }

  public isAllowed(rawUrl: string, _userAgent = "ScrappyBot"): boolean {
    const parsed = validateSafeUrl(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const rules = this.cache.get(host);

    if (!rules) {
      // If no rules loaded yet, default to allowed
      return true;
    }

    const pathname = parsed.pathname;

    // Check allow rules first (most specific wins or explicit allow)
    for (const allow of rules.allows) {
      if (pathname.startsWith(allow)) {
        return true;
      }
    }

    // Check disallow rules
    for (const disallow of rules.disallows) {
      if (pathname.startsWith(disallow)) {
        return false;
      }
    }

    return true;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const globalRobotsEnforcer = new RobotsEnforcer(globalRateLimiter);
