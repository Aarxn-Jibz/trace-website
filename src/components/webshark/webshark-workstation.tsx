"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Network, X } from "lucide-react";

const WEBSHARK_URL = process.env.NEXT_PUBLIC_WEBSHARK_URL ?? "http://localhost:8085/webshark/";
const LOADING_DURATION = 1900;

// WebShark's UI identifies a pre-mounted capture with this hash in location.hash.
// Keep this in sync with QXIP/webshark-ui's hash helper.
function webSharkHash(value: string, length = 32) {
  const characters = value.split("").map((character) => character.charCodeAt(0));
  const characterCount = characters.length || 1;
  let index = characters.length ? characters.reduce((total, character) => total + character) : 1;
  let result = "";
  let cursor = 0;

  while (result.length < length) {
    const first = characters[cursor++ % characterCount] || 0.5;
    const second = characters[(cursor++ % characterCount) ^ length] || (1.5 ^ length);
    index += (first ^ second) % length;
    result += Math.tan((index * second) / first).toString(16).split(".")[1]?.slice(0, 10) ?? "";
  }

  return result.slice(0, length);
}

export function WebSharkWorkstation({ fileName, captureName, onClose }: { fileName: string; captureName: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const closeButton = React.useRef<HTMLButtonElement>(null);
  const webSharkSrc = `${WEBSHARK_URL}#${encodeURIComponent(webSharkHash(captureName))}`;

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
    <motion.div className="cyberchef-backdrop webshark-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`WebShark packet analysis for ${fileName}`}>
      <motion.div className="cyberchef-flight" animate={closing && !reduce ? { x: [0, -65, 150, 40, 420, "125vw"], y: [0, -70, 95, -125, -25, "18vh"], rotate: [0, -8, 18, -22, 9, 32], scale: [1, .82, .68, .55, .42, .28] } : undefined} transition={{ duration: reduce ? .1 : 1.32, times: [0, .16, .34, .54, .73, 1], ease: "easeInOut" }}>
        {closing && !reduce && <motion.div className="plane-tail" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1.45], opacity: [0, 1, 0] }} transition={{ duration: 1.1, delay: .18, ease: "easeOut" }} />}
        {closing && !reduce && <motion.div className="paper-plane-mark" initial={{ opacity: 0, scale: .35 }} animate={{ opacity: [0, 0, 1, 1], scale: [.35, .48, 1, 1] }} transition={{ duration: .68, times: [0, .32, .7, 1] }} aria-hidden="true"><span /></motion.div>}
        <motion.section className="cyberchef-chamber" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }} animate={closing && !reduce ? { scaleY: [1, .62, .28], scaleX: [1, .78, .38], clipPath: ["polygon(.35% 1%,12% .25%,25% .8%,39% .22%,55% .65%,72% .18%,88% .75%,99.65% .35%,99.3% 19%,99.8% 38%,99.25% 59%,99.7% 78%,99.35% 99.5%,83% 99.15%,65% 99.65%,48% 99.05%,29% 99.7%,13% 99.1%,.3% 99.6%,.65% 78%,.15% 58%,.7% 37%,.2% 18%)", "polygon(0 0,100% 50%,0 100%,22% 50%)", "polygon(0 0,100% 50%,0 100%,30% 50%)"] } : { opacity: 1, scale: 1, y: 0 }} transition={closing ? { duration: reduce ? .1 : .42, ease: [0.6, 0, 0.85, 0.35] } : { duration: reduce ? .1 : .36, ease: [0.16, 1, 0.3, 1] }}>
          <header className="cyberchef-topbar webshark-topbar">
            <div><Network aria-hidden="true" /><span>TRACE</span> · PACKET DIVINATION</div>
            <p>{ready ? fileName.toUpperCase() : "ARCANE NETWORK INTERFACE TRANSITION"}</p>
            <button ref={closeButton} onClick={closeChamber} aria-label="Exit WebShark"><X /></button>
          </header>
          <div className="cyberchef-stage">
            <iframe className={`cyberchef-frame webshark-frame ${ready ? "is-visible" : ""}`} src={webSharkSrc} title={`WebShark — ${fileName}`} />
            <AnimatePresence>
              {!ready && <motion.div className="muggle-loader webshark-loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="muggle-loader-sigil" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}><Network /></motion.div>
                <p>CONSULTING MUGGLE PACKET DIVINERS…</p>
                <span>Preparing {fileName} for inspection.</span>
                <div className="muggle-progress" aria-label="Loading"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduce ? 0.1 : LOADING_DURATION / 1000, ease: "easeInOut" }} /></div>
              </motion.div>}
            </AnimatePresence>
          </div>
          <footer className="cyberchef-footer webshark-footer"><span>WebShark · Wireshark packet analysis</span><a href={webSharkSrc} target="_blank" rel="noreferrer"><ExternalLink /> OPEN IN NEW TAB</a></footer>
        </motion.section>
      </motion.div>
    </motion.div>
  );
}
