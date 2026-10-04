import { Product, ConfidenceLevel } from "@scrappy/core";

export interface CandidateOffer {
  title: string;
  brand?: string;
  model?: string;
  ean?: string;
  upc?: string;
  sku?: string;
  sourceUrl: string;
}

export interface MatchDecision {
  productId: string | null;
  confidence: number; // 0.0 to 1.0
  confidenceLevel: ConfidenceLevel;
  reasons: string[];
  matchedFields: {
    exactEanOrUpc?: boolean;
    brandMatch?: boolean;
    titleSimilarity?: number;
    modelMatch?: boolean;
  };
}

export interface EntityMatchingEngine {
  findCandidateMatches(offer: CandidateOffer): Promise<Product[]>;
  resolveMatch(offer: CandidateOffer, candidates: Product[]): MatchDecision;
}
