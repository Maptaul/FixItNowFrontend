"use client";

import { BanknoteIcon } from "lucide-react";
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
import { formatDate } from "@/lib/format";
import { IBooking } from "@/lib/types";

const PER_PAGE = 8;

/**
 * Earnings ledger — design handoff § Technician › Earnings.
 *
 * The handoff's table mixes inflows (`+ ৳`) with outflows (`– ৳`) for
 * payouts, commission, withdrawals and adjustments. This API has no payout
 * model, so every row here is an inflow: a job that carries money. Rendering
 * a commission line the platform never charged would be inventing a deduction
 * out of the technician's pocket.
 */
export function EarningsTable({ bookings }: { bookings: IBooking[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Only bookings that got past payment carry money.
  const earning = useMemo(
    () =>
      bookings.filter((booking) =>
        ["PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
      ),
    [bookings],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return earning;

    return earning.filter((booking) =>
      [booking.service?.title, booking.customer?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query)),
    );
  }, [earning, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  if (earning.length === 0) {
    return (
      <EmptyState
        icon={BanknoteIcon}
        title="Nothing earned yet"
        description="Once a customer pays for a job you've accepted, it shows up here — before and after you complete it."
      />
    );
  }

  return (
    <DataTableCard template="1.5fr 1fr .9fr .9fr .8fr">
      <DataTableFilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search job or customer…"
      />

      <DataTableHead>
        <DataTableTh>Job</DataTableTh>
        <DataTableTh>Customer</DataTableTh>
        <DataTableTh>Date</DataTableTh>
        <DataTableTh>Status</DataTableTh>
        <DataTableTh className="text-right">Amount</DataTableTh>
      </DataTableHead>

      {visible.length === 0 ? (
        <p className="border-t border-line px-5 py-10 text-center text-body2 text-text2">
          Nothing matches that search.
        </p>
      ) : (
        visible.map((booking) => {
          const isCleared = booking.status === "COMPLETED";

          return (
            <DataTableRow key={booking.id}>
              <DataTableCell label="Job">
                <p className="truncate font-semibold text-text">
                  {booking.service?.title ?? "Service"}
                </p>
                {booking.service?.category && (
                  <p className="truncate text-[12px] text-text3">
                    {booking.service.category.name}
                  </p>
                )}
              </DataTableCell>

              <DataTableCell label="Customer">
                <span className="truncate text-text2">
                  {booking.customer?.name ?? "—"}
                </span>
              </DataTableCell>

              <DataTableCell label="Date">
                <Mono className="text-[12.5px] text-text2">
                  {formatDate(booking.updatedAt)}
                </Mono>
              </DataTableCell>

              <DataTableCell label="Status">
                <BookingStatusBadge status={booking.status} />
              </DataTableCell>

              <DataTableCell label="Amount" className="md:text-right">
                {/* Inflows read emerald once the job is done, neutral while
                    the money is still tied to work in progress. */}
                <span
                  className={
                    isCleared
                      ? "font-semibold text-emerald"
                      : "font-semibold text-text2"
                  }
                >
                  +&nbsp;
                  <Money value={booking.totalAmount} />
                </span>
              </DataTableCell>
            </DataTableRow>
          );
        })
      )}

      <DataTablePagination
        page={safePage}
        pageSize={PER_PAGE}
        total={filtered.length}
        onPageChange={setPage}
      />
    </DataTableCard>
  );
}
