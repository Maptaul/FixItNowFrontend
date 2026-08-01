import { CheckIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { Money } from "@/components/design/money";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, toDateInputValue } from "@/lib/format";
import { IAvailabilitySlot, IService } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Sticky booking rail — design handoff § Technician detail.
 *
 * Mono price + "/ visit", the fixed-price note, the three earliest slots as a
 * preview (taken ones struck through), an h46 primary Book button and three
 * emerald-check guarantees.
 *
 * The rail doesn't book — it hands off to the wizard at /book/[id], so there
 * is exactly one booking implementation to keep correct.
 */
const GUARANTEES = [
  "Fixed price — the total is agreed before the visit",
  "You only pay after the technician accepts",
  "Cancel free any time before work starts",
];

function RailShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="h-fit rounded-panel border border-line bg-surface p-6 shadow-sh3 lg:sticky lg:top-[86px]">
      {children}
    </aside>
  );
}

function Guarantees() {
  return (
    <ul className="mt-5 space-y-2 border-t border-line pt-5">
      {GUARANTEES.map((line) => (
        <li key={line} className="flex gap-2 text-caption text-text2">
          <CheckIcon
            aria-hidden="true"
            className="mt-px size-3.5 shrink-0 text-emerald"
          />
          {line}
        </li>
      ))}
    </ul>
  );
}

export function BookingPanel({
  technicianId,
  technicianName,
  fromPrice,
  services,
  slots,
  isLoggedIn,
  isCustomer,
  preselectedServiceId,
}: {
  technicianId: string;
  technicianName: string;
  fromPrice: number;
  services: IService[];
  slots: IAvailabilitySlot[];
  isLoggedIn: boolean;
  isCustomer: boolean;
  preselectedServiceId?: string;
}) {
  if (services.length === 0) {
    return (
      <RailShell>
        <h2 className="text-panel text-text">Book now</h2>
        <p className="mt-2 text-body2 text-text2">
          {technicianName} hasn&apos;t listed any services yet, so there&apos;s
          nothing to book. Their profile updates as soon as they do.
        </p>
        <Button variant="outline" className="mt-4 w-full" asChild>
          <Link href="/technicians">See other technicians</Link>
        </Button>
      </RailShell>
    );
  }

  // The three soonest slots, taken ones included so the rail reads honestly.
  const upcoming = [...slots]
    .sort((a, b) =>
      `${toDateInputValue(a.date)}${a.startTime}`.localeCompare(
        `${toDateInputValue(b.date)}${b.startTime}`,
      ),
    )
    .slice(0, 3);

  const bookHref = preselectedServiceId
    ? `/book/${technicianId}?service=${preselectedServiceId}`
    : `/book/${technicianId}`;

  return (
    <RailShell>
      <div className="border-b border-line pb-5">
        <Money value={fromPrice} className="text-[26px] font-bold" />
        <span className="ml-1 text-body2 text-text3">/ visit</span>
        <p className="mt-1 text-caption text-text3">
          Fixed price, agreed before anyone rings your bell.
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="border-b border-line py-5">
          <p className="mb-2.5 text-label text-text">Earliest slots</p>

          <ul className="space-y-1.5">
            {upcoming.map((slot) => (
              <li
                key={slot.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-[12.5px] font-semibold",
                  slot.isBooked
                    ? "border-line bg-surface2 text-text3 line-through"
                    : "border-line-strong bg-surface text-text",
                )}
              >
                <span>{formatDate(slot.date)}</span>
                <span className="font-mono">
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoggedIn ? (
        <>
          <Button className="mt-5 h-[46px] w-full" asChild>
            <Link href={`/auth/login?redirectTo=/book/${technicianId}`}>
              <LogInIcon />
              Log in to book
            </Link>
          </Button>
          <p className="mt-3 text-center text-caption text-text3">
            New here?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Create an account
            </Link>
          </p>
        </>
      ) : !isCustomer ? (
        <p className="mt-5 text-body2 text-text2">
          Only customer accounts can book jobs. Log in with a customer account
          to request this visit.
        </p>
      ) : (
        <Button className="mt-5 h-[46px] w-full" asChild>
          <Link href={bookHref}>Book this visit</Link>
        </Button>
      )}

      <Guarantees />
    </RailShell>
  );
}
