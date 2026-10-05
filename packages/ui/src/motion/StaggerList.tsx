"use client";

import React from "react";

export interface StaggerListProps {
  children: React.ReactNode;
  stepMs?: number;
  maxItems?: number;
  className?: string;
}

export function StaggerList({
  children,
  stepMs = 40,
  maxItems = 8,
  className = "",
}: StaggerListProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => {
        const delay = Math.min(index, maxItems - 1) * stepMs;
        return (
          <div
            key={index}
            style={{
              animation: `fade-in-rise 220ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
