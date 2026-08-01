import {
  BanknoteIcon,
  CalendarCheckIcon,
  ClockIcon,
  WalletIcon,
} from "lucide-react";
import { Metadata } from "next";
import { earningsByMonth } from "@/lib/analytics";
import { formatCurrency, toNumber } from "@/lib/format";
import { getTechnicianBookings } from "../../../_actions/bookingActions";
import { EarningsChart } from "../../../_components/EarningsChart";
import { EarningsTable } from "../../../_components/EarningsTable";
import { PageHeader } from "../../../_components/PageHeader";
import { StatCard } from "../../../_components/StatCard";

export const metadata: Metadata = { title: "Earnings" };

export default async function TechnicianEarningsPage() {
  const bookings = await getTechnicianBookings();

  const completed = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  );

  // Money committed but not yet earned: the customer has paid, the job hasn't
  // been marked complete.
  const inFlight = bookings.filter((booking) =>
    ["PAID", "IN_PROGRESS"].includes(booking.status),
  );

  const sum = (list: typeof bookings) =>
    list.reduce((total, booking) => total + toNumber(booking.totalAmount), 0);

  const lifetime = sum(completed);
  const pending = sum(inFlight);

  const now = new Date();
  const thisMonth = sum(
    completed.filter((booking) => {
      const when = new Date(booking.updatedAt);
      return (
        when.getFullYear() === now.getFullYear() &&
        when.getMonth() === now.getMonth()
      );
    }),
  );

  const monthly = earningsByMonth(bookings, 7);

  return (
    <>
      <PageHeader
        title="Earnings"
        description="What you've earned, what's still tied to a job in progress, and the ledger behind both."
      />

      {/*
       * The handoff's first card is "Available to withdraw" with an inline
       * Withdraw button. This API has no payout, commission or withdrawal
       * model — money moves from the customer to Stripe, and nothing records
       * a transfer to the technician. A withdraw button that can't withdraw
       * would be worse than not having one, so the card shows lifetime
       * earnings instead.
       */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={WalletIcon}
          label="Earned, lifetime"
          value={formatCurrency(lifetime)}
          hint={`${completed.length} completed job${completed.length === 1 ? "" : "s"}`}
          emphasis
        />
        <StatCard
          icon={ClockIcon}
          label="In progress"
          value={formatCurrency(pending)}
          hint={
            inFlight.length > 0
              ? `${inFlight.length} job${inFlight.length === 1 ? "" : "s"} to finish`
              : "Nothing outstanding"
          }
        />
        <StatCard
          icon={CalendarCheckIcon}
          label="This month"
          value={formatCurrency(thisMonth)}
        />
        <StatCard
          icon={BanknoteIcon}
          label="Average job"
          value={
            completed.length === 0
              ? formatCurrency(0)
              : formatCurrency(lifetime / completed.length)
          }
        />
      </div>

      <div className="mt-6">
        <EarningsChart
          money={monthly.money}
          jobs={monthly.jobs}
          total={monthly.total}
        />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-panel text-text">Earnings ledger</h2>
        <EarningsTable bookings={bookings} />
      </section>
    </>
  );
}
