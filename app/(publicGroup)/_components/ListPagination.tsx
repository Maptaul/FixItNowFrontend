"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IMeta } from "@/lib/types";

/** URL-driven pager; keeps every active filter in the query string. */
export function ListPagination({ meta }: { meta: IMeta }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(meta.total / (meta.limit || 1)));
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(meta.page, 1), totalPages);

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  // Show a small window around the current page rather than every page.
  const start = Math.max(1, Math.min(current - 1, totalPages - 2));
  const pages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => start + index,
  );

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          {/*
           * At a boundary the arrow points back at the current page rather
           * than page 0 / totalPages + 1. It's already unclickable, but a
           * middle-click or a CSS failure shouldn't produce a URL that
           * doesn't exist.
           */}
          <PaginationPrevious
            href={hrefFor(Math.max(1, current - 1))}
            aria-disabled={current === 1}
            tabIndex={current === 1 ? -1 : undefined}
            className={current === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={hrefFor(page)} isActive={page === current}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={hrefFor(Math.min(totalPages, current + 1))}
            aria-disabled={current === totalPages}
            tabIndex={current === totalPages ? -1 : undefined}
            className={
              current === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
