"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Binary, Network, Search, Table2, FileType, Hash } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Acquire",
    body: "Each dossier ships with the artefacts taken from the scene: logs, captures, exports and metadata.",
  },
  {
    n: "02",
    title: "Inspect",
    body: "Open text artefacts in the forensic console. Search, scroll and read them the way an examiner would.",
  },
  {
    n: "03",
    title: "Correlate",
    body: "No single file holds the answer. Cross-reference timestamps, addresses and identities across sources.",
  },
  {
    n: "04",
    title: "Reconstruct",
    body: "Establish what happened, in what order, and who was responsible. Then answer the dossier questions.",
  },
];

const TOOLS = [
  { icon: Network, label: "Wireshark" },
  { icon: Table2, label: "Spreadsheets" },
  { icon: FileType, label: "Text editors" },
  { icon: Hash, label: "Hash utilities" },
  { icon: Binary, label: "Hex viewers" },
  { icon: Search, label: "Metadata tools" },
];

export function Protocol() {
  const reduce = useReducedMotion();

  return (
    <section id="protocol" className="relative scroll-mt-11 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="label-mono mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-brass/70" />
              Section 03
            </p>
            <h2 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.86] tracking-[0.01em] text-parchment-100">
              THE
              <br />
              PROTOCOL
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-parchment-400">
            There are no riddles here and no clues hidden in prose. Every answer is
            recoverable from the evidence itself, using the tools an investigator
            would actually reach for.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-px border border-parchment-500/12 bg-parchment-500/12 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative bg-ink-900 p-7 transition-colors duration-500 hover:bg-ink-850"
            >
              <span className="font-display text-[46px] leading-none text-parchment-700 transition-colors duration-500 group-hover:text-brass/70">
                {s.n}
              </span>
              <h3 className="mt-5 font-heading text-[15px] font-bold uppercase tracking-widest2 text-parchment-100">
                {s.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-parchment-500">{s.body}</p>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brass/60 transition-transform duration-500 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </div>

        {/* tooling strip */}
        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6 border-y border-parchment-500/12 py-7">
          <p className="label-mono">Bring your own tooling</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {TOOLS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest2 text-parchment-400"
              >
                <Icon className="h-3.5 w-3.5 text-brass/70" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
