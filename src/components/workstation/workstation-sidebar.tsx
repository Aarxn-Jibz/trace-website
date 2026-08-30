"use client";

import * as React from "react";
import { Braces, FileText, HardDrive, Network, Table2 } from "lucide-react";
import type { EvidenceFile, EvidenceKind } from "@/types";
import { cn, formatBytes } from "@/lib/utils";

const ICONS: Record<EvidenceKind, React.ComponentType<{ className?: string }>> = {
  log: FileText,
  txt: FileText,
  md: FileText,
  csv: Table2,
  json: Braces,
  pcap: Network,
  binary: HardDrive,
};

const INTEGRITY: Record<EvidenceFile["integrity"], string> = {
  VERIFIED: "bg-signal-open",
  PENDING: "bg-signal-gold",
  ALTERED: "bg-signal-close",
};

export function WorkstationSidebar({
  evidence,
  activeId,
  onSelect,
}: {
  evidence: EvidenceFile[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Evidence"
      className="flex h-full flex-col border-b border-parchment-500/12 bg-ink-880/60 lg:border-b-0 lg:border-r"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-parchment-500/12 px-4 py-2.5">
        <span className="label-mono-bright">Evidence</span>
        <span className="font-mono text-[9.5px] tabular text-parchment-600">
          {String(evidence.length).padStart(2, "0")}
        </span>
      </div>

      {/* mobile: horizontal rail · desktop: vertical list */}
      <ul className="flex gap-px overflow-x-auto p-2 no-scrollbar lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:p-0">
        {evidence.map((f) => {
          const Icon = ICONS[f.kind];
          const active = f.id === activeId;
          return (
            <li key={f.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(f.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "group relative flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors duration-200",
                  "lg:border-0 lg:border-l-2 lg:pl-3.5 lg:pr-4",
                  active
                    ? "border-signal-open/50 bg-signal-open/[0.07] lg:border-l-signal-open"
                    : "border-parchment-500/10 bg-transparent lg:border-l-transparent hover:bg-parchment-100/[0.035] lg:hover:border-l-parchment-500/40",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    active ? "text-signal-openGlow" : "text-parchment-600 group-hover:text-parchment-400",
                  )}
                />

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate font-mono text-[12px] leading-tight",
                      active ? "text-parchment-100" : "text-parchment-300",
                    )}
                  >
                    {f.filename}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
                    {f.id} · {formatBytes(f.sizeBytes)}
                  </span>
                </span>

                <span
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", INTEGRITY[f.integrity])}
                  title={`Integrity: ${f.integrity}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
