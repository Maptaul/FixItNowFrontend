"use client";

import { useState } from "react";
import { Bar, BarChart } from "@/components/design/bar-chart";
import { Money } from "@/components/design/money";
import { Button } from "@/components/ui/button";

/**
 * Monthly earnings chart with the handoff's Earnings / Jobs toggle.
 *
 * Both series are computed server-side and passed in, so switching is instant
 * and costs no request.
 */
export function EarningsChart({
  money,
  jobs,
  total,
}: {
  money: Bar[];
  jobs: Bar[];
  total: number;
}) {
  const [mode, setMode] = useState<"money" | "jobs">("money");

  const jobTotal = jobs.reduce((sum, bar) => sum + bar.value, 0);

  return (
    <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-panel text-text">Last 7 months</h2>
          <p className="mt-0.5 text-caption text-text3">
            {mode === "money" ? (
              <>
                <Money value={total} className="text-text2" /> earned across{" "}
                {jobTotal} job{jobTotal === 1 ? "" : "s"}
              </>
            ) : (
              <>
                {jobTotal} job{jobTotal === 1 ? "" : "s"} completed
              </>
            )}
          </p>
        </div>

        <div className="flex gap-1.5">
          <Button
            type="button"
            variant={mode === "money" ? "soft" : "outline"}
            size="sm"
            aria-pressed={mode === "money"}
            onClick={() => setMode("money")}
          >
            Earnings
          </Button>
          <Button
            type="button"
            variant={mode === "jobs" ? "soft" : "outline"}
            size="sm"
            aria-pressed={mode === "jobs"}
            onClick={() => setMode("jobs")}
          >
            Jobs
          </Button>
        </div>
      </div>

      <BarChart bars={mode === "money" ? money : jobs} height={180} />
    </section>
  );
}
