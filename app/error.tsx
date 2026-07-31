"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary — catches anything a page or server component throws.
 * Shows a recoverable message rather than a stack trace.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where a real logger (Sentry etc.) would go.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <TriangleAlertIcon className="size-7 text-destructive" />
      </span>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted-foreground text-pretty">
          We hit an unexpected error loading this page. Trying again usually
          sorts it — if it doesn&apos;t, head back home.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcwIcon />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
