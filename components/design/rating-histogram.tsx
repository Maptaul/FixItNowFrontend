import { formatRating } from "@/lib/format";
import { IReview } from "@/lib/types";

/**
 * Rating summary — design handoff § Charts › Rating histogram and
 * § Technician detail.
 *
 * 44px mono average with a star row, then 5→1 rows: star numeral, a 7px
 * track with a --star fill, and a right-aligned mono count. Deliberately
 * CSS-only; no chart library at this fidelity.
 */
export function RatingHistogram({
  reviews,
  average,
}: {
  reviews: IReview[];
  average: string | number;
}) {
  const total = reviews.length;

  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  return (
    <div className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-5 shadow-sh2 sm:flex-row sm:items-center">
      <div className="shrink-0 text-center sm:w-36">
        <p className="font-mono text-[44px] leading-none font-bold tracking-[-0.03em] text-text">
          {formatRating(average)}
        </p>

        <p className="mt-2 text-star" aria-hidden="true">
          {"★".repeat(Math.round(Number(average) || 0)).padEnd(5, "☆")}
        </p>

        <p className="mt-1 text-caption text-text3">
          {total} review{total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        {buckets.map((bucket) => {
          const pct = total === 0 ? 0 : (bucket.count / total) * 100;

          return (
            <div key={bucket.star} className="flex items-center gap-2.5">
              <span className="w-3 shrink-0 font-mono text-[12px] text-text2">
                {bucket.star}
              </span>

              <div
                role="img"
                aria-label={`${bucket.count} ${bucket.star}-star review${bucket.count === 1 ? "" : "s"}`}
                className="h-[7px] flex-1 overflow-hidden rounded-full bg-surface3"
              >
                <div
                  className="h-full rounded-full bg-star"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="w-6 shrink-0 text-right font-mono text-[12px] text-text3">
                {bucket.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
