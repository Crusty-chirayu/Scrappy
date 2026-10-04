import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TrustBadge } from "./TrustBadge.js";
import { SourceChip } from "./SourceChip.js";
import { PriceTag, formatCurrencyPaise } from "./PriceTag.js";
import { DataFreshness, getRelativeTimeString } from "./DataFreshness.js";
import { Sparkline } from "./Sparkline.js";
import { SyntheticBadge, SyntheticDataBanner } from "./SyntheticBadge.js";
import { ScrappyLogo } from "../components/ScrappyLogo.js";

describe("@scrappy/ui Domain Components", () => {
  describe("TrustBadge", () => {
    it("renders verified state with confidence score", () => {
      const html = renderToStaticMarkup(
        <TrustBadge state="verified" confidence={0.98} source="amazon-in" extractionMethod="http" />,
      );
      expect(html).toContain("Verified");
      expect(html).toContain("(98%)");
      expect(html).toContain("Source: amazon-in");
      expect(html).toContain("[HTTP]");
    });

    it("renders possible_match state per Constitution Rule 4", () => {
      const html = renderToStaticMarkup(
        <TrustBadge state="possible_match" confidence={0.65} />,
      );
      expect(html).toContain("Possible match");
      expect(html).toContain("(65%)");
      expect(html).toContain("text-[#9A7BFF]"); // Uncertain color
    });

    it("renders source_unavailable state per Constitution Rule 6", () => {
      const html = renderToStaticMarkup(
        <TrustBadge state="source_unavailable" source="croma" />,
      );
      expect(html).toContain("Source unavailable");
      expect(html).toContain("Source: croma");
    });
  });

  describe("SourceChip", () => {
    it("renders source name, health dot, and latency", () => {
      const html = renderToStaticMarkup(
        <SourceChip sourceName="Flipkart" sourceId="flipkart" health="healthy" latencyMs={142} />,
      );
      expect(html).toContain("Flipkart");
      expect(html).toContain("142ms");
      expect(html).toContain("bg-[#2FBF8A]");
    });

    it("renders anchor tag when url is provided", () => {
      const html = renderToStaticMarkup(
        <SourceChip sourceName="Amazon.in" sourceId="amazon-in" url="https://amazon.in/dp/123" />,
      );
      expect(html).toContain('<a href="https://amazon.in/dp/123"');
      expect(html).toContain('target="_blank"');
    });
  });

  describe("PriceTag", () => {
    it("formats paise into currency string", () => {
      const formatted = formatCurrencyPaise(4999900, "INR");
      expect(formatted).toContain("49,999");
    });

    it("renders current price, strikethrough original price, and discount percentage", () => {
      const html = renderToStaticMarkup(
        <PriceTag pricePaise={4000000} originalPricePaise={5000000} isLowestPrice />,
      );
      expect(html).toContain("40,000");
      expect(html).toContain("50,000");
      expect(html).toContain("-20%");
      expect(html).toContain("Lowest");
    });
  });

  describe("DataFreshness", () => {
    it("computes relative time strings correctly", () => {
      const now = new Date("2026-10-04T12:00:00Z");
      const justNow = new Date("2026-10-04T11:59:45Z");
      const tenMins = new Date("2026-10-04T11:50:00Z");
      const twoHours = new Date("2026-10-04T10:00:00Z");
      const threeDays = new Date("2026-10-01T12:00:00Z");

      expect(getRelativeTimeString(justNow, now)).toBe("just now");
      expect(getRelativeTimeString(tenMins, now)).toBe("10m ago");
      expect(getRelativeTimeString(twoHours, now)).toBe("2h ago");
      expect(getRelativeTimeString(threeDays, now)).toBe("3d ago");
    });

    it("renders freshness ticker with provenance title", () => {
      const fetchedAt = new Date().toISOString();
      const html = renderToStaticMarkup(
        <DataFreshness
          fetchedAt={fetchedAt}
          source="amazon-in"
          extractionMethod="http"
          confidence={0.99}
          adapterVersion="0.1.0"
        />,
      );
      expect(html).toContain("Source: amazon-in");
      expect(html).toContain("Method: HTTP");
      expect(html).toContain("Confidence: 99.0%");
      expect(html).toContain("Adapter v0.1.0");
    });
  });

  describe("Sparkline", () => {
    it("renders SVG sparkline and accessible screen-reader table alternative", () => {
      const points = [
        { date: "2026-09-01", price: 4500000 },
        { date: "2026-09-15", price: 4300000 },
        { date: "2026-10-01", price: 3999900 },
      ];
      const html = renderToStaticMarkup(<Sparkline data={points} showMinMax />);
      expect(html).toContain("<svg");
      expect(html).toContain("<polyline");
      expect(html).toContain("<circle");
      // Screen reader alternative (WCAG 2.2 AA)
      expect(html).toContain('<table class="sr-only"');
      expect(html).toContain("Price history sparkline data");
      expect(html).toContain("2026-09-01");
      expect(html).toContain("39999.00");
      // Min max
      expect(html).toContain("L: ₹39999");
      expect(html).toContain("H: ₹45000");
    });
  });

  describe("SyntheticBadge & SyntheticDataBanner (Constitution Rule 1)", () => {
    it("renders synthetic warning badge", () => {
      const html = renderToStaticMarkup(<SyntheticBadge />);
      expect(html).toContain("SYNTHETIC FIXTURE");
      expect(html).toContain("border-[#FFB020]/30");
    });

    it("renders synthetic provenance banner with alert role", () => {
      const html = renderToStaticMarkup(<SyntheticDataBanner />);
      expect(html).toContain('role="alert"');
      expect(html).toContain("[DATA PROVENANCE NOTICE]");
      expect(html).toContain("is_synthetic: true");
    });
  });

  describe("ScrappyLogo (7 animated operational states)", () => {
    const states = [
      "idle",
      "loading",
      "fetching",
      "success",
      "error",
      "drift",
      "circuit-broken",
    ] as const;

    states.forEach((st) => {
      it(`renders logo in '${st}' state with proper accessibility and attributes`, () => {
        const html = renderToStaticMarkup(<ScrappyLogo state={st} />);
        expect(html).toContain(`data-state="${st}"`);
        expect(html).toContain("SCRAPPY");
      });
    });
  });
});
