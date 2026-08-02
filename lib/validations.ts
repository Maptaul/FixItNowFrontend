import { z } from "zod";
import { IMAGE_HOSTS, isAllowedImageHost } from "./image-hosts";

const requiredString = (label: string, min = 1) =>
  z
    .string()
    .trim()
    .min(
      min,
      min === 1
        ? `${label} is required`
        : `${label} must be at least ${min} characters`,
    );

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
  password: requiredString("Password"),
});

export const registerSchema = z.object({
  name: requiredString("Name", 2),
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
  password: requiredString("Password", 6),
  role: z.enum(["CUSTOMER", "TECHNICIAN"], {
    message: "Choose how you want to use FixItNow",
  }),
});

export const updateAccountSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    /*
     * A link, not a file — the API has no upload endpoint. The host is
     * checked against the same list `next/image` is configured with, so a
     * URL that would render as a broken image is refused here with a message
     * the user can act on. `""` is how the form clears the picture.
     */
    avatarUrl: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .max(500, "That URL is too long")
          .refine(isAllowedImageHost, {
            message: `Use an https link from ${IMAGE_HOSTS.join(", ")} — upload to imgbb.com and paste the direct link`,
          }),
      ])
      .optional(),
  })
  .refine(
    (data) => data.name || data.password || data.avatarUrl !== undefined,
    {
      message: "Change something before saving",
      path: ["name"],
    },
  );

export const technicianProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(1000, "Keep your bio under 1000 characters")
    .optional(),
  experienceYears: z.coerce
    .number({ message: "Experience must be a number" })
    .int("Experience must be a whole number of years")
    .min(0, "Experience cannot be negative")
    .max(70, "That looks too high — enter years, not months"),
  hourlyRate: z.coerce
    .number({ message: "Hourly rate must be a number" })
    .min(0, "Hourly rate cannot be negative"),
  location: requiredString("Location"),
});

export const serviceSchema = z.object({
  categoryId: requiredString("Category"),
  title: requiredString("Title", 3),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1000 characters")
    .optional(),
  price: z.coerce
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than 0"),
});

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const availabilitySlotSchema = z
  .object({
    date: requiredString("Date"),
    startTime: z.string().regex(TIME_PATTERN, "Use a 24-hour time like 09:00"),
    endTime: z.string().regex(TIME_PATTERN, "Use a 24-hour time like 17:00"),
  })
  .refine((slot) => slot.endTime > slot.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const bookingSchema = z.object({
  serviceId: requiredString("Service"),
  scheduledAt: z
    .string()
    .min(1, "Pick a date and time")
    .refine(
      (value) =>
        !Number.isNaN(Date.parse(value)) && new Date(value) > new Date(),
      "Pick a date and time in the future",
    ),
  slotId: z.string().optional(),
});

export const reviewSchema = z.object({
  bookingId: requiredString("Booking"),
  rating: z.coerce
    .number({ message: "Pick a rating" })
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .trim()
    .max(1000, "Keep your review under 1000 characters")
    .optional(),
});

export const categorySchema = z.object({
  name: requiredString("Category name", 2),
  icon: z.string().trim().max(60, "Icon name is too long").optional(),
});

/**
 * Flatten a Zod failure into the `fieldErrors` shape every form renders.
 */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const field = issue.path.join(".") || "form";
    if (!acc[field]) acc[field] = issue.message;
    return acc;
  }, {});
}
