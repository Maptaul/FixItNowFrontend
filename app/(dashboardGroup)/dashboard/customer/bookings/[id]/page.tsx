import { ArrowLeftIcon, CreditCardIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money, Mono } from "@/components/design/money";
import { Timeline } from "@/components/design/timeline";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildBookingTimeline } from "@/lib/booking-timeline";
import { canCancelBooking, canPayBooking } from "@/lib/constants";
import { formatDateTime, formatRating } from "@/lib/format";
import { getBookingById } from "../../../../_actions/bookingActions";
import { CustomerBookingActions } from "../../../../_components/CustomerBookingActions";

export const metadata: Metadata = { title: "Booking details" };

/** Label / value pair in the job-details grid. */
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-th text-text3 uppercase">{label}</p>
      <div className="mt-1 text-body2 font-semibold text-text">{children}</div>
    </div>
  );
}

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) notFound();

  const steps = buildBookingTimeline(booking);
  const technicianName = booking.technician?.user?.name ?? "Technician";

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/dashboard/customer/bookings">
          <ArrowLeftIcon />
          All bookings
        </Link>
      </Button>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-page text-text">
              {booking.service?.title ?? "Booking"}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1.5 text-body2 text-text2">
            Booked with {technicianName} ·{" "}
            <Mono>{formatDateTime(booking.scheduledAt)}</Mono>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canPayBooking(booking.status) && (
            <Button asChild>
              <Link href={`/dashboard/customer/bookings/${booking.id}/pay`}>
                <CreditCardIcon />
                Pay now
              </Link>
            </Button>
          )}
          {/* Cancel and review live in the shared action cluster. */}
          <CustomerBookingActions booking={booking} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
            <h2 className="mb-5 text-panel text-text">Progress</h2>
            <Timeline steps={steps} />
          </section>

          <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
            <h2 className="mb-5 text-panel text-text">Job details</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail label="Service">
                {booking.service?.title ?? "—"}
              </Detail>
              <Detail label="Category">
                {booking.service?.category?.name ?? "—"}
              </Detail>
              <Detail label="Scheduled for">
                <Mono>{formatDateTime(booking.scheduledAt)}</Mono>
              </Detail>
              <Detail label="Requested on">
                <Mono>{formatDateTime(booking.createdAt)}</Mono>
              </Detail>
              <Detail label="Booking reference">
                <Mono className="text-[12.5px] text-text2">{booking.id}</Mono>
              </Detail>
              <Detail label="Slot">
                {booking.slotId
                  ? "Reserved from published availability"
                  : "Time proposed by you"}
              </Detail>
            </div>
          </section>
        </div>

        {/* Sticky rail */}
        <div className="space-y-6">
          <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2 lg:sticky lg:top-[86px]">
            <h2 className="mb-4 text-panel text-text">Your technician</h2>

            <Link
              href={`/technicians/${booking.technicianId}`}
              className="flex items-center gap-3 rounded-row bg-surface2 p-3 transition-colors duration-120 hover:bg-surface3"
            >
              <GradientAvatar
                name={technicianName}
                kind="technician"
                size={44}
                radius={12}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body2 font-bold text-text">
                  {technicianName}
                </span>
                {booking.technician && (
                  <span className="block truncate text-caption text-text3">
                    <span aria-hidden="true" className="text-star">
                      ★
                    </span>{" "}
                    <Mono>{formatRating(booking.technician.avgRating)}</Mono>
                    {booking.technician.location
                      ? ` · ${booking.technician.location}`
                      : ""}
                  </span>
                )}
              </span>
            </Link>

            {/* Price breakdown — dashed rule above the total. */}
            <dl className="mt-5 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-text2">Service fee</dt>
                <dd>
                  <Money value={booking.totalAmount} />
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-line pt-3">
              <span className="text-body2 font-bold text-text">
                {booking.payment?.status === "COMPLETED"
                  ? "Paid"
                  : "Due on acceptance"}
              </span>
              <Money
                value={booking.totalAmount}
                className="text-[18px] font-bold"
              />
            </div>
          </section>

          <section className="rounded-panel border border-line bg-surface p-5 shadow-sh1">
            <h2 className="mb-2 text-label text-text">Cancellation policy</h2>
            <p className="text-caption text-text2">
              {canCancelBooking(booking.status)
                ? "You can cancel free of charge until the technician starts work. Cancelling releases the slot straight away."
                : "This booking can no longer be cancelled — work has already started or the job is closed."}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
