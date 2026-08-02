"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
export function LiveRefresh({ enabled = true }: { enabled?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);

    return () => {
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, [enabled, router]);

  return null;
}
