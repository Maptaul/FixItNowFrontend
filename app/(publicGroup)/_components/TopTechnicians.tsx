import { UserSearchIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getTechnicians } from "../_actions/getTechnicians";
import { TechnicianCard } from "./TechnicianCard";

/** The API already orders technicians by rating, so "top" is just the head. */
export async function TopTechnicians({ limit = 3 }: { limit?: number }) {
  const { technicians } = await getTechnicians({ limit });

  if (technicians.length === 0) {
    return (
      <EmptyState
        icon={UserSearchIcon}
        title="No technicians yet"
        description="Nobody has completed a technician profile so far."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {technicians.map((technician) => (
        <TechnicianCard key={technician.id} technician={technician} />
      ))}
    </div>
  );
}
