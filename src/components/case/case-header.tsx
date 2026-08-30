"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, FileStack, MapPin, ShieldHalf, UserRound } from "lucide-react";
import type { CaseRecord } from "@/types";
import { Badge } from "@/components/ui/badge";
import { MinistrySeal } from "@/components/fx/ministry-seal";
import { TraceLines } from "@/components/fx/atmosphere";

function Meta({
  icon: Icon,
  label,
  value,
  emphasis,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="border-l border-parchment-500/12 pl-4">
      <dt className="label-mono flex items-center gap-1.5">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </dt>
      <dd
        className={
          emphasis
            ? "mt-2 font-display text-[26px] leading-none tracking-wide text-parchment-100"
            : "mt-2 font-mono text-[12px] uppercase tracking-widest2 text-parchment-200"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function CaseHeader({ record }: { record: CaseRecord }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-parchment-500/12 pt-14">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 60% at 12% 0%, rgba(183,151,73,0.07) 0%, transparent 70%)",
        }}
      />
      <TraceLines className="opacity-40" />

      {/* oversized case number watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-display leading-none text-parchment-100/[0.028]"
        style={{ fontSize: "clamp(10rem, 26vw, 26rem)" }}
      >
        {record.number}
      </span>

      <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-10 sm:px-8">
        {/* top row */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-brass-light">
            {record.code}
          </span>
          <span className="h-3 w-px bg-parchment-500/20" />
          <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
            {record.division}
          </span>
          <span className="ml-auto flex items-center gap-2">
            <Badge variant={record.status === "ACTIVE" ? "open" : "burgundy"} size="sm">
              {record.status}
            </Badge>
            <Badge variant={record.classification === "RESTRICTED" ? "brass" : "burgundy"} size="sm">
              {record.classification}
            </Badge>
          </span>
        </motion.div>

        {/* title block */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 grid gap-10 lg:grid-cols-[1fr_auto]"
        >
          <div>
            <p className="flex items-baseline gap-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.86] tracking-[0.015em] text-parchment-500">
              CASE
              <span className="text-parchment-100">{record.number}</span>
            </p>

            <h1 className="mt-6 max-w-3xl font-heading text-[clamp(1.5rem,3.6vw,2.75rem)] font-bold uppercase leading-[1.05] tracking-tight text-parchment-100">
              {record.title}
            </h1>

            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-parchment-400">
              {record.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3 w-3" />
                {record.lead}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {record.location}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldHalf className="h-3 w-3" />
                {record.coordinates}
              </span>
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden h-[168px] w-[168px] shrink-0 self-start opacity-70 lg:block xl:h-[196px] xl:w-[196px]"
          >
            <MinistrySeal top="MINISTRY OF MAGIC" bottom="EVIDENCE VAULT B" />
          </motion.div>
        </motion.div>

        {/* meta grid */}
        <motion.dl
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mt-12 grid grid-cols-2 gap-y-8 border-t border-parchment-500/12 pt-8 md:grid-cols-4"
        >
          <Meta icon={Clock} label="Status" value={record.status} />
          <Meta icon={ShieldHalf} label="Classification" value={record.classification} />
          <Meta icon={Clock} label="Incident window" value={record.window.label} emphasis />
          <Meta
            icon={FileStack}
            label="Evidence"
            value={`${String(record.evidenceCount).padStart(2, "0")} FILES`}
          />
        </motion.dl>
      </div>
    </section>
  );
}
