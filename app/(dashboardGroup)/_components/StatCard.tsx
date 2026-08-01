import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Stat card — design handoff § Cards › Stat card.
 *
 * Label 12.5/600 --text-3, value 25px mono/700, optional delta 12/600 using
 * text arrows (▲ ▼ —) rather than an icon font. Emerald reads as good, red as
 * bad, --text-3 as neutral — `tone` says which, because a rising cancellation
 * rate is a regression even though the arrow points up.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  tone = "neutral",
  emphasis = false,
}: {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  delta?: string;
  tone?: "good" | "bad" | "neutral";
  /** Primary-tinted treatment for the one card that carries an action. */
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-panel border p-5 shadow-sh2",
        emphasis
          ? "border-primary-border bg-primary-soft"
          : "border-line bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption text-text3">{label}</p>

        {Icon && (
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>

      <p className="mt-2 font-mono text-stat tabular-nums text-text">{value}</p>

      {delta && (
        <p
          className={cn(
            "mt-1 text-[12px] font-semibold",
            tone === "good" && "text-emerald",
            tone === "bad" && "text-red",
            tone === "neutral" && "text-text3",
          )}
        >
          {delta}
        </p>
      )}

      {hint && !delta && (
        <p className="mt-1 text-[12px] font-medium text-text3">{hint}</p>
      )}
    </div>
  );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-panel border border-line bg-surface p-5 shadow-sh2"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="size-8 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
