import { StarIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getMyBookings } from "../../../_actions/bookingActions";
import { PageHeader } from "../../../_components/PageHeader";
import { ReviewComposer } from "../../../_components/ReviewComposer";

export const metadata: Metadata = { title: "My reviews" };

const CustomerReviewsPage = async () => {
  const bookings = await getMyBookings();

  const awaiting = bookings.filter(
    (booking) => booking.status === "COMPLETED" && !booking.review,
  );

  const posted = bookings.filter((booking) => booking.review);

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Rate the jobs you've had done. One review per booking, and it goes live straight away."
      />

      {awaiting.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2.5">
            <h2 className="text-panel text-text">Awaiting your review</h2>
            <Badge variant="amber">{awaiting.length}</Badge>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {awaiting.map((booking) => (
              <ReviewComposer key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-panel text-text">
          Your reviews ({posted.length})
        </h2>

        {posted.length === 0 ? (
          <EmptyState
            icon={StarIcon}
            title="No reviews yet"
            description={
              awaiting.length > 0
                ? "Post the review above and it will appear here."
                : "Once a job is marked completed, you'll be able to rate it here."
            }
            action={
              awaiting.length === 0 ? (
                <Button variant="outline" asChild>
                  <Link href="/dashboard/customer/bookings">
                    See past bookings
                  </Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid gap-4 xl:grid-cols-2">
            {posted.map((booking) => {
              const review = booking.review!;
              const technicianName =
                booking.technician?.user?.name ?? "Technician";

              return (
                <li
                  key={booking.id}
                  className="rounded-panel border border-line bg-surface p-5 shadow-sh2"
                >
                  <div className="flex items-start gap-3">
                    <GradientAvatar
                      name={technicianName}
                      src={booking.technician?.user?.avatarUrl}
                      kind="technician"
                      size={40}
                      radius={12}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body2 font-bold text-text">
                        {technicianName}
                      </p>
                      <p className="truncate text-caption text-text3">
                        {booking.service?.title ?? "Service"} ·{" "}
                        <Mono>{formatDate(review.createdAt)}</Mono>
                      </p>
                    </div>

                    <span
                      className="shrink-0 tracking-[1px] text-star"
                      aria-label={`${review.rating} out of 5`}
                    >
                      {"★".repeat(review.rating).padEnd(5, "☆")}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-body2 text-text2">
                      {review.comment}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {posted.length > 0 && (
          <p className="mt-4 text-caption text-text3">
            Reviews can&apos;t be edited or removed once posted — the API has no
            endpoint for it, and a review that can be quietly rewritten
            isn&apos;t worth much to the next customer.
          </p>
        )}
      </section>
    </>
  );
};

export default CustomerReviewsPage;
