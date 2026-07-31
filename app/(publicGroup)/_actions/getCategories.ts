"use server";

import { apiFetch } from "@/lib/api";
import { ICategory } from "@/lib/types";

/**
 * Service categories for filter dropdowns and the home page.
 * Public and slow-moving, so it's cached under the `categories` tag —
 * the admin category screens revalidate that tag after every change.
 */
export const getCategories = async (): Promise<ICategory[]> => {
  const result = await apiFetch<ICategory[]>("/api/categories", {
    auth: false,
    next: { revalidate: 300, tags: ["categories"] },
  });

  return result.success ? result.data : [];
};
