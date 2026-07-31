import {
  BriefcaseIcon,
  MapPinIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { avatarUrl, formatCurrency, formatDate } from "@/lib/format";
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
      `Book ${name} on FixItNow — see their services, rating and availability.`,
  };
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Profile */}
        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Image
              src={avatarUrl(name)}
              alt=""
              width={96}
              height={96}
              priority
              className="size-24 shrink-0 rounded-2xl bg-muted object-cover"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                {technician.isVerified && (
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheckIcon className="size-3.5" />
                    Verified
                  </Badge>
                )}
              </div>

              <Rating value={technician.avgRating} count={reviews.length} />

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {technician.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="size-3.5" />
                    {technician.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="size-3.5" />
                  {technician.experienceYears} yr
                  {technician.experienceYears === 1 ? "" : "s"} experience
                </span>
                <span>
                  {formatCurrency(technician.hourlyRate)}
                  <span className="text-muted-foreground">/hr</span>
                </span>
              </div>
            </div>
          </header>

          <Separator />

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-pretty text-muted-foreground">
              {technician.bio ??
                "This technician hasn't written a bio yet. Their services and reviews are below."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">
              Services ({services.length})
            </h2>

            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No services listed yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium">{service.title}</h3>
                        <span className="shrink-0 font-semibold">
                          {formatCurrency(service.price)}
                        </span>
                      </div>

                      {service.category && (
                        <Badge variant="secondary">
                          {service.category.name}
                        </Badge>
                      )}

                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">
              Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquareIcon}
                title="No reviews yet"
                description="Once a customer completes a job with this technician, their review shows up here."
              />
            ) : (
              <ul className="space-y-3">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <Card>
                      <CardContent className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <Rating value={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-pretty">
                            {review.comment}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Booking */}
        <div>
          <BookingPanel
            technicianId={technician.id}
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
