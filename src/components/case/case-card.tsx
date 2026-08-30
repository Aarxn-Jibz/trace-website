"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, FileStack, Lock } from "lucide-react";
import type { CaseRecord } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MinistrySeal } from "@/components/fx/ministry-seal";
import { CaseCountdown } from "./case-countdown";

/** Small L-shaped registration marks at dossier corners. */
function CornerTicks({ tone = "brass" }: { tone?: "brass" | "burgundy" }) {
  const c = tone === "burgundy" ? "border-burgundy-light/50" : "border-brass/45";
  return (
    <>
      <span className={cn("pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l border-t", c)} />
      <span className={cn("pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r border-t", c)} />
      <span className={cn("pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l", c)} />
      <span className={cn("pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r", c)} />
    </>
  );
}

export function CaseCard({ record, index }: { record: CaseRecord; index: number }) {
  const reduce = useReducedMotion();
  const locked = record.releaseStatus !== "released";

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 140, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [0, 1], [-3.5, 3.5]);
  const rotateX = useTransform(sy, [0, 1], [2.5, -2.5]);
  const px = useTransform(sx, [0, 1], ["0%", "100%"]);
  const py = useTransform(sy, [0, 1], ["0%", "100%"]);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${px} ${py}, rgba(233,227,213,0.075), transparent 68%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || locked) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const body = (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={locked || reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden border bg-ink-850/70 p-6 transition-colors duration-500 sm:p-7",
        locked
          ? "border-burgundy-dark/40"
          : "border-parchment-500/15 hover:border-brass/45",
      )}
    >
      {/* locked hatch + shimmer */}
      {locked && (
        <>
          <div className="pointer-events-none absolute inset-0 hatch-backdrop opacity-60" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-trace-sweep bg-gradient-to-r from-transparent via-signal-gold/[0.07] to-transparent" />
          </div>
        </>
      )}

      {/* pointer sheen (unlocked only) */}
      {!locked && (
        <motion.div
          style={{ background: sheen }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        />
      )}

      {/* backdrop seal watermark */}
      <div className="pointer-events-none absolute -bottom-16 -right-14 h-56 w-56 opacity-[0.05] transition-opacity duration-700 group-hover/card:opacity-[0.09]">
        <MinistrySeal showRings={false} top="MINISTRY OF MAGIC" bottom="ARCHIVE VAULT B" />
      </div>

      <CornerTicks tone={locked ? "burgundy" : "brass"} />

      {/* ---------- head ---------- */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
            <span>{record.code}</span>
            <span className="h-px w-4 bg-parchment-500/25" />
            <span>Dossier {String(index + 1).padStart(2, "0")}/03</span>
          </p>
          <p
            className="mt-2.5 font-display text-[42px] leading-none tracking-wide text-parchment-200 sm:text-[52px]"
            aria-hidden
          >
            {record.number}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant={locked ? "burgundy" : "open"} size="sm">
            {locked ? <Lock className="h-2.5 w-2.5" /> : null}
            {record.status}
          </Badge>
          <Badge variant={locked ? "neutral" : "brass"} size="sm">
            {record.classification}
          </Badge>
        </div>
      </div>

      {/* ---------- title ---------- */}
      <h3
        className={cn(
          "relative mt-6 font-heading text-[22px] font-bold uppercase leading-[1.08] tracking-tight sm:text-[26px]",
          locked ? "text-parchment-400" : "text-parchment-100",
        )}
      >
        {record.title}
      </h3>

      <p className="relative mt-2.5 font-mono text-[10px] uppercase leading-relaxed tracking-widest2 text-parchment-600">
        {locked ? "Contents withheld" : record.subtitle}
      </p>

      <div className="relative mt-5 h-px w-full bg-parchment-500/12" />

      {/* ---------- body ---------- */}
      {locked ? (
        <div className="relative mt-5 flex-1">
          {/* redaction bars — evidence details are never exposed */}
          <div className="space-y-2.5" aria-hidden>
            {[92, 78, 86, 54].map((w, i) => (
              <div
                key={i}
                className="h-2.5 bg-parchment-500/[0.11]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-parchment-500">
            {record.teaser}
          </p>
        </div>
      ) : (
        <p className="relative mt-5 flex-1 text-[13.5px] leading-relaxed text-parchment-400">
          {record.teaser}
        </p>
      )}

      {/* ---------- foot ---------- */}
      <div className="relative mt-7">
        {locked ? (
          <>
            <CaseCountdown offsetSeconds={record.releaseOffsetSeconds ?? 0} />
            <div className="mt-5 flex items-center gap-2 border-t border-burgundy-dark/40 pt-4 font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
              <Lock className="h-3 w-3" />
              Sealed by order of the Department of Mysteries
            </div>
          </>
        ) : (
          <div className="flex items-end justify-between gap-4 border-t border-parchment-500/12 pt-4">
            <dl className="flex gap-7">
              <div>
                <dt className="label-mono">Window</dt>
                <dd className="mt-1 font-mono text-[12px] tabular text-parchment-300">
                  {record.window.label}
                </dd>
              </div>
              <div>
                <dt className="label-mono">Evidence</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-mono text-[12px] tabular text-parchment-300">
                  <FileStack className="h-3 w-3 text-parchment-600" />
                  {String(record.evidenceCount).padStart(2, "0")} files
                </dd>
              </div>
            </dl>

            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest2 text-brass-light transition-transform duration-500 group-hover/card:translate-x-0.5">
              Open
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (locked) {
    return (
      <div
        aria-disabled="true"
        className="relative block h-full focus-within:outline-none"
        title="Sealed — not yet declassified"
      >
        {body}
        {/* wax seal */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.35, rotate: -22 }}
          animate={{ opacity: 1, scale: 1, rotate: -12 }}
          transition={{ duration: reduce ? 0 : 0.6, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute right-6 top-24 h-[104px] w-[104px] drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)]"
        >
          <MinistrySeal variant="wax" top="MINISTRY SEAL" bottom="CLASSIFIED" />
          <div className="absolute inset-0 animate-seal-shimmer bg-gradient-to-tr from-transparent via-white/25 to-transparent mix-blend-overlay" />
        </motion.div>
      </div>
    );
  }

  return (
    <Link
      href={`/case/${record.id}`}
      className="group block h-full rounded-sharp focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-900"
      aria-label={`Open dossier ${record.code} — ${record.title}`}
    >
      {body}
    </Link>
  );
}
