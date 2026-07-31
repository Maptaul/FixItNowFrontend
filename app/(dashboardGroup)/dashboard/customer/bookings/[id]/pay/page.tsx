import { ArrowLeftIcon, InfoIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { canPayBooking } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getBookingById } from "../../../../../_actions/bookingActions";
import { StripeCheckoutButton } from "../../../../../_components/StripeCheckoutButton";

export const metadata: Metadata = { title: "Pay for your booking" };

export default async function PayBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) notFound();

  const isPayable = canPayBooking(booking.status);
  const alreadyPaid = booking.payment?.status === "COMPLETED";

  return (
    <div className="mx-auto w-full max-w-lg">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/dashboard/customer/bookings">
          <ArrowLeftIcon />
          Back to bookings
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Confirm and pay</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="text-right font-medium">
                {booking.service?.title ?? "Service"}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Technician</dt>
              <dd className="text-right font-medium">
                {booking.technician?.user?.name ?? "—"}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Scheduled for</dt>
              <dd className="text-right font-medium">
                {formatDateTime(booking.scheduledAt)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <BookingStatusBadge status={booking.status} />
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-medium">Total due</span>
            <span className="text-2xl font-bold">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>

          {isPayable ? (
            <StripeCheckoutButton bookingId={booking.id} />
          ) : (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-muted-foreground">
                {alreadyPaid
                  ? "This booking is already paid — nothing more to do."
                  : booking.status === "REQUESTED"
                    ? "Payment opens as soon as the technician accepts your request."
                    : `A booking that is ${booking.status.toLowerCase().replace("_", " ")} can't be paid for.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
