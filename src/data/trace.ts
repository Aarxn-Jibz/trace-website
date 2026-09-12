export type ViewerType = "text" | "markdown" | "csv" | "json" | "image" | "pcap" | "unsupported";
export type ReleaseStatus = "released" | "locked";

export interface EvidenceFile {
  id: string;
  name: string;
  type: ViewerType;
  size: string;
  tool?: string;
  /** Safe basename of the capture mounted in WebShark's /captures directory. */
  webSharkCaptureName?: string;
}

export interface TraceCase {
  id: "1" | "2" | "3";
  number: string;
  status: ReleaseStatus;
  evidence: EvidenceFile[];
}

export const CASES: TraceCase[] = [
  // Evidence for this released case is loaded from CASE_05_SILENT_BEACON on
  // the server. Do not add demo artifacts here.
  { id: "1", number: "05", status: "released", evidence: [] },
  { id: "2", number: "02", status: "locked", evidence: [] },
  { id: "3", number: "03", status: "locked", evidence: [] },
];

export const getCase = (id: string) => CASES.find((item) => item.id === id);
