# INCIDENT NOTES — TRACE-001

**Classification:** RESTRICTED · **Handling:** AUROR EYES ONLY
**Opened by:** Auror H. Granger · **Assigned:** Improper Use of Magic Office
**Recorded:** 2026-08-14, 03:22 local

> Preliminary field notes. This document is a *working* record and has not
> been reconciled against the acquired artefacts. Treat every timestamp
> below as provisional until the workstation clock skew is confirmed.

## 1. Summary of incident

At approximately **01:43** the `ward-daemon` process on `mo-auror-01`
terminated without a scheduled shutdown window. Within ninety seconds the
Pensieve vault index manifest at `/var/lib/pensieve/vault/.idx` was removed,
along with the daemon's own log file.

The vault still contains its 18,841 memory records, but with the index gone
the archive is effectively **invisible**: nothing can be enumerated, searched
or retrieved. This is the "vanishing" the reporting officer described — the
data was not destroyed, it was *unlinked from memory*.

Established so far:

- The daemon did not crash. It was killed.
- The kill came from a root shell belonging to a **legitimate** account.
- All subsequent activity originated from a single non-standard address.
- A full index archive was staged and transferred off-host.

## 2. Persons of interest

| Account | Clearance | Home IP | Observation |
| --- | --- | --- | --- |
| `a.prewett` | ARCHIVIST-III | `192.168.1.42` | Root shell throughout the incident window |
| `svc.archive` | SERVICE | `192.168.1.42` | Performed the archive and the outbound transfer |
| `m.edgecombe` | ARCHIVIST-II | `10.20.4.77` | First responder; appears to be investigating |
| `h.granger` | AUROR-II | `10.20.4.19` | Reporting officer |

Note that `a.prewett` and `svc.archive` share an apparent source address.
Either two accounts are operating from one terminal, or the address is
being **spoofed or relayed**. This is the single most important thread to
pull on — do not assume the source column is truthful.

## 3. Sequence of interest

1. `01:42:44` — `pensieve-index` is denied an `exec` by AppArmor.
2. `01:43:02` — Password authentication accepted from `192.168.1.42`.
3. `01:43:19` — Privilege escalation to root.
4. `01:43:47` — `ward-daemon` receives `SIGKILL`.
5. `01:44:03` — Index manifest deleted.
6. `01:45:01` — Full index archived to `/tmp`.
7. `03:02:01` — Archive transferred to `192.168.1.88:/srv/ingest/`.

## 4. Open questions

- [ ] Is `192.168.1.42` a real workstation, or a relay? Cross-check DHCP
      leases and the Floo network access log.
- [ ] Why was a memory snapshot taken at `02:18:44`, *after* the index was
      already deleted? What did the operator expect to find in memory?
- [ ] The `gpg` recipient was `archive@ministry.gov.magic` — a distribution
      address, not an individual. Who actually holds that key?
- [ ] `pensieve-index --rebuild --force` reports **0 mismatched records**.
      A rebuild from a deleted manifest should not succeed this cleanly.
      Was a cached copy of the index used?

## 5. Handling notes

All artefacts in this dossier were acquired with a write-blocker where
physically possible. Hash verification is recorded in `file_hashes.txt`.

```text
DO NOT mount /var/lib/pensieve/vault on a production host.
The manifest is absent; a mount attempt may trigger auto-recovery
routines that overwrite recoverable sectors.
```

— _Auror H. Granger, Improper Use of Magic Office_
