import { SearchXIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getServices } from "../_actions/getServices";
import { ServiceCard } from "./ServiceCard";

/** Newest listings on the home page — its own async component so it streams. */
export async function FeaturedServices({ limit = 6 }: { limit?: number }) {
  const { services } = await getServices({ limit });

  if (services.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title="No services listed yet"
        description="Technicians haven't published any services. Check back shortly."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
