"use server";

import { updateTag } from "next/cache";
import { apiFetch, toFieldErrors } from "@/lib/api";
import { IFormState, IService } from "@/lib/types";
import { serviceSchema, zodFieldErrors } from "@/lib/validations";

/**
 * Technician service CRUD.
 *
 * There's no "list my services" endpoint — a technician's services come back
 * on their public profile, so the dashboard reads them from `/api/auth/me`'s
 * technicianProfile id via the public technician route.
 */

const parseServiceForm = (formData: FormData) => {
  const description = String(formData.get("description") ?? "").trim();

  return serviceSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: description || undefined,
    price: formData.get("price"),
  });
};

export const createService = async (
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const parsed = parseServiceForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<IService>("/api/technician/services", {
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

  updateTag("services");

  return { success: true, message: `"${parsed.data.title}" is now listed.` };
};

export const updateService = async (
  serviceId: string,
  _prevState: IFormState,
  formData: FormData,
): Promise<IFormState> => {
  const parsed = parseServiceForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const result = await apiFetch<IService>(
    `/api/technician/services/${serviceId}`,
    { method: "PUT", body: parsed.data },
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: toFieldErrors(result.errorDetails),
    };
  }

  updateTag("services");

  return { success: true, message: "Service updated." };
};

export const deleteService = async (
  serviceId: string,
): Promise<IFormState> => {
  const result = await apiFetch<{ id: string }>(
    `/api/technician/services/${serviceId}`,
    { method: "DELETE" },
  );

  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag("services");

  return { success: true, message: "Service removed." };
};
