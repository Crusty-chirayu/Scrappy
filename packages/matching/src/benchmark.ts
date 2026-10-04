import { Product } from "@scrappy/core";
import { DeterministicMatchingEngine } from "./engine.js";
import { CandidateOffer } from "./types.js";

export interface GroundTruthPair {
  id: string;
  offer: CandidateOffer;
  expectedProductId: string | null; // null if offer should NOT match any product
  description: string;
}

export interface BenchmarkMetrics {
  totalPairs: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number; // Disastrous in Scrappy: false merge
  falseNegatives: number; // Sent to review or missed
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
}

export class MatchingBenchmarkHarness {
  constructor(private engine: DeterministicMatchingEngine) {}

  public async evaluate(
    catalog: Product[],
    groundTruth: GroundTruthPair[],
  ): Promise<BenchmarkMetrics> {
    this.engine.setCatalog(catalog);

    let tp = 0;
    let tn = 0;
    let fp = 0;
    let fn = 0;

    for (const pair of groundTruth) {
      const candidates = await this.engine.findCandidateMatches(pair.offer);
      const decision = this.engine.resolveMatch(pair.offer, candidates);

      const predictedId = decision.productId;
      const expectedId = pair.expectedProductId;

      if (expectedId !== null) {
        // Should have matched expectedId
        if (predictedId === expectedId) {
          tp++;
        } else if (predictedId === null) {
          fn++;
        } else {
          // Matched the wrong product!
          fp++;
        }
      } else {
        // Should NOT have matched anything
        if (predictedId === null) {
          tn++;
        } else {
          // False match!
          fp++;
        }
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const falsePositiveRate = fp + tn > 0 ? fp / (fp + tn) : 0;

    return {
      totalPairs: groundTruth.length,
      truePositives: tp,
      trueNegatives: tn,
      falsePositives: fp,
      falseNegatives: fn,
      precision,
      recall,
      f1Score,
      falsePositiveRate,
    };
  }
}
