"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { ICategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const ANY = "any";

/**
 * Filter card — design handoff § Search results / Technicians.
 *
 * Sticky 264px card: 1px --border, r18, --surface, --sh2, 20px padding.
 * Header is 14px/700 with a plain-text primary "Reset"; each section label is
 * 12.5px/700 with a 10px gap, and sections are 20px apart.
 *
 * All state lives in the URL, so results are shareable, survive a refresh and
 * render on the server. Typing is debounced; chips and the slider apply on
 * release.
 *
 * The handoff also draws Availability chips and boolean filters (Emergency
 * available / Speaks English / Brings own parts). The API supports none of
 * those, so the card carries the filters that actually work — a control that
 * changes nothing is worse than no control.
 */

/**
 * Upper bound of the price slider. The max handle sitting here means "no
 * upper limit", so a service priced above it is still reachable.
 */
const PRICE_CEILING = 1000;

const RATING_OPTIONS = [
  { value: "4", label: "4.0 & above" },
  { value: "3", label: "3.0 & above" },
  { value: ANY, label: "Any rating" },
];

/** 18×18 r5 box — filled primary with a white tick when on. */
function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-[18px] shrink-0 place-items-center rounded-[5px] text-[10px] font-extrabold text-white",
        checked ? "bg-primary" : "border border-line-strong",
      )}
    >
      {checked && "✓"}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-[12.5px] font-bold text-text">{children}</p>;
}

export function ServiceFilters({
  categories,
  showPrice = true,
}: {
  categories: ICategory[];
  showPrice?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Text inputs are controlled locally, then pushed to the URL on a delay.
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  // Slider is local while dragging; the URL updates on release.
  const [minPrice, setMinPrice] = useState(
    Number(searchParams.get("minPrice") ?? 0),
  );
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("maxPrice") ?? PRICE_CEILING),
  );

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === ANY) params.delete(key);
      else params.set(key, value);
    }

    // Any filter change invalidates the current page number.
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const commitPrice = (low: number, high: number) => {
    pushParams({
      minPrice: low > 0 ? String(low) : "",
      // At the ceiling the filter is simply dropped — "no upper limit".
      maxPrice: high < PRICE_CEILING ? String(high) : "",
    });
  };

  // Debounce the free-text fields so we don't navigate on every keystroke.
  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    const currentLocation = searchParams.get("location") ?? "";

    if (search === currentSearch && location === currentLocation) return;

    const timer = setTimeout(() => pushParams({ search, location }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, location]);

  const hasFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page",
  );

  const activeCategory = searchParams.get("categoryId") ?? ANY;
  const activeRating = searchParams.get("minRating") ?? ANY;

  const reset = () => {
    setSearch("");
    setLocation("");
    setMinPrice(0);
    setMaxPrice(PRICE_CEILING);
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  // Percentages drive the fill span and both handle positions.
  const lowPct = (minPrice / PRICE_CEILING) * 100;
  const highPct = (maxPrice / PRICE_CEILING) * 100;

  return (
    <aside
      data-pending={isPending ? "" : undefined}
      className="h-fit rounded-panel border border-line bg-surface p-5 shadow-sh2 transition-opacity lg:sticky lg:top-[86px] data-pending:opacity-70"
    >
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <span className="text-[14px] font-bold text-text">Filters</span>

        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="text-[12.5px] font-semibold text-primary hover:text-primary-hover"
          >
            Reset
          </button>
        )}
      </div>

      {/* Keyword */}
      <SectionLabel>Keyword</SectionLabel>
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Leaking tap, rewiring…"
        aria-label="Search by keyword"
        className="mb-5 h-9 text-body2"
      />

      {/* Category — chips, matching the handoff's availability row */}
      <SectionLabel>Category</SectionLabel>
      <div className="mb-5 flex flex-wrap gap-[7px]">
        {[{ id: ANY, name: "All" }, ...categories.slice(0, 7)].map(
          (category) => {
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => pushParams({ categoryId: category.id })}
                className={cn(
                  "rounded-full px-[11px] py-[5px] text-[12px] font-semibold transition-colors duration-120",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-line bg-surface2 text-text2 hover:text-text",
                )}
              >
                {category.name}
              </button>
            );
          },
        )}
      </div>

      {/* Location */}
      <SectionLabel>Location</SectionLabel>
      <Input
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="City or area"
        aria-label="Filter by location"
        className="mb-5 h-9 text-body2"
      />

      {/* Price — dual-handle slider */}
      {showPrice && (
        <>
          <SectionLabel>Price range</SectionLabel>

          <div className="relative mb-2 h-1.5">
            <div className="absolute inset-0 rounded-full bg-surface3" />
            <div
              className="absolute top-0 bottom-0 rounded-full bg-primary"
              style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
            />

            {/*
             * Two native range inputs stacked over the track: keyboard and
             * screen-reader support come free, and only the thumbs take
             * pointer events so both handles stay grabbable.
             */}
            <input
              type="range"
              min={0}
              max={PRICE_CEILING}
              step={10}
              value={minPrice}
              aria-label="Minimum price"
              onChange={(event) =>
                setMinPrice(Math.min(Number(event.target.value), maxPrice - 10))
              }
              onPointerUp={() => commitPrice(minPrice, maxPrice)}
              onKeyUp={() => commitPrice(minPrice, maxPrice)}
              className="fx-range absolute inset-x-0 -top-[5px] h-4 w-full"
            />
            <input
              type="range"
              min={0}
              max={PRICE_CEILING}
              step={10}
              value={maxPrice}
              aria-label="Maximum price"
              onChange={(event) =>
                setMaxPrice(Math.max(Number(event.target.value), minPrice + 10))
              }
              onPointerUp={() => commitPrice(minPrice, maxPrice)}
              onKeyUp={() => commitPrice(minPrice, maxPrice)}
              className="fx-range absolute inset-x-0 -top-[5px] h-4 w-full"
            />
          </div>

          <div className="mb-5 flex justify-between font-mono text-[11.5px] text-text2">
            <span>${minPrice}</span>
            <span>
              {maxPrice >= PRICE_CEILING
                ? `$${PRICE_CEILING}+`
                : `$${maxPrice}`}
            </span>
          </div>
        </>
      )}

      {/* Rating — single choice, so radios wearing the handoff's box */}
      <fieldset>
        <legend className="mb-2.5 text-[12.5px] font-bold text-text">
          Rating
        </legend>

        <div className="flex flex-col gap-[9px]">
          {RATING_OPTIONS.map((option) => {
            const isChecked = activeRating === option.value;

            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-[9px] text-[13px] text-text2 hover:text-text"
              >
                <input
                  type="radio"
                  name="minRating"
                  checked={isChecked}
                  onChange={() => pushParams({ minRating: option.value })}
                  className="sr-only"
                />
                <CheckBox checked={isChecked} />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    </aside>
  );
}
