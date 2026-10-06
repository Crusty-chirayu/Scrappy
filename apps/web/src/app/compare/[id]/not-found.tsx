import React from "react";
import Link from "next/link";
import { Button, EmptyState } from "@scrappy/ui";

export default function ProductNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="p-8 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-[var(--elevation-2)]">
        <EmptyState
          title="Product Not Found in Catalog"
          description="The requested product ID could not be resolved against indexed merchant feeds. It may have been delisted or merged into a canonical SKU."
        />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/compare">
            <Button variant="primary">
              Browse All Products
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">
              Search Landing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
