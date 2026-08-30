import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center overflow-hidden border text-xs font-semibold uppercase tracking-[.12em] transition-[transform,color,border-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b76d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080907] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "border-[#b99b55] bg-[#b99b55] px-6 py-4 text-[#090a08] hover:-translate-y-0.5 hover:border-[#ecd990]",
        quiet: "border-[#e8e1cf]/25 px-5 py-3 text-[#e8e1cf] hover:border-[#b99b55] hover:text-[#f1d98d]",
        danger: "border-[#8e4038]/60 px-4 py-2 text-[#d89288] hover:border-[#c85b50] hover:text-white",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, asChild, children, ...props }: ButtonProps) {
  if (asChild) {
    return <Slot className={cn(buttonVariants({ variant }), className)} {...props}>{children}</Slot>;
  }
  return (
    <button className={cn(buttonVariants({ variant }), className)} {...props}>
      <span className="absolute inset-y-0 left-0 w-0 bg-white/10 transition-[width] duration-500 group-hover:w-full" />
      <span className="relative">{children}</span>
    </button>
  );
}
