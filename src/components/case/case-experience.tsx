"use client";

import Link from "next/link";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, FileText, FlaskConical, LockKeyhole } from "lucide-react";
import type { EvidenceFile, TraceCase } from "@/data/trace";
import { Button } from "@/components/ui/button";
import { CyberChefWorkstation } from "@/components/cyberchef/cyberchef-workstation";
import { Workstation } from "@/components/workstation/workstation";

export function CaseExperience({ traceCase }: { traceCase: TraceCase }) {
  const [workstationOpen, setWorkstationOpen] = React.useState(false);
  const [cyberChefOpen, setCyberChefOpen] = React.useState(false);
  const [files, setFiles] = React.useState<EvidenceFile[]>([]);
  const [evidenceStatus, setEvidenceStatus] = React.useState<"loading" | "ready" | "error">(
    traceCase.status === "released" ? "loading" : "ready",
  );
  const reduce = useReducedMotion();
  const locked = traceCase.status === "locked";

  React.useEffect(() => {
    if (locked) return;

    const controller = new AbortController();
    setEvidenceStatus("loading");
    fetch(`/api/cases/${traceCase.id}/evidence`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ evidence?: EvidenceFile[] }>;
      })
      .then((data) => {
        if (!Array.isArray(data.evidence)) throw new Error("Invalid evidence manifest");
        setFiles(data.evidence);
        setEvidenceStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("[case] evidence manifest fetch failed:", error);
        setFiles([]);
        setEvidenceStatus("error");
      });

    return () => controller.abort();
  }, [locked, traceCase.id]);

  const evidenceSummary = evidenceStatus === "loading"
    ? "Loading sealed artifacts…"
    : evidenceStatus === "error"
      ? "Evidence manifest unavailable"
      : `${files.length} sealed artifacts available`;

  return (
    <main className={locked ? "case-page" : "case-desktop"}>
      {locked ? <>
        <nav className="case-nav"><Link href="/"><ArrowLeft /> TRACE</Link><span>CASE {traceCase.number}</span></nav>
        <section className="case-hero">
          <motion.span initial={reduce ? false : { x: "-12vw" }} animate={{ x: 0 }} transition={{ duration: 0.8 }} className="case-ghost">{traceCase.number}</motion.span>
          <p>SEALED</p><h1 data-case-heading tabIndex={-1}>CASE <em>{traceCase.number}</em></h1><div className="case-rule" />
          <p className="case-intro">This investigation is not yet available.</p>
        </section>
        <section className="locked-case"><LockKeyhole /><h2>SEALED</h2><p>Return when this case is released.</p><Button asChild variant="quiet"><Link href="/">BACK TO CASES</Link></Button></section>
      </> : <>
        <header className="desktop-bar"><Link href="/" aria-label="Return to TRACE"><ArrowLeft /><span>TRACE</span></Link><p>CASE {traceCase.number} · FORENSIC DESKTOP</p><span>RELEASED</span></header>
        <section className="desktop-space" aria-labelledby="desktop-title">
          <div className="desktop-copy"><p>CASE <span className="case-number">{traceCase.number}</span></p><h1 id="desktop-title">The evidence is waiting.</h1><span>{evidenceSummary}</span></div>
          <div className="desktop-icons">
            <button className="desktop-icon" disabled={evidenceStatus !== "ready"} onClick={() => setWorkstationOpen(true)} aria-label="Files. Click to open"><FileText /><strong>FILES</strong><span>{evidenceStatus === "ready" ? `${files.length} EVIDENCE ITEMS` : evidenceStatus.toUpperCase()}</span></button>
            <button className="desktop-icon" onClick={() => setCyberChefOpen(true)} aria-label="Open CyberChef"><FlaskConical /><strong>CYBERCHEF</strong><span>ANALYSIS LAB</span></button>
          </div>
          <p className="desktop-hint">CLICK FILES TO INSPECT EVIDENCE</p>
        </section>
      </>}
      <AnimatePresence>
        {workstationOpen && <Workstation caseId={traceCase.id} files={files} onClose={() => setWorkstationOpen(false)} />}
        {cyberChefOpen && <CyberChefWorkstation onClose={() => setCyberChefOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}
