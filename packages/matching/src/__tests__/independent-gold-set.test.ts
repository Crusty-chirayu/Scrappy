import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Product } from "@scrappy/core";
import {
  DeterministicMatchingEngine,
  MatchingBenchmarkHarness,
  GroundTruthPair,
} from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GoldSetArtifact {
  version: string;
  generatedAt: string;
  metadata: {
    totalCatalogProducts: number;
    totalGoldSetPairs: number;
    taxonomyBreakdown: Record<string, number>;
  };
  catalog: Product[];
  goldSet: Array<
    GroundTruthPair & {
      category: string;
      taxonomy: string;
      description: string;
    }
  >;
}

describe("G8: Adversarial Gold Set (350+ Pairs) Benchmark", () => {
  const fixturePath = path.join(__dirname, "..", "..", "fixtures", "independent-gold-set.json");
  const rawData = fs.readFileSync(fixturePath, "utf-8");
  const artifact: GoldSetArtifact = JSON.parse(rawData);

  const { catalog, goldSet } = artifact;

  it("loads 300+ independent pairs and 30 catalog products", () => {
    expect(catalog.length).toBeGreaterThanOrEqual(30);
    expect(goldSet.length).toBeGreaterThanOrEqual(300);
    expect(goldSet.length).toBe(350);
  });

  it("achieves 100% precision and ZERO false positives across all 350 adversarial pairs", async () => {
    const engine = new DeterministicMatchingEngine(catalog);
    const harness = new MatchingBenchmarkHarness(engine);

    const overallMetrics = await harness.evaluate(catalog, goldSet);

    // Compute metrics breakdown per error taxonomy
    const taxonomyMetrics: Record<
      string,
      {
        total: number;
        tp: number;
        tn: number;
        fp: number;
        fn: number;
        precision: string;
        recall: string;
      }
    > = {};

    for (const pair of goldSet) {
      const tax = pair.taxonomy;
      if (!taxonomyMetrics[tax]) {
        taxonomyMetrics[tax] = { total: 0, tp: 0, tn: 0, fp: 0, fn: 0, precision: "N/A", recall: "N/A" };
      }

      const candidates = await engine.findCandidateMatches(pair.offer);
      const decision = engine.resolveMatch(pair.offer, candidates);
      const predicted = decision.productId;
      const expected = pair.expectedProductId;

      taxonomyMetrics[tax].total++;

      if (expected !== null) {
        if (predicted === expected) {
          taxonomyMetrics[tax].tp++;
        } else if (predicted === null) {
          taxonomyMetrics[tax].fn++;
        } else {
          taxonomyMetrics[tax].fp++;
        }
      } else {
        if (predicted === null) {
          taxonomyMetrics[tax].tn++;
        } else {
          taxonomyMetrics[tax].fp++;
        }
      }
    }

    for (const stats of Object.values(taxonomyMetrics)) {
      const prec = stats.tp + stats.fp > 0 ? (stats.tp / (stats.tp + stats.fp)) * 100 : 100;
      const rec = stats.tp + stats.fn > 0 ? (stats.tp / (stats.tp + stats.fn)) * 100 : 100;
      stats.precision = `${prec.toFixed(1)}%`;
      stats.recall = `${rec.toFixed(1)}%`;
    }

    console.info("\n=== ADVERSARIAL GOLD SET ERROR TAXONOMY BENCHMARK RESULTS ===");
    console.info(JSON.stringify(taxonomyMetrics, null, 2));

    console.info("\n=== AGGREGATED METRICS (Constitution Rule 4) ===");
    console.info(JSON.stringify({
      "Total Evaluated Pairs": overallMetrics.totalPairs,
      "True Positives (Correct Matches)": overallMetrics.truePositives,
      "True Negatives (Traps Successfully Deflected)": overallMetrics.trueNegatives,
      "False Positives (Disastrous Merges)": overallMetrics.falsePositives,
      "False Negatives (Missed / Review Queue)": overallMetrics.falseNegatives,
      "Precision": `${(overallMetrics.precision * 100).toFixed(2)}%`,
      "Recall": `${(overallMetrics.recall * 100).toFixed(2)}%`,
      "F1 Score": `${(overallMetrics.f1Score * 100).toFixed(2)}%`,
      "False Positive Rate": `${(overallMetrics.falsePositiveRate * 100).toFixed(2)}%`,
    }, null, 2));

    // Constitution Rule 4: A false product match is worse than a missed match.
    // ZERO FALSE POSITIVES ALLOWED:
    expect(overallMetrics.falsePositives).toBe(0);
    expect(overallMetrics.falsePositiveRate).toBe(0.0);
    expect(overallMetrics.precision).toBe(1.0);

    // Verify positive pairs matched with high recall
    expect(overallMetrics.truePositives).toBeGreaterThanOrEqual(115);
    // Verify adversarial negative traps safely rejected
    expect(overallMetrics.trueNegatives).toBeGreaterThanOrEqual(220);
  });
});
