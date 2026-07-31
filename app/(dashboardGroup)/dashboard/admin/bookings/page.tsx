import { Metadata } from "next";
import { getAllBookings } from "../../../_actions/adminActions";
import { BookingsTable } from "../../../_components/BookingsTable";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "All bookings" };

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings();

  return (
    <>
      <PageHeader
        title="All bookings"
        description="Every job on the platform. Admin access is read-only — technicians and customers drive the lifecycle."
      />

      <BookingsTable
        bookings={bookings}
        variant="admin"
        emptyTitle="No bookings on the platform yet"
        emptyDescription="Once customers start booking technicians, they'll show up here."
      />
    </>
  );
}
