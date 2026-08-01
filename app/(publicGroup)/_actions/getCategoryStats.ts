"use server";

import { apiFetch, buildQuery } from "@/lib/api";
import { toNumber } from "@/lib/format";
import { ICategory, IService } from "@/lib/types";

export type ICategoryStat = ICategory & {
  technicianCount: number;
  serviceCount: number;
  /** Cheapest listed service in this category, or null when none exist. */
  fromPrice: number | null;
};


export const getCategoryStats = async (
  limit = 8,
): Promise<ICategoryStat[]> => {
  const query = buildQuery({ limit: 200 });

  const [servicesResult, categoriesResult] = await Promise.all([
    apiFetch<IService[]>(`/api/services${query}`, {
      auth: false,
      next: { revalidate: 300, tags: ["services"] },
    }),
    apiFetch<ICategory[]>("/api/categories", {
      auth: false,
      next: { revalidate: 300, tags: ["categories"] },
    }),
  ]);

  if (!categoriesResult.success) return [];

  const services = servicesResult.success ? servicesResult.data : [];

  const stats = new Map<
    string,
    { technicians: Set<string>; count: number; min: number | null }
  >();

  for (const service of services) {
    const entry = stats.get(service.categoryId) ?? {
      technicians: new Set<string>(),
      count: 0,
      min: null,
    };

    entry.technicians.add(service.technicianId);
    entry.count += 1;

    const price = toNumber(service.price);
    entry.min = entry.min === null ? price : Math.min(entry.min, price);

    stats.set(service.categoryId, entry);
  }

  return (
    categoriesResult.data
      .map((category) => {
        const entry = stats.get(category.id);
        return {
          ...category,
          technicianCount: entry?.technicians.size ?? 0,
          serviceCount: entry?.count ?? 0,
          fromPrice: entry?.min ?? null,
        };
      })
      // Categories with real supply first — an empty card teaches nothing.
      .sort((a, b) => b.technicianCount - a.technicianCount)
      .slice(0, limit)
  );
};
