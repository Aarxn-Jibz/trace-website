"use client";

import * as React from "react";
import { Braces, Download, Eye, FileText, HardDrive, Network, Table2 } from "lucide-react";
import type { EvidenceFile, EvidenceKind } from "@/types";
import { cn, formatBytes, shortHash } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MagicFlash } from "@/components/fx/magic-flash";

const ICONS: Record<EvidenceKind, React.ComponentType<{ className?: string }>> = {
  log: FileText,
  txt: FileText,
  md: FileText,
  csv: Table2,
  json: Braces,
  pcap: Network,
  binary: HardDrive,
};

const INTEGRITY_TEXT: Record<EvidenceFile["integrity"], string> = {
  VERIFIED: "text-signal-openGlow",
  PENDING: "text-signal-goldGlow",
  ALTERED: "text-signal-closeGlow",
};

export function EvidenceItem({
  file,
  onView,
  onDownload,
  /** Drives the green opening pulse before the console takes over. */
  pending,
  active,
}: {
  file: EvidenceFile;
  onView: () => void;
  onDownload: () => void;
  pending: boolean;
  active: boolean;
}) {
  const Icon = ICONS[file.kind];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 border-l-2 bg-ink-850/40 px-4 py-3.5 transition-colors duration-300 sm:flex-row sm:items-center sm:gap-5 sm:px-5",
        active
          ? "border-l-signal-open bg-signal-open/[0.05]"
          : "border-l-parchment-500/15 hover:border-l-signal-open/60 hover:bg-parchment-100/[0.03]",
      )}
    >
      <MagicFlash tone="open" playKey={pending ? 1 : 0} duration={0.45} />

      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-signal-openGlow" : "text-parchment-600 group-hover:text-parchment-400",
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-mono text-[13px] text-parchment-100">{file.filename}</span>
          <span className="font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
            {file.id}
          </span>
        </p>
        <p className="mt-1 truncate font-mono text-[11px] text-parchment-500">{file.summary}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-parchment-600">
          {file.kind}
        </span>
        <span className="font-mono text-[10px] tabular text-parchment-400">
          {formatBytes(file.sizeBytes)}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "cursor-help font-mono text-[9.5px] uppercase tracking-widest2",
                INTEGRITY_TEXT[file.integrity],
              )}
            >
              {file.integrity}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="normal-case tracking-normal">
            SHA-256 {shortHash(file.sha256, 16, 8)}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant={file.viewer === "unsupported" ? "default" : "open"}
          size="sm"
          onClick={onView}
          aria-label={`View ${file.filename}`}
        >
          <Eye className="h-3 w-3" />
          View
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              disabled={!file.url}
              aria-label={`Download ${file.filename}`}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {file.url ? `Download ${formatBytes(file.sizeBytes)}` : "Unavailable"}
          </TooltipContent>
        </Tooltip>
      </div>

      {file.viewer === "unsupported" && (
        <Badge variant="neutral" size="sm" className="shrink-0">
          External tool
        </Badge>
      )}
    </div>
  );
}
