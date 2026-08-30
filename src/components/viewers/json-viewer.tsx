"use client";

import * as React from "react";
import { tokenizeJsonLine } from "@/lib/json-tokenize";

export interface JsonViewerProps {
  content: string;
  wrap: boolean;
  lineNumbers: boolean;
}

function prettify(content: string): { text: string; error: boolean } {
  try {
    return { text: JSON.stringify(JSON.parse(content), null, 2), error: false };
  } catch {
    return { text: content, error: true };
  }
}

const JsonBody = React.memo(function JsonBody({ content, lineNumbers }: JsonViewerProps) {
  const { text, error } = React.useMemo(() => prettify(content), [content]);
  const lines = React.useMemo(() => text.split("\n"), [text]);

  return (
    <div className="w-max min-w-full pb-16">
      {error && (
        <p className="code-line !text-signal-closeGlow">
          ! malformed json — displaying raw content
        </p>
      )}
      {lines.map((line, i) => (
        <div key={i} data-line className="code-line">
          {lineNumbers && <span className="line-no">{i + 1}</span>}
          <span>
            {tokenizeJsonLine(line).map((tok, ti) => (
              <span key={ti} className={tok.cls}>
                {tok.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
});

export function JsonViewer(props: JsonViewerProps) {
  return <JsonBody {...props} />;
}
