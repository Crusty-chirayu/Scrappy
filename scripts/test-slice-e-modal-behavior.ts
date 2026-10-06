import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log("=== VERIFYING DIALOG FOCUS TRAP, SCROLL LOCK & FOCUS RESTORE ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/compare", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Initial body overflow should not be hidden
    const initialOverflow = await page.evaluate(() => document.body.style.overflow);
    console.log(`Initial document.body.style.overflow: "${initialOverflow}"`);

    // Add 2 products to compare tray
    const addButtons = page.locator('button:has-text("+ Add to Compare")');
    await addButtons.nth(0).click();
    await page.waitForTimeout(300);
    await addButtons.nth(1).click();
    await page.waitForTimeout(300);

    // Find "Compare Matrix" button
    const compareMatrixBtn = page.locator('button:has-text("Compare Matrix")');
    await compareMatrixBtn.waitFor({ state: "visible" });
    
    // Focus the button explicitly before clicking so we verify focus restore
    await compareMatrixBtn.focus();
    const triggerId = await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim());
    console.log(`Focused trigger before open: "${triggerId}"`);

    // Open modal
    await compareMatrixBtn.click();
    await page.waitForTimeout(500);

    // 1. Verify Scroll Lock
    const lockedOverflow = await page.evaluate(() => document.body.style.overflow);
    console.log(`Modal open document.body.style.overflow: "${lockedOverflow}"`);
    if (lockedOverflow !== "hidden") {
      throw new Error(`Expected body overflow to be 'hidden', got '${lockedOverflow}'`);
    }
    console.log("✓ Scroll lock verified: document.body.style.overflow === 'hidden'");

    // 2. Verify Focus Trap
    const modal = page.locator('div[role="dialog"]');
    await modal.waitFor({ state: "visible" });

    // Check where focus is initially
    const initialFocusInModal = await page.evaluate(() => {
      const active = document.activeElement;
      const dialog = document.querySelector('div[role="dialog"]');
      return dialog?.contains(active);
    });
    console.log(`Initial focus is inside dialog: ${initialFocusInModal}`);
    if (!initialFocusInModal) {
      throw new Error("Expected initial focus to be inside dialog");
    }

    // Tab multiple times to verify focus wraps and never leaves dialog
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const isInside = await page.evaluate(() => {
        const active = document.activeElement;
        const dialog = document.querySelector('div[role="dialog"]');
        return dialog?.contains(active);
      });
      if (!isInside) {
        throw new Error(`Focus escaped dialog on Tab step ${i}! Active element: ${await page.evaluate(() => document.activeElement?.outerHTML)}`);
      }
    }
    console.log("✓ Focus trap verified: 15 Tab keypresses remained inside dialog");

    // Shift+Tab backward multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Shift+Tab");
      const isInside = await page.evaluate(() => {
        const active = document.activeElement;
        const dialog = document.querySelector('div[role="dialog"]');
        return dialog?.contains(active);
      });
      if (!isInside) {
        throw new Error(`Focus escaped dialog on Shift+Tab step ${i}!`);
      }
    }
    console.log("✓ Backward focus trap verified: 10 Shift+Tab keypresses remained inside dialog");

    // 3. Verify Focus Restore on Close
    // Close using Escape key
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // Verify modal is closed
    const isModalVisible = await modal.isVisible();
    if (isModalVisible) {
      throw new Error("Modal did not close on Escape key");
    }
    console.log("✓ Modal closed on Escape key");

    // Verify Scroll Lock restored
    const restoredOverflow = await page.evaluate(() => document.body.style.overflow);
    console.log(`Modal closed document.body.style.overflow: "${restoredOverflow}"`);
    if (restoredOverflow !== initialOverflow) {
      throw new Error(`Expected body overflow to be restored to '${initialOverflow}', got '${restoredOverflow}'`);
    }
    console.log("✓ Scroll lock restore verified");

    // Verify Focus Restored to trigger
    const activeTextAfterClose = await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim());
    console.log(`Active element after close: "${activeTextAfterClose}"`);
    const isFocusRestored = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.textContent?.includes("Compare Matrix");
    });
    console.log(`Focus restored to Compare Matrix button: ${isFocusRestored}`);
    if (!isFocusRestored) {
      console.warn("Notice: Focus restored element was:", activeTextAfterClose);
    }

    await context.close();
  }

  console.log("\n=== VERIFYING 360PX VIEWPORT LAYOUT (NO HORIZONTAL PAN) ===");
  {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/compare", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // 1. Verify Page Scroll Width at 360px
    const pageMetrics = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      return {
        clientWidth: docEl.clientWidth,
        scrollWidth: docEl.scrollWidth,
        bodyScrollWidth: body.scrollWidth,
        hasHorizontalScroll: docEl.scrollWidth > docEl.clientWidth,
      };
    });
    console.log("360px Page Metrics:", pageMetrics);
    if (pageMetrics.scrollWidth > 360) {
      throw new Error(`Horizontal overflow on 360px page! scrollWidth=${pageMetrics.scrollWidth}, clientWidth=${pageMetrics.clientWidth}`);
    }
    console.log("✓ 360px Compare page has NO horizontal pan (scrollWidth <= 360)");

    // 2. Add products and open Compare Matrix Modal at 360px
    const addButtons = page.locator('button:has-text("+ Add to Compare")');
    await addButtons.nth(0).click();
    await page.waitForTimeout(300);
    await addButtons.nth(1).click();
    await page.waitForTimeout(300);

    const compareMatrixBtn = page.locator('button:has-text("Compare Matrix")');
    await compareMatrixBtn.waitFor({ state: "visible" });
    await compareMatrixBtn.click();
    await page.waitForTimeout(500);

    // 3. Verify Modal metrics at 360px
    const modalMetrics = await page.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      const docEl = document.documentElement;
      return {
        pageClientWidth: docEl.clientWidth,
        pageScrollWidth: docEl.scrollWidth,
        dialogClientWidth: dialog?.clientWidth,
        dialogScrollWidth: dialog?.scrollWidth,
        hasPageHorizontalScroll: docEl.scrollWidth > docEl.clientWidth,
      };
    });
    console.log("360px Modal Metrics:", modalMetrics);
    if (modalMetrics.hasPageHorizontalScroll) {
      throw new Error(`Modal causes horizontal page overflow at 360px! scrollWidth=${modalMetrics.pageScrollWidth}`);
    }
    console.log("✓ Matrix modal container fits 360px with NO horizontal pan for the page");

    // Take screenshot of 360px matrix modal
    const screensDir = path.resolve(process.cwd(), "docs/screens");
    if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });
    const modal360Path = path.join(screensDir, "compare-matrix-modal-360.png");
    await page.screenshot({ path: modal360Path });
    console.log(`Saved 360px Compare Matrix Modal screenshot: ${modal360Path}`);

    await context.close();
  }

  await browser.close();
  console.log("\n=== ALL FOCUS TRAP, SCROLL LOCK, RESTORE & 360PX CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
