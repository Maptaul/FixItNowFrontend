"use client";

import { CheckCircle2Icon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { IAvailabilitySlot, IFormState, IService } from "@/lib/types";
import { createBooking } from "../_actions/createBooking";
import { SlotPicker } from "./SlotPicker";

/**
 * "Book now" panel on a technician's profile.
 *
 * Anonymous visitors get a prompt to log in with a `redirectTo` back here, so
 * they land on the same profile afterwards. Signed-in customers pick a
 * service, choose a slot, and the request goes straight to the API.
 */
export function BookingPanel({
  technicianId,
  services,
  slots,
  isLoggedIn,
  isCustomer,
  preselectedServiceId,
}: {
  technicianId: string;
  services: IService[];
  slots: IAvailabilitySlot[];
  isLoggedIn: boolean;
  isCustomer: boolean;
  preselectedServiceId?: string;
}) {
  const bookAction = createBooking.bind(null, technicianId);
  const [state, formAction] = useActionState<IFormState, FormData>(
    bookAction,
    null,
  );

  const [serviceId, setServiceId] = useState(
    preselectedServiceId && services.some((s) => s.id === preselectedServiceId)
      ? preselectedServiceId
      : (services[0]?.id ?? ""),
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  const selectedService = services.find((service) => service.id === serviceId);

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Book now</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This technician hasn&apos;t listed any services yet, so there&apos;s
            nothing to book.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Book now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Log in to your customer account to request a slot with this
            technician.
          </p>
          <Button className="w-full" asChild>
            <Link href={`/auth/login?redirectTo=/technicians/${technicianId}`}>
              <LogInIcon />
              Log in to book
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isCustomer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Book now</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Only customer accounts can book jobs. Log in with a customer account
            to request this service.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state?.success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2Icon className="size-10 text-green-600" />
          <p className="font-semibold">Booking requested</p>
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/customer/bookings">View my bookings</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>Book now</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

          <Field
            label="Service"
            name="serviceId"
            required
            error={state?.fieldErrors?.serviceId}
          >
            {/* Radix Select posts nothing on its own — mirror it into a hidden input. */}
            <input type="hidden" name="serviceId" value={serviceId} />
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="serviceId" className="w-full">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title} — {formatCurrency(service.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <SlotPicker slots={slots} error={state?.fieldErrors?.scheduledAt} />

          {selectedService && (
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">
                {formatCurrency(selectedService.price)}
              </span>
            </div>
          )}

          <SubmitButton className="w-full" pendingLabel="Sending request…">
            Request booking
          </SubmitButton>

          <p className="text-center text-xs text-muted-foreground">
            You only pay once the technician accepts.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
