import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Chip / status badge — design_handoff_fixitnow/README.md § Chips.
 *
 * 11.5px / 700 / 3px 9px / r999 / 1px border, never wrapping. The semantic
 * mapping is fixed across the whole product, so pick the variant by *meaning*
 * rather than by colour:
 *
 *   emerald  Completed · Paid · Verified · Settled · Cleared · Live · Sent
 *   amber    Pending · Request · Clearing · Expiring · Low supply · Disputed
 *   primary  In progress · On the way · Accepted · Next
 *   red      Cancelled · Refunded · Failed · Banned · Removed
 *   violet   Emergency tier (no border)
 *   neutral  Draft · Fully booked · anything without state
 *
 * Status is never colour-only — every chip carries a word.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-[9px] py-[3px] text-chip whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        emerald: "border-emerald-border bg-emerald-soft text-emerald",
        amber: "border-amber-border bg-amber-soft text-amber",
        primary: "border-primary-border bg-primary-soft text-primary",
        red: "border-red-border bg-red-soft text-red",
        violet: "border-transparent bg-violet-soft text-violet",
        neutral: "border-line bg-surface2 text-text2",
        // Solid fill — the only chip that sits on a coloured surface.
        solid: "border-primary bg-primary text-primary-foreground",
        outline: "border-line text-text2",
        // shadcn aliases, so existing call sites keep working.
        default: "border-primary-border bg-primary-soft text-primary",
        secondary: "border-line bg-surface2 text-text2",
        destructive: "border-red-border bg-red-soft text-red",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant = "neutral",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
