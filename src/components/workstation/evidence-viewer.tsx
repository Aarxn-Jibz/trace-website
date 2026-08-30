"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, TriangleAlert } from "lucide-react";
import type { EvidenceFile } from "@/types";
import { useEvidenceText } from "@/hooks/use-evidence-text";
import { TextViewer } from "@/components/viewers/text-viewer";
import { CsvViewer } from "@/components/viewers/csv-viewer";
import { JsonViewer } from "@/components/viewers/json-viewer";
import { MarkdownViewer } from "@/components/viewers/markdown-viewer";
import { UnsupportedFileViewer } from "@/components/viewers/unsupported-file-viewer";

export type SearchRoot = React.RefObject<HTMLDivElement | null>;

interface Props {
  evidence: EvidenceFile;
  rootRef: SearchRoot;
  wrap: boolean;
  lineNumbers: boolean;
  onDownload: () => void;
}

function LoadingState() {
  return (
    <div className="space-y-2 p-6">
      {[86, 62, 74, 48, 92, 58, 70, 40, 80, 66].map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.18 }}
          animate={{ opacity: [0.18, 0.34, 0.18] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
          className="flex items-center gap-4"
        >
          <span className="h-2.5 w-7 shrink-0 bg-parchment-500/10" />
          <span className="h-2.5 bg-parchment-500/10" style={{ width: `${w}%` }} />
        </motion.div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-10 text-center">
      <TriangleAlert className="h-5 w-5 text-signal-closeGlow" />
      <p className="font-mono text-[11px] uppercase tracking-widest2 text-parchment-400">
        Artefact unavailable
      </p>
      <p className="max-w-sm text-[13px] text-parchment-600">
        The evidence vault refused this request. Return to the locker and try again.
      </p>
    </div>
  );
}

export function EvidenceViewer({ evidence, rootRef, wrap, lineNumbers, onDownload }: Props) {
  const reduce = useReducedMotion();
  const { text, status } = useEvidenceText(evidence.url);

  if (evidence.viewer === "unsupported") {
    return <UnsupportedFileViewer evidence={evidence} onDownload={onDownload} />;
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-2 border-b border-parchment-500/10 px-6 py-3 font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Retrieving artefact from vault…
        </div>
        <LoadingState />
      </div>
    );
  }

  if (status === "error") return <ErrorState />;

  return (
    <motion.div
      key={evidence.id}
      initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-full"
    >
      <div ref={rootRef}>
        {evidence.viewer === "text" && (
          <TextViewer content={text} wrap={wrap} lineNumbers={lineNumbers} />
        )}
        {evidence.viewer === "csv" && (
          <CsvViewer content={text} wrap={wrap} lineNumbers={lineNumbers} />
        )}
        {evidence.viewer === "json" && (
          <JsonViewer content={text} wrap={wrap} lineNumbers={lineNumbers} />
        )}
        {evidence.viewer === "markdown" && <MarkdownViewer content={text} />}
      </div>
    </motion.div>
  );
}
