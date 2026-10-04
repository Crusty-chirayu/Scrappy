import { describe, it, expect } from "vitest";
import { validateSafeUrl } from "../ssrf.js";
import { SourceCircuitBreaker } from "../circuit-breaker.js";

describe("SSRF Protection", () => {
  it("allows valid public URLs", () => {
    const url = validateSafeUrl("https://www.amazon.in/dp/B09G9FPGTN");
    expect(url.hostname).toBe("www.amazon.in");
  });

  it("blocks localhost, loopback and private IPs", () => {
    expect(() => validateSafeUrl("http://localhost:3000")).toThrow(/Access to blocked host/);
    expect(() => validateSafeUrl("http://127.0.0.1/admin")).toThrow(/Access to blocked host/);
    expect(() => validateSafeUrl("http://10.0.1.5/internal")).toThrow(/Access to private IP range/);
    expect(() => validateSafeUrl("http://192.168.1.1")).toThrow(/Access to private IP range/);
    expect(() => validateSafeUrl("http://169.254.169.254/latest/meta-data")).toThrow();
  });

  it("blocks non-http protocols", () => {
    expect(() => validateSafeUrl("file:///etc/passwd")).toThrow(/Disallowed protocol/);
    expect(() => validateSafeUrl("ftp://ftp.example.com")).toThrow(/Disallowed protocol/);
  });
});

describe("Circuit Breaker", () => {
  it("transitions to OPEN when failure threshold is reached", () => {
    const breaker = new SourceCircuitBreaker("test-source", {
      failureThreshold: 3,
      cooldownMs: 5000,
    });

    expect(breaker.getState()).toBe("CLOSED");
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("CLOSED");
    breaker.recordFailure();
    expect(breaker.getState()).toBe("OPEN");
    expect(() => breaker.checkHealth()).toThrow(/Circuit breaker open/);
  });

  it("resets on success", () => {
    const breaker = new SourceCircuitBreaker("test-source", {
      failureThreshold: 2,
      cooldownMs: 5000,
    });
    breaker.recordFailure();
    breaker.recordSuccess();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("CLOSED");
  });
});
