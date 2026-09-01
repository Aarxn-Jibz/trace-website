"use client";

import Link from "next/link";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Download, Eye, LockKeyhole } from "lucide-react";
import type { EvidenceFile, TraceCase } from "@/data/trace";
import { Button } from "@/components/ui/button";
import { Workstation } from "@/components/workstation/workstation";

export function CaseExperience({ traceCase }: { traceCase: TraceCase }) {
  const [selected, setSelected] = React.useState<EvidenceFile | null>(null);
  const [workstationOpen, setWorkstationOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const locked = traceCase.status === "locked";

  function view(file: EvidenceFile) { setSelected(file); setWorkstationOpen(true); }
  function download(file: EvidenceFile) {
    const blob = new Blob([file.content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = file.name; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="case-page">
      <nav className="case-nav"><Link href="/"><ArrowLeft /> TRACE</Link><span>CASE {traceCase.number}</span></nav>
      <section className="case-hero">
        <motion.span initial={reduce ? false : { x: "-12vw" }} animate={{ x: 0 }} transition={{ duration: 0.8 }} className="case-ghost">{traceCase.number}</motion.span>
        <p>{locked ? "SEALED" : "RELEASED"}</p>
        <h1 data-case-heading tabIndex={-1}>CASE <em>{traceCase.number}</em></h1>
        <div className="case-rule" />
        <p className="case-intro">{locked ? "This investigation is not yet available." : "Inspect the evidence. Correlate the traces. Reconstruct what happened."}</p>
      </section>
      {locked ? (
        <section className="locked-case"><LockKeyhole /><h2>SEALED</h2><p>Return when this case is released.</p><Button asChild variant="quiet"><Link href="/">BACK TO CASES</Link></Button></section>
      ) : (
        <section className="evidence-locker">
          <header><span>EVIDENCE LOCKER</span><p>{traceCase.evidence.length} demonstration artifacts</p></header>
          <div className="evidence-list">
            {traceCase.evidence.map((file, index) => (
              <article key={file.id}>
                <span className="evidence-index">{String(index + 1).padStart(2, "0")}</span>
                <div><h2>{file.name}</h2><p>{file.size} · {file.type === "unsupported" ? "External tool" : file.type}</p></div>
                <div className="evidence-actions">
                  <Button variant="quiet" onClick={() => view(file)}><Eye /> VIEW</Button>
                  <button aria-label={`Download ${file.name}`} onClick={() => download(file)}><Download /></button>
                </div>
              </article>
            ))}
          </div>
          <p className="mock-note">Demonstration evidence only. Production artifacts will be delivered after server-side release checks.</p>
        </section>
      )}
      <AnimatePresence>
        {workstationOpen && selected && <Workstation files={traceCase.evidence} initialFile={selected} onClose={() => setWorkstationOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}
