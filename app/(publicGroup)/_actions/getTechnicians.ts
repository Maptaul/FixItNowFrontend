"use server";

import { apiFetch, buildQuery } from "@/lib/api";
import { IMeta, ITechnicianProfile } from "@/lib/types";

export type TechnicianFilters = {
  location?: string;
  minRating?: string;
  categoryId?: string;
  page?: string | number;
  limit?: string | number;
};

/** Public technician directory, ordered by rating on the server. */
export const getTechnicians = async (
  filters: TechnicianFilters = {},
): Promise<{ technicians: ITechnicianProfile[]; meta: IMeta }> => {
  const query = buildQuery({ ...filters });

  const result = await apiFetch<ITechnicianProfile[]>(
    `/api/technicians${query}`,
    { auth: false, next: { revalidate: 60, tags: ["technicians"] } },
  );

  return {
    technicians: result.success ? result.data : [],
    meta: result.meta ?? { page: 1, limit: 0, total: 0 },
  };
};


export const getTechnicianById = async (
  id: string,
): Promise<ITechnicianProfile | null> => {
  const result = await apiFetch<ITechnicianProfile>(`/api/technicians/${id}`, {
    auth: false,
    next: { revalidate: 30, tags: ["technicians", `technician-${id}`] },
  });

  return result.success ? result.data : null;
};
