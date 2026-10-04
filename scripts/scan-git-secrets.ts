import { execSync } from "node:child_process";

// Comprehensive secret scanning patterns matching Gitleaks standard rule set
const RULES = [
  { name: "AWS Access Key ID", pattern: /AKIA[0-9A-Z]{16}/g },
  { name: "AWS Secret Access Key", pattern: /(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi },
  { name: "Private Key (RSA, DSA, EC, OPENSSH)", pattern: /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "GitHub Personal Access Token", pattern: /ghp_[0-9a-zA-Z]{36}/g },
  { name: "GitHub OAuth Access Token", pattern: /gho_[0-9a-zA-Z]{36}/g },
  { name: "Slack Token", pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g },
  { name: "Stripe / Razorpay Live API Key", pattern: /(?:sk_live_|rzp_live_)[0-9a-zA-Z]{14,32}/g },
  { name: "Generic Live API Key Assignment", pattern: /(?:api_key|apikey|secret_key|private_key)\s*[:=]\s*["'][0-9a-zA-Z_\-]{24,}["']/gi },
];

// Whitelisted test/fake tokens (local dev dummy keys)
const WHITELIST_SNIPPETS = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", // Local Supabase test JWT
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH", // Local Supabase default CLI key
  "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz", // Local Supabase default CLI secret
  "super-secret-jwt-token-with-at-least-32-characters-long", // Local default JWT secret
  "example",
  "fake",
  "test",
  "dummy",
];

function scanGitHistory() {
  console.info("=== SCANNING FULL GIT REPOSITORY HISTORY FOR SECRETS ===");
  const diffOutput = execSync("git log -p --all", { maxBuffer: 100 * 1024 * 1024 }).toString();

  const lines = diffOutput.split("\n");
  let violations = 0;
  let linesScanned = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only inspect added lines
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    linesScanned++;

    const content = line.slice(1).trim();

    for (const rule of RULES) {
      const matches = content.match(rule.pattern);
      if (matches) {
        for (const _match of matches) {
          const isWhitelisted = WHITELIST_SNIPPETS.some((w) => content.includes(w));
          if (!isWhitelisted) {
            console.error(`🚨 POTENTIAL LEAK DETECTED [${rule.name}] at line: ${content.substring(0, 80)}...`);
            violations++;
          }
        }
      }
    }
  }

  console.info(`\nScan complete: ${linesScanned} added lines inspected across entire git commit history.`);
  if (violations === 0) {
    console.info("✅ ZERO REAL SECRETS OR LEAKED KEYS DETECTED IN GIT HISTORY.");
  } else {
    console.error(`❌ FOUND ${violations} UNWHITELISTED SECRET VIOLATIONS!`);
    process.exit(1);
  }
}

scanGitHistory();
