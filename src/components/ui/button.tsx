"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * TRACE button.
 *
 * Square-cornered, hairline-bordered, uppercase micro-type. Coloured
 * variants map onto the interaction colour language (green = open,
 * red = close, blue = search, gold = release) and are used sparingly.
 */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-widest2 transition-all duration-200 ease-vault disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-parchment-500/25 bg-parchment-100/[0.03] text-parchment-200 hover:border-parchment-300/50 hover:bg-parchment-100/[0.07] hover:text-parchment-100",
        solid: "border border-parchment-200 bg-parchment-200 text-ink-900 hover:bg-parchment-100",
        brass:
          "border border-brass/40 bg-brass/[0.06] text-brass-light hover:border-brass/70 hover:bg-brass/[0.13] hover:text-brass-light",
        open: "border border-signal-open/40 bg-signal-open/[0.07] text-signal-openGlow hover:border-signal-open/70 hover:bg-signal-open/[0.15]",
        close:
          "border border-signal-close/40 bg-signal-close/[0.06] text-signal-closeGlow hover:border-signal-close/70 hover:bg-signal-close/[0.14]",
        search:
          "border border-signal-search/40 bg-signal-search/[0.07] text-signal-searchGlow hover:border-signal-search/70 hover:bg-signal-search/[0.15]",
        ghost:
          "border border-transparent bg-transparent text-parchment-400 hover:bg-parchment-100/[0.05] hover:text-parchment-200",
        outlineDashed:
          "border border-dashed border-parchment-500/30 text-parchment-400 hover:border-parchment-300/50 hover:text-parchment-200",
      },
      size: {
        sm: "h-7 px-2.5 text-[10px]",
        md: "h-9 px-4 text-[10.5px]",
        lg: "h-11 px-6 text-[11px]",
        icon: "h-8 w-8",
        iconSm: "h-6 w-6",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
