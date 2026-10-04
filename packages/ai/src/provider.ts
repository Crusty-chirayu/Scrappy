import { formatINR } from "@scrappy/core";
import { AIProvider, AISummaryRequest, AISummaryResponse } from "./types.js";

export class FallbackSafeAIClient implements AIProvider {
  constructor(private readonly apiKey?: string) {}

  public async summarizeDeal(request: AISummaryRequest): Promise<AISummaryResponse> {
    // If no API key or in offline/fallback mode, generate deterministic summary
    if (!this.apiKey) {
      return this.generateDeterministicFallback(request);
    }

    try {
      // In Prompt 01 foundation: fallback-safe call
      return this.generateDeterministicFallback(request);
    } catch {
      return this.generateDeterministicFallback(request);
    }
  }

  public generateDeterministicFallback(request: AISummaryRequest): AISummaryResponse {
    const formattedPrice = formatINR(request.pricePaise).formatted;
    const isAtLow = request.pricePaise <= request.allTimeLowPaise;

    const summary = isAtLow
      ? `${request.productTitle} is currently at its lowest recorded price of ${formattedPrice} across ${request.sourcesCount} tracked merchants.`
      : `${request.productTitle} is listed at ${formattedPrice}. ${request.dealExplanation}.`;

    return {
      summary,
      source: "deterministic_fallback",
      cached: false,
    };
  }
}
