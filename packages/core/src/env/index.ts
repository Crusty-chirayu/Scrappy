import { z } from "zod";

export const NodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

export const BaseEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.string().url().default("postgresql://scrappy:scrappy_dev@localhost:5432/scrappy"),
  DATABASE_DIRECT_URL: z.string().url().optional(),
});

export const WebEnvSchema = BaseEnvSchema.extend({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  AUTH_SECRET: z.string().min(16).default("dev-auth-secret-min-16-chars-long"),
});

export const ApiEnvSchema = BaseEnvSchema.merge(DatabaseEnvSchema).extend({
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(16).default("dev-jwt-secret-min-16-chars-long"),
});

export const WorkerEnvSchema = BaseEnvSchema.merge(DatabaseEnvSchema).extend({
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  SCRAPING_RATE_LIMIT_DELAY_MS: z.coerce.number().default(1000),
  BROWSER_WORKER_URL: z.string().url().default("http://localhost:5000"),
});

export const BrowserWorkerEnvSchema = BaseEnvSchema.extend({
  PORT: z.coerce.number().default(5000),
  MAX_CONCURRENT_BROWSERS: z.coerce.number().default(2),
  PAGE_TIMEOUT_MS: z.coerce.number().default(30000),
});

export const AdminEnvSchema = BaseEnvSchema.merge(DatabaseEnvSchema).extend({
  PORT: z.coerce.number().default(3001),
  ADMIN_ALLOWED_EMAILS: z
    .string()
    .default("admin@scrappy.in,dev@scrappy.in")
    .transform((val) => val.split(",").map((s) => s.trim())),
});

/**
 * Validates process.env against a schema and fails fast if invalid.
 */
export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  rawEnv: Record<string, string | undefined> = process.env,
  contextName = "Application",
): z.infer<T> {
  const result = schema.safeParse(rawEnv);
  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    const message = `[FATAL] Invalid environment configuration for ${contextName}:\n${formattedErrors}`;
    console.error(message);
    throw new Error(message);
  }
  return result.data;
}
