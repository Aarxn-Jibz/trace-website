"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CaseRecord } from "@/types";
import { RichText } from "@/components/ui/rich-text";
import { ClassificationStamp } from "@/components/fx/classification-stamp";
import { Sparks } from "@/components/fx/atmosphere";

export function CaseBriefing({ record }: { record: CaseRecord }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr]">
          {/* ---------------- dossier body ---------------- */}
          <div>
            <p className="label-mono mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-brass/70" />
              Section 01 · Briefing
            </p>

            <div className="relative max-w-2xl">
              {/* first-paragraph drop treatment */}
              {record.briefing.map((para, i) => (
                <motion.p
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={
                    i === 0
                      ? "text-[16.5px] leading-[1.75] text-parchment-200"
                      : "mt-5 text-[15px] leading-[1.8] text-parchment-400"
                  }
                >
                  <RichText text={para} />
                </motion.p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-parchment-500/12 pt-6 font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
              <span>Filed {record.window.date}</span>
              <span>{record.code}</span>
              <span>Distribution: cleared investigators</span>
            </div>
          </div>

          {/* ---------------- objectives ---------------- */}
          <motion.aside
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative border border-parchment-500/12 bg-ink-850/50 p-6 paper-grain">
              <Sparks count={8} className="opacity-40" />
              <p className="label-mono mb-5">Investigative objectives</p>

              <ol className="relative space-y-5">
                {record.objectives.map((objective, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-brass/40 font-mono text-[9px] tabular text-brass-light">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-parchment-300">
                      {objective}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-parchment-500/12 pt-6">
                <p className="font-mono text-[9.5px] uppercase leading-relaxed tracking-widest2 text-parchment-600">
                  Answers are submitted against the dossier. Partial credit is awarded for
                  defensible reasoning supported by evidence.
                </p>
              </div>
            </div>

            <ClassificationStamp
              label={record.classification}
              sub="Investigation copy"
              tone="restricted"
              rotate={-7}
              className="absolute -right-3 -top-6 hidden sm:flex"
            />
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
