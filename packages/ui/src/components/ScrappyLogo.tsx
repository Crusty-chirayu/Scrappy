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
  // Color tokens per state
  const stateConfig: Record<
    LogoState,
    { dotColor: string; ringColor: string; animClass: string; labelSuffix?: string }
  > = {
    idle: {
      dotColor: "#C6F135",
      ringColor: "#C6F135",
      animClass: "",
    },
    loading: {
      dotColor: "#C6F135",
      ringColor: "#C6F135",
      animClass: "animate-pulse",
      labelSuffix: "syncing",
    },
    fetching: {
      dotColor: "#5AA9FF",
      ringColor: "#5AA9FF",
      animClass: "animate-spin",
      labelSuffix: "extracting",
    },
    success: {
      dotColor: "#2FBF8A",
      ringColor: "#2FBF8A",
      animClass: "animate-bounce",
      labelSuffix: "resolved",
    },
    error: {
      dotColor: "#FF5C5C",
      ringColor: "#FF5C5C",
      animClass: "animate-ping",
      labelSuffix: "fault",
    },
    drift: {
      dotColor: "#FFB020",
      ringColor: "#FFB020",
      animClass: "animate-pulse",
      labelSuffix: "drift detected",
    },
    "circuit-broken": {
      dotColor: "#8B93A3",
      ringColor: "#FF5C5C",
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
        {/* Outer orbital / radar ring */}
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={`overflow-visible ${state === "fetching" ? "animate-spin" : ""}`}
        >
          {/* Static geometric frame */}
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#262E3C"
            strokeWidth="1.5"
          />

          {/* Dynamic ring segment according to state */}
          {state === "circuit-broken" ? (
            <>
              <line
                x1="8"
                y1="8"
                x2="24"
                y2="24"
                stroke="#FF5C5C"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="24"
                y1="8"
                x2="8"
                y2="24"
                stroke="#FF5C5C"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          ) : (
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke={config.ringColor}
              strokeWidth="2"
              strokeDasharray={state === "fetching" ? "20 70" : state === "drift" ? "6 6" : "100 0"}
              strokeLinecap="round"
              opacity={state === "idle" ? 0.3 : 0.9}
            />
          )}

          {/* Central precision node */}
          {state !== "circuit-broken" && (
            <circle
              cx="16"
              cy="16"
              r="5"
              fill={config.dotColor}
              className={config.animClass}
            />
          )}
        </svg>

        {/* Ambient glow for active operations */}
        {(state === "fetching" || state === "loading" || state === "error") && (
          <span
            className="absolute inset-0 rounded-full blur-[4px] opacity-40 -z-10"
            style={{ backgroundColor: config.dotColor }}
          />
        )}
      </div>

      {showLabel && (
        <div className="flex items-baseline gap-2">
          <span className="font-bold tracking-wider text-white text-sm">SCRAPPY</span>
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
