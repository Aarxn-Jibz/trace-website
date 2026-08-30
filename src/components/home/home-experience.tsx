"use client";

import Link from "next/link";
import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, LockKeyhole } from "lucide-react";
import { CASES } from "@/data/trace";

const STEPS = [
  { letter: "T", word: "TRACK", copy: "Follow activity across systems and time." },
  { letter: "R", word: "RETRIEVE", copy: "Recover the artifacts that preserve the incident." },
  { letter: "A", word: "ANALYZE", copy: "Read technical evidence with the right tools." },
  { letter: "C", word: "CORRELATE", copy: "Connect independent traces until they agree." },
  { letter: "E", word: "EXAMINE", copy: "Test the reconstruction against every artifact." },
];

type Progress = ReturnType<typeof useScroll>["scrollYProgress"];

function JourneyLetter({ letter, index, progress, reduce }: { letter: string; index: number; progress: Progress; reduce: boolean | null }) {
  const stage = 0.2 + index * 0.145;
  const opacity = useTransform(progress, [0, 0.1, Math.max(0.11, stage - 0.07), stage, Math.min(0.94, stage + 0.08), 1], [1, 1, 0.12, 1, 0.15, 0.82]);
  const brightness = useTransform(progress, [Math.max(0, stage - 0.06), stage, Math.min(1, stage + 0.07)], [0.55, 1.45, 0.55]);
  const filter = useTransform(brightness, (value) => `brightness(${value})`);
  return <motion.span className={`journey-letter journey-letter-${index + 1}`} style={reduce ? undefined : { opacity, filter }}>{letter}</motion.span>;
}

function JourneyStep({ step, index, progress, reduce }: { step: (typeof STEPS)[number]; index: number; progress: Progress; reduce: boolean | null }) {
  const stage = 0.2 + index * 0.145;
  const opacity = useTransform(progress, [stage - 0.07, stage, stage + 0.08], [0, 1, 0]);
  const x = useTransform(progress, [stage - 0.07, stage, stage + 0.08], [index % 2 ? -90 : 90, 0, index % 2 ? 55 : -55]);
  return (
    <motion.article className={`journey-step journey-step-${index + 1}`} style={reduce ? undefined : { opacity, x }}>
      <span>{step.letter}</span>
      <div><h2>{step.word}</h2><p>{step.copy}</p></div>
    </motion.article>
  );
}

function TraceJourney() {
  const ref = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const wordScale = useTransform(scrollYProgress, [0, 0.11, 0.45, 0.88, 1], [1, 1, 0.77, 1.05, 0.66]);
  const wordX = useTransform(scrollYProgress, [0, 0.22, 0.5, 0.82, 1], ["0vw", "7vw", "-8vw", "5vw", "0vw"]);
  const wordY = useTransform(scrollYProgress, [0, 0.1, 0.5, 0.9, 1], ["0vh", "-4vh", "4vh", "-3vh", "0vh"]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.07, 0.12], [1, 1, 0]);
  const fogShift = useTransform(scrollYProgress, [0, 1], ["-5%", "9%"]);
  const fogReverse = useTransform(fogShift, (value) => `calc(${value} * -1)`);

  return (
    <section ref={ref} id="trace-journey" className="trace-journey" aria-label="TRACE — Track, Retrieve, Analyze, Correlate, Examine">
      <div className="journey-sticky">
        <motion.div className="journey-fog journey-fog-a" style={reduce ? undefined : { x: fogShift }} />
        <motion.div className="journey-fog journey-fog-b" style={reduce ? undefined : { x: fogReverse }} />
        <motion.div className="journey-word" style={reduce ? undefined : { scale: wordScale, x: wordX, y: wordY }}>
          {"TRACE".split("").map((letter, index) => <JourneyLetter key={letter} letter={letter} index={index} progress={scrollYProgress} reduce={reduce} />)}
          <span className="journey-engraving" />
        </motion.div>
        <motion.div className="journey-intro" style={reduce ? undefined : { opacity: introOpacity }}>
          <h1 className="sr-only">TRACE — Cybercrime Investigation Challenge</h1>
          <p>Cybercrime investigation challenge</p>
          <a href="#cases"><ArrowDown /><span>Enter TRACE</span></a>
        </motion.div>
        {STEPS.map((step, index) => <JourneyStep key={step.letter} step={step} index={index} progress={scrollYProgress} reduce={reduce} />)}
        <motion.div className="journey-progress" style={{ scaleX: scrollYProgress }} />
      </div>
    </section>
  );
}

function Cases() {
  return (
    <section id="cases" className="case-arrival">
      <header className="case-arrival-head"><p>Three investigations</p><h2>The traces are waiting.</h2></header>
      <div className="dossier-stage">
        {CASES.map((item, index) => {
          const released = item.status === "released";
          const body = (
            <motion.article className={`dossier dossier-${index + 1} ${released ? "dossier-open" : "dossier-locked"}`} whileHover={released ? { y: -10, rotate: -0.35 } : undefined} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
              <div className="dossier-edge" /><span className="dossier-number">{item.number}</span>
              <div className="dossier-bottom"><div><p>CASE {item.number}</p><h3>{released ? "RELEASED" : "SEALED"}</h3></div>{released ? <ArrowUpRight aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}</div>
              {released ? <span className="dossier-action">OPEN DOSSIER</span> : <span className="seal-line" />}
            </motion.article>
          );
          return released ? <Link key={item.id} href={`/case/${item.id}`} aria-label={`Open Case ${item.number}`}>{body}</Link> : <div key={item.id}>{body}</div>;
        })}
      </div>
    </section>
  );
}

export function HomeExperience() {
  return (
    <main className="home-shell">
      <header className="site-mark"><Link href="/">TRACE</Link><a href="#cases">CASES <span>↘</span></a></header>
      <TraceJourney />
      <Cases />
      <footer className="home-footer"><span>TRACK · RETRIEVE · ANALYZE · CORRELATE · EXAMINE</span><Link href="/case/1">BEGIN CASE 01 →</Link></footer>
    </main>
  );
}
