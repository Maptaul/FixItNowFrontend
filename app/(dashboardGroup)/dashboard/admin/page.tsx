import {
  CalendarRangeIcon,
  ShapesIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, toNumber } from "@/lib/format";
import { getAdminCategories, getAllBookings, getAllUsers } from "../../_actions/adminActions";
import { BookingsTable } from "../../_components/BookingsTable";
import { PageHeader } from "../../_components/PageHeader";
import { StatCard } from "../../_components/StatCard";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const [users, bookings, categories] = await Promise.all([
    getAllUsers(),
    getAllBookings(),
    getAdminCategories(),
  ]);

  const technicians = users.filter((user) => user.role === "TECHNICIAN");
  const banned = users.filter((user) => user.activeStatus === "BLOCKED");

  const activeBookings = bookings.filter((booking) =>
    ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status),
  );

  // Revenue = money actually collected, i.e. bookings that got past payment.
  const revenue = bookings
    .filter((booking) =>
      ["PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
    )
    .reduce((sum, booking) => sum + toNumber(booking.totalAmount), 0);

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Users, bookings and revenue across the whole marketplace."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/users">Manage users</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={UsersIcon}
          label="Total users"
          value={users.length}
          hint={banned.length > 0 ? `${banned.length} banned` : "None banned"}
        />
        <StatCard
          icon={WrenchIcon}
          label="Technicians"
          value={technicians.length}
        />
        <StatCard
          icon={UserCheckIcon}
          label="Customers"
          value={users.filter((user) => user.role === "CUSTOMER").length}
        />
        <StatCard
          icon={CalendarRangeIcon}
          label="Total bookings"
          value={bookings.length}
          hint={`${activeBookings.length} active`}
        />
        <StatCard
          icon={TrendingUpIcon}
          label="Revenue"
          value={formatCurrency(revenue)}
          hint="Paid and beyond"
        />
        <StatCard
          icon={ShapesIcon}
          label="Categories"
          value={categories.length}
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest bookings</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/bookings">View all</Link>
          </Button>
        </div>

        <BookingsTable
          showTabs={false}
          bookings={bookings.slice(0, 8)}
          variant="admin"
          emptyTitle="No bookings on the platform yet"
          emptyDescription="Once customers start booking technicians, they'll show up here."
        />
      </section>
    </>
  );
}
