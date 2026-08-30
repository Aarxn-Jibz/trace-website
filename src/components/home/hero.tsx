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

const QUICK = [
  { n: "01", label: "Hero", href: "#hero" },
  { n: "02", label: "Dossiers", href: "#dossiers" },
  { n: "03", label: "Protocol", href: "#protocol" },
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
      id="hero"
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden border-b border-parchment-500/12 pt-12"
    >
      {/* ---------- backdrop ---------- */}
      <div className="absolute inset-0 -z-10 bg-ink-900" />
      <div
        className="absolute inset-0 -z-10 grid-backdrop opacity-50"
        style={{
          maskImage: "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[55vh]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% -10%, rgba(183,151,73,0.08) 0%, transparent 70%)",
        }}
      />
      <TraceLines className="-z-10" />

      {/* bleeds off the edge — adds a "motorsport" big-numeral device */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[7vw] -top-[6vw] select-none font-display leading-none text-parchment-100/[0.035]"
        style={{ fontSize: "clamp(20rem, 36vw, 44rem)" }}
      >
        001
      </span>

      {/* ---------- seal ---------- */}
      <motion.div
        style={{ y: sealY }}
        className="pointer-events-none absolute right-[-4%] top-[20%] -z-10 hidden w-[42vw] max-w-[480px] opacity-[0.18] lg:block"
      >
        <motion.div
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 240, ease: "linear", repeat: Infinity }}
        >
          <MinistrySeal top="MINISTRY OF MAGIC" bottom="DEPARTMENT OF MAGICAL LAW ENFORCEMENT" />
        </motion.div>
      </motion.div>

      {/* ---------- top tape ---------- */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-parchment-500/12"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600 sm:px-8">
          <span className="text-brass-light">TRACE · 2026.08.30</span>
          <span className="hidden h-3 w-px bg-parchment-500/20 sm:inline-block" />
          <span className="hidden sm:inline">Archive index · TRACE-000</span>
          <span className="ml-auto hidden md:inline">Every artifact leaves a trace.</span>
          <span className="hidden h-3 w-px bg-parchment-500/20 md:inline-block" />
          <span>Est. 1707 · Vault B</span>
        </div>
      </motion.div>

      {/* ---------- content ---------- */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-5 py-12 sm:px-8"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-5 flex items-center gap-3"
        >
          <span className="font-display text-[13px] leading-none text-brass-light">01</span>
          <span className="h-px w-10 bg-brass/70" />
          <span className="font-mono text-[9.5px] uppercase tracking-widest3 text-brass-light">
            Cybercrime Investigation Exercise
          </span>
          <span className="ml-auto hidden font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-700 sm:inline">
            / Front page
          </span>
        </motion.div>

        <h1 className="sr-only">TRACE — Track, Retrieve, Analyze, Correlate, Examine</h1>

        {/* Giant wordmark with per-letter reveal */}
        <div
          aria-hidden
          className="flex select-none items-end font-display leading-[0.78] tracking-[0.01em] text-parchment-100"
          style={{ fontSize: "clamp(4.25rem, 16vw, 14.5rem)" }}
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

        <div className="mt-3 h-px w-full bg-gradient-to-r from-parchment-400/40 via-parchment-500/15 to-transparent" />

        {/* Discipline line */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-widest2 sm:text-[11.5px]">
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
                  className="text-brass"
                >
                  .
                </motion.span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Tagline + meta */}
        <div className="mt-9 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.95 }}
            className="max-w-md font-heading text-[15.5px] leading-relaxed text-parchment-400"
          >
            Real artefacts. Real tooling. Correlate logs, captures and metadata
            across independent sources until the incident reconstructs itself.
          </motion.p>

          <motion.dl
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 1.05 }}
            className="grid grid-cols-2 gap-px border border-parchment-500/12 bg-parchment-500/12 sm:grid-cols-4"
          >
            {META.map((m) => (
              <div key={m.label} className="bg-ink-900 px-4 py-3">
                <dt className="label-mono">{m.label}</dt>
                <dd className="mt-1 font-display text-[22px] leading-none tracking-wide text-parchment-200">
                  {m.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* ---------- quick-jump bar ---------- */}
      <motion.nav
        aria-label="Section quick-jump"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.2, duration: 0.6 }}
        className="relative z-10 border-t border-parchment-500/12"
      >
        <ul className="mx-auto flex w-full max-w-[1600px] flex-wrap items-stretch">
          {QUICK.map((q, i) => (
            <li
              key={q.n}
              className={
                "flex flex-1 items-center gap-3 border-r border-parchment-500/12 px-5 py-3 last:border-r-0" +
                (i === 0 ? " bg-signal-search/[0.04]" : "")
              }
            >
              <span className="font-display text-[15px] leading-none text-parchment-700">{q.n}</span>
              <a
                href={q.href}
                className="flex flex-1 items-baseline gap-2 font-mono text-[10px] uppercase tracking-widest2 text-parchment-300 transition-colors hover:text-brass-light"
              >
                {q.label}
                <span className="ml-auto font-mono text-[9px] text-parchment-700">→</span>
              </a>
            </li>
          ))}
          <li className="flex items-center gap-2 border-l border-parchment-500/12 px-5 py-3 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
            <ChevronDown className="h-3 w-3 animate-drift" />
            Scroll
          </li>
        </ul>
      </motion.nav>
    </section>
  );
}
