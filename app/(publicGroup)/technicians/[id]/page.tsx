import { MessageSquareIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money } from "@/components/design/money";
import { RatingHistogram } from "@/components/design/rating-histogram";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRating, toNumber } from "@/lib/format";
import { getMe } from "@/service/getMe";
import { getTechnicianById } from "../../_actions/getTechnicians";
import { BookingPanel } from "../../_components/BookingPanel";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ service?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const technician = await getTechnicianById(id);

  if (!technician) return { title: "Technician not found" };

  const name = technician.user?.name ?? "Technician";
  return {
    title: name,
    description:
      technician.bio ??
      `Book ${name} on FixItNow — fixed prices, real reviews, slots you can see.`,
  };
}

/** The 4-metric row under the identity block. */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[19px] font-bold tracking-[-0.02em] text-text">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11.5px] font-medium text-text3">
        {label}
      </p>
    </div>
  );
}

export default async function TechnicianProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const [technician, me, { service: preselectedServiceId }] = await Promise.all([
    getTechnicianById(id),
    getMe(),
    searchParams,
  ]);

  if (!technician) notFound();

  const name = technician.user?.name ?? "Technician";
  const services = technician.services ?? [];
  const reviews = technician.reviews ?? [];
  const slots = technician.slots ?? [];

  const fromPrice = services.length
    ? Math.min(...services.map((service) => toNumber(service.price)))
    : toNumber(technician.hourlyRate);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-1.5 text-caption text-text3">
          <li>
            <Link href="/" className="hover:text-text2">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/technicians" className="hover:text-text2">
              Technicians
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-text2">{name}</li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="min-w-0 space-y-6">
          {/* Profile card */}
          <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
            <div className="flex flex-col gap-5 sm:flex-row">
              <GradientAvatar
                name={name}
                kind="technician"
                size={96}
                radius={22}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-page text-text">{name}</h1>
                  {technician.isVerified && (
                    <Badge variant="emerald">Verified</Badge>
                  )}
                </div>

                <p className="mt-1.5 text-body2 text-text2">
                  {services[0]?.category?.name ?? "Home services"}
                  {technician.location ? ` · ${technician.location}` : ""}
                  {" · "}
                  {technician.experienceYears} yr
                  {technician.experienceYears === 1 ? "" : "s"} experience
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
                  <Metric
                    label="Average rating"
                    value={formatRating(technician.avgRating)}
                  />
                  <Metric label="Reviews" value={String(reviews.length)} />
                  <Metric
                    label="Services listed"
                    value={String(services.length)}
                  />
                  <Metric
                    label="Open slots"
                    value={String(slots.filter((slot) => !slot.isBooked).length)}
                  />
                </div>
              </div>
            </div>

            <p className="mt-5 text-[14.5px] leading-[1.7] text-text2">
              {technician.bio ??
                "This technician hasn't written a bio yet. Their services, prices and reviews are below."}
            </p>

            {services.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  ...new Set(
                    services
                      .map((service) => service.category?.name)
                      .filter(Boolean),
                  ),
                ].map((skill) => (
                  <Badge key={skill as string} variant="neutral">
                    {skill as string}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Services & fixed prices — divided rows */}
          <section className="overflow-hidden rounded-panel border border-line bg-surface shadow-sh2">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-panel text-text">Services &amp; fixed prices</h2>
              <p className="mt-0.5 text-caption text-text3">
                The price you see is the total for the visit.
              </p>
            </div>

            {services.length === 0 ? (
              <p className="px-6 py-8 text-center text-body2 text-text2">
                This technician hasn&apos;t listed any services yet.
              </p>
            ) : (
              <ul>
                {services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-cardtitle text-text">
                        {service.title}
                      </p>
                      {service.description && (
                        <p className="mt-0.5 line-clamp-1 text-caption font-normal text-text2">
                          {service.description}
                        </p>
                      )}
                      {service.category && (
                        <Badge variant="neutral" className="mt-1.5">
                          {service.category.name}
                        </Badge>
                      )}
                    </div>

                    <span className="shrink-0 text-right">
                      <Money
                        value={service.price}
                        className="block text-[16px] font-bold"
                      />
                      <span className="text-[11.5px] text-text3">/ visit</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Reviews */}
          <section className="space-y-4">
            <h2 className="text-panel text-text">
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquareIcon}
                title="No reviews yet"
                description="Once a customer completes a job with this technician, their review shows up here."
              />
            ) : (
              <>
                <RatingHistogram
                  reviews={reviews}
                  average={technician.avgRating}
                />

                <ul className="space-y-3">
                  {reviews.map((review) => (
                    <li
                      key={review.id}
                      className="rounded-card border border-line bg-surface p-5 shadow-sh1"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="tracking-[1px] text-star"
                          aria-label={`${review.rating} out of 5`}
                        >
                          {"★".repeat(review.rating).padEnd(5, "☆")}
                        </span>
                        <span className="font-mono text-[12px] text-text3">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="mt-2 text-body2 text-text2">
                          {review.comment}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        {/* Sticky booking rail */}
        <div>
          <BookingPanel
            technicianId={technician.id}
            technicianName={name}
            fromPrice={fromPrice}
            services={services}
            slots={slots}
            isLoggedIn={Boolean(me)}
            isCustomer={me?.role === "CUSTOMER"}
            preselectedServiceId={preselectedServiceId}
          />
        </div>
      </div>
    </div>
  );
}
