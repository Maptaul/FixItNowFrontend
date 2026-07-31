import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCategories } from "../_actions/getCategories";

/**
 * Quick category jump-off. The seeded database also holds throwaway test
 * categories (`Cleaning_17188`, `RvCat_28812`…), so only the curated ones —
 * the categories that carry an icon — are surfaced here.
 */
export async function CategoryStrip({ limit = 8 }: { limit?: number }) {
  const categories = await getCategories();
  const curated = categories.filter((category) => category.icon).slice(0, limit);

  if (curated.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {curated.map((category) => (
        <Link key={category.id} href={`/services?categoryId=${category.id}`}>
          <Badge
            variant="outline"
            className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:border-primary hover:bg-primary/10"
          >
            {category.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
