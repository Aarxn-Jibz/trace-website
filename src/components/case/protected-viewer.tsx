"use client";

import * as React from "react";
import { useLimitedCopy } from "@/lib/use-limited-copy";

/**
 * Wraps sensitive evidence so that copied text is capped at `maxLines`
 * lines (see useLimitedCopy).
 */
export function ProtectedViewer({
  children,
  maxLines = 2,
  className,
}: {
  children: React.ReactNode;
  maxLines?: number;
  className?: string;
}) {
  const ref = useLimitedCopy<HTMLDivElement>(maxLines);

  return <div ref={ref} className={className}>{children}</div>;
}
