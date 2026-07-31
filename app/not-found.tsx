import { MapPinOffIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <MapPinOffIcon className="size-7 text-muted-foreground" />
      </span>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="max-w-md text-muted-foreground text-pretty">
          That page doesn&apos;t exist — the technician or service may have been
          removed.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    </div>
  );
}
