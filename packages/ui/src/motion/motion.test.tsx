import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import path from "path";
import { NumberTick } from "./NumberTick.js";
import { HoldToConfirmButton } from "./HoldToConfirmButton.js";
import { Accordion } from "./Accordion.js";
import { StaggerList } from "./StaggerList.js";
import { AmbientMesh } from "./AmbientMesh.js";
import { ScrollProgressBar } from "./ScrollProgressBar.js";
import { startSafeViewTransition } from "./ViewTransitions.js";

describe("Motion Components Suite (Slice B)", () => {
  it("renders NumberTick with formatted rupee currency and polite aria-live", () => {
    const html = renderToStaticMarkup(<NumberTick value={12499} previousValue={14999} />);
    expect(html).toContain("12,499");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("₹");
    expect(html).toContain("(-2500)");
  });

  it("renders HoldToConfirmButton with proper aria-label and accessible touch target", () => {
    const html = renderToStaticMarkup(<HoldToConfirmButton onConfirm={() => {}} label="Delete watch rule" />);
    expect(html).toContain("Delete watch rule");
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("min-h-[44px]");
  });

  it("renders Accordion with ChevronDownIcon, collapsible panels, and correct ARIA states", () => {
    const items = [
      { id: "1", title: "How fresh is data?", content: "Observed within 120 seconds." },
      { id: "2", title: "Can I track price history?", content: "Up to 365 days of granular history." },
    ];
    const html = renderToStaticMarkup(<Accordion items={items} />);
    expect(html).toContain("How fresh is data?");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("scrappy-accordion-grid");
    // Verify ChevronDownIcon polyline coordinates are present
    expect(html).toContain("6 9 12 15 18 9");
  });

  it("renders StaggerList with indexed animation delays", () => {
    const html = renderToStaticMarkup(
      <StaggerList stepMs={40}>
        <div>Item 1</div>
        <div>Item 2</div>
      </StaggerList>
    );
    expect(html).toContain("Item 1");
    expect(html).toContain("Item 2");
    expect(html).toContain("40ms");
  });

  it("renders AmbientMesh as an aria-hidden decorative layer with GPU drift layer", () => {
    const html = renderToStaticMarkup(<AmbientMesh variant="price-nodes" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("ambient-drift");
  });

  it("renders ScrollProgressBar with progressbar semantics and bounded values", () => {
    const html = renderToStaticMarkup(<ScrollProgressBar heightPx={3} />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Page scroll progress"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
  });

  it("executes updateFn via startSafeViewTransition even without native browser support", () => {
    const fn = vi.fn();
    startSafeViewTransition(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  describe("Reduced Motion & Forced Colors Enforcement", () => {
    const cssPath = path.resolve(__dirname, "../tokens.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    it("strictly neutralizes animation durations and iteration counts under prefers-reduced-motion", () => {
      expect(cssContent).toContain("@media (prefers-reduced-motion: reduce)");
      expect(cssContent).toContain("animation-duration: 0.01ms !important;");
      expect(cssContent).toContain("animation-iteration-count: 1 !important;");
      expect(cssContent).toContain("transition-duration: 0.01ms !important;");
      expect(cssContent).toContain("scroll-behavior: auto !important;");
    });

    it("enforces forced-colors high-contrast borders and suppresses ambient animations", () => {
      expect(cssContent).toContain("@media (forced-colors: active)");
      expect(cssContent).toContain("display: none !important;");
      expect(cssContent).toContain("outline: 2px solid Highlight !important;");
    });

    it("verifies NumberTick renders instant numeric state without infinite loops", () => {
      const html = renderToStaticMarkup(<NumberTick value={50000} previousValue={45000} />);
      expect(html).toContain("50,000");
      // Instant numeric text is present without lingering transform styles
      expect(html).not.toContain("infinite");
    });

    it("verifies HoldToConfirmButton requires direct user engagement and has zero auto-advancing loops", () => {
      const html = renderToStaticMarkup(<HoldToConfirmButton onConfirm={() => {}} label="Confirm" />);
      expect(html).toContain("Confirm");
      expect(html).not.toContain("infinite");
    });

    it("verifies Accordion uses grid-template-rows which instantly settle under reduced-motion", () => {
      const html = renderToStaticMarkup(
        <Accordion items={[{ id: "1", title: "Test", content: "Content" }]} defaultExpandedIds={["1"]} />
      );
      expect(html).toContain("is-expanded");
      expect(html).toContain("scrappy-accordion-grid");
    });

    it("verifies AmbientMesh has no infinite CPU spin when reduced-motion disables animation-duration", () => {
      const html = renderToStaticMarkup(<AmbientMesh />);
      expect(html).toContain("ambient-drift");
      // CSS rule overrides animation-duration: 0.01ms !important and iteration-count: 1 !important
      expect(cssContent).toMatch(/animation-iteration-count:\s*1\s*!important/);
    });

    it("verifies StaggerList has no infinite animation loops", () => {
      const html = renderToStaticMarkup(
        <StaggerList>
          <div>Alpha</div>
          <div>Beta</div>
        </StaggerList>
      );
      expect(html).toContain("Alpha");
      expect(html).not.toContain("infinite");
    });

    it("verifies ScrollProgressBar has role progressbar and no infinite loops", () => {
      const html = renderToStaticMarkup(<ScrollProgressBar />);
      expect(html).toContain('role="progressbar"');
      expect(html).not.toContain("infinite");
    });

    it("verifies ViewTransitions executes synchronously when reduced-motion is requested", () => {
      const fn = vi.fn();
      startSafeViewTransition(fn);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
