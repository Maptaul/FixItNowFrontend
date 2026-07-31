import {
  CalendarClockIcon,
  CalendarRangeIcon,
  ClipboardListIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  ShapesIcon,
  UserIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import { IRole, ISidebarItem } from "@/lib/types";

/**
 * Sidebar navigation per role. The dashboard layout picks the list that
 * matches the signed-in user, which is what makes the shell "adapt" — there
 * is no shared menu with hidden items.
 */

const customerSidebarItems: ISidebarItem[] = [
  { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboardIcon },
  {
    label: "My bookings",
    href: "/dashboard/customer/bookings",
    icon: ClipboardListIcon,
  },
  {
    label: "Payments",
    href: "/dashboard/customer/payments",
    icon: CreditCardIcon,
  },
  { label: "My profile", href: "/dashboard/customer/profile", icon: UserIcon },
];

const technicianSidebarItems: ISidebarItem[] = [
  {
    label: "Overview",
    href: "/dashboard/technician",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Job requests",
    href: "/dashboard/technician/bookings",
    icon: ClipboardListIcon,
  },
  {
    label: "My services",
    href: "/dashboard/technician/services",
    icon: WrenchIcon,
  },
  {
    label: "Availability",
    href: "/dashboard/technician/availability",
    icon: CalendarClockIcon,
  },
  {
    label: "My profile",
    href: "/dashboard/technician/profile",
    icon: UserIcon,
  },
];

const adminSidebarItems: ISidebarItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboardIcon },
  { label: "Users", href: "/dashboard/admin/users", icon: UsersIcon },
  {
    label: "Bookings",
    href: "/dashboard/admin/bookings",
    icon: CalendarRangeIcon,
  },
  {
    label: "Categories",
    href: "/dashboard/admin/categories",
    icon: ShapesIcon,
  },
  { label: "My profile", href: "/dashboard/admin/profile", icon: UserIcon },
];

export const SIDEBAR_ITEMS: Record<IRole, ISidebarItem[]> = {
  CUSTOMER: customerSidebarItems,
  TECHNICIAN: technicianSidebarItems,
  ADMIN: adminSidebarItems,
};

export const ROLE_LABEL: Record<IRole, string> = {
  CUSTOMER: "Customer",
  TECHNICIAN: "Technician",
  ADMIN: "Administrator",
};
