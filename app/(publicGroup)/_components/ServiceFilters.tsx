"use client";

import { FilterXIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory } from "@/lib/types";

const ANY = "any";

/**
 * Filter panel for the service and technician listings.
 *
 * All state lives in the URL, so results are shareable, survive a refresh and
 * are rendered on the server. Typing is debounced; dropdowns apply at once.
 */
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
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

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

  // Debounce the free-text fields so we don't navigate on every keystroke.
  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    const currentLocation = searchParams.get("location") ?? "";
    const currentMin = searchParams.get("minPrice") ?? "";
    const currentMax = searchParams.get("maxPrice") ?? "";

    if (
      search === currentSearch &&
      location === currentLocation &&
      minPrice === currentMin &&
      maxPrice === currentMax
    ) {
      return;
    }

    const timer = setTimeout(
      () => pushParams({ search, location, minPrice, maxPrice }),
      400,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, location, minPrice, maxPrice]);

  const hasFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page",
  );

  return (
    <aside
      className="space-y-5 rounded-xl border p-4 lg:sticky lg:top-20"
      data-pending={isPending ? "" : undefined}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setSearch("");
              setLocation("");
              setMinPrice("");
              setMaxPrice("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
          >
            <FilterXIcon />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="search">Keyword</Label>
        <Input
          id="search"
          name="search"
          type="search"
          placeholder="Leaking tap, rewiring…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          value={searchParams.get("categoryId") ?? ANY}
          onValueChange={(value) => pushParams({ categoryId: value })}
        >
          <SelectTrigger id="categoryId" className="w-full">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="City or area"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>

      {showPrice && (
        <div className="grid gap-1.5">
          <Label>Price range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="Min"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="Max"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="minRating">Minimum rating</Label>
        <Select
          value={searchParams.get("minRating") ?? ANY}
          onValueChange={(value) => pushParams({ minRating: value })}
        >
          <SelectTrigger id="minRating" className="w-full">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any rating</SelectItem>
            {[4, 3, 2, 1].map((rating) => (
              <SelectItem key={rating} value={String(rating)}>
                {rating}★ &amp; up
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
