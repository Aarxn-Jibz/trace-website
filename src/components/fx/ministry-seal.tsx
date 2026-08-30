import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ministry of Magic departmental seal.
 *
 * Deliberately geometric and institutional rather than fantastical: two
 * concentric index rings, departmental text on a path, and a vault sigil
 * built from straight technical strokes.
 */
export function MinistrySeal({
  className,
  variant = "outline",
  top = "MINISTRY OF MAGIC",
  bottom = "DEPARTMENT OF MAGICAL LAW ENFORCEMENT",
  showRings = true,
}: {
  className?: string;
  variant?: "outline" | "wax" | "ghost";
  top?: string;
  bottom?: string;
  showRings?: boolean;
}) {
  // React.useId is stable across server / client renders; using a module
  // counter would diverge under React 19 Strict Mode and trigger a
  // hydration warning on every page that mounts a seal.
  const reactId = React.useId();
  const uid = reactId.replace(/:/g, "");

  const stroke =
    variant === "wax" ? "rgba(233,227,213,0.72)" : variant === "ghost" ? "rgba(233,227,213,0.22)" : "rgba(183,151,73,0.62)";
  const textFill =
    variant === "wax" ? "rgba(233,227,213,0.85)" : variant === "ghost" ? "rgba(233,227,213,0.3)" : "rgba(183,151,73,0.8)";

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${top} — ${bottom}`}
    >
      {variant === "wax" && <circle cx="100" cy="100" r="94" fill="rgba(122,34,49,0.92)" />}
      <circle
        cx="100"
        cy="100"
        r="94"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.5"
      />
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke={stroke}
        strokeWidth="0.75"
        strokeDasharray="2 4"
        opacity="0.45"
      />
      {showRings && (
        <>
          <circle cx="100" cy="100" r="62" fill="none" stroke={stroke} strokeWidth="0.75" opacity="0.55" />
          <circle cx="100" cy="100" r="58" fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.3" />
        </>
      )}

      <defs>
        <path id={`${uid}-top`} d="M 22,100 A 78,78 0 0 1 178,100" fill="none" />
        <path id={`${uid}-bottom`} d="M 24,100 A 76,76 0 0 0 176,100" fill="none" />
      </defs>

      <text
        fill={textFill}
        fontSize="11"
        letterSpacing="3.1"
        style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
      >
        <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">
          {top}
        </textPath>
      </text>
      <text
        fill={textFill}
        fontSize="7.4"
        letterSpacing="2.2"
        style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
      >
        <textPath href={`#${uid}-bottom`} startOffset="50%" textAnchor="middle">
          {bottom}
        </textPath>
      </text>

      {/* Vault sigil */}
      <g stroke={stroke} strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M100 58 L136 100 L100 142 L64 100 Z" />
        <path d="M100 72 L123 100 L100 128 L77 100 Z" opacity="0.65" />
        <path d="M100 84 L112 100 L100 116 L88 100 Z" opacity="0.4" />
        <path d="M100 46 L100 60" />
        <path d="M100 140 L100 154" />
        <path d="M52 100 L66 100" />
        <path d="M134 100 L148 100" />
      </g>
      <circle cx="100" cy="100" r="2.6" fill={variant === "wax" ? "rgba(233,227,213,0.9)" : stroke} />
    </svg>
  );
}

/** Small wax seal used to mark locked dossiers. */
export function WaxSeal({ className, label = "MINISTRY SEAL" }: { className?: string; label?: string }) {
  return (
    <div className={cn("relative", className)}>
      <MinistrySeal variant="wax" top={label} bottom="CLASSIFIED" />
    </div>
  );
}
