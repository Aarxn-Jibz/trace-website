"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "restricted" | "classified" | "verified" | "neutral";

const TONES: Record<Tone, { border: string; text: string; bg: string }> = {
  restricted: { border: "border-brass/60", text: "text-brass-light", bg: "bg-brass/[0.04]" },
  classified: { border: "border-burgundy-light/60", text: "text-[#E0958C]", bg: "bg-burgundy/[0.1]" },
  verified: { border: "border-signal-open/55", text: "text-signal-openGlow", bg: "bg-signal-open/[0.06]" },
  neutral: { border: "border-parchment-500/35", text: "text-parchment-400", bg: "bg-transparent" },
};

/**
 * Rubber-stamp block. Sits at a slight angle, double-ruled, and strikes in
 * once on mount (respecting reduced-motion).
 */
export function ClassificationStamp({
  label,
  sub,
  tone = "restricted",
  rotate = -12,
  animate = true,
  className,
}: {
  label: string;
  sub?: string;
  tone?: Tone;
  rotate?: number;
  animate?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const t = TONES[tone];

  return (
    <motion.div
      initial={animate && !reduce ? { opacity: 0, scale: 1.4 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      style={{ rotate }}
      className={cn(
        "pointer-events-none inline-flex flex-col items-center gap-1 border-2 px-4 py-2 backdrop-blur-[1px]",
        t.border,
        t.text,
        t.bg,
        className,
      )}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest3">{label}</span>
      {sub && <span className="font-mono text-[8px] uppercase tracking-widest2 opacity-80">{sub}</span>}
      <span className={cn("h-px w-full", tone === "classified" ? "bg-burgundy-light/50" : "bg-current opacity-40")} />
      <span className="font-mono text-[7.5px] uppercase tracking-widest2 opacity-70">
        MINISTRY OF MAGIC
      </span>
    </motion.div>
  );
}
