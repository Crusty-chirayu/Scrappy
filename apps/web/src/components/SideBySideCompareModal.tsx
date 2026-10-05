"use client";

import React from "react";
import Link from "next/link";
import { ProductDetail } from "@scrappy/db";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Badge,
  CloseIcon,
} from "@scrappy/ui";

export interface SideBySideCompareModalProps {
  products: ProductDetail[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (id: string) => void;
}

export function SideBySideCompareModal({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
}: SideBySideCompareModalProps) {
  if (products.length === 0) return null;

  // Determine if rows differ across selected products for "differs" highlight
  const allBrandsSame = products.every((p) => p.brand === products[0]?.brand);
  const allCategoriesSame = products.every((p) => p.category === products[0]?.category);
  const allPricesSame = products.every((p) => p.lowestPricePaise === products[0]?.lowestPricePaise);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-[var(--surface-1)] border-[var(--border-default)] shadow-[var(--elevation-3)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              <DialogTitle className="text-base font-sans font-semibold text-[var(--text-1)] tracking-tight">
                Side-by-Side Product Comparison ({products.length} of 4)
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
              aria-label="Close comparison modal"
            >
              <CloseIcon size={16} />
            </button>
          </div>
          <DialogDescription className="text-xs font-sans text-[var(--text-2)] mt-1">
            Compare specs, pricing spread, merchant availability, and verification telemetry side-by-side. Highlighted rows indicate differing specifications.
          </DialogDescription>
        </div>

        {/* Comparison Matrix Table with Sticky First Column */}
        <div className="overflow-x-auto max-h-[70vh] p-6">
          <table className="w-full border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                {/* Sticky First Column */}
                <th className="p-3 text-left font-mono text-[11px] text-[var(--text-3)] uppercase tracking-wider sticky left-0 z-10 bg-[var(--surface-1)] min-w-[140px] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  Specification
                </th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 text-left min-w-[220px] max-w-[260px] align-top">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <Badge variant="outline" size="sm">
                        {p.brand}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(p.id)}
                        className="text-[11px] font-mono text-[var(--color-danger)] hover:underline"
                        title="Remove from comparison"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-1)] line-clamp-2 leading-snug">
                      {p.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
              {/* Best Current Price */}
              <tr className={!allPricesSame ? "bg-[var(--color-accent-soft)]/10" : ""}>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-1.5">
                    <span>Best Price</span>
                    {!allPricesSame && <span className="text-[10px] text-[var(--color-accent)] font-semibold">(differs)</span>}
                  </div>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <div className="text-base font-bold text-[var(--color-success)]">
                      ₹{(p.lowestPricePaise / 100).toLocaleString("en-IN")}
                    </div>
                    {p.originalPricePaise && p.originalPricePaise > p.lowestPricePaise && (
                      <div className="text-[11px] text-[var(--text-3)] line-through">
                        MRP ₹{(p.originalPricePaise / 100).toLocaleString("en-IN")}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr className={!allBrandsSame ? "bg-[var(--color-accent-soft)]/10" : ""}>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-1.5">
                    <span>Brand</span>
                    {!allBrandsSame && <span className="text-[10px] text-[var(--color-accent)] font-semibold">(differs)</span>}
                  </div>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[var(--text-1)] font-sans">
                    {p.brand}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className={!allCategoriesSame ? "bg-[var(--color-accent-soft)]/10" : ""}>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {!allCategoriesSame && <span className="text-[10px] text-[var(--color-accent)] font-semibold">(differs)</span>}
                  </div>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[var(--text-1)] font-sans">
                    {p.category}
                  </td>
                ))}
              </tr>

              {/* Available Merchants */}
              <tr>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  Merchants
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[var(--text-2)]">
                    <div>{p.merchants.join(", ") || "Amazon, Flipkart, Croma"}</div>
                    <div className="text-[10px] text-[var(--text-3)]">{p.offerCount} verified stores</div>
                  </td>
                ))}
              </tr>

              {/* Model Number */}
              <tr>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  Model / SKU
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[var(--text-2)]">
                    {p.model}
                  </td>
                ))}
              </tr>

              {/* EAN Barcode */}
              <tr>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  EAN / GTIN
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[var(--text-3)]">
                    {p.ean}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-3 font-semibold text-[var(--text-2)] sticky left-0 z-10 bg-[var(--surface-1)] shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                  Action
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <Link href={`/compare/${p.id}`}>
                      <Button variant="primary" size="sm" className="w-full text-xs font-mono">
                        View Price History →
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-default)] bg-[var(--surface-2)]/50 text-xs font-mono text-[var(--text-3)]">
          <span>Constitution Rule 4: Distinct entities never merged silently</span>
          <Button variant="secondary" size="sm" onClick={onClose} className="font-mono text-xs">
            Close Matrix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
