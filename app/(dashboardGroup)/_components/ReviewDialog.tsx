"use client";

import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IBooking, IFormState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createReview } from "../_actions/reviewActions";

const STARS = [1, 2, 3, 4, 5];

export function ReviewDialog({
  booking,
  children,
}: {
  booking: IBooking;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);

  const [state, formAction] = useActionState<IFormState, FormData>(
    createReview.bind(null, booking.id),
    null,
  );

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this job</DialogTitle>
          <DialogDescription>
            How did {booking.technician?.user?.name ?? "your technician"} do with{" "}
            &ldquo;{booking.service?.title ?? "this job"}&rdquo;?
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

          <Field
            label="Rating"
            name="rating"
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
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <StarIcon
                    className={cn(
                      "size-7",
                      (hovered || rating) >= star
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} / 5
              </span>
            </div>
          </Field>

          <Field
            label="Comment"
            name="comment"
            hint="Optional — what should the next customer know?"
            error={state?.fieldErrors?.comment}
          >
            <Textarea
              id="comment"
              name="comment"
              rows={4}
              maxLength={1000}
              placeholder="Turned up on time and fixed it first try…"
            />
          </Field>

          <SubmitButton className="w-full" pendingLabel="Posting review…">
            Post review
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
