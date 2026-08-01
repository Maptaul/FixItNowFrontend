import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_META, PAYMENT_STATUS_META } from "@/lib/constants";
import { IBookingStatus, IPaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookingStatusBadge({
  status,
  className,
}: {
  status: IBookingStatus;
  className?: string;
}) {
  const meta = BOOKING_STATUS_META[status];

  return (
    <Badge variant={meta.variant} className={cn(className)}>
      {meta.label}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: IPaymentStatus;
  className?: string;
}) {
  const meta = PAYMENT_STATUS_META[status];

  return (
    <Badge variant={meta.variant} className={cn(className)}>
      {meta.label}
    </Badge>
  );
}
