export type ViewerType = "text" | "markdown" | "csv" | "json" | "image" | "pcap" | "unsupported";
export type ReleaseStatus = "released" | "locked";

export interface EvidenceFile {
  id: string;
  name: string;
  /** Relative location below the case directory, for sidebar grouping. */
  path: string;
  type: ViewerType;
  size: string;
  tool?: string;
  /** Parent folder inside the case directory; root files have none. */
  folder?: string;
  /** Safe basename of the capture mounted in WebShark's /captures directory. */
  webSharkCaptureName?: string;
}

export interface TraceCase {
  id: "1" | "2" | "3";
  number: string;
  status: ReleaseStatus;
  evidence: EvidenceFile[];
}

const CASE_RELEASES = [
  // Times are expressed in UTC: 11:00, 12:00, and 14:00 IST on 15 Sep 2026.
  { id: "1", number: "01", releaseAt: "2026-09-15T05:30:00.000Z" },
  { id: "2", number: "02", releaseAt: "2026-09-15T06:30:00.000Z" },
  { id: "3", number: "03", releaseAt: "2026-09-15T08:30:00.000Z" },
] as const;

export const getCases = (): TraceCase[] => CASE_RELEASES.map((traceCase) => ({
  id: traceCase.id,
  number: traceCase.number,
  status: Date.now() >= Date.parse(traceCase.releaseAt) ? "released" : "locked",
  evidence: [],
}));

export const getCase = (id: string) => getCases().find((item) => item.id === id);
