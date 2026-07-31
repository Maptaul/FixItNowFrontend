"use server";

import { updateTag } from "next/cache";
import { apiFetch, toFieldErrors } from "@/lib/api";
import { IFormState, IReview } from "@/lib/types";
import { reviewSchema, zodFieldErrors } from "@/lib/validations";

/**
 * Leave a review. The API allows exactly one per booking, and only once the
 * job is COMPLETED — the customer's booking list hides the form otherwise.
 */
export const createReview = async (
  bookingId: string,
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const comment = String(formData.get("comment") ?? "").trim();

  const parsed = reviewSchema.safeParse({
    bookingId,
    rating: formData.get("rating"),
    comment: comment || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<IReview>("/api/reviews", {
    method: "POST",
    body: parsed.data,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  updateTag("technicians");

  return { success: true, message: "Thanks — your review is live." };
};
