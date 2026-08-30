"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import type { SearchState } from "@/hooks/use-highlight-search";
import { cn, platformModifier } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";

interface Props {
  search: SearchState;
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Wraps the field — used as the origin point for the blue trace streak. */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /** Number of searchable characters, shown as a hint when idle. */
  supported: boolean;
}

export function WorkstationSearch({ search, inputRef, anchorRef, supported }: Props) {
  const { query, setQuery, count, current, next, prev, close, failTick } = search;
  const [failing, setFailing] = React.useState(false);
  const [modifier, setModifier] = React.useState<"Ctrl" | "Cmd">("Ctrl");

  React.useEffect(() => setModifier(platformModifier()), []);

  // muted failure flicker — never a dramatic error
  React.useEffect(() => {
    if (failTick === 0) return;
    setFailing(true);
    const id = window.setTimeout(() => setFailing(false), 360);
    return () => window.clearTimeout(id);
  }, [failTick]);

  const hasQuery = query.trim().length > 0;
  const position = count > 0 ? current + 1 : 0;

  return (
    <div
      ref={anchorRef}
      className={cn(
        "relative flex items-center gap-1.5 border bg-ink-950/70 pl-2.5 pr-1.5 transition-colors duration-200",
        !supported
          ? "border-parchment-500/10 opacity-50"
          : failing
            ? "border-signal-close/50"
            : hasQuery && count === 0
              ? "border-parchment-500/25"
              : "border-signal-search/40 focus-within:border-signal-search/70 focus-within:shadow-glow-search",
      )}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-parchment-600" />

      <input
        ref={inputRef}
        value={query}
        disabled={!supported}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (e.shiftKey) prev();
            else next();
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            close();
            inputRef.current?.blur();
          }
        }}
        placeholder={supported ? "Search evidence" : "Not searchable"}
        aria-label="Search within evidence"
        className={cn(
          "h-7 w-[130px] bg-transparent font-mono text-[11.5px] text-parchment-100 outline-none placeholder:text-parchment-600/70 sm:w-[190px]",
          failing && "animate-flicker-fail",
        )}
      />

      {/* match position */}
      {hasQuery && (
        <span
          className={cn(
            "shrink-0 px-1 font-mono text-[10.5px] tabular",
            count === 0 ? "text-signal-closeGlow/80" : "text-signal-searchGlow",
          )}
          aria-live="polite"
        >
          {count === 0 ? "0 / 0" : `${position} / ${count}`}
        </span>
      )}

      {!hasQuery && (
        <span className="hidden shrink-0 items-center gap-1 pr-1 lg:flex">
          <Kbd>{modifier}</Kbd>
          <Kbd>F</Kbd>
        </span>
      )}

      {hasQuery && (
        <>
          <div className="ml-0.5 flex items-center">
            <button
              type="button"
              onClick={next}
              aria-label="Next match"
              title="Next match (Enter)"
              className="flex h-6 w-6 items-center justify-center text-parchment-500 transition-colors hover:bg-signal-search/15 hover:text-signal-searchGlow"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous match"
              title="Previous match (Shift + Enter)"
              className="flex h-6 w-6 items-center justify-center text-parchment-500 transition-colors hover:bg-signal-search/15 hover:text-signal-searchGlow"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                inputRef.current?.blur();
              }}
              aria-label="Close search"
              title="Close search (Escape)"
              className="flex h-6 w-6 items-center justify-center text-parchment-500 transition-colors hover:bg-signal-close/15 hover:text-signal-closeGlow"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
