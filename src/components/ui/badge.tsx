import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border font-mono uppercase tracking-widest2 leading-none",
  {
    variants: {
      variant: {
        default: "border-parchment-500/25 bg-parchment-100/[0.04] text-parchment-300",
        neutral: "border-parchment-500/20 bg-transparent text-parchment-500",
        brass: "border-brass/40 bg-brass/[0.08] text-brass-light",
        burgundy: "border-burgundy-light/45 bg-burgundy/[0.18] text-[#E7A9A0]",
        forest: "border-signal-open/40 bg-signal-open/[0.1] text-signal-openGlow",
        open: "border-signal-open/45 bg-signal-open/[0.1] text-signal-openGlow",
        close: "border-signal-close/45 bg-signal-close/[0.1] text-signal-closeGlow",
        search: "border-signal-search/45 bg-signal-search/[0.1] text-signal-searchGlow",
        gold: "border-signal-gold/45 bg-signal-gold/[0.1] text-signal-goldGlow",
      },
      size: {
        sm: "h-[18px] px-1.5 text-[9px]",
        md: "h-[22px] px-2 text-[9.5px]",
        lg: "h-[26px] px-2.5 text-[10px]",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
