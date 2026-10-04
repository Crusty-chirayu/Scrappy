import { DealGrade, DealScoreResult, PriceStats } from "./types.js";

/**
 * Calculates a verified deal score from historical price stats
 * without using fabricated discount claims.
 */
export function calculateDealScore(currentPricePaise: number, stats: PriceStats): DealScoreResult {
  if (stats.avgPricePaise <= 0 || currentPricePaise <= 0) {
    return {
      score: 50,
      grade: "AVERAGE",
      discountPercentage: 0,
      isAllTimeLow: false,
      isAnomaly: false,
      explanation: "Insufficient price history for score calibration",
    };
  }

  const isAllTimeLow = currentPricePaise <= stats.allTimeLowPaise;
  const discountFromAvg = ((stats.avgPricePaise - currentPricePaise) / stats.avgPricePaise) * 100;

  // Anomaly check: price drops > 80% below median are likely pricing glitches or refurbished listings
  const isAnomaly = currentPricePaise < stats.medianPricePaise * 0.2;

  let score = 50;
  let grade: DealGrade = "AVERAGE";

  if (discountFromAvg >= 30) {
    score = 95;
    grade = "EXCEPTIONAL";
  } else if (discountFromAvg >= 15) {
    score = 80;
    grade = "GREAT";
  } else if (discountFromAvg > 5) {
    score = 65;
    grade = "GOOD";
  } else if (discountFromAvg < -10) {
    score = 25;
    grade = "OVERPRICED";
  }

  // An all-time low without anomaly is exceptional
  if (isAllTimeLow && !isAnomaly) {
    score = Math.max(score, 90);
    grade = "EXCEPTIONAL";
  }

  const explanation = isAllTimeLow
    ? "Matches all-time low price in historical observations"
    : `${Math.round(Math.abs(discountFromAvg))}% ${discountFromAvg >= 0 ? "below" : "above"} 90-day average`;

  return {
    score,
    grade,
    discountPercentage: Math.max(0, Math.round(discountFromAvg)),
    isAllTimeLow,
    isAnomaly,
    explanation,
  };
}
