import { describe, it, expect } from "vitest";
import { calculateDealScore } from "../deal-score.js";
import { analyzeFakeDiscount } from "../fake-discount.js";
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

  describe("Fake Discount Detector", () => {
    it("detects inflated MRP with exaggerated discount", () => {
      // Current: ₹70,000, Claimed MRP: ₹1,10,000, Actual 90d median: ₹75,000
      const analysis = analyzeFakeDiscount(7000000, 11000000, 7500000);
      expect(analysis.isFakeDiscount).toBe(true);
      expect(analysis.claimedDiscountPercent).toBe(36); // claimed -36%
      expect(analysis.realDiscountPercent).toBe(7); // real -7%
      expect(analysis.verdict).toContain("Inflated MRP");
    });

    it("verifies genuine discount when MRP matches historical norms", () => {
      // Current: ₹60,000, Claimed MRP: ₹75,000, Actual 90d median: ₹75,000
      const analysis = analyzeFakeDiscount(6000000, 7500000, 7500000);
      expect(analysis.isFakeDiscount).toBe(false);
      expect(analysis.realDiscountPercent).toBe(20);
      expect(analysis.claimedDiscountPercent).toBe(20);
      expect(analysis.verdict).toBe("Genuine discount");
    });
  });
});
