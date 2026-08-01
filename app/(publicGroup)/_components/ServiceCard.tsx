import Image from "next/image";
import Link from "next/link";
import { Money } from "@/components/design/money";
import { Badge } from "@/components/ui/badge";
import { categoryImage } from "@/lib/constants";
import { formatRating } from "@/lib/format";
import { IService } from "@/lib/types";

/**
 * Service card — design handoff § Cards › Service card.
 *
 * 120px image band, then a 16px body: title with a right-aligned tag chip,
 * a 12.5px description, and a footer row carrying the mono price with
 * "/ visit" plus the technician's rating. Whole card is the click target;
 * hover lifts 2px to --sh3 over 160ms.
 *
 * The handoff ships a striped placeholder for the band because it hands over
 * no assets — real category photography replaces it here, which is what the
 * placeholder was standing in for.
 */
export function ServiceCard({ service }: { service: IService }) {
  const technician = service.technician;
  const href = technician
    ? `/technicians/${technician.id}?service=${service.id}`
    : "/technicians";

  const reviewCount = technician?.reviews?.length ?? 0;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sh2 transition-all duration-160 hover:-translate-y-0.5 hover:shadow-sh3"
    >
      <div className="fx-placeholder relative h-[120px] shrink-0 overflow-hidden">
        <Image
          src={categoryImage(service.category?.name)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-cardtitle text-text">
            {service.title}
          </h3>
          {service.category && (
            <Badge variant="neutral" className="shrink-0">
              {service.category.name}
            </Badge>
          )}
        </div>

        <p className="line-clamp-2 min-h-[38px] text-caption font-normal text-text2">
          {service.description ??
            `Fixed price, agreed before the visit. Booked with ${technician?.user?.name ?? "a verified technician"}.`}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-line pt-3.5">
          <span>
            <Money value={service.price} className="text-[15px] font-bold" />
            <span className="ml-1 text-[11.5px] text-text3">/ visit</span>
          </span>

          {technician && (
            <span className="text-caption text-text3">
              <span aria-hidden="true" className="text-star">
                ★
              </span>{" "}
              <span className="font-mono">
                {formatRating(technician.avgRating)}
              </span>
              {reviewCount > 0 &&
                ` · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
