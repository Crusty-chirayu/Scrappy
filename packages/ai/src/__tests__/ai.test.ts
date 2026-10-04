import { describe, it, expect } from "vitest";
import { FallbackSafeAIClient } from "../provider.js";

describe("AI Fallback Layer", () => {
  it("generates deterministic fallback summary without network or API key", async () => {
    const ai = new FallbackSafeAIClient();
    const result = await ai.summarizeDeal({
      productTitle: "MacBook Air M2",
      pricePaise: 8990000,
      allTimeLowPaise: 8990000,
      sourcesCount: 3,
      dealExplanation: "15% below average",
    });

    expect(result.source).toBe("deterministic_fallback");
    expect(result.summary).toContain("MacBook Air M2");
    expect(result.summary).toContain("₹89,900");
  });
});
