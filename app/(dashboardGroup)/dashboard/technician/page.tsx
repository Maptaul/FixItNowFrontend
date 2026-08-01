import {
  BriefcaseIcon,
  CheckCheckIcon,
  StarIcon,
  WalletIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart, MetricBars } from "@/components/design/bar-chart";
import { Money } from "@/components/design/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { earningsByDay, technicianPerformance } from "@/lib/analytics";
import { formatCurrency, formatRating, toNumber } from "@/lib/format";
import { getMe } from "@/service/getMe";
import { getTechnicianBookings } from "../../_actions/bookingActions";
import { IncomingRequests } from "../../_components/IncomingRequests";
import { PageHeader } from "../../_components/PageHeader";
import { StatCard } from "../../_components/StatCard";
import { TodaySchedule } from "../../_components/TodaySchedule";

export const metadata: Metadata = { title: "Technician dashboard" };

const isToday = (iso: string): boolean => {
  const when = new Date(iso);
  const now = new Date();
  return (
    when.getFullYear() === now.getFullYear() &&
    when.getMonth() === now.getMonth() &&
    when.getDate() === now.getDate()
  );
};

export default async function TechnicianDashboardPage() {
  const [user, bookings] = await Promise.all([
    getMe(),
    getTechnicianBookings(),
  ]);

  if (!user) redirect("/auth/login");

  const profile = user.technicianProfile;

  const pending = bookings.filter((booking) => booking.status === "REQUESTED");

  // Today's board — the handoff leads with what's happening in the next
  // few hours, not lifetime totals.
  const todayJobs = bookings
    .filter((booking) => isToday(booking.scheduledAt))
    .filter((booking) => !["CANCELLED", "DECLINED"].includes(booking.status));

  const expectedToday = todayJobs.reduce(
    (sum, booking) => sum + toNumber(booking.totalAmount),
    0,
  );

  const performance = technicianPerformance(bookings);
  const acceptance = performance?.[0];

  const weekEarnings = earningsByDay(bookings, 7);
  const isProfileIncomplete = !profile?.location || !profile?.bio;

  return (
    <>
      <PageHeader
        title="Today's board"
        description={
          todayJobs.length > 0
            ? `${todayJobs.length} job${todayJobs.length === 1 ? "" : "s"} scheduled today · ${formatCurrency(expectedToday)} expected.`
            : "Nothing booked for today. Requests and jobs in flight are below."
        }
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/technician/availability">
              Set availability
            </Link>
          </Button>
        }
      />

      {isProfileIncomplete && (
        <Card className="mb-6 border-amber-border bg-amber-soft">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-text">
                Your profile is incomplete
              </p>
              <p className="text-body2 text-text2">
                Customers filter by location and read your bio before booking.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/technician/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stat labels follow the handoff: today first, then standing. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BriefcaseIcon}
          label="Jobs today"
          value={todayJobs.length}
          hint={
            pending.length > 0
              ? `${pending.length} request${pending.length === 1 ? "" : "s"} waiting`
              : "No requests waiting"
          }
        />
        <StatCard
          icon={WalletIcon}
          label="Expected today"
          value={formatCurrency(expectedToday)}
        />
        <StatCard
          icon={CheckCheckIcon}
          label="Acceptance rate"
          value={acceptance ? acceptance.display : "—"}
          hint={acceptance ? undefined : "No requests yet"}
        />
        <StatCard
          icon={StarIcon}
          label="Rating"
          value={profile ? formatRating(profile.avgRating) : "—"}
        />
      </div>

      {/* Requests + schedule — the handoff's 1.4fr / 1fr split. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <IncomingRequests bookings={bookings} />
        <TodaySchedule bookings={bookings} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-panel text-text">Earnings, last 7 days</h2>
            <Money value={weekEarnings.total} className="text-[15px] font-bold" />
          </div>

          <BarChart bars={weekEarnings.bars} height={130} />
        </section>

        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <h2 className="mb-5 text-panel text-text">Your performance</h2>

          {performance ? (
            <MetricBars metrics={performance} />
          ) : (
            <p className="text-body2 text-text2">
              Nothing to measure yet — your first few jobs will fill this in.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
