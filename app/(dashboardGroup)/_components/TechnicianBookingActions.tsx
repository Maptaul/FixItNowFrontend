"use client";

import { CheckCheckIcon, CheckIcon, PlayIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TECHNICIAN_TRANSITIONS, TRANSITION_LABEL } from "@/lib/constants";
import { IBooking, IBookingStatus } from "@/lib/types";
import { updateBookingStatus } from "../_actions/bookingActions";

const ICONS: Partial<Record<IBookingStatus, typeof CheckIcon>> = {
  ACCEPTED: CheckIcon,
  DECLINED: XIcon,
  IN_PROGRESS: PlayIcon,
  COMPLETED: CheckCheckIcon,
};

/**
 * Lifecycle buttons for a technician's job.
 *
 * Only the transitions the API currently allows are rendered — a REQUESTED
 * job offers Accept/Decline, a PAID one offers Start, and so on. Anything
 * else shows nothing, which is the honest answer: the technician is waiting
 * on the customer.
 */
export function TechnicianBookingActions({ booking }: { booking: IBooking }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextStatuses = TECHNICIAN_TRANSITIONS[booking.status] ?? [];

  if (nextStatuses.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        {booking.status === "ACCEPTED"
          ? "Waiting for payment"
          : "No action needed"}
      </span>
    );
  }

  const handleClick = (status: IBookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, status);

      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result?.message ?? "Could not update this booking.");
      }
    });
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {nextStatuses.map((status) => {
        const Icon = ICONS[status];
        const isDecline = status === "DECLINED";

        return (
          <Button
            key={status}
            size="sm"
            variant={isDecline ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => handleClick(status)}
          >
            {Icon && <Icon />}
            {TRANSITION_LABEL[status] ?? status}
          </Button>
        );
      })}
    </div>
  );
}
