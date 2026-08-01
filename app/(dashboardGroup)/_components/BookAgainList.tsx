import { RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { IBooking } from "@/lib/types";

/**
 * "Book again" — design handoff § Customer › Dashboard.
 *
 * Technicians the customer has already completed a job with, most recent
 * first. Derived from their booking history rather than a separate endpoint,
 * because the API has no "past technicians" resource.
 */
export function BookAgainList({ bookings }: { bookings: IBooking[] }) {
  const seen = new Set<string>();

  const past = bookings
    .filter((booking) => booking.status === "COMPLETED" && booking.technician)
    .filter((booking) => {
      if (seen.has(booking.technicianId)) return false;
      seen.add(booking.technicianId);
      return true;
    })
    .slice(0, 4);

  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
      <h2 className="mb-4 text-panel text-text">Book again</h2>

      {past.length === 0 ? (
        <EmptyState
          icon={RotateCcwIcon}
          title="No past jobs yet"
          description="Once a job is completed, that technician shows up here for one-tap rebooking."
          className="border-0 p-0"
        />
      ) : (
        <ul className="space-y-2">
          {past.map((booking) => {
            const name = booking.technician?.user?.name ?? "Technician";

            return (
              <li key={booking.id}>
                <Link
                  href={`/book/${booking.technicianId}?service=${booking.serviceId}`}
                  className="flex items-center gap-3 rounded-row p-2.5 transition-colors duration-120 hover:bg-surface2"
                >
                  <GradientAvatar
                    name={name}
                    kind="technician"
                    size={38}
                    radius={12}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body2 font-bold text-text">
                      {name}
                    </span>
                    <span className="block truncate text-caption text-text3">
                      {booking.service?.title ?? "Service"}
                    </span>
                  </span>

                  <Money
                    value={booking.totalAmount}
                    className="text-body2 font-semibold"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
        <Link href="/technicians">Find someone new</Link>
      </Button>
    </section>
  );
}
