"use client";

import { CreditCardIcon, StarIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  canCancelBooking,
  canPayBooking,
  canReviewBooking,
} from "@/lib/constants";
import { IBooking } from "@/lib/types";
import { cancelBooking } from "../_actions/bookingActions";
import { ReviewDialog } from "./ReviewDialog";

/**
 * The buttons a customer sees on one of their bookings.
 *
 * What's offered follows the same lifecycle rules the API enforces: pay only
 * once ACCEPTED, cancel only before the job starts, review only after it's
 * COMPLETED (and only once).
 */
export function CustomerBookingActions({ booking }: { booking: IBooking }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelBooking(booking.id);

      if (result?.success) {
        toast.success(result.message);
        setCancelOpen(false);
        router.refresh();
      } else {
        toast.error(result?.message ?? "Could not cancel this booking.");
      }
    });
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canPayBooking(booking.status) && (
        <Button size="sm" asChild>
          <Link href={`/dashboard/customer/bookings/${booking.id}/pay`}>
            <CreditCardIcon />
            Pay now
          </Link>
        </Button>
      )}

      {canReviewBooking(booking.status, Boolean(booking.review)) && (
        <ReviewDialog booking={booking}>
          <Button size="sm" variant="outline">
            <StarIcon />
            Leave review
          </Button>
        </ReviewDialog>
      )}

      {canCancelBooking(booking.status) && (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <XIcon />
              Cancel
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel this booking?</DialogTitle>
              <DialogDescription>
                {booking.service?.title ?? "This job"} will be cancelled and the
                reserved slot released. This can&apos;t be undone.
                {booking.status === "PAID" &&
                  " You've already paid — contact support about a refund."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  Keep booking
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isPending}
              >
                {isPending ? "Cancelling…" : "Yes, cancel it"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
