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

export const CASES: TraceCase[] = [
  // Each released case streams its evidence manifest from its source folder
  // on the server (CASE_01_Beginner, CASE_02_Medium, CASE_03_Hard).
  { id: "1", number: "01", status: "released", evidence: [] },
  { id: "2", number: "02", status: "released", evidence: [] },
  { id: "3", number: "03", status: "released", evidence: [] },
];

export const getCase = (id: string) => CASES.find((item) => item.id === id);
