import Link from "next/link";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money } from "@/components/design/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRating, toNumber } from "@/lib/format";
import { ITechnicianProfile } from "@/lib/types";

/**
 * Search-result row — design handoff § Search results / Technicians.
 *
 * 76px avatar, body with name + verification + availability, role line,
 * two-line blurb and skill chips; then a 160px right column divided by a 1px
 * left border holding rating, review count, price and a full-width Book
 * button. Below 768px the right column folds into the body.
 */
export function TechnicianRow({
  technician,
}: {
  technician: ITechnicianProfile;
}) {
  const name = technician.user?.name ?? "Technician";
  const services = technician.services ?? [];
  const reviewCount = technician.reviews?.length ?? 0;

  const fromPrice = services.length
    ? Math.min(...services.map((service) => toNumber(service.price)))
    : toNumber(technician.hourlyRate);

  const skills = [
    ...new Set(services.map((service) => service.category?.name).filter(Boolean)),
  ].slice(0, 4) as string[];

  const hasOpenSlot = (technician.slots ?? []).some((slot) => !slot.isBooked);

  return (
    <article className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5 shadow-sh2 transition-shadow duration-160 hover:shadow-sh3 md:flex-row">
      {/* Body */}
      <div className="flex min-w-0 flex-1 gap-4">
        <GradientAvatar
          name={name}
          kind="technician"
          size={76}
          radius={18}
          className="hidden sm:grid"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/technicians/${technician.id}`}
              className="text-panel text-text hover:text-primary"
            >
              {name}
            </Link>

            {technician.isVerified && <Badge variant="emerald">Verified</Badge>}

            {technician.slots &&
              (hasOpenSlot ? (
                <Badge variant="primary">Slots open</Badge>
              ) : (
                <Badge variant="neutral">Fully booked</Badge>
              ))}
          </div>

          <p className="text-body2 text-text2">
            {services[0]?.category?.name ?? "Home services"}
            {technician.location ? ` · ${technician.location}` : ""}
            {" · "}
            {technician.experienceYears} yr
            {technician.experienceYears === 1 ? "" : "s"} experience
          </p>

          <p className="line-clamp-2 text-body2 text-text2">
            {technician.bio ??
              "This technician hasn't written a bio yet — their services and reviews are on the profile."}
          </p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="neutral">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column — divided by a 1px left border from md up. */}
      <div className="flex shrink-0 flex-col gap-2 border-line pt-4 md:w-40 md:border-t-0 md:border-l md:pt-0 md:pl-5 border-t">
        <p className="text-body2 text-text">
          <span aria-hidden="true" className="text-star">
            ★
          </span>{" "}
          <span className="font-mono font-semibold">
            {formatRating(technician.avgRating)}
          </span>
        </p>

        <p className="text-caption text-text3">
          {reviewCount} review{reviewCount === 1 ? "" : "s"}
        </p>

        <Money value={fromPrice} className="mt-1 text-[17px] font-bold" />
        <p className="text-[11.5px] text-text3">fixed price, from</p>

        <Button size="sm" asChild className="mt-2 w-full">
          <Link href={`/technicians/${technician.id}`}>Book</Link>
        </Button>
      </div>
    </article>
  );
}
