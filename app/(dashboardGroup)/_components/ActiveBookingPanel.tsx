import { ArrowRightIcon, CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money, Mono } from "@/components/design/money";
import { Stepper } from "@/components/design/stepper";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildBookingTimeline } from "@/lib/booking-timeline";
import { canPayBooking } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { IBooking } from "@/lib/types";

/**
 * Active-booking panel — design handoff § Customer › Dashboard.
 *
 * Status chip, technician strip, and the horizontal mini-timeline using the
 * same dot vocabulary as the vertical one on the details page.
 */
export function ActiveBookingPanel({ booking }: { booking: IBooking }) {
  const steps = buildBookingTimeline(booking);
  const technicianName = booking.technician?.user?.name ?? "Technician";

  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-panel text-text">Active booking</h2>
        <BookingStatusBadge status={booking.status} />
      </div>

      <p className="text-cardtitle text-text">
        {booking.service?.title ?? "Service"}
      </p>
      <p className="mt-0.5 text-body2 text-text2">
        <Mono>{formatDateTime(booking.scheduledAt)}</Mono>
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-row bg-surface2 p-3">
        <GradientAvatar
          name={technicianName}
          src={booking.technician?.user?.avatarUrl}
          kind="technician"
          size={38}
          radius={12}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body2 font-bold text-text">
            {technicianName}
          </p>
          <p className="truncate text-caption text-text3">
            <Money value={booking.totalAmount} />
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/customer/bookings/${booking.id}`}>
            Track
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>

      <Stepper
        steps={steps.map((step) => ({ label: step.label, state: step.state }))}
        className="mt-6"
      />

      {canPayBooking(booking.status) && (
        <Button className="mt-6 w-full" asChild>
          <Link href={`/dashboard/customer/bookings/${booking.id}/pay`}>
            <CreditCardIcon />
            Pay to confirm this slot
          </Link>
        </Button>
      )}
    </section>
  );
}
