"use client";

import React from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@scrappy/ui";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`font-mono text-xs ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[var(--text-3)]">
        <li>
          <Link
            href="/"
            className="hover:text-[var(--text-1)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-xs)] py-0.5"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRightIcon size={16} className="text-[var(--text-3)] opacity-60" aria-hidden="true" />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-[var(--text-1)] font-medium" : "text-[var(--text-2)]"}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[var(--text-1)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-xs)] py-0.5"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
