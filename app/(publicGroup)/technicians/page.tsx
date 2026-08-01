import { UserSearchIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Money } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE } from "@/lib/constants";
import { toNumber } from "@/lib/format";
import { getCategories } from "../_actions/getCategories";
import { getTechnicians } from "../_actions/getTechnicians";
import { ListPagination } from "../_components/ListPagination";
import { ServiceFilters } from "../_components/ServiceFilters";
import { TechnicianRow } from "../_components/TechnicianRow";

export const metadata: Metadata = {
  title: "Find a technician",
  description:
    "Browse verified technicians by area, trade and customer rating. Fixed prices, shown upfront.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

function RowsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-5 rounded-card border border-line bg-surface p-5 shadow-sh2"
        >
          <Skeleton className="size-[76px] shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
          <div className="hidden w-40 shrink-0 space-y-2 border-l border-line pl-5 md:block">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
        description="Nobody on the platform covers that combination yet. Widening the area or lowering the minimum rating usually finds someone."
        action={
          <Button variant="outline" asChild>
            <Link href="/technicians">Clear filters</Link>
          </Button>
        }
      />
    );
  }

  // Summary line — the handoff leads with supply and the cheapest entry point.
  const verified = technicians.filter(
    (technician) => technician.isVerified,
  ).length;

  const prices = technicians.flatMap((technician) =>
    (technician.services ?? []).map((service) => toNumber(service.price)),
  );
  const fromPrice = prices.length ? Math.min(...prices) : null;

  return (
    <>
      <p className="mb-5 text-body2 text-text2">
        <strong className="text-text">{meta.total}</strong> technician
        {meta.total === 1 ? "" : "s"}
        {verified > 0 && <> · {verified} verified on this page</>}
        {fromPrice !== null && (
          <>
            {" "}
            · fixed price from <Money value={fromPrice} className="text-text" />
          </>
        )}
      </p>

      <div className="space-y-4">
        {technicians.map((technician) => (
          <TechnicianRow key={technician.id} technician={technician} />
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
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-1.5 text-caption text-text3">
          <li>
            <Link href="/" className="hover:text-text2">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-text2">Technicians</li>
        </ol>
      </nav>

      <header className="mb-7">
        <h1 className="text-page text-text">Find a technician</h1>
        <p className="mt-1.5 text-[15px] text-text2">
          Every profile shows real customer reviews and the trades they cover.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
        {/* Price filters don't apply to the technician endpoint. */}
        <ServiceFilters categories={categories} showPrice={false} />

        <section>
          <Suspense
            key={JSON.stringify(await searchParams)}
            fallback={<RowsSkeleton />}
          >
            <TechnicianResults searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
