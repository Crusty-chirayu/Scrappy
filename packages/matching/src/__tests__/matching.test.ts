import { describe, it, expect } from "vitest";
import { DeterministicMatchingEngine } from "../engine.js";
import { Product } from "@scrappy/core";

describe("Entity Matching Engine", () => {
  const mockProduct: Product = {
    id: "prod-sony-wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: "Audio",
    model: "WH-1000XM5",
    ean: "4548736132566",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const engine = new DeterministicMatchingEngine([mockProduct]);

  it("retrieves candidates by direct EAN match", async () => {
    const candidates = await engine.findCandidateMatches({
      title: "Sony Headphones",
      ean: "4548736132566",
      sourceUrl: "https://amazon.in/dp/B09XS7JWHH",
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.id).toBe("prod-sony-wh1000xm5");
  });

  it("retrieves candidates by title token similarity", async () => {
    const candidates = await engine.findCandidateMatches({
      title: "Sony WH-1000XM5 Noise Cancelling Black",
      sourceUrl: "https://flipkart.com/sony-headphones",
    });
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]?.id).toBe("prod-sony-wh1000xm5");
  });

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

  it("matches when brand and model match exactly", () => {
    const decision = engine.resolveMatch(
      {
        title: "Sony Over-Ear Headphones WH-1000XM5 Black Edition",
        brand: "Sony",
        model: "WH-1000XM5",
        sourceUrl: "https://flipkart.com/sony-wh1000xm5",
      },
      [mockProduct],
    );

    expect(decision.productId).toBe("prod-sony-wh1000xm5");
    expect(decision.confidenceLevel).toBe("matched");
    expect(decision.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("enforces Constitution Rule 4: marks as possible_match and does not merge silently when uncertain", () => {
    const decision = engine.resolveMatch(
      {
        title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        sourceUrl: "https://flipkart.com/sony-headphones-alt",
      },
      [mockProduct],
    );

    expect(decision.productId).toBeNull(); // Never merged silently!
    expect(decision.confidenceLevel).toBe("possible_match");
    expect(decision.confidence).toBeGreaterThan(0.5);
  });
});
