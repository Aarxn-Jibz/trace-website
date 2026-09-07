"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, FlaskConical, X } from "lucide-react";

const CYBERCHEF_URL = "https://gchq.github.io/CyberChef/";
const LOADING_DURATION = 1900;

export function CyberChefWorkstation({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const closeButton = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), reduce ? 120 : LOADING_DURATION);
    closeButton.current?.focus();
    return () => window.clearTimeout(timer);
  }, [reduce]);

  React.useEffect(() => {
    const previous = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div className="cyberchef-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="CyberChef analysis workstation">
      <motion.section className="cyberchef-chamber" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 12 }} transition={{ duration: reduce ? 0.1 : 0.36, ease: [0.16, 1, 0.3, 1] }}>
        <header className="cyberchef-topbar">
          <div><FlaskConical aria-hidden="true" /><span>TRACE</span> · ALCHEMY LAB</div>
          <p>{ready ? "MUGGLE TECHNOLOGY ACTIVE" : "ARCANE INTERFACE TRANSITION"}</p>
          <button ref={closeButton} onClick={onClose} aria-label="Exit CyberChef"><X /></button>
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
  );
}
