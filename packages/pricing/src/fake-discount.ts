export interface FakeDiscountAnalysis {
  isFakeDiscount: boolean;
  realDiscountPercent: number;
  claimedDiscountPercent: number;
  mrpInflationPercent: number;
  verdict: string;
}

/**
 * Analyzes whether an advertised discount is genuine or an inflated "fake discount".
 * Detects inflated MRPs by comparing against actual 90-day historical medians.
 */
export function analyzeFakeDiscount(
  currentPricePaise: number,
  claimedOriginalPricePaise: number,
  historicalMedianPaise: number,
): FakeDiscountAnalysis {
  if (currentPricePaise <= 0 || historicalMedianPaise <= 0) {
    return {
      isFakeDiscount: false,
      realDiscountPercent: 0,
      claimedDiscountPercent: 0,
      mrpInflationPercent: 0,
      verdict: "Insufficient historical data",
    };
  }

  const claimedDiscountPercent =
    claimedOriginalPricePaise > currentPricePaise
      ? Math.round(((claimedOriginalPricePaise - currentPricePaise) / claimedOriginalPricePaise) * 100)
      : 0;

  const realDiscountPercent =
    historicalMedianPaise > currentPricePaise
      ? Math.round(((historicalMedianPaise - currentPricePaise) / historicalMedianPaise) * 100)
      : 0;

  const mrpInflationPercent =
    claimedOriginalPricePaise > historicalMedianPaise
      ? Math.round(((claimedOriginalPricePaise - historicalMedianPaise) / historicalMedianPaise) * 100)
      : 0;

  // If claimed MRP is >25% higher than historical median AND claimed discount is substantially higher than real discount
  const isFakeDiscount = mrpInflationPercent >= 25 && claimedDiscountPercent >= realDiscountPercent + 15;

  let verdict = "Genuine discount";
  if (isFakeDiscount) {
    verdict = `Inflated MRP: Claimed -${claimedDiscountPercent}%, but real discount against 90d median is only -${realDiscountPercent}%`;
  } else if (claimedDiscountPercent === 0 && realDiscountPercent > 0) {
    verdict = `Hidden deal: -${realDiscountPercent}% below 90-day median without advertised discount`;
  }

  return {
    isFakeDiscount,
    realDiscountPercent,
    claimedDiscountPercent,
    mrpInflationPercent,
    verdict,
  };
}
