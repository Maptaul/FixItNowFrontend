"use client";

import { CalendarClockIcon, CheckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatTime, slotToIso, toDateInputValue } from "@/lib/format";
import { IAvailabilitySlot } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Availability picker.
 *
 * Published slots are grouped by day; taken ones stay visible but disabled so
 * the customer can see how busy the technician is rather than wondering where
 * a slot went. When a technician hasn't published anything (or every slot is
 * taken) the customer can still propose their own date and time, which is what
 * the API does when `slotId` is omitted.
 *
 * Emits two hidden inputs — `slotId` and `scheduledAt` — read by the form.
 */
export function SlotPicker({
  slots,
  error,
}: {
  slots: IAvailabilitySlot[];
  error?: string;
}) {
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");

  // Group by calendar day so the picker reads like a diary.
  const days = useMemo(() => {
    const grouped = new Map<string, IAvailabilitySlot[]>();

    for (const slot of slots) {
      const key = toDateInputValue(slot.date);
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    }

    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  const scheduledAt = selectedSlot
    ? slotToIso(selectedSlot.date, selectedSlot.startTime)
    : customDate && customTime
      ? new Date(`${customDate}T${customTime}`).toISOString()
      : "";

  const hasOpenSlot = slots.some((slot) => !slot.isBooked);

  // `min` stops the browser offering a date the API would reject anyway.
  const today = toDateInputValue(new Date());

  return (
    <div className="space-y-4">
      <input type="hidden" name="slotId" value={selectedSlotId} />
      <input type="hidden" name="scheduledAt" value={scheduledAt} />

      {days.length > 0 && (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <CalendarClockIcon className="size-4" />
            Published availability
          </p>

          {days.map(([date, daySlots]) => (
            <div key={date} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {formatDate(date)}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {daySlots.map((slot) => {
                  const isSelected = slot.id === selectedSlotId;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={slot.isBooked}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedSlotId(isSelected ? "" : slot.id);
                        setCustomDate("");
                        setCustomTime("");
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                        slot.isBooked &&
                          "cursor-not-allowed bg-muted text-muted-foreground line-through opacity-60",
                        !slot.isBooked &&
                          !isSelected &&
                          "hover:border-primary hover:bg-primary/10",
                        isSelected &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                      title={slot.isBooked ? "Already booked" : "Available"}
                    >
                      {isSelected && <CheckIcon className="size-3" />}
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!hasOpenSlot && (
            <p className="text-xs text-muted-foreground">
              Every published slot is taken — propose your own time below.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <p className="text-sm font-medium">
          {days.length > 0 ? "…or propose another time" : "Choose a date and time"}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="customDate" className="text-xs">
              Date
            </Label>
            <Input
              id="customDate"
              type="date"
              min={today}
              value={customDate}
              onChange={(event) => {
                setCustomDate(event.target.value);
                setSelectedSlotId("");
              }}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="customTime" className="text-xs">
              Time
            </Label>
            <Input
              id="customTime"
              type="time"
              value={customTime}
              onChange={(event) => {
                setCustomTime(event.target.value);
                setSelectedSlotId("");
              }}
            />
          </div>
        </div>
      </div>

      {scheduledAt && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Requesting{" "}
          <strong>
            {formatDate(scheduledAt)} at{" "}
            {selectedSlot ? formatTime(selectedSlot.startTime) : formatTime(customTime)}
          </strong>
        </p>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
