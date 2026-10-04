import { Product } from "@scrappy/core";
import { CandidateOffer, EntityMatchingEngine, MatchDecision } from "./types.js";

export class DeterministicMatchingEngine implements EntityMatchingEngine {
  public async findCandidateMatches(_offer: CandidateOffer): Promise<Product[]> {
    // In Prompt 01 foundation: returns candidate collection stub
    return [];
  }

  public resolveMatch(offer: CandidateOffer, candidates: Product[]): MatchDecision {
    // Rule: Exact EAN / UPC match gives highest confidence
    if (offer.ean) {
      const eanMatch = candidates.find((c) => c.ean && c.ean === offer.ean);
      if (eanMatch) {
        return {
          productId: eanMatch.id,
          confidence: 0.99,
          confidenceLevel: "verified",
          reasons: ["Exact EAN barcode match"],
          matchedFields: { exactEanOrUpc: true, brandMatch: true },
        };
      }
    }

    if (offer.upc) {
      const upcMatch = candidates.find((c) => c.upc && c.upc === offer.upc);
      if (upcMatch) {
        return {
          productId: upcMatch.id,
          confidence: 0.99,
          confidenceLevel: "verified",
          reasons: ["Exact UPC barcode match"],
          matchedFields: { exactEanOrUpc: true, brandMatch: true },
        };
      }
    }

    // Conservative default: if confidence < 0.90, do not silently merge
    return {
      productId: null,
      confidence: 0.0,
      confidenceLevel: "possible_match",
      reasons: ["No unambiguous barcode match found; awaiting manual or probabilistic review"],
      matchedFields: {},
    };
  }
}
