import { test, expect } from "@playwright/test";

test.describe("Fonts and Tokens Verification", () => {
  test("Landing page font requests: at most 3 font file requests, zero external requests", async ({ page }) => {
    const fontRequests: string[] = [];
    const externalRequests: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      const resourceType = req.resourceType();
      const isFontFile =
        resourceType === "font" ||
        url.endsWith(".woff2") ||
        url.endsWith(".woff") ||
        url.endsWith(".ttf") ||
        url.endsWith(".otf");

      if (isFontFile) {
        fontRequests.push(url);
        if (!url.startsWith("http://localhost:3005") && !url.startsWith("http://localhost:3000")) {
          externalRequests.push(url);
        }
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });

    // Assert zero external font requests
    expect(externalRequests, "No external font requests allowed").toHaveLength(0);

    // Assert at most 3 font file requests on landing page (Bricolage, Geist Sans, Geist Mono)
    expect(fontRequests.length, `Expected at most 3 font requests, got ${fontRequests.length}`).toBeLessThanOrEqual(3);

    // Verify document.fonts contains loaded font faces
    const loadedFontFaces = await page.evaluate(async () => {
      await document.fonts.ready;
      const fonts: string[] = [];
      document.fonts.forEach((font) => {
        fonts.push(`${font.family} (${font.status})`);
      });
      return fonts;
    });

    expect(loadedFontFaces.length).toBeGreaterThan(0);
  });

  test("Computed font families on landing page: body=Geist, h1=Bricolage Grotesque, price=Geist Mono", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const styles = await page.evaluate(() => {
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      const h1El = document.querySelector("h1");
      const h1Font = h1El ? window.getComputedStyle(h1El).fontFamily : "";
      const priceEl = document.querySelector(".tabular-nums") || document.querySelector(".font-mono");
      const priceFont = priceEl ? window.getComputedStyle(priceEl).fontFamily : "";
      const heroWordEl = document.querySelector(".font-serif");
      const heroWordFont = heroWordEl ? window.getComputedStyle(heroWordEl).fontFamily : "";

      return { bodyFont, h1Font, priceFont, heroWordFont };
    });

    // Body should use Geist Sans (either Geist or __GeistSans from next/font)
    expect(styles.bodyFont.toLowerCase()).toMatch(/geist/);
    expect(styles.bodyFont.toLowerCase()).not.toContain("inter");

    // H1 should use Bricolage Grotesque
    expect(styles.h1Font.toLowerCase()).toContain("bricolage grotesque");

    // Price should use Geist Mono
    expect(styles.priceFont.toLowerCase()).toMatch(/geist.*mono|geistmono/);
    expect(styles.priceFont.toLowerCase()).not.toContain("jetbrains mono");

    // Hero word accent should use Instrument Serif or serif
    if (styles.heroWordFont) {
      expect(styles.heroWordFont.toLowerCase()).toMatch(/instrument serif|serif/);
    }
  });

  test("Computed font families on compare page: body=Geist, h1=Bricolage Grotesque, price=Geist Mono", async ({ page }) => {
    await page.goto("/compare", { waitUntil: "domcontentloaded" });

    const styles = await page.evaluate(() => {
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      const h1El = document.querySelector("h1");
      const h1Font = h1El ? window.getComputedStyle(h1El).fontFamily : "";
      const priceEl = document.querySelector(".tabular-nums") || document.querySelector(".font-mono");
      const priceFont = priceEl ? window.getComputedStyle(priceEl).fontFamily : "";

      return { bodyFont, h1Font, priceFont };
    });

    expect(styles.bodyFont.toLowerCase()).toMatch(/geist/);
    expect(styles.bodyFont.toLowerCase()).not.toContain("inter");
    expect(styles.h1Font.toLowerCase()).toContain("bricolage grotesque");
    expect(styles.priceFont.toLowerCase()).toMatch(/geist.*mono|geistmono/);
    expect(styles.priceFont.toLowerCase()).not.toContain("jetbrains mono");
  });

  test("Computed font families on product page: body=Geist, h1=Bricolage Grotesque, price=Geist Mono", async ({ page }) => {
    await page.goto("/compare/b2000000-0000-0000-0000-000000000001", { waitUntil: "domcontentloaded" });

    const styles = await page.evaluate(() => {
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      const h1El = document.querySelector("h1");
      const h1Font = h1El ? window.getComputedStyle(h1El).fontFamily : "";
      const priceEl = document.querySelector(".tabular-nums") || document.querySelector(".font-mono");
      const priceFont = priceEl ? window.getComputedStyle(priceEl).fontFamily : "";

      return { bodyFont, h1Font, priceFont };
    });

    expect(styles.bodyFont.toLowerCase()).toMatch(/geist/);
    expect(styles.bodyFont.toLowerCase()).not.toContain("inter");
    expect(styles.h1Font.toLowerCase()).toContain("bricolage grotesque");
    expect(styles.priceFont.toLowerCase()).toMatch(/geist.*mono|geistmono/);
    expect(styles.priceFont.toLowerCase()).not.toContain("jetbrains mono");
  });

  test("Theme toggle: toggles between dark and light, persists in localStorage and across navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme") || "dark");
    
    // Toggle theme via theme-toggle button or 't' shortcut
    const toggleBtn = page.locator('[data-testid="theme-toggle"]').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
    } else {
      await page.keyboard.press("t");
    }

    const expectedTheme = initialTheme === "dark" ? "light" : "dark";
    await expect(page.locator("html")).toHaveAttribute("data-theme", expectedTheme);

    const storedTheme = await page.evaluate(() => localStorage.getItem("scrappy-theme"));
    expect(storedTheme).toBe(expectedTheme);

    // Navigate to another route and verify persistence
    await page.goto("/compare");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("html")).toHaveAttribute("data-theme", expectedTheme);
  });
});

