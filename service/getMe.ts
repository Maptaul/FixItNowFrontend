"use server";

import { apiFetch, getAccessToken } from "@/lib/api";
import { IUser } from "@/lib/types";

/**
 * The signed-in user, straight from `GET /api/auth/me`.
 *
 * Returns `null` for anonymous visitors — the navbar and dashboards branch on
 * that rather than on a thrown error, since "logged out" is a normal state.
 * Never cached: this is per-user data, and it carries the live ban status.
 */
export const getMe = async (): Promise<IUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const result = await apiFetch<IUser>("/api/auth/me");

  return result.success ? result.data : null;
};
