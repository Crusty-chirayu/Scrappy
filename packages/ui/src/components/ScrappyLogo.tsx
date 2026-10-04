export type LogoState =
  | "idle"
  | "loading"
  | "fetching"
  | "success"
  | "error"
  | "drift"
  | "circuit-broken";

export interface ScrappyLogoProps {
  state?: LogoState;
  size?: number; // default 24
  showLabel?: boolean;
  className?: string;
}

export function ScrappyLogo({
  state = "idle",
  size = 24,
  showLabel = true,
  className = "",
}: ScrappyLogoProps) {
  // Color tokens and motion classes per state
  const stateConfig: Record<
    LogoState,
    { dotColor: string; traceColor: string; animClass: string; labelSuffix?: string }
  > = {
    idle: {
      dotColor: "#C6F135",
      traceColor: "#5B677C",
      animClass: "motion-safe:animate-pulse",
    },
    loading: {
      dotColor: "#C6F135",
      traceColor: "#C6F135",
      animClass: "motion-safe:animate-pulse",
      labelSuffix: "syncing",
    },
    fetching: {
      dotColor: "#5AA9FF",
      traceColor: "#5AA9FF",
      animClass: "motion-safe:animate-spin",
      labelSuffix: "extracting",
    },
    success: {
      dotColor: "#2FBF8A",
      traceColor: "#2FBF8A",
      animClass: "motion-safe:animate-bounce",
      labelSuffix: "resolved",
    },
    error: {
      dotColor: "#F2685B",
      traceColor: "#F2685B",
      animClass: "motion-safe:animate-ping",
      labelSuffix: "fault",
    },
    drift: {
      dotColor: "#F5B544",
      traceColor: "#F5B544",
      animClass: "motion-safe:animate-pulse",
      labelSuffix: "drift detected",
    },
    "circuit-broken": {
      dotColor: "#8B93A3",
      traceColor: "#F2685B",
      animClass: "",
      labelSuffix: "isolated",
    },
  };

  const config = stateConfig[state];

  return (
    <div
      className={`inline-flex items-center gap-2.5 font-mono select-none ${className}`}
      data-testid="scrappy-logo"
      data-state={state}
      role="img"
      aria-label={`SCRAPPY logo (${state})`}
    >
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={`overflow-visible ${state === "fetching" ? "motion-safe:animate-spin" : ""}`}
        >
          {/* Static geometric outer frame */}
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            className="text-[#262E3C] dark:text-[#262E3C]"
            strokeWidth="1.2"
          />

          {/* "The Convergence" — Three incoming traces from disparate sources converging into the single trusted node */}
          {state === "circuit-broken" ? (
            <>
              {/* Broken trace 1 with air gap */}
              <path d="M 4 9 H 10" stroke="#F2685B" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 14 13 L 16 16" stroke="#8B93A3" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
              {/* Interrupted trace 2 */}
              <path d="M 4 16 H 11" stroke="#F2685B" strokeWidth="1.5" strokeLinecap="round" />
              {/* Trace 3 */}
              <path d="M 4 23 H 9" stroke="#F2685B" strokeWidth="1.5" strokeLinecap="round" />
              {/* Trip cross marker */}
              <line x1="12" y1="12" x2="20" y2="20" stroke="#F2685B" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="12" x2="12" y2="20" stroke="#F2685B" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Upper trace */}
              <path
                d="M 4 9 H 11 Q 14 9 15 13 L 16 16"
                fill="none"
                stroke={config.traceColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={state === "drift" ? "3 2" : undefined}
                opacity={state === "idle" ? 0.7 : 0.95}
              />
              {/* Center direct trace */}
              <path
                d="M 4 16 H 16"
                fill="none"
                stroke={config.traceColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={state === "idle" ? 0.8 : 1}
              />
              {/* Lower trace */}
              <path
                d="M 4 23 H 11 Q 14 23 15 19 L 16 16"
                fill="none"
                stroke={config.traceColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={state === "drift" ? "3 2" : undefined}
                opacity={state === "idle" ? 0.7 : 0.95}
              />
            </>
          )}

          {/* Central precision node (The single trusted point) */}
          {state !== "circuit-broken" && (
            <circle
              cx="16"
              cy="16"
              r="4"
              fill={config.dotColor}
              className={`${config.animClass} motion-reduce:animate-none`}
            />
          )}
        </svg>

        {/* Ambient indicator glow */}
        {(state === "fetching" || state === "loading" || state === "error") && (
          <span
            className="absolute inset-0 rounded-full blur-[4px] opacity-40 -z-10 motion-reduce:hidden"
            style={{ backgroundColor: config.dotColor }}
          />
        )}
      </div>

      {showLabel && (
        <div className="flex items-baseline gap-2">
          <span className="font-bold tracking-wider text-current text-sm">SCRAPPY</span>
          {config.labelSuffix && (
            <span
              className="text-[10px] uppercase tracking-widest px-1 py-0.2 rounded border text-opacity-90 font-mono"
              style={{
                color: config.dotColor,
                borderColor: `${config.dotColor}40`,
                backgroundColor: `${config.dotColor}10`,
              }}
            >
              {config.labelSuffix}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
