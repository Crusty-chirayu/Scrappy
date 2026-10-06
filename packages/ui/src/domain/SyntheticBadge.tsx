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
      className={`w-full bg-[#1A1500] border-y border-[#FFB020]/40 px-4 py-2.5 text-xs text-[#FFE082] flex items-center justify-between gap-4 font-mono ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#FFB020] flex-shrink-0 animate-ping" aria-hidden="true" />
        <span className="font-semibold tracking-wider text-[#FFB020] uppercase">[DATA PROVENANCE NOTICE]</span>
        <span>{message}</span>
      </div>
      <span className="text-[10px] text-[#FFB020]/80 border border-[#FFB020]/30 rounded px-2 py-0.5 bg-[#FFB020]/5 whitespace-nowrap">
        Constitution Rule 1 &amp; 3 Enforced
      </span>
    </div>
  );
}
