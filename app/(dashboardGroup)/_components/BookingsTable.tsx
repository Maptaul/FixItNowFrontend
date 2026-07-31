import { CalendarX2Icon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { IBooking } from "@/lib/types";
import { CustomerBookingActions } from "./CustomerBookingActions";
import { TechnicianBookingActions } from "./TechnicianBookingActions";

type Variant = "customer" | "technician" | "admin";

/**
 * One table, three audiences.
 *
 * The "who" column flips (a customer wants the technician's name, a
 * technician wants the customer's, an admin wants both) and the action
 * column carries the role-appropriate buttons — admins get none, since the
 * API gives them read-only access to bookings.
 */
export function BookingsTable({
  bookings,
  variant,
  emptyTitle = "No bookings yet",
  emptyDescription = "Bookings will appear here once they're created.",
}: {
  bookings: IBooking[];
  variant: Variant;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2Icon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const showActions = variant !== "admin";

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            {variant === "customer" && <TableHead>Technician</TableHead>}
            {variant === "technician" && <TableHead>Customer</TableHead>}
            {variant === "admin" && (
              <>
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
              </>
            )}
            <TableHead>Scheduled</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="max-w-48 truncate font-medium">
                  {booking.service?.title ?? "Service"}
                </div>
                {booking.service?.category && (
                  <div className="text-xs text-muted-foreground">
                    {booking.service.category.name}
                  </div>
                )}
              </TableCell>

              {variant !== "technician" && (
                <TableCell className="text-muted-foreground">
                  {variant === "admin"
                    ? (booking.customer?.name ?? "—")
                    : (booking.technician?.user?.name ?? "—")}
                </TableCell>
              )}

              {variant === "technician" && (
                <TableCell>
                  <div className="font-medium">
                    {booking.customer?.name ?? "—"}
                  </div>
                  {booking.customer?.email && (
                    <div className="text-xs text-muted-foreground">
                      {booking.customer.email}
                    </div>
                  )}
                </TableCell>
              )}

              {variant === "admin" && (
                <TableCell className="text-muted-foreground">
                  {booking.technician?.user?.name ?? "—"}
                </TableCell>
              )}

              <TableCell className="text-muted-foreground">
                {formatDateTime(booking.scheduledAt)}
              </TableCell>

              <TableCell className="font-medium tabular-nums">
                {formatCurrency(booking.totalAmount)}
              </TableCell>

              <TableCell>
                <BookingStatusBadge status={booking.status} />
              </TableCell>

              {showActions && (
                <TableCell className="text-right">
                  {variant === "customer" ? (
                    <CustomerBookingActions booking={booking} />
                  ) : (
                    <TechnicianBookingActions booking={booking} />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
