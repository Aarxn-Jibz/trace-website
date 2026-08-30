import * as React from "react";
import { cn } from "@/lib/utils";

const SPLIT = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/** Renders **bold** and `code` spans inside otherwise plain copy. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(SPLIT);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-parchment-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className={cn(
                "mx-0.5 border border-parchment-500/15 bg-parchment-100/[0.05] px-1 py-px font-mono text-[0.88em] text-[#D9CFA8]",
              )}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
