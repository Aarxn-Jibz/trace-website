/**
 * Imperative, DOM-based match highlighting.
 *
 * The evidence viewers render static content that React never re-renders
 * while a search is active (see `React.memo` on each viewer body). That lets
 * us walk the rendered text nodes and wrap matches in <mark> without
 * fighting the reconciler — the same technique browser find-in-page uses.
 *
 * Benefits over a per-format React implementation:
 *   · one code path works for log, txt, csv, json and markdown
 *   · match indices follow *visual* document order automatically
 *   · scrolling to a match is a plain scrollIntoView on the element
 */

export const HIT_ATTR = "data-trace-hit";
export const CURRENT_ATTR = "data-current";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "MARK"]);

function isSkippable(node: Node): boolean {
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    el = el.parentElement;
  }
  return false;
}

/** Remove every highlight we previously injected, restoring original nodes. */
export function clearHighlights(root: HTMLElement | null): void {
  if (!root) return;
  const marks = root.querySelectorAll<HTMLElement>(`mark[${HIT_ATTR}]`);
  marks.forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
  });
  if (marks.length) root.normalize();
}

/**
 * Wrap every case-insensitive occurrence of `query` inside `root`.
 * @returns the ordered list of injected <mark> elements.
 */
export function applyHighlights(root: HTMLElement | null, query: string): HTMLElement[] {
  if (!root || !query) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (isSkippable(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  const needle = query.toLowerCase();
  const hits: HTMLElement[] = [];

  for (const node of textNodes) {
    const text = node.nodeValue ?? "";
    const haystack = text.toLowerCase();
    if (!haystack.includes(needle)) continue;

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let index = haystack.indexOf(needle);

    while (index !== -1) {
      if (index > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, index)));
      }
      const mark = document.createElement("mark");
      mark.setAttribute(HIT_ATTR, "");
      mark.textContent = text.slice(index, index + needle.length);
      fragment.appendChild(mark);
      hits.push(mark);
      cursor = index + needle.length;
      index = haystack.indexOf(needle, cursor);
    }

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }
    node.parentNode?.replaceChild(fragment, node);
  }

  return hits;
}

/** Paint exactly one hit as the current match. */
export function setCurrentHit(hits: HTMLElement[], index: number): HTMLElement | null {
  hits.forEach((hit, i) => {
    if (i === index) hit.setAttribute(CURRENT_ATTR, "true");
    else hit.removeAttribute(CURRENT_ATTR);
  });
  return hits[index] ?? null;
}

/** Add a transient class to every ancestor line so the row itself glows. */
export function markActiveLine(el: HTMLElement | null, className = "hit-line-active"): void {
  document.querySelectorAll(`.${className}`).forEach((n) => n.classList.remove(className));
  if (!el) return;
  const line = el.closest("[data-line]") as HTMLElement | null;
  line?.classList.add(className);
}
