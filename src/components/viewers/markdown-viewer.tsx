"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

export interface MarkdownViewerProps {
  content: string;
}

/**
 * Markdown dossier viewer.
 *
 * Block elements carry `data-line` so the search engine can illuminate the
 * block containing the active match.
 */
const withLine = (Tag: keyof React.JSX.IntrinsicElements, props?: React.HTMLAttributes<HTMLElement>) => {
  const Component = (p: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag {...(props as any)} {...(p as any)} data-line />
  );
  Component.displayName = `Line(${String(Tag)})`;
  return Component;
};

const COMPONENTS: Components = {
  p: withLine("p"),
  h1: withLine("h1"),
  h2: withLine("h2"),
  h3: withLine("h3"),
  h4: withLine("h4"),
  blockquote: withLine("blockquote"),
  li: withLine("li"),
  td: withLine("td"),
  th: withLine("th"),
  pre: withLine("pre"),
};

const MarkdownBody = React.memo(function MarkdownBody({ content }: MarkdownViewerProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-2 sm:px-10">
      <div className="md-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

export function MarkdownViewer(props: MarkdownViewerProps) {
  return <MarkdownBody {...props} />;
}
