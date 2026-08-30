"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pad2 } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";

/** One two-digit cell with a slide transition on change. */
function Unit({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-11 w-[42px] overflow-hidden border border-parchment-500/18 bg-ink-950/80 sm:h-12 sm:w-[48px]">
        {/* faint internal rule */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-parchment-500/10" />
        <AnimatePresence initial={false}>
          <motion.span
            key={value}
            initial={reduce ? false : { y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.65, 0, 0.35, 1] }}
            className="absolute inset-0 flex items-center justify-center font-display text-[26px] leading-none tabular text-parchment-200 sm:text-[30px]"
          >
            {pad2(value)}
          </motion.span>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />
      </div>
      <span className="font-mono text-[8px] uppercase tracking-widest2 text-parchment-600">{label}</span>
    </div>
  );
}

const Colon = () => (
  <span className="pb-5 font-display text-[22px] leading-none text-parchment-600">:</span>
);

/**
 * Simulated declassification countdown for locked dossiers.
 *
 * Client-only: the target is derived after mount so SSR markup is stable.
 * Production will read a trusted server timestamp instead.
 */
export function CaseCountdown({
  offsetSeconds,
  className,
}: {
  offsetSeconds: number;
  className?: string;
}) {
  const { remaining, mounted, released } = useCountdown(offsetSeconds);
  const showDays = remaining.days > 0;

  return (
    <div className={className}>
      <p className="label-mono mb-3 flex items-center gap-2">
        <span className="h-1 w-1 bg-signal-gold" />
        {released ? "Declassification complete" : "Evidence declassification in"}
      </p>

      <div className="flex items-end gap-1.5">
        {!mounted ? (
          <div className="h-12 w-full animate-pulse bg-parchment-500/[0.06]" />
        ) : (
          <>
            {showDays && (
              <>
                <Unit value={remaining.days} label="days" />
                <Colon />
              </>
            )}
            <Unit value={remaining.hours} label="hrs" />
            <Colon />
            <Unit value={remaining.minutes} label="min" />
            <Colon />
            <Unit value={remaining.seconds} label="sec" />
          </>
        )}
      </div>
    </div>
  );
}
