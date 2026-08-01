"use client";

import { ReceiptTextIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DataTableCard,
  DataTableCell,
  DataTableFilterBar,
  DataTableFilterButton,
  DataTableHead,
  DataTablePagination,
  DataTableRow,
  DataTableTh,
} from "@/components/design/data-table";
import { Money, Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { IPayment, IPaymentStatus } from "@/lib/types";

const PER_PAGE = 8;

const STATUS_CYCLE: (IPaymentStatus | "ALL")[] = [
  "ALL",
  "COMPLETED",
  "PENDING",
  "FAILED",
];

const STATUS_LABEL: Record<string, string> = {
  ALL: "All",
  COMPLETED: "Settled",
  PENDING: "Clearing",
  FAILED: "Failed",
};

/**
 * Invoice table — design handoff § Customer › Payments, on the data-table
 * pattern.
 *
 * Reference + date, service, gateway, status, amount. The reference column
 * shows the Stripe transaction id where one exists, because that's the string
 * a customer would quote to support — the internal payment id means nothing
 * to them.
 */
export function PaymentsTable({
  payments,
  /** Admins see who paid; a customer only ever sees their own. */
  showCustomer = false,
}: {
  payments: IPayment[];
  showCustomer?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IPaymentStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      if (status !== "ALL" && payment.status !== status) return false;
      if (!query) return true;

      return [
        payment.booking?.service?.title,
        payment.transactionId,
        payment.provider,
        payment.booking?.customer?.name,
        payment.booking?.customer?.email,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query));
    });
  }, [payments, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={ReceiptTextIcon}
        title="No payments yet"
        description="Once you pay for an accepted booking, the receipt and its Stripe reference show up here."
      />
    );
  }

  return (
    <DataTableCard
      template={
        showCustomer
          ? "1.3fr 1fr 1fr .7fr .8fr .8fr"
          : "1.4fr 1fr .8fr .8fr .8fr"
      }
    >
      <DataTableFilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search service or reference…"
      >
        <DataTableFilterButton
          label="Status"
          value={STATUS_LABEL[status]}
          isApplied={status !== "ALL"}
          onClear={() => {
            setStatus("ALL");
            setPage(1);
          }}
          onClick={() => {
            const index = STATUS_CYCLE.indexOf(status);
            setStatus(STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length]);
            setPage(1);
          }}
        />
      </DataTableFilterBar>

      <DataTableHead>
        <DataTableTh>Service</DataTableTh>
        {showCustomer && <DataTableTh>Customer</DataTableTh>}
        <DataTableTh>Reference</DataTableTh>
        <DataTableTh>Gateway</DataTableTh>
        <DataTableTh>Status</DataTableTh>
        <DataTableTh className="text-right">Amount</DataTableTh>
      </DataTableHead>

      {visible.length === 0 ? (
        <p className="border-t border-line px-5 py-10 text-center text-body2 text-text2">
          Nothing matches that search.
        </p>
      ) : (
        visible.map((payment) => (
          <DataTableRow key={payment.id}>
            <DataTableCell label="Service">
              <p className="truncate font-semibold text-text">
                {payment.booking?.service?.title ?? "Booking"}
              </p>
              <Mono className="block text-[12px] text-text3">
                {payment.paidAt
                  ? formatDate(payment.paidAt)
                  : formatDate(payment.createdAt)}
              </Mono>
            </DataTableCell>

            {showCustomer && (
              <DataTableCell label="Customer">
                <p className="truncate text-text2">
                  {payment.booking?.customer?.name ?? "—"}
                </p>
                {payment.booking?.customer?.email && (
                  <p className="truncate text-[12px] text-text3">
                    {payment.booking.customer.email}
                  </p>
                )}
              </DataTableCell>
            )}

            <DataTableCell label="Reference">
              <Mono
                className="block truncate text-[12.5px] text-text2"
                title={payment.transactionId ?? undefined}
              >
                {payment.transactionId ?? "—"}
              </Mono>
            </DataTableCell>

            <DataTableCell label="Gateway">
              <Badge variant="neutral">{payment.provider}</Badge>
            </DataTableCell>

            <DataTableCell label="Status">
              <PaymentStatusBadge status={payment.status} />
            </DataTableCell>

            <DataTableCell label="Amount" className="md:text-right">
              <Money value={payment.amount} className="font-semibold" />
            </DataTableCell>
          </DataTableRow>
        ))
      )}

      <DataTablePagination
        page={safePage}
        pageSize={PER_PAGE}
        total={filtered.length}
        onPageChange={setPage}
      />
    </DataTableCard>
  );
}
