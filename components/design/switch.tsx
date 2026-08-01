"use client";

import { cn } from "@/lib/utils";

/**
 * Switch — design handoff § Selection controls.
 *
 * 44×26 r999 with 3px padding and a 20px white knob carrying --sh1. On:
 * --primary fill, knob to the right. Off: --surface-3. The dense variant is
 * 40×24 with an 18px knob, for use inside list rows.
 *
 * Hand-written rather than pulled from shadcn: it's a button with
 * `role="switch"`, and the whole control is 30 lines.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  dense = false,
  disabled = false,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Required — the switch has no visible text of its own. */
  label: string;
  dense?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex shrink-0 items-center rounded-full p-[3px] transition-colors duration-120 disabled:cursor-not-allowed disabled:opacity-50",
        dense ? "h-6 w-10" : "h-[26px] w-11",
        checked ? "justify-end bg-primary" : "justify-start bg-surface3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "rounded-full bg-white shadow-sh1 transition-transform duration-120",
          dense ? "size-[18px]" : "size-5",
        )}
      />
    </button>
  );
}
