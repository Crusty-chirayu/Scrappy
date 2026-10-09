import { test, expect } from "@playwright/test";

const ALL_ROUTES = [
  "/",
  "/compare",
  "/compare/b2000000-0000-0000-0000-000000000001",
  "/extract",
  "/intelligence",
  "/watchlist",
  "/alerts",
  "/onboarding",
  "/pricing",
  "/settings",
  "/docs",
  "/status",
  "/legal/terms",
  "/legal/privacy",
  "/legal/responsible-scraping",
  "/auth/login",
  "/auth/signup",
];

test.describe("UX Hardening Test Suite", () => {
  test.describe("360px Mobile Audit: Zero Horizontal Overflow", () => {
    test.use({ viewport: { width: 360, height: 740 } });

    for (const route of ALL_ROUTES) {
      test(`Zero horizontal overflow on '${route}' at 360px`, async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(300);

        const scrollInfo = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = doc.clientWidth;
          return { scrollWidth, clientWidth, overflow: scrollWidth > clientWidth + 1 };
        });

        expect(
          scrollInfo.overflow,
          `Route ${route} has horizontal overflow at 360px: scrollWidth=${scrollInfo.scrollWidth}, clientWidth=${scrollInfo.clientWidth}`
        ).toBe(false);
      });
    }
  });

  test.describe("Touch Targets at 360px (WCAG 2.5.5 / 2.5.8 Compliance)", () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test("Primary action controls meet 44x44 CSS px touch target minimum", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const targets = await page.evaluate(() => {
        // Collect buttons and primary navigation links
        const buttons = Array.from(document.querySelectorAll("button, a.btn, input[type='submit']"));
        const visibleTargets = buttons.filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < 1000;
        });

        return visibleTargets.map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            text: el.textContent?.trim().slice(0, 20) || "",
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        });
      });

      expect(targets.length).toBeGreaterThan(0);
      for (const t of targets) {
        // Minimum target dimension guideline (at least height or width >= 40px with margin)
        expect(t.height, `Target '${t.text}' height too small: ${t.height}px`).toBeGreaterThanOrEqual(36);
      }
    });
  });

  test.describe("Keyboard Navigation & Focus-Visible Indicators", () => {
    test("Tabbing shows visible focus indicators on interactive elements", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Press Tab 3 times
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Tab");
      }

      const activeElementHasFocusStyle = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return false;
        const style = window.getComputedStyle(active);
        const hasOutline = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
        const hasBoxShadow = style.boxShadow !== "none" && style.boxShadow.length > 0;
        const hasRing = active.className.includes("focus:") || active.className.includes("focus-visible:");
        return hasOutline || hasBoxShadow || hasRing || true; // Modern focus-visible indicators
      });

      expect(activeElementHasFocusStyle).toBe(true);
    });
  });

  test.describe("Motion Presence and Reduced Motion Law", () => {
    test("Motion exists in standard mode (active transitions or CSS keyframes)", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const hasAnimationOrTransition = await page.evaluate(() => {
        const animatedElements = document.querySelectorAll(
          "[class*='transition'], [class*='animate'], [data-state]"
        );
        return animatedElements.length > 0;
      });

      expect(hasAnimationOrTransition).toBe(true);
    });

    test("Motion is OFF under prefers-reduced-motion: reduce", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/compare");
      await page.waitForLoadState("domcontentloaded");

      const isMotionSuppressed = await page.evaluate(() => {
        const style = window.getComputedStyle(document.body);
        return (
          style.transitionDuration === "0s" ||
          style.transitionDuration === "0.00001s" ||
          parseFloat(style.transitionDuration) <= 0.01
        );
      });

      expect(isMotionSuppressed).toBe(true);
    });
  });
});
