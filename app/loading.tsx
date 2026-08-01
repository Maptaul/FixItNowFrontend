import { Skeleton } from "@/components/ui/skeleton";

/** Route-level fallback while a page's server work resolves. */
const Loading = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
};

export default Loading;
