"use server";

import { apiFetch, buildQuery } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  IBooking,
  IRole,
  IService,
  ITechnicianProfile,
  IUser,
} from "@/lib/types";

export type SearchGroup = "Bookings" | "Technicians" | "Services" | "Users";

export type SearchHit = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
};

/**
 * Dashboard search — design handoff § Dashboard shell (the ⌘K affordance).
 *
 * There is no global search endpoint, so this fans out across the resources
 * the signed-in role can already see and merges the results:
 *
 *   everyone     `/api/services?search=` (the API filters server-side) and
 *                `/api/technicians`
 *   customer     their own bookings
 *   technician   their own jobs
 *   admin        every user and every booking
 *
 * Each role only ever searches what it is allowed to read — the same
 * endpoints its dashboard already uses — so the palette can't become a way
 * to see someone else's data.
 */
const LIMIT_PER_GROUP = 4;

const matches = (query: string, ...fields: (string | undefined | null)[]) =>
  fields.some((field) => field?.toLowerCase().includes(query));

export const dashboardSearch = async (
  rawQuery: string,
  role: IRole,
): Promise<SearchHit[]> => {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < 2) return [];

  const hits: SearchHit[] = [];

  /* ---- Services: the API does the filtering for us ---- */
  const services = await apiFetch<IService[]>(
    `/api/services${buildQuery({ search: query, limit: LIMIT_PER_GROUP })}`,
    { auth: false, next: { revalidate: 30, tags: ["services"] } },
  );

  if (services.success) {
    for (const service of services.data) {
      hits.push({
        id: `service-${service.id}`,
        group: "Services",
        title: service.title,
        subtitle: `${service.category?.name ?? "Service"} · ${formatCurrency(service.price)}`,
        href: service.technician
          ? `/technicians/${service.technician.id}?service=${service.id}`
          : "/services",
      });
    }
  }

  /* ---- Technicians: filtered here, the endpoint has no name search ---- */
  const technicians = await apiFetch<ITechnicianProfile[]>(
    `/api/technicians${buildQuery({ limit: 50 })}`,
    { auth: false, next: { revalidate: 60, tags: ["technicians"] } },
  );

  if (technicians.success) {
    hits.push(
      ...technicians.data
        .filter((technician) =>
          matches(query, technician.user?.name, technician.location),
        )
        .slice(0, LIMIT_PER_GROUP)
        .map((technician) => ({
          id: `tech-${technician.id}`,
          group: "Technicians" as const,
          title: technician.user?.name ?? "Technician",
          subtitle: [technician.location, `★ ${technician.avgRating}`]
            .filter(Boolean)
            .join(" · "),
          href: `/technicians/${technician.id}`,
        })),
    );
  }

  /* ---- Bookings: whichever list this role is entitled to ---- */
  const bookingPath =
    role === "CUSTOMER"
      ? "/api/bookings"
      : role === "TECHNICIAN"
        ? "/api/technician/bookings"
        : "/api/admin/bookings";

  const bookings = await apiFetch<IBooking[]>(bookingPath);

  if (bookings.success) {
    const detailHref = (booking: IBooking) =>
      role === "CUSTOMER"
        ? `/dashboard/customer/bookings/${booking.id}`
        : role === "TECHNICIAN"
          ? "/dashboard/technician/bookings"
          : "/dashboard/admin/bookings";

    hits.push(
      ...bookings.data
        .filter((booking) =>
          matches(
            query,
            booking.service?.title,
            booking.service?.category?.name,
            booking.customer?.name,
            booking.technician?.user?.name,
            booking.status,
          ),
        )
        .slice(0, LIMIT_PER_GROUP)
        .map((booking) => ({
          id: `booking-${booking.id}`,
          group: "Bookings" as const,
          title: booking.service?.title ?? "Booking",
          subtitle: `${booking.status.toLowerCase().replace("_", " ")} · ${formatDateTime(booking.scheduledAt)}`,
          href: detailHref(booking),
        })),
    );
  }

  /* ---- Users: admin only ---- */
  if (role === "ADMIN") {
    const users = await apiFetch<IUser[]>("/api/admin/users");

    if (users.success) {
      hits.push(
        ...users.data
          .filter((user) => matches(query, user.name, user.email))
          .slice(0, LIMIT_PER_GROUP)
          .map((user) => ({
            id: `user-${user.id}`,
            group: "Users" as const,
            title: user.name,
            subtitle: `${user.role.toLowerCase()} · ${user.email}`,
            href: "/dashboard/admin/users",
          })),
      );
    }
  }

  return hits;
};
