"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toNumber } from "@/lib/format";
import { IFormState, ITechnicianProfile } from "@/lib/types";
import { updateTechnicianProfile } from "../_actions/technicianActions";

/**
 * The trade half of a technician's profile — what customers read before
 * booking. Registering as a technician creates this record empty, so the
 * fields start blank until it's filled in.
 */
export function TechnicianProfileForm({
  profile,
}: {
  profile: ITechnicianProfile;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<IFormState, FormData>(
    updateTechnicianProfile,
    null,
  );

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      router.refresh();
    } else {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

      <Field
        label="Bio"
        name="bio"
        hint="Tell customers what you specialise in."
        error={state?.fieldErrors?.bio}
      >
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={1000}
          defaultValue={profile.bio ?? ""}
          placeholder="15 years on domestic wiring, Part P registered, no call-out fee…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Years of experience"
          name="experienceYears"
          required
          error={state?.fieldErrors?.experienceYears}
        >
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min="0"
            max="70"
            step="1"
            required
            defaultValue={profile.experienceYears}
          />
        </Field>

        <Field
          label="Hourly rate (USD)"
          name="hourlyRate"
          required
          error={state?.fieldErrors?.hourlyRate}
        >
          <Input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={toNumber(profile.hourlyRate)}
          />
        </Field>
      </div>

      <Field
        label="Service area"
        name="location"
        required
        hint="Customers filter by this, so use the city or district you cover."
        error={state?.fieldErrors?.location}
      >
        <Input
          id="location"
          name="location"
          required
          defaultValue={profile.location ?? ""}
          placeholder="Dhaka, Bangladesh"
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
    </form>
  );
}
