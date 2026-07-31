"use client";

import { CalendarPlusIcon, LockIcon, SaveIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatTime, toDateInputValue } from "@/lib/format";
import { IAvailabilitySlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { setAvailability } from "../_actions/technicianActions";

type DraftSlot = {
  key: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

const toDraft = (slot: IAvailabilitySlot): DraftSlot => ({
  key: slot.id,
  date: toDateInputValue(slot.date),
  startTime: slot.startTime,
  endTime: slot.endTime,
  isBooked: slot.isBooked,
});

/**
 * Working-hours scheduler.
 *
 * The API replaces a technician's *open* availability wholesale on save and
 * leaves booked slots alone, so this editor mirrors that: booked slots are
 * shown but locked, and only the open ones are sent back. Edits are staged
 * locally until Save, which means adding five slots is one request, not five.
 */
export function AvailabilityScheduler({
  initialSlots,
}: {
  initialSlots: IAvailabilitySlot[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<DraftSlot[]>(initialSlots.map(toDraft));

  const today = toDateInputValue(new Date());
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const openSlots = slots.filter((slot) => !slot.isBooked);

  // Order-insensitive fingerprint, so Save only lights up on a real change.
  const fingerprint = (list: Omit<DraftSlot, "key" | "isBooked">[]) =>
    list
      .map((slot) => `${slot.date} ${slot.startTime} ${slot.endTime}`)
      .sort()
      .join("|");

  const isDirty =
    fingerprint(openSlots) !==
    fingerprint(initialSlots.filter((slot) => !slot.isBooked).map(toDraft));

  const addSlot = () => {
    if (!date || !startTime || !endTime) {
      toast.error("Pick a date, a start time and an end time.");
      return;
    }

    if (endTime <= startTime) {
      toast.error("End time must be after start time.");
      return;
    }

    const clash = slots.some(
      (slot) => slot.date === date && slot.startTime === startTime,
    );

    if (clash) {
      toast.error("You already have a slot starting then.");
      return;
    }

    setSlots((current) => [
      ...current,
      { key: `${date}-${startTime}-${Date.now()}`, date, startTime, endTime, isBooked: false },
    ]);
  };

  const removeSlot = (key: string) => {
    setSlots((current) => current.filter((slot) => slot.key !== key));
  };

  const save = () => {
    startTransition(async () => {
      const result = await setAvailability(
        openSlots.map(({ date, startTime, endTime }) => ({
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

  // Group for display so the list reads day by day.
  const byDate = slots.reduce<Record<string, DraftSlot[]>>((acc, slot) => {
    acc[slot.date] = [...(acc[slot.date] ?? []), slot];
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <p className="flex items-center gap-1.5 font-medium">
            <CalendarPlusIcon className="size-4" />
            Add a working block
          </p>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="slot-date">Date</Label>
              <Input
                id="slot-date"
                type="date"
                min={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="slot-start">From</Label>
              <Input
                id="slot-start"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="slot-end">To</Label>
              <Input
                id="slot-end"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>

            <Button type="button" variant="outline" onClick={addSlot}>
              Add slot
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Your calendar</h2>
            <p className="text-sm text-muted-foreground">
              {openSlots.length} open slot{openSlots.length === 1 ? "" : "s"}
              {slots.length - openSlots.length > 0 &&
                `, ${slots.length - openSlots.length} booked`}
            </p>
          </div>

          <Button onClick={save} disabled={isPending || !isDirty}>
            <SaveIcon />
            {isPending ? "Saving…" : isDirty ? "Save availability" : "Saved"}
          </Button>
        </div>

        {dates.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No availability published yet. Add a block above, then save — that&apos;s
            what customers pick from when they book.
          </p>
        ) : (
          <div className="space-y-3">
            {dates.map((day) => (
              <div key={day} className="rounded-xl border p-4">
                <p className="mb-2 text-sm font-medium">{formatDate(day)}</p>

                <div className="flex flex-wrap gap-2">
                  {byDate[day]
                    .slice()
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <span
                        key={slot.key}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                          slot.isBooked
                            ? "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                            : "bg-muted/50",
                        )}
                      >
                        {slot.isBooked && <LockIcon className="size-3" />}
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}

                        {slot.isBooked ? (
                          <span className="text-[10px] uppercase">booked</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeSlot(slot.key)}
                            aria-label={`Remove ${slot.startTime} slot on ${day}`}
                            className="ml-0.5 rounded transition-colors hover:text-destructive"
                          >
                            <XIcon className="size-3.5" />
                          </button>
                        )}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
