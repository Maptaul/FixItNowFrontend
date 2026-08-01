import { ActivityIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityItem } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TONE_DOT: Record<ActivityItem["tone"], string> = {
  emerald: "bg-emerald",
  primary: "bg-primary",
  amber: "bg-amber",
  red: "bg-red",
  violet: "bg-violet",
};

/** "12 minutes ago", "2 hours ago", "Yesterday", then a plain date. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.round((Date.now() - then) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "yesterday";

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Recent activity — design handoff § Admin › Overview.
 * A semantic dot per row, the event, and how long ago it happened.
 */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="overflow-hidden rounded-panel border border-line bg-surface shadow-sh2">
      <h2 className="border-b border-line px-[22px] py-[18px] text-panel text-text">
        Recent activity
      </h2>

      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={ActivityIcon}
            title="Nothing has happened yet"
            description="Bookings, payments and sign-ups appear here as they land."
            className="border-0 p-0"
          />
        </div>
      ) : (
        <ul className="px-[22px] py-2 pb-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 py-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-[7px] size-2 shrink-0 rounded-full",
                  TONE_DOT[item.tone],
                )}
              />
              <span className="min-w-0">
                <span className="block text-body2 text-text">{item.text}</span>
                <span className="mt-0.5 block text-[12px] text-text3">
                  {relativeTime(item.at)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
