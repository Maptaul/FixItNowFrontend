"use server";

import { apiFetch, toFieldErrors } from "@/lib/api";
import { IFormState, IUser } from "@/lib/types";
import { updateAccountSchema, zodFieldErrors } from "@/lib/validations";

/**
 * Update the signed-in user's name and/or password.
 * Shared by all three roles — the API endpoint is role-agnostic.
 */
export const updateAccount = async (
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // The field is always submitted, so an empty box means "remove my picture".
  // That has to reach the API as "", which is why it isn't collapsed to
  // undefined the way the other two are.
  const avatarUrl = formData.has("avatarUrl")
    ? String(formData.get("avatarUrl") ?? "").trim()
    : undefined;

  const parsed = updateAccountSchema.safeParse({
    name: name || undefined,
    password: password || undefined,
    avatarUrl,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<IUser>("/api/auth/my-profile", {
    method: "PUT",
    body: parsed.data,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  return { success: true, message: "Account updated." };
};
