"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Input } from "@/components/ui/input";
import { IFormState, IUser } from "@/lib/types";
import { updateAccount } from "../_actions/accountActions";

/** Name + password, shared by all three roles. */
export function AccountForm({ user }: { user: IUser }) {
  const router = useRouter();
  const [state, formAction] = useActionState<IFormState, FormData>(
    updateAccount,
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

      <Field label="Full name" name="name" error={state?.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          minLength={2}
          defaultValue={user.name}
          autoComplete="name"
        />
      </Field>

      <Field label="Email" name="email" hint="Your email can't be changed.">
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled
          readOnly
        />
      </Field>

      <Field
        label="New password"
        name="password"
        hint="Leave blank to keep your current password."
        error={state?.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
    </form>
  );
}
