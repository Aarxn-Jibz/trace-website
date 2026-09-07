"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, FlaskConical, X } from "lucide-react";

const CYBERCHEF_URL = "https://gchq.github.io/CyberChef/";
const LOADING_DURATION = 1900;

export function CyberChefWorkstation({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const closeButton = React.useRef<HTMLButtonElement>(null);

  const closeChamber = React.useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, reduce ? 100 : 1380);
  }, [closing, onClose, reduce]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), reduce ? 120 : LOADING_DURATION);
    closeButton.current?.focus();
    return () => window.clearTimeout(timer);
  }, [reduce]);

  React.useEffect(() => {
    const previous = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChamber();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeChamber]);

  return (
    <motion.div className="cyberchef-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="CyberChef analysis workstation">
      <motion.div className="cyberchef-flight" animate={closing && !reduce ? { x: [0, -65, 150, 40, 420, "125vw"], y: [0, -70, 95, -125, -25, "18vh"], rotate: [0, -8, 18, -22, 9, 32], scale: [1, .82, .68, .55, .42, .28] } : undefined} transition={{ duration: reduce ? .1 : 1.32, times: [0, .16, .34, .54, .73, 1], ease: "easeInOut" }}>
        {closing && !reduce && <motion.div className="plane-tail" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1.45], opacity: [0, 1, 0] }} transition={{ duration: 1.1, delay: .18, ease: "easeOut" }} />}
        {closing && !reduce && <motion.div className="paper-plane-mark" initial={{ opacity: 0, scale: .35 }} animate={{ opacity: [0, 0, 1, 1], scale: [.35, .48, 1, 1] }} transition={{ duration: .68, times: [0, .32, .7, 1] }} aria-hidden="true"><span /></motion.div>}
      <motion.section className={`cyberchef-chamber ${closing ? "is-closing" : ""}`} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }} animate={closing && !reduce ? { scaleY: [1, .62, .28], scaleX: [1, .78, .38], clipPath: ["polygon(.35% 1%,12% .25%,25% .8%,39% .22%,55% .65%,72% .18%,88% .75%,99.65% .35%,99.3% 19%,99.8% 38%,99.25% 59%,99.7% 78%,99.35% 99.5%,83% 99.15%,65% 99.65%,48% 99.05%,29% 99.7%,13% 99.1%,.3% 99.6%,.65% 78%,.15% 58%,.7% 37%,.2% 18%)", "polygon(0 0,100% 50%,0 100%,22% 50%)", "polygon(0 0,100% 50%,0 100%,30% 50%)"] } : { opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 12 }} transition={closing ? { duration: reduce ? .1 : .42, ease: [0.6, 0, 0.85, 0.35] } : { duration: reduce ? .1 : .36, ease: [0.16, 1, 0.3, 1] }}>
        <header className="cyberchef-topbar">
          <div><FlaskConical aria-hidden="true" /><span>TRACE</span> · ALCHEMY LAB</div>
          <p>{ready ? "MUGGLE TECHNOLOGY ACTIVE" : "ARCANE INTERFACE TRANSITION"}</p>
          <button ref={closeButton} onClick={closeChamber} aria-label="Exit CyberChef"><X /></button>
        </header>

        <div className="cyberchef-stage">
          <iframe className={`cyberchef-frame ${ready ? "is-visible" : ""}`} src={CYBERCHEF_URL} title="CyberChef" referrerPolicy="no-referrer" />
          <AnimatePresence>
            {!ready && <motion.div className="muggle-loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="muggle-loader-sigil" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}><FlaskConical /></motion.div>
              <p>LOADING MUGGLE TECHNOLOGIES…</p>
              <span>Translating spellcraft into practical analysis.</span>
              <div className="muggle-progress" aria-label="Loading"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduce ? 0.1 : LOADING_DURATION / 1000, ease: "easeInOut" }} /></div>
            </motion.div>}
          </AnimatePresence>
        </div>

        <footer className="cyberchef-footer">
          <span>CyberChef · The Cyber Swiss Army Knife</span>
          <a href={CYBERCHEF_URL} target="_blank" rel="noreferrer"><ExternalLink /> OPEN IN NEW TAB</a>
        </footer>
      </motion.section>
      </motion.div>
    </motion.div>
  );
}
