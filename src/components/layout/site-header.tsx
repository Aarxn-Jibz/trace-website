"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinistrySeal } from "@/components/fx/ministry-seal";

/** Persistent institutional chrome. Deliberately thin — 44px. */
export function SiteHeader({ contextLabel }: { contextLabel?: string }) {
  const pathname = usePathname();
  const onCase = pathname.startsWith("/case");

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-11 border-b border-parchment-500/12 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="TRACE — return to index"
        >
          <MinistrySeal variant="ghost" showRings={false} className="h-6 w-6 shrink-0" />
          <span className="font-display text-[15px] leading-none tracking-[0.16em] text-parchment-100">
            TRACE
          </span>
        </Link>

        <div className="hidden h-4 w-px bg-parchment-500/20 md:block" />

        <div className="hidden min-w-0 md:block">
          <p className="truncate font-mono text-[9px] uppercase tracking-widest2 text-parchment-500">
            Ministry of Magic · Department of Magical Law Enforcement
          </p>
          <p className="truncate font-mono text-[9px] uppercase tracking-widest2 text-parchment-600">
            Cybercrime Investigation Exercise · Archive Terminal
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {onCase && contextLabel && (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-400 transition-colors hover:text-brass-light"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="hidden sm:inline">Index</span>
              </Link>
              <div className="h-4 w-px bg-parchment-500/20" />
              <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-parchment-300">
                {contextLabel}
              </span>
              <div className="h-4 w-px bg-parchment-500/20" />
            </>
          )}
          <span
            className={cn(
              "hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest2 text-signal-openGlow sm:flex",
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-openGlow opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-open" />
            </span>
            Secure link
          </span>
        </div>
      </div>
    </header>
  );
}
