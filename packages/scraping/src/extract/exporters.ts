/**
 * Exports records to RFC 4180 compliant CSV string.
 */
export function exportToCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) return "";

  const headers = Object.keys(records[0] || {});
  const lines: string[] = [headers.map(escapeCsvValue).join(",")];

  for (const row of records) {
    const line = headers
      .map((header) => {
        const val = row[header];
        return escapeCsvValue(val);
      })
      .join(",");
    lines.push(line);
  }

  return lines.join("\n");
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports records to formatted JSON string.
 */
export function exportToJson(records: Record<string, unknown>[], pretty = true): string {
  return JSON.stringify(records, null, pretty ? 2 : 0);
}

/**
 * Exports records to Newline Delimited JSON (NDJSON) string.
 */
export function exportToNdjson(records: Record<string, unknown>[]): string {
  return records.map((r) => JSON.stringify(r)).join("\n");
}
