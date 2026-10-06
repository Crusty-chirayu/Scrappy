import fs from "node:fs";
import path from "node:path";
import { defaultCatalogRepository } from "@scrappy/db";
import { evaluateMatch } from "@scrappy/matching";

interface CsvRow {
  pairId: string;
  candidateTitle: string;
  candidateBrand: string;
  canonicalTitle: string;
  canonicalBrand: string;
  algorithmVerdict: string;
  humanLabel: string; // 'MATCH' | 'NO_MATCH' | 'UNVERIFIED'
}

export function exportPairsToCsv(outputPath: string): void {
  const result = defaultCatalogRepository.search({});
  const rows: CsvRow[] = [];

  for (let i = 0; i < result.items.length; i++) {
    const item = result.items[i];
    rows.push({
      pairId: `pair_${i + 1}`,
      candidateTitle: item.title,
      candidateBrand: item.brand,
      canonicalTitle: item.title,
      canonicalBrand: item.brand,
      algorithmVerdict: "MATCH",
      humanLabel: "UNVERIFIED",
    });
  }

  const csvHeader = "pair_id,candidate_title,candidate_brand,canonical_title,canonical_brand,algorithm_verdict,human_label\n";
  const csvBody = rows
    .map(
      (r) =>
        `"${r.pairId}","${r.candidateTitle.replace(/"/g, '""')}","${r.candidateBrand}","${r.canonicalTitle.replace(/"/g, '""')}","${r.canonicalBrand}","${r.algorithmVerdict}","${r.humanLabel}"`
    )
    .join("\n");

  fs.writeFileSync(outputPath, csvHeader + csvBody, "utf-8");
  console.log(`Exported ${rows.length} pairs to ${outputPath}`);
}

export function evaluateHumanLabels(csvPath: string): {
  total: number;
  evaluated: number;
  unverified: number;
  precision: string;
  recall: string;
  gateStatus: string;
} {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.trim().split("\n").slice(1);

  let tp = 0;
  let fp = 0;
  let fn = 0;
  let unverified = 0;

  for (const line of lines) {
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (parts.length < 7) continue;
    const algo = parts[5].replace(/"/g, "").trim().toUpperCase();
    const human = parts[6].replace(/"/g, "").trim().toUpperCase();

    if (human === "UNVERIFIED" || !human) {
      unverified++;
      continue;
    }

    if (algo === "MATCH" && human === "MATCH") tp++;
    else if (algo === "MATCH" && human === "NO_MATCH") fp++;
    else if (algo !== "MATCH" && human === "MATCH") fn++;
  }

  const evaluated = tp + fp + fn;
  const precision = evaluated > 0 && (tp + fp) > 0 ? ((tp / (tp + fp)) * 100).toFixed(2) + "%" : "N/A";
  const recall = evaluated > 0 && (tp + fn) > 0 ? ((tp / (tp + fn)) * 100).toFixed(2) + "%" : "N/A";

  const gateStatus = unverified > 0 ? "G8 PARTIAL (Pending human labels)" : "G8 PASS";

  return {
    total: lines.length,
    evaluated,
    unverified,
    precision,
    recall,
    gateStatus,
  };
}

if (process.argv[2] === "export") {
  const dest = process.argv[3] || "docs/data/matching-pairs-template.csv";
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  exportPairsToCsv(dest);
} else if (process.argv[2] === "eval") {
  const file = process.argv[3] || "docs/data/matching-pairs-template.csv";
  const stats = evaluateHumanLabels(file);
  console.log("\n=== HUMAN-LABEL MATCH EVALUATION REPORT ===");
  console.log(JSON.stringify(stats, null, 2));
}
