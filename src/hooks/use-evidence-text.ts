"use client";

import * as React from "react";

export type ContentStatus = "idle" | "loading" | "ready" | "error";

/**
 * Loads a text evidence artefact.
 *
 * Mocked as a static asset fetch today; a production build would swap the
 * `fetch` for an authorised signed-URL request. The hook signature already
 * mirrors that (url in, text out, with loading + error states).
 */
export function useEvidenceText(url: string | null): {
  text: string;
  status: ContentStatus;
} {
  const [text, setText] = React.useState("");
  const [status, setStatus] = React.useState<ContentStatus>("idle");

  React.useEffect(() => {
    if (!url) {
      setText("");
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((body) => {
        if (cancelled) return;
        setText(body);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setText("");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { text, status };
}
