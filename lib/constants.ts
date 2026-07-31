import { IBookingStatus, IPaymentStatus, IRole } from "./types";

/** Where each role lands after logging in. */
export const ROLE_HOME: Record<IRole, string> = {
  CUSTOMER: "/dashboard/customer",
  TECHNICIAN: "/dashboard/technician",
  ADMIN: "/dashboard/admin",
};

/**
 * Booking status presentation. Colours follow the spec's badge legend:
 * requested amber, accepted blue, declined red, paid purple,
 * in-progress green, completed grey, cancelled dark red.
 */
export const BOOKING_STATUS_META: Record<
  IBookingStatus,
  { label: string; className: string }
> = {
  REQUESTED: {
    label: "Requested",
    className:
      "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  ACCEPTED: {
    label: "Accepted",
    className:
      "border-blue-500/30 bg-blue-500/12 text-blue-700 dark:text-blue-300",
  },
  DECLINED: {
    label: "Declined",
    className: "border-red-500/30 bg-red-500/12 text-red-700 dark:text-red-300",
  },
  PAID: {
    label: "Paid",
    className:
      "border-purple-500/30 bg-purple-500/12 text-purple-700 dark:text-purple-300",
  },
  IN_PROGRESS: {
    label: "In progress",
    className:
      "border-green-500/30 bg-green-500/12 text-green-700 dark:text-green-300",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "border-zinc-500/30 bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "border-rose-900/30 bg-rose-900/12 text-rose-900 dark:text-rose-300",
  },
};

export const PAYMENT_STATUS_META: Record<
  IPaymentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  COMPLETED: {
    label: "Paid",
    className:
      "border-green-500/30 bg-green-500/12 text-green-700 dark:text-green-300",
  },
  FAILED: {
    label: "Failed",
    className: "border-red-500/30 bg-red-500/12 text-red-700 dark:text-red-300",
  },
};

/*
 * Booking lifecycle rules — mirrored from the backend so the UI only ever
 * offers an action the API will actually accept. The server re-checks all
 * of these; this copy exists purely to decide what to render.
 */

/** Status a technician may move a booking to, keyed by its current status. */
export const TECHNICIAN_TRANSITIONS: Partial<
  Record<IBookingStatus, IBookingStatus[]>
> = {
  REQUESTED: ["ACCEPTED", "DECLINED"],
  PAID: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
};

/** A customer can only cancel before the technician has started work. */
const CANCELLABLE: IBookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];

export const canCancelBooking = (status: IBookingStatus): boolean =>
  CANCELLABLE.includes(status);

/** Payment is only opened once the technician has accepted. */
export const canPayBooking = (status: IBookingStatus): boolean =>
  status === "ACCEPTED";

/** One review per booking, and only after the job is done. */
export const canReviewBooking = (
  status: IBookingStatus,
  hasReview: boolean,
): boolean => status === "COMPLETED" && !hasReview;

/** Labels for the technician's action buttons. */
export const TRANSITION_LABEL: Record<string, string> = {
  ACCEPTED: "Accept",
  DECLINED: "Decline",
  IN_PROGRESS: "Start job",
  COMPLETED: "Complete job",
};

export const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

export const PAGE_SIZE = 9;

/*
 * Cover photography per service category (Unsplash, free to use).
 * Matched on a keyword so seeded variants like "Plumbing_27438" still get
 * the right picture; anything unmatched falls back to the generic photo.
 */
const CATEGORY_IMAGES: { keyword: string; url: string }[] = [
  { keyword: "plumb", url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39" },
  { keyword: "electric", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e" },
  { keyword: "clean", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952" },
  { keyword: "carpen", url: "https://images.unsplash.com/photo-1504148455328-c376907d081c" },
  { keyword: "paint", url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828" },
  { keyword: "garden", url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b" },
  { keyword: "ac ", url: "https://images.unsplash.com/photo-1631545806609-8b1a2e0f1d0f" },
  { keyword: "hvac", url: "https://images.unsplash.com/photo-1631545806609-8b1a2e0f1d0f" },
];

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837";

export const categoryImage = (categoryName: string | undefined): string => {
  const name = `${categoryName ?? ""} `.toLowerCase();
  const match = CATEGORY_IMAGES.find((entry) => name.includes(entry.keyword));
  const base = match?.url ?? FALLBACK_CATEGORY_IMAGE;
  return `${base}?auto=format&fit=crop&w=800&q=70`;
};
