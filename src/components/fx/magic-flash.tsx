"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MagicTone = "open" | "close" | "search" | "gold";

const TONES: Record<MagicTone, { line: string; glow: string }> = {
  open: { line: "rgba(143,232,180,0.95)", glow: "rgba(92,169,124,0.34)" },
  close: { line: "rgba(240,112,90,0.95)", glow: "rgba(192,71,54,0.34)" },
  search: { line: "rgba(140,195,255,1)", glow: "rgba(76,134,216,0.32)" },
  gold: { line: "rgba(240,216,154,0.95)", glow: "rgba(198,164,85,0.34)" },
};

/**
 * One-shot magical pulse.
 *
 * Increment `playKey` to fire. Used for:
 *   · open  (green) — evidence materialising
 *   · close (red)   — dismissing an artefact
 *   · gold         — declassification / verified integrity
 */
export function MagicFlash({
  tone,
  playKey,
  orientation = "horizontal",
  duration = 0.6,
  className,
}: {
  tone: MagicTone;
  playKey: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const c = TONES[tone];
  const horizontal = orientation === "horizontal";
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (playKey <= 0) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), duration * 1000 + 120);
    return () => window.clearTimeout(id);
  }, [playKey, duration]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={playKey}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* travelling streak */}
            <motion.div
              className="absolute"
              style={{
                background: `linear-gradient(${horizontal ? "90deg" : "180deg"}, transparent, ${c.line}, transparent)`,
                boxShadow: `0 0 18px 2px ${c.glow}`,
                ...(horizontal
                  ? { left: 0, right: 0, height: 1.5, top: "50%" }
                  : { top: 0, bottom: 0, width: 1.5, left: "50%" }),
              }}
              initial={horizontal ? { x: "-110%" } : { y: "-110%" }}
              animate={horizontal ? { x: ["-110%", "110%"] } : { y: ["-110%", "110%"] }}
              transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* bloom */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(60% 60% at 50% 50%, ${c.glow} 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: duration * 0.9, times: [0, 0.35, 1], ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
