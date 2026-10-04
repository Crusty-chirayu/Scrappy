import { Provenance, SourceId } from "../types/index.js";

export type DomainEventType =
  | "offer.price_changed"
  | "offer.stock_changed"
  | "product.discovered"
  | "product.matched"
  | "alert.triggered"
  | "scraping.job_completed"
  | "scraping.job_failed"
  | "circuit_breaker.tripped"
  | "extraction.completed";

export interface BaseDomainEvent<TType extends DomainEventType, TPayload> {
  id: string;
  type: TType;
  timestamp: string; // ISO string
  payload: TPayload;
}

export type PriceChangedEvent = BaseDomainEvent<
  "offer.price_changed",
  {
    productId: string;
    offerId: string;
    source: SourceId;
    oldPricePaise: number;
    newPricePaise: number;
    deltaPaise: number;
    provenance: Provenance;
  }
>;

export type AlertTriggeredEvent = BaseDomainEvent<
  "alert.triggered",
  {
    alertId: string;
    userId: string;
    productId: string;
    targetPricePaise: number;
    currentPricePaise: number;
    notificationChannels: ("email" | "in_app" | "webhook")[];
  }
>;

export type DomainEvent = PriceChangedEvent | AlertTriggeredEvent;
