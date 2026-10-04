import { ExtractedOffer, DriftAnalysisResult } from "./types.js";

export interface DriftDetectorOptions {
  driftThreshold?: number; // default: 0.3
}

export class SchemaDriftDetector {
  private threshold: number;

  constructor(options: DriftDetectorOptions = {}) {
    this.threshold = options.driftThreshold ?? 0.3;
  }

  public analyze(offer: Partial<ExtractedOffer>): DriftAnalysisResult {
    const missingFields: string[] = [];
    const anomalies: string[] = [];
    let penalties = 0.0;

    // 1. Mandatory field checks
    if (!offer.title || offer.title.trim().length === 0) {
      missingFields.push("title");
      penalties += 0.4;
    } else if (offer.title.length < 5) {
      anomalies.push("Title suspiciously short (< 5 characters)");
      penalties += 0.15;
    }

    if (offer.pricePaise === undefined || offer.pricePaise === null) {
      missingFields.push("pricePaise");
      penalties += 0.4;
    } else if (offer.pricePaise <= 0) {
      anomalies.push("Price is zero or negative");
      penalties += 0.3;
    }

    if (!offer.merchantName) {
      missingFields.push("merchantName");
      penalties += 0.2;
    }

    // 2. Original price check
    if (offer.originalPricePaise !== undefined && offer.pricePaise !== undefined) {
      if (offer.originalPricePaise < offer.pricePaise) {
        anomalies.push("Original price is lower than discounted current price");
        penalties += 0.1;
      }
    }

    // 3. Provenance completeness check
    if (!offer.provenance) {
      missingFields.push("provenance");
      penalties += 0.3;
    } else {
      if (!offer.provenance.sourceUrl) {
        missingFields.push("provenance.sourceUrl");
        penalties += 0.1;
      }
      if (!offer.provenance.fetchedAt) {
        missingFields.push("provenance.fetchedAt");
        penalties += 0.1;
      }
    }

    const driftScore = Math.min(1.0, Math.round(penalties * 100) / 100);
    const isDrifted = driftScore >= this.threshold;

    return {
      driftScore,
      isDrifted,
      missingFields,
      anomalies,
    };
  }
}

export const defaultDriftDetector = new SchemaDriftDetector();
