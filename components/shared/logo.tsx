import Link from "next/link";
import { cn } from "@/lib/utils";

/** 32px r10 primary tile + wordmark at 17px/800/-0.03em. */
export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-md bg-primary text-[15px] font-extrabold text-primary-foreground">
        F
      </span>
      <span className="text-[17px] font-extrabold tracking-[-0.03em] text-text">
        FixItNow
      </span>
    </Link>
  );
}
