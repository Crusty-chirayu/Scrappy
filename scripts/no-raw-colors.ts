import fs from "node:fs";
import path from "node:path";

const SCAN_DIR = path.resolve(process.cwd(), "apps/web/src/app");

// Allowlist paths or filenames (SVG, art files, brand vectors)
const ALLOWLIST_PATTERNS = [
  /illustrations?/i,
  /icons?/i,
  /brand/i,
  /\.svg$/i,
];

function getAllFiles(dir: string, ext = ".tsx"): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function runAudit() {
  const files = getAllFiles(SCAN_DIR, ".tsx");
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
  let totalViolations = 0;

  console.log(`[no-raw-colors] Scanning ${files.length} .tsx files in apps/web/src/app/ ...`);

  for (const filePath of files) {
    const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

    // Check allowlist
    const isAllowlisted = ALLOWLIST_PATTERNS.some((pattern) => pattern.test(relPath));
    if (isAllowlisted) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, lineIndex) => {
      // Ignore comments
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
        return;
      }

      const matches = line.match(hexRegex);
      if (matches) {
        for (const match of matches) {
          console.error(`  FAIL: Raw color '${match}' found in ${relPath}:${lineIndex + 1}`);
          console.error(`    Line: ${trimmed.slice(0, 100)}`);
          totalViolations++;
        }
      }
    });
  }

  if (totalViolations > 0) {
    console.error(`\n[no-raw-colors] FAILED: ${totalViolations} raw hex color(s) detected. Use Signal CSS tokens (var(--...)) instead.`);
    process.exit(1);
  }

  console.log(`[no-raw-colors] PASSED: 0 raw hex colors found across all checked routes.`);
}

runAudit();
