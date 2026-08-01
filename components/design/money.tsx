import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Money, always in the mono face.
 *
 * The handoff sets money, IDs, dates in tables, counts and percentages in
 * JetBrains Mono — never prose. This is the single place that pairing is
 * applied, so a currency change is one edit.
 *
 * NOTE ON CURRENCY: the handoff is drawn for Bangladesh (৳ BDT), but the
 * live API creates Stripe sessions in **USD** (`currency: "usd"` in
 * payment.service.ts). Rendering ৳ over a USD charge would misstate what the
 * customer is actually billed, so the symbol stays USD until the backend's
 * Stripe currency changes. `formatCurrency` in lib/format.ts is the one place
 * to flip.
 */
export function Money({
  value,
  className,
}: {
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatCurrency(value)}
    </span>
  );
}

/**
 * Mono treatment for IDs, reference numbers, dates in tables and counts.
 * Accepts the usual span props so a truncated reference can carry a `title`.
 */
export function Mono({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span className={cn("font-mono tabular-nums", className)} {...props}>
      {children}
    </span>
  );
}
