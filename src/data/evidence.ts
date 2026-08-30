import type { EvidenceFile } from "@/types";
import manifest from "./evidence-manifest.json";

type Manifest = Record<string, { size: number; sha256: string }>;

const digests = manifest as Manifest;

const BASE = "/evidence/trace-001";

interface Seed {
  id: string;
  filename: string;
  kind: EvidenceFile["kind"];
  viewer: EvidenceFile["viewer"];
  label: string;
  summary: string;
  integrity: EvidenceFile["integrity"];
  collectedAt: string;
  source: string;
  /** Omitted for artefacts that cannot be opened in-browser. */
  file?: string;
  externalTool?: EvidenceFile["externalTool"];
}

const SEEDS: Seed[] = [
  {
    id: "EV-001",
    filename: "auth.log",
    kind: "log",
    viewer: "text",
    label: "Authentication log",
    summary: "PAM, sshd and sudo records for the full incident window.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:22:11Z",
    source: "mo-auror-01 / /var/log",
    file: "auth.log",
  },
  {
    id: "EV-002",
    filename: "workstation.log",
    kind: "log",
    viewer: "text",
    label: "Ward daemon log",
    summary: "Reconstructed ward-daemon output; rotation artefact was deleted.",
    integrity: "PENDING",
    collectedAt: "2026-08-14T03:23:02Z",
    source: "mo-auror-01 / /var/log/ward",
    file: "workstation.log",
  },
  {
    id: "EV-003",
    filename: "users.csv",
    kind: "csv",
    viewer: "csv",
    label: "Directory extract",
    summary: "Accounts, clearances and home addresses at time of acquisition.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:29:03Z",
    source: "mo-auror-01 / /etc",
    file: "users.csv",
  },
  {
    id: "EV-004",
    filename: "incident_notes.md",
    kind: "md",
    viewer: "markdown",
    label: "Incident notes",
    summary: "Preliminary field notes recorded by the reporting officer.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:22:00Z",
    source: "Auror H. Granger / field dictation",
    file: "incident_notes.md",
  },
  {
    id: "EV-005",
    filename: "file_hashes.txt",
    kind: "txt",
    viewer: "text",
    label: "Integrity manifest",
    summary: "SHA-256 acquisition digests; two entries remain unresolved.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:41:02Z",
    source: "mo-forensic-02 / trace-acquire 2.4.1",
    file: "file_hashes.txt",
  },
  {
    id: "EV-006",
    filename: "metadata.json",
    kind: "json",
    viewer: "json",
    label: "Acquisition metadata",
    summary: "Host, vault, network and chain-of-custody descriptors.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:41:02Z",
    source: "mo-forensic-02 / trace-acquire 2.4.1",
    file: "metadata.json",
  },
  {
    id: "EV-007",
    filename: "network_capture.pcap",
    kind: "pcap",
    viewer: "unsupported",
    label: "Network capture",
    summary: "Full packet capture across the incident window (18 segments).",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:36:44Z",
    source: "Span port / Floo gateway mirror",
    file: "network_capture.pcap",
    externalTool: {
      name: "Wireshark",
      url: "https://www.wireshark.org/download.html",
      note: "Packet captures must be dissected in a protocol analyser.",
    },
  },
  {
    id: "EV-008",
    filename: "process_tree.json",
    kind: "json",
    viewer: "json",
    label: "Process tree",
    summary: "Reconstructed parent/child relationships from audit records.",
    integrity: "PENDING",
    collectedAt: "2026-08-14T03:40:19Z",
    source: "auditd reconstruction",
    file: "process_tree.json",
  },
  {
    id: "EV-009",
    filename: "timeline.csv",
    kind: "csv",
    viewer: "csv",
    label: "Timeline extract",
    summary: "Normalised event ordering with severity and actor attribution.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:42:37Z",
    source: "mo-forensic-02 / trace-acquire 2.4.1",
    file: "timeline.csv",
  },
  {
    id: "EV-010",
    filename: "dns_queries.log",
    kind: "log",
    viewer: "text",
    label: "Resolver queries",
    summary: "DNS question/answer pairs, including two external lookups.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:27:31Z",
    source: "mo-resolv-01 / query log",
    file: "dns_queries.log",
  },
  {
    id: "EV-011",
    filename: "memory_dump.raw",
    kind: "binary",
    viewer: "unsupported",
    label: "Memory snapshot",
    summary: "256 MB physical memory acquisition taken during the window.",
    integrity: "VERIFIED",
    collectedAt: "2026-08-14T03:34:48Z",
    source: "mo-auror-01 / /dev/mem",
    file: "memory_dump.raw",
    externalTool: {
      name: "Volatility 3",
      url: "https://github.com/volatilityfoundation/volatility3",
      note: "Memory images require an offline analysis framework.",
    },
  },
  {
    id: "EV-012",
    filename: "mail_archive.pst",
    kind: "binary",
    viewer: "unsupported",
    label: "Mail archive",
    summary: "Archived correspondence for the records division.",
    integrity: "ALTERED",
    collectedAt: "2026-08-14T04:01:12Z",
    source: "Records division / export",
    file: "mail_archive.pst",
    externalTool: {
      name: "Autopsy",
      url: "https://www.autopsy.com/download/",
      note: "Mail stores are best examined in a full forensic suite.",
    },
  },
];

function toEvidence(seed: Seed): EvidenceFile {
  const meta = seed.file ? digests[seed.file] : undefined;
  return {
    id: seed.id,
    caseId: "1",
    filename: seed.filename,
    kind: seed.kind,
    viewer: seed.viewer,
    label: seed.label,
    summary: seed.summary,
    sizeBytes: meta?.size ?? 0,
    sha256: meta?.sha256 ?? "—",
    integrity: seed.integrity,
    collectedAt: seed.collectedAt,
    source: seed.source,
    url: seed.file ? `${BASE}/${seed.file}` : null,
    externalTool: seed.externalTool,
  };
}

export const CASE_001_EVIDENCE: EvidenceFile[] = SEEDS.map(toEvidence);
