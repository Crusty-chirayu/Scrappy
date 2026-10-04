/**
 * Per-host token bucket / delay rate limiter to ensure responsible crawling.
 * Enforces minimum delay between consecutive requests to the same hostname.
 */
export class HostRateLimiter {
  private lastRequestTimes = new Map<string, number>();
  private defaultDelayMs: number;
  private hostDelays = new Map<string, number>();

  constructor(defaultDelayMs = 1000) {
    this.defaultDelayMs = defaultDelayMs;
  }

  public setHostDelay(hostname: string, delayMs: number): void {
    this.hostDelays.set(hostname.toLowerCase(), delayMs);
  }

  public getHostDelay(hostname: string): number {
    return this.hostDelays.get(hostname.toLowerCase()) ?? this.defaultDelayMs;
  }

  public async acquire(hostname: string): Promise<void> {
    const host = hostname.toLowerCase();
    const delay = this.getHostDelay(host);
    const now = Date.now();
    const lastTime = this.lastRequestTimes.get(host) ?? 0;
    const elapsed = now - lastTime;

    if (elapsed < delay) {
      const waitTime = delay - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTimes.set(host, Date.now());
  }

  public reset(): void {
    this.lastRequestTimes.clear();
  }
}

export const globalRateLimiter = new HostRateLimiter(1000);
