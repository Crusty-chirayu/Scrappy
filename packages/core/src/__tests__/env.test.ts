import { describe, it, expect } from "vitest";
import { validateEnv, WebEnvSchema, ApiEnvSchema } from "../env/index.js";

describe("Environment Validation", () => {
  it("provides sensible defaults in development", () => {
    const webConfig = validateEnv(WebEnvSchema, {}, "TestWeb");
    expect(webConfig.PORT).toBe(3000);
    expect(webConfig.NODE_ENV).toBe("development");
    expect(webConfig.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("parses and validates custom API config", () => {
    const apiConfig = validateEnv(
      ApiEnvSchema,
      {
        PORT: "8080",
        DATABASE_URL: "postgresql://custom:custom@localhost:5432/custom_db",
        JWT_SECRET: "secret-key-that-is-long-enough",
      },
      "TestApi",
    );
    expect(apiConfig.PORT).toBe(8080);
    expect(apiConfig.DATABASE_URL).toContain("custom_db");
  });

  it("throws validation error on invalid port or URL", () => {
    expect(() =>
      validateEnv(
        ApiEnvSchema,
        {
          PORT: "not-a-number",
          DATABASE_URL: "invalid-url",
        },
        "TestInvalid",
      ),
    ).toThrow(/\[FATAL\] Invalid environment configuration/);
  });
});
