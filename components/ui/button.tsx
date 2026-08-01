import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Button — design_handoff_fixitnow/README.md § Buttons.
 *
 * Six variants, one primary action per view. Heights are the handoff's
 * ladder: l:44 / default:42 / m:38 / s:32, all r10, 13.5px/600.
 * Hover is 120ms ease-out; focus uses the 1px primary border + soft halo
 * from :focus-visible in globals.css.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border bg-clip-padding font-semibold whitespace-nowrap transition-colors duration-120 ease-out outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-line disabled:bg-surface2 disabled:text-text3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary — the one action per view.
        default:
          "border-primary bg-primary text-primary-foreground shadow-sh1 hover:border-primary-hover hover:bg-primary-hover",
        // Secondary — the handoff's outlined button on a surface fill.
        outline:
          "border-line-strong bg-surface text-text hover:bg-surface2 aria-expanded:bg-surface2",
        // Soft — active filter pills, low-emphasis affirmative actions.
        soft: "border-primary-border bg-primary-soft text-primary hover:brightness-[0.98]",
        // Neutral fill, kept for shadcn components that ask for it.
        secondary:
          "border-transparent bg-surface2 text-text hover:bg-surface3 aria-expanded:bg-surface2",
        ghost:
          "border-transparent text-text2 hover:bg-surface2 hover:text-text aria-expanded:bg-surface2 aria-expanded:text-text",
        // Destructive — solid red. Reserve for irreversible confirmations.
        destructive:
          "border-red bg-red text-white shadow-sh1 hover:brightness-110",
        // Soft destructive — "Cancel booking", "Reject", "Delete account".
        "destructive-soft":
          "border-red-border bg-red-soft text-red hover:brightness-[0.98]",
        link: "border-transparent text-primary underline-offset-[3px] hover:text-primary-hover hover:underline",
      },
      size: {
        default: "h-[42px] px-5 text-btn",
        lg: "h-11 px-5 text-[14px]",
        md: "h-[38px] px-4 text-btn",
        sm: "h-8 gap-1.5 rounded-[9px] px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-7 gap-1 rounded-sm px-2.5 text-[12.5px] [&_svg:not([class*='size-'])]:size-3",
        // Icon buttons are square at the row height.
        icon: "size-[42px] px-0",
        "icon-lg": "size-11 px-0",
        "icon-md": "size-[38px] px-0",
        "icon-sm":
          "size-8 rounded-[9px] px-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs":
          "size-7 rounded-sm px-0 [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
