import { FieldTransform } from "./types.js";

/**
 * Normalizes raw string input using the specified transformation pipeline.
 */
export function applyTransforms(
  rawValue: unknown,
  transforms: FieldTransform[],
  baseUrl?: string,
): unknown {
  if (rawValue === null || rawValue === undefined) {
    return rawValue;
  }

  let value: unknown = rawValue;

  for (const t of transforms) {
    if (value === null || value === undefined) break;

    switch (t.type) {
      case "trim": {
        if (typeof value === "string") {
          value = value.trim();
        }
        break;
      }
      case "clean_whitespace": {
        if (typeof value === "string") {
          value = value.replace(/\s+/g, " ").trim();
        }
        break;
      }
      case "lowercase": {
        if (typeof value === "string") {
          value = value.toLowerCase();
        }
        break;
      }
      case "uppercase": {
        if (typeof value === "string") {
          value = value.toUpperCase();
        }
        break;
      }
      case "parse_number": {
        if (typeof value === "number") break;
        if (typeof value === "string") {
          const cleaned = value.replace(/[^0-9.-]/g, "");
          const num = Number.parseFloat(cleaned);
          value = Number.isNaN(num) ? null : num;
        }
        break;
      }
      case "parse_currency_paise": {
        if (typeof value === "number") {
          value = Math.round(value * 100);
          break;
        }
        if (typeof value === "string") {
          // Removes ₹, $, commas, non-numeric except dot
          const cleaned = value.replace(/[^\d.]/g, "");
          const num = Number.parseFloat(cleaned);
          value = Number.isNaN(num) ? null : Math.round(num * 100);
        }
        break;
      }
      case "absolute_url": {
        if (typeof value === "string" && baseUrl) {
          try {
            value = new URL(value, baseUrl).toString();
          } catch {
            // Keep original if invalid
          }
        }
        break;
      }
      case "regex_replace": {
        if (typeof value === "string" && t.param) {
          // Expects format "pattern///replacement" or pattern
          const parts = t.param.split("///");
          const pattern = parts[0] || "";
          const replacement = parts[1] || "";
          try {
            const rx = new RegExp(pattern, "g");
            value = value.replace(rx, replacement);
          } catch {
            // regex failure keeps original
          }
        }
        break;
      }
      case "date_iso": {
        if (typeof value === "string" || typeof value === "number") {
          const d = new Date(value);
          value = Number.isNaN(d.getTime()) ? null : d.toISOString();
        }
        break;
      }
    }
  }

  return value;
}
