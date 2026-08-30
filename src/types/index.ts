/**
 * TRACE — domain models
 *
 * These shapes are intentionally API-shaped. The prototype is fed by
 * `src/data/*`, but every field maps 1:1 onto what the eventual
 * production API will return (trusted server time + signed evidence URLs).
 */

export type ReleaseStatus = "released" | "locked" | "archived";

export type CaseStatus = "ACTIVE" | "SEALED" | "CLOSED";

export type Classification = "OPEN" | "RESTRICTED" | "CONFIDENTIAL" | "CLASSIFIED";

/** Which viewer module is responsible for rendering a piece of evidence. */
export type ViewerType = "text" | "markdown" | "csv" | "json" | "unsupported";

/** Physical/technical nature of the artefact. */
export type EvidenceKind =
  | "log"
  | "txt"
  | "md"
  | "csv"
  | "json"
  | "pcap"
  | "binary";

export type IntegrityState = "VERIFIED" | "PENDING" | "ALTERED";

export interface ExternalTool {
  /** Display name, e.g. "Wireshark" */
  name: string;
  /** Where to get it. */
  url: string;
  /** One line on why it is required. */
  note: string;
}

export interface EvidenceFile {
  /** Stable evidence identifier, e.g. "EV-001". */
  id: string;
  /** Owning case id. */
  caseId: string;
  filename: string;
  kind: EvidenceKind;
  viewer: ViewerType;
  /** Human label shown in the locker. */
  label: string;
  /** Short investigator-facing note. */
  summary: string;
  sizeBytes: number;
  sha256: string;
  integrity: IntegrityState;
  /** ISO timestamp — when the artefact was acquired. */
  collectedAt: string;
  /** Acquisition point, e.g. "Auror Office / Level 2 / WS-114" */
  source: string;
  /** Object-storage URL. Mocked here as a static asset path. */
  url: string | null;
  /** Present only for artefacts that require external tooling. */
  externalTool?: ExternalTool;
}

export interface CaseWindow {
  /** Display label, e.g. "01:42 — 03:17" */
  label: string;
  start: string;
  end: string;
  /** Full date for the dossier footer. */
  date: string;
}

export interface CaseRecord {
  /** Route id — "1" | "2" | "3" */
  id: string;
  /** Dossier code, e.g. "TRACE-001" */
  code: string;
  /** Zero-padded display number, e.g. "001" */
  number: string;
  title: string;
  subtitle: string;
  status: CaseStatus;
  classification: Classification;
  releaseStatus: ReleaseStatus;
  /**
   * Mock release scheduling. In production this is replaced by a
   * server-authoritative timestamp; the UI never decides release state.
   */
  releaseOffsetSeconds: number | null;
  window: CaseWindow;
  evidenceCount: number;
  /** Lead investigator / division, for the dossier header. */
  lead: string;
  division: string;
  location: string;
  coordinates: string;
  /** One-line teaser used on the index cards. */
  teaser: string;
  /** Dossier briefing paragraphs (markdown-ish plain text). */
  briefing: string[];
  /** Ordered list of investigative objectives. */
  objectives: string[];
}
