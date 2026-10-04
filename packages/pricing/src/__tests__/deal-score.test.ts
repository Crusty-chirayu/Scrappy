import { describe, it, expect } from "vitest";
import { calculateDealScore } from "../deal-score.js";
import { PriceStats } from "../types.js";

describe("Pricing & Deal Score Engine", () => {
  const sampleStats: PriceStats = {
    productId: "prod-iphone-15",
    minPricePaise: 6999900,
    maxPricePaise: 7999900,
    avgPricePaise: 7500000,
    medianPricePaise: 7499900,
    currentLowestPaise: 6999900,
    allTimeLowPaise: 6999900,
    sampleCount: 45,
  };

  it("identifies all-time low and awards high score", () => {
    const deal = calculateDealScore(6899900, sampleStats);
    expect(deal.isAllTimeLow).toBe(true);
    expect(deal.score).toBeGreaterThanOrEqual(80);
    expect(deal.grade).toBe("EXCEPTIONAL");
  });

  it("flags sudden severe price drop as potential anomaly", () => {
    // 5,000 rupees on a 75,000 phone is likely an anomaly or mispriced item
    const deal = calculateDealScore(500000, sampleStats);
    expect(deal.isAnomaly).toBe(true);
  });
});
