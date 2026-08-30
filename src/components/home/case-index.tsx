"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { listCases } from "@/data";
import { CaseCard } from "@/components/case/case-card";

export function CaseIndex() {
  const reduce = useReducedMotion();
  const cases = listCases();

  return (
    <section id="dossiers" className="relative scroll-mt-11 border-b border-parchment-500/12 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        {/* section head */}
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
              Section 02
            </p>
            <h2 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.86] tracking-[0.01em] text-parchment-100">
              ACTIVE
              <br />
              DOSSIERS
            </h2>
          </div>

          <div className="max-w-sm">
            <p className="text-[14px] leading-relaxed text-parchment-400">
              Three incidents are held in the archive. One has been declassified for
              investigation. The remainder are sealed until their release window opens.
            </p>
            <p className="mt-4 font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
              01 released · 02 sealed · Rotation 14 AUG 2026
            </p>
          </div>
        </motion.div>

        <div className="mt-12 h-px w-full bg-parchment-500/12" />

        {/* cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <CaseCard record={c} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
