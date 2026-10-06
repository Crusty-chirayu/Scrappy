import { describe, it, expect } from "vitest";
import { isAllowedAdmin, verifyMfaToken, createAdminServer } from "../index.js";

describe("Admin Console Access Control & Supabase MFA AAL2 Gate", () => {
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

  it("enforces both allowlist and AAL2 MFA gate via HTTP handler", async () => {
    const server = createAdminServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as { port: number }).port;

    try {
      // 1. Unauthenticated or non-allowlisted user -> 403 Forbidden
      const res1 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: { "x-operator-email": "stranger@external.com" },
      });
      expect(res1.status).toBe(403);
      const data1 = await res1.json();
      expect(data1.code).toBe("FORBIDDEN");

      // 2. Allowlisted user with AAL1 session (no MFA verified) -> 401 Unauthorized (AAL2_REQUIRED)
      const res2 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: {
          "x-operator-email": "admin@scrappy.in",
          "x-session-aal": "aal1",
        },
      });
      expect(res2.status).toBe(401);
      const data2 = await res2.json();
      expect(data2.code).toBe("AAL2_REQUIRED");

      // 3. Allowlisted user with verified AAL2 session -> 200 OK
      const res3 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: {
          "x-operator-email": "admin@scrappy.in",
          "x-session-aal": "aal2",
        },
      });
      expect(res3.status).toBe(200);
      const html3 = await res3.text();
      expect(html3).toContain("SCRAPPY INTERNAL OPS CONSOLE");
      expect(html3).toContain("AAL2: SUPABASE MFA VERIFIED");

      // 4. Allowlisted user elevating via valid MFA token -> 200 OK
      const res4 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: {
          "x-operator-email": "admin@scrappy.in",
          "x-mfa-token": "849201",
        },
      });
      expect(res4.status).toBe(200);

      // 5. Browser HTML request renders MFA challenge gate and enrollment card
      const res5 = await fetch(`http://127.0.0.1:${port}/`, {
        headers: { accept: "text/html" },
      });
      expect(res5.status).toBe(200);
      const html5 = await res5.text();
      expect(html5).toContain("OPERATOR AUTHENTICATION");
      expect(html5).toContain("MFA Device Enrollment (Per-User Secret)");
      expect(html5).toContain("JBSWY3DPEHPK3PXP");

      // 6. Form login sets AAL2 cookie
      const res6 = await fetch(`http://127.0.0.1:${port}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "email=admin@scrappy.in&code=849201",
        redirect: "manual",
      });
      expect(res6.status).toBe(302);
      const cookieHeader = res6.headers.get("set-cookie");
      expect(cookieHeader).toContain("admin_aal=aal2");

      // 7. Match review queue actions
      const res7 = await fetch(`http://127.0.0.1:${port}/api/matches/rev-101/approve`, {
        method: "POST",
        headers: {
          "x-operator-email": "admin@scrappy.in",
          "x-session-aal": "aal2",
        },
      });
      expect(res7.status).toBe(200);
      const data7 = await res7.json();
      expect(data7.status).toBe("APPROVED");
    } finally {
      server.close();
    }
  });
});
