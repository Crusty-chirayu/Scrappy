import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "apps", "web", "src", "app");

// Route word ceilings as defined in UI Specification and docs/UI_AUDIT.md
export const ROUTE_CEILINGS: Record<string, { path: string; maxWords: number }> = {
  landing: { path: path.join(APP_DIR, "page.tsx"), maxWords: 350 },
  compare: { path: path.join(APP_DIR, "compare", "page.tsx"), maxWords: 160 },
  product: { path: path.join(APP_DIR, "compare", "[id]", "page.tsx"), maxWords: 240 },
  intelligence: { path: path.join(APP_DIR, "intelligence", "page.tsx"), maxWords: 220 },
  extract: { path: path.join(APP_DIR, "extract", "page.tsx"), maxWords: 220 },
  auth_login: { path: path.join(APP_DIR, "auth", "login", "page.tsx"), maxWords: 80 },
  auth_signup: { path: path.join(APP_DIR, "auth", "signup", "page.tsx"), maxWords: 80 },
  settings: { path: path.join(APP_DIR, "settings", "page.tsx"), maxWords: 200 },
};

export function extractWordsFromJsx(content: string): string[] {
  // 1. Remove comments
  let text = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

  // 2. Remove import statements and exports
  text = text.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "");

  // 3. Extract text inside JSX tags: >visible text<
  const tagContentRegex = />([^<>{}\n]+)</g;
  const words: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagContentRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    if (raw && !raw.startsWith("className") && !raw.startsWith("style")) {
      const tokens = raw
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9-]/g, "").trim())
        .filter((w) => w.length > 1 && !/^\d+$/.test(w));
      words.push(...tokens);
    }
  }

  // 4. Extract string literals that represent user-facing copy (e.g. title: "...", description: "...")
  const copyLiteralRegex = /(?:title|label|heading|description|placeholder|subtitle):\s*["']([^"']+)["']/g;
  while ((match = copyLiteralRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    const tokens = raw
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9-]/g, "").trim())
      .filter((w) => w.length > 1 && !/^\d+$/.test(w));
    words.push(...tokens);
  }

  // Deduplicate tokens by unique set of words found
  return words;
}

export function runCopyBudgetAudit() {
  console.log("[copy-budget] Auditing route word counts against strict ceilings...");
  let failed = false;

  for (const [routeName, { path: filePath, maxWords }] of Object.entries(ROUTE_CEILINGS)) {
    if (!fs.existsSync(filePath)) {
      console.warn(`[copy-budget] Warning: file not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const words = extractWordsFromJsx(content);
    const wordCount = words.length;

    if (wordCount > maxWords) {
      console.error(
        `[copy-budget] FAILED: ${routeName} has ${wordCount} words, exceeding ceiling of ${maxWords} words!`
      );
      failed = true;
    } else {
      console.log(
        `[copy-budget] PASSED: ${routeName.padEnd(14)} ${wordCount.toString().padStart(3)} / ${maxWords} words`
      );
    }
  }

  if (failed) {
    console.error("[copy-budget] Copy budget audit FAILED. Reduce word density on failing routes.");
    process.exit(1);
  } else {
    console.log("[copy-budget] All routes comply with strict copy budget ceilings.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCopyBudgetAudit();
}
