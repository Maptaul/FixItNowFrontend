"use client";

import { CalendarX2Icon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DataTableCard,
  DataTableCell,
  DataTableFilterBar,
  DataTableHead,
  DataTablePagination,
  DataTableRow,
  DataTableTh,
} from "@/components/design/data-table";
import { Money, Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { IBooking, IBookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CustomerBookingActions } from "./CustomerBookingActions";
import { TechnicianBookingActions } from "./TechnicianBookingActions";

type Variant = "customer" | "technician" | "admin";

const PER_PAGE = 8;

/**
 * Bookings table — design handoff § Data table, plus the customer Bookings
 * screen's tab pills with counts.
 *
 * One table, three audiences. The "who" column flips (a customer wants the
 * technician's name, a technician wants the customer's, an admin wants both)
 * and the action column carries the role-appropriate buttons — admins get
 * none, since the API gives them read-only access to bookings.
 *
 * Search, tab filtering and paging happen here: the API returns a role's full
 * booking list in one call, so a round-trip per keystroke would be waste.
 */
const TEMPLATES: Record<Variant, string> = {
  customer: "1.5fr 1fr 1fr .7fr .8fr auto",
  technician: "1.5fr 1.1fr 1fr .7fr .8fr auto",
  admin: "1.4fr 1fr 1fr 1fr .7fr .8fr",
};

const TABS: { label: string; match: (status: IBookingStatus) => boolean }[] = [
  { label: "All", match: () => true },
  {
    label: "Upcoming",
    match: (status) =>
      ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(status),
  },
  { label: "Completed", match: (status) => status === "COMPLETED" },
  {
    label: "Cancelled",
    match: (status) => ["CANCELLED", "DECLINED"].includes(status),
  },
];

export function BookingsTable({
  bookings,
  variant,
  emptyTitle = "No bookings yet",
  emptyDescription = "Bookings will appear here once they're created.",
  emptyAction,
  showTabs = true,
}: {
  bookings: IBooking[];
  variant: Variant;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  showTabs?: boolean;
}) {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const activeTab = TABS.find((entry) => entry.label === tab) ?? TABS[0];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (!activeTab.match(booking.status)) return false;
      if (!query) return true;

      return [
        booking.service?.title,
        booking.service?.category?.name,
        booking.technician?.user?.name,
        booking.customer?.name,
        booking.customer?.email,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query));
    });
  }, [bookings, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2Icon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const showActions = variant !== "admin";

  return (
    <div className="space-y-4">
      {showTabs && (
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((entry) => {
            const count = bookings.filter((booking) =>
              entry.match(booking.status),
            ).length;
            const isActive = entry.label === tab;

            return (
              <Button
                key={entry.label}
                type="button"
                variant={isActive ? "soft" : "outline"}
                size="sm"
                aria-pressed={isActive}
                onClick={() => {
                  setTab(entry.label);
                  setPage(1);
                }}
              >
                {entry.label}
                <span
                  className={cn(
                    "font-mono",
                    isActive ? "text-primary" : "text-text3",
                  )}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      <DataTableCard template={TEMPLATES[variant]}>
        <DataTableFilterBar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search service, technician or customer…"
        />

        <DataTableHead>
          <DataTableTh>Service</DataTableTh>
          {variant === "customer" && <DataTableTh>Technician</DataTableTh>}
          {variant === "technician" && <DataTableTh>Customer</DataTableTh>}
          {variant === "admin" && (
            <>
              <DataTableTh>Customer</DataTableTh>
              <DataTableTh>Technician</DataTableTh>
            </>
          )}
          <DataTableTh>Scheduled</DataTableTh>
          <DataTableTh>Amount</DataTableTh>
          <DataTableTh>Status</DataTableTh>
          {showActions && (
            <DataTableTh className="text-right">Actions</DataTableTh>
          )}
        </DataTableHead>

        {visible.length === 0 ? (
          <p className="border-t border-line px-5 py-10 text-center text-body2 text-text2">
            Nothing matches that search in this tab.
          </p>
        ) : (
          visible.map((booking) => (
            <DataTableRow key={booking.id}>
              <DataTableCell label="Service">
                {variant === "customer" ? (
                  <Link
                    href={`/dashboard/customer/bookings/${booking.id}`}
                    className="block truncate font-semibold text-text hover:text-primary"
                  >
                    {booking.service?.title ?? "Service"}
                  </Link>
                ) : (
                  <p className="truncate font-semibold text-text">
                    {booking.service?.title ?? "Service"}
                  </p>
                )}
                {booking.service?.category && (
                  <p className="truncate text-[12px] text-text3">
                    {booking.service.category.name}
                  </p>
                )}
              </DataTableCell>

              {variant !== "technician" && (
                <DataTableCell
                  label={variant === "admin" ? "Customer" : "Technician"}
                >
                  <span className="truncate text-text2">
                    {variant === "admin"
                      ? (booking.customer?.name ?? "—")
                      : (booking.technician?.user?.name ?? "—")}
                  </span>
                </DataTableCell>
              )}

              {variant === "technician" && (
                <DataTableCell label="Customer">
                  <p className="truncate font-semibold text-text">
                    {booking.customer?.name ?? "—"}
                  </p>
                  {booking.customer?.email && (
                    <p className="truncate text-[12px] text-text3">
                      {booking.customer.email}
                    </p>
                  )}
                </DataTableCell>
              )}

              {variant === "admin" && (
                <DataTableCell label="Technician">
                  <span className="truncate text-text2">
                    {booking.technician?.user?.name ?? "—"}
                  </span>
                </DataTableCell>
              )}

              <DataTableCell label="Scheduled">
                <Mono className="text-[12.5px] text-text2">
                  {formatDateTime(booking.scheduledAt)}
                </Mono>
              </DataTableCell>

              <DataTableCell label="Amount" className="md:text-right">
                <Money value={booking.totalAmount} className="font-semibold" />
              </DataTableCell>

              <DataTableCell label="Status">
                <BookingStatusBadge status={booking.status} />
              </DataTableCell>

              {showActions && (
                <DataTableCell className="md:text-right">
                  {variant === "customer" ? (
                    <CustomerBookingActions booking={booking} />
                  ) : (
                    <TechnicianBookingActions booking={booking} />
                  )}
                </DataTableCell>
              )}
            </DataTableRow>
          ))
        )}

        <DataTablePagination
          page={safePage}
          pageSize={PER_PAGE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </DataTableCard>
    </div>
  );
}
