import "server-only";

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { EvidenceFile, ViewerType } from "@/data/trace";

const CASE_ROOT = path.join(process.cwd(), "CASE_05_SILENT_BEACON");

function viewerType(name: string): ViewerType {
  const extension = path.extname(name).toLowerCase();
  if (extension === ".pcap") return "pcap";
  if (extension === ".md") return "markdown";
  if (extension === ".csv") return "csv";
  if (extension === ".json") return "json";
  return "text";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
}

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(fullPath) : [fullPath];
  }))).flat();
}

export async function getCase05Evidence(): Promise<EvidenceFile[]> {
  const paths = await filesBelow(CASE_ROOT);
  const evidence = await Promise.all(paths.map(async (fullPath) => {
    const name = path.basename(fullPath);
    const type = viewerType(name);
    const relativePath = path.relative(CASE_ROOT, fullPath);
    const info = await stat(fullPath);
    const isPcap = type === "pcap";
    return {
      id: relativePath.replaceAll(path.sep, "-"), name, type, size: formatSize(info.size),
      ...(isPcap ? { tool: "Wireshark", webSharkCaptureName: name } : {}),
    } satisfies EvidenceFile;
  }));
  return evidence.sort((left, right) => left.name.localeCompare(right.name));
}
