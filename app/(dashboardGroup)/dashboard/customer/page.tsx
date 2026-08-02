import {
  ClipboardListIcon,
  ClockIcon,
  CreditCardIcon,
  WalletIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isBookingLive } from "@/lib/constants";
import { formatCurrency, toNumber } from "@/lib/format";
import { getMe } from "@/service/getMe";
import { getMyBookings } from "../../_actions/bookingActions";
import { getMyPayments } from "../../_actions/paymentActions";
import { ActiveBookingPanel } from "../../_components/ActiveBookingPanel";
import { BookAgainList } from "../../_components/BookAgainList";
import { BookingsTable } from "../../_components/BookingsTable";
import { PageHeader } from "../../_components/PageHeader";
import { StatCard } from "../../_components/StatCard";
import { LiveRefresh } from "../../_components/LiveRefresh";

export const metadata: Metadata = { title: "Customer dashboard" };

/** "Good morning / afternoon / evening", per the handoff's greeting. */
const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const CustomerDashboardPage = async () => {
  const [user, bookings, payments] = await Promise.all([
    getMe(),
    getMyBookings(),
    getMyPayments(),
  ]);

  const active = bookings.filter((booking) => isBookingLive(booking.status));
  const completed = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  );
  const awaitingPayment = bookings.filter(
    (booking) => booking.status === "ACCEPTED",
  );

  const settled = payments.filter((payment) => payment.status === "COMPLETED");

  // "Spent this year" rather than all-time — the handoff's framing, and the
  // more useful number once an account is a few years old.
  const thisYear = new Date().getFullYear();
  const spentThisYear = settled
    .filter(
      (payment) =>
        new Date(payment.paidAt ?? payment.createdAt).getFullYear() ===
        thisYear,
    )
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  return (
    <>
      {/* Only worth watching while a job is actually in flight. */}
      <LiveRefresh enabled={active.length > 0} />

      <PageHeader
        title={`${greeting()}${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description={
          active.length > 0
            ? `${active.length} job${active.length === 1 ? "" : "s"} in flight. Track them below.`
            : "Nothing in flight right now. Browse services to book your next job."
        }
        action={
          <Button asChild>
            <Link href="/services">Book a new service</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClockIcon}
          label="Active bookings"
          value={active.length}
          hint={
            awaitingPayment.length > 0
              ? `${awaitingPayment.length} waiting on payment`
              : undefined
          }
        />
        <StatCard
          icon={ClipboardListIcon}
          label="Completed"
          value={completed.length}
        />
        <StatCard
          icon={WalletIcon}
          label={`Spent in ${thisYear}`}
          value={formatCurrency(spentThisYear)}
        />
        {/*
         * The handoff's fourth card is "Saved with promos". There is no promo
         * or discount model on this API, so this shows the payment count —
         * a number the receipts can actually back up.
         */}
        <StatCard
          icon={CreditCardIcon}
          label="Payments made"
          value={settled.length}
        />
      </div>

      {/* Active booking + rebooking — the handoff's 1.5fr / 1fr split. */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {active.length > 0 ? (
          <ActiveBookingPanel booking={active[0]} />
        ) : (
          <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
            <h2 className="mb-2 text-panel text-text">No active booking</h2>
            <p className="text-body2 text-text2">
              Nothing in flight right now. Browse services and request a slot —
              you&apos;ll be able to track it from here.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/services">Browse services</Link>
            </Button>
          </section>
        )}

        <BookAgainList bookings={bookings} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-panel text-text">Recent bookings</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customer/bookings">View all</Link>
          </Button>
        </div>

        <BookingsTable
          showTabs={false}
          bookings={bookings.slice(0, 5)}
          variant="customer"
          emptyTitle="You haven't booked anything yet"
          emptyDescription="Browse services and request a slot with a technician to get started."
        />
      </section>
    </>
  );
};

export default CustomerDashboardPage;
