"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { EvidenceFile } from "@/types";
import { cn } from "@/lib/utils";
import { EvidenceItem } from "./evidence-item";

type Group = "ALL" | "TEXT" | "DATA" | "DOCUMENT" | "EXTERNAL";

const GROUPS: { id: Group; label: string; match: (f: EvidenceFile) => boolean }[] = [
  { id: "ALL", label: "All", match: () => true },
  { id: "TEXT", label: "Logs", match: (f) => f.viewer === "text" },
  { id: "DATA", label: "Data", match: (f) => f.viewer === "csv" || f.viewer === "json" },
  { id: "DOCUMENT", label: "Docs", match: (f) => f.viewer === "markdown" },
  { id: "EXTERNAL", label: "External", match: (f) => f.viewer === "unsupported" },
];

export function EvidenceLocker({
  evidence,
  onView,
  onDownload,
  pendingId,
  activeId,
}: {
  evidence: EvidenceFile[];
  onView: (id: string) => void;
  onDownload: (file: EvidenceFile) => void;
  pendingId: string | null;
  activeId: string | null;
}) {
  const reduce = useReducedMotion();
  const [group, setGroup] = React.useState<Group>("ALL");

  const counts = React.useMemo(() => {
    const map = new Map<Group, number>();
    for (const g of GROUPS) map.set(g.id, evidence.filter(g.match).length);
    return map;
  }, [evidence]);

  const visible = React.useMemo(
    () => evidence.filter(GROUPS.find((g) => g.id === group)!.match),
    [evidence, group],
  );

  return (
    <section id="evidence" className="relative scroll-mt-11">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-brass/70" />
            Section 02
          </p>
          <h2 className="font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[0.9] tracking-[0.01em] text-parchment-100">
            EVIDENCE LOCKER
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              aria-pressed={group === g.id}
              className={cn(
                "border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-widest2 transition-colors duration-200",
                group === g.id
                  ? "border-brass/50 bg-brass/[0.09] text-brass-light"
                  : "border-parchment-500/15 text-parchment-600 hover:border-parchment-500/30 hover:text-parchment-300",
              )}
            >
              {g.label}
              <span className="ml-1.5 tabular opacity-60">{counts.get(g.id) ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border border-parchment-500/12 bg-ink-880/30">
        {/* column head */}
        <div className="hidden border-b border-parchment-500/12 px-5 py-2 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600 sm:flex">
          <span className="flex-1">Artefact</span>
          <span className="w-[260px] shrink-0">Type · Size · Integrity</span>
          <span className="w-[120px] shrink-0 text-right">Actions</span>
        </div>

        <div className="divide-y divide-parchment-500/[0.08]">
          {visible.map((file, i) => (
            <motion.div
              key={file.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.24) }}
            >
              <EvidenceItem
                file={file}
                pending={pendingId === file.id}
                active={activeId === file.id}
                onView={() => onView(file.id)}
                onDownload={() => onDownload(file)}
              />
            </motion.div>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="px-5 py-10 text-center font-mono text-[11px] uppercase tracking-widest2 text-parchment-600">
            No artefacts in this category.
          </p>
        )}
      </div>
    </section>
  );
}
