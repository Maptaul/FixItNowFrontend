import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/LogoFinal.png";

/**
 * Brand mark. Renders its own anchor, so never wrap it in another `<Link>` —
 * nested anchors are invalid HTML and break hydration.
 */
export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    // `flex`, not `flex-2`: the latter is a flex-grow utility and never sets
    // `display: flex`, so the alignment and gap below would do nothing.
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
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
