import {
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react";
import { Metadata } from "next";
import { formatCurrency, toNumber } from "@/lib/format";
import { getMyPayments } from "../../../_actions/paymentActions";
import { PageHeader } from "../../../_components/PageHeader";
import { PaymentsTable } from "../../../_components/PaymentsTable";
import { StatCard } from "../../../_components/StatCard";

export const metadata: Metadata = { title: "Payment history" };

export default async function CustomerPaymentsPage() {
  const payments = await getMyPayments();

  const settled = payments.filter((payment) => payment.status === "COMPLETED");
  const clearing = payments.filter((payment) => payment.status === "PENDING");

  const spent = settled.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0,
  );

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every Stripe charge against your bookings, with the reference you'd quote to support."
      />

      
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={WalletIcon}
          label="Total spent"
          value={formatCurrency(spent)}
          hint={`${settled.length} settled payment${settled.length === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={CreditCardIcon}
          label="Payments made"
          value={payments.length}
        />
        <StatCard
          icon={ClockIcon}
          label="Clearing"
          value={clearing.length}
          hint={clearing.length > 0 ? "Awaiting Stripe confirmation" : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <PaymentsTable payments={payments} />
        </div>

        {/*
         * The handoff puts a saved-payment-methods panel here. Checkout is
         * hosted by Stripe and this app never sees or stores a card, so
         * there's nothing to list — this explains the flow instead of
         * inventing a wallet.
         */}
        <aside className="h-fit rounded-panel border border-line bg-surface p-5 shadow-sh2">
          <h2 className="mb-3 text-panel text-text">How payment works</h2>

          <ol className="space-y-3.5">
            {[
              {
                icon: ClockIcon,
                title: "Nothing upfront",
                body: "Requesting a booking charges you nothing. Payment only opens once your technician accepts.",
              },
              {
                icon: CreditCardIcon,
                title: "Paid through Stripe",
                body: "You're redirected to Stripe's hosted checkout. Card details never touch FixItNow.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Tracked to done",
                body: "Once paid, the booking moves to Paid and your technician can start the job.",
              },
            ].map((step) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                  <step.icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-body2 font-semibold text-text">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-caption text-text2">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
