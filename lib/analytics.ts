import { Bar } from "@/components/design/bar-chart";
import { BOOKING_STATUS_META } from "./constants";
import { formatCurrency, toNumber } from "./format";
import { IBooking, IBookingStatus } from "./types";

/**
 * Chart data derived from bookings.
 *
 * The API has no analytics endpoints, so every number here is computed from
 * the booking list a role already fetches. That keeps the charts honest —
 * they can only ever show what the platform actually recorded — at the cost
 * of being bounded by whatever that list contains.
 */

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/**
 * Money recognised per day over the trailing `days` window.
 *
 * A booking counts on the day it was last updated, because that's the closest
 * the API gets to "when it completed" — there is no completedAt column.
 */
export function earningsByDay(
  bookings: IBooking[],
  days = 7,
  statuses: IBookingStatus[] = ["COMPLETED"],
): { bars: Bar[]; total: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();
  const window: Date[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    window.push(date);
    buckets.set(dayKey(date), 0);
  }

  for (const booking of bookings) {
    if (!statuses.includes(booking.status)) continue;

    const when = new Date(booking.updatedAt);
    when.setHours(0, 0, 0, 0);
    const key = dayKey(when);

    if (!buckets.has(key)) continue;
    buckets.set(key, buckets.get(key)! + toNumber(booking.totalAmount));
  }

  const bars: Bar[] = window.map((date) => {
    const value = buckets.get(dayKey(date)) ?? 0;
    return {
      label: DAY_LABELS[date.getDay()],
      value,
      display: value === 0 ? "—" : formatCurrency(value),
    };
  });

  const total = bars.reduce((sum, bar) => sum + bar.value, 0);

  return { bars, total };
}

/** How the platform's bookings are distributed across the lifecycle. */
export function bookingsByStatus(bookings: IBooking[]): Bar[] {
  const order: IBookingStatus[] = [
    "REQUESTED",
    "ACCEPTED",
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];

  return order.map((status) => {
    const value = bookings.filter(
      (booking) => booking.status === status,
    ).length;

    return {
      label: BOOKING_STATUS_META[status].label.split(" ")[0],
      value,
      display: String(value),
    };
  });
}

/**
 * Technician performance, as percentages of their own booking history.
 * Returns `null` when there's nothing to measure — an empty chart claiming
 * 0% acceptance would be a lie about a technician who's had no requests.
 */
export function technicianPerformance(bookings: IBooking[]) {
  if (bookings.length === 0) return null;

  const decided = bookings.filter((booking) =>
    ["ACCEPTED", "DECLINED", "PAID", "IN_PROGRESS", "COMPLETED"].includes(
      booking.status,
    ),
  ).length;

  const accepted = bookings.filter(
    (booking) => booking.status !== "DECLINED" && booking.status !== "REQUESTED",
  ).length;

  const completed = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  const cancelled = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  const pct = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 100);

  return [
    {
      label: "Acceptance rate",
      value: pct(accepted, decided || bookings.length),
      display: `${pct(accepted, decided || bookings.length)}%`,
      tone: "emerald" as const,
    },
    {
      label: "Completion rate",
      value: pct(completed, bookings.length),
      display: `${pct(completed, bookings.length)}%`,
      tone: "primary" as const,
    },
    {
      label: "Cancellations",
      value: pct(cancelled, bookings.length),
      display: `${pct(cancelled, bookings.length)}%`,
      tone: "amber" as const,
    },
  ];
}
