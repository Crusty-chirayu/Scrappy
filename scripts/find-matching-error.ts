import fs from "node:fs";
import { DeterministicMatchingEngine } from "../packages/matching/src/index.js";

const data = JSON.parse(
  fs.readFileSync("./packages/matching/fixtures/independent-gold-set.json", "utf8")
);
const engine = new DeterministicMatchingEngine(data.catalog);

async function findErrors() {
  const errors: Array<Record<string, unknown>> = [];
  for (const pair of data.goldSet) {
    const candidates = await engine.findCandidateMatches(pair.offer);
    const decision = engine.resolveMatch(pair.offer, candidates);
    const predicted = decision.productId;
    const expected = pair.expectedProductId;

    if (expected !== null && predicted !== expected) {
      errors.push({
        type: "False Negative",
        title: pair.offer.title,
        expectedProductId: expected,
        predictedProductId: predicted,
        decision: decision.decision,
        confidence: decision.confidenceScore,
        taxonomy: pair.taxonomy,
        notes: pair.description,
      });
    } else if (expected === null && predicted !== null) {
      errors.push({
        type: "False Positive",
        title: pair.offer.title,
        expectedProductId: expected,
        predictedProductId: predicted,
        decision: decision.decision,
        confidence: decision.confidenceScore,
        taxonomy: pair.taxonomy,
        notes: pair.description,
      });
    }
  }

  console.info("TOTAL ERRORS FOUND:", errors.length);
  console.info(JSON.stringify(errors, null, 2));
}

findErrors();
