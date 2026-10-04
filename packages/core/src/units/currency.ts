/**
 * All prices in Scrappy are stored internally as integer paise (1 INR = 100 paise)
 * to avoid floating-point inaccuracies.
 */

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Parses raw price strings from ecommerce websites (e.g. "₹ 1,49,900.00", "Rs. 24,999", "1299")
 * into normalized integer paise.
 */
export function parseINRToPaise(rawPrice: string | number): number {
  if (typeof rawPrice === "number") {
    return rupeesToPaise(rawPrice);
  }

  // Remove currency prefix symbols including 'Rs.' or 'Rs' or '₹' or 'INR'
  const cleaned = rawPrice
    .replace(/\bRs\.?/gi, "")
    .replace(/\bINR\b/gi, "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid price value for INR parsing: '${rawPrice}'`);
  }

  return Math.round(parsed * 100);
}

export interface FormattedPrice {
  symbol: string;
  rupees: string;
  paise: string;
  formatted: string;
}

/**
 * Formats integer paise into a structured INR display object
 * allowing UI to de-emphasize paise and dim the currency symbol.
 */
export function formatINR(paise: number, includePaise = false): FormattedPrice {
  const totalRupees = paise / 100;
  const isNegative = totalRupees < 0;
  const absRupees = Math.abs(totalRupees);

  const parts = absRupees.toFixed(2).split(".");
  const intPart = parts[0] || "0";
  const decPart = parts[1] || "00";

  // Format integer part using Indian numbering system (e.g. 1,00,000)
  const lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  const formattedInt =
    otherNumbers !== ""
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;

  const sign = isNegative ? "-" : "";
  const rupeesStr = `${sign}${formattedInt}`;
  const fullFormatted = includePaise ? `₹${rupeesStr}.${decPart}` : `₹${rupeesStr}`;

  return {
    symbol: "₹",
    rupees: rupeesStr,
    paise: decPart,
    formatted: fullFormatted,
  };
}
