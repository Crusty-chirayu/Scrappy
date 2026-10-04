import { describe, it, expect } from "vitest";
import { DeterministicMatchingEngine } from "../engine.js";
import { Product } from "@scrappy/core";

describe("Entity Matching Engine", () => {
  const engine = new DeterministicMatchingEngine();

  const mockProduct: Product = {
    id: "prod-sony-wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: "Audio",
    ean: "4548736132566",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("verifies match when EAN matches exactly", () => {
    const decision = engine.resolveMatch(
      {
        title: "Sony WH-1000XM5 Noise Cancelling (Black)",
        ean: "4548736132566",
        sourceUrl: "https://amazon.in/dp/B09XS7JWHH",
      },
      [mockProduct],
    );

    expect(decision.productId).toBe("prod-sony-wh1000xm5");
    expect(decision.confidenceLevel).toBe("verified");
    expect(decision.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it("refuses to merge silently when uncertain", () => {
    const decision = engine.resolveMatch(
      {
        title: "Sony WH-1000XM4 (Previous Gen)",
        sourceUrl: "https://flipkart.com/sony-headphones",
      },
      [mockProduct],
    );

    expect(decision.productId).toBeNull();
    expect(decision.confidenceLevel).toBe("possible_match");
  });
});
