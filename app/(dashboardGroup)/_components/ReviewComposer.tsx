"use client";

import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money, Mono } from "@/components/design/money";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { IBooking, IFormState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createReview } from "../_actions/reviewActions";

const STARS = [1, 2, 3, 4, 5];
const MAX_COMMENT = 1000;

/**
 * Awaiting-review composer — design handoff § Customer › Reviews.
 *
 * An amber-bordered card holding the booking strip, a 30px interactive star
 * row, a textarea with a mono character counter, and Post review.
 *
 * The handoff also draws attribute chips (Punctual / Thorough / Fair price).
 * The API's review is `{ bookingId, rating, comment }` — there's nowhere to
 * put them, and rendering chips the server never stored would be inventing
 * data, so they're left out rather than faked into the comment.
 */
export function ReviewComposer({ booking }: { booking: IBooking }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  // Side effects live in the action, not an effect.
  const [state, formAction] = useActionState<IFormState, FormData>(
    async (prevState, formData) => {
      const result = await createReview(booking.id, prevState, formData);

      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else if (result) {
        toast.error(result.message);
      }

      return result;
    },
    null,
  );

  const technicianName = booking.technician?.user?.name ?? "your technician";

  return (
    <article className="rounded-panel border border-amber-border bg-surface p-5 shadow-sh2">
      {/* Booking strip */}
      <div className="mb-5 flex items-center gap-3 rounded-row bg-surface2 p-3">
        <GradientAvatar
          name={technicianName}
          kind="technician"
          size={40}
          radius={12}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-body2 font-bold text-text">
            {booking.service?.title ?? "Service"}
          </p>
          <p className="truncate text-caption text-text3">
            {technicianName} ·{" "}
            <Mono>{formatDateTime(booking.scheduledAt)}</Mono>
          </p>
        </div>

        <Money
          value={booking.totalAmount}
          className="text-body2 font-semibold"
        />
      </div>

      <form action={formAction} className="space-y-4">
        <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

        <Field
          label={`How did ${technicianName} do?`}
          name={`rating-${booking.id}`}
          required
          error={state?.fieldErrors?.rating}
        >
          <input type="hidden" name="rating" value={rating} />

          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHovered(0)}
          >
            {STARS.map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                aria-pressed={rating === star}
                onMouseEnter={() => setHovered(star)}
                onClick={() => setRating(star)}
                className="rounded p-0.5 transition-transform duration-120 hover:scale-110"
              >
                <StarIcon
                  className={cn(
                    "size-[30px]",
                    (hovered || rating) >= star
                      ? "fill-star text-star"
                      : "text-text3/40",
                  )}
                />
              </button>
            ))}
            <span className="ml-2 font-mono text-body2 text-text2">
              {rating} / 5
            </span>
          </div>
        </Field>

        <Field
          label="Comment"
          name={`comment-${booking.id}`}
          hint="Optional — what should the next customer know?"
          error={state?.fieldErrors?.comment}
        >
          <Textarea
            id={`comment-${booking.id}`}
            name="comment"
            rows={4}
            maxLength={MAX_COMMENT}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Turned up on time and fixed it first try…"
          />
          <span className="mt-1 block text-right font-mono text-[12px] text-text3">
            {comment.length} / {MAX_COMMENT}
          </span>
        </Field>

        <SubmitButton pendingLabel="Posting…">Post review</SubmitButton>
      </form>
    </article>
  );
}
