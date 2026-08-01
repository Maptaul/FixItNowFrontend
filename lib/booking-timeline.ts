import { formatDateTime } from "./format";
import { IBooking, IBookingStatus } from "./types";

export type BookingTimelineStep = {
  label: string;
  state: "done" | "current" | "upcoming";
  meta?: string;
  note?: string;
};

/** The lifecycle the API actually enforces, in order. */
const FLOW: IBookingStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
];

const STEP_LABEL: Record<string, string> = {
  REQUESTED: "Request sent",
  ACCEPTED: "Technician accepted",
  PAID: "Payment received",
  IN_PROGRESS: "Work started",
  COMPLETED: "Job completed",
};

/** What the customer is waiting on at each stage. */
const STEP_NOTE: Record<string, string> = {
  REQUESTED: "Waiting for the technician to accept or decline.",
  ACCEPTED: "Pay to confirm the slot — nothing is charged before this.",
  PAID: "Your technician can start the job now.",
  IN_PROGRESS: "Work is underway.",
  COMPLETED: "Leave a review to help the next customer.",
};

export function buildBookingTimeline(booking: IBooking): BookingTimelineStep[] {
  const isDeclined = booking.status === "DECLINED";
  const isCancelled = booking.status === "CANCELLED";

  if (isDeclined || isCancelled) {
    // Whatever progress was made stays done; the terminal step closes the line.
    const reached = isDeclined ? 1 : lastReachedIndex(booking);

    return [
      ...FLOW.slice(0, reached).map((status) => ({
        label: STEP_LABEL[status],
        state: "done" as const,
        meta:
          status === "REQUESTED"
            ? formatDateTime(booking.createdAt)
            : undefined,
      })),
      {
        label: isDeclined ? "Technician declined" : "Booking cancelled",
        state: "current" as const,
        meta: formatDateTime(booking.updatedAt),
        note: isDeclined
          ? "They couldn't take this job. Your slot has been released."
          : "The slot has been released and is bookable again.",
      },
    ];
  }

  const currentIndex = FLOW.indexOf(booking.status);

  return FLOW.map((status, index) => ({
    label: STEP_LABEL[status],
    state:
      index < currentIndex
        ? ("done" as const)
        : index === currentIndex
          ? ("current" as const)
          : ("upcoming" as const),
    meta:
      status === "REQUESTED"
        ? formatDateTime(booking.createdAt)
        : index === currentIndex
          ? formatDateTime(booking.updatedAt)
          : undefined,
    // Only the step in play gets a note; the rest would be noise.
    note: index === currentIndex ? STEP_NOTE[status] : undefined,
  }));
}

function lastReachedIndex(booking: IBooking): number {
  if (booking.payment?.status === "COMPLETED") return 3;
  return booking.payment ? 2 : 1;
}
