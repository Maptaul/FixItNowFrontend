import {
  BanknoteIcon,
  CalendarRangeIcon,
  CircleSlashIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Metadata } from "next";
import { formatCurrency, toNumber } from "@/lib/format";
import { getAllBookings } from "../../../_actions/adminActions";
import { BookingsTable } from "../../../_components/BookingsTable";
import { PageHeader } from "../../../_components/PageHeader";
import { StatCard } from "../../../_components/StatCard";

export const metadata: Metadata = { title: "All bookings" };

const AdminBookingsPage = async () => {
  const bookings = await getAllBookings();

  const active = bookings.filter((booking) =>
    ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status),
  );

  const completed = bookings.filter(
    (booking) => booking.status === "COMPLETED",
  );

  const lost = bookings.filter((booking) =>
    ["CANCELLED", "DECLINED"].includes(booking.status),
  );

  // Gross booking value: everything that got past payment, which is the only
  // money the platform can prove was collected.
  const gbv = bookings
    .filter((booking) =>
      ["PAID", "IN_PROGRESS", "COMPLETED"].includes(booking.status),
    )
    .reduce((sum, booking) => sum + toNumber(booking.totalAmount), 0);

  const lostRate =
    bookings.length === 0
      ? 0
      : Math.round((lost.length / bookings.length) * 100);

  return (
    <>
      <PageHeader
        title="All bookings"
        description="Every job on the platform, with its payment state. Admin access is read-only — customers and technicians drive the lifecycle."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarRangeIcon}
          label="Total bookings"
          value={bookings.length}
          hint={`${active.length} active right now`}
        />
        <StatCard
          icon={TrendingUpIcon}
          label="Completed"
          value={completed.length}
        />
        <StatCard
          icon={BanknoteIcon}
          label="Gross booking value"
          value={formatCurrency(gbv)}
          hint="Paid and beyond"
        />
        <StatCard
          icon={CircleSlashIcon}
          label="Cancelled or declined"
          value={lost.length}
          delta={`${lostRate}% of all bookings`}
          // A rising share of lost bookings is a regression, so it reads red.
          tone={lostRate > 20 ? "bad" : "neutral"}
        />
      </div>

      <div className="mt-6">
        <BookingsTable
          bookings={bookings}
          variant="admin"
          emptyTitle="No bookings on the platform yet"
          emptyDescription="Once customers start booking technicians, every job shows up here with its payment state."
        />
      </div>
    </>
  );
};

export default AdminBookingsPage;
