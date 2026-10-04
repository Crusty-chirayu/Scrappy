
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
    bg: "bg-[#2FBF8A]/10",
    text: "text-[#2FBF8A]",
    border: "border-[#2FBF8A]/30",
    dotColor: "bg-[#2FBF8A]",
    description: "High-confidence verified match with verified provenance.",
  },
  estimated: {
    label: "Estimated",
    bg: "bg-[#5AA9FF]/10",
    text: "text-[#5AA9FF]",
    border: "border-[#5AA9FF]/30",
    dotColor: "bg-[#5AA9FF]",
    description: "Computed or estimated value from historical data.",
  },
  matched: {
    label: "Matched",
    bg: "bg-[#1A202B]",
    text: "text-[#D6DBE3]",
    border: "border-[#262E3C]",
    dotColor: "bg-[#98A2B3]",
    description: "Standard canonical match against catalog criteria.",
  },
  possible_match: {
    label: "Possible match",
    bg: "bg-[#9A7BFF]/10",
    text: "text-[#9A7BFF]",
    border: "border-[#9A7BFF]/30",
    dotColor: "bg-[#9A7BFF]",
    description: "Unconfirmed candidate match; never merged silently.",
  },
  source_unavailable: {
    label: "Source unavailable",
    bg: "bg-[#8B93A3]/10",
    text: "text-[#8B93A3]",
    border: "border-[#8B93A3]/30",
    dotColor: "bg-[#8B93A3]",
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
        <span className="font-mono tabular-nums text-[10px] opacity-80 pl-0.5">
          ({percentText})
        </span>
      )}
    </span>
  );
}
