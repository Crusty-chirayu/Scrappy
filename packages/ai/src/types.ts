export interface AISummaryRequest {
  productTitle: string;
  pricePaise: number;
  allTimeLowPaise: number;
  sourcesCount: number;
  dealExplanation: string;
}

export interface AISummaryResponse {
  summary: string;
  source: "model" | "deterministic_fallback";
  modelUsed?: string;
  cached: boolean;
}

export interface AIProvider {
  summarizeDeal(request: AISummaryRequest): Promise<AISummaryResponse>;
}
