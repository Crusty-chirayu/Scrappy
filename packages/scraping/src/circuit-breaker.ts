import { CircuitBreakerError } from "@scrappy/core";

export interface CircuitBreakerConfig {
  failureThreshold: number; // e.g. 5 consecutive failures
  cooldownMs: number; // e.g. 60000 (1 min)
}

export class SourceCircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private nextAttemptTimestamp = 0;

  constructor(
    public readonly sourceId: string,
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 5,
      cooldownMs: 60_000,
    },
  ) {}

  public checkHealth(): void {
    const now = Date.now();
    if (this.state === "OPEN") {
      if (now >= this.nextAttemptTimestamp) {
        this.state = "HALF_OPEN";
      } else {
        throw new CircuitBreakerError(this.sourceId, this.nextAttemptTimestamp - now);
      }
    }
  }

  public recordSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  public recordFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN";
      this.nextAttemptTimestamp = Date.now() + this.config.cooldownMs;
    }
  }

  public getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }
}
