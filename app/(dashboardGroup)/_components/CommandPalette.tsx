"use client";

import { Loader2Icon, SearchIcon, SearchXIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { dashboardSearch, SearchGroup, SearchHit } from "../_actions/searchActions";

/**
 * ⌘K search — design handoff § Dashboard shell.
 *
 * A 280px affordance in the header with a mono key cap, opening a palette
 * that searches everything the signed-in role can read. See
 * `dashboardSearch` for what each role is allowed to search.
 *
 * Keyboard throughout: ⌘K / Ctrl+K opens, ↑ ↓ move, Enter opens the
 * highlighted hit, Esc closes (the Dialog handles that and returns focus).
 */
const GROUP_ORDER: SearchGroup[] = [
  "Bookings",
  "Services",
  "Technicians",
  "Users",
];

export function CommandPalette({ role }: { role: IRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Mac shows ⌘, everything else Ctrl. Resolved after mount so the server and
  // client render the same markup.
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  // Global shortcut.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounce so a fast typist doesn't fan out a request per keystroke.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (value: string) => {
    setQuery(value);
    setActive(0);

    if (timer.current) clearTimeout(timer.current);

    if (value.trim().length < 2) {
      setHits([]);
      return;
    }

    timer.current = setTimeout(() => {
      startTransition(async () => {
        setHits(await dashboardSearch(value, role));
      });
    }, 250);
  };

  const go = (hit: SearchHit) => {
    setOpen(false);
    setQuery("");
    setHits([]);
    router.push(hit.href);
  };

  const ordered = GROUP_ORDER.flatMap((group) =>
    hits.filter((hit) => hit.group === group),
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (ordered.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % ordered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + ordered.length) % ordered.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = ordered[active];
      if (hit) go(hit);
    }
  };

  const keyCap = isMac ? "⌘K" : "Ctrl K";

  return (
    <>
      {/* 280px affordance with the mono key cap. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-[280px] items-center gap-2.5 rounded-md border border-line bg-surface2/60 px-3 text-left transition-colors duration-120 hover:bg-surface2 lg:flex"
      >
        <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-text3" />
        <span className="flex-1 truncate text-body2 text-text3">
          Search bookings, technicians
        </span>
        <kbd className="shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text3">
          {keyCap}
        </kbd>
      </button>

      {/* Compact trigger below lg. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="grid size-9 place-items-center rounded-md text-text2 transition-colors duration-120 hover:bg-surface2 hover:text-text lg:hidden"
      >
        <SearchIcon className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-24 max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search your bookings, services and technicians.
          </DialogDescription>

          <div className="flex items-center gap-2.5 border-b border-line px-4">
            <SearchIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-text3"
            />
            <Input
              autoFocus
              value={query}
              onChange={(event) => runSearch(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search bookings, services, technicians…"
              aria-label="Search"
              className="h-12 border-0 bg-transparent px-0 text-body focus-visible:shadow-none"
            />
            {isPending && (
              <Loader2Icon
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin text-text3"
              />
            )}
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-6 text-center text-body2 text-text3">
                Type at least two characters.
              </p>
            ) : ordered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <SearchXIcon
                  aria-hidden="true"
                  className="size-5 text-text3"
                />
                <p className="text-body2 font-semibold text-text">
                  Nothing matches &ldquo;{query.trim()}&rdquo;
                </p>
                <p className="max-w-xs text-caption text-text2">
                  Search covers your bookings, plus every service and
                  technician on the platform.
                </p>
              </div>
            ) : (
              GROUP_ORDER.map((group) => {
                const rows = hits.filter((hit) => hit.group === group);
                if (rows.length === 0) return null;

                return (
                  <div key={group} className="mb-1">
                    <p className="px-3 py-1.5 text-th text-text3 uppercase">
                      {group}
                    </p>

                    {rows.map((hit) => {
                      const index = ordered.indexOf(hit);
                      const isActive = index === active;

                      return (
                        <button
                          key={hit.id}
                          type="button"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(hit)}
                          className={cn(
                            "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors duration-120",
                            isActive ? "bg-primary-soft" : "hover:bg-surface2",
                          )}
                        >
                          <span
                            className={cn(
                              "truncate text-body2 font-semibold",
                              isActive ? "text-primary" : "text-text",
                            )}
                          >
                            {hit.title}
                          </span>
                          <span className="truncate text-caption text-text3">
                            {hit.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
