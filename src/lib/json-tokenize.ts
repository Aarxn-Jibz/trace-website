export interface JsonToken {
  text: string;
  cls?: string;
}

const TOKEN_RE =
  /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"\s*:?)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g;

/**
 * Splits one pretty-printed JSON line into styled spans.
 * Deliberately lightweight — this is a reader, not an editor.
 */
export function tokenizeJsonLine(line: string): JsonToken[] {
  const out: JsonToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > last) out.push({ text: line.slice(last, match.index) });

    if (match[1] !== undefined) {
      const raw = match[1];
      if (raw.trimEnd().endsWith(":")) {
        const close = raw.lastIndexOf('"');
        out.push({ text: raw.slice(0, close + 1), cls: "tok-key" });
        out.push({ text: raw.slice(close + 1), cls: "tok-punct" });
      } else {
        out.push({ text: raw, cls: "tok-string" });
      }
    } else if (match[2] !== undefined) {
      out.push({ text: match[2], cls: "tok-number" });
    } else if (match[3] !== undefined) {
      out.push({ text: match[3], cls: "tok-boolean" });
    } else if (match[4] !== undefined) {
      out.push({ text: match[4], cls: "tok-null" });
    }

    last = match.index + match[0].length;
  }

  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

/** Indent guides: how many 2-space levels deep this line sits. */
export function indentLevel(line: string): number {
  const spaces = line.length - line.trimStart().length;
  return Math.floor(spaces / 2);
}
