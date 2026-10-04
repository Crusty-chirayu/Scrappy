import { Product } from "@scrappy/core";
import { CandidateOffer, EntityMatchingEngine, MatchDecision } from "./types.js";

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1),
  );
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export class DeterministicMatchingEngine implements EntityMatchingEngine {
  private catalog: Product[] = [];

  constructor(catalog: Product[] = []) {
    this.catalog = catalog;
  }

  public setCatalog(catalog: Product[]): void {
    this.catalog = catalog;
  }

  public async findCandidateMatches(offer: CandidateOffer): Promise<Product[]> {
    if (this.catalog.length === 0) return [];

    // 1. Direct barcode lookup
    if (offer.ean) {
      const eanMatches = this.catalog.filter((c) => c.ean === offer.ean);
      if (eanMatches.length > 0) return eanMatches;
    }
    if (offer.upc) {
      const upcMatches = this.catalog.filter((c) => c.upc === offer.upc);
      if (upcMatches.length > 0) return upcMatches;
    }

    // 2. Token overlap lookup
    const offerTokens = tokenize(offer.title);
    return this.catalog.filter((p) => {
      const prodTokens = tokenize(p.title);
      const sim = jaccardSimilarity(offerTokens, prodTokens);
      return sim >= 0.3; // Return reasonable candidates
    });
  }

  public resolveMatch(offer: CandidateOffer, candidates: Product[]): MatchDecision {
    // 1. Exact Barcode Match (EAN / UPC) -> 0.99 Verified
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

    // 2. Exact Brand + Model Match -> 0.92 Matched
    if (offer.brand && offer.model) {
      const normBrand = offer.brand.toLowerCase();
      const normModel = offer.model.toLowerCase();
      const modelMatch = candidates.find(
        (c) =>
          c.brand?.toLowerCase() === normBrand &&
          (c.model?.toLowerCase() === normModel || c.title.toLowerCase().includes(normModel)),
      );
      if (modelMatch) {
        return {
          productId: modelMatch.id,
          confidence: 0.92,
          confidenceLevel: "matched",
          reasons: ["Exact Brand and Model identifier match"],
          matchedFields: { brandMatch: true, modelMatch: true },
        };
      }
    }

    // 3. Title Token Similarity
    const offerTokens = tokenize(offer.title);
    let bestCandidate: Product | null = null;
    let bestScore = 0;

    for (const c of candidates) {
      const prodTokens = tokenize(c.title);
      const score = jaccardSimilarity(offerTokens, prodTokens);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = c;
      }
    }

    // Token similarity >= 0.30 -> Possible Match (never merged silently - Constitution Rule 4)
    if (bestCandidate && bestScore >= 0.3) {
      return {
        productId: null, // do NOT auto-merge
        confidence: Math.round(bestScore * 100) / 100,
        confidenceLevel: "possible_match",
        reasons: [
          `Probable match against '${bestCandidate.title}' (similarity ${(bestScore * 100).toFixed(0)}%), pending verification`,
        ],
        matchedFields: { titleSimilarity: bestScore },
      };
    }

    // 4. Default: No match
    return {
      productId: null,
      confidence: 0.0,
      confidenceLevel: "possible_match",
      reasons: ["No unambiguous barcode or model match found; awaiting catalog candidate"],
      matchedFields: {},
    };
  }
}
