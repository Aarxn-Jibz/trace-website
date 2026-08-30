"use client";

import * as React from "react";
import { applyHighlights, clearHighlights, markActiveLine, setCurrentHit } from "@/lib/highlight";

export interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  count: number;
  /** 0-based; -1 when there are no matches. */
  current: number;
  next: () => void;
  prev: () => void;
  close: () => void;
  /** Bumped whenever a search yields nothing — drives the muted failure flicker. */
  failTick: number;
  /** Bumped whenever the current match moves — drives the blue trace effect. */
  navigateTick: number;
}

interface Options {
  rootRef: React.RefObject<HTMLElement | null>;
  /** Set to false while the viewer is closed or unsupported. */
  enabled: boolean;
  /** Fired after every successful jump so the caller can run the trace effect. */
  onNavigate?: (el: HTMLElement) => void;
}

/**
 * Owns query + match navigation for one evidence viewer.
 *
 * The effect pipeline is deliberately two-stage:
 *   1. `query` changes  -> (re)compute hits, reset index to 0
 *   2. `current` changes -> paint + scroll to the active hit
 * so navigating between matches never re-walks the document.
 */
export function useHighlightSearch({ rootRef, enabled, onNavigate }: Options): SearchState {
  const onNavigateRef = React.useRef(onNavigate);
  React.useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  const [query, setQueryRaw] = React.useState("");
  const [count, setCount] = React.useState(0);
  const [current, setCurrent] = React.useState(-1);
  const [failTick, setFailTick] = React.useState(0);
  const [navigateTick, setNavigateTick] = React.useState(0);

  const hitsRef = React.useRef<HTMLElement[]>([]);
  const countRef = React.useRef(0);

  // ---- stage 1: recompute hits whenever the query (or content) changes ----
  React.useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;

    clearHighlights(root);

    if (query.trim().length === 0) {
      hitsRef.current = [];
      countRef.current = 0;
      setCount(0);
      setCurrent(-1);
      return;
    }

    const hits = applyHighlights(root, query.trim());
    hitsRef.current = hits;
    countRef.current = hits.length;
    setCount(hits.length);
    setCurrent(hits.length > 0 ? 0 : -1);
    if (hits.length === 0) setFailTick((t) => t + 1);
    // `query` is the only trigger; root content changes are handled by
    // remounting the viewer (see EvidenceViewer key).
  }, [query, enabled, rootRef]);

  // ---- stage 2: paint + scroll to the current hit ----
  React.useEffect(() => {
    if (!enabled) return;
    const hits = hitsRef.current;
    if (hits.length === 0 || current < 0) {
      markActiveLine(null);
      return;
    }
    const el = setCurrentHit(hits, current);
    markActiveLine(el);
    el?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    setNavigateTick((t) => t + 1);
    if (el) onNavigateRef.current?.(el);
  }, [current, count, enabled]);

  // ---- cleanup when the viewer goes away ----
  React.useEffect(() => {
    if (enabled) return;
    clearHighlights(rootRef.current);
    hitsRef.current = [];
    countRef.current = 0;
    setCount(0);
    setCurrent(-1);
    setQueryRaw("");
  }, [enabled, rootRef]);

  const setQuery = React.useCallback((q: string) => {
    setQueryRaw(q);
  }, []);

  const next = React.useCallback(() => {
    setCurrent((i) => {
      const n = countRef.current;
      if (n === 0) return -1;
      return i < 0 ? 0 : (i + 1) % n;
    });
  }, []);

  const prev = React.useCallback(() => {
    setCurrent((i) => {
      const n = countRef.current;
      if (n === 0) return -1;
      return i < 0 ? n - 1 : (i - 1 + n) % n;
    });
  }, []);

  const close = React.useCallback(() => {
    clearHighlights(rootRef.current);
    hitsRef.current = [];
    countRef.current = 0;
    setCount(0);
    setCurrent(-1);
    setQueryRaw("");
  }, [rootRef]);

  return { query, setQuery, count, current, next, prev, close, failTick, navigateTick };
}
