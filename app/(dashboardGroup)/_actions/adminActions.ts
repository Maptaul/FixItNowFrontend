"use server";

import { updateTag } from "next/cache";
import { apiFetch, buildQuery, toFieldErrors } from "@/lib/api";
import {
  IActiveStatus,
  IBooking,
  ICategory,
  IFormState,
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
