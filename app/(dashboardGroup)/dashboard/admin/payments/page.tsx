import {
  BanknoteIcon,
  ClockIcon,
  ReceiptTextIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Metadata } from "next";
import { formatCurrency, toNumber } from "@/lib/format";
import { getMyPayments } from "../../../_actions/paymentActions";
import { PageHeader } from "../../../_components/PageHeader";
import { PaymentsTable } from "../../../_components/PaymentsTable";
import { StatCard } from "../../../_components/StatCard";

export const metadata: Metadata = { title: "Payments" };

/**
 * Platform-wide payments — design handoff § Admin › Payments.
 *
 * `GET /api/payments` returns every payment when the caller is an admin
 * (`where = role === "ADMIN" ? {} : { booking: { customerId } }`), so this is
 * the same endpoint the customer screen uses, unfiltered.
 *
 * The handoff's other three cards are commission, refunded and open disputes.
 * None of those exist in this API — there's no commission split, no refund
 * record and no dispute model — so the cards show what the payment table can
 * actually prove: collected, still clearing, and failed.
 */
export default async function AdminPaymentsPage() {
  const payments = await getMyPayments();

  const settled = payments.filter((payment) => payment.status === "COMPLETED");
  const clearing = payments.filter((payment) => payment.status === "PENDING");
  const failed = payments.filter((payment) => payment.status === "FAILED");

  const collected = settled.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0,
  );

  const failureRate =
    payments.length === 0
      ? 0
      : Math.round((failed.length / payments.length) * 100);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every Stripe transaction on the platform, with the reference you'd quote when a customer asks."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BanknoteIcon}
          label="Collected"
          value={formatCurrency(collected)}
          hint={`${settled.length} settled payment${settled.length === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={ReceiptTextIcon}
          label="Transactions"
          value={payments.length}
        />
        <StatCard
          icon={ClockIcon}
          label="Clearing"
          value={clearing.length}
          hint={
            clearing.length > 0
              ? "Session opened, not confirmed"
              : "Nothing outstanding"
          }
        />
        <StatCard
          icon={TriangleAlertIcon}
          label="Failed"
          value={failed.length}
          delta={`${failureRate}% of all transactions`}
          // A rising share of failures is a regression, so it reads red.
          tone={failureRate > 10 ? "bad" : "neutral"}
        />
      </div>

      <div className="mt-6">
        <PaymentsTable payments={payments} showCustomer />
      </div>
    </>
  );
}
