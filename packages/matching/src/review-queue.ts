import { Product } from "@scrappy/core";
import { CandidateOffer, MatchDecision } from "./types.js";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewQueueItem {
  id: string;
  offer: CandidateOffer;
  candidateProduct: Product;
  decision: MatchDecision;
  status: ReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export class MatchReviewQueue {
  private queue: Map<string, ReviewQueueItem> = new Map();

  public enqueue(
    offer: CandidateOffer,
    candidateProduct: Product,
    decision: MatchDecision,
  ): ReviewQueueItem {
    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const item: ReviewQueueItem = {
      id,
      offer,
      candidateProduct,
      decision,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.queue.set(id, item);
    return item;
  }

  public getPending(): ReviewQueueItem[] {
    return Array.from(this.queue.values()).filter((item) => item.status === "pending");
  }

  public getAll(): ReviewQueueItem[] {
    return Array.from(this.queue.values());
  }

  public approve(id: string, reviewedBy: string, notes?: string): ReviewQueueItem {
    const item = this.queue.get(id);
    if (!item) throw new Error(`Review item '${id}' not found`);

    item.status = "approved";
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = reviewedBy;
    if (notes) item.reviewerNotes = notes;

    return item;
  }

  public reject(id: string, reviewedBy: string, notes?: string): ReviewQueueItem {
    const item = this.queue.get(id);
    if (!item) throw new Error(`Review item '${id}' not found`);

    item.status = "rejected";
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = reviewedBy;
    if (notes) item.reviewerNotes = notes;

    return item;
  }
}
