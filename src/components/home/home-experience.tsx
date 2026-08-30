"use client";

import Link from "next/link";
import * as React from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const opacity = useTransform(progress, [0, 0.08, Math.max(0.1, stage - 0.07), stage, 1], [0.78, 0.46, 0.2, 1, 1]);
  const brightness = useTransform(progress, [0, Math.max(0, stage - 0.06), stage, 1], [0.72, 0.42, 1.32, 1]);
  const filter = useTransform(brightness, (value) => `brightness(${value}) contrast(1.08)`);
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
  const [lightning, setLightning] = React.useState<"quiet" | "distant" | "strong" | "after">("quiet");
  const [strike, setStrike] = React.useState(0);
  const [activeStage, setActiveStage] = React.useState(-1);
  const stageRef = React.useRef(-1);
  const flashTimers = React.useRef<number[]>([]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const wordScale = useTransform(scrollYProgress, [0, 0.11, 0.45, 0.88, 1], [1, 1, 0.77, 1.05, 0.66]);
  const wordX = useTransform(scrollYProgress, [0, 0.22, 0.5, 0.82, 1], ["0vw", "7vw", "-8vw", "5vw", "0vw"]);
  const wordY = useTransform(scrollYProgress, [0, 0.1, 0.5, 0.9, 1], ["0vh", "-4vh", "4vh", "-3vh", "0vh"]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.07, 0.12], [1, 1, 0]);
  const cloudShift = useTransform(scrollYProgress, [0, 1], ["-7%", "8%"]);
  const cloudReverse = useTransform(cloudShift, (value) => `calc(${value} * -0.72)`);

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
    let stopped = false;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (stopped) return;
        fireLightning(Math.random() > 0.62 ? "strong" : "distant");
        schedule();
      }, 3800 + Math.random() * 5200);
    };
    const opening = window.setTimeout(() => fireLightning("strong"), 720);
    schedule();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.clearTimeout(opening);
      flashTimers.current.forEach(window.clearTimeout);
    };
  }, [fireLightning, reduce]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextStage = STEPS.reduce((found, _, index) => value >= 0.16 + index * 0.145 ? index : found, -1);
    if (nextStage === stageRef.current) return;
    stageRef.current = nextStage;
    setActiveStage(nextStage);
    if (nextStage >= 0) fireLightning(nextStage === 3 || nextStage === 4 ? "strong" : "distant");
  });

  return (
    <section ref={ref} id="trace-journey" className="trace-journey" aria-label="TRACE — Track, Retrieve, Analyze, Correlate, Examine">
      <div className={`journey-sticky lightning-${lightning} storm-stage-${activeStage + 1}`}>
        <div className="storm-depth" />
        <motion.div className="storm-cloud storm-cloud-far" style={reduce ? undefined : { x: cloudReverse }} />
        <motion.div className="storm-cloud storm-cloud-mid" style={reduce ? undefined : { x: cloudShift }} />
        <motion.div className="storm-cloud storm-cloud-near" style={reduce ? undefined : { x: cloudReverse }} />
        <div className="storm-illumination" />
        {lightning === "strong" && <svg key={strike} className="storm-bolt" viewBox="0 0 1000 700" aria-hidden="true"><path d="M744 -30 690 112l-40 28 22 51-73 67 17 46-109 102"/><path d="m651 139-71 5-43 53"/><path d="m614 303-69 19-31 59"/></svg>}
        <div className="storm-vignette" />
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
