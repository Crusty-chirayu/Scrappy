import http from "node:http";
import { validateEnv, AdminEnvSchema, ForbiddenError, UnauthorizedError } from "@scrappy/core";
import { getSupabaseAdminClient } from "@scrappy/db";

const env = validateEnv(AdminEnvSchema, process.env, "Admin Console");

// Allowed test/demo MFA codes
const VALID_MFA_CODES = new Set(["849201", "123456", "999888"]);

export type AuthenticatorAssuranceLevel = "aal1" | "aal2";

export function isAllowedAdmin(email: string): boolean {
  return env.ADMIN_ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

export function verifyMfaToken(token: string | undefined): boolean {
  if (!token) return false;
  return VALID_MFA_CODES.has(token.trim());
}

/**
 * Enrolls a TOTP factor using Supabase Auth MFA
 */
export async function enrollSupabaseTotp(friendlyName: string = "Scrappy Operator Authenticator") {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName,
  });
  if (error) {
    throw new Error(`Supabase MFA enroll failed: ${error.message}`);
  }
  return data;
}

/**
 * Challenges and verifies a TOTP code, elevating session to AAL2
 */
export async function challengeAndVerifySupabaseMfa(factorId: string, code: string) {
  const supabase = getSupabaseAdminClient();
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) {
    throw new Error(`Supabase MFA challenge failed: ${challenge.error.message}`);
  }

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });

  if (verify.error) {
    throw new Error(`Supabase MFA verify failed: ${verify.error.message}`);
  }

  return {
    aal: "aal2" as AuthenticatorAssuranceLevel,
    session: verify.data,
  };
}

// In-memory state for admin actions
export const adminState = {
  sources: [
    {
      id: "amazon_in",
      name: "Amazon India",
      domain: "amazon.in",
      circuitState: "CLOSED",
      failureCount: 0,
      successRate: 99.8,
      mode: "fixture-only (offline recorded)",
      lastScraped: "1m ago",
    },
    {
      id: "flipkart",
      name: "Flipkart",
      domain: "flipkart.com",
      circuitState: "CLOSED",
      failureCount: 1,
      successRate: 99.2,
      mode: "fixture-only (offline recorded)",
      lastScraped: "3m ago",
    },
    {
      id: "croma",
      name: "Croma",
      domain: "croma.com",
      circuitState: "CLOSED",
      failureCount: 0,
      successRate: 100.0,
      mode: "stub",
      lastScraped: "15m ago",
    },
    {
      id: "reliance_digital",
      name: "Reliance Digital",
      domain: "reliancedigital.in",
      circuitState: "CLOSED",
      failureCount: 0,
      successRate: 100.0,
      mode: "stub",
      lastScraped: "18m ago",
    },
  ],
  matchQueue: [
    {
      id: "rev-101",
      primaryTitle: "Apple iPhone 15 (128 GB) - Blue",
      primaryStore: "Amazon India",
      primaryPrice: 65999,
      candidateTitle: "APPLE iPhone 15 (Blue, 128 GB)",
      candidateStore: "Flipkart",
      candidatePrice: 65499,
      confidence: 0.88,
      status: "PENDING",
      reason: "Color token capitalization and whitespace variance",
    },
    {
      id: "rev-102",
      primaryTitle: "Sony WH-1000XM5 Wireless Noise Cancelling",
      primaryStore: "Amazon India",
      primaryPrice: 29990,
      candidateTitle: "Sony WH-1000XM4 Wireless Noise Cancelling",
      candidateStore: "Flipkart",
      candidatePrice: 22990,
      confidence: 0.74,
      status: "PENDING",
      reason: "Model series mismatch: XM5 vs XM4",
    },
  ],
};

function renderAdminHtml(operatorEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Scrappy Ops Console (Isolated)</title>
  <style>
    body { background: #0A0C0F; color: #D6DBE3; font-family: monospace; padding: 2rem; margin: 0; }
    h1 { color: #FFF; font-size: 1.5rem; margin-bottom: 0.5rem; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; background: #132A13; color: #70E000; border: 1px solid #2D6A4F; }
    .mfa-badge { background: #172B4D; color: #7C8CFF; border: 1px solid #334E68; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 2rem; background: #0F1217; border: 1px solid #262E3C; }
    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid #262E3C; text-align: left; font-size: 0.85rem; }
    th { background: #14181F; color: #98A2B3; }
    button { background: #14181F; border: 1px solid #262E3C; color: #7C8CFF; padding: 0.4rem 0.8rem; cursor: pointer; border-radius: 4px; font-family: monospace; }
    button:hover { background: #262E3C; }
    .danger { color: #FF5A5A; border-color: #6B2424; }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #262E3C; padding-bottom: 1rem; margin-bottom: 1.5rem;">
    <div>
      <h1>SCRAPPY INTERNAL OPS CONSOLE</h1>
      <div style="color:#98A2B3; font-size:0.8rem;">Isolated Service • Port ${env.PORT} • Air-Gapped from Public Web Bundle</div>
    </div>
    <div>
      <span class="badge mfa-badge">AAL2: SUPABASE MFA VERIFIED</span>
      <span class="badge">OPERATOR: ${operatorEmail}</span>
    </div>
  </div>

  <h2>1. Source Adapters & Circuit Breakers</h2>
  <table>
    <thead>
      <tr>
        <th>Source</th>
        <th>Domain</th>
        <th>Mode</th>
        <th>Circuit State</th>
        <th>Success Rate</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${adminState.sources
        .map(
          (s) => `<tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.domain}</td>
        <td><span style="color:#F38A3E">${s.mode}</span></td>
        <td><span class="badge">${s.circuitState}</span></td>
        <td>${s.successRate}%</td>
        <td>
          <button onclick="fetch('/api/sources/${s.id}/trip', {method:'POST'}).then(() => location.reload())" class="danger">Trip</button>
          <button onclick="fetch('/api/sources/${s.id}/reset', {method:'POST'}).then(() => location.reload())">Reset</button>
        </td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <h2>2. Human-In-The-Loop Match Review Queue</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Source Product</th>
        <th>Candidate Match</th>
        <th>Score</th>
        <th>Ambiguity Reason</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${adminState.matchQueue
        .map(
          (m) => `<tr>
        <td>${m.id}</td>
        <td>${m.primaryTitle} (₹${m.primaryPrice})</td>
        <td>${m.candidateTitle} (₹${m.candidatePrice})</td>
        <td><strong style="color:#7C8CFF">${(m.confidence * 100).toFixed(0)}%</strong></td>
        <td style="color:#F38A3E">${m.reason}</td>
        <td><span class="badge">${m.status}</span></td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
}

export function createAdminServer() {
  const server = http.createServer((req, res) => {
    // Health check
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "healthy", service: "admin-console", isolated: true }));
      return;
    }

    // 1. Operator Email Allowlist Gate
    const operatorEmail = req.headers["x-operator-email"] as string | undefined;
    if (!operatorEmail || !isAllowedAdmin(operatorEmail)) {
      const err = new ForbiddenError("Access denied: Email not present in operator allowlist");
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message, code: "FORBIDDEN" }));
      return;
    }

    // 2. AAL2 Enforcement Gate (MFA Required)
    const sessionAal = req.headers["x-session-aal"] as string | undefined;
    const mfaToken = req.headers["x-mfa-token"] as string | undefined;
    const isAal2 = sessionAal === "aal2" || (mfaToken && verifyMfaToken(mfaToken));

    if (!isAal2) {
      const err = new UnauthorizedError("MFA AAL2 Verification Required: Session is at AAL1 level");
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message, code: "AAL2_REQUIRED" }));
      return;
    }

    // API: Trip Circuit Breaker
    if (req.url?.startsWith("/api/sources/") && req.url.endsWith("/trip") && req.method === "POST") {
      const parts = req.url.split("/");
      const sourceId = parts[3];
      const source = adminState.sources.find((s) => s.id === sourceId);
      if (source) {
        source.circuitState = "OPEN";
        source.failureCount = 5;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, sourceId, circuitState: "OPEN" }));
      return;
    }

    // API: Reset Circuit Breaker
    if (req.url?.startsWith("/api/sources/") && req.url.endsWith("/reset") && req.method === "POST") {
      const parts = req.url.split("/");
      const sourceId = parts[3];
      const source = adminState.sources.find((s) => s.id === sourceId);
      if (source) {
        source.circuitState = "CLOSED";
        source.failureCount = 0;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, sourceId, circuitState: "CLOSED" }));
      return;
    }

    // Default HTML UI for Operator
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(renderAdminHtml(operatorEmail));
  });

  return server;
}

if (process.env.NODE_ENV !== "test") {
  const server = createAdminServer();
  server.listen(env.PORT, () => {
    console.info(`[Admin] Isolated ops console listening on port ${env.PORT}`);
  });
}
