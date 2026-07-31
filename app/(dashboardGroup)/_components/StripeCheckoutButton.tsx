"use client";

import { CreditCardIcon } from "lucide-react";
import { useActionState } from "react";
import { toast } from "sonner";
import { FormAlert, SubmitButton } from "@/components/shared/form";
import { IFormState } from "@/lib/types";
import { startCheckout } from "../_actions/paymentActions";

/**
 * Hands off to Stripe Checkout.
 *
 * On success the action redirects out of the app entirely, so this component
 * only ever renders an error — if the user is still looking at it after a
 * click, something went wrong and the message says what.
 */
export function StripeCheckoutButton({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useActionState<IFormState, FormData>(async () => {
    const result = await startCheckout(bookingId);
    if (result && !result.success) toast.error(result.message);
    return result;
  }, null);

  return (
    <form action={formAction} className="space-y-3">
      <FormAlert message={state?.message} />

      <SubmitButton
        size="lg"
        className="w-full"
        pendingLabel="Opening Stripe…"
      >
        <CreditCardIcon />
        Pay with Stripe
      </SubmitButton>

      <p className="text-center text-xs text-muted-foreground">
        You&apos;ll be redirected to Stripe&apos;s secure checkout. Test card:{" "}
        <span className="font-mono">4242 4242 4242 4242</span>, any future
        expiry and CVC.
      </p>
    </form>
  );
}
