"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Subtle film grain overlay.
 *
 * Light texture: a page-wide noise pass helps dark surfaces read as
 * physical paper / carbon rather than pure black. The previous vignette
 * was darkening content so the layer now carries only grain.
 */
export function Grain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-[60] grain", className)}
    />
  );
}

/**
 * Slow-moving "trace" lines — the signature background motif.
 * Rendered as an SVG of long, shallow diagonal strokes that drift and
 * re-draw, suggesting signal propagation through an archive.
 */
export function TraceLines({
  className,
  opacity = 1,
}: {
  className?: string;
  opacity?: number;
}) {
  const reduce = useReducedMotion();

  const lines = React.useMemo(
    () => [
      { y: 12, delay: 0, dur: 9.5, o: 0.5 },
      { y: 78, delay: 1.6, dur: 12, o: 0.32 },
      { y: 148, delay: 3.1, dur: 10.5, o: 0.42 },
      { y: 226, delay: 0.8, dur: 13.5, o: 0.26 },
      { y: 318, delay: 2.4, dur: 11, o: 0.36 },
      { y: 402, delay: 4.2, dur: 14, o: 0.22 },
    ],
    [],
  );

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 460">
        <defs>
          <linearGradient id="trace-fade" x1="0" x2="1">
            <stop offset="0%" stopColor="#8CC3FF" stopOpacity="0" />
            <stop offset="35%" stopColor="#8CC3FF" stopOpacity="1" />
            <stop offset="65%" stopColor="#8CC3FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#8CC3FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((l, i) => (
          <g key={i} opacity={l.o}>
            <line
              x1="0"
              y1={l.y}
              x2="1200"
              y2={l.y}
              stroke="rgba(233,227,213,0.07)"
              strokeWidth="1"
            />
            {!reduce && (
              <line
                x1="0"
                y1={l.y}
                x2="150"
                y2={l.y}
                stroke="url(#trace-fade)"
                strokeWidth="1.25"
              >
                <animate
                  attributeName="x1"
                  values="-160;1200"
                  dur={`${l.dur}s`}
                  begin={`${l.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="x2"
                  values="0;1360"
                  dur={`${l.dur}s`}
                  begin={`${l.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  keyTimes="0;0.12;0.8;1"
                  dur={`${l.dur}s`}
                  begin={`${l.delay}s`}
                  repeatCount="indefinite"
                />
              </line>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Thin horizontal scanner pass, used on dossier surfaces. */
export function ScanLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-x-0 h-24 animate-scan-line bg-gradient-to-b from-transparent via-signal-search/[0.05] to-transparent" />
    </div>
  );
}

/** Faint seeded spark field — magic dust, used extremely sparingly. */
export function Sparks({
  className,
  count = 14,
  color = "rgba(183,151,73,0.55)",
}: {
  className?: string;
  count?: number;
  color?: string;
}) {
  const reduce = useReducedMotion();
  const sparks = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: ((i * 137.508) % 100) + ((i % 3) - 1) * 2,
        top: ((i * 61.8) % 100),
        size: i % 4 === 0 ? 2.5 : 1.5,
        delay: (i % 7) * 0.7,
        dur: 4 + (i % 5),
      })),
    [count],
  );

  if (reduce) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: color,
            boxShadow: `0 0 ${s.size * 3}px ${color}`,
            animation: `drift ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
