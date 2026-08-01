"use server";

import { apiFetch, buildQuery } from "@/lib/api";
import { IMeta, IService } from "@/lib/types";

export type ServiceFilters = {
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
};


export const getServices = async (
  filters: ServiceFilters = {},
): Promise<{ services: IService[]; meta: IMeta }> => {
  const query = buildQuery({ ...filters });

  const result = await apiFetch<IService[]>(`/api/services${query}`, {
    auth: false,
    next: { revalidate: 60, tags: ["services"] },
  });

  return {
    services: result.success ? result.data : [],
    meta: result.meta ?? { page: 1, limit: 0, total: 0 },
  };
};
