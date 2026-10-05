"use client";

import React, { useState, useId } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  defaultExpandedIds?: string[];
}

export function Accordion({
  items,
  allowMultiple = false,
  className = "",
  defaultExpandedIds = [],
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);
  const baseId = useId();

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const isExpanded = prev.includes(id);
      if (allowMultiple) {
        return isExpanded ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return isExpanded ? [] : [id];
    });
  };

  return (
    <div className={`divide-y divide-[var(--border-subtle)] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-1)] ${className}`}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        const headerId = `${baseId}-header-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div key={item.id} className="first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)]">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full min-h-[44px] items-center justify-between px-4 py-3 text-left font-sans text-sm font-medium text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1"
              >
                <span>{item.title}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-[var(--text-3)] transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </h3>

            {/* Grid-rows transition trick: 0fr -> 1fr with zero layout thrash */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={`scrappy-accordion-grid ${isExpanded ? "is-expanded" : ""}`}
            >
              <div className="scrappy-accordion-inner">
                <div className="px-4 pb-4 pt-1 font-sans text-sm text-[var(--text-2)] leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
