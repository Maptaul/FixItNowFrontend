import { WrenchIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <WrenchIcon className="size-4" />
      </span>
      <span className="text-base tracking-tight">
        Fix<span className="text-primary">It</span>Now
      </span>
    </Link>
  );
}
