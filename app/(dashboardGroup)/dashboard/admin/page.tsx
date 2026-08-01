import {
  BanknoteIcon,
  CalendarRangeIcon,
  CircleSlashIcon,
  UsersIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { BarChart, MetricBars } from "@/components/design/bar-chart";
import { Money } from "@/components/design/money";
import { Button } from "@/components/ui/button";
import {
  earningsByDay,
  periodDelta,
  recentActivity,
  statusSplit,
} from "@/lib/analytics";
import { formatCurrency, toNumber } from "@/lib/format";
import {
  getAdminCategories,
  getAllBookings,
  getAllUsers,
} from "../../_actions/adminActions";
import { getMyPayments } from "../../_actions/paymentActions";
import { ActivityFeed } from "../../_components/ActivityFeed";
import { BookingsTable } from "../../_components/BookingsTable";
import { StatCard } from "../../_components/StatCard";

export const metadata: Metadata = { title: "Admin dashboard" };

const AdminDashboardPage = async () => {
  const [users, bookings, categories, payments] = await Promise.all([
    getAllUsers(),
    getAllBookings(),
    getAdminCategories(),
    getMyPayments(),
  ]);

  const technicians = users.filter((user) => user.role === "TECHNICIAN");

  const awaitingAccept = bookings.filter(
    (booking) => booking.status === "REQUESTED",
  );
  const awaitingPayment = bookings.filter(
    (booking) => booking.status === "ACCEPTED",
  );

  const lost = bookings.filter((booking) =>
    ["CANCELLED", "DECLINED"].includes(booking.status),
  );

  // Revenue = money the platform can prove it collected.
  const revenue = bookings
    .filter((booking) =>
      ["PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
    )
    .reduce((sum, booking) => sum + toNumber(booking.totalAmount), 0);

  const bookingDelta = periodDelta(bookings, 30);
  const revenueDelta = periodDelta(bookings, 30, (booking) =>
    ["PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status)
      ? toNumber(booking.totalAmount)
      : 0,
  );

  const cancelRate =
    bookings.length === 0
      ? 0
      : Math.round((lost.length / bookings.length) * 1000) / 10;

  const split = statusSplit(bookings);
  const weekRevenue = earningsByDay(bookings, 7, [
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
  ]);
  const activity = recentActivity(bookings, payments, users, 8);

  // The handoff's date line names the queues that are actually open.
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const queues = [
    awaitingAccept.length > 0 &&
      `${awaitingAccept.length} booking${awaitingAccept.length === 1 ? "" : "s"} awaiting a technician`,
    awaitingPayment.length > 0 && `${awaitingPayment.length} awaiting payment`,
  ].filter(Boolean) as string[];

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page text-text">Platform overview</h1>
          <p className="mt-1.5 text-body2 text-text2">
            {today}
            {queues.length > 0
              ? ` · ${queues.join(", ")}.`
              : " · no open queues."}
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/bookings">View all bookings</Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BanknoteIcon}
          label="Revenue collected"
          value={formatCurrency(revenue)}
          delta={
            revenueDelta
              ? `${revenueDelta.pct >= 0 ? "▲" : "▼"} ${Math.abs(revenueDelta.pct)}% vs previous 30 days`
              : undefined
          }
          tone={revenueDelta && revenueDelta.pct >= 0 ? "good" : "bad"}
          hint={revenueDelta ? undefined : "Paid and beyond"}
        />
        <StatCard
          icon={CalendarRangeIcon}
          label="Bookings"
          value={bookings.length}
          delta={
            bookingDelta
              ? `${bookingDelta.pct >= 0 ? "▲" : "▼"} ${Math.abs(bookingDelta.pct)}% vs previous 30 days`
              : undefined
          }
          tone={bookingDelta && bookingDelta.pct >= 0 ? "good" : "bad"}
          hint={
            bookingDelta
              ? undefined
              : `${awaitingAccept.length} awaiting a technician`
          }
        />
        <StatCard
          icon={UsersIcon}
          label="Active technicians"
          value={technicians.length}
          hint={`${users.length} users · ${categories.length} categories`}
        />
        <StatCard
          icon={CircleSlashIcon}
          label="Cancellation rate"
          value={`${cancelRate}%`}
          delta={`${lost.length} cancelled or declined`}
          // A high cancellation share is a regression, so it reads red.
          tone={cancelRate > 20 ? "bad" : "neutral"}
        />
      </div>

      {/* Revenue + status split — the handoff's 1.6fr / 1fr split. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-panel text-text">Revenue, last 7 days</h2>
              <p className="mt-0.5 text-caption text-text3">
                Bookings that got past payment
              </p>
            </div>
            <Money
              value={weekRevenue.total}
              className="text-[15px] font-bold"
            />
          </div>

          <BarChart bars={weekRevenue.bars} height={180} />
        </section>

        <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
          <h2 className="mb-5 text-panel text-text">Bookings by status</h2>

          <MetricBars metrics={split} />

          {/*
           * Diagnostic callout. The handoff names a cause ("Uttara evening
           * slots"); nothing in this API records why a booking failed, so
           * this states what the numbers do support and stops there.
           */}
          {lost.length > 0 && (
            <p className="mt-5 rounded-lg border border-amber-border bg-amber-soft p-3 text-[12.5px] leading-[1.55] text-text2">
              <span className="font-bold text-amber">
                {cancelRate}% of bookings ended early.{" "}
              </span>
              {awaitingAccept.length > 0
                ? `${awaitingAccept.length} more are still waiting on a technician — unanswered requests are the usual cause.`
                : "Every request has been answered, so these ended after acceptance."}
            </p>
          )}
        </section>
      </div>

      {/* Latest bookings + activity — the handoff's 1.3fr / 1fr split. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-panel text-text">Latest bookings</h2>
            <Link
              href="/dashboard/admin/bookings"
              className="text-btn text-primary hover:text-primary-hover"
            >
              View all →
            </Link>
          </div>

          <BookingsTable
            showTabs={false}
            bookings={bookings.slice(0, 6)}
            variant="admin"
            emptyTitle="No bookings on the platform yet"
            emptyDescription="Once customers start booking technicians, they'll show up here."
          />
        </section>

        <ActivityFeed items={activity} />
      </div>
    </>
  );
};

export default AdminDashboardPage;
