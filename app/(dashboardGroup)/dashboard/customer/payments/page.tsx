import { ReceiptTextIcon } from "lucide-react";
import { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getMyPayments } from "../../../_actions/paymentActions";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Payment history" };

export default async function CustomerPaymentsPage() {
  const payments = await getMyPayments();

  return (
    <>
      <PageHeader
        title="Payment history"
        description="Every Stripe charge against your bookings."
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={ReceiptTextIcon}
          title="No payments yet"
          description="Once you pay for an accepted booking, the receipt shows up here."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.booking?.service?.title ?? "Booking"}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.provider}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.paidAt ? formatDateTime(payment.paidAt) : "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-40 truncate font-mono text-xs text-muted-foreground"
                    title={payment.transactionId ?? undefined}
                  >
                    {payment.transactionId ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
