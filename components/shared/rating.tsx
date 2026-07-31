import { StarIcon } from "lucide-react";
import { formatRating, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Read-only rating display. Renders five stars filled to the nearest half,
 * with the numeric value beside them for anyone who can't rely on colour.
 */
export function Rating({
  value,
  count,
  className,
}: {
  value: string | number;
  count?: number;
  className?: string;
}) {
  const rating = toNumber(value);

  return (
    <span
      className={cn("inline-flex items-center gap-1 text-sm", className)}
      aria-label={`Rated ${formatRating(rating)} out of 5`}
    >
      <span className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn(
              "size-3.5",
              rating >= star - 0.5
                ? "fill-accent text-accent"
                : "text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="font-medium tabular-nums">{formatRating(rating)}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </span>
  );
}
