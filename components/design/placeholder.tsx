import { cn } from "@/lib/utils";

/**
 * Intentional image placeholder — a 45° striped band with a mono caption
 * naming what belongs there. The handoff ships no assets on purpose:
 * "service photo 4:3", "technician at work — 16:9 photo".
 *
 * Use this wherever real photography is expected but absent, rather than a
 * grey box or a stock image.
 */
export function ImagePlaceholder({
  caption,
  className,
}: {
  caption: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={caption}
      className={cn(
        "fx-placeholder grid place-items-center rounded-card",
        className,
      )}
    >
      <span className="px-4 text-center font-mono text-[11px] text-text3">
        {caption}
      </span>
    </div>
  );
}
