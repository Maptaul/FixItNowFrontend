import { Metadata } from "next";
import { getTechnicianBookings } from "../../../_actions/bookingActions";
import { BookingsTable } from "../../../_components/BookingsTable";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Job requests" };

export default async function TechnicianBookingsPage() {
  const bookings = await getTechnicianBookings();

  return (
    <>
      <PageHeader
        title="Job requests"
        description="Accept or decline new requests, then move accepted jobs through to completion."
      />

      <BookingsTable
        bookings={bookings}
        variant="technician"
        emptyTitle="No job requests yet"
        emptyDescription="List a service and publish your availability so customers can find you."
      />
    </>
  );
}
