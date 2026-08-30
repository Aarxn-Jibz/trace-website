"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { listCases } from "@/data";
import { CaseCard } from "@/components/case/case-card";
import { SectionHead } from "@/components/ui/section-head";

export function CaseIndex() {
  const reduce = useReducedMotion();
  const cases = listCases();

  return (
    <section
      id="dossiers"
      className="relative scroll-mt-11 border-b border-parchment-500/12 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <SectionHead
          number="02"
          kicker="Section 02 · The archive"
          title="Active dossiers"
          counter="02 / 03"
          note="Index"
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 text-[15px] leading-relaxed text-parchment-400 lg:col-span-5 lg:pr-10 lg:text-[15.5px]"
          >
            Three incidents are held in the archive. <span className="text-parchment-200">One</span> has been declassified for investigation. The remainder are{" "}
            <span className="text-burgundy-light">sealed</span> until their release window opens.
            Cards become interactive at release.
          </motion.p>

          <motion.dl
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-12 grid grid-cols-3 gap-px border border-parchment-500/12 bg-parchment-500/12 lg:col-span-7"
          >
            {[
              { l: "Released", v: "01", tone: "text-signal-openGlow" },
              { l: "Sealed", v: "02", tone: "text-burgundy-light" },
              { l: "Evidence", v: "12", tone: "text-parchment-100" },
            ].map((s) => (
              <div key={s.l} className="bg-ink-900 px-5 py-4">
                <dt className="label-mono">{s.l}</dt>
                <dd className={"mt-1.5 font-display text-[36px] leading-none tracking-wide " + s.tone}>
                  {s.v}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

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
