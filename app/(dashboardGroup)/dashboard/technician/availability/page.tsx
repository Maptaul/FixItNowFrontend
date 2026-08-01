import { Metadata } from "next";
import { getMyAvailability } from "../../../_actions/technicianActions";
import { AvailabilityScheduler } from "../../../_components/AvailabilityScheduler";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Availability" };

const TechnicianAvailabilityPage = async () => {
  const slots = await getMyAvailability();

  return (
    <>
      <PageHeader
        title="Availability"
        description="Publish the hours you're free. Customers book directly into these slots."
      />

      <AvailabilityScheduler initialSlots={slots} />
    </>
  );
};

export default TechnicianAvailabilityPage;
