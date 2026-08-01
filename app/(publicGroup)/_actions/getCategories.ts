"use server";

import { apiFetch } from "@/lib/api";
import { ICategory } from "@/lib/types";


export const getCategories = async (): Promise<ICategory[]> => {
  const result = await apiFetch<ICategory[]>("/api/categories", {
    auth: false,
    next: { revalidate: 300, tags: ["categories"] },
  });

  return result.success ? result.data : [];
};
