import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { Money } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryStats } from "../_actions/getCategoryStats";

/**
 * Live entry prices per category.
 *
 * Nothing here is a rate card: the numbers are the cheapest service a
 * technician has actually listed in that category right now, recomputed on
 * every render. A category with no technicians says so rather than showing a
 * price nobody can honour.
 */
export async function PricingTable() {
  const categories = await getCategoryStats(24);
  const withSupply = categories.filter(
    (category) => category.technicianCount > 0,
  );

  if (withSupply.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title="No services listed yet"
        description="Technicians haven't published anything to price. The browse page will fill up as they do."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-sh2">
      <div className="hidden grid-cols-[1.5fr_.8fr_.8fr_auto] items-center gap-4 bg-surface2 px-5 py-3 md:grid">
        <span className="text-th text-text3 uppercase">Category</span>
        <span className="text-th text-text3 uppercase">Technicians</span>
        <span className="text-th text-text3 uppercase">Services</span>
        <span className="text-th text-text3 uppercase md:text-right">
          Starts from
        </span>
      </div>

      {withSupply.map((category) => (
        <Link
          key={category.id}
          href={`/services?categoryId=${category.id}`}
          className="flex flex-col gap-2 border-t border-line px-5 py-4 transition-colors duration-120 hover:bg-surface2 md:grid md:grid-cols-[1.5fr_.8fr_.8fr_auto] md:items-center md:gap-4"
        >
          <span className="flex items-center gap-2.5">
            <span className="font-semibold text-text">{category.name}</span>
            {category.technicianCount === 1 && (
              <Badge variant="amber">One technician</Badge>
            )}
          </span>

          <span className="flex items-center justify-between gap-3 md:block">
            <span className="text-th text-text3 uppercase md:hidden">
              Technicians
            </span>
            <span className="font-mono text-body2 text-text2">
              {category.technicianCount}
            </span>
          </span>

          <span className="flex items-center justify-between gap-3 md:block">
            <span className="text-th text-text3 uppercase md:hidden">
              Services
            </span>
            <span className="font-mono text-body2 text-text2">
              {category.serviceCount}
            </span>
          </span>

          <span className="flex items-center justify-between gap-3 md:block md:text-right">
            <span className="text-th text-text3 uppercase md:hidden">
              Starts from
            </span>
            {category.fromPrice !== null ? (
              <Money
                value={category.fromPrice}
                className="text-[15px] font-bold"
              />
            ) : (
              <span className="text-body2 text-text3">—</span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function PricingTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-sh2">
      <Skeleton className="h-10 rounded-none" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.5fr_.8fr_.8fr_auto] items-center gap-4 border-t border-line px-5 py-4"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-5 w-20 justify-self-end" />
        </div>
      ))}
    </div>
  );
}
