import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/LogoFinal.png";

/** 32px r10 primary tile + wordmark at 17px/800/-0.03em. */
export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex-2 items-center gap-2.5", className)}>
      <Image
        src={logo}
        alt="FixItNow Logo"
        width={50}
        height={50}
        unoptimized
        className="h-10 w-auto rounded-md object-contain"
      />
    </Link>
  );
}
