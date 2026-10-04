import { describe, it, expect } from "vitest";
import {
  generateRankedSelectors,
  calculateResilienceScore,
  extractRecordsFromHtml,
  applyTransforms,
  transitionState,
  InvalidStateTransitionError,
  exportToCsv,
  exportToJson,
  exportToNdjson,
  ExtractorField,
} from "../extract/index.js";

describe("Extract Engine: Selector Engine", () => {
  it("scores selector resilience correctly", () => {
    expect(calculateResilienceScore("[data-testid=price]")).toBe(95);
    expect(calculateResilienceScore("#product-title")).toBe(85);
    expect(calculateResilienceScore(".price-block")).toBe(75);
    expect(calculateResilienceScore("div.product > span")).toBe(60);
    expect(calculateResilienceScore("div:nth-child(2) > span")).toBe(35);
  });

  it("generates ranked selectors prioritizing data attributes and stable ids", () => {
    const chain = generateRankedSelectors(
      "span",
      {
        "data-price": "199900",
        id: "deal-price",
        class: "a-price-whole p-2",
      },
      "₹1,999",
    );

    expect(chain.primary).toBe('[data-price="199900"]');
    expect(chain.fallback1).toBe("#deal-price");
    expect(chain.resilienceScore).toBe(95);
    expect(chain.textAnchor).toBe("₹1,999");
  });

  it("extracts structured records with fallback chain and diagnostics", () => {
    const sampleHtml = `
      <div class="product-item">
        <h2 data-title="MacBook Air M2">Apple MacBook Air M2</h2>
        <span class="price">₹99,990</span>
        <a class="product-link" href="/dp/B0CX123">View Product</a>
      </div>
      <div class="product-item">
        <h2 class="legacy-title">Dell XPS 13</h2>
        <span class="price-fallback">₹1,14,990</span>
        <a class="product-link" href="/dp/B0DY456">View Product</a>
      </div>
    `;

    const fields: ExtractorField[] = [
      {
        id: "f1",
        name: "title",
        type: "string",
        required: true,
        selectors: {
          primary: "[data-title]",
          fallback1: ".legacy-title",
          resilienceScore: 95,
        },
        transforms: [{ type: "trim" }],
      },
      {
        id: "f2",
        name: "pricePaise",
        type: "currency",
        required: true,
        selectors: {
          primary: ".price",
          fallback1: ".price-fallback",
          resilienceScore: 75,
        },
        transforms: [{ type: "parse_currency_paise" }],
      },
      {
        id: "f3",
        name: "url",
        type: "url",
        required: true,
        selectors: {
          primary: ".product-link",
          resilienceScore: 75,
        },
        transforms: [{ type: "absolute_url" }],
      },
    ];

    const { records, diagnostics } = extractRecordsFromHtml(
      sampleHtml,
      fields,
      ".product-item",
      "https://example.com",
    );

    expect(records.length).toBe(2);

    // Row 1
    expect(records[0]?.title).toBe("Apple MacBook Air M2");
    expect(records[0]?.pricePaise).toBe(9999000);
    expect(records[0]?.url).toBe("https://example.com/dp/B0CX123");

    // Row 2 (tested fallback selector)
    expect(records[1]?.title).toBe("Dell XPS 13");
    expect(records[1]?.pricePaise).toBe(11499000);
    expect(records[1]?.url).toBe("https://example.com/dp/B0DY456");

    // Diagnostics
    expect(diagnostics.length).toBe(3);
    const titleDiag = diagnostics.find((d) => d.fieldName === "title");
    expect(titleDiag?.fillRatePercent).toBe(100);
    expect(titleDiag?.extractedCount).toBe(2);
  });
});

describe("Extract Engine: Field Transforms", () => {
  it("applies transforms cleanly", () => {
    expect(applyTransforms("   hello world   ", [{ type: "trim" }])).toBe("hello world");
    expect(applyTransforms("₹45,999.00", [{ type: "parse_currency_paise" }])).toBe(4599900);
    expect(applyTransforms("1,250 items", [{ type: "parse_number" }])).toBe(1250);
    expect(
      applyTransforms("/item/123", [{ type: "absolute_url" }], "https://store.in/catalog/"),
    ).toBe("https://store.in/item/123");
    expect(
      applyTransforms("Model: SKU-9988", [
        { type: "regex_replace", param: "Model: ///" },
        { type: "trim" },
      ]),
    ).toBe("SKU-9988");
  });
});

describe("Extract Engine: Run State Machine", () => {
  it("allows valid transitions", () => {
    let state = transitionState("DRAFT", "VALIDATING");
    expect(state).toBe("VALIDATING");

    state = transitionState(state, "QUEUED");
    expect(state).toBe("QUEUED");

    state = transitionState(state, "RUNNING");
    expect(state).toBe("RUNNING");

    state = transitionState(state, "SUCCEEDED");
    expect(state).toBe("SUCCEEDED");
  });

  it("rejects illegal transitions", () => {
    expect(() => transitionState("SUCCEEDED", "RUNNING")).toThrow(InvalidStateTransitionError);
    expect(() => transitionState("DRAFT", "SUCCEEDED")).toThrow(InvalidStateTransitionError);
    expect(() => transitionState("CANCELLED", "QUEUED")).toThrow(InvalidStateTransitionError);
  });
});

describe("Extract Engine: Exporters", () => {
  const data = [
    { id: "1", title: "Widget A, Deluxe", price: 100 },
    { id: "2", title: 'Widget "Super"', price: 200 },
  ];

  it("exports valid RFC 4180 CSV with quotes", () => {
    const csv = exportToCsv(data);
    expect(csv).toContain("id,title,price");
    expect(csv).toContain('1,"Widget A, Deluxe",100');
    expect(csv).toContain('2,"Widget ""Super""",200');
  });

  it("exports valid JSON and NDJSON", () => {
    const json = exportToJson(data, false);
    expect(JSON.parse(json)).toEqual(data);

    const ndjson = exportToNdjson(data);
    const lines = ndjson.split("\n");
    expect(lines.length).toBe(2);
    expect(JSON.parse(lines[0] || "{}")).toEqual(data[0]);
  });
});
