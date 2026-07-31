"use server";

import { updateTag } from "next/cache";
import { apiFetch, toFieldErrors } from "@/lib/api";
import {
  IAvailabilitySlot,
  IFormState,
  ITechnicianProfile,
} from "@/lib/types";
import {
  availabilitySlotSchema,
  technicianProfileSchema,
  zodFieldErrors,
} from "@/lib/validations";

/** The signed-in technician's published slots, past and future. */
export const getMyAvailability = async (): Promise<IAvailabilitySlot[]> => {
  const result = await apiFetch<IAvailabilitySlot[]>(
    "/api/technician/availability",
  );
  return result.success ? result.data : [];
};

/** Update bio, experience, hourly rate and service area. */
export const updateTechnicianProfile = async (
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const bio = String(formData.get("bio") ?? "").trim();

  const parsed = technicianProfileSchema.safeParse({
    bio: bio || undefined,
    experienceYears: formData.get("experienceYears"),
    hourlyRate: formData.get("hourlyRate"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<ITechnicianProfile>(
    "/api/technician/profile",
    { method: "PUT", body: parsed.data },
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  updateTag("technicians");

  return { success: true, message: "Profile saved." };
};

/**
 * Replace the technician's open availability.
 *
 * The API deletes every *unbooked* slot and recreates from this list, so the
 * form always posts the complete set. Booked slots survive untouched, which
 * is why they're rendered as read-only in the scheduler.
 */
export const setAvailability = async (
  slots: { date: string; startTime: string; endTime: string }[],
): Promise<IFormState> => {
  if (slots.length === 0) {
    return {
      success: false,
      message:
        "Add at least one slot. To clear your calendar, remove slots one at a time.",
    };
  }

  for (const slot of slots) {
    const parsed = availabilitySlotSchema.safeParse(slot);
    if (!parsed.success) {
      const first = Object.values(zodFieldErrors(parsed.error))[0];
      return {
        success: false,
        message: `${slot.date || "A slot"}: ${first}`,
      };
    }
  }

  const result = await apiFetch<IAvailabilitySlot[]>(
    "/api/technician/availability",
    { method: "PUT", body: { slots } },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag("technicians");

  return { success: true, message: "Availability updated." };
};
