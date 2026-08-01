import { InboxIcon } from "lucide-react";
import Link from "next/link";
import { Money, Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import { IBooking } from "@/lib/types";
import { TechnicianBookingActions } from "./TechnicianBookingActions";

/**
 * Incoming request cards — design handoff § Technician › Dashboard.
 *
 * r14 card per request: service and "customer · when" on the left, mono price
 * on the right, then Accept / Decline.
 *
 * The handoff also shows a distance, the customer's own description of the
 * fault, and an expiry countdown. A booking records none of those — no
 * geocoding, no notes field, no expiry — so the card carries what the API
 * actually holds rather than inventing the rest.
 */
export function IncomingRequests({ bookings }: { bookings: IBooking[] }) {
  const requests = bookings.filter((booking) => booking.status === "REQUESTED");

  return (
    <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-panel text-text">Incoming requests</h2>
        <Link
          href="/dashboard/technician/bookings"
          className="text-btn text-primary hover:text-primary-hover"
        >
          All jobs →
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="No requests waiting"
          description="New booking requests land here. Publish availability and list services so customers can find you."
          className="border-0 p-0"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((booking) => (
            <li key={booking.id} className="rounded-row border border-line p-4">
              <div className="mb-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-bold text-text">
                    {booking.service?.title ?? "Service"}
                  </p>
                  <p className="mt-[3px] truncate text-caption text-text2">
                    {booking.customer?.name ?? "Customer"} ·{" "}
                    <Mono>{formatDateTime(booking.scheduledAt)}</Mono>
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <Money
                    value={booking.totalAmount}
                    className="block text-[16px] font-bold"
                  />
                  {booking.service?.category && (
                    <span className="text-[11.5px] text-text3">
                      {booking.service.category.name}
                    </span>
                  )}
                </div>
              </div>

              <TechnicianBookingActions booking={booking} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
