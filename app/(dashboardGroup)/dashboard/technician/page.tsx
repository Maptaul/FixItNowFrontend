import {
  BellRingIcon,
  CalendarCheckIcon,
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
import { BookingsTable } from "../../_components/BookingsTable";
import { PageHeader } from "../../_components/PageHeader";
import { StatCard } from "../../_components/StatCard";

export const metadata: Metadata = { title: "Technician dashboard" };

export default async function TechnicianDashboardPage() {
  const [user, bookings] = await Promise.all([
    getMe(),
    getTechnicianBookings(),
  ]);

  if (!user) redirect("/auth/login");

  const profile = user.technicianProfile;

  const pending = bookings.filter((booking) => booking.status === "REQUESTED");
  const upcoming = bookings.filter((booking) =>
    ["PAID", "IN_PROGRESS"].includes(booking.status),
  );

  // Earnings recognised on completion — the money the platform owes them.
  const earnings = bookings
    .filter((booking) => booking.status === "COMPLETED")
    .reduce((sum, booking) => sum + toNumber(booking.totalAmount), 0);

  const isProfileIncomplete = !profile?.location || !profile?.bio;

  const weekEarnings = earningsByDay(bookings, 7);
  const performance = technicianPerformance(bookings);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Requests, jobs in flight and what you've earned."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/technician/availability">
              Set availability
            </Link>
          </Button>
        }
      />

      {isProfileIncomplete && (
        <Card className="mb-6 border-accent/40 bg-accent/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Your profile is incomplete</p>
              <p className="text-sm text-muted-foreground">
                Customers filter by location and read your bio before booking.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/technician/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BellRingIcon}
          label="Pending requests"
          value={pending.length}
          hint={pending.length > 0 ? "Waiting on your reply" : undefined}
        />
        <StatCard
          icon={CalendarCheckIcon}
          label="Jobs in progress"
          value={upcoming.length}
        />
        <StatCard
          icon={WalletIcon}
          label="Total earned"
          value={formatCurrency(earnings)}
          hint="From completed jobs"
        />
        <StatCard
          icon={StarIcon}
          label="Average rating"
          value={profile ? formatRating(profile.avgRating) : "—"}
        />
      </div>

      {/* Earnings + performance — the handoff's 1.4fr / 1fr split. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-panel text-text">Earnings, last 7 days</h2>
            <Money value={weekEarnings.total} className="text-[15px] font-bold" />
          </div>

          <BarChart bars={weekEarnings.bars} height={130} />
        </section>

        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <h2 className="mb-5 text-panel text-text">Performance</h2>

          {performance ? (
            <MetricBars metrics={performance} />
          ) : (
            <p className="text-body2 text-text2">
              Nothing to measure yet — your first few jobs will fill this in.
            </p>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-panel text-text">Incoming requests</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/technician/bookings">View all jobs</Link>
          </Button>
        </div>

        <BookingsTable
          showTabs={false}
          bookings={pending.length > 0 ? pending : bookings.slice(0, 5)}
          variant="technician"
          emptyTitle="No jobs yet"
          emptyDescription="Once your services are listed and your calendar is open, requests land here."
        />
      </section>
    </>
  );
}
