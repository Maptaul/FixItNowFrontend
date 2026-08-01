import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMe } from "@/service/getMe";
import { getTechnicianById } from "../../_actions/getTechnicians";
import { BookingWizard } from "../../_components/BookingWizard";

export const metadata: Metadata = {
  title: "Book a visit",
  description: "Pick a service and a slot, and send your booking request.",
};

export default async function BookPage({
  params,
}: {
  params: Promise<{ technicianId: string }>;
}) {
  const { technicianId } = await params;

  const [technician, me] = await Promise.all([
    getTechnicianById(technicianId),
    getMe(),
  ]);

  if (!technician) notFound();

  const name = technician.user?.name ?? "Technician";

  return (
    // 1000px max with 36px/40px gutters, per the handoff's booking flow.
    <div className="mx-auto w-full max-w-[1000px] px-5 py-9 pb-24 lg:px-10">
      <Suspense fallback={<Skeleton className="h-[600px] rounded-[20px]" />}>
        <BookingWizard
          technicianId={technician.id}
          technicianName={name}
          technicianRating={technician.avgRating}
          services={technician.services ?? []}
          slots={technician.slots ?? []}
          isLoggedIn={Boolean(me)}
          isCustomer={me?.role === "CUSTOMER"}
        />
      </Suspense>
    </div>
  );
}
