"use server";

import { updateTag } from "next/cache";
import { apiFetch, buildQuery, toFieldErrors } from "@/lib/api";
import { toNumber } from "@/lib/format";
import {
  IActiveStatus,
  IBooking,
  ICategory,
  IFormState,
  IService,
  IUser,
} from "@/lib/types";
import { categorySchema, zodFieldErrors } from "@/lib/validations";

/** Platform-wide user list. The API filters by role and status server-side. */
export const getAllUsers = async (filters: {
  role?: string;
  status?: string;
} = {}): Promise<IUser[]> => {
  const query = buildQuery({ role: filters.role, status: filters.status });
  const result = await apiFetch<IUser[]>(`/api/admin/users${query}`);
  return result.success ? result.data : [];
};

/** Ban or reinstate a user. A banned user is rejected at the API's auth layer. */
export const updateUserStatus = async (
  userId: string,
  activeStatus: IActiveStatus,
): Promise<IFormState> => {
  const result = await apiFetch<IUser>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: { activeStatus },
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }


  return {
    success: true,
    message:
      activeStatus === "BLOCKED"
        ? "User banned — they can no longer sign in."
        : "User reinstated.",
  };
};

/** Every booking on the platform, for the admin overview and table. */
export const getAllBookings = async (): Promise<IBooking[]> => {
  const result = await apiFetch<IBooking[]>("/api/admin/bookings");
  return result.success ? result.data : [];
};

/* ---------------------------------------------------------------- *
 * Category management
 * ---------------------------------------------------------------- */

export const getAdminCategories = async (): Promise<ICategory[]> => {
  const result = await apiFetch<ICategory[]>("/api/admin/categories");
  return result.success ? result.data : [];
};

export type IAdminCategoryStat = ICategory & {
  technicianCount: number;
  serviceCount: number;
  bookingCount: number;
  fromPrice: number | null;
  /** Derived from supply — the API has no status column on a category. */
  supply: "live" | "low" | "empty";
};

/**
 * Categories with the numbers the admin table shows.
 *
 * None of this is stored on the category: the API's model is
 * `{ id, name, icon }`. Everything else is derived — technician and service
 * counts and the entry price from `/api/services`, booking volume by mapping
 * each booking's serviceId back to its category (admin bookings only return
 * `service: { id, title }`, so the join has to happen here).
 *
 * "Supply" is likewise derived, not a stored status: a category nobody covers
 * is the thing an admin needs to see, and it's the honest version of the
 * handoff's Live / Low supply / Draft chip.
 */
export const getAdminCategoryStats = async (): Promise<
  IAdminCategoryStat[]
> => {
  const [categories, servicesResult, bookings] = await Promise.all([
    getAdminCategories(),
    apiFetch<IService[]>(`/api/services${buildQuery({ limit: 200 })}`, {
      auth: false,
      next: { revalidate: 60, tags: ["services"] },
    }),
    getAllBookings(),
  ]);

  const services = servicesResult.success ? servicesResult.data : [];

  const categoryOfService = new Map(
    services.map((service) => [service.id, service.categoryId]),
  );

  const bookingCounts = new Map<string, number>();
  for (const booking of bookings) {
    const categoryId = categoryOfService.get(booking.serviceId);
    if (!categoryId) continue;
    bookingCounts.set(categoryId, (bookingCounts.get(categoryId) ?? 0) + 1);
  }

  return categories
    .map((category) => {
      const own = services.filter(
        (service) => service.categoryId === category.id,
      );
      const technicianCount = new Set(
        own.map((service) => service.technicianId),
      ).size;

      return {
        ...category,
        technicianCount,
        serviceCount: own.length,
        bookingCount: bookingCounts.get(category.id) ?? 0,
        fromPrice: own.length
          ? Math.min(...own.map((service) => toNumber(service.price)))
          : null,
        supply:
          technicianCount === 0
            ? ("empty" as const)
            : technicianCount === 1
              ? ("low" as const)
              : ("live" as const),
      };
    })
    .sort((a, b) => b.bookingCount - a.bookingCount || b.technicianCount - a.technicianCount);
};

const parseCategoryForm = (formData: FormData) => {
  const icon = String(formData.get("icon") ?? "").trim();

  return categorySchema.safeParse({
    name: formData.get("name"),
    icon: icon || undefined,
  });
};

export const createCategory = async (
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const parsed = parseCategoryForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<ICategory>("/api/admin/categories", {
    method: "POST",
    body: parsed.data,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  updateTag("categories");

  return { success: true, message: `Category "${parsed.data.name}" created.` };
};

export const updateCategory = async (
  categoryId: string,
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const parsed = parseCategoryForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<ICategory>(
    `/api/admin/categories/${categoryId}`,
    { method: "PUT", body: parsed.data },
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  updateTag("categories");

  return { success: true, message: "Category updated." };
};

export const deleteCategory = async (
  categoryId: string,
): Promise<IFormState> => {
  const result = await apiFetch<{ id: string }>(
    `/api/admin/categories/${categoryId}`,
    { method: "DELETE" },
  );

  if (!result.success) {
    // Usually a foreign-key failure: services still point at this category.
    return { success: false, message: result.message };
  }

  updateTag("categories");

  return { success: true, message: "Category deleted." };
};
