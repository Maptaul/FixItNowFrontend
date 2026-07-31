import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder grid shown while a Suspense boundary resolves. */
export function CardGridSkeleton({
  count = 6,
  withImage = true,
}: {
  count?: number;
  withImage?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={withImage ? "overflow-hidden pt-0" : ""}>
          {withImage && <Skeleton className="aspect-[16/10] rounded-none" />}

          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>

          <CardFooter className="justify-between border-t pt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
