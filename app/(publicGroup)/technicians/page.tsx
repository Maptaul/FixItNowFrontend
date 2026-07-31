import { UserSearchIcon } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PAGE_SIZE } from "@/lib/constants";
import { getCategories } from "../_actions/getCategories";
import { getTechnicians } from "../_actions/getTechnicians";
import { CardGridSkeleton } from "../_components/CardGridSkeleton";
import { ListPagination } from "../_components/ListPagination";
import { ServiceFilters } from "../_components/ServiceFilters";
import { TechnicianCard } from "../_components/TechnicianCard";

export const metadata: Metadata = {
  title: "Find a technician",
  description:
    "Browse vetted technicians by location, trade and customer rating.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

async function TechnicianResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const { technicians, meta } = await getTechnicians({
    categoryId: first(params.categoryId),
    location: first(params.location),
    minRating: first(params.minRating),
    page: first(params.page) ?? 1,
    limit: PAGE_SIZE,
  });

  if (technicians.length === 0) {
    return (
      <EmptyState
        icon={UserSearchIcon}
        title="No technicians match those filters"
        description="Try a different area or lower the minimum rating."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Showing <strong>{technicians.length}</strong> of{" "}
        <strong>{meta.total}</strong> technicians
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {technicians.map((technician) => (
          <TechnicianCard key={technician.id} technician={technician} />
        ))}
      </div>

      <ListPagination meta={meta} />
    </>
  );
}

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find a technician</h1>
        <p className="mt-1 text-muted-foreground">
          Every profile shows real customer reviews and the trades they cover.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Price filters don't apply to the technician endpoint. */}
        <ServiceFilters categories={categories} showPrice={false} />

        <section>
          <Suspense
            key={JSON.stringify(await searchParams)}
            fallback={<CardGridSkeleton count={6} withImage={false} />}
          >
            <TechnicianResults searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
