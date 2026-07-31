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

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent bookings</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/customer/bookings">View all</Link>
          </Button>
        </div>

        <BookingsTable
          bookings={bookings.slice(0, 5)}
          variant="customer"
          emptyTitle="You haven't booked anything yet"
          emptyDescription="Browse services and request a slot with a technician to get started."
        />
      </section>
    </>
  );
}
