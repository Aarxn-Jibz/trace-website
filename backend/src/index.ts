import { Hono } from "hono";

/**
 * Bun-native API scaffold.
 *
 * Route implementation intentionally deferred. Planned modules:
 * - /health: service health and dependency status
 * - /cases/:caseId/evidence/:evidenceId/pages/:page: protected text pages
 * - /cases/:caseId/evidence/:evidenceId/pcap: a WebShark launch descriptor
 *
 * Page responses will use Redis TTL caching and contain a per-viewer watermark.
 * Artifacts belong in S3-compatible object storage, never Redis. Redis stores
 * cache entries, viewer sessions, page-shape seeds, and rate-limit state only.
 */
export const app = new Hono();

export type EvidencePagePolicy = {
  cacheTtlSeconds: number;
  minLinesPerPage: 75;
  maxLinesPerPage: 150;
  watermark: true;
  invisibleIntegrityMarkers: true;
};

export type EvidenceStorage = {
  kind: "s3-compatible";
  bucket: string;
  objectKey: string;
};

export type PcapLaunchPolicy = {
  viewer: "webshark";
  readOnly: true;
  requiresAuthorizedSession: true;
};

// TODO: add Bun.serve({ fetch: app.fetch, port }) only when API routes,
// authentication, and deployment origin are agreed.
