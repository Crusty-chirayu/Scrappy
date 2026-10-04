import http from "node:http";
import { validateEnv, AdminEnvSchema, ForbiddenError } from "@scrappy/core";

const env = validateEnv(AdminEnvSchema, process.env, "Admin Console");

export function isAllowedAdmin(email: string): boolean {
  return env.ADMIN_ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

export function createAdminServer() {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "healthy", service: "admin-console" }));
      return;
    }

    // Allowlist check verification
    const operatorEmail = req.headers["x-operator-email"] as string | undefined;
    if (!operatorEmail || !isAllowedAdmin(operatorEmail)) {
      const err = new ForbiddenError("Access denied: Email not present in operator allowlist");
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message, code: "FORBIDDEN" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Welcome to Scrappy Internal Ops Console",
        operator: operatorEmail,
      }),
    );
  });

  return server;
}

if (process.env.NODE_ENV !== "test") {
  const server = createAdminServer();
  server.listen(env.PORT, () => {
    console.info(`[Admin] Ops console listening on port ${env.PORT}`);
  });
}
