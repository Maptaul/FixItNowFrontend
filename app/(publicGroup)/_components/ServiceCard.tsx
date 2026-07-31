import { MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { categoryImage } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { IService } from "@/lib/types";

export function ServiceCard({ service }: { service: IService }) {
  const technician = service.technician;
  const bookHref = technician
    ? `/technicians/${technician.id}?service=${service.id}`
    : "/technicians";

  return (
    <Card className="group overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={categoryImage(service.category?.name)}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {service.category && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 backdrop-blur-sm"
          >
            {service.category.name}
          </Badge>
        )}
      </div>

      <CardContent className="space-y-2">
        <h3 className="line-clamp-1 font-semibold">{service.title}</h3>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {service.description ?? "No description provided for this service."}
        </p>

        {technician && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              by{" "}
              <span className="font-medium text-foreground">
                {technician.user?.name ?? "Technician"}
              </span>
            </span>
            <Rating value={technician.avgRating} />
          </div>
        )}

        {technician?.location && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5" />
            {technician.location}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">
          {formatCurrency(service.price)}
        </span>
        <Button size="sm" asChild>
          <Link href={bookHref}>Book now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
