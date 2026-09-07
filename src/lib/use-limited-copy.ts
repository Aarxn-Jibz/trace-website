"use client";

import * as React from "react";

export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n|\r/g, "\n");
}

export function capLines(text: string, maxLines: number): string {
  return normalizeLineEndings(text).split("\n").slice(0, maxLines).join("\n");
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el.isContentEditable
  );
}

/**
 * Rewrites copied text from a container so that at most `maxLines`
 * newline-delimited lines reach the clipboard. Normal copying inside
 * editable controls (inputs, textareas, contenteditable) is left untouched.
 */
export function useLimitedCopy<T extends HTMLElement>(maxLines: number) {
  const ref = React.useRef<T>(null);
  const maxLinesRef = React.useRef(maxLines);
  maxLinesRef.current = maxLines;

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onCopy = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (!event.clipboardData) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const text = selection.toString();
      if (!text) return;
      const capped = capLines(text, maxLinesRef.current);
      event.clipboardData.setData("text/plain", capped);
      event.preventDefault();
    };

    root.addEventListener("copy", onCopy);
    return () => root.removeEventListener("copy", onCopy);
  }, []);

  return ref;
}
