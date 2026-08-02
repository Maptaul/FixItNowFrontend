import { Metadata } from "next";
import { getTechnicianBookings } from "../../../_actions/bookingActions";
import { BookingsTable } from "../../../_components/BookingsTable";
import { LiveRefresh } from "../../../_components/LiveRefresh";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Job requests" };

const TechnicianBookingsPage = async () => {
  const bookings = await getTechnicianBookings();

  return (
    <>
      <LiveRefresh />

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
};

export default TechnicianBookingsPage;
