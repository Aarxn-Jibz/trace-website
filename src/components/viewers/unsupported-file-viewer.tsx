"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ExternalLink } from "lucide-react";
import type { EvidenceFile } from "@/types";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

/** Restrained "pensieve" glyph — concentric basins, not a cauldron. */
function PensieveGlyph() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      <g fill="none" stroke="rgba(233,227,213,0.22)" strokeWidth="1">
        <ellipse cx="60" cy="46" rx="46" ry="16" />
        <ellipse cx="60" cy="46" rx="34" ry="11.5" opacity="0.75" />
        <ellipse cx="60" cy="46" rx="22" ry="7.5" opacity="0.5" />
        <path d="M14 46 C14 74 34 92 60 92 C86 92 106 74 106 46" />
        <path d="M26 46 C26 66 41 80 60 80 C79 80 94 66 94 46" opacity="0.6" />
      </g>
      <g stroke="rgba(76,134,216,0.45)" strokeWidth="1" fill="none">
        <path d="M60 40 C48 30 44 20 52 12" opacity="0.8" />
        <path d="M60 40 C72 30 76 20 68 12" opacity="0.55" />
        <circle cx="60" cy="42" r="2.4" fill="rgba(140,195,255,0.6)" stroke="none" />
      </g>
    </svg>
  );
}

export function UnsupportedFileViewer({
  evidence,
  onDownload,
}: {
  evidence: EvidenceFile;
  onDownload: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl text-center"
      >
        <div className="mx-auto h-24 w-24 opacity-80">
          <PensieveGlyph />
        </div>

        <p className="mt-8 font-mono text-[9.5px] uppercase tracking-widest3 text-parchment-600">
          Unsupported artefact · {evidence.id}
        </p>

        <h3 className="mt-4 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.05] tracking-[0.02em] text-parchment-200">
          THE PENSIEVE CANNOT INTERPRET THIS MEMORY
        </h3>

        <p className="mx-auto mt-5 max-w-md text-[13.5px] leading-relaxed text-parchment-400">
          <span className="font-mono text-parchment-200">{evidence.filename}</span> requires
          specialised forensic equipment. Download the artefact and examine it in a dedicated
          tool — the console cannot render this format.
        </p>

        {evidence.externalTool && (
          <div className="mt-8 border border-parchment-500/15 bg-ink-880/60 p-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-mono">Suggested tool</p>
                <p className="mt-1.5 font-heading text-[17px] font-semibold text-parchment-100">
                  {evidence.externalTool.name}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-parchment-500">
                  {evidence.externalTool.note}
                </p>
              </div>
              <a
                href={evidence.externalTool.url}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 font-mono text-[9.5px] uppercase tracking-widest2 text-brass-light transition-colors hover:text-brass"
              >
                <span className="flex items-center gap-1">
                  Get it
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="search" size="lg" onClick={onDownload} disabled={!evidence.url}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
                {formatBytes(evidence.sizeBytes)} · {evidence.filename.split(".").pop()?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <dl className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-left font-mono text-[10px] uppercase tracking-widest2">
          <div className="flex justify-between border-b border-parchment-500/10 pb-1.5">
            <dt className="text-parchment-600">Integrity</dt>
            <dd className="text-parchment-300">{evidence.integrity}</dd>
          </div>
          <div className="flex justify-between border-b border-parchment-500/10 pb-1.5">
            <dt className="text-parchment-600">Acquired</dt>
            <dd className="text-parchment-300">{evidence.collectedAt.slice(11, 19)}Z</dd>
          </div>
          <div className="col-span-2 flex justify-between border-b border-parchment-500/10 pb-1.5">
            <dt className="text-parchment-600">SHA-256</dt>
            <dd className="truncate pl-4 text-parchment-300">{evidence.sha256}</dd>
          </div>
        </dl>
      </motion.div>
    </div>
  );
}
