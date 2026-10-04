import { execSync } from "node:child_process";
import http from "node:http";
import net from "node:net";
import fs from "node:fs";

// 1. Package Manager Enforcer
const userAgent = process.env.npm_config_user_agent || "";
if (userAgent.startsWith("npm/")) {
  console.error(`
==============================================================================
[SCRAPPY PREFLIGHT ERROR] Unsupported Package Manager
------------------------------------------------------------------------------
This repository is strictly configured to use 'pnpm'.
Running 'npm run dev' is prohibited to avoid lockfile and port drift.

Please run:
  pnpm dev
==============================================================================
`);
  process.exit(1);
}

console.log("[preflight] Validating runtime environment...");

// 2. Docker Daemon Check
try {
  execSync("docker info --format \"{{.ServerVersion}}\"", { stdio: "pipe", timeout: 4000 });
  console.log("  ✓ Docker engine is running");
} catch {
  console.warn("  ⚠ Warning: Docker engine does not appear to be running. If Supabase is down, start Docker Desktop first.");
}

// 3. Supabase Local Stack Check
function checkSupabase() {
  return new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:55321/rest/v1/", { timeout: 3000 }, (res) => {
      resolve(res.statusCode !== undefined);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

const isSupabaseUp = await checkSupabase();
if (!isSupabaseUp) {
  console.error(`
==============================================================================
[SCRAPPY PREFLIGHT ERROR] Supabase Local Stack Offline
------------------------------------------------------------------------------
The local Supabase instance is not reachable at http://127.0.0.1:55321.

To start the local stack, run:
  supabase start

To reset and seed local migrations:
  supabase db reset
==============================================================================
`);
  process.exit(1);
}
console.log("  ✓ Supabase API gateway reachable at http://127.0.0.1:55321");

// 4. Port Availability Check (Web: 3000, Admin: 3001, API: 4000, Browser Worker: 5000)
const REQUIRED_PORTS = [
  { port: 3000, service: "Web Application (@scrappy/web)" },
  { port: 3001, service: "Admin Console (@scrappy/admin)" },
  { port: 4000, service: "REST API Gateway (@scrappy/api)" },
  { port: 5000, service: "Browser Worker (@scrappy/browser-worker)" },
];

function checkPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

for (const { port, service } of REQUIRED_PORTS) {
  const isFree = await checkPortFree(port);
  if (!isFree) {
    console.error(`
==============================================================================
[SCRAPPY PREFLIGHT ERROR] Port Conflict Detected
------------------------------------------------------------------------------
Port ${port} required by ${service} is already in use.
To prevent port drift (e.g. Next.js falling back to 3002 or 3005), please
terminate the existing process using port ${port}.

Windows Command to inspect:
  netstat -ano | findstr :${port}
==============================================================================
`);
    process.exit(1);
  }
}
console.log("  ✓ Fixed port map verified: 3000 (web), 3001 (admin), 4000 (api), 5000 (browser-worker)");

// 5. Environment Variables Check
const requiredEnvVars = ["DATABASE_URL"];
const missingVars = [];
for (const v of requiredEnvVars) {
  if (!process.env[v] && !fs.existsSync(".env")) {
    missingVars.push(v);
  }
}
if (missingVars.length > 0) {
  console.warn(`  ⚠ Warning: Missing recommended environment variables: ${missingVars.join(", ")}`);
}

console.log("  ✓ Preflight checks passed cleanly.\n");
