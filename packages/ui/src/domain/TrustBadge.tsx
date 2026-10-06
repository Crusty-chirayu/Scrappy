
export type TrustState =
  | "verified"
  | "estimated"
  | "matched"
  | "possible_match"
  | "source_unavailable";

export interface TrustBadgeProps {
  state: TrustState;
  confidence?: number; // 0.0 - 1.0
  source?: string;
  extractionMethod?: "http" | "browser" | "api" | "feed";
  className?: string;
}

const trustConfig: Record<
  TrustState,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dotColor: string;
    description: string;
  }
> = {
  verified: {
    label: "Verified",
    bg: "bg-[var(--color-success)]/10",
    text: "text-[var(--color-success)]",
    border: "border-[var(--color-success)]/30",
    dotColor: "bg-[var(--color-success)]",
    description: "High-confidence verified match with verified provenance.",
  },
  estimated: {
    label: "Estimated",
    bg: "bg-[var(--color-info)]/10",
    text: "text-[var(--color-info)]",
    border: "border-[var(--color-info)]/30",
    dotColor: "bg-[var(--color-info)]",
    description: "Computed or estimated value from historical data.",
  },
  matched: {
    label: "Matched",
    bg: "bg-[var(--surface-2)]",
    text: "text-[var(--text-1)]",
    border: "border-[var(--border)]",
    dotColor: "bg-[var(--text-3)]",
    description: "Standard canonical match against catalog criteria.",
  },
  possible_match: {
    label: "Possible match",
    bg: "bg-[var(--color-warn)]/10",
    text: "text-[var(--color-warn)]",
    border: "border-[var(--color-warn)]/30",
    dotColor: "bg-[var(--color-warn)]",
    description: "Unconfirmed candidate match; never merged silently.",
  },
  source_unavailable: {
    label: "Source unavailable",
    bg: "bg-[var(--surface-2)]",
    text: "text-[var(--text-2)]",
    border: "border-[var(--border)]",
    dotColor: "bg-[var(--text-3)]",
    description: "Source adapter is degraded or unsupported.",
  },
};

export function TrustBadge({
  state,
  confidence,
  source,
  extractionMethod,
  className = "",
}: TrustBadgeProps) {
  const conf = trustConfig[state];
  const percentText =
    confidence !== undefined ? `${Math.round(confidence * 100)}%` : null;

  const tooltipTitle = `${conf.label}: ${conf.description}${
    source ? ` | Source: ${source}` : ""
  }${extractionMethod ? ` [${extractionMethod.toUpperCase()}]` : ""}`;

  return (
    <span
      title={tooltipTitle}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-xs font-medium border select-none transition-colors ${conf.bg} ${conf.text} ${conf.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dotColor} shrink-0`} aria-hidden="true" />
      <span>{conf.label}</span>
      {percentText && (
        <span className="font-mono tabular-nums text-[10px] pl-0.5">
          ({percentText})
        </span>
      )}
    </span>
  );
}
