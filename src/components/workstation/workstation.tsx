"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Download, Hash, ShieldCheck, WrapText, X } from "lucide-react";
import type { CaseRecord, EvidenceFile } from "@/types";
import { cn, formatAcquired, formatBytes, shortHash } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { useHighlightSearch } from "@/hooks/use-highlight-search";
import { WorkstationSidebar } from "./workstation-sidebar";
import { WorkstationSearch } from "./workstation-search";
import { EvidenceViewer } from "./evidence-viewer";
import { SearchStreak, SearchBloom } from "@/components/fx/search-streak";
import { MagicFlash } from "@/components/fx/magic-flash";

interface Props {
  open: boolean;
  caseRecord: CaseRecord;
  evidence: EvidenceFile[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** Paper-plane silhouette, expressed as a 4-point polygon. */
const PLANE_CLIP = "polygon(0% 0%, 100% 50%, 0% 100%, 30% 50%)";
const RECT_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

export function Workstation({ open, caseRecord, evidence, activeId, onSelect, onClose }: Props) {
  const reduce = useReducedMotion();

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const searchRootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const streak = useAnimationControls();
  const bloom = useAnimationControls();

  const [wrap, setWrap] = React.useState(false);
  const [lineNumbers, setLineNumbers] = React.useState(true);
  const [openTick, setOpenTick] = React.useState(0);

  const active = React.useMemo(
    () => evidence.find((e) => e.id === activeId) ?? null,
    [evidence, activeId],
  );

  const searchable = Boolean(active && active.viewer !== "unsupported");

  // ---- blue trace effect ------------------------------------------------
  const fireStreak = React.useCallback(
    (target: HTMLElement) => {
      if (reduce) return;
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;

      // let the smooth scroll settle so the streak lands on the final position
      window.setTimeout(() => {
        const r = target.getBoundingClientRect();
        const fromX = anchor.left + 10;
        const fromY = anchor.bottom - 2;
        const toX = Math.max(24, r.left - 72);
        const toY = r.top + r.height / 2 - 1;

        streak.set({ x: fromX, y: fromY, scaleX: 0.35, opacity: 0 });
        void streak.start({
          x: [fromX, (fromX + toX) / 2, toX],
          y: [fromY, (fromY + toY) / 2 - 26, toY],
          scaleX: [0.35, 1.5, 1],
          opacity: [0, 1, 0],
          transition: { duration: 0.44, times: [0, 0.55, 1], ease: [0.3, 0, 0.2, 1] },
        });

        bloom.set({ x: toX, y: toY - 12, opacity: 0, scale: 0.7 });
        void bloom.start({
          opacity: [0, 1, 0],
          scale: [0.7, 1.2, 1],
          transition: { duration: 0.5, times: [0, 0.4, 1], delay: 0.26, ease: "easeOut" },
        });
      }, 185);
    },
    [reduce, streak, bloom],
  );

  const search = useHighlightSearch({
    rootRef: searchRootRef,
    enabled: open && searchable,
    onNavigate: fireStreak,
  });

  // ---- opening flash ----------------------------------------------------
  React.useEffect(() => {
    if (open) setOpenTick((t) => t + 1);
  }, [open]);

  // ---- keyboard ---------------------------------------------------------
  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (search.query.length > 0) search.close();
        else onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, search, onClose]);

  // ---- lock page scroll -------------------------------------------------
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ---- download ---------------------------------------------------------
  const download = React.useCallback(() => {
    if (!active?.url) return;
    const a = document.createElement("a");
    a.href = active.url;
    a.download = active.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [active]);

  // reset transient view state when the artefact changes
  React.useEffect(() => {
    setWrap(false);
    setLineNumbers(true);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

  return (
    <>
      <SearchStreak controls={streak} />
      <SearchBloom controls={bloom} />

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[65]">
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-ink-950/88 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.28 } }}
            />

            {/* ---------------- console panel ---------------- */}
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={`Forensic console — ${caseRecord.code}`}
              className="absolute inset-0 flex flex-col overflow-hidden border border-parchment-500/18 bg-ink-900 shadow-vault outline-none lg:inset-4"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.44, ease: [0.16, 1, 0.3, 1] }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.15 } }
                  : {
                      clipPath: [RECT_CLIP, PLANE_CLIP, PLANE_CLIP],
                      x: [0, -34, "118vw"],
                      y: [0, 10, "-16vh"],
                      rotate: [0, -3, 17],
                      scale: [1, 0.92, 0.24],
                      opacity: [1, 1, 0],
                      transition: {
                        duration: 0.72,
                        times: [0, 0.3, 1],
                        ease: [0.6, 0, 0.35, 1],
                      },
                    }
              }
            >
              {/* opening green flash */}
              <MagicFlash tone="open" playKey={openTick} duration={0.5} />

              {/* paper-plane illusion layer (only visible during exit) */}
              {!reduce && (
                <>
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-40 opacity-0"
                    style={{
                      background:
                        "linear-gradient(133deg, rgba(244,240,230,0.96) 0%, rgba(217,211,196,0.92) 42%, rgba(176,169,154,0.95) 100%)",
                    }}
                    variants={{
                      exit: {
                        opacity: [0, 0, 0.97, 0.97],
                        transition: { duration: 0.72, times: [0, 0.2, 0.34, 1] },
                      },
                    }}
                  />
                  <motion.svg
                    aria-hidden
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 z-40 h-full w-full opacity-0"
                    variants={{
                      exit: {
                        opacity: [0, 0, 0.5, 0.5],
                        transition: { duration: 0.72, times: [0, 0.2, 0.34, 1] },
                      },
                    }}
                  >
                    <g stroke="rgba(40,38,32,0.5)" strokeWidth="0.25" fill="none">
                      <path d="M100 50 L0 0" />
                      <path d="M100 50 L0 100" />
                      <path d="M100 50 L30 50" />
                    </g>
                  </motion.svg>
                  {/* red send-off streak */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 z-40 w-1/3 opacity-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(240,112,90,0.85), transparent)",
                      boxShadow: "0 0 30px 6px rgba(192,71,54,0.35)",
                    }}
                    variants={{
                      exit: {
                        x: ["-140%", "240%"],
                        opacity: [0, 1, 0],
                        transition: { duration: 0.55, times: [0, 0.45, 1], delay: 0.14 },
                      },
                    }}
                  />
                </>
              )}

              {/* ================= console header ================= */}
              <div className="relative z-10 flex h-11 shrink-0 items-center gap-3 border-b border-parchment-500/12 bg-ink-880 px-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-openGlow opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-open" />
                  </span>
                  <span className="hidden font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-300 sm:inline">
                    TRACE FORENSICS CONSOLE
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-300 sm:hidden">
                    CONSOLE
                  </span>
                  <span className="hidden h-3 w-px bg-parchment-500/20 lg:block" />
                  <span className="hidden font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-600 lg:inline">
                    {caseRecord.code}
                  </span>
                </div>

                <div className="ml-auto flex min-w-0 items-center gap-2">
                  <WorkstationSearch
                    search={search}
                    inputRef={inputRef}
                    anchorRef={anchorRef}
                    supported={searchable}
                  />

                  <Button
                    variant="close"
                    size="sm"
                    onClick={onClose}
                    className="shrink-0"
                    aria-label="Close forensic console"
                  >
                    <X className="h-3 w-3" />
                    <span className="hidden sm:inline">Close</span>
                  </Button>
                </div>
              </div>

              {/* ================= body ================= */}
              <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
                <div className="lg:w-[248px] lg:shrink-0 xl:w-[276px]">
                  <WorkstationSidebar
                    evidence={evidence}
                    activeId={activeId}
                    onSelect={onSelect}
                  />
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  {/* file toolbar */}
                  <div className="flex h-11 shrink-0 items-center gap-3 border-b border-parchment-500/12 bg-ink-880/40 px-4">
                    <span className="truncate font-mono text-[12px] text-parchment-100">
                      {active?.filename ?? "—"}
                    </span>
                    <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600 sm:inline">
                      {active?.id}
                    </span>
                    {active && (
                      <Badge
                        variant={
                          active.integrity === "VERIFIED"
                            ? "open"
                            : active.integrity === "ALTERED"
                              ? "close"
                              : "gold"
                        }
                        size="sm"
                        className="hidden shrink-0 sm:inline-flex"
                      >
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {active.integrity}
                      </Badge>
                    )}

                    <div className="ml-auto flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setWrap((v) => !v)}
                        disabled={!searchable}
                        aria-pressed={wrap}
                        title="Toggle line wrapping"
                        className={cn(
                          "flex h-7 w-7 items-center justify-center border transition-colors disabled:opacity-30",
                          wrap
                            ? "border-brass/50 bg-brass/[0.1] text-brass-light"
                            : "border-transparent text-parchment-500 hover:bg-parchment-100/[0.06] hover:text-parchment-300",
                        )}
                      >
                        <WrapText className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLineNumbers((v) => !v)}
                        disabled={!searchable}
                        aria-pressed={lineNumbers}
                        title="Toggle line numbers"
                        className={cn(
                          "flex h-7 w-7 items-center justify-center border transition-colors disabled:opacity-30",
                          lineNumbers
                            ? "border-brass/50 bg-brass/[0.1] text-brass-light"
                            : "border-transparent text-parchment-500 hover:bg-parchment-100/[0.06] hover:text-parchment-300",
                        )}
                      >
                        <Hash className="h-3.5 w-3.5" />
                      </button>
                      <span className="mx-1 h-4 w-px bg-parchment-500/15" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={download}
                        disabled={!active?.url}
                        aria-label={`Download ${active?.filename ?? "artefact"}`}
                        title="Download artefact"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* viewer scroll area */}
                  <div
                    ref={scrollRef}
                    className="relative min-h-0 flex-1 overflow-auto bg-ink-900 grid-backdrop-fine"
                  >
                    {active ? (
                      <EvidenceViewer
                        key={active.id}
                        evidence={active}
                        rootRef={searchRootRef}
                        wrap={wrap}
                        lineNumbers={lineNumbers}
                        onDownload={download}
                      />
                    ) : (
                      <p className="p-8 font-mono text-[11px] uppercase tracking-widest2 text-parchment-600">
                        No artefact selected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= status bar ================= */}
              <div className="relative z-10 flex h-8 shrink-0 items-center gap-4 overflow-hidden border-t border-parchment-500/12 bg-ink-880 px-4 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
                <span className="shrink-0 text-parchment-400">Case {caseRecord.code}</span>
                <span className="hidden shrink-0 sm:inline">
                  Integrity:{" "}
                  <span className="text-parchment-400">{active?.integrity ?? "—"}</span>
                </span>
                <span className="hidden shrink-0 md:inline">
                  SHA-256 <span className="text-parchment-500">{shortHash(active?.sha256 ?? "—")}</span>
                </span>
                <span className="hidden shrink-0 lg:inline">
                  {active ? formatAcquired(active.collectedAt) : "—"}
                </span>
                <span className="hidden shrink-0 xl:inline">
                  {active ? formatBytes(active.sizeBytes) : "—"}
                </span>

                <span className="ml-auto hidden shrink-0 items-center gap-1.5 sm:flex">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>F</Kbd>
                  <span className="ml-1">Search</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
