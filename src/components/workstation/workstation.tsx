"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronUp, FileText, Search, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EvidenceFile } from "@/data/trace";
import { ProtectedViewer } from "@/components/case/protected-viewer";
import { WebSharkWorkstation } from "@/components/webshark/webshark-workstation";

type MatchPart = { text: string; match: boolean; matchIndex?: number };
type SearchBeam = { id: number; x1: number; y1: number; x2: number; y2: number };
type SearchMeta = { q: string; total: number; perPage: number[] };

function splitMatches(text: string, query: string): { parts: MatchPart[]; count: number } {
  if (!query.trim()) return { parts: [{ text, match: false }], count: 0 };
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  let count = 0;
  const parts = text.split(regex).filter(Boolean).map((part) => {
    const match = part.toLowerCase() === query.toLowerCase();
    return match ? { text: part, match, matchIndex: count++ } : { text: part, match };
  });
  return { parts, count };
}

function TextViewer({ lines, page, pageSize, base, query, current }: { lines: string[]; page: number; pageSize: number; base: number; query: string; current: number }) {
  let offset = 0;
  const startLine = (page - 1) * pageSize + 1;
  return <div className="text-viewer">{lines.map((line, lineIndex) => {
    const result = splitMatches(line, query);
    const lineOffset = offset; offset += result.count;
    return <div className="code-line" key={lineIndex}><span>{startLine + lineIndex}</span><code>{result.parts.map((part, index) => part.match ? <mark id={`trace-match-${base + lineOffset + (part.matchIndex ?? 0)}`} className={base + lineOffset + (part.matchIndex ?? 0) === current ? "current" : ""} key={index}>{part.text}</mark> : <React.Fragment key={index}>{part.text}</React.Fragment>)}</code></div>;
  })}</div>;
}

const StaticRichViewer = React.memo(function StaticRichViewer({ file, fileContent, csvHeader, csvStartLine }: { file: EvidenceFile; fileContent: string; csvHeader?: string; csvStartLine: number }) {
  if (file.type === "markdown") return <article className="markdown-viewer"><ReactMarkdown remarkPlugins={[remarkGfm]}>{fileContent}</ReactMarkdown></article>;
  if (file.type === "csv") {
    const rows = fileContent.split("\n").map((row) => row.split(","));
    const header = (csvHeader ?? rows[0]?.join(",") ?? "").split(",");
    const dataRows = csvHeader === undefined ? rows.slice(1) : rows;
    return <div className="csv-wrap"><table><thead><tr><th scope="col">#</th>{header.map((cell, index) => <th scope="col" key={index}>{cell}</th>)}</tr></thead><tbody>{dataRows.map((row, i) => <tr key={i}><th scope="row">{csvStartLine + i}</th>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
  }
  return <pre className="json-viewer">{JSON.stringify(JSON.parse(fileContent), null, 2)}</pre>;
});

function RichTextViewer({ file, fileContent, csvHeader, csvStartLine, base, query, current }: { file: EvidenceFile; fileContent: string; csvHeader?: string; csvStartLine: number; base: number; query: string; current: number }) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !query.trim()) return;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(escaped, "gi");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      if (node.textContent && !node.parentElement?.closest("mark")) nodes.push(node as Text);
      node = walker.nextNode();
    }

    let matchIndex = 0;
    nodes.forEach((textNode) => {
      const text = textNode.data;
      expression.lastIndex = 0;
      if (!expression.test(text)) return;
      expression.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      let match = expression.exec(text);
      while (match) {
        fragment.append(text.slice(cursor, match.index));
        const mark = document.createElement("mark");
        mark.dataset.traceSearch = "true";
        mark.id = `trace-match-${base + matchIndex}`;
        if (base + matchIndex === current) mark.className = "current";
        mark.textContent = match[0];
        fragment.append(mark);
        matchIndex += 1;
        cursor = match.index + match[0].length;
        match = expression.exec(text);
      }
      fragment.append(text.slice(cursor));
      textNode.replaceWith(fragment);
    });

    return () => {
      root.querySelectorAll("mark[data-trace-search]").forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent ?? "")));
      root.normalize();
    };
  }, [base, current, fileContent, query]);

  return <div ref={rootRef}><StaticRichViewer file={file} fileContent={fileContent} csvHeader={csvHeader} csvStartLine={csvStartLine} /></div>;
}

function FileViewer({ caseId, file, lines, csvHeader, page, pageSize, base, query, current }: { caseId: string; file: EvidenceFile; lines: string[]; csvHeader?: string; page: number; pageSize: number; base: number; query: string; current: number }) {
  const fileContent = lines.join("\n");
  if (file.type === "text") return <TextViewer lines={lines} page={page} pageSize={pageSize} base={base} query={query} current={current} />;
  if (file.type === "image") return (
    <div className="image-viewer">
      {/* eslint-disable-next-line @next/next/no-img-element -- evidence is served by a protected runtime endpoint. */}
      <img src={`/api/evidence/${caseId}/${file.id}/image`} alt={file.name} />
    </div>
  );
  if (file.type === "pcap") return <div className="unsupported"><h2>This capture opens in WebShark.</h2><p>Select it again to begin packet analysis.</p></div>;
  const csvStartLine = page === 1 ? 1 : (page - 1) * pageSize;
  if (file.type !== "unsupported") return <RichTextViewer file={file} fileContent={fileContent} csvHeader={csvHeader} csvStartLine={csvStartLine} base={base} query={query} current={current} />;
  return <div className="unsupported"><div className="memory-basin"><Image src="/images/pensieve-basin.png" width={768} height={512} sizes="(max-width: 800px) 80vw, 430px" alt="An enchanted stone memory basin filled with silver light" priority unoptimized /></div><h2>The memory resists this chamber.</h2><p>This artifact requires {file.tool} to inspect.</p></div>;
}

export function Workstation({ caseId, files, onClose }: { caseId: string; files: EvidenceFile[]; onClose: () => void }) {
  const [file, setFile] = React.useState<EvidenceFile | null>(null);
  const [lines, setLines] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(200);
  const [csvHeader, setCsvHeader] = React.useState<string | undefined>();
  const [totalPages, setTotalPages] = React.useState(1);
  const [searchMeta, setSearchMeta] = React.useState<SearchMeta | null>(null);
  const [queryInput, setQueryInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [jumpNext, setJumpNext] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [closing, setClosing] = React.useState(false);
  const [fileFlash, setFileFlash] = React.useState<"green" | "red" | null>("green");
  const [beam, setBeam] = React.useState<SearchBeam | null>(null);
  const [pcapFile, setPcapFile] = React.useState<EvidenceFile | null>(null);
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const panelRef = React.useRef<HTMLElement>(null);
  const beamId = React.useRef(0);
  const pendingMatch = React.useRef<number | null>(null);
  const reduce = useReducedMotion();
  const fileGroups = React.useMemo(() => {
    const groups = new Map<string, EvidenceFile[]>();
    files.forEach((item) => {
      const folder = (item.path ?? "").split("/").slice(0, -1).join("/");
      groups.set(folder, [...(groups.get(folder) ?? []), item]);
    });
    return [...groups.entries()]
      .sort(([left], [right]) => left === "" ? -1 : right === "" ? 1 : left.localeCompare(right))
      .map(([folder, items]) => ({ folder, items }));
  }, [files]);
  const searchable = Boolean(file && file.type !== "unsupported" && file.type !== "pcap" && file.type !== "image");
  const count = searchMeta?.total ?? 0;
  const before = React.useMemo(() => {
    if (!searchMeta || searchMeta.perPage.length === 0) return 0;
    return searchMeta.perPage.slice(0, Math.max(0, page - 1)).reduce((sum, n) => sum + n, 0);
  }, [page, searchMeta]);

  const grouped = React.useMemo(() => {
    const folderMap = new Map<string, EvidenceFile[]>();
    const root: EvidenceFile[] = [];
    for (const item of files) {
      if (item.folder) {
        const group = folderMap.get(item.folder);
        if (group) group.push(item);
        else folderMap.set(item.folder, [item]);
      } else {
        root.push(item);
      }
    }
    return {
      root,
      folders: [...folderMap.entries()].sort((left, right) => left[0].localeCompare(right[0])),
    };
  }, [files]);

  function toggleFolder(folder: string) {
    setExpandedFolders((previous) => {
      const next = new Set(previous);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  }

  React.useEffect(() => { if (fileFlash) { const timer = setTimeout(() => setFileFlash(null), 480); return () => clearTimeout(timer); } }, [fileFlash]);
  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const value = queryInput.trim();
      setQuery(value ? queryInput : "");
      setJumpNext(Boolean(value));
      setCurrent(0);
    }, 250);
    return () => window.clearTimeout(id);
  }, [queryInput]);

  React.useEffect(() => {
    if (!file || file.type === "pcap" || file.type === "unsupported" || file.type === "image") {
      setLines([]); setPage(1); setTotalPages(1); setCsvHeader(undefined); setSearchMeta(null);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page) });
    if (query) {
      params.set("q", query);
      if (jumpNext) params.set("jump", "1");
    }
    fetch(`/api/evidence/${caseId}/${file.id}?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setLines(Array.isArray(data.lines) ? data.lines : []);
        setCsvHeader(typeof data.csvHeader === "string" ? data.csvHeader : undefined);
        setPageSize(typeof data.pageSize === "number" && data.pageSize > 0 ? data.pageSize : 200);
        setTotalPages(typeof data.totalPages === "number" && data.totalPages > 0 ? data.totalPages : 1);
        setSearchMeta(data.search ?? null);
        setPage(typeof data.page === "number" && data.page > 0 ? data.page : page);
        if (pendingMatch.current !== null) {
          const target = pendingMatch.current;
          pendingMatch.current = null;
          setCurrent(target);
        }
      })
      .catch((err) => {
        console.error("[workstation] evidence fetch failed:", err);
        if (!cancelled) { setLines([]); setTotalPages(1); setSearchMeta(null); pendingMatch.current = null; }
      })
      .finally(() => {
        if (!cancelled) setJumpNext(false);
      });
    return () => { cancelled = true; };
  }, [caseId, file, jumpNext, page, query]);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || Boolean(target?.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f" && searchable) { event.preventDefault(); setSearchOpen(true); }
      if (searchOpen && event.key === "Escape") setSearchOpen(false);
      if (searchOpen && event.key === "Enter") { event.preventDefault(); navigate(event.shiftKey ? -1 : 1); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "g" && searchable) { event.preventDefault(); navigate(event.shiftKey ? -1 : 1); }
      if (!searchOpen && file && !isEditing && !event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === "x") { event.preventDefault(); closeFile(); }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  });

  React.useEffect(() => {
    if (!count) return;
    document.getElementById(`trace-match-${current}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [current, count, reduce]);

  React.useEffect(() => {
    if (!query || !count || reduce) { setBeam(null); return; }
    const timer = window.setTimeout(() => {
      const panel = panelRef.current?.getBoundingClientRect();
      const search = panelRef.current?.querySelector(".search-box")?.getBoundingClientRect();
      const match = document.getElementById(`trace-match-${current}`)?.getBoundingClientRect();
      if (!panel || !search || !match) return;
      setBeam({
        id: ++beamId.current,
        x1: search.left - panel.left + 18,
        y1: search.bottom - panel.top - 4,
        x2: match.left - panel.left + match.width / 2,
        y2: match.top - panel.top + match.height / 2,
      });
    }, 90);
    return () => window.clearTimeout(timer);
  }, [current, count, query, reduce]);

  function navigate(direction: number) {
    const total = searchMeta?.total ?? 0;
    if (!total) return;
    const target = (current + direction + total) % total;
    const perPage = searchMeta?.perPage ?? [];
    let targetPage = 1;
    let acc = 0;
    for (let i = 0; i < perPage.length; i += 1) {
      if (target < acc + perPage[i]) { targetPage = i + 1; break; }
      acc += perPage[i];
    }
    if (perPage.length > 0 && targetPage !== page) {
      pendingMatch.current = target;
      setPage(targetPage);
    } else {
      setCurrent(target);
    }
  }
  function choose(next: EvidenceFile) {
    if (next.type === "pcap") { setPcapFile(next); return; }
    setFileFlash("green");
    setFile(next);
    setLines([]); setPage(1); setPageSize(200); setTotalPages(1); setCsvHeader(undefined);
    setSearchMeta(null); setQueryInput(""); setQuery(""); setJumpNext(false);
    pendingMatch.current = null; setCurrent(0); setSearchOpen(false);
  }
  function gotoPage(next: number) {
    if (next < 1 || next > totalPages || next === page) return;
    pendingMatch.current = null;
    setPage(next);
    if (searchMeta && searchMeta.total > 0) {
      setCurrent(searchMeta.perPage.slice(0, next - 1).reduce((sum, n) => sum + n, 0));
    }
  }
  function closeFile() { setFileFlash("red"); setTimeout(() => { setFile(null); setLines([]); setPage(1); setTotalPages(1); setCsvHeader(undefined); setSearchMeta(null); setQueryInput(""); setQuery(""); pendingMatch.current = null; setCurrent(0); setSearchOpen(false); }, 180); }
  function closeWorkstation() { setClosing(true); setTimeout(onClose, reduce ? 100 : 1380); }

  return (
    <motion.div className="workstation-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="TRACE forensic workstation">
      <motion.div className="workstation-flight" animate={closing && !reduce ? { x: [0, -65, 150, 40, 420, "125vw"], y: [0, -70, 95, -125, -25, "18vh"], rotate: [0, -8, 18, -22, 9, 32], scale: [1, .82, .68, .55, .42, .28] } : undefined} transition={{ duration: reduce ? .1 : 1.32, times: [0,.16,.34,.54,.73,1], ease: "easeInOut" }}>
        {closing && !reduce && <motion.div className="plane-tail" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1.45], opacity: [0, 1, 0] }} transition={{ duration: 1.1, delay: .18, ease: "easeOut" }} />}
        {closing && !reduce && <motion.div className="paper-plane-mark" initial={{ opacity: 0, scale: .35 }} animate={{ opacity: [0, 0, 1, 1], scale: [.35, .48, 1, 1] }} transition={{ duration: .68, times: [0, .32, .7, 1] }} aria-hidden="true"><span /></motion.div>}
        <motion.div
          className={`workstation-scroll ${closing ? "is-closing" : ""}`}
          initial={reduce ? { opacity: 0 } : { scaleY: 0.03, scaleX: 0.48, opacity: 0, rotateX: 12 }}
          animate={closing && !reduce ? { scaleY: [1, .62, .28], scaleX: [1, .78, .38], clipPath: ["polygon(.4% 1%,99.5% .4%,99.8% 99%,.2% 99.7%)", "polygon(0 0,100% 50%,0 100%,22% 50%)", "polygon(0 0,100% 50%,0 100%,30% 50%)"] } : { scaleY: 1, scaleX: 1, opacity: 1, rotateX: 0 }}
          transition={closing ? { duration: reduce ? 0.1 : 0.42, ease: [0.6, 0, 0.85, 0.35] } : { duration: reduce ? 0.1 : 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
        <div className="parchment-edge parchment-top" /><div className="parchment-edge parchment-bottom" />
        <div className="workstation">
          <header className="workstation-top"><div><span>TRACE</span> FORENSICS</div><span className="current-file"><span className="current-file-name">{file?.name ?? "NO FILE OPEN"}</span>{searchable && <button className="header-find" onClick={() => setSearchOpen(true)}><kbd>CTRL/CMD + F</kbd><span>TO SEARCH</span></button>}</span><button onClick={closeWorkstation} aria-label="Exit workstation"><X /></button></header>
<<<<<<< Updated upstream
          <aside className="file-sidebar"><p>EVIDENCE</p>{fileGroups.map(({ folder, items }) => <section className="file-group" key={folder || "root"}><h2>{folder ? folder.toUpperCase() : "CASE FILES"}</h2>{items.map((item) => <button className={item.id === file?.id ? "active" : ""} onClick={() => choose(item)} key={item.id}><FileText /><span>{item.name}</span><small>{item.size}</small></button>)}</section>)}</aside>
=======
          <aside className="file-sidebar"><p>EVIDENCE</p>{grouped.root.map((item) => <button className={item.id === file?.id ? "active" : ""} onClick={() => choose(item)} key={item.id}><FileText /><span>{item.name}</span><small>{item.size}</small></button>)}
            {grouped.folders.map(([folder, items]) => {
              const open = expandedFolders.has(folder);
              return <div className="file-folder" key={folder}>
                <button type="button" className={`folder-toggle ${open ? "open" : ""}`} aria-expanded={open} onClick={() => toggleFolder(folder)}>{open ? <ChevronDown /> : <ChevronRight />}<span>{folder}</span><small>{items.length}</small></button>
                <AnimatePresence initial={false}>{open && <motion.div className="folder-items" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>{items.map((item) => <button className={item.id === file?.id ? "active" : ""} onClick={() => choose(item)} key={item.id}><FileText /><span>{item.name}</span><small>{item.size}</small></button>)}</motion.div>}</AnimatePresence>
              </div>;
            })}</aside>
>>>>>>> Stashed changes
          <section className="viewer-panel" ref={panelRef}>
            <div className="viewer-toolbar"><span>{file?.type.toUpperCase() ?? "VIEWER"}</span><div>{file && <button onClick={closeFile} className="close-file" aria-label="Close file"><X /></button>}</div></div>
            <AnimatePresence mode="wait">{file ? <motion.div key={file.id} className="viewer-content" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><ProtectedViewer className="protected-viewer" maxLines={file.name.toLowerCase().endsWith(".pem") ? Infinity : 2}><FileViewer caseId={caseId} file={file} lines={lines} csvHeader={csvHeader} page={page} pageSize={pageSize} base={before} query={query} current={current} /></ProtectedViewer>{file.type !== "pcap" && file.type !== "unsupported" && file.type !== "image" && <div className="evidence-pager"><button onClick={() => gotoPage(page - 1)} disabled={page <= 1}>← PREVIOUS</button><span>PAGE {page} / {totalPages}</span><button onClick={() => gotoPage(page + 1)} disabled={page >= totalPages}>NEXT →</button></div>}</motion.div> : <motion.div key="empty" className="viewer-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><FileText/><p>Select evidence to inspect</p></motion.div>}</AnimatePresence>
            <AnimatePresence>{searchOpen && searchable && <motion.div className="search-box" initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }}><Search /><input autoFocus value={queryInput} onChange={(event) => { setQueryInput(event.target.value); }} placeholder="Find in evidence" aria-label="Find in evidence"/><span>{query ? `${count ? current + 1 : 0} / ${count}` : "0 / 0"}</span><button onClick={() => navigate(-1)} aria-label="Previous result"><ChevronUp /></button><button onClick={() => navigate(1)} aria-label="Next result"><ChevronDown /></button><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>{query && <i className={count ? "search-magic" : "search-miss"} key={`${query}-${current}`} />}</motion.div>}</AnimatePresence>
            <AnimatePresence>{beam && <motion.svg key={beam.id} className="search-flight" viewBox={`0 0 ${Math.max(1, panelRef.current?.clientWidth ?? 1)} ${Math.max(1, panelRef.current?.clientHeight ?? 1)}`} preserveAspectRatio="none" initial={{ opacity: 1 }} exit={{ opacity: 0 }}><defs><filter id="blue-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><motion.path d={`M ${beam.x1} ${beam.y1} C ${beam.x1 - 90} ${beam.y1 + 34}, ${beam.x2 + 90} ${beam.y2 - 34}, ${beam.x2} ${beam.y2}`} pathLength="1" fill="none" stroke="url(#search-gradient)" strokeWidth="3" strokeDasharray=".14 .86" filter="url(#blue-glow)" initial={{ strokeDashoffset: 1, opacity: 0 }} animate={{ strokeDashoffset: 0, opacity: [0, 1, 1, 0] }} transition={{ duration: .58, times: [0,.12,.82,1], ease: "easeOut" }}/><motion.circle cx={beam.x2} cy={beam.y2} r="9" fill="none" stroke="#aee3ff" strokeWidth="2" initial={{ scale: .2, opacity: 0 }} animate={{ scale: [0.2, 1.5], opacity: [0, .9, 0] }} transition={{ duration: .32, delay: .38 }}/><linearGradient id="search-gradient"><stop stopColor="#f4fbff"/><stop offset=".45" stopColor="#78bde9"/><stop offset="1" stopColor="#3277a8"/></linearGradient></motion.svg>}</AnimatePresence>
            {fileFlash && <motion.div className={`file-magic ${fileFlash}`} initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.45 }} />}
          </section>
        </div>
        </motion.div>
      </motion.div>
      <AnimatePresence>{pcapFile && <WebSharkWorkstation fileName={pcapFile.name} captureName={pcapFile.webSharkCaptureName ?? pcapFile.name} onClose={() => setPcapFile(null)} />}</AnimatePresence>
    </motion.div>
  );
}
