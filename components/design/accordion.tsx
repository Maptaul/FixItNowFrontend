import { cn } from "@/lib/utils";

/**
 * FAQ accordion — design handoff § Customer › Help center.
 *
 * First item open, `+` / `−` signs, closed rows in --text-2.
 *
 * Built on native `<details>` / `<summary>`: keyboard support, screen-reader
 * semantics and open/close state all come free from the platform, and the
 * whole thing ships zero JavaScript. The `+` flips to `−` via `[open]` in
 * CSS.
 */
export type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

export function Faq({
  items,
  className,
}: {
  items: FaqItem[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-line rounded-panel border border-line bg-surface shadow-sh2", className)}>
      {items.map((item, index) => (
        <details
          key={item.question}
          // The handoff opens the first row so the pattern is self-evident.
          open={index === 0}
          className="group px-5 py-4 open:pb-5"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-body font-semibold text-text2 transition-colors duration-120 group-open:text-text hover:text-text [&::-webkit-details-marker]:hidden">
            {item.question}

            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 font-mono text-[17px] leading-none text-text3 group-open:text-primary"
            >
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>

          <div className="mt-2.5 max-w-2xl text-body2 text-text2">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
