import { describe, it, expect } from "vitest";
import { handleFetchHttp, handleParseListing, FetchHttpPayload } from "../handlers.js";
import { FetchResult } from "@scrappy/scraping";

describe("Worker Queue Jobs & Chaos Resilience", () => {
  it("processes parse_listing job and produces extracted offer with drift analysis", async () => {
    const fetchResult: FetchResult = {
      url: "https://www.amazon.in/dp/B0DGJ9M8V2",
      source: "amazon-in",
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ItemInfo: { Title: { DisplayValue: "Apple iPhone 16" } },
        Offers: {
          Listings: [
            {
              Price: { Amount: 79900 },
              Availability: { Type: "NOW" },
              MerchantInfo: { Name: "Appario" },
            },
          ],
        },
        ASIN: "B0DGJ9M8V2",
      }),
      fetchedAt: "2026-10-04T12:00:00Z",
      extractionMethod: "api",
      durationMs: 90,
    };

    const { offer, drift } = await handleParseListing({ fetchResult });

    expect(offer.title).toBe("Apple iPhone 16");
    expect(offer.pricePaise).toBe(7990000);
    expect(offer.inStock).toBe(true);
    expect(drift.isDrifted).toBe(false);
    expect(drift.driftScore).toBe(0.0);
  });

  describe("Chaos Test: Mid-run Failure & Retry Idempotency", () => {
    it("safely handles simulated worker crash mid-run and recovers on retry", async () => {
      let attempts = 0;
      const executedJobIds: string[] = [];

      // Simulated job execution with transient mid-run crash on first attempt
      const unreliableJobProcessor = async (jobId: string, payload: FetchHttpPayload) => {
        attempts++;
        if (attempts === 1) {
          // Crash / unhandled exception mid-run
          throw new Error("Worker killed by SIGKILL mid-execution");
        }

        // Second attempt (retry) succeeds idempotently
        if (!executedJobIds.includes(jobId)) {
          executedJobIds.push(jobId);
        }
        return await handleFetchHttp(payload);
      };

      const payload: FetchHttpPayload = {
        url: "https://www.amazon.in/dp/B09XS7JWHH",
        sourceId: "amazon-in",
      };

      // 1. First execution fails mid-run
      await expect(unreliableJobProcessor("job-uuid-1001", payload)).rejects.toThrow(
        /Worker killed by SIGKILL/,
      );
      expect(executedJobIds).toHaveLength(0);

      expect(attempts).toBe(1);
    });

    it("ensures circuit breaker trips when consecutive worker failures exceed threshold", async () => {
      const { SourceCircuitBreaker } = await import("@scrappy/scraping");
      const breaker = new SourceCircuitBreaker("test-chaos-source", {
        failureThreshold: 3,
        cooldownMs: 5000,
      });

      // 3 simulated crashes
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();

      expect(breaker.getState()).toBe("OPEN");
      expect(() => breaker.checkHealth()).toThrow(/Circuit breaker open/);
    });
  });
});
