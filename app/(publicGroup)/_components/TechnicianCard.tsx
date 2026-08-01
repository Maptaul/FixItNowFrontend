import { BriefcaseIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { avatarUrl, formatCurrency, toNumber } from "@/lib/format";
import { ITechnicianProfile } from "@/lib/types";

export function TechnicianCard({
  technician,
}: {
  technician: ITechnicianProfile;
}) {
  const name = technician.user?.name ?? "Technician";
  const services = technician.services ?? [];

  // "Starting price" is the cheapest service they list.
  const startingPrice = services.length
    ? Math.min(...services.map((service) => toNumber(service.price)))
    : toNumber(technician.hourlyRate);

  const categories = [
    ...new Set(
      services.map((service) => service.category?.name).filter(Boolean),
    ),
  ].slice(0, 3) as string[];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Image
            src={avatarUrl(name)}
            alt=""
            width={52}
            height={52}
            className="size-13 shrink-0 rounded-full bg-muted object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold">{name}</h3>
              {technician.isVerified && (
                <ShieldCheckIcon
                  className="size-4 shrink-0 text-primary"
                  aria-label="Verified technician"
                />
              )}
            </div>
            <Rating value={technician.avgRating} className="mt-0.5" />
          </div>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {technician.bio ??
            "This technician hasn't written a bio yet — check their services and reviews below."}
        </p>

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
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="items-center justify-between border-t pt-4">
        <div className="text-sm">
          <span className="text-muted-foreground">from </span>
          <span className="text-base font-semibold">
            {formatCurrency(startingPrice)}
          </span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/technicians/${technician.id}`}>View profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
