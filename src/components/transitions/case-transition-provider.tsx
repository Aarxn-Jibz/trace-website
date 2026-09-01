"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./case-transition.module.css";

type TransitionPhase = "idle" | "preparing" | "flight" | "drop" | "open" | "cover" | "reduced" | "reveal";

type CaseTransitionContextValue = {
  isTransitioning: boolean;
  startCaseOneTransition: () => void;
};

const CaseTransitionContext = React.createContext<CaseTransitionContextValue | null>(null);

export function shouldUseCaseTransition(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
}

export function useCaseTransition() {
  const context = React.useContext(CaseTransitionContext);
  if (!context) throw new Error("useCaseTransition must be used inside CaseTransitionProvider");
  return context;
}

export function CaseTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<TransitionPhase>("idle");
  const phaseRef = React.useRef<TransitionPhase>("idle");
  const pathnameRef = React.useRef(pathname);
  const timers = React.useRef<number[]>([]);
  const owlReady = React.useRef<Promise<void> | null>(null);

  const transitionTo = React.useCallback((next: TransitionPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const schedule = React.useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }, []);

  const prepareOwl = React.useCallback(() => {
    if (!owlReady.current) {
      const owl = new window.Image();
      owl.src = "/images/case-owl.webp";
      owlReady.current = owl.decode().catch(() => undefined);
    }
    return owlReady.current;
  }, []);

  React.useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  React.useEffect(() => {
    if (pathname !== "/") return;
    router.prefetch("/case/1");
    void prepareOwl();
  }, [pathname, prepareOwl, router]);

  React.useEffect(() => clearTimers, [clearTimers]);

  const startCaseOneTransition = React.useCallback(() => {
    if (phaseRef.current !== "idle") return;
    clearTimers();

    if (reduce) {
      transitionTo("reduced");
      schedule(() => router.push("/case/1", { scroll: true }), 120);
      schedule(() => {
        if (pathnameRef.current !== "/case/1") window.location.assign("/case/1");
      }, 2600);
      return;
    }

    transitionTo("preparing");
    void prepareOwl().then(() => {
      if (phaseRef.current !== "preparing") return;
      transitionTo("flight");
      schedule(() => transitionTo("drop"), 1050);
      schedule(() => transitionTo("open"), 1550);
      schedule(() => transitionTo("cover"), 1870);
      schedule(() => router.push("/case/1", { scroll: true }), 2040);
      schedule(() => {
        if (pathnameRef.current !== "/case/1") window.location.assign("/case/1");
      }, 5000);
    });
  }, [clearTimers, prepareOwl, reduce, router, schedule, transitionTo]);

  React.useEffect(() => {
    if (pathname !== "/case/1" || (phase !== "cover" && phase !== "reduced")) return;
    const reveal = window.setTimeout(() => transitionTo("reveal"), 80);
    return () => window.clearTimeout(reveal);
  }, [pathname, phase, transitionTo]);

  React.useEffect(() => {
    if (phase !== "reveal") return;
    const finish = window.setTimeout(() => {
      transitionTo("idle");
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-case-heading]")?.focus());
    }, 520);
    return () => window.clearTimeout(finish);
  }, [phase, transitionTo]);

  const isTransitioning = phase !== "idle";

  React.useEffect(() => {
    if (!isTransitioning) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isTransitioning]);

  const rigPosition = phase === "flight" || phase === "drop" || phase === "open" || phase === "cover"
    ? { x: "18vw", y: "-12vh", rotate: -3, scale: 0.94, opacity: 1 }
    : phase === "preparing"
      ? { x: "76vw", y: "-24vh", rotate: -9, scale: 0.7, opacity: 0 }
      : { x: "18vw", y: "-12vh", rotate: -3, scale: 0.94, opacity: 0 };

  const owlPosition = phase === "flight"
    ? { x: 0, y: 0, rotate: 0, opacity: 1 }
    : phase === "drop" || phase === "open" || phase === "cover"
      ? { x: "-102vw", y: "-15vh", rotate: -10, opacity: 1 }
      : { x: 0, y: 0, rotate: 0, opacity: 0 };

  const envelopePosition = phase === "flight"
    ? { x: "var(--envelope-grip-x)", y: 0, rotate: -4, scale: 0.72, opacity: 1 }
    : phase === "drop" || phase === "open" || phase === "cover"
      ? { x: "-18vw", y: "26vh", rotate: 2, scale: 1, opacity: 1 }
      : { x: "var(--envelope-grip-x)", y: 0, rotate: -4, scale: 0.72, opacity: 0 };

  return (
    <CaseTransitionContext.Provider value={{ isTransitioning, startCaseOneTransition }}>
      {children}
      <span className="sr-only" role="status" aria-live="polite">{isTransitioning ? "Opening Case 01" : ""}</span>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: phase === "reveal" ? 0 : 1 }} exit={{ opacity: 0 }} transition={{ duration: phase === "reveal" ? 0.5 : 0.12 }} aria-hidden="true">
            <motion.div className={styles.backdrop} animate={{ opacity: phase === "reveal" ? 0 : 1 }} />

            <motion.div
              className={styles.flightRig}
              initial={{ x: "76vw", y: "-24vh", rotate: -9, scale: 0.7, opacity: 0 }}
              animate={rigPosition}
              transition={phase === "flight" ? { duration: 1.05, ease: [0.16, 0.78, 0.18, 1] } : { duration: 0.78, ease: [0.36, 0, 0.72, 1] }}
            >
              <motion.div
                className={styles.owl}
                animate={owlPosition}
                transition={phase === "drop" || phase === "open" || phase === "cover"
                  ? { duration: 0.78, ease: [0.36, 0, 0.72, 1] }
                  : { duration: 0.12 }}
              >
                <Image className={styles.owlImage} src="/images/case-owl.webp" alt="" width={1197} height={800} priority unoptimized draggable={false} />
              </motion.div>

              <motion.div
                className={styles.envelope}
                data-phase={phase}
                initial={{ x: "var(--envelope-grip-x)", y: 0, rotate: -4, scale: 0.72, opacity: 0 }}
                animate={envelopePosition}
                transition={phase === "drop" ? { duration: 0.5, ease: [0.18, 0.76, 0.3, 1] } : { duration: phase === "flight" ? 0.28 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.letter} />
                <span className={styles.envelopeBack} />
                <span className={styles.flap} />
                <span className={styles.envelopeFront} />
                <span className={styles.seal}>01</span>
                <span className={styles.impactShadow} />
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.paperCover}
              initial={false}
              animate={(phase === "cover" || phase === "reduced" || phase === "reveal")
                ? { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: phase === "reveal" ? 0 : 1 }
                : { clipPath: "inset(50% 46% 50% 46% round 18px)", opacity: 0 }}
              transition={{ duration: phase === "reduced" ? 0.16 : phase === "reveal" ? 0.5 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CaseTransitionContext.Provider>
  );
}
