"use client";

import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Input } from "@/components/ui/input";
import { IFormState } from "@/lib/types";
import { loginAction } from "../_actions/authActions";

/** Demo accounts, so a reviewer can get in without creating anything. */
const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@fixitnow.com", password: "admin123" },
];

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const justRegistered = searchParams.get("registered") === "1";
  const prefilledEmail = searchParams.get("email") ?? "";

  const [state, formAction] = useActionState<IFormState, FormData>(
    loginAction.bind(null, redirectTo),
    null,
  );

  useEffect(() => {
    if (state && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-5">
      {justRegistered && (
        <div className="flex items-start gap-2 rounded-lg border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          <span>Account created. Log in to get started.</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

        <Field
          label="Email"
          name="email"
          required
          error={state?.fieldErrors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={prefilledEmail}
            placeholder="you@example.com"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
          />
        </Field>

        <Field
          label="Password"
          name="password"
          required
          error={state?.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
          />
        </Field>

        <SubmitButton className="w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>

      <div className="rounded-lg border border-dashed p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Reviewer credentials
        </p>
        <ul className="mt-1.5 space-y-0.5">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {account.label}
              </span>{" "}
              — {account.email} / {account.password}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
