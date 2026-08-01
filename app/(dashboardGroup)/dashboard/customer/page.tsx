import {
  ClipboardListIcon,
  ClockIcon,
  CreditCardIcon,
  WalletIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, toNumber } from "@/lib/format";
import { getMyBookings } from "../../_actions/bookingActions";
import { getMyPayments } from "../../_actions/paymentActions";
import { ActiveBookingPanel } from "../../_components/ActiveBookingPanel";
import { BookAgainList } from "../../_components/BookAgainList";
import { BookingsTable } from "../../_components/BookingsTable";
import { PageHeader } from "../../_components/PageHeader";
import { StatCard } from "../../_components/StatCard";

export const metadata: Metadata = { title: "Customer dashboard" };

export default async function CustomerDashboardPage() {
  const [bookings, payments] = await Promise.all([
    getMyBookings(),
    getMyPayments(),
  ]);

  const active = bookings.filter((booking) =>
    ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status),
  );
  const awaitingPayment = bookings.filter(
    (booking) => booking.status === "ACCEPTED",
  );
  const totalSpent = payments
    .filter((payment) => payment.status === "COMPLETED")
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  return (
    <>
      <PageHeader
        title="Your bookings at a glance"
        description="Track every job from request to review."
        action={
          <Button asChild>
            <Link href="/services">Book a new service</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardListIcon}
          label="Total bookings"
          value={bookings.length}
        />
        <StatCard icon={ClockIcon} label="Active jobs" value={active.length} />
        <StatCard
          icon={CreditCardIcon}
          label="Awaiting payment"
          value={awaitingPayment.length}
          hint={awaitingPayment.length > 0 ? "Accepted — pay to confirm" : undefined}
        />
        <StatCard
          icon={WalletIcon}
          label="Total spent"
          value={formatCurrency(totalSpent)}
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
}
