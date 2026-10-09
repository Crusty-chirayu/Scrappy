"use client";

export interface SyntheticBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function SyntheticBadge({ className = "", size = "sm" }: SyntheticBadgeProps) {
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wide uppercase border bg-[var(--color-warn)]/10 text-[var(--color-warn)] border-[var(--color-warn)]/30 ${pad} ${className}`}
      title="Deterministic seed fixture for offline testing — not live merchant data (Rule 1)"
      aria-label="Synthetic Fixture Data"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warn)] animate-pulse" aria-hidden="true" />
      SYNTHETIC FIXTURE
    </span>
  );
}

export interface SyntheticDataBannerProps {
  message?: string;
  className?: string;
}

export function SyntheticDataBanner({
  message = "FIXTURE MODE ACTIVE — Displaying deterministic synthetic catalog records (is_synthetic: true). Never treated as live production data.",
  className = "",
}: SyntheticDataBannerProps) {
  return (
    <div
      role="alert"
      className={`w-full bg-[var(--surface-1)] border border-[var(--border-strong)] px-4 py-2.5 text-xs text-[var(--text-1)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] flex-shrink-0 animate-pulse" aria-hidden="true" />
        <span className="font-semibold tracking-wider text-[var(--color-warning)] uppercase">[DATA PROVENANCE NOTICE]</span>
        <span className="text-[11px] leading-relaxed text-[var(--text-2)]">{message}</span>
      </div>
      <span className="text-[10px] text-[var(--text-3)] border border-[var(--border-subtle)] rounded px-2 py-0.5 bg-[var(--surface-2)] whitespace-nowrap self-start sm:self-auto shrink-0">
        Constitution Rule 1 &amp; 3 Enforced
      </span>
    </div>
  );
}
