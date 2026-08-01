import { Bar, Metric } from "@/components/design/bar-chart";
import { BOOKING_STATUS_META } from "./constants";
import { formatCurrency, toNumber } from "./format";
import { IBooking, IBookingStatus, IPayment, IUser } from "./types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

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

export function earningsByMonth(
  bookings: IBooking[],
  months = 7,
  statuses: IBookingStatus[] = ["COMPLETED"],
): { money: Bar[]; jobs: Bar[]; total: number } {
  const now = new Date();
  const window: { year: number; month: number }[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    window.push({ year: date.getFullYear(), month: date.getMonth() });
  }

  const key = (year: number, month: number) => `${year}-${month}`;

  const money = new Map(window.map((m) => [key(m.year, m.month), 0]));
  const counts = new Map(window.map((m) => [key(m.year, m.month), 0]));

  for (const booking of bookings) {
    if (!statuses.includes(booking.status)) continue;

    const when = new Date(booking.updatedAt);
    const bucket = key(when.getFullYear(), when.getMonth());

    if (!money.has(bucket)) continue;
    money.set(bucket, money.get(bucket)! + toNumber(booking.totalAmount));
    counts.set(bucket, counts.get(bucket)! + 1);
  }

  const label = (year: number, month: number) =>
    new Date(year, month, 1).toLocaleDateString("en-US", { month: "short" });

  return {
    money: window.map((m) => {
      const value = money.get(key(m.year, m.month)) ?? 0;
      return {
        label: label(m.year, m.month),
        value,
        display: value === 0 ? "—" : formatCurrency(value),
      };
    }),
    jobs: window.map((m) => {
      const value = counts.get(key(m.year, m.month)) ?? 0;
      return {
        label: label(m.year, m.month),
        value,
        display: value === 0 ? "—" : String(value),
      };
    }),
    total: [...money.values()].reduce((sum, value) => sum + value, 0),
  };
}

/** Jobs completed per week over the trailing `weeks` window. */
export function jobsByWeek(bookings: IBooking[], weeks = 12): Bar[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Monday-start week containing `date`.
  const weekStart = (date: Date): Date => {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = (copy.getDay() + 6) % 7;
    copy.setDate(copy.getDate() - day);
    return copy;
  };

  const buckets = new Map<number, number>();
  const window: Date[] = [];

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const start = weekStart(now);
    start.setDate(start.getDate() - offset * 7);
    window.push(start);
    buckets.set(start.getTime(), 0);
  }

  for (const booking of bookings) {
    if (booking.status !== "COMPLETED") continue;

    const key = weekStart(new Date(booking.updatedAt)).getTime();
    if (!buckets.has(key)) continue;
    buckets.set(key, buckets.get(key)! + 1);
  }

  return window.map((start) => {
    const value = buckets.get(start.getTime()) ?? 0;
    return {
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      value,
      display: value === 0 ? "—" : String(value),
    };
  });
}

/** Money earned per service, biggest first — the handoff's revenue bars. */
export function revenueByService(bookings: IBooking[], limit = 6): Metric[] {
  const totals = new Map<string, number>();

  for (const booking of bookings) {
    if (!["PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
      continue;
    }

    const title = booking.service?.title ?? "Other";
    totals.set(title, (totals.get(title) ?? 0) + toNumber(booking.totalAmount));
  }

  const rows = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = rows[0]?.[1] ?? 0;

  return rows.map(([label, value]) => ({
    label,
    value,
    display: formatCurrency(value),
    // Bars are relative to the top earner, not to 100.
    pct: max === 0 ? 0 : (value / max) * 100,
    tone: "primary" as const,
  }));
}

export function busiestHours(bookings: IBooking[], limit = 5): Metric[] {
  const counts = new Map<number, number>();

  for (const booking of bookings) {
    const hour = new Date(booking.scheduledAt).getHours();
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  }

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = rows[0]?.[1] ?? 0;

  const label = (hour: number) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:00 ${suffix}`;
  };

  return rows.map(([hour, value]) => ({
    label: label(hour),
    value,
    display: `${value} job${value === 1 ? "" : "s"}`,
    pct: max === 0 ? 0 : (value / max) * 100,
    tone: "emerald" as const,
  }));
}

export function statusSplit(bookings: IBooking[]): Metric[] {
  const rows: {
    label: string;
    match: IBookingStatus[];
    tone: Metric["tone"];
  }[] = [
    { label: "Completed", match: ["COMPLETED"], tone: "emerald" },
    { label: "In progress", match: ["IN_PROGRESS", "PAID"], tone: "primary" },
    { label: "Pending accept", match: ["REQUESTED"], tone: "amber" },
    { label: "Accepted", match: ["ACCEPTED"], tone: "violet" },
    { label: "Cancelled", match: ["CANCELLED", "DECLINED"], tone: "red" },
  ];

  const max = Math.max(
    ...rows.map(
      (row) =>
        bookings.filter((booking) => row.match.includes(booking.status)).length,
    ),
    1,
  );

  return rows.map((row) => {
    const value = bookings.filter((booking) =>
      row.match.includes(booking.status),
    ).length;

    return {
      label: row.label,
      value,
      display: String(value),
      pct: (value / max) * 100,
      tone: row.tone,
    };
  });
}

export function periodDelta(
  bookings: IBooking[],
  days = 30,
  value: (booking: IBooking) => number = () => 1,
): { current: number; previous: number; pct: number } | null {
  const now = Date.now();
  const window = days * 24 * 60 * 60 * 1000;

  let current = 0;
  let previous = 0;

  for (const booking of bookings) {
    const age = now - new Date(booking.createdAt).getTime();
    if (age < 0) continue;

    if (age <= window) current += value(booking);
    else if (age <= window * 2) previous += value(booking);
  }

  if (previous === 0) return null;

  return {
    current,
    previous,
    pct: Math.round(((current - previous) / previous) * 1000) / 10,
  };
}

export type ActivityItem = {
  id: string;
  text: string;
  at: string;
  tone: "emerald" | "primary" | "amber" | "red" | "violet";
};

export function recentActivity(
  bookings: IBooking[],
  payments: IPayment[],
  users: IUser[],
  limit = 8,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const booking of bookings) {
    items.push({
      id: `b-${booking.id}`,
      text: `${booking.customer?.name ?? "A customer"} booked ${booking.service?.title ?? "a service"}`,
      at: booking.createdAt,
      tone: "primary",
    });

    if (booking.status === "COMPLETED") {
      items.push({
        id: `bc-${booking.id}`,
        text: `${booking.technician?.user?.name ?? "A technician"} completed ${booking.service?.title ?? "a job"}`,
        at: booking.updatedAt,
        tone: "emerald",
      });
    }

    if (["CANCELLED", "DECLINED"].includes(booking.status)) {
      items.push({
        id: `bx-${booking.id}`,
        text: `${booking.service?.title ?? "A booking"} was ${booking.status.toLowerCase()}`,
        at: booking.updatedAt,
        tone: "red",
      });
    }
  }

  for (const payment of payments) {
    if (payment.status !== "COMPLETED" || !payment.paidAt) continue;

    items.push({
      id: `p-${payment.id}`,
      text: `Payment of ${formatCurrency(payment.amount)} settled for ${payment.booking?.service?.title ?? "a booking"}`,
      at: payment.paidAt,
      tone: "violet",
    });
  }

  for (const user of users) {
    items.push({
      id: `u-${user.id}`,
      text:
        user.activeStatus === "BLOCKED"
          ? `${user.name} is banned`
          : `${user.name} joined as a ${user.role.toLowerCase()}`,
      at: user.createdAt,
      tone: user.activeStatus === "BLOCKED" ? "red" : "amber",
    });
  }

  return items
    .filter((item) => !Number.isNaN(Date.parse(item.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
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

export function technicianPerformance(bookings: IBooking[]) {
  if (bookings.length === 0) return null;

  const decided = bookings.filter((booking) =>
    ["ACCEPTED", "DECLINED", "PAID", "IN_PROGRESS", "COMPLETED"].includes(
      booking.status,
    ),
  ).length;

  const accepted = bookings.filter(
    (booking) =>
      booking.status !== "DECLINED" && booking.status !== "REQUESTED",
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
