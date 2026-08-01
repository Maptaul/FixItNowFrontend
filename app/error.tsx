"use client";

import { RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * 500 — design handoff § UI states › Full-page.
 *
 * The code renders at 52px mono/700, the error reference is mono so it can be
 * read out over the phone, and the copy says what is *safe* rather than
 * apologising: a render failure never loses a booking, because bookings live
 * on the server.
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-mono text-[52px] leading-none font-bold text-red">
        500
      </p>

      <div className="space-y-2">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-text">
          Something broke on our side
        </h1>
        <p className="mx-auto max-w-[380px] text-body2 text-text2">
          Your bookings and payments are safe — nothing here touches them.
          Trying again usually clears it.
        </p>

        {error.digest && (
          <p className="pt-1 font-mono text-[12px] text-text3">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RotateCcwIcon />
          Try again
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
