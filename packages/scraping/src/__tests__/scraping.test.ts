import { describe, it, expect } from "vitest";
import { validateSafeUrl } from "../ssrf.js";
import { SourceCircuitBreaker } from "../circuit-breaker.js";
import { RobotsEnforcer } from "../robots.js";
import { HostRateLimiter } from "../rate-limiter.js";
import { SchemaDriftDetector } from "../drift-detector.js";
import { LocalBrowserRenderer } from "../browser-renderer.js";

describe("SSRF Protection", () => {
  it("allows valid public URLs", () => {
    const url = validateSafeUrl("https://www.amazon.in/dp/B09G9FPGTN");
    expect(url.hostname).toBe("www.amazon.in");
  });

  it("blocks localhost, loopback and private IPs", () => {
    expect(() => validateSafeUrl("http://localhost:3000")).toThrow(/Access to blocked host/);
    expect(() => validateSafeUrl("http://127.0.0.1/admin")).toThrow(/Access to blocked host/);
    expect(() => validateSafeUrl("http://10.0.1.5/internal")).toThrow(/Access to private IP range/);
    expect(() => validateSafeUrl("http://192.168.1.1")).toThrow(/Access to private IP range/);
    expect(() => validateSafeUrl("http://169.254.169.254/latest/meta-data")).toThrow();
  });

  it("blocks non-http protocols", () => {
    expect(() => validateSafeUrl("file:///etc/passwd")).toThrow(/Disallowed protocol/);
    expect(() => validateSafeUrl("ftp://ftp.example.com")).toThrow(/Disallowed protocol/);
  });
});

describe("Circuit Breaker", () => {
  it("transitions to OPEN when failure threshold is reached", () => {
    const breaker = new SourceCircuitBreaker("test-source", {
      failureThreshold: 3,
      cooldownMs: 5000,
    });

    expect(breaker.getState()).toBe("CLOSED");
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("CLOSED");
    breaker.recordFailure();
    expect(breaker.getState()).toBe("OPEN");
    expect(() => breaker.checkHealth()).toThrow(/Circuit breaker open/);
  });

  it("resets on success", () => {
    const breaker = new SourceCircuitBreaker("test-source", {
      failureThreshold: 2,
      cooldownMs: 5000,
    });
    breaker.recordFailure();
    breaker.recordSuccess();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("CLOSED");
  });
});

describe("Robots.txt Enforcer", () => {
  const limiter = new HostRateLimiter(500);
  const enforcer = new RobotsEnforcer(limiter);

  it("parses user-agent rules and crawl-delay directives", () => {
    const sampleRobots = `
# Robots.txt
User-agent: *
Disallow: /admin/
Disallow: /checkout/
Allow: /dp/
Crawl-delay: 2.5
`;
    const parsed = enforcer.parseRobotsTxt(sampleRobots, "ScrappyBot");
    expect(parsed.allows).toContain("/dp/");
    expect(parsed.disallows).toContain("/admin/");
    expect(parsed.disallows).toContain("/checkout/");
    expect(parsed.crawlDelayMs).toBe(2500);
  });

  it("enforces allowed vs disallowed paths", () => {
    enforcer.setRules("example.com", {
      allows: ["/public", "/items"],
      disallows: ["/cart", "/login"],
    });

    expect(enforcer.isAllowed("https://example.com/items/123")).toBe(true);
    expect(enforcer.isAllowed("https://example.com/cart")).toBe(false);
  });
});

describe("Host Rate Limiter", () => {
  it("tracks host delays and respects minimum intervals", async () => {
    const limiter = new HostRateLimiter(50);
    limiter.setHostDelay("api.example.com", 80);

    expect(limiter.getHostDelay("api.example.com")).toBe(80);
    expect(limiter.getHostDelay("other.com")).toBe(50);

    const start = Date.now();
    await limiter.acquire("api.example.com");
    await limiter.acquire("api.example.com");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(70);
  });
});

describe("Schema Drift Detector", () => {
  const detector = new SchemaDriftDetector({ driftThreshold: 0.3 });

  it("flags zero drift for valid complete offer", () => {
    const result = detector.analyze({
      title: "Apple iPhone 16 (128 GB) - Natural Titanium",
      pricePaise: 7990000,
      originalPricePaise: 8990000,
      merchantName: "Amazon.in",
      provenance: {
        source: "amazon-in",
        sourceUrl: "https://amazon.in/dp/123",
        fetchedAt: "2026-10-04T12:00:00Z",
        extractionMethod: "http",
        confidence: 0.98,
        adapterVersion: "0.2.0",
      },
    });

    expect(result.isDrifted).toBe(false);
    expect(result.driftScore).toBe(0.0);
    expect(result.missingFields).toHaveLength(0);
  });

  it("detects severe drift when mandatory fields are missing or corrupted", () => {
    const result = detector.analyze({
      title: "",
      pricePaise: -500,
      merchantName: "",
    });

    expect(result.isDrifted).toBe(true);
    expect(result.driftScore).toBeGreaterThanOrEqual(0.7);
    expect(result.missingFields).toContain("title");
    expect(result.anomalies).toContain("Price is zero or negative");
  });
});

describe("Local Browser Renderer", () => {
  it("renders page without external binary dependencies", async () => {
    const renderer = new LocalBrowserRenderer();
    const result = await renderer.render("https://www.example.com/product", "flipkart");

    expect(result.statusCode).toBe(200);
    expect(result.extractionMethod).toBe("browser");
    expect(result.body).toContain("Dynamic Loaded Product");
  });
});
