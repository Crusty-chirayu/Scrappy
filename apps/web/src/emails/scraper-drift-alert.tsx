import React from "react";

export interface ScraperDriftAlertEmailProps {
  sourceName: string;
  sourceUrl: string;
  driftScore: number;
  missingFields: string[];
  anomalies: string[];
  circuitState: "HEALTHY" | "DEGRADED" | "OPEN";
}

export function ScraperDriftAlertEmail({
  sourceName,
  sourceUrl,
  driftScore,
  missingFields,
  anomalies,
  circuitState,
}: ScraperDriftAlertEmailProps) {
  const driftPercent = Math.round(driftScore * 100);

  return (
    <div style={{ fontFamily: "sans-serif", backgroundColor: "#0A0C0F", color: "#D6DBE3", padding: "24px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0F1217", border: "1px solid #262E3C", borderRadius: "4px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#FFB020", marginRight: "8px" }}></span>
          <span style={{ fontFamily: "monospace", fontWeight: "bold", letterSpacing: "1px", color: "#FFB020" }}>
            SCRAPPY EXTRACTOR DRIFT ALERT
          </span>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#FFFFFF", margin: "0 0 12px 0" }}>
          Structural Drift Detected on {sourceName}
        </h1>

        <p style={{ fontSize: "14px", color: "#98A2B3", lineHeight: "1.5", margin: "0 0 20px 0" }}>
          Automated canary testing detected structural schema divergence on <strong>{sourceName}</strong> with a drift score of <strong style={{ color: "#FFB020" }}>{driftPercent}%</strong>.
        </p>

        <div style={{ backgroundColor: "#141922", border: "1px solid #262E3C", borderRadius: "4px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "#5B677C", fontFamily: "monospace", marginBottom: "8px" }}>DRIFT DIAGNOSTICS</div>
          <div style={{ fontSize: "13px", color: "#D6DBE3", marginBottom: "4px" }}>Circuit Breaker State: <strong style={{ color: circuitState === "OPEN" ? "#FF5C5C" : "#FFB020" }}>{circuitState}</strong></div>
          <div style={{ fontSize: "13px", color: "#D6DBE3", marginBottom: "4px" }}>Missing Selectors: {missingFields.length > 0 ? missingFields.join(", ") : "None"}</div>
          <div style={{ fontSize: "13px", color: "#D6DBE3" }}>Anomalies: {anomalies.length > 0 ? anomalies.join("; ") : "None"}</div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={sourceUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#141922",
              border: "1px solid #262E3C",
              color: "#C6F135",
              fontWeight: "bold",
              fontSize: "13px",
              padding: "10px 24px",
              borderRadius: "3px",
              textDecoration: "none",
              fontFamily: "monospace",
            }}
          >
            Review Selector Fallback Chain →
          </a>
        </div>

        <div style={{ borderTop: "1px solid #262E3C", paddingTop: "16px", fontSize: "11px", color: "#5B677C", textAlign: "center", fontFamily: "monospace" }}>
          SCRAPPY Precision Data Pipeline · Autonomous Source Health
        </div>
      </div>
    </div>
  );
}
