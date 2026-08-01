import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Empty state — design handoff § UI states.
 *
 * 52px r16 --surface-2 icon tile → 16px/700 title → 13.5px body at 1.6 capped
 * at 330px → one button.
 *
 * The body always names what is missing **and** what to do about it. No
 * shrugging illustrations, no "Oops!", no dead ends.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-13 place-items-center rounded-card bg-surface2">
        <Icon aria-hidden="true" className="size-6 text-text3" />
      </span>

      <div className="space-y-1.5">
        <p className="text-panel text-text">{title}</p>
        <p className="mx-auto max-w-[330px] text-body2 text-text2">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}
