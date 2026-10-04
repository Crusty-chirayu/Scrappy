import React from "react";

export interface PriceDropEmailProps {
  productTitle: string;
  storeName: string;
  previousPricePaise: number;
  newPricePaise: number;
  targetPricePaise: number;
  productUrl: string;
}

export function PriceDropEmail({
  productTitle,
  storeName,
  previousPricePaise,
  newPricePaise,
  targetPricePaise,
  productUrl,
}: PriceDropEmailProps) {
  const newRupees = Math.round(newPricePaise / 100).toLocaleString("en-IN");
  const prevRupees = Math.round(previousPricePaise / 100).toLocaleString("en-IN");
  const targetRupees = Math.round(targetPricePaise / 100).toLocaleString("en-IN");
  const savingsRupees = Math.round((previousPricePaise - newPricePaise) / 100).toLocaleString("en-IN");

  return (
    <div style={{ fontFamily: "sans-serif", backgroundColor: "#0A0C0F", color: "#D6DBE3", padding: "24px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#0F1217", border: "1px solid #262E3C", borderRadius: "4px", padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#C6F135", marginRight: "8px" }}></span>
          <span style={{ fontFamily: "monospace", fontWeight: "bold", letterSpacing: "1px", color: "#FFFFFF" }}>SCRAPPY PRICE ALERT</span>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#FFFFFF", margin: "0 0 12px 0" }}>
          Price Drop: {productTitle}
        </h1>

        <p style={{ fontSize: "14px", color: "#98A2B3", lineHeight: "1.5", margin: "0 0 20px 0" }}>
          Great news! The price for this product has dropped below your target alert of <strong style={{ color: "#FFFFFF" }}>₹{targetRupees}</strong> on <strong style={{ color: "#C6F135" }}>{storeName}</strong>.
        </p>

        <div style={{ backgroundColor: "#141922", border: "1px solid #262E3C", borderRadius: "4px", padding: "16px", marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", color: "#5B677C", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Lowest Offer</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2FBF8A", margin: "4px 0" }}>₹{newRupees}</div>
          <div style={{ fontSize: "12px", color: "#98A2B3" }}>
            Was ₹{prevRupees} · You save <strong style={{ color: "#2FBF8A" }}>₹{savingsRupees}</strong>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={productUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#C6F135",
              color: "#0A0C0F",
              fontWeight: "bold",
              fontSize: "14px",
              padding: "12px 28px",
              borderRadius: "3px",
              textDecoration: "none",
            }}
          >
            View Live Deal On Scrappy →
          </a>
        </div>

        <p style={{ fontSize: "11px", color: "#5B677C", borderTop: "1px solid #1A202B", paddingTop: "16px", margin: 0 }}>
          You received this email because you configured a price alert on Scrappy. Provenance and timestamps are cryptographically verified.
        </p>
      </div>
    </div>
  );
}
