import { IBookingStatus, IPaymentStatus, IRole } from "./types";

/** Where each role lands after logging in. */
export const ROLE_HOME: Record<IRole, string> = {
  CUSTOMER: "/dashboard/customer",
  TECHNICIAN: "/dashboard/technician",
  ADMIN: "/dashboard/admin",
};

/**
 * Chip variant vocabulary from the design handoff. Every status in the
 * product maps onto one of these — see components/ui/badge.tsx.
 */
export type IChipVariant =
  | "emerald"
  | "amber"
  | "primary"
  | "red"
  | "red-strong"
  | "violet"
  | "neutral";

/**
 * Booking status presentation.
 *
 * Colours follow the assignment's badge legend — seven statuses, seven
 * distinct chips — expressed entirely in the design handoff's tokens and
 * chip anatomy. Status is never colour-only: every chip carries its word.
 */
export const BOOKING_STATUS_META: Record<
  IBookingStatus,
  { label: string; variant: IChipVariant }
> = {
  REQUESTED: { label: "Requested", variant: "amber" },
  ACCEPTED: { label: "Accepted", variant: "primary" },
  DECLINED: { label: "Declined", variant: "red" },
  PAID: { label: "Paid", variant: "violet" },
  IN_PROGRESS: { label: "In progress", variant: "emerald" },
  COMPLETED: { label: "Completed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "red-strong" },
};

export const PAYMENT_STATUS_META: Record<
  IPaymentStatus,
  { label: string; variant: IChipVariant }
> = {
  PENDING: { label: "Clearing", variant: "amber" },
  COMPLETED: { label: "Settled", variant: "emerald" },
  FAILED: { label: "Failed", variant: "red" },
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

/** Card grids are 3-up, so nine fills exactly three rows. */
export const PAGE_SIZE = 9;

/**
 * Full-width list rows (the technician search results) are much taller than a
 * card, so nine of them is a long scroll. Six keeps the page a comfortable
 * length and means the pager actually appears at realistic result counts.
 */
export const ROW_PAGE_SIZE = 6;

/*
 * Cover photography per service category (Unsplash, free to use).
 * Matched on a keyword so seeded variants like "Plumbing_27438" still get
 * the right picture; anything unmatched falls back to the generic photo.
 */
const CATEGORY_IMAGES: { keyword: string; url: string }[] = [
  {
    keyword: "plumb",
    url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39",
  },
  {
    keyword: "electric",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
  },
  {
    keyword: "clean",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  },
  {
    keyword: "carpen",
    url: "https://images.unsplash.com/photo-1504148455328-c376907d081c",
  },
  {
    keyword: "paint",
    url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828",
  },
  {
    keyword: "garden",
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
  },
  {
    keyword: "ac ",
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
  },
  {
    keyword: "hvac",
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
  },
];

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837";

export const categoryImage = (categoryName: string | undefined): string => {
  const name = `${categoryName ?? ""} `.toLowerCase();
  const match = CATEGORY_IMAGES.find((entry) => name.includes(entry.keyword));
  const base = match?.url ?? FALLBACK_CATEGORY_IMAGE;
  return `${base}?auto=format&fit=crop&w=800&q=70`;
};
