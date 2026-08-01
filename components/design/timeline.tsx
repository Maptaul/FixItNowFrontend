import { CheckIcon } from "lucide-react";
import { StepState } from "@/components/design/stepper";
import { cn } from "@/lib/utils";

export type TimelineStep = {
  label: string;
  state: StepState;
  /** When it happened, or what the customer is waiting on. */
  meta?: string;
  /** Optional per-step note, rendered as an inline --surface-2 pill. */
  note?: string;
};

/**
 * Vertical timeline — design handoff § Timeline.
 *
 * 24px dot column plus content. Complete is a primary fill with a white ✓;
 * current is --surface with a 3px primary border *and* the focus ring;
 * upcoming is --surface with a 2px --border-strong outline. The connector is
 * a 2px line, primary above completed steps and --border after. Upcoming
 * titles drop to 500 / --text-3.
 */
export function Timeline({
  steps,
  className,
}: {
  steps: TimelineStep[];
  className?: string;
}) {
  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li key={step.label} className="flex gap-3.5">
            {/* Dot column */}
            <div className="flex flex-none flex-col items-center">
              <span
                className={cn(
                  "grid size-6 flex-none place-items-center rounded-full",
                  step.state === "done" &&
                    "bg-primary text-primary-foreground",
                  step.state === "current" &&
                    "border-[3px] border-primary bg-surface shadow-focus",
                  step.state === "upcoming" &&
                    "border-2 border-line-strong bg-surface",
                )}
              >
                {step.state === "done" && (
                  <CheckIcon className="size-3" strokeWidth={3} />
                )}
              </span>

              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-0.5 flex-1",
                    step.state === "done" ? "bg-primary" : "bg-line",
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p
                  className={cn(
                    "text-body2",
                    step.state === "upcoming"
                      ? "font-medium text-text3"
                      : "font-bold text-text",
                  )}
                >
                  {step.label}
                </p>

                {step.meta && (
                  <span className="font-mono text-[12px] text-text3">
                    {step.meta}
                  </span>
                )}
              </div>

              {step.note && (
                <span className="mt-1.5 inline-block rounded-[9px] bg-surface2 px-2.5 py-1 text-[12px] text-text2">
                  {step.note}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
