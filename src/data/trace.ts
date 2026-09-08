export type ViewerType = "text" | "markdown" | "csv" | "json" | "pcap" | "unsupported";
export type ReleaseStatus = "released" | "locked";

export interface EvidenceFile {
  id: string;
  name: string;
  type: ViewerType;
  size: string;
  content: string;
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

// Demonstration-only evidence. Production evidence must be served by a trusted
// release endpoint and private storage, never embedded in frontend assets.
const MOCK_EVIDENCE: EvidenceFile[] = [
  {
    id: "auth",
    name: "auth.log",
    type: "text",
    size: "1.8 KB",
    content: `2026-08-30T19:42:08Z sshd[2014]: Accepted publickey for analyst from 10.0.4.18\n2026-08-30T19:43:11Z sudo[2088]: analyst : TTY=pts/1 ; COMMAND=/usr/bin/systemctl status collector\n2026-08-30T19:47:33Z sshd[2190]: Failed password for invalid user backup from 192.168.1.42\n2026-08-30T19:47:36Z sshd[2190]: Failed password for invalid user backup from 192.168.1.42\n2026-08-30T19:48:02Z sshd[2211]: Accepted publickey for service from 192.168.1.42\n2026-08-30T19:51:14Z sudo[2298]: service : COMMAND=/usr/bin/tar -czf /tmp/export.tgz /var/log/collector\n2026-08-30T19:58:40Z sshd[2211]: Disconnected from user service 192.168.1.42`,
  },
  {
    id: "workstation",
    name: "workstation.log",
    type: "text",
    size: "1.2 KB",
    content: `19:44:02 process_start image=collector.exe pid=3840\n19:44:18 file_read path=C:\\Evidence\\users.csv pid=3840\n19:46:51 dns_query host=archive.local result=10.0.4.9\n19:48:10 process_start image=powershell.exe parent=collector.exe pid=4112\n19:48:16 network_connect destination=192.168.1.42:443 pid=4112\n19:50:01 file_write path=C:\\Temp\\export.tgz pid=4112\n19:58:38 process_exit image=powershell.exe pid=4112 code=0`,
  },
  {
    id: "users",
    name: "users.csv",
    type: "csv",
    size: "624 B",
    content: `username,role,last_login,source\nanalyst,investigator,2026-08-30 19:42,10.0.4.18\nservice,automation,2026-08-30 19:48,192.168.1.42\nbackup,disabled,2026-07-12 08:10,10.0.4.12`,
  },
  {
    id: "notes",
    name: "incident_notes.md",
    type: "markdown",
    size: "811 B",
    content: `# Incident notes\n\nThe review window begins at **19:40 UTC**. Correlate authentication events with the workstation process log.\n\n## Working observations\n\n- The service account normally originates from the automation subnet.\n- An export archive appears shortly after the remote connection.\n- Validate any conclusion against more than one artifact.`,
  },
  {
    id: "metadata",
    name: "metadata.json",
    type: "json",
    size: "487 B",
    content: `{"image":"workstation-04","acquired_at":"2026-08-30T20:16:04Z","timezone":"UTC","interfaces":[{"name":"eth0","address":"10.0.4.18"}],"artifacts":["auth.log","workstation.log","users.csv"]}`,
  },
  {
    id: "capture",
    name: "dns_tunnel.pcap",
    type: "pcap",
    size: "4.1 MB",
    content: "",
    tool: "Wireshark",
    webSharkCaptureName: "dns_tunnel.pcap",
  },
];

export const CASES: TraceCase[] = [
  { id: "1", number: "01", status: "released", evidence: MOCK_EVIDENCE },
  { id: "2", number: "02", status: "locked", evidence: [] },
  { id: "3", number: "03", status: "locked", evidence: [] },
];

export const getCase = (id: string) => CASES.find((item) => item.id === id);
