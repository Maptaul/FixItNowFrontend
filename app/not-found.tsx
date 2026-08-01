import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-mono text-[52px] leading-none font-bold text-text3">
        404
      </p>

      <div className="space-y-2">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-text">
          This page took a different job
        </h1>
        <p className="mx-auto max-w-[380px] text-body2 text-text2">
          The link is wrong, or the technician or service it pointed at has been
          removed. Everything else is where you left it.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/services">Browse services</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
