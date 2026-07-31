/**
 * Formatting helpers.
 *
 * Prisma `Decimal` columns arrive as strings ("100", "4.50"), so anything
 * numeric from the API goes through `toNumber` before maths or display.
 */

export const toNumber = (value: string | number | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatCurrency = (
  value: string | number | null | undefined,
): string => currency.format(toNumber(value));

export const formatRating = (
  value: string | number | null | undefined,
): string => toNumber(value).toFixed(1);

const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateOnly = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export const formatDateTime = (value: string | Date): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTime.format(date);
};

export const formatDate = (value: string | Date): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateOnly.format(date);
};

/** `2026-08-04T00:00:00.000Z` → `2026-08-04`, safe for `<input type="date">`. */
export const toDateInputValue = (value: string | Date): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/** "14:30" → "2:30 PM" */
export const formatTime = (time: string): string => {
  const [rawHour, minute] = time.split(":");
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
};

/** Combine a slot's date + "HH:mm" into the ISO instant the API expects. */
export const slotToIso = (date: string, startTime: string): string => {
  const day = toDateInputValue(date);
  return new Date(`${day}T${startTime}:00`).toISOString();
};

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** Deterministic placeholder image per entity, so cards aren't blank. */
export const avatarUrl = (seed: string): string =>
  `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
