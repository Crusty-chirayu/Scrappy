
export interface DataFreshnessProps {
  fetchedAt: string | Date;
  source?: string;
  extractionMethod?: string;
  confidence?: number;
  adapterVersion?: string;
  className?: string;
}

export function getRelativeTimeString(date: Date, now: Date = new Date()): string {
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export function DataFreshness({
  fetchedAt,
  source,
  extractionMethod,
  confidence,
  adapterVersion,
  className = "",
}: DataFreshnessProps) {
  const date = typeof fetchedAt === "string" ? new Date(fetchedAt) : fetchedAt;
  const relativeTime = getRelativeTimeString(date);
  const ageMs = Date.now() - date.getTime();
  const isFresh = ageMs < 15 * 60 * 1000; // < 15m
  const isStale = ageMs > 24 * 60 * 60 * 1000; // > 24h

  const dotColor = isFresh ? "bg-[var(--color-success)]" : isStale ? "bg-[var(--color-warn)]" : "bg-[var(--color-info)]";
  const statusLabel = isFresh ? "Fresh" : isStale ? "Stale" : "Recent";

  const provenanceTooltip = [
    `Freshness: ${statusLabel} (${relativeTime})`,
    `Fetched At: ${date.toISOString()}`,
    source ? `Source: ${source}` : null,
    extractionMethod ? `Method: ${extractionMethod.toUpperCase()}` : null,
    confidence !== undefined ? `Confidence: ${(confidence * 100).toFixed(1)}%` : null,
    adapterVersion ? `Adapter v${adapterVersion}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span
      title={provenanceTooltip}
      className={`inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] select-none cursor-help hover:text-[var(--text-1)] transition-colors ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} aria-hidden="true" />
      <span>{relativeTime}</span>
    </span>
  );
}
