
export type SourceHealth = "healthy" | "degraded" | "broken" | "unavailable";

export interface SourceChipProps {
  sourceName: string;
  sourceId: string;
  url?: string;
  health?: SourceHealth;
  latencyMs?: number;
  className?: string;
}

const healthColors: Record<SourceHealth, { dot: string; title: string }> = {
  healthy: { dot: "bg-[#2FBF8A]", title: "Adapter healthy (99%+ success rate)" },
  degraded: { dot: "bg-[#F5B544]", title: "Adapter degraded (elevated latency or schema drift)" },
  broken: { dot: "bg-[#F2685B]", title: "Circuit broken (failures exceeded threshold)" },
  unavailable: { dot: "bg-[#8B93A3]", title: "Source currently unavailable or paused" },
};

export function SourceChip({
  sourceName,
  sourceId,
  url,
  health = "healthy",
  latencyMs,
  className = "",
}: SourceChipProps) {
  const currentHealth = healthColors[health];

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#141922] border border-[#262E3C] text-xs text-[#D6DBE3] font-medium transition-colors hover:border-[#5B677C] select-none ${className}`}
      title={`${sourceName} (${sourceId}) - ${currentHealth.title}${
        latencyMs ? ` | Latency: ${latencyMs}ms` : ""
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentHealth.dot} shrink-0`} aria-hidden="true" />
      <span>{sourceName}</span>
      {latencyMs !== undefined && (
        <span className="font-mono tabular-nums text-[10px] text-[#5B677C]">
          {latencyMs}ms
        </span>
      )}
      {url && (
        <svg
          className="w-3 h-3 text-[#5B677C]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex focus:outline-none focus:ring-1 focus:ring-[#C6F135] rounded-[2px]"
      >
        {content}
      </a>
    );
  }

  return content;
}
