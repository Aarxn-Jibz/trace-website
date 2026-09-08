export type ViewerType = "text" | "markdown" | "csv" | "json" | "pcap" | "unsupported";
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
  evidenceCount?: number;
}

const MOCK_EVIDENCE: EvidenceFile[] = [
  { id: "auth", name: "auth.log", type: "text", size: "1.8 KB" },
  { id: "workstation", name: "workstation.log", type: "text", size: "1.2 KB" },
  { id: "users", name: "users.csv", type: "csv", size: "624 B" },
  { id: "notes", name: "incident_notes.md", type: "markdown", size: "811 B" },
  { id: "metadata", name: "metadata.json", type: "json", size: "487 B" },
  { id: "capture", name: "dns_tunnel.pcap", type: "pcap", size: "4.1 MB", tool: "Wireshark", webSharkCaptureName: "dns_tunnel.pcap" },
];

export const CASES: TraceCase[] = [
  // Evidence for this released case is loaded from CASE_05_SILENT_BEACON on
  // the server. Do not add demo artifacts here.
  { id: "1", number: "05", status: "released", evidence: [], evidenceCount: 7 },
  { id: "2", number: "02", status: "locked", evidence: [] },
  { id: "3", number: "03", status: "locked", evidence: [] },
];

export const getCase = (id: string) => CASES.find((item) => item.id === id);
