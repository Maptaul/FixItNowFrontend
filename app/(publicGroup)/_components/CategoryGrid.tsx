import Link from "next/link";
import { Money } from "@/components/design/money";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryStats } from "../_actions/getCategoryStats";

/**
 * "Popular in your area" — 4-up category cards. Each carries a 40px r12
 * soft-primary icon tile, the name, a technician count and a from-price.
 *
 * Icons in the handoff are Unicode glyphs standing in for a real icon set;
 * the seeded categories already name theirs (`faucet`, `bolt`, `snowflake`…),
 * so that keyword picks the glyph here.
 */
const CATEGORY_GLYPHS: Record<string, string> = {
  snowflake: "❄",
  bolt: "⚡",
  faucet: "◍",
  broom: "✦",
  hammer: "⚒",
  roller: "▤",
  leaf: "❧",
  fan: "✺",
};

const glyphFor = (icon: string | null, name: string): string => {
  if (icon && CATEGORY_GLYPHS[icon]) return CATEGORY_GLYPHS[icon];
  // Fall back to a stable glyph so the tile is never empty.
  const pool = Object.values(CATEGORY_GLYPHS);
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pool[sum % pool.length];
};

export async function CategoryGrid() {
  const categories = await getCategoryStats(8);

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/services?categoryId=${category.id}`}
          className="group rounded-card border border-line bg-surface p-[18px] shadow-sh2 transition-all duration-160 hover:-translate-y-0.5 hover:shadow-sh3"
        >
          <span
            aria-hidden="true"
            className="mb-3.5 grid size-10 place-items-center rounded-lg bg-primary-soft text-[17px] text-primary"
          >
            {glyphFor(category.icon, category.name)}
          </span>

          <p className="text-cardtitle text-text">{category.name}</p>

          <p className="mt-1 text-caption text-text3">
            {category.technicianCount === 0
              ? "No technicians yet"
              : `${category.technicianCount} technician${category.technicianCount === 1 ? "" : "s"}`}
          </p>

          {category.fromPrice !== null && (
            <p className="mt-3 text-body2 text-text2">
              from <Money value={category.fromPrice} className="text-text" />
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-card border border-line bg-surface p-[18px] shadow-sh2"
        >
          <Skeleton className="mb-3.5 size-10 rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <Skeleton className="mt-3 h-3.5 w-1/3" />
        </div>
      ))}
    </div>
  );
}
