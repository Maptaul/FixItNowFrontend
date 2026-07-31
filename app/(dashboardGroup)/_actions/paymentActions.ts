"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ICheckoutSession, IConfirmPaymentResult, IFormState, IPayment } from "@/lib/types";

/** Payment history for the signed-in customer (all payments for an admin). */
export const getMyPayments = async (): Promise<IPayment[]> => {
  const result = await apiFetch<IPayment[]>("/api/payments");
  return result.success ? result.data : [];
};

/**
 * Open Stripe Checkout for an ACCEPTED booking.
 *
 * The API creates the session and hands back a hosted `checkoutUrl`; we send
 * the customer straight there. Stripe returns them to `/payment/success` or
 * `/payment/cancel` — those URLs are built from the backend's `APP_URL`, so
 * it has to point at this frontend.
 */
export const startCheckout = async (
  bookingId: string,
): Promise<IFormState> => {
  const result = await apiFetch<ICheckoutSession>("/api/payments/create", {
    method: "POST",
    body: { bookingId },
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  const checkoutUrl = result.data.checkoutUrl;

  if (!checkoutUrl) {
    return {
      success: false,
      message: "Stripe did not return a checkout link. Please try again.",
    };
  }


  // Leaving the app entirely, so this must be the last statement.
  redirect(checkoutUrl);
};

/**
 * Verify a completed Checkout session and flip the booking to PAID.
 *
 * Stripe's webhook does the same thing server-side; calling this on return
 * means the customer sees the new status immediately instead of waiting for
 * the webhook to land.
 */
export const confirmPayment = async (
  sessionId: string,
): Promise<{ paid: boolean; message: string }> => {
  const result = await apiFetch<IConfirmPaymentResult>(
    "/api/payments/confirm",
    { method: "POST", body: { sessionId } },
  );

  if (!result.success) {
    return { paid: false, message: result.message };
  }


  return {
    paid: result.data.paid,
    message: result.data.paid
      ? "Payment received. Your technician can now start the job."
      : (result.data.message ?? "Payment hasn't completed yet."),
  };
};
