"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, Download, FileText, Search, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EvidenceFile } from "@/data/trace";

type MatchPart = { text: string; match: boolean; matchIndex?: number };
type SearchBeam = { id: number; x1: number; y1: number; x2: number; y2: number };

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

function TextViewer({ text, query, current }: { text: string; query: string; current: number }) {
  let offset = 0;
  return <div className="text-viewer">{text.split("\n").map((line, lineIndex) => {
    const result = splitMatches(line, query);
    const lineOffset = offset; offset += result.count;
    return <div className="code-line" key={lineIndex}><span>{lineIndex + 1}</span><code>{result.parts.map((part, index) => part.match ? <mark id={`trace-match-${lineOffset + (part.matchIndex ?? 0)}`} className={lineOffset + (part.matchIndex ?? 0) === current ? "current" : ""} key={index}>{part.text}</mark> : <React.Fragment key={index}>{part.text}</React.Fragment>)}</code></div>;
  })}</div>;
}

function downloadMock(file: EvidenceFile) {
  const blob = new Blob([file.content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = file.name; anchor.click(); URL.revokeObjectURL(url);
}

function FileViewer({ file, query, current }: { file: EvidenceFile; query: string; current: number }) {
  if (file.type === "text") return <TextViewer text={file.content} query={query} current={current} />;
  if (file.type === "markdown") return <article className="markdown-viewer"><ReactMarkdown remarkPlugins={[remarkGfm]}>{file.content}</ReactMarkdown></article>;
  if (file.type === "csv") {
    const rows = file.content.split("\n").map((row) => row.split(","));
    return <div className="csv-wrap"><table><thead><tr>{rows[0].map((cell) => <th key={cell}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
  }
  if (file.type === "json") return <pre className="json-viewer">{JSON.stringify(JSON.parse(file.content), null, 2)}</pre>;
  return <div className="unsupported"><div className="memory-basin"><Image src="/images/pensieve-basin.png" width={768} height={512} sizes="(max-width: 800px) 80vw, 430px" alt="An enchanted stone memory basin filled with silver light" priority unoptimized /><i /><i /></div><h2>The memory resists this chamber.</h2><p>Perhaps a tool called {file.tool} might be able to open this.</p><button onClick={() => downloadMock(file)}><Download /> DOWNLOAD {file.name}</button></div>;
}

export function Workstation({ files, initialFile, onClose }: { files: EvidenceFile[]; initialFile: EvidenceFile; onClose: () => void }) {
  const [file, setFile] = React.useState<EvidenceFile | null>(initialFile);
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [closing, setClosing] = React.useState(false);
  const [fileFlash, setFileFlash] = React.useState<"green" | "red" | null>("green");
  const [beam, setBeam] = React.useState<SearchBeam | null>(null);
  const panelRef = React.useRef<HTMLElement>(null);
  const beamId = React.useRef(0);
  const reduce = useReducedMotion();
  const searchable = file?.type === "text";
  const count = searchable && file ? splitMatches(file.content, query).count : 0;

  React.useEffect(() => { if (fileFlash) { const timer = setTimeout(() => setFileFlash(null), 480); return () => clearTimeout(timer); } }, [fileFlash]);
  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f" && searchable) { event.preventDefault(); setSearchOpen(true); }
      if (searchOpen && event.key === "Escape") setSearchOpen(false);
      if (searchOpen && event.key === "Enter") { event.preventDefault(); navigate(event.shiftKey ? -1 : 1); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "g" && searchable) { event.preventDefault(); navigate(event.shiftKey ? -1 : 1); }
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

  function navigate(direction: number) { if (count) setCurrent((value) => (value + direction + count) % count); }
  function choose(next: EvidenceFile) { setFileFlash("green"); setFile(next); setQuery(""); setCurrent(0); setSearchOpen(false); }
  function closeFile() { setFileFlash("red"); setTimeout(() => { setFile(null); setQuery(""); setSearchOpen(false); }, 180); }
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
          <header className="workstation-top"><div><span>TRACE</span> FORENSICS</div><span className="current-file">{file?.name ?? "NO FILE OPEN"}</span><button onClick={closeWorkstation} aria-label="Close workstation"><X /></button></header>
          <aside className="file-sidebar"><p>EVIDENCE</p>{files.map((item) => <button className={item.id === file?.id ? "active" : ""} onClick={() => choose(item)} key={item.id}><FileText /><span>{item.name}</span><small>{item.size}</small></button>)}</aside>
          <section className="viewer-panel" ref={panelRef}>
            <div className="viewer-toolbar"><span>{file?.type.toUpperCase() ?? "VIEWER"}</span><div>{searchable && <button onClick={() => setSearchOpen(true)}><Search /> FIND <kbd>⌘F</kbd></button>}{file && <button onClick={closeFile} className="close-file">CLOSE FILE</button>}</div></div>
            <AnimatePresence mode="wait">{file ? <motion.div key={file.id} className="viewer-content" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><FileViewer file={file} query={query} current={current} /></motion.div> : <motion.div key="empty" className="viewer-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><FileText/><p>Select evidence to inspect</p></motion.div>}</AnimatePresence>
            <AnimatePresence>{searchOpen && searchable && <motion.div className="search-box" initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }}><Search /><input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setCurrent(0); }} placeholder="Find in evidence" aria-label="Find in evidence"/><span>{query ? `${count ? current + 1 : 0} / ${count}` : "0 / 0"}</span><button onClick={() => navigate(-1)} aria-label="Previous result"><ChevronUp /></button><button onClick={() => navigate(1)} aria-label="Next result"><ChevronDown /></button><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>{query && <i className={count ? "search-magic" : "search-miss"} key={`${query}-${current}`} />}</motion.div>}</AnimatePresence>
            <AnimatePresence>{beam && <motion.svg key={beam.id} className="search-flight" viewBox={`0 0 ${Math.max(1, panelRef.current?.clientWidth ?? 1)} ${Math.max(1, panelRef.current?.clientHeight ?? 1)}`} preserveAspectRatio="none" initial={{ opacity: 1 }} exit={{ opacity: 0 }}><defs><filter id="blue-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><motion.path d={`M ${beam.x1} ${beam.y1} C ${beam.x1 - 90} ${beam.y1 + 34}, ${beam.x2 + 90} ${beam.y2 - 34}, ${beam.x2} ${beam.y2}`} pathLength="1" fill="none" stroke="url(#search-gradient)" strokeWidth="3" strokeDasharray=".14 .86" filter="url(#blue-glow)" initial={{ strokeDashoffset: 1, opacity: 0 }} animate={{ strokeDashoffset: 0, opacity: [0, 1, 1, 0] }} transition={{ duration: .58, times: [0,.12,.82,1], ease: "easeOut" }}/><motion.circle cx={beam.x2} cy={beam.y2} r="9" fill="none" stroke="#aee3ff" strokeWidth="2" initial={{ scale: .2, opacity: 0 }} animate={{ scale: [0.2, 1.5], opacity: [0, .9, 0] }} transition={{ duration: .32, delay: .38 }}/><linearGradient id="search-gradient"><stop stopColor="#f4fbff"/><stop offset=".45" stopColor="#78bde9"/><stop offset="1" stopColor="#3277a8"/></linearGradient></motion.svg>}</AnimatePresence>
            {fileFlash && <motion.div className={`file-magic ${fileFlash}`} initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.45 }} />}
          </section>
        </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
