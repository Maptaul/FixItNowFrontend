import { MessageSquareIcon, StarIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mono } from "@/components/design/money";
import { RatingHistogram } from "@/components/design/rating-histogram";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate, formatRating } from "@/lib/format";
import { getMe } from "@/service/getMe";
import { getTechnicianById } from "../../../../(publicGroup)/_actions/getTechnicians";
import { PageHeader } from "../../../_components/PageHeader";
import { StatCard } from "../../../_components/StatCard";

export const metadata: Metadata = { title: "My reviews" };

/**
 * Technician reviews — design handoff § Technician › Reviews.
 *
 * Average and histogram, then every review. The handoff also gives each
 * review a Reply button (one reply per review); the API has no reply
 * resource, so that's left out rather than mocked — a reply box that
 * silently discards what you type is worse than none.
 */
const TechnicianReviewsPage = async () => {
  const user = await getMe();
  if (!user) redirect("/auth/login");

  const profile = user.technicianProfile;

  // Reviews come back on the technician's own public profile — there's no
  // "my reviews" endpoint.
  const publicProfile = profile ? await getTechnicianById(profile.id) : null;
  const reviews = publicProfile?.reviews ?? [];

  const fiveStar = reviews.filter((review) => review.rating === 5).length;
  const withComment = reviews.filter((review) => review.comment?.trim()).length;

  return (
    <>
      <PageHeader
        title="Reviews"
        description="What customers said after you finished the job. Reviews are final once posted."
        action={
          profile && (
            <Button variant="outline" asChild>
              <Link href={`/technicians/${profile.id}`}>
                View public profile
              </Link>
            </Button>
          )
        }
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquareIcon}
          title="No reviews yet"
          description="Once you complete a job, the customer can rate it — and that rating shows up here and on your public profile."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/technician/bookings">See your jobs</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={StarIcon}
              label="Average rating"
              value={formatRating(profile?.avgRating ?? 0)}
              hint={`across ${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
              emphasis
            />
            <StatCard
              icon={StarIcon}
              label="Five-star reviews"
              value={fiveStar}
              hint={`${Math.round((fiveStar / reviews.length) * 100)}% of the total`}
            />
            <StatCard
              icon={MessageSquareIcon}
              label="With a comment"
              value={withComment}
            />
          </div>

          <div className="mt-6">
            <RatingHistogram
              reviews={reviews}
              average={profile?.avgRating ?? 0}
            />
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-panel text-text">
              All reviews ({reviews.length})
            </h2>

            <ul className="grid gap-4 xl:grid-cols-2">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-panel border border-line bg-surface p-5 shadow-sh2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="tracking-[1px] text-star"
                      aria-label={`${review.rating} out of 5`}
                    >
                      {"★".repeat(review.rating).padEnd(5, "☆")}
                    </span>
                    <Mono className="text-[12px] text-text3">
                      {formatDate(review.createdAt)}
                    </Mono>
                  </div>

                  {review.comment ? (
                    <p className="mt-2.5 text-body2 text-text2">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="mt-2.5 text-body2 text-text3 italic">
                      Rated without a comment.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
};

export default TechnicianReviewsPage;
