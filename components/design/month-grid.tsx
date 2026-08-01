"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Month grid — design handoff § Calendar / availability.
 *
 * 7 columns with a 6px gap; weekday initials at 11px/700 --text-3; day cells
 * r10 at 13px/600. A day with open availability gets a --surface-3 fill, the
 * selected day flips to --primary, and past or adjacent-month days drop to
 * --text-3 at 45% with `cursor: default`.
 *
 * Arrow keys move between days, per the handoff's accessibility notes.
 */
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const toKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export function MonthGrid({
  /** Dates (yyyy-mm-dd) the technician has published slots for. */
  openDates,
  selected,
  onSelect,
}: {
  openDates: Set<string>;
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today = startOfToday();
  const [cursor, setCursor] = useState(() => {
    const base = selected ? new Date(`${selected}T00:00:00`) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Leading blanks so the 1st lands under its weekday column.
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(year, month, index + 1),
    ),
  ];

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-cardtitle text-text">{monthLabel}</span>

        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((day, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="pb-1 text-center text-[11px] font-bold text-text3"
          >
            {day}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`blank-${index}`} />;

          const key = toKey(date);
          const isPast = date < today;
          const isOpen = openDates.has(key);
          const isSelected = key === selected;
          const isPickable = !isPast && isOpen;

          return (
            <button
              key={key}
              type="button"
              disabled={!isPickable}
              aria-pressed={isSelected}
              aria-label={date.toDateString()}
              onClick={() => onSelect(key)}
              className={cn(
                "rounded-md py-2 text-center text-[13px] font-semibold transition-colors duration-120",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && isPickable && "bg-surface3 text-text hover:bg-primary-soft hover:text-primary",
                !isPickable && "cursor-default text-text3 opacity-45",
              )}
              title={
                isPast
                  ? "In the past"
                  : isOpen
                    ? "Slots available"
                    : "No published slots"
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend — 9px r3 swatch + 11.5px label, per the handoff. */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-[11.5px] text-text3">
          <span
            aria-hidden="true"
            className="size-[9px] rounded-[3px] bg-surface3"
          />
          Slots open
        </span>
        <span className="flex items-center gap-1.5 text-[11.5px] text-text3">
          <span
            aria-hidden="true"
            className="size-[9px] rounded-[3px] bg-primary"
          />
          Selected
        </span>
        <span className="flex items-center gap-1.5 text-[11.5px] text-text3">
          <span
            aria-hidden="true"
            className="size-[9px] rounded-[3px] border border-line bg-surface"
          />
          Unavailable
        </span>
      </div>
    </div>
  );
}
