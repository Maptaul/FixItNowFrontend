"use client";

import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Data table — design handoff § Data table.
 *
 * The full pattern in one r18 card with `overflow: hidden`:
 *   filter bar → (conditional) bulk-action bar → header → rows → pagination
 *
 * Rows are CSS grid, not `<table>`, because the handoff specifies an explicit
 * `grid-template-columns` per table and a card layout below 768px. The card
 * publishes its template as `--dt-cols` so the header and every row stay in
 * step from one declaration.
 *
 * Below 768px each row collapses to a stacked card — see `DataTableRow`.
 */
export function DataTableCard({
  template,
  children,
  className,
}: {
  /** e.g. "1.6fr 1fr 1fr .8fr auto" — applied from md up. */
  template: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ ["--dt-cols" as string]: template }}
      className={cn(
        "overflow-hidden rounded-panel border border-line bg-surface shadow-sh2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 15–16px padding, 1px bottom border. Search sits at h36 / r10 / ~260px. */
export function DataTableFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter buttons — use `DataTableFilterButton`. */
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line p-4">
      {onSearchChange && (
        <div className="relative w-full sm:w-[260px]">
          <SearchIcon
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text3"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 pl-9 text-body2"
          />
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * `Status: All ▾`. An applied filter flips to soft-primary and appends a ×,
 * so what's narrowing the list is readable at a glance.
 */
export function DataTableFilterButton({
  label,
  value,
  isApplied,
  onClear,
  onClick,
}: {
  label: string;
  value: string;
  isApplied: boolean;
  onClear?: () => void;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant={isApplied ? "soft" : "outline"}
      size="sm"
      className="h-9"
      onClick={isApplied && onClear ? onClear : onClick}
    >
      {label}: {value}
      <span aria-hidden="true">{isApplied ? "×" : "▾"}</span>
    </Button>
  );
}

/** Appears only with a selection: primary-soft fill, count, then actions. */
export function DataTableBulkBar({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  if (count === 0) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-4 border-b border-primary-border bg-primary-soft px-5 py-3"
    >
      <span className="text-body2 font-semibold text-primary">
        {count} selected
      </span>
      {children}
    </div>
  );
}

/** Header: --surface-2 fill, 11px/700 uppercase at 0.06em in --text-3. */
export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <div className="hidden grid-cols-(--dt-cols) items-center gap-3.5 bg-surface2 px-5 py-3 md:grid">
      {children}
    </div>
  );
}

export function DataTableTh({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-th text-text3 uppercase", className)}>
      {children}
    </span>
  );
}

/**
 * A row. On md+ it's a grid matching the card's template; below that it
 * stacks into a card, which is what the handoff specifies under 768px.
 */
export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-line px-5 py-4 text-cell transition-colors duration-120 hover:bg-surface2",
        "md:grid md:grid-cols-(--dt-cols) md:items-center md:gap-3.5 md:py-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * One cell. `label` is shown only in the stacked mobile layout, where the
 * column header is no longer visible.
 */
export function DataTableCell({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 md:block", className)}>
      {label && (
        <span className="text-th text-text3 uppercase md:hidden">{label}</span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Pagination: "Showing 1–8 of 48,210" on the left, arrows plus numbered
 * buttons on the right with the current page in primary.
 */
export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);

  if (total === 0) return null;

  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  // A window of three around the current page, with an ellipsis before the
  // last one when there's a gap.
  const start = Math.max(1, Math.min(current - 1, totalPages - 2));
  const window = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => start + index,
  ).filter((value) => value <= totalPages);

  const showLast = totalPages > 3 && !window.includes(totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
      <p className="text-body2 text-text2">
        Showing{" "}
        <span className="font-mono">
          {from}–{to}
        </span>{" "}
        of <span className="font-mono">{total.toLocaleString()}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
        >
          <ChevronLeftIcon />
        </Button>

        {window.map((value) => (
          <Button
            key={value}
            type="button"
            variant={value === current ? "default" : "outline"}
            size="sm"
            aria-current={value === current ? "page" : undefined}
            className="min-w-8 px-2 font-mono"
            onClick={() => onPageChange(value)}
          >
            {value}
          </Button>
        ))}

        {showLast && (
          <>
            <span aria-hidden="true" className="px-1 text-text3">
              …
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-8 px-2 font-mono"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={current === totalPages}
          onClick={() => onPageChange(current + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
