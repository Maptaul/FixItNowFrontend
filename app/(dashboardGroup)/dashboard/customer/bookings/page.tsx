import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMyBookings } from "../../../_actions/bookingActions";
import { BookingsTable } from "../../../_components/BookingsTable";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "My bookings" };

export default async function CustomerBookingsPage() {
  const bookings = await getMyBookings();

  return (
    <>
      <PageHeader
        title="My bookings"
        description="Pay for accepted jobs, cancel before work starts, and review once it's done."
        action={
          <Button asChild>
            <Link href="/services">Book a service</Link>
          </Button>
        }
      />

      <BookingsTable
        bookings={bookings}
        variant="customer"
        emptyTitle="You haven't booked anything yet"
        emptyDescription="Browse services and request a slot with a technician to get started."
      />
    </>
  );
}
