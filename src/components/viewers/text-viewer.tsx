"use client";

import * as React from "react";

export interface TextViewerProps {
  content: string;
  wrap: boolean;
  lineNumbers: boolean;
}

/**
 * Log / plain-text viewer.
 *
 * The body is memoised on `content` + display flags so React never
 * re-renders it while search highlights are applied to the DOM.
 */
const TextBody = React.memo(function TextBody({
  content,
  wrap,
  lineNumbers,
}: TextViewerProps) {
  const lines = React.useMemo(() => content.replace(/\n$/, "").split("\n"), [content]);

  return (
    <div className="w-max min-w-full pb-16">
      {lines.map((line, i) => (
        <div key={i} data-line className="code-line">
          {lineNumbers && <span className="line-no">{i + 1}</span>}
          <span className={wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}>
            {line || " "}
          </span>
        </div>
      ))}
    </div>
  );
});

export function TextViewer(props: TextViewerProps) {
  return <TextBody {...props} />;
}
