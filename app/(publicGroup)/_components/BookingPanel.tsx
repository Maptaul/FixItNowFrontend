"use client";

import { CheckCircle2Icon, CheckIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Money } from "@/components/design/money";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
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
 * Sticky booking rail — design handoff § Technician detail.
 *
 * Mono price + "/ visit", the fixed-price note, the slot picker, an h46
 * primary Book button, then three emerald-check guarantees.
 *
 * Anonymous visitors get a log-in prompt carrying `redirectTo` back here.
 */
const GUARANTEES = [
  "Fixed price — the total is agreed before the visit",
  "You only pay after the technician accepts",
  "Cancel free any time before work starts",
];

function RailShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="h-fit rounded-panel border border-line bg-surface p-6 shadow-sh3 lg:sticky lg:top-[86px]">
      {children}
    </aside>
  );
}

export function BookingPanel({
  technicianId,
  technicianName,
  fromPrice,
  services,
  slots,
  isLoggedIn,
  isCustomer,
  preselectedServiceId,
}: {
  technicianId: string;
  technicianName: string;
  fromPrice: number;
  services: IService[];
  slots: IAvailabilitySlot[];
  isLoggedIn: boolean;
  isCustomer: boolean;
  preselectedServiceId?: string;
}) {
  const [state, formAction] = useActionState<IFormState, FormData>(
    createBooking.bind(null, technicianId),
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
      <RailShell>
        <h2 className="text-panel text-text">Book now</h2>
        <p className="mt-2 text-body2 text-text2">
          {technicianName} hasn&apos;t listed any services yet, so there&apos;s
          nothing to book. Their profile will update as soon as they do.
        </p>
        <Button variant="outline" className="mt-4 w-full" asChild>
          <Link href="/technicians">See other technicians</Link>
        </Button>
      </RailShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <RailShell>
        <Money value={fromPrice} className="text-[26px] font-bold" />
        <span className="ml-1 text-body2 text-text3">/ visit</span>
        <p className="mt-1 text-caption text-text3">
          Fixed price, agreed before anyone rings your bell.
        </p>

        <Button className="mt-5 h-[46px] w-full" asChild>
          <Link href={`/auth/login?redirectTo=/technicians/${technicianId}`}>
            <LogInIcon />
            Log in to book
          </Link>
        </Button>

        <p className="mt-3 text-center text-caption text-text3">
          New here?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Create an account
          </Link>
        </p>

        <ul className="mt-5 space-y-2 border-t border-line pt-5">
          {GUARANTEES.map((line) => (
            <li key={line} className="flex gap-2 text-caption text-text2">
              <CheckIcon
                aria-hidden="true"
                className="mt-px size-3.5 shrink-0 text-emerald"
              />
              {line}
            </li>
          ))}
        </ul>
      </RailShell>
    );
  }

  if (!isCustomer) {
    return (
      <RailShell>
        <h2 className="text-panel text-text">Book now</h2>
        <p className="mt-2 text-body2 text-text2">
          Only customer accounts can book jobs. Log in with a customer account
          to request this service.
        </p>
      </RailShell>
    );
  }

  if (state?.success) {
    return (
      <RailShell>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="grid size-[66px] animate-pop place-items-center rounded-xl bg-emerald-soft">
            <CheckCircle2Icon className="size-8 text-emerald" />
          </span>
          <p className="text-panel text-text">Booking requested</p>
          <p className="text-body2 text-text2">{state.message}</p>
          <Button variant="outline" className="mt-1 w-full" asChild>
            <Link href="/dashboard/customer/bookings">View my bookings</Link>
          </Button>
        </div>
      </RailShell>
    );
  }

  return (
    <RailShell>
      <div className="mb-5 border-b border-line pb-5">
        <Money
          value={selectedService?.price ?? fromPrice}
          className="text-[26px] font-bold"
        />
        <span className="ml-1 text-body2 text-text3">/ visit</span>
        <p className="mt-1 text-caption text-text3">
          Fixed price, agreed before anyone rings your bell.
        </p>
      </div>

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

        <SubmitButton
          className="h-[46px] w-full"
          pendingLabel="Requesting…"
        >
          Book this visit
        </SubmitButton>
      </form>

      <ul className="mt-5 space-y-2 border-t border-line pt-5">
        {GUARANTEES.map((line) => (
          <li key={line} className="flex gap-2 text-caption text-text2">
            <CheckIcon
              aria-hidden="true"
              className="mt-px size-3.5 shrink-0 text-emerald"
            />
            {line}
          </li>
        ))}
      </ul>
    </RailShell>
  );
}
