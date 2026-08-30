import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  /** Big left-aligned index number, e.g. "02" */
  number: string;
  /** Section title, uppercase. */
  title: string;
  /** Right-side "page X of Y" counter or annotation. */
  counter?: string;
  /** Optional monospace annotation under the number. */
  note?: string;
  /** Optional kicker on top of the title (mono). */
  kicker?: string;
  className?: string;
}

/**
 * Editorial section header.
 *
 * Used between major page sections. The layout is:
 *
 *   ┌──────┬───────────────────────────────────────────────┬──────────┐
 *   │      │  kicker · SECTION NAME                        │          │
 *   │  02  │  ──────────────────────────────────────────  │  02/03   │
 *   │      │  Long-form description of the section         │          │
 *   └──────┴───────────────────────────────────────────────┴──────────┘
 */
export function SectionHead({ number, title, counter, note, kicker, className }: Props) {
  return (
    <header className={cn("grid grid-cols-[auto_1fr_auto] items-end gap-x-6 sm:gap-x-10", className)}>
      <div className="self-end pb-1">
        <p
          className="font-display leading-none text-parchment-100"
          style={{ fontSize: "clamp(3.5rem, 6.4vw, 5.5rem)" }}
          aria-hidden
        >
          {number}
        </p>
        {note && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
            {note}
          </p>
        )}
      </div>

      <div className="min-w-0 self-end">
        {kicker && (
          <p className="label-mono mb-2 flex items-center gap-2">
            <span className="h-px w-6 bg-brass/70" />
            {kicker}
          </p>
        )}
        <h2
          className="font-heading font-bold uppercase leading-[0.92] tracking-tight text-parchment-100"
          style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.6rem)" }}
        >
          {title}
        </h2>
        <div className="mt-4 h-px w-full bg-parchment-500/15" />
      </div>

      {counter && (
        <div className="hidden self-end pb-2 text-right sm:block">
          <p className="label-mono">Section</p>
          <p className="mt-1 font-mono text-[14px] tabular text-parchment-300">{counter}</p>
        </div>
      )}
    </header>
  );
}
