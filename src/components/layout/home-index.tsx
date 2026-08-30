"use client";

import * as React from "react";

const SECTIONS = [
  { id: "hero", n: "01", label: "Hero" },
  { id: "dossiers", n: "02", label: "Dossiers" },
  { id: "protocol", n: "03", label: "Protocol" },
];

/**
 * Fixed left-edge section index.
 *
 * A vertical editorial device: rotated TRACE mark, section numbers that
 * track the active viewport section, and a closing timestamp. Hidden on
 * narrow screens — desktop-only.
 */
export function HomeIndex() {
  const [active, setActive] = React.useState<string>("hero");
  const [now, setNow] = React.useState<string>("");

  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setNow(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <aside
      aria-label="Section index"
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-screen w-12 lg:flex"
    >
      <div className="pointer-events-auto relative ml-3 flex h-full flex-col items-center justify-between border-r border-parchment-500/12 py-6">
        {/* TRACE mark, rotated */}
        <span
          aria-hidden
          className="font-display text-[11px] leading-none tracking-[0.22em] text-parchment-600"
          style={{ writingMode: "vertical-rl" }}
        >
          TRACE · 2026
        </span>

        <ul className="flex flex-1 flex-col items-center justify-around py-8">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id} className="group relative">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className="flex items-center gap-2"
                >
                  <span
                    className={
                      "block h-px transition-all duration-500 " +
                      (isActive
                        ? "w-8 bg-brass"
                        : "w-3 bg-parchment-500/30 group-hover:bg-parchment-500/60")
                    }
                  />
                  <span
                    className={
                      "block font-mono text-[9px] uppercase tracking-widest2 transition-colors duration-500 " +
                      (isActive ? "text-brass-light" : "text-parchment-600 group-hover:text-parchment-300")
                    }
                  >
                    {s.n}
                  </span>
                  <span
                    className={
                      "block font-mono text-[8px] uppercase tracking-widest2 transition-colors duration-500 " +
                      (isActive ? "text-parchment-300" : "text-parchment-700 group-hover:text-parchment-500")
                    }
                  >
                    {s.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <span className="font-mono text-[8px] uppercase tracking-widest2 text-parchment-700" aria-label="Current UTC time">
          {now || "00:00:00 UTC"}
        </span>
      </div>
    </aside>
  );
}
