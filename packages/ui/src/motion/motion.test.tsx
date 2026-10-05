import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NumberTick } from "./NumberTick.js";
import { HoldToConfirmButton } from "./HoldToConfirmButton.js";
import { Accordion } from "./Accordion.js";
import { StaggerList } from "./StaggerList.js";

describe("Motion Components Suite (Slice B)", () => {
  it("renders NumberTick with formatted rupee currency and polite aria-live", () => {
    const html = renderToStaticMarkup(<NumberTick value={12499} previousValue={14999} />);
    expect(html).toContain("12,499");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("₹");
  });

  it("renders HoldToConfirmButton with proper aria-label and accessible touch target", () => {
    const html = renderToStaticMarkup(<HoldToConfirmButton onConfirm={() => {}} label="Delete watch rule" />);
    expect(html).toContain("Delete watch rule");
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("min-h-[44px]");
  });

  it("renders Accordion with collapsible panels and correct ARIA states", () => {
    const items = [
      { id: "1", title: "How fresh is data?", content: "Observed within 120 seconds." },
      { id: "2", title: "Can I track price history?", content: "Up to 365 days of granular history." },
    ];
    const html = renderToStaticMarkup(<Accordion items={items} />);
    expect(html).toContain("How fresh is data?");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("scrappy-accordion-grid");
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
});

