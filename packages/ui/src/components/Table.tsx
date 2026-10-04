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
      <div className="w-full overflow-x-auto border border-[#262E3C] rounded-[4px] bg-[#0F1217]">
        <table
          ref={ref}
          className={`w-full text-left border-collapse text-sm text-[#D6DBE3] ${
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
        className={`border-b border-[#262E3C] bg-[#141922] text-xs uppercase font-medium text-[#98A2B3] tracking-wider ${className}`}
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
      <tbody ref={ref} className={`divide-y divide-[#1A202B] ${className}`} {...props}>
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
      className={`transition-colors ${
        isClickable ? "cursor-pointer hover:bg-[#1A202B]" : "hover:bg-[#141922]/50"
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
  const padding = density === "compact" ? "py-1.5 px-3" : "py-2.5 px-4";
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
          className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold hover:text-[#D6DBE3] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C6F135] rounded px-1 -mx-1`}
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
  const padding = density === "compact" ? "py-1.5 px-3" : "py-3 px-4";
  const alignClass = align === "right" || isNumeric ? "text-right" : align === "center" ? "text-center" : "text-left";
  const fontClass = isNumeric ? "font-mono tabular-nums tracking-tight" : "";

  return (
    <td ref={ref} className={`${padding} ${alignClass} ${fontClass} text-sm ${className}`} {...props}>
      {children}
    </td>
  );
});
