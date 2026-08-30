"use client";

import * as React from "react";
import { motion, type AnimationControls } from "framer-motion";

/**
 * Blue trace streak.
 *
 * A short luminous bar that flies from the search field to the matched
 * line. Rendered at the document root so it can cross panel boundaries.
 */
export function SearchStreak({ controls }: { controls: AnimationControls }) {
  return (
    <motion.div
      aria-hidden
      animate={controls}
      initial={{ opacity: 0, x: 0, y: 0, scaleX: 0.4 }}
      className="pointer-events-none fixed left-0 top-0 z-[70] h-[2px] w-[190px] origin-left rounded-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(76,134,216,0) 0%, rgba(140,195,255,0.95) 45%, rgba(214,235,255,1) 70%, rgba(76,134,216,0) 100%)",
        boxShadow: "0 0 20px 2px rgba(76,134,216,0.45)",
        filter: "blur(0.3px)",
      }}
    />
  );
}

/** Soft blue bloom that lands on the matched line. */
export function SearchBloom({ controls }: { controls: AnimationControls }) {
  return (
    <motion.div
      aria-hidden
      animate={controls}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
      className="pointer-events-none fixed left-0 top-0 z-[69] h-6 w-40 origin-center rounded-full"
      style={{
        background:
          "radial-gradient(50% 50% at 50% 50%, rgba(140,195,255,0.5) 0%, rgba(76,134,216,0.12) 55%, transparent 75%)",
      }}
    />
  );
}
