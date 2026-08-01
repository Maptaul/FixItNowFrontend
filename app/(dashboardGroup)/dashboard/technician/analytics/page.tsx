import { ChartNoAxesColumnIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { BarChart, MetricBars } from "@/components/design/bar-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  busiestHours,
  jobsByWeek,
  revenueByService,
} from "@/lib/analytics";
import { getTechnicianBookings } from "../../../_actions/bookingActions";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Analytics" };

/**
 * Technician analytics — design handoff § Technician › Analytics.
 *
 * 12-week jobs chart beside revenue-by-service bars, then busiest hours.
 *
 * The handoff's other two key/value cards are "job sources" and "top areas".
 * Neither is derivable: a booking records no acquisition channel, and the
 * only location on the API is the technician's own service area, not the
 * customer's. They're left out rather than filled with a guess.
 */
export default async function TechnicianAnalyticsPage() {
  const bookings = await getTechnicianBookings();

  const weeks = jobsByWeek(bookings, 12);
  const revenue = revenueByService(bookings);
  const hours = busiestHours(bookings);

  const completed = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  ).length;

  if (bookings.length === 0) {
    return (
      <>
        <PageHeader
          title="Analytics"
          description="How your work is trending — jobs over time, what earns most, and when customers book."
        />

        <EmptyState
          icon={ChartNoAxesColumnIcon}
          title="Nothing to chart yet"
          description="Analytics are computed from your bookings. Once customers start booking you, this fills in on its own."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/technician/services">
                List a service
              </Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="How your work is trending — jobs over time, what earns most, and when customers book."
      />

      {/* Volume + revenue — the handoff's 1.5fr / 1fr split. */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-panel text-text">Jobs completed, 12 weeks</h2>
            <span className="font-mono text-[15px] font-bold text-text">
              {completed}
            </span>
          </div>

          <BarChart bars={weeks} height={160} />
        </section>

        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <h2 className="mb-5 text-panel text-text">Revenue by service</h2>

          {revenue.length === 0 ? (
            <p className="text-body2 text-text2">
              Nothing earned yet — this ranks your services once jobs start
              getting paid.
            </p>
          ) : (
            <MetricBars metrics={revenue} />
          )}
        </section>
      </div>

      <section className="mt-5 rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
        <h2 className="mb-1.5 text-panel text-text">Busiest hours</h2>
        <p className="mb-5 text-caption text-text3">
          When customers schedule you. Worth matching on your availability
          calendar.
        </p>

        {hours.length === 0 ? (
          <p className="text-body2 text-text2">
            No bookings scheduled yet.
          </p>
        ) : (
          <MetricBars metrics={hours} />
        )}
      </section>
    </>
  );
}
