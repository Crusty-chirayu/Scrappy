import { describe, it, expect } from "vitest";
import { isAllowedAdmin, verifyMfaToken, createAdminServer } from "../index.js";

describe("Admin Console Access Control & MFA Gate", () => {
  it("allows configured operator emails in allowlist", () => {
    expect(isAllowedAdmin("admin@scrappy.in")).toBe(true);
    expect(isAllowedAdmin("ADMIN@SCRAPPY.IN")).toBe(true);
  });

  it("rejects non-allowlisted emails", () => {
    expect(isAllowedAdmin("attacker@malicious.com")).toBe(false);
    expect(isAllowedAdmin("random_user@gmail.com")).toBe(false);
  });

  it("validates MFA token codes", () => {
    expect(verifyMfaToken("849201")).toBe(true);
    expect(verifyMfaToken("123456")).toBe(true);
    expect(verifyMfaToken("000000")).toBe(false);
    expect(verifyMfaToken(undefined)).toBe(false);
  });

  it("enforces both allowlist and MFA gate via HTTP handler", async () => {
    const server = createAdminServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as { port: number }).port;

    try {
      // 1. Unauthenticated request -> 403 Forbidden
      const res1 = await fetch(`http://127.0.0.1:${port}/`);
      expect(res1.status).toBe(403);

      // 2. Allowlisted email without MFA -> 401 Unauthorized (MFA_REQUIRED)
      const res2 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: { "x-operator-email": "admin@scrappy.in" },
      });
      expect(res2.status).toBe(401);
      const data2 = await res2.json();
      expect(data2.code).toBe("MFA_REQUIRED");

      // 3. Allowlisted email with valid MFA -> 200 OK
      const res3 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: {
          "x-operator-email": "admin@scrappy.in",
          "x-mfa-token": "849201",
        },
      });
      expect(res3.status).toBe(200);
      const html = await res3.text();
      expect(html).toContain("SCRAPPY INTERNAL OPS CONSOLE");
      expect(html).toContain("MFA: VERIFIED");
    } finally {
      server.close();
    }
  });
});
