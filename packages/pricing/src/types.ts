export interface PriceStats {
  productId: string;
  minPricePaise: number;
  maxPricePaise: number;
  avgPricePaise: number;
  medianPricePaise: number;
  currentLowestPaise: number;
  allTimeLowPaise: number;
  sampleCount: number;
}

export type DealGrade = "EXCEPTIONAL" | "GREAT" | "GOOD" | "AVERAGE" | "OVERPRICED";

export interface DealScoreResult {
  score: number; // 0 to 100
  grade: DealGrade;
  discountPercentage: number;
  isAllTimeLow: boolean;
  isAnomaly: boolean;
  explanation: string;
}
