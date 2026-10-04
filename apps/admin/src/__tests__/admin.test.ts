import { describe, it, expect } from "vitest";
import { isAllowedAdmin } from "../index.js";

describe("Admin Console Access Control", () => {
  it("allows configured operator emails in allowlist", () => {
    // ADMIN_ALLOWED_EMAILS is configured with admin@scrappy.in
    expect(isAllowedAdmin("admin@scrappy.in")).toBe(true);
    expect(isAllowedAdmin("ADMIN@SCRAPPY.IN")).toBe(true);
  });

  it("rejects non-allowlisted emails", () => {
    expect(isAllowedAdmin("attacker@malicious.com")).toBe(false);
    expect(isAllowedAdmin("random_user@gmail.com")).toBe(false);
  });
});
