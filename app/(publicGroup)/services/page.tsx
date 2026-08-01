import { SearchXIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Money } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/lib/constants";
import { toNumber } from "@/lib/format";
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
        description="Nothing on the platform fits that combination yet. Widening the price range or clearing the category usually turns something up."
        action={
          <Button variant="outline" asChild>
            <Link href="/services">Clear filters</Link>
          </Button>
        }
      />
    );
  }

  const prices = services.map((service) => toNumber(service.price));
  const fromPrice = prices.length ? Math.min(...prices) : null;

  return (
    <>
      <p className="mb-5 text-body2 text-text2">
        <strong className="text-text">{meta.total}</strong> service
        {meta.total === 1 ? "" : "s"} · all fixed-price
        {fromPrice !== null && (
          <>
            {" "}
            · from <Money value={fromPrice} className="text-text" />
          </>
        )}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-1.5 text-caption text-text3">
          <li>
            <Link href="/" className="hover:text-text2">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-text2">Services</li>
        </ol>
      </nav>

      <header className="mb-7">
        <h1 className="text-page text-text">Browse services</h1>
        <p className="mt-1.5 text-[15px] text-text2">
          Filter by trade, area, budget and rating. Every price is the total —
          no surprises at the door.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
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
