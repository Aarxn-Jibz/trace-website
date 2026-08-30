"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { TraceLines } from "@/components/fx/atmosphere";
import { MinistrySeal } from "@/components/fx/ministry-seal";

const WORD = "TRACE";
const DISCIPLINES = ["TRACK", "RETRIEVE", "ANALYZE", "CORRELATE", "EXAMINE"];

const META = [
  { label: "Exercise status", value: "ACTIVE" },
  { label: "Dossiers", value: "03" },
  { label: "Artefacts", value: "12" },
  { label: "Clearance", value: "Ω-7" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0.12]);
  const sealY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-14%"]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden border-b border-parchment-500/12 pb-10 pt-16"
    >
      {/* ---------- backdrop ---------- */}
      <div className="absolute inset-0 -z-10 bg-ink-900" />
      <div
        className="absolute inset-0 -z-10 grid-backdrop opacity-70"
        style={{
          maskImage: "radial-gradient(115% 85% at 50% 12%, black 25%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(115% 85% at 50% 12%, black 25%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[70vh]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% -10%, rgba(183,151,73,0.09) 0%, transparent 70%), radial-gradient(45% 50% at 78% 30%, rgba(76,134,216,0.07) 0%, transparent 70%)",
        }}
      />
      <TraceLines className="-z-10" />
      <div className="absolute inset-0 -z-10 vignette" />

      {/* ---------- corner metadata ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-16 hidden justify-between px-5 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600 sm:px-8 lg:flex">
        <span>Archive index · TRACE-000</span>
        <span>Every artifact leaves a trace.</span>
        <span>Est. 1707 · Vault B</span>
      </div>

      {/* ---------- seal ---------- */}
      <motion.div
        style={{ y: sealY }}
        className="pointer-events-none absolute right-[-6%] top-[16%] -z-10 hidden w-[46vw] max-w-[560px] opacity-[0.13] lg:block"
      >
        <motion.div
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 220, ease: "linear", repeat: Infinity }}
        >
          <MinistrySeal top="MINISTRY OF MAGIC" bottom="DEPARTMENT OF MAGICAL LAW ENFORCEMENT" />
        </motion.div>
      </motion.div>

      {/* ---------- content ---------- */}
      <motion.div
        style={{ y, opacity }}
        className="mx-auto w-full max-w-[1600px] px-5 sm:px-8"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-brass/70" />
          <span className="font-mono text-[9.5px] uppercase tracking-widest3 text-brass-light">
            Cybercrime Investigation Exercise
          </span>
        </motion.div>

        <h1 className="sr-only">
          TRACE — Track, Retrieve, Analyze, Correlate, Examine
        </h1>

        {/* Giant wordmark with per-letter reveal */}
        <div
          aria-hidden
          className="flex select-none items-end font-display leading-[0.78] tracking-[0.015em] text-parchment-100"
          style={{ fontSize: "clamp(4.5rem, 19.5vw, 17rem)" }}
        >
          {WORD.split("").map((ch, i) => (
            <span key={i} className="overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "108%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: reduce ? 0 : 0.95,
                  delay: reduce ? 0 : 0.1 + i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </div>

        <div className="mt-2 h-px w-full bg-gradient-to-r from-parchment-400/40 via-parchment-500/15 to-transparent" />

        {/* Discipline line */}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-widest2 sm:text-[11.5px]">
          {DISCIPLINES.map((word, i) => (
            <React.Fragment key={word}>
              <motion.span
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.55,
                  delay: reduce ? 0 : 0.55 + i * 0.075,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-parchment-300"
              >
                {word}
              </motion.span>
              {i < DISCIPLINES.length - 1 && (
                <motion.span
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : 0.6 + i * 0.075 }}
                  className="text-brass/70"
                >
                  .
                </motion.span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Tagline + meta */}
        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.95 }}
            className="max-w-sm font-heading text-[15px] leading-relaxed text-parchment-400"
          >
            Real artefacts. Real tooling. Correlate logs, captures and metadata across
            independent sources until the incident reconstructs itself.
          </motion.p>

          <motion.dl
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 1.05 }}
            className="grid grid-cols-2 gap-x-10 gap-y-4 border-l border-parchment-500/15 pl-6 sm:grid-cols-4"
          >
            {META.map((m) => (
              <div key={m.label}>
                <dt className="label-mono">{m.label}</dt>
                <dd className="mt-1.5 font-display text-2xl leading-none tracking-wide text-parchment-200">
                  {m.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* ---------- scroll cue ---------- */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.4, duration: 0.6 }}
        className="mx-auto mt-12 flex w-full max-w-[1600px] items-center gap-3 px-5 sm:px-8"
      >
        <ChevronDown className="h-3.5 w-3.5 animate-drift text-parchment-600" />
        <span className="label-mono">Open dossiers</span>
        <span className="h-px flex-1 bg-parchment-500/12" />
        <span className="label-mono">01 / 03</span>
      </motion.div>
    </section>
  );
}
