import type { CaseRecord } from "@/types";

/**
 * Mock case registry.
 *
 * `releaseOffsetSeconds` simulates a server-authoritative release schedule.
 * In production this value is replaced by an ISO timestamp issued by the
 * backend; the client never decides whether a case is open.
 */
export const CASES: CaseRecord[] = [
  {
    id: "1",
    code: "TRACE-001",
    number: "001",
    title: "THE VANISHING PROCESS",
    subtitle: "Unscheduled termination of a ward daemon and the disappearance of a vault index",
    status: "ACTIVE",
    classification: "RESTRICTED",
    releaseStatus: "released",
    releaseOffsetSeconds: null,
    window: {
      label: "01:42 — 03:17",
      start: "2026-08-14T01:42:00Z",
      end: "2026-08-14T03:17:00Z",
      date: "14 AUG 2026",
    },
    evidenceCount: 12,
    lead: "Auror H. Granger",
    division: "Improper Use of Magic Office",
    location: "Ministry of Magic · Level 2 · Auror Office",
    coordinates: "51.5007° N / 0.1246° W",
    teaser:
      "A ward daemon was killed, an index manifest was deleted, and an archive walked out of the building. The records were never destroyed — they were unlinked from memory.",
    briefing: [
      "At 01:43 on 14 August the `ward-daemon` process on workstation **mo-auror-01** (asset MOM-WS-0114) received an unscheduled SIGKILL. There was no maintenance window, no change ticket and no operator on site. Within ninety seconds the Pensieve vault index manifest at `/var/lib/pensieve/vault/.idx` had been removed, along with the daemon's own log file.",
      "The vault itself is intact. All 18,841 memory records remain on disk across fourteen shards. What was destroyed is the *index* — the structure that makes the archive enumerable, searchable and retrievable. Without it the vault is not gone, merely invisible. This is the vanishing the reporting officer described.",
      "Every privileged action inside the incident window traces back to two accounts operating from a single non-standard address: **192.168.1.42**. Both accounts are legitimate. Neither should have been reachable from that subnet. Determine whether the address is a workstation, a relay, or a fabrication — the answer decides whether this is an insider action or an impersonation.",
      "An index archive was staged in the ward outbox and transferred to a second host at 03:02. A 256 MB memory snapshot was taken thirty-five minutes *after* the index was deleted. Neither action has an approved justification on record.",
    ],
    objectives: [
      "Establish the true origin of 192.168.1.42 and whether it is distinct from 192.168.1.88",
      "Reconstruct the termination sequence for ward-daemon (PID 1182)",
      "Determine why pensieve-index --rebuild --force reported zero mismatched records",
      "Identify the holder of the archive@ministry.gov.magic encryption key",
      "Account for the 35-minute gap between index deletion and memory acquisition",
    ],
  },
  {
    id: "2",
    code: "TRACE-002",
    number: "002",
    title: "THE SILENT REGISTRY",
    subtitle: "Sealed — contents withheld pending declassification",
    status: "SEALED",
    classification: "CLASSIFIED",
    releaseStatus: "locked",
    releaseOffsetSeconds: 47 * 60 + 13,
    window: {
      label: "WITHHELD",
      start: "",
      end: "",
      date: "WITHHELD",
    },
    evidenceCount: 0,
    lead: "Withheld",
    division: "Department of Mysteries",
    location: "Withheld",
    coordinates: "REDACTED",
    teaser:
      "Dossier sealed by order of the Department of Mysteries. Contents will be declassified to cleared investigators at the scheduled release window.",
    briefing: [],
    objectives: [],
  },
  {
    id: "3",
    code: "TRACE-003",
    number: "003",
    title: "THE NINTH KEYSTROKE",
    subtitle: "Sealed — contents withheld pending declassification",
    status: "SEALED",
    classification: "CLASSIFIED",
    releaseStatus: "locked",
    releaseOffsetSeconds: 2 * 86400 + 6 * 3600 + 41 * 60 + 9,
    window: {
      label: "WITHHELD",
      start: "",
      end: "",
      date: "WITHHELD",
    },
    evidenceCount: 0,
    lead: "Withheld",
    division: "Department of Mysteries",
    location: "Withheld",
    coordinates: "REDACTED",
    teaser:
      "Dossier sealed by order of the Department of Mysteries. Contents will be declassified to cleared investigators at the scheduled release window.",
    briefing: [],
    objectives: [],
  },
];
