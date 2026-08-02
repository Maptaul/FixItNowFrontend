import Link from "next/link";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { ImagePlaceholder } from "@/components/design/placeholder";
import { Money } from "@/components/design/money";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRating, toNumber } from "@/lib/format";
import { getTechnicians } from "../_actions/getTechnicians";

/**
 * The raised card beside the hero (r24, --sh4, 22px padding).
 *
 * The handoff draws this as a "Live job — #FIN-24817 / On the way" card. We
 * can't source that honestly: bookings are private to their customer and
 * technician, and there is no public live-job feed. Inventing a booking ID
 * would put fabricated data on the marketing page, so the card keeps the
 * exact treatment and shows a real top-rated technician instead.
 */
export async function HeroSpotlight() {
  const { technicians } = await getTechnicians({ limit: 1 });
  const technician = technicians[0];

  if (!technician) return null;

  const name = technician.user?.name ?? "Technician";
  const services = technician.services ?? [];
  const fromPrice = services.length
    ? Math.min(...services.map((service) => toNumber(service.price)))
    : toNumber(technician.hourlyRate);

  return (
    <Link
      href={`/technicians/${technician.id}`}
      className="block rounded-modal border border-line bg-surface p-[22px] shadow-sh4 transition-transform duration-160 hover:-translate-y-0.5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-label text-text">Top rated this week</span>
        <Badge variant="emerald">Available</Badge>
      </div>

      <ImagePlaceholder
        caption="technician at work — 16:9 photo"
        className="mb-4 h-[170px]"
      />

      <div className="flex items-center gap-3 rounded-row bg-surface2 p-3">
        <GradientAvatar
          name={name}
          src={technician.user?.avatarUrl}
          kind="technician"
          size={40}
          radius={12}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-body2 font-bold text-text">{name}</p>
          <p className="truncate text-caption text-text3">
            {services[0]?.category?.name ?? "Home services"} · ★{" "}
            {formatRating(technician.avgRating)}
            {technician.reviews?.length
              ? ` (${technician.reviews.length})`
              : ""}
          </p>
        </div>

        <div className="text-right">
          <Money value={fromPrice} className="block text-[15px] font-bold" />
          <span className="text-[11px] text-text3">from</span>
        </div>
      </div>
    </Link>
  );
}

export function HeroSpotlightSkeleton() {
  return (
    <div className="rounded-modal border border-line bg-surface p-[22px] shadow-sh4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-[170px] rounded-card" />
      <div className="flex items-center gap-3 rounded-row bg-surface2 p-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
