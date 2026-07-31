"use server";

import { apiFetch } from "@/lib/api";
import { IBooking, IBookingStatus, IFormState } from "@/lib/types";

/** Every booking the signed-in customer has ever made, newest first. */
export const getMyBookings = async (): Promise<IBooking[]> => {
  const result = await apiFetch<IBooking[]>("/api/bookings");
  return result.success ? result.data : [];
};

/** A single booking — used by the payment page. Null when it isn't theirs. */
export const getBookingById = async (id: string): Promise<IBooking | null> => {
  const result = await apiFetch<IBooking>(`/api/bookings/${id}`);
  return result.success ? result.data : null;
};

/**
 * Customer-side cancel. The API refuses anything past PAID, so the UI hides
 * the button then — this just reports whatever the server decides.
 */
export const cancelBooking = async (bookingId: string): Promise<IFormState> => {
  const result = await apiFetch<IBooking>(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }


  return { success: true, message: "Booking cancelled." };
};

/* ---------------------------------------------------------------- *
 * Technician side
 * ---------------------------------------------------------------- */

export const getTechnicianBookings = async (): Promise<IBooking[]> => {
  const result = await apiFetch<IBooking[]>("/api/technician/bookings");
  return result.success ? result.data : [];
};

/**
 * Move a job along its lifecycle. Valid transitions are enforced by the API
 * (`REQUESTED → ACCEPTED|DECLINED`, `PAID → IN_PROGRESS`, `IN_PROGRESS →
 * COMPLETED`); the UI only renders buttons for the ones currently legal.
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: IBookingStatus,
): Promise<IFormState> => {
  const result = await apiFetch<IBooking>(
    `/api/technician/bookings/${bookingId}`,
    { method: "PATCH", body: { status } },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }


  return {
    success: true,
    message: `Booking marked as ${status.toLowerCase().replace("_", " ")}.`,
  };
};
