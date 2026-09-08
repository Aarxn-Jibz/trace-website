"use client";

import Link from "next/link";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, FileText, FlaskConical, LockKeyhole } from "lucide-react";
import type { TraceCase } from "@/data/trace";
import { Button } from "@/components/ui/button";
import { CyberChefWorkstation } from "@/components/cyberchef/cyberchef-workstation";
import { Workstation } from "@/components/workstation/workstation";

export function CaseExperience({ traceCase }: { traceCase: TraceCase }) {
  const [workstationOpen, setWorkstationOpen] = React.useState(false);
  const [cyberChefOpen, setCyberChefOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const locked = traceCase.status === "locked";

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
          <div className="desktop-copy"><p>CASE <span className="case-number">{traceCase.number}</span></p><h1 id="desktop-title">The evidence is waiting.</h1><span>{traceCase.evidence.length} sealed artifacts available</span></div>
          <div className="desktop-icons">
            <button className="desktop-icon" onDoubleClick={() => setWorkstationOpen(true)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setWorkstationOpen(true); }} onClick={(event) => event.currentTarget.focus()} aria-label="Files. Double click to open"><FileText /><strong>FILES</strong><span>{traceCase.evidence.length} EVIDENCE ITEMS</span></button>
            <button className="desktop-icon" onClick={() => setCyberChefOpen(true)} aria-label="Open CyberChef"><FlaskConical /><strong>CYBERCHEF</strong><span>ANALYSIS LAB</span></button>
          </div>
          <p className="desktop-hint">DOUBLE-CLICK FILES TO INSPECT EVIDENCE</p>
        </section>
      </>}
      <AnimatePresence>
        {workstationOpen && <Workstation caseId={traceCase.id} files={traceCase.evidence} onClose={() => setWorkstationOpen(false)} />}
        {cyberChefOpen && <CyberChefWorkstation onClose={() => setCyberChefOpen(false)} />}
      </AnimatePresence>
    </main>
  );
}
