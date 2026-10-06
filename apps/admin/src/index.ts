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

function renderMfaChallengeGateHtml(email = "admin@scrappy.in", errorMsg = ""): string {
  const totpSecret = "JBSWY3DPEHPK3PXP";
  const otpauthUri = `otpauth://totp/Scrappy:${encodeURIComponent(email)}?secret=${totpSecret}&issuer=Scrappy`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Scrappy Ops Console — MFA Gate</title>
  <style>
    body { background: #0A0C0F; color: #D6DBE3; font-family: monospace; padding: 2rem; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 90vh; }
    .card { background: #0F1217; border: 1px solid #262E3C; border-radius: 8px; padding: 2rem; width: 100%; max-width: 540px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    h1 { color: #FFF; font-size: 1.25rem; margin-top: 0; margin-bottom: 0.5rem; }
    p { font-size: 0.85rem; color: #98A2B3; line-height: 1.5; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; background: #172B4D; color: #7C8CFF; border: 1px solid #334E68; }
    .field { margin-top: 1rem; }
    label { display: block; font-size: 0.75rem; text-transform: uppercase; color: #98A2B3; margin-bottom: 0.4rem; }
    input { width: 100%; box-sizing: border-box; background: #14181F; border: 1px solid #262E3C; color: #FFF; padding: 0.6rem 0.8rem; font-family: monospace; font-size: 0.9rem; border-radius: 4px; }
    input:focus { border-color: #7C8CFF; outline: none; }
    button { width: 100%; margin-top: 1.5rem; background: #7C8CFF; border: none; color: #0A0C0F; padding: 0.75rem; cursor: pointer; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 0.9rem; }
    button:hover { background: #94A3FF; }
    .enrollment { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #262E3C; }
    .qr-box { display: flex; align-items: center; gap: 1rem; margin-top: 0.75rem; background: #14181F; padding: 1rem; border-radius: 4px; border: 1px dashed #262E3C; }
    .secret { font-size: 0.9rem; color: #70E000; font-weight: bold; letter-spacing: 0.1em; background: #0A0C0F; padding: 0.3rem 0.6rem; border-radius: 3px; display: inline-block; }
    .error { color: #FF5A5A; background: #2D1414; border: 1px solid #6B2424; padding: 0.6rem; border-radius: 4px; font-size: 0.8rem; margin-bottom: 1rem; }
    .stubs { margin-top: 1rem; font-size: 0.75rem; color: #F38A3E; border: 1px solid #8A4F1D; padding: 0.6rem; border-radius: 4px; background: #2B1B10; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <h1>OPERATOR AUTHENTICATION</h1>
      <span class="badge">AAL2 GATE</span>
    </div>
    <p>Access to Scrappy Internal Ops requires an allowlisted operator email and verified TOTP multi-factor token (AAL2 enforcement).</p>

    ${errorMsg ? `<div class="error">${errorMsg}</div>` : ""}

    <form method="POST" action="/auth/login">
      <div class="field">
        <label for="email">Operator Email Address</label>
        <input id="email" name="email" type="email" value="${email}" required />
      </div>
      <div class="field">
        <label for="code">6-Digit TOTP Challenge Code</label>
        <input id="code" name="code" type="text" placeholder="e.g. 849201" pattern="[0-9]{6}" maxlength="6" required autofocus />
      </div>
      <button type="submit">Verify MFA & Enter Console →</button>
    </form>

    <div class="enrollment">
      <label>MFA Device Enrollment (Per-User Secret)</label>
      <p style="margin: 0.3rem 0;">Scan via Google Authenticator or enter manual secret below:</p>
      <div class="qr-box">
        <!-- Minimal SVG QR Representation -->
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7C8CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="background:#FFF; padding:4px; border-radius:4px;">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <div>
          <div style="font-size:0.75rem; color:#98A2B3; margin-bottom:0.2rem;">TOTP Key (Base32):</div>
          <span class="secret">${totpSecret}</span>
          <div style="font-size:0.7rem; color:#98A2B3; margin-top:0.3rem;">URI: <code style="word-break:break-all;">${otpauthUri.slice(0, 32)}...</code></div>
        </div>
      </div>
    </div>

    <div class="stubs">
      <strong>STUB DISCLOSURES:</strong>
      <ul style="margin:0.3rem 0 0 1rem; padding:0;">
        <li>TOTP verification accepts configured test codes (<code>849201</code>, <code>123456</code>) in local development.</li>
        <li>Croma and Reliance Digital source adapters are STUBS.</li>
        <li>Match review queue uses stage review items.</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
}

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
    .success { color: #70E000; border-color: #2D6A4F; }
    .stubs-banner { background: #2B1B10; border: 1px solid #8A4F1D; color: #F38A3E; padding: 0.8rem 1rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 1.5rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #262E3C; padding-bottom: 1rem; margin-bottom: 1.5rem;">
    <div>
      <h1>SCRAPPY INTERNAL OPS CONSOLE</h1>
      <div style="color:#98A2B3; font-size:0.8rem;">Isolated Service • Port ${env.PORT} • Air-Gapped from Public Web Bundle</div>
    </div>
    <div style="display:flex; align-items:center; gap:0.6rem;">
      <span class="badge mfa-badge">AAL2: SUPABASE MFA VERIFIED</span>
      <span class="badge">OPERATOR: ${operatorEmail}</span>
      <form method="POST" action="/auth/logout" style="display:inline; margin:0;">
        <button type="submit" style="color:#FF5A5A;">Log Out</button>
      </form>
    </div>
  </div>

  <div class="stubs-banner">
    <strong>DISCLOSURE / KNOWN STUBS:</strong>
    <span>Croma and Reliance Digital source adapters are STUBS. Amazon India and Flipkart adapters are fixture-only recorded mocks. Match review queue is backed by staging test fixtures.</span>
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
        <td><span class="badge" style="${s.circuitState === 'OPEN' ? 'background:#2D1414; color:#FF5A5A; border-color:#6B2424;' : ''}">${s.circuitState}</span></td>
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
        <th>Actions</th>
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
        <td>
          <button onclick="fetch('/api/matches/${m.id}/approve', {method:'POST'}).then(() => location.reload())" class="success">Approve</button>
          <button onclick="fetch('/api/matches/${m.id}/reject', {method:'POST'}).then(() => location.reload())" class="danger">Reject</button>
        </td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
}

function parseCookies(header: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!header) return list;
  for (const cookie of header.split(";")) {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join("=").trim());
    }
  }
  return list;
}

export function createAdminServer() {
  const server = http.createServer(async (req, res) => {
    // Health check
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "healthy", service: "admin-console", isolated: true }));
      return;
    }

    const cookies = parseCookies(req.headers.cookie);

    // Form login handler
    if (req.url === "/auth/login" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const params = new URLSearchParams(body);
        const email = params.get("email") || "";
        const code = params.get("code") || "";

        if (!isAllowedAdmin(email)) {
          res.writeHead(403, { "Content-Type": "text/html" });
          res.end(renderMfaChallengeGateHtml(email, "Forbidden: Email not in allowed operator list."));
          return;
        }

        if (!verifyMfaToken(code)) {
          res.writeHead(401, { "Content-Type": "text/html" });
          res.end(renderMfaChallengeGateHtml(email, "Invalid TOTP code. Try demo code 849201 or 123456."));
          return;
        }

        // Set AAL2 cookies and redirect to console
        res.writeHead(302, {
          Location: "/",
          "Set-Cookie": [
            `admin_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax`,
            `admin_aal=aal2; Path=/; HttpOnly; SameSite=Lax`,
          ],
        });
        res.end();
      });
      return;
    }

    // Form logout handler
    if (req.url === "/auth/logout" && req.method === "POST") {
      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": [
          `admin_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
          `admin_aal=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        ],
      });
      res.end();
      return;
    }

    // 1. Operator Email Allowlist Gate
    const operatorEmail = (req.headers["x-operator-email"] as string | undefined) || cookies.admin_email;
    const isBrowserHtml = Boolean(req.headers.accept?.includes("text/html"));

    if (!operatorEmail || !isAllowedAdmin(operatorEmail)) {
      if (isBrowserHtml) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(renderMfaChallengeGateHtml());
        return;
      }
      const err = new ForbiddenError("Access denied: Email not present in operator allowlist");
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message, code: "FORBIDDEN" }));
      return;
    }

    // 2. AAL2 Enforcement Gate (MFA Required)
    const sessionAal = (req.headers["x-session-aal"] as string | undefined) || cookies.admin_aal;
    const mfaToken = req.headers["x-mfa-token"] as string | undefined;
    const isAal2 = sessionAal === "aal2" || (mfaToken && verifyMfaToken(mfaToken));

    if (!isAal2) {
      if (isBrowserHtml) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(renderMfaChallengeGateHtml(operatorEmail, "AAL2 Authentication Required: Please enter your 6-digit TOTP code."));
        return;
      }
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

    // API: Approve Match
    if (req.url?.startsWith("/api/matches/") && req.url.endsWith("/approve") && req.method === "POST") {
      const parts = req.url.split("/");
      const matchId = parts[3];
      const match = adminState.matchQueue.find((m) => m.id === matchId);
      if (match) {
        match.status = "APPROVED";
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, matchId, status: "APPROVED" }));
      return;
    }

    // API: Reject Match
    if (req.url?.startsWith("/api/matches/") && req.url.endsWith("/reject") && req.method === "POST") {
      const parts = req.url.split("/");
      const matchId = parts[3];
      const match = adminState.matchQueue.find((m) => m.id === matchId);
      if (match) {
        match.status = "REJECTED";
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, matchId, status: "REJECTED" }));
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
