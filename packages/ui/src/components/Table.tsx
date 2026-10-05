"use client";

import { createContext, useContext, forwardRef, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from "react";

export type TableDensity = "compact" | "comfortable";

interface TableContextValue {
  density: TableDensity;
}

const TableContext = createContext<TableContextValue>({ density: "comfortable" });

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
  stickyHeader?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = "comfortable", stickyHeader = false, className = "", children, ...props },
  ref,
) {
  return (
    <TableContext.Provider value={{ density }}>
      <div className="w-full overflow-x-auto border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-1)] shadow-[var(--elevation-1)]">
        <table
          ref={ref}
          className={`w-full text-left border-collapse text-sm text-[var(--text-1)] ${
            stickyHeader ? "relative" : ""
          } ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
});

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className = "", children, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={`border-b border-[var(--border)] bg-[var(--surface-2)] text-xs uppercase font-mono font-medium text-[var(--text-2)] tracking-wider ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  },
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className = "", children, ...props }, ref) {
    return (
      <tbody ref={ref} className={`divide-y divide-[var(--border-subtle)] ${className}`} {...props}>
        {children}
      </tbody>
    );
  },
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  isClickable?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { isClickable = false, className = "", children, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={`transition-colors duration-[var(--motion-duration-fast)] ${
        isClickable ? "cursor-pointer hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)]" : "hover:bg-[var(--surface-2)]/60"
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
});

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortDirection?: "ascending" | "descending" | "none" | null;
  onSort?: () => void;
  align?: "left" | "center" | "right";
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { sortDirection, onSort, align = "left", className = "", children, ...props },
  ref,
) {
  const { density } = useContext(TableContext);
  const padding = density === "compact" ? "py-2 px-3" : "py-3 px-4";
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  const isSortable = Boolean(onSort);

  return (
    <th
      ref={ref}
      aria-sort={sortDirection ?? undefined}
      className={`${padding} ${alignClass} font-semibold select-none ${className}`}
      {...props}
    >
      {isSortable ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold hover:text-[var(--text-1)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-sm)] px-1.5 py-1 -mx-1.5 min-h-[36px]"
        >
          <span>{children}</span>
          <span className="flex flex-col text-[10px] leading-[10px]" aria-hidden="true">
            {sortDirection === "ascending" ? "▲" : sortDirection === "descending" ? "▼" : "⇅"}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align = "left", isNumeric = false, className = "", children, ...props },
  ref,
) {
  const { density } = useContext(TableContext);
  const padding = density === "compact" ? "py-2 px-3" : "py-3.5 px-4";
  const alignClass = align === "right" || isNumeric ? "text-right" : align === "center" ? "text-center" : "text-left";
  const fontClass = isNumeric ? "font-mono tabular-nums tracking-tight font-medium" : "";

  return (
    <td ref={ref} className={`${padding} ${alignClass} ${fontClass} text-sm text-[var(--text-1)] ${className}`} {...props}>
      {children}
    </td>
  );
});
