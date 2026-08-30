"use client";

import * as React from "react";
import type { CaseRecord, EvidenceFile } from "@/types";
import { EvidenceLocker } from "@/components/evidence/evidence-locker";
import { Workstation } from "@/components/workstation/workstation";

const OPEN_DELAY_MS = 230;

export function CaseWorkspace({
  record,
  evidence,
}: {
  record: CaseRecord;
  evidence: EvidenceFile[];
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  React.useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  /**
   * VIEW plays a short green pulse on the evidence row first, then hands
   * over to the console — the artefact "materialises" rather than popping.
   */
  const handleView = React.useCallback((id: string) => {
    setPendingId(id);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setActiveId(id);
      setOpen(true);
      setPendingId(null);
    }, OPEN_DELAY_MS);
  }, []);

  const handleDownload = React.useCallback((file: EvidenceFile) => {
    if (!file.url) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] px-5 pb-24 sm:px-8">
        <EvidenceLocker
          evidence={evidence}
          onView={handleView}
          onDownload={handleDownload}
          pendingId={pendingId}
          activeId={open ? activeId : null}
        />
      </div>

      <Workstation
        open={open}
        caseRecord={record}
        evidence={evidence}
        activeId={activeId}
        onSelect={setActiveId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
