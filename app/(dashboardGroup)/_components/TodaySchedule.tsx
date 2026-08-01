import { CalendarCheckIcon } from "lucide-react";
import { Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { BOOKING_STATUS_META } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { IBooking } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Today's schedule — design handoff § Technician › Dashboard.
 *
 * One row per job: mono time in a 56px column, a 3px status bar, the service
 * and where, then the status chip. The next job up is highlighted in
 * --primary-soft so the technician can see what's imminent at a glance.
 */
const BAR_TONE: Record<string, string> = {
  amber: "bg-amber",
  primary: "bg-primary",
  emerald: "bg-emerald",
  violet: "bg-violet",
  red: "bg-red",
  "red-strong": "bg-red",
  neutral: "bg-line-strong",
};

const isToday = (iso: string): boolean => {
  const when = new Date(iso);
  const now = new Date();
  return (
    when.getFullYear() === now.getFullYear() &&
    when.getMonth() === now.getMonth() &&
    when.getDate() === now.getDate()
  );
};

export function TodaySchedule({ bookings }: { bookings: IBooking[] }) {
  const today = bookings
    .filter((booking) => isToday(booking.scheduledAt))
    .filter((booking) => !["CANCELLED", "DECLINED"].includes(booking.status))
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  // The next job that hasn't finished — the one worth highlighting.
  const nextId = today.find((booking) => booking.status !== "COMPLETED")?.id;

  return (
    <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
      <h2 className="mb-4 text-panel text-text">Today&apos;s schedule</h2>

      {today.length === 0 ? (
        <EmptyState
          icon={CalendarCheckIcon}
          title="Nothing booked today"
          description="Jobs scheduled for today appear here in order, with the next one highlighted."
          className="border-0 p-0"
        />
      ) : (
        <ul className="flex flex-col gap-[11px]">
          {today.map((booking) => {
            const meta = BOOKING_STATUS_META[booking.status];
            const isNext = booking.id === nextId;

            const time = new Date(booking.scheduledAt);
            const hhmm = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;

            return (
              <li
                key={booking.id}
                className={cn(
                  "flex items-center gap-3.5 rounded-row p-3",
                  isNext ? "bg-primary-soft" : "bg-surface2/60",
                )}
              >
                <Mono className="w-14 shrink-0 text-[12px] font-semibold text-text2">
                  {formatTime(hhmm)}
                </Mono>

                <span
                  aria-hidden="true"
                  className={cn(
                    "w-[3px] shrink-0 self-stretch rounded-sm",
                    BAR_TONE[meta.variant] ?? "bg-line-strong",
                  )}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body2 font-semibold text-text">
                    {booking.service?.title ?? "Service"}
                  </span>
                  <span className="mt-px block truncate text-[12px] text-text3">
                    {booking.customer?.name ?? "Customer"}
                    {booking.service?.category
                      ? ` · ${booking.service.category.name}`
                      : ""}
                  </span>
                </span>

                <BookingStatusBadge status={booking.status} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
