import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "node:crypto";
import {
  evidenceCountCacheKey,
  evidencePageCacheKey,
  evidenceSearchCacheKey,
  cacheGet,
  cacheSet,
} from "../cache/redis";

/** Fixed number of evidence lines rendered per page. */
export const EVIDENCE_LINES_PER_PAGE = 200;

export type EvidenceViewerType = "text" | "markdown" | "csv" | "json" | "image" | "pcap" | "unsupported";

export interface EvidenceFileMetadata {
  id: string;
  name: string;
  path: string;
  type: EvidenceViewerType;
  size: string;
  tool?: string;
  webSharkCaptureName?: string;
}

interface StoredEvidenceFile extends EvidenceFileMetadata {
  relativePath: string;
}

const CASE_ROOTS = new Map<string, string>([
  ["1", path.resolve(process.cwd(), process.env.EVIDENCE_ROOT || "CASE_05_SILENT_BEACON")],
]);

const manifests = new Map<string, Promise<StoredEvidenceFile[]>>();

function viewerType(name: string): EvidenceViewerType {
  if (name === ".bash_profile") return "text";
  switch (path.extname(name).toLowerCase()) {
    case ".pcap": return "pcap";
    case ".md": return "markdown";
    case ".csv": return "csv";
    case ".json": return "json";
    case ".log": return "text";
    case ".pem": return "text";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp":
    case ".gif": return "image";
    default: return "unsupported";
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function evidenceId(relativePath: string): string {
  return createHash("sha256").update(relativePath).digest("base64url").slice(0, 20);
}

async function filesBelow(directory: string, root: string): Promise<StoredEvidenceFile[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(fullPath, root);
    if (!entry.isFile()) return [];

    const relativePath = path.relative(root, fullPath);
    const type = viewerType(entry.name);
    const info = await fs.stat(fullPath);
    return [{
      id: evidenceId(relativePath),
      name: entry.name,
      path: relativePath,
      type,
      size: formatSize(info.size),
      relativePath,
      ...(type === "pcap"
        ? { tool: "Wireshark", webSharkCaptureName: entry.name }
        : {}),
    } satisfies StoredEvidenceFile];
  }));
  return nested.flat();
}

async function getStoredEvidenceManifest(caseId: string): Promise<StoredEvidenceFile[] | null> {
  const root = CASE_ROOTS.get(caseId);
  if (!root) return null;

  let manifest = manifests.get(caseId);
  if (!manifest) {
    manifest = filesBelow(root, root).then((files) =>
      files.sort((left, right) => left.name.localeCompare(right.name)),
    );
    manifests.set(caseId, manifest);
  }
  return manifest;
}

export async function getEvidenceManifest(caseId: string): Promise<EvidenceFileMetadata[] | null> {
  const manifest = await getStoredEvidenceManifest(caseId);
  if (!manifest) return null;
  return manifest.map((file) => ({
    id: file.id,
    name: file.name,
    path: file.relativePath,
    type: file.type,
    size: file.size,
    ...(file.tool ? { tool: file.tool } : {}),
    ...(file.webSharkCaptureName
      ? { webSharkCaptureName: file.webSharkCaptureName }
      : {}),
  }));
}

async function resolveEvidencePath(caseId: string, fileId: string): Promise<string> {
  const root = CASE_ROOTS.get(caseId);
  const manifest = await getStoredEvidenceManifest(caseId);
  const file = manifest?.find((candidate) => candidate.id === fileId);
  if (!root || !file) throw new Error("Unknown evidence file");

  const resolved = path.resolve(root, file.relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Evidence path escaped its case root");
  }
  return resolved;
}

export class EvidencePageOutOfRangeError extends Error {
  constructor(page: number) {
    super(`Page ${page} is out of range`);
    this.name = "EvidencePageOutOfRangeError";
  }
}

/**
 * Read the complete content of a single evidence file from the server-side
 * source. This is never sent to the client and is never cached in Redis
 * (Redis caches individual derived pages / counts / search stats only).
 */
export async function readEvidenceContent(
  caseId: string,
  fileId: string,
): Promise<string> {
  return fs.readFile(await resolveEvidencePath(caseId, fileId), "utf-8");
}

/** Read a binary evidence artifact for the dedicated image endpoint. */
export async function readEvidenceBinary(
  caseId: string,
  fileId: string,
): Promise<Buffer> {
  return fs.readFile(await resolveEvidencePath(caseId, fileId));
}

/**
 * Return the number of newline-delimited lines in an evidence file.
 * Line count metadata is cached in Redis (TTL = EVIDENCE_CACHE_TTL_SECONDS).
 */
export async function getEvidenceLineCount(
  caseId: string,
  fileId: string,
): Promise<number> {
  const key = evidenceCountCacheKey(caseId, fileId);

  const cached = await cacheGet(key);
  if (cached !== null) {
    const n = Number(cached);
    if (Number.isInteger(n) && n >= 0) return n;
  }

  const content = await readEvidenceContent(caseId, fileId);
  const count = content.length ? content.split("\n").length : 0;

  await cacheSet(key, String(count));
  return count;
}

/**
 * Return a 1-indexed line range from an evidence file.
 * startLine and endLine are both inclusive.
 */
export async function readEvidenceLines(
  caseId: string,
  fileId: string,
  startLine: number,
  endLine: number,
): Promise<string> {
  const content = await readEvidenceContent(caseId, fileId);
  const lines = content.split("\n");
  return lines.slice(startLine - 1, endLine).join("\n");
}

export interface EvidencePage {
  page: number;
  pageSize: number;
  totalPages: number;
  lines: string[];
  /** CSV column names, repeated separately for every page. */
  csvHeader?: string;
}

/**
 * Read a single page of an evidence file.
 *
 * Caching strategy: Redis stores INDIVIDUAL PAGINATED RESULTS
 * (key trace:evidence:{caseId}:{fileId}:page:{page}, TTL =
 * EVIDENCE_CACHE_TTL_SECONDS), never the complete evidence file.
 */
export async function readEvidencePage(
  caseId: string,
  fileId: string,
  page: number,
): Promise<EvidencePage> {
  const file = (await getStoredEvidenceManifest(caseId))?.find((candidate) => candidate.id === fileId);
  const isCsv = file?.type === "csv";

  const totalLines = await getEvidenceLineCount(caseId, fileId);
  // PEM files are deliberately exposed as one page so attendees can copy the
  // complete certificate/key artifact when the exercise requires it.
  const pageSize = file?.name.toLowerCase().endsWith(".pem")
    ? Math.max(1, totalLines)
    : EVIDENCE_LINES_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(totalLines / pageSize));

  if (!Number.isInteger(page) || page < 1 || page > totalPages) {
    throw new EvidencePageOutOfRangeError(page);
  }

  const key = evidencePageCacheKey(caseId, fileId, page);

  const cached = await cacheGet(key);
  if (cached !== null) {
    try {
      const lines = JSON.parse(cached) as string[];
      if (Array.isArray(lines)) {
        const csvHeader = isCsv ? await readEvidenceLines(caseId, fileId, 1, 1) : undefined;
        return {
          page,
          pageSize,
          totalPages,
          // The first stored CSV page includes the source header. It is sent
          // separately so every page can render it exactly once.
          lines: isCsv && page === 1 ? lines.slice(1) : lines,
          ...(csvHeader !== undefined ? { csvHeader } : {}),
        };
      }
    } catch {
      // fall through and rebuild from source
    }
  }

  const startLine = (page - 1) * pageSize + 1;
  const endLine = Math.min(page * pageSize, totalLines);

  const text = await readEvidenceLines(caseId, fileId, startLine, endLine);
  const lines = text.length ? text.split("\n") : [];

  await cacheSet(key, JSON.stringify(lines));

  const csvHeader = isCsv ? await readEvidenceLines(caseId, fileId, 1, 1) : undefined;
  return {
    page,
    pageSize,
    totalPages,
    lines: isCsv && page === 1 ? lines.slice(1) : lines,
    ...(csvHeader !== undefined ? { csvHeader } : {}),
  };
}

/**
 * Mirror of the client's match counter so server-side search statistics
 * align exactly with the client's per-page highlighting.
 */
export function countQueryMatches(text: string, query: string): number {
  if (!query.trim()) return 0;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text
    .split(regex)
    .filter(Boolean)
    .filter((part) => part.toLowerCase() === query.toLowerCase()).length;
}

export interface EvidenceSearchStats {
  q: string;
  total: number;
  /** perPage[p] = number of matches on 0-indexed page p. */
  perPage: number[];
}

/**
 * Compute whole-file search statistics server-side. The full file is scanned
 * only on the server; the result is cached in Redis
 * (key trace:evidence:{caseId}:{fileId}:search:{query}, TTL =
 * EVIDENCE_CACHE_TTL_SECONDS). Only the compact statistics are returned to the
 * client.
 */
export async function getSearchStats(
  caseId: string,
  fileId: string,
  query: string,
): Promise<EvidenceSearchStats> {
  const trimmed = query.trim();
  if (!trimmed) return { q: trimmed, total: 0, perPage: [] };

  const key = evidenceSearchCacheKey(caseId, fileId, trimmed);

  const cached = await cacheGet(key);
  if (cached !== null) {
    try {
      const parsed = JSON.parse(cached) as EvidenceSearchStats;
      if (parsed && typeof parsed.total === "number" && Array.isArray(parsed.perPage)) {
        return parsed;
      }
    } catch {
      // fall through and recompute
    }
  }

  const content = await readEvidenceContent(caseId, fileId);
  const lines = content.length ? content.split("\n") : [];

  const file = (await getStoredEvidenceManifest(caseId))?.find((candidate) => candidate.id === fileId);
  const pageSize = file?.name.toLowerCase().endsWith(".pem")
    ? Math.max(1, lines.length)
    : EVIDENCE_LINES_PER_PAGE;
  const pageCount = Math.max(1, Math.ceil(lines.length / pageSize));
  const perPage = new Array<number>(pageCount).fill(0);

  for (let i = 0; i < lines.length; i += 1) {
    const matches = countQueryMatches(lines[i], trimmed);
    if (matches > 0) {
      perPage[Math.floor(i / pageSize)] += matches;
    }
  }

  const total = perPage.reduce((sum, n) => sum + n, 0);
  const stats: EvidenceSearchStats = { q: trimmed, total, perPage };

  await cacheSet(key, JSON.stringify(stats));
  return stats;
}
