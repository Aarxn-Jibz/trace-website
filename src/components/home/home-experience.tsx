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

function ScrollTraceLetter({ letter, index, progress }: { letter: string; index: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const opacity = useTransform(progress, [index * 0.16, index * 0.16 + 0.12], [0.08, 1]);
  return <motion.span style={{ opacity }}>{letter}</motion.span>;
}

function TraceWord({ progress }: { progress?: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  return (
    <div className="trace-word" aria-hidden="true">
      {"TRACE".split("").map((letter, index) => progress ? <ScrollTraceLetter key={letter} letter={letter} index={index} progress={progress} /> : <span className="hero-letter" key={letter}>{letter}</span>)}
    </div>
  );
}

function DecodeStep({ step, index, progress, reduce }: { step: (typeof STEPS)[number]; index: number; progress: ReturnType<typeof useScroll>["scrollYProgress"]; reduce: boolean | null }) {
  const center = index / 4;
  const opacity = useTransform(progress, [Math.max(0, center - 0.14), center, Math.min(1, center + 0.14)], [0, 1, 0]);
  const travel = useTransform(progress, [Math.max(0, center - 0.14), center, Math.min(1, center + 0.14)], [index % 2 ? -80 : 80, 0, index % 2 ? 50 : -50]);
  return <motion.article className={`decode-copy decode-copy-${index + 1}`} style={reduce ? undefined : { opacity, x: travel }}><span className="decode-letter">{step.letter}</span><div><h2>{step.word}</h2><p>{step.copy}</p></div></motion.article>;
}

function DecodeScene() {
  const ref = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 0.45, 1], ["10vw", "-4vw", "-20vw"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.76, 1.12]);

  return (
    <section ref={ref} className="decode" aria-label="What TRACE means">
      <div className="decode-sticky">
        <motion.div className="decode-word" style={reduce ? undefined : { x, scale }}>
          <TraceWord progress={scrollYProgress} />
        </motion.div>
        {STEPS.map((step, index) => <DecodeStep key={step.letter} step={step} index={index} progress={scrollYProgress} reduce={reduce} />)}
        <motion.div className="trace-beam" style={{ scaleX: scrollYProgress }} />
      </div>
    </section>
  );
}

function Cases() {
  return (
    <section id="cases" className="case-arrival">
      <header className="case-arrival-head">
        <p>Three investigations</p>
        <h2>The traces are waiting.</h2>
      </header>
      <div className="dossier-stage">
        {CASES.map((item, index) => {
          const released = item.status === "released";
          const body = (
            <motion.article
              className={`dossier dossier-${index + 1} ${released ? "dossier-open" : "dossier-locked"}`}
              whileHover={released ? { y: -10, rotate: -0.35 } : undefined}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <div className="dossier-edge" />
              <span className="dossier-number">{item.number}</span>
              <div className="dossier-bottom">
                <div>
                  <p>CASE {item.number}</p>
                  <h3>{released ? "RELEASED" : "SEALED"}</h3>
                </div>
                {released ? <ArrowUpRight aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
              </div>
              {released && <span className="dossier-action">OPEN DOSSIER</span>}
              {!released && <span className="seal-line" />}
            </motion.article>
          );
          return released ? <Link key={item.id} href={`/case/${item.id}`} aria-label={`Open Case ${item.number}`}>{body}</Link> : <div key={item.id}>{body}</div>;
        })}
      </div>
    </section>
  );
}

export function HomeExperience() {
  const reduce = useReducedMotion();
  return (
    <main className="home-shell">
      <header className="site-mark"><Link href="/">TRACE</Link><a href="#cases">CASES <span>↘</span></a></header>
      <section className="hero">
        <div className="hero-haze" />
        <motion.div className="hero-spark" initial={reduce ? false : { scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 0.18], opacity: [0, 1, 0] }} transition={{ duration: 1.3, delay: 0.65 }} />
        <h1 className="sr-only">TRACE — Cybercrime Investigation Challenge</h1>
        <TraceWord />
        <motion.p initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ delay: 1.5, duration: 0.8 }}>
          Cybercrime investigation challenge
        </motion.p>
        <a className="hero-scroll" href="#decode"><ArrowDown /> <span>Enter TRACE</span></a>
      </section>
      <div id="decode"><DecodeScene /></div>
      <Cases />
      <footer className="home-footer"><span>TRACK · RETRIEVE · ANALYZE · CORRELATE · EXAMINE</span><Link href="/case/1">BEGIN CASE 01 →</Link></footer>
    </main>
  );
}
