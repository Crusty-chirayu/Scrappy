export type ErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "ADAPTER_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CIRCUIT_BREAKER_OPEN"
  | "SSRF_ATTEMPT_DETECTED"
  | "EXTRACTION_FAILED"
  | "TENANT_MISMATCH"
  | "INTERNAL_ERROR";

export class ScrappyError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = "INTERNAL_ERROR",
    statusCode = 500,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ScrappyError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends ScrappyError {
  constructor(entity: string, id?: string) {
    super(id ? `${entity} with id '${id}' not found` : `${entity} not found`, "NOT_FOUND", 404, {
      entity,
      id,
    });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ScrappyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ScrappyError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ScrappyError {
  constructor(message = "Access forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class RateLimitError extends ScrappyError {
  constructor(retryAfterSeconds: number, source?: string) {
    super(
      `Rate limit exceeded${source ? ` for ${source}` : ""}. Retry after ${retryAfterSeconds}s`,
      "RATE_LIMITED",
      429,
      { retryAfterSeconds, source },
    );
    this.name = "RateLimitError";
  }
}

export class CircuitBreakerError extends ScrappyError {
  constructor(source: string, resetTimeMs: number) {
    super(
      `Circuit breaker open for source '${source}'. Health degraded. Retry in ${Math.round(resetTimeMs / 1000)}s`,
      "CIRCUIT_BREAKER_OPEN",
      503,
      { source, resetTimeMs },
    );
    this.name = "CircuitBreakerError";
  }
}

export class SecuritySSRFError extends ScrappyError {
  constructor(blockedUrl: string, reason: string) {
    super(`SSRF protection blocked URL '${blockedUrl}': ${reason}`, "SSRF_ATTEMPT_DETECTED", 400, {
      blockedUrl,
      reason,
    });
    this.name = "SecuritySSRFError";
  }
}

export class TenantIsolationError extends ScrappyError {
  constructor(workspaceId: string, resourceId: string) {
    super(
      `Access denied: Resource '${resourceId}' does not belong to workspace '${workspaceId}'`,
      "TENANT_MISMATCH",
      403,
      { workspaceId, resourceId },
    );
    this.name = "TenantIsolationError";
  }
}
