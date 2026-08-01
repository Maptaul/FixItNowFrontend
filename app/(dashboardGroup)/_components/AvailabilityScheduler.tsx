"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { MonthGrid } from "@/components/design/month-grid";
import { Switch } from "@/components/design/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTime, toDateInputValue } from "@/lib/format";
import { IAvailabilitySlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { setAvailability } from "../_actions/technicianActions";

type Block = {
  key: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_BLOCK = { startTime: "09:00", endTime: "17:00" };

const toBlock = (slot: IAvailabilitySlot): Block => ({
  key: slot.id,
  date: toDateInputValue(slot.date),
  startTime: slot.startTime,
  endTime: slot.endTime,
  isBooked: slot.isBooked,
});

const startOfWeek = (date: Date): Date => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const toKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/**
 * Weekly scheduler — design handoff § Calendar / availability › Weekly
 * scheduler, and § Technician › Availability.
 *
 * One row per day: switch, 88px day name, then time-block pills in mono 12px
 * on --surface-2 at r9, plus a "+ Add block" link. A day that's off drops to
 * 55% opacity with a --surface-2 fill and its blocks are replaced by
 * placeholder text.
 *
 * TWO THINGS THE HANDOFF ASSUMES THAT THIS API DOESN'T HAVE:
 *
 *   · **Recurring weekly rules.** The API stores *dated* slots
 *     (`{ date, startTime, endTime }`), not a weekly pattern. So the grid
 *     shows one concrete week at a time and you page through weeks — the
 *     visual is the handoff's, the data stays honest.
 *
 *   · **Blocked dates with reasons.** There's no blocked-date model, so the
 *     right rail shows the month grid and legend only. Removing a day's
 *     blocks is how you make yourself unavailable.
 *
 * `PUT /api/technician/availability` replaces every *unbooked* slot in one
 * shot, so Save always posts the complete set across all weeks — not just the
 * week on screen. Booked slots are rendered locked and never sent.
 */
export function AvailabilityScheduler({
  initialSlots,
}: {
  initialSlots: IAvailabilitySlot[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [blocks, setBlocks] = useState<Block[]>(initialSlots.map(toBlock));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState(DEFAULT_BLOCK);

  const open = blocks.filter((block) => !block.isBooked);

  // Order-insensitive fingerprint, so Save only lights up on a real change.
  const fingerprint = (list: Block[]) =>
    list
      .map((block) => `${block.date} ${block.startTime} ${block.endTime}`)
      .sort()
      .join("|");

  const isDirty =
    fingerprint(open) !==
    fingerprint(initialSlots.filter((slot) => !slot.isBooked).map(toBlock));

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        return date;
      }),
    [weekStart],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Block[]>();
    for (const block of blocks) {
      map.set(block.date, [...(map.get(block.date) ?? []), block]);
    }
    return map;
  }, [blocks]);

  const openDates = useMemo(
    () => new Set(open.map((block) => block.date)),
    [open],
  );

  const addBlock = (date: string) => {
    if (draft.endTime <= draft.startTime) {
      toast.error("End time must be after start time.");
      return;
    }

    if (
      blocks.some(
        (block) => block.date === date && block.startTime === draft.startTime,
      )
    ) {
      toast.error("You already have a block starting then on that day.");
      return;
    }

    setBlocks((current) => [
      ...current,
      {
        key: `${date}-${draft.startTime}-${Date.now()}`,
        date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        isBooked: false,
      },
    ]);
    setAdding(null);
    setDraft(DEFAULT_BLOCK);
  };

  const removeBlock = (key: string) => {
    setBlocks((current) => current.filter((block) => block.key !== key));
  };

  /** Turning a day off clears its open blocks; on gives it a default day. */
  const toggleDay = (date: string, next: boolean) => {
    if (next) {
      addDefaultDay(date);
    } else {
      setBlocks((current) =>
        current.filter((block) => block.date !== date || block.isBooked),
      );
    }
  };

  const addDefaultDay = (date: string) => {
    setBlocks((current) => [
      ...current,
      {
        key: `${date}-default-${Date.now()}`,
        date,
        ...DEFAULT_BLOCK,
        isBooked: false,
      },
    ]);
  };

  const save = () => {
    startTransition(async () => {
      const result = await setAvailability(
        open.map(({ date, startTime, endTime }) => ({
          date,
          startTime,
          endTime,
        })),
      );

      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result?.message ?? "Could not save your availability.");
      }
    });
  };

  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous week"
            onClick={() => {
              const previous = new Date(weekStart);
              previous.setDate(previous.getDate() - 7);
              setWeekStart(previous);
            }}
          >
            <ChevronLeftIcon />
          </Button>

          <span className="min-w-40 text-center text-cardtitle text-text">
            {weekLabel}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next week"
            onClick={() => {
              const next = new Date(weekStart);
              next.setDate(next.getDate() + 7);
              setWeekStart(next);
            }}
          >
            <ChevronRightIcon />
          </Button>
        </div>

        <Button onClick={save} disabled={isPending || !isDirty}>
          <SaveIcon />
          {isPending ? "Saving…" : isDirty ? "Save schedule" : "Saved"}
        </Button>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1fr_340px]">
        {/* Weekly scheduler */}
        <section className="rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <h2 className="mb-[18px] text-panel text-text">Weekly schedule</h2>

          <div className="flex flex-col gap-2.5">
            {weekDays.map((date) => {
              const key = toKey(date);
              const dayBlocks = (byDate.get(key) ?? []).sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
              );
              const isOn = dayBlocks.length > 0;
              const isAdding = adding === key;

              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-wrap items-center gap-4 rounded-row border border-line p-[13px_14px] transition-opacity",
                    !isOn && "bg-surface2 opacity-55",
                  )}
                >
                  <Switch
                    checked={isOn}
                    onCheckedChange={(next) => toggleDay(key, next)}
                    label={`${DAY_NAMES[date.getDay()]} availability`}
                  />

                  <span className="w-[88px] text-body2 font-semibold text-text">
                    {DAY_NAMES[date.getDay()]}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    {!isOn ? (
                      <span className="text-caption text-text3">
                        Not working this day
                      </span>
                    ) : (
                      dayBlocks.map((block) => (
                        <span
                          key={block.key}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-[9px] border px-[11px] py-[5px] font-mono text-[12px] font-medium",
                            block.isBooked
                              ? "border-primary-border bg-primary-soft text-primary"
                              : "border-line bg-surface2 text-text",
                          )}
                        >
                          {block.isBooked && (
                            <LockIcon aria-hidden="true" className="size-3" />
                          )}
                          {formatTime(block.startTime)}–
                          {formatTime(block.endTime)}
                          {!block.isBooked && (
                            <button
                              type="button"
                              aria-label={`Remove ${block.startTime} block`}
                              onClick={() => removeBlock(block.key)}
                              className="rounded transition-colors hover:text-red"
                            >
                              <XIcon className="size-3" />
                            </button>
                          )}
                        </span>
                      ))
                    )}

                    {isAdding ? (
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Input
                          type="time"
                          value={draft.startTime}
                          aria-label="Block start time"
                          onChange={(event) =>
                            setDraft((d) => ({
                              ...d,
                              startTime: event.target.value,
                            }))
                          }
                          className="h-8 w-28 text-[12px]"
                        />
                        <span className="text-text3">–</span>
                        <Input
                          type="time"
                          value={draft.endTime}
                          aria-label="Block end time"
                          onChange={(event) =>
                            setDraft((d) => ({
                              ...d,
                              endTime: event.target.value,
                            }))
                          }
                          className="h-8 w-28 text-[12px]"
                        />
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => addBlock(key)}
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setAdding(null)}
                        >
                          Cancel
                        </Button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(key);
                          setDraft(DEFAULT_BLOCK);
                        }}
                        className="px-1 py-[5px] text-[12px] font-semibold text-primary hover:text-primary-hover"
                      >
                        + Add block
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-caption text-text3">
            Booked blocks are locked — cancel the booking to free the slot.
            Saving replaces every open block across all weeks.
          </p>
        </section>

        {/* Month overview */}
        <aside className="h-fit rounded-panel border border-line bg-surface p-[22px] shadow-sh2">
          <h2 className="mb-4 text-panel text-text">Month at a glance</h2>

          <MonthGrid
            openDates={openDates}
            selected={toKey(weekStart)}
            onSelect={(value) =>
              setWeekStart(startOfWeek(new Date(`${value}T00:00:00`)))
            }
          />

          <p className="mt-4 text-caption text-text3">
            Pick a day to jump the scheduler to that week.
          </p>
        </aside>
      </div>
    </div>
  );
}
