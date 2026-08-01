"use client";

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import { toast } from "sonner";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { MonthGrid } from "@/components/design/month-grid";
import { Money, Mono } from "@/components/design/money";
import { Stepper, StepState } from "@/components/design/stepper";
import { FormAlert, SubmitButton } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatDateTime,
  formatRating,
  formatTime,
  slotToIso,
  toDateInputValue,
} from "@/lib/format";
import { IAvailabilitySlot, IFormState, IService } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createBooking } from "../_actions/createBooking";

/**
 * Booking wizard — design handoff § Booking flow.
 *
 * 1000px max, `1fr + 340px` with a sticky summary rail throughout, a stepper
 * across the top and a Back / Continue footer divided by a 1px top border.
 *
 * WHAT THE HANDOFF DRAWS THAT ISN'T HERE, AND WHY:
 *
 *   · **Address step.** The API's booking model has no address — it carries
 *     customerId, technicianId, serviceId, scheduledAt and slotId, nothing
 *     more. A step collecting an address that the server would silently drop
 *     is worse than no step.
 *
 *   · **Payment step.** The backend deliberately gates payment behind
 *     acceptance: `POST /api/payments/create` rejects any booking that isn't
 *     ACCEPTED. Taking card details inside the wizard would contradict the
 *     lifecycle, so the flow ends at the request and the summary rail says
 *     when payment actually opens.
 *
 * That leaves three real steps. State lives in the URL, so a reload — or a
 * shared link — keeps the draft exactly where it was.
 */
const STEP_LABELS = ["Service", "Schedule", "Review"];

export function BookingWizard({
  technicianId,
  technicianName,
  technicianRating,
  services,
  slots,
  isLoggedIn,
  isCustomer,
}: {
  technicianId: string;
  technicianName: string;
  technicianRating: string;
  services: IService[];
  slots: IAvailabilitySlot[];
  isLoggedIn: boolean;
  isCustomer: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Set on success to the slot we booked, which switches to confirmation. */
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const step = Math.min(
    3,
    Math.max(1, Number(searchParams.get("step") ?? 1) || 1),
  );
  const serviceId = searchParams.get("service") ?? services[0]?.id ?? "";
  const slotId = searchParams.get("slot") ?? "";
  const day = searchParams.get("day") ?? "";

  const selectedService = services.find((service) => service.id === serviceId);
  const selectedSlot = slots.find((slot) => slot.id === slotId);

  const scheduledAt = selectedSlot
    ? slotToIso(selectedSlot.date, selectedSlot.startTime)
    : "";

  const setParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Days the technician actually has an open slot on.
  const openDates = useMemo(() => {
    const set = new Set<string>();
    for (const slot of slots) {
      if (!slot.isBooked) set.add(toDateInputValue(slot.date));
    }
    return set;
  }, [slots]);

  const daySlots = useMemo(
    () =>
      slots
        .filter((slot) => toDateInputValue(slot.date) === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, day],
  );

  // Side effects live in the action, not an effect: switching to the
  // confirmation view is a consequence of submitting, not of state changing.
  const [state, formAction] = useActionState<IFormState, FormData>(
    async (prevState, formData) => {
      const result = await createBooking(technicianId, prevState, formData);

      if (result?.success) {
        toast.success(result.message);
        setConfirmedAt(String(formData.get("scheduledAt") ?? ""));
      } else if (result) {
        toast.error(result.message);
      }

      return result;
    },
    null,
  );

  const stepStates: StepState[] = STEP_LABELS.map((_, index) => {
    const n = index + 1;
    if (n < step) return "done";
    if (n === step) return "current";
    return "upcoming";
  });

  const canContinue =
    step === 1 ? Boolean(serviceId) : step === 2 ? Boolean(slotId) : true;

  /* ---------------------------------------------------------------- *
   * Confirmation
   * ---------------------------------------------------------------- */
  if (confirmedAt) {
    return (
      <div className="mx-auto w-full max-w-[560px] rounded-[20px] border border-line bg-surface p-7 text-center shadow-sh2">
        <span className="mx-auto mb-5 grid size-[66px] animate-pop place-items-center rounded-xl border border-emerald-border bg-emerald-soft text-[30px] font-extrabold text-emerald">
          <CheckIcon className="size-8" strokeWidth={3} />
        </span>

        <h2 className="mb-2 text-[26px] font-extrabold tracking-[-0.03em] text-text">
          Booking requested
        </h2>

        <p className="mx-auto mb-6 max-w-[420px] text-[14.5px] leading-[1.6] text-text2">
          {technicianName} will accept or decline shortly. Payment opens the
          moment they accept — you&apos;ll see it on your bookings page.
        </p>

        <dl className="mx-auto mb-6 inline-flex min-w-[320px] flex-col gap-2.5 rounded-card border border-line bg-surface2 px-[22px] py-[18px] text-left">
          <div className="flex justify-between gap-4 text-[13px]">
            <dt className="text-text2">Technician</dt>
            <dd className="font-semibold text-text">{technicianName}</dd>
          </div>
          <div className="flex justify-between gap-4 text-[13px]">
            <dt className="text-text2">Service</dt>
            <dd className="text-right font-semibold text-text">
              {selectedService?.title ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 text-[13px]">
            <dt className="text-text2">Slot</dt>
            <dd className="font-semibold text-text">
              {formatDateTime(confirmedAt)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 text-[13px]">
            <dt className="text-text2">Total</dt>
            <dd>
              <Money value={selectedService?.price} className="font-bold" />
            </dd>
          </div>
        </dl>

        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/dashboard/customer/bookings">Track this booking</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Gates
   * ---------------------------------------------------------------- */
  if (!isLoggedIn || !isCustomer) {
    return (
      <div className="mx-auto w-full max-w-[560px] rounded-[20px] border border-line bg-surface p-7 text-center shadow-sh2">
        <h2 className="mb-2 text-[22px] font-extrabold tracking-[-0.03em] text-text">
          {isLoggedIn ? "Customer account needed" : "Log in to book"}
        </h2>
        <p className="mb-6 text-body2 text-text2">
          {isLoggedIn
            ? "Only customer accounts can book jobs. Log in with a customer account to request this visit."
            : "Booking takes a customer account — it's how we get the job back to you."}
        </p>
        <Button size="lg" asChild>
          <Link href={`/auth/login?redirectTo=/book/${technicianId}`}>
            Log in to continue
          </Link>
        </Button>
      </div>
    );
  }

  /* ---------------------------------------------------------------- *
   * Wizard
   * ---------------------------------------------------------------- */
  return (
    <>
      <Stepper
        steps={STEP_LABELS.map((label, index) => ({
          label,
          state: stepStates[index],
        }))}
        className="mb-8"
      />

      <form
        action={formAction}
        className="grid items-start gap-6 lg:grid-cols-[1fr_340px]"
      >
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="slotId" value={slotId} />
        <input type="hidden" name="scheduledAt" value={scheduledAt} />

        <div className="rounded-[20px] border border-line bg-surface p-6 shadow-sh2 sm:p-7">
          <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

          {/* Step 1 — Service */}
          {step === 1 && (
            <section>
              <h2 className="mb-1.5 text-[22px] font-extrabold tracking-[-0.03em] text-text sm:text-[24px]">
                What needs fixing?
              </h2>
              <p className="mb-6 text-body text-text2">
                Pick the service. {technicianName} confirms the exact scope on
                arrival — the price you see is the total.
              </p>

              <div className="flex flex-col gap-2.5">
                {services.map((service) => {
                  const isSelected = service.id === serviceId;

                  return (
                    <label
                      key={service.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3.5 rounded-row border p-[15px] transition-colors duration-120",
                        isSelected
                          ? "border-primary bg-primary-soft"
                          : "border-line bg-surface hover:border-line-strong",
                      )}
                    >
                      <input
                        type="radio"
                        name="service-pick"
                        checked={isSelected}
                        onChange={() => setParams({ service: service.id })}
                        className="sr-only"
                      />

                      {/* Radio donut — 20px, 6px primary border when checked. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-5 flex-none rounded-full bg-surface",
                          isSelected
                            ? "border-[6px] border-primary"
                            : "border border-line-strong",
                        )}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-text">
                          {service.title}
                        </span>
                        <span className="mt-0.5 block text-caption font-normal text-text3">
                          {service.description ??
                            service.category?.name ??
                            "Fixed price, agreed before the visit"}
                        </span>
                      </span>

                      <Money
                        value={service.price}
                        className="flex-none text-[15px] font-bold"
                      />
                    </label>
                  );
                })}
              </div>

              {state?.fieldErrors?.serviceId && (
                <p role="alert" className="mt-3 text-[12px] font-semibold text-red">
                  {state.fieldErrors.serviceId}
                </p>
              )}
            </section>
          )}

          {/* Step 2 — Schedule */}
          {step === 2 && (
            <section>
              <h2 className="mb-1.5 text-[22px] font-extrabold tracking-[-0.03em] text-text sm:text-[24px]">
                Choose date &amp; time
              </h2>
              <p className="mb-6 text-body text-text2">
                {technicianName}&apos;s published availability. Booked slots stay
                visible so you can see how busy they are.
              </p>

              {openDates.size === 0 ? (
                <div className="rounded-card border border-dashed border-line p-8 text-center">
                  <p className="text-body2 font-semibold text-text">
                    No published slots right now
                  </p>
                  <p className="mx-auto mt-1 max-w-[330px] text-body2 text-text2">
                    {technicianName} hasn&apos;t opened their calendar yet. Their
                    profile has a contact route, or try another technician.
                  </p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/technicians">Browse technicians</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <MonthGrid
                    openDates={openDates}
                    selected={day}
                    onSelect={(value) =>
                      setParams({ day: value, slot: "" })
                    }
                  />

                  {day && (
                    <div className="mt-6">
                      <p className="mb-2.5 text-label text-text">
                        Available slots — {formatDate(day)}
                      </p>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {daySlots.map((slot) => {
                          const isSelected = slot.id === slotId;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={slot.isBooked}
                              aria-pressed={isSelected}
                              onClick={() => setParams({ slot: slot.id })}
                              className={cn(
                                "rounded-md border px-2 py-2.5 text-[12.5px] font-semibold transition-colors duration-120",
                                slot.isBooked &&
                                  "cursor-not-allowed border-line bg-surface2 text-text3 line-through",
                                !slot.isBooked &&
                                  !isSelected &&
                                  "border-line-strong bg-surface text-text hover:border-primary hover:bg-primary-soft",
                                isSelected &&
                                  "border-primary bg-primary-soft text-primary",
                              )}
                            >
                              {formatTime(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {state?.fieldErrors?.scheduledAt && (
                <p role="alert" className="mt-3 text-[12px] font-semibold text-red">
                  {state.fieldErrors.scheduledAt}
                </p>
              )}
            </section>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <section>
              <h2 className="mb-1.5 text-[22px] font-extrabold tracking-[-0.03em] text-text sm:text-[24px]">
                Check and send
              </h2>
              <p className="mb-6 text-body text-text2">
                Sending this reserves the slot. {technicianName} then accepts or
                declines, and payment opens once they accept.
              </p>

              <dl className="divide-y divide-line rounded-card border border-line">
                <div className="flex justify-between gap-4 p-4">
                  <dt className="text-body2 text-text2">Service</dt>
                  <dd className="text-right text-body2 font-semibold text-text">
                    {selectedService?.title ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 p-4">
                  <dt className="text-body2 text-text2">When</dt>
                  <dd className="text-right text-body2 font-semibold text-text">
                    {scheduledAt ? formatDateTime(scheduledAt) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 p-4">
                  <dt className="text-body2 text-text2">Technician</dt>
                  <dd className="text-right text-body2 font-semibold text-text">
                    {technicianName}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-caption text-text3">
                You can cancel free of charge any time before the technician
                starts work.
              </p>
            </section>
          )}

          {/* Footer nav */}
          <div className="mt-7 flex items-center justify-between border-t border-line pt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setParams({ step: String(step - 1) })}
              >
                <ArrowLeftIcon />
                Back
              </Button>
            ) : (
              <Button variant="outline" size="lg" asChild>
                <Link href={`/technicians/${technicianId}`}>
                  <ArrowLeftIcon />
                  Back to profile
                </Link>
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                size="lg"
                disabled={!canContinue}
                onClick={() => setParams({ step: String(step + 1) })}
              >
                Continue
                <ArrowRightIcon />
              </Button>
            ) : (
              <SubmitButton size="lg" pendingLabel="Sending request…">
                Confirm booking
                <ArrowRightIcon />
              </SubmitButton>
            )}
          </div>
        </div>

        {/* Summary rail */}
        <aside className="h-fit rounded-[20px] border border-line bg-surface p-[22px] shadow-sh3 lg:sticky lg:top-[86px]">
          <p className="mb-4 text-label text-text">Booking summary</p>

          <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
            <GradientAvatar
              name={technicianName}
              kind="technician"
              size={44}
              radius={12}
            />
            <div className="min-w-0">
              <p className="truncate text-body2 font-bold text-text">
                {technicianName}
              </p>
              <p className="truncate text-caption text-text3">
                <span aria-hidden="true" className="text-star">
                  ★
                </span>{" "}
                <Mono>{formatRating(technicianRating)}</Mono>
              </p>
            </div>
          </div>

          <dl className="mb-4 flex flex-col gap-2.5 border-b border-line pb-4 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-text2">Service</dt>
              <dd className="text-right font-semibold text-text">
                {selectedService?.title ?? "Not picked yet"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text2">When</dt>
              <dd className="text-right font-semibold text-text">
                {scheduledAt ? formatDateTime(scheduledAt) : "Not picked yet"}
              </dd>
            </div>
          </dl>

          {/* Fee breakdown — a dashed rule sits above the total. */}
          <div className="mb-4 flex flex-col gap-2 border-b border-dashed border-line pb-4 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-text2">Service fee</dt>
              <dd>
                <Money value={selectedService?.price ?? 0} />
              </dd>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-body2 font-bold text-text">Total</span>
            <Money
              value={selectedService?.price ?? 0}
              className="text-[21px] font-bold tracking-[-0.02em]"
            />
          </div>

          <p className="text-[12px] leading-[1.55] text-text3">
            Nothing is charged now. Payment opens once {technicianName} accepts,
            and you can cancel free until work starts.
          </p>
        </aside>
      </form>
    </>
  );
}
