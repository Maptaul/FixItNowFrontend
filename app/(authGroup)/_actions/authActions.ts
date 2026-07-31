"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch, toFieldErrors } from "@/lib/api";
import { ROLE_HOME } from "@/lib/constants";
import { IFormState, IUser } from "@/lib/types";
import { loginSchema, registerSchema, zodFieldErrors } from "@/lib/validations";
import { jwtUtils } from "@/utils/jwt";

const ONE_DAY_SECONDS = 60 * 60 * 24;

/** Only ever redirect to a path on this site — never to an absolute URL. */
const safeRedirect = (value: string | undefined): string | null => {
  if (!value) return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
};

/**
 * Log in and store the returned JWT in an httpOnly cookie.
 *
 * The token lives only on the server: `proxy.ts` reads it to route requests
 * and `lib/api.ts` forwards it as a Bearer header. It's never exposed to
 * client JavaScript, so an XSS bug can't walk off with the session.
 */
export const loginAction = async (
  redirectTo: string | undefined,
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<{ accessToken: string }>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: parsed.data,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  const accessToken = result.data.accessToken;
  const user = jwtUtils.getUserFromToken(accessToken);

  if (!user) {
    return {
      success: false,
      message: "The server returned a token we couldn't read. Please try again.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });

  // `redirect` throws to unwind the action, so it must be the last statement.
  redirect(safeRedirect(redirectTo) ?? ROLE_HOME[user.role]);
};

/**
 * Register as a customer or technician.
 *
 * The API creates an empty technician profile alongside a TECHNICIAN account,
 * which is why new technicians land straight on their profile setup screen.
 */
export const registerAction = async (
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<IUser>("/api/auth/register", {
    method: "POST",
    auth: false,
    body: parsed.data,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  // Registration doesn't return a token — send them to log in with a hint
  // of where they were heading.
  redirect(`/auth/login?registered=1&email=${encodeURIComponent(parsed.data.email)}`);
};
