import type { CaseRecord, EvidenceFile } from "@/types";
import { CASES } from "./cases";
import { CASE_001_EVIDENCE } from "./evidence";

/**
 * The single data-access surface used by the UI.
 *
 * Everything here is synchronous mock data today. Swapping these four
 * functions for `fetch` calls against the production API is the only change
 * required to move off hardcoded fixtures.
 */

const EVIDENCE_BY_CASE: Record<string, EvidenceFile[]> = {
  "1": CASE_001_EVIDENCE,
};

export function listCases(): CaseRecord[] {
  return CASES;
}

export function getCase(id: string): CaseRecord | undefined {
  return CASES.find((c) => c.id === id);
}

export function listCaseIds(): string[] {
  return CASES.map((c) => c.id);
}

export function listEvidence(caseId: string): EvidenceFile[] {
  return EVIDENCE_BY_CASE[caseId] ?? [];
}

export function getEvidence(caseId: string, evidenceId: string): EvidenceFile | undefined {
  return listEvidence(caseId).find((e) => e.id === evidenceId);
}
