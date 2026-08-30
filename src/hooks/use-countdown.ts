"use client";

import * as React from "react";

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const ZERO: Remaining = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

function split(ms: number): Remaining {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    total,
  };
}

/**
 * Mock release countdown.
 *
 * The target is computed on the client after mount so SSR and hydration
 * always agree. In production the offset is replaced by a server-issued
 * release timestamp — the UI never decides whether a case is open.
 */
export function useCountdown(offsetSeconds: number | null): {
  remaining: Remaining;
  mounted: boolean;
  released: boolean;
} {
  const [target, setTarget] = React.useState<number | null>(null);
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (offsetSeconds === null) return;
    const t = Date.now() + offsetSeconds * 1000;
    setTarget(t);
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [offsetSeconds]);

  const mounted = target !== null && now !== null;
  const msLeft = mounted ? target - now : 0;

  return {
    remaining: mounted ? split(msLeft) : ZERO,
    mounted,
    released: mounted && msLeft <= 0,
  };
}
