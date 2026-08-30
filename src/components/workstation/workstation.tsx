"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, Download, FileText, Search, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EvidenceFile } from "@/data/trace";

type MatchPart = { text: string; match: boolean; matchIndex?: number };

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

function FileViewer({ file, query, current }: { file: EvidenceFile; query: string; current: number }) {
  if (file.type === "text") return <TextViewer text={file.content} query={query} current={current} />;
  if (file.type === "markdown") return <article className="markdown-viewer"><ReactMarkdown remarkPlugins={[remarkGfm]}>{file.content}</ReactMarkdown></article>;
  if (file.type === "csv") {
    const rows = file.content.split("\n").map((row) => row.split(","));
    return <div className="csv-wrap"><table><thead><tr>{rows[0].map((cell) => <th key={cell}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
  }
  if (file.type === "json") return <pre className="json-viewer">{JSON.stringify(JSON.parse(file.content), null, 2)}</pre>;
  return <div className="unsupported"><div className="unsupported-ring" /><p>The Pensieve cannot interpret this memory.</p><h2>Open this capture in {file.tool}.</h2><button><Download /> DOWNLOAD {file.name}</button></div>;
}

export function Workstation({ files, initialFile, onClose }: { files: EvidenceFile[]; initialFile: EvidenceFile; onClose: () => void }) {
  const [file, setFile] = React.useState(initialFile);
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [closing, setClosing] = React.useState(false);
  const [fileFlash, setFileFlash] = React.useState<"green" | "red" | null>("green");
  const reduce = useReducedMotion();
  const searchable = file.type === "text";
  const count = searchable ? splitMatches(file.content, query).count : 0;

  React.useEffect(() => { if (fileFlash) { const timer = setTimeout(() => setFileFlash(null), 480); return () => clearTimeout(timer); } }, [fileFlash]);
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

  function navigate(direction: number) { if (count) setCurrent((value) => (value + direction + count) % count); }
  function choose(next: EvidenceFile) { setFileFlash(file ? "green" : null); setFile(next); setQuery(""); setCurrent(0); setSearchOpen(false); }
  function closeFile() { setFileFlash("red"); setTimeout(() => { setFile(files[0]); setQuery(""); }, 180); }
  function closeWorkstation() { setClosing(true); setTimeout(onClose, reduce ? 100 : 760); }

  return (
    <motion.div className="workstation-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="TRACE forensic workstation">
      <motion.div
        className={`workstation-scroll ${closing ? "is-closing" : ""}`}
        initial={reduce ? { opacity: 0 } : { scaleY: 0.03, scaleX: 0.48, opacity: 0, rotateX: 12 }}
        animate={closing && !reduce ? { scale: [1, 0.62, 0.24], rotate: [0, -5, -18], x: [0, 90, "115vw"], y: [0, 20, "-35vh"], clipPath: ["polygon(0 0,100% 0,100% 100%,0 100%)", "polygon(0 0,100% 50%,0 100%,22% 50%)", "polygon(0 0,100% 50%,0 100%,28% 50%)"] } : { scaleY: 1, scaleX: 1, opacity: 1, rotateX: 0 }}
        transition={closing ? { duration: reduce ? 0.1 : 0.72, ease: [0.6, 0, 0.85, 0.35] } : { duration: reduce ? 0.1 : 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="parchment-edge parchment-top" /><div className="parchment-edge parchment-bottom" />
        <div className="workstation">
          <header className="workstation-top"><div><span>TRACE</span> FORENSICS</div><span className="current-file">{file.name}</span><button onClick={closeWorkstation} aria-label="Close workstation"><X /></button></header>
          <aside className="file-sidebar"><p>EVIDENCE</p>{files.map((item) => <button className={item.id === file.id ? "active" : ""} onClick={() => choose(item)} key={item.id}><FileText /><span>{item.name}</span><small>{item.size}</small></button>)}</aside>
          <section className="viewer-panel">
            <div className="viewer-toolbar"><span>{file.type.toUpperCase()}</span><div>{searchable && <button onClick={() => setSearchOpen(true)}><Search /> FIND <kbd>⌘F</kbd></button>}<button onClick={closeFile} className="close-file">CLOSE FILE</button></div></div>
            <AnimatePresence mode="wait"><motion.div key={file.id} className="viewer-content" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0 0)" }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><FileViewer file={file} query={query} current={current} /></motion.div></AnimatePresence>
            <AnimatePresence>{searchOpen && searchable && <motion.div className="search-box" initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }}><Search /><input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setCurrent(0); }} placeholder="Find in evidence" aria-label="Find in evidence"/><span>{query ? `${count ? current + 1 : 0} / ${count}` : "0 / 0"}</span><button onClick={() => navigate(-1)} aria-label="Previous result"><ChevronUp /></button><button onClick={() => navigate(1)} aria-label="Next result"><ChevronDown /></button><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>{query && <i className={count ? "search-magic" : "search-miss"} key={`${query}-${current}`} />}</motion.div>}</AnimatePresence>
            {fileFlash && <motion.div className={`file-magic ${fileFlash}`} initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ duration: 0.45 }} />}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
