import { Hono } from "hono";
import { getCase } from "../../src/data/trace";
import {
  EVIDENCE_LINES_PER_PAGE,
  EvidencePageOutOfRangeError,
  getSearchStats,
  readEvidencePage,
} from "./storage/evidence-storage";

const PORT = Number(process.env.API_PORT ?? 8787);

const app = new Hono();

app.get("/health", (c) =>
  c.json({ ok: true, api: "trace-hono", port: PORT, uptime: process.uptime() }),
);

app.get("/api/evidence/:caseId/:fileId", async (c) => {
  const caseId = c.req.param("caseId");
  const fileId = c.req.param("fileId");

  const traceCase = getCase(caseId);
  if (!traceCase) {
    return c.json({ error: "Case not found" }, 404);
  }

  const fileMeta = traceCase.evidence.find((f) => f.id === fileId);
  if (!fileMeta) {
    return c.json({ error: "File not found" }, 404);
  }

  if (fileMeta.type === "pcap") {
    return c.json(
      {
        page: 1,
        pageSize: EVIDENCE_LINES_PER_PAGE,
        totalPages: 1,
        lines: [],
        search: null,
      },
      200,
    );
  }

  const url = new URL(c.req.url);
  const rawPage = url.searchParams.get("page") ?? "1";
  const query = url.searchParams.get("q")?.trim() ?? "";
  const jumpToFirst = url.searchParams.get("jump") === "1";

  if (!/^\d+$/.test(rawPage)) {
    return c.json({ error: "Invalid page" }, 400);
  }
  const page = Number.parseInt(rawPage, 10);

  try {
    if (jumpToFirst && query) {
      const stats = await getSearchStats(caseId, fileId, query);
      const firstMatchPage =
        stats.total > 0 ? stats.perPage.findIndex((n) => n > 0) + 1 : 1;
      const data = await readEvidencePage(caseId, fileId, firstMatchPage);
      return c.json({ ...data, search: stats }, 200);
    }

    const data = await readEvidencePage(caseId, fileId, page);
    const search = query ? await getSearchStats(caseId, fileId, query) : null;
    return c.json({ ...data, search }, 200);
  } catch (err) {
    if (err instanceof EvidencePageOutOfRangeError) {
      return c.json({ error: "Page out of range" }, 400);
    }
    console.error(`[trace-api] failed to read ${caseId}/${fileId}:`, err);
    return c.json({ error: "Evidence unavailable" }, 500);
  }
});

console.log(`[trace-api] listening on http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  fetch: app.fetch,
});