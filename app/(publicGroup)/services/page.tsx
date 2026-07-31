import { SearchXIcon } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PAGE_SIZE } from "@/lib/constants";
import { getCategories } from "../_actions/getCategories";
import { getServices } from "../_actions/getServices";
import { CardGridSkeleton } from "../_components/CardGridSkeleton";
import { ListPagination } from "../_components/ListPagination";
import { ServiceCard } from "../_components/ServiceCard";
import { ServiceFilters } from "../_components/ServiceFilters";

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Filter home services by trade, location, price and rating, then book a technician.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

async function ServiceResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const { services, meta } = await getServices({
    search: first(params.search),
    categoryId: first(params.categoryId),
    location: first(params.location),
    minPrice: first(params.minPrice),
    maxPrice: first(params.maxPrice),
    minRating: first(params.minRating),
    page: first(params.page) ?? 1,
    limit: PAGE_SIZE,
  });

  if (services.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title="No services match those filters"
        description="Try widening the price range, clearing the category, or searching for a different keyword."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Showing <strong>{services.length}</strong> of{" "}
        <strong>{meta.total}</strong> services
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <ListPagination meta={meta} />
    </>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse services</h1>
        <p className="mt-1 text-muted-foreground">
          Filter by trade, location, budget and rating to find the right pro.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ServiceFilters categories={categories} />

        <section>
          {/* Keyed on the query so a filter change re-triggers the skeleton. */}
          <Suspense
            key={JSON.stringify(await searchParams)}
            fallback={<CardGridSkeleton count={6} />}
          >
            <ServiceResults searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
