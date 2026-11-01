"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  className?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle = "No data found",
  emptyDescription,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  className,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-2xl border border-charcoal-100", className)}>
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="bg-charcoal-50 border-b border-charcoal-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-6 py-3.5 text-left text-xs font-semibold text-taupe uppercase tracking-wider whitespace-nowrap",
                  col.sortable && "cursor-pointer select-none hover:text-charcoal transition-colors",
                  col.width && `w-[${col.width}]`
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.header}
                  {col.sortable && (
                    <span className="text-taupe-400">
                      {sortKey === col.key ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-bloom-rose" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-bloom-rose" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-50 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    <Skeleton variant="text" height={14} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  size="sm"
                />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-soft-blush-50"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-6 py-4 text-charcoal-800", col.className)}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
