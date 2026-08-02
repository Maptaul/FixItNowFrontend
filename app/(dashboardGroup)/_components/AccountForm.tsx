"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Input } from "@/components/ui/input";
import { IMAGE_HOSTS } from "@/lib/image-hosts";
import { IFormState, IUser } from "@/lib/types";
import { updateAccount } from "../_actions/accountActions";

/** Name, picture and password, shared by all three roles. */
export function AccountForm({ user }: { user: IUser }) {
  const router = useRouter();
  const [state, formAction] = useActionState<IFormState, FormData>(
    updateAccount,
    null,
  );

  // Controlled so the tile beside the field previews the link as it is typed.
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");

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

      <div className="flex items-start gap-4">
        <GradientAvatar
          name={user.name}
          src={avatarUrl}
          size={56}
          radius={14}
          className="mt-7"
        />

        <div className="min-w-0 flex-1">
          <Field
            label="Profile picture"
            name="avatarUrl"
            hint={`Paste a direct image link from ${IMAGE_HOSTS.join(", ")}. Leave blank to go back to your initials.`}
            error={state?.fieldErrors?.avatarUrl}
          >
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              inputMode="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://i.ibb.co/…/photo.jpg"
            />
          </Field>
        </div>
      </div>

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
