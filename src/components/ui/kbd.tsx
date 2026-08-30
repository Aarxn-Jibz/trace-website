import * as React from "react";
import { cn } from "@/lib/utils";

/** Small square keycap used for shortcut hints. */
export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center border border-parchment-500/25 bg-parchment-100/[0.05] px-1 font-mono text-[9.5px] uppercase tracking-wider text-parchment-400",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
