import { describe, it, expect } from "vitest";
import { formatINR, parseINRToPaise, rupeesToPaise, paiseToRupees } from "../units/currency.js";

describe("Currency Normalization", () => {
  it("converts rupees to paise and vice versa", () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(paiseToRupees(10000)).toBe(100);
    expect(rupeesToPaise(49.99)).toBe(4999);
  });

  it("parses raw INR string formats into paise correctly", () => {
    expect(parseINRToPaise("₹ 1,49,900.00")).toBe(14990000);
    expect(parseINRToPaise("Rs. 24,999")).toBe(2499900);
    expect(parseINRToPaise("1299")).toBe(129900);
    expect(parseINRToPaise("  ₹ 599.50 ")).toBe(59950);
  });

  it("throws on invalid price string", () => {
    expect(() => parseINRToPaise("Free")).toThrow();
    expect(() => parseINRToPaise("-50")).toThrow();
  });

  it("formats paise into Indian number format", () => {
    const formatted = formatINR(14990000);
    expect(formatted.rupees).toBe("1,49,900");
    expect(formatted.symbol).toBe("₹");
    expect(formatted.formatted).toBe("₹1,49,900");

    const withPaise = formatINR(59950, true);
    expect(withPaise.formatted).toBe("₹599.50");
  });
});
