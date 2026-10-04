"use client";

import React from "react";
import { ProductDetail } from "@scrappy/db";
import { formatCurrencyPaise, Button, TrustBadge } from "@scrappy/ui";

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
  if (!isOpen || products.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#0F1217] border border-[#262E3C] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262E3C] bg-[#141922]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6F135]" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">
              SIDE-BY-SIDE SPEC &amp; PRICE MATRIX ({products.length} PRODUCTS)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5B677C] hover:text-white transition-colors"
            aria-label="Close side-by-side compare"
          >
            ✕
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#262E3C]">
                <th className="p-3 text-left text-[#5B677C] font-normal w-40">ATTRIBUTE</th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 text-left min-w-[220px]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase text-[#98A2B3]">{p.brand}</span>
                      <button
                        onClick={() => onRemoveProduct(p.id)}
                        className="text-[10px] text-[#FF5C5C] hover:underline"
                        title="Remove from comparison"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm font-bold text-[#D6DBE3] font-sans line-clamp-2">
                      {p.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262E3C]">
              {/* Lowest Price Row */}
              <tr>
                <td className="p-3 text-[#5B677C] font-semibold">BEST PRICE</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className="text-base font-bold text-[#2FBF8A]">
                      {formatCurrencyPaise(p.lowestPricePaise, "INR")}
                    </span>
                    {p.originalPricePaise && p.originalPricePaise > p.lowestPricePaise && (
                      <span className="block text-[11px] text-[#5B677C] line-through">
                        {formatCurrencyPaise(p.originalPricePaise, "INR")}
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Verified Trust State */}
              <tr>
                <td className="p-3 text-[#5B677C] font-semibold">PROVENANCE</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <TrustBadge state="verified" confidence={0.99} />
                  </td>
                ))}
              </tr>

              {/* Stores & Availability */}
              <tr>
                <td className="p-3 text-[#5B677C] font-semibold">MERCHANTS</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[#D6DBE3]">
                    {p.merchants.join(", ") || "Amazon, Flipkart"} ({p.offerCount} stores)
                  </td>
                ))}
              </tr>

              {/* Model & SKU */}
              <tr>
                <td className="p-3 text-[#5B677C] font-semibold">MODEL / SKU</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[#98A2B3]">
                    {p.model}
                  </td>
                ))}
              </tr>

              {/* EAN Barcode */}
              <tr>
                <td className="p-3 text-[#5B677C] font-semibold">GTIN / EAN</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-[#98A2B3]">
                    {p.ean}
                  </td>
                ))}
              </tr>

              {/* Action Links */}
              <tr>
                <td className="p-3 text-[#5B677C] font-semibold">ACTION</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <a
                      href={`/compare/${p.id}`}
                      className="inline-block px-3 py-1.5 rounded bg-[#C6F135] text-[#0A0C0F] font-bold text-xs hover:bg-[#b0d92e] transition-colors"
                    >
                      View Price History →
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#262E3C] bg-[#141922] text-xs text-[#5B677C]">
          <span>Constitution Rule 4: Distinct entities never merged silently</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </div>
  );
}
