"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import type { CaseRecord } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MinistrySeal } from "@/components/fx/ministry-seal";
import { CaseCountdown } from "@/components/case/case-countdown";
import { TraceLines } from "@/components/fx/atmosphere";

/** Sealed dossier — no evidence, no briefing, no partial disclosure. */
export function LockedCase({ record }: { record: CaseRecord }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[80svh] overflow-hidden pt-14">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />
      <div className="pointer-events-none absolute inset-0 hatch-backdrop opacity-30" />
      <TraceLines className="opacity-30" />
      <div className="pointer-events-none absolute inset-0 vignette" />

      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 select-none font-display leading-none text-parchment-100/[0.025]"
        style={{ fontSize: "clamp(9rem, 24vw, 24rem)" }}
      >
        {record.number}
      </span>

      <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-24 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-brass-light">
            {record.code}
          </span>
          <span className="h-3 w-px bg-parchment-500/20" />
          <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
            {record.division}
          </span>
          <span className="ml-auto flex items-center gap-2">
            <Badge variant="burgundy" size="sm">
              <Lock className="h-2.5 w-2.5" />
              {record.status}
            </Badge>
            <Badge variant="neutral" size="sm">
              {record.classification}
            </Badge>
          </span>
        </div>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[1fr_auto]">
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-baseline gap-4 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.86] tracking-[0.015em] text-parchment-500"
            >
              CASE
              <span className="text-parchment-200">{record.number}</span>
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-2xl font-heading text-[clamp(1.35rem,3vw,2.25rem)] font-bold uppercase leading-[1.08] tracking-tight text-parchment-200"
            >
              {record.title}
            </motion.h1>

            <p className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-parchment-500">
              {record.teaser}
            </p>

            {/* redacted briefing placeholder */}
            <div className="mt-10 max-w-xl space-y-3" aria-hidden>
              {[100, 92, 96, 74, 88, 52].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 bg-parchment-500/[0.1]"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 border-t border-parchment-500/12 pt-8"
            >
              <CaseCountdown offsetSeconds={record.releaseOffsetSeconds ?? 0} />

              <p className="mt-6 font-mono text-[9.5px] uppercase leading-relaxed tracking-widest2 text-parchment-600">
                Evidence will appear in the locker automatically once the seal lifts.
                No artefact from this dossier may be disclosed before then.
              </p>
            </motion.div>

            <div className="mt-10">
              <Button variant="default" size="lg" asChild>
                <Link href="/">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to index
                </Link>
              </Button>
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 1.2, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto h-[240px] w-[240px] shrink-0 sm:h-[300px] sm:w-[300px]"
          >
            <MinistrySeal variant="wax" top="MINISTRY SEAL" bottom="CLASSIFIED" />
            <div className="absolute inset-0 animate-seal-shimmer bg-gradient-to-tr from-transparent via-white/25 to-transparent mix-blend-overlay" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
