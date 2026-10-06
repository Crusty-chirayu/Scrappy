import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ExtractStudioPage from "./page";
import { validateTargetUrl } from "@scrappy/core";
import { ToastProvider } from "@scrappy/ui";

// Mock next/dynamic
vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="preview-mock">Preview Runtime</div>,
}));

describe("Slice H: Extract Studio (/extract) & Security Guard", () => {
  it("proves disallowed sources and SSRF targets are strictly refused by validateTargetUrl", () => {
    // 1. Private IPv4 / Cloud metadata endpoint
    const metadataCheck = validateTargetUrl("http://169.254.169.254/latest/meta-data/");
    expect(metadataCheck.valid).toBe(false);
    expect(metadataCheck.reason).toMatch(/restricted|blocked/i);

    // 2. Loopback 127.0.0.1
    const loopbackCheck = validateTargetUrl("http://127.0.0.1:8080/admin");
    expect(loopbackCheck.valid).toBe(false);
    expect(loopbackCheck.reason).toMatch(/restricted|blocked/i);

    // 3. Localhost hostname
    const localhostCheck = validateTargetUrl("http://localhost:3000/internal");
    expect(localhostCheck.valid).toBe(false);
    expect(localhostCheck.reason).toMatch(/restricted|blocked/i);

    // 4. RFC 1918 Private CIDR (10.x, 192.168.x, 172.16.x)
    const privSubnetCheck1 = validateTargetUrl("http://10.0.0.1/internal");
    expect(privSubnetCheck1.valid).toBe(false);
    const privSubnetCheck2 = validateTargetUrl("http://192.168.1.1/router");
    expect(privSubnetCheck2.valid).toBe(false);
    const privSubnetCheck3 = validateTargetUrl("http://172.16.0.1/");
    expect(privSubnetCheck3.valid).toBe(false);

    // 5. Non-HTTP scheme
    const fileSchemeCheck = validateTargetUrl("file:///etc/passwd");
    expect(fileSchemeCheck.valid).toBe(false);
    expect(fileSchemeCheck.reason).toMatch(/Disallowed protocol/i);

    const javascriptCheck = validateTargetUrl("javascript:alert(1)");
    expect(javascriptCheck.valid).toBe(false);

    // 6. Valid public target
    const validPublicCheck = validateTargetUrl("https://store.example.com/catalog/electronics");
    expect(validPublicCheck.valid).toBe(true);
    expect(validPublicCheck.sanitizedUrl).toBe("https://store.example.com/catalog/electronics");
  });

  it("renders Step 1 Target & Politeness with SSRF guard and politeness badges", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <ExtractStudioPage />
      </ToastProvider>
    );

    expect(html).toContain("SCRAPPY EXTRACT");
    expect(html).toContain("Visual Extraction Studio");
    expect(html).toContain("Target &amp; Politeness");
    expect(html).toContain("Schema &amp; Selectors");
    expect(html).toContain("Test &amp; Confidence");
    expect(html).toContain("ROBOTS.TXT STATUS");
    expect(html).toContain("CRAWL BUDGET RATE");
    expect(html).toContain("EXTRACTION SANDBOX");
    expect(html).toContain("Proceed to Schema Builder →");
  });

  it("renders test benchmark preset buttons for instant SSRF verification", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <ExtractStudioPage />
      </ToastProvider>
    );

    expect(html).toContain("TEST BENCHMARKS (CLICK TO VERIFY REFUSAL)");
    expect(html).toContain("Public Catalog (Allowed)");
    expect(html).toContain("Test Cloud Metadata IP (Refused)");
    expect(html).toContain("Test Loopback 127.0.0.1 (Refused)");
    expect(html).toContain("Test Localhost (Refused)");
  });
});
