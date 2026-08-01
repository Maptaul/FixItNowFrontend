"use server";

import { apiFetch, getAccessToken } from "@/lib/api";
import { IUser } from "@/lib/types";

export const getMe = async (): Promise<IUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const result = await apiFetch<IUser>("/api/auth/me");

  return result.success ? result.data : null;
};
