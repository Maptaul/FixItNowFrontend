"use server";

import { updateTag } from "next/cache";
import { apiFetch, toFieldErrors } from "@/lib/api";
import { IBooking, IFormState } from "@/lib/types";
import { bookingSchema, zodFieldErrors } from "@/lib/validations";
import { getMe } from "@/service/getMe";


export const createBooking = async (
  technicianId: string,
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const me = await getMe();

  if (!me) {
    return {
      success: false,
      message: "Please log in as a customer to book this service.",
    };
  }

  if (me.role !== "CUSTOMER") {
    return {
      success: false,
      message: `You're signed in as a ${me.role.toLowerCase()}. Bookings can only be made from a customer account.`,
    };
  }

  const slotId = String(formData.get("slotId") ?? "").trim();

  const parsed = bookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    scheduledAt: formData.get("scheduledAt"),
    slotId: slotId || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<IBooking>("/api/bookings", {
    method: "POST",
    body: {
      serviceId: parsed.data.serviceId,
      scheduledAt: new Date(parsed.data.scheduledAt).toISOString(),
      ...(parsed.data.slotId ? { slotId: parsed.data.slotId } : {}),
    },
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  // The slot the customer just took is no longer free for anyone else.
  updateTag(`technician-${technicianId}`);

  return {
    success: true,
    message:
      "Request sent. You'll be able to pay as soon as the technician accepts.",
  };
};
