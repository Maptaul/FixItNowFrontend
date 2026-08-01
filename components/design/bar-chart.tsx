import { cn } from "@/lib/utils";

/**
 * Bar chart — design handoff § Charts.
 *
 * Deliberately CSS-only: a flex row with `align-items: end` at a fixed
 * height, each bar a flex column of mono value → bar (r7 top corners, height
 * as a %) → label. The latest period is --primary and every other bar is
 * --primary-soft, so "now" reads without a legend.
 *
 * No chart library at this fidelity, and the real build should keep it that
 * way.
 */
export type Bar = {
  label: string;
  value: number;
  /** What to print above the bar — defaults to the raw value. */
  display?: string;
};

export function BarChart({
  bars,
  height = 130,
  className,
}: {
  bars: Bar[];
  height?: 130 | 160 | 180;
  className?: string;
}) {
  const max = Math.max(...bars.map((bar) => bar.value), 0);

  return (
    <div
      className={cn("flex items-end gap-3", className)}
      style={{ height }}
      role="img"
      aria-label={bars
        .map((bar) => `${bar.label}: ${bar.display ?? bar.value}`)
        .join(", ")}
    >
      {bars.map((bar, index) => {
        const isLatest = index === bars.length - 1;
        // A zero-value period still needs a visible baseline.
        const pct = max === 0 ? 0 : (bar.value / max) * 100;

        return (
          <div
            key={`${bar.label}-${index}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="font-mono text-[10.5px] text-text3">
              {bar.display ?? bar.value}
            </span>

            <div
              className={cn(
                "w-full rounded-t-[7px]",
                isLatest ? "bg-primary" : "bg-primary-soft",
              )}
              style={{ height: `${Math.max(pct, bar.value > 0 ? 4 : 2)}%` }}
            />

            <span className="text-[11px] font-semibold text-text3">
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Horizontal metric bars — label + mono value, then an 8px r999 --surface-3
 * track with a filled span. Colour carries meaning: emerald for healthy,
 * primary for volume, amber for caution.
 */
export type Metric = {
  label: string;
  value: number;
  display: string;
  /** Share of the track to fill, 0–100. Defaults to `value`. */
  pct?: number;
  tone?: "emerald" | "primary" | "amber" | "red" | "violet";
};

const TONE_FILL: Record<NonNullable<Metric["tone"]>, string> = {
  emerald: "bg-emerald",
  primary: "bg-primary",
  amber: "bg-amber",
  red: "bg-red",
  violet: "bg-violet",
};

export function MetricBars({
  metrics,
  className,
}: {
  metrics: Metric[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-3.5", className)}>
      {metrics.map((metric) => {
        const pct = Math.min(100, Math.max(0, metric.pct ?? metric.value));

        return (
          <li key={metric.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-body2 text-text2">{metric.label}</span>
              <span className="font-mono text-[13px] font-semibold text-text">
                {metric.display}
              </span>
            </div>

            <div
              role="img"
              aria-label={`${metric.label}: ${metric.display}`}
              className="h-2 overflow-hidden rounded-full bg-surface3"
            >
              <div
                className={cn(
                  "h-full rounded-full",
                  TONE_FILL[metric.tone ?? "primary"],
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
