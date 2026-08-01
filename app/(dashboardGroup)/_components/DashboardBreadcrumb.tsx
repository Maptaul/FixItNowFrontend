"use client";

import { usePathname } from "next/navigation";

/**
 * `Role / Page` breadcrumb in the dashboard header.
 *
 * Derived from the pathname rather than passed down, so no page has to
 * remember to declare its own title.
 */
const titleFromSegment = (segment: string): string =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function DashboardBreadcrumb({ role }: { role: string }) {
  const pathname = usePathname();

  // /dashboard/customer/bookings/abc/pay → ["bookings", "abc", "pay"]
  const segments = pathname.split("/").filter(Boolean).slice(2);

  // Ignore id-looking segments; they're not page names.
  const pageSegments = segments.filter(
    (segment) => !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(segment),
  );

  const page =
    pageSegments.length === 0
      ? "Overview"
      : titleFromSegment(pageSegments[pageSegments.length - 1]);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-body2">
        <li className="hidden text-text3 sm:block">{role}</li>
        <li aria-hidden="true" className="hidden text-text3 sm:block">
          /
        </li>
        <li className="truncate font-semibold text-text">{page}</li>
      </ol>
    </nav>
  );
}
