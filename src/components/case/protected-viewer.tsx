"use client";

import * as React from "react";
import { LockKeyhole } from "lucide-react";
import { useLimitedCopy } from "@/lib/use-limited-copy";

/**
 * Wraps sensitive evidence so that:
 *  - copied text is capped at `maxLines` lines (see useLimitedCopy), and
 *  - the evidence blanks behind a "terminal locked" overlay as soon as the
 *    page loses focus, the window is obscured, or `PrintScreen` is pressed.
 *
 * The blanking path bypasses React state synchronously (direct style + CSS
 * `content-visibility`) so the compositor drops the content before any capture
 * tool can snapshot it. This is best-effort deterrence, not a security boundary:
 * a bare fullscreen `PrintScreen` can in some cases still be captured before the
 * browser processes the keydown.
 */
export function ProtectedViewer({
  children,
  maxLines = 2,
  className,
}: {
  children: React.ReactNode;
  maxLines?: number;
  className?: string;
}) {
  const ref = useLimitedCopy<HTMLDivElement>(maxLines);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef(false);
  const unlockTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [locked, setLocked] = React.useState(false);

  const applyLock = React.useCallback(() => {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = undefined;
    }
    activeRef.current = true;
    setLocked(true);
    const content = contentRef.current;
    if (content) {
      content.style.setProperty("visibility", "hidden");
      content.style.setProperty("content-visibility", "hidden");
      content.style.setProperty("opacity", "0");
    }
    overlayRef.current?.style.setProperty("opacity", "1");
  }, []);

  const scheduleUnlock = React.useCallback(() => {
    if (unlockTimerRef.current) return;
    unlockTimerRef.current = setTimeout(() => {
      unlockTimerRef.current = undefined;
      if (!activeRef.current) return;
      activeRef.current = false;
      setLocked(false);
      const content = contentRef.current;
      if (content) {
        content.style.removeProperty("visibility");
        content.style.removeProperty("content-visibility");
        content.style.removeProperty("opacity");
      }
      overlayRef.current?.style.setProperty("opacity", "0");
    }, 350);
  }, []);

  React.useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) applyLock();
      else scheduleUnlock();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") applyLock();
    };
    const poll = window.setInterval(() => {
      if (document.hasFocus()) scheduleUnlock();
      else applyLock();
    }, 150);

    window.addEventListener("blur", applyLock);
    window.addEventListener("focus", scheduleUnlock);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.clearInterval(poll);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      window.removeEventListener("blur", applyLock);
      window.removeEventListener("focus", scheduleUnlock);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [applyLock, scheduleUnlock]);

  return (
    <div ref={ref} className={className}>
      <div ref={contentRef} className="protected-content">
        {children}
      </div>
      <div
        ref={overlayRef}
        className="protected-lock"
        role="alert"
        aria-live="assertive"
        aria-hidden={!locked}
      >
        <LockKeyhole />
        <h2>TERMINAL LOCKED</h2>
        <p>Evidence is blanked while this terminal is out of focus.</p>
        <span>REFOCUS TO RECALL SESSION</span>
      </div>
    </div>
  );
}