"use client";

import { UserIcon, WrenchIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Input } from "@/components/ui/input";
import { IFormState, IRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { registerAction } from "../_actions/authActions";

const ROLE_CHOICES = [
  {
    value: "CUSTOMER" as const,
    icon: UserIcon,
    title: "I need a job done",
    body: "Book vetted technicians and track the work.",
  },
  {
    value: "TECHNICIAN" as const,
    icon: WrenchIcon,
    title: "I fix things",
    body: "List services, set availability, get paid.",
  },
];

export function RegisterForm() {
  const searchParams = useSearchParams();

  // `/auth/register?role=TECHNICIAN` comes from the home page CTA.
  const roleFromUrl = searchParams.get("role");
  const [role, setRole] = useState<Extract<IRole, "CUSTOMER" | "TECHNICIAN">>(
    roleFromUrl === "TECHNICIAN" ? "TECHNICIAN" : "CUSTOMER",
  );

  const [state, formAction] = useActionState<IFormState, FormData>(
    registerAction,
    null,
  );

  useEffect(() => {
    if (state && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            How will you use FixItNow?
          </legend>

          <div className="grid gap-2 sm:grid-cols-2">
            {ROLE_CHOICES.map((choice) => {
              const isSelected = role === choice.value;

              return (
                <label
                  key={choice.value}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={choice.value}
                    checked={isSelected}
                    onChange={() => setRole(choice.value)}
                    className="sr-only"
                  />
                  <choice.icon
                    className={cn(
                      "mt-0.5 size-5 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium">
                      {choice.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {choice.body}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {state?.fieldErrors?.role && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.fieldErrors.role}
            </p>
          )}
        </fieldset>

        <Field
          label="Full name"
          name="name"
          required
          error={state?.fieldErrors?.name}
        >
          <Input
            id="name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Jamie Rivera"
            aria-invalid={Boolean(state?.fieldErrors?.name)}
          />
        </Field>

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
            required
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(state?.fieldErrors?.email)}
          />
        </Field>

        <Field
          label="Password"
          name="password"
          required
          hint="At least 6 characters."
          error={state?.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(state?.fieldErrors?.password)}
          />
        </Field>

        <SubmitButton className="w-full" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
