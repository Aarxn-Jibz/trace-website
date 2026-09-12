"use client";

import Link from "next/link";
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, LockKeyhole } from "lucide-react";
import { CASES, isCaseReleased } from "@/data/trace";
import { shouldUseCaseTransition, useCaseTransition } from "@/components/transitions/case-transition-provider";

const STEPS = [
  { letter: "T", word: "TRACK", copy: "Follow activity across systems and time." },
  { letter: "R", word: "RETRIEVE", copy: "Recover the artifacts that preserve the incident." },
  { letter: "A", word: "ANALYZE", copy: "Read technical evidence with the right tools." },
  { letter: "C", word: "CORRELATE", copy: "Connect independent traces until they agree." },
  { letter: "E", word: "EXAMINE", copy: "Test the reconstruction against every artifact." },
];

const INTRO_DURATION = 2400;
const STAGE_DURATION = 1150;

function JourneyLetter({ letter, index, activeStage, reduce }: { letter: string; index: number; activeStage: number; reduce: boolean | null }) {
  const resting = activeStage < 0 || activeStage >= STEPS.length;
  const active = activeStage === index;
  const opacity = resting || active ? 1 : 0.14;
  const brightness = resting ? 1 : active ? 1.45 : 0.55;
  return (
    <motion.span
      className={`journey-letter journey-letter-${index + 1}`}
      animate={reduce ? undefined : { opacity, filter: `brightness(${brightness})` }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="journey-letter-glyph">{letter}</span>
    </motion.span>
  );
}

function JourneyStep({ step, index, activeStage, reduce }: { step: (typeof STEPS)[number]; index: number; activeStage: number; reduce: boolean | null }) {
  const active = activeStage === index;
  const inactiveX = activeStage > index ? (index % 2 ? 55 : -55) : (index % 2 ? -90 : 90);
  return (
    <motion.article
      className={`journey-step journey-step-${index + 1}`}
      initial={false}
      animate={reduce ? undefined : { opacity: active ? 1 : 0, x: active ? 0 : inactiveX }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
    >
      <span>{step.letter}</span>
      <div><h2>{step.word}</h2><p>{step.copy}</p></div>
    </motion.article>
  );
}

function TraceJourney() {
  const reduce = useReducedMotion();
  const [lightning, setLightning] = React.useState<"quiet" | "distant" | "strong" | "after">("quiet");
  const [strike, setStrike] = React.useState(0);
  const [activeStage, setActiveStage] = React.useState(-1);
  const flashTimers = React.useRef<number[]>([]);

  const fireLightning = React.useCallback((kind: "distant" | "strong") => {
    if (reduce) return;
    flashTimers.current.forEach(window.clearTimeout);
    flashTimers.current = [];
    setStrike((value) => value + 1);
    setLightning(kind);
    flashTimers.current.push(window.setTimeout(() => setLightning("quiet"), kind === "strong" ? 115 : 90));
    if (kind === "strong") {
      flashTimers.current.push(window.setTimeout(() => setLightning("after"), 285));
      flashTimers.current.push(window.setTimeout(() => setLightning("quiet"), 390));
    }
  }, [reduce]);

  React.useEffect(() => {
    if (reduce) return;
    const opening = window.setTimeout(() => fireLightning("strong"), 720);
    return () => {
      window.clearTimeout(opening);
      flashTimers.current.forEach(window.clearTimeout);
    };
  }, [fireLightning, reduce]);

  React.useEffect(() => {
    if (reduce) return;
    const sequenceTimers = STEPS.map((_, index) => window.setTimeout(() => {
      setActiveStage(index);
      fireLightning(index >= 3 ? "strong" : "distant");
    }, INTRO_DURATION + index * STAGE_DURATION));
    sequenceTimers.push(window.setTimeout(() => setActiveStage(STEPS.length), INTRO_DURATION + STEPS.length * STAGE_DURATION));
    return () => sequenceTimers.forEach(window.clearTimeout);
  }, [fireLightning, reduce]);

  const resting = activeStage < 0 || activeStage >= STEPS.length;
  const sequenceProgress = activeStage < 0 ? 0 : activeStage >= STEPS.length ? 1 : (activeStage + 1) / STEPS.length;

  return (
    <section id="trace-journey" className="trace-journey" aria-label="TRACE — Track, Retrieve, Analyze, Correlate, Examine">
      <div className={`journey-sticky lightning-${lightning} storm-stage-${activeStage + 1}`}>
        <div className="storm-depth" />
        <div className="storm-cloud storm-cloud-far" />
        <div className="storm-cloud storm-cloud-mid" />
        <div className="storm-cloud storm-cloud-near" />
        <div className="storm-illumination" />
        {lightning === "strong" && <svg key={strike} className="storm-bolt" viewBox="0 0 1000 700" aria-hidden="true"><path d="M744 -30 690 112l-40 28 22 51-73 67 17 46-109 102"/><path d="m651 139-71 5-43 53"/><path d="m614 303-69 19-31 59"/></svg>}
        <div className="storm-vignette" />
        <h1 className="sr-only">TRACE — Cybercrime Investigation Challenge</h1>
        <div className="journey-word">
          {"TRACE".split("").map((letter, index) => <JourneyLetter key={letter} letter={letter} index={index} activeStage={activeStage} reduce={reduce} />)}
          <span className="journey-engraving" />
        </div>
        <motion.div className={`journey-intro ${resting ? "" : "is-hidden"}`} animate={reduce ? undefined : { opacity: resting ? 1 : 0 }} transition={{ duration: 0.35 }}>
          <p>Cybercrime investigation challenge</p>
          <a href="#cases" tabIndex={resting ? 0 : -1}><ArrowDown /><span>Enter TRACE</span></a>
        </motion.div>
        {STEPS.map((step, index) => <JourneyStep key={step.letter} step={step} index={index} activeStage={activeStage} reduce={reduce} />)}
        <motion.div className="journey-progress" animate={{ scaleX: sequenceProgress }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </section>
  );
}

function useReleaseClock() {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function Cases({ now }: { now: number }) {
  const { startCaseOneTransition } = useCaseTransition();
  return (
    <section id="cases" className="case-arrival">
      <header className="case-arrival-head"><p>Three investigations</p><h2>The traces are waiting.</h2></header>
      <div className="dossier-stage">
        {CASES.map((item, index) => {
          const released = isCaseReleased(item, now);
          const body = (
            <motion.article className={`dossier dossier-${index + 1} ${released ? "dossier-open" : "dossier-locked"}`} whileHover={released ? { y: -10, rotate: -0.35 } : undefined} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
              <div className="dossier-edge" /><span className="dossier-number">{item.number}</span>
              <div className="dossier-bottom"><div><p>CASE {item.number}</p><h3>{released ? "RELEASED" : "SEALED"}</h3></div>{released ? <ArrowUpRight aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}</div>
              {released ? <span className="dossier-action">OPEN DOSSIER</span> : <span className="seal-line" />}
            </motion.article>
          );
          return released ? <Link key={item.id} href={`/case/${item.id}`} aria-label={`Open Case ${item.number}`} onClick={item.id === "1" ? (event) => {
            if (!shouldUseCaseTransition(event)) return;
            event.preventDefault();
            startCaseOneTransition();
          } : undefined}>{body}</Link> : <div key={item.id}>{body}</div>;
        })}
      </div>
    </section>
  );
}

export function HomeExperience() {
  const { startCaseOneTransition } = useCaseTransition();
  const now = useReleaseClock();
  const caseOneReleased = isCaseReleased(CASES[0], now);
  return (
    <main className="home-shell">
      <header className="site-mark"><Link href="/">TRACE</Link><a href="#cases">CASES <span>↘</span></a></header>
      <TraceJourney />
      <Cases now={now} />
      <footer className="home-footer"><span>TRACK · RETRIEVE · ANALYZE · CORRELATE · EXAMINE</span>{caseOneReleased ? <Link href="/case/1" onClick={(event) => {
        if (!shouldUseCaseTransition(event)) return;
        event.preventDefault();
        startCaseOneTransition();
      }}>BEGIN CASE 01 →</Link> : <span>CASE 01 SEALED</span>}</footer>
    </main>
  );
}
