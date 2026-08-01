import Link from "next/link";
import { Mono } from "@/components/design/money";
import { Button } from "@/components/ui/button";
import { toNumber } from "@/lib/format";
import { IAvailabilitySlot, IService, ITechnicianProfile } from "@/lib/types";

/**
 * Profile-completion card — design handoff § Technician › Profile.
 *
 * An amber card showing the percentage and, crucially, **the exact blocker**
 * rather than a generic nudge. Each check maps to a real field, so the number
 * can't drift from what a customer actually sees on the public profile.
 */
type Check = {
  label: string;
  done: boolean;
  /** What to do about it, and where. */
  blocker: string;
  href: string;
  cta: string;
};

export function ProfileCompletion({
  profile,
  services,
  slots,
}: {
  profile: ITechnicianProfile | null | undefined;
  services: IService[];
  slots: IAvailabilitySlot[];
}) {
  const checks: Check[] = [
    {
      label: "Bio written",
      done: Boolean(profile?.bio?.trim()),
      blocker:
        "Write a bio — it's the first thing a customer reads before booking you.",
      href: "#trade-profile",
      cta: "Add your bio",
    },
    {
      label: "Service area set",
      done: Boolean(profile?.location?.trim()),
      blocker:
        "Set your service area. Customers filter by location, so an empty one keeps you out of every search.",
      href: "#trade-profile",
      cta: "Set your area",
    },
    {
      label: "Experience recorded",
      done: toNumber(profile?.experienceYears) > 0,
      blocker:
        "Add your years of experience — it shows on every search result.",
      href: "#trade-profile",
      cta: "Add experience",
    },
    {
      label: "Hourly rate set",
      done: toNumber(profile?.hourlyRate) > 0,
      blocker:
        "Set your hourly rate. It's the fallback price shown when you have no services listed.",
      href: "#trade-profile",
      cta: "Set your rate",
    },
    {
      label: "Services listed",
      done: services.length > 0,
      blocker:
        "List at least one service. Without one there is nothing for a customer to book.",
      href: "/dashboard/technician/services",
      cta: "Add a service",
    },
    {
      label: "Availability published",
      done: slots.some((slot) => !slot.isBooked),
      blocker:
        "Publish some availability. Your profile shows no bookable slots until you do.",
      href: "/dashboard/technician/availability",
      cta: "Open your calendar",
    },
  ];

  const done = checks.filter((check) => check.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const nextBlocker = checks.find((check) => !check.done);

  if (!nextBlocker) {
    return (
      <section className="rounded-panel border border-emerald-border bg-emerald-soft p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-panel text-text">Your profile is complete</p>
            <p className="mt-0.5 text-body2 text-text2">
              Everything customers look at before booking is filled in.
            </p>
          </div>
          <Mono className="text-stat font-bold text-emerald">100%</Mono>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-panel border border-amber-border bg-surface p-5 shadow-sh2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-panel text-text">
            Your profile is {pct}% complete
          </p>
          <p className="mt-1 max-w-lg text-body2 text-text2">
            {nextBlocker.blocker}
          </p>
        </div>

        <Mono className="text-stat font-bold text-amber">{pct}%</Mono>
      </div>

      {/* 8px r999 track, per the handoff's horizontal metric bars. */}
      <div
        role="img"
        aria-label={`Profile ${pct}% complete`}
        className="mt-4 h-2 overflow-hidden rounded-full bg-surface3"
      >
        <div
          className="h-full rounded-full bg-amber"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button size="sm" asChild>
          <Link href={nextBlocker.href}>{nextBlocker.cta}</Link>
        </Button>

        <p className="text-caption text-text3">
          <Mono>
            {done}/{checks.length}
          </Mono>{" "}
          done · still missing:{" "}
          {checks
            .filter((check) => !check.done)
            .map((check) => check.label.toLowerCase())
            .join(", ")}
        </p>
      </div>
    </section>
  );
}
