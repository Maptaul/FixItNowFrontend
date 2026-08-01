import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal stepper — design handoff § Timeline (horizontal variant) and
 * § Booking flow.
 *
 * Shared dot vocabulary across the product:
 *   done     26px primary fill with a ✓
 *   current  primary fill *and* the focus ring
 *   upcoming 1px --border-strong outline, --text-3 numeral
 *
 * The connector is a 2px line: primary above completed steps, --border after.
 * Upcoming labels drop to 500 weight in --text-3.
 *
 * Labels are `whitespace-nowrap`, so five steps need ~827px. That is wider
 * than the 547px column the active-booking panel gives it on a 1280px
 * desktop, and the overflow used to widen the whole page. The row wraps
 * instead — 3 + 2 at that width, still one line wherever there is room.
 */
export type StepState = "done" | "current" | "upcoming";

export function Stepper({
  steps,
  className,
}: {
  steps: { label: string; state: StepState }[];
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-y-5", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li
            key={step.label}
            className={cn("flex items-center", !isLast && "flex-1")}
            aria-current={step.state === "current" ? "step" : undefined}
          >
            <span className="flex flex-none items-center gap-2.5">
              <span
                className={cn(
                  "grid size-[26px] flex-none place-items-center rounded-full text-[11.5px] font-bold",
                  step.state === "upcoming"
                    ? "border border-line-strong text-text3"
                    : "bg-primary text-primary-foreground",
                  step.state === "current" && "shadow-focus",
                )}
              >
                {step.state === "done" ? (
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>

              <span
                className={cn(
                  "hidden text-body2 whitespace-nowrap sm:block",
                  step.state === "current" && "font-bold text-text",
                  step.state === "done" && "font-semibold text-text",
                  step.state === "upcoming" && "font-medium text-text3",
                )}
              >
                {step.label}
              </span>
            </span>

            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-3.5 h-0.5 flex-1",
                  step.state === "done" ? "bg-primary" : "bg-line",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
