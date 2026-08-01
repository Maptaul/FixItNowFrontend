import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Input — design_handoff_fixitnow/README.md § Inputs.
 * h42, pad 0 13px, r10, 1px --border-strong on --surface, 14px text.
 * Error state (aria-invalid) is a red border on a red-soft fill; the
 * message itself is rendered by <Field> below the control.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[42px] w-full min-w-0 rounded-md border border-line-strong bg-surface px-[13px] text-body text-text transition-colors duration-120 outline-none",
        "placeholder:text-text3",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body2 file:font-semibold file:text-text",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface2 disabled:text-text3",
        "aria-invalid:border-red aria-invalid:bg-red-soft",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
