import * as fs from "fs/promises";
import * as path from "path";
import {
  evidenceCountCacheKey,
  evidencePageCacheKey,
  evidenceSearchCacheKey,
  cacheGet,
  cacheSet,
} from "../cache/redis";

/** Fixed number of evidence lines rendered per page. */
export const EVIDENCE_LINES_PER_PAGE = 200;

const STORAGE_DIR = process.env.EVIDENCE_STORAGE_DIR || "evidence";

export class EvidencePageOutOfRangeError extends Error {
  constructor(page: number) {
    super(`Page ${page} is out of range`);
    this.name = "EvidencePageOutOfRangeError";
  }
}

function resolveEvidencePath(caseId: string, fileId: string): string {
  return path.join(process.cwd(), STORAGE_DIR, caseId, fileId);
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
  return fs.readFile(resolveEvidencePath(caseId, fileId), "utf-8");
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
  const pageSize = EVIDENCE_LINES_PER_PAGE;

  const totalLines = await getEvidenceLineCount(caseId, fileId);
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
        return { page, pageSize, totalPages, lines };
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

  return { page, pageSize, totalPages, lines };
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

  const pageCount = Math.max(1, Math.ceil(lines.length / EVIDENCE_LINES_PER_PAGE));
  const perPage = new Array<number>(pageCount).fill(0);

  for (let i = 0; i < lines.length; i += 1) {
    const matches = countQueryMatches(lines[i], trimmed);
    if (matches > 0) {
      perPage[Math.floor(i / EVIDENCE_LINES_PER_PAGE)] += matches;
    }
  }

  const total = perPage.reduce((sum, n) => sum + n, 0);
  const stats: EvidenceSearchStats = { q: trimmed, total, perPage };

  await cacheSet(key, JSON.stringify(stats));
  return stats;
}