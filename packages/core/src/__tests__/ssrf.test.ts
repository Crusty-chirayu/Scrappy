import { describe, it, expect } from "vitest";
import { validateTargetUrl, isPrivateIPv4 } from "../security/ssrf.js";

describe("SSRF Protection Guard", () => {
  it("allows valid public URLs", () => {
    const validUrls = [
      "https://example.com/product/123",
      "https://amazon.in/dp/B0CX23V2ZH",
      "https://flipkart.com/item",
      "http://api.retailer.com/v1/feed.json",
    ];

    for (const url of validUrls) {
      const res = validateTargetUrl(url);
      expect(res.valid).toBe(true);
      expect(res.sanitizedUrl).toBeDefined();
    }
  });

  it("blocks loopback and private IPv4 addresses", () => {
    const blockedIps = [
      "http://127.0.0.1/admin",
      "http://127.0.0.5:8080/metrics",
      "http://10.0.0.1/internal",
      "http://172.16.0.1/",
      "http://172.31.255.255/",
      "http://192.168.1.1/router",
      "http://169.254.169.254/latest/meta-data/",
    ];

    for (const url of blockedIps) {
      const res = validateTargetUrl(url);
      expect(res.valid).toBe(false);
      expect(res.reason).toMatch(/restricted|blocked/i);
    }
  });

  it("blocks localhost and local domain suffixes", () => {
    const localDomains = [
      "http://localhost:3000",
      "https://app.localhost/api",
      "http://service.local/status",
      "http://database.internal:5432",
      "http://metadata.google.internal/computeMetadata/v1/",
    ];

    for (const url of localDomains) {
      const res = validateTargetUrl(url);
      expect(res.valid).toBe(false);
    }
  });

  it("blocks non-HTTP protocols", () => {
    const invalidProtocols = [
      "file:///etc/passwd",
      "ftp://anonymous@ftp.example.com",
      "gopher://gopher.floodgap.com",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "javascript:alert(1)",
    ];

    for (const url of invalidProtocols) {
      const res = validateTargetUrl(url);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Disallowed protocol");
    }
  });

  it("identifies private IPv4 correctly with isPrivateIPv4", () => {
    expect(isPrivateIPv4("10.1.2.3")).toBe(true);
    expect(isPrivateIPv4("172.20.10.5")).toBe(true);
    expect(isPrivateIPv4("192.168.0.1")).toBe(true);
    expect(isPrivateIPv4("169.254.169.254")).toBe(true);
    expect(isPrivateIPv4("127.0.0.1")).toBe(true);

    expect(isPrivateIPv4("8.8.8.8")).toBe(false);
    expect(isPrivateIPv4("1.1.1.1")).toBe(false);
    expect(isPrivateIPv4("172.15.0.1")).toBe(false); // outside 172.16-31
    expect(isPrivateIPv4("172.32.0.1")).toBe(false); // outside 172.16-31
    expect(isPrivateIPv4("not-an-ip")).toBe(false);
  });
});
