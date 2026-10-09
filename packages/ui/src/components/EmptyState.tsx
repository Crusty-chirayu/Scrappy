"use client";

import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#262E3C] rounded-[4px] bg-[#0F1217]/50 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[#141922] border border-[#262E3C] flex items-center justify-center text-[#98A2B3] mb-3">
        {icon ?? (
          <svg className="w-5 h-5 text-[#5B677C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-[#D6DBE3] tracking-tight">{title}</h3>
      <p className="text-xs text-[#98A2B3] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
