import { Product } from "@scrappy/core";
import { CandidateOffer, EntityMatchingEngine, MatchDecision } from "./types.js";

const ACCESSORY_KEYWORDS = new Set([
  "case",
  "cover",
  "protector",
  "screen",
  "sleeve",
  "strap",
  "cable",
  "charger",
  "dock",
  "stand",
  "holder",
  "skin",
  "pouch",
  "adapter",
  "replacement",
  "stylus",
  "cushion",
]);

const CONDITION_KEYWORDS = [
  "refurbished",
  "renewed",
  "pre-owned",
  "preowned",
  "open-box",
  "open box",
  "used",
  "grade b",
  "grade a",
];

const MODEL_MODIFIERS = [
  "pro max",
  "pro",
  "plus",
  "ultra",
  "mini",
  "max",
  "lite",
  "fe",
  "air",
  "se",
];

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

export function extractStorage(text: string): string[] {
  const matches = text.toLowerCase().match(/\b(\d+)\s*(gb|tb)\b/g);
  return matches ? matches.map((m) => m.replace(/\s+/g, "")) : [];
}

export function extractPackSize(text: string): number | null {
  const match = text.toLowerCase().match(/\b(?:pack of|set of)\s*(\d+)\b|\b(\d+)\s*(?:pack|pk)\b/);
  if (match) {
    return parseInt(match[1] || match[2] || "1", 10);
  }
  return null;
}

export function hasAccessorySignal(text: string): boolean {
  const tokens = text.toLowerCase().split(/[\s\-_,.\/]+/);
  return tokens.some((t) => ACCESSORY_KEYWORDS.has(t));
}

export function hasConditionSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return CONDITION_KEYWORDS.some((c) => lower.includes(c));
}

function extractModelModifier(text: string): string | null {
  const lower = text.toLowerCase();
  for (const mod of MODEL_MODIFIERS) {
    const regex = new RegExp(`\\b${mod}\\b`, "i");
    if (regex.test(lower)) return mod;
  }
  return null;
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

    // 2. Direct Brand & Model lookup
    if (offer.brand && offer.model) {
      const normBrand = offer.brand.toLowerCase();
      const normModel = offer.model.toLowerCase();
      const modelMatches = this.catalog.filter(
        (c) =>
          c.brand?.toLowerCase() === normBrand &&
          (c.model?.toLowerCase() === normModel || c.title.toLowerCase().includes(normModel)),
      );
      if (modelMatches.length > 0) return modelMatches;
    }

    // 3. Token overlap lookup
    const offerTokens = tokenize(offer.title);
    return this.catalog.filter((p) => {
      const prodTokens = tokenize(p.title);
      const sim = jaccardSimilarity(offerTokens, prodTokens);
      return sim >= 0.25; // Return candidates for evaluation
    });
  }

  public resolveMatch(offer: CandidateOffer, candidates: Product[]): MatchDecision {
    const offerIsAccessory = hasAccessorySignal(offer.title);
    const offerIsConditionAltered = hasConditionSignal(offer.title);
    const offerStorage = extractStorage(offer.title);
    const offerPack = extractPackSize(offer.title);
    const offerMod = extractModelModifier(offer.title);

    // 1. Exact Barcode Match (EAN / UPC) -> 0.99 Verified
    if (offer.ean || offer.upc) {
      const barcodeMatch = candidates.find(
        (c) => (offer.ean && c.ean === offer.ean) || (offer.upc && c.upc === offer.upc),
      );

      if (barcodeMatch) {
        // Even with barcode match, check for condition alteration (e.g. refurbished selling under original EAN)
        const candIsConditionAltered = hasConditionSignal(barcodeMatch.title);
        if (offerIsConditionAltered !== candIsConditionAltered) {
          return {
            productId: null,
            confidence: 0.65,
            confidenceLevel: "possible_match",
            reasons: ["Barcode matched but condition mismatch detected (refurbished/renewed vs new)"],
            matchedFields: { exactEanOrUpc: true, conditionMismatch: true },
          };
        }

        // Check accessory collision
        const candIsAccessory = hasAccessorySignal(barcodeMatch.title);
        if (offerIsAccessory !== candIsAccessory) {
          return {
            productId: null,
            confidence: 0.2,
            confidenceLevel: "possible_match",
            reasons: ["Barcode matched an accessory vs device entity"],
            matchedFields: { exactEanOrUpc: true, accessoryMismatch: true },
          };
        }

        return {
          productId: barcodeMatch.id,
          confidence: 0.99,
          confidenceLevel: "verified",
          reasons: ["Exact EAN/UPC barcode match verified"],
          matchedFields: { exactEanOrUpc: true, brandMatch: true },
        };
      }
    }

    // 2. Exact Brand + Model Match -> 0.92 Matched
    if (offer.brand && offer.model) {
      const normBrand = offer.brand.toLowerCase();
      const normModel = offer.model.toLowerCase();

      for (const cand of candidates) {
        const candBrand = cand.brand?.toLowerCase();
        const candModel = cand.model?.toLowerCase();

        if (candBrand === normBrand && (candModel === normModel || cand.title.toLowerCase().includes(normModel))) {
          // Check adversarial guards:
          // A. Accessory Guard
          const candIsAccessory = hasAccessorySignal(cand.title);
          if (offerIsAccessory !== candIsAccessory) {
            continue; // Not a match
          }

          // B. Condition Guard
          const candIsConditionAltered = hasConditionSignal(cand.title);
          if (offerIsConditionAltered !== candIsConditionAltered) {
            continue;
          }

          // C. Storage Guard
          const candStorage = extractStorage(cand.title);
          if (offerStorage.length > 0 && candStorage.length > 0) {
            const storIntersect = offerStorage.some((s) => candStorage.includes(s));
            if (!storIntersect) {
              continue; // Different capacity variant
            }
          }

          // D. Pack Size Guard
          const candPack = extractPackSize(cand.title);
          if ((offerPack || 1) !== (candPack || 1)) {
            continue; // Different pack count
          }

          // E. Model Modifier Guard (e.g. Plus, Pro, Ultra, Mini)
          const candMod = extractModelModifier(cand.title);
          if (offerMod !== candMod) {
            continue; // Different tier variant (e.g. iPhone 15 vs iPhone 15 Plus)
          }

          return {
            productId: cand.id,
            confidence: 0.92,
            confidenceLevel: "matched",
            reasons: ["Exact Brand and Model identifier verified with variant guards passed"],
            matchedFields: { brandMatch: true, modelMatch: true },
          };
        }
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
          `Probable match against '${bestCandidate.title}' (similarity ${(bestScore * 100).toFixed(0)}%), pending human verification`,
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
